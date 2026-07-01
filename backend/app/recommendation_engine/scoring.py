from app.models import Variant
from app.schemas import DiscoveryPreferences
from app.services.ownership_calculator import OwnershipCalculator


PRIORITY_TO_SCORE_KEY = {
    "Safety": "safety",
    "Comfort": "comfort",
    "Mileage": "mileage",
    "Maintenance": "maintenance",
    "Resale": "resale",
    "Performance": "performance",
    "Luxury": "comfort",
}


def clamp(value: float, lower: float = 0, upper: float = 100) -> float:
    return max(lower, min(upper, value))


def parse_engine_size(engine: str) -> float:
    token = engine.lower().replace("l", "").split()[0]
    try:
        return float(token)
    except ValueError:
        return 1.2


def build_weights(preferences: DiscoveryPreferences) -> dict[str, float]:
    weights = {
        "safety": 0.12,
        "comfort": 0.10,
        "maintenance": 0.10,
        "mileage": 0.10,
        "driving_match": 0.12,
        "family_match": 0.10,
        "ownership_cost": 0.10,
        "resale": 0.08,
        "performance": 0.08,
        "budget_match": 0.10,
    }

    for index, priority in enumerate(preferences.priority_ranking):
        key = PRIORITY_TO_SCORE_KEY.get(priority)
        if key:
            weights[key] += max(0.11 - index * 0.015, 0.025)

    if preferences.family_size >= 5:
        weights["family_match"] += 0.08
        weights["safety"] += 0.04
    if preferences.monthly_running_km >= 1400:
        weights["mileage"] += 0.06
        weights["ownership_cost"] += 0.05
    if "Long Trips" in preferences.future_plans:
        weights["comfort"] += 0.04
        weights["driving_match"] += 0.04

    total = sum(weights.values())
    return {key: value / total for key, value in weights.items()}


def budget_score(price: int, preferences: DiscoveryPreferences) -> float:
    if preferences.budget_min <= price <= preferences.budget_max:
        return 100
    if price < preferences.budget_min:
        return clamp(92 - ((preferences.budget_min - price) / preferences.budget_min) * 20)
    overage = price - preferences.budget_max
    return clamp(100 - (overage / max(preferences.budget_max, 1)) * 180, 5)


def driving_match_score(variant: Variant, preferences: DiscoveryPreferences) -> float:
    spec = variant.specification
    style = preferences.driving_style.lower()
    automatic = variant.transmission.lower() == "automatic"
    engine_size = parse_engine_size(spec.engine)

    if style == "city":
        return clamp(55 + (18 if automatic else 0) + spec.mileage * 1.1 + (8 if variant.fuel_type == "Hybrid" else 0))
    if style == "highway":
        return clamp(45 + engine_size * 18 + spec.safety_rating * 7 + min(spec.boot_space_l / 18, 24))
    if style == "village":
        return clamp(35 + spec.ground_clearance_mm * 0.22 + spec.safety_rating * 7)
    if style == "mountain":
        return clamp(32 + engine_size * 22 + spec.ground_clearance_mm * 0.18 + spec.safety_rating * 6)
    return clamp(45 + spec.mileage * 0.9 + spec.safety_rating * 7 + (10 if automatic else 0))


def score_variant(variant: Variant, preferences: DiscoveryPreferences) -> dict[str, float]:
    car = variant.car
    spec = variant.specification
    monthly_cost = OwnershipCalculator.monthly_cost(variant, preferences)
    engine_size = parse_engine_size(spec.engine)

    safety = clamp((spec.safety_rating / 5) * 68 + min(spec.airbags, 7) * 3 + (11 if spec.adas != "None" else 0))
    comfort = clamp(34 + min(spec.boot_space_l / 7, 26) + spec.ground_clearance_mm * 0.08 + (10 if variant.transmission == "Automatic" else 0) + (8 if car.body_type == "SUV" else 0))
    maintenance = clamp(110 - ((spec.maintenance_cost_annual + spec.service_cost_annual) - 18000) / 400)
    mileage = clamp(((spec.mileage - 10) / 18) * 100)
    driving_match = driving_match_score(variant, preferences)
    family_match = clamp(
        (35 if car.seating_capacity >= preferences.family_size else 12)
        + min(spec.boot_space_l / 8, 28)
        + spec.safety_rating * 7
        + (8 if "Need Big Boot" in preferences.future_plans else 0)
        + (7 if "Elderly Parents" in preferences.future_plans and spec.ground_clearance_mm >= 190 else 0)
    )
    ownership_cost = clamp(110 - monthly_cost / 360)
    resale = clamp(
        {
            "Maruti Suzuki": 92,
            "Toyota": 90,
            "Honda": 84,
            "Hyundai": 82,
            "Kia": 78,
            "Tata": 76,
            "Mahindra": 76,
            "Skoda": 70,
        }.get(car.brand.name, 72)
        + (5 if variant.fuel_type == "Hybrid" else 0)
        + (4 if spec.safety_rating >= 5 else 0)
    )
    performance = clamp(38 + engine_size * 20 + (14 if "Turbo" in spec.engine else 0) + (10 if variant.fuel_type == "Diesel" else 0))
    budget = budget_score(variant.price, preferences)

    scores = {
        "safety": safety,
        "comfort": comfort,
        "maintenance": maintenance,
        "mileage": mileage,
        "driving_match": driving_match,
        "family_match": family_match,
        "ownership_cost": ownership_cost,
        "resale": resale,
        "performance": performance,
        "budget_match": budget,
    }

    total = sum(scores[key] * weight for key, weight in build_weights(preferences).items())

    if preferences.favorite_brands and car.brand.name in preferences.favorite_brands:
        total += 4
    if preferences.avoid_brands and car.brand.name in preferences.avoid_brands:
        total -= 24
    if preferences.fuel_types and variant.fuel_type not in preferences.fuel_types:
        total -= 8
    if preferences.transmission and variant.transmission != preferences.transmission:
        total -= 10

    return {
        "total_score": round(clamp(total), 1),
        "monthly_cost_estimate": monthly_cost,
        **{key: round(value, 1) for key, value in scores.items()},
    }

