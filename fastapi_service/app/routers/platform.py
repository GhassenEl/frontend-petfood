from fastapi import APIRouter, HTTPException

from app.ml.intelligence_suite import run_intelligence_suite
from app.ml.platform_engine import (
    detect_anomalies,
    rank_products_senior_dog,
    run_platform_insights,
    _build_revenue_history,
    _cancel_risk_orders,
    _churn_predictions,
    _product_demand_forecast,
)
from app.ml.sales_xgboost import forecast_sales
from app.schemas.platform import (
    OrderRiskRequest,
    PetRankRequest,
    PlatformSnapshot,
)

router = APIRouter(prefix="/ml", tags=["platform-ml"])


def _snap_dict(body: PlatformSnapshot) -> dict:
    return body.model_dump()


@router.post("/platform/insights")
def platform_insights(body: PlatformSnapshot):
    """Suite complète : CA, demande produit, churn, annulation, ranking senior, anomalies."""
    try:
        return run_platform_insights(_snap_dict(body))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/forecast/revenue-next-month")
def revenue_next_month(body: PlatformSnapshot):
    snap = _snap_dict(body)
    history = snap.get("revenue_history") or _build_revenue_history(snap.get("orders", []))
    if len(history) < 5:
        raise HTTPException(status_code=422, detail="need_at_least_5_months")
    return forecast_sales(history, 1)


@router.post("/forecast/product-demand")
def product_demand(body: PlatformSnapshot):
    snap = _snap_dict(body)
    return {
        "items": _product_demand_forecast(
            snap.get("orders", []), snap.get("products", []), 15
        )
    }


@router.post("/classify/churn")
def churn(body: PlatformSnapshot):
    snap = _snap_dict(body)
    return {"predictions": _churn_predictions(snap.get("orders", []), snap.get("users", []))}


@router.post("/classify/cancel-risk")
def cancel_risk(body: PlatformSnapshot):
    snap = _snap_dict(body)
    return {"orders": _cancel_risk_orders(snap.get("orders", []))}


@router.post("/classify/order-cancel-risk")
def single_order_cancel_risk(body: OrderRiskRequest):
    orders = [body.order.model_dump()] + [o.model_dump() for o in body.user_order_history]
    risks = _cancel_risk_orders(orders)
    match = next((r for r in risks if r["orderId"] == body.order.id), None)
    if not match and risks:
        match = risks[0]
    return match or {"orderId": body.order.id, "cancelRisk": 0.25, "highRisk": False, "model": "heuristic"}


@router.post("/rank/senior-dog")
def senior_dog_rank(body: PetRankRequest):
    pet = body.pet.model_dump()
    products = [p.model_dump() for p in body.products]
    orders = [o.model_dump() for o in body.orders]
    return {
        "pet": pet,
        "ranking": rank_products_senior_dog(pet, products, orders, body.limit),
    }


@router.post("/detect/anomalies")
def anomalies(body: PlatformSnapshot):
    snap = _snap_dict(body)
    return detect_anomalies(snap.get("orders", []))


@router.post("/intelligence/suite")
def intelligence_suite(body: PlatformSnapshot):
    """10 piliers Intelligence PetfoodTN — ventes, stocks ML, reco, sentiment, IoT, vision, fraude, twin."""
    try:
        return run_intelligence_suite(_snap_dict(body))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
