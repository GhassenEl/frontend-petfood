# Backend — ESP32-CAM qualité croquettes

Le code backend vit dans [backend-petfood](https://github.com/GhassenEl/backend-petfood) (dossier `backend/` gitignored ici).

## Copier dans backend-petfood

| Fichier ici | Destination |
|-------------|-------------|
| `foodQualityAnalyze.js` | `backend/utils/foodQualityAnalyze.js` |
| `clientIotFoodQuality.routes.js` | `backend/routes/clientIotFoodQuality.routes.js` |

## Montage

```javascript
const clientIotFoodQuality = require('../routes/clientIotFoodQuality.routes');
app.use('/api/client/iot', clientIotFoodQuality);
```

Protégez `GET /food-quality` avec le middleware JWT client existant.

## Endpoints

- `POST /api/client/iot/food-quality/reading` — ESP32-CAM / `npm run simulate:esp32cam`
- `GET /api/client/iot/food-quality` — état + historique (app client)

## Test

```bash
npm run simulate:esp32cam
```
