"""Sync client for encrypted cross-device synchronization.

Handles sync operations maintaining local-first principles.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime

from .sync_encryption import SyncEncryption
from .sync_conflict import SyncConflictResolver, ConflictResolution
from .sync_state import SyncStateManager

logger = logging.getLogger("sync.client")


class SyncClient:
    """
    Main sync client for cross-device synchronization.
    
    Architecture:
    - Local Core: Primary processing stays on main device (Windows desktop)
    - Encrypted Sync: State, memories, and conversations sync via encrypted cloud
    - Conflict Resolution: Last-write-wins with manual merge option
    - Privacy: End-to-end encryption, zero-knowledge architecture
    """
    
    def __init__(
        self,
        device_id: str,
        sync_server_url: Optional[str] = None,
        encryption: Optional[SyncEncryption] = None,
        state_manager: Optional[SyncStateManager] = None
    ):
        """
        Initialize sync client.
        
        Args:
            device_id: Unique identifier for this device
            sync_server_url: URL of sync server (optional, for future cloud sync)
            encryption: Encryption instance (creates new if None)
            state_manager: State manager instance (creates new if None)
        """
        self.device_id = device_id
        self.sync_server_url = sync_server_url
        self.encryption = encryption or SyncEncryption()
        self.state_manager = state_manager or SyncStateManager()
        self.conflict_resolver = SyncConflictResolver()
        
        # Register this device
        self.state_manager.register_device(device_id, {
            "platform": self._detect_platform(),
            "version": "1.0",
            "capabilities": ["chat", "memory", "limbic", "heritage"]
        })
        
        logger.info(f"[SyncClient] Initialized for device: {device_id}")
    
    def _detect_platform(self) -> str:
        """Detect current platform."""
        import platform
        system = platform.system().lower()
        if system == "windows":
            return "windows"
        elif system == "darwin":
            return "macos"
        elif system == "linux":
            return "linux"
        return "unknown"
    
    def sync_limbic_state(self, limbic_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync limbic state to other devices.
        
        Args:
            limbic_data: Current limbic state (soul.json)
            
        Returns:
            Sync result with status
        """
        try:
            # Encrypt limbic state
            limbic_json = json.dumps(limbic_data)
            encrypted = self.encryption.encrypt(limbic_json)
            
            # Prepare sync payload
            sync_payload = {
                "type": "limbic_state",
                "device_id": self.device_id,
                "data": encrypted,
                "timestamp": time.time(),
                "version": "1.0"
            }
            
            # In production, this would send to sync server
            # For now, store locally for future sync
            self._store_sync_payload("limbic", sync_payload)
            
            # Update sync state
            self.state_manager.update_device_sync(self.device_id, time.time())
            
            logger.info("[SyncClient] Synced limbic state")
            return {"status": "success", "synced_at": time.time()}
            
        except Exception as e:
            logger.error(f"[SyncClient] Failed to sync limbic state: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}
    
    def sync_memory(self, memory_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Sync memory data to other devices.
        
        Args:
            memory_data: List of memory entries to sync
            
        Returns:
            Sync result
        """
        try:
            # Encrypt memory data
            memory_json = json.dumps(memory_data)
            encrypted = self.encryption.encrypt(memory_json)
            
            sync_payload = {
                "type": "memory",
                "device_id": self.device_id,
                "data": encrypted,
                "timestamp": time.time(),
                "count": len(memory_data),
                "version": "1.0"
            }
            
            self._store_sync_payload("memory", sync_payload)
            self.state_manager.update_device_sync(self.device_id, time.time())
            
            logger.info(f"[SyncClient] Synced {len(memory_data)} memory entries")
            return {"status": "success", "synced_at": time.time(), "count": len(memory_data)}
            
        except Exception as e:
            logger.error(f"[SyncClient] Failed to sync memory: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}
    
    def sync_conversation(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sync conversation to other devices.
        
        Args:
            conversation_data: Conversation data to sync
            
        Returns:
            Sync result
        """
        try:
            conversation_json = json.dumps(conversation_data)
            encrypted = self.encryption.encrypt(conversation_json)
            
            sync_payload = {
                "type": "conversation",
                "device_id": self.device_id,
                "data": encrypted,
                "timestamp": time.time(),
                "version": "1.0"
            }
            
            self._store_sync_payload("conversation", sync_payload)
            self.state_manager.update_device_sync(self.device_id, time.time())
            
            logger.info("[SyncClient] Synced conversation")
            return {"status": "success", "synced_at": time.time()}
            
        except Exception as e:
            logger.error(f"[SyncClient] Failed to sync conversation: {e}", exc_info=True)
            return {"status": "error", "error": str(e)}
    
    def _store_sync_payload(self, data_type: str, payload: Dict[str, Any]):
        """Store sync payload locally (for future server sync)."""
        sync_dir = Path("progeny_root/core/sync/payloads")
        sync_dir.mkdir(parents=True, exist_ok=True)
        
        payload_file = sync_dir / f"{data_type}_{int(time.time())}.json"
        with open(payload_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
    
    def get_sync_status(self) -> Dict[str, Any]:
        """Get current sync status."""
        device_status = self.state_manager.get_device_status(self.device_id)
        
        return {
            "device_id": self.device_id,
            "last_sync": device_status.get("last_sync_ts", 0) if device_status else 0,
            "registered_devices": len(self.state_manager.list_devices()),
            "sync_enabled": self.sync_server_url is not None,
            "encryption_enabled": True
        }

