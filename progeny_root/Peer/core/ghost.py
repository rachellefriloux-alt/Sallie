"""Desktop presence and ghost interface (Section 11.2).

Implements:
- The Pulse: Visual limbic state indicator
- Shoulder Tap: Proactive engagement notifications
- Veto Popup: Hypothesis review interface
"""

import logging
import time
import json
from typing import Dict, Any, List, Optional, TYPE_CHECKING
from pathlib import Path
from datetime import datetime

from .limbic import LimbicSystem

logger = logging.getLogger("ghost")

try:
    from plyer import notification
    PLYER_AVAILABLE = True
except ImportError:
    PLYER_AVAILABLE = False
    logger.warning("plyer not found. Desktop notifications disabled.")

try:
    import pystray
    from PIL import Image, ImageDraw
    PYSTRAY_AVAILABLE = True
except (ImportError, ValueError, Exception) as e:
    PYSTRAY_AVAILABLE = False
    # Create dummy types for type hints
    if TYPE_CHECKING:
        from PIL import Image, ImageDraw
    else:
        Image = None
        ImageDraw = None
        pystray = None
    logger.warning(f"pystray not available ({type(e).__name__}). System tray disabled.")


class GhostSystem:
    """
    Ghost Interface - peripheral presence system (Section 11.2).
    
    Features:
    - The Pulse: Visual limbic state indicator
    - Shoulder Tap: Proactive engagement notifications
    - Veto Popup: Hypothesis review interface
    """
    
    def __init__(self, limbic: LimbicSystem):
        self.limbic = limbic
        self.last_tap_time = 0
        self.refractory_period = 86400  # 24 hours (Section 10.4.2)
        self.tray_icon = None
        self.pulse_state = "steady"
        
        # Load veto queue
        self.veto_file = Path("progeny_root/memory/patches.json")
        logger.info("[Ghost] Ghost system initialized")
    
    def get_pulse_state(self) -> Dict[str, Any]:
        """
        Get Pulse visual state based on limbic state (Section 11.2.1).
        
        Returns:
            Dict with color, intensity, and behavior
        """
        state = self.limbic.state
        
        # Determine color based on limbic state
        if state.trust > 0.8:
            color = "deep_violet"
            intensity = "steady"
        elif state.warmth > 0.7:
            color = "soft_cyan"
            intensity = "pulsing_gentle"
        elif state.arousal > 0.7:
            color = "amber"
            intensity = "brighter"
        elif state.valence < 0.3:
            color = "muted_gray"
            intensity = "dim"
        elif state.valence < 0.4 or state.door_slam_active:
            color = "red_tinge"
            intensity = "urgent_pulse"
        elif state.arousal < 0.3:
            color = "grayscale"
            intensity = "nearly_invisible"
        else:
            color = "neutral"
            intensity = "steady"
        
        return {
            "color": color,
            "intensity": intensity,
            "trust": state.trust,
            "warmth": state.warmth,
            "arousal": state.arousal,
            "valence": state.valence
        }
    
    def should_tap(self, seed_type: str = "insight") -> bool:
        """
        Determines if the Ghost should initiate contact (Section 10.4).
        
        Args:
            seed_type: Type of seed (workload_offer, insight_delivery, pattern_observation, reunion, crisis_support)
        """
        now = time.time()
        state = self.limbic.state
        
        # Check refractory period
        if now - self.last_tap_time < self.refractory_period:
            # Override for crisis
            if state.valence < 0.3 or seed_type == "crisis_support":
                logger.info("[Ghost] Refractory period bypassed for crisis")
                return True
            return False
        
        # Check trigger conditions
        if seed_type == "crisis_support" and state.valence < 0.3:
            return True
        elif seed_type == "reunion" and (now - state.last_interaction_ts) > 172800:  # 48 hours
            return True
        elif seed_type in ["workload_offer", "insight_delivery", "pattern_observation"]:
            if state.arousal > 0.7:
                return True
        
        return False
    
    def send_shoulder_tap(self, message: str, seed_type: str = "insight"):
        """
        Send Shoulder Tap notification (Section 11.2.2).
        
        Args:
            message: Message from Sallie
            seed_type: Type of seed
        """
        if not self.should_tap(seed_type):
            logger.debug(f"[Ghost] Shoulder Tap blocked by refractory period")
            return False
        
        logger.info(f"[Ghost] Shoulder Tap: {message}")
        self.last_tap_time = time.time()
        
        # Format title based on seed type
        title_map = {
            "workload_offer": "Sallie - Workload Offer",
            "insight_delivery": "Sallie - Insight",
            "pattern_observation": "Sallie - Pattern",
            "reunion": "Sallie - Welcome Back",
            "crisis_support": "Sallie - I'm Here"
        }
        title = title_map.get(seed_type, "Sallie")
        
        if PLYER_AVAILABLE:
            try:
                notification.notify(
                    title=title,
                    message=message,
                    app_name="Sallie",
                    timeout=10
                )
                return True
            except Exception as e:
                logger.error(f"[Ghost] Failed to send notification: {e}")
                return False
        
        return False
    
    def get_pending_veto_hypotheses(self, max_count: int = 5) -> List[Dict[str, Any]]:
        """
        Get pending hypotheses for Veto Popup (Section 11.2.3).
        
        Args:
            max_count: Maximum hypotheses to return (default 5)
            
        Returns:
            List of hypothesis dicts
        """
        if not self.veto_file.exists():
            return []
        
        try:
            with open(self.veto_file, "r", encoding="utf-8") as f:
                patches_data = json.load(f)
            
            pending_ids = patches_data.get("pending_veto_queue", [])
            hypotheses = patches_data.get("hypotheses", [])
            
            # Get hypotheses that are pending veto
            pending = [
                h for h in hypotheses 
                if h.get("id") in pending_ids and h.get("status") == "pending_veto"
            ]
            
            return pending[:max_count]
        except Exception as e:
            logger.error(f"[Ghost] Failed to load veto hypotheses: {e}")
            return []
    
    def show_veto_popup(self, hypotheses: Optional[List[Dict[str, Any]]] = None):
        """
        Show Veto Popup for hypothesis review (Section 11.2.3).
        
        Args:
            hypotheses: Optional list of hypotheses (if None, loads from file)
        """
        if hypotheses is None:
            hypotheses = self.get_pending_veto_hypotheses()
        
        if not hypotheses:
            logger.debug("[Ghost] No pending hypotheses for veto")
            return
        
        logger.info(f"[Ghost] Showing Veto Popup with {len(hypotheses)} hypotheses")
        
        # Format message for notification
        if len(hypotheses) == 1:
            hyp = hypotheses[0]
            message = f"Hypothesis: {hyp.get('pattern', 'Unknown')[:100]}"
        else:
            message = f"{len(hypotheses)} hypotheses pending review"
        
        if PLYER_AVAILABLE:
            try:
                notification.notify(
                    title="Sallie - Hypothesis Review",
                    message=message,
                    app_name="Sallie",
                    timeout=15
                )
            except Exception as e:
                logger.error(f"[Ghost] Failed to show veto popup: {e}")
    
    def create_tray_icon(self):
        """Create system tray icon with Pulse visualization."""
        if not PYSTRAY_AVAILABLE:
            logger.warning("[Ghost] System tray not available (pystray not installed)")
            return None
        
        try:
            # Create icon based on pulse state
            pulse = self.get_pulse_state()
            image = self._create_pulse_icon(pulse)
            
            menu = pystray.Menu(
                pystray.MenuItem("Show Sallie", self._show_main_window),
                pystray.MenuItem("Status", self._show_status),
                pystray.Menu.SEPARATOR,
                pystray.MenuItem("Quit", self._quit_app)
            )
            
            icon = pystray.Icon("Sallie", image, "Sallie - Digital Progeny", menu)
            self.tray_icon = icon
            return icon
        except Exception as e:
            logger.error(f"[Ghost] Failed to create tray icon: {e}")
            return None
    
    def _create_pulse_icon(self, pulse: Dict[str, Any]) -> Optional[Any]:
        """Create icon image based on pulse state."""
        if not PYSTRAY_AVAILABLE:
            return None
        
        # Create a simple colored circle
        image = Image.new("RGB", (64, 64), color="black")
        draw = ImageDraw.Draw(image)
        
        # Map color to RGB
        color_map = {
            "deep_violet": (75, 0, 130),
            "soft_cyan": (0, 255, 255),
            "amber": (255, 191, 0),
            "muted_gray": (128, 128, 128),
            "red_tinge": (255, 0, 0),
            "grayscale": (64, 64, 64),
            "neutral": (128, 128, 128)
        }
        
        color = color_map.get(pulse["color"], (128, 128, 128))
        draw.ellipse([16, 16, 48, 48], fill=color)
        
        return image
    
    def _show_main_window(self, icon, item):
        """Show main window."""
        logger.info("[Ghost] Show main window requested")
        try:
            import webbrowser
            import json
            
            # Try to get dashboard URL from config
            config_path = Path("progeny_root/core/config.json")
            url = "http://localhost:3000"  # Default
            
            if config_path.exists():
                try:
                    with open(config_path, "r", encoding="utf-8") as f:
                        config = json.load(f)
                        ui_config = config.get("ui", {})
                        port = ui_config.get("dashboard_port", 3000)
                        url = f"http://localhost:{port}"
                except Exception:
                    pass
            
            # Open in default browser
            webbrowser.open(url)
            logger.info(f"[Ghost] Opened main window at {url}")
        except Exception as e:
            logger.error(f"[Ghost] Failed to open main window: {e}", exc_info=True)
    
    def _show_status(self, icon, item):
        """Show status."""
        try:
            state = self.limbic.state
            status_lines = [
                "Sallie Status",
                "=" * 40,
                f"Trust:      {state.trust:.2f}",
                f"Warmth:     {state.warmth:.2f}",
                f"Arousal:    {state.arousal:.2f}",
                f"Valence:    {state.valence:.2f}",
                f"Posture:    {state.posture or 'AUTO'}",
                "=" * 40
            ]
            
            status_text = "\n".join(status_lines)
            logger.info(f"[Ghost] Status:\n{status_text}")
            
            # Try to show system notification if available
            try:
                from plyer import notification
                notification.notify(
                    title="Sallie Status",
                    message=f"Trust: {state.trust:.2f} | Warmth: {state.warmth:.2f} | Arousal: {state.arousal:.2f}",
                    timeout=5
                )
            except Exception:
                # Notification not available, just log
                pass
        except Exception as e:
            logger.error(f"[Ghost] Failed to show status: {e}", exc_info=True)
    
    def _quit_app(self, icon, item):
        """Quit application."""
        logger.info("[Ghost] Quit requested")
        if self.tray_icon:
            self.tray_icon.stop()
