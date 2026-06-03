"""Tests suite ML plateforme."""
import pytest

from app.ml.platform_engine import run_platform_insights, rank_products_senior_dog


def _demo_snapshot():
    orders = []
    products = [
        {"id": "p1", "name": "Croquettes Senior Chien", "price": 55, "category": "nourriture", "animalType": "dog", "tags": "senior", "popularity": 90, "rating_avg": 4.7},
        {"id": "p2", "name": "Snack Chiot", "price": 12, "category": "snack", "animalType": "dog", "tags": "junior", "popularity": 70, "rating_avg": 4.2},
    ]
    for m in range(1, 9):
        orders.append({
            "id": f"o{m}",
            "userId": "u1",
            "total": 4000 + m * 200,
            "status": "delivered",
            "paymentMethod": "card",
            "createdAt": f"2025-{m:02d}-15T10:00:00",
            "items": [{"productId": "p1", "quantity": 2 + m % 3, "price": 55}],
        })
    return {
        "orders": orders,
        "products": products,
        "users": [{"id": "u1", "role": "client", "name": "Test"}],
        "pets": [{"id": "pet1", "ownerId": "u1", "name": "Rex", "type": "dog", "birthDate": "2015-06-01T00:00:00"}],
    }


def test_platform_insights_full():
    out = run_platform_insights(_demo_snapshot())
    assert out["nextMonthRevenue"]["forecastRevenue"] > 0
    assert len(out["productDemand"]) >= 1
    assert len(out["churnPredictions"]) >= 1
    assert "anomalyDetection" in out


def test_senior_dog_ranking():
    snap = _demo_snapshot()
    rank = rank_products_senior_dog(snap["pets"][0], snap["products"], snap["orders"], 5)
    assert rank[0]["productName"]
    assert rank[0]["rank"] == 1
