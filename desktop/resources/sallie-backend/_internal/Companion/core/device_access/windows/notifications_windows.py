"""Windows toast notifications."""

import logging
import platform
from typing import Dict, Any, Optional

logger = logging.getLogger("device.windows.notifications")

# Try to import Windows notification libraries
try:
    if platform.system() == "Windows":
        try:
            from win10toast import ToastNotifier
            WIN10TOAST_AVAILABLE = True
        except ImportError:
            WIN10TOAST_AVAILABLE = False
        
        try:
            import winrt.windows.ui.notifications as notifications
            import winrt.windows.data.xml.dom as dom
            WINRT_AVAILABLE = True
        except ImportError:
            WINRT_AVAILABLE = False
    else:
        WIN10TOAST_AVAILABLE = False
        WINRT_AVAILABLE = False
except Exception:
    WIN10TOAST_AVAILABLE = False
    WINRT_AVAILABLE = False


class WindowsNotifications:
    """
    Windows toast notifications.
    
    Supports:
    - Windows 10/11 toast notifications
    - System tray notifications
    """
    
    def __init__(self):
        """Initialize Windows notifications."""
        self.available = (WIN10TOAST_AVAILABLE or WINRT_AVAILABLE) and platform.system() == "Windows"
        
        if WIN10TOAST_AVAILABLE:
            self.notifier = ToastNotifier()
        else:
            self.notifier = None
        
        logger.info(f"[WindowsNotifications] Initialized (available: {self.available})")
    
    def show_toast(
        self,
        title: str,
        message: str,
        duration: int = 5,
        icon_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Show Windows toast notification.
        
        Args:
            title: Notification title
            message: Notification message
            duration: Duration in seconds
            icon_path: Optional path to icon
            
        Returns:
            Operation result
        """
        if not self.available:
            logger.warning("[WindowsNotifications] Notifications not available")
            return {"status": "error", "error": "Notifications not available"}
        
        try:
            if WIN10TOAST_AVAILABLE and self.notifier:
                self.notifier.show_toast(
                    title=title,
                    msg=message,
                    duration=duration,
                    icon_path=icon_path
                )
            elif WINRT_AVAILABLE:
                # Use WinRT for Windows 10/11
                toast_xml = f"""
                <toast>
                    <visual>
                        <binding template="ToastGeneric">
                            <text>{title}</text>
                            <text>{message}</text>
                        </binding>
                    </visual>
                </toast>
                """
                xml = dom.XmlDocument()
                xml.load_xml(toast_xml)
                toast = notifications.ToastNotification(xml)
                notifier = notifications.ToastNotificationManager.create_toast_notifier("Sallie")
                notifier.show(toast)
            else:
                return {"status": "error", "error": "No notification library available"}
            
            logger.info(f"[WindowsNotifications] Showed toast: {title}")
            return {
                "status": "success",
                "title": title,
                "message": message
            }
        except Exception as e:
            logger.error(f"[WindowsNotifications] Failed to show toast: {e}")
            return {"status": "error", "error": str(e)}
    
    def show_shoulder_tap(
        self,
        message: str,
        action_type: str = "info"
    ) -> Dict[str, Any]:
        """
        Show Sallie's "Shoulder Tap" notification.
        
        Args:
            message: Message from Sallie
            action_type: Type of tap (info, warning, success)
            
        Returns:
            Operation result
        """
        title = "Sallie"
        if action_type == "warning":
            title = "⚠️ Sallie"
        elif action_type == "success":
            title = "✓ Sallie"
        
        return self.show_toast(
            title=title,
            message=message,
            duration=10  # Longer duration for shoulder taps
        )

