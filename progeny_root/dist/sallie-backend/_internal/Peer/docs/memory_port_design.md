# Progeny Memory Port Design (Sallie Legacy Merge)

**Status**: Design Specification
**Backend**: Qdrant (Vector) + JSONL (Archive)
**Logic**: Hybrid (TypeScript Structure + Kotlin Math)

---

## 1. The Canonical Memory Record

We standardize on a single `MemoryRecord` shape that captures the best of the legacy systems.

```python
class MemoryRecord(BaseModel):
    id: str                  # UUID
    content: str             # The actual text
    created_at: float        # Timestamp
    last_accessed: float     # Timestamp
    access_count: int        # Frequency
    
    # Limbic Context (from Kotlin system)
    emotional_valence: float # -1.0 to 1.0
    emotional_arousal: float # 0.0 to 1.0
    
    # Type (from TS system)
    type: str                # "episodic", "semantic", "procedural", "core"
    
    # Graph (from TS system)
    tags: List[str]
    links: List[str]         # UUIDs of related memories
    
    # Derived
    salience: float          # Calculated score (0.0 - 1.0)
```

## 2. Storage Architecture

### Hot Storage (Qdrant)

- **Collection**: `progeny_memory`
- **Vector**: 384d (all-MiniLM-L6-v2)
- **Payload**: Full JSON of `MemoryRecord`
- **Purpose**: Fast semantic retrieval + filtering.

### Cold Storage (JSONL)

- **Path**: `progeny_root/memory/archive/`
- **Format**: One JSON object per line.
- **Purpose**: Disaster recovery + bulk analysis.

## 3. Retrieval Logic (MMR)

We do not just "search top K". We use **Maximal Marginal Relevance (MMR)** to ensure diversity.

$$Score = (Similarity \times 0.7) + (Freshness \times 0.2) + (Salience \times 0.1) - (Redundancy)$$

1. **Fetch**: Get top 20 by vector similarity.
2. **Re-rank**: Apply Salience boost (Kotlin math).
3. **Filter**: Remove items too similar to what's already in the context window.

## 4. Consolidation (Dream Cycle)

Runs nightly (2 AM).

1. **Decay**: Reduce `salience` of untouched memories.
2. **Reinforce**: Increase `salience` of high-access memories.
3. **Synthesize**:
    - Find clusters of related episodic memories.
    - Ask LLM: "Summarize these into a single semantic fact."
    - Save new Semantic memory.
    - Archive original episodic memories (if redundant).

## 5. Safety & Privacy

- **Local Only**: Qdrant binds to 127.0.0.1.
- **No Cloud Sync**: Memories never leave the machine.
- **Right to be Forgotten**: `delete_memory(uuid)` is a hard delete from Qdrant, soft delete (tombstone) in JSONL.

