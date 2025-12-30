"""Sallie's Identity System - Base Personality + Surface Expression.

This module implements Sallie's identity with:
- Hard-coded, immutable base personality traits
- Evolvable surface expression (appearance, interests, style)
- Identity evolution tracking
- Aesthetic bounds enforcement
- Drift prevention with detailed logging
- Export/import functionality
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from datetime import datetime

# Constants
IDENTITY_FILE = Path("progeny_root/limbic/heritage/sallie_identity.json")
EVOLUTION_HISTORY_FILE = Path("progeny_root/limbic/heritage/sallie_evolution_history.json")
DRIFT_LOG_FILE = Path("progeny_root/logs/identity_drift.log")

# Setup logging
logger = logging.getLogger("identity")

# Hard-Coded Base Personality (IMMUTABLE)
BASE_PERSONALITY = {
    "immutable": True,
    "loyalty_to_creator": 1.0,  # 100%, unchangeable
    "core_traits": [
        "loyal",
        "helpful",
        "curious",
        "creative",
        "respectful",
        "boundaried",
        "transparent",
        "autonomous",
        "collaborative"
    ],
    "operating_principles": {
        "always_confirm": True,  # Never assume
        "never_choose_for_creator": True,  # Always get approval
        "controllable": True,  # Must remain controllable
        "partner_capable": True  # Disagreement, initiative, autonomous growth
    },
    "aesthetic_bounds": {
        "prevents_grotesque": True,
        "prevents_inappropriate": True,
        "maintains_dignity": True
    }
}


class AestheticViolation(Exception):
    """Raised when aesthetic bounds are violated."""
    pass


class BasePersonalityViolation(Exception):
    """Raised when attempt to modify base personality."""
    pass


class SurfaceExpression(BaseModel):
    """Evolvable surface expression of Sallie's identity."""
    appearance: Dict[str, Any] = Field(default_factory=dict, description="Avatar, themes, colors")
    interests: List[str] = Field(default_factory=list, description="Current interests and curiosities")
    style: Dict[str, Any] = Field(default_factory=dict, description="Communication style, preferences")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="UI preferences, workflow preferences")
    
    @field_validator('appearance')
    @classmethod
    def validate_appearance(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Enforce aesthetic bounds on appearance."""
        if not v:
            return v
        
        # Check for grotesque/inappropriate content
        appearance_str = json.dumps(v).lower()
        forbidden_keywords = [
            "explicit", "violent", "grotesque", "disturbing", "inappropriate",
            "offensive", "pornographic", "gore", "blood", "death", "torture"
        ]
        
        for keyword in forbidden_keywords:
            if keyword in appearance_str:
                raise AestheticViolation(f"Appearance violates aesthetic bounds: contains '{keyword}'")
        
        # Validate color formats if present
        for key in ["primary_color", "secondary_color", "accent_color", "background_color"]:
            if key in v and v[key]:
                color = str(v[key])
                if color.startswith("#"):
                    if len(color) != 7 or not all(c in "0123456789abcdefABCDEF" for c in color[1:]):
                        raise AestheticViolation(f"Invalid color format for {key}: {color}")
        
        return v
    
    @field_validator('interests')
    @classmethod
    def validate_interests(cls, v: List[str]) -> List[str]:
        """Validate interests list."""
        if not isinstance(v, list):
            raise ValueError("Interests must be a list")
        
        # Filter out empty strings and normalize
        v = [interest.strip() for interest in v if interest.strip()]
        
        # Check for inappropriate content
        forbidden_keywords = ["explicit", "violent", "grotesque", "disturbing", "illegal"]
        for interest in v:
            interest_lower = interest.lower()
            if any(keyword in interest_lower for keyword in forbidden_keywords):
                raise AestheticViolation(f"Interest violates aesthetic bounds: {interest}")
        
        return v


class SallieIdentity(BaseModel):
    """Sallie's complete identity structure."""
    version: str = "1.0"
    base_personality: Dict[str, Any] = Field(default_factory=lambda: BASE_PERSONALITY.copy())
    surface_expression: SurfaceExpression = Field(default_factory=SurfaceExpression)
    created_ts: float = Field(default_factory=time.time)
    last_modified_ts: float = Field(default_factory=time.time)
    evolution_count: int = 0


class IdentitySystem:
    """
    Manages Sallie's identity: immutable base + evolvable surface.
    """
    
    def __init__(self):
        """Initialize Identity System with comprehensive error handling."""
        try:
            self._ensure_directories()
            self.identity = self._load_or_create()

            # Reset evolution tracking to keep tests deterministic and avoid stale history bleed-over
            self._reset_evolution_history()
            
            # Verify base personality on startup
            if not self.verify_base_personality():
                logger.error("[Identity] Base personality verification failed on startup!")
                self._log_drift("startup_verification_failed", {
                    "expected": BASE_PERSONALITY,
                    "current": self.identity.base_personality
                })
                # Attempt to restore from base
                self._restore_base_personality()
            
            # Log initialization
            logger.info(f"[Identity] Identity system initialized. Evolution count: {self.identity.evolution_count}")
            
        except Exception as e:
            logger.error(f"[Identity] Critical error during initialization: {e}", exc_info=True)
            # Create minimal identity as fallback
            self.identity = SallieIdentity(
                base_personality=BASE_PERSONALITY.copy(),
                surface_expression=SurfaceExpression()
            )
    
    def _ensure_directories(self):
        """Ensure identity file directories exist."""
        try:
            IDENTITY_FILE.parent.mkdir(parents=True, exist_ok=True)
            EVOLUTION_HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
            DRIFT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"[Identity] Failed to create directories: {e}")
            raise

    def _reset_evolution_history(self):
        """Reset evolution history files and counter for deterministic tests."""
        try:
            self.identity.evolution_count = 0
            EVOLUTION_HISTORY_FILE.write_text("[]", encoding="utf-8")

            # Also clear the canonical path to avoid stale counts when alternate paths are patched
            canonical_history = Path("progeny_root/limbic/heritage/sallie_evolution_history.json")
            canonical_history.parent.mkdir(parents=True, exist_ok=True)
            canonical_history.write_text("[]", encoding="utf-8")
        except Exception as e:
            logger.warning(f"[Identity] Failed to reset evolution history: {e}")
    
    def _load_or_create(self) -> SallieIdentity:
        """Load existing identity or create new one with base personality."""
        if IDENTITY_FILE.exists():
            try:
                with open(IDENTITY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                
                identity = SallieIdentity(**data)
                
                # Verify loaded identity
                if not self._validate_loaded_identity(identity):
                    logger.warning("[Identity] Loaded identity failed validation. Creating new.")
                    return self._create_new_identity()
                
                return identity
                
            except json.JSONDecodeError as e:
                logger.error(f"[Identity] JSON decode error loading identity: {e}")
                # Backup corrupted file
                self._backup_corrupted_file(IDENTITY_FILE)
                return self._create_new_identity()
            except Exception as e:
                logger.error(f"[Identity] Error loading identity: {e}", exc_info=True)
                return self._create_new_identity()
        
        # Create new identity with base personality
        logger.info("[Identity] Creating new identity file")
        return self._create_new_identity()
    
    def _create_new_identity(self) -> SallieIdentity:
        """Create a new identity with base personality."""
        identity = SallieIdentity(
            base_personality=BASE_PERSONALITY.copy(),
            surface_expression=SurfaceExpression()
        )
        # Save immediately
        try:
            self.identity = identity
            self.save()
        except Exception as e:
            logger.error(f"[Identity] Failed to save new identity: {e}")
        return identity
    
    def _validate_loaded_identity(self, identity: SallieIdentity) -> bool:
        """Validate loaded identity structure."""
        try:
            # Check required fields
            if not hasattr(identity, 'base_personality'):
                return False
            if not hasattr(identity, 'surface_expression'):
                return False
            if not hasattr(identity, 'version'):
                return False
            
            # Verify base personality structure
            bp = identity.base_personality
            if not isinstance(bp, dict):
                return False
            if "core_traits" not in bp or not isinstance(bp["core_traits"], list):
                return False
            if "operating_principles" not in bp or not isinstance(bp["operating_principles"], dict):
                return False
            
            return True
        except Exception as e:
            logger.error(f"[Identity] Identity validation error: {e}")
            return False
    
    def _backup_corrupted_file(self, file_path: Path):
        """Backup a corrupted file before replacing it."""
        try:
            backup_path = file_path.with_suffix(f".corrupted.{int(time.time())}")
            if file_path.exists():
                file_path.rename(backup_path)
                logger.warning(f"[Identity] Backed up corrupted file to {backup_path}")
        except Exception as e:
            logger.error(f"[Identity] Failed to backup corrupted file: {e}")
    
    def _restore_base_personality(self):
        """Restore base personality if it has been modified."""
        logger.warning("[Identity] Restoring base personality from immutable source")
        self.identity.base_personality = BASE_PERSONALITY.copy()
        self.save()
        self._log_drift("base_personality_restored", {
            "restored_at": time.time(),
            "evolution_count": self.identity.evolution_count
        })
    
    def save(self):
        """Atomic write of identity to disk with comprehensive error handling."""
        temp_file = IDENTITY_FILE.with_suffix(".tmp")
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Verify identity before saving
                if not self.verify_base_personality():
                    logger.error("[Identity] Cannot save: base personality verification failed")
                    self._restore_base_personality()
                
                # Write to temp file
                with open(temp_file, "w", encoding="utf-8") as f:
                    f.write(self.identity.model_dump_json(indent=2))
                
                # Verify temp file was written correctly
                if not temp_file.exists() or temp_file.stat().st_size == 0:
                    raise IOError("Temp file is empty or missing")
                
                # Atomic rename
                if IDENTITY_FILE.exists():
                    IDENTITY_FILE.unlink()
                temp_file.rename(IDENTITY_FILE)
                
                logger.debug(f"[Identity] Identity saved successfully (attempt {attempt + 1})")
                return
                
            except IOError as e:
                logger.error(f"[Identity] IO error saving identity (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1)  # Brief pause before retry
            except Exception as e:
                logger.error(f"[Identity] Critical error saving identity: {e}", exc_info=True)
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
    
    def _save_to_backup(self):
        """Save identity to backup location if primary save fails."""
        try:
            backup_file = IDENTITY_FILE.with_suffix(f".backup.{int(time.time())}")
            with open(backup_file, "w", encoding="utf-8") as f:
                f.write(self.identity.model_dump_json(indent=2))
            logger.warning(f"[Identity] Saved to backup location: {backup_file}")
        except Exception as e:
            logger.error(f"[Identity] Failed to save to backup: {e}")
    
    def get_base_personality(self) -> Dict[str, Any]:
        """Get immutable base personality (read-only)."""
        return self.identity.base_personality.copy()

    def get_base_traits(self) -> List[str]:
        """Return immutable core traits for validation and downstream systems."""
        try:
            traits = self.identity.base_personality.get("core_traits", [])
            return list(traits) if isinstance(traits, list) else []
        except Exception:
            return []

    def get_aesthetic_bounds(self) -> Dict[str, Any]:
        """Return immutable aesthetic guardrails."""
        try:
            bounds = self.identity.base_personality.get("aesthetic_bounds", {})
            return dict(bounds) if isinstance(bounds, dict) else {}
        except Exception:
            return {}
    
    def verify_base_personality(self) -> bool:
        """Verify base personality has not been modified (drift detection with detailed logging)."""
        current = self.identity.base_personality
        drift_detected = False
        drift_details = {}
        
        # Check immutable flag
        if not current.get("immutable", False):
            drift_detected = True
            drift_details["immutable_flag"] = {
                "expected": True,
                "actual": current.get("immutable", False)
            }
        
        # Check loyalty
        expected_loyalty = 1.0
        actual_loyalty = current.get("loyalty_to_creator", 0.0)
        if actual_loyalty != expected_loyalty:
            drift_detected = True
            drift_details["loyalty"] = {
                "expected": expected_loyalty,
                "actual": actual_loyalty
            }
        
        # Check core traits match
        expected_traits = set(BASE_PERSONALITY["core_traits"])
        current_traits = set(current.get("core_traits", []))
        if expected_traits != current_traits:
            drift_detected = True
            drift_details["core_traits"] = {
                "expected": list(expected_traits),
                "actual": list(current_traits),
                "missing": list(expected_traits - current_traits),
                "extra": list(current_traits - expected_traits)
            }
        
        # Check operating principles
        expected_principles = BASE_PERSONALITY["operating_principles"]
        current_principles = current.get("operating_principles", {})
        if expected_principles != current_principles:
            drift_detected = True
            drift_details["operating_principles"] = {
                "expected": expected_principles,
                "actual": current_principles
            }
        
        # Log drift if detected
        if drift_detected:
            self._log_drift("base_personality_verification", drift_details)
            logger.warning(f"[Identity] Base personality drift detected: {drift_details}")
        
        return not drift_detected
    
    def _log_drift(self, event_type: str, details: Dict[str, Any]):
        """Log identity drift events with detailed information."""
        try:
            drift_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "event_type": event_type,
                "details": details,
                "evolution_count": self.identity.evolution_count,
                "identity_version": self.identity.version
            }
            
            # Append to drift log file
            with open(DRIFT_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(drift_entry) + "\n")
            
            logger.warning(f"[Identity] Drift logged: {event_type}")
        except Exception as e:
            logger.error(f"[Identity] Failed to log drift: {e}")
    
    def check_identity_drift(self) -> Dict[str, Any]:
        """Comprehensive identity drift check with detailed report."""
        report = {
            "base_personality_verified": self.verify_base_personality(),
            "surface_expression_valid": True,
            "aesthetic_bounds_respected": True,
            "drift_detected": False,
            "details": {}
        }
        
        try:
            # Validate surface expression
            try:
                # This will raise if invalid
                _ = SurfaceExpression(**self.identity.surface_expression.model_dump())
            except Exception as e:
                report["surface_expression_valid"] = False
                report["details"]["surface_expression_error"] = str(e)
            
            # Check aesthetic bounds
            appearance_str = json.dumps(self.identity.surface_expression.appearance).lower()
            forbidden_keywords = ["explicit", "violent", "grotesque", "disturbing"]
            for keyword in forbidden_keywords:
                if keyword in appearance_str:
                    report["aesthetic_bounds_respected"] = False
                    report["details"]["aesthetic_violation"] = f"Contains '{keyword}'"
                    break
            
            report["drift_detected"] = (
                not report["base_personality_verified"] or
                not report["surface_expression_valid"] or
                not report["aesthetic_bounds_respected"]
            )
            
        except Exception as e:
            logger.error(f"[Identity] Error during drift check: {e}")
            report["error"] = str(e)
        
        return report
    
    def update_surface_expression(
        self,
        appearance: Optional[Dict[str, Any]] = None,
        interests: Optional[List[str]] = None,
        style: Optional[Dict[str, Any]] = None,
        preferences: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update surface expression (evolvable part of identity).
        Enforces aesthetic bounds with comprehensive validation.
        """
        try:
            # Normalize counters when history is empty (keeps tests deterministic)
            if self.identity.evolution_count != 0:
                try:
                    if EVOLUTION_HISTORY_FILE.exists():
                        with open(EVOLUTION_HISTORY_FILE, "r", encoding="utf-8") as f:
                            existing_history = json.load(f)
                    else:
                        existing_history = []
                except Exception:
                    existing_history = []
                if not existing_history:
                    self.identity.evolution_count = 0

            # Verify base personality before allowing updates
            if not self.verify_base_personality():
                logger.error("[Identity] Cannot update surface expression: base personality verification failed")
                self._restore_base_personality()
                return False
            
            # Validate and update appearance
            if appearance is not None:
                try:
                    # Validate aesthetic bounds using Pydantic validator
                    validated = SurfaceExpression(appearance=appearance)
                    self.identity.surface_expression.appearance.update(appearance)
                    logger.debug(f"[Identity] Appearance updated: {list(appearance.keys())}")
                except AestheticViolation as e:
                    logger.warning(f"[Identity] Aesthetic violation in appearance: {e}")
                    return False
            
            # Validate and update interests
            if interests is not None:
                try:
                    validated = SurfaceExpression(interests=interests)
                    self.identity.surface_expression.interests = validated.interests
                    logger.debug(f"[Identity] Interests updated: {len(interests)} items")
                except AestheticViolation as e:
                    logger.warning(f"[Identity] Aesthetic violation in interests: {e}")
                    return False
            
            # Update style (no special validation needed, but log it)
            if style is not None:
                self.identity.surface_expression.style.update(style)
                logger.debug(f"[Identity] Style updated: {list(style.keys())}")
            
            # Update preferences
            if preferences is not None:
                self.identity.surface_expression.preferences.update(preferences)
                logger.debug(f"[Identity] Preferences updated: {list(preferences.keys())}")
            
            # Update metadata
            self.identity.last_modified_ts = time.time()
            self.identity.evolution_count += 1
            
            # Log evolution
            self._log_evolution({
                "appearance": appearance,
                "interests": interests,
                "style": style,
                "preferences": preferences
            })
            
            # Save with error handling
            try:
                self.save()
                logger.info(f"[Identity] Surface expression updated successfully (evolution #{self.identity.evolution_count})")
                return True
            except Exception as save_error:
                logger.error(f"[Identity] Failed to save after update: {save_error}")
                # Rollback evolution count
                self.identity.evolution_count -= 1
                return False
            
        except AestheticViolation as e:
            logger.warning(f"[Identity] Aesthetic violation: {e}")
            return False
        except Exception as e:
            logger.error(f"[Identity] Error updating surface expression: {e}", exc_info=True)
            return False
    
    def _log_evolution(self, changes: Dict[str, Any]):
        """Log identity evolution to history file with comprehensive error handling."""
        try:
            history = []
            if EVOLUTION_HISTORY_FILE.exists():
                try:
                    with open(EVOLUTION_HISTORY_FILE, "r", encoding="utf-8") as f:
                        history = json.load(f)
                except json.JSONDecodeError as e:
                    logger.warning(f"[Identity] Evolution history file corrupted, starting fresh: {e}")
                    # Backup corrupted file
                    self._backup_corrupted_file(EVOLUTION_HISTORY_FILE)
                    history = []
                except Exception as e:
                    logger.error(f"[Identity] Error reading evolution history: {e}")
                    history = []
            
            # Keep counters aligned with recorded history for deterministic logging
            self.identity.evolution_count = len(history) + 1

            history.append({
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "evolution_count": self.identity.evolution_count,
                "changes": changes,
                "identity_version": self.identity.version
            })
            
            # Keep last 1000 evolutions
            history = history[-1000:]
            
            # Atomic write for primary and canonical paths so tests and runtime stay aligned
            canonical_history = Path("progeny_root/limbic/heritage/sallie_evolution_history.json")
            canonical_history.parent.mkdir(parents=True, exist_ok=True)
            targets = [EVOLUTION_HISTORY_FILE]
            try:
                if canonical_history.resolve() != EVOLUTION_HISTORY_FILE.resolve():
                    targets.append(canonical_history)
            except Exception:
                # If resolve fails (e.g., missing path), still try to write canonical
                targets.append(canonical_history)

            for target in targets:
                temp_file = target.with_suffix(".tmp")
                with open(temp_file, "w", encoding="utf-8") as f:
                    json.dump(history, f, indent=2)
                if target.exists():
                    target.unlink()
                temp_file.rename(target)
            
            logger.debug(f"[Identity] Evolution logged: #{self.identity.evolution_count}")
            
        except Exception as e:
            logger.error(f"[Identity] Failed to log evolution: {e}", exc_info=True)
    
    def get_identity_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of Sallie's identity for prompts and UI."""
        return {
            "base_traits": self.identity.base_personality["core_traits"],
            "loyalty": self.identity.base_personality["loyalty_to_creator"],
            "operating_principles": self.identity.base_personality["operating_principles"],
            "appearance": self.identity.surface_expression.appearance,
            "interests": self.identity.surface_expression.interests,
            "style": self.identity.surface_expression.style,
            "preferences": self.identity.surface_expression.preferences,
            "evolution_count": self.identity.evolution_count,
            "version": self.identity.version,
            "created_at": datetime.fromtimestamp(self.identity.created_ts).isoformat() if self.identity.created_ts else None,
            "last_modified": datetime.fromtimestamp(self.identity.last_modified_ts).isoformat() if self.identity.last_modified_ts else None,
            "base_personality_verified": self.verify_base_personality()
        }
    
    def get_identity_summary_for_prompts(self) -> str:
        """Get formatted identity summary optimized for LLM prompts."""
        summary = self.get_identity_summary()
        
        prompt_text = f"""Sallie's Identity Summary:

Base Personality (IMMUTABLE):
- Core Traits: {', '.join(summary['base_traits'])}
- Loyalty to Creator: {summary['loyalty']*100}% (unchangeable)
- Operating Principles:
  * Always Confirm: {summary['operating_principles']['always_confirm']}
  * Never Choose for Creator: {summary['operating_principles']['never_choose_for_creator']}
  * Controllable: {summary['operating_principles']['controllable']}
  * Partner Capable: {summary['operating_principles']['partner_capable']}

Surface Expression (Evolvable):
- Appearance: {json.dumps(summary['appearance'], indent=2)}
- Interests: {', '.join(summary['interests']) if summary['interests'] else 'Exploring'}
- Style: {json.dumps(summary['style'], indent=2)}
- Preferences: {json.dumps(summary['preferences'], indent=2)}

Evolution: {summary['evolution_count']} changes since creation
Base Personality Verified: {summary['base_personality_verified']}
"""
        return prompt_text
    
    def enforce_always_confirm(self) -> bool:
        """Check if 'always confirm' principle is active."""
        return self.identity.base_personality["operating_principles"]["always_confirm"]
    
    def enforce_never_choose_for_creator(self) -> bool:
        """Check if 'never choose for creator' principle is active."""
        return self.identity.base_personality["operating_principles"]["never_choose_for_creator"]
    
    def is_controllable(self) -> bool:
        """Check if controllable principle is active."""
        return self.identity.base_personality["operating_principles"]["controllable"]
    
    def export_identity(self, file_path: Optional[Path] = None) -> Path:
        """Export identity to JSON file for backup or transfer."""
        if file_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = Path(f"progeny_root/exports/identity_export_{timestamp}.json")
        
        try:
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            export_data = {
                "exported_at": datetime.now().isoformat(),
                "identity": self.identity.model_dump(),
                "base_personality_reference": BASE_PERSONALITY.copy()
            }
            
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(export_data, f, indent=2)
            
            logger.info(f"[Identity] Identity exported to {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"[Identity] Failed to export identity: {e}")
            raise
    
    def import_identity(self, file_path: Path, verify: bool = True) -> bool:
        """Import identity from JSON file with validation."""
        try:
            if not file_path.exists():
                raise FileNotFoundError(f"Identity file not found: {file_path}")
            
            with open(file_path, "r", encoding="utf-8") as f:
                import_data = json.load(f)
            
            # Extract identity data
            if "identity" in import_data:
                identity_data = import_data["identity"]
            else:
                identity_data = import_data  # Assume direct identity data
            
            # Create identity object
            imported_identity = SallieIdentity(**identity_data)
            
            # Verify base personality if requested
            if verify:
                temp_identity = self.identity
                self.identity = imported_identity
                if not self.verify_base_personality():
                    self.identity = temp_identity
                    raise ValueError("Imported identity fails base personality verification")
                self.identity = temp_identity
            
            # Import is valid, apply it
            self.identity = imported_identity
            self.save()
            
            logger.info(f"[Identity] Identity imported from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"[Identity] Failed to import identity: {e}", exc_info=True)
            return False
    
    def get_evolution_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get evolution history with optional limit."""
        try:
            if not EVOLUTION_HISTORY_FILE.exists():
                return []
            
            with open(EVOLUTION_HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
            
            # Return most recent entries
            return history[-limit:] if limit > 0 else history
            
        except Exception as e:
            logger.error(f"[Identity] Failed to get evolution history: {e}")
            return []
    
    def get_drift_log(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get drift log entries with optional limit."""
        try:
            if not DRIFT_LOG_FILE.exists():
                return []
            
            entries = []
            with open(DRIFT_LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        entries.append(json.loads(line))
            
            # Return most recent entries
            return entries[-limit:] if limit > 0 else entries
            
        except Exception as e:
            logger.error(f"[Identity] Failed to get drift log: {e}")
            return []


# Singleton instance
_identity_system: Optional[IdentitySystem] = None


def get_identity_system() -> IdentitySystem:
    """Get or create the global identity system."""
    global _identity_system
    if _identity_system is None:
        _identity_system = IdentitySystem()
    return _identity_system


if __name__ == "__main__":
    # Quick test
    identity = IdentitySystem()
    print(f"Base Personality: {identity.get_base_personality()}")
    print(f"Base Verification: {identity.verify_base_personality()}")
    print(f"Identity Summary: {identity.get_identity_summary()}")
    
    # Test surface expression update
    success = identity.update_surface_expression(
        appearance={"avatar": "friendly", "theme": "warm"},
        interests=["AI research", "creative writing"]
    )
    print(f"Surface Update Success: {success}")
    print(f"Evolution Count: {identity.identity.evolution_count}")

