#!/usr/bin/env bash
# First-time EC2 bootstrap for api.airbotix.ai.
# Idempotent — safe to re-run. Tested on Ubuntu 22.04 LTS (t3.small, ap-southeast-2).
#
# What it does:
#   1. apt update + base packages
#   2. install Docker + Docker Compose plugin
#   3. install nginx + certbot
#   4. open the Docker daemon to the ubuntu user
#   5. drop a unit file so docker-compose-up survives reboots
#
# What it does NOT do:
#   - write .env (you do that manually from .env.example after SSH'ing in)
#   - issue the TLS cert (run `sudo certbot --nginx -d api.airbotix.ai` once nginx is serving)
#   - pull the platform-backend image (the deploy workflow does that)
#
# Usage:
#   ssh ubuntu@<eip>
#   curl -fsSL https://raw.githubusercontent.com/Airbotix-AI/airbotix/main/infra/ec2/setup.sh | sudo bash

set -euo pipefail

log() { echo "[setup] $*" >&2; }

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

log "apt update + base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg lsb-release \
  unzip jq fail2ban \
  nginx certbot python3-certbot-nginx

log "Docker engine + Compose plugin"
install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

log "give the ubuntu user docker access"
usermod -aG docker ubuntu || true

log "AWS CLI v2 (for ECR login + S3 sync)"
if ! command -v aws >/dev/null 2>&1; then
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
fi

log "/opt/airbotix layout"
install -d -m 0755 /opt/airbotix
install -d -m 0750 /opt/airbotix/secrets        # .env lives here, chmod 600
install -d -m 0755 /opt/airbotix/logs
chown -R ubuntu:ubuntu /opt/airbotix

log "fetch docker-compose.yml from this repo"
if [[ ! -f /opt/airbotix/docker-compose.yml ]]; then
  cat > /opt/airbotix/docker-compose.yml <<'YAML'
# Replace this file by syncing /infra/ec2/docker-compose.yml from the airbotix repo,
# or manage it via the deploy workflow.
YAML
  chown ubuntu:ubuntu /opt/airbotix/docker-compose.yml
fi

log "systemd unit so docker-compose comes up on boot"
cat > /etc/systemd/system/airbotix-backend.service <<'UNIT'
[Unit]
Description=Airbotix platform-backend (docker compose)
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/airbotix
EnvironmentFile=-/opt/airbotix/secrets/.env
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable airbotix-backend.service

log "nginx baseline (HTTP only — certbot will add 443 stanza)"
if [[ ! -f /etc/nginx/sites-available/api.airbotix.ai ]]; then
  cp /opt/airbotix/nginx.conf /etc/nginx/sites-available/api.airbotix.ai 2>/dev/null || true
  ln -sf /etc/nginx/sites-available/api.airbotix.ai /etc/nginx/sites-enabled/api.airbotix.ai
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

log "fail2ban defaults"
systemctl enable --now fail2ban

log "DONE — next manual steps:"
cat <<'NEXT'

  1. Copy infra/ec2/nginx.conf into /etc/nginx/sites-available/api.airbotix.ai
     (the setup script tried, but the deploy workflow is more reliable).
  2. Copy infra/ec2/.env.example to /opt/airbotix/secrets/.env and fill secrets.
     chmod 600 /opt/airbotix/secrets/.env
  3. Point Cloudflare DNS api.airbotix.ai → this EIP (A record).
  4. Issue cert:
       sudo certbot --nginx -d api.airbotix.ai --redirect --agree-tos -m ops@airbotix.ai
  5. Push the image to ECR (via GitHub Actions), then on this host:
       cd /opt/airbotix
       docker compose pull && docker compose up -d
       docker compose logs -f --tail=100
  6. Verify: curl https://api.airbotix.ai/health
NEXT
