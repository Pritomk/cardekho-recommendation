from app.schemas import BuyerReport, DiscoveryPreferences, DriverPersona, RecommendationCard


class BuyerReportService:
    def build(
        self,
        preferences: DiscoveryPreferences,
        persona: DriverPersona,
        top_cards: list[RecommendationCard],
    ) -> BuyerReport:
        best = top_cards[0] if top_cards else None
        best_label = f"{best.brand} {best.model}" if best else "the top recommendation"

        return BuyerReport(
            sections={
                "Your Lifestyle": f"{persona.name}: {persona.driving_habits} {persona.family_needs}",
                "Your Priorities": f"Your strongest signals are {', '.join(preferences.priority_ranking[:3])}. The scoring weights were adjusted around those priorities.",
                "How We Evaluated Cars": "The backend scored each car across safety, comfort, mileage, maintenance, driving match, family match, resale, performance, ownership cost, and budget fit.",
                "Why This Recommendation Fits You": f"{best_label} rose to the top because it fits your stated use case instead of merely ranking well on generic popularity.",
                "Tradeoffs": "The recommendation favors practical alignment over max features. Cars with weak safety, high ownership cost, or poor family fit were pushed down.",
                "Long-term Ownership Advice": "Recheck the shortlist if your running crosses 1,500 km per month, your family size changes, or you become open to a higher budget.",
            }
        )

