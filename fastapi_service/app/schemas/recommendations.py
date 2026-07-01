from pydantic import BaseModel, Field
from typing import Any


class ReviewInput(BaseModel):
    productId: str | None = None
    rating: float = 0
    comment: str = ""
    userId: str | None = None


class UserProfileInput(BaseModel):
    userId: str
    role: str = "client"
    petType: str | None = None
    petName: str | None = None
    weightKg: float | None = None
    breed: str | None = None
    preferences: list[str] = Field(default_factory=list)
    favoriteCategories: list[str] = Field(default_factory=list)
    historyProductIds: list[str] = Field(default_factory=list)


class HybridRecommendationRequest(BaseModel):
    role: str = "client"
    userId: str | None = None
    profile: UserProfileInput | None = None
    products: list[dict[str, Any]] = Field(default_factory=list)
    orders: list[dict[str, Any]] = Field(default_factory=list)
    reviews: list[ReviewInput] = Field(default_factory=list)
    interactions: list[dict[str, Any]] = Field(default_factory=list)
    limit: int = 10
    query: str | None = None
    minRating: float | None = None


class AdminClientRecommendationRequest(BaseModel):
    targetUserId: str
    profile: UserProfileInput
    products: list[dict[str, Any]] = Field(default_factory=list)
    orders: list[dict[str, Any]] = Field(default_factory=list)
    reviews: list[ReviewInput] = Field(default_factory=list)
    pets: list[dict[str, Any]] = Field(default_factory=list)
    limit: int = 12


class SalesExplainRequest(BaseModel):
    orders: list[dict[str, Any]] = Field(default_factory=list)
    products: list[dict[str, Any]] = Field(default_factory=list)
    reviews: list[ReviewInput] = Field(default_factory=list)
    revenue_history: list[dict[str, Any]] = Field(default_factory=list)
