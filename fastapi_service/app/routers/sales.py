from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.ml.sales_xgboost import forecast_sales
from app.schemas.sales import SalesForecastRequest, SalesForecastResponse

router = APIRouter(prefix="/sales", tags=["sales-ml"])


def _add_months(key: str, n: int) -> str:
    y, m = map(int, key.split("-")[:2])
    d = datetime(y, m, 1)
    month = d.month - 1 + n
    year = d.year + month // 12
    month = month % 12 + 1
    return f"{year}-{month:02d}"


def _month_label(key: str) -> str:
    y, m = key.split("-")[:2]
    return f"{m}/{y}"


@router.post("/forecast", response_model=SalesForecastResponse)
def sales_forecast(body: SalesForecastRequest):
    history = [h.model_dump() for h in body.history]
    try:
        result = forecast_sales(history, body.horizon)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"forecast_error: {e}") from e

    last_key = history[-1]["month"]
    forecast_rows = []
    for i, pred in enumerate(result["predictions"], start=1):
        period_key = _add_months(last_key, i)
        forecast_rows.append(
            {
                "month": period_key,
                "label": _month_label(period_key),
                "revenue": pred["revenue"],
                "revenueLow": pred["revenueLow"],
                "revenueHigh": pred["revenueHigh"],
                "orders": result.get("avgOrders", 0),
                "type": "forecast",
            }
        )

    hist_rows = [{**h, "type": "actual"} for h in history]

    return SalesForecastResponse(
        model=result["model"],
        modelLabel=result["modelLabel"],
        modelBenchmark=result["modelBenchmark"],
        modelSelection=result["modelSelection"],
        metrics=result["metrics"],
        history=hist_rows,
        forecast=forecast_rows,
        summary=result["summary"],
        pythonPowered=True,
    )


@router.get("/health")
def sales_ml_health():
    return {"service": "petfoodtn-ml", "xgboost": True}
