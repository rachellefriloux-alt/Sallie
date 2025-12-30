"""Sync state management for tracking sync status per device."""

import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("sync.state")


class SyncState(BaseModel):
    device_id: str
    last_sync: float
    sync_enabled: bool = True


class SyncStateManager:
    """
    Manages sync state for all devices.
    
    Tracks:
    - Device registration
    - Last sync timestamps
    - Sync conflicts
    - Device capabilities
    """
    
    def __init__(self, state_file: Path = Path("progeny_root/core/sync/sync_state.json")):
        """Initialize sync state manager."""
        self.state_file = state_file
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        self.state = self._load_state()

    def save_state(self, state: SyncState):
        """Persist a SyncState instance."""
        payload = state.model_dump()
        self.state_file.write_text(json.dumps(payload, indent=2))

    def load_state(self) -> SyncState:
        """Load SyncState from disk; create default if missing."""
        if self.state_file.exists():
            try:
                data = json.loads(self.state_file.read_text())
                return SyncState(**data)
            except Exception:
                pass
        default = SyncState(device_id="unknown", last_sync=0.0, sync_enabled=True)
        self.save_state(default)
        return default
    
    def _load_state(self) -> Dict[str, Any]:
        """Load sync state from file."""
        if self.state_file.exists():
            try:
                with open(self.state_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[SyncState] Failed to load state: {e}")
        
        return {
            "devices": {},
            "last_sync_ts": 0,
            "sync_conflicts": [],
            "version": "1.0"
        }
    
    def _save_state(self):
        """Save sync state to file."""
        try:
            with open(self.state_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2)
        except Exception as e:
            logger.error(f"[SyncState] Failed to save state: {e}")
    
    def register_device(self, device_id: str, device_info: Dict[str, Any]) -> bool:
        """
        Register a new device.
        
        Args:
            device_id: Unique device identifier
            device_info: Device metadata (platform, version, capabilities)
            
        Returns:
            True if registered successfully
        """
        if "devices" not in self.state:
            self.state["devices"] = {}
        
        self.state["devices"][device_id] = {
            **device_info,
            "registered_at": time.time(),
            "last_sync_ts": 0,
            "status": "active"
        }
        
        self._save_state()
        logger.info(f"[SyncState] Registered device: {device_id}")
        return True
    
    def update_device_sync(self, device_id: str, sync_ts: float):
        """Update last sync timestamp for a device."""
        if device_id in self.state.get("devices", {}):
            self.state["devices"][device_id]["last_sync_ts"] = sync_ts
            self.state["last_sync_ts"] = max(self.state["last_sync_ts"], sync_ts)
            self._save_state()
    
    def get_device_status(self, device_id: str) -> Optional[Dict[str, Any]]:
        """Get status for a specific device."""
        return self.state.get("devices", {}).get(device_id)
    
    def list_devices(self) -> List[Dict[str, Any]]:
        """List all registered devices."""
        devices = self.state.get("devices", {})
        return [
            {"device_id": dev_id, **dev_info}
            for dev_id, dev_info in devices.items()
        ]
    
    def record_conflict(self, conflict: Dict[str, Any]):
        """Record a sync conflict."""
        if "sync_conflicts" not in self.state:
            self.state["sync_conflicts"] = []
        
        conflict_entry = {
            **conflict,
            "timestamp": time.time(),
            "datetime": datetime.now().isoformat()
        }
        
        self.state["sync_conflicts"].append(conflict_entry)
        
        # Keep last 100 conflicts
        if len(self.state["sync_conflicts"]) > 100:
            self.state["sync_conflicts"] = self.state["sync_conflicts"][-100:]
        
        self._save_state()
        logger.warning(f"[SyncState] Recorded sync conflict: {conflict.get('type')}")

