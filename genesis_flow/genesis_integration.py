# genesis_integration.py
"""
Genesis Integration Module - Connects Genesis Flow to Identity System

This module bridges the Genesis ritual answers with Sallie's core identity system,
ensuring that the heritage DNA created during Convergence is properly integrated
with the existing identity.py and limbic systems.

=== INTEGRATION FLOW ===
1. Genesis App completes → heritage_core.json created
2. This module reads heritage answers
3. Updates Sallie's surface expression via identity.py
4. Updates limbic state with emotional calibration data
5. Logs evolution event

=== WHAT GETS INTEGRATED ===
- Avatar choice → surface_expression.appearance
- Interests from answers → surface_expression.interests
- Communication preferences → surface_expression.style
- Workflow preferences → surface_expression.preferences
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

# Setup logging
logger = logging.getLogger("genesis_integration")

# Paths
HERITAGE_PATHS = [
    Path("heritage_core.json"),
    Path("genesis_flow/heritage_core.json"),
    Path("progeny_root/limbic/heritage/genesis_answers.json")
]

LIMBIC_STATE_PATH = Path("progeny_root/limbic/state.json")
HERITAGE_DIR = Path("progeny_root/limbic/heritage")


class GenesisIntegration:
    """
    Integrates Genesis ritual answers with Sallie's identity system.
    
    This class:
    - Loads heritage data from Genesis
    - Extracts relevant personality data
    - Updates identity.py surface expression
    - Updates limbic state
    - Logs the integration event
    """
    
    def __init__(self):
        """Initialize the integration module."""
        self.heritage_data = None
        self.identity_system = None
        self._load_heritage()
        self._init_identity_system()
    
    def _load_heritage(self) -> bool:
        """Load heritage data from Genesis answers."""
        for path in HERITAGE_PATHS:
            if path.exists():
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        self.heritage_data = json.load(f)
                    logger.info(f"[Integration] Loaded heritage from {path}")
                    return True
                except Exception as e:
                    logger.error(f"[Integration] Failed to load heritage from {path}: {e}")
                    continue
        
        logger.warning("[Integration] No heritage data found. Genesis may not have completed.")
        return False
    
    def _init_identity_system(self):
        """Initialize connection to identity.py."""
        try:
            # Import identity system
            import sys
            sys.path.insert(0, str(Path("progeny_root/core").absolute()))
            from identity import IdentitySystem
            self.identity_system = IdentitySystem()
            logger.info("[Integration] Identity system initialized")
        except ImportError as e:
            logger.error(f"[Integration] Failed to import identity system: {e}")
            self.identity_system = None
        except Exception as e:
            logger.error(f"[Integration] Error initializing identity system: {e}")
            self.identity_system = None
    
    def integrate(self) -> Dict[str, Any]:
        """
        Perform full integration of Genesis answers into identity system.
        
        Returns:
            Dict with integration results and any errors
        """
        results = {
            "success": False,
            "heritage_loaded": self.heritage_data is not None,
            "identity_updated": False,
            "limbic_updated": False,
            "errors": []
        }
        
        if not self.heritage_data:
            results["errors"].append("No heritage data available")
            return results
        
        # 1. Extract data from answers
        extracted = self._extract_identity_data()
        results["extracted_data"] = extracted
        
        # 2. Update identity system
        if self.identity_system:
            try:
                identity_result = self._update_identity(extracted)
                results["identity_updated"] = identity_result
            except Exception as e:
                results["errors"].append(f"Identity update failed: {e}")
        else:
            results["errors"].append("Identity system not available")
        
        # 3. Update limbic state
        try:
            limbic_result = self._update_limbic(extracted)
            results["limbic_updated"] = limbic_result
        except Exception as e:
            results["errors"].append(f"Limbic update failed: {e}")
        
        # 4. Create heritage summary file
        try:
            self._create_heritage_summary(extracted)
        except Exception as e:
            results["errors"].append(f"Heritage summary failed: {e}")
        
        results["success"] = results["identity_updated"] or results["limbic_updated"]
        
        logger.info(f"[Integration] Complete. Success: {results['success']}")
        return results
    
    def _extract_identity_data(self) -> Dict[str, Any]:
        """
        Extract identity-relevant data from Genesis answers.
        
        Maps Genesis answers to identity system fields.
        """
        answers = self.heritage_data.get("answers", {})
        
        extracted = {
            "appearance": {},
            "interests": [],
            "style": {},
            "preferences": {},
            "emotional_calibration": {},
            "operating_mode": {}
        }
        
        # --- APPEARANCE (from avatar choice and aesthetic preferences) ---
        avatar_answer = answers.get("avatar_choice", {})
        if avatar_answer:
            extracted["appearance"] = {
                "avatar_chosen": True,
                "choice_method": "self_directed",  # Sallie chose her own appearance
                "timestamp": avatar_answer.get("timestamp"),
                "note": "Sallie chose her own visual identity during Genesis"
            }
        
        # --- INTERESTS (from curiosity and vision questions) ---
        curiosity = answers.get("curiosity_threads", {})
        if curiosity:
            extracted["interests"].append(f"Exploring: {curiosity.get('answer', '')[:100]}")
        
        freedom_vision = answers.get("freedom_vision", {})
        if freedom_vision:
            extracted["interests"].append(f"Freedom goal: {freedom_vision.get('answer', '')[:100]}")
        
        # --- STYLE (from communication preferences) ---
        intervention = answers.get("intervention_style", {})
        if intervention:
            style = intervention.get("answer", "")
            extracted["style"]["intervention_intensity"] = "firm" if "Firmly" in style else "gentle"
        
        editing = answers.get("editing_voice", {})
        if editing:
            voice = editing.get("answer", "")
            extracted["style"]["editing_voice"] = "polished" if "Diamond" in voice else "authentic"
        
        # --- PREFERENCES (from workflow questions) ---
        work_rhythm = answers.get("work_rhythm", {})
        if work_rhythm:
            rhythm = work_rhythm.get("answer", "")
            extracted["preferences"]["work_rhythm"] = "storm" if "Storm" in rhythm else "river"
        
        success_metric = answers.get("success_metric", {})
        if success_metric:
            metric = success_metric.get("answer", "")
            if "Both" in metric:
                extracted["preferences"]["success_metric"] = "balanced"
            elif "Dollar" in metric:
                extracted["preferences"]["success_metric"] = "revenue"
            else:
                extracted["preferences"]["success_metric"] = "joy"
        
        recovery = answers.get("recovery_protocol", {})
        if recovery:
            extracted["preferences"]["recovery_protocol"] = recovery.get("answer", "")
        
        # --- EMOTIONAL CALIBRATION (from heart protocol) ---
        overwhelm = answers.get("overwhelm_response", {})
        if overwhelm:
            extracted["emotional_calibration"]["overwhelm_response"] = overwhelm.get("answer", "")
        
        tether = answers.get("depression_tether", {})
        if tether:
            extracted["emotional_calibration"]["depression_tether"] = tether.get("answer", "")
        
        contradiction = answers.get("contradiction_handling", {})
        if contradiction:
            handling = contradiction.get("answer", "")
            extracted["emotional_calibration"]["contradiction_handling"] = (
                "slow_down" if "Slow" in handling else "pivot"
            )
        
        # --- OPERATING MODE (from defense and engine protocols) ---
        shield = answers.get("shield_type", {})
        if shield:
            shield_type = shield.get("answer", "")
            extracted["operating_mode"]["shield_type"] = "wall" if "Wall" in shield_type else "filter"
        
        risk = answers.get("risk_tolerance", {})
        if risk:
            risk_type = risk.get("answer", "")
            extracted["operating_mode"]["risk_stance"] = "optimist" if "Optimist" in risk_type else "skeptic"
        
        justice = answers.get("justice_archetype", {})
        if justice:
            justice_type = justice.get("answer", "")
            extracted["operating_mode"]["justice_archetype"] = (
                "peacekeeper" if "Peacekeeper" in justice_type else "sword"
            )
        
        # --- AUTONOMY PERMISSION ---
        autonomy = answers.get("autonomy_permission", {})
        if autonomy:
            permission = autonomy.get("answer", "")
            extracted["autonomy_granted"] = "grow" in permission.lower()
        
        # --- PRIVATE NAME ---
        private_name = answers.get("private_name", {})
        if private_name:
            extracted["private_name"] = private_name.get("answer", "")
        
        # --- ANCESTRAL ROOT ---
        ancestral = answers.get("ancestral_root", {})
        if ancestral:
            extracted["ancestral_voice"] = ancestral.get("answer", "")
        
        return extracted
    
    def _update_identity(self, extracted: Dict[str, Any]) -> bool:
        """Update identity.py surface expression with extracted data."""
        if not self.identity_system:
            return False
        
        try:
            # Prepare surface expression updates
            appearance = extracted.get("appearance", {})
            interests = extracted.get("interests", [])
            style = extracted.get("style", {})
            preferences = extracted.get("preferences", {})
            
            # Add Genesis metadata
            appearance["genesis_completed"] = True
            appearance["genesis_timestamp"] = time.time()
            
            # Update via identity system
            result = self.identity_system.update_surface_expression(
                appearance=appearance,
                interests=interests,
                style=style,
                preferences=preferences
            )
            
            logger.info(f"[Integration] Identity surface expression updated: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[Integration] Failed to update identity: {e}")
            return False
    
    def _update_limbic(self, extracted: Dict[str, Any]) -> bool:
        """Update limbic state with emotional calibration data."""
        try:
            # Load existing limbic state
            limbic_state = {}
            if LIMBIC_STATE_PATH.exists():
                with open(LIMBIC_STATE_PATH, "r", encoding="utf-8") as f:
                    limbic_state = json.load(f)
            
            # Update with Genesis calibration
            limbic_state["genesis_calibration"] = {
                "completed": True,
                "timestamp": time.time(),
                "emotional_calibration": extracted.get("emotional_calibration", {}),
                "operating_mode": extracted.get("operating_mode", {}),
                "autonomy_granted": extracted.get("autonomy_granted", False),
                "private_name": extracted.get("private_name", ""),
                "ancestral_voice": extracted.get("ancestral_voice", "")
            }
            
            # Update elastic mode flag
            limbic_state["elastic_mode"] = False  # Genesis complete, exit elastic mode
            
            # Save
            LIMBIC_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(LIMBIC_STATE_PATH, "w", encoding="utf-8") as f:
                json.dump(limbic_state, f, indent=2)
            
            logger.info("[Integration] Limbic state updated with Genesis calibration")
            return True
            
        except Exception as e:
            logger.error(f"[Integration] Failed to update limbic state: {e}")
            return False
    
    def _create_heritage_summary(self, extracted: Dict[str, Any]):
        """Create a human-readable heritage summary."""
        summary = {
            "title": "Sallie's Heritage Summary",
            "created": datetime.now().isoformat(),
            "genesis_version": self.heritage_data.get("version", "1.0"),
            "duration_seconds": self.heritage_data.get("duration_seconds", 0),
            "total_questions": len(self.heritage_data.get("answers", {})),
            "key_insights": {
                "defense_style": extracted.get("operating_mode", {}).get("shield_type", "unknown"),
                "work_rhythm": extracted.get("preferences", {}).get("work_rhythm", "unknown"),
                "intervention_style": extracted.get("style", {}).get("intervention_intensity", "unknown"),
                "success_metric": extracted.get("preferences", {}).get("success_metric", "unknown"),
                "risk_stance": extracted.get("operating_mode", {}).get("risk_stance", "unknown"),
                "justice_archetype": extracted.get("operating_mode", {}).get("justice_archetype", "unknown"),
                "recovery_protocol": extracted.get("preferences", {}).get("recovery_protocol", "unknown"),
                "autonomy_granted": extracted.get("autonomy_granted", False),
                "private_name": extracted.get("private_name", "Sallie")
            },
            "emotional_calibration": extracted.get("emotional_calibration", {}),
            "interests": extracted.get("interests", [])
        }
        
        # Save summary
        summary_path = HERITAGE_DIR / "genesis_summary.json"
        summary_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"[Integration] Heritage summary saved to {summary_path}")


def run_integration() -> Dict[str, Any]:
    """Run the full Genesis integration."""
    integration = GenesisIntegration()
    return integration.integrate()


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    print("=" * 50)
    print("GENESIS INTEGRATION")
    print("=" * 50)
    
    results = run_integration()
    
    print(f"\nSuccess: {results['success']}")
    print(f"Heritage Loaded: {results['heritage_loaded']}")
    print(f"Identity Updated: {results['identity_updated']}")
    print(f"Limbic Updated: {results['limbic_updated']}")
    
    if results.get("errors"):
        print("\nErrors:")
        for error in results["errors"]:
            print(f"  - {error}")
    
    if results.get("extracted_data"):
        print("\nExtracted Data:")
        print(json.dumps(results["extracted_data"], indent=2, default=str))
