import fs from 'fs';
import path from 'path';

const file = 'C:/Users/USER/.gemini/antigravity-ide/brain/ca145171-b149-40c1-bbaf-eb390a7f48fa/media__1783771890449.jpg';
const buf = fs.readFileSync(file);

let i = 2; // skip SOI
let w = 0, h = 0;
while (i < buf.length) {
  if (buf[i] !== 0xFF) {
    i++;
    continue;
  }
  const marker = buf[i + 1];
  if (marker === 0xD9 || marker === 0xDA) {
    // SOS or EOI, stop
    break;
  }
  // SOF markers are 0xC0 - 0xC3, 0xC5 - 0xC7, 0xC9 - 0xCB, 0xCD - 0xCF
  const isSOF = (marker >= 0xC0 && marker <= 0xCF) && (marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC);
  const size = buf.readUInt16BE(i + 2);
  if (isSOF) {
    h = buf.readUInt16BE(i + 5);
    w = buf.readUInt16BE(i + 7);
    console.log(`Found SOF marker 0x${marker.toString(16).toUpperCase()} at offset ${i}`);
    break;
  }
  i += 2 + size;
}

console.log(`JPEG Dimensions: ${w} x ${h}`);
if (h > w) {
  console.log('It is Portrait!');
} else {
  console.log('It is Landscape!');
}
