# GarageSmart — Smart Garage

Garage automobile connecté : véhicules, ordres de réparation, boxes IoT, alertes, QR fiche atelier.

## Fonctionnalités

- **Dashboard** — KPIs atelier, boxes, portes, CA
- **Véhicules** — réception, statut, assignment box
- **Atelier** — ordres (vidange, freins…), progression, techniciens
- **Alertes IoT** — portes ouvertes, pièces, livraisons
- **QR** — fiche ordre de réparation + scan simulé
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/garagesmart_auto
flutter pub get
flutter run -d web-server --web-hostname=localhost --web-port=5551
```

Ouvrir http://localhost:5551

## Branche GitHub

`project-garagesmart`
