/**
 * fontLoader.ts — Satori Font Loading Utility
 *
 * Satori requires fonts as ArrayBuffer — it cannot use CSS font loading
 * or next/font/google. This module loads font files from the filesystem
 * (/public/fonts/) and caches them for subsequent API calls.
 *
 * SETUP: Font files must be present in /public/fonts/
 * Run the following once to download them:
 *   node scripts/download-fonts.mjs
 * Or see the npm script: "npm run download-fonts"
 */

import path from 'path';
import fs from 'fs';

interface FontCache {
  oswaldBold: ArrayBuffer;
  poppinsRegular: ArrayBuffer;
  poppinsSemiBold: ArrayBuffer;
}

// Module-level cache — persists across requests in the same Node.js process
let fontCache: FontCache | null = null;

/**
 * Fetch a font zip from gwfh (google-webfonts-helper) and extract the first .ttf entry.
 * gwfh returns a zip archive — we extract the raw TTF bytes from it.
 */
async function fetchFontFromGwfh(url: string, fontName: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font zip for ${fontName}: HTTP ${res.status}`);
  const zipBuf = await res.arrayBuffer();

  // Parse the zip to find the .ttf entry (minimal ZIP parser — local file header only)
  const view = new DataView(zipBuf);
  let offset = 0;
  while (offset < view.byteLength - 4) {
    if (view.getUint32(offset, true) !== 0x04034b50) break; // PK local file header
    const filenameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const compressionMethod = view.getUint16(offset + 8, true);
    const filename = new TextDecoder().decode(new Uint8Array(zipBuf, offset + 30, filenameLen));
    const dataStart = offset + 30 + filenameLen + extraLen;
    if (filename.endsWith('.ttf') && compressionMethod === 0) {
      // Stored (no compression) — slice directly
      return zipBuf.slice(dataStart, dataStart + compressedSize);
    }
    offset = dataStart + compressedSize;
  }
  throw new Error(`No uncompressed .ttf entry found in font zip for ${fontName}`);
}

function readFontFile(relativePath: string): ArrayBuffer | null {
  try {
    const absPath = path.join(process.cwd(), relativePath);
    const buffer = fs.readFileSync(absPath);
    // Convert Node.js Buffer to ArrayBuffer
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
  } catch {
    return null;
  }
}

export async function loadFonts(): Promise<FontCache> {
  if (fontCache) return fontCache;

  // Try filesystem first (fastest, no network)
  const oswaldLocal = readFontFile('public/fonts/Oswald-Bold.ttf');
  const poppinsRegularLocal = readFontFile('public/fonts/Poppins-Regular.ttf');
  const poppinsSemiBoldLocal = readFontFile('public/fonts/Poppins-SemiBold.ttf');

  if (oswaldLocal && poppinsRegularLocal && poppinsSemiBoldLocal) {
    fontCache = {
      oswaldBold: oswaldLocal,
      poppinsRegular: poppinsRegularLocal,
      poppinsSemiBold: poppinsSemiBoldLocal,
    };
    return fontCache;
  }

  // Fallback: fetch real TTF zips from google-webfonts-helper (gwfh)
  // gwfh serves genuine latin-subset TTF binaries — unlike gstatic which serves WOFF2
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
