import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { markOnboarded, withTestHooks } from './helpers';

const ROUTES = ['/', '/sky', '/practice', '/practice/quiet-orb', '/science', '/references', '/manifesto', '/honest-mirror', '/ground', '/privacy', '/terms', '/about', '/settings', '/offline', '/does-not-exist'];

async function audit(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${label}: ${v.id} — ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
}

for (const path of ROUTES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    await audit(page, path);
  });
}

test('axe: Mirror stages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await withTestHooks(page);
  await page.goto('/mirror');
  await expect(page.getByTestId('onboarding')).toBeVisible();
  await audit(page, 'onboarding');
  await page.evaluate(() => window.localStorage.setItem('afm.onboarded.v1', '1'));
  await page.goto('/mirror');
  await audit(page, 'arrival');
  await page.getByTestId('begin').click();
  await audit(page, 'weather');
  await page.getByTestId('weather-tense').click();
  await audit(page, 'consent');
  await page.getByTestId('start-arc').click();
  await audit(page, 'storm');
  await page.getByTestId('skip').click();
  await audit(page, 'stillness');
  await page.getByTestId('skip').click();
  await audit(page, 'song');
  await page.getByTestId('ground-me').click();
  await audit(page, 'ground');
});

test('axe: mobile menu open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await markOnboarded(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await audit(page, 'mobile menu');
});
