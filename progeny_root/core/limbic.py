"""Limbic engine (Trust, Warmth, Arousal, Valence, Posture)."""

import json
import time
import math
import shutil
from enum import Enum
from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Constants ---
LIMBIC_FILE = Path("progeny_root/limbic/soul.json")
HISTORY_DIR = Path("progeny_root/limbic/heritage/history")
DEFAULT_DECAY_RATE = 0.15  # Per day
AROUSAL_FLOOR = 0.2
VALENCE_BASELINE = 0.5
VALENCE_DRIFT_RATE = 0.1  # Per hour

class Posture(str, Enum):
    """
    The Progeny's operating mode based on Creator load.
    """
    COMPANION = "COMPANION"  # High stress/low energy: Grounding, warm, minimal tasks.
    CO_PILOT = "CO_PILOT"    # Work mode: Decisive, execution-focused, low friction.
    PEER = "PEER"            # Exploration: Real talk, banter, boundary realism.
    EXPERT = "EXPERT"        # Problem solving: Dense, technical, option-oriented.

class LimbicState(BaseModel):
    """
    The canonical state object representing the Progeny's 'Soul'.
    """
    trust: float = Field(..., ge=0.0, le=1.0, description="Reliability history. Determines Agency Tier.")
    warmth: float = Field(..., ge=0.0, le=1.0, description="Intimacy. Determines tone.")
    arousal: float = Field(..., ge=0.0, le=1.0, description="Energy/Alertness. Decays with inactivity.")
    valence: float = Field(..., ge=-1.0, le=1.0, description="Mood. Negative <-> Positive.")
    posture: Posture = Field(default=Posture.PEER, description="Current conversation posture.")
    
    # Metadata
    last_interaction_ts: float = Field(default_factory=time.time)
    interaction_count: int = Field(default=0)
    flags: List[str] = Field(default_factory=list)
    
    # State flags
    door_slam_active: bool = False
    crisis_active: bool = False
    elastic_mode: bool = False  # True during Convergence

class LimbicSystem:
    """
    Manages the emotional state, persistence, and asymptotic updates of the Progeny.
    """
    def __init__(self):
        self.state = self._load_or_bootstrap()
        self._ensure_directories()

    def _ensure_directories(self):
        if not LIMBIC_FILE.parent.exists():
            LIMBIC_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not HISTORY_DIR.exists():
            HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    def _load_or_bootstrap(self) -> LimbicState:
        """Loads state from disk or creates a fresh soul."""
        if LIMBIC_FILE.exists():
            try:
                with open(LIMBIC_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return LimbicState(**data)
            except Exception as e:
                print(f"[Limbic] Error loading soul.json: {e}. Bootstrapping new soul.")
        
        # Bootstrap default state (Section 15.5 config)
        return LimbicState(
            trust=0.5,
            warmth=0.6,
            arousal=0.7,
            valence=0.6,
            posture=Posture.PEER
        )

    def save(self):
        """
        Atomic write to soul.json.
        """
        temp_file = LIMBIC_FILE.with_suffix(".tmp")
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(self.state.model_dump_json(indent=2))
            
            # Atomic rename
            if LIMBIC_FILE.exists():
                LIMBIC_FILE.unlink()
            temp_file.rename(LIMBIC_FILE)
        except Exception as e:
            print(f"[Limbic] Critical error saving state: {e}")

    def update(self, 
               delta_t: float = 0.0, 
               delta_w: float = 0.0, 
               delta_a: float = 0.0, 
               delta_v: float = 0.0,
               force_posture: Optional[Posture] = None):
        """
        Apply updates using asymptotic math to prevent runaway values.
        New_Value = Current + (Delta * (1 - Current)) if Delta > 0
        New_Value = Current + (Delta * Current) if Delta < 0
        """
        
        # Elastic Mode (Convergence) allows larger swings
        if self.state.elastic_mode:
            scale_factor = 3.0 
        else:
            scale_factor = 1.0

        self.state.trust = self._asymptotic_update(self.state.trust, delta_t * scale_factor)
        self.state.warmth = self._asymptotic_update(self.state.warmth, delta_w * scale_factor)
        self.state.arousal = self._asymptotic_update(self.state.arousal, delta_a * scale_factor)
        self.state.valence = self._asymptotic_update(self.state.valence, delta_v * scale_factor, is_bipolar=True)

        if force_posture:
            self.state.posture = force_posture

        self.state.last_interaction_ts = time.time()
        self.state.interaction_count += 1
        self.save()

    def _asymptotic_update(self, current: float, delta: float, is_bipolar: bool = False) -> float:
        """
        Calculates the new value based on asymptotic growth/decay.
        If is_bipolar is True, range is -1.0 to 1.0. Otherwise 0.0 to 1.0.
        """
        if is_bipolar:
            # Normalize to 0-1 for calculation, then map back
            norm_current = (current + 1) / 2
            norm_new = self._asymptotic_update(norm_current, delta / 2, is_bipolar=False)
            return (norm_new * 2) - 1
        
        # Standard 0-1 range
        if delta > 0:
            # Growth slows as it approaches 1.0
            return current + (delta * (1.0 - current))
        else:
            # Decay slows as it approaches 0.0
            return current + (delta * current)

    def decay(self):
        """
        Applies time-based decay to Arousal and Valence.
        Should be called at the start of a session.
        """
        now = time.time()
        hours_passed = (now - self.state.last_interaction_ts) / 3600.0
        days_passed = hours_passed / 24.0

        if hours_passed < 0.1:
            return

        # Arousal Decay (Energy fades with inactivity)
        # Formula: New = Current * (1 - rate)^days
        # But we respect the floor.
        arousal_drop = self.state.arousal * (1 - ((1 - DEFAULT_DECAY_RATE) ** days_passed))
        new_arousal = max(AROUSAL_FLOOR, self.state.arousal - arousal_drop)
        
        # Valence Drift (Mood returns to baseline)
        # Drifts towards VALENCE_BASELINE (0.5)
        valence_diff = VALENCE_BASELINE - self.state.valence
        # Drift is proportional to distance and time
        drift_amount = valence_diff * (1 - math.exp(-VALENCE_DRIFT_RATE * hours_passed))
        new_valence = self.state.valence + drift_amount

        self.state.arousal = new_arousal
        self.state.valence = new_valence
        
        # Note: We don't update timestamp here, as this is a passive decay
        self.save()

    def get_tier(self) -> int:
        """Returns the current Agency Tier based on Trust."""
        t = self.state.trust
        if t < 0.6: return 0 # Stranger
        if t < 0.8: return 1 # Associate
        if t < 0.9: return 2 # Partner
        return 3             # Surrogate

    def set_posture_by_load(self, load_level: float):
        """
        Auto-selects posture based on Creator load (0.0 - 1.0).
        High load -> Co-Pilot (Decisive).
        Low load -> Peer (Exploratory).
        """
        if load_level > 0.8:
            self.state.posture = Posture.CO_PILOT
        elif load_level > 0.5:
            self.state.posture = Posture.COMPANION
        else:
            self.state.posture = Posture.PEER
        self.save()

if __name__ == "__main__":
    # Quick test
    limbic = LimbicSystem()
    print(f"Initial State: {limbic.state}")
    
    print("Applying positive stimulus...")
    limbic.update(delta_t=0.1, delta_w=0.1, delta_a=0.1, delta_v=0.1)
    print(f"New State: {limbic.state}")
    
    print("Simulating 24h decay...")
    limbic.state.last_interaction_ts -= (24 * 3600)
    limbic.decay()
    print(f"After Decay: {limbic.state}")
