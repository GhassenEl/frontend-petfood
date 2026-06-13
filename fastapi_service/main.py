from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import random

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

from auth_jwt import require_jwt

load_dotenv()

app = FastAPI(title="PetfoodTN Recommendation API", version="2.0.0")

# CORS - Allow all origins for development to prevent iframe loading errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/petfood")
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()

class RecommendationRequest(BaseModel):
    userId: str
    limit: int = 8

class ProductRecommendation(BaseModel):
    product: dict
    score: float
    reason: str

class SentimentRequest(BaseModel):
    comment: str

class SentimentResponse(BaseModel):
    emotion: str
    confidence: float
    stars: int
    raw_scores: dict

@app.get("/")
def read_root():
    return {"message": "PetfoodTN FastAPI Recommendation Service v2", "status": "running"}

@app.post("/recommendations", response_model=List[ProductRecommendation])
async def get_recommendations(req: RecommendationRequest):
    """
    ML-based product recommendation engine using MongoDB data.
    Hybrid approach: content-based + collaborative filtering + emotion-based scoring.
    """
    try:
        user_id = req.userId
        if not ObjectId.is_valid(user_id):
            # Fallback for demo IDs like 'demo_client'
            user_id = None
        else:
            user_id = ObjectId(user_id)

        # Fetch user profile
        user = None
        if user_id:
            user = await db.users.find_one({"_id": user_id})
        
        # Fetch all products
        products_cursor = db.products.find()
        products = await products_cursor.to_list(length=100)
        
        if not products:
            # Fallback mock data if MongoDB is empty
            return _get_mock_recommendations(req)

        # Fetch user's orders (purchase history)
        order_items = []
        if user_id:
            orders_cursor = db.orders.find({"userId": user_id})
            orders = await orders_cursor.to_list(length=100)
            for order in orders:
                for item in order.get("items", []):
                    pid = item.get("productId")
                    if isinstance(pid, ObjectId):
                        order_items.append(str(pid))
                    elif isinstance(pid, dict):
                        order_items.append(str(pid.get("_id", "")))
                    elif isinstance(pid, str):
                        order_items.append(pid)

        # Fetch user's reviews with emotions
        user_reviews = []
        positive_pids = []
        negative_pids = []
        if user_id:
            reviews_cursor = db.reviews.find({"userId": user_id})
            user_reviews = await reviews_cursor.to_list(length=100)
            for review in user_reviews:
                pid = review.get("productId")
                pid_str = str(pid) if isinstance(pid, ObjectId) else str(pid)
                emotion = review.get("emotion", "neutral")
                rating = review.get("rating", 3)
                if emotion in ["happy", "satisfied"] and rating >= 4:
                    positive_pids.append(pid_str)
                elif emotion in ["disappointed", "frustrated"] or rating <= 2:
                    negative_pids.append(pid_str)

        # Compute recommendations
        scored_products = []
        for product in products:
            p_id = str(product.get("_id", ""))
            score = 0.0
            reasons = []

            p_animal = product.get("animalType", "other")
            p_category = product.get("category", "")
            p_tags = product.get("tags", [])
            p_discount = product.get("discount", 0) or 0
            p_popularity = product.get("popularity", 0) or 0
            p_rating_avg = product.get("rating_avg", 0) or 0

            # 1. Pet type match
            if user and user.get("petType") and p_animal == user.get("petType"):
                score += 0.30
                reasons.append(f"🐾 Pour votre {p_animal}")

            # 2. Favorite category match
            if user and p_category in user.get("favoriteCategories", []):
                score += 0.20
                reasons.append("❤️ Catégorie préférée")

            # 3. Positive emotion boost
            if p_id in positive_pids:
                score += 0.15
                reasons.append("😊 Vous avez adoré !")

            # 4. Similar to positively reviewed
            liked_types = []
            liked_cats = []
            for review in user_reviews:
                if str(review.get("productId", "")) in positive_pids:
                    # Need to fetch product details for liked items
                    pass
            # Use stored positive product IDs to get their types/categories
            if positive_pids:
                liked_products_cursor = db.products.find({"_id": {"$in": [ObjectId(pid) for pid in positive_pids if ObjectId.is_valid(pid)]}})
                liked_products = await liked_products_cursor.to_list(length=50)
                liked_types = [lp.get("animalType") for lp in liked_products]
                liked_cats = [lp.get("category") for lp in liked_products]
            
            if p_animal in liked_types:
                score += 0.10
                reasons.append("Similaire à vos coups de cœur")
            if p_category in liked_cats:
                score += 0.08
                reasons.append("Même catégorie que vos favoris")

            # 5. Negative emotion penalty
            if p_id in negative_pids:
                score -= 0.25

            # 6. Purchase history
            if p_id in order_items:
                score += 0.05
                reasons.append("Déjà acheté")

            # 7. Discount appeal
            if p_discount > 0:
                score += (p_discount / 100) * 0.12
                reasons.append(f"💰 -{p_discount}%")

            # 8. Popularity
            score += (p_popularity / 100) * 0.10
            if p_popularity > 85:
                reasons.append("🔥 Très populaire")

            # 9. Rating
            if p_rating_avg >= 4.5:
                score += 0.08
                reasons.append("⭐ Bien noté")

            # 10. Tag match with preferences
            if user:
                prefs = user.get("preferences", [])
                pref_match = any(t in prefs for t in p_tags)
                if pref_match:
                    score += 0.07
                    reasons.append("Correspond à vos préférences")

            # Convert ObjectId to string for serialization
            product_serialized = {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in product.items()}
            
            scored_products.append({
                "product": product_serialized,
                "score": round(min(max(score, 0), 1), 3),
                "reasons": reasons
            })

        # Sort by score
        scored_products.sort(key=lambda x: x["score"], reverse=True)
        
        # Filter out negatively scored and already liked
        filtered = [p for p in scored_products if p["score"] > 0]
        top = filtered[:req.limit]

        recommendations = []
        for item in top:
            recommendations.append(ProductRecommendation(
                product=item["product"],
                score=item["score"],
                reason=item["reasons"][0] if item["reasons"] else "Recommandé pour vous"
            ))

        return recommendations

    except Exception as e:
        print(f"Recommendation error: {e}")
        return _get_mock_recommendations(req)


def _get_mock_recommendations(req: RecommendationRequest):
    """Fallback mock recommendations when MongoDB is unavailable."""
    PRODUCTS = [
        {"_id": "prd_dog_1", "name": "Croquettes Premium Chien", "price": 58, "discount": 15, "animalType": "dog", "category": "nourriture", "popularity": 95, "rating_avg": 4.7},
        {"_id": "prd_cat_1", "name": "Pâtée Équilibre Chat", "price": 24, "discount": 10, "animalType": "cat", "category": "nourriture", "popularity": 88, "rating_avg": 4.5},
        {"_id": "prd_bird_1", "name": "Mélange Vitalité Oiseaux", "price": 19, "discount": 5, "animalType": "bird", "category": "nourriture", "popularity": 65, "rating_avg": 4.3},
        {"_id": "prd_fish_1", "name": "Granulés Aquarium Pro", "price": 16, "discount": 0, "animalType": "fish", "category": "nourriture", "popularity": 72, "rating_avg": 4.4},
        {"_id": "prd_dog_2", "name": "Snack Dentaire Naturel", "price": 14, "discount": 20, "animalType": "dog", "category": "snack", "popularity": 90, "rating_avg": 4.8},
        {"_id": "prd_cat_2", "name": "Litière Confort Chat", "price": 27, "discount": 12, "animalType": "cat", "category": "hygiène", "popularity": 85, "rating_avg": 4.6},
        {"_id": "prd_dog_3", "name": "Shampooing Anti-puces", "price": 22, "discount": 8, "animalType": "dog", "category": "soin", "popularity": 78, "rating_avg": 4.2},
        {"_id": "prd_cat_3", "name": "Arbre à Chat Deluxe", "price": 120, "discount": 25, "animalType": "cat", "category": "accessoire", "popularity": 92, "rating_avg": 4.9},
    ]
    
    recommendations = []
    for product in PRODUCTS[:req.limit]:
        reasons = []
        if product["discount"] > 0:
            reasons.append(f"💰 -{product['discount']}%")
        if product["popularity"] > 85:
            reasons.append("🔥 Très populaire")
        if product["rating_avg"] >= 4.5:
            reasons.append("⭐ Bien noté")
        
        recommendations.append(ProductRecommendation(
            product=product,
            score=round(random.uniform(0.5, 0.95), 3),
            reason=reasons[0] if reasons else "Recommandé pour vous"
        ))
    
    return recommendations


@app.get("/products/popular")
async def get_popular_products(limit: int = 5):
    """Get most popular products from MongoDB"""
    try:
        cursor = db.products.find().sort("popularity", -1).limit(limit)
        products = await cursor.to_list(length=limit)
        return [{k: (str(v) if isinstance(v, ObjectId) else v) for k, v in p.items()} for p in products]
    except Exception:
        return []

@app.get("/products/similar/{product_id}")
async def get_similar_products(product_id: str, limit: int = 3):
    """Find similar products based on animal type and category"""
    try:
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="Invalid product ID")
        
        target = await db.products.find_one({"_id": ObjectId(product_id)})
        if not target:
            raise HTTPException(status_code=404, detail="Product not found")
        
        similar_cursor = db.products.find({
            "_id": {"$ne": ObjectId(product_id)},
            "$or": [
                {"animalType": target.get("animalType")},
                {"category": target.get("category")}
            ]
        }).limit(limit * 2)
        
        similar = await similar_cursor.to_list(length=limit * 2)
        
        # Score and sort
        scored = []
        for p in similar:
            score = 0
            if p.get("animalType") == target.get("animalType"):
                score += 0.5
            if p.get("category") == target.get("category"):
                score += 0.3
            score += (p.get("popularity", 0) / 100) * 0.2
            scored.append({"product": p, "score": score})
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        return [{k: (str(v) if isinstance(v, ObjectId) else v) for k, v in s["product"].items()} for s in scored[:limit]]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(req: SentimentRequest, _user=Depends(require_jwt)):
    from .utils.sentiment import analyze_comment
    result = analyze_comment(req.comment)
    return SentimentResponse(**result)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

