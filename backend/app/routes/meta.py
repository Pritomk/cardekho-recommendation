from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.car_repository import CarRepository


router = APIRouter(prefix="/api", tags=["meta"])


@router.get("/brands", response_model=list[str])
def list_brands(db: Session = Depends(get_db)) -> list[str]:
    return CarRepository(db).list_brands()

