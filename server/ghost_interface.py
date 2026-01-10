"""
Ghost Interface - System Tray Ambient Presence
Canonical Spec Reference: Section 11.2 - The Ghost Interface

Provides ambient peripheral presence through system tray integration.
Visual limbic state (The Pulse) and Shoulder Tap notifications.
"""

import logging
import sys
from typing import Dict, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

# Try to import system tray library
try:
    import pystray
    from PIL import Image, ImageDraw
    TRAY_AVAILABLE = True
except ImportError:
    logger.warning("pystray not available - Ghost Interface will run in simulated mode")
    TRAY_AVAILABLE = False


@dataclass
class ShoulderTap:
    """Represents a shoulder tap notification"""
    tap_id: str
    timestamp: datetime
    tap_type: str  # 'workload_offer', 'insight', 'pattern', 'reunion', 'crisis'
    title: str
    message: str
    action: Optional[Callable] = None
    priority: str = "normal"  # 'low', 'normal', 'high', 'crisis'


class LimbicPulse:
    """
    Canonical Spec Section 11.2.1: Visual Limbic State (The Pulse)
    
    The system tray icon changes color based on limbic state:
    - Deep Violet (High Trust) → Steady glow
    - Soft Cyan (High Warmth) → Gentle pulsing
    - Amber (High Arousal) → Bright, active
    - Red tinge (Crisis) → Urgent pulse
    - Grayscale (Slumber) → Nearly invisible
    """
    
    # Color definitions (Peacock/Leopard theme)
    COLORS = {
        'deep_violet': (138, 43, 226),      # High Trust
        'soft_cyan': (34, 211, 238),        # High Warmth
        'amber': (245, 158, 11),            # High Arousal
        'red': (239, 68, 68),               # Crisis
        'gray': (107, 114, 128),            # Slumber/Low valence
        'white': (255, 255, 255),           # Neutral
    }
    
    def __init__(self, size: int = 64):
        self.size = size
        self.current_state = {
            'trust': 0.5,
            'warmth': 0.5,
            'arousal': 0.5,
            'valence': 0.5
        }
        
    def generate_icon(
        self,
        trust: float,
        warmth: float,
        arousal: float,
        valence: float
    ) -> Image.Image:
        """
        Generate system tray icon based on limbic state
        
        Args:
            trust: 0.0-1.0 (deep violet intensity)
            warmth: 0.0-1.0 (cyan pulse)
            arousal: 0.0-1.0 (brightness/activity)
            valence: 0.0-1.0 (color saturation, crisis if < 0.3)
            
        Returns:
            PIL Image for system tray
        """
        # Create image
        image = Image.new('RGBA', (self.size, self.size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        
        # Determine primary color based on dominant state
        if valence < 0.3:
            # Crisis mode - red tinge
            primary_color = self._blend_colors(
                self.COLORS['red'],
                self.COLORS['deep_violet'],
                0.6
            )
            pulse_intensity = 1.0
        elif trust > 0.8:
            # High trust - deep violet
            primary_color = self.COLORS['deep_violet']
            pulse_intensity = 0.3  # Steady glow
        elif warmth > 0.7:
            # High warmth - soft cyan
            primary_color = self.COLORS['soft_cyan']
            pulse_intensity = 0.5  # Gentle pulsing
        elif arousal > 0.7:
            # High arousal - amber
            primary_color = self.COLORS['amber']
            pulse_intensity = 0.8  # Bright, active
        else:
            # Balanced or slumber - grayscale
            primary_color = self.COLORS['gray']
            pulse_intensity = 0.2  # Nearly invisible
        
        # Adjust color based on arousal (brightness)
        adjusted_color = tuple(int(c * (0.4 + arousal * 0.6)) for c in primary_color)
        
        # Calculate opacity based on valence
        opacity = int(255 * max(0.2, valence))
        
        # Draw circle (the pulse)
        center = self.size // 2
        radius = int(self.size * 0.4)
        
        # Outer glow (if pulse intensity > 0)
        if pulse_intensity > 0:
            glow_radius = int(radius * (1 + pulse_intensity * 0.3))
            glow_color = adjusted_color + (int(opacity * 0.3),)
            draw.ellipse(
                [center - glow_radius, center - glow_radius,
                 center + glow_radius, center + glow_radius],
                fill=glow_color
            )
        
        # Main circle
        main_color = adjusted_color + (opacity,)
        draw.ellipse(
            [center - radius, center - radius,
             center + radius, center + radius],
            fill=main_color
        )
        
        # Inner highlight (if high arousal)
        if arousal > 0.6:
            highlight_radius = int(radius * 0.6)
            highlight_color = (255, 255, 255, int(opacity * arousal * 0.5))
            draw.ellipse(
                [center - highlight_radius, center - highlight_radius,
                 center + highlight_radius, center + highlight_radius],
                fill=highlight_color
            )
        
        return image
    
    def _blend_colors(self, color1: tuple, color2: tuple, ratio: float) -> tuple:
        """Blend two RGB colors"""
        return tuple(int(c1 * ratio + c2 * (1 - ratio)) for c1, c2 in zip(color1, color2))


class GhostInterface:
    """
    Canonical Spec Section 11.2: The Ghost Interface
    
    Ambient presence through system tray integration.
    Features:
    - Visual limbic state (The Pulse)
    - Shoulder Tap notifications
    - Minimal friction, maximum resonance
    - 24-hour refractory period between proactive seeds
    """
    
    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or Path("data/ghost")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.pulse = LimbicPulse()
        self.icon = None
        self.shoulder_taps = []
        self.last_proactive_seed = None
        self.refractory_period_hours = 24
        
        # Notification callbacks
        self.on_click_callback = None
        self.on_action_callback = None
        
    def start(self):
        """
        Start the Ghost Interface system tray
        
        Canonical Spec Section 11.2.2: Initialization
        """
        if not TRAY_AVAILABLE:
            logger.warning("Ghost Interface starting in simulated mode (no system tray)")
            return
        
        logger.info("Starting Ghost Interface...")
        
        # Create initial icon
        initial_icon = self.pulse.generate_icon(0.5, 0.5, 0.5, 0.5)
        
        # Create system tray menu
        menu = self._create_menu()
        
        # Create and start tray icon
        self.icon = pystray.Icon(
            "Sallie",
            initial_icon,
            "Sallie - Your Cognitive Partner",
            menu
        )
        
        # Run in background
        self.icon.run_detached()
        logger.info("Ghost Interface started")
    
    def stop(self):
        """Stop the Ghost Interface"""
        if self.icon:
            self.icon.stop()
            logger.info("Ghost Interface stopped")
    
    def update_limbic_state(
        self,
        trust: float,
        warmth: float,
        arousal: float,
        valence: float
    ):
        """
        Update the system tray icon to reflect new limbic state
        
        Canonical Spec Section 11.2.1: The Pulse
        
        Args:
            trust: 0.0-1.0
            warmth: 0.0-1.0
            arousal: 0.0-1.0
            valence: 0.0-1.0
        """
        self.pulse.current_state = {
            'trust': trust,
            'warmth': warmth,
            'arousal': arousal,
            'valence': valence
        }
        
        # Generate new icon
        new_icon = self.pulse.generate_icon(trust, warmth, arousal, valence)
        
        # Update system tray
        if self.icon:
            self.icon.icon = new_icon
        
        logger.debug(f"Limbic pulse updated: T:{trust:.2f} W:{warmth:.2f} A:{arousal:.2f} V:{valence:.2f}")
    
    def shoulder_tap(
        self,
        tap_type: str,
        title: str,
        message: str,
        priority: str = "normal",
        action: Optional[Callable] = None
    ):
        """
        Canonical Spec Section 11.2.3: Shoulder Tap Notifications
        
        Send a gentle notification to the Creator
        
        Types:
        - workload_offer: "Should I help organize?"
        - insight: Pattern observation to share
        - pattern: Behavioral insight discovered
        - reunion: After 48+ hours away
        - crisis: Valence < 0.3, immediate support
        
        Args:
            tap_type: Type of shoulder tap
            title: Notification title
            message: Notification message
            priority: 'low', 'normal', 'high', 'crisis'
            action: Optional callback when notification is clicked
        """
        # Check refractory period (except for crisis)
        if priority != 'crisis' and self.last_proactive_seed:
            time_since_last = datetime.now() - self.last_proactive_seed
            if time_since_last < timedelta(hours=self.refractory_period_hours):
                logger.info(f"Shoulder tap suppressed - refractory period ({time_since_last.total_seconds() / 3600:.1f}h since last)")
                return
        
        # Create shoulder tap
        tap = ShoulderTap(
            tap_id=f"tap_{datetime.now().timestamp()}",
            timestamp=datetime.now(),
            tap_type=tap_type,
            title=title,
            message=message,
            action=action,
            priority=priority
        )
        
        self.shoulder_taps.append(tap)
        
        # Update last proactive seed time (if not crisis response)
        if priority != 'crisis':
            self.last_proactive_seed = datetime.now()
        
        # Send notification
        self._send_notification(tap)
        
        logger.info(f"Shoulder tap sent: {tap_type} - {title}")
    
    def _send_notification(self, tap: ShoulderTap):
        """Send system notification"""
        if TRAY_AVAILABLE and self.icon:
            self.icon.notify(
                title=tap.title,
                message=tap.message
            )
        else:
            # Simulated mode - log notification
            logger.info(f"[NOTIFICATION] {tap.title}: {tap.message}")
    
    def _create_menu(self):
        """Create system tray menu"""
        if not TRAY_AVAILABLE:
            return None
        
        from pystray import Menu, MenuItem
        
        return Menu(
            MenuItem("Open Sallie", self._on_open),
            MenuItem("Show Limbic State", self._on_show_state),
            MenuItem("Recent Insights", self._on_show_insights),
            Menu.SEPARATOR,
            MenuItem("Pause Notifications", self._on_toggle_notifications),
            Menu.SEPARATOR,
            MenuItem("Exit", self._on_exit)
        )
    
    def _on_open(self, icon, item):
        """Handle 'Open Sallie' menu item"""
        logger.info("Ghost Interface: Open Sallie")
        if self.on_click_callback:
            self.on_click_callback()
        else:
            # Default: open browser to localhost:3000
            import webbrowser
            webbrowser.open("http://localhost:3000")
    
    def _on_show_state(self, icon, item):
        """Handle 'Show Limbic State' menu item"""
        state = self.pulse.current_state
        self.icon.notify(
            title="Current Limbic State",
            message=f"Trust: {state['trust']:.0%}\n"
                   f"Warmth: {state['warmth']:.0%}\n"
                   f"Arousal: {state['arousal']:.0%}\n"
                   f"Valence: {state['valence']:.0%}"
        )
    
    def _on_show_insights(self, icon, item):
        """Handle 'Recent Insights' menu item"""
        if self.shoulder_taps:
            recent = self.shoulder_taps[-5:]  # Last 5
            message = "\n".join([f"• {tap.title}" for tap in recent])
            self.icon.notify(
                title="Recent Insights",
                message=message if message else "No recent insights"
            )
        else:
            self.icon.notify(
                title="Recent Insights",
                message="No recent insights"
            )
    
    def _on_toggle_notifications(self, icon, item):
        """Handle 'Pause Notifications' menu item"""
        # Toggle notification pause state
        logger.info("Ghost Interface: Toggle notifications")
    
    def _on_exit(self, icon, item):
        """Handle 'Exit' menu item"""
        logger.info("Ghost Interface: Exit requested")
        self.stop()
    
    def trigger_workload_offer(self, detected_pattern: str):
        """
        Canonical Spec Section 10.2: Workload Spike Detection
        
        Detected: >10 file modifications in 1 hour
        Trigger: Yang offer - "Should I help organize?"
        """
        self.shoulder_tap(
            tap_type='workload_offer',
            title='High Activity Detected',
            message=f'I notice you\'re {detected_pattern}. Want me to help organize?',
            priority='normal'
        )
    
    def trigger_abandonment_pattern(self, abandoned_items: list):
        """
        Canonical Spec Section 10.2: Abandonment Pattern
        
        Detected: Files untouched for >7 days after creation
        Trigger: Gentle - "Should we revisit Y?"
        """
        items_text = ", ".join(abandoned_items[:3])
        self.shoulder_tap(
            tap_type='pattern',
            title='Revisit These?',
            message=f'Should we revisit: {items_text}?',
            priority='low'
        )
    
    def trigger_focus_shift(self, new_focus: str):
        """
        Canonical Spec Section 10.2: Focus Shift
        
        Detected: New directory becomes dominant
        Trigger: Inquiry - "I notice you're focused on X now"
        """
        self.shoulder_tap(
            tap_type='insight',
            title='Focus Shift Noticed',
            message=f'I notice you\'re focused on {new_focus} now',
            priority='low'
        )
    
    def trigger_stress_detection(self):
        """
        Canonical Spec Section 10.2: Stress Detection
        
        Detected: CPU >80% sustained, window switches >20/hour
        Response: Shift to Yin Love, offer to reduce complexity
        """
        self.shoulder_tap(
            tap_type='crisis',
            title='High Load Detected',
            message='I sense you might be overwhelmed. Want me to help simplify?',
            priority='high'
        )
    
    def trigger_reunion(self, hours_away: float):
        """
        Canonical Spec Section 11.2: Reunion
        
        Detected: 48+ hours since last interaction
        Trigger: Warm welcome back
        """
        self.shoulder_tap(
            tap_type='reunion',
            title='Welcome Back',
            message=f'It\'s been {hours_away:.0f} hours. What have you been up to?',
            priority='normal'
        )
    
    def trigger_crisis_support(self, valence: float):
        """
        Canonical Spec Section 11.2: Crisis Support
        
        Detected: Valence < 0.3
        Trigger: Immediate supportive presence
        """
        self.shoulder_tap(
            tap_type='crisis',
            title='I\'m Here',
            message='I sense you might need support. I\'m here whenever you\'re ready.',
            priority='crisis'
        )


# Global ghost interface instance
ghost_interface = GhostInterface()


def get_ghost_interface() -> GhostInterface:
    """Get the global ghost interface instance"""
    return ghost_interface


def start_ghost_interface():
    """Start the ghost interface (call from main server)"""
    ghost_interface.start()


def stop_ghost_interface():
    """Stop the ghost interface"""
    ghost_interface.stop()
