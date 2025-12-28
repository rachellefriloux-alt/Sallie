---
name: Verification Steps A-D
overview: "Plan for executing verification steps A-D: inventory check, run/validate, functional checks, and design/accessibility audit"
todos:
  - id: inventory-check
    content: "Step A: Perform inventory re-check - scan file structure, dependencies, verify no missing files or unresolved imports"
    status: completed
  - id: run-validation
    content: "Step B: Run install commands, start services, run linters and tests - record all results"
    status: completed
    dependencies:
      - inventory-check
  - id: functional-checks
    content: "Step C: Verify critical flows (auth, dashboard, agent integration, data persistence) - create test table with expected vs actual"
    status: completed
    dependencies:
      - run-validation
  - id: design-accessibility
    content: "Step D: Design and accessibility audit - check style guide compliance, verify WCAG 2.1 AA requirements"
    status: completed
    dependencies:
      - functional-checks
  - id: create-reports
    content: Create summary reports for steps A-D with findings, gaps, and recommendations
    status: completed
    dependencies:
      - inventory-check
      - run-validation
      - functional-checks
      - design-accessibility
---

# Verification Plan: Steps A-D

## Overview

Execute comprehensive verification steps A-D to validate the Digital Progeny project against the canonical specification (`TheDigitalProgeny5.2fullthing.txt`). All verification is read-only until deviations or fixes are identified and approved.

## Step A: Inventory Re-Check

### A.1 File Structure Verification

- Verify core directory structure exists:
- `progeny_root/core/` - All core systems
- `progeny_root/limbic/` - Limbic state and heritage
- `progeny_root/memory/` - Memory storage
- `progeny_root/tests/` - Test suite
- `web/` - Web UI
- `mobile/` - Mobile app
- `desktop/` - Desktop app
- Check for missing files referenced in canonical spec
- Verify `sallie/` directory exists with documentation

### A.2 Dependency Verification

- Read `progeny_root/requirements.txt` - List all Python dependencies
- Read `web/package.json`, `mobile/package.json`, `desktop/package.json` - List Node dependencies
- Check `progeny_root/docker-compose.yml` - Verify service definitions
- Verify no missing dependencies or unresolved imports by scanning import statements

### A.3 Output

- Create/update `sallie/inventory-check-A.md` with:
- Complete file tree (concise)
- List of all dependencies
- Any missing files or obvious structural issues
- Files added during implementation (if any)

## Step B: Run and Validate

### B.1 Installation Verification

Commands to run:

```bash
# Python dependencies
cd progeny_root
pip install -r requirements.txt 2>&1 | tee install_errors.txt

# Web UI dependencies  
cd ../web
npm install 2>&1 | tee install_errors.txt

# Optional: Mobile/Desktop
cd ../mobile && npm install 2>&1 | tee install_errors.txt
cd ../desktop && npm install 2>&1 | tee install_errors.txt
```



- Record all errors and warnings
- Note any missing system dependencies

### B.2 Service Startup Verification

```bash
# Start Docker services
cd progeny_root
docker-compose up -d
# Verify Ollama and Qdrant are running

# Start backend
python -m uvicorn core.main:app --reload --host 0.0.0.0 --port 8000 &
# Wait for startup, check logs

# Start web UI (separate terminal)
cd ../web
npm run dev &
# Wait for startup, check if accessible at http://localhost:3000
```



- Verify services start without errors
- Check health endpoints: `/health`, `/docs`
- Confirm web UI loads

### B.3 Linting and Static Analysis

```bash
# Python linting
cd progeny_root
black --check core/ tests/ 2>&1 | tee lint_errors.txt
ruff check core/ tests/ 2>&1 | tee ruff_errors.txt
mypy core/ 2>&1 | tee mypy_errors.txt

# TypeScript/JavaScript linting
cd ../web
npm run lint 2>&1 | tee lint_errors.txt
```



### B.4 Test Execution

```bash
cd progeny_root
pytest tests/ -v 2>&1 | tee test_results.txt
pytest tests/ --cov=core --cov-report=html 2>&1 | tee coverage_results.txt
```



- Record all test failures
- Note test coverage percentage
- Document any skipped tests

### B.5 Output

- Create `sallie/run-validation-B.md` with:
- Installation errors (if any)
- Service startup status
- Linting errors and warnings
- Test results summary (pass/fail counts)
- Coverage percentage

## Step C: Functional Checks

### C.1 Critical Flows (from Canonical Spec)

Based on the canonical spec, verify these critical flows:

#### C.1.1 Authentication Flow

- **Expected**: Creator authentication, Kinship (multi-user) support, session management
- **Files to check**: `progeny_root/core/kinship.py`, `progeny_root/core/main.py` (auth endpoints)
- **Test**: Check API endpoints exist, authentication logic exists

#### C.1.2 Main Dashboard/UI Flow  

- **Expected**: Web UI loads, chat interface functional, WebSocket connection works
- **Files to check**: `web/app/page.tsx`, `web/components/Dashboard.tsx`
- **Test**: Verify UI loads, check WebSocket connection code exists

#### C.1.3 Agent Integration Flow (Monologue System)

- **Expected**: Perception → Retrieval → Gemini/INFJ debate → Synthesis pipeline
- **Files to check**: `progeny_root/core/perception.py`, `progeny_root/core/monologue.py`, `progeny_root/core/synthesis.py`
- **Test**: Verify pipeline exists, check integration points

#### C.1.4 Data Persistence Flow

- **Expected**: Limbic state persists, memory (Qdrant) integration, heritage storage
- **Files to check**: `progeny_root/core/limbic.py`, `progeny_root/core/retrieval.py`, `progeny_root/limbic/`
- **Test**: Verify file I/O, check database connections

#### C.1.5 Convergence Flow (Great Convergence)

- **Expected**: 14-question onboarding, heritage compilation
- **Files to check**: `progeny_root/core/convergence.py`, `web/components/ConvergenceFlow.tsx`
- **Test**: Verify flow exists, check question sequence

### C.2 Test Table Format

For each flow:| Flow | Expected Behavior (from spec) | Actual Status | Test Method | Result | Notes ||------|-------------------------------|---------------|-------------|--------|-------|| Auth | Session management, multi-user | [TBD] | Code review | [TBD] | [TBD] |

### C.3 Output

- Create `sallie/functional-checks-C.md` with:
- Complete functional check table
- Detailed findings for each flow
- Identified gaps or failures
- Recommendations for fixes (if needed)

## Step D: Design & Accessibility Audit

### D.1 Style Guide Verification

Check against canonical spec (Section 11 if present, or check design tokens):

- **Typography**: Verify typography scale, font families
- **Spacing**: Check spacing rhythm, padding/margin consistency  
- **Color Tokens**: Verify color system, theme support
- **Component Usage**: Check component consistency
- **Files to check**: `web/tailwind.config.js`, `web/app/globals.css`, component files

### D.2 Accessibility Checks

Based on canonical spec requirements (WCAG 2.1 AA):

- **Semantic HTML**: Verify proper HTML elements
- **ARIA Labels**: Check for aria-label, aria-labelledby, etc.
- **Keyboard Navigation**: Verify tab order, focus management
- **Color Contrast**: Check text/background contrast ratios
- **Focus Indicators**: Verify visible focus states
- **Screen Reader Support**: Check semantic markup
- **Files to check**: `web/components/*.tsx`, `web/app/**/*.tsx`

### D.3 Accessibility Tools (if available)

- Manual code review for ARIA attributes
- Check for keyboard navigation handlers
- Verify focus management
- Note: Automated tools (Lighthouse, WAVE) recommended but may be deferred

### D.4 Output  

- Create `sallie/design-accessibility-D.md` with:
- Style guide compliance status
- Typography/spacing/color findings
- Accessibility audit results
- Violations list (if any) with severity
- Recommendations

## Files to Create

1. `sallie/inventory-check-A.md` - Step A results