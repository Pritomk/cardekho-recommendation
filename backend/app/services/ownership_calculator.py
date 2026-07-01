from app.models import Variant
from app.schemas import DiscoveryPreferences


class OwnershipCalculator:
    FUEL_PRICES = {
        "petrol": 105,
        "diesel": 92,
        "hybrid": 82,
        "cng": 78,
        "ev": 18,
    }

    @classmethod
    def monthly_cost(cls, variant: Variant, preferences: DiscoveryPreferences) -> int:
        spec = variant.specification
        fuel_price = cls.FUEL_PRICES.get(variant.fuel_type.lower(), 100)
        monthly_fuel = (preferences.monthly_running_km / max(spec.mileage, 1)) * fuel_price
        monthly_insurance = variant.price * 0.032 / 12
        monthly_maintenance = (
            spec.maintenance_cost_annual + spec.service_cost_annual
        ) / 12
        estimate = monthly_fuel + monthly_insurance + monthly_maintenance
        return int(round(estimate / 100) * 100)

    @classmethod
    def five_year_cost(cls, variant: Variant, preferences: DiscoveryPreferences) -> int:
        return cls.monthly_cost(variant, preferences) * 60

