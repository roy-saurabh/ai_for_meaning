# Deployment

## Topology

The production VPS (Hostinger, Paris; `srv897839.hstgr.cloud`, `62.72.16.195`, Ubuntu 24.04, 1 vCPU,
4 GB RAM) is **shared** with other production stacks. Ports 80/443 are owned by an existing Docker
nginx edge, `al360-nginx-prod` (compose project `repo` in `/opt/al360/repo`), which already serves
several domains and includes `/srv/edge/nginx/conf.d/*.conf`.

The brief's default of Caddy was therefore **not** used: a second proxy cannot bind 80/443 without
taking the other sites down. AI for Meaning plugs into the existing edge, following the pattern the
host already uses for `roysaurabh.com` ([ADR 0005](ADR/0005-shared-nginx-edge-instead-of-caddy.md)).

```text
Internet ─► al360-nginx-prod :80/:443  (TLS, HSTS, ACME webroot, /api rate limit, no access log)
              │ Docker network al360-network, variable upstream resolved per request
              ▼
            aiformeaning-web :3000      (compose project "aiformeaning", 127.0.0.1:3230 for health checks)
```

Isolation guarantees:

- Own compose project (`aiformeaning`); `al360-network` is joined as **external** and never created or removed.
- Published on `127.0.0.1:3230` only.
- `read_only` root filesystem, `tmpfs` for `/tmp` and `.next/cache`, `cap_drop: ALL`,
  `no-new-privileges`, non-root `node` user, limits 384 MiB / 0.5 CPU / 128 pids. Measured idle
  memory ≈ 48 MiB.
- The vhost uses a variable upstream + Docker DNS, so if this container is stopped the shared edge
  still starts and every other site keeps working.
- Every edge change is validated with `nginx -t` inside the container before reload; on failure the
  previous file is restored (`aiformeaning-edge`).

## Image

`Dockerfile`: `node:24.21.0-alpine` pinned by digest; stages `deps` (pnpm via Corepack,
`--frozen-lockfile`), `build` (`APP_VERSION`, `GIT_COMMIT`, `NEXT_PUBLIC_SITE_URL` build args), and a
runtime that copies only the standalone server, static assets and `public/`. No secrets are copied;
`.dockerignore` excludes `.env*`, tests, docs and deploy files. Health check calls `/api/health`.

CI builds `linux/amd64` and pushes `ghcr.io/roy-saurabh/ai_for_meaning:<git-sha>` and `:main` with
provenance and SBOM attestations.

## CI/CD

- `.github/workflows/ci.yml` — on `build/**` pushes, PRs, and as a reusable workflow: install, lint,
  typecheck, unit tests, `pnpm audit --prod --audit-level high`, build, Playwright (Chromium desktop +
  mobile, Firefox/WebKit smoke).
- `.github/workflows/deploy.yml` — on push to `main`: runs CI, builds/pushes the image, then (only when
  repository variable `DEPLOY_ENABLED=true`) SSHes to the VPS as `aiformeaning` and runs
  `deploy <sha>`. The `production` environment can require manual approval.

### Required GitHub configuration

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `DEPLOY_ENABLED` | `true` once the server is provisioned |
| Secret | `DEPLOY_HOST` | `62.72.16.195` |
| Secret | `DEPLOY_SSH_KEY` | Private half of the deploy key (ed25519) |
| Secret | `DEPLOY_KNOWN_HOSTS` | Output of `ssh-keyscan -t ed25519 62.72.16.195` |

```bash
ssh-keygen -t ed25519 -N '' -C github-actions-aiformeaning -f ./aiformeaning_deploy
gh secret set DEPLOY_SSH_KEY --repo roy-saurabh/ai_for_meaning < ./aiformeaning_deploy
gh secret set DEPLOY_HOST --repo roy-saurabh/ai_for_meaning --body 62.72.16.195
ssh-keyscan -t ed25519 62.72.16.195 | gh secret set DEPLOY_KNOWN_HOSTS --repo roy-saurabh/ai_for_meaning
gh variable set DEPLOY_ENABLED --repo roy-saurabh/ai_for_meaning --body true
shred -u ./aiformeaning_deploy   # keep only the .pub for provisioning
```

The GHCR package is private by default. The VPS pulls it as root, which already has a `ghcr.io` login
used by other stacks. If that credential cannot read this package, either make the package public
(`https://github.com/users/roy-saurabh/packages/container/ai_for_meaning/settings`) or run
`docker login ghcr.io` as root with a token that has only `read:packages`.

## Least-privilege deploys (no routine root SSH)

`deploy/server/provision.sh` (run once as root) creates:

- system user `aiformeaning`: locked password, **not** in the `docker` group;
- `authorized_keys` entry pinned to `command="/usr/local/bin/aiformeaning-ssh-gate"` with
  `no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,no-user-rc` — the CI key can only
  run `deploy <sha>`, `status` or `rollback`;
- `/etc/sudoers.d/aiformeaning` allowing only `/usr/local/bin/aiformeaning-deploy` (validated with `visudo -cf`);
- `/opt/aiformeaning/` with the compose file, vhost templates and a `0600` `.env.production`.

`aiformeaning-deploy <sha>` validates the tag, pulls, activates, waits for `/api/health` to report the
expected commit, smoke-tests `/`, `/mirror`, `/science`, `/ground`, `/privacy`, `/sitemap.xml`,
`/api/health`, and **rolls back automatically** to the previous tag on failure. It holds a lock and
prunes old images, keeping the last three plus current and previous.

## First deployment

```bash
# 0. From a machine with the repo checked out
rsync -a deploy/ affectlog-vps:/root/aiformeaning-deploy/

# 1. On the VPS, as root
DEPLOY_PUBKEY="$(cat /path/to/aiformeaning_deploy.pub)" bash /root/aiformeaning-deploy/server/provision.sh
aiformeaning-deploy <git-sha-on-main>      # after CI has pushed the image
aiformeaning-edge install-http             # stage-1 vhost (HTTP + ACME webroot)

# 2. After DNS points to the VPS (see below)
aiformeaning-edge check-dns
CERTBOT_EMAIL=you@example.org aiformeaning-edge issue-cert
aiformeaning-edge enable-tls               # stage-2 vhost (HTTPS, www → apex, HSTS)
```

Certificate renewal is already handled by root's existing cron:
`0 3 * * * certbot renew --quiet --deploy-hook 'docker exec al360-nginx-prod nginx -s reload' --config-dir=/opt/al360/repo/letsencrypt`.

## DNS

Current state (checked 14 September 2026): `aiformeaning.com` uses Hostinger parking nameservers and
resolves to `185.166.188.69` with an AAAA record `2a02:4780:8:880:0:3445:50a5:5`; `www` is a CNAME to
the apex. **Both point to Hostinger parking, not the VPS.** TLS cannot be issued until this changes.

Required records (in the Hostinger DNS zone for `aiformeaning.com`):

```text
A      @     62.72.16.195
A      www   62.72.16.195        (or: CNAME www aiformeaning.com.)
```

- **Delete** the parking `A @ 185.166.188.69` and the parking `AAAA @ 2a02:4780:8:880:0:3445:50a5:5`.
  A stale AAAA would send IPv6 clients (and possibly Let's Encrypt) to the parking host.
- IPv6 (optional): the VPS has a verified global address `2a02:4780:28:bc60::1`, and the edge listens on
  `[::]:80/443`. Add `AAAA @ 2a02:4780:28:bc60::1` (and for `www`) only after confirming
  `curl -6 http://[2a02:4780:28:bc60::1]/` reaches the edge from outside.
- TTL 300 during cutover.

Verify: `dig +short A aiformeaning.com`, `dig +short AAAA aiformeaning.com`,
`dig +short www.aiformeaning.com`, then `aiformeaning-edge check-dns` on the VPS.

## Edge configuration details

`deploy/nginx/aiformeaning.com.https.conf`:

- TLS 1.2/1.3, ECDSA certificate, session tickets off, HTTP/2.
- `http → https`, `www → apex` (301), ACME webroot preserved on both.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` from the edge only (never in
  development). Declaring `add_header` at server level stops the edge's global headers (another
  project's CSP) from being inherited; the app sends its own CSP and security headers.
- gzip for text types; `client_max_body_size 64k`.
- `/api/` limited to 60 req/min per client at the edge (burst 20).
- `limit_conn perip 64` (the edge default of 20 is too low for HTTP/2 page loads).
- `access_log off`; `error_log … warn`.
- A calm inline 503 page for 502/503/504 when the app is unreachable.

## VPS hardening

Findings at inspection (14 September 2026): `PermitRootLogin yes`, `PasswordAuthentication yes`,
fail2ban active, unattended-upgrades active, no `ufw` installed, several unrelated containers publish
ports on `0.0.0.0` (3000–3005, 8003), and 25+ containers run for other projects.

Applied for AI for Meaning: dedicated non-docker deploy user with a forced-command key and a single
sudo rule; container hardening as above; loopback-only port; no new public ports; no global changes.

**Recommended host-wide changes (not applied — they affect other projects and operators):**

1. Confirm every operator has key-based access, then set in `/etc/ssh/sshd_config.d/10-hardening.conf`:
   `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin prohibit-password`
   (later `no`, once all stacks deploy through their own users). Validate with `sshd -t` and keep a
   second session open while reloading.
2. Firewall: allow 22, 80, 443 (IPv4/IPv6) and deny other inbound. Note that Docker-published ports
   bypass `ufw`; rebind the unrelated `0.0.0.0:300x`/`8003` publications to `127.0.0.1` in their own
   compose files, or add rules in the `DOCKER-USER` chain.
3. Keep unattended-upgrades on; schedule reboots for kernel updates.
4. Disk is 74% used: enable periodic `docker image prune` for all stacks (a cron already exists) and
   monitor.

## Rollback

`ssh aiformeaning@62.72.16.195 rollback` (CI key) or `sudo aiformeaning-deploy --rollback` on the host.
To remove the site from the edge without touching the app: `aiformeaning-edge remove`.
