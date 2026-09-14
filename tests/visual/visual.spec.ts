import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];

async function prepare(page: Page, onboarded = true) {
  await page.addInitScript((ob) => {
    (window as unknown as { __AFM_TEST__: unknown }).__AFM_TEST__ = { frozenTime: 6.5, seed: 7 };
    if (ob) window.localStorage.setItem('afm.onboarded.v1', '1');
    window.localStorage.setItem(
      'afm.settings.v1',
      JSON.stringify({ motion: 'full' }),
    );
  }, onboarded);
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('homepage hero', async ({ page }) => {
      await prepare(page);
      await page.goto('/');
      await page.waitForTimeout(1500);
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-home.png`);
    });

    test('mirror weather', async ({ page }) => {
      await prepare(page);
      await page.goto('/mirror');
      await page.getByTestId('begin').click();
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-mirror-weather.png`);
    });

    test('mirror stillness and song', async ({ page }) => {
      await prepare(page);
      await page.goto('/mirror');
      await page.getByTestId('begin').click();
      await page.getByTestId('weather-heavy').click();
      await page.getByTestId('start-arc').click();
      await page.getByTestId('skip').click();
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-mirror-stillness.png`);
      await page.getByTestId('skip').click();
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-mirror-song.png`);
    });

    test('inner sky (empty)', async ({ page }) => {
      await prepare(page);
      await page.goto('/sky');
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-sky.png`);
    });

    test('science', async ({ page }) => {
      await prepare(page);
      await page.goto('/science');
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-science.png`);
    });

    test('ground', async ({ page }) => {
      await prepare(page);
      await page.goto('/ground');
      await settle(page);
      await expect(page).toHaveScreenshot(`${vp.name}-ground.png`);
    });

    if (vp.name === 'mobile') {
      test('mobile menu', async ({ page }) => {
        await prepare(page);
        await page.goto('/');
        await page.getByRole('button', { name: 'Open menu' }).click();
        await settle(page);
        await expect(page).toHaveScreenshot('mobile-menu.png');
      });
    }
  });
}
