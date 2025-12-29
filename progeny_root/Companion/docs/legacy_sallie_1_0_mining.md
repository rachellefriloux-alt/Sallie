# Legacy Mining — `sallie_1.0-sallie-1.0`

This repo contains the cleanest *compile-ish* Kotlin memory architecture of the legacy set (compared to the mixed/contradictory Kotlin in `Sallie-AI-main (1)`), plus a simple but valuable “constitution-as-code” verifier in Gradle.

## High-signal reusable patterns

### 1) Hierarchical memory with salience scoring

From `core/src/main/kotlin/com/sallie/core/memory/HierarchicalMemorySystem.kt`:

- Memory types include: episodic, semantic, emotional, procedural.
- Unified record `MemoryItem` with:
  - `priority` (0–100)
  - `emotionalValence` (-1..1) and `emotionalIntensity` (0..1)
  - `certainty` (0..1)
  - `connections` (IDs)
  - `reinforcementScore`
  - contextual metadata (`MemoryContext`)

**Salience** (likelihood of recall) is modeled as a multiplicative blend:

- recency factor: exponential decay with a stated ~1 week half-life
- emotional factor: boosts strong emotions
- frequency factor: log-scaled `accessCount`
- connection factor: more graph edges ⇒ more recall

This is a strong conceptual fit for Progeny’s retrieval ranking, especially as a *secondary re-ranker* feature.

### 2) “Sleep-style” consolidation

From `consolidateMemories()`:

- reinforce high-salience items (`salience > 0.7`) by increasing:
  - priority
  - certainty
  - reinforcementScore
- weaken stale, low-salience items (daysSinceAccess > 30, low accessCount, low salience)
- optionally form new connections via `MemoryIndexer.findSimilarMemories()`

This provides a clean blueprint for Progeny’s periodic maintenance jobs.

### 3) Association model (bidirectional connections)

- `connectMemories(sourceId, targetId)` adds bidirectional IDs.
- `getRelatedMemories()` returns:
  1) direct connections
  2) semantic similar (via indexer)
  3) keyword fallback (via inverted index)

For Progeny: keep the *behavior* but implement via explicit `MemoryEdge` records (typed, weighted) instead of untyped ID sets.

### 4) Storage and indexing contracts are well-separated

- `MemoryStorageService` interface: CRUD + query + flows + import/export.
- `MemoryIndexer` interface: semantic search + similar memories + clustering + chains.
- `FileBasedMemoryStorage` JSON-on-disk implementation:
  - type-based directories
  - in-memory cache + read/write lock
  - export/import via JSON serialization

This aligns well with a Progeny approach of:

- storage (SQLite / JSONL / filesystem)
- indexing (lexical + vector)

### 5) Governance gate (constitution-as-code)

From `gradle/verifySallieFeatures.gradle`:

- enforce persona header in Kotlin files (string checks)
- localOnly manifest must not request INTERNET
- require certain conceptual modules
- MainActivity size cap

For Progeny: port the *pattern*, not the Android specifics.

## Gaps / caveats

- The in-file indices (`contentIndex`, `tagIndex`, etc.) can drift unless update/remove is perfectly consistent.
- `cleanupMemories()` removes low-salience items (hard delete). In Progeny we should **archive** by default.
- Connections are untyped and unweighted in the core model.

## Progeny port recommendation

- Use this repo’s `HierarchicalMemorySystem` as the primary reference for:
  - salience features
  - consolidation job logic
  - storage/indexer interface separation
- Prefer Progeny’s canonical `MemoryRecord` + `MemoryEdge` (see `docs/memory_port_design.md`) and map these concepts into it.
