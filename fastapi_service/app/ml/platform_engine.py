"""
Suite ML PetfoodTN : prévision, classification, ranking, détection d'anomalies.
"""
from __future__ import annotations

import math
import re
from collections import defaultdict
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier, XGBRegressor

from app.ml.sales_xgboost import forecast_sales

CANCEL_STATUSES = {"cancelled", "canceled", "refunded", "annule", "annulé"}
FRAUD_STATUSES = {"cancelled", "canceled", "refunded", "disputed"}


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")[:19])
    except Exception:
        return None


def _pet_age_years(birth: str | None) -> float | None:
    b = _parse_dt(birth)
    if not b:
        return None
    days = (datetime.utcnow() - b.replace(tzinfo=None)).days
    return max(0, days / 365.25)


def _life_stage(pet_type: str, age: float | None) -> str:
    if age is None:
        return "adult"
    if age < 1:
        return "young"
    if pet_type in ("dog", "cat") and age >= 7:
        return "senior"
    if pet_type in ("rabbit", "bird") and age >= 5:
        return "senior"
    return "adult"


def _senior_dog_match_score(name: str, desc: str, tags: str, category: str) -> float:
    hay = f"{name} {desc} {tags} {category}".lower()
    score = 0.0
    if re.search(r"senior|mature|7\+|10\+|âgé|age", hay):
        score += 0.45
    if re.search(r"articulation|mobilité|digestion|light|lightweight", hay):
        score += 0.2
    if "dog" in hay or "chien" in hay:
        score += 0.15
    if category in ("nourriture", "soin", "accessoire"):
        score += 0.1
    if re.search(r"chiot|junior|kitten", hay):
        score -= 0.35
    return score


def _build_revenue_history(orders: list[dict]) -> list[dict]:
    monthly: dict[str, dict] = defaultdict(lambda: {"revenue": 0.0, "orders": 0})
    for o in orders:
        if str(o.get("status", "")).lower() in CANCEL_STATUSES:
            continue
        dt = _parse_dt(o.get("createdAt"))
        if not dt:
            continue
        key = f"{dt.year}-{dt.month:02d}"
        monthly[key]["revenue"] += float(o.get("total") or 0)
        monthly[key]["orders"] += 1
    keys = sorted(monthly.keys())
    return [
        {
            "month": k,
            "label": f"{k.split('-')[1]}/{k.split('-')[0]}",
            "revenue": round(monthly[k]["revenue"], 2),
            "orders": monthly[k]["orders"],
        }
        for k in keys
    ]


def _product_demand_forecast(orders: list[dict], products: list[dict], top_n: int = 10) -> list[dict]:
    """Demande prévue par produit (quantité mois prochain)."""
    if not orders:
        return []

    rows = []
    for o in orders:
        if str(o.get("status", "")).lower() in CANCEL_STATUSES:
            continue
        dt = _parse_dt(o.get("createdAt"))
        if not dt:
            continue
        period = f"{dt.year}-{dt.month:02d}"
        for it in o.get("items") or []:
            pid = it.get("productId") or "unknown"
            rows.append(
                {
                    "period": period,
                    "productId": pid,
                    "qty": int(it.get("quantity") or 1),
                    "revenue": float(it.get("price") or 0) * int(it.get("quantity") or 1),
                }
            )
    if len(rows) < 8:
        return _heuristic_product_demand(products, orders, top_n)

    df = pd.DataFrame(rows)
    product_names = {p["id"]: p.get("name", p["id"]) for p in products}
    results = []

    for pid, grp in df.groupby("productId"):
        ts = grp.groupby("period")["qty"].sum().reset_index()
        if len(ts) < 3:
            continue
        ts = ts.sort_values("period")
        ts["idx"] = range(len(ts))
        X = ts[["idx"]].values
        y = ts["qty"].values
        model = XGBRegressor(
            n_estimators=40, max_depth=3, learning_rate=0.1, random_state=42
        )
        model.fit(X, y)
        next_idx = len(ts)
        pred_qty = max(0, int(round(float(model.predict([[next_idx]])[0]))))
        trend = "up" if pred_qty > y[-1] else "down" if pred_qty < y[-1] else "stable"
        results.append(
            {
                "productId": pid,
                "productName": product_names.get(pid, pid),
                "predictedQuantityNextMonth": pred_qty,
                "lastMonthQuantity": int(y[-1]),
                "trend": trend,
                "model": "xgboost",
            }
        )

    results.sort(key=lambda x: x["predictedQuantityNextMonth"], reverse=True)
    return results[:top_n]


def _heuristic_product_demand(products: list[dict], orders: list[dict], top_n: int) -> list[dict]:
    counts: dict[str, int] = defaultdict(int)
    for o in orders:
        for it in o.get("items") or []:
            pid = it.get("productId")
            if pid:
                counts[pid] += int(it.get("quantity") or 1)
    items = sorted(counts.items(), key=lambda x: -x[1])[:top_n]
    names = {p["id"]: p.get("name") for p in products}
    return [
        {
            "productId": pid,
            "productName": names.get(pid, pid),
            "predictedQuantityNextMonth": max(1, int(qty * 1.08)),
            "lastMonthQuantity": qty,
            "trend": "up",
            "model": "heuristic",
        }
        for pid, qty in items
    ]


def _churn_predictions(orders: list[dict], users: list[dict]) -> list[dict]:
    """Probabilité de rachat client (classification XGBoost)."""
    clients = [u for u in users if u.get("role") == "client"] or users
    if not orders or not clients:
        return []

    now = datetime.utcnow()
    user_stats: dict[str, dict] = defaultdict(
        lambda: {
            "order_count": 0,
            "total_spent": 0.0,
            "cancel_count": 0,
            "last_order_days": 999,
            "rebuy_90d": 0,
        }
    )

    for o in orders:
        uid = o.get("userId")
        if not uid:
            continue
        st = user_stats[uid]
        st["order_count"] += 1
        st["total_spent"] += float(o.get("total") or 0)
        if str(o.get("status", "")).lower() in CANCEL_STATUSES:
            st["cancel_count"] += 1
        dt = _parse_dt(o.get("createdAt"))
        if dt:
            days = (now - dt.replace(tzinfo=None)).days
            st["last_order_days"] = min(st["last_order_days"], days)

    for uid, st in user_stats.items():
        st["rebuy_90d"] = 1 if st["last_order_days"] <= 90 else 0

    rows = []
    labels = []
    for uid, st in user_stats.items():
        if st["order_count"] < 1:
            continue
        cancel_rate = st["cancel_count"] / st["order_count"]
        rows.append(
            [
                st["order_count"],
                st["total_spent"],
                cancel_rate,
                st["last_order_days"],
                math.log1p(st["total_spent"]),
            ]
        )
        labels.append(st["rebuy_90d"])

    if len(rows) < 12 or len(set(labels)) < 2:
        return _heuristic_churn(clients, user_stats)

    X = np.array(rows)
    y = np.array(labels)
    clf = XGBClassifier(
        n_estimators=60,
        max_depth=4,
        learning_rate=0.08,
        eval_metric="logloss",
        random_state=42,
    )
    clf.fit(X, y)

    uids = list(user_stats.keys())[: len(rows)]
    out = []
    for i, uid in enumerate(uids):
        prob = float(clf.predict_proba([rows[i]])[0][1])
        name = next((u.get("name", uid) for u in clients if u.get("id") == uid), uid)
        out.append(
            {
                "userId": uid,
                "userName": name,
                "rebuyProbability": round(prob, 3),
                "willRebuy": prob >= 0.5,
                "riskLabel": "fidèle" if prob >= 0.65 else "à risque" if prob < 0.35 else "incertain",
                "model": "xgboost",
            }
        )
    out.sort(key=lambda x: x["rebuyProbability"])
    return out[:30]


def _heuristic_churn(clients: list[dict], user_stats: dict) -> list[dict]:
    out = []
    for u in clients:
        uid = u.get("id")
        st = user_stats.get(uid, {"last_order_days": 180, "order_count": 0})
        prob = 0.75 if st["last_order_days"] <= 45 else 0.35 if st["last_order_days"] > 120 else 0.55
        out.append(
            {
                "userId": uid,
                "userName": u.get("name", uid),
                "rebuyProbability": prob,
                "willRebuy": prob >= 0.5,
                "riskLabel": "fidèle" if prob >= 0.65 else "à risque",
                "model": "heuristic",
            }
        )
    return out[:30]


def _cancel_risk_orders(orders: list[dict]) -> list[dict]:
    """Commandes récentes à risque d'annulation."""
    active = [
        o
        for o in orders
        if str(o.get("status", "")).lower() in ("pending", "processing", "confirmed", "en attente")
    ]
    if not active:
        active = orders[-20:]

    user_cancel_rate: dict[str, float] = defaultdict(lambda: 0.0)
    user_counts: dict[str, int] = defaultdict(int)
    for o in orders:
        uid = o.get("userId")
        if not uid:
            continue
        user_counts[uid] += 1
        if str(o.get("status", "")).lower() in CANCEL_STATUSES:
            user_cancel_rate[uid] += 1
    for uid in user_cancel_rate:
        user_cancel_rate[uid] /= max(1, user_counts[uid])

    rows, meta = [], []
    for o in active:
        uid = o.get("userId", "")
        items = o.get("items") or []
        rows.append(
            [
                float(o.get("total") or 0),
                len(items),
                user_cancel_rate.get(uid, 0),
                1 if o.get("paymentMethod") == "cash" else 0,
                1 if float(o.get("total") or 0) > 500 else 0,
            ]
        )
        meta.append(o)

    if len(rows) < 10:
        return _heuristic_cancel_risk(active, user_cancel_rate)

    y = [
        1 if str(o.get("status", "")).lower() in CANCEL_STATUSES else 0 for o in orders
    ]
    if sum(y) < 2:
        return _heuristic_cancel_risk(active, user_cancel_rate)

    X_train, y_train = [], []
    for o in orders:
        uid = o.get("userId", "")
        items = o.get("items") or []
        X_train.append(
            [
                float(o.get("total") or 0),
                len(items),
                user_cancel_rate.get(uid, 0),
                1 if o.get("paymentMethod") == "cash" else 0,
                1 if float(o.get("total") or 0) > 500 else 0,
            ]
        )
        y_train.append(1 if str(o.get("status", "")).lower() in CANCEL_STATUSES else 0)

    clf = XGBClassifier(n_estimators=50, max_depth=3, random_state=42)
    clf.fit(np.array(X_train), np.array(y_train))

    out = []
    for i, o in enumerate(meta):
        prob = float(clf.predict_proba([rows[i]])[0][1])
        out.append(
            {
                "orderId": o.get("id"),
                "userId": o.get("userId"),
                "total": o.get("total"),
                "status": o.get("status"),
                "cancelRisk": round(prob, 3),
                "highRisk": prob >= 0.55,
                "model": "xgboost",
            }
        )
    out.sort(key=lambda x: -x["cancelRisk"])
    return out[:25]


def _heuristic_cancel_risk(orders: list[dict], user_cancel_rate: dict) -> list[dict]:
    out = []
    for o in orders:
        uid = o.get("userId", "")
        prob = min(0.92, 0.2 + user_cancel_rate.get(uid, 0) * 2 + (0.15 if float(o.get("total") or 0) > 400 else 0))
        out.append(
            {
                "orderId": o.get("id"),
                "userId": uid,
                "total": o.get("total"),
                "status": o.get("status"),
                "cancelRisk": round(prob, 3),
                "highRisk": prob >= 0.55,
                "model": "heuristic",
            }
        )
    out.sort(key=lambda x: -x["cancelRisk"])
    return out[:25]


def rank_products_senior_dog(
    pet: dict, products: list[dict], orders: list[dict], limit: int = 12
) -> list[dict]:
    """Ranking produits pour chien senior (XGBoost + règles métier)."""
    pet_type = (pet.get("type") or "dog").lower()
    age = _pet_age_years(pet.get("birthDate"))
    stage = _life_stage(pet_type, age)

    if pet_type != "dog":
        stage = _life_stage(pet_type, age)

    dog_products = [p for p in products if (p.get("animalType") or "other") in ("dog", "other")]
    if not dog_products:
        dog_products = products

    bought_ids = set()
    for o in orders:
        if o.get("userId") != pet.get("ownerId"):
            continue
        for it in o.get("items") or []:
            if it.get("productId"):
                bought_ids.add(it["productId"])

    training_rows, training_y = [], []
    for o in orders:
        for it in o.get("items") or []:
            pid = it.get("productId")
            prod = next((p for p in products if p.get("id") == pid), None)
            if not prod:
                continue
            pname = prod.get("name", "")
            training_rows.append(
                [
                    _senior_dog_match_score(
                        pname,
                        prod.get("description") or "",
                        prod.get("tags") or "",
                        prod.get("category") or "",
                    ),
                    float(prod.get("popularity") or 0) / 100,
                    float(prod.get("rating_avg") or 0) / 5,
                    float(prod.get("price") or 0) / 100,
                    1 if (prod.get("animalType") == "dog") else 0,
                ]
            )
            training_y.append(1)

    use_xgb = len(training_rows) >= 15 and len(set(training_y)) >= 1

    scored = []
    for p in dog_products:
        base = _senior_dog_match_score(
            p.get("name", ""),
            p.get("description") or "",
            p.get("tags") or "",
            p.get("category") or "",
        )
        if stage != "senior" and pet_type == "dog" and age and age < 7:
            base *= 0.7

        feats = [
            base,
            float(p.get("popularity") or 0) / 100,
            float(p.get("rating_avg") or 0) / 5,
            float(p.get("price") or 0) / 100,
            1 if p.get("animalType") == "dog" else 0,
        ]

        if use_xgb and training_rows:
            try:
                reg = XGBRegressor(n_estimators=30, max_depth=3, random_state=42)
                reg.fit(np.array(training_rows), np.array(training_y))
                ml_score = float(reg.predict([feats])[0])
                score = min(1.0, 0.5 * base + 0.5 * ml_score)
                model = "xgboost_rank"
            except Exception:
                score = base
                model = "rules"
        else:
            score = base + (float(p.get("popularity") or 0) / 500)
            model = "rules"

        if p.get("id") in bought_ids:
            score += 0.05
        reasons = []
        if stage == "senior":
            reasons.append("Formule senior")
        if p.get("animalType") == "dog":
            reasons.append(f"Pour {pet.get('name', 'votre chien')}")
        if float(p.get("rating_avg") or 0) >= 4.5:
            reasons.append("Bien noté")

        scored.append(
            {
                "productId": p.get("id"),
                "productName": p.get("name"),
                "score": round(min(1, score), 3),
                "rank": 0,
                "reasons": reasons or ["Adapté à votre animal"],
                "model": model,
                "lifeStage": stage,
            }
        )

    scored.sort(key=lambda x: -x["score"])
    for i, s in enumerate(scored[:limit]):
        s["rank"] = i + 1
    return scored[:limit]


def detect_anomalies(orders: list[dict]) -> dict:
    """Fraude (Isolation Forest) + pics de commandes (z-score journalier)."""
    fraud_alerts = []
    volume_spikes = []

    if not orders:
        return {"fraudAlerts": [], "volumeSpikes": [], "model": "none"}

    feats, meta = [], []
    user_totals: dict[str, list[float]] = defaultdict(list)
    for o in orders:
        uid = o.get("userId", "")
        user_totals[uid].append(float(o.get("total") or 0))

    for o in orders:
        uid = o.get("userId", "")
        hist = user_totals.get(uid, [0])
        avg_u = np.mean(hist) if hist else 0
        dt = _parse_dt(o.get("createdAt"))
        hour = dt.hour if dt else 12
        total = float(o.get("total") or 0)
        feats.append(
            [
                total,
                len(o.get("items") or []),
                hour,
                total / (avg_u + 1),
                1 if total > 800 else 0,
                1 if len(hist) <= 1 else 0,
            ]
        )
        meta.append(o)

    if len(feats) >= 12:
        iso = IsolationForest(contamination=0.08, random_state=42)
        preds = iso.fit_predict(np.array(feats))
        for i, pred in enumerate(preds):
            if pred == -1:
                o = meta[i]
                fraud_alerts.append(
                    {
                        "orderId": o.get("id"),
                        "userId": o.get("userId"),
                        "total": o.get("total"),
                        "reason": "Montant ou comportement atypique (Isolation Forest)",
                        "severity": "high" if float(o.get("total") or 0) > 600 else "medium",
                        "model": "isolation_forest",
                    }
                )

    daily: dict[str, int] = defaultdict(int)
    daily_rev: dict[str, float] = defaultdict(float)
    for o in orders:
        dt = _parse_dt(o.get("createdAt"))
        if not dt:
            continue
        key = dt.strftime("%Y-%m-%d")
        daily[key] += 1
        daily_rev[key] += float(o.get("total") or 0)

    if len(daily) >= 7:
        counts = np.array(list(daily.values()))
        mean_c, std_c = counts.mean(), counts.std() or 1
        for day, cnt in daily.items():
            z = (cnt - mean_c) / std_c
            if z >= 2.2:
                volume_spikes.append(
                    {
                        "date": day,
                        "orderCount": cnt,
                        "revenue": round(daily_rev[day], 2),
                        "zScore": round(float(z), 2),
                        "reason": "Pic anormal de commandes",
                        "model": "zscore",
                    }
                )

    fraud_alerts.sort(key=lambda x: -float(x.get("total") or 0))
    volume_spikes.sort(key=lambda x: -x.get("zScore", 0))

    return {
        "fraudAlerts": fraud_alerts[:15],
        "volumeSpikes": volume_spikes[:10],
        "model": "isolation_forest+zscore",
    }


def run_platform_insights(snapshot: dict) -> dict:
    orders = [o if isinstance(o, dict) else o for o in snapshot.get("orders", [])]
    products = snapshot.get("products", [])
    users = snapshot.get("users", [])
    pets = snapshot.get("pets", [])

    revenue_history = snapshot.get("revenue_history") or _build_revenue_history(orders)

    next_month = {"model": "naive", "forecastRevenue": 0, "details": {}}
    if len(revenue_history) >= 5:
        try:
            fc = forecast_sales(revenue_history, 1)
            next_month = {
                "model": fc.get("model"),
                "modelLabel": fc.get("modelLabel"),
                "forecastRevenue": fc["predictions"][0]["revenue"] if fc.get("predictions") else 0,
                "revenueLow": fc["predictions"][0].get("revenueLow") if fc.get("predictions") else 0,
                "revenueHigh": fc["predictions"][0].get("revenueHigh") if fc.get("predictions") else 0,
                "metrics": fc.get("metrics"),
            }
        except Exception as e:
            next_month = {"model": "error", "error": str(e)}
    elif revenue_history:
        next_month = {
            "model": "heuristic",
            "forecastRevenue": revenue_history[-1]["revenue"],
        }

    senior_rank = None
    senior_pet = next(
        (
            p
            for p in pets
            if (p.get("type") or "").lower() == "dog"
            and _life_stage("dog", _pet_age_years(p.get("birthDate"))) == "senior"
        ),
        None,
    )
    if not senior_pet and pets:
        senior_pet = next((p for p in pets if (p.get("type") or "").lower() == "dog"), pets[0])
    if senior_pet:
        senior_rank = rank_products_senior_dog(senior_pet, products, orders, 10)

    return {
        "pythonPowered": True,
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "nextMonthRevenue": next_month,
        "productDemand": _product_demand_forecast(orders, products, 12),
        "churnPredictions": _churn_predictions(orders, users),
        "cancelRiskOrders": _cancel_risk_orders(orders),
        "seniorDogRanking": senior_rank,
        "anomalyDetection": detect_anomalies(orders),
        "modelsUsed": [
            "xgboost_revenue",
            "xgboost_product_demand",
            "xgboost_churn",
            "xgboost_cancel_risk",
            "xgboost_rank_senior_dog",
            "isolation_forest_fraud",
            "zscore_volume",
        ],
    }
