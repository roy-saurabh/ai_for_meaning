# ADR 0004 — Nonce-based Content-Security-Policy

**Status:** accepted · 2026-09-14

## Context
The site has no need for third-party scripts. Next.js App Router emits inline scripts, which a
`script-src 'self'` policy would block. Options: `'unsafe-inline'`, experimental SRI hashes, or nonces.

## Decision
`proxy.ts` generates a nonce per request and sets
`script-src 'self' 'nonce-…' 'strict-dynamic'` (no `unsafe-eval` in production), `connect-src 'self'`,
`frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. The only
first-party inline script (`ThemeScript`) carries the nonce.

`style-src` keeps `'unsafe-inline'`: React style attributes (used for CSS custom properties) cannot
carry nonces, and style injection is far lower risk than script injection given that all user text
renders as text nodes. `upgrade-insecure-requests` is omitted because HSTS at the edge enforces HTTPS
and the directive breaks local HTTP testing.

## Consequences
- All pages render dynamically (no static HTML caching). Acceptable for current traffic on one vCPU;
  hashed static assets are still cached immutably.
- E2E verifies the nonce changes per request and matches the HTML.
