// Writes screenshots of the main states to /tmp/chappri for a quick visual pass.
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const OUT = '/tmp/chappri';
const BASE = process.env.SMOKE_URL || 'http://localhost:4173';
await mkdir(OUT, { recursive: true });

const watchdog = setTimeout(() => {
  console.error('shots: watchdog fired');
  process.exit(2);
}, 90000);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--window-size=1440,900'],
});

const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });
const settle = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(12000);
  await page.setViewport({ width: 1440, height: 900 });
  await page.bringToFront();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.char-icon');
  await settle(1200);
  await shot(page, '01-briefing');

  await page.click('#tourSkip');
  await settle(900);
  await shot(page, '02-map');

  await page.click('.char-icon img');
  await page.waitForSelector('#dossier:not(.hidden)');
  await settle(600);
  await shot(page, '03-area-posts');

  await page.select('#layerSelect', 'baddie');
  await settle(900);
  await shot(page, '07-baddie-filter-only');

  await page.select('#layerSelect', 'chaos');
  await page.$eval('#nsfwToggle', (el) => el.click());
  await settle(800);
  await shot(page, '09-nsfw-tease-locked');

  const phone = await browser.newPage();
  phone.setDefaultTimeout(12000);
  await phone.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await phone.bringToFront();
  await phone.goto(BASE, { waitUntil: 'domcontentloaded' });
  await phone.waitForSelector('.char-icon');
  if (await phone.$('#briefingDialog[open]')) await phone.click('#tourSkip');
  await settle(1200);
  await shot(phone, '08-phone');

  console.log(`screenshots written to ${OUT}`);
} catch (e) {
  console.error('shots failed:', e.message.split('\n')[0]);
} finally {
  await browser.close().catch(() => {});
  clearTimeout(watchdog);
}
process.exit(0);
