import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Brand, Car, Specification, Variant


DATA_PATH = Path(__file__).parent / "data" / "cars.json"


def seed_cars(db: Session) -> None:
    if db.query(Car).first():
        return

    cars = json.loads(DATA_PATH.read_text())
    brands: dict[str, Brand] = {}

    for item in cars:
        brand_name = item["brand"]
        brand = brands.get(brand_name)
        if brand is None:
            brand = Brand(name=brand_name)
            db.add(brand)
            db.flush()
            brands[brand_name] = brand

        car = Car(
            brand_id=brand.id,
            model=item["model"],
            body_type=item["body_type"],
            seating_capacity=item["seating_capacity"],
            image_url=item.get("image_url"),
            pros=item.get("pros", []),
            cons=item.get("cons", []),
            reviews=item.get("reviews", []),
        )
        db.add(car)
        db.flush()

        variant = Variant(
            car_id=car.id,
            name=item["variant"],
            price=item["price"],
            transmission=item["transmission"],
            fuel_type=item["fuel_type"],
        )
        db.add(variant)
        db.flush()

        db.add(
            Specification(
                variant_id=variant.id,
                mileage=item["mileage"],
                engine=item["engine"],
                safety_rating=item["safety_rating"],
                airbags=item["airbags"],
                adas=item["adas"],
                boot_space_l=item["boot_space_l"],
                ground_clearance_mm=item["ground_clearance_mm"],
                maintenance_cost_annual=item["maintenance_cost_annual"],
                service_cost_annual=item["service_cost_annual"],
            )
        )

    db.commit()

