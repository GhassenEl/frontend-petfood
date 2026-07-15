# MaratHub — Marathon Athlètes

Application Flutter pour athlètes marathon : **coach IA**, **historique** des sorties et **notifications**.

## Fonctionnalités

- Tableau de bord : volume hebdo, série, objectif chrono
- Coach IA local : estimation marathon (formule de Riegel), charge, conseils, prochaine séance
- Historique : ajout / suppression de sorties (endurance, fractionné, sortie longue…)
- Notifications : rappels entraînement, hydratation, alertes IA (badge non lus)

## Lancer

```bash
cd marathub_app
flutter pub get
flutter run -d chrome
```

Ou :

```bash
flutter run -d web-server --web-hostname=localhost --web-port=5570
```

## Repo

https://github.com/GhassenEl/marathub-app
