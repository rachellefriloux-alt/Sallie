"""Tests for sync infrastructure."""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.sync.sync_encryption import encrypt_data, decrypt_data, generate_key, derive_key
from core.sync.sync_state import SyncState, SyncStateManager
from core.sync.sync_conflict import resolve_conflict


class TestSyncEncryption:
    """Tests for sync encryption."""
    
    def test_generate_key(self):
        """Test key generation."""
        key = generate_key()
        assert len(key) == 32  # 32 bytes for NaCl
    
    def test_derive_key(self):
        """Test key derivation."""
        password = "test_password"
        salt = b"test_salt_12345678"  # 16 bytes
        key = derive_key(password, salt)
        assert len(key) == 32
    
    def test_encrypt_decrypt(self):
        """Test encryption and decryption."""
        key = generate_key()
        data = b"test data"
        
        encrypted = encrypt_data(data, key)
        assert encrypted != data
        assert len(encrypted) > len(data)
        
        decrypted = decrypt_data(encrypted, key)
        assert decrypted == data
    
    def test_encrypt_decrypt_string(self):
        """Test encryption/decryption with string data."""
        key = generate_key()
        data = "test string data"
        
        encrypted = encrypt_data(data.encode('utf-8'), key)
        decrypted = decrypt_data(encrypted, key)
        
        assert decrypted.decode('utf-8') == data


class TestSyncState:
    """Tests for sync state management."""
    
    def test_sync_state_model(self):
        """Test SyncState Pydantic model."""
        state = SyncState(
            device_id="test_device",
            last_sync=1234567890.0,
            sync_enabled=True
        )
        assert state.device_id == "test_device"
        assert state.last_sync == 1234567890.0
        assert state.sync_enabled is True
    
    def test_sync_state_manager_init(self, tmp_path):
        """Test SyncStateManager initialization."""
        state_file = tmp_path / "sync_state.json"
        manager = SyncStateManager(state_file=state_file)
        assert manager.state_file == state_file
    
    def test_sync_state_manager_save_load(self, tmp_path):
        """Test saving and loading sync state."""
        state_file = tmp_path / "sync_state.json"
        manager = SyncStateManager(state_file=state_file)
        
        state = SyncState(
            device_id="test_device",
            last_sync=1234567890.0,
            sync_enabled=True
        )
        manager.save_state(state)
        
        loaded = manager.load_state()
        assert loaded.device_id == "test_device"
        assert loaded.last_sync == 1234567890.0


class TestSyncConflict:
    """Tests for conflict resolution."""
    
    def test_resolve_conflict_last_write_wins(self):
        """Test last-write-wins conflict resolution."""
        local_data = {"value": "local", "timestamp": 1000}
        remote_data = {"value": "remote", "timestamp": 2000}
        
        result = resolve_conflict(local_data, remote_data, strategy="last_write_wins")
        assert result["value"] == "remote"  # Remote is newer
    
    def test_resolve_conflict_local_wins(self):
        """Test local-wins conflict resolution."""
        local_data = {"value": "local", "timestamp": 2000}
        remote_data = {"value": "remote", "timestamp": 1000}
        
        result = resolve_conflict(local_data, remote_data, strategy="last_write_wins")
        assert result["value"] == "local"  # Local is newer

