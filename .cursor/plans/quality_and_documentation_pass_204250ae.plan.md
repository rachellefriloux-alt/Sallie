---
name: Quality and Documentation Pass
overview: "Complete the next priority tasks focusing on quality improvements and documentation: API documentation (OpenAPI/Swagger), security audit, posture system integration, and linting fixes. These are P1 tasks that improve production readiness."
todos:
  - id: openapi-metadata
    content: Add comprehensive OpenAPI metadata to all FastAPI endpoints in main.py
    status: pending
  - id: openapi-schema
    content: Generate and export OpenAPI schema to docs/openapi.json
    status: pending
    dependencies:
      - openapi-metadata
  - id: api-examples
    content: Create API usage examples documentation
    status: pending
    dependencies:
      - openapi-schema
  - id: security-audit
    content: Complete security audit per Section 22 and document findings
    status: pending
  - id: posture-integration
    content: Fully integrate posture system prompts into synthesis pipeline
    status: pending
  - id: linting-fixes
    content: Run full linting suite and fix all errors (black, ruff, mypy)
    status: pending
  - id: performance-review
    content: Review and document performance characteristics
    status: pending
  - id: update-api-docs
    content: Update API_DOCUMENTATION.md with OpenAPI links and examples
    status: pending
    dependencies:
      - openapi-schema
      - api-examples
---

# Quali

ty and Documentation Pass

## Overview

Complete high-priority quality and documentation tasks to improve production readiness. This includes API documentation generation, security audit, posture system integration, and ensuring all linting passes.

## Current State

- Git Safety Net is complete
- "Take the Wheel" and "Moral Friction" are already implemented
- API documentation exists but needs OpenAPI/Swagger generation
- Security audit needs to be performed
- Posture system prompts need full integration
- Linting needs to pass completely

## Implementation Tasks

### 1. API Documentation (OpenAPI/Swagger) - TASK-016

**File**: `progeny_root/core/main.py`

- Add comprehensive OpenAPI metadata to all FastAPI endpoints:
- Tags for endpoint grouping
- Descriptions for each endpoint
- Request/response models with Pydantic
- Example requests and responses
- Error response schemas
- Configure FastAPI to generate OpenAPI schema
- Add `/docs` and `/redoc` endpoints (FastAPI default)
- Export OpenAPI schema to `docs/openapi.json`
- Update `API_DOCUMENTATION.md` with links to interactive docs

**Files to Create**:

- `progeny_root/docs/openapi.json` - Generated OpenAPI schema
- `progeny_root/docs/api-examples.md` - Usage examples

### 2. Security Audit - TASK-017

**File**: `progeny_root/SECURITY_AUDIT.md` (already exists, needs completion)

- Complete security audit per Section 22 of canonical spec:
- Threat model review
- Authentication/authorization checks
- Network exposure controls
- Secrets management review
- Auditability verification
- Kill switch verification
- Document findings and remediation steps
- Verify all security requirements from spec are met

**Files to Review**:

- `progeny_root/core/main.py` - API security
- `progeny_root/core/agency.py` - Authorization
- `progeny_root/core/control.py` - Kill switch
- All authentication endpoints

### 3. Posture System Integration - GAP-023

**Files**: `progeny_root/core/prompts.py`, `progeny_root/core/synthesis.py`

- Ensure posture-specific prompts are fully integrated (Section 16.10):
- COMPANION mode prompts
- COPILOT mode prompts
- PEER mode prompts
- EXPERT mode prompts
- Verify posture is injected into synthesis prompts
- Test that posture affects response tone and structure
- Add posture selection logic based on limbic state and detected load

**Files to Modify**:

- `progeny_root/core/synthesis.py` - Add posture injection
- `progeny_root/core/prompts.py` - Verify posture prompts exist
- `progeny_root/core/monologue.py` - Ensure posture is passed through

### 4. Linting and Code Quality

**Tasks**:

- Run full linting suite (black, ruff, mypy)
- Fix all linting errors
- Ensure code formatting is consistent
- Add type hints where missing
- Fix any mypy type errors

**Commands to Run**:

```bash
black --check --diff progeny_root/
ruff check progeny_root/
mypy progeny_root/core/
```



### 5. Performance Optimization

**Files**: Various core modules

- Review and optimize:
- LLM call batching where possible
- Memory retrieval efficiency
- File I/O operations
- Database queries
- Add performance benchmarks
- Document performance characteristics

## Files to Modify

1. `progeny_root/core/main.py` - Add OpenAPI metadata
2. `progeny_root/core/synthesis.py` - Integrate posture prompts
3. `progeny_root/core/prompts.py` - Verify posture prompt matrix
4. `progeny_root/SECURITY_AUDIT.md` - Complete audit
5. Various files - Fix linting errors

## Files to Create

1. `progeny_root/docs/openapi.json` - OpenAPI schema
2. `progeny_root/docs/api-examples.md` - API usage examples

## Acceptance Criteria

- [ ] OpenAPI schema generated and accessible at `/docs`
- [ ] All endpoints have proper metadata and examples
- [ ] Security audit completed and documented
- [ ] Posture system fully integrated and tested
- [ ] All linting passes (black, ruff, mypy)
- [ ] Performance benchmarks documented
- [ ] API documentation updated with interactive docs link

## Dependencies