from typing import Any

from pydantic import BaseModel, Field


class OrderItemIn(BaseModel):
    productId: str | None = None
    quantity: int = 1
    price: float = 0
    category: str | None = None
    animalType: str | None = None
    productName: str | None = None


class OrderIn(BaseModel):
    id: str
    userId: str
    total: float = 0
    status: str = "pending"
    paymentMethod: str | None = None
    region: str | None = None
    createdAt: str
    items: list[OrderItemIn] = Field(default_factory=list)


class ProductIn(BaseModel):
    id: str
    name: str
    price: float = 0
    category: str = "nourriture"
    animalType: str = "other"
    tags: str | None = None
    popularity: float = 0
    rating_avg: float = 0
    stock: int = 0


class UserIn(BaseModel):
    id: str
    role: str = "client"
    createdAt: str | None = None
    region: str | None = None


class PetIn(BaseModel):
    id: str | None = None
    ownerId: str
    name: str = "Animal"
    type: str = "dog"
    breed: str | None = None
    birthDate: str | None = None
    weight: float | None = None


class PlatformSnapshot(BaseModel):
    orders: list[OrderIn] = Field(default_factory=list)
    products: list[ProductIn] = Field(default_factory=list)
    users: list[UserIn] = Field(default_factory=list)
    pets: list[PetIn] = Field(default_factory=list)
    revenue_history: list[dict] = Field(default_factory=list)


class PetRankRequest(BaseModel):
    pet: PetIn
    products: list[ProductIn] = Field(default_factory=list)
    limit: int = Field(default=12, ge=1, le=50)
    orders: list[OrderIn] = Field(default_factory=list)


class OrderRiskRequest(BaseModel):
    order: OrderIn
    user_order_history: list[OrderIn] = Field(default_factory=list)


class PlatformInsightsResponse(BaseModel):
    pythonPowered: bool = True
    generatedAt: str
    nextMonthRevenue: dict
    productDemand: list[dict]
    churnPredictions: list[dict]
    cancelRiskOrders: list[dict]
    seniorDogRanking: list[dict] | None = None
    anomalyDetection: dict
    modelsUsed: list[str]
