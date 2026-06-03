"""pytest : prévision XGBoost (exécuter depuis fastapi_service/)."""
import pytest

from app.ml.sales_xgboost import forecast_sales

HISTORY = [
    {"month": f"2025-{i:02d}", "label": f"{i:02d}/2025", "revenue": 4000 + i * 280, "orders": 10 + i}
    for i in range(1, 9)
]


def test_forecast_returns_xgboost_or_ridge():
    result = forecast_sales(HISTORY, horizon=3)
    assert result["model"] in ("xgboost", "ridge_sklearn")
    assert len(result["predictions"]) == 3
    assert result["summary"]["totalForecastRevenue"] > 0


def test_benchmark_has_winner():
    result = forecast_sales(HISTORY, horizon=2)
    selected = [b for b in result["modelBenchmark"] if b["selected"]]
    assert len(selected) == 1


def test_raises_if_too_few_points():
    with pytest.raises(ValueError, match="need_at_least"):
        forecast_sales(HISTORY[:3], horizon=2)
