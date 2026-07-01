from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.llm.factory import get_llm_service
from app.schemas import FollowUpRequest, FollowUpResponse
from app.services.followup_service import FollowUpService


router = APIRouter(prefix="/api", tags=["follow-up"])


@router.post("/follow-up", response_model=FollowUpResponse)
def answer_follow_up(
    request: FollowUpRequest,
    db: Session = Depends(get_db),
) -> FollowUpResponse:
    try:
        return FollowUpService(db, get_llm_service()).answer(
            request.session_id,
            request.question,
            request.variant_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

