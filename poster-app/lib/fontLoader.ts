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

async function fetchFontFromURL(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch font: ${url}`);
  return res.arrayBuffer();
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

  // Fallback: fetch from Google Fonts GitHub mirror (reliable stable URLs)
  console.log('[fontLoader] Local font files not found — fetching from Google Fonts GitHub...');
  const [oswaldBold, poppinsRegular, poppinsSemiBold] = await Promise.all([
    fetchFontFromURL(
      'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/oswald/static/Oswald-Bold.ttf'
    ),
    fetchFontFromURL(
      'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf'
    ),
    fetchFontFromURL(
      'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-SemiBold.ttf'
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
