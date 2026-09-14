import { expect, test } from '@playwright/test';
import { trackConsoleErrors } from './helpers';

test('security headers and a nonce-based CSP on pages', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['permissions-policy']).toContain('microphone=(self)');
  expect(h['permissions-policy']).toContain('camera=()');
  expect(h['x-powered-by']).toBeUndefined();
  expect(h['set-cookie']).toBeUndefined();
  const csp = h['content-security-policy']!;
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  expect(csp).not.toContain('unsafe-eval');
  const html = await res.text();
  const nonce = /'nonce-([^']+)'/.exec(csp)![1];
  expect(html).toContain(`nonce="${nonce}"`);
  const second = await request.get('/');
  expect(second.headers()['content-security-policy']).not.toBe(csp);
});

test('health endpoint leaks nothing but status and build identity', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Object.keys(body).sort()).toEqual(['commit', 'status', 'version']);
  expect(body.status).toBe('ok');
});

test('presence API validates input and never invents presence', async ({ request }) => {
  expect((await request.post('/api/presence', { data: { action: 'hack' } })).status()).toBe(400);
  expect((await request.post('/api/presence', { data: 'x'.repeat(4000), headers: { 'content-type': 'application/json' } })).status()).toBe(400);
  expect((await request.post('/api/presence', { data: { action: 'heartbeat', id: '00000000-0000-4000-8000-000000000000' } })).status()).toBe(404);
  const joined = await request.post('/api/presence', { data: { action: 'join' } });
  expect(joined.status()).toBe(200);
  const { id, count } = await joined.json();
  expect(count).toBeGreaterThanOrEqual(1);
  expect((await request.post('/api/presence', { data: { action: 'leave', id } })).status()).toBe(200);
});

test('companion API is absent unless a cloud provider is configured', async ({ request }) => {
  expect((await request.post('/api/companion', { data: { stage: 'song', userText: 'hi' } })).status()).toBe(404);
});

test('no console errors or hydration warnings across routes', async ({ page }) => {
  const tracker = trackConsoleErrors(page);
  for (const path of ['/', '/mirror', '/sky', '/practice', '/practice/scribble-it-out', '/science', '/references', '/manifesto', '/honest-mirror', '/ground', '/privacy', '/terms', '/about', '/settings']) {
    await page.goto(path);
    await page.waitForLoadState('load');
  }
  tracker.expectNone();
});

test('SEO basics: titles, canonicals, sitemap, robots, manifest', async ({ page, request }) => {
  await page.goto('/science');
  await expect(page).toHaveTitle('The science beneath the poetry · AI for Meaning');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://aiformeaning.com/science');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);
  expect(await page.locator('h1').count()).toBe(1);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://aiformeaning.com/practice/quiet-orb');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://aiformeaning.com/sitemap.xml');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
});
