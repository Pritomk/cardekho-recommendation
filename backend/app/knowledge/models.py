from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    updated_date = Column(String(50), nullable=False)
    confidence = Column(String(20), nullable=False)
    hash = Column(String(64), unique=True, index=True, nullable=False)
