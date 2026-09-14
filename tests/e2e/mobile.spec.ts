import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/mirror', '/sky', '/practice', '/science', '/references', '/ground', '/settings', '/manifesto', '/honest-mirror', '/about', '/privacy', '/terms'];

test('no horizontal overflow on key routes', async ({ page }) => {
  for (const path of ROUTES) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByTestId('mobile-menu');
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: /Science/ }).click();
  await expect(page).toHaveURL(/\/science$/);
  await expect(page.getByTestId('mobile-menu')).toHaveCount(0);
});

test('Mirror controls stay within the viewport with comfortable touch targets', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.addInitScript(() => window.localStorage.setItem('afm.onboarded.v1', '1'));
  await page.goto('/mirror');
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-tense').click();
  await page.getByTestId('start-arc').click();
  for (const id of ['pause', 'skip', 'end', 'ground-me']) {
    const el = page.getByTestId(id);
    await expect(el).toBeInViewport();
    const box = await el.boundingBox();
    expect(box!.height, id).toBeGreaterThanOrEqual(44);
  }
});
