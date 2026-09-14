import { expect, test } from '@playwright/test';
import { markOnboarded, trackConsoleErrors, withTestHooks } from './helpers';

test('microphone denied: Breath-trace explains and the Mirror continues without sensing', async ({ page, context }) => {
  await withTestHooks(page);
  await markOnboarded(page, { experimentalBreathTrace: true });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError')) },
    });
  });
  await context.clearPermissions();
  await page.goto('/mirror');
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-mixed').click();
  await page.getByTestId('trace-breath').check();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('trace-error')).toContainText('Microphone permission was not given');
  await expect(page.getByTestId('consent-step')).toBeVisible();
  await page.getByTestId('trace-none').check();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('arc-storm')).toBeVisible();
  await expect(page.getByText('Breath-trace on')).toHaveCount(0);
});

test('microphone is never requested on page load', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __gumCalls: number }).__gumCalls = 0;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () => {
          (window as unknown as { __gumCalls: number }).__gumCalls++;
          return Promise.reject(new DOMException('no', 'NotAllowedError'));
        },
      },
    });
  });
  for (const path of ['/', '/mirror', '/practice/one-long-sound', '/settings']) {
    await page.goto(path);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __gumCalls: number }).__gumCalls)).toBe(0);
  }
});

test('offline: the Mirror still works after a first visit', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Service worker offline test runs on Chromium');
  await markOnboarded(page);
  await page.goto('/mirror');
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  // Load again so the page is controlled, then go offline.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.goto('/mirror');
  await expect(page.getByTestId('arrival')).toBeVisible();
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-numb').click();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('arc-storm')).toBeVisible();
  await page.goto('/references');
  await expect(page.getByRole('heading', { name: 'You are offline.' })).toBeVisible();
  await context.setOffline(false);
});

test('reduced motion: static visuals, no continuous animation, content fully available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const console = trackConsoleErrors(page);
  await markOnboarded(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'minimal');
  // Reveal content is visible immediately.
  await expect(page.getByRole('heading', { name: 'Five commitments' })).toBeVisible();
  await page.goto('/mirror');
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-tense').click();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('arc-storm')).toBeVisible();
  // The canvas is drawn once and then left alone: pixels stay identical.
  const canvas = page.getByTestId('field-canvas');
  await page.waitForTimeout(600);
  const a = await canvas.screenshot();
  await page.waitForTimeout(1200);
  const b = await canvas.screenshot();
  expect(Buffer.compare(a, b)).toBe(0);
  console.expectNone();
});

test('keyboard only: skip link, onboarding and a full arc without a pointer', async ({ page }) => {
  await withTestHooks(page);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.goto('/mirror');
  await expect(page.getByRole('heading', { name: 'A quiet place to notice.' })).toBeFocused();
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('onboarding-next').focus();
    await page.keyboard.press('Enter');
  }
  await page.getByTestId('onboarding-enter').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'How is your inner weather right now?' })).toBeFocused();
  // Tab to the first weather word.
  let found = false;
  for (let i = 0; i < 12 && !found; i++) {
    await page.keyboard.press('Tab');
    found = await page.getByTestId('weather-tense').evaluate((el) => el === document.activeElement);
  }
  expect(found).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('consent-step')).toBeVisible();
  await page.getByTestId('start-arc').focus();
  await page.keyboard.press('Enter');
  await page.getByTestId('ground-me').focus();
  await expect(page.getByTestId('ground-me')).toBeFocused();
  const outline = await page.getByTestId('ground-me').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('ground-view')).toBeVisible();
});
