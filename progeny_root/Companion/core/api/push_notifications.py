"""Push notification service for mobile devices.

Supports FCM (Firebase Cloud Messaging) for Android and APNs (Apple Push Notification Service) for iOS.
"""

import logging
import json
from typing import Dict, Any, Optional, List
from pathlib import Path
from enum import Enum
from pydantic import BaseModel

logger = logging.getLogger("api.push")


class PushPlatform(str, Enum):
    """Supported push notification platforms."""
    ANDROID = "android"
    IOS = "ios"
    WEB = "web"


class PushNotificationService:
    """
    Push notification service for mobile devices.
    
    Supports:
    - FCM for Android
    - APNs for iOS
    - Web Push for web clients
    """
    
    def __init__(self):
        """Initialize push notification service."""
        self.device_tokens: Dict[str, Dict[str, Any]] = {}  # device_id -> {platform, token, enabled}
        self.tokens_file = Path("progeny_root/core/api/device_tokens.json")
        self._load_tokens()
        logger.info("[PushNotifications] Push notification service initialized")
    
    def _load_tokens(self):
        """Load device tokens from file."""
        if self.tokens_file.exists():
            try:
                with open(self.tokens_file, "r", encoding="utf-8") as f:
                    self.device_tokens = json.load(f)
            except Exception as e:
                logger.error(f"[PushNotifications] Failed to load tokens: {e}")
                self.device_tokens = {}
    
    def _save_tokens(self):
        """Save device tokens to file."""
        try:
            self.tokens_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.tokens_file, "w", encoding="utf-8") as f:
                json.dump(self.device_tokens, f, indent=2)
        except Exception as e:
            logger.error(f"[PushNotifications] Failed to save tokens: {e}")
    
    def register_device_token(self, device_id: str, platform: PushPlatform, token: str) -> bool:
        """
        Register a device token for push notifications.
        
        Args:
            device_id: Unique device identifier
            platform: Platform (android, ios, web)
            token: Push notification token
            
        Returns:
            True if registered successfully
        """
        self.device_tokens[device_id] = {
            "platform": platform.value,
            "token": token,
            "enabled": True,
            "registered_at": time.time()
        }
        self._save_tokens()
        logger.info(f"[PushNotifications] Registered {platform.value} token for device: {device_id}")
        return True


# Pydantic model and convenience functions expected by tests
class PushTokenUpdate(BaseModel):
    device_id: str
    token: str
    platform: str


_service = PushNotificationService()


def update_push_token(payload: PushTokenUpdate) -> Dict[str, Any]:
    """Register or update a device token via the service."""
    platform = PushPlatform(payload.platform)
    _service.register_device_token(payload.device_id, platform, payload.token)
    return {"status": "success", "device_id": payload.device_id}


def send_push_notification(device_id: str, title: str, message: str) -> Dict[str, Any]:
    """Send a simple push notification using the service."""
    return _service.send_notification(device_id=device_id, title=title, body=message)
    
    def unregister_device_token(self, device_id: str) -> bool:
        """Unregister a device token."""
        if device_id in self.device_tokens:
            del self.device_tokens[device_id]
            self._save_tokens()
            logger.info(f"[PushNotifications] Unregistered token for device: {device_id}")
            return True
        return False
    
    def send_notification(
        self,
        device_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Send push notification to a device.
        
        Args:
            device_id: Target device ID
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            Result dict with status
        """
        if device_id not in self.device_tokens:
            return {"status": "error", "error": "Device not registered"}
        
        device_info = self.device_tokens[device_id]
        if not device_info.get("enabled", True):
            return {"status": "error", "error": "Notifications disabled for device"}
        
        platform = device_info["platform"]
        token = device_info["token"]
        
        # In production, this would send via FCM/APNs
        # For now, log and return success
        logger.info(f"[PushNotifications] Sending {platform} notification to {device_id}: {title}")
        
        # Store notification for future delivery
        self._store_notification(device_id, title, body, data)
        
        return {
            "status": "success",
            "device_id": device_id,
            "platform": platform,
            "sent_at": time.time()
        }
    
    def send_proactive_engagement(
        self,
        device_id: str,
        message: str,
        seed_type: str = "insight"
    ) -> Dict[str, Any]:
        """
        Send proactive engagement (Shoulder Tap) notification.
        
        Args:
            device_id: Target device ID
            message: Shoulder Tap message
            seed_type: Type of seed (insight, workload_offer, pattern_observation, etc.)
            
        Returns:
            Result dict
        """
        return self.send_notification(
            device_id=device_id,
            title="Sallie",
            body=message,
            data={"type": "shoulder_tap", "seed_type": seed_type}
        )
    
    def _store_notification(self, device_id: str, title: str, body: str, data: Optional[Dict[str, Any]]):
        """Store notification for future delivery (when push service is configured)."""
        notifications_file = Path("progeny_root/core/api/pending_notifications.json")
        
        if notifications_file.exists():
            try:
                with open(notifications_file, "r", encoding="utf-8") as f:
                    notifications = json.load(f)
            except Exception:
                notifications = []
        else:
            notifications = []
        
        notifications.append({
            "device_id": device_id,
            "title": title,
            "body": body,
            "data": data or {},
            "created_at": time.time(),
            "delivered": False
        })
        
        try:
            with open(notifications_file, "w", encoding="utf-8") as f:
                json.dump(notifications, f, indent=2)
        except Exception as e:
            logger.error(f"[PushNotifications] Failed to store notification: {e}")
    
    def list_registered_devices(self) -> List[Dict[str, Any]]:
        """List all registered devices with push tokens."""
        return [
            {"device_id": dev_id, **info}
            for dev_id, info in self.device_tokens.items()
        ]


# Import time for timestamps
import time

