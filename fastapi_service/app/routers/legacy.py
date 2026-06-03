"""Endpoints attendus par le frontend (stubs légers si modèles vision/NLP absents)."""
from fastapi import APIRouter, File, UploadFile

router = APIRouter(tags=["legacy"])


@router.post("/detect-image")
async def detect_image(file: UploadFile = File(...)):
    name = (file.filename or "animal").lower()
    animal = "cat" if "cat" in name or "chat" in name else "dog"
    return {
        "animal": animal,
        "confidence": 0.72,
        "message": "Détection démo (entraînez un modèle vision pour la production).",
        "source": "petfoodtn-stub",
    }


@router.post("/analyze-sentiment")
async def analyze_sentiment(payload: dict):
    text = (
        payload.get("text")
        or payload.get("comment")
        or payload.get("review")
        or ""
    )[:2000]
    negative_words = ("mauvais", "nul", "déçu", "retard", "cassé")
    positive_words = ("excellent", "super", "parfait", "rapide", "recommand")
    lower = text.lower()
    score = 0.1
    if any(w in lower for w in positive_words):
        score = 0.75
    if any(w in lower for w in negative_words):
        score = -0.6
    label = "positive" if score > 0.2 else "negative" if score < -0.2 else "neutral"
    return {
        "sentiment": label,
        "score": score,
        "source": "petfoodtn-stub",
    }
