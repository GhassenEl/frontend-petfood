# PetfoodTN — Déploiement Render (guide pas à pas)

Guide pour mettre **PetfoodTN** en production sur [Render](https://render.com) avec CD automatique depuis GitHub.

## Architecture Render

```
petfoodtn-web.onrender.com     → Frontend (static Vite)
petfoodtn-api.onrender.com     → Backend Express (repo backend-petfood)
petfoodtn-ml.onrender.com      → FastAPI ML (ce repo)
petfoodtn-db                   → PostgreSQL managé
```

---

## Étape 1 — Compte Render

1. Créer un compte sur [render.com](https://render.com) (GitHub login recommandé).
2. Lier le compte GitHub **GhassenEl**.

---

## Étape 2 — Blueprint frontend (ce repo)

1. Render Dashboard → **New** → **Blueprint**.
2. Sélectionner le repo **`GhassenEl/frontend-petfood`**.
3. Render lit `render.yaml` et crée :
   - `petfoodtn-db` (PostgreSQL)
   - `petfoodtn-web` (frontend statique)
   - `petfoodtn-ml` (Docker FastAPI)
4. Cliquer **Apply**.

⏳ Premier déploiement ~5–10 min.

---

## Étape 3 — Backend (repo séparé)

Le dossier `backend/` n’est **pas** dans le repo frontend. Créer l’API ainsi :

### Option A — Blueprint backend (recommandé)

1. Copier `docs/render-backend.yaml` → `render.yaml` dans le repo **backend-petfood**.
2. Commit + push sur `backend-petfood`.
3. Render → **New** → **Blueprint** → repo **`GhassenEl/backend-petfood`**.
4. Render crée **`petfoodtn-api`**.

> Si la base `petfoodtn-db` existe déjà : dans Render → `petfoodtn-api` → Environment → lier la **Internal Database URL** de la base existante (éviter deux bases).

### Option B — Service manuel

1. Render → **New** → **Web Service**.
2. Repo : `backend-petfood`, Runtime : **Docker**, Dockerfile : `./Dockerfile`.
3. Health check : `/health`, Port : `5002`.

---

## Étape 4 — Variables d’environnement

### `petfoodtn-api` (backend)

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Internal Database URL de `petfoodtn-db` |
| `JWT_SECRET` | Générer (48 caractères aléatoires) |
| `CORS_ORIGINS` | `https://petfoodtn-web.onrender.com` |
| `FASTAPI_URL` | `https://petfoodtn-ml.onrender.com` |
| `DEMO_MODE` | `true` (démo) ou `false` (prod) |
| `RUN_SEED` | `true` (1er déploiement) puis `false` |
| `PORT` | `5002` |

### `petfoodtn-web` (frontend)

| Variable | Valeur |
|----------|--------|
| `VITE_API_BASE` | `https://petfoodtn-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://petfoodtn-api.onrender.com` |
| `VITE_SENTRY_DSN` | (optionnel) DSN Sentry |
| `NODE_VERSION` | `20` |

Après modification de `VITE_*` → **Manual Deploy** sur `petfoodtn-web` (rebuild obligatoire).

### `petfoodtn-ml`

Aucune variable obligatoire (`TZ=Africa/Tunis` par défaut).

---

## Étape 5 — Deploy Hooks (CD GitHub)

Pour chaque service Render :

1. Service → **Settings** → **Deploy Hook** → copier l’URL.
2. GitHub → repo `frontend-petfood` → **Settings** → **Secrets and variables** → **Actions** :

| Secret GitHub | Service Render |
|---------------|----------------|
| `RENDER_DEPLOY_HOOK_FRONTEND` | `petfoodtn-web` |
| `RENDER_DEPLOY_HOOK_BACKEND` | `petfoodtn-api` (dans repo backend ou frontend selon où tu configures les secrets) |
| `RENDER_DEPLOY_HOOK_ML` | `petfoodtn-ml` |

3. Créer l’environnement **`production`** (Settings → Environments).

À chaque push sur `main` → **Publish GHCR** → **Deploy Render** déclenche les hooks.

---

## Étape 6 — Monitoring

### Uptime GitHub Actions

Secrets dans `frontend-petfood` :

| Secret | Valeur |
|--------|--------|
| `UPTIME_FRONTEND_URL` | `https://petfoodtn-web.onrender.com` |
| `UPTIME_BACKEND_URL` | `https://petfoodtn-api.onrender.com` |
| `UPTIME_ML_URL` | `https://petfoodtn-ml.onrender.com` |
| `ALERT_WEBHOOK_URL` | Webhook Slack/Discord (optionnel) |

### Sentry

1. Projet React sur [sentry.io](https://sentry.io).
2. Secret GitHub `VITE_SENTRY_DSN` (utilisé au build GHCR / Render rebuild).

### UptimeRobot (externe)

Monitors HTTP sur :
- `https://petfoodtn-web.onrender.com`
- `https://petfoodtn-api.onrender.com/health`
- `https://petfoodtn-ml.onrender.com/health`

---

## Étape 7 — Vérification

```bash
# URLs publiques
curl https://petfoodtn-api.onrender.com/health
curl https://petfoodtn-ml.onrender.com/health
# Ouvrir https://petfoodtn-web.onrender.com
```

Comptes démo (si `RUN_SEED=true`) :
- `admin@petfood.tn` / `PetfoodTN2024!`
- `client@petfood.tn` / `MonChat123!`

---

## Script d’aide local

```powershell
.\scripts\devops\setup-render.ps1
```

Génère les variables et liste les secrets GitHub à copier.

---

## Limites plan gratuit Render

| Limite | Impact |
|--------|--------|
| Spin-down après 15 min inactivité | Premier chargement lent (~30 s) |
| PostgreSQL free | 1 Go, expire après 90 jours (renouveler) |
| Pas de domaine custom gratuit | URL `*.onrender.com` (custom domain possible sur plan payant) |

Pour production sérieuse : passer les services en **Starter** ($7/mois/service).

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Frontend 404 sur `/admin/...` | Vérifier `routes` rewrite dans `render.yaml` |
| CORS error | `CORS_ORIGINS` doit inclure l’URL exacte du frontend |
| API 502 au réveil | Normal sur free tier — attendre 30–60 s |
| `VITE_API_BASE` ignoré | Rebuild manuel du service web après changement |
| Backend sans DB | Vérifier `DATABASE_URL` = Internal URL (pas External) |

Voir aussi [CD.md](./CD.md) et [DEVOPS.md](./DEVOPS.md).
