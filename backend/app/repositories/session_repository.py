from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import UserSession
from app.schemas import DiscoveryPreferences, DriverPersona


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_session(
        self,
        preferences: DiscoveryPreferences,
        persona: DriverPersona,
        session_id: str | None = None,
    ) -> UserSession:
        session = self.db.get(UserSession, session_id) if session_id else None
        if session is None:
            session = UserSession(id=session_id or uuid4().hex, preferences={}, persona={})
            self.db.add(session)

        session.preferences = preferences.model_dump()
        session.persona = persona.model_dump()
        self.db.commit()
        self.db.refresh(session)
        return session

    def get(self, session_id: str) -> UserSession | None:
        return self.db.get(UserSession, session_id)

