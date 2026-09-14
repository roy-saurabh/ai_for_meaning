import { expect, test } from '@playwright/test';
import { trackConsoleErrors, withTestHooks } from './helpers';

test('critical journey: home → Mirror → arc → keep trace → Inner Sky → export → delete → empty sky', async ({ page }) => {
  const console = trackConsoleErrors(page);
  await withTestHooks(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Technology that returns you to/ })).toBeVisible();
  await page.getByRole('link', { name: 'Enter the Mirror' }).first().click();

  // Onboarding: arrival, ground, privacy, enter.
  await expect(page.getByTestId('onboarding')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A quiet place to notice.' })).toBeVisible();
  await page.getByTestId('onboarding-next').click();
  await expect(page.getByText(/not therapy, medical care, diagnosis or a crisis service/)).toBeVisible();
  await page.getByTestId('onboarding-next').click();
  await expect(page.getByText(/Microphone and camera are off by default/)).toBeVisible();
  await page.getByTestId('onboarding-next').click();
  await page.getByTestId('onboarding-enter').click();

  // Weather.
  await expect(page.getByRole('heading', { name: 'How is your inner weather right now?' })).toBeVisible();
  await page.getByTestId('weather-foggy').click();

  // Consent: no sensing is the default.
  await expect(page.getByTestId('trace-none')).toBeChecked();
  await page.getByTestId('start-arc').click();

  // Storm → skip → Stillness → Song → Close.
  await expect(page.getByTestId('arc-storm')).toBeVisible();
  await expect(page.getByTestId('guidance-line')).toContainText(/move|still|shoulders|hands|sigh|feet/i);
  await page.getByTestId('skip').click();
  await expect(page.getByTestId('arc-stillness')).toBeVisible();
  await expect(page.getByTestId('guidance-line')).toHaveText('Nothing to improve for a moment.');
  await page.getByTestId('skip').click();
  await expect(page.getByTestId('arc-song')).toBeVisible();
  await page.getByTestId('song-input').fill('warm tea');
  await page.getByRole('button', { name: 'Reflect' }).click();
  await expect(page.getByTestId('song-reflection')).toContainText('warm tea');
  await page.getByTestId('song-reflection').getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByTestId('close-step')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nothing needed to happen.' })).toBeVisible();
  await page.getByTestId('closing-word').fill('enough');
  await page.getByTestId('save-local').click();
  await expect(page.getByTestId('ended')).toBeVisible();

  // Inner Sky contains the trace.
  await page.getByTestId('go-sky').click();
  await expect(page).toHaveURL(/\/sky$/);
  await expect(page.getByTestId('sky-count')).toContainText('one trace');
  const star = page.getByTestId('sky-star').first();
  await expect(star).toHaveAttribute('aria-label', /Storm → Stillness → Song · \d+ min · (no prompts|one prompt|\d+ prompts)/);
  await page.getByText('Traces as a list').click();
  await expect(page.getByTestId('trace-list')).toContainText('carried word: “enough”');

  // Export.
  await page.goto('/settings');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-json').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^ai-for-meaning-export-.*\.json$/);
  const exported = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString('utf8')));
  expect(exported.traces).toHaveLength(1);
  expect(exported.traces[0].weather).toBe('foggy');
  expect(JSON.stringify(exported)).not.toContain('warm tea');

  // Delete → empty sky.
  await page.getByTestId('delete-everything').click();
  await page.getByTestId('confirm-delete').click();
  await expect(page.getByTestId('settings-notice')).toHaveText('Everything has been deleted from this browser.');
  await page.goto('/sky');
  await expect(page.getByTestId('sky-empty')).toContainText('Nothing here yet.');
  await expect(page.getByTestId('sky-empty')).toContainText('A sky does not need to be filled.');

  console.expectNone();
});

test('the session clock advances on its own and pauses/resumes', async ({ page }) => {
  await withTestHooks(page, { timeScale: 40 });
  await page.addInitScript(() => {
    window.localStorage.setItem('afm.onboarded.v1', '1');
    window.localStorage.setItem('afm.settings.v1', JSON.stringify({ sessionLength: 'short' }));
  });
  await page.goto('/mirror');
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-bright').click();
  await page.getByTestId('start-arc').click();
  await expect(page.getByTestId('arc-storm')).toBeVisible();
  await page.getByTestId('pause').click();
  await expect(page.getByTestId('paused')).toBeVisible();
  await page.waitForTimeout(2_000);
  await expect(page.getByTestId('paused')).toBeVisible();
  await page.getByTestId('resume').click();
  // short storm (45s) + transition (10s) at 40× ≈ 1.4s
  await expect(page.getByTestId('arc-stillness')).toBeVisible({ timeout: 10_000 });
});

test('discarding keeps nothing', async ({ page }) => {
  await withTestHooks(page);
  await page.addInitScript(() => window.localStorage.setItem('afm.onboarded.v1', '1'));
  await page.goto('/mirror');
  await page.getByTestId('begin').click();
  await page.getByTestId('weather-custom').click();
  await page.getByTestId('weather-custom-input').fill('a bit of everything');
  await page.getByRole('button', { name: 'This one' }).click();
  await expect(page.getByTestId('consent-step')).toContainText('“a bit of everything.”');
  await page.getByTestId('start-arc').click();
  await page.getByTestId('end').click();
  await page.getByTestId('discard').click();
  await expect(page.getByTestId('ended')).toContainText('Nothing was saved.');
  await page.goto('/sky');
  await expect(page.getByTestId('sky-empty')).toBeVisible();
});
