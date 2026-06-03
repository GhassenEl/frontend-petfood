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


SERVICE_HINTS = {
    "grooming": ("toilettage", "coupe", "bain", "griffes"),
    "boarding": ("pension", "hébergement", "nuit"),
    "training": ("dressage", "éducation", "comportement"),
    "delivery": ("livraison", "livreur", "colis", "retard"),
    "veterinary": ("vétérinaire", "consultation", "clinique", "vaccin"),
    "products": ("produit", "croquette", "commande"),
}


@router.post("/analyze-sentiment")
async def analyze_sentiment(payload: dict):
    text = (
        payload.get("text")
        or payload.get("comment")
        or payload.get("review")
        or ""
    )[:2000]
    service_type = (payload.get("serviceType") or payload.get("service_type") or "").lower()
    negative_words = ("mauvais", "nul", "déçu", "retard", "cassé", "frustr", "horrible", "attente")
    positive_words = ("excellent", "super", "parfait", "rapide", "recommand", "ador", "merci", "génial")
    lower = text.lower()
    score = 0.1
    if any(w in lower for w in positive_words):
        score = 0.75
    if any(w in lower for w in negative_words):
        score = -0.6
    hints = SERVICE_HINTS.get(service_type, ())
    if hints and any(h in lower for h in hints):
        score += 0.05 if score > 0 else -0.05
    label = "positive" if score > 0.2 else "negative" if score < -0.2 else "neutral"
    if score > 0.55:
        emotion = "happy"
    elif score > 0.2:
        emotion = "satisfied"
    elif score < -0.45:
        emotion = "frustrated"
    elif score < -0.15:
        emotion = "disappointed"
    else:
        emotion = "neutral"
    confidence = min(0.95, abs(score) + 0.35)
    summary = f"Ressenti {emotion} détecté pour le service {service_type or 'plateforme'}."
    return {
        "sentiment": label,
        "score": score,
        "emotion": emotion,
        "confidence": confidence,
        "summary": summary,
        "serviceType": service_type or None,
        "source": "petfoodtn-stub",
    }
