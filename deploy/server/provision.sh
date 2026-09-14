#!/usr/bin/env bash
# provision.sh — one-time, idempotent host setup for aiformeaning.com on the shared VPS. Run as root:
#
#   sudo DEPLOY_PUBKEY="ssh-ed25519 AAAA… github-actions-aiformeaning" bash provision.sh
#
# Creates:
#   - system user `aiformeaning` (no password, no docker group) whose SSH key is pinned to a forced
#     command (deploy <sha> | status | rollback);
#   - /etc/sudoers.d/aiformeaning allowing only /usr/local/bin/aiformeaning-deploy;
#   - /opt/aiformeaning with the compose file, nginx vhost templates and an .env.production stub;
#   - /usr/local/bin/aiformeaning-{deploy,ssh-gate,edge}.
# It does not change sshd, the firewall, other users, other stacks or the shared nginx edge.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_ROOT="$(cd "$HERE/.." && pwd)"

[ "$(id -u)" -eq 0 ] || { echo "run as root" >&2; exit 1; }

id aiformeaning >/dev/null 2>&1 || useradd --system --create-home --home-dir /home/aiformeaning --shell /bin/bash aiformeaning
passwd -l aiformeaning >/dev/null

install -d -m 0755 -o root -g root /opt/aiformeaning /opt/aiformeaning/nginx
install -m 0644 "$DEPLOY_ROOT/compose.production.yml" /opt/aiformeaning/compose.production.yml
install -m 0644 "$DEPLOY_ROOT/nginx/aiformeaning.com.http.conf" /opt/aiformeaning/nginx/
install -m 0644 "$DEPLOY_ROOT/nginx/aiformeaning.com.https.conf" /opt/aiformeaning/nginx/
[ -f /opt/aiformeaning/.env.production ] || install -m 0600 -o root -g root "$DEPLOY_ROOT/.env.production.example" /opt/aiformeaning/.env.production

install -m 0755 -o root -g root "$HERE/aiformeaning-deploy" /usr/local/bin/aiformeaning-deploy
install -m 0755 -o root -g root "$HERE/aiformeaning-ssh-gate" /usr/local/bin/aiformeaning-ssh-gate
install -m 0755 -o root -g root "$HERE/aiformeaning-edge" /usr/local/bin/aiformeaning-edge

SUDOERS=/etc/sudoers.d/aiformeaning
printf 'aiformeaning ALL=(root) NOPASSWD: /usr/local/bin/aiformeaning-deploy\n' > "$SUDOERS.tmp"
chmod 0440 "$SUDOERS.tmp"
visudo -cf "$SUDOERS.tmp" >/dev/null && mv "$SUDOERS.tmp" "$SUDOERS"

if [ -n "${DEPLOY_PUBKEY:-}" ]; then
  install -d -m 0700 -o aiformeaning -g aiformeaning /home/aiformeaning/.ssh
  printf 'command="/usr/local/bin/aiformeaning-ssh-gate",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,no-user-rc %s\n' "$DEPLOY_PUBKEY" > /home/aiformeaning/.ssh/authorized_keys
  chown aiformeaning:aiformeaning /home/aiformeaning/.ssh/authorized_keys
  chmod 0600 /home/aiformeaning/.ssh/authorized_keys
fi

docker network inspect al360-network >/dev/null 2>&1 || echo "WARNING: al360-network not found; the edge cannot reach the app"
echo "provisioned. next: sudo aiformeaning-deploy <sha>  (then aiformeaning-edge install-http)"
