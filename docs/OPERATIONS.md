# Operations runbook

## At a glance

| Thing | Where |
| --- | --- |
| Container | `aiformeaning-web` (compose project `aiformeaning`) |
| Config | `/opt/aiformeaning/{compose.production.yml,.env.production,.env.deploy}` |
| Scripts | `/usr/local/bin/aiformeaning-{deploy,edge,ssh-gate}` |
| Edge vhost | `/srv/edge/nginx/conf.d/aiformeaning.com.conf` in `al360-nginx-prod` |
| Certificates | `/opt/al360/repo/letsencrypt/live/aiformeaning.com/` |
| Health | `curl -s http://127.0.0.1:3230/api/health` on the host; `https://aiformeaning.com/api/health` |
| Logs | `docker logs aiformeaning-web`; `/opt/al360/repo/nginx/logs/aiformeaning.error.log` |

## Routine deploy

Merge to `main`. The deploy workflow runs CI, pushes the image and activates it. Watch it with
`gh run watch --repo roy-saurabh/ai_for_meaning`. The release is live only when health reports the new
commit and every smoke path returns 200; otherwise the previous release is restored automatically and
the job fails.

Manual deploy from the host: `sudo aiformeaning-deploy <full-git-sha>`.

## Status and rollback

```bash
ssh -i aiformeaning_deploy aiformeaning@62.72.16.195 status     # from a machine with the deploy key
sudo aiformeaning-deploy --status                              # on the host
sudo aiformeaning-deploy --rollback
```

## Configuration changes

Edit `/opt/aiformeaning/.env.production` as root (mode 0600), then re-activate the current release:
`sudo aiformeaning-deploy "$(sed -n 's/^IMAGE_TAG=//p' /opt/aiformeaning/.env.deploy)"`.
Changes to `compose.production.yml` or vhost templates ship in `deploy/` and are installed by
re-running `provision.sh` (idempotent), followed by `aiformeaning-edge enable-tls` for vhost changes.

## Enabling the cloud Witness-Companion

1. Review the provider's data terms and update `/privacy` wording if needed (it adapts automatically
   to whether the companion is enabled, but the processor description must stay accurate).
2. Set `MIRROR_COMPANION_PROVIDER=anthropic` and `MIRROR_COMPANION_API_KEY=…` (optionally
   `MIRROR_COMPANION_MODEL`) in `.env.production`.
3. Re-activate. `POST /api/companion` stops returning 404. Responses that break constraints, time out
   or are refused fall back to local reflections silently.

## TLS

Renewal runs from root's cron at 03:00 with a reload hook. Check expiry:
`openssl s_client -connect aiformeaning.com:443 -servername aiformeaning.com </dev/null 2>/dev/null | openssl x509 -noout -dates`.
Dry run: `certbot renew --dry-run --config-dir /opt/al360/repo/letsencrypt --cert-name aiformeaning.com`.

## Incidents

| Symptom | Checks |
| --- | --- |
| Calm 503 page | `docker ps -a --filter name=aiformeaning-web`; `docker logs --tail 100 aiformeaning-web`; `sudo aiformeaning-deploy --status`; roll back if needed |
| 502 for all sites | Not this app — the shared edge is down. `docker logs al360-nginx-prod`. If a recent aiformeaning vhost change is suspected: `aiformeaning-edge remove` |
| OOM / restarts | `docker inspect -f '{{.State.OOMKilled}} {{.RestartCount}}' aiformeaning-web`; limit is 384 MiB; idle ≈ 50 MiB |
| Gathering count stuck | Presence is in-memory and expires after 45 s; a restart clears it |
| Rate-limited API (429) | Edge: 60 req/min per client on `/api/`; app: 30/min presence POST, 12/min companion |
| Stale site after deploy | Service worker is versioned per commit; a hard reload activates the new worker. Confirm `/sw.js` shows the new commit |

## Privacy-respecting operations

- Do not enable access logs for this vhost. If temporary debugging requires them, enable briefly, then
  delete the log file and note it.
- Never log request bodies. Application code does not log requests.
- Do not add analytics. If operational telemetry is ever needed, use first-party, aggregate,
  non-identifying metrics and update `/privacy` first.

## Backups

The server holds no user data. Back up only the repository (GitHub) and `/opt/aiformeaning/.env.production`
(secrets manager). Users back up their own data via Settings → Export.
