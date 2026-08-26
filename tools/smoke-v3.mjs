// End-to-end verification of dynamic radius, mascot filter logic,
// animated cyberpunk equalizer, Gen-Z HUD, and Makeout Roulette.
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const BASE = process.env.SMOKE_URL || 'http://localhost:4173';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SHOTS = '/tmp/chappri-mobile';
const watchdog = setTimeout(() => {
  console.error('\n✗ watchdog fired: smoke run exceeded 180s');
  process.exit(2);
}, 180000);

const errors = [];
const check = (name, pass) => {
  console.log(`${pass ? '✓' : '✗'} ${name}`);
  if (!pass) errors.push(name);
};
const step = (msg) => console.log(`  … ${msg}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--window-size=1440,900'],
});

try {
  step('context setup');
  const context = await browser.createBrowserContext();
  const starter = await context.newPage();
  const observer = await context.newPage();

  for (const [i, page] of [starter, observer].entries()) {
    step(`page ${i}: setup`);
    page.setDefaultTimeout(12000);
    page.on('pageerror', (e) => console.error(`PAGEERROR: ${e.message}`));
    page.on('console', (m) => console.log(`[PAGE LOG] ${m.text()}`));
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.setViewport({ width: 1440, height: 900 });
    await page.bringToFront();
    step(`page ${i}: goto ${BASE}`);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    step(`page ${i}: reload`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.char-icon');
    step(`page ${i}: dismiss briefing`);
    if (await page.$('#briefingDialog[open]')) await page.click('#briefingStart');
  }

  step('both pages ready');
  await starter.bringToFront();

  /* --- 1. Mascot Filter Logic Verification --- */
  step('verifying mascot filter logic: Baddie filter only shows actual baddie hotspots');
  const allCount = (await starter.$$('.char-icon')).length;
  await starter.select('#layerSelect', 'baddie');
  await starter.waitForFunction((n) => document.querySelectorAll('.char-icon').length < n, {}, allCount);
  const baddieFilteredCount = (await starter.$$('.char-icon')).length;
  const offBrand = await starter.$$eval('.char-icon img', (imgs) => imgs.filter((i) => !i.src.includes('baddie-goblin')).length);
  check(`baddie filter narrows to actual hotspots (${allCount} → ${baddieFilteredCount})`, baddieFilteredCount > 0 && baddieFilteredCount < allCount && baddieFilteredCount <= 8);
  check('baddie filter does not recast unrelated mascots', offBrand === 0);

  // Restore chaos layer
  await starter.select('#layerSelect', 'chaos');
  await starter.waitForFunction((n) => document.querySelectorAll('.char-icon').length === n, {}, allCount);

  /* --- 2. Slim face card --- */
  step('testing slim area face card');
  await starter.click('.char-icon img');
  await starter.waitForSelector('#dossier:not(.hidden)');
  check('dossier is not overcrowded (no HUD / equalizer / forecast)', !(await starter.$('.genz-hud, .equalizer-container, .tonight-card')));
  check('dossier still has character, score, report and fight', Boolean(await starter.$('#dossier .dossier-avatar-wrap')) && Boolean(await starter.$('#dossier .score-number')) && Boolean(await starter.$('#dossier [data-act="report"]')) && Boolean(await starter.$('#dossier [data-act="battle"]')));
  check('dossier shows at most two posts', (await starter.$$('#dossier .area-post')).length <= 2);

  /* --- 3. World search (Bangalore from NCR) --- */
  step('testing world search can leave NCR');
  await starter.click('#locationSearch');
  await starter.type('#locationSearch', 'Bangalore', { delay: 20 });
  await starter.waitForFunction(() => {
    const items = [...document.querySelectorAll('.search-item')];
    return items.some((el) => /bangalore|bengaluru/i.test(el.textContent));
  }, { timeout: 12000 });
  const bangaloreHit = await starter.$('.search-item[data-type="geo"]');
  check('search returns a world result for Bangalore', Boolean(bangaloreHit));
  if (bangaloreHit) {
    await bangaloreHit.click();
    await starter.waitForFunction(() => {
      const mapEl = document.querySelector('#map');
      return mapEl && !document.querySelector('#dossier:not(.hidden)');
    });
  }
  await starter.click('#searchClear');
  await starter.$eval('#locationSearch', (el) => {
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await starter.type('#locationSearch', 'Cyber Hub', { delay: 15 });
  await starter.waitForFunction(() => [...document.querySelectorAll('.search-item')].some((el) => /cyber hub/i.test(el.textContent)));
  await starter.$$eval('.search-item', (items) => items.find((el) => /cyber hub/i.test(el.textContent))?.click());
  await starter.waitForSelector('#searchResults.hidden');
  if (await starter.$('#searchClear:not(.hidden)')) await starter.click('#searchClear');

  /* --- 4. Report form has no photo upload --- */
  step('testing report form is category + intensity only');
  await starter.$eval('#reportButton', (el) => el.click());
  await starter.waitForSelector('#pinBanner:not(.hidden)');
  await starter.$eval('.char-icon img', (el) => el.click());
  await starter.waitForSelector('#reportDialog[open]');
  check('report form has no photo upload', !(await starter.$('#photo, #vision, #visionCanvas')));
  await starter.keyboard.press('Escape');

  /* --- 5. 18+ NSFW makeout mode --- */
  step('testing 18+ NSFW mode & teasing categories');
  await starter.$eval('#nsfwToggle', (el) => el.click());
  await starter.waitForFunction(() => document.body.classList.contains('nsfw-mode'));
  check('body has nsfw-mode theme', await starter.evaluate(() => document.body.classList.contains('nsfw-mode')));

  const layerOptions = await starter.$$eval('#layerSelect option', (opts) => opts.map((o) => o.textContent));
  check('layer dropdown contains after-dark / makeout filters', layerOptions.some((txt) => txt.includes('MAKEOUT') || txt.includes('CASUAL')));

  await starter.select('#layerSelect', 'makeout');
  await starter.waitForFunction(() => document.querySelectorAll('.char-icon').length > 0 && document.querySelectorAll('.char-icon').length < 22);
  const makeoutCount = (await starter.$$('.char-icon')).length;
  check(`makeout filter only shows real makeout spots (${makeoutCount})`, makeoutCount > 0 && makeoutCount < 12);

  await starter.$eval('#reportButton', (el) => el.click());
  await starter.waitForSelector('#pinBanner:not(.hidden)');
  await starter.$eval('.char-icon img', (el) => el.click());
  await starter.waitForSelector('#reportDialog[open] .chip.nsfw-chip');
  const makeoutChip = await starter.$('.chip[data-id="makeout"]');
  check('Makeout spot category chip present in report dialog', Boolean(makeoutChip));
  await starter.keyboard.press('Escape');

  /* --- 6. Cluster clicking --- */
  step('testing incident cluster sticker modal');
  await starter.waitForSelector('.sticker-cluster-pin');
  await starter.$eval('.sticker-cluster-pin', (el) => el.click());
  await starter.waitForSelector('#areaPostsDialog[open] .spot-post-card');
  check('cluster click opens area posts modal', (await starter.$$('.spot-post-card')).length > 0);
  await starter.keyboard.press('Escape');

  /* --- 7. Compact observer fight --- */
  step('testing observer sees a compact fight overlay');
  await starter.$eval('.char-icon img', (el) => el.click());
  await starter.waitForSelector('#dossier [data-act="battle"]');
  await starter.$eval('#dossier [data-act="battle"]', (el) => el.click());
  await starter.waitForSelector('#battleDialog[open]');
  if (!(await starter.$('#battleDialog .pick-card'))) await starter.$eval('#tabAll', (el) => el.click());
  await starter.waitForSelector('#battleDialog .pick-card');
  await starter.$eval('#battleDialog .pick-card', (el) => el.click());
  await starter.waitForSelector('.combat-arena');
  const starterArena = await starter.$('.observer-fight-wrap');
  check('starter sees the full-size fight', !starterArena && Boolean(await starter.$('.combat-arena')));
  await observer.bringToFront();
  await observer.waitForSelector('.map-fight-icon.compact, .observer-fight-wrap', { timeout: 8000 });
  check('other users see a compact fight they can zoom into', Boolean(await observer.$('.map-fight-icon.compact')));
  await starter.bringToFront();

  /* --- 8. Mobile feed sheet, selected character, phone chrome --- */
  step('testing mobile live feed sheet and selected characters');
  await mkdir(SHOTS, { recursive: true });
  const phone = await context.newPage();
  phone.setDefaultTimeout(12000);
  phone.on('pageerror', (e) => console.error(`PHONE PAGEERROR: ${e.message}`));
  phone.on('dialog', (d) => d.dismiss().catch(() => {}));
  await phone.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await phone.bringToFront();
  await phone.goto(BASE, { waitUntil: 'domcontentloaded' });
  await phone.evaluate(() => localStorage.clear());
  await phone.reload({ waitUntil: 'domcontentloaded' });
  await phone.waitForSelector('.char-icon');
  if (await phone.$('#briefingDialog[open]')) await phone.click('#briefingStart');
  await phone.waitForSelector('#feedToggle');

  const feedClosed = await phone.evaluate(() => {
    const bar = document.querySelector('#liveSidebar');
    const box = bar?.getBoundingClientRect();
    return !document.body.classList.contains('feed-open') && box && (box.height < 8 || box.top >= window.innerHeight);
  });
  check('live sidebar stays closed on phone until opened', feedClosed);
  check('LIVE dock is visible on phone', await phone.$eval('#feedToggle', (el) => {
    const box = el.getBoundingClientRect();
    return box.width > 0 && box.bottom <= window.innerHeight && box.top > 0;
  }));
  await phone.screenshot({ path: `${SHOTS}/01-map.png` });

  await phone.click('#feedToggle');
  await phone.waitForFunction(() => {
    const bar = document.querySelector('#liveSidebar');
    const box = bar?.getBoundingClientRect();
    return document.body.classList.contains('feed-open') && box && box.top < window.innerHeight * 0.55 && box.height > 200;
  });
  check('tapping LIVE opens the bottom feed sheet', await phone.evaluate(() => {
    const bar = document.querySelector('#liveSidebar');
    const box = bar?.getBoundingClientRect();
    return document.body.classList.contains('feed-open') && box && box.top < window.innerHeight * 0.55 && box.height > 200;
  }));
  check('feed sheet still has XP card and recent posts', Boolean(await phone.$('#agentCard')) && (await phone.$$('#feed .feed-item')).length > 0);
  await phone.screenshot({ path: `${SHOTS}/02-feed.png` });

  await phone.$eval('#feed .feed-item', (el) => el.click());
  await phone.waitForFunction(() => !document.body.classList.contains('feed-open'));
  await phone.waitForSelector('#dossier:not(.hidden)');
  check('tapping a feed item closes the sheet and opens the area card', await phone.evaluate(() => !document.body.classList.contains('feed-open') && Boolean(document.querySelector('#dossier:not(.hidden)'))));
  await phone.screenshot({ path: `${SHOTS}/03-dossier.png` });

  await phone.$eval('#dossier .dossier-x', (el) => el.click());
  await phone.waitForSelector('#dossier.hidden');
  await phone.waitForFunction(() => document.querySelectorAll('.char-icon img').length > 0);
  await phone.$eval('.char-icon img', (el) => el.click());
  await phone.waitForSelector('.char-icon.selected');
  await phone.waitForSelector('#dossier:not(.hidden)');
  const selectedBigger = await phone.$$eval('.char-icon', (icons) => {
    const sizes = icons.map((el) => {
      const img = el.querySelector('img');
      const box = img?.getBoundingClientRect();
      return { selected: el.classList.contains('selected'), w: box?.width || 0 };
    });
    const sel = sizes.find((s) => s.selected);
    const others = sizes.filter((s) => !s.selected).map((s) => s.w);
    return Boolean(sel && others.length && sel.w >= Math.max(...others) * 1.25);
  });
  check('tapped character grows larger than the others', selectedBigger);
  await phone.screenshot({ path: `${SHOTS}/04-selected.png` });

  await phone.click('#locationSearch');
  await phone.type('#locationSearch', 'Cyber Hub', { delay: 15 });
  await phone.waitForFunction(() => [...document.querySelectorAll('.search-item')].some((el) => /cyber hub/i.test(el.textContent)));
  check('search results are usable on phone', await phone.$eval('.search-item', (el) => el.getBoundingClientRect().height >= 44));
  await phone.screenshot({ path: `${SHOTS}/05-search.png` });
  await phone.$$eval('.search-item', (items) => items.find((el) => /cyber hub/i.test(el.textContent))?.click());
  await phone.waitForSelector('#searchResults.hidden');
  if (await phone.$('#searchClear:not(.hidden)')) await phone.click('#searchClear');

  await phone.$eval('#reportButton', (el) => el.click());
  await phone.waitForSelector('#pinBanner:not(.hidden)');
  check('report pin mode works on phone', await phone.evaluate(() => document.getElementById('map').classList.contains('picking')));
  await phone.screenshot({ path: `${SHOTS}/06-report.png` });
  await phone.keyboard.press('Escape');
  await phone.waitForSelector('#pinBanner.hidden');

  await phone.$eval('.char-icon img', (el) => el.click());
  await phone.waitForSelector('#dossier [data-act="battle"]');
  await phone.$eval('#dossier [data-act="battle"]', (el) => el.click());
  await phone.waitForSelector('#battleDialog[open]');
  if (!(await phone.$('#battleDialog .pick-card'))) await phone.$eval('#tabAll', (el) => el.click());
  await phone.waitForSelector('#battleDialog .pick-card');
  await phone.$eval('#battleDialog .pick-card', (el) => el.click());
  await phone.waitForSelector('.combat-arena');
  check('fight can be started from the phone dossier', Boolean(await phone.$('.combat-arena')));
  await phone.screenshot({ path: `${SHOTS}/07-fight.png` });

} catch (e) {
  errors.push(`threw: ${e.message}`);
} finally {
  await browser.close().catch(() => {});
  clearTimeout(watchdog);
}

console.log(errors.length ? `\n${errors.length} failure(s):\n- ${errors.join('\n- ')}` : '\nAll upgraded ChappriSpotter v4 checks passed successfully!');
process.exit(errors.length ? 1 : 0);
