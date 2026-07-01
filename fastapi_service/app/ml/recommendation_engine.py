"""
Moteur de recommandation PetfoodTN — contenu, collaboratif, hybride + NLP avis.
"""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LinearRegression

from app.ml.intelligence_suite import analyze_sales, collaborative_filter, sentiment_tfidf_svm

ROLE_WEIGHTS = {
    "client": {"content": 0.55, "collaborative": 0.45},
    "vet": {"content": 0.60, "collaborative": 0.40},
    "veterinarian": {"content": 0.60, "collaborative": 0.40},
    "admin": {"content": 0.40, "collaborative": 0.60},
    "vendor": {"content": 0.50, "collaborative": 0.50},
    "livreur": {"content": 0.45, "collaborative": 0.55},
    "moderator": {"content": 0.65, "collaborative": 0.35},
}

ANIMAL_ALIASES = {
    "dog": {"dog", "chien", "canin"},
    "cat": {"cat", "chat", "felin", "félin"},
    "bird": {"bird", "oiseau"},
    "fish": {"fish", "poisson"},
    "rabbit": {"rabbit", "lapin"},
    "hamster": {"hamster"},
}


def _norm(s: str | None) -> str:
    return re.sub(r"\s+", " ", str(s or "").lower().strip())


def _animal_match(product_type: str | None, profile_type: str | None) -> float:
    if not profile_type:
        return 0.5
    pt = _norm(product_type)
    pf = _norm(profile_type)
    for key, aliases in ANIMAL_ALIASES.items():
        if pf in aliases or pf == key:
            if pt in aliases or pt == key or pt == "other":
                return 1.0 if pt in aliases or pt == key else 0.55
    return 0.35 if pt and pf and pt != pf else 0.6


def _review_stats(reviews: list[dict], product_id: str) -> dict:
    pid = str(product_id)
    matched = [r for r in reviews if str(r.get("productId") or "") == pid]
    if not matched:
        return {"avg": 0.0, "count": 0, "sentiment": 0.5, "positive_ratio": 0.5}
    ratings = [float(r.get("rating") or 0) for r in matched]
    avg = sum(ratings) / len(ratings)
    positive = sum(1 for x in ratings if x >= 4)
    negative = sum(1 for x in ratings if x <= 2)
    sentiment = max(0.0, min(1.0, 0.5 + (positive - negative * 0.7) / max(1, len(ratings))))
    return {
        "avg": round(avg, 2),
        "count": len(matched),
        "sentiment": round(sentiment, 3),
        "positive_ratio": round(positive / len(ratings), 3),
    }


def score_content_based(product: dict, profile: dict | None, review_boost: float = 0.0) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0
    profile = profile or {}

    animal_score = _animal_match(product.get("animalType"), profile.get("petType"))
    score += animal_score * 0.35
    if animal_score >= 0.9:
        reasons.append(f"Adapté à {profile.get('petType') or 'votre animal'}")

    prefs = [ _norm(p) for p in (profile.get("preferences") or []) + (profile.get("favoriteCategories") or []) ]
    corpus = _norm(" ".join([
        product.get("name", ""),
        product.get("category", ""),
        product.get("description", ""),
        " ".join(product.get("tags") or []),
    ]))
    pref_hits = sum(1 for p in prefs if p and p in corpus)
    if pref_hits:
        score += min(0.25, pref_hits * 0.08)
        reasons.append("Correspond à vos préférences")

    history = {str(x) for x in (profile.get("historyProductIds") or [])}
    pid = str(product.get("id") or product.get("_id") or "")
    if pid in history:
        score += 0.15
        reasons.append("Déjà acheté — réassort")

    rating = float(product.get("rating_avg") or product.get("rating") or 0)
    if rating >= 4:
        score += 0.12
        reasons.append(f"Note catalogue {rating:.1f}/5")

    pop = float(product.get("popularity") or product.get("stock") or 0)
    score += min(0.08, pop / 500)

    score += review_boost * 0.15
    if review_boost > 0.6:
        reasons.append("Avis clients positifs (NLP)")

    return round(min(1.0, score), 4), reasons[:4]


def score_collaborative(product_id: str, collab_map: dict[str, float]) -> tuple[float, list[str]]:
    pid = str(product_id)
    raw = float(collab_map.get(pid, 0))
    if raw <= 0:
        return 0.0, []
    norm = min(1.0, raw)
    return round(norm, 4), ["Clients similaires ont aussi acheté"]


def build_collaborative_map(orders: list[dict], user_id: str | None = None) -> dict[str, float]:
    """Carte produit → score collaboratif (co-achat + voisins)."""
    user_items: dict[str, set[str]] = defaultdict(set)
    for o in orders:
        uid = str(o.get("userId") or "")
        if not uid:
            continue
        for it in o.get("items") or []:
            pid = it.get("productId")
            if pid:
                user_items[uid].add(str(pid))

    if user_id and user_id in user_items:
        target = user_items[user_id]
        scores: Counter = Counter()
        for uid, items in user_items.items():
            if uid == user_id:
                continue
            inter = len(target & items)
            if inter == 0:
                continue
            union = len(target | items) or 1
            sim = inter / union
            for pid in items - target:
                scores[pid] += sim
        if scores:
            max_s = max(scores.values()) or 1
            return {k: v / max_s for k, v in scores.items()}

    collab_list = collaborative_filter(orders, [], limit=50)
    if not collab_list:
        return {}
    max_score = max(c.get("score", 0) for c in collab_list) or 1
    return {str(c["productId"]): c.get("score", 0) / max_score for c in collab_list}


def filter_by_reviews_nlp(
    products: list[dict],
    reviews: list[dict],
    query: str | None = None,
    min_rating: float | None = None,
) -> list[dict]:
    """Filtre / recherche selon avis, feedback et requête NLP légère."""
    review_texts = [str(r.get("comment") or "") for r in reviews if r.get("comment")]
    nlp = sentiment_tfidf_svm(review_texts[:200]) if review_texts else None

    q = _norm(query)
    q_terms = [t for t in q.split() if len(t) > 2] if q else []

    out = []
    for p in products:
        pid = str(p.get("id") or p.get("_id") or "")
        stats = _review_stats(reviews, pid)
        if min_rating and stats["count"] >= 2 and stats["avg"] < min_rating:
            continue
        if stats["count"] >= 3 and stats["avg"] < 2.5:
            continue

        corpus = _norm(" ".join([p.get("name", ""), p.get("description", ""), p.get("category", "")]))
        text_score = 0.0
        if q_terms:
            hits = sum(1 for t in q_terms if t in corpus)
            text_score = hits / len(q_terms)
            if hits == 0 and q:
                continue

        boost = stats["sentiment"] * 0.5 + (stats["avg"] / 5) * 0.3 + text_score * 0.2
        out.append({**p, "_reviewStats": stats, "_nlpBoost": round(boost, 3), "_nlpModel": nlp.get("model") if nlp else None})

    out.sort(key=lambda x: x.get("_nlpBoost", 0), reverse=True)

    if q_terms and len(out) < 5:
        existing_ids = {str(x.get("id") or x.get("_id") or "") for x in out}
        for p in products:
            pid = str(p.get("id") or p.get("_id") or "")
            if pid in existing_ids:
                continue
            corpus = _norm(" ".join([p.get("name", ""), p.get("description", ""), p.get("category", ""), p.get("animalType", "")]))
            hits = sum(1 for t in q_terms if t in corpus)
            if hits == 0:
                continue
            stats = _review_stats(reviews, pid)
            if min_rating and stats["count"] >= 2 and stats["avg"] < min_rating:
                continue
            text_score = hits / len(q_terms)
            boost = stats["sentiment"] * 0.4 + (stats["avg"] / 5) * 0.25 + text_score * 0.35
            out.append({**p, "_reviewStats": stats, "_nlpBoost": round(boost, 3), "_nlpModel": nlp.get("model") if nlp else None, "_softMatch": True})

    if not out and products:
        for p in products[:30]:
            pid = str(p.get("id") or p.get("_id") or "")
            stats = _review_stats(reviews, pid)
            if min_rating and stats["count"] >= 2 and stats["avg"] < min_rating:
                continue
            boost = stats["sentiment"] * 0.5 + (stats["avg"] / 5) * 0.3 + float(p.get("rating_avg") or 0) / 25
            out.append({**p, "_reviewStats": stats, "_nlpBoost": round(boost, 3), "_nlpModel": nlp.get("model") if nlp else None})
        out.sort(key=lambda x: x.get("_nlpBoost", 0), reverse=True)

    return out


def run_hybrid_recommendation(
    *,
    role: str = "client",
    profile: dict | None = None,
    products: list[dict],
    orders: list[dict],
    reviews: list[dict] | None = None,
    limit: int = 10,
    query: str | None = None,
    min_rating: float | None = None,
) -> dict:
    reviews = reviews or []
    weights = ROLE_WEIGHTS.get(role, ROLE_WEIGHTS["client"])
    profile = profile or {}

    filtered = filter_by_reviews_nlp(products, reviews, query=query, min_rating=min_rating)
    if not filtered:
        filtered = products

    collab_map = build_collaborative_map(orders, str(profile.get("userId") or ""))
    recs = []

    for p in filtered[: max(limit * 3, 30)]:
        pid = str(p.get("id") or p.get("_id") or "")
        nlp_boost = float(p.get("_nlpBoost") or 0)
        content, c_reasons = score_content_based(p, profile, review_boost=nlp_boost)
        collab, col_reasons = score_collaborative(pid, collab_map)
        hybrid = content * weights["content"] + collab * weights["collaborative"]
        if hybrid < 0.08:
            continue
        reasons = list(dict.fromkeys(c_reasons + col_reasons))[:5]
        recs.append({
            "id": pid,
            "name": p.get("name"),
            "category": p.get("category"),
            "animalType": p.get("animalType"),
            "price": p.get("price"),
            "hybridScore": round(hybrid, 4),
            "contentScore": content,
            "collaborativeScore": collab,
            "reviewStats": p.get("_reviewStats"),
            "reasons": reasons,
            "recommendedReason": reasons[0] if reasons else "Recommandation hybride",
            "method": "hybrid",
        })

    recs.sort(key=lambda x: x["hybridScore"], reverse=True)
    top = recs[:limit]

    review_comments = [str(r.get("comment") or "") for r in reviews if r.get("comment")]
    nlp_summary = sentiment_tfidf_svm(review_comments[:150]) if review_comments else None

    return {
        "role": role,
        "mode": "hybrid",
        "source": "fastapi",
        "pipeline": {
            "weights": weights,
            "steps": ["content_based", "collaborative_filtering", "review_nlp_filter", "hybrid_blend"],
        },
        "recommendations": top,
        "nlp": nlp_summary,
        "catalogSize": len(products),
        "filteredCount": len(filtered),
    }


def admin_client_recommendations(
    *,
    target_user_id: str,
    profile: dict,
    products: list[dict],
    orders: list[dict],
    reviews: list[dict],
    pets: list[dict] | None = None,
    limit: int = 12,
) -> dict:
    user_orders = [o for o in orders if str(o.get("userId") or "") == str(target_user_id)]
    profile = {**profile, "userId": target_user_id, "historyProductIds": [
        str(it.get("productId"))
        for o in user_orders
        for it in (o.get("items") or [])
        if it.get("productId")
    ]}

    if pets:
        primary = pets[0]
        profile.setdefault("petType", primary.get("type"))
        profile.setdefault("petName", primary.get("name"))
        profile.setdefault("weightKg", primary.get("weight"))

    pack = run_hybrid_recommendation(
        role="admin",
        profile=profile,
        products=products,
        orders=orders,
        reviews=reviews,
        limit=limit,
    )

    similar_clients: list[dict] = []
    user_items = {
        str(it.get("productId"))
        for o in user_orders
        for it in (o.get("items") or [])
        if it.get("productId")
    }
    for o in orders:
        uid = str(o.get("userId") or "")
        if uid == str(target_user_id):
            continue
        other_items = {str(it.get("productId")) for it in (o.get("items") or []) if it.get("productId")}
        if not other_items:
            continue
        inter = len(user_items & other_items)
        if inter == 0:
            continue
        sim = inter / max(1, len(user_items | other_items))
        similar_clients.append({"userId": uid, "similarity": round(sim, 3), "commonProducts": inter})

    similar_clients.sort(key=lambda x: x["similarity"], reverse=True)

    return {
        **pack,
        "targetUserId": target_user_id,
        "profile": profile,
        "pets": pets or [],
        "similarClients": similar_clients[:5],
        "interpretation": (
            f"Profil client {profile.get('petName') or profile.get('userId')} — "
            f"{len(pack.get('recommendations') or [])} produits adaptés par similarité et préférences."
        ),
    }


def explain_sales_traffic(
    orders: list[dict],
    products: list[dict],
    reviews: list[dict] | None = None,
    revenue_history: list[dict] | None = None,
) -> dict:
    """Interprétation IA du trafic CA / ventes (NLP + tendances)."""
    sales = analyze_sales(orders, products)
    reviews = reviews or []
    review_texts = [str(r.get("comment") or "") for r in reviews if r.get("comment")]
    sentiment = sentiment_tfidf_svm(review_texts[:200]) if review_texts else {"positivePct": 75, "model": "demo"}

    history = revenue_history or []
    trend = "stable"
    growth_pct = 0.0
    if len(history) >= 3:
        ys = [float(h.get("revenue") or h.get("total") or 0) for h in history[-6:]]
        xs = np.arange(len(ys)).reshape(-1, 1)
        if len(ys) >= 2 and max(ys) > 0:
            reg = LinearRegression().fit(xs, ys)
            pred_next = float(reg.predict([[len(ys)]])[0])
            growth_pct = round((pred_next - ys[-1]) / max(ys[-1], 1) * 100, 1)
            trend = "hausse" if growth_pct > 3 else "baisse" if growth_pct < -3 else "stable"

    paragraphs = [
        f"Le chiffre d'affaires cumulé est de {sales.get('totalRevenue', 0):,.0f} DT. "
        f"Tendance prévue : {trend} ({growth_pct:+.1f} % sur la prochaine période).",
        sales.get("insight") or "Analyse des ventes en cours.",
        f"Produit leader : « {sales.get('topProductName')} » ({sales.get('topProductQty')} unités). "
        f"Pic de demande observé en {sales.get('peakDemandMonth')}.",
        f"Sentiment avis clients (NLP {sentiment.get('model', 'tfidf')}) : "
        f"{sentiment.get('positivePct', 0)} % positif — {sales.get('purchaseHabits', '')}.",
    ]

    return {
        "salesAnalysis": sales,
        "sentimentNlp": sentiment,
        "trend": trend,
        "growthPctForecast": growth_pct,
        "aiSummary": "\n\n".join(paragraphs),
        "highlights": [
            {"label": "CA total", "value": f"{sales.get('totalRevenue', 0):,.0f} DT"},
            {"label": "Top produit", "value": sales.get("topProductName")},
            {"label": "Part chats", "value": f"{sales.get('topProductSharePct', 0)} %"},
            {"label": "Avis positifs", "value": f"{sentiment.get('positivePct', 0)} %"},
        ],
    }
