#!/usr/bin/env bash
# Déploiement PetfoodTN sur serveur web Linux (Docker + Caddy HTTPS)
#
# Usage (sur le VPS, root ou sudo) :
#   curl -fsSL https://raw.githubusercontent.com/GhassenEl/frontend-petfood/main/scripts/devops/deploy-web-server.sh | bash
#
# Ou après clone local :
#   sudo bash scripts/devops/deploy-web-server.sh /opt/petfoodtn
#
# Variables optionnelles :
#   DEPLOY_MODE=build|pull   build = compile sur le serveur (défaut)
#                            pull  = images GHCR (après CI)
#   REPO_URL, BACKEND_REPO, DOMAIN, ACME_EMAIL

set -euo pipefail

DEPLOY_PATH="${1:-/opt/petfoodtn}"
DEPLOY_MODE="${DEPLOY_MODE:-build}"
REPO_URL="${REPO_URL:-https://github.com/GhassenEl/frontend-petfood.git}"
BACKEND_REPO="${BACKEND_REPO:-https://github.com/GhassenEl/backend-petfood.git}"

COMPOSE_FILES=(
  -f docker-compose.yml
  -f docker-compose.ml.yml
  -f docker-compose.prod.yml
  -f docker-compose.caddy.yml
)

if [ "${DEPLOY_MODE}" = "pull" ]; then
  COMPOSE_FILES+=(-f docker-compose.ghcr.yml)
fi

echo "🐾 PetfoodTN — déploiement serveur web"
echo "   Chemin : ${DEPLOY_PATH}"
echo "   Mode   : ${DEPLOY_MODE}"

if ! command -v docker >/dev/null 2>&1; then
  echo "📦 Installation Docker…"
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "${SUDO_USER:-$USER}" 2>/dev/null || true
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "❌ docker compose plugin requis."
  exit 1
fi

mkdir -p "${DEPLOY_PATH}"

if [ ! -d "${DEPLOY_PATH}/.git" ]; then
  git clone "${REPO_URL}" "${DEPLOY_PATH}"
else
  git -C "${DEPLOY_PATH}" pull --ff-only
fi

if [ ! -d "${DEPLOY_PATH}/backend/.git" ]; then
  git clone "${BACKEND_REPO}" "${DEPLOY_PATH}/backend"
else
  git -C "${DEPLOY_PATH}/backend" pull --ff-only
fi

cd "${DEPLOY_PATH}"

if [ ! -f .env.docker ]; then
  cp .env.docker.example .env.docker
  echo ""
  echo "⚠️  Fichier .env.docker créé — configurez-le avant de continuer :"
  echo "   nano ${DEPLOY_PATH}/.env.docker"
  echo ""
  echo "   Obligatoire :"
  echo "     DOMAIN=app.votre-domaine.tn"
  echo "     ACME_EMAIL=admin@votre-domaine.tn"
  echo "     JWT_SECRET=<48 caractères aléatoires>"
  echo "     POSTGRES_PASSWORD=<mot de passe fort>"
  echo "     CORS_ORIGINS=https://app.votre-domaine.tn"
  echo ""
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.docker
set +a

if [ -z "${DOMAIN:-}" ] || [ "${DOMAIN}" = "app.petfoodtn.tn" ]; then
  echo "⚠️  DOMAIN dans .env.docker doit pointer vers votre nom de domaine réel."
fi

if [ "${DEPLOY_MODE}" = "pull" ]; then
  if ! docker login ghcr.io 2>/dev/null; then
    echo "Connexion GHCR requise (images privées) :"
    echo "  echo <PAT> | docker login ghcr.io -u <github-user> --password-stdin"
    exit 1
  fi
  docker compose "${COMPOSE_FILES[@]}" --env-file .env.docker pull
  docker compose "${COMPOSE_FILES[@]}" --env-file .env.docker up -d --remove-orphans
else
  docker compose "${COMPOSE_FILES[@]}" --env-file .env.docker up -d --build --remove-orphans
fi

echo ""
echo "⏳ Attente santé des services…"
sleep 12

if curl -fsS "http://127.0.0.1/nginx-health" >/dev/null 2>&1; then
  echo "✅ Frontend nginx OK"
elif curl -fsS "https://${DOMAIN}/nginx-health" >/dev/null 2>&1; then
  echo "✅ HTTPS OK — https://${DOMAIN}"
else
  echo "⚠️  Santé non confirmée — vérifiez : docker compose logs -f"
fi

echo ""
echo "✅ Déploiement terminé"
echo "   Site    : https://${DOMAIN:-localhost}"
echo "   API     : https://${DOMAIN:-localhost}/api/health"
echo "   Logs    : cd ${DEPLOY_PATH} && docker compose ${COMPOSE_FILES[*]} --env-file .env.docker logs -f"
echo "   Arrêt   : docker compose ${COMPOSE_FILES[*]} --env-file .env.docker down"
