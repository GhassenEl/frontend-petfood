#!/usr/bin/env bash
# Bootstrap VPS Ubuntu/Debian pour PetfoodTN (Docker + GHCR + HTTPS Caddy)
# Usage (sur le VPS, en root ou sudo) :
#   curl -fsSL https://raw.githubusercontent.com/GhassenEl/frontend-petfood/main/scripts/devops/vps-bootstrap.sh | bash -s -- /opt/petfoodtn

set -euo pipefail

DEPLOY_PATH="${1:-/opt/petfoodtn}"
REPO_URL="${REPO_URL:-https://github.com/GhassenEl/frontend-petfood.git}"

echo "🐾 PetfoodTN — bootstrap VPS → ${DEPLOY_PATH}"

if ! command -v docker >/dev/null 2>&1; then
  echo "📦 Installation Docker…"
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "${SUDO_USER:-$USER}" 2>/dev/null || true
fi

mkdir -p "${DEPLOY_PATH}"
if [ ! -d "${DEPLOY_PATH}/.git" ]; then
  git clone "${REPO_URL}" "${DEPLOY_PATH}"
else
  git -C "${DEPLOY_PATH}" pull --ff-only
fi

cd "${DEPLOY_PATH}"

if [ ! -f .env.docker ]; then
  cp .env.docker.example .env.docker
  echo "⚠️  Éditez ${DEPLOY_PATH}/.env.docker (JWT_SECRET, POSTGRES_PASSWORD, DOMAIN, CORS_ORIGINS)"
fi

echo ""
echo "✅ Bootstrap terminé."
echo "   1. Éditer .env.docker (DOMAIN, ACME_EMAIL, secrets)"
echo "   2. docker login ghcr.io"
echo "   3. Configurer secrets GitHub : VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_DEPLOY_PATH=${DEPLOY_PATH}"
echo "   4. Premier déploiement : npm run docker:https:up  (ou workflow Deploy VPS)"
