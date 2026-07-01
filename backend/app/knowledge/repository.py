from sqlalchemy.orm import Session

from app.knowledge.models import KnowledgeArticle
from app.knowledge.schemas import KnowledgeContext, KnowledgeSourceMetadata


class KnowledgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_article(
        self,
        category: str,
        title: str,
        content: str,
        source: str,
        updated_date: str,
        confidence: str,
        content_hash: str,
    ) -> KnowledgeArticle:
        # Check if hash already exists to avoid duplicate work
        existing = self.db.query(KnowledgeArticle).filter(KnowledgeArticle.hash == content_hash).first()
        if existing:
            # We can update metadata if we want, but if hash is same, content is same.
            existing.updated_date = updated_date
            self.db.commit()
            return existing

        # Check if title exists to update it, else create new
        existing_title = self.db.query(KnowledgeArticle).filter(KnowledgeArticle.title == title).first()
        if existing_title:
            existing_title.content = content
            existing_title.source = source
            existing_title.updated_date = updated_date
            existing_title.confidence = confidence
            existing_title.hash = content_hash
            article = existing_title
        else:
            article = KnowledgeArticle(
                category=category,
                title=title,
                content=content,
                source=source,
                updated_date=updated_date,
                confidence=confidence,
                hash=content_hash,
            )
            self.db.add(article)

        self.db.commit()
        self.db.refresh(article)
        return article

    def get_all_articles(self) -> list[KnowledgeArticle]:
        return self.db.query(KnowledgeArticle).all()

    def get_context_by_ids(self, article_ids: list[int]) -> list[KnowledgeContext]:
        if not article_ids:
            return []
            
        articles = self.db.query(KnowledgeArticle).filter(KnowledgeArticle.id.in_(article_ids)).all()
        # Ensure we return in the same order as requested (which is sorted by relevance)
        articles_by_id = {article.id: article for article in articles}
        
        contexts = []
        for a_id in article_ids:
            if a_id in articles_by_id:
                article = articles_by_id[a_id]
                contexts.append(
                    KnowledgeContext(
                        id=article.id,
                        category=article.category,
                        title=article.title,
                        content=article.content,
                        metadata=KnowledgeSourceMetadata(
                            source=article.source,
                            updated_date=article.updated_date,
                            confidence=article.confidence,
                        )
                    )
                )
        return contexts
