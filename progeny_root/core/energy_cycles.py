"""
Energy Cycles System for Sallie
Manages energy levels and cycles
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

logger = logging.getLogger("energy_cycles")

class EnergyState(BaseModel):
    """Energy state"""
    level: float = 0.5
    trend: str = "stable"
    last_updated: datetime = datetime.now()
    cycles_completed: int = 0

class EnergyCyclesSystem:
    """Mock Energy Cycles System"""
    
    def __init__(self):
        self.state = EnergyState()
        self.cycle_history = []
        
    def get_current_energy(self) -> float:
        """Get current energy level"""
        return self.state.level
    
    def update_energy(self, delta: float, reason: str = ""):
        """Update energy level"""
        old_level = self.state.level
        self.state.level = max(0.0, min(1.0, self.state.level + delta))
        self.state.last_updated = datetime.now()
        
        # Update trend
        if delta > 0.1:
            self.state.trend = "rising"
        elif delta < -0.1:
            self.state.trend = "falling"
        else:
            self.state.trend = "stable"
        
        logger.info(f"[Energy] Level: {old_level:.2f} -> {self.state.level:.2f} ({reason})")
    
    def simulate_cycle(self, hours: float = 1.0) -> Dict[str, Any]:
        """Simulate energy cycle over time"""
        # Simple sinusoidal energy pattern
        import math
        time_factor = hours / 24.0  # Convert to fraction of day
        energy = 0.5 + 0.3 * math.sin(2 * math.pi * time_factor)
        
        self.state.level = max(0.1, min(0.9, energy))
        self.state.last_updated = datetime.now()
        
        return {
            "energy_level": self.state.level,
            "trend": self.state.trend,
            "phase": "active" if self.state.level > 0.5 else "resting"
        }
    
    def get_energy_report(self) -> Dict[str, Any]:
        """Get comprehensive energy report"""
        return {
            "current_level": self.state.level,
            "trend": self.state.trend,
            "last_updated": self.state.last_updated.isoformat(),
            "cycles_completed": self.state.cycles_completed,
            "status": "high" if self.state.level > 0.7 else "medium" if self.state.level > 0.3 else "low"
        }
