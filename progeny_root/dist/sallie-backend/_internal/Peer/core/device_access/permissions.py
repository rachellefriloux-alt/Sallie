"""Permission management for device access."""

import logging
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger("device.permissions")


class PermissionType(str, Enum):
    """Types of device permissions."""
    FILE_READ = "file_read"
    FILE_WRITE = "file_write"
    APP_LAUNCH = "app_launch"
    APP_CONTROL = "app_control"
    SYSTEM_INFO = "system_info"
    NETWORK = "network"


class PermissionManager:
    """
    Manages device access permissions.
    
    Tracks permissions per device and capability.
    """
    
    def __init__(self, permissions_file: Path = Path("progeny_root/core/device_access/permissions.json")):
        """Initialize permission manager."""
        self.permissions_file = permissions_file
        self.permissions_file.parent.mkdir(parents=True, exist_ok=True)
        self.permissions = self._load_permissions()
        logger.info("[PermissionManager] Permission manager initialized")
    
    def _load_permissions(self) -> Dict[str, Any]:
        """Load permissions from file."""
        if self.permissions_file.exists():
            try:
                with open(self.permissions_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[PermissionManager] Failed to load permissions: {e}")
        
        return {
            "devices": {},
            "default_permissions": {
                PermissionType.FILE_READ.value: True,
                PermissionType.FILE_WRITE.value: False,
                PermissionType.APP_LAUNCH.value: False,
                PermissionType.APP_CONTROL.value: False,
                PermissionType.SYSTEM_INFO.value: True,
                PermissionType.NETWORK.value: False,
            }
        }
    
    def _save_permissions(self):
        """Save permissions to file."""
        try:
            with open(self.permissions_file, "w", encoding="utf-8") as f:
                json.dump(self.permissions, f, indent=2)
        except Exception as e:
            logger.error(f"[PermissionManager] Failed to save permissions: {e}")
    
    def grant_permission(self, device_id: str, permission: PermissionType) -> bool:
        """Grant permission to a device."""
        if "devices" not in self.permissions:
            self.permissions["devices"] = {}
        
        if device_id not in self.permissions["devices"]:
            self.permissions["devices"][device_id] = {}
        
        self.permissions["devices"][device_id][permission.value] = True
        self._save_permissions()
        logger.info(f"[PermissionManager] Granted {permission.value} to {device_id}")
        return True
    
    def revoke_permission(self, device_id: str, permission: PermissionType) -> bool:
        """Revoke permission from a device."""
        if device_id in self.permissions.get("devices", {}):
            self.permissions["devices"][device_id][permission.value] = False
            self._save_permissions()
            logger.info(f"[PermissionManager] Revoked {permission.value} from {device_id}")
            return True
        return False
    
    def check_permission(self, device_id: str, permission: PermissionType) -> bool:
        """Check if device has permission."""
        # Check device-specific permission
        if device_id in self.permissions.get("devices", {}):
            device_perms = self.permissions["devices"][device_id]
            if permission.value in device_perms:
                return device_perms[permission.value]
        
        # Fall back to default
        return self.permissions.get("default_permissions", {}).get(permission.value, False)
    
    def get_device_permissions(self, device_id: str) -> Dict[str, bool]:
        """Get all permissions for a device."""
        device_perms = self.permissions.get("devices", {}).get(device_id, {})
        defaults = self.permissions.get("default_permissions", {})
        
        # Merge device-specific with defaults
        all_perms = defaults.copy()
        all_perms.update(device_perms)
        
        return all_perms

