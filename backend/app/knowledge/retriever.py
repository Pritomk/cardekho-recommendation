import numpy as np

from app.knowledge.models import KnowledgeArticle
from app.knowledge.repository import KnowledgeRepository
from app.knowledge.schemas import KnowledgeContext
from app.knowledge.vector_store import KnowledgeVectorStore


class KnowledgeRetriever:
    def __init__(self, vector_store: KnowledgeVectorStore):
        self.vector_store = vector_store
        self.article_embeddings: np.ndarray = np.array([])
        self.article_ids: list[int] = []

    def load_embeddings(self, articles: list[KnowledgeArticle]):
        if not articles:
            self.article_embeddings = np.array([])
            self.article_ids = []
            return

        self.article_ids = [a.id for a in articles]
        
        # In a real production system, store embeddings in DB or disk.
        # For this implementation, we compute on the fly or load from a cache.
        # Since the static set is small, we'll compute it on load.
        embeddings = [self.vector_store.generate_embedding(f"{a.title} {a.content}") for a in articles]
        self.article_embeddings = np.vstack(embeddings)

    def search(self, query: str, repo: KnowledgeRepository, top_k: int = 2) -> list[KnowledgeContext]:
        if self.article_embeddings.size == 0:
            return []

        query_embedding = self.vector_store.generate_embedding(query)
        results = self.vector_store.search(query_embedding, self.article_embeddings, top_k=top_k)

        matched_ids = [self.article_ids[idx] for idx, score in results if score > 0.3] # Threshold
        
        contexts = repo.get_context_by_ids(matched_ids)
        
        # Attach scores for reference if needed
        for context in contexts:
            # Find score
            for idx, score in results:
                if self.article_ids[idx] == context.id:
                    context.relevance_score = score
                    break

        return contexts
