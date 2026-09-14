import { expect, test } from '@playwright/test';

test('smoke: homepage, Mirror onboarding and Ground render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Technology that returns you to');
  await page.goto('/mirror');
  await expect(page.getByTestId('onboarding')).toBeVisible();
  await page.goto('/ground');
  await expect(page.getByRole('heading', { level: 1, name: 'Back to the room.' })).toBeVisible();
});
