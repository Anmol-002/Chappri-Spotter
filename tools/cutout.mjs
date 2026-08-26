// One-off asset tool: flood-fills the flat white/checkerboard background out of a
// character PNG so it can sit on the map cleanly. Run: node tools/cutout.mjs file...
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node tools/cutout.mjs public/chars/foo.png ...');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();

for (const file of files) {
  const dataUrl = `data:image/png;base64,${readFileSync(file).toString('base64')}`;
  const out = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { width: w, height: h } = canvas;
    const image = ctx.getImageData(0, 0, w, h);
    const px = image.data;

    const isBackground = (i) => {
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      const min = Math.min(r, g, b);
      return min > 203 && Math.max(r, g, b) - min < 20;
    };

    const stack = [];
    for (let x = 0; x < w; x += 1) {
      stack.push([x, 0], [x, h - 1]);
    }
    for (let y = 0; y < h; y += 1) {
      stack.push([0, y], [w - 1, y]);
    }

    const seen = new Uint8Array(w * h);
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const flat = y * w + x;
      if (seen[flat]) continue;
      const i = flat * 4;
      if (!isBackground(i)) continue;
      seen[flat] = 1;
      px[i + 3] = 0;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    // Soften the 1px halo left behind by the hard cut.
    const copy = new Uint8ClampedArray(px);
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const flat = y * w + x;
        const i = flat * 4;
        if (copy[i + 3] === 0) continue;
        let transparentNeighbours = 0;
        [-1, 1, -w, w].forEach((d) => {
          if (copy[(flat + d) * 4 + 3] === 0) transparentNeighbours += 1;
        });
        if (transparentNeighbours) px[i + 3] = Math.round(255 * (1 - transparentNeighbours / 5));
      }
    }

    ctx.putImageData(image, 0, 0);
    const removed = seen.reduce((sum, v) => sum + v, 0);
    return { data: canvas.toDataURL('image/png'), removed, total: w * h };
  }, dataUrl);

  writeFileSync(file, Buffer.from(out.data.split(',')[1], 'base64'));
  console.log(`${basename(file)} — cleared ${Math.round((out.removed / out.total) * 100)}% of pixels`);
}

await browser.close();
