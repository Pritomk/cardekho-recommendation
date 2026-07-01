from sqlalchemy.orm import Session, joinedload

from app.models import Brand, Car, Variant


class CarRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_variants(self) -> list[Variant]:
        return (
            self.db.query(Variant)
            .options(
                joinedload(Variant.car).joinedload(Car.brand),
                joinedload(Variant.specification),
            )
            .all()
        )

    def get_variants(self, variant_ids: list[int]) -> list[Variant]:
        return (
            self.db.query(Variant)
            .options(
                joinedload(Variant.car).joinedload(Car.brand),
                joinedload(Variant.specification),
            )
            .filter(Variant.id.in_(variant_ids))
            .all()
        )

    def list_brands(self) -> list[str]:
        return [brand.name for brand in self.db.query(Brand).order_by(Brand.name).all()]

