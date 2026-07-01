from typing import Any

from pydantic import BaseModel, Field


class DiscoveryPreferences(BaseModel):
    purpose: str = "Daily Commute"
    budget_min: int = 700000
    budget_max: int = 2000000
    family_size: int = 4
    transmission: str | None = "Automatic"
    fuel_types: list[str] = Field(default_factory=list)
    driving_style: str = "City"
    monthly_running_km: int = 900
    priority_ranking: list[str] = Field(
        default_factory=lambda: [
            "Safety",
            "Comfort",
            "Mileage",
            "Maintenance",
            "Resale",
            "Performance",
            "Luxury",
        ]
    )
    favorite_brands: list[str] = Field(default_factory=list)
    avoid_brands: list[str] = Field(default_factory=list)
    future_plans: list[str] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    session_id: str | None = None
    preferences: DiscoveryPreferences


class DriverPersona(BaseModel):
    name: str
    summary: str
    driving_habits: str
    budget_behaviour: str
    risk_tolerance: str
    comfort_preference: str
    family_needs: str
    ownership_goals: str


class ScoreBreakdown(BaseModel):
    safety: float
    comfort: float
    maintenance: float
    mileage: float
    driving_match: float
    family_match: float
    ownership_cost: float
    resale: float
    performance: float
    budget_match: float


class RecommendationCard(BaseModel):
    variant_id: int
    brand: str
    model: str
    variant: str
    image_url: str | None = None
    price: int
    mileage: float
    safety_rating: float
    transmission: str
    fuel_type: str
    monthly_cost_estimate: int
    total_score: float
    scores: ScoreBreakdown
    why_this_car_for_you: str
    tradeoffs: list[str]
    pros: list[str]
    cons: list[str]


class RejectedCar(BaseModel):
    brand: str
    model: str
    variant: str
    reasons: list[str]


class SmartInsight(BaseModel):
    title: str
    type: str
    description: str
    impact: str
    source: str | None = None
    updated_date: str | None = None
    confidence: str | None = None


class BuyerReport(BaseModel):
    sections: dict[str, str]


class RecommendationResponse(BaseModel):
    session_id: str
    persona: DriverPersona
    top_recommendations: list[RecommendationCard]
    rejected_cars: list[RejectedCar]
    insights: list[SmartInsight]
    buyer_report: BuyerReport


class CompareRequest(BaseModel):
    session_id: str
    variant_ids: list[int] | None = None


class CompareItem(BaseModel):
    variant_id: int
    label: str
    best_for: str
    ai_summary: str
    scores: ScoreBreakdown


class CompareResponse(BaseModel):
    session_id: str
    items: list[CompareItem]
    verdict: str


class FollowUpRequest(BaseModel):
    session_id: str
    question: str
    variant_id: int | None = None


class FollowUpResponse(BaseModel):
    answer: str
    context_used: dict[str, Any]

