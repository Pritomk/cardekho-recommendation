from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import SessionLocal, init_db
from app.knowledge.scheduler import KnowledgeScheduler
from app.knowledge.service import KnowledgeService
from app.routes import compare, followup, meta, recommendations


from app.knowledge.repository import KnowledgeRepository

knowledge_service = KnowledgeService()
scheduler = KnowledgeScheduler(knowledge_service)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with SessionLocal() as db:
        knowledge_service.repo = KnowledgeRepository(db)
        
    await scheduler.start()
    yield
    await scheduler.stop()


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendations.router)
app.include_router(compare.router)
app.include_router(followup.router)
app.include_router(meta.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

