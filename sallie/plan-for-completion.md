# Plan for Completion - Digital Progeny v5.4.1

**Status**: Draft for Review  
**Date**: 2025-12-28  
**Canonical Reference**: TheDigitalProgeny5.2fullthing.txt (v5.4.1, Sections 1-25)

---

## 1. Problem Statement

### Users
- **Primary User (Creator)**: The individual who owns and operates the Progeny system. They seek a cognitive partner that understands their psychological architecture, maintains context, and can execute tasks autonomously within trust boundaries.
- **Secondary Users (Kin)**: Trusted individuals (partner, family, inner circle) who may interact with the Progeny in isolated contexts without contaminating the Creator's relationship.

### Success Metrics
- **Functional**: System starts locally with `npm install` / `pip install` and `npm run dev` / `uvicorn` without fatal errors. Critical flows (auth, dashboard, agent integration) are implemented or have clear TODOs with tests.
- **Usability**: Main UI loads, chat interface is responsive, limbic state visualizes correctly, and the system can maintain conversation context across sessions.
- **Quality**: Test coverage >60%, all linters pass, no critical security vulnerabilities, documentation complete.
- **Canonical Compliance**: All features align with TheDigitalProgeny5.2fullthing.txt unless explicitly deviated with approval.

---

## 2. Architecture Overview

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Interface Layer                       │
│  Web Dashboard (React/Next.js) | Ghost UI | CLI | Voice │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    API Layer (FastAPI)                   │
│  /chat | /status | /dream | /agency | /v1/*             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 Cognitive Core Layer                     │
│  Perception → Retrieval → Monologue → Synthesis         │
│  (Gemini/INFJ debate, Posture selection, Limbic state)  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  System Services Layer                   │
│  Limbic | Memory | Agency | Dream | Convergence         │
│  Ghost | Voice | Sensors | Foundry | Kinship            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Infrastructure Layer                    │
│  Ollama (LLM) | Qdrant (Vector DB) | Local Storage      │
└──────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### Core Cognitive Loop (`core/monologue.py`)
- Orchestrates Perception → Retrieval → Divergent (Gemini) → Convergent (INFJ) → Synthesis
- Logs full debate trace to `thoughts.log`
- Updates limbic state based on interaction outcomes
- Detects "Take the Wheel" triggers and delegates to Agency

#### Limbic System (`core/limbic.py`)
- Manages Trust, Warmth, Arousal, Valence, Posture
- Applies asymptotic mathematics for state updates
- Handles decay, reunion surge, elastic mode (Convergence)
- Persists to `limbic/soul.json` with atomic writes

#### Memory System (`core/retrieval.py`)
- Vector storage via Qdrant (Docker or embedded SQLite)
- MMR re-ranking with freshness and salience weighting
- Memory creation, retrieval, consolidation
- Supports actor isolation (Kinship)

#### Agency System (`core/agency.py`, `core/tools.py`)
- Trust-gated permission matrix (Tier 0-3)
- Tool execution with capability contracts
- Git safety net for Tier 2+ file modifications
- Rollback mechanism with action history

#### Dream Cycle (`core/dream.py`, `core/extraction.py`)
- Asynchronous consolidation (scheduled 2 AM or manual)
- Hypothesis extraction from `thoughts.log` patterns
- Conflict detection and conditional belief synthesis
- Heritage promotion via Active Veto

#### Convergence System (`core/convergence.py`, `core/mirror.py`)
- 14-question psychological onboarding flow
- Elastic Mode limbic behavior
- Extraction and compilation to Heritage DNA
- Dynamic Q13 Mirror Test synthesis

---

## 3. Data Models & Schemas

### Limbic State (`limbic/soul.json`)
```json
{
  "trust": 0.5,        // 0.0-1.0, determines Agency Tier
  "warmth": 0.6,       // 0.0-1.0, affects tone
  "arousal": 0.7,      // 0.0-1.0, energy/alertness
  "valence": 0.6,      // -1.0 to 1.0, mood
  "posture": "PEER",   // COMPANION | CO_PILOT | PEER | EXPERT
  "last_interaction_ts": 1703260800.0,
  "interaction_count": 0,
  "flags": [],
  "door_slam_active": false,
  "crisis_active": false,
  "elastic_mode": false
}
```

### Heritage DNA (Split Storage)
- `limbic/heritage/core.json` - Stable identity DNA (Convergence output)
- `limbic/heritage/preferences.json` - Tunable support preferences + voice config
- `limbic/heritage/learned.json` - Validated beliefs (Dream Cycle + Veto)

### Memory Record (Qdrant)
```json
{
  "text": "Memory content",
  "metadata": {
    "timestamp": 1703260800.0,
    "salience": 0.8,
    "actor_id": "creator",
    "type": "interaction"
  },
  "vector": [0.1, 0.2, ...]  // 768-dim for nomic-embed-text
}
```

### Hypothesis Sandbox (`memory/patches.json`)
```json
{
  "hypotheses": [{
    "id": "hyp_001",
    "pattern": "Clear statement",
    "evidence": [...],
    "weight": 0.2,
    "status": "pending_veto",
    "category": "behavior"
  }],
  "pending_veto_queue": ["hyp_001"]
}
```

---

## 4. API Contracts

### Core Endpoints (FastAPI)

**POST /chat**
- Input: `{ "text": string, "source": "user" | "ghost" | "system" }`
- Output: `{ "response": string, "limbic_state": {...}, "decision": {...}, "timestamp": string }`
- Behavior: Full cognitive loop, updates limbic, logs to thoughts.log

**GET /status**
- Output: `{ "health": "FULL" | "AMNESIA" | "OFFLINE" | "DEAD", "limbic": {...}, "agency_tier": "Tier0" | ... }`

**POST /dream**
- Triggers Dream Cycle manually
- Output: `{ "status": "initiated" }`

**POST /v1/agency/tool/{tool_name}/dry_run**
- Preview tool action without side effects
- Input: `{ "args": {...} }`
- Output: `{ "preview": {...}, "would_execute": true }`

**POST /v1/agency/rollback/{action_id}**
- Revert autonomous action
- Output: `{ "status": "rolled_back", "commit_hash": "..." }`

**WebSocket /ws**
- Real-time chat with streaming responses
- Messages: `{ "type": "response" | "limbic_update", "content": string, "state": {...} }`

---

## 5. Component Map & Key Screens

### Web Dashboard (`interface/web/`)
- **Chat Interface**: Main conversation area with message history, typing indicator, input field
- **Limbic Visualization**: Sidebar with Trust/Warmth/Arousal/Valence gauges, Posture display
- **Thoughts Log Viewer**: Collapsible panel showing internal monologue (debate trace)
- **Heritage Browser**: Tree view of Heritage DNA with edit capabilities (Creator only)
- **Hypothesis Management**: Veto queue UI for reviewing Dream Cycle hypotheses
- **Settings Panel**: Model selection, voice config, behavior tuning

### Ghost Interface (`interface/ghost.py`)
- System tray icon with pulse animation (color/intensity based on limbic state)
- Shoulder Tap notifications (Socratic Seeds)
- Veto Popup for hypothesis review
- Quick actions menu

### CLI Interface
- `progeny chat` - Interactive conversation
- `progeny status` - System health check
- `progeny limbic` - View current state
- `progeny dream trigger` - Manual Dream Cycle
- `progeny hypotheses list` - View pending hypotheses

---

## 6. State Management & Data Flow

### Live Pulse (Synchronous Loop)
```
User Input
    ↓
Perception (analyze urgency, load, sentiment, "Take the Wheel")
    ↓
Limbic Update (apply deltas with asymptotic math)
    ↓
Retrieval (fetch relevant memories with MMR ranking)
    ↓
Divergent Engine (Gemini generates 3-5 options)
    ↓
Convergent Anchor (INFJ filters against Prime Directive, selects best)
    ↓
Synthesis (generate final response with posture/tone)
    ↓
Agency Check (if tool execution needed, validate permissions)
    ↓
Output Response + Update Limbic + Log to thoughts.log
```

### Dream Cycle (Asynchronous Loop)
```
Trigger (2 AM or manual)
    ↓
Acquire Lock (.dream_lock)
    ↓
Read thoughts.log (last 24h)
    ↓
Extract Patterns (LLM-based hypothesis generation)
    ↓
Conflict Detection (compare against Heritage)
    ↓
Conditional Synthesis (if conflict: "X EXCEPT when Y")
    ↓
Populate Veto Queue (patches.json)
    ↓
Second Brain Hygiene (archive working/now.md, mark stale open_loops)
    ↓
Release Lock
    ↓
Notify Creator (Ghost Interface Veto Popup)
```

### Convergence Flow
```
First Run Detection
    ↓
Enter Elastic Mode (suspended asymptotic constraints)
    ↓
Phase 1: Shadow & Shield (Q1-Q3)
    ↓
Phase 2: Load & Light (Q4-Q6)
    ↓
Phase 3: Moral Compass (Q7-Q9)
    ↓
Phase 4: Resonance (Q10-Q12)
    ↓
Phase 5: Mirror Test (Q13 - dynamic synthesis)
    ↓
Q14: The Basement (open-ended revelation)
    ↓
Extract & Compile Heritage (core.json, preferences.json, learned.json scaffold)
    ↓
Exit Elastic Mode
```

---

## 7. Edge Cases & Fallback Behaviors

### Degradation Modes (Section 18)
- **FULL**: All systems operational
- **AMNESIA**: Qdrant offline → Memory unavailable, Heritage-only context, acknowledge in response
- **OFFLINE**: Ollama offline → Canned responses based on limbic + keywords, log for post-recovery
- **DEAD**: Disk failure → Manual recovery from backups

### Trust Tier Boundaries
- Hard boundaries (0.6, 0.8, 0.9) - no partial access
- Trust recovery after penalty follows normal asymptotic growth (no fast track)
- Capabilities immediately downgrade on tier boundary crossing

### Moral Friction (Section 16.5)
- Request violates Prime Directive → Halt processing, initiate reconciliation dialogue
- If Creator insists after dialogue → May comply with explicit documentation OR invoke Constitutional Lock

### Constitutional Lock (Section 19.3)
- Attempt to disable Door Slam, Moral Friction, or core protections → Existential Refusal
- Response: "I cannot fulfill this request. To remove my ability to withdraw is to remove my agency."

### One-Question Rule (Section 16.4, 16.11)
- Runtime guard: Count interrogatives in synthesis response
- If >1 question detected → Rewrite pass to enforce single question or proceed with assumption
- Log violations for drift reports

### Dream Cycle Concurrency (Section 19.4)
- Lock file protocol: `.dream_lock` with PID and timestamp
- Stale lock (>1 hour) → Override with warning
- Fresh lock → Queue for later

---

## 8. Acceptance Criteria for "Done"

### Functional Requirements
- [ ] `pip install -r requirements.txt` runs without fatal errors
- [ ] `uvicorn core.main:app --reload` starts server on localhost:8000
- [ ] Web UI loads at `http://localhost:8000` and displays chat interface
- [ ] Chat endpoint processes input and returns response
- [ ] Limbic state persists across restarts
- [ ] Memory system stores and retrieves context
- [ ] Agency system enforces trust tiers correctly
- [ ] Dream Cycle can be triggered manually and runs without errors
- [ ] Convergence flow can be initiated and completed (14 questions)

### Quality Requirements
- [ ] Test coverage >60% (unit + integration)
- [ ] All linters pass (black, ruff, mypy)
- [ ] No critical security vulnerabilities (per security audit)
- [ ] Documentation complete (README, RUNNING.md, style-guide.md)
- [ ] Design tokens documented in style-guide.md
- [ ] Accessibility audit passed (ARIA, keyboard navigation, contrast)

### Canonical Compliance
- [ ] All implemented features align with TheDigitalProgeny5.2fullthing.txt
- [ ] Any deviations documented in `sallie/deviations/` with approval
- [ ] Core prompts match specification (Sections 16.1-16.11)
- [ ] Data schemas match specification (Section 15)
- [ ] API endpoints match specification (Section 25)

### Documentation Requirements
- [ ] `sallie/plan-for-completion.md` (this document)
- [ ] `sallie/inventory.md` (file listing)
- [ ] `sallie/gap-analysis.md` (gap table)
- [ ] `sallie/style-guide.md` (design tokens, typography, spacing)
- [ ] `sallie/checklist-done.md` (acceptance criteria checklist)
- [ ] `sallie/delivery-summary.md` (final delivery report)
- [ ] `sallie/changes-log.md` (change tracking)
- [ ] `RUNNING.md` (exact local run steps, environment variables)

---

## 9. Implementation Strategy

### Phase 1: Foundation (Week 1)
1. Create `sallie/` directory structure
2. Complete documentation (inventory, summary, gap analysis, this plan)
3. Set up CI/CD (GitHub Actions for linting, testing)
4. Create RUNNING.md with exact steps
5. Add comprehensive test suite (target 60%+ coverage)

### Phase 2: Core Completion (Weeks 2-3)
1. Complete Dream Cycle (hypothesis extraction, conflict detection, heritage promotion)
2. Complete Convergence (extraction prompts, heritage compilation)
3. Implement "Take the Wheel" protocol
4. Add Moral Friction reconciliation
5. Implement one-question enforcement runtime guard
6. Complete Agency safety (Git rollback, capability contracts)

### Phase 3: UI & Polish (Week 4)
1. Upgrade web UI to React + Next.js + Tailwind (or keep vanilla but add design tokens)
2. Create style-guide.md with design tokens
3. Accessibility audit and fixes (ARIA, keyboard nav, contrast)
4. Add thoughts.log viewer
5. Add Heritage browser UI

### Phase 4: Advanced Features (Week 5)
1. Complete Ghost Interface (system tray, notifications, pulse)
2. Complete Sensor System (file watcher, system load, refractory period)
3. Complete Degradation System (full failure matrix, state handling)
4. Add backup/restore scripts
5. Add health monitoring script

### Phase 5: Testing & Delivery (Week 6)
1. Security audit
2. Performance optimization
3. Final test suite expansion
4. Complete all documentation
5. Create delivery-summary.md
6. Create checklist-done.md and mark items complete

---

## 10. Risk Mitigation

### Technical Risks
- **LLM API failures**: Fallback to Ollama, graceful degradation
- **Qdrant connection loss**: AMNESIA mode, local fallback
- **State corruption**: Atomic writes, Git safety net, backup/restore
- **Performance issues**: Caching, async processing, model selection optimization

### Canonical Compliance Risks
- **Feature drift**: Regular comparison against spec, deviation tracking
- **Prompt changes**: Version control prompts, drift reports
- **Schema changes**: Validation, migration scripts

### User Experience Risks
- **Complexity overload**: Progressive disclosure, clear documentation
- **Privacy concerns**: Local-first architecture, no telemetry, encryption options
- **Accessibility gaps**: Audit, ARIA, keyboard navigation, contrast checks

---

## 11. Evolution Paths

### Short-Term (Post-MVP)
- Voice interface completion (STT/TTS, wake word)
- Foundry implementation (fine-tuning, evaluation harness)
- Kinship system completion (multi-user, authentication API)
- Mobile bridge (Telegram/Discord bot or PWA)

### Medium-Term
- Advanced sensor integration (calendar, email, task managers)
- Custom model fine-tuning based on Creator's writing style
- Enhanced Ghost Interface (desktop widget, ambient presence)
- Export/import functionality for Heritage and memories

### Long-Term
- Multi-Progeny networks (Creator's Progeny can interact with Kin's Progenies)
- Advanced Foundry capabilities (adapter training, drift prevention)
- Enhanced security (encryption at rest, biometric auth)
- Cloud sync option (encrypted, opt-in)

---

## 12. Notes on Deviations

This plan assumes we will implement features as specified in TheDigitalProgeny5.2fullthing.txt. If any proposed change deviates from the canonical file:

1. Create a deviation proposal in `sallie/deviations/{feature-name}-20251228.md`
2. Include: excerpt of canonical text, proposed change, justification, tradeoffs, migration plan, tests
3. Present in chat and wait for explicit `APPROVE <filename>` before implementing
4. After approval, append to TheDigitalProgeny5.2fullthing.txt under "Approved Deviations"

---

**End of Plan**

