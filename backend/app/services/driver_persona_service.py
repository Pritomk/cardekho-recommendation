from app.schemas import DiscoveryPreferences, DriverPersona


class DriverPersonaService:
    def build(self, preferences: DiscoveryPreferences) -> DriverPersona:
        top_priority = preferences.priority_ranking[0] if preferences.priority_ranking else "Safety"
        future = set(preferences.future_plans)

        if preferences.family_size >= 5 and top_priority == "Safety":
            name = "Safety First Family"
        elif preferences.monthly_running_km >= 1400 or top_priority == "Mileage":
            name = "Mileage Champion"
        elif preferences.driving_style in {"Mountain", "Village"} or preferences.purpose == "Adventure":
            name = "Adventure Seeker"
        elif preferences.purpose == "First Car":
            name = "Confident First Car Buyer"
        elif top_priority in {"Comfort", "Luxury"}:
            name = "Comfort Lover"
        elif preferences.driving_style == "Highway":
            name = "Weekend Traveller"
        else:
            name = "Urban Explorer"

        family_note = (
            "You need space and easy access for a growing household."
            if {"Planning Kids", "Elderly Parents", "Pets"} & future
            else "You need practical five-seat comfort without overbuying."
        )

        return DriverPersona(
            name=name,
            summary=(
                f"You are optimizing for {top_priority.lower()} while keeping ownership "
                f"comfortable within a ₹{preferences.budget_max // 100000} lakh ceiling."
            ),
            driving_habits=f"Mostly {preferences.driving_style.lower()} use with about {preferences.monthly_running_km} km per month.",
            budget_behaviour="Value-conscious, but willing to stretch when the upgrade changes safety, comfort, or long-term cost.",
            risk_tolerance="Low" if top_priority == "Safety" else "Moderate",
            comfort_preference="Automatic convenience matters." if preferences.transmission == "Automatic" else "You are open to simpler mechanical choices.",
            family_needs=family_note,
            ownership_goals="A car that stays sensible over five years, not just exciting on delivery day.",
        )

