# Progeny Structure Inventory (v5.4.1)

This is the authoritative inventory of the current `progeny_root/` structure: every folder/file, its purpose, and how it maps to the Digital Progeny v5.4.1 “Right-Hand” vision.

Guiding constraints (must remain true):

- Local-first defaults (no cloud required).
- Bounded agency (Tiered permissions; drafts-only when constrained).
- Audit-first tooling (logs are append-first; actions are traceable).
- Archive > delete (reversible hygiene).
- Dream Cycle is the safe place for consolidation/maintenance.

## Top-level layout

### `archive/`

Purpose:

- Cold storage for rotated/archived artifacts.
- Supports v5.4.1 “Second Brain hygiene” and “Archive > Delete.”

Current contents:

- `GENESIS.txt` — timestamp marker for initial creation.

Status:

- Active (used now); will expand as hygiene automation is added.

### `backups/`

Purpose:

- Explicit backup area for snapshots and rollback artifacts.
- Intended to support “time-travel” and “transactional writes” patterns.

Subfolders:

- `snapshots/` — planned for periodic copies of state and/or exports.

Status:

- Placeholder scaffolding (used later by scheduled jobs).

### `BUILD_LOG.md`

Purpose:

- Implementation checklist and progress tracker for the "Handover" phase.
- Tracks the completion of Phase 0-8 of the core build.

Status:

- Active.

### `LAUNCH_PLAN.md`

Purpose:

- The "Flight Manual" for going from zero to full autonomy.
- Covers Hardware Setup, Ignition, Imprinting, and Calibration.

Status:

- Active.

### `TECHNICAL_ARCHITECTURE.md`

Purpose:

- The concrete blueprint for the Python implementation.
- Defines the classes, data flows ("The Live Pulse"), and system interactions.

Status:

- Active.

### `convergence/`

Purpose:

- Holds assets/workflows for the “Great Convergence” process (question set, derived state, summaries).

Status:

- Placeholder scaffolding.

### `core/`

Purpose:

- Runtime contracts and safety rails.
- Houses the project’s “constitution-as-code” checks.
- Contains the Python runtime modules (the "Brain").

Files:

- `config.json` — canonical runtime config (version, models, paths, behavior).
- `verify_governance.py` — non-destructive governance verifier (local-first checks, config sanity).
- `.dream_lock` — semaphore file used by runtime to prevent overlapping Dream Cycle jobs.
- `dream_checkpoint.json` — crash recovery state for Dream Cycle.
- `main.py` — FastAPI entry point.
- `agency.py` — Permission matrix enforcement.
- `limbic.py` — Limbic state machine.
- `retrieval.py` — Memory retrieval logic.
- `synthesis.py` — Response generation.
- `prompts.py` — System prompts (Gemini/INFJ/Synthesis).
- `utils.py` — Shared logging and helpers.
- `dream.py` — Dream Cycle automation.
- `tools.py` — Surrogate tools.
- `sensors.py` — Environmental monitoring.
- `ghost.py` — Desktop presence.
- `voice.py` — Voice interface.
- `degradation.py` — Failure handling.
- `convergence.py` — Great Convergence logic.
- `extraction.py` — Pattern extraction.
- `mirror.py` — Q13 synthesis.
- `monologue.py` — Internal monologue logic.
- `perception.py` — Input analysis.

Status:

- Active (config + verifier in use; runtime modules are stubs ready for implementation).

### `docker-compose.yml`

Purpose:

- Local-first infrastructure: Ollama + Qdrant.
- Defaults to localhost-only binding.

Status:

- Active.

### `docker-compose.lan.yml`

Purpose:

- Opt-in override to expose ports on LAN.
- Must never be the default posture.

Status:

- Active (opt-in only).

### `docs/`

Purpose:

- “Intent on disk”: architecture, extracted legacy knowledge, and integration plan.

Files:

- `legacy_extraction_integration_plan.md` — the bridge plan mapping mined Sallie patterns into Progeny while staying aligned to v5.4.1.
- `memory_port_design.md` — consolidated memory architecture design (canonical record shape, ranking, consolidation, decay/reinforcement).
- `legacy_*_mining.md` — provenance docs describing what was mined from legacy repos.
- `PROGENY_STRUCTURE_INVENTORY.md` — this document.

Status:

- Active (source-of-truth for intended architecture).

### `drafts/`

Purpose:

- Quarantine output area for “Tier 1 / Associate” behaviors.
- Where the system can safely write without touching operational state.

Status:

- Active as a safety boundary.

### `outbox/`

Purpose:

- Quarantine area for Tier 2 draft messages (email/chat) requiring manual review.

Status:

- Active as a safety boundary.

### `foundry/`

Purpose:

- Benchmarks, evaluations, and experiments.

Subfolders:

- `benchmarks/` — planned for eval datasets, scoring results, and model comparisons.

Status:

- Placeholder scaffolding.

### `imprinting/`

Purpose:

- Creator voice samples and calibration artifacts.
- Supports “Extracted Voice” and persona consistency.

Status:

- Placeholder scaffolding.

### `interface/`

Purpose:

- UI/client assets (web, desktop shell, etc.) and interaction contracts.

Status:

- Placeholder scaffolding.

### `limbic/`

Purpose:

- The “stateful self”: trust/warmth/arousal/valence/posture, plus heritage memory.
- Supports v5.4.1 Posture Modes and the Right-Hand operating contract.

Files:

- `soul.json` — live limbic state seed (trust/warmth/arousal/valence/posture).

Subfolders:

- `heritage/` — durable identity memory.

Status:

- Active (seeded; will evolve through Dream Cycle and explicit edits).

### `limbic/heritage/`

Purpose:

- Identity memory that changes carefully (Dream Cycle + veto model).

Files:

- `core.json` — prime directive and identity scaffold.
- `preferences.json` — tunable creator prefs.
- `learned.json` — learned beliefs scaffold.
- `changelog.md` — provenance of heritage changes.
- `decisions_log.md` — permanent decision log.

Subfolders:

- `history/` — historical snapshots of heritage changes.

Status:

- Active (seeded).

### `logs/`

Purpose:

- Audit-first and debugging-first posture.

Files:

- `thoughts.log` — internal planning/thought traces (if enabled).
- `agency.log` — records of actions taken.
- `audit.log` — security/audit trail.
- `error.log` — error reporting.

Subfolders:

- `sessions/` — planned for session transcripts/metadata.
- `archive/` — rotated logs.
- `content/` — intended for encrypted/shreddable content blobs (right-to-be-forgotten workflows).

Status:

- Active (files exist; content will grow as runtime tools are added).

### `memory/`

Purpose:

- Memory infrastructure, storage, and indexes.

Files:

- `patches.json` — Hypothesis Sandbox for Dream Cycle.

Subfolders:

- `qdrant/` — Qdrant persisted volume mount.

Status:

- Active as infrastructure mount point; memory logic implementation will live alongside this.

### `projects/`

Purpose:

- User-approved working projects (safe place to build real apps/docs under Progeny governance).

Status:

- Placeholder scaffolding.

### `README.md`

Purpose:

- The "Master Directive" and entry point for the project.
- Contains the Mission Brief, Architecture Overview, and Build Orders.

Status:

- Active.

### `requirements.txt`

Purpose:

- Python dependencies for the Progeny runtime.

Status:

- Active.

### `security/`

Purpose:

- Reserved for keys, policies, and security tooling.
- Also acts as a denylisted area in config by default.

Status:

- Placeholder scaffolding (intentionally empty + protected).

### `safe_scripts/`

Purpose:

- Sandbox for `ShellExec` tool scripts (Tier 3 only).

Status:

- Active as a safety boundary.

### `sensors/`

Purpose:

- Inputs for state and posture selection (file activity, system load, etc.).

Files:

- `file_activity.json` — seed container for file events.
- `system_load.json` — seed container for load samples.
- `last_seed_ts.json` — last seed timestamp.

Status:

- Active as scaffolding; will be populated by sensor collectors.

### `tests/`

Purpose:

- Container for pytest suites.
- Supports the "Test" steps in the Build Log.

Status:

- Active (initialized).

### `working/`

Purpose:

- The mutable “Second Brain scratchpad.”

Files:

- `now.md` — daily focus.
- `open_loops.json` — active loops; stale marking should be non-destructive.
- `decisions.json` — rolling decision buffer (rotates into heritage log).
- `tuning.md` — tuning/repair notes.

Status:

- Active.

## Notes on legacy Sallie folders

The legacy Sallie repositories are *not required* for Progeny runtime. Their value has been distilled into:

- `docs/legacy_extraction_integration_plan.md`
- `docs/memory_port_design.md`
- `docs/legacy_*_mining.md`

Removing the legacy Sallie folders does not remove Progeny capabilities; it only removes the original source trees.
