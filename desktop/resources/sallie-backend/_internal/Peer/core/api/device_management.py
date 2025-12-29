"""Device management for multi-device support."""

import logging
import json
import time
import platform
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger("api.device")


class DeviceManager:
    """
    Manages device registration and capabilities.
    
    Tracks:
    - Device information (platform, version, capabilities)
    - Device status (online/offline)
    - Device permissions
    """
    
    def __init__(self, devices_file: Path = Path("progeny_root/core/api/devices.json")):
        """Initialize device manager."""
        self.devices_file = devices_file
        self.devices_file.parent.mkdir(parents=True, exist_ok=True)
        self.devices = self._load_devices()
    
    def _load_devices(self) -> Dict[str, Dict[str, Any]]:
        """Load devices from file."""
        if self.devices_file.exists():
            try:
                with open(self.devices_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[DeviceManager] Failed to load devices: {e}")
        
        return {}
    
    def _save_devices(self):
        """Save devices to file."""
        try:
            with open(self.devices_file, "w", encoding="utf-8") as f:
                json.dump(self.devices, f, indent=2)
        except Exception as e:
            logger.error(f"[DeviceManager] Failed to save devices: {e}")
    
    def register_device(
        self,
        device_id: str,
        platform: str,
        version: str,
        capabilities: List[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Register a new device.
        
        Args:
            device_id: Unique device identifier
            platform: Platform (windows, ios, android, macos, linux)
            version: App version
            capabilities: List of device capabilities
            metadata: Optional additional metadata
            
        Returns:
            Device registration info
        """
        device_info = {
            "device_id": device_id,
            "platform": platform,
            "version": version,
            "capabilities": capabilities,
            "metadata": metadata or {},
            "registered_at": time.time(),
            "last_seen": time.time(),
            "status": "online"
        }
        
        self.devices[device_id] = device_info
        self._save_devices()
        
        logger.info(f"[DeviceManager] Registered device: {device_id} ({platform})")
        return device_info
    
    def update_device_status(self, device_id: str, status: str = "online"):
        """Update device status."""
        if device_id in self.devices:
            self.devices[device_id]["status"] = status
            self.devices[device_id]["last_seen"] = time.time()
            self._save_devices()
    
    def get_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Get device information."""
        return self.devices.get(device_id)
    
    def list_devices(self) -> List[Dict[str, Any]]:
        """List all registered devices."""
        return list(self.devices.values())
    
    def get_device_capabilities(self, device_id: str) -> List[str]:
        """Get capabilities for a device."""
        device = self.devices.get(device_id)
        return device.get("capabilities", []) if device else []

