from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth_jwt import require_jwt
from app.routers import legacy, platform, recommendations, sales

app = FastAPI(
    title="PetfoodTN ML Service",
    description="XGBoost : CA, demande produit, churn, annulation, ranking senior, fraude",
    version="2.0.0",
)

JWT_PROTECTED = [Depends(require_jwt)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales.router, dependencies=JWT_PROTECTED)
app.include_router(platform.router, dependencies=JWT_PROTECTED)
app.include_router(recommendations.router, dependencies=JWT_PROTECTED)
app.include_router(legacy.router, dependencies=JWT_PROTECTED)


@app.get("/health")
def health():
    return {"status": "ok", "ml": "xgboost"}


@app.get("/")
def root():
    return {
        "service": "PetfoodTN FastAPI ML",
        "endpoints": [
            "POST /recommendations/hybrid",
            "POST /recommendations/admin/client-profile",
            "POST /recommendations/explain-sales",
            "POST /ml/platform/insights",
            "POST /sales/forecast",
            "POST /ml/rank/senior-dog",
            "POST /ml/detect/anomalies",
            "GET /health",
        ],
    }
