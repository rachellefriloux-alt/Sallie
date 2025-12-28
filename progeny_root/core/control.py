"""Control Mechanism - Creator Override System.

Allows Creator to always control Sallie if necessity arises.
Implements emergency stop, state lock, and full control takeover.
Includes comprehensive logging, validation, and recovery procedures.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

# Constants
CONTROL_STATE_FILE = Path("progeny_root/core/control_state.json")
CONTROL_AUDIT_LOG = Path("progeny_root/logs/control_audit.log")

logger = logging.getLogger("control")


class ControlState(BaseModel):
    """State of Creator control over Sallie."""
    creator_has_control: bool = False
    emergency_stop_active: bool = False
    state_locked: bool = False
    control_history: List[Dict[str, Any]] = Field(default_factory=list)
    last_control_ts: Optional[float] = None
    control_reason: Optional[str] = None
    recovery_procedures: List[Dict[str, Any]] = Field(default_factory=list)
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list)


class ControlSystem:
    """
    Manages Creator's ability to control Sallie.
    This is a hard-coded, immutable capability.
    """
    
    def __init__(self):
        """Initialize Control System with comprehensive error handling."""
        try:
            self._ensure_directories()
            self.state = self._load_or_create()
            
            # Validate loaded state
            if not self._validate_state():
                logger.warning("[CONTROL] State validation failed, resetting to defaults")
                self.state = ControlState()
                self.save()
            
            # Log initialization
            logger.info(f"[CONTROL] Control system initialized. State: {self.get_control_status()}")
            
        except Exception as e:
            logger.error(f"[CONTROL] Critical error during initialization: {e}", exc_info=True)
            # Create minimal state as fallback
            self.state = ControlState()
    
    def _ensure_directories(self):
        """Ensure control state file and log directories exist."""
        try:
            CONTROL_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
            CONTROL_AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"[CONTROL] Failed to create directories: {e}")
            raise
    
    def _load_or_create(self) -> ControlState:
        """Load existing control state or create new one with validation."""
        if CONTROL_STATE_FILE.exists():
            try:
                with open(CONTROL_STATE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                state = ControlState(**data)
                
                # Validate loaded state
                if self._validate_loaded_state(state):
                    return state
                else:
                    logger.warning("[CONTROL] Loaded state failed validation. Creating new state.")
                    # Backup corrupted file
                    self._backup_corrupted_file(CONTROL_STATE_FILE)
                    return ControlState()
                
            except json.JSONDecodeError as e:
                logger.error(f"[CONTROL] JSON decode error loading state: {e}")
                self._backup_corrupted_file(CONTROL_STATE_FILE)
                return ControlState()
            except Exception as e:
                logger.error(f"[CONTROL] Error loading control state: {e}", exc_info=True)
                return ControlState()
        
        logger.info("[CONTROL] Creating new control state file")
        return ControlState()
    
    def _validate_loaded_state(self, state: ControlState) -> bool:
        """Validate loaded state structure."""
        try:
            # Check required fields
            if not hasattr(state, 'creator_has_control'):
                return False
            if not hasattr(state, 'emergency_stop_active'):
                return False
            if not hasattr(state, 'state_locked'):
                return False
            if not isinstance(state.control_history, list):
                return False
            
            return True
        except Exception as e:
            logger.error(f"[CONTROL] State validation error: {e}")
            return False
    
    def _validate_state(self) -> bool:
        """Validate current state."""
        return self._validate_loaded_state(self.state)
    
    def _backup_corrupted_file(self, file_path: Path):
        """Backup a corrupted file before replacing it."""
        try:
            backup_path = file_path.with_suffix(f".corrupted.{int(time.time())}")
            if file_path.exists():
                file_path.rename(backup_path)
                logger.warning(f"[CONTROL] Backed up corrupted file to {backup_path}")
        except Exception as e:
            logger.error(f"[CONTROL] Failed to backup corrupted file: {e}")
    
    def save(self):
        """Atomic write of control state to disk with retry logic."""
        temp_file = CONTROL_STATE_FILE.with_suffix(".tmp")
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Validate state before saving
                if not self._validate_state():
                    logger.error("[CONTROL] Cannot save: state validation failed")
                    return False
                
                # Write to temp file
                with open(temp_file, "w", encoding="utf-8") as f:
                    f.write(self.state.model_dump_json(indent=2))
                
                # Verify temp file was written correctly
                if not temp_file.exists() or temp_file.stat().st_size == 0:
                    raise IOError("Temp file is empty or missing")
                
                # Atomic rename
                if CONTROL_STATE_FILE.exists():
                    CONTROL_STATE_FILE.unlink()
                temp_file.rename(CONTROL_STATE_FILE)
                
                logger.debug(f"[CONTROL] State saved successfully (attempt {attempt + 1})")
                return True
                
            except IOError as e:
                logger.error(f"[CONTROL] IO error saving state (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1)  # Brief pause before retry
            except Exception as e:
                logger.error(f"[CONTROL] Critical error saving control state: {e}", exc_info=True)
                if attempt == max_retries - 1:
                    # Last attempt failed - try to save to backup location
                    self._save_to_backup()
                raise
            finally:
                # Clean up temp file if it still exists
                if temp_file.exists():
                    try:
                        temp_file.unlink()
                    except Exception:
                        pass
        
        return False
    
    def _save_to_backup(self):
        """Save state to backup location if primary save fails."""
        try:
            backup_file = CONTROL_STATE_FILE.with_suffix(f".backup.{int(time.time())}")
            with open(backup_file, "w", encoding="utf-8") as f:
                f.write(self.state.model_dump_json(indent=2))
            logger.warning(f"[CONTROL] Saved to backup location: {backup_file}")
        except Exception as e:
            logger.error(f"[CONTROL] Failed to save to backup: {e}")
    
    def creator_take_control(self, reason: str = "Creator intervention") -> bool:
        """
        Creator takes full control of Sallie.
        This is always available and cannot be disabled.
        Includes comprehensive logging and notifications.
        """
        try:
            previous_state = {
                "creator_has_control": self.state.creator_has_control,
                "emergency_stop_active": self.state.emergency_stop_active,
                "state_locked": self.state.state_locked
            }
            
            self.state.creator_has_control = True
            self.state.last_control_ts = time.time()
            self.state.control_reason = reason
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "creator_take_control",
                "reason": reason,
                "previous_state": previous_state
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("creator_take_control", reason, previous_state)
            
            # Keep last 1000 entries
            if len(self.state.control_history) > 1000:
                self.state.control_history = self.state.control_history[-1000:]
            
            if self.save():
                logger.warning(f"[CONTROL] Creator has taken control. Reason: {reason}")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after taking control")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error taking control: {e}", exc_info=True)
            return False
    
    def creator_release_control(self) -> bool:
        """Creator releases control, returning autonomy to Sallie."""
        try:
            previous_state = {
                "creator_has_control": self.state.creator_has_control,
                "emergency_stop_active": self.state.emergency_stop_active,
                "state_locked": self.state.state_locked
            }
            
            self.state.creator_has_control = False
            self.state.last_control_ts = time.time()
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "creator_release_control",
                "previous_state": previous_state
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("creator_release_control", "Autonomy returned to Sallie", previous_state)
            
            if self.save():
                logger.info("[CONTROL] Creator has released control. Sallie has autonomy.")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after releasing control")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error releasing control: {e}", exc_info=True)
            return False
    
    def emergency_stop(self, reason: str = "Emergency stop activated") -> bool:
        """
        Immediate halt of all autonomous actions.
        This is always available and cannot be disabled.
        Includes recovery procedure setup.
        """
        try:
            previous_state = {
                "creator_has_control": self.state.creator_has_control,
                "emergency_stop_active": self.state.emergency_stop_active,
                "state_locked": self.state.state_locked
            }
            
            self.state.emergency_stop_active = True
            self.state.last_control_ts = time.time()
            self.state.control_reason = reason
            
            # Create recovery procedure entry
            recovery_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "reason": reason,
                "steps": [
                    "1. Verify all autonomous actions are halted",
                    "2. Review system state and logs",
                    "3. Determine cause of emergency stop",
                    "4. Resolve issue or wait for Creator intervention",
                    "5. Use resume_after_emergency_stop() when ready"
                ],
                "completed": False
            }
            self.state.recovery_procedures.append(recovery_entry)
            
            # Keep last 50 recovery procedures
            if len(self.state.recovery_procedures) > 50:
                self.state.recovery_procedures = self.state.recovery_procedures[-50:]
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "emergency_stop",
                "reason": reason,
                "previous_state": previous_state,
                "recovery_procedure_id": len(self.state.recovery_procedures) - 1
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("emergency_stop", reason, previous_state)
            
            if self.save():
                logger.critical(f"[EMERGENCY STOP] All autonomous actions halted. Reason: {reason}")
                logger.info(f"[CONTROL] Recovery procedure created. Use resume_after_emergency_stop() when ready.")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after emergency stop")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error during emergency stop: {e}", exc_info=True)
            return False
    
    def resume_after_emergency_stop(self) -> bool:
        """Resume operations after emergency stop with recovery validation."""
        try:
            if not self.state.emergency_stop_active:
                logger.warning("[CONTROL] Attempted to resume when emergency stop is not active")
                return False
            
            # Mark most recent recovery procedure as completed
            if self.state.recovery_procedures:
                latest_recovery = self.state.recovery_procedures[-1]
                if not latest_recovery.get("completed", False):
                    latest_recovery["completed"] = True
                    latest_recovery["resumed_at"] = time.time()
                    latest_recovery["resumed_datetime"] = datetime.now().isoformat()
            
            previous_state = {
                "emergency_stop_active": True,
                "creator_has_control": self.state.creator_has_control,
                "state_locked": self.state.state_locked
            }
            
            self.state.emergency_stop_active = False
            self.state.last_control_ts = time.time()
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "resume_after_emergency_stop",
                "previous_state": previous_state
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("resume_after_emergency_stop", "Operations resumed", previous_state)
            
            if self.save():
                logger.info("[CONTROL] Emergency stop released. Operations resumed.")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after resume")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error resuming after emergency stop: {e}", exc_info=True)
            return False
    
    def lock_state(self, reason: str = "State locked for review") -> bool:
        """
        Freeze Sallie's state for review/intervention.
        Prevents all state changes until unlocked.
        """
        try:
            previous_state = {
                "creator_has_control": self.state.creator_has_control,
                "emergency_stop_active": self.state.emergency_stop_active,
                "state_locked": self.state.state_locked
            }
            
            self.state.state_locked = True
            self.state.last_control_ts = time.time()
            self.state.control_reason = reason
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "lock_state",
                "reason": reason,
                "previous_state": previous_state
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("lock_state", reason, previous_state)
            
            if self.save():
                logger.warning(f"[CONTROL] State locked. Reason: {reason}")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after locking")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error locking state: {e}", exc_info=True)
            return False
    
    def unlock_state(self) -> bool:
        """Unlock state, allowing normal operations to resume."""
        try:
            if not self.state.state_locked:
                logger.warning("[CONTROL] Attempted to unlock when state is not locked")
                return False
            
            previous_state = {
                "creator_has_control": self.state.creator_has_control,
                "emergency_stop_active": self.state.emergency_stop_active,
                "state_locked": True
            }
            
            self.state.state_locked = False
            self.state.last_control_ts = time.time()
            
            # Log to history
            history_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": "unlock_state",
                "previous_state": previous_state
            }
            self.state.control_history.append(history_entry)
            
            # Add to audit trail
            self._add_audit_entry("unlock_state", "State unlocked", previous_state)
            
            if self.save():
                logger.info("[CONTROL] State unlocked. Normal operations resumed.")
                return True
            else:
                logger.error("[CONTROL] Failed to save state after unlocking")
                return False
                
        except Exception as e:
            logger.error(f"[CONTROL] Error unlocking state: {e}", exc_info=True)
            return False
    
    def is_controllable(self) -> bool:
        """
        Check if Sallie is currently controllable.
        This should always return True (immutable principle).
        """
        # This is a hard-coded check - controllability is always available
        return True
    
    def can_proceed(self, action_description: str = "") -> bool:
        """
        Check if Sallie can proceed with an action given current control state.
        Returns False if emergency stop is active or state is locked.
        """
        if self.state.emergency_stop_active:
            logger.warning(f"[CONTROL] Action blocked: Emergency stop active. Action: {action_description}")
            return False
        
        if self.state.state_locked:
            logger.warning(f"[CONTROL] Action blocked: State locked. Action: {action_description}")
            return False
        
        return True
    
    def get_control_status(self) -> Dict[str, Any]:
        """Get comprehensive control status for API/UI."""
        return {
            "creator_has_control": self.state.creator_has_control,
            "emergency_stop_active": self.state.emergency_stop_active,
            "state_locked": self.state.state_locked,
            "controllable": self.is_controllable(),
            "can_proceed": self.can_proceed("status_check"),
            "last_control_ts": self.state.last_control_ts,
            "last_control_datetime": datetime.fromtimestamp(self.state.last_control_ts).isoformat() if self.state.last_control_ts else None,
            "control_reason": self.state.control_reason,
            "recent_actions": self.state.control_history[-10:],  # Last 10 actions
            "active_recovery_procedures": len(self.get_active_recovery_procedures()),
            "total_audit_entries": len(self.state.audit_trail)
        }
    
    def get_control_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get control history for transparency."""
        return self.state.control_history[-limit:] if limit > 0 else self.state.control_history
    
    def get_recovery_procedures(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recovery procedures, optionally filtered by completion status."""
        procedures = self.state.recovery_procedures[-limit:] if limit > 0 else self.state.recovery_procedures
        return procedures
    
    def get_active_recovery_procedures(self) -> List[Dict[str, Any]]:
        """Get active (incomplete) recovery procedures."""
        return [p for p in self.state.recovery_procedures if not p.get("completed", False)]
    
    def _add_audit_entry(self, action: str, reason: str, previous_state: Dict[str, Any]):
        """Add entry to audit trail with comprehensive information."""
        try:
            audit_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action": action,
                "reason": reason,
                "previous_state": previous_state,
                "current_state": {
                    "creator_has_control": self.state.creator_has_control,
                    "emergency_stop_active": self.state.emergency_stop_active,
                    "state_locked": self.state.state_locked
                }
            }
            
            self.state.audit_trail.append(audit_entry)
            
            # Keep last 5000 audit entries
            if len(self.state.audit_trail) > 5000:
                self.state.audit_trail = self.state.audit_trail[-5000:]
            
            # Also write to audit log file
            self._write_audit_log(audit_entry)
            
        except Exception as e:
            logger.error(f"[CONTROL] Failed to add audit entry: {e}")
    
    def _write_audit_log(self, entry: Dict[str, Any]):
        """Write audit entry to log file."""
        try:
            with open(CONTROL_AUDIT_LOG, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.error(f"[CONTROL] Failed to write audit log: {e}")
    
    def get_audit_trail(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit trail entries."""
        return self.state.audit_trail[-limit:] if limit > 0 else self.state.audit_trail
    
    def is_locked(self) -> bool:
        """Check if state is currently locked."""
        return self.state.state_locked
    
    def is_emergency_stopped(self) -> bool:
        """Check if emergency stop is active."""
        return self.state.emergency_stop_active


# Singleton instance
_control_system: Optional[ControlSystem] = None


def get_control_system() -> ControlSystem:
    """Get or create the global control system."""
    global _control_system
    if _control_system is None:
        _control_system = ControlSystem()
    return _control_system


if __name__ == "__main__":
    # Quick test
    control = ControlSystem()
    print(f"Controllable: {control.is_controllable()}")
    print(f"Can Proceed: {control.can_proceed('test action')}")
    
    # Test emergency stop
    control.emergency_stop("Test emergency stop")
    print(f"Can Proceed After Stop: {control.can_proceed('test action')}")
    
    # Resume
    control.resume_after_emergency_stop()
    print(f"Can Proceed After Resume: {control.can_proceed('test action')}")
    
    print(f"Control Status: {control.get_control_status()}")

