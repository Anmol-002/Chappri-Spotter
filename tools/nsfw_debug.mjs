import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--window-size=1440,900'] });
const page = await browser.newPage();
page.setDefaultTimeout(15000);
page.on('pageerror', e => console.error('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('PAGE CONSOLE ERROR:', m.text()); });
await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('.char-icon');
if (await page.$('#briefingDialog[open]')) await page.click('#tourSkip');

// NSFW is locked off on purpose — click should tease, not enable
await page.click('#nsfwToggle');
const bodyHasNsfw = await page.evaluate(() => document.body.classList.contains('nsfw-mode'));
console.log('Body has nsfw-mode (should be false):', bodyHasNsfw);
const hint = await page.$eval('#nsfwHint', (el) => el.textContent);
console.log('NSFW tease hint:', hint);

const layerOpts = await page.$$eval('#layerSelect option', opts => opts.map(o => o.textContent));
console.log('Layer options:', JSON.stringify(layerOpts));

// Open report dialog
await page.click('#reportButton');
console.log('Clicked reportButton');
try {
  await page.waitForSelector('#pinBanner:not(.hidden)', { timeout: 5000 });
  console.log('pinBanner visible');
} catch (e) {
  const pinBannerClass = await page.$eval('#pinBanner', el => el.className).catch(() => 'not found');
  console.log('pinBanner class:', pinBannerClass);
}

// Click map to place pin
await page.mouse.click(800, 400);
await new Promise(r => setTimeout(r, 1000));

try {
  await page.waitForSelector('#reportDialog[open]', { timeout: 5000 });
  console.log('reportDialog open');
  const nsfwChips = await page.$$('.chip.nsfw-chip');
  console.log('NSFW chips count:', nsfwChips.length);
  const makeoutChip = await page.$('.chip[data-id="makeout"]');
  console.log('Makeout chip exists:', Boolean(makeoutChip));
} catch (e) {
  console.log('reportDialog not found:', e.message);
  const diagHTML = await page.$eval('#reportDialog', el => el.outerHTML.slice(0, 600)).catch(() => 'not found');
  console.log('reportDialog HTML:', diagHTML);
}

await browser.close();
