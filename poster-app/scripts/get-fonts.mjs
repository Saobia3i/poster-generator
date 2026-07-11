/**
 * get-fonts.mjs — Downloads real TTF font files for satori
 * Source: google-webfonts-helper (gwfh) which serves genuine latin-subset TTF files
 *
 * Usage: node scripts/get-fonts.mjs
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
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: '*/*',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(dest, buf);
        resolve(buf);
      });
    }).on('error', reject);
  });
}

const jobs = [
  {
    url: 'https://gwfh.mranftl.com/api/fonts/oswald?download=zip&subsets=latin&variants=700&formats=ttf',
    zipName: 'oswald.zip',
    outName: 'Oswald-Bold.ttf',
  },
  {
    url: 'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=regular&formats=ttf',
    zipName: 'poppins-reg.zip',
    outName: 'Poppins-Regular.ttf',
  },
  {
    url: 'https://gwfh.mranftl.com/api/fonts/poppins?download=zip&subsets=latin&variants=600&formats=ttf',
    zipName: 'poppins-600.zip',
    outName: 'Poppins-SemiBold.ttf',
  },
];

for (const job of jobs) {
  const zipPath = path.join(tmpDir, job.zipName);
  const extractDir = path.join(tmpDir, job.outName.replace('.ttf', ''));
  fs.mkdirSync(extractDir, { recursive: true });

  console.log(`Downloading ${job.outName}...`);
  await download(job.url, zipPath);

  // Extract zip
  execSync(
    `powershell.exe -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`,
    { stdio: 'pipe' }
  );

  // Find the .ttf inside
  const ttf = fs.readdirSync(extractDir).find((f) => f.endsWith('.ttf'));
  if (!ttf) {
    console.error(`  ERROR: No TTF found in zip for ${job.outName}`);
    continue;
  }

  const srcPath = path.join(extractDir, ttf);
  const dstPath = path.join(fontsDir, job.outName);
  fs.copyFileSync(srcPath, dstPath);

  const buf = fs.readFileSync(dstPath);
  const magic = buf.slice(0, 4).toString('hex');
  const fmt = magic === '00010000' ? '✓ TTF' : magic === '4f54544f' ? '✓ OTF' : `? (${magic})`;
  console.log(`  Saved ${job.outName} — ${buf.length.toLocaleString()} bytes ${fmt}`);
}

// Cleanup temp dir
fs.rmSync(tmpDir, { recursive: true, force: true });

// Also clean up leftover test files from previous failed attempts
for (const extra of ['oswald.zip', 'oswald-extracted', 'poppins-reg.zip', 'poppins-600.zip']) {
  const p = path.join(fontsDir, extra);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

console.log('\n✅ Fonts ready in public/fonts/');
