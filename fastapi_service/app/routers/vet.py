"""Détection espèce animal + scoring ordonnance — profils espèces depuis la base."""

from __future__ import annotations

import math
import re
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/ml/vet", tags=["vet"])

MODEL_VERSION = "animal_species_v1"


class SpeciesProfileInput(BaseModel):
    species_code: str
    label_fr: str
    keywords: list[str] = Field(default_factory=list)
    weight_min_kg: float | None = None
    weight_max_kg: float | None = None
    temp_min_c: float | None = None
    temp_max_c: float | None = None
    features: dict[str, float] = Field(default_factory=dict)


class AnimalDetectRequest(BaseModel):
    description: str
    weight_kg: float | None = None
    temperature_c: float | None = None
    breed_hint: str | None = None
    species_profiles: list[SpeciesProfileInput] = Field(default_factory=list)


class MedicationInput(BaseModel):
    name: str
    dosage: str = ""
    frequency: str = ""
    duration: str = ""
    stock_qty: int = 0


class PrescriptionScoreRequest(BaseModel):
    diagnosis: str
    symptoms: str = ""
    animal_type: str = "dog"
    weight_kg: float | None = None
    medications: list[MedicationInput] = Field(default_factory=list)
    allergies: str | None = None
    chronic_conditions: str | None = None


def _normalize(text: str) -> str:
    t = text.lower().strip()
    t = re.sub(r"[^\w\sàâäéèêëïîôùûüç-]", " ", t, flags=re.UNICODE)
    return re.sub(r"\s+", " ", t)


def _keyword_score(text: str, keywords: list[str]) -> float:
    if not keywords:
        return 0.0
    hits = sum(1 for kw in keywords if kw and kw.lower() in text)
    return hits / max(len(keywords), 1)


def _vital_score(
    weight: float | None,
    temp: float | None,
    profile: SpeciesProfileInput,
) -> float:
    score = 0.0
    if weight is not None and profile.weight_min_kg is not None and profile.weight_max_kg is not None:
        if profile.weight_min_kg <= weight <= profile.weight_max_kg:
            score += 0.35
        else:
            dist = min(abs(weight - profile.weight_min_kg), abs(weight - profile.weight_max_kg))
            score += max(0.0, 0.2 - dist * 0.02)
    if temp is not None and profile.temp_min_c is not None and profile.temp_max_c is not None:
        if profile.temp_min_c <= temp <= profile.temp_max_c:
            score += 0.25
        else:
            score += 0.05
    return score


def _softmax(scores: list[float]) -> list[float]:
    if not scores:
        return []
    mx = max(scores)
    exps = [math.exp(s - mx) for s in scores]
    total = sum(exps) or 1.0
    return [e / total for e in exps]


DEFAULT_SPECIES = [
    SpeciesProfileInput(
        species_code="dog",
        label_fr="Chien",
        keywords=["chien", "dog", "canin", "rottweiler", "berger", "labrador", "caniche", "aboiement", "laisse"],
        weight_min_kg=2.0,
        weight_max_kg=80.0,
        temp_min_c=37.5,
        temp_max_c=39.2,
    ),
    SpeciesProfileInput(
        species_code="cat",
        label_fr="Chat",
        keywords=["chat", "cat", "félin", "felin", "miaulement", "ronronnement", "siamois", "persan"],
        weight_min_kg=2.0,
        weight_max_kg=12.0,
        temp_min_c=37.8,
        temp_max_c=39.5,
    ),
    SpeciesProfileInput(
        species_code="bird",
        label_fr="Oiseau",
        keywords=["oiseau", "bird", "perroquet", "canari", "pigeon", "plume", "cage", "volaille"],
        weight_min_kg=0.02,
        weight_max_kg=3.0,
        temp_min_c=40.0,
        temp_max_c=42.0,
    ),
    SpeciesProfileInput(
        species_code="rabbit",
        label_fr="Lapin",
        keywords=["lapin", "rabbit", "rongeur", "nain", "oreilles longues"],
        weight_min_kg=0.8,
        weight_max_kg=8.0,
        temp_min_c=38.0,
        temp_max_c=40.0,
    ),
    SpeciesProfileInput(
        species_code="fish",
        label_fr="Poisson",
        keywords=["poisson", "fish", "aquarium", "nageoire", "écaille", "ecaille", "carpes"],
        weight_min_kg=0.001,
        weight_max_kg=5.0,
    ),
    SpeciesProfileInput(
        species_code="reptile",
        label_fr="Reptile",
        keywords=["reptile", "serpent", "lézard", "lezard", "tortue", "iguane", "gecko"],
        weight_min_kg=0.05,
        weight_max_kg=50.0,
    ),
]


@router.post("/animal-detect")
def animal_detect(body: AnimalDetectRequest) -> dict[str, Any]:
    text = _normalize(f"{body.description} {body.breed_hint or ''}")
    profiles = body.species_profiles if body.species_profiles else DEFAULT_SPECIES

    raw_scores: list[tuple[SpeciesProfileInput, float]] = []
    for profile in profiles:
        kw = _keyword_score(text, profile.keywords)
        vital = _vital_score(body.weight_kg, body.temperature_c, profile)
        feat_bonus = sum(float(profile.features.get(k, 0) or 0) for k in ("size_small", "size_large")) * 0.05
        total = kw * 0.55 + vital * 0.35 + feat_bonus
        raw_scores.append((profile, total))

    raw_scores.sort(key=lambda x: x[1], reverse=True)
    probs = _softmax([s for _, s in raw_scores])

    alternatives = []
    for i, (profile, score) in enumerate(raw_scores[:5]):
        alternatives.append(
            {
                "speciesCode": profile.species_code,
                "label": profile.label_fr,
                "confidence": round(probs[i] if i < len(probs) else 0.0, 4),
                "rawScore": round(score, 4),
            }
        )

    top = alternatives[0] if alternatives else {
        "speciesCode": "other",
        "label": "Autre",
        "confidence": 0.5,
        "rawScore": 0.0,
    }

    return {
        "modelVersion": MODEL_VERSION,
        "detectedSpeciesCode": top["speciesCode"],
        "detectedLabel": top["label"],
        "confidence": top["confidence"],
        "alternatives": alternatives,
        "features": {
            "descriptionLength": len(body.description or ""),
            "hasWeight": body.weight_kg is not None,
            "hasTemperature": body.temperature_c is not None,
            "breedHint": body.breed_hint,
        },
        "disclaimer": "Classification assistée — confirmer par examen clinique et dossier patient.",
    }


@router.post("/prescription-score")
def prescription_score(body: PrescriptionScoreRequest) -> dict[str, Any]:
    diag = _normalize(f"{body.diagnosis} {body.symptoms}")
    allergy_text = _normalize(body.allergies or "")
    chronic_text = _normalize(body.chronic_conditions or "")

    scored: list[dict[str, Any]] = []
    for med in body.medications:
        name_l = med.name.lower()
        fit = 0.55
        warnings: list[str] = []

        if body.animal_type == "cat" and any(x in name_l for x in ("carprof", "ibuprof", "paracétamol", "acetaminophen")):
            fit -= 0.45
            warnings.append("Contre-indication fréquente chez le chat")
        if allergy_text and any(tok in allergy_text for tok in name_l.split() if len(tok) > 3):
            fit -= 0.5
            warnings.append("Allergie signalée — vérifier")
        if chronic_text and "renal" in chronic_text and any(x in name_l for x in ("ains", "mélox", "melox")):
            fit -= 0.3
            warnings.append("Prudence insuffisance rénale")
        if "dermat" in diag and any(x in name_l for x in ("apoquel", "cortico", "predni")):
            fit += 0.2
        if "arthros" in diag and any(x in name_l for x in ("carprof", "mélox", "melox", "glucos")):
            fit += 0.15
        if med.stock_qty <= 0:
            warnings.append("Rupture stock pharmacie")
            fit -= 0.15
        elif med.stock_qty < 5:
            warnings.append("Stock faible")

        fit = max(0.0, min(1.0, fit))
        scored.append(
            {
                "name": med.name,
                "dosage": med.dosage,
                "frequency": med.frequency,
                "duration": med.duration,
                "fitScore": round(fit, 3),
                "warnings": warnings,
                "inStock": med.stock_qty > 0,
            }
        )

    scored.sort(key=lambda x: x["fitScore"], reverse=True)
    avg_fit = sum(s["fitScore"] for s in scored) / len(scored) if scored else 0.0

    return {
        "modelVersion": "prescription_fit_v1",
        "averageFit": round(avg_fit, 3),
        "medications": scored,
        "recommendation": (
            "Ordonnance cohérente avec le diagnostic"
            if avg_fit >= 0.65
            else "Réviser posologies ou alternatives — score de cohérence modéré"
        ),
    }


class AnimalDetectImageRequest(BaseModel):
    image_hint: str = ""
    image_base64_present: bool = False
    species_guess: str | None = None
    breed_hint: str | None = None
    weight_kg: float | None = None
    temperature_c: float | None = None
    species_profiles: list[SpeciesProfileInput] = Field(default_factory=list)


@router.post("/animal-detect-image")
def animal_detect_image(body: AnimalDetectImageRequest) -> dict[str, Any]:
    """Détection espèce à partir d'indices vision (hint photo / guess)."""
    description = " ".join(
        filter(
            None,
            [
                body.image_hint,
                body.species_guess,
                body.breed_hint,
                "photo animal" if body.image_base64_present else "",
            ],
        )
    ).strip() or "animal photo"

    detect_body = AnimalDetectRequest(
        description=description,
        weight_kg=body.weight_kg,
        temperature_c=body.temperature_c,
        breed_hint=body.breed_hint or body.species_guess,
        species_profiles=body.species_profiles,
    )
    result = animal_detect(detect_body)
    result["imagePowered"] = True
    result["imageHintUsed"] = bool(body.image_hint or body.image_base64_present)
    if body.species_guess:
        # Boost guessed species if present in alternatives
        for alt in result.get("alternatives") or []:
            if alt.get("speciesCode") == body.species_guess:
                alt["confidence"] = min(1.0, float(alt.get("confidence") or 0) + 0.12)
                result["detectedSpeciesCode"] = alt["speciesCode"]
                result["detectedLabel"] = alt["label"]
                result["confidence"] = alt["confidence"]
                break
    return result
