from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth_jwt import require_jwt

app = FastAPI(
    title="PetfoodTN ML Service",
    description="XGBoost + IsolationForest : CA, demande, churn, comportements pets, ranking",
    version="2.1.0",
)

JWT_PROTECTED = [Depends(require_jwt)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_loaded_routers = []

def _include(name: str, import_path: str, attr: str = "router"):
    try:
        mod = __import__(import_path, fromlist=[attr])
        app.include_router(getattr(mod, attr), dependencies=JWT_PROTECTED)
        _loaded_routers.append(name)
    except Exception as exc:  # noqa: BLE001 — keep /health up even if one router fails
        print(f"⚠️ Router {name} non chargé: {exc}")


_include("sales", "app.routers.sales")
_include("platform", "app.routers.platform")
_include("recommendations", "app.routers.recommendations")
_include("legacy", "app.routers.legacy")
_include("behavior", "app.routers.behavior")
_include("vet", "app.routers.vet")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ml": "xgboost",
        "service": "petfoodtn-ml",
        "routers": _loaded_routers,
    }


@app.get("/")
def root():
    return JSONResponse(
        {
            "service": "PetfoodTN FastAPI ML",
            "status": "online",
            "docs": "/docs",
            "health": "/health",
            "routers": _loaded_routers,
            "endpoints": [
                "GET /health",
                "GET /docs",
                "POST /recommendations/hybrid",
                "POST /ml/platform/insights",
                "POST /sales/forecast",
                "POST /ml/behavior/anomalies",
                "POST /ml/vet/animal-detect",
                "POST /ml/vet/animal-detect-image",
                "POST /ml/vet/prescription-score",
            ],
        }
    )


@app.exception_handler(404)
async def not_found_handler(request, exc):  # noqa: ARG001
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "path": str(getattr(request, "url", "")),
            "hint": "Utilisez GET /health ou GET /docs",
        },
    )
