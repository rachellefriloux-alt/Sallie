"""Memory retrieval and MMR ranking with consolidation and versioning.

Enhanced memory system with:
- MMR (Maximum Marginal Relevance) re-ranking
- Memory consolidation logic
- Memory versioning
- Enhanced search functionality
- Cleanup procedures
"""

import time
import uuid
import logging
import json
from typing import Any, Dict, List, Optional
from pathlib import Path
from datetime import datetime

import requests
import numpy as np
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Setup logging
logger = logging.getLogger("memory")

# Constants
COLLECTION_NAME = "progeny_memory"
EMBEDDING_MODEL = "nomic-embed-text"  # Changed to Ollama model
VECTOR_SIZE = 768  # Size for nomic-embed-text (was 384 for MiniLM)
MEMORY_VERSION_FILE = Path("progeny_root/memory/memory_versions.json")
MEMORY_CONSOLIDATION_LOG = Path("progeny_root/logs/memory_consolidation.log")


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
        """Initialize Memory System with comprehensive error handling."""
        try:
            logger.info("[Memory] Initializing MemorySystem...")
            
            # Ensure directories exist
            self._ensure_directories()

            # 1. Initialize Embedding Model (Ollama)
            logger.info(f"[Memory] Using Ollama embedding model: {EMBEDDING_MODEL}")

            # 2. Initialize Qdrant Client
            try:
                if use_local_storage:
                    self.client = QdrantClient(path="progeny_root/memory/qdrant_local")
                    logger.info("[Memory] Connected to local Qdrant storage.")
                else:
                    # Default to Docker instance
                    self.client = QdrantClient(url="http://localhost:6333")
                    logger.info("[Memory] Connected to Qdrant at localhost:6333.")
            except Exception as e:
                logger.warning(f"[Memory] Connection failed: {e}. Falling back to local RAM.")
                self.client = QdrantClient(":memory:")

            # 3. Ensure Collection Exists
            self._ensure_collection()
            
            # 4. Load memory versions
            self.memory_versions = self._load_memory_versions()
            
            logger.info("[Memory] Memory system initialized successfully")
            
        except Exception as e:
            logger.error(f"[Memory] Critical error during initialization: {e}", exc_info=True)
            # Fallback to in-memory client
            self.client = QdrantClient(":memory:")
            self.memory_versions = {}
    
    def _ensure_directories(self):
        """Ensure memory directories exist."""
        try:
            Path("progeny_root/memory").mkdir(parents=True, exist_ok=True)
            Path("progeny_root/memory/qdrant_local").mkdir(parents=True, exist_ok=True)
            MEMORY_VERSION_FILE.parent.mkdir(parents=True, exist_ok=True)
            MEMORY_CONSOLIDATION_LOG.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"[Memory] Failed to create directories: {e}")
            raise
    
    def _load_memory_versions(self) -> Dict[str, Any]:
        """Load memory versioning information."""
        if MEMORY_VERSION_FILE.exists():
            try:
                with open(MEMORY_VERSION_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"[Memory] Error loading memory versions: {e}")
        
        return {
            "version": 1,
            "last_consolidation": None,
            "total_memories": 0,
            "consolidation_history": []
        }
    
    def _save_memory_versions(self):
        """Save memory versioning information."""
        try:
            with open(MEMORY_VERSION_FILE, "w", encoding="utf-8") as f:
                json.dump(self.memory_versions, f, indent=2)
        except Exception as e:
            logger.error(f"[Memory] Failed to save memory versions: {e}")

    def _get_embedding(self, text: str, retries: int = 3) -> List[float]:
        """Get embedding from Ollama with retry logic and error handling."""
        if not text or not text.strip():
            logger.warning("[Memory] Empty text provided for embedding")
            return [0.0] * VECTOR_SIZE
        
        # Truncate very long text (prevent API issues)
        max_length = 8000
        if len(text) > max_length:
            logger.debug(f"[Memory] Truncating text from {len(text)} to {max_length} characters")
            text = text[:max_length]
        
        for attempt in range(retries):
            try:
                response = requests.post(
                    "http://localhost:11434/api/embeddings",
                    json={"model": EMBEDDING_MODEL, "prompt": text},
                    timeout=30
                )
                if response.status_code == 200:
                    embedding = response.json()["embedding"]
                    if len(embedding) != VECTOR_SIZE:
                        logger.warning(f"[Memory] Embedding size mismatch: expected {VECTOR_SIZE}, got {len(embedding)}")
                        # Pad or truncate to match expected size
                        if len(embedding) < VECTOR_SIZE:
                            embedding.extend([0.0] * (VECTOR_SIZE - len(embedding)))
                        else:
                            embedding = embedding[:VECTOR_SIZE]
                    return embedding
                else:
                    logger.warning(f"[Memory] Embedding error (attempt {attempt + 1}): {response.status_code} - {response.text}")
                    if attempt < retries - 1:
                        time.sleep(0.5 * (attempt + 1))  # Exponential backoff
            except requests.exceptions.Timeout:
                logger.warning(f"[Memory] Embedding request timed out (attempt {attempt + 1})")
                if attempt < retries - 1:
                    time.sleep(1.0 * (attempt + 1))
            except Exception as e:
                logger.error(f"[Memory] Failed to get embedding (attempt {attempt + 1}): {e}")
                if attempt < retries - 1:
                    time.sleep(0.5 * (attempt + 1))
        
        logger.error(f"[Memory] All embedding attempts failed, returning zero vector")
        return [0.0] * VECTOR_SIZE

    def _ensure_collection(self):
        """Ensure memory collection exists with comprehensive error handling."""
        try:
            collections = self.client.get_collections()
            exists = any(c.name == COLLECTION_NAME for c in collections.collections)

            if not exists:
                logger.info(f"[Memory] Creating collection '{COLLECTION_NAME}'...")
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=models.VectorParams(
                        size=VECTOR_SIZE, distance=models.Distance.COSINE
                    ),
                )
                logger.info(f"[Memory] Collection '{COLLECTION_NAME}' created successfully")
            else:
                logger.debug(f"[Memory] Collection '{COLLECTION_NAME}' already exists")
        except Exception as e:
            logger.error(f"[Memory] Error checking/creating collection: {e}", exc_info=True)
            raise

    def add(self, text: str, metadata: Optional[Dict[str, Any]] = None, version: Optional[int] = None, actor_id: Optional[str] = None):
        """
        Embeds and stores a memory record with enhanced metadata and versioning.
        
        Args:
            text: Memory text content
            metadata: Optional metadata dict
            version: Optional memory version
            actor_id: Optional actor ID for multi-user contexts (Section 13.4)
        """
        if not text or not text.strip():
            logger.warning("[Memory] Attempted to add empty memory")
            return None

        if metadata is None:
            metadata = {}

        # Add timestamp if missing
        if "timestamp" not in metadata:
            metadata["timestamp"] = time.time()
        
        # Add datetime for human readability
        if "datetime" not in metadata:
            metadata["datetime"] = datetime.fromtimestamp(metadata["timestamp"]).isoformat()
        
        # Add actor_id for multi-user context isolation (Section 13.4)
        if actor_id:
            metadata["actor_id"] = actor_id
        else:
            # Try to get from global systems if available (lazy import to avoid circular deps)
            try:
                from .main import systems
                if "kinship" in systems:
                    metadata["actor_id"] = systems["kinship"].active_user
                else:
                    metadata["actor_id"] = "creator"  # Default
            except Exception:
                metadata["actor_id"] = "creator"  # Default fallback
        
        # Add version if provided
        if version is not None:
            metadata["version"] = version
        else:
            metadata["version"] = self.memory_versions.get("version", 1)
        
        # Add memory ID for tracking
        memory_id = str(uuid.uuid4())
        metadata["memory_id"] = memory_id

        try:
            vector = self._get_embedding(text)
            
            if len(vector) != VECTOR_SIZE:
                logger.error(f"[Memory] Invalid vector size: {len(vector)} != {VECTOR_SIZE}")
                return None

            self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    models.PointStruct(
                        id=memory_id, vector=vector, payload={"text": text, **metadata}
                    )
                ],
            )
            
            # Update version tracking
            self.memory_versions["total_memories"] = self.memory_versions.get("total_memories", 0) + 1
            self._save_memory_versions()
            
            logger.debug(f"[Memory] Stored memory: {text[:50]}... (ID: {memory_id})")
            return memory_id
            
        except Exception as e:
            logger.error(f"[Memory] Error adding memory: {e}", exc_info=True)
            return None

    def retrieve(self, query: str, limit: int = 5, use_mmr: bool = True, mmr_diversity: float = 0.5) -> List[Dict[str, Any]]:
        """
        Semantic search with custom scoring and optional MMR re-ranking.
        
        Formula: Score = (Sim * 0.7) + (Freshness * 0.2) + (Salience * 0.1)
        
        Args:
            query: Search query text
            limit: Number of results to return
            use_mmr: Whether to use Maximum Marginal Relevance re-ranking
            mmr_diversity: Diversity parameter for MMR (0.0 = pure relevance, 1.0 = pure diversity)
        """
        try:
            if not query or not query.strip():
                logger.warning("[Memory] Empty query provided")
                return []
            
            vector = self._get_embedding(query)
            
            if len(vector) != VECTOR_SIZE:
                logger.error(f"[Memory] Invalid query vector size: {len(vector)} != {VECTOR_SIZE}")
                return []

            # Fetch more candidates than needed to allow for re-ranking
            candidates_limit = limit * 5 if use_mmr else limit * 3

            # Use query_points for Qdrant 1.10+
            results = self.client.query_points(
                collection_name=COLLECTION_NAME, query=vector, limit=candidates_limit
            ).points

            if not results:
                logger.debug("[Memory] No results found for query")
                return []

            scored_memories = []
            now = time.time()
            query_vector = np.array(vector)

            for hit in results:
                metadata = hit.payload

                # 1. Similarity (Base Score)
                similarity = hit.score if hasattr(hit, 'score') else 0.0

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
                        "freshness": freshness,
                        "salience": salience,
                        "metadata": {k: v for k, v in metadata.items() if k != "text"},
                        "id": hit.id,
                        "vector": np.array(hit.vector) if hasattr(hit, 'vector') else None
                    }
                )

            # Sort by final score descending
            scored_memories.sort(key=lambda x: x["score"], reverse=True)

            # Apply MMR re-ranking if requested
            if use_mmr and len(scored_memories) > limit:
                scored_memories = self._mmr_rerank(scored_memories, query_vector, limit, mmr_diversity)

            return scored_memories[:limit]
            
        except Exception as e:
            logger.error(f"[Memory] Error retrieving memory: {e}", exc_info=True)
            return []
    
    def _mmr_rerank(self, candidates: List[Dict[str, Any]], query_vector: np.ndarray, limit: int, diversity: float) -> List[Dict[str, Any]]:
        """
        Maximum Marginal Relevance re-ranking.
        Balances relevance and diversity in results.
        """
        try:
            if not candidates or limit <= 0:
                return candidates
            
            selected = []
            remaining = candidates.copy()
            
            # Start with highest scoring item
            if remaining:
                selected.append(remaining.pop(0))
            
            # Select remaining items using MMR
            while len(selected) < limit and remaining:
                best_score = -float('inf')
                best_idx = 0
                
                for idx, candidate in enumerate(remaining):
                    if candidate.get("vector") is None:
                        # Fallback to score if vector not available
                        mmr_score = candidate["score"]
                    else:
                        # Calculate MMR score
                        # Relevance: similarity to query
                        relevance = candidate["raw_similarity"]
                        
                        # Diversity: max similarity to already selected items
                        max_similarity_to_selected = 0.0
                        for selected_item in selected:
                            if selected_item.get("vector") is not None:
                                similarity = np.dot(candidate["vector"], selected_item["vector"]) / (
                                    np.linalg.norm(candidate["vector"]) * np.linalg.norm(selected_item["vector"])
                                )
                                max_similarity_to_selected = max(max_similarity_to_selected, similarity)
                        
                        # MMR: λ * relevance - (1 - λ) * max_similarity
                        mmr_score = (1 - diversity) * relevance - diversity * max_similarity_to_selected
                    
                    if mmr_score > best_score:
                        best_score = mmr_score
                        best_idx = idx
                
                selected.append(remaining.pop(best_idx))
            
            return selected
            
        except Exception as e:
            logger.error(f"[Memory] MMR re-ranking failed: {e}")
            # Fallback to simple top-k
            return candidates[:limit]

    def consolidate_memories(self, similarity_threshold: float = 0.95, age_days: int = 30) -> Dict[str, Any]:
        """
        Consolidate similar or old memories to reduce redundancy.
        Merges highly similar memories and archives very old ones.
        """
        try:
            logger.info(f"[Memory] Starting memory consolidation (threshold: {similarity_threshold}, age: {age_days} days)")
            
            # Get all memories (or a large sample)
            all_points = self.client.scroll(
                collection_name=COLLECTION_NAME,
                limit=10000,
                with_payload=True,
                with_vectors=True
            )[0]
            
            if not all_points:
                logger.info("[Memory] No memories to consolidate")
                return {"status": "success", "memories_processed": 0, "merged": 0, "archived": 0}
            
            now = time.time()
            age_seconds = age_days * 24 * 60 * 60
            merged_count = 0
            archived_count = 0
            to_delete = []
            
            # Group similar memories
            processed = set()
            for i, point1 in enumerate(all_points):
                if point1.id in processed:
                    continue
                
                metadata1 = point1.payload
                timestamp1 = metadata1.get("timestamp", 0)
                
                # Check if very old (archive)
                if now - timestamp1 > age_seconds:
                    # Archive old memory (mark for deletion, but could move to archive collection)
                    to_delete.append(point1.id)
                    archived_count += 1
                    processed.add(point1.id)
                    continue
                
                # Find similar memories
                similar_group = [point1]
                for j, point2 in enumerate(all_points[i+1:], start=i+1):
                    if point2.id in processed:
                        continue
                    
                    # Calculate similarity
                    if hasattr(point1, 'vector') and hasattr(point2, 'vector'):
                        similarity = np.dot(point1.vector, point2.vector) / (
                            np.linalg.norm(point1.vector) * np.linalg.norm(point2.vector)
                        )
                        
                        if similarity >= similarity_threshold:
                            similar_group.append(point2)
                            processed.add(point2.id)
                
                # Merge similar memories if more than one
                if len(similar_group) > 1:
                    # Keep the most salient one, merge text
                    best = max(similar_group, key=lambda p: p.payload.get("salience", 0.5))
                    merged_text = "\n\n".join([p.payload.get("text", "") for p in similar_group])
                    
                    # Update best memory with merged content
                    merged_metadata = best.payload.copy()
                    merged_metadata["consolidated_from"] = [p.id for p in similar_group if p.id != best.id]
                    merged_metadata["consolidated_at"] = time.time()
                    
                    # Delete merged memories
                    for p in similar_group:
                        if p.id != best.id:
                            to_delete.append(p.id)
                    
                    # Update best memory
                    self.client.upsert(
                        collection_name=COLLECTION_NAME,
                        points=[models.PointStruct(
                            id=best.id,
                            vector=best.vector,
                            payload={"text": merged_text, **merged_metadata}
                        )]
                    )
                    
                    merged_count += len(similar_group) - 1
            
            # Delete consolidated/archived memories
            if to_delete:
                self.client.delete(
                    collection_name=COLLECTION_NAME,
                    points_selector=models.PointIdsList(points=to_delete)
                )
            
            # Update consolidation history
            consolidation_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "memories_processed": len(all_points),
                "merged": merged_count,
                "archived": archived_count,
                "similarity_threshold": similarity_threshold,
                "age_days": age_days
            }
            
            if "consolidation_history" not in self.memory_versions:
                self.memory_versions["consolidation_history"] = []
            self.memory_versions["consolidation_history"].append(consolidation_entry)
            self.memory_versions["last_consolidation"] = time.time()
            
            # Keep last 100 consolidation entries
            if len(self.memory_versions["consolidation_history"]) > 100:
                self.memory_versions["consolidation_history"] = self.memory_versions["consolidation_history"][-100:]
            
            self._save_memory_versions()
            
            # Log consolidation
            try:
                with open(MEMORY_CONSOLIDATION_LOG, "a", encoding="utf-8") as f:
                    f.write(json.dumps(consolidation_entry) + "\n")
            except Exception as e:
                logger.warning(f"[Memory] Failed to write consolidation log: {e}")
            
            logger.info(f"[Memory] Consolidation complete: {merged_count} merged, {archived_count} archived")
            
            return {
                "status": "success",
                "memories_processed": len(all_points),
                "merged": merged_count,
                "archived": archived_count
            }
            
        except Exception as e:
            logger.error(f"[Memory] Consolidation failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def search(self, query: str, filters: Optional[Dict[str, Any]] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Enhanced search with optional metadata filters.
        """
        try:
            # Build filter if provided
            qdrant_filter = None
            if filters:
                filter_conditions = []
                for key, value in filters.items():
                    filter_conditions.append(
                        models.FieldCondition(key=key, match=models.MatchValue(value=value))
                    )
                if filter_conditions:
                    qdrant_filter = models.Filter(must=filter_conditions)
            
            vector = self._get_embedding(query)
            
            results = self.client.query_points(
                collection_name=COLLECTION_NAME,
                query=vector,
                query_filter=qdrant_filter,
                limit=limit
            ).points
            
            memories = []
            for hit in results:
                metadata = hit.payload
                memories.append({
                    "text": metadata.get("text", ""),
                    "score": hit.score if hasattr(hit, 'score') else 0.0,
                    "metadata": {k: v for k, v in metadata.items() if k != "text"},
                    "id": hit.id
                })
            
            return memories
            
        except Exception as e:
            logger.error(f"[Memory] Search failed: {e}", exc_info=True)
            return []
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """Get statistics about stored memories."""
        try:
            collection_info = self.client.get_collection(COLLECTION_NAME)
            
            return {
                "total_memories": collection_info.points_count,
                "version": self.memory_versions.get("version", 1),
                "last_consolidation": self.memory_versions.get("last_consolidation"),
                "consolidation_count": len(self.memory_versions.get("consolidation_history", [])),
                "collection_name": COLLECTION_NAME,
                "vector_size": VECTOR_SIZE
            }
        except Exception as e:
            logger.error(f"[Memory] Failed to get stats: {e}")
            return {"error": str(e)}
    
    def cleanup_old_memories(self, age_days: int = 90, dry_run: bool = False) -> Dict[str, Any]:
        """Clean up very old memories (archive or delete)."""
        try:
            logger.info(f"[Memory] Cleaning up memories older than {age_days} days (dry_run: {dry_run})")
            
            cutoff_time = time.time() - (age_days * 24 * 60 * 60)
            
            # Get all memories
            all_points = self.client.scroll(
                collection_name=COLLECTION_NAME,
                limit=10000,
                with_payload=True
            )[0]
            
            old_memories = [
                p.id for p in all_points
                if p.payload.get("timestamp", 0) < cutoff_time
            ]
            
            if not old_memories:
                logger.info("[Memory] No old memories to clean up")
                return {"status": "success", "cleaned": 0}
            
            if not dry_run:
                self.client.delete(
                    collection_name=COLLECTION_NAME,
                    points_selector=models.PointIdsList(points=old_memories)
                )
                logger.info(f"[Memory] Cleaned up {len(old_memories)} old memories")
            else:
                logger.info(f"[Memory] Would clean up {len(old_memories)} old memories (dry run)")
            
            return {
                "status": "success",
                "cleaned": len(old_memories) if not dry_run else 0,
                "would_clean": len(old_memories) if dry_run else 0
            }
            
        except Exception as e:
            logger.error(f"[Memory] Cleanup failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def wipe(self):
        """
        DANGER: Clears all memories.
        Use with extreme caution - this is irreversible.
        """
        try:
            logger.critical("[Memory] WIPING ALL MEMORIES - This is irreversible!")
            self.client.delete_collection(COLLECTION_NAME)
            self._ensure_collection()
            
            # Reset version tracking
            self.memory_versions = {
                "version": 1,
                "last_consolidation": None,
                "total_memories": 0,
                "consolidation_history": []
            }
            self._save_memory_versions()
            
            logger.critical("[Memory] All memories wiped")
        except Exception as e:
            logger.error(f"[Memory] Error wiping memories: {e}", exc_info=True)
            raise


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
