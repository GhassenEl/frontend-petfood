# Fonctionnalités avancées Administrateur — PetFoodTN / PetFoodIoT

> Hub unifié : `/admin/hub`

## Domaines

| Domaine | Route principale | Fonctionnalités |
|---------|------------------|-----------------|
| Utilisateurs | `/admin/users` | CRUD, rôles, suspension, validation vendeurs/vétos |
| Produits | `/admin/products` | CRUD, catégories, stock, validation ML |
| Commandes | `/admin/orders` | Paiements, remboursements, litiges, factures PDF |
| BI | `/admin/dashboard` | Ventes temps réel, CA, audience live |
| IA | `/admin/incidents-ml` | Validation alertes, prévisions, anomalies IoT |
| Qualité IoT | `/admin/food-quality-cam` | ESP32-CAM, scores, péremption, alertes |
| Livraisons | `/admin/delivery-ops` | GPS/ETA, délais, zones |
| Sécurité | `/admin/security` | Logs, JWT, sauvegardes, connexions suspectes |
| Rapports | `/admin/reports` | Export CSV/JSON, IoT, vet, satisfaction |

## Nouvelles pages

- `AdminAdvancedHubPage` — `/admin/hub`
- `AdminReportsPage` — `/admin/reports`
- `AdminFoodQualityCamPage` — `/admin/food-quality-cam`
- `AdminDeliveryOpsPage` — `/admin/delivery-ops`
- `AdminBackupsPage` — `/admin/backups`
- `AdminIoTAnomaliesPage` — `/admin/iot-anomalies`
- `AdminVetValidationPage` — `/admin/vet-validation`

## Services

- `src/config/adminHubCatalog.js` — catalogue 9 domaines
- `src/services/adminUserService.js` — validation vendeur/vétérinaire
- `src/services/adminReportsService.js` — exports rapports

## Validation vendeurs

Sur `/admin/vendors?status=pending` : boutons **Valider** / **Refuser** pour les comptes en attente.
