# PetfoodTN — Service ML Python (FastAPI + XGBoost)

Prévision du chiffre d'affaires avec **XGBoost** (comparaison automatique vs Ridge sklearn sur hold-out).

## Prérequis

- **Python 3.11+** ([python.org](https://www.python.org/downloads/)) — cochez « Add to PATH » à l’installation.
- Ou **Docker** : `docker build -t petfoodtn-ml . && docker run -p 8000:8000 petfoodtn-ml`

## Installation

```bash
cd fastapi_service
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

## Lancer

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Depuis la racine frontend :

```bash
npm run dev:ml
npm run dev:full   # Vite + backend + ML
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/ml/platform/insights` | **Suite complète** (CA, demande, churn, annulation, senior, fraude) |
| POST | `/ml/forecast/product-demand` | Demande par produit |
| POST | `/ml/classify/churn` | Probabilité de rachat client |
| POST | `/ml/classify/cancel-risk` | Commandes à risque d'annulation |
| POST | `/ml/rank/senior-dog` | Ranking produits chien senior |
| POST | `/ml/detect/anomalies` | Fraude + pics de commandes |
| POST | `/sales/forecast` | Prévision CA (body: `history`, `horizon`) |
| GET | `/health` | Santé du service |

Backend Node : `GET /api/ml/admin/insights` (admin JWT).

### Exemple

```bash
curl -X POST http://localhost:8000/sales/forecast \
  -H "Content-Type: application/json" \
  -d "{\"history\":[{\"month\":\"2025-01\",\"label\":\"01/2025\",\"revenue\":4200,\"orders\":12},{\"month\":\"2025-02\",\"label\":\"02/2025\",\"revenue\":4500,\"orders\":14},{\"month\":\"2025-03\",\"label\":\"03/2025\",\"revenue\":4800,\"orders\":15},{\"month\":\"2025-04\",\"label\":\"04/2025\",\"revenue\":5100,\"orders\":16},{\"month\":\"2025-05\",\"label\":\"05/2025\",\"revenue\":5400,\"orders\":17}],\"horizon\":3}"
```

## Intégration Node

Dans `backend/.env` :

```env
ML_SERVICE_URL=http://127.0.0.1:8000
ML_USE_XGBOOST=true
```

Le backend appelle Python en priorité ; si le service est arrêté, repli sur les modèles Node (`backend/ml/`).

## Features XGBoost

- Lags CA (1, 2, 3 mois)
- Moyenne mobile, écart-type, delta
- Saisonnalité (sin/cos mois)
- Volume commandes

Minimum **5** points mensuels pour entraîner.
