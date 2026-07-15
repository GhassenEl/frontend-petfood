# SpendWise — Gestionnaire de dépenses

Application Flutter autonome pour suivre revenus et dépenses, visualiser des graphiques et exporter un PDF.

## Fonctionnalités

- Ajout de **revenus** et **dépenses** (catégories)
- Dashboard : solde, camembert par catégorie, barres revenus vs dépenses
- Liste filtrable (tous / revenus / dépenses) — long press pour supprimer
- **Export PDF** (rapport A4 via dialogue impression / sauvegarde)
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/spendwise_budget
flutter pub get
flutter run -d web-server --web-hostname=localhost --web-port=5549
```

Ouvrir http://localhost:5549

## Branche GitHub

`project-spendwise`
