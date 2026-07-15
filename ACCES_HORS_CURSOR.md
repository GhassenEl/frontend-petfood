# PetfoodTN — Accès sans Cursor

> Gardez ce fichier + `ACCES_PLATEFORME.html` sur votre PC ou clé USB.  
> Double-cliquez sur `ACCES_PLATEFORME.html` pour ouvrir tous les liens dans le navigateur.

---

## 1. Télécharger le code (si vous n’avez plus le dossier)

| Composant | Lien GitHub (clone) | Lien ZIP (téléchargement direct) |
|-----------|---------------------|----------------------------------|
| **Frontend** (React + Flutter + FastAPI dans le même repo) | `git clone -b mini-projects https://github.com/GhassenEl/frontend-petfood.git` | https://github.com/GhassenEl/frontend-petfood/archive/refs/heads/mini-projects.zip |
| **Backend** (Node.js — dossier `backend/`) | `git clone https://github.com/GhassenEl/backend-petfood.git backend` | https://github.com/GhassenEl/backend-petfood/archive/refs/heads/main.zip |

Après le ZIP backend : extraire et renommer le dossier en `backend` à la racine du frontend.

**Chemin actuel sur ce PC :**
```
C:\Users\GHASSEN\Desktop\GitHub (1)\GitHub\GitHub\frontend Lido
```

---

## 2. Liens locaux (une fois les serveurs démarrés)

| Service | URL | Port |
|---------|-----|------|
| **Web React** (frontend) | http://localhost:3001 | 3001 |
| **Démo jury** | http://localhost:3001/jury-demo | 3001 |
| **Landing marketing** | http://localhost:3001/ | 3001 |
| **Backend API** | http://localhost:5002/api | 5002 |
| **Santé backend** | http://localhost:5002/api/health | 5002 |
| **FastAPI ML** | http://localhost:8000 | 8000 |
| **Docs FastAPI (Swagger)** | http://localhost:8000/docs | 8000 |
| **Santé ML** | http://localhost:8000/health | 8000 |
| **Flutter Web** (si lancé) | http://localhost:8080 | 8080 |

---

## 3. Démarrage rapide Windows (sans Cursor)

### Option A — double-clic sur les scripts

Dans le dossier `scripts/windows/` :

| Script | Action |
|--------|--------|
| `1-DEMARRER-WEB.bat` | Frontend :3001 + Backend :5002 |
| `2-DEMARRER-ML.bat` | FastAPI ML :8000 |
| `3-DEMARRER-FLUTTER-WEB.bat` | App Flutter dans Chrome :8080 |
| `4-DEMARRER-TOUT.bat` | Web + Backend + ML ensemble |
| `5-OUVRIR-TOUS-LES-LIENS.bat` | Ouvre les URLs dans le navigateur |

### Option B — terminal (PowerShell ou CMD)

```bash
cd "C:\Users\GHASSEN\Desktop\GitHub (1)\GitHub\GitHub\frontend Lido"

# 1ère fois seulement
npm install
cd backend && npm install && cd ..
cd fastapi_service && python -m venv .venv && .venv\Scripts\pip install -r requirements.txt && cd ..
cd mobile_app && flutter pub get && cd ..

# Web + Backend
npm run dev

# ML (autre terminal)
npm run dev:ml

# Tout en un (web + backend + ML)
npm run dev:full

# Flutter Web (backend doit tourner sur :5002)
cd mobile_app
start.bat
```

---

## 4. App Flutter (mobile)

### Sur PC — version Web
```bash
cd mobile_app
flutter pub get
flutter run -d chrome --web-port=8080
```
→ http://localhost:8080

### APK Android (installer sur téléphone sans PC)
```bash
cd mobile_app
flutter build apk --release
```
APK généré :
```
mobile_app\build\app\outputs\flutter-apk\app-release.apk
```
Copiez ce fichier sur le téléphone et installez-le.  
URL API sur téléphone : `http://IP_DE_VOTRE_PC:5002` (même Wi-Fi).

---

## 5. FastAPI ML (port 8000)

```bash
cd fastapi_service
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Dans `backend/.env` :
```env
ML_SERVICE_URL=http://127.0.0.1:8000
ML_USE_XGBOOST=true
```

Test rapide :
```bash
curl http://localhost:8000/health
```

---

## 6. Comptes démo (connexion web)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@petfood.tn | PetfoodTN2024! |
| Client | client@petfood.tn | MonChat123! |
| Vendeur | vendor@petfood.tn | Vendor2024! |
| Modérateur | moderator@petfood.tn | Moderator2024! |
| Livreur | livreur@petfood.tn | Livreur123! |
| Vétérinaire | vet@petfood.tn | Vet2024! |

---

## 7. Vidéos démo jury (MP4)

Copiez ce dossier sur clé USB :

```
demo-videos\petfoodtn-marketing-demo-*.mp4   (~4 Mo)
demo-videos\petfoodtn-platform-demo-*.mp4    (~11 Mo)
```

Regénérer :
```bash
npm run demo:marketing:mp4
npm run demo:platform:mp4
```

---

## 8. Prérequis à installer (une seule fois)

| Outil | Téléchargement |
|-------|----------------|
| Node.js 20+ | https://nodejs.org |
| Python 3.11+ | https://www.python.org/downloads/ |
| Flutter SDK | https://flutter.dev/docs/get-started/install/windows |
| Git (optionnel) | https://git-scm.com/download/win |

---

## 9. Dépannage

| Problème | Solution |
|----------|----------|
| Port 3001 occupé | Fermer l’autre terminal ou `npx kill-port 3001` |
| Backend 5002 down | `cd backend && npm run dev` |
| ML 8000 down | `npm run dev:ml` ou vérifier `.venv` dans `fastapi_service` |
| Flutter « backend non détecté » | Démarrer le backend avant Flutter |
| Page blanche React | `npm install` puis `npm run dev` |

---

*PetfoodTN — guide accès hors Cursor — 2026*
