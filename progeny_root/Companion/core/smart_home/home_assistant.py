"""Home Assistant integration as central hub."""

import logging
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("smarthome.homeassistant")


class HomeAssistantHub:
    """
    Home Assistant integration as central hub for smart home.
    
    Connects to Home Assistant instance and provides unified interface.
    """
    
    def __init__(self, base_url: str, access_token: str):
        """
        Initialize Home Assistant connection.
        
        Args:
            base_url: Home Assistant instance URL (e.g., "http://homeassistant.local:8123")
            access_token: Long-lived access token
        """
        self.base_url = base_url.rstrip('/')
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        logger.info(f"[HomeAssistant] Initialized with base URL: {base_url}")
    
    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make request to Home Assistant API."""
        url = f"{self.base_url}/api/{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json() if response.content else {}
        except requests.exceptions.RequestException as e:
            logger.error(f"[HomeAssistant] Request failed: {e}")
            return {"error": str(e)}
    
    def get_devices(self) -> List[Dict[str, Any]]:
        """Get all devices from Home Assistant."""
        result = self._request("GET", "states")
        if "error" in result:
            return []
        
        # Filter to only device entities
        devices = []
        for entity in result:
            if entity.get("entity_id", "").startswith(("light.", "switch.", "sensor.", "climate.", "cover.")):
                devices.append({
                    "entity_id": entity.get("entity_id"),
                    "state": entity.get("state"),
                    "attributes": entity.get("attributes", {}),
                })
        
        return devices
    
    def control_device(self, entity_id: str, service: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Control a device via Home Assistant.
        
        Args:
            entity_id: Entity ID (e.g., "light.living_room")
            service: Service to call (e.g., "turn_on", "turn_off", "set_brightness")
            data: Optional service data
        """
        domain = entity_id.split(".")[0]
        endpoint = f"services/{domain}/{service}"
        
        service_data = {"entity_id": entity_id}
        if data:
            service_data.update(data)
        
        return self._request("POST", endpoint, {"entity_id": entity_id, **service_data})
    
    def get_automations(self) -> List[Dict[str, Any]]:
        """Get all automations."""
        result = self._request("GET", "automation")
        if "error" in result:
            return []
        return result
    
    def trigger_automation(self, automation_id: str) -> Dict[str, Any]:
        """Trigger an automation."""
        return self._request("POST", f"automation/{automation_id}/trigger", {})
    
    def get_scenes(self) -> List[Dict[str, Any]]:
        """Get all scenes."""
        result = self._request("GET", "scene")
        if "error" in result:
            return []
        return result
    
    def activate_scene(self, scene_id: str) -> Dict[str, Any]:
        """Activate a scene."""
        return self._request("POST", f"scene/{scene_id}/turn_on", {})

