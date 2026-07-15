# SalatTime — Horaires de prière

Application Flutter pour consulter les **temps de prières** du jour, avec compte à rebours vers la prochaine prière.

## Fonctionnalités

- Horaires Fajr, Chourouk, Dhuhr, Asr, Maghrib, Isha
- Compte à rebours en direct vers la prochaine prière
- Choix de ville (Tunisie, France, Maghreb, La Mecque…)
- Dates grégorienne et hijri
- Actualisation par pull-to-refresh
- API [Aladhan](https://aladhan.com/prayer-times-api) (méthode Muslim World League)

## Lancer

```bash
cd salattime_app
flutter pub get
flutter run -d chrome
```

Ou en web-server :

```bash
flutter run -d web-server --web-hostname=localhost --web-port=5560
```

Ouvrir http://localhost:5560

## Repo GitHub

https://github.com/GhassenEl/salattime-app
