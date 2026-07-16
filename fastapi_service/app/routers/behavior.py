"""Détection d'anomalies comportementales multi-espèces (IsolationForest + baseline)."""

from __future__ import annotations

from typing import Any

import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

router = APIRouter(prefix="/ml/behavior", tags=["behavior"])

FEATURE_KEYS = [
    "feeding_ratio",
    "feeding_zscore_7d",
    "water_ratio",
    "water_zscore_7d",
    "weight_delta_pct",
    "presence_rate",
    "offline_hours",
    "activity_proxy",
    "rest_proxy",
    "reservoir_low",
    "species_feeding_norm",
    "species_activity_norm",
]

SPECIES_PRIORS = {
    "dog": {"feeding_ratio": 1.0, "activity_proxy": 0.55},
    "cat": {"feeding_ratio": 1.0, "activity_proxy": 0.4},
    "bird": {"feeding_ratio": 1.0, "activity_proxy": 0.65},
    "fish": {"feeding_ratio": 1.0, "activity_proxy": 0.35},
    "rabbit": {"feeding_ratio": 1.0, "activity_proxy": 0.5},
    "hamster": {"feeding_ratio": 1.0, "activity_proxy": 0.7},
    "reptile": {"feeding_ratio": 0.7, "activity_proxy": 0.25},
    "other": {"feeding_ratio": 1.0, "activity_proxy": 0.45},
}


class PetBehaviorInput(BaseModel):
    pet_id: str
    pet_type: str = "other"
    cold_start: bool = False
    sample_count: int = 0
    features: dict[str, float] = Field(default_factory=dict)
    sources: dict[str, bool] = Field(default_factory=dict)


class BehaviorRequest(BaseModel):
    pets: list[PetBehaviorInput]


def _vector(features: dict[str, float]) -> np.ndarray:
    return np.array([[float(features.get(k, 0.0) or 0.0) for k in FEATURE_KEYS]], dtype=float)


def _heuristic_factors(features: dict[str, float], pet_type: str) -> list[dict[str, str]]:
    factors: list[dict[str, str]] = []
    feeding = float(features.get("feeding_ratio", 1) or 1)
    water = float(features.get("water_ratio", 1) or 1)
    weight = float(features.get("weight_delta_pct", 0) or 0)
    offline = float(features.get("offline_hours", 0) or 0)
    activity = float(features.get("activity_proxy", 0.5) or 0.5)
    rest = float(features.get("rest_proxy", 0.5) or 0.5)
    prior = SPECIES_PRIORS.get(pet_type, SPECIES_PRIORS["other"])

    if feeding < 0.45:
        factors.append({"signal": "feeding_drop", "detail": f"Alimentation {int(feeding * 100)} % de l'objectif"})
    if feeding > 1.45:
        factors.append({"signal": "feeding_spike", "detail": "Surconsommation vs planning"})
    if water < 0.55:
        factors.append({"signal": "hydration_low", "detail": "Hydratation basse vs cible espèce"})
    if abs(weight) >= 8:
        sign = "+" if weight > 0 else ""
        factors.append({"signal": "weight_shift", "detail": f"Poids {sign}{weight:.1f} %"})
    if offline > 18:
        factors.append({"signal": "device_offline", "detail": f"Gamelle offline {int(offline)} h"})
    if activity < prior["activity_proxy"] * 0.45 and rest > 0.75:
        factors.append({"signal": "rest_unusual", "detail": "Repos inhabituellement élevée"})
    if float(features.get("reservoir_low", 0) or 0) >= 1:
        factors.append({"signal": "reservoir_empty", "detail": "Réservoir bas / vide"})
    return factors


def _score_from_if(raw: float, cold_start: bool) -> float:
    # IsolationForest decision_function: more negative => more anomalous
    score = float(1 / (1 + np.exp(raw * 2.2)))
    if cold_start:
        score = min(score, 0.38)
    return max(0.0, min(1.0, score))


@router.post("/anomalies")
def detect_behavior_anomalies(payload: BehaviorRequest) -> dict[str, Any]:
    pets = payload.pets or []
    if not pets:
        return {"model_version": "behavior_if_v1", "results": []}

    matrix = np.vstack([_vector(p.features) for p in pets])
    # Fit a tiny IsolationForest on the batch + soft species priors noise for robustness
    noise = np.random.default_rng(42).normal(0, 0.03, size=(max(8, len(pets) * 3), matrix.shape[1]))
    train = np.vstack([matrix, noise])
    model = IsolationForest(
        n_estimators=120,
        contamination="auto",
        random_state=42,
    )
    model.fit(train)
    decisions = model.decision_function(matrix)

    results = []
    for pet, decision in zip(pets, decisions):
        factors = _heuristic_factors(pet.features, pet.pet_type)
        score = _score_from_if(float(decision), pet.cold_start)
        if factors and score < 0.45:
            score = max(score, min(0.72, 0.35 + 0.08 * len(factors)))
        if pet.cold_start:
            score = min(score, 0.38)
            factors = factors[:2] + [{"signal": "cold_start", "detail": "Historique insuffisant — baseline espèce"}]
        severity = "high" if score >= 0.7 else "medium" if score >= 0.4 else "low"
        results.append(
            {
                "pet_id": pet.pet_id,
                "pet_type": pet.pet_type,
                "score": round(score, 4),
                "severity": severity,
                "confidence": 0.35 if pet.cold_start else 0.78,
                "cold_start": pet.cold_start,
                "model_version": "behavior_if_v1",
                "factors": factors,
                "sources": pet.sources,
                "disclaimer": "Indicateur comportemental — ne remplace pas un avis vétérinaire",
            }
        )

    return {"model_version": "behavior_if_v1", "results": results}
