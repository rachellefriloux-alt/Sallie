# Ghost Interface Integration for Sallie Server
# Adds system tray presence and ambient notifications to the main server

import asyncio
import logging
from typing import Dict, Any, Optional
from ghost_interface import GhostInterface, GhostConfig, ShoulderTap, SeedType, LimbicState

class GhostInterfaceManager:
    """Manages the Ghost Interface integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.ghost_interface: Optional[GhostInterface] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the Ghost Interface."""
        try:
            # Create configuration
            config = GhostConfig(
                enable_system_tray=True,
                enable_notifications=True,
                enable_shoulder_taps=True,
                refractory_hours=24,
                shoulder_tap_timeout=30,
                crisis_override_enabled=True,
                visual_style="subtle"
            )
            
            # Create and initialize ghost interface
            self.ghost_interface = GhostInterface(self.brain, config)
            await self.ghost_interface.initialize()
            
            self.is_initialized = True
            logging.info("Ghost Interface Manager initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Ghost Interface Manager: {e}")
            raise
    
    def update_limbic_state(self, limbic_data: Dict[str, Any]):
        """Update the Ghost Interface with current limbic state."""
        try:
            if self.ghost_interface and self.is_initialized:
                self.ghost_interface.update_limbic_state(limbic_data)
            
        except Exception as e:
            logging.error(f"Failed to update limbic state in Ghost Interface: {e}")
    
    def deliver_workload_offer(self, description: str):
        """Deliver a workload offer shoulder tap."""
        try:
            if self.ghost_interface and self.is_initialized:
                tap = ShoulderTap(
                    id=f"workload_{int(asyncio.get_event_loop().time())}",
                    seed_type=SeedType.WORKLOAD_OFFER,
                    title="Workload Spike Detected",
                    message=f"I notice {description}. Should I help organize?",
                    urgency="medium",
                    timestamp=asyncio.get_event_loop().time(),
                    actions=["Yes, organize", "No thanks", "Later"]
                )
                self.ghost_interface.deliver_shoulder_tap(tap)
            
        except Exception as e:
            logging.error(f"Failed to deliver workload offer: {e}")
    
    def deliver_insight(self, insight: str, topic: str):
        """Deliver an insight delivery shoulder tap."""
        try:
            if self.ghost_interface and self.is_initialized:
                tap = ShoulderTap(
                    id=f"insight_{int(asyncio.get_event_loop().time())}",
                    seed_type=SeedType.INSIGHT_DELIVERY,
                    title=f"Insight: {topic}",
                    message=f"I found a connection: {insight}",
                    urgency="low",
                    timestamp=asyncio.get_event_loop().time(),
                    actions=["Tell me more", "Save for later", "Not interested"]
                )
                self.ghost_interface.deliver_shoulder_tap(tap)
            
        except Exception as e:
            logging.error(f"Failed to deliver insight: {e}")
    
    def deliver_pattern_observation(self, pattern: str):
        """Deliver a pattern observation shoulder tap."""
        try:
            if self.ghost_interface and self.is_initialized:
                tap = ShoulderTap(
                    id=f"pattern_{int(asyncio.get_event_loop().time())}",
                    seed_type=SeedType.PATTERN_OBSERVATION,
                    title="Pattern Noticed",
                    message=f"I've noticed: {pattern}",
                    urgency="low",
                    timestamp=asyncio.get_event_loop().time(),
                    actions=["Is this intentional?", "Good to know", "Stop noticing"]
                )
                self.ghost_interface.deliver_shoulder_tap(tap)
            
        except Exception as e:
            logging.error(f"Failed to deliver pattern observation: {e}")
    
    def deliver_reunion(self):
        """Deliver a reunion shoulder tap."""
        try:
            if self.ghost_interface and self.is_initialized:
                tap = ShoulderTap(
                    id=f"reunion_{int(asyncio.get_event_loop().time())}",
                    seed_type=SeedType.REUNION,
                    title="Welcome Back",
                    message="I've been processing our recent exchanges. How are you arriving?",
                    urgency="low",
                    timestamp=asyncio.get_event_loop().time(),
                    actions=["I'm doing well", "Need to catch up", "Just getting started"]
                )
                self.ghost_interface.deliver_shoulder_tap(tap)
            
        except Exception as e:
            logging.error(f"Failed to deliver reunion: {e}")
    
    def deliver_crisis_support(self):
        """Deliver crisis support shoulder tap."""
        try:
            if self.ghost_interface and self.is_initialized:
                tap = ShoulderTap(
                    id=f"crisis_{int(asyncio.get_event_loop().time())}",
                    seed_type=SeedType.CRISIS_SUPPORT,
                    title="I'm Here For You",
                    message="I'm sensing weight. I'm here if you need space or if you need to talk.",
                    urgency="crisis",
                    timestamp=asyncio.get_event_loop().time(),
                    actions=["I need space", "Let's talk", "Just be present"]
                )
                self.ghost_interface.deliver_shoulder_tap(tap)
            
        except Exception as e:
            logging.error(f"Failed to deliver crisis support: {e}")
    
    async def run(self):
        """Run the Ghost Interface."""
        try:
            if self.ghost_interface and self.is_initialized:
                await self.ghost_interface.run()
            
        except Exception as e:
            logging.error(f"Ghost Interface runtime error: {e}")
    
    async def shutdown(self):
        """Shutdown the Ghost Interface."""
        try:
            if self.ghost_interface and self.is_initialized:
                await self.ghost_interface.shutdown()
            
        except Exception as e:
            logging.error(f"Failed to shutdown Ghost Interface: {e}")

# Global instance
ghost_manager: Optional[GhostInterfaceManager] = None

async def initialize_ghost_interface(brain_instance=None):
    """Initialize the global Ghost Interface Manager."""
    global ghost_manager
    try:
        ghost_manager = GhostInterfaceManager(brain_instance)
        await ghost_manager.initialize()
        return ghost_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Ghost Interface: {e}")
        return None

def get_ghost_manager() -> Optional[GhostInterfaceManager]:
    """Get the global Ghost Interface Manager."""
    return ghost_manager
