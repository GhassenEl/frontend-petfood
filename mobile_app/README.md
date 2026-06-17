# PetfoodTN Mobile (Flutter)

Application mobile pour contrôler le **distributeur IoT**, surveiller la **qualité alimentaire ESP32-CAM** et consulter les **produits recommandés** pour vos animaux.

## Fonctionnalités

- Connexion au backend PetfoodTN (JWT)
- **Qualité alimentaire IoT** (ESP32-CAM) : score temps réel, alertes, notifications, journal, OLED simulé
- **Distributeur IoT** : statut capteurs, distribution manuelle, plan nutritionnel, planning, journal
- **Produits** : catalogue + recommandations par animal
- **Profil** : déconnexion, URL API configurable

## Prérequis

- [Flutter SDK](https://flutter.dev) 3.11+
- Backend PetfoodTN sur le port **5002** (`cd backend && node server.js`)

## Installation

```bash
cd mobile_app
flutter pub get
flutter run
```

## URL API selon l'appareil

| Environnement | URL |
|---------------|-----|
| Émulateur Android | `http://10.0.2.2:5002` |
| Simulateur iOS | `http://localhost:5002` |
| Téléphone réel (même Wi-Fi) | `http://IP_DU_PC:5002` (ex. `http://192.168.1.100:5002`) |

L'URL est modifiable sur l'écran de connexion.

## Compte démo

| Champ | Valeur |
|-------|--------|
| Email | `client@petfood.tn` |
| Mot de passe | `MonChat123!` |

Distributeur démo : clé `pf_demo_client_feeder_2024`

## Lier l'ESP32

1. Créer ou utiliser un distributeur dans l'app (onglet Distributeur)
2. Copier la **clé appareil** (bouton copier)
3. Coller dans `firmware/esp32/PetFeederESP32/config.h` → `DEVICE_KEY`
4. Flasher l'ESP32 — statut **En ligne** dans l'app

## Build release

```bash
flutter build apk --release
# APK : build/app/outputs/flutter-apk/app-release.apk
```

## Structure

```
lib/
  config/api_config.dart
  models/models.dart, food_quality.dart
  services/api_client.dart, auth_service.dart, repositories.dart
  services/food_quality_engine.dart, food_quality_repository.dart
  screens/login_screen.dart, home_shell.dart, food_quality_screen.dart
  screens/feeder_screen.dart, products_screen.dart, profile_screen.dart
  main.dart
```
