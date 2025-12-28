---
name: ""
overview: ""
todos: []
---

#Complete Git Safety Net Implementation

## Overview

Complete TASK-010: Implement the full Git Safety Net system as specified in the canonical spec (Section 8.3). This includes pre-action commits for all file modifications at Tier 2+, rollback mechanism with API endpoint, agency action logging, and automatic rollback detection.

## Current State

- Basic git commit functionality exists in `tools.py` but only triggers for `write_file`
- No rollback endpoint or mechanism
- No agency action log tracking
- No commit hash storage in action records
- No automatic rollback detection

## Implementation Tasks

### 1. Enhance Pre-Action Commit System

**File**: `progeny_root/core/tools.py`

- Extend `_ensure_safety_net()` to:
- Accept action description and affected files
- Stage only affected files (not entire repo)
- Create commit with format: `[PROGENY] Pre-action snapshot: {action_description}`
- Return commit hash
- Integrate with `AgencySystem.execute_tool()` to:
- Call safety net before any file modification (write, delete, move, etc.)
- Store commit hash in action record
- Only trigger for Tier 2+ (PARTNER, SURROGATE) actions

**File**: `progeny_root/core/agency.py`

- Add `_create_pre_action_commit()` method
- Modify `execute_tool()` to:
- Check if action modifies files
- Get advisory recommendation
- If Tier 2+ and file modification, create pre-action commit
- Store commit hash in action result
- Log action to agency log

### 2. Implement Agency Action Log

**File**: `progeny_root/core/agency.py`

- Add `ActionLogEntry` Pydantic model:
  ```python
            class ActionLogEntry(BaseModel):
                timestamp: float
                action_type: str
                tool_name: str
                args: Dict[str, Any]
                commit_hash: Optional[str]
                advisory_recommendation: str
                override: bool
                result: Any
                rollback_hash: Optional[str] = None
  ```




- Add `_log_action()` method to append to `agency_action_log.json`
- Integrate logging into `execute_tool()`

### 3. Implement Rollback Mechanism

**File**: `progeny_root/core/agency.py`

- Add `rollback_action()` method:
- Accept action_id or commit_hash
- Retrieve action record from log
- Execute `git revert` or `git checkout` to restore state
- Log rollback with explanation
- Apply minor Trust penalty (0.02) via LimbicSystem
- Return rollback result

**File**: `progeny_root/core/tools.py`

- Add `_git_revert()` method for reverting commits
- Add `_git_checkout()` method for restoring file states

### 4. Add Rollback API Endpoint

**File**: `progeny_root/core/main.py`

- Add `/agency/rollback` POST endpoint:
  ```python
            {
              "action_id": str,  # Optional
              "commit_hash": str,  # Optional
              "explanation": str  # Required
            }
  ```




- Endpoint should:
- Call `agency.rollback_action()`
- Return rollback status
- Handle errors gracefully

### 5. Implement Automatic Rollback Detection

**File**: `progeny_root/core/agency.py`

- Add `_detect_harm()` method:
- Check for system errors during execution
- Monitor for Creator displeasure signals (negative sentiment in responses)
- Analyze action outcomes
- Add `_offer_rollback()` method:
- If harm detected, proactively offer rollback
- Explain what went wrong
- Store offer in action log

### 6. Integrate with Advisory Trust System

**File**: `progeny_root/core/agency.py`

- Ensure pre-action commits only for Tier 2+ (PARTNER, SURROGATE)
- Log advisory recommendations with actions
- Track overrides in action log
- Include advisory context in rollback decisions

### 7. Add Tests

**File**: `progeny_root/tests/test_agency_safety.py`

- Test pre-action commit creation
- Test commit hash storage
- Test rollback mechanism
- Test action logging
- Test automatic rollback detection
- Test Trust penalty application

## Files to Modify

1. `progeny_root/core/tools.py` - Enhance git operations, add revert/checkout
2. `progeny_root/core/agency.py` - Add pre-action commit, rollback, action logging
3. `progeny_root/core/main.py` - Add rollback API endpoint
4. `progeny_root/tests/test_agency_safety.py` - Add comprehensive tests

## Data Files Created

- `progeny_root/core/agency_action_log.json` - Action history with commit hashes

## Acceptance Criteria

- [ ] Pre-action commits created for all Tier 2+ file modifications
- [ ] Commit hashes stored in action records
- [ ] Rollback endpoint functional and tested
- [ ] Agency action log tracks all tool executions
- [ ] Automatic rollback detection works
- [ ] Trust penalty applied on rollback
- [ ] Tests pass with >80% coverage for new code
- [ ] Documentation updated in API_DOCUMENTATION.md

## Dependencies

- TASK-029 (Advisory Trust) - Already completed
- TASK-030 (Control System) - Already completed
- Git repository must be initialized in project root