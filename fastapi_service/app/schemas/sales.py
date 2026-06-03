from typing import Literal

from pydantic import BaseModel, Field


class HistoryPoint(BaseModel):
    month: str
    label: str
    revenue: float = Field(ge=0)
    orders: int = Field(ge=0, default=0)


class SalesForecastRequest(BaseModel):
    history: list[HistoryPoint]
    horizon: int = Field(default=3, ge=1, le=12)
    granularity: Literal["monthly", "weekly"] = "monthly"


class ForecastPoint(BaseModel):
    month: str
    label: str
    revenue: float
    revenueLow: float
    revenueHigh: float
    orders: int = 0
    type: str = "forecast"


class ModelBenchmarkRow(BaseModel):
    id: str
    label: str
    mape: float | None = None
    rmse: float | None = None
    r2: float | None = None
    rank: int
    selected: bool = False


class SalesForecastResponse(BaseModel):
    model: str = "xgboost"
    modelLabel: str = "XGBoost (gradient boosting)"
    modelBenchmark: list[ModelBenchmarkRow] = []
    modelSelection: dict = {}
    metrics: dict
    history: list[dict]
    forecast: list[ForecastPoint]
    summary: dict
    pythonPowered: bool = True
