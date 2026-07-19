/**
 * POST /api/generate-poster
 *
 * Accepts form JSON → validates with Zod → renders satori JSX → resvg PNG
 * Returns: PNG file as application/octet-stream
 * Also appends entry to data/posters.json (history log)
 *
 * NOTE on posters.json persistence:
 *   This works in local development. On Vercel serverless, the filesystem
 *   is read-only at runtime. To persist history on Vercel, replace the
 *   fs.writeFileSync call below with Vercel KV or Vercel Blob storage.
 *   Reference: https://vercel.com/docs/storage/vercel-kv
 */

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

import { PosterFormSchema } from '@/lib/posterSchema';
import { getSatoriFonts } from '@/lib/fontLoader';
import { getContentTier } from '@/lib/logoScale';
import {
  renderLandscapeInfoPoster,
  renderPortraitQrPoster,
  renderBanner,
  type LayoutData,
  type PosterAssets,
} from '@/lib/layoutEngine';
import { BACKGROUND_TEMPLATES, SIZE_PRESETS, PRESET_TO_VARIANT } from '@/lib/theme';

// Force Node.js runtime (required for filesystem access + native @resvg/resvg-js)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedAssetsDir: string | null = null;

function findFileRecursively(dir: string, fileName: string, depth = 0): string | null {
  if (depth > 6) return null; // prevent too deep recursion
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === '.next') continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const found = findFileRecursively(fullPath, fileName, depth + 1);
        if (found) return found;
      } else if (item === fileName) {
        return fullPath;
      }
    }
  } catch {}
  return null;
}

function resolveProjectFile(relativePath: string): string | null {
  const cwd = process.cwd();
  
  // 1. Try standard candidate paths first
  const candidates = [
    path.join(cwd, relativePath),
    path.join(cwd, 'poster-app', relativePath),
    path.join('/var/task', relativePath),
    path.join('/var/task/poster-app', relativePath),
  ];

  if (cachedAssetsDir) {
    const cachedPath = path.join(cachedAssetsDir, relativePath);
    if (fs.existsSync(cachedPath)) return cachedPath;
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {}
  }

  // 2. Fallback: Search the filesystem dynamically to locate where Next.js placed the traced public folder
  const targetFile = relativePath.split('/').pop() || '';
  if (!targetFile) return null;

  try {
    const searchDirs = [cwd, '/var/task'];
    for (const searchDir of searchDirs) {
      if (!fs.existsSync(searchDir)) continue;
      const foundPath = findFileRecursively(searchDir, targetFile);
      if (foundPath) {
        const suffix = relativePath.replace(/\\/g, '/');
        const absolute = foundPath.replace(/\\/g, '/');
        if (absolute.endsWith(suffix)) {
          const baseDir = absolute.slice(0, -suffix.length);
          cachedAssetsDir = path.normalize(baseDir);
          console.log(`[assets] Dynamically located assets base directory: ${cachedAssetsDir}`);
          return path.join(cachedAssetsDir, relativePath);
        }
        return foundPath;
      }
    }
  } catch (err) {
    console.error('[assets] Error searching for file recursively:', err);
  }

  console.warn(`[assets] NOT FOUND: ${relativePath} | cwd=${cwd}`);
  return null;
}


// ── Asset loader helper ────────────────────────────────────────────
function loadAssetAsDataUrl(relativePath: string, mimeType: string): string | null {
  const absPath = resolveProjectFile(relativePath);
  if (!absPath) return null;
  try {
    const buffer = fs.readFileSync(absPath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

// ── History log helper ─────────────────────────────────────────────
function appendToHistory(entry: object): void {
  const historyPath = resolveProjectFile('data/posters.json') ?? path.join(process.cwd(), 'data', 'posters.json');
  try {
    let history: object[] = [];
    if (fs.existsSync(historyPath)) {
      const raw = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(raw);
    }
    history.push(entry);
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal — history logging failure never blocks poster generation
    console.warn('[generate-poster] Could not write to posters.json:', err);
  }
}

// ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate with Zod
  const parsed = PosterFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const isPreview = request.nextUrl.searchParams.get('preview') === 'true';

  // Resolve poster dimensions
  let widthPx: number;
  let heightPx: number;

  if (data.sizePreset === 'custom') {
    widthPx = Math.round((data.customWidthIn ?? 8) * 300);
    heightPx = Math.round((data.customHeightIn ?? 5) * 300);
  } else {
    const preset = SIZE_PRESETS[data.sizePreset];
    widthPx = preset.widthPx;
    heightPx = preset.heightPx;
  }

  // For preview: reduce resolution to 1/4 for faster rendering
  const scale = isPreview ? 0.25 : 1;
  const renderW = Math.round(widthPx * scale);
  const renderH = Math.round(heightPx * scale);

  // Content density tier
  const bodyLength = data.bulletList.join(' ').length;
  const contentTier = getContentTier(
    data.hasTable,
    data.tableRows.length,
    bodyLength
  );

  // Load assets
  const bgPath = BACKGROUND_TEMPLATES[data.sizePreset];
  const bgMime = bgPath.endsWith('.jpg') || bgPath.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
  const assets: PosterAssets = {
    clubLogoDataUrl: loadAssetAsDataUrl('public/templates/logo-austcaic.png', 'image/png'),
    varsityLogoDataUrl: loadAssetAsDataUrl('public/templates/logo-varsity.png', 'image/png'),
    patternDataUrl: loadAssetAsDataUrl(bgPath, bgMime),
    uploadedImageDataUrl: data.imageDataUrl ?? null,
  };

  // QR code generation (server-side, portrait variant only)
  if (data.hasQrCode && data.qrUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(data.qrUrl, {
        width: Math.round(renderW * 0.4),
        margin: 2,
        color: { dark: '#1E274D', light: '#FFFFFF' },
      });
      assets.qrDataUrl = qrDataUrl;
    } catch (err) {
      console.warn('[generate-poster] QR generation failed:', err);
      assets.qrDataUrl = null;
    }
  }

  // Build layout data object
  const layoutData: LayoutData = {
    title: data.title,
    subtitle: data.subtitle,
    clubLogoPosition: data.clubLogoPosition,
    varsityLogoPosition: data.varsityLogoPosition,
    bulletList: data.bulletList,
    hasTable: data.hasTable,
    tableHeaders: data.tableHeaders,
    tableRows: data.tableRows,
    hasIconBadges: data.hasIconBadges,
    iconBadges: data.iconBadges,
    hasQrCode: data.hasQrCode,
    qrUrl: data.qrUrl ?? '',
    hasWatermark: data.hasWatermark,
    watermarkLeft: data.watermarkLeft,
    watermarkRight: data.watermarkRight,
    hasExtraBadge: data.hasExtraBadge,
    extraBadgeText: data.extraBadgeText,
    contentTier,
    widthPx: renderW,
    heightPx: renderH,
    sectionOrder: data.sectionOrder,
    bulletColumns: data.bulletColumns,
    logoLayout: data.logoLayout,
    imageFrame: data.imageFrame,
    imagePosition: data.imagePosition,
    imageSize: data.imageSize,
  };

  // Select layout variant
  const variant = PRESET_TO_VARIANT[data.sizePreset];

  let element: React.ReactElement;
  if (variant === 'banner') {
    element = renderBanner(layoutData, assets);
  } else if (variant === 'portrait') {
    element = renderPortraitQrPoster(layoutData, assets);
  } else {
    element = renderLandscapeInfoPoster(layoutData, assets);
  }

  // Render: JSX → SVG (satori) → PNG (resvg)
  let pngBytes: Uint8Array;
  try {
    const fonts = await getSatoriFonts();
    const svg = await satori(element, {
      width: renderW,
      height: renderH,
      fonts,
    });

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: renderW },
    });
    const pngData = resvg.render();
    pngBytes = pngData.asPng();
  } catch (err) {
    console.error('[generate-poster] Render error:', err);
    return NextResponse.json(
      { error: 'Poster rendering failed', details: String(err) },
      { status: 500 }
    );
  }

  // Append to history (non-preview only)
  if (!isPreview) {
    appendToHistory({
      timestamp: new Date().toISOString(),
      sizePreset: data.sizePreset,
      variant,
      widthPx,
      heightPx,
      title: data.title,
      subtitle: data.subtitle,
      contentTier,
      formSnapshot: data,
    });
  }

  const filename = `${(data.title || 'poster').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;

  return new Response(pngBytes.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
