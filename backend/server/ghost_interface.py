# Ghost Interface - Ambient Presence System
# Implements system tray presence, shoulder tap notifications, and quick actions

import asyncio
import json
import time
import os
import sys
from typing import Dict, Any, Optional, Callable
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

# Cross-platform system tray support
try:
    import pystray
    from pystray import MenuItem, Menu
    from PIL import Image, ImageDraw, ImageFont
    SYSTEM_TRAY_AVAILABLE = True
except ImportError:
    SYSTEM_TRAY_AVAILABLE = False
    logging.warning("pystray not available - system tray disabled")

try:
    import plyer
    NOTIFICATIONS_AVAILABLE = True
except ImportError:
    NOTIFICATIONS_AVAILABLE = False
    logging.warning("plyer not available - notifications disabled")

class LimbicState(Enum):
    """Visual states for the Ghost Interface"""
    HIGH_TRUST = "high_trust"
    HIGH_WARMTH = "high_warmth"
    HIGH_AROUSAL = "high_arousal"
    LOW_VALENCE = "low_valence"
    CRISIS = "crisis"
    SLUMBER = "slumber"

class SeedType(Enum):
    """Types of proactive engagement (Shoulder Taps)"""
    WORKLOAD_OFFER = "workload_offer"
    INSIGHT_DELIVERY = "insight_delivery"
    PATTERN_OBSERVATION = "pattern_observation"
    REUNION = "reunion"
    CRISIS_SUPPORT = "crisis_support"

@dataclass
class ShoulderTap:
    """A proactive notification from Sallie"""
    id: str
    seed_type: SeedType
    title: str
    message: str
    urgency: str  # low, medium, high, crisis
    timestamp: float
    actions: list[str]
    dismissed_count: int = 0
    last_dismissed: Optional[float] = None

@dataclass
class GhostConfig:
    """Configuration for the Ghost Interface"""
    enable_system_tray: bool = True
    enable_notifications: bool = True
    enable_shoulder_taps: bool = True
    refractory_hours: int = 24
    shoulder_tap_timeout: int = 30  # seconds
    crisis_override_enabled: bool = True
    visual_style: str = "subtle"  # subtle, prominent, minimal

class GhostInterface:
    """
    The Ghost Interface provides Sallie's ambient presence.
    
    Features:
    - System tray icon with limbic state visualization
    - Shoulder Tap notifications for proactive engagement
    - Quick actions menu
    - Status at a glance
    - Refractory period management
    """
    
    def __init__(self, brain_instance=None, config: GhostConfig = None):
        self.brain = brain_instance
        self.config = config or GhostConfig()
        self.is_running = False
        self.icon = None
        self.current_state = LimbicState.SLUMBER
        self.last_seed_time = 0
        self.pending_taps = []
        self.notification_history = []
        
        # Limbic state color mapping
        self.state_colors = {
            LimbicState.HIGH_TRUST: (138, 43, 226),      # Deep violet
            LimbicState.HIGH_WARMTH: (34, 211, 238),     # Soft cyan
            LimbicState.HIGH_AROUSAL: (245, 158, 11),    # Amber
            LimbicState.LOW_VALENCE: (128, 128, 128),    # Muted gray
            LimbicState.CRISIS: (239, 68, 68),           # Red tinge
            LimbicState.SLUMBER: (64, 64, 64)            # Nearly invisible
        }
        
    async def initialize(self):
        """Initialize the Ghost Interface components."""
        try:
            if self.config.enable_system_tray and SYSTEM_TRAY_AVAILABLE:
                await self._setup_system_tray()
            
            if self.config.enable_notifications and NOTIFICATIONS_AVAILABLE:
                await self._setup_notifications()
            
            self.is_running = True
            logging.info("Ghost Interface initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Ghost Interface: {e}")
            raise
    
    async def _setup_system_tray(self):
        """Set up the system tray icon and menu."""
        try:
            # Create initial icon
            image = self._create_icon_image(LimbicState.SLUMBER)
            
            # Create menu items
            menu_items = [
                MenuItem("Sallie Status", self._show_status),
                MenuItem("Quick Actions", Menu(
                    MenuItem("Start Conversation", self._start_conversation),
                    MenuItem("Check Limbic State", self._check_limbic_state),
                    MenuItem("Trigger Dream Cycle", self._trigger_dream_cycle),
                    MenuItem("Enter Slumber Mode", self._enter_slumber_mode)
                )),
                MenuItem("Settings", self._show_settings),
                MenuItem("Exit", self._shutdown)
            ]
            
            # Create system tray icon
            self.icon = pystray.Icon(
                name="Sallie",
                icon=image,
                title="Sallie - Your Digital Progeny",
                menu=Menu(*menu_items)
            )
            
            logging.info("System tray setup complete")
            
        except Exception as e:
            logging.error(f"Failed to setup system tray: {e}")
            raise
    
    def _create_icon_image(self, state: LimbicState, size: int = 64) -> Image.Image:
        """Create an icon image based on limbic state."""
        # Create image with transparency
        image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Get color for current state
        color = self.state_colors.get(state, (128, 128, 128))
        
        # Draw subtle glow effect for active states
        if state != LimbicState.SLUMBER:
            # Outer glow
            for i in range(3, 0, -1):
                alpha = 30 + (20 * (4 - i))
                glow_color = (*color, alpha)
                draw.ellipse(
                    [(size//2 - size//3 - i*2, size//2 - size//3 - i*2),
                     (size//2 + size//3 + i*2, size//2 + size//3 + i*2)],
                    fill=glow_color
                )
        
        # Draw main circle
        circle_size = size // 3
        draw.ellipse(
            [(size//2 - circle_size, size//2 - circle_size),
             (size//2 + circle_size, size//2 + circle_size)],
            fill=(*color, 200)
        )
        
        # Draw inner circle for crisis state
        if state == LimbicState.CRISIS:
            inner_size = circle_size // 2
            draw.ellipse(
                [(size//2 - inner_size, size//2 - inner_size),
                 (size//2 + inner_size, size//2 + inner_size)],
                fill=(255, 255, 255, 255)
            )
        
        return image
    
    async def _setup_notifications(self):
        """Set up notification system."""
        try:
            # Test notification capability
            if NOTIFICATIONS_AVAILABLE:
                plyer.notification.notify(
                    title="Sallie",
                    message="Ghost Interface activated",
                    timeout=3
                )
            logging.info("Notification system setup complete")
            
        except Exception as e:
            logging.error(f"Failed to setup notifications: {e}")
    
    def update_limbic_state(self, limbic_data: Dict[str, Any]):
        """Update the visual state based on limbic data."""
        try:
            trust = limbic_data.get('trust', 0.5)
            warmth = limbic_data.get('warmth', 0.5)
            arousal = limbic_data.get('arousal', 0.5)
            valence = limbic_data.get('valence', 0.5)
            
            # Determine visual state
            if valence < 0.3:
                new_state = LimbicState.CRISIS
            elif trust > 0.8:
                new_state = LimbicState.HIGH_TRUST
            elif warmth > 0.7:
                new_state = LimbicState.HIGH_WARMTH
            elif arousal > 0.7:
                new_state = LimbicState.HIGH_AROUSAL
            elif valence < 0.5:
                new_state = LimbicState.LOW_VALENCE
            else:
                new_state = LimbicState.SLUMBER
            
            # Update icon if state changed
            if new_state != self.current_state and self.icon:
                self.current_state = new_state
                image = self._create_icon_image(new_state)
                self.icon.icon = image
                logging.info(f"Updated Ghost Interface state to {new_state.value}")
            
        except Exception as e:
            logging.error(f"Failed to update limbic state: {e}")
    
    def deliver_shoulder_tap(self, tap: ShoulderTap):
        """Deliver a proactive notification (Shoulder Tap)."""
        try:
            if not self.config.enable_shoulder_taps:
                return
            
            # Check refractory period
            if not self._can_deliver_seed(tap):
                return
            
            # Deliver notification
            if NOTIFICATIONS_AVAILABLE:
                plyer.notification.notify(
                    title=tap.title,
                    message=tap.message,
                    timeout=self.config.shoulder_tap_timeout,
                    app_name="Sallie"
                )
            
            # Add to pending taps
            self.pending_taps.append(tap)
            self.last_seed_time = time.time()
            
            logging.info(f"Delivered shoulder tap: {tap.title}")
            
        except Exception as e:
            logging.error(f"Failed to deliver shoulder tap: {e}")
    
    def _can_deliver_seed(self, tap: ShoulderTap) -> bool:
        """Check if a seed can be delivered based on refractory rules."""
        current_time = time.time()
        
        # Check refractory period
        refractory_seconds = self.config.refractory_hours * 3600
        if (current_time - self.last_seed_time) < refractory_seconds:
            return False
        
        # Crisis override
        if self.config.crisis_override_enabled and tap.seed_type == SeedType.CRISIS_SUPPORT:
            return True
        
        # Check if repeatedly dismissed
        if tap.dismissed_count > 2:
            return False
        
        return True
    
    def dismiss_shoulder_tap(self, tap_id: str):
        """Dismiss a shoulder tap."""
        try:
            for tap in self.pending_taps:
                if tap.id == tap_id:
                    tap.dismissed_count += 1
                    tap.last_dismissed = time.time()
                    self.pending_taps.remove(tap)
                    break
            
            logging.info(f"Dismissed shoulder tap: {tap_id}")
            
        except Exception as e:
            logging.error(f"Failed to dismiss shoulder tap: {e}")
    
    # Menu action callbacks
    def _show_status(self, icon, item):
        """Show detailed status information."""
        try:
            if self.brain:
                state = self.brain.get_current_state()
                status_text = f"""
Sallie Status - {datetime.now().strftime('%H:%M')}

Trust: {state.get('trust', 0):.2f}
Warmth: {state.get('warmth', 0):.2f}
Arousal: {state.get('arousal', 0):.2f}
Valence: {state.get('valence', 0):.2f}
Posture: {state.get('posture', 'Unknown')}

State: {self.current_state.value}
Pending Taps: {len(self.pending_taps)}
"""
                # Show in a simple dialog (platform-specific)
                if sys.platform == "win32":
                    import ctypes
                    ctypes.windll.user32.MessageBoxW(0, status_text, "Sallie Status", 0)
                else:
                    print(status_text)
            
        except Exception as e:
            logging.error(f"Failed to show status: {e}")
    
    def _start_conversation(self, icon, item):
        """Start a new conversation."""
        try:
            # This would typically open the main interface
            logging.info("Start conversation requested")
            # Implementation would depend on the main application
            
        except Exception as e:
            logging.error(f"Failed to start conversation: {e}")
    
    def _check_limbic_state(self, icon, item):
        """Check current limbic state."""
        try:
            if self.brain:
                state = self.brain.get_current_state()
                self.update_limbic_state(state)
            
        except Exception as e:
            logging.error(f"Failed to check limbic state: {e}")
    
    def _trigger_dream_cycle(self, icon, item):
        """Trigger the Dream Cycle."""
        try:
            if self.brain:
                # This would trigger the dream cycle
                logging.info("Dream Cycle trigger requested")
                # Implementation would call the dream cycle system
            
        except Exception as e:
            logging.error(f"Failed to trigger dream cycle: {e}")
    
    def _enter_slumber_mode(self, icon, item):
        """Enter slumber mode."""
        try:
            self.current_state = LimbicState.SLUMBER
            if self.icon:
                image = self._create_icon_image(LimbicState.SLUMBER)
                self.icon.icon = image
            logging.info("Entered slumber mode")
            
        except Exception as e:
            logging.error(f"Failed to enter slumber mode: {e}")
    
    def _show_settings(self, icon, item):
        """Show settings dialog."""
        try:
            settings_text = f"""
Ghost Interface Settings

System Tray: {'Enabled' if self.config.enable_system_tray else 'Disabled'}
Notifications: {'Enabled' if self.config.enable_notifications else 'Disabled'}
Shoulder Taps: {'Enabled' if self.config.enable_shoulder_taps else 'Disabled'}
Refractory Period: {self.config.refractory_hours} hours
Visual Style: {self.config.visual_style}
"""
            if sys.platform == "win32":
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, settings_text, "Ghost Settings", 0)
            else:
                print(settings_text)
            
        except Exception as e:
            logging.error(f"Failed to show settings: {e}")
    
    def _shutdown(self, icon, item):
        """Shutdown the Ghost Interface."""
        try:
            self.is_running = False
            if self.icon:
                self.icon.stop()
            logging.info("Ghost Interface shutdown")
            
        except Exception as e:
            logging.error(f"Failed to shutdown: {e}")
    
    async def run(self):
        """Run the Ghost Interface."""
        try:
            if self.icon and SYSTEM_TRAY_AVAILABLE:
                self.icon.run()
            else:
                # Fallback: run without system tray
                while self.is_running:
                    await asyncio.sleep(1)
            
        except Exception as e:
            logging.error(f"Ghost Interface runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Ghost Interface."""
        try:
            self.is_running = False
            if self.icon:
                self.icon.stop()
            logging.info("Ghost Interface shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown gracefully: {e}")

# Factory function
async def create_ghost_interface(brain_instance=None, config: GhostConfig = None) -> GhostInterface:
    """Create and initialize a Ghost Interface instance."""
    ghost = GhostInterface(brain_instance, config)
    await ghost.initialize()
    return ghost
