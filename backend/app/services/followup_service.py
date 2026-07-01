from sqlalchemy.orm import Session

from app.llm.base import LLMService
from app.models import Recommendation, Variant
from app.repositories.car_repository import CarRepository
from app.repositories.session_repository import SessionRepository
from app.schemas import DiscoveryPreferences, FollowUpResponse
from app.knowledge.service import KnowledgeService


class FollowUpService:
    def __init__(self, db: Session, llm: LLMService):
        self.db = db
        self.llm = llm
        self.cars = CarRepository(db)
        self.sessions = SessionRepository(db)
        self.knowledge = KnowledgeService()

    def answer(self, session_id: str, question: str, variant_id: int | None = None) -> FollowUpResponse:
        session = self.sessions.get(session_id)
        if session is None:
            raise ValueError("Session not found")

        preferences = DiscoveryPreferences(**session.preferences)
        variants = self._context_variants(session_id, variant_id)
        
        # Knowledge Retrieval
        knowledge_contexts = self.knowledge.get_context(question, top_k=2)
        knowledge_text = self.knowledge.format_context_for_prompt(knowledge_contexts)
        
        draft = self._draft_answer(question, preferences, variants)
        
        # Explicitly instruct LLM not to hallucinate facts
        system_prompt = (
            "You are an automotive intelligence advisor. "
            "Use the provided KNOWLEDGE CONTEXT to answer the question if relevant. "
            "Do NOT invent facts about regulations, safety, or cars outside the provided context. "
            "Personalize the answer to the user's profile and recommendations."
        )
        
        answer = self.llm.chat(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            context={
                "answer": draft, 
                "preferences": preferences.model_dump(),
                "knowledge_context": knowledge_text
            },
        )
        
        # Attach sources
        sources = []
        for ctx in knowledge_contexts:
            sources.append({
                "source": ctx.metadata.source,
                "updated_date": ctx.metadata.updated_date,
                "confidence": ctx.metadata.confidence,
            })
            
        return FollowUpResponse(
            answer=answer,
            context_used={
                "session_id": session_id,
                "variant_ids": [variant.id for variant in variants],
                "preference_summary": preferences.model_dump(),
                "knowledge_sources": sources,
            },
        )

    def _context_variants(self, session_id: str, variant_id: int | None) -> list[Variant]:
        if variant_id:
            return self.cars.get_variants([variant_id])

        rows = (
            self.db.query(Recommendation)
            .filter(Recommendation.session_id == session_id)
            .order_by(Recommendation.id.desc())
            .limit(3)
            .all()
        )
        return self.cars.get_variants([row.variant_id for row in rows])

    def _draft_answer(
        self,
        question: str,
        preferences: DiscoveryPreferences,
        variants: list[Variant],
    ) -> str:
        if not variants:
            return "I need a generated recommendation before I can answer this with car-specific context."

        question_l = question.lower()
        primary = variants[0]
        spec = primary.specification
        label = f"{primary.car.brand.name} {primary.car.model}"

        if "hill" in question_l or "mountain" in question_l:
            confidence = "good" if spec.ground_clearance_mm >= 200 and "1.5" in spec.engine else "acceptable"
            return (
                f"For hills, {label} is {confidence}: it has {spec.ground_clearance_mm} mm ground clearance and a {spec.engine} engine. "
                f"Because your profile includes {preferences.driving_style.lower()} driving, I would still test it with passengers before buying."
            )

        if "10 year" in question_l or "ten year" in question_l or "long" in question_l:
            return (
                f"{label} can be a sensible long-term car if you are comfortable with its service cost of about "
                f"₹{spec.service_cost_annual:,} per year. I would prioritize reliability, parts availability, and safety over sunroof-style features for a 10-year hold."
            )

        if "maintenance" in question_l or "expensive" in question_l:
            annual = spec.maintenance_cost_annual + spec.service_cost_annual
            return (
                f"{label} is estimated around ₹{annual:,} per year for maintenance and scheduled service. "
                "That matters because your recommendation weights ownership cost, not only purchase price."
            )

        if "compare" in question_l or "versus" in question_l or "vs" in question_l:
            labels = ", ".join(f"{variant.car.brand.name} {variant.car.model}" for variant in variants)
            return (
                f"Within your shortlist, compare them this way: {labels}. "
                "Choose the one whose strongest score matches the preference you are least willing to compromise on."
            )

        return (
            f"For your {preferences.driving_style.lower()} usage and ₹{preferences.budget_max // 100000} lakh budget ceiling, "
            f"{label} remains a fit because it balances safety, comfort, running cost, and family practicality rather than optimizing one spec in isolation."
        )

