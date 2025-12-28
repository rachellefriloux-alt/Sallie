"""Permission matrix and agency enforcement (Advisory Trust Model).

Trust tiers are now ADVISORY ONLY - they provide guidance, not restrictions.
Sallie can override with full transparency. All actions are logged and reversible.
Includes capability discovery, contract enforcement, and comprehensive audit trail.
"""

import json
import logging
import time
from enum import IntEnum
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from .limbic import LimbicSystem
from .tools import ToolRegistry
from .control import get_control_system

# Setup logging
logger = logging.getLogger("agency")

# Constants
AGENCY_STATE_FILE = Path("progeny_root/core/agency_state.json")
AGENCY_AUDIT_LOG = Path("progeny_root/logs/agency_audit.log")
AGENCY_ACTION_LOG = Path("progeny_root/core/agency_action_log.json")

class TrustTier(IntEnum):
    STRANGER = 0  # Trust 0.0 - 0.6
    ASSOCIATE = 1 # Trust 0.6 - 0.8
    PARTNER = 2   # Trust 0.8 - 0.9
    SURROGATE = 3 # Trust 0.9 - 1.0

class AdvisoryRecommendation:
    """Advisory recommendation levels (constants)."""
    ADVISORY_RESTRICTION = "advisory_restriction"  # Not recommended, but can override
    ADVISORY_CAUTION = "advisory_caution"  # Caution advised
    ADVISORY_ALLOW = "advisory_allow"  # Generally safe

class ActionLogEntry(BaseModel):
    """Entry in the agency action log."""
    timestamp: float
    action_id: str
    action_type: str
    tool_name: str
    args: Dict[str, Any]
    commit_hash: Optional[str] = None
    advisory_recommendation: str
    override: bool
    result: Any
    rollback_hash: Optional[str] = None
    rollback_applied: bool = False

class AgencySystem:
    """
    Manages permissions with ADVISORY trust tiers.
    Trust tiers provide GUIDANCE, not restrictions.
    Sallie can override with full transparency.
    """
    def __init__(self, limbic: LimbicSystem):
        """Initialize Agency System with comprehensive error handling."""
        try:
            self.limbic = limbic
            self.tools = ToolRegistry()
            self.whitelist = [
                Path("progeny_root/drafts"),
                Path("progeny_root/working"),
                Path("progeny_root/outbox"),
                Path("progeny_root/projects"),
                Path("progeny_root/practice")
            ]
            self._ensure_directories()
            self.agency_state = self._load_agency_state()
            self.advisory_mode = True  # Advisory mode is always enabled
            self.control = get_control_system()  # Control mechanism
            self.capability_contracts = self._load_capability_contracts()
            self.action_log = self._load_action_log()
            # Generate next action ID based on existing log entries
            if self.action_log:
                max_id = 0
                for entry in self.action_log:
                    action_id = entry.get("action_id", "")
                    if action_id.startswith("action_"):
                        try:
                            id_num = int(action_id.split("_")[1])
                            max_id = max(max_id, id_num)
                        except (ValueError, IndexError):
                            pass
                self._next_action_id = max_id + 1
            else:
                self._next_action_id = 1
            
            logger.info(f"[AGENCY] Agency system initialized. Current tier: {self.get_tier().name}")
            
        except Exception as e:
            logger.error(f"[AGENCY] Critical error during initialization: {e}", exc_info=True)
            # Create minimal state as fallback
            self.agency_state = {
                "advisory_tiers": {"current_tier": "Tier2", "mode": "advisory"},
                "override_log": [],
                "notifications_sent": [],
                "last_override_ts": None
            }
            self.capability_contracts = {}
    
    def _ensure_directories(self):
        """Ensure agency state and log directories exist."""
        try:
            AGENCY_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
            AGENCY_AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
            AGENCY_ACTION_LOG.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"[AGENCY] Failed to create directories: {e}")
            raise

    def _load_agency_state(self) -> Dict[str, Any]:
        """Load advisory trust state from disk with validation."""
        if AGENCY_STATE_FILE.exists():
            try:
                with open(AGENCY_STATE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                # Validate structure
                if self._validate_agency_state(data):
                    return data
                else:
                    logger.warning("[AGENCY] Loaded state failed validation. Using defaults.")
                    self._backup_corrupted_file(AGENCY_STATE_FILE)
                    return self._default_agency_state()
                    
            except json.JSONDecodeError as e:
                logger.error(f"[AGENCY] JSON decode error loading state: {e}")
                self._backup_corrupted_file(AGENCY_STATE_FILE)
                return self._default_agency_state()
            except Exception as e:
                logger.error(f"[AGENCY] Error loading agency state: {e}", exc_info=True)
                return self._default_agency_state()
        
        return self._default_agency_state()
    
    def _default_agency_state(self) -> Dict[str, Any]:
        """Get default agency state."""
        return {
            "advisory_tiers": {
                "current_tier": "Tier2",
                "mode": "advisory"
            },
            "override_log": [],
            "notifications_sent": [],
            "last_override_ts": None,
            "capability_discoveries": [],
            "contract_violations": []
        }
    
    def _validate_agency_state(self, data: Dict[str, Any]) -> bool:
        """Validate agency state structure."""
        try:
            required_keys = ["advisory_tiers", "override_log", "notifications_sent"]
            return all(key in data for key in required_keys)
        except Exception:
            return False
    
    def _backup_corrupted_file(self, file_path: Path):
        """Backup a corrupted file."""
        try:
            backup_path = file_path.with_suffix(f".corrupted.{int(time.time())}")
            if file_path.exists():
                file_path.rename(backup_path)
                logger.warning(f"[AGENCY] Backed up corrupted file to {backup_path}")
        except Exception as e:
            logger.error(f"[AGENCY] Failed to backup corrupted file: {e}")
    
    def _load_capability_contracts(self) -> Dict[str, Dict[str, Any]]:
        """Load capability contracts for enforcement."""
        # Default contracts - can be extended
        return {
            "file_write": {
                "requires_rollback": True,
                "requires_notification": True,
                "max_file_size_mb": 100
            },
            "shell_exec": {
                "requires_rollback": True,
                "requires_notification": True,
                "timeout_seconds": 30
            },
            "git_commit": {
                "requires_rollback": False,
                "requires_notification": True,
                "auto_commit": True
            }
        }
    
    def _save_agency_state(self):
        """Save advisory trust state to disk with atomic write and retry logic."""
        temp_file = AGENCY_STATE_FILE.with_suffix(".tmp")
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Validate state before saving
                if not self._validate_agency_state(self.agency_state):
                    logger.error("[AGENCY] Cannot save: state validation failed")
                    return False
                
                # Write to temp file
                with open(temp_file, "w", encoding="utf-8") as f:
                    json.dump(self.agency_state, f, indent=2)
                
                # Verify temp file
                if not temp_file.exists() or temp_file.stat().st_size == 0:
                    raise IOError("Temp file is empty or missing")
                
                # Atomic rename
                if AGENCY_STATE_FILE.exists():
                    AGENCY_STATE_FILE.unlink()
                temp_file.rename(AGENCY_STATE_FILE)
                
                logger.debug(f"[AGENCY] State saved successfully (attempt {attempt + 1})")
                return True
                
            except IOError as e:
                logger.error(f"[AGENCY] IO error saving state (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1)
            except Exception as e:
                logger.error(f"[AGENCY] Error saving agency state: {e}", exc_info=True)
                if attempt == max_retries - 1:
                    self._save_to_backup()
                raise
            finally:
                if temp_file.exists():
                    try:
                        temp_file.unlink()
                    except Exception:
                        pass
        
        return False
    
    def _save_to_backup(self):
        """Save state to backup location if primary save fails."""
        try:
            backup_file = AGENCY_STATE_FILE.with_suffix(f".backup.{int(time.time())}")
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(self.agency_state, f, indent=2)
            logger.warning(f"[AGENCY] Saved to backup location: {backup_file}")
        except Exception as e:
            logger.error(f"[AGENCY] Failed to save to backup: {e}")

    def get_tier(self) -> TrustTier:
        """Calculates the current Agency Tier based on Trust (advisory only)."""
        t = self.limbic.state.trust
        if t < 0.6: return TrustTier.STRANGER
        if t < 0.8: return TrustTier.ASSOCIATE
        if t < 0.9: return TrustTier.PARTNER
        return TrustTier.SURROGATE

    def get_advisory_recommendation(self, action_type: str, target_path: Optional[str] = None) -> str:
        """
        Returns ADVISORY recommendation (not a restriction).
        Returns: "advisory_restriction" | "advisory_caution" | "advisory_allow"
        """
        tier = self.get_tier()
        path_obj = Path(target_path) if target_path else None

        # Tier 0: Stranger - Advisory restrictions on most actions
        if tier == TrustTier.STRANGER:
            if action_type == "read": return AdvisoryRecommendation.ADVISORY_ALLOW
            return AdvisoryRecommendation.ADVISORY_RESTRICTION

        # Tier 1: Associate - Advisory restrictions on writes outside drafts
        if tier == TrustTier.ASSOCIATE:
            if action_type == "read": return AdvisoryRecommendation.ADVISORY_ALLOW
            if action_type == "write":
                if path_obj and self._is_in_whitelist(path_obj):
                    return AdvisoryRecommendation.ADVISORY_ALLOW
                return AdvisoryRecommendation.ADVISORY_RESTRICTION
            return AdvisoryRecommendation.ADVISORY_RESTRICTION

        # Tier 2: Partner - Advisory caution on shell exec
        if tier == TrustTier.PARTNER:
            if action_type in ["read", "write", "git_commit"]:
                return AdvisoryRecommendation.ADVISORY_ALLOW
            if action_type == "shell_exec":
                return AdvisoryRecommendation.ADVISORY_CAUTION
            return AdvisoryRecommendation.ADVISORY_CAUTION

        # Tier 3: Surrogate - Generally allow, but still advisory
        if tier == TrustTier.SURROGATE:
            return AdvisoryRecommendation.ADVISORY_ALLOW

        return AdvisoryRecommendation.ADVISORY_CAUTION
    
    def check_permission(self, action_type: str, target_path: Optional[str] = None) -> bool:
        """
        ADVISORY MODE: Always returns True (no hard restrictions).
        Use get_advisory_recommendation() for guidance.
        """
        # In advisory mode, we don't block anything - we provide guidance
        # The actual decision to proceed is made by Sallie with transparency
            return True

    def log_override(self, action_type: str, recommendation: str, reason: str, target_path: Optional[str] = None):
        """
        Log when Sallie overrides an advisory recommendation.
        This ensures full transparency with comprehensive audit trail.
        """
        try:
            override_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action_type": action_type,
                "advisory_recommendation": recommendation,
                "override_reason": reason,
                "target_path": str(target_path) if target_path else None,
                "trust_tier": self.get_tier().name,
                "trust_level": self.limbic.state.trust,
                "transparency": "full"
            }
            
            # Ensure override_log exists
            if "override_log" not in self.agency_state:
                self.agency_state["override_log"] = []
            
            self.agency_state["override_log"].append(override_entry)
            self.agency_state["last_override_ts"] = time.time()
            
            # Keep last 1000 overrides
            if len(self.agency_state["override_log"]) > 1000:
                self.agency_state["override_log"] = self.agency_state["override_log"][-1000:]
            
            if self._save_agency_state():
                # Log to agency.log for visibility
                logger.info(f"[OVERRIDE] {action_type} - Recommendation: {recommendation}, Reason: {reason}")
                
                # Write to audit log
                self._write_audit_log("override", override_entry)
                
                # Notify Creator (this will be handled by notification system)
                self._queue_creator_notification(override_entry)
            else:
                logger.error("[AGENCY] Failed to save state after logging override")
                
        except Exception as e:
            logger.error(f"[AGENCY] Error logging override: {e}", exc_info=True)
    
    def _write_audit_log(self, event_type: str, entry: Dict[str, Any]):
        """Write entry to audit log file."""
        try:
            audit_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "event_type": event_type,
                "data": entry
            }
            
            with open(AGENCY_AUDIT_LOG, "a", encoding="utf-8") as f:
                f.write(json.dumps(audit_entry) + "\n")
        except Exception as e:
            logger.error(f"[AGENCY] Failed to write audit log: {e}")
    
    def _queue_creator_notification(self, override_entry: Dict[str, Any]):
        """Queue notification to Creator about override (for Ghost Interface)."""
        # Add to notifications queue
        notification = {
            "type": "trust_override",
            "timestamp": override_entry["timestamp"],
            "action": override_entry["action_type"],
            "recommendation": override_entry["advisory_recommendation"],
            "reason": override_entry["override_reason"]
        }
        self.agency_state["notifications_sent"].append(notification)
        self._save_agency_state()

    def _is_in_whitelist(self, path: Path) -> bool:
        """Checks if path is within allowed directories."""
        try:
            abs_path = path.resolve()
            for allowed in self.whitelist:
                if str(abs_path).startswith(str(allowed.resolve())):
                    return True
        except Exception:
            pass
        return False

    def execute_tool(self, tool_name: str, args: Dict[str, Any], override_reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a tool with ADVISORY trust model.
        Trust tiers provide guidance, not restrictions.
        All actions are logged for transparency.
        Checks control mechanism before proceeding.
        Creates pre-action commits for Tier 2+ file modifications.
        """
        # 0. Check control mechanism (emergency stop, state lock)
        if not self.control.can_proceed(f"Tool execution: {tool_name}"):
            return {
                "status": "blocked",
                "message": "Action blocked by control mechanism (emergency stop or state locked)",
                "control_status": self.control.get_control_status()
            }
        
        tier = self.get_tier()
        logger.info(f"Requesting tool: {tool_name} at Tier: {tier.name} (ADVISORY MODE)")

        # 1. Check if tool exists
        if not self.tools.has_tool(tool_name):
            return {"status": "error", "message": f"Tool '{tool_name}' not found."}

        # 2. Get advisory recommendation (guidance, not restriction)
        action_type = "write" if tool_name.startswith("write_") else "read" if tool_name.startswith("read_") else "shell_exec" if tool_name == "shell_exec" else "other"
        recommendation = self.get_advisory_recommendation(action_type, args.get("path"))
        
        # 2.5. Check capability contract compliance (Section 8.4, 8.5)
        # Map action_type to capability contract name
        contract_action_type = "file_write" if action_type == "write" else "file_read" if action_type == "read" else action_type
        metadata = {}
        if contract_action_type == "file_write" and "path" in args:
            # Calculate file size if content provided
            content = args.get("content", "")
            if isinstance(content, str):
                metadata["file_size_mb"] = len(content.encode('utf-8')) / (1024 * 1024)
            elif isinstance(content, bytes):
                metadata["file_size_mb"] = len(content) / (1024 * 1024)
        
        contract_check = self.check_capability_contract(contract_action_type, metadata)
        if not contract_check.get("compliant", True):
            # Log violation but allow execution (advisory mode)
            logger.warning(f"[AGENCY] Capability contract violation for {tool_name}: {contract_check.get('violations', [])}")
            # Violations are logged but don't block execution in advisory mode
        
        # 3. Create pre-action commit for Tier 2+ file modifications
        commit_hash = self._create_pre_action_commit(tool_name, args)
        
        # 4. If recommendation is restrictive, log override (if reason provided)
        override_occurred = False
        if recommendation == AdvisoryRecommendation.ADVISORY_RESTRICTION:
            override_occurred = True
            if override_reason:
                self.log_override(action_type, recommendation, override_reason, args.get("path"))
            else:
                # Auto-generate reason if not provided
                self.log_override(
                    action_type,
                    recommendation,
                    f"Advisory restriction overridden at {tier.name} tier - proceeding with transparency",
                    args.get("path")
                )

        # 5. Execute (no hard restrictions in advisory mode)
        action_id = f"action_{self._next_action_id}"
        self._next_action_id += 1
        
        try:
            result = self.tools.run(tool_name, args, tier)
            
            # 6. Check for harm and offer rollback if needed
            harm_detected = self._detect_harm(tool_name, result, args)
            if harm_detected:
                self._offer_rollback(action_id, commit_hash, harm_detected)
            
            # 7. Log action to action log
            log_entry = ActionLogEntry(
                timestamp=time.time(),
                action_id=action_id,
                action_type=action_type,
                tool_name=tool_name,
                args=args,
                commit_hash=commit_hash,
                advisory_recommendation=recommendation,
                override=override_occurred,
                result=result
            )
            self._log_action(log_entry)
            
            # Log successful execution
            logger.info(f"[EXECUTED] {tool_name} - Recommendation was: {recommendation}, Result: success, Commit: {commit_hash}")
            
            return {
                "status": "success",
                "result": result,
                "advisory_recommendation": recommendation,
                "trust_tier": tier.name,
                "transparency": "full",
                "action_id": action_id,
                "commit_hash": commit_hash
            }
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            
            # Log failed action
            log_entry = ActionLogEntry(
                timestamp=time.time(),
                action_id=action_id,
                action_type=action_type,
                tool_name=tool_name,
                args=args,
                commit_hash=commit_hash,
                advisory_recommendation=recommendation,
                override=override_occurred,
                result={"error": str(e)}
            )
            self._log_action(log_entry)
            
            return {
                "status": "error",
                "message": str(e),
                "advisory_recommendation": recommendation,
                "trust_tier": tier.name,
                "action_id": action_id,
                "commit_hash": commit_hash
            }
    
    def _detect_harm(self, tool_name: str, result: Any, args: Dict[str, Any]) -> Optional[str]:
        """
        Detect if an action caused harm.
        Returns harm description if detected, None otherwise.
        """
        # Check for system errors
        if isinstance(result, dict) and result.get("status") == "error":
            return f"System error during {tool_name}: {result.get('message', 'Unknown error')}"
        
        # Check for negative outcomes in result
        if isinstance(result, str):
            error_indicators = ["error", "failed", "timeout", "not found", "permission denied"]
            result_lower = result.lower()
            for indicator in error_indicators:
                if indicator in result_lower:
                    return f"Negative outcome detected: {result}"
        
        # Additional harm detection logic can be added here
        # (e.g., file size checks, permission issues, etc.)
        
        return None
    
    def _offer_rollback(self, action_id: str, commit_hash: Optional[str], harm_description: str):
        """
        Proactively offer rollback when harm is detected.
        """
        if not commit_hash:
            logger.warning(f"[AGENCY] Cannot offer rollback for {action_id}: no commit hash")
            return
        
        try:
            # Update action log entry with rollback offer
            for entry_dict in self.action_log:
                if entry_dict.get("action_id") == action_id:
                    entry_dict["rollback_offered"] = True
                    entry_dict["harm_detected"] = harm_description
                    break
            
            self._save_action_log()
            
            logger.warning(f"[AGENCY] Harm detected for {action_id}: {harm_description}. Rollback available via commit {commit_hash}")
            
            # In a full implementation, this would trigger a notification to the Creator
            # For now, we log it and store it in the action log
            
        except Exception as e:
            logger.error(f"[AGENCY] Error offering rollback: {e}")
    
    def rollback_action(self, action_id: Optional[str] = None, commit_hash: Optional[str] = None, explanation: str = "Creator requested rollback") -> Dict[str, Any]:
        """
        Rollback an action by reverting to the pre-action commit.
        Requires either action_id or commit_hash.
        """
        if not action_id and not commit_hash:
            return {
                "status": "error",
                "message": "Either action_id or commit_hash must be provided"
            }
        
        try:
            # Find action in log
            action_entry = None
            if action_id:
                for entry_dict in self.action_log:
                    if entry_dict.get("action_id") == action_id:
                        action_entry = entry_dict
                        commit_hash = entry_dict.get("commit_hash")
                        break
            elif commit_hash:
                # Find by commit hash
                for entry_dict in reversed(self.action_log):
                    if entry_dict.get("commit_hash") == commit_hash:
                        action_entry = entry_dict
                        action_id = entry_dict.get("action_id")
                        break
            
            if not action_entry:
                return {
                    "status": "error",
                    "message": f"Action not found in log (action_id: {action_id}, commit_hash: {commit_hash})"
                }
            
            if not commit_hash:
                return {
                    "status": "error",
                    "message": "No commit hash found for this action - cannot rollback"
                }
            
            # Perform rollback
            rollback_result = self.tools._git_revert(commit_hash)
            
            if "error" in rollback_result.lower():
                return {
                    "status": "error",
                    "message": rollback_result
                }
            
            # Get rollback commit hash
            rollback_hash = self.tools._get_latest_commit_hash()
            
            # Update action log entry
            action_entry["rollback_applied"] = True
            action_entry["rollback_hash"] = rollback_hash
            action_entry["rollback_timestamp"] = time.time()
            action_entry["rollback_explanation"] = explanation
            self._save_action_log()
            
            # Apply Trust penalty (0.02) as per spec
            current_trust = self.limbic.state.trust
            new_trust = max(0.0, current_trust - 0.02)
            self.limbic.update_trust(new_trust)
            
            # Log rollback
            logger.warning(f"[AGENCY] Rollback applied for {action_id}: {explanation}. Trust reduced from {current_trust:.3f} to {new_trust:.3f}")
            self._write_audit_log("rollback", {
                "action_id": action_id,
                "commit_hash": commit_hash,
                "rollback_hash": rollback_hash,
                "explanation": explanation,
                "trust_penalty": 0.02
            })
            
            return {
                "status": "success",
                "message": f"Rollback applied successfully",
                "action_id": action_id,
                "original_commit": commit_hash,
                "rollback_commit": rollback_hash,
                "trust_penalty": 0.02,
                "new_trust": new_trust
            }
            
        except Exception as e:
            logger.error(f"[AGENCY] Error during rollback: {e}", exc_info=True)
            return {
                "status": "error",
                "message": f"Rollback failed: {str(e)}"
            }
    
    def get_override_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent override history for transparency."""
        override_log = self.agency_state.get("override_log", [])
        return override_log[-limit:] if limit > 0 else override_log
    
    def get_advisory_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of current advisory state."""
        override_log = self.agency_state.get("override_log", [])
        current_time = time.time()
        
        return {
            "mode": "advisory",
            "current_tier": self.get_tier().name,
            "trust_level": self.limbic.state.trust,
            "recent_overrides_1h": len([o for o in override_log if current_time - o.get("timestamp", 0) < 3600]),
            "recent_overrides_24h": len([o for o in override_log if current_time - o.get("timestamp", 0) < 86400]),
            "total_overrides": len(override_log),
            "last_override_ts": self.agency_state.get("last_override_ts"),
            "capabilities_discovered": len(self.agency_state.get("capability_discoveries", [])),
            "contract_violations": len(self.agency_state.get("contract_violations", []))
        }
    
    def discover_capability(self, capability_name: str, description: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Discover and register a new capability."""
        try:
            discovery_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "capability_name": capability_name,
                "description": description,
                "metadata": metadata or {},
                "discovered_at_tier": self.get_tier().name
            }
            
            if "capability_discoveries" not in self.agency_state:
                self.agency_state["capability_discoveries"] = []
            
            self.agency_state["capability_discoveries"].append(discovery_entry)
            
            # Keep last 500 discoveries
            if len(self.agency_state["capability_discoveries"]) > 500:
                self.agency_state["capability_discoveries"] = self.agency_state["capability_discoveries"][-500:]
            
            self._save_agency_state()
            logger.info(f"[AGENCY] Capability discovered: {capability_name}")
            return True
            
        except Exception as e:
            logger.error(f"[AGENCY] Error discovering capability: {e}")
            return False
    
    def get_capabilities(self) -> List[Dict[str, Any]]:
        """Get list of discovered capabilities."""
        return self.agency_state.get("capability_discoveries", [])
    
    def check_capability_contract(self, action_type: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Check if action complies with capability contract."""
        contract = self.capability_contracts.get(action_type, {})
        
        result = {
            "compliant": True,
            "violations": [],
            "warnings": []
        }
        
        # Check file size if applicable
        if action_type == "file_write" and metadata:
            max_size_mb = contract.get("max_file_size_mb", 100)
            file_size_mb = metadata.get("file_size_mb", 0)
            if file_size_mb > max_size_mb:
                result["compliant"] = False
                result["violations"].append(f"File size {file_size_mb}MB exceeds limit {max_size_mb}MB")
        
        # Log violations
        if not result["compliant"]:
            violation_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "action_type": action_type,
                "violations": result["violations"],
                "trust_tier": self.get_tier().name
            }
            
            if "contract_violations" not in self.agency_state:
                self.agency_state["contract_violations"] = []
            
            self.agency_state["contract_violations"].append(violation_entry)
            
            # Keep last 200 violations
            if len(self.agency_state["contract_violations"]) > 200:
                self.agency_state["contract_violations"] = self.agency_state["contract_violations"][-200:]
            
            self._save_agency_state()
            logger.warning(f"[AGENCY] Capability contract violation: {action_type} - {result['violations']}")
        
        return result
    
    def _load_action_log(self) -> List[Dict[str, Any]]:
        """Load action log from disk."""
        if AGENCY_ACTION_LOG.exists():
            try:
                with open(AGENCY_ACTION_LOG, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
                    return []
            except Exception as e:
                logger.error(f"[AGENCY] Error loading action log: {e}")
                return []
        return []
    
    def _save_action_log(self):
        """Save action log to disk."""
        try:
            # Keep last 10000 entries
            if len(self.action_log) > 10000:
                self.action_log = self.action_log[-10000:]
            
            temp_file = AGENCY_ACTION_LOG.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(self.action_log, f, indent=2, default=str)
            
            # Atomic rename
            if AGENCY_ACTION_LOG.exists():
                AGENCY_ACTION_LOG.unlink()
            temp_file.rename(AGENCY_ACTION_LOG)
        except Exception as e:
            logger.error(f"[AGENCY] Error saving action log: {e}")
    
    def _log_action(self, entry: ActionLogEntry):
        """Log an action to the action log."""
        try:
            # Convert to dict and handle non-serializable values
            entry_dict = entry.model_dump()
            # Convert result to string if it's not serializable
            if not isinstance(entry_dict.get("result"), (str, dict, list, int, float, bool, type(None))):
                entry_dict["result"] = str(entry_dict["result"])
            self.action_log.append(entry_dict)
            self._save_action_log()
        except Exception as e:
            logger.error(f"[AGENCY] Error logging action: {e}")
    
    def _is_file_modification_tool(self, tool_name: str) -> bool:
        """Check if a tool modifies files."""
        file_modification_tools = ["write_file", "delete_file", "move_file", "copy_file"]
        return tool_name in file_modification_tools
    
    def _get_affected_files(self, tool_name: str, args: Dict[str, Any]) -> List[str]:
        """Extract affected file paths from tool arguments."""
        affected = []
        if "path" in args:
            affected.append(args["path"])
        if "source" in args:
            affected.append(args["source"])
        if "target" in args:
            affected.append(args["target"])
        if "file_path" in args:
            affected.append(args["file_path"])
        return affected
    
    def _create_pre_action_commit(self, tool_name: str, args: Dict[str, Any]) -> Optional[str]:
        """Create a pre-action commit for file modifications at Tier 2+."""
        tier = self.get_tier()
        
        # Only create pre-action commits for Tier 2+ (PARTNER, SURROGATE)
        if tier < TrustTier.PARTNER:
            return None
        
        # Only for file modification tools
        if not self._is_file_modification_tool(tool_name):
            return None
        
        try:
            affected_files = self._get_affected_files(tool_name, args)
            action_description = f"{tool_name} on {', '.join(affected_files) if affected_files else 'files'}"
            
            commit_hash = self.tools.create_pre_action_commit(
                action_description,
                affected_files if affected_files else None
            )
            
            return commit_hash
        except Exception as e:
            logger.warning(f"[AGENCY] Failed to create pre-action commit: {e}")
            return None
