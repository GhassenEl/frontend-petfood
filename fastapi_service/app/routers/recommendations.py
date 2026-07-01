from fastapi import APIRouter

from app.ml.recommendation_engine import (
    admin_client_recommendations,
    explain_sales_traffic,
    filter_by_reviews_nlp,
    run_hybrid_recommendation,
)
from app.schemas.recommendations import (
    AdminClientRecommendationRequest,
    HybridRecommendationRequest,
    SalesExplainRequest,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/hybrid")
def post_hybrid_recommendations(body: HybridRecommendationRequest):
    profile = body.profile.model_dump() if body.profile else {}
    if body.userId:
        profile["userId"] = body.userId
    reviews = [r.model_dump() for r in body.reviews]
    return run_hybrid_recommendation(
        role=body.role,
        profile=profile,
        products=body.products,
        orders=body.orders,
        reviews=reviews,
        limit=body.limit,
        query=body.query,
        min_rating=body.minRating,
    )


@router.post("/admin/client-profile")
def post_admin_client_recommendations(body: AdminClientRecommendationRequest):
    return admin_client_recommendations(
        target_user_id=body.targetUserId,
        profile=body.profile.model_dump(),
        products=body.products,
        orders=body.orders,
        reviews=[r.model_dump() for r in body.reviews],
        pets=body.pets,
        limit=body.limit,
    )


@router.post("/search-reviews")
def post_search_reviews(body: HybridRecommendationRequest):
    reviews = [r.model_dump() for r in body.reviews]
    filtered = filter_by_reviews_nlp(
        body.products,
        reviews,
        query=body.query,
        min_rating=body.minRating,
    )
    return {
        "query": body.query,
        "minRating": body.minRating,
        "count": len(filtered),
        "products": filtered[: body.limit],
    }


@router.post("/explain-sales")
def post_explain_sales(body: SalesExplainRequest):
    return explain_sales_traffic(
        body.orders,
        body.products,
        [r.model_dump() for r in body.reviews],
        body.revenue_history,
    )
