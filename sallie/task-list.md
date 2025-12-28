# Task List - Digital Progeny Completion

**Generated**: 2025-12-28  
**Total Estimated Effort**: ~353.5 hours (~9 weeks at 40hrs/week)  
**Canonical Reference**: TheDigitalProgeny5.2fullthing.txt v5.4.1

---

## Task Organization

Tasks are organized by priority (P0 → P1 → P2) and grouped into logical work units. Each task includes:
- **ID**: Unique identifier
- **Description**: What needs to be done
- **Files**: Which files will change
- **Branch**: Git branch name (format: `sallie/complete/{task-slug}-20251228`)
- **Est. Hours**: Time estimate
- **Dependencies**: Other tasks that must complete first

---

## P0 Tasks (Critical - Must Complete First)

### TASK-001: Create sallie/ Directory Structure
- **Description**: Create `sallie/` directory with subdirectories for plan, deviations, docs
- **Files**: New directory structure
- **Branch**: `sallie/complete/setup-directory-20251228`
- **Est. Hours**: 0.5
- **Dependencies**: None
- **Commits**:
  - `feat: create sallie/ directory structure for planning and deviations`

### TASK-002: Create RUNNING.md
- **Description**: Write exact local run steps, environment variables, troubleshooting
- **Files**: `RUNNING.md` (root)
- **Branch**: `sallie/complete/running-doc-20251228`
- **Est. Hours**: 2
- **Dependencies**: None
- **Commits**:
  - `docs: add RUNNING.md with exact local setup and run instructions`

### TASK-003: Create Documentation Files
- **Description**: Create changes-log.md, checklist-done.md, delivery-summary.md templates
- **Files**: `sallie/changes-log.md`, `sallie/checklist-done.md`, `sallie/delivery-summary.md`
- **Branch**: `sallie/complete/doc-templates-20251228`
- **Est. Hours**: 1
- **Dependencies**: TASK-001
- **Commits**:
  - `docs: add changes-log, checklist-done, and delivery-summary templates`

### TASK-004: Comprehensive Test Suite
- **Description**: Expand test coverage to >60%, add unit tests for all core modules
- **Files**: `tests/test_limbic.py`, `tests/test_retrieval.py`, `tests/test_synthesis.py`, `tests/test_perception.py`, `tests/test_agency_tools.py`, `tests/test_dream.py`, `tests/test_convergence.py`
- **Branch**: `sallie/complete/test-suite-20251228`
- **Est. Hours**: 16
- **Dependencies**: None
- **Commits**:
  - `test: add comprehensive unit tests for limbic system`
  - `test: add tests for retrieval and memory system`
  - `test: add tests for synthesis and perception`
  - `test: add tests for agency and tools`
  - `test: add tests for dream cycle and convergence`
  - `test: achieve >60% coverage across all modules`

---

## P1 Tasks (High Priority - Core Features)

### TASK-005: Complete Dream Cycle Implementation
- **Description**: Implement full hypothesis extraction, conflict detection, conditional belief synthesis, heritage promotion
- **Files**: `core/dream.py`, `core/extraction.py`, `memory/patches.json` (schema updates)
- **Branch**: `sallie/complete/dream-cycle-20251228`
- **Est. Hours**: 24
- **Dependencies**: TASK-004 (tests)
- **Commits**:
  - `feat: implement hypothesis extraction from thoughts.log patterns`
  - `feat: add conflict detection against Heritage DNA`
  - `feat: implement conditional belief synthesis (X EXCEPT when Y)`
  - `feat: add heritage promotion workflow via Active Veto`
  - `test: add tests for dream cycle hypothesis extraction`

### TASK-006: Complete Great Convergence
- **Description**: Implement all 14 extraction prompts, heritage compilation, versioning
- **Files**: `core/convergence.py`, `core/extraction.py`, `core/mirror.py`
- **Branch**: `sallie/complete/convergence-20251228`
- **Est. Hours**: 20
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: implement all 14 extraction prompts for Convergence questions`
  - `feat: add heritage compilation (core.json, preferences.json, learned.json)`
  - `feat: implement heritage versioning protocol with history snapshots`
  - `feat: complete Q13 Mirror Test dynamic synthesis`
  - `test: add tests for convergence flow and extraction`

### TASK-007: Implement "Take the Wheel" Protocol
- **Description**: Add explicit delegation detection, scope confirmation, execution within trust tiers
- **Files**: `core/monologue.py`, `core/perception.py`, `core/agency.py`
- **Branch**: `sallie/complete/take-the-wheel-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: add explicit delegation keyword detection in perception`
  - `feat: implement scope confirmation for high-stakes actions`
  - `feat: integrate Take-the-Wheel with agency system and trust tiers`
  - `test: add tests for Take-the-Wheel protocol`

### TASK-008: Add Moral Friction Reconciliation
- **Description**: Implement reconciliation dialogue when request violates Prime Directive
- **Files**: `core/monologue.py`, `core/prompts.py` (add moral friction prompt)
- **Branch**: `sallie/complete/moral-friction-20251228`
- **Est. Hours**: 8
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: add moral friction detection in INFJ anchor`
  - `feat: implement reconciliation dialogue system`
  - `feat: add constitutional lock for core protection attempts`
  - `test: add tests for moral friction and reconciliation`

### TASK-009: Implement One-Question Enforcement
- **Description**: Add runtime guard to enforce single-question rule in synthesis
- **Files**: `core/synthesis.py`
- **Branch**: `sallie/complete/one-question-20251228`
- **Est. Hours**: 4
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: add runtime guard for one-question rule enforcement`
  - `feat: implement rewrite pass when multiple questions detected`
  - `test: add tests for one-question enforcement`

### TASK-010: Complete Agency Safety (Git Rollback)
- **Description**: Implement Git safety net, rollback mechanism, capability contracts
- **Files**: `core/agency.py`, `core/tools.py`, `core/main.py` (add rollback endpoint)
- **Branch**: `sallie/complete/agency-safety-20251228`
- **Est. Hours**: 16
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: implement Git pre-action commit for Tier 2+ file modifications`
  - `feat: add rollback endpoint and mechanism`
  - `feat: enforce capability contracts (sandbox, dry-run, rollback)`
  - `feat: add agency log with action history`
  - `test: add tests for agency safety and rollback`

### TASK-011: Upgrade Web UI (React + Next.js + Tailwind)
- **Description**: Migrate from vanilla HTML to React + Next.js with Tailwind CSS and design tokens
- **Files**: `interface/web/` (new React app), `sallie/style-guide.md`
- **Branch**: `sallie/complete/web-ui-upgrade-20251228`
- **Est. Hours**: 40
- **Dependencies**: TASK-001, TASK-012
- **Commits**:
  - `feat: scaffold Next.js app with Tailwind CSS`
  - `feat: migrate chat interface to React components`
  - `feat: add limbic state visualization with real-time updates`
  - `feat: add thoughts.log viewer component`
  - `feat: add Heritage browser UI`
  - `feat: implement design tokens and CSS variables`
  - `docs: create style-guide.md with design system`

### TASK-012: Create Style Guide
- **Description**: Document design tokens, typography scale, spacing rhythm, colors, accessibility
- **Files**: `sallie/style-guide.md`
- **Branch**: `sallie/complete/style-guide-20251228`
- **Est. Hours**: 8
- **Dependencies**: TASK-001
- **Commits**:
  - `docs: create comprehensive style guide with design tokens`
  - `docs: document typography scale (1.125 modular)`
  - `docs: document spacing rhythm (4/8/12/16)`
  - `docs: document color palette and accessibility standards`

### TASK-013: Accessibility Audit & Fixes
- **Description**: Add ARIA labels, complete keyboard navigation, verify contrast ratios
- **Files**: `interface/web/index.html` (or React components), `sallie/accessibility-audit.md`
- **Branch**: `sallie/complete/accessibility-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-011
- **Commits**:
  - `feat: add ARIA labels to all interactive elements`
  - `feat: implement complete keyboard navigation`
  - `feat: verify and fix contrast ratios (WCAG AA)`
  - `docs: create accessibility audit report`

### TASK-014: Complete Degradation System
- **Description**: Implement full failure matrix, AMNESIA/OFFLINE/DEAD state handling
- **Files**: `core/degradation.py`, `core/monologue.py` (add degradation checks)
- **Branch**: `sallie/complete/degradation-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: implement AMNESIA mode (Qdrant offline)`
  - `feat: implement OFFLINE mode (Ollama offline)`
  - `feat: add DEAD mode detection and recovery procedures`
  - `feat: add graceful degradation with canned responses`
  - `test: add tests for all degradation modes`

### TASK-015: Add CI/CD Pipeline
- **Description**: Set up GitHub Actions for linting, testing, security scanning
- **Files**: `.github/workflows/ci.yml`, `.github/workflows/test.yml`
- **Branch**: `sallie/complete/cicd-20251228`
- **Est. Hours**: 8
- **Dependencies**: TASK-004
- **Commits**:
  - `ci: add GitHub Actions workflow for linting (black, ruff, mypy)`
  - `ci: add test workflow with coverage reporting`
  - `ci: add security scanning workflow`

### TASK-016: Add API Documentation
- **Description**: Generate OpenAPI/Swagger docs from FastAPI
- **Files**: `core/main.py` (add OpenAPI metadata), `docs/api.md`
- **Branch**: `sallie/complete/api-docs-20251228`
- **Est. Hours**: 6
- **Dependencies**: None
- **Commits**:
  - `docs: add OpenAPI metadata to FastAPI endpoints`
  - `docs: generate and commit API documentation`
  - `docs: add API usage examples`

### TASK-017: Security Audit
- **Description**: Perform security audit per Section 22, create audit report
- **Files**: `sallie/security-audit.md`
- **Branch**: `sallie/complete/security-audit-20251228`
- **Est. Hours**: 4
- **Dependencies**: TASK-010
- **Commits**:
  - `docs: create security audit report`
  - `security: fix identified vulnerabilities`
  - `security: add authentication and authorization checks`

---

## P2 Tasks (Medium/Low Priority - Advanced Features)

### TASK-018: Complete Ghost Interface
- **Description**: Implement system tray, pulse animation, shoulder tap notifications, veto popup
- **Files**: `core/ghost.py`, `interface/ghost.py`
- **Branch**: `sallie/complete/ghost-interface-20251228`
- **Est. Hours**: 16
- **Dependencies**: TASK-005 (for veto popup)
- **Commits**:
  - `feat: implement system tray with pulse animation`
  - `feat: add shoulder tap notification system`
  - `feat: implement veto popup for hypothesis review`
  - `test: add tests for ghost interface`

### TASK-019: Complete Sensor System
- **Description**: Implement file watcher, system load monitoring, refractory period logic
- **Files**: `core/sensors.py`
- **Branch**: `sallie/complete/sensors-20251228`
- **Est. Hours**: 16
- **Dependencies**: None
- **Commits**:
  - `feat: implement file activity watcher`
  - `feat: add system load monitoring (CPU, memory, window switches)`
  - `feat: implement refractory period logic (24h cooldown)`
  - `test: add tests for sensor system`

### TASK-020: Complete Voice Interface
- **Description**: Integrate STT/TTS, wake word detection, voice commands
- **Files**: `core/voice.py`
- **Branch**: `sallie/complete/voice-interface-20251228`
- **Est. Hours**: 24
- **Dependencies**: None
- **Commits**:
  - `feat: integrate Whisper STT`
  - `feat: integrate Piper/Coqui TTS`
  - `feat: add wake word detection (Porcupine)`
  - `feat: implement voice command processing`
  - `test: add tests for voice interface`

### TASK-021: Implement Foundry
- **Description**: Create fine-tuning pipeline, evaluation harness, drift reports
- **Files**: `core/foundry.py`, `foundry/benchmarks/`
- **Branch**: `sallie/complete/foundry-20251228`
- **Est. Hours**: 32
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: implement fine-tuning pipeline (QLoRA/LoRA)`
  - `feat: create evaluation harness with golden set`
  - `feat: add drift report generation`
  - `feat: implement rollback mechanism for model artifacts`
  - `test: add tests for foundry system`

### TASK-022: Complete Kinship System
- **Description**: Implement multi-user context isolation, authentication API
- **Files**: `core/kinship.py`, `core/main.py` (add auth endpoints)
- **Branch**: `sallie/complete/kinship-20251228`
- **Est. Hours**: 20
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: implement multi-user context isolation`
  - `feat: add authentication API (POST /v1/auth/session)`
  - `feat: add actor tagging for memory writes`
  - `feat: enforce boundary checks (Kin cannot read Creator logs)`
  - `test: add tests for kinship system`

### TASK-023: Implement Second Brain Hygiene
- **Description**: Add Daily Morning Reset, Weekly Review workflows
- **Files**: `core/dream.py`
- **Branch**: `sallie/complete/second-brain-hygiene-20251228`
- **Est. Hours**: 8
- **Dependencies**: TASK-005
- **Commits**:
  - `feat: implement Daily Morning Reset (archive now.md, reset priorities)`
  - `feat: add Weekly Review (close loops, mark stale items)`
  - `feat: add decision log promotion to heritage/decisions_log.md`
  - `test: add tests for second brain hygiene`

### TASK-024: Add Backup/Restore Scripts
- **Description**: Create backup and restore utilities per Section 17.6
- **Files**: `scripts/backup.py`, `scripts/restore.py`
- **Branch**: `sallie/complete/backup-restore-20251228`
- **Est. Hours**: 8
- **Dependencies**: None
- **Commits**:
  - `feat: add backup script with versioning`
  - `feat: add restore script with integrity verification`
  - `docs: document backup/restore procedures`

### TASK-025: Add Health Monitoring Script
- **Description**: Create health check script per Section 17.5.2
- **Files**: `scripts/health_check.py`
- **Branch**: `sallie/complete/health-monitoring-20251228`
- **Est. Hours**: 4
- **Dependencies**: None
- **Commits**:
  - `feat: add health check script for all services`
  - `feat: add service status reporting`

### TASK-026: Implement Refraction Check
- **Description**: Add consistency analysis comparing Heritage claims to observed behavior
- **Files**: `core/dream.py` (add refraction check), new module if needed
- **Branch**: `sallie/complete/refraction-check-20251228`
- **Est. Hours**: 12
- **Dependencies**: TASK-005
- **Commits**:
  - `feat: implement refraction check (Heritage vs observed behavior)`
  - `feat: add inconsistency detection and reporting`
  - `feat: integrate with Mirror Test Refraction Dialogue`
  - `test: add tests for refraction check`

### TASK-027: Complete Posture System Integration
- **Description**: Fully integrate posture prompts per Section 16.10
- **Files**: `core/prompts.py`, `core/synthesis.py`
- **Branch**: `sallie/complete/posture-integration-20251228`
- **Est. Hours**: 6
- **Dependencies**: TASK-004
- **Commits**:
  - `feat: add posture-specific prompt injection matrix`
  - `feat: ensure posture behavior is explicit and consistent`
  - `test: add tests for posture system`

---

## Summary

### Task Counts
- **P0 Tasks**: 4 tasks, ~19.5 hours
- **P1 Tasks**: 13 tasks, ~200 hours
- **P2 Tasks**: 10 tasks, ~150 hours
- **Total**: 27 tasks, ~369.5 hours

### Recommended Execution Order
1. **Week 1**: TASK-001 through TASK-004 (Foundation)
2. **Week 2-3**: TASK-005 through TASK-010 (Core Features)
3. **Week 4**: TASK-011 through TASK-013 (UI & Polish)
4. **Week 5**: TASK-014 through TASK-017 (Quality & Security)
5. **Week 6+**: TASK-018 through TASK-027 (Advanced Features, as time permits)

### Branch Naming Convention
- Format: `sallie/complete/{task-slug}-20251228`
- Example: `sallie/complete/dream-cycle-20250115`
- Use descriptive slugs: `dream-cycle`, `convergence`, `web-ui-upgrade`, etc.

### Commit Message Convention
- Format: `<type>: <description>`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `ci`, `security`
- Reference plan or deviation file if applicable: `feat: implement X (per plan-for-completion.md)`

---

**End of Task List**

