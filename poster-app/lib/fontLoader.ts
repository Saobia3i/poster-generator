/**
 * fontLoader.ts — Satori Font Loading Utility
 *
 * Satori requires fonts as ArrayBuffer — it cannot use CSS font loading
 * or next/font/google. This module loads font files from the filesystem
 * (/public/fonts/) and caches them for subsequent API calls.
 *
 * CRITICAL: Uses __dirname-relative paths so this works correctly on Vercel
 * even when process.cwd() is the monorepo root (not the Next.js app dir).
 *
 * SETUP: Font files must be present in /public/fonts/
 * Run the following once to download them:
 *   node scripts/download-fonts.mjs
 * Or see the npm script: "npm run download-fonts"
 */

import path from 'path';
import fs from 'fs';
import zlib from 'zlib';

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

interface FontCache {
  oswaldBold: ArrayBuffer;
  poppinsRegular: ArrayBuffer;
  poppinsSemiBold: ArrayBuffer;
}

// Module-level cache — persists across requests in the same Node.js process
let fontCache: FontCache | null = null;

/**
 * Fetch a font zip from gwfh (google-webfonts-helper) and extract the .ttf entry.
 * gwfh returns a zip archive. Entries may be stored (method 0) or deflated (method 8).
 */
async function fetchFontFromGwfh(url: string, fontName: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font zip for ${fontName}: HTTP ${res.status}`);
  const zipBuf = Buffer.from(await res.arrayBuffer());

  const view = new DataView(zipBuf.buffer, zipBuf.byteOffset, zipBuf.byteLength);
  let offset = 0;

  while (offset < view.byteLength - 4) {
    if (view.getUint32(offset, true) !== 0x04034b50) break; // PK local file header signature

    const compressionMethod = view.getUint16(offset + 8, true);
    const compressedSize    = view.getUint32(offset + 18, true);
    const uncompressedSize  = view.getUint32(offset + 22, true);
    const filenameLen       = view.getUint16(offset + 26, true);
    const extraLen          = view.getUint16(offset + 28, true);

    const filename  = zipBuf.subarray(offset + 30, offset + 30 + filenameLen).toString('utf8');
    const dataStart = offset + 30 + filenameLen + extraLen;
    const dataSlice = zipBuf.subarray(dataStart, dataStart + compressedSize);

    if (filename.endsWith('.ttf')) {
      if (compressionMethod === 0) {
        // Stored — no decompression needed
        return dataSlice.buffer.slice(dataSlice.byteOffset, dataSlice.byteOffset + dataSlice.byteLength);
      } else if (compressionMethod === 8) {
        // Deflate
        const inflated = zlib.inflateRawSync(dataSlice, { maxOutputLength: uncompressedSize * 2 });
        return inflated.buffer.slice(inflated.byteOffset, inflated.byteOffset + inflated.byteLength);
      } else {
        throw new Error(`Unsupported zip compression method ${compressionMethod} for ${fontName}`);
      }
    }

    offset = dataStart + compressedSize;
  }

  throw new Error(`No .ttf entry found in font zip for ${fontName}`);
}

function readFontFile(relativePath: string): ArrayBuffer | null {
  const absPath = resolveProjectFile(relativePath);
  if (!absPath) return null;
  try {
    const buffer = fs.readFileSync(absPath);
    // Safely convert Node Buffer → ArrayBuffer (avoids buffer pool byteOffset issues)
    const ab = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(ab).set(buffer);
    return ab;
  } catch {
    return null;
  }
}

export async function loadFonts(): Promise<FontCache> {
  if (fontCache) return fontCache;

  // Try filesystem first (fastest, no network).
  // Paths are relative to the Next.js app root (poster-app/).
  const oswaldLocal        = readFontFile('public/fonts/Oswald-Bold.ttf');
  const poppinsRegularLocal = readFontFile('public/fonts/Poppins-Regular.ttf');
  const poppinsSemiBoldLocal = readFontFile('public/fonts/Poppins-SemiBold.ttf');

  if (oswaldLocal && poppinsRegularLocal && poppinsSemiBoldLocal) {
    console.log('[fontLoader] Loaded fonts from filesystem');
    fontCache = {
      oswaldBold: oswaldLocal,
      poppinsRegular: poppinsRegularLocal,
      poppinsSemiBold: poppinsSemiBoldLocal,
    };
    return fontCache;
  }

  // Fallback: fetch real TTF zips from google-webfonts-helper (gwfh).
  // gwfh serves genuine latin-subset TTF binaries packaged in a zip.
  console.log('[fontLoader] Local font files not found — fetching from gwfh CDN...');
  const [oswaldBold, poppinsRegular, poppinsSemiBold] = await Promise.all([
    fetchFontFromGwfh(
      'https://gwfh.mranftl.com/api/fonts/oswald?download=zip&subsets=latin&variants=700&formats=ttf',
      'Oswald-Bold'
    ),
    fetchFontFromGwfh(
      'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=regular&formats=ttf',
      'Poppins-Regular'
    ),
    fetchFontFromGwfh(
      'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=600&formats=ttf',
      'Poppins-SemiBold'
    ),
  ]);

  fontCache = { oswaldBold, poppinsRegular, poppinsSemiBold };
  return fontCache;
}

/** Returns the satori-compatible fonts array */
export async function getSatoriFonts() {
  const fonts = await loadFonts();
  return [
    { name: 'Oswald', data: fonts.oswaldBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Poppins', data: fonts.poppinsRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'Poppins', data: fonts.poppinsSemiBold, weight: 600 as const, style: 'normal' as const },
  ];
}
