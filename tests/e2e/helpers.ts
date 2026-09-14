import { expect, type Page } from '@playwright/test';

export const ONBOARDED = 'afm.onboarded.v1';
export const SETTINGS = 'afm.settings.v1';

/** Deterministic hooks: frozen canvases optional; session clock scale. */
export async function withTestHooks(page: Page, hooks: { timeScale?: number; frozenTime?: number; seed?: number } = {}) {
  await page.addInitScript((h) => {
    (window as unknown as { __AFM_TEST__: unknown }).__AFM_TEST__ = h;
  }, hooks);
}

export async function markOnboarded(page: Page, settings?: Record<string, unknown>) {
  await page.addInitScript(
    ({ key, settingsKey, settings: s }) => {
      window.localStorage.setItem(key, '1');
      if (s) window.localStorage.setItem(settingsKey, JSON.stringify(s));
    },
    { key: ONBOARDED, settingsKey: SETTINGS, settings: settings ?? null },
  );
}

/** Collect console errors and uncaught exceptions; assert none at the end of a test. */
export function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return {
    errors,
    expectNone: () => expect(errors.filter((e) => !/Failed to load resource: net::ERR_INTERNET_DISCONNECTED/.test(e))).toEqual([]),
  };
}

export async function goToStorm(page: Page, weather = 'tense') {
  await page.getByTestId('begin').click();
  await page.getByTestId(`weather-${weather}`).click();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('arc-storm')).toBeVisible();
}
