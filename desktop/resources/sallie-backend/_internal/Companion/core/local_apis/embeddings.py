"""Local-First Embeddings API.

Provides embeddings using local models (Ollama) as an alternative to external APIs.
Quality: Just as good or better.
"""

import logging
import requests
from typing import List, Optional, Dict, Any

logger = logging.getLogger("local_apis.embeddings")


class LocalEmbeddingsAPI:
    """
    Local-first embeddings API using Ollama.
    Provides the same interface as external embedding APIs but runs locally.
    """
    
    def __init__(self, model: str = "nomic-embed-text", ollama_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = ollama_url.rstrip("/")
    
    def embed(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats representing the embedding vector
        """
        try:
            # Use Ollama's embeddings endpoint
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": text},
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            if "embedding" in data:
                return data["embedding"]
            else:
                logger.error(f"Unexpected response format from Ollama: {data}")
                return []
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        embeddings = []
        for text in texts:
            embedding = self.embed(text)
            embeddings.append(embedding)
        return embeddings
    
    def get_dimension(self) -> int:
        """Get the dimension of embeddings from this model."""
        # Test embedding to get dimension
        test_embedding = self.embed("test")
        return len(test_embedding) if test_embedding else 768  # Default fallback


# Singleton instance
_embeddings_api: Optional[LocalEmbeddingsAPI] = None


def get_local_embeddings_api(model: str = "nomic-embed-text") -> LocalEmbeddingsAPI:
    """Get or create the global local embeddings API."""
    global _embeddings_api
    if _embeddings_api is None:
        _embeddings_api = LocalEmbeddingsAPI(model=model)
    return _embeddings_api

