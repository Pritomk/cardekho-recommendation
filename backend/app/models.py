from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)

    cars = relationship("Car", back_populates="brand")


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    model = Column(String(160), nullable=False, index=True)
    body_type = Column(String(80), nullable=False)
    seating_capacity = Column(Integer, nullable=False)
    image_url = Column(Text, nullable=True)
    pros = Column(JSON, default=list)
    cons = Column(JSON, default=list)
    reviews = Column(JSON, default=list)

    brand = relationship("Brand", back_populates="cars")
    variants = relationship("Variant", back_populates="car", cascade="all, delete-orphan")


class Variant(Base):
    __tablename__ = "variants"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    name = Column(String(160), nullable=False)
    price = Column(Integer, nullable=False)
    transmission = Column(String(80), nullable=False)
    fuel_type = Column(String(80), nullable=False)

    car = relationship("Car", back_populates="variants")
    specification = relationship(
        "Specification",
        back_populates="variant",
        cascade="all, delete-orphan",
        uselist=False,
    )
    recommendations = relationship("Recommendation", back_populates="variant")


class Specification(Base):
    __tablename__ = "specifications"

    id = Column(Integer, primary_key=True, index=True)
    variant_id = Column(Integer, ForeignKey("variants.id"), unique=True, nullable=False)
    mileage = Column(Float, nullable=False)
    engine = Column(String(80), nullable=False)
    safety_rating = Column(Float, nullable=False)
    airbags = Column(Integer, nullable=False)
    adas = Column(String(80), nullable=False)
    boot_space_l = Column(Integer, nullable=False)
    ground_clearance_mm = Column(Integer, nullable=False)
    maintenance_cost_annual = Column(Integer, nullable=False)
    service_cost_annual = Column(Integer, nullable=False)

    variant = relationship("Variant", back_populates="specification")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(64), primary_key=True, index=True)
    preferences = Column(JSON, nullable=False)
    persona = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recommendations = relationship("Recommendation", back_populates="session")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("user_sessions.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("variants.id"), nullable=False)
    score = Column(Float, nullable=False)
    score_breakdown = Column(JSON, nullable=False)
    explanation = Column(Text, nullable=False)
    tradeoffs = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("UserSession", back_populates="recommendations")
    variant = relationship("Variant", back_populates="recommendations")

