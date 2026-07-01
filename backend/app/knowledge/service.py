from sqlalchemy.orm import Session

from app.knowledge.repository import KnowledgeRepository
from app.knowledge.retriever import KnowledgeRetriever
from app.knowledge.schemas import KnowledgeContext
from app.knowledge.vector_store import KnowledgeVectorStore
from app.models import Variant
from app.schemas import DiscoveryPreferences


class KnowledgeService:
    _instance = None
    _vector_store = None
    _retriever = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(KnowledgeService, cls).__new__(cls)
            cls._vector_store = KnowledgeVectorStore()
            cls._retriever = KnowledgeRetriever(cls._vector_store)
        return cls._instance

    def __init__(self, db: Session | None = None):
        if db:
            self.repo = KnowledgeRepository(db)

    def refresh_embeddings(self, repo: KnowledgeRepository):
        articles = repo.get_all_articles()
        self._retriever.load_embeddings(articles)

    def get_context(self, query: str, top_k: int = 2) -> list[KnowledgeContext]:
        if not hasattr(self, 'repo'):
            return []
        return self._retriever.search(query, self.repo, top_k=top_k)

    def validate_recommendations(self, top_variants: list[Variant], preferences: DiscoveryPreferences) -> list[KnowledgeContext]:
        # Validate against vehicle recalls, new safety updates, etc.
        queries = []
        for variant in top_variants:
            queries.append(f"{variant.car.brand.name} {variant.car.model} recall safety rating update")
        
        queries.append(f"{preferences.purpose} {preferences.driving_style} regulations norms")
        
        contexts = []
        seen_ids = set()
        
        for q in queries:
            results = self.get_context(q, top_k=1)
            for r in results:
                if r.id not in seen_ids and r.relevance_score > 0.4:
                    contexts.append(r)
                    seen_ids.add(r.id)
                    
        return contexts

    def format_context_for_prompt(self, contexts: list[KnowledgeContext]) -> str:
        if not contexts:
            return "No specific dynamic knowledge context found."
            
        formatted = "KNOWLEDGE CONTEXT:\n"
        for ctx in contexts:
            formatted += f"[{ctx.category}] {ctx.title}\n"
            formatted += f"{ctx.content}\n"
            formatted += f"Source: {ctx.metadata.source} (Updated: {ctx.metadata.updated_date}, Confidence: {ctx.metadata.confidence})\n\n"
        return formatted
