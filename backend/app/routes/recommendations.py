from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.llm.factory import get_llm_service
from app.schemas import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import RecommendationService


router = APIRouter(prefix="/api", tags=["recommendations"])


@router.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    service = RecommendationService(db, get_llm_service())
    return service.recommend(request)

