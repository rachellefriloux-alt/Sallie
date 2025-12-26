"""Desktop presence and ghost interface."""

import logging
import time
from .limbic import LimbicSystem

logger = logging.getLogger("system")

try:
    from plyer import notification
    PLYER_AVAILABLE = True
except ImportError:
    PLYER_AVAILABLE = False
    logger.warning("plyer not found. Desktop notifications disabled.")

class GhostSystem:
    """
    Proactive presence system.
    Decides when to 'tap' the user based on Arousal and insights.
    """
    def __init__(self, limbic: LimbicSystem):
        self.limbic = limbic
        self.last_tap_time = 0
        self.refractory_period = 3600 # 1 hour

    def should_tap(self) -> bool:
        """
        Determines if the Ghost should initiate contact.
        """
        now = time.time()
        if now - self.last_tap_time < self.refractory_period:
            return False

        # Only tap if Arousal is high (Excited/Alert)
        if self.limbic.state.arousal > 0.7:
            return True
            
        return False

    def send_notification(self, message: str):
        """
        Sends a desktop notification.
        """
        logger.info(f"[GHOST] Notification: {message}")
        self.last_tap_time = time.time()
        
        if PLYER_AVAILABLE:
            try:
                notification.notify(
                    title="Digital Progeny",
                    message=message,
                    app_name="Progeny",
                    timeout=10
                )
            except Exception as e:
                logger.error(f"Failed to send notification: {e}")
