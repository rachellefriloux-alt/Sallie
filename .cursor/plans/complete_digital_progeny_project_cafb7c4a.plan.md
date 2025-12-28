---
name: Complete Digital Progeny Project
overview: Complete the entire Digital Progeny project to production-ready state, including implementing the 14 specific extraction prompts for Convergence onboarding, completing all core features, quality assurance, and advanced systems.
todos: []
---

# Complete Digital Progeny Project - Final Implementation Plan

## Overview

This plan completes the Digital Progeny project to full production-ready state, addressing all remaining gaps from the gap analysis and ensuring canonical compliance with TheDigitalProgeny5.2fullthing.txt v5.4.1.

## Current Status

**Completed:**

- Core systems: Identity, Control, Agency (advisory model), Learning, Avatar
- Git Safety Net with rollback mechanism
- "Take the Wheel" and Moral Friction protocols
- One-question enforcement
- Basic test structure
- Adaptive UI foundation

**Remaining:**

- 14 specific extraction prompts for Convergence (Section 16.9)
- Complete test suite (>60% coverage)
- UI upgrade to React/Next.js/Tailwind
- Advanced features (Ghost, Voice, Sensors, Foundry, Kinship)
- Quality assurance (linting, security, performance)
- Complete documentation

## Implementation Phases

### Phase 1: Convergence Extraction Prompts (P0 - Critical)

**Goal:** Implement the 14 specific extraction prompts from Section 16.9 that structure Creator answers during onboarding.**Files:**

- `progeny_root/core/extraction.py` - Create extraction prompt functions for Q1-Q14
- `progeny_root/core/convergence.py` - Update `_extract_insights()` to use specific prompts

**Tasks:**

1. Create `get_extraction_prompt(question_id: int)` function in `extraction.py` with all 14 prompts from Section 16.9
2. Each prompt must match the exact JSON schema from Section 14.3 (Extraction Target)
3. Update `convergence.py` to call specific extraction prompt based on question ID
4. Ensure extracted data matches heritage compilation schema (Section 14.4)
5. Add validation to ensure extracted JSON matches expected schema

**Acceptance Criteria:**

- All 14 extraction prompts implemented exactly as specified
- Extracted data populates `heritage/core.json` correctly
- Q13 (Mirror Test) extraction handles resonance confirmation
- Q14 (Basement) extraction handles optional revelation

### Phase 2: Core Feature Completion (P1 - High Priority)

**2.1 Dream Cycle Enhancements**

- Complete hypothesis extraction with conflict detection
- Implement conditional belief synthesis ("X EXCEPT when Y")
- Add heritage promotion workflow
- Implement Second Brain hygiene (Daily Morning Reset, Weekly Review)

**Files:** `progeny_root/core/dream.py`, `progeny_root/core/extraction.py`**2.2 Posture System Integration**

- Ensure posture-specific prompts (Section 16.10) are injected into Synthesis
- Verify COMPANION/COPILOT/PEER/EXPERT modes work correctly
- Test posture selection based on load detection

**Files:** `progeny_root/core/synthesis.py`, `progeny_root/core/perception.py`**2.3 Heritage Versioning**

- Implement full versioning protocol (Section 21.3.4)
- Create history snapshots on heritage changes
- Update changelog.md automatically

**Files:** `progeny_root/core/convergence.py`, `progeny_root/limbic/heritage/`

### Phase 3: UI Upgrade & Polish (P1 - High Priority)

**3.1 React/Next.js Migration**

- Migrate from vanilla JS to React + Next.js (App Router)
- Implement Tailwind CSS with design tokens