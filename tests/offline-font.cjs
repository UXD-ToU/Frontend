const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox']
  });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const appUrl = process.env.APP_URL || 'http://127.0.0.1:8765';
    const origin = new URL(appUrl).origin;
    const external = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = route.request().url();
      if (/^https?:/.test(url) && new URL(url).origin !== origin) {
        external.push(url);
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(appUrl);
    await page.locator('#hero-title').waitFor();
    const loaded = await page.evaluate(async () => {
      const faces = await document.fonts.load('400 16px "Pretendard Variable"', '나의 위시리스트');
      return faces.length > 0 && faces.every(face => face.status === 'loaded');
    });
    assert.equal(loaded, true, 'bundled Pretendard must load with external requests blocked');
    for (const screen of ['friends', 'wishlist', 'wish-add', 'friend-select', 'wish-link', 'privacy', 'home']) {
      await page.evaluate(async screen => {
        const { navigate } = await import('./js/router.js');
        await navigate(screen);
      }, screen);
    }
    assert.deepEqual(external, [], 'core screens must not request external resources automatically');
    assert.deepEqual(errors, []);
    await page.context().setOffline(true);
    assert.equal(await page.evaluate(() => document.fonts.check('700 16px "Pretendard Variable"', '나')), true);
    console.log('PASS bundled Korean font and zero automatic external requests across core screens');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
