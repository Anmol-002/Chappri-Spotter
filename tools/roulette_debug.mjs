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

await page.click('.char-icon img');
await page.waitForSelector('#dossier:not(.hidden)');

const rouletteExists = await page.$('#dossier [data-act="roulette"]');
console.log('Roulette button found:', rouletteExists ? 'YES' : 'NO');

if (rouletteExists) {
  await page.click('#dossier [data-act="roulette"]');
  await new Promise(r => setTimeout(r, 1500));
  const dialogOpen = await page.$('#matchmakerDialog[open]');
  console.log('matchmakerDialog open:', dialogOpen ? 'YES' : 'NO');
  const bodyHTML = await page.$eval('#matchmakerBody', el => el.innerHTML.slice(0, 600)).catch(() => 'n/a');
  console.log('matchmakerBody:', bodyHTML);
} else {
  const html = await page.$eval('#dossier', el => el.innerHTML.slice(0, 1200)).catch(() => 'n/a');
  console.log('Dossier HTML snippet:', html);
}

await browser.close();
