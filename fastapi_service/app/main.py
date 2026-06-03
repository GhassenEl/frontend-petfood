from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import legacy, platform, sales

app = FastAPI(
    title="PetfoodTN ML Service",
    description="XGBoost : CA, demande produit, churn, annulation, ranking senior, fraude",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sales.router)
app.include_router(platform.router)
app.include_router(legacy.router)


@app.get("/health")
def health():
    return {"status": "ok", "ml": "xgboost"}


@app.get("/")
def root():
    return {
        "service": "PetfoodTN FastAPI ML",
        "endpoints": [
            "POST /ml/platform/insights",
            "POST /sales/forecast",
            "POST /ml/rank/senior-dog",
            "POST /ml/detect/anomalies",
            "GET /health",
        ],
    }
