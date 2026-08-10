/**
 * End-to-end playthrough check.
 *
 * Walks the whole level like a player would — holding right, hopping when
 * something blocks the way — talks to every villager, and asserts the things
 * that must never break: everyone is reachable and speaks, the HUD counts them
 * all, the gift stall trades, the couple are waiting under the mandap, the
 * invitation card opens at the end, and the console stays clean throughout.
 *
 * This is the gate every change should pass before it is pushed.
 *
 *   npm run build && npm run preview     # in one terminal
 *   npm i -D playwright                  # once; NOT a project dependency, see below
 *   node scripts/playthrough.mjs         # in another
 *
 * Playwright is deliberately not in package.json: Vercel installs devDependencies
 * at build time and Playwright's postinstall pulls down browser binaries, which
 * would slow every deploy for a check that only ever runs locally.
 *
 *   BASE=http://localhost:4173 node scripts/playthrough.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4173/';
const CHROMIUM = process.env.CHROMIUM_PATH ?? undefined;

/** Villagers by the level column they stand in — keep in sync with wedding.ts. */
const VILLAGERS = [
  ['mormor', 12],
  ['ammamma', 30],
  ['cousin (nadaswaram)', 68],
  ['sister (flowers)', 100],
  ['friend (sweets)', 135],
  ['little one (rings)', 155],
];
const TILE = 32;
const MANDAP_COL = 171;   // the couple stand under it
const SHOP_COL = 97;      // the gift stall

const failures = [];
const errors = [];

function check(label, ok, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (!ok) failures.push(label);
}

const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const player = () => page.evaluate(() => window.__wq.player());
const stats = () =>
  page.evaluate(() => ({ visited: window.__wq.visited(), hearts: window.__wq.hearts() }));

/** Hold right; hop whenever forward progress stalls against a villager or a step. */
async function walkTo(targetX, stopShort = 0) {
  let lastX = -1;
  let stall = 0;
  for (let i = 0; i < 800; i++) {
    const p = await player();
    if (p.x >= targetX - stopShort) break;
    await page.keyboard.down('ArrowRight');
    if (Math.abs(p.x - lastX) < 1.5) {
      if (++stall >= 3) {
        await page.keyboard.press('Space');
        stall = 0;
      }
    } else {
      stall = 0;
    }
    lastX = p.x;
    await page.waitForTimeout(95);
  }
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(450);
  return (await player()).x;
}

async function talkThrough(maxPages = 5) {
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(420);
  const opened = (await page.locator('.wq-dialogue').count()) > 0;
  for (let i = 0; i < maxPages * 2 + 2; i++) {
    if ((await page.locator('.wq-dialogue').count()) === 0) break;
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(230);
  }
  return opened;
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1300);
for (let i = 0; i < 20 && !(await page.evaluate(() => !!window.__wq)); i++) {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(350);
}
check('world scene starts', await page.evaluate(() => !!window.__wq));

for (const [name, col] of VILLAGERS) {
  const at = await walkTo(col * TILE + TILE / 2, 24);
  const talked = await talkThrough();
  check(`${name} reachable and speaks`, talked, `stopped at x=${at.toFixed(0)}`);

  // the stall sits just before the fourth villager
  if (col === 68) {
    await walkTo(SHOP_COL * TILE + TILE / 2 - 46, 20);
    await page.evaluate(() => window.__wq.giveHearts(8));
    await talkThrough(); // the stallholder's pitch, which opens the stall
    await page.waitForTimeout(600);
    const stallOpen = (await page.locator('.wq-shop').count()) > 0;
    check('gift stall opens', stallOpen);
    if (stallOpen) {
      const affordable = page.locator('.wq-gift:not([disabled])');
      check('affordable gifts offered', (await affordable.count()) > 0);
      await affordable.first().click();
      await page.waitForTimeout(500);
      const bought = await page.evaluate(() => window.__wq.gift());
      check('gift bought and carried', !!bought, String(bought));
    }
  }
}

const afterVillagers = await stats();
check(
  'every villager counted',
  afterVillagers.visited === VILLAGERS.length,
  `${afterVillagers.visited}/${VILLAGERS.length}`,
);

// The daylight arc should have reached golden hour by the mandap.
await walkTo(MANDAP_COL * TILE + TILE / 2, 30);
const mood = await page.evaluate(() => window.__wq.mood());
check('walk ends at golden hour', mood.progress > 0.9 && mood.lightsOn > 0.5, JSON.stringify(mood));

const coupleSpoke = await talkThrough(6);
check('the couple are there to meet', coupleSpoke);
await page.waitForTimeout(1800); // let the fireworks get going
check('invitation card opens', (await page.locator('.wq-card').count()) > 0);
await page.screenshot({ path: 'playthrough-finale.png' });

check('no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nplaythrough passed');
