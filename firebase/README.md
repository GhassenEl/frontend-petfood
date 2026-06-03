# Firebase — Distributeur IoT (grandeurs)

Les relevés capteurs de la section client **Distributeur IoT** sont dupliqués dans **Cloud Firestore** lorsque le backend est configuré.

## Structure Firestore

```
feeder_readings/{feederId}
  ├── latest (champ)     → dernier relevé
  ├── ownerId
  ├── updatedAt
  └── history/{autoId}   → historique des grandeurs
```

Chaque document `history` contient :

| Champ | Description |
|-------|-------------|
| `grandeurs.temperature_c` | Température °C |
| `grandeurs.humidity_pct` | Humidité % |
| `grandeurs.food_grams` | Balance (g) |
| `grandeurs.reservoir_cm` | Ultrason réservoir (cm) |
| `grandeurs.animal_present` | Présence animal |
| `grandeurs.low_food` | Alerte stock bas |
| `grandeurs.portion_grams` | Portion distribuée |
| `recordedAt` | Horodatage ISO |

## Configuration backend (`frontend Lido/backend/.env`)

```env
FIREBASE_PROJECT_ID=votre-projet
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xx@votre-projet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

1. Console Firebase → Paramètres du projet → Comptes de service → Générer une clé privée.
2. Copier `project_id`, `client_email`, `private_key` dans `.env`.
3. Activer **Firestore** en mode production ou test.
4. Redémarrer le backend (`npm run dev` dans `backend`).

Sans ces variables, l'app continue avec SQLite/Prisma uniquement (aucune erreur).

## API client

- `GET /api/feeder/firebase/status` — Firebase actif ou non
- `GET /api/feeder/:id/firebase/latest` — dernières grandeurs
- `GET /api/feeder/:id/firebase/history` — historique Firestore

## Règles de sécurité (exemple)

Voir `firestore.rules`. Les écritures passent par le **Admin SDK** (backend). Les lectures client passent par l'API JWT PetfoodTN.

## Déploiement des règles

```bash
firebase deploy --only firestore:rules
```
