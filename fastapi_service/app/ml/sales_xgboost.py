"""
Prévision CA mensuel avec XGBoost + benchmark vs régression sklearn.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

MIN_POINTS = 5
LAGS = (1, 2, 3)


def _mape(y_true: np.ndarray, y_pred: np.ndarray) -> float | None:
    mask = y_true > 0
    if not mask.any():
        return None
    return float(
        np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
    )


def _rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(math.sqrt(mean_squared_error(y_true, y_pred)))


def _build_feature_frame(revenues: list[float], orders: list[float]) -> pd.DataFrame:
    n = len(revenues)
    rows = []
    for i in range(n):
        feats = {
            "idx": i,
            "revenue": revenues[i],
            "orders": orders[i] if i < len(orders) else 0.0,
            "month_mod": i % 12,
            "sin_m": math.sin(2 * math.pi * (i % 12) / 12),
            "cos_m": math.cos(2 * math.pi * (i % 12) / 12),
        }
        for lag in LAGS:
            feats[f"lag_{lag}"] = revenues[i - lag] if i >= lag else revenues[0]
        window = revenues[max(0, i - 2) : i + 1]
        feats["roll_mean_3"] = float(np.mean(window))
        feats["roll_std_3"] = float(np.std(window)) if len(window) > 1 else 0.0
        if i > 0:
            feats["delta_1"] = revenues[i] - revenues[i - 1]
        else:
            feats["delta_1"] = 0.0
        rows.append(feats)
    return pd.DataFrame(rows)


FEATURE_COLS = [
    "idx",
    "orders",
    "month_mod",
    "sin_m",
    "cos_m",
    "lag_1",
    "lag_2",
    "lag_3",
    "roll_mean_3",
    "roll_std_3",
    "delta_1",
]


@dataclass
class EvalResult:
    model_id: str
    label: str
    mape: float | None
    rmse: float
    r2: float


def _holdout_size(n: int) -> int:
    if n < 4:
        return 1
    return min(3, max(1, n // 4))


def _eval_model(
    model_id: str,
    label: str,
    y_train: np.ndarray,
    X_train: np.ndarray,
    y_val: np.ndarray,
    X_val: np.ndarray,
    predictor,
) -> EvalResult:
    predictor.fit(X_train, y_train)
    pred = np.maximum(0, predictor.predict(X_val))
    r2 = float(r2_score(y_val, pred)) if len(y_val) > 1 else 1.0
    return EvalResult(
        model_id=model_id,
        label=label,
        mape=_mape(y_val, pred),
        rmse=_rmse(y_val, pred),
        r2=max(0.0, r2),
    )


def benchmark_models(df: pd.DataFrame) -> tuple[str, list[dict]]:
    """Compare XGBoost vs Ridge sur hold-out temporel."""
    y = df["revenue"].values.astype(float)
    X = df[FEATURE_COLS].values.astype(float)
    n = len(df)
    h = _holdout_size(n)
    if n <= h + 2:
        h = 1

    X_train, X_val = X[:-h], X[-h:]
    y_train, y_val = y[:-h], y[-h:]

    candidates = [
        (
            "xgboost",
            "XGBoost",
            XGBRegressor(
                n_estimators=80,
                max_depth=4,
                learning_rate=0.08,
                subsample=0.9,
                colsample_bytree=0.9,
                objective="reg:squarederror",
                random_state=42,
            ),
        ),
        (
            "ridge_sklearn",
            "Ridge (sklearn)",
            Ridge(alpha=1.5, random_state=42),
        ),
    ]

    results: list[EvalResult] = []
    for mid, label, est in candidates:
        try:
            results.append(_eval_model(mid, label, y_train, X_train, y_val, X_val, est))
        except Exception:
            continue

    results.sort(
        key=lambda r: (r.mape if r.mape is not None else 1e9, -r.r2),
    )
    winner = results[0].model_id if results else "xgboost"

    benchmark = []
    for rank, r in enumerate(results, start=1):
        benchmark.append(
            {
                "id": r.model_id,
                "label": r.label,
                "mape": round(r.mape, 2) if r.mape is not None else None,
                "rmse": round(r.rmse, 2),
                "r2": round(r.r2, 3),
                "rank": rank,
                "selected": r.model_id == winner,
            }
        )
    return winner, benchmark


def _fit_xgboost(df: pd.DataFrame) -> XGBRegressor:
    model = XGBRegressor(
        n_estimators=120,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        random_state=42,
    )
    model.fit(df[FEATURE_COLS], df["revenue"])
    return model


def _iterative_forecast(
    model: XGBRegressor,
    revenues: list[float],
    orders: list[float],
    steps: int,
) -> list[float]:
    series = list(revenues)
    order_series = list(orders)
    preds: list[float] = []

    for _ in range(steps):
        df = _build_feature_frame(series, order_series)
        row = df.iloc[[-1]]
        p = float(model.predict(row[FEATURE_COLS])[0])
        p = max(0.0, p)
        preds.append(p)
        series.append(p)
        avg_orders = float(np.mean(order_series[-3:])) if order_series else 0.0
        order_series.append(avg_orders)

    return preds


def forecast_sales(
    history: list[dict],
    horizon: int,
) -> dict:
    if len(history) < MIN_POINTS:
        raise ValueError(
            f"need_at_least_{MIN_POINTS}_points",
        )

    revenues = [float(h["revenue"]) for h in history]
    orders = [int(h.get("orders") or 0) for h in history]
    df = _build_feature_frame(revenues, [float(o) for o in orders])
    df["revenue"] = revenues

    winner, benchmark = benchmark_models(df)
    use_xgb = winner == "xgboost"
    model = _fit_xgboost(df) if use_xgb else Ridge(alpha=1.5).fit(
        df[FEATURE_COLS], df["revenue"]
    )

    if use_xgb:
        predictions = _iterative_forecast(model, revenues, orders, horizon)
        model_id = "xgboost"
        model_label = "XGBoost (gradient boosting)"
    else:
        predictions = _iterative_forecast_sklearn(model, revenues, orders, horizon)
        model_id = "ridge_sklearn"
        model_label = "Ridge (sklearn)"

    residuals = df["revenue"].values - model.predict(df[FEATURE_COLS])
    std_res = float(np.std(residuals)) if len(residuals) > 1 else 0.0

    winner_row = next((b for b in benchmark if b["selected"]), benchmark[0] if benchmark else {})
    slope = (revenues[-1] - revenues[0]) / max(1, len(revenues) - 1)
    trend = "up" if slope > 50 else "down" if slope < -50 else "stable"

    total_hist = sum(revenues)
    total_fc = sum(predictions)

    return {
        "model": model_id,
        "modelLabel": model_label,
        "modelBenchmark": benchmark,
        "modelSelection": {
            "method": "holdout_mape_python",
            "holdout": _holdout_size(len(history)),
            "winner": winner,
        },
        "metrics": {
            "r2": winner_row.get("r2"),
            "mape": winner_row.get("mape"),
            "trend": trend,
            "slopePerMonth": round(slope, 2),
        },
        "predictions": [
            {
                "revenue": round(p, 2),
                "revenueLow": round(max(0, p - std_res * 1.2), 2),
                "revenueHigh": round(p + std_res * 1.2, 2),
            }
            for p in predictions
        ],
        "summary": {
            "totalHistoricalRevenue": round(total_hist, 2),
            "totalForecastRevenue": round(total_fc, 2),
            "avgMonthlyHistorical": round(total_hist / len(revenues), 2),
            "avgMonthlyForecast": round(total_fc / horizon, 2),
        },
        "avgOrders": int(round(np.mean(orders))) if orders else 0,
    }


def _iterative_forecast_sklearn(
    model: Ridge,
    revenues: list[float],
    orders: list[int],
    steps: int,
) -> list[float]:
    series = list(revenues)
    order_series = [float(o) for o in orders]
    preds = []
    for _ in range(steps):
        df = _build_feature_frame(series, order_series)
        p = float(model.predict(df[FEATURE_COLS].iloc[[-1]])[0])
        p = max(0.0, p)
        preds.append(p)
        series.append(p)
        order_series.append(float(np.mean(order_series[-3:])))
    return preds
