# ParkSmart — Smart Parking

Application Flutter autonome pour un parking intelligent.

## Fonctionnalités

- **Carte** des places (zones A/B/C, niveaux P1/P2)
- **Détection** des places libres (scan IoT simulé)
- **Réservation** d'une place (durée, immatriculation)
- **Paiement** (carte / espèces / mobile)
- **QR Code** d'accès + scan entrée simulé
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/parksmart_parking
flutter pub get
flutter run -d web-server --web-hostname=localhost --web-port=5550
```

Ouvrir http://localhost:5550

## Branche GitHub

`project-parksmart`
