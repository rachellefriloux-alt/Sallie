# Progeny — Legacy Extraction Integration Plan (Sallie → Progeny)

**Status**: Active Bridge Plan
**Target**: Digital Progeny v5.4.1
**Source**: Legacy Sallie Repos (`before-main`, `sallie-project-main`, `sallie_1.0`, `sallie-infinite`)

This document maps the "ingredients" mined from legacy repos to the "recipe" of Progeny v5.4.1.

---

## 1. Memory System (The "Sallie-Project" Core)

**Target**: `progeny_root/core/retrieval.py` + `progeny_root/memory/`
**Source**: `sallie-project-main/src/core/services/memory/` (TypeScript)

We are porting the **structure**, not the code.

| Feature | Legacy Source | Progeny Implementation |
| :--- | :--- | :--- |
| **Entity Models** | `MemoryEntity.ts` (Episodic, Semantic) | `MemoryRecord` (Pydantic model) in `retrieval.py` |
| **Storage** | `IMemoryStore` + JSON adapters | Qdrant (Vector) + JSONL (Backup) |
| **Consolidation** | `ConsolidationEngine.ts` (scoring) | Dream Cycle job (`dream.py`) |
| **Associations** | Graph logic | Qdrant payload links + `MemoryEdge` |

**Integration Rule**: Use the TypeScript system's *modularity* but the Kotlin system's *ranking math*.

---

## 2. Ranking & Salience (The "Kotlin" Math)

**Target**: `progeny_root/core/retrieval.py` (MMR Logic)
**Source**: `sallie_1.0/.../HierarchicalMemorySystem.kt`

The legacy Kotlin repo had the best math for "what is important."

| Feature | Legacy Source | Progeny Implementation |
| :--- | :--- | :--- |
| **Salience Score** | `calculateSalience()` (Recency *Emotion* Freq) | `calculate_salience()` in `retrieval.py` |
| **Decay** | Exponential decay formula | Applied during Dream Cycle updates |
| **Reinforcement** | `reinforce()` on access | Update `last_accessed` + `access_count` on read |

**Integration Rule**: Port the math formulas directly into Python.

---

## 3. Persona & Tone (The "Before-Main" Soul)

**Target**: `progeny_root/core/limbic.py` + `synthesis.py`
**Source**: `before-main/.../PersonaEngine.kt`

**Legacy Concept**: "Tough Love" vs "Soul Care" modes.
**Progeny v5.4.1**: "Posture Modes" (Companion, Co-Pilot, Peer, Expert).

| Legacy Mode | Progeny Posture |
| :--- | :--- |
| Soul Care | Companion |
| Focused | Co-Pilot |
| Steady | Peer |
| Gentle Push | Expert |

**Integration Rule**: The legacy "Mood" state machine becomes the `LimbicState` class in `limbic.py`.

---

## 4. Governance & Safety (The "Infinite" Spec)

**Target**: `progeny_root/core/agency.py` + `verify_governance.py`
**Source**: `sallie-infinite-main/docs/SAFETY_PRIVACY.md`

| Feature | Legacy Source | Progeny Implementation |
| :--- | :--- | :--- |
| **Autonomy Off** | Default setting | `Trust Tier 0` default |
| **Cloud Off** | Default setting | `localhost` binding (Docker) |
| **Audit Log** | `tool_usage.log` | `agency.log` (append-only) |
| **Confirmation** | "Human in loop" | `One-Question Rule` + Permission Matrix |

**Integration Rule**: The "Infinite" docs are the *requirements* for `agency.py`.

---

## 5. Implementation Roadmap

1. **Foundation (Done)**: Directory structure, config, governance verifier.
2. **Limbic Core**: Implement `limbic.py` state machine.
3. **Memory Store**: Implement `retrieval.py` connecting to Qdrant.
4. **Perception**: Implement `perception.py` (text analysis).
5. **Synthesis**: Implement `synthesis.py` (LLM loop).
6. **Dream Cycle**: Implement `dream.py` (consolidation).
