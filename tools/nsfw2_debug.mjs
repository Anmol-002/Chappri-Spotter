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
console.log('nsfw-mode active:', await page.evaluate(() => document.body.classList.contains('nsfw-mode')));

// Try __testOpenReport
const hasHelper = await page.evaluate(() => typeof window.__testOpenReport);
console.log('__testOpenReport type:', hasHelper);

await page.evaluate(() => {
  if (window.__testOpenReport) window.__testOpenReport([28.47, 77.09]);
  else console.error('NO __testOpenReport found!');
});

await new Promise(r => setTimeout(r, 2000));
const dialogOpen = await page.$('#reportDialog[open]');
console.log('reportDialog open after test helper:', Boolean(dialogOpen));

const makeout = await page.$('.chip[data-id="makeout"]');
console.log('Makeout chip found:', Boolean(makeout));

const chips = await page.$$eval('.chip', els => els.map(el => el.dataset.id + ':' + el.className));
console.log('All chips:', JSON.stringify(chips));

await browser.close();
