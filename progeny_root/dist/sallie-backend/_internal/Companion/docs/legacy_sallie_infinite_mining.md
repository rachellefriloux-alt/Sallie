# Legacy Mining — `sallie-infinite-main`

This repo is documentation-forward and is most valuable for **policy, safety, and operational posture** (less for code).

## High-signal reusable patterns

### 1) Layered architecture

From `docs/ARCHITECTURE.md`:

- Clients → Core Runtime → Memory Store → Retrieval Layer → Tools Layer → Policy Layer → Labs
- model router (local and cloud) with clear labeling
- connector-first retrieval (connector contract)
- audit-first tooling (log tool calls with inputs/outputs)

### 2) Safety + privacy defaults

From `docs/SAFETY_PRIVACY.md`:

- autonomy off by default
- cloud off by default
- tool actions logged
- per-connector permissions (read/write separation)
- high-risk actions always confirmed
- audit log contents are explicitly enumerated

## Gaps / caveats

- This is primarily a spec; actual enforcement depends on implementation.

## Progeny port recommendation

- Adopt these docs as the **north star** for governance:
  - Progeny should have an explicit permission model, and an append-only audit log.
- Use the Progeny verifier (`core/verify_governance.py`) to enforce these defaults over time.
