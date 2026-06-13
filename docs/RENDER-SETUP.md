# PetfoodTN — Déploiement Render (guide pas à pas)

Guide pour mettre **PetfoodTN** en production sur [Render](https://render.com) avec CD automatique depuis GitHub.

## Architecture Render (un seul Blueprint)

```
petfoodtn-web.onrender.com     → Frontend (static Vite, build depuis ce repo)
petfoodtn-api.onrender.com     → Backend Express (image GHCR)
petfoodtn-ml.onrender.com      → FastAPI ML (image GHCR)
petfoodtn-db                   → PostgreSQL managé
```

Tout est défini dans **`render.yaml`** à la racine de `frontend-petfood`. Plus besoin du repo `backend-petfood` sur Render.

---

## Étape 0 — Images GHCR (prérequis)

Le workflow **Publish Docker Images** pousse à chaque push sur `main` :

- `ghcr.io/ghassenel/petfoodtn-backend:latest`
- `ghcr.io/ghassenel/petfoodtn-ml:latest`

### Rendre les packages publics (recommandé)

1. GitHub → profil **GhassenEl** → **Packages**
2. Pour `petfoodtn-backend` et `petfoodtn-ml` : **Package settings** → **Change visibility** → **Public**

Sinon, avant d’appliquer le Blueprint :

1. Render → **Workspace Settings** → **Registry Credentials** → **Add**
2. Nom : `petfoodtn-ghcr`, Registry : `ghcr.io`, Username : `GhassenEl`, Password : PAT GitHub (`read:packages`)
3. Décommenter les blocs `creds` dans `render.yaml` pour `petfoodtn-api` et `petfoodtn-ml`

---

## Étape 1 — Compte Render

1. Créer un compte sur [render.com](https://render.com) (GitHub login recommandé).
2. Lier le compte GitHub **GhassenEl**.

---

## Étape 2 — Blueprint (stack complet)

1. [dashboard.render.com/blueprints/new](https://dashboard.render.com/blueprints/new)
2. Repo : **`GhassenEl/frontend-petfood`**
3. Blueprint path : `render.yaml` (défaut)
4. Cliquer **Apply**

Render crée en une fois :

| Ressource | Type |
|-----------|------|
| `petfoodtn-db` | PostgreSQL free |
| `petfoodtn-api` | Web (image GHCR backend) |
| `petfoodtn-ml` | Web (image GHCR ML) |
| `petfoodtn-web` | Static site (Vite) |

⏳ Premier déploiement ~5–10 min.

---

## Étape 3 — Variables (déjà dans render.yaml)

La plupart des variables sont préconfigurées. Vérifier après le premier deploy :

### `petfoodtn-api`

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Lié automatiquement à `petfoodtn-db` |
| `JWT_SECRET` | Généré automatiquement |
| `CORS_ORIGINS` | `https://petfoodtn-web.onrender.com` |
| `FASTAPI_URL` | `https://petfoodtn-ml.onrender.com` |
| `RUN_SEED` | `true` au 1er deploy, puis passer à `false` |

### `petfoodtn-web`

| Variable | Valeur |
|----------|--------|
| `VITE_API_BASE` | `https://petfoodtn-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://petfoodtn-api.onrender.com` |

Après modification de `VITE_*` → **Manual Deploy** sur `petfoodtn-web`.

---

## Étape 4 — Automatisation (scripts)

```powershell
# Aide interactive
npm run devops:render:setup

# Sans cle API : tester les URLs
node scripts/devops/render-provision.mjs health

# Avec RENDER_API_KEY (Account Settings -> API Keys)
node scripts/devops/render-provision.mjs validate
node scripts/devops/render-provision.mjs status
node scripts/devops/render-provision.mjs hooks
```

La commande `hooks` affiche les URLs à copier dans les secrets GitHub.

---

## Étape 5 — Deploy Hooks (CD GitHub)

Pour chaque service Render :

1. Service → **Settings** → **Deploy Hook** → copier l’URL.
2. GitHub → repo `frontend-petfood` → **Settings** → **Secrets and variables** → **Actions** :

| Secret GitHub | Service Render |
|---------------|----------------|
| `RENDER_DEPLOY_HOOK_FRONTEND` | `petfoodtn-web` |
| `RENDER_DEPLOY_HOOK_BACKEND` | `petfoodtn-api` |
| `RENDER_DEPLOY_HOOK_ML` | `petfoodtn-ml` |

3. Créer l’environnement **`production`** (Settings → Environments).

À chaque push sur `main` → **Publish GHCR** → **Deploy Render** déclenche les hooks.

---

## Étape 6 — Monitoring

### Uptime GitHub Actions

| Secret | Valeur |
|--------|--------|
| `UPTIME_FRONTEND_URL` | `https://petfoodtn-web.onrender.com` |
| `UPTIME_BACKEND_URL` | `https://petfoodtn-api.onrender.com` |
| `UPTIME_ML_URL` | `https://petfoodtn-ml.onrender.com` |
| `ALERT_WEBHOOK_URL` | Webhook Slack/Discord (optionnel) |

### Sentry

Secret GitHub `VITE_SENTRY_DSN` (utilisé au build GHCR / Render rebuild).

---

## Étape 7 — Vérification

```bash
curl https://petfoodtn-api.onrender.com/health
curl https://petfoodtn-ml.onrender.com/health
# Ouvrir https://petfoodtn-web.onrender.com
```

Comptes démo (si `RUN_SEED=true`) :
- `admin@petfood.tn` / `PetfoodTN2024!`
- `client@petfood.tn` / `MonChat123!`

---

## Limites plan gratuit Render

| Limite | Impact |
|--------|--------|
| Spin-down après 15 min inactivité | Premier chargement lent (~30 s) |
| PostgreSQL free | 1 Go, expire après 90 jours |
| URL `*.onrender.com` | Domaine custom sur plan payant |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Image pull failed (GHCR) | Packages publics ou credential `petfoodtn-ghcr` |
| Frontend 404 sur routes | Vérifier `routes` rewrite dans `render.yaml` |
| CORS error | `CORS_ORIGINS` = URL exacte du frontend |
| API 502 au réveil | Normal free tier — attendre 30–60 s |
| `VITE_API_BASE` ignoré | Manual Deploy sur `petfoodtn-web` |

Voir aussi [CD.md](./CD.md) et [DEVOPS.md](./DEVOPS.md).
