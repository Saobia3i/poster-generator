/**
 * download-fonts.mjs — Font Download Setup Script
 *
 * Run this ONCE to download Oswald Bold and Poppins font files into
 * /public/fonts/ for use by the satori poster renderer.
 *
 * Usage: node scripts/download-fonts.mjs
 *   (or) npm run download-fonts
 *
 * Source: google-webfonts-helper (gwfh) — serves real latin-subset TTF binaries.
 * IMPORTANT: satori requires true TTF/OTF files. WOFF/WOFF2 will silently
 * produce corrupt output or throw at render time.
 *
 * These fonts are loaded as ArrayBuffers in lib/fontLoader.ts.
 * If files are not present, fontLoader falls back to fetching from the same
 * gwfh CDN on each API request (slower but automatic).
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
const tmpDir = path.join(fontsDir, '_tmp');

fs.mkdirSync(tmpDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node/22', Accept: '*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => { const buf = Buffer.concat(chunks); fs.writeFileSync(dest, buf); resolve(buf); });
    }).on('error', reject);
  });
}

const FONTS = [
  {
    name: 'Oswald-Bold.ttf',
    url: 'https://gwfh.mranftl.com/api/fonts/oswald?download=zip&subsets=latin&variants=700&formats=ttf',
  },
  {
    name: 'Poppins-Regular.ttf',
    url: 'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=regular&formats=ttf',
  },
  {
    name: 'Poppins-SemiBold.ttf',
    url: 'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=600&formats=ttf',
  },
];

for (const font of FONTS) {
  console.log(`Downloading ${font.name}...`);
  const zipPath = path.join(tmpDir, font.name + '.zip');
  const extractDir = path.join(tmpDir, font.name.replace('.ttf', ''));
  fs.mkdirSync(extractDir, { recursive: true });

  await download(font.url, zipPath);

  // Extract zip — works on Windows (PowerShell) and Linux/Mac (unzip)
  try {
    execSync(`powershell.exe -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`, { stdio: 'pipe' });
  } catch {
    // Fallback for non-Windows
    execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'pipe' });
  }

  const ttf = fs.readdirSync(extractDir).find((f) => f.endsWith('.ttf'));
  if (!ttf) { console.error(`  ERROR: no .ttf in zip for ${font.name}`); continue; }

  const dstPath = path.join(fontsDir, font.name);
  fs.copyFileSync(path.join(extractDir, ttf), dstPath);

  const buf = fs.readFileSync(dstPath);
  console.log(`✓ Saved ${font.name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('\n✅ All fonts downloaded to public/fonts/');
