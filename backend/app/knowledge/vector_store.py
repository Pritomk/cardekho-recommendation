import numpy as np
from sentence_transformers import SentenceTransformer


class KnowledgeVectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text: str) -> np.ndarray:
        # Generate a normalized embedding for cosine similarity
        embedding = self.model.encode(text, normalize_embeddings=True)
        return np.array(embedding, dtype=np.float32)

    def search(self, query_embedding: np.ndarray, item_embeddings: np.ndarray, top_k: int = 3) -> list[tuple[int, float]]:
        """
        Search for top_k similar embeddings using cosine similarity.
        Expects query_embedding shape (dim,) and item_embeddings shape (n_items, dim).
        Returns a list of (index, similarity_score).
        """
        if item_embeddings.size == 0:
            return []

        # Cosine similarity (since embeddings are normalized, dot product is sufficient)
        similarities = np.dot(item_embeddings, query_embedding)

        # Get top_k indices sorted by similarity (descending)
        top_indices = np.argsort(similarities)[::-1][:top_k]

        return [(int(idx), float(similarities[idx])) for idx in top_indices]
