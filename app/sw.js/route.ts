import { getBuildInfo } from '@/lib/env/server';

export const dynamic = 'force-dynamic';

/**
 * Service worker, versioned per deployment so old caches are always discarded on activate.
 * Strategy: API requests are never cached; hashed static assets are cache-first; pages are
 * network-first (fresh when online) with a cached copy — and finally /offline — when not.
 */
function serviceWorkerSource(version: string): string {
  return `/* AI for Meaning service worker — ${version} */
const VERSION = ${JSON.stringify(version)};
const STATIC_CACHE = 'afm-static-' + VERSION;
const PAGE_CACHE = 'afm-pages-' + VERSION;
const PRECACHE_PAGES = ['/offline', '/mirror', '/', '/ground', '/practice'];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const pages = await caches.open(PAGE_CACHE);
    const statics = await caches.open(STATIC_CACHE);
    for (const path of PRECACHE_PAGES) {
      try {
        const res = await fetch(path, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) continue;
        const html = await res.clone().text();
        await pages.put(path, res);
        const assets = new Set(Array.from(html.matchAll(/\\/_next\\/static\\/[^"'\\s)\\\\]+/g), (m) => m[0]));
        await Promise.all(Array.from(assets).map((url) => statics.match(url).then((hit) => hit || fetch(url).then((r) => r.ok ? statics.put(url, r) : undefined)).catch(() => undefined)));
      } catch (e) { /* offline during install: skip */ }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('afm-') && k !== STATIC_CACHE && k !== PAGE_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isStatic(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname === '/grain.svg' || url.pathname === '/manifest.webmanifest';
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  const url = new URL(request.url);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS)),
    ]);
    if (res && res.ok && res.type === 'basic') cache.put(url.pathname, res.clone());
    return res;
  } catch (e) {
    return (await cache.match(url.pathname)) || (await cache.match('/offline')) || new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
  if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
  }
});
`;
}

export function GET() {
  const { version, commit } = getBuildInfo();
  return new Response(serviceWorkerSource(`${version}-${commit}`), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
