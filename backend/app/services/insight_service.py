from app.knowledge.service import KnowledgeService
from app.llm.base import LLMService
from app.models import Variant
from app.schemas import DiscoveryPreferences, SmartInsight
from app.services.ownership_calculator import OwnershipCalculator


class InsightService:
    def __init__(self, llm: LLMService):
        self.llm = llm
        self.knowledge = KnowledgeService()

    def generate(self, preferences: DiscoveryPreferences, scored: list[dict]) -> list[SmartInsight]:
        insights: list[SmartInsight] = []
        top = scored[0]["variant"] if scored else None

        unlocked = [
            item
            for item in scored
            if preferences.budget_max < item["variant"].price <= preferences.budget_max + 200000
        ]
        if unlocked:
            variant = unlocked[0]["variant"]
            insights.append(
                SmartInsight(
                    title="Increase budget by ₹2 lakh",
                    type="budget",
                    description=f"You unlock {variant.car.brand.name} {variant.car.model}, which adds stronger safety, richer comfort, or lower ownership friction.",
                    impact="Useful if your current shortlist feels like a compromise.",
                )
            )

        hybrid = next(
            (item["variant"] for item in scored if item["variant"].fuel_type == "Hybrid"),
            None,
        )
        if top and hybrid and top.id != hybrid.id:
            savings = max(
                OwnershipCalculator.five_year_cost(top, preferences)
                - OwnershipCalculator.five_year_cost(hybrid, preferences),
                0,
            )
            if savings > 30000:
                insights.append(
                    SmartInsight(
                        title="Hybrid fuel switch",
                        type="fuel",
                        description=f"Your monthly running makes hybrid ownership meaningful; it can save about ₹{savings:,} over five years.",
                        impact="Best when low running cost matters more than outright performance.",
                    )
                )

        if "Elderly Parents" in preferences.future_plans:
            insights.append(
                SmartInsight(
                    title="Family comfort adjustment",
                    type="family",
                    description="Cars with higher ground clearance, automatic transmission, and softer long-distance manners were ranked higher.",
                    impact="This improves daily usability for older passengers.",
                )
            )

        if "Need Big Boot" in preferences.future_plans or preferences.family_size >= 5:
            insights.append(
                SmartInsight(
                    title="Boot space pressure",
                    type="future",
                    description="Your future needs make boot space a deciding factor, so compact premium cars lose points despite good features.",
                    impact="Prevents buying a car that feels perfect now but cramped within two years.",
                )
            )

        if top:
            insights.append(self._ownership_insight(top, preferences))

        # Fetch dynamic knowledge insights (Broader query to ensure more frequent nudges)
        queries = []
        
        # 1. Brand-specific queries (for recalls, updates, news)
        if top:
            queries.append(f"{top.car.brand.name} {top.car.model} updates recall safety")
            
        # 2. Fuel-specific queries (for E20, EV, Hybrid norms)
        fuel_pref = preferences.fuel_types[0].lower() if preferences.fuel_types else "petrol"
        queries.append(f"{fuel_pref} fuel standards emissions E20 hybrid EV")
            
        # 3. Purpose / Usage queries (for BS6 diesel norms or family safety)
        if preferences.family_size >= 4:
            queries.append("family safety ADAS Bharat NCAP airbags")
        if preferences.monthly_running_km >= 1000:
            queries.append("high mileage running costs emissions BS6")
            
        seen_titles = set()
        
        for q in queries:
            contexts = self.knowledge.get_context(q, top_k=1)
            for ctx in contexts:
                # Add as an insight if relevant and not already added
                if ctx.title not in seen_titles and ctx.relevance_score > 0.35:
                    seen_titles.add(ctx.title)
                    
                    # Dynamically generate the description using LLM
                    system_prompt = "You are a personalized AI Car Advisor. Summarize this knowledge snippet in exactly one conversational sentence, linking it to the user's driving profile. Do not invent facts."
                    user_prompt = f"Knowledge: {ctx.content}\nUser drives {preferences.monthly_running_km}km/month, likes {', '.join(preferences.fuel_types) if preferences.fuel_types else 'any fuel'}.\nWrite exactly 1 short sentence of advice."
                    
                    try:
                        description = self.llm.chat([
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ])
                    except Exception:
                        description = f"{ctx.content[:160]}... Relevant to your preferences ({(preferences.fuel_types[0] if preferences.fuel_types else 'General')}, {preferences.monthly_running_km}km/m)."

                    insights.append(
                        SmartInsight(
                            title=ctx.title,
                            type="knowledge",
                            description=description,
                            impact="Keeps you updated with the latest automotive intelligence.",
                            source=ctx.metadata.source,
                            updated_date=ctx.metadata.updated_date,
                            confidence=ctx.metadata.confidence,
                        )
                    )

        return insights[:4]

    def _ownership_insight(self, variant: Variant, preferences: DiscoveryPreferences) -> SmartInsight:
        five_year = OwnershipCalculator.five_year_cost(variant, preferences)
        return SmartInsight(
            title="Five-year ownership view",
            type="ownership",
            description=f"{variant.car.brand.name} {variant.car.model} is estimated at about ₹{five_year:,} for fuel, insurance, maintenance, and service.",
            impact="Use this to compare the real cost of living with the car, not only ex-showroom price.",
        )

