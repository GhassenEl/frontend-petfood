#!/usr/bin/env bash
# PetfoodTN — déploiement Google Cloud Run depuis Cloud Shell
# Usage dans Cloud Shell :
#   bash <(curl -fsSL https://raw.githubusercontent.com/GhassenEl/frontend-petfood/mini-projects/scripts/devops/gcp-cloudshell.sh)
# ou clone le repo puis :
#   bash scripts/devops/gcp-cloudshell.sh

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-petfoodtn2026}"
REGION="${GCP_REGION:-europe-west9}"
REPO="petfoodtn"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> Projet $PROJECT_ID ($REGION)"
gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com compute.googleapis.com

# Artifact Registry
if ! gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION" --description="PetfoodTN"
fi

JWT_SECRET="$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-40)"
DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
SQL_INSTANCE="petfoodtn-db"
DB_NAME="petfood"
DB_USER="petfood"

if ! gcloud sql instances describe "$SQL_INSTANCE" >/dev/null 2>&1; then
  echo "==> Création Cloud SQL (quelques minutes)…"
  gcloud sql instances create "$SQL_INSTANCE" \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --region="$REGION" \
    --storage-size=10GB \
    --root-password="$DB_PASS" \
    --quiet
  gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE"
  gcloud sql users create "$DB_USER" --instance="$SQL_INSTANCE" --password="$DB_PASS"
fi

CONN="$PROJECT_ID:$REGION:$SQL_INSTANCE"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}?host=/cloudsql/${CONN}"

echo -n "$JWT_SECRET" | gcloud secrets create petfoodtn-jwt-secret --data-file=- 2>/dev/null \
  || echo -n "$JWT_SECRET" | gcloud secrets versions add petfoodtn-jwt-secret --data-file=-
echo -n "$DATABASE_URL" | gcloud secrets create petfoodtn-database-url --data-file=- 2>/dev/null \
  || echo -n "$DATABASE_URL" | gcloud secrets versions add petfoodtn-database-url --data-file=-

echo "==> Build & deploy ML (Cloud Build)"
gcloud run deploy petfoodtn-ml \
  --source="$ROOT/fastapi_service" \
  --region="$REGION" \
  --allow-unauthenticated \
  --port=8000 \
  --memory=1Gi \
  --set-env-vars="TZ=Africa/Tunis" \
  --quiet

ML_URL="$(gcloud run services describe petfoodtn-ml --region="$REGION" --format='value(status.url)')"

echo "==> Build & deploy API"
gcloud run deploy petfoodtn-api \
  --source="$ROOT/backend" \
  --region="$REGION" \
  --allow-unauthenticated \
  --port=5002 \
  --memory=1Gi \
  --add-cloudsql-instances="$CONN" \
  --set-env-vars="NODE_ENV=production,DEMO_MODE=false,ALLOW_DEMO_LOGIN=false,RUN_SEED=true,PORT=5002,FASTAPI_URL=${ML_URL},CORS_ORIGINS=*,STRIPE_MOCK=1" \
  --set-secrets="JWT_SECRET=petfoodtn-jwt-secret:latest,DATABASE_URL=petfoodtn-database-url:latest" \
  --quiet

API_URL="$(gcloud run services describe petfoodtn-api --region="$REGION" --format='value(status.url)')"

echo "==> Build & deploy Frontend"
# Cloud Build avec Dockerfile.frontend.cloudrun + build-args
cat > /tmp/cloudbuild-fe.yaml <<EOF
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - Dockerfile.frontend.cloudrun
      - --build-arg
      - VITE_API_BASE=${API_URL}/api
      - --build-arg
      - VITE_SOCKET_URL=${API_URL}
      - --build-arg
      - VITE_STRICT_LIVE=true
      - -t
      - ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest
      - .
images:
  - ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest
EOF

gcloud builds submit "$ROOT" --config=/tmp/cloudbuild-fe.yaml --quiet
gcloud run deploy petfoodtn-web \
  --image="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/frontend:latest" \
  --region="$REGION" \
  --allow-unauthenticated \
  --port=8080 \
  --memory=256Mi \
  --quiet

WEB_URL="$(gcloud run services describe petfoodtn-web --region="$REGION" --format='value(status.url)')"
gcloud run services update petfoodtn-api \
  --region="$REGION" \
  --update-env-vars="CORS_ORIGINS=${WEB_URL},FRONTEND_URL=${WEB_URL}" \
  --quiet

echo ""
echo "========================================"
echo "  Frontend : $WEB_URL"
echo "  API      : $API_URL"
echo "  ML       : $ML_URL"
echo "========================================"
