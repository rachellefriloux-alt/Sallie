"""Unified smart home API."""

import logging
from typing import Dict, Any, List, Optional

from .home_assistant import HomeAssistantHub
from .platforms import (
    AlexaIntegration,
    GoogleHomeIntegration,
    AppleHomeKitIntegration,
    MicrosoftCopilotIntegration,
)

logger = logging.getLogger("smarthome.api")


class SmartHomeAPI:
    """
    Unified smart home API that coordinates all platforms.
    
    Uses Home Assistant as hub, with direct integrations for:
    - Alexa
    - Google Home
    - Apple HomeKit
    - Microsoft Copilot
    """
    
    def __init__(
        self,
        home_assistant_url: Optional[str] = None,
        home_assistant_token: Optional[str] = None,
        alexa_api_key: Optional[str] = None,
        google_api_key: Optional[str] = None,
        copilot_api_key: Optional[str] = None,
    ):
        """Initialize smart home API with all platforms."""
        self.hub = None
        if home_assistant_url and home_assistant_token:
            self.hub = HomeAssistantHub(home_assistant_url, home_assistant_token)
        
        self.alexa = AlexaIntegration(alexa_api_key)
        self.google_home = GoogleHomeIntegration(google_api_key)
        self.homekit = AppleHomeKitIntegration()
        self.copilot = MicrosoftCopilotIntegration(copilot_api_key)
        
        logger.info("[SmartHomeAPI] Initialized with all platforms")
    
    def get_all_devices(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get devices from all platforms."""
        devices = {
            "home_assistant": [],
            "alexa": [],
            "google_home": [],
            "homekit": [],
            "copilot": [],
        }
        
        if self.hub:
            devices["home_assistant"] = self.hub.get_devices()
        
        devices["alexa"] = self.alexa.discover_devices()
        devices["google_home"] = self.google_home.discover_devices()
        devices["homekit"] = self.homekit.discover_devices()
        devices["copilot"] = self.copilot.discover_devices()
        
        return devices
    
    def control_device(
        self,
        device_id: str,
        action: str,
        platform: str = "home_assistant",
        value: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Control a device across any platform.
        
        Args:
            device_id: Device identifier
            action: Action to perform (e.g., "turn_on", "set_brightness")
            platform: Platform to use ("home_assistant", "alexa", "google_home", "homekit", "copilot")
            value: Optional value for action
        """
        if platform == "home_assistant" and self.hub:
            # Parse entity_id and service from action
            service = action
            return self.hub.control_device(device_id, service, {"value": value} if value else None)
        elif platform == "alexa":
            return self.alexa.control_device(device_id, action, value)
        elif platform == "google_home":
            return self.google_home.control_device(device_id, action, value)
        elif platform == "homekit":
            return self.homekit.control_device(device_id, action, value)
        elif platform == "copilot":
            return self.copilot.control_device(device_id, action, value)
        else:
            return {"error": f"Platform not available: {platform}"}
    
    def get_automations(self) -> List[Dict[str, Any]]:
        """Get automations from Home Assistant hub."""
        if self.hub:
            return self.hub.get_automations()
        return []
    
    def trigger_automation(self, automation_id: str) -> Dict[str, Any]:
        """Trigger automation in Home Assistant."""
        if self.hub:
            return self.hub.trigger_automation(automation_id)
        return {"error": "Home Assistant hub not configured"}
    
    def get_scenes(self) -> List[Dict[str, Any]]:
        """Get scenes from Home Assistant hub."""
        if self.hub:
            return self.hub.get_scenes()
        return []
    
    def activate_scene(self, scene_id: str) -> Dict[str, Any]:
        """Activate scene in Home Assistant."""
        if self.hub:
            return self.hub.activate_scene(scene_id)
        return {"error": "Home Assistant hub not configured"}

