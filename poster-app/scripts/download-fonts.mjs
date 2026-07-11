/**
 * download-fonts.mjs — Font Download Setup Script
 *
 * Run this ONCE to download Oswald Bold and Poppins font files into
 * /public/fonts/ for use by the satori poster renderer.
 *
 * Usage: node scripts/download-fonts.mjs
 *   (or) npm run download-fonts
 *
 * These fonts are loaded as ArrayBuffers in lib/fontLoader.ts.
 * If files are not present, fontLoader falls back to fetching from Google Fonts CDN
 * on each API request (slower but automatic).
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const FONTS = [
  {
    name: 'Oswald-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs169hQA.woff',
    isTtf: false,
  },
  {
    name: 'Poppins-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrJJfecg.woff2',
    isTtf: false,
  },
  {
    name: 'Poppins-SemiBold.ttf',
    url: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
    isTtf: false,
  },
];

const fontsDir = join(process.cwd(), 'public', 'fonts');
mkdirSync(fontsDir, { recursive: true });

for (const font of FONTS) {
  console.log(`Downloading ${font.name}...`);
  const res = await fetch(font.url);
  if (!res.ok) throw new Error(`Failed to fetch ${font.url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(fontsDir, font.name), buffer);
  console.log(`✓ Saved ${font.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

console.log('\n✅ All fonts downloaded to public/fonts/');
