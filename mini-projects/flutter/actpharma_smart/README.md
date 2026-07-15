# ActPharma — Pharmacie intelligente

Mini-projet Flutter lié à **Act Pharma** : gestion de pharmacie avec IoT, stock et QR.

## Fonctionnalités

- **Dashboard** — KPIs alertes, stock bas, ruptures, temp./humidité moyennes, chaîne du froid
- **Température & humidité** — zones (A/B + frigos), scan IoT simulé, seuils par médicament
- **Alertes** — température, humidité, stock, QR ; lire / résoudre
- **Gestion du stock** — +/- , filtres bas/rupture/froid, ajout médicament
- **QR Code** — génération (`qr_flutter`), payload Act Pharma, copie & scan simulé
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/actpharma_smart
flutter pub get
flutter run -d web-server --web-hostname=localhost --web-port=5547
```

Ouvrir http://localhost:5547

## Branche GitHub

`project-actpharma`
