from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CompareRequest, CompareResponse
from app.services.comparison_service import ComparisonService


router = APIRouter(prefix="/api", tags=["comparison"])


@router.post("/compare", response_model=CompareResponse)
def compare_recommendations(
    request: CompareRequest,
    db: Session = Depends(get_db),
) -> CompareResponse:
    try:
        return ComparisonService(db).compare(request.session_id, request.variant_ids)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

