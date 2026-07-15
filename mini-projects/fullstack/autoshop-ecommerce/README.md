# AutoShop — E-commerce voitures & accessoires

Plateforme full-stack **MVC** pour la vente en ligne de voitures et d’accessoires, avec **IA avancée**.

## Stack

| Couche | Techno |
|--------|--------|
| Backend API | **NestJS** (Controllers / Services / Entities) |
| Base SQL | **SQLite** via TypeORM (`autoshop.sqlite`) |
| Frontend web | **Angular 18** |
| Mobile | **Flutter** |
| IA | Recommandations, estimation de prix, recherche sémantique, chat, accessoires compatibles |

```
Angular (:4200) ─┐
Flutter (:5580) ─┼─► NestJS API (:3300) ─► SQLite
                 ┘
```

## Architecture MVC (backend)

- **Model** : entités TypeORM (`Car`, `Accessory`, `User`, `Order`…)
- **View** : JSON REST consommé par Angular / Flutter
- **Controller** : `CarsController`, `AccessoriesController`, `OrdersController`, `AiController`

## Démarrer

### 1) Backend NestJS

```bash
cd backend
npm install
npm run start:dev
```

API : http://localhost:3300/api/v1/health

### 2) Frontend Angular

```bash
cd frontend
npm start
```

Web : http://localhost:4200

### 3) Mobile Flutter

```bash
cd mobile
flutter pub get
flutter run -d chrome
# ou: flutter run -d web-server --web-port=5580
```

## Endpoints utiles

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/api/v1/cars` | Catalogue voitures |
| GET | `/api/v1/accessories` | Accessoires |
| POST | `/api/v1/orders` | Commander |
| GET | `/api/v1/ai/recommendations` | Recommandations IA |
| GET | `/api/v1/ai/cars/:id/estimate` | Estimation de prix |
| GET | `/api/v1/ai/cars/:id/accessories` | Accessoires suggérés |
| GET | `/api/v1/ai/search?q=` | Recherche intelligente |
| POST | `/api/v1/ai/chat` | Assistant conversationnel |

## Données de démo

Au premier démarrage : 2 clients, 6 voitures (Peugeot, VW, BMW, Tesla…), 6 accessoires.

## Repo

https://github.com/GhassenEl/autoshop-ecommerce
