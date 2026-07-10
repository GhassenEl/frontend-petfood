# StreamAI — Netflix + IA

Plateforme streaming dynamique avec assistant IA intégré (recommandations locales intelligentes).

## Fonctionnalités

- **Accueil** : KPIs, carrousel de recommandations IA, tendances
- **Catalogue** : films & séries, notation (appui long), ajout à la liste
- **Ma liste** : watchlist personnalisée
- **IA Assistant** : chat StreamAI — humeur, genre, analyse de la watchlist, playlist auto
- **Synopsis IA** : résumés générés par genre pour chaque titre
- Thème noir & blanc · bouton **+** (catalogue / playlist IA)

## Lancer

```bash
flutter pub get
flutter run -d web-server --web-port=5533
```

Ouvrir http://localhost:5533

## IA (simulation locale)

L'assistant analyse vos préférences, votre watchlist et vos mots-clés (action, comédie, détente…) pour proposer des titres sans API externe.
