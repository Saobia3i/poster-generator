import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/ca145171-b149-40c1-bbaf-eb390a7f48fa';
const destDir = path.join(process.cwd(), 'public', 'templates');

// Helper to copy a file
function copy(srcName, destName) {
  const src = path.join(srcDir, srcName);
  const dest = path.join(destDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Successfully copied ${srcName} -> ${destName}`);
  } else {
    console.error(`Source file not found: ${srcName}`);
  }
}

// 1. Copy the empty landscape template for both 5x2 banner and fallback patterns
copy('media__1783771902282.png', 'bg-5by2.png');
copy('media__1783771902282.png', 'bg-pattern.png');

// 2. Copy the 5x8 portrait template (640x1024)
copy('media__1783771890927.png', 'bg-5by8.png');

// 3. Copy the A4 portrait template (723x1024 JPEG)
copy('media__1783771890449.jpg', 'bg-a4.jpg');
