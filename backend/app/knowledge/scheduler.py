import asyncio
from typing import Callable

from app.database import SessionLocal
from app.knowledge.indexer import KnowledgeIndexer
from app.knowledge.repository import KnowledgeRepository
from app.knowledge.service import KnowledgeService


class KnowledgeScheduler:
    def __init__(self, service: KnowledgeService):
        self.service = service
        self.is_running = False
        self._task = None

    async def start(self, interval_seconds: int = 86400):
        if self.is_running:
            return
        self.is_running = True
        
        # Initial run on boot
        await self._run_job()
        
        self._task = asyncio.create_task(self._loop(interval_seconds))

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()

    async def _loop(self, interval_seconds: int):
        while self.is_running:
            await asyncio.sleep(interval_seconds)
            await self._run_job()

    async def _run_job(self):
        print("Running Knowledge Indexer Job...")
        with SessionLocal() as db:
            repo = KnowledgeRepository(db)
            indexer = KnowledgeIndexer(repo)
            indexer.run()
            # After indexing, refresh the vector store in the service
            self.service.refresh_embeddings(repo)
        print("Knowledge Indexer Job Complete.")
