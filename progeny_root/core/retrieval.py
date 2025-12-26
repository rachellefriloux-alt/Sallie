"""Memory retrieval and MMR ranking."""

import time
import uuid
from typing import Any, Dict, List, Optional

import requests
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models

# from sentence_transformers import SentenceTransformer

# Constants
COLLECTION_NAME = "progeny_memory"
EMBEDDING_MODEL = "nomic-embed-text"  # Changed to Ollama model
VECTOR_SIZE = 768  # Size for nomic-embed-text (was 384 for MiniLM)


class MemoryRecord(BaseModel):
    """
    Standardized memory entity.
    """

    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: float = Field(default_factory=time.time)
    salience: float = 0.5


class MemorySystem:
    """
    Manages long-term vector storage and retrieval (Hippocampus).
    """

    def __init__(self, use_local_storage: bool = False):
        print(f"[Memory] Initializing MemorySystem...")

        # 1. Initialize Embedding Model (Ollama)
        # No local model loading needed for Ollama
        print(f"[Memory] Using Ollama embedding model: {EMBEDDING_MODEL}")

        # 2. Initialize Qdrant Client
        try:
            if use_local_storage:
                self.client = QdrantClient(path="progeny_root/memory/qdrant_local")
                print("[Memory] Connected to local Qdrant storage.")
            else:
                # Default to Docker instance
                self.client = QdrantClient(url="http://localhost:6333")
                print("[Memory] Connected to Qdrant at localhost:6333.")
        except Exception as e:
            print(f"[Memory] Connection failed: {e}. Falling back to local RAM.")
            self.client = QdrantClient(":memory:")

        # 3. Ensure Collection Exists
        self._ensure_collection()

    def _get_embedding(self, text: str) -> List[float]:
        """Get embedding from Ollama."""
        try:
            response = requests.post(
                "http://localhost:11434/api/embeddings",
                json={"model": EMBEDDING_MODEL, "prompt": text},
            )
            if response.status_code == 200:
                return response.json()["embedding"]
            else:
                print(f"[Memory] Embedding error: {response.text}")
                return [0.0] * VECTOR_SIZE
        except Exception as e:
            print(f"[Memory] Failed to get embedding: {e}")
            return [0.0] * VECTOR_SIZE

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections()
            exists = any(c.name == COLLECTION_NAME for c in collections.collections)

            if not exists:
                print(f"[Memory] Creating collection '{COLLECTION_NAME}'...")
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=models.VectorParams(
                        size=VECTOR_SIZE, distance=models.Distance.COSINE
                    ),
                )
        except Exception as e:
            print(f"[Memory] Error checking/creating collection: {e}")

    def add(self, text: str, metadata: Dict[str, Any] = None):
        """
        Embeds and stores a memory record.
        """
        if not text:
            return

        if metadata is None:
            metadata = {}

        # Add timestamp if missing
        if "timestamp" not in metadata:
            metadata["timestamp"] = time.time()

        try:
            vector = self._get_embedding(text)
            point_id = str(uuid.uuid4())

            self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    models.PointStruct(
                        id=point_id, vector=vector, payload={"text": text, **metadata}
                    )
                ],
            )
            # print(f"[Memory] Stored: {text[:30]}...")
        except Exception as e:
            print(f"[Memory] Error adding memory: {e}")

    def retrieve(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Semantic search with custom scoring (Similarity + Freshness + Salience).
        Formula: Score = (Sim * 0.7) + (Freshness * 0.2) + (Salience * 0.1)
        """
        try:
            vector = self._get_embedding(query)

            # Fetch more candidates than needed to allow for re-ranking
            candidates_limit = limit * 3

            # Use query_points for Qdrant 1.10+
            results = self.client.query_points(
                collection_name=COLLECTION_NAME, query=vector, limit=candidates_limit
            ).points

            scored_memories = []
            now = time.time()

            for hit in results:
                metadata = hit.payload

                # 1. Similarity (Base Score)
                similarity = hit.score

                # 2. Freshness (Decay over time)
                timestamp = metadata.get("timestamp", 0)
                age_hours = (now - timestamp) / 3600.0
                # Decay: 1.0 at 0 hours, approaches 0.0 as age increases
                # Using a half-life of roughly 7 days (168 hours)
                freshness = 1.0 / (1.0 + (age_hours / 168.0))

                # 3. Salience (Importance)
                # Default to 0.5 if not set
                salience = metadata.get("salience", 0.5)

                # Weighted Score Calculation (Section 7.2 of Spec)
                final_score = (similarity * 0.7) + (freshness * 0.2) + (salience * 0.1)

                scored_memories.append(
                    {
                        "text": metadata.get("text", ""),
                        "score": final_score,
                        "raw_similarity": similarity,
                        "metadata": {k: v for k, v in metadata.items() if k != "text"},
                        "id": hit.id,
                    }
                )

            # Sort by final score descending
            scored_memories.sort(key=lambda x: x["score"], reverse=True)

            return scored_memories[:limit]
        except Exception as e:
            print(f"[Memory] Error retrieving memory: {e}")
            return []

    def wipe(self):
        """
        DANGER: Clears all memories.
        """
        self.client.delete_collection(COLLECTION_NAME)
        self._ensure_collection()


if __name__ == "__main__":
    # Quick test
    # Note: This requires Qdrant running or will fallback to memory/local
    mem = MemorySystem(
        use_local_storage=True
    )  # Use local for test to avoid Docker dependency check failure

    print("Adding test memory...")
    mem.add("The Creator prefers dark mode interfaces.", {"category": "preference"})
    mem.add("The project deadline is December 25th.", {"category": "fact"})

    print("Querying 'interface'...")
    results = mem.retrieve("What kind of UI does the user like?")

    for r in results:
        print(f"- [{r['score']:.2f}] {r['text']}")
