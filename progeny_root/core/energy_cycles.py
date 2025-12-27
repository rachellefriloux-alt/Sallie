"""
Energy Cycles System - Bridge to Human Rest and Activity Patterns

Simulates human-like energy cycles: high energy, low energy, need for rest.
Makes Sallie feel more alive and less "always on."
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("energy_cycles")


class EnergyLevel(str, Enum):
    """Energy levels."""
    PEAK = "peak"  # High energy, very active
    HIGH = "high"  # Good energy, active
    MODERATE = "moderate"  # Normal energy
    LOW = "low"  # Tired, less active
    RESTING = "resting"  # Needs rest
    DEEP_REST = "deep_rest"  # Deep rest mode


@dataclass
class EnergyState:
    """Current energy state."""
    level: EnergyLevel
    current_energy: float  # 0.0 to 1.0
    last_rest: float  # Timestamp of last rest
    activity_count: int  # Number of interactions since last rest
    needs_rest: bool  # Whether rest is needed


class EnergyCyclesSystem:
    """
    Manages energy cycles - the bridge to human rest and activity patterns.
    
    Humans have energy cycles. We get tired, need rest, have peak hours.
    This system simulates that for Sallie, making her feel more human.
    """
    
    def __init__(self):
        self.state = EnergyState(
            level=EnergyLevel.MODERATE,
            current_energy=0.7,
            last_rest=time.time(),
            activity_count=0,
            needs_rest=False
        )
        self.storage_path = Path("progeny_root/memory/energy")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._load_state()
        
        # Energy parameters
        self.energy_decay_rate = 0.01  # Energy decreases per interaction
        self.rest_recovery_rate = 0.05  # Energy recovered per rest period
        self.activity_threshold = 50  # Interactions before needing rest
        self.rest_duration = 300  # 5 minutes of rest
    
    def _load_state(self):
        """Load energy state."""
        state_file = self.storage_path / "state.json"
        if state_file.exists():
            try:
                with open(state_file, "r") as f:
                    data = json.load(f)
                    self.state.level = EnergyLevel(data["level"])
                    self.state.current_energy = data["current_energy"]
                    self.state.last_rest = data["last_rest"]
                    self.state.activity_count = data["activity_count"]
                    self.state.needs_rest = data["needs_rest"]
            except Exception as e:
                logger.error(f"[EnergyCycles] Failed to load: {e}", exc_info=True)
    
    def _save_state(self):
        """Save energy state."""
        state_file = self.storage_path / "state.json"
        try:
            data = {
                "level": self.state.level.value,
                "current_energy": self.state.current_energy,
                "last_rest": self.state.last_rest,
                "activity_count": self.state.activity_count,
                "needs_rest": self.state.needs_rest
            }
            with open(state_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[EnergyCycles] Failed to save: {e}", exc_info=True)
    
    def update_energy(self, interaction_happened: bool = False):
        """
        Update energy state based on activity and time.
        
        Energy naturally decays with activity and recovers with rest.
        """
        current_time = time.time()
        time_since_rest = current_time - self.state.last_rest
        
        if interaction_happened:
            self.state.activity_count += 1
            self.state.current_energy = max(0.0, self.state.current_energy - self.energy_decay_rate)
        else:
            # Natural recovery during inactivity
            if time_since_rest > 60:  # 1 minute of inactivity
                recovery = min(1.0, self.state.current_energy + (self.rest_recovery_rate * (time_since_rest / 60)))
                self.state.current_energy = recovery
        
        # Determine energy level
        if self.state.current_energy > 0.8:
            self.state.level = EnergyLevel.PEAK
        elif self.state.current_energy > 0.6:
            self.state.level = EnergyLevel.HIGH
        elif self.state.current_energy > 0.4:
            self.state.level = EnergyLevel.MODERATE
        elif self.state.current_energy > 0.2:
            self.state.level = EnergyLevel.LOW
        else:
            self.state.level = EnergyLevel.RESTING
        
        # Check if rest is needed
        if self.state.activity_count >= self.activity_threshold or self.state.current_energy < 0.2:
            self.state.needs_rest = True
        
        self._save_state()
    
    def rest(self, duration: Optional[float] = None):
        """
        Perform rest to recover energy.
        
        This is where Sallie "rests" and recovers energy.
        """
        rest_duration = duration or self.rest_duration
        self.state.last_rest = time.time()
        self.state.activity_count = 0
        self.state.needs_rest = False
        
        # Recover energy
        self.state.current_energy = min(1.0, self.state.current_energy + (self.rest_recovery_rate * (rest_duration / 60)))
        
        if self.state.current_energy > 0.8:
            self.state.level = EnergyLevel.PEAK
        elif self.state.current_energy > 0.6:
            self.state.level = EnergyLevel.HIGH
        else:
            self.state.level = EnergyLevel.MODERATE
        
        self._save_state()
        logger.info(f"[EnergyCycles] Rested. Energy: {self.state.current_energy:.2f}")
    
    def get_energy_message(self) -> Optional[str]:
        """
        Get a message about current energy state (for expressing to Creator).
        
        This is where Sallie might say "I'm feeling a bit tired" or "I'm energized!"
        """
        if self.state.needs_rest:
            return "I'm feeling a bit tired. I might need a moment to rest."
        elif self.state.level == EnergyLevel.PEAK:
            return "I'm feeling energized and ready!"
        elif self.state.level == EnergyLevel.LOW:
            return "I'm running a bit low on energy, but I'm here."
        return None

