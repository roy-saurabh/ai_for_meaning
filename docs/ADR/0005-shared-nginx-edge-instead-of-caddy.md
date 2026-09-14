# ADR 0005 — Use the VPS's existing nginx edge instead of Caddy

**Status:** accepted · 2026-09-14

## Context
The brief recommended Caddy as TLS terminator "unless inspection of the VPS reveals an existing reverse
proxy that should be retained". Inspection found `al360-nginx-prod` bound to 80/443, serving several
production domains, with an `edge.d` include directory, a certbot webroot and a renewal cron already in
place, and a proven pattern for independent sites (`roysaurabh.com`, `innerhues.art`).

## Decision
Retain the shared edge. Add one vhost file for `aiformeaning.com`, validated with `nginx -t` before
reload and automatically reverted on failure. Issue certificates with certbot webroot into the edge's
letsencrypt tree. Run the app as an isolated compose project joined to `al360-network` as external.

## Consequences
- No port conflict and no risk to other sites from a second proxy.
- TLS settings, HSTS and compression are expressed in nginx rather than a Caddyfile.
- The vhost uses a variable upstream so the edge never fails to start if this app is down.
- Operational coupling: edge restarts affect this site; documented in OPERATIONS.md.
