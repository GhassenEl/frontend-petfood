# DentiHub — Cabinet dentaire

Application Flutter pour dentistes : patients SQLite, téléconsultation, notifications, historique, DentiBot IA et recommandations.

## Fonctionnalités

- **Patients** — dossiers SQLite (CRUD, recherche, allergies)
- **Consultations** — cabinet + **téléconsultation** vidéo simulée
- **Notifications** — RDV, allergies, suivis
- **Historique** — événements cabinet persistés
- **DentiBot IA** — patients, télémedecine, recommandations
- **Recommandations** — traitements suggérés selon dossiers
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/dentihub_cabinet
flutter pub get
# Web (une fois) : dart run sqflite_common_ffi_web:setup
flutter run -d web-server --web-hostname=localhost --web-port=5554
```

Ouvrir http://localhost:5554

## Branche GitHub

`project-dentihub`
