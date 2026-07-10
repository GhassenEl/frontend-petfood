# NoteHub — Prise de notes

Application Flutter de notes avec **CRUD**, **recherche** et **stockage local SQLite**.

## Fonctionnalités

- Ajouter, modifier et supprimer des notes
- Recherche en temps réel (titre + contenu)
- Persistance locale via SQLite (`sqflite` / `sqflite_common_ffi_web` sur web)
- Thème noir & blanc clair/sombre

## Lancer

```bash
cd mini-projects/flutter/notehub_app
flutter pub get
# Web (une fois) : dart run sqflite_common_ffi_web:setup
flutter run -d web-server --web-hostname=localhost --web-port=5552
```

Ouvrir http://localhost:5552

## Branche GitHub

`project-notehub`
