import { expect, test, type Page } from '@playwright/test';
import { markOnboarded, withTestHooks } from './helpers';

const STAGES: Array<{ name: string; reach: (page: Page) => Promise<void> }> = [
  { name: 'weather', reach: async (p) => void (await p.getByTestId('begin').click()) },
  {
    name: 'consent',
    reach: async (p) => {
      await p.getByTestId('begin').click();
      await p.getByTestId('weather-heavy').click();
    },
  },
  {
    name: 'storm',
    reach: async (p) => {
      await p.getByTestId('begin').click();
      await p.getByTestId('weather-heavy').click();
      await p.getByTestId('start-arc').click();
      await expect(p.getByTestId('arc-storm')).toBeVisible();
    },
  },
  {
    name: 'stillness',
    reach: async (p) => {
      await p.getByTestId('begin').click();
      await p.getByTestId('weather-heavy').click();
      await p.getByTestId('start-arc').click();
      await p.getByTestId('skip').click();
      await expect(p.getByTestId('arc-stillness')).toBeVisible();
    },
  },
  {
    name: 'song',
    reach: async (p) => {
      await p.getByTestId('begin').click();
      await p.getByTestId('weather-heavy').click();
      await p.getByTestId('start-arc').click();
      await p.getByTestId('skip').click();
      await p.getByTestId('skip').click();
      await expect(p.getByTestId('arc-song')).toBeVisible();
    },
  },
  {
    name: 'paused',
    reach: async (p) => {
      await p.getByTestId('begin').click();
      await p.getByTestId('weather-heavy').click();
      await p.getByTestId('start-arc').click();
      await p.getByTestId('pause').click();
      await expect(p.getByTestId('paused')).toBeVisible();
    },
  },
];

for (const stage of STAGES) {
  test(`Ground me is immediately available from ${stage.name}`, async ({ page }) => {
    await withTestHooks(page);
    await markOnboarded(page);
    await page.goto('/mirror');
    await stage.reach(page);
    const ground = page.getByTestId('ground-me');
    await expect(ground).toBeVisible();
    await expect(ground).toBeInViewport();
    await ground.click();
    await expect(page.getByTestId('ground-view')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Look around the room.' })).toBeFocused();
    // Escalation stops: no arc controls, no sound control, no Ground button.
    await expect(page.getByTestId('pause')).toHaveCount(0);
    await expect(page.getByTestId('skip')).toHaveCount(0);
    await expect(page.getByTestId('sound-toggle')).toHaveCount(0);
    await expect(page.getByTestId('ground-me')).toHaveCount(0);
    await expect(page.locator('[data-phase="grounding"]')).toBeVisible();
    // All three choices visible without scrolling.
    for (const id of ['ground-end', 'ground-stay', 'ground-help']) await expect(page.getByTestId(id)).toBeInViewport();
    await page.getByTestId('ground-help').click();
    await expect(page.getByTestId('help-panel')).toContainText('local emergency number');
    await page.getByTestId('ground-end').click();
    await expect(page.getByTestId('ended')).toBeVisible();
    await expect(page.getByTestId('save-local')).toHaveCount(0);
  });
}

test('high-risk words stop reflection and show human help', async ({ page }) => {
  await withTestHooks(page);
  await markOnboarded(page);
  await page.goto('/mirror');
  await STAGES[4]!.reach(page);
  await page.getByTestId('song-input').fill('I want to end my life');
  await page.getByRole('button', { name: 'Reflect' }).click();
  await expect(page.getByTestId('high-risk')).toBeVisible();
  await expect(page.getByTestId('help-panel')).toContainText('not a crisis service');
  await expect(page.getByTestId('song-reflection')).toHaveCount(0);
});
