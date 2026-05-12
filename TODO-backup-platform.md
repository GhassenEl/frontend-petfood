# TODO-backup-platform

## 1) Étape : préparation de la sauvegarde
- [ ] Copier le dossier complet `frontend Lido` (avec `backend/` et `fastapi_service/`).
- [ ] Conserver aussi les fichiers lock : `package-lock.json` et `backend/package-lock.json`.
- [ ] Ne pas copier `node_modules/` (optionnel) pour alléger, sauf si nécessaire.

## 2) Étape : reconstruction sur une autre machine (sans modifications)
- [ ] Installer Node.js (version compatible avec npm du projet).
- [ ] Depuis la racine du front (celle contenant `package.json`) : `npm install`.
- [ ] Démarrer : `npm run dev` (lance Vite + backend via script).

## 3) Étape : vérification rapide
- [ ] Tester le backend : ouvrir `http://localhost:5001/health`.
- [ ] Tester le front : ouvrir `http://localhost:3000`.

## 4) Étape : configuration environnement (uniquement si nécessaire)
- [ ] Vérifier `backend/.env` : `JWT_SECRET` requis.
- [ ] Vérifier `backend/.env` : `MONGO_URI` ou `MONGODB_USER/MONGODB_PASSWORD/MONGODB_CLUSTER`.
- [ ] Relancer si besoin.

