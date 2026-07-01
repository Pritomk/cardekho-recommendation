import hashlib
import os
from datetime import datetime

from app.knowledge.repository import KnowledgeRepository
from app.knowledge.sources.news_mock import NewsMockSource
from app.knowledge.sources.recall_mock import RecallMockSource


class KnowledgeIndexer:
    def __init__(self, repo: KnowledgeRepository):
        self.repo = repo
        self.static_dir = os.path.join(os.path.dirname(__file__), "static")
        self.dynamic_sources = [
            NewsMockSource(),
            RecallMockSource(),
        ]

    def _hash(self, text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def run(self):
        self._index_static_files()
        self._index_dynamic_sources()

    def _index_static_files(self):
        if not os.path.exists(self.static_dir):
            return

        for filename in os.listdir(self.static_dir):
            if filename.endswith(".md"):
                filepath = os.path.join(self.static_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Title is first line if starts with #
                lines = content.strip().split("\n")
                title = lines[0].replace("#", "").strip() if lines[0].startswith("#") else filename.replace(".md", "").title()
                
                # Derive category from filename simple mapping
                category_map = {
                    "e20.md": "Fuel",
                    "bs6.md": "Emission Norms",
                    "adas.md": "Safety",
                    "hybrid.md": "Fuel",
                    "insurance.md": "Insurance",
                    "ownership.md": "Ownership",
                }
                category = category_map.get(filename, "General")

                content_hash = self._hash(content)
                self.repo.upsert_article(
                    category=category,
                    title=title,
                    content=content,
                    source="CarDekho Internal Knowledge Base",
                    updated_date=datetime.now().strftime("%Y-%m-%d"),
                    confidence="High",
                    content_hash=content_hash,
                )

    def _index_dynamic_sources(self):
        for source in self.dynamic_sources:
            try:
                updates = source.fetch_updates()
                for update in updates:
                    content_hash = self._hash(update["content"] + update["title"])
                    self.repo.upsert_article(
                        category=update["category"],
                        title=update["title"],
                        content=update["content"],
                        source=update["source"],
                        updated_date=update["updated_date"],
                        confidence=update["confidence"],
                        content_hash=content_hash,
                    )
            except Exception as e:
                # In production, log error
                print(f"Error fetching from {source.__class__.__name__}: {e}")
