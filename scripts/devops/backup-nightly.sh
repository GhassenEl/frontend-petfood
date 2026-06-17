#!/usr/bin/env bash
# Sauvegarde nocturne PetfoodTN — PostgreSQL, uploads, modèles IA, images ESP32-CAM
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/petfoodtn}"
BACKUP_ROOT="${BACKUP_ROOT:-${DEPLOY_PATH}/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="${BACKUP_ROOT}/${STAMP}"
COMPOSE="docker compose --env-file ${DEPLOY_PATH}/.env.docker"

mkdir -p "${DEST}"

echo "[$(date -Is)] Démarrage sauvegarde → ${DEST}"

# 1. PostgreSQL
if ${COMPOSE} ps db 2>/dev/null | grep -q Up; then
  source "${DEPLOY_PATH}/.env.docker" 2>/dev/null || true
  ${COMPOSE} exec -T db pg_dump -U "${POSTGRES_USER:-petfood}" "${POSTGRES_DB:-petfood}" \
    | gzip > "${DEST}/postgres.sql.gz"
  echo "  ✅ PostgreSQL"
else
  echo "  ⚠️  PostgreSQL — conteneur absent"
fi

# 2. Uploads backend (images produits, ESP32-CAM, etc.)
if docker volume inspect petfood_backend_uploads &>/dev/null; then
  docker run --rm -v petfood_backend_uploads:/data -v "${DEST}:/backup" alpine \
    tar czf /backup/backend-uploads.tar.gz -C /data .
  echo "  ✅ Uploads backend (ESP32-CAM / médias)"
fi

# 3. Modèles IA FastAPI
if docker volume inspect petfood_ml_models &>/dev/null 2>&1; then
  docker run --rm -v petfood_ml_models:/data -v "${DEST}:/backup" alpine \
    tar czf /backup/ml-models.tar.gz -C /data .
  echo "  ✅ Modèles IA"
else
  ML_PATH="${DEPLOY_PATH}/fastapi_service/models"
  if [ -d "${ML_PATH}" ]; then
    tar czf "${DEST}/ml-models.tar.gz" -C "${ML_PATH}" .
    echo "  ✅ Modèles IA (dossier local)"
  fi
fi

# 4. Rétention 14 jours
find "${BACKUP_ROOT}" -maxdepth 1 -type d -mtime +14 -exec rm -rf {} + 2>/dev/null || true

echo "[$(date -Is)] Sauvegarde terminée — ${DEST}"
ls -lah "${DEST}"
