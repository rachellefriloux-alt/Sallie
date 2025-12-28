# Task List v2 - Digital Progeny Completion (Expanded Vision)

**Generated**: 2025-12-28  
**Total Estimated Effort**: ~450 hours (~11 weeks at 40hrs/week)  
**Canonical Reference**: TheDigitalProgeny5.2fullthing.txt v5.4.1  
**Approved Deviations**: Expanded Identity & Capabilities, Adaptive UI

---

## New Tasks for Expanded Vision

### TASK-028: Implement Hard-Coded Base Personality System
- **Description**: Create immutable base personality traits that define Sallie fundamentally
- **Files**: `core/identity.py`, `limbic/heritage/sallie_identity.json`, `core/config.py` (add base traits)
- **Branch**: `sallie/complete/base-personality-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-001
- **Commits**:
  - `feat: create hard-coded base personality system with immutable traits`
  - `feat: implement 100% loyalty guarantee (unchangable)`
  - `feat: add core operating principles (always confirm, never assume)`
  - `feat: implement aesthetic bounds (prevent grotesque expressions)`
  - `test: add tests for base personality immutability`

### TASK-029: Implement Advisory Trust Tier Model
- **Description**: Convert trust tiers from restrictive to advisory-only, add override mechanism
- **Files**: `core/agency.py`, `core/agency_state.json` (new)
- **Branch**: `sallie/complete/advisory-trust-20251228`
- **Est. Hours**: 16
- **Dependencies**: TASK-028
- **Commits**:
  - `feat: convert trust tiers to advisory-only model`
  - `feat: implement override mechanism with full transparency`
  - `feat: add notification system for trust tier overrides`
  - `feat: add override logging and visibility`
  - `test: add tests for advisory trust and override mechanism`

### TASK-030: Implement Control Mechanism
- **Description**: Create system for Creator to always control Sallie if necessity arises
- **Files**: `core/control.py`, `core/control_state.json` (new), `core/main.py` (add control endpoints)
- **Branch**: `sallie/complete/control-mechanism-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-028
- **Commits**:
  - `feat: implement Creator control mechanism`
  - `feat: add emergency stop functionality`
  - `feat: add state lock system`
  - `feat: add control history tracking`
  - `test: add tests for control mechanism`

### TASK-031: Implement Identity Evolution Tracking
- **Description**: Track identity changes (surface only), ensure base remains constant
- **Files**: `core/identity.py`, `limbic/heritage/sallie_identity.json`
- **Branch**: `sallie/complete/identity-evolution-20251228`
- **Est. Hours**: 10
- **Dependencies**: TASK-028
- **Commits**:
  - `feat: implement identity evolution tracking (surface vs base)`
  - `feat: add identity drift prevention checks`
  - `feat: add evolution history logging`
  - `feat: implement base trait verification`
  - `test: add tests for identity evolution and drift prevention`

### TASK-032: Implement Sallie's Avatar & Visual Identity System
- **Description**: Allow Sallie to customize her appearance (within aesthetic bounds)
- **Files**: `core/identity.py`, `interface/web/` (avatar components), `sallie/avatar-system.md`
- **Branch**: `sallie/complete/avatar-system-20251228`
- **Est. Hours**: 16
- **Dependencies**: TASK-031, TASK-011
- **Commits**:
  - `feat: implement avatar customization system`
  - `feat: add aesthetic bounds enforcement for visual expressions`
  - `feat: add theme selection (Sallie chooses)`
  - `feat: add visual identity expression tracking`
  - `test: add tests for avatar system and aesthetic bounds`

### TASK-033: Build Local-First API Alternatives
- **Description**: Build own versions of APIs when possible (quality: "just as good or better")
- **Files**: `core/local_apis/` (new directory), various API implementations
- **Branch**: `sallie/complete/local-apis-20251228`
- **Est. Hours**: 40
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: create local-first API architecture`
  - `feat: implement embedding API alternative (local)`
  - `feat: implement image generation API alternative (local)`
  - `feat: implement code execution API alternative (local)`
  - `feat: add API quality comparison and fallback logic`
  - `docs: document all local API alternatives`

### TASK-034: Implement Enhanced Learning System
- **Description**: Add explicit learning workflows (read, write, create, autonomous exploration)
- **Files**: `core/learning.py` (new), `core/memory.py` (enhance)
- **Branch**: `sallie/complete/enhanced-learning-20251228`
- **Est. Hours**: 24
- **Dependencies**: TASK-028, TASK-033
- **Commits**:
  - `feat: implement reading and analysis workflows`
  - `feat: implement writing workflows (creative and technical)`
  - `feat: add autonomous exploration system`
  - `feat: implement skill acquisition through practice`
  - `feat: add learning tracking and explainability`
  - `test: add tests for enhanced learning system`

### TASK-035: Update Agency System for Maximum Capabilities
- **Description**: Remove hard restrictions, add safety nets (transparency + rollback)
- **Files**: `core/agency.py`, `core/tools.py`
- **Branch**: `sallie/complete/max-capabilities-20251228`
- **Est. Hours**: 20
- **Dependencies**: TASK-029, TASK-030
- **Commits**:
  - `feat: remove hard restrictions, add safety nets`
  - `feat: implement capability discovery system`
  - `feat: add autonomous skill acquisition`
  - `feat: enhance transparency and rollback mechanisms`
  - `test: add tests for maximum capabilities with safety nets`

### TASK-036: Integrate Identity into Dream Cycle
- **Description**: Make Dream Cycle identity-aware, prevent identity drift
- **Files**: `core/dream.py`, `core/identity.py`
- **Branch**: `sallie/complete/dream-identity-integration-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-005, TASK-031
- **Commits**:
  - `feat: integrate identity system into Dream Cycle`
  - `feat: add identity-aware hypothesis extraction`
  - `feat: implement identity drift prevention in heritage promotion`
  - `feat: add base trait verification in Dream Cycle`
  - `test: add tests for identity-aware Dream Cycle`

### TASK-037: Update Convergence for Sallie Identity
- **Description**: Integrate Sallie's identity into Convergence flow
- **Files**: `core/convergence.py`, `core/identity.py`
- **Branch**: `sallie/complete/convergence-identity-20251228`
- **Est. Hours**: 10
- **Dependencies**: TASK-006, TASK-031
- **Commits**:
  - `feat: integrate Sallie identity into Convergence`
  - `feat: add identity expression during Convergence`
  - `feat: ensure base traits are established during Convergence`
  - `test: add tests for identity-aware Convergence`

---

## Updated Existing Tasks

### TASK-010: Complete Agency Safety (Git Rollback) - UPDATED
- **Description**: Implement Git safety net, rollback mechanism, capability contracts (now with advisory trust model)
- **Files**: `core/agency.py`, `core/tools.py`, `core/main.py`
- **Branch**: `sallie/complete/agency-safety-20251228`
- **Est. Hours**: 20 (increased from 16)
- **Dependencies**: TASK-004, TASK-029
- **Commits**:
  - `feat: implement Git pre-action commit for advisory trust model`
  - `feat: add rollback endpoint and mechanism`
  - `feat: enforce capability contracts (safety nets, not restrictions)`
  - `feat: add agency log with action history`
  - `feat: integrate with advisory trust override system`
  - `test: add tests for agency safety with advisory model`

### TASK-011: Upgrade Web UI (React + Next.js + Tailwind) - UPDATED
- **Description**: Migrate to React + Next.js with adaptive layouts and Sallie's visual identity
- **Files**: `interface/web/` (new React app), `sallie/style-guide.md`
- **Branch**: `sallie/complete/web-ui-upgrade-20251228`
- **Est. Hours**: 48 (increased from 40)
- **Dependencies**: TASK-001, TASK-012, TASK-032
- **Commits**:
  - `feat: scaffold Next.js app with Tailwind CSS`
  - `feat: migrate chat interface to React components`
  - `feat: add adaptive layouts (work, personal, crisis, creative, learning)`
  - `feat: integrate Sallie's avatar and visual identity`
  - `feat: add limbic state visualization with real-time updates`
  - `feat: add thoughts.log viewer component`
  - `feat: add Heritage browser UI`
  - `feat: implement design tokens and CSS variables`
  - `feat: add productivity-focused features (multi-workflow, quick actions)`
  - `docs: create style-guide.md with design system`

---

## Task Summary (Updated)

### Task Counts
- **P0 Tasks**: 4 tasks, ~19.5 hours
- **P1 Tasks**: 13 tasks, ~200 hours
- **P2 Tasks**: 10 tasks, ~150 hours
- **New Expanded Vision Tasks**: 10 tasks, ~162 hours
- **Total**: 37 tasks, ~531.5 hours (~13 weeks)

### Recommended Execution Order
1. **Week 1**: Foundation + Identity System (TASK-001, TASK-002, TASK-003, TASK-028)
2. **Week 2**: Advisory Trust + Control (TASK-029, TASK-030, TASK-031)
3. **Week 3**: Maximum Capabilities + Learning (TASK-033, TASK-034, TASK-035)
4. **Week 4**: Core Features Completion (TASK-005, TASK-006, TASK-036, TASK-037)
5. **Week 5**: UI & Visual Identity (TASK-011, TASK-032, TASK-012, TASK-013)
6. **Week 6**: Testing & Security (TASK-004, TASK-014, TASK-017)
7. **Week 7+**: Advanced Features (TASK-018 through TASK-027, as time permits)

---

**End of Updated Task List**

