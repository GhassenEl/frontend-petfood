# Démo PFE PetfoodTN — Plateforme · Flutter · Vidéo commerciale

Vidéos pour la soutenance (`demo-videos/`) + page jury interactive.

## Page jury (recommandé)

Ouvrir **http://localhost:3001/jury-demo** → onglet **Vidéos combinées**.

1. **Lancer la trilogie** — enchaîne automatiquement les 3 MP4  
2. Après chaque chapitre → boutons **démo live** (landing, admin marketing, boutique, Flutter…)  
3. Puis onglet **Parcours live** pour les 7 acteurs

```powershell
npm run dev
# navigateur → http://localhost:3001/jury-demo
```

## Fichiers vidéo

| Ordre | Fichier | Contenu |
|-------|---------|---------|
| 1 | **PFE-1-video-commerciale.mp4** | Marketing digital, landing, admin & vendeur |
| 2 | **PFE-2-plateforme.mp4** | 7 acteurs, IA, IoT, chatbot, parcours jury |
| 3 | **PFE-3-flutter.mp4** | App mobile Flutter (BI, Qualité, IoT, Sécurité…) |

Servies aussi via `public/demo-videos/` (hard-links) pour le lecteur web.

## Régénérer les vidéos

```powershell
npm run dev
# autre terminal :
cd mobile_app\build\web ; python -m http.server 8080

npm run demo:videos:mp4
```

## Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@petfood.tn | PetfoodTN2024! |
| Client | client@petfood.tn | MonChat123! |
| Vendor | vendor@petfood.tn | Vendor2024! |
| Vet | vet@petfood.tn | Vet2024! |
| Livreur | livreur@petfood.tn | Livreur123! |
| Moderator | moderator@petfood.tn | Moderator2024! |
