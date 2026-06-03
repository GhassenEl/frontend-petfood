# Power BI — PetfoodTN

## Intégration dans l’admin

1. Publiez votre rapport `.pbix` sur [Power BI Service](https://app.powerbi.com).
2. Obtenez l’URL d’intégration (Embed / « Publier sur le web » en test uniquement).
3. Configurez :
   - **Backend** `frontend Lido/backend/.env` :
     ```
     POWER_BI_EMBED_URL=https://app.powerbi.com/view?r=...
     POWER_BI_REPORT_ID=optional-guid
     POWER_BI_WORKSPACE=PetfoodTN
     ```
   - **Frontend** (optionnel) `frontend Lido/.env` :
     ```
     VITE_POWER_BI_EMBED_URL=https://app.powerbi.com/view?r=...
     ```
4. Ouvrez **Admin → Power BI** (`/admin/powerbi`).

## Actualiser les données

### Exports CSV (recommandé pour débuter)

Avec un compte **admin** connecté :

| Dataset | URL |
|---------|-----|
| Commandes | `GET /api/analytics/export/orders?format=csv` |
| Réclamations | `GET /api/analytics/export/complaints?format=csv` |
| Services (toilettage, etc.) | `GET /api/analytics/export/service_bookings?format=csv` |
| Notes services + émotions | `GET /api/analytics/export/service_ratings?format=csv` |

Power BI Desktop → **Obtenir des données** → **Web** → URL + en-tête `Authorization: Bearer <token>`.

### Mesures suggérées (DAX)

- CA total, commandes en attente
- Réclamations par statut / priorité IA
- Alertes stock pharmacie (lien données vétérinaires)
- Émotions par type de service (`emotion` dans `service_ratings`)

## Alertes dans l’app

Le hub `/admin/powerbi` agrège :

- Incidents IA **urgent / high** (validation admin)
- **Stock pharmacie** sous seuil
- File réclamations et anomalies ML

## Production

Pour Power BI Embedded (Azure) : App registration, capacité Embedded, `embed token` côté backend — non implémenté dans cette version ; l’iframe URL publique ou sécurisée suffit pour un MVP.
