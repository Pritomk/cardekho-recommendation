from sqlalchemy.orm import Session

from app.models import Recommendation
from app.recommendation_engine.scoring import score_variant
from app.repositories.car_repository import CarRepository
from app.repositories.session_repository import SessionRepository
from app.schemas import CompareItem, CompareResponse, DiscoveryPreferences, ScoreBreakdown


LABELS = {
    "safety": "safety matters",
    "comfort": "comfort matters",
    "maintenance": "low maintenance matters",
    "mileage": "mileage matters",
    "driving_match": "your driving pattern matters",
    "family_match": "family practicality matters",
    "ownership_cost": "five-year cost matters",
    "resale": "resale matters",
    "performance": "performance matters",
    "budget_match": "budget discipline matters",
}


class ComparisonService:
    def __init__(self, db: Session):
        self.db = db
        self.cars = CarRepository(db)
        self.sessions = SessionRepository(db)

    def compare(self, session_id: str, variant_ids: list[int] | None = None) -> CompareResponse:
        session = self.sessions.get(session_id)
        if session is None:
            raise ValueError("Session not found")

        preferences = DiscoveryPreferences(**session.preferences)
        ids = variant_ids or self._latest_recommendation_ids(session_id)
        variants = self.cars.get_variants(ids)
        variants_by_id = {variant.id: variant for variant in variants}
        ordered_variants = [variants_by_id[variant_id] for variant_id in ids if variant_id in variants_by_id]

        items: list[CompareItem] = []
        totals: dict[int, float] = {}

        for variant in ordered_variants:
            scores = score_variant(variant, preferences)
            totals[variant.id] = scores["total_score"]
            score_breakdown = ScoreBreakdown(**{key: scores[key] for key in ScoreBreakdown.model_fields})
            strongest = max(score_breakdown.model_dump(), key=score_breakdown.model_dump().get)
            label = f"{variant.car.brand.name} {variant.car.model}"
            items.append(
                CompareItem(
                    variant_id=variant.id,
                    label=label,
                    best_for=f"Choose {variant.car.model} if {LABELS[strongest]}.",
                    ai_summary=self._summary(label, strongest, scores["total_score"]),
                    scores=score_breakdown,
                )
            )

        winner = max(items, key=lambda item: totals[item.variant_id]) if items else None
        verdict = (
            f"{winner.label} is the most balanced fit for this profile, but the best choice changes if your top priority changes."
            if winner
            else "No comparable recommendations are available yet."
        )
        return CompareResponse(session_id=session_id, items=items, verdict=verdict)

    def _latest_recommendation_ids(self, session_id: str) -> list[int]:
        rows = (
            self.db.query(Recommendation)
            .filter(Recommendation.session_id == session_id)
            .order_by(Recommendation.id.desc())
            .limit(12)
            .all()
        )
        ids: list[int] = []
        for row in rows:
            if row.variant_id not in ids:
                ids.append(row.variant_id)
            if len(ids) == 3:
                break
        return ids

    def _summary(self, label: str, strongest: str, total_score: float) -> str:
        return (
            f"{label} scores {total_score:g}/100 for this buyer profile. "
            f"Its strongest relative advantage is {LABELS[strongest]}, so it should be considered through that lens rather than by specs alone."
        )

