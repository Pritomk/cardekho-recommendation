from pydantic import BaseModel


class KnowledgeSourceMetadata(BaseModel):
    source: str
    updated_date: str
    confidence: str


class KnowledgeContext(BaseModel):
    id: int
    category: str
    title: str
    content: str
    metadata: KnowledgeSourceMetadata
    relevance_score: float = 0.0
