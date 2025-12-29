# Legacy Mining — `sallie-project-main`

This repo contains the most *engineering-complete* TypeScript memory system: strong typing, modular architecture, retrieval strategies, consolidation, association graphs, and (optionally) encryption.

## High-signal reusable patterns

### 1) Clean modular boundaries

From `src/core/services/memory/README.md` and code layout:

- models: `MemoryEntity` + type-specific entities (episodic/semantic/emotional/procedural)
- storage: `IMemoryStore` + adapters and encrypted storage
- retrieval strategies: contextual/temporal/associative/emotional
- consolidation: short-term buffer → long-term store
- association graph + engine
- indexing: temporal index + semantic index

This is the best “system-shaped” blueprint to port directly into Progeny.

### 2) Consolidation Engine design

From `consolidation/ConsolidationEngine.ts`:

- importance scoring boosts for:
  - access frequency
  - number of entities
  - confidence
  - related consolidated memories
- semantic contradiction integration (merge/resolve)
- pattern detection:
  - entity co-occurrence patterns
  - topic/tag frequency patterns

This aligns with Progeny goals (long-term memory quality) and is more coherent than the Kotlin consolidation variants.

### 3) Sync Engine (concept only)

From `sync/SyncEngine.ts`:

- defines a device ID, conflict-resolution modes, delta sync flags
- currently mostly stubbed; useful as a *requirements sketch*, not as implementation.

## Gaps / caveats

- Some modules are aspirational (“enterprise grade”) but depend on careful store implementations.
- Cross-device sync is incomplete.

## Progeny port recommendation

- Treat this TS system as the **primary** reference architecture.
- Merge in select Kotlin ideas only where they improve ranking dynamics:
  - decay curves
  - reinforcement propagation
  - working memory buffer

See `docs/memory_port_design.md` for the combined target design.
