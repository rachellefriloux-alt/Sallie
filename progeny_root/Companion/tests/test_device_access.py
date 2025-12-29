"""Tests for device access APIs."""

import pytest
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.device_access import (
    FileSystemAccess,
    AppControl,
    SystemInfo,
    PermissionManager,
)


class TestFileSystemAccess:
    """Tests for file system access."""
    
    def test_init_with_whitelist_blacklist(self):
        """Test initialization with whitelist and blacklist."""
        fs = FileSystemAccess(
            whitelist=["./test_whitelist"],
            blacklist=["./test_blacklist"]
        )
        assert len(fs.whitelist) == 1
        assert len(fs.blacklist) == 1
    
    def test_permission_check_whitelist(self, tmp_path):
        """Test permission check with whitelist."""
        whitelist_dir = tmp_path / "allowed"
        whitelist_dir.mkdir()
        
        fs = FileSystemAccess(
            whitelist=[str(whitelist_dir)],
            blacklist=[]
        )
        
        test_file = whitelist_dir / "test.txt"
        test_file.write_text("test")
        
        assert fs._check_permission(test_file) is True
    
    def test_permission_check_blacklist(self, tmp_path):
        """Test permission check with blacklist."""
        whitelist_dir = tmp_path / "allowed"
        blacklist_dir = tmp_path / "forbidden"
        whitelist_dir.mkdir()
        blacklist_dir.mkdir()
        
        fs = FileSystemAccess(
            whitelist=[str(whitelist_dir)],
            blacklist=[str(blacklist_dir)]
        )
        
        forbidden_file = blacklist_dir / "test.txt"
        forbidden_file.write_text("test")
        
        assert fs._check_permission(forbidden_file) is False


class TestAppControl:
    """Tests for app control."""
    
    def test_init(self):
        """Test AppControl initialization."""
        app_control = AppControl()
        assert app_control.platform is not None
    
    def test_launch_app_invalid(self):
        """Test launching invalid app."""
        app_control = AppControl()
        result = app_control.launch_app("nonexistent_app_12345")
        # Should return error or handle gracefully
        assert "status" in result


class TestSystemInfo:
    """Tests for system info."""
    
    def test_get_device_status(self):
        """Test getting device status."""
        sys_info = SystemInfo()
        status = sys_info.get_device_status()
        assert "platform" in status
        assert "timestamp" in status
    
    def test_get_system_resources(self):
        """Test getting system resources."""
        sys_info = SystemInfo()
        resources = sys_info.get_system_resources()
        assert "cpu" in resources
        assert "memory" in resources
        assert "disk" in resources


class TestPermissionManager:
    """Tests for permission management."""
    
    def test_init(self, tmp_path):
        """Test PermissionManager initialization."""
        perm_file = tmp_path / "permissions.json"
        pm = PermissionManager(permissions_file=perm_file)
        assert pm.permissions is not None
    
    def test_grant_permission(self, tmp_path):
        """Test granting permission."""
        perm_file = tmp_path / "permissions.json"
        pm = PermissionManager(permissions_file=perm_file)
        
        from core.device_access.permissions import PermissionType
        
        result = pm.grant_permission("test_device", PermissionType.FILE_READ)
        assert result is True
        assert pm.check_permission("test_device", PermissionType.FILE_READ) is True
    
    def test_revoke_permission(self, tmp_path):
        """Test revoking permission."""
        perm_file = tmp_path / "permissions.json"
        pm = PermissionManager(permissions_file=perm_file)
        
        from core.device_access.permissions import PermissionType
        
        pm.grant_permission("test_device", PermissionType.FILE_READ)
        result = pm.revoke_permission("test_device", PermissionType.FILE_READ)
        assert result is True
        assert pm.check_permission("test_device", PermissionType.FILE_READ) is False

