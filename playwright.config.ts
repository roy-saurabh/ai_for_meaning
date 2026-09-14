import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3210);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'tests',
  testMatch: ['e2e/**/*.spec.ts', 'visual/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, threshold: 0.08, animations: 'disabled' } },
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{platform}/{arg}{ext}',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', testMatch: 'e2e/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', testMatch: 'e2e/{journey,ground,mobile}.spec.ts', use: { ...devices['Pixel 7'] } },
    { name: 'firefox', testMatch: 'e2e/smoke.spec.ts', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: 'e2e/smoke.spec.ts', use: { ...devices['Desktop Safari'] } },
    { name: 'visual', testMatch: 'visual/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `node node_modules/next/dist/bin/next start --port ${PORT} --hostname 127.0.0.1`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
