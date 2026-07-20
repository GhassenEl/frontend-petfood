# PetfoodTN — Google Cloud Run

## Architecture

```
Utilisateur → Cloud Run (frontend nginx)
                ↓ HTTPS
              Cloud Run (API Express) → Cloud SQL PostgreSQL
                ↓
              Cloud Run (FastAPI ML)
```

Région par défaut : **europe-west9** (Paris).

## Prérequis

1. Compte [Google Cloud](https://console.cloud.google.com/) + **facturation** activée (Cloud Run free tier disponible)
2. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
3. [Docker Desktop](https://www.docker.com/products/docker-desktop/) démarré
4. Créer un projet : https://console.cloud.google.com/projectcreate

## Déploiement (1 commande)

```powershell
gcloud auth login
gcloud config set project VOTRE_PROJECT_ID
npm run devops:gcp:deploy
```

Ou :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/devops/gcp-deploy.ps1 -ProjectId VOTRE_PROJECT_ID
```

Le script crée :

| Ressource | Nom |
|-----------|-----|
| Artifact Registry | `petfoodtn` |
| Cloud SQL Postgres | `petfoodtn-db` |
| Cloud Run | `petfoodtn-web`, `petfoodtn-api`, `petfoodtn-ml` |
| Secrets | JWT + DATABASE_URL |

Les URLs sont écrites dans `.env.gcp`.

## Coûts approximatifs

- Cloud Run : gratuit jusqu’au free tier, puis pay-as-you-go
- Cloud SQL `db-f1-micro` : ~7–10 USD/mois (éligible free trial GCP)

## Health checks

```powershell
npm run devops:gcp:health
```
