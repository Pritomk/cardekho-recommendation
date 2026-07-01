from sqlalchemy.orm import Session

from app.llm.base import LLMService
from app.models import Recommendation, Variant
from app.recommendation_engine.scoring import score_variant
from app.repositories.car_repository import CarRepository
from app.repositories.session_repository import SessionRepository
from app.schemas import (
    BuyerReport,
    DiscoveryPreferences,
    DriverPersona,
    RecommendationCard,
    RecommendationRequest,
    RecommendationResponse,
    RejectedCar,
    ScoreBreakdown,
)
from app.services.buyer_report_service import BuyerReportService
from app.services.driver_persona_service import DriverPersonaService
from app.services.insight_service import InsightService
from app.knowledge.service import KnowledgeService


SCORE_KEYS = [
    "safety",
    "comfort",
    "maintenance",
    "mileage",
    "driving_match",
    "family_match",
    "ownership_cost",
    "resale",
    "performance",
    "budget_match",
]


class RecommendationService:
    def __init__(self, db: Session, llm: LLMService):
        self.db = db
        self.llm = llm
        self.cars = CarRepository(db)
        self.sessions = SessionRepository(db)
        self.personas = DriverPersonaService()
        self.insights = InsightService(llm)
        self.reports = BuyerReportService()
        self.knowledge = KnowledgeService()

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        preferences = request.preferences
        persona = self.personas.build(preferences)
        scored = self._score_all(preferences)
        session = self.sessions.upsert_session(preferences, persona, request.session_id)

        top_items = scored[:3]
        top_variants = [item["variant"] for item in top_items]
        
        # Real-Time Recommendation Validation
        knowledge_contexts = self.knowledge.validate_recommendations(top_variants, preferences)
        knowledge_text = self.knowledge.format_context_for_prompt(knowledge_contexts)

        top_cards = [
            self._build_recommendation_card(item["variant"], item["score"], preferences, persona, knowledge_text)
            for item in top_items
        ]

        for item, card in zip(top_items, top_cards):
            self.db.add(
                Recommendation(
                    session_id=session.id,
                    variant_id=item["variant"].id,
                    score=card.total_score,
                    score_breakdown=card.scores.model_dump(),
                    explanation=card.why_this_car_for_you,
                    tradeoffs=card.tradeoffs,
                )
            )
        self.db.commit()

        rejected = [
            self._build_rejected_car(item["variant"], item["score"], preferences)
            for item in scored[3:]
        ]

        return RecommendationResponse(
            session_id=session.id,
            persona=persona,
            top_recommendations=top_cards,
            rejected_cars=rejected,
            insights=self.insights.generate(preferences, scored),
            buyer_report=self.reports.build(preferences, persona, top_cards),
        )

    def _score_all(self, preferences: DiscoveryPreferences) -> list[dict]:
        scored = [
            {"variant": variant, "score": score_variant(variant, preferences)}
            for variant in self.cars.list_variants()
        ]
        return sorted(scored, key=lambda item: item["score"]["total_score"], reverse=True)

    def _build_recommendation_card(
        self,
        variant: Variant,
        score: dict,
        preferences: DiscoveryPreferences,
        persona: DriverPersona,
        knowledge_text: str = "",
    ) -> RecommendationCard:
        car = variant.car
        spec = variant.specification
        scores = ScoreBreakdown(**{key: score[key] for key in SCORE_KEYS})
        draft = self._explain_fit(variant, scores, preferences, persona)
        explanation = self.llm.generate(
            "Explain why this car fits this buyer. Keep it personal, specific, and transparent.",
            context={"draft": draft, "knowledge_context": knowledge_text},
        )

        return RecommendationCard(
            variant_id=variant.id,
            brand=car.brand.name,
            model=car.model,
            variant=variant.name,
            image_url=car.image_url,
            price=variant.price,
            mileage=spec.mileage,
            safety_rating=spec.safety_rating,
            transmission=variant.transmission,
            fuel_type=variant.fuel_type,
            monthly_cost_estimate=score["monthly_cost_estimate"],
            total_score=score["total_score"],
            scores=scores,
            why_this_car_for_you=explanation,
            tradeoffs=self._tradeoffs(variant, preferences),
            pros=car.pros or [],
            cons=car.cons or [],
        )

    def _explain_fit(
        self,
        variant: Variant,
        scores: ScoreBreakdown,
        preferences: DiscoveryPreferences,
        persona: DriverPersona,
    ) -> str:
        car = variant.car
        spec = variant.specification
        priorities = ", ".join(preferences.priority_ranking[:3]).lower()
        reasons = [
            f"You profile as a {persona.name}, and the {car.brand.name} {car.model} matches your strongest priorities: {priorities}.",
            f"Your use is mostly {preferences.driving_style.lower()}, so its {variant.transmission.lower()} transmission, {spec.ground_clearance_mm} mm ground clearance, and {spec.mileage:g} km/l mileage were scored together rather than judged in isolation.",
        ]

        if preferences.family_size >= 5 or preferences.future_plans:
            reasons.append(
                f"Because your household context matters, the {spec.boot_space_l} L boot, {car.seating_capacity}-seat layout, and {spec.safety_rating:g}-star safety score directly improved its family match."
            )

        if scores.safety >= 80:
            reasons.append("Safety is not a marketing claim here; airbags, crash score, and assist features all contributed to the score.")
        if scores.ownership_cost >= 80:
            reasons.append("The ownership cost stays controlled for your monthly running, so the recommendation should age well after the excitement of purchase.")
        if variant.price > preferences.budget_max:
            reasons.append("It stretches your stated budget, so it is recommended only because the added fit is meaningful.")
        else:
            reasons.append("It stays inside your stated budget, which protects the rest of your ownership plan.")

        return " ".join(reasons)

    def _tradeoffs(self, variant: Variant, preferences: DiscoveryPreferences) -> list[str]:
        car = variant.car
        spec = variant.specification
        tradeoffs = list(car.cons or [])[:2]

        if spec.safety_rating < 4:
            tradeoffs.append("Safety score is weaker than the safest cars in this budget.")
        if spec.boot_space_l < 390 and ("Need Big Boot" in preferences.future_plans or preferences.family_size >= 5):
            tradeoffs.append("Boot space may feel tight as family luggage needs grow.")
        if variant.price > preferences.budget_max:
            tradeoffs.append("Price exceeds your current budget ceiling.")
        if spec.maintenance_cost_annual + spec.service_cost_annual > 28000:
            tradeoffs.append("Annual service and maintenance are higher than lower-cost rivals.")

        return tradeoffs[:4] or ["No major mismatch, but test-drive comfort before finalizing."]

    def _build_rejected_car(
        self,
        variant: Variant,
        score: dict,
        preferences: DiscoveryPreferences,
    ) -> RejectedCar:
        car = variant.car
        reasons: list[str] = []

        if score["safety"] < 70:
            reasons.append("Lower safety score than your priority profile deserves.")
        if score["budget_match"] < 75:
            reasons.append("Too expensive for the value it adds to your use case.")
        if score["family_match"] < 70:
            reasons.append("Less suitable for your family and future space needs.")
        if score["maintenance"] < 70:
            reasons.append("Higher maintenance pressure over five years.")
        if preferences.fuel_types and variant.fuel_type not in preferences.fuel_types:
            reasons.append(f"Fuel type is {variant.fuel_type}, outside your preferred options.")
        if preferences.avoid_brands and car.brand.name in preferences.avoid_brands:
            reasons.append("You marked this brand as one to avoid.")

        if not reasons:
            reasons.append("Good car, but the top three align better with your stated priorities.")

        return RejectedCar(
            brand=car.brand.name,
            model=car.model,
            variant=variant.name,
            reasons=reasons[:3],
        )

