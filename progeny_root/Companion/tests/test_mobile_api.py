"""Tests for mobile API endpoints."""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.api.push_notifications import PushTokenUpdate, update_push_token, send_push_notification
from core.api.device_management import DeviceRegistration, register_device, get_device_status


class TestPushNotifications:
    """Tests for push notification API."""
    
    def test_push_token_update_model(self):
        """Test PushTokenUpdate Pydantic model."""
        token_data = PushTokenUpdate(
            device_id="test_device",
            token="test_token",
            platform="ios"
        )
        assert token_data.device_id == "test_device"
        assert token_data.token == "test_token"
        assert token_data.platform == "ios"
    
    def test_update_push_token(self):
        """Test updating push token."""
        token_data = PushTokenUpdate(
            device_id="test_device",
            token="new_token",
            platform="android"
        )
        result = update_push_token(token_data)
        assert result["status"] == "success"
        assert result["device_id"] == "test_device"
    
    def test_send_push_notification(self):
        """Test sending push notification."""
        result = send_push_notification(
            device_id="test_device",
            title="Test",
            message="Test message"
        )
        assert result["status"] == "success"


class TestDeviceManagement:
    """Tests for device management API."""
    
    def test_device_registration_model(self):
        """Test DeviceRegistration Pydantic model."""
        device = DeviceRegistration(
            device_id="test_device",
            platform="ios",
            name="Test iPhone",
            version="17.0"
        )
        assert device.device_id == "test_device"
        assert device.platform == "ios"
    
    def test_register_device(self):
        """Test device registration."""
        device = DeviceRegistration(
            device_id="test_device",
            platform="android",
            name="Test Android"
        )
        result = register_device(device)
        assert result["status"] == "success"
        assert result["device_id"] == "test_device"
    
    def test_get_device_status(self):
        """Test getting device status."""
        # First register a device
        device = DeviceRegistration(
            device_id="test_device",
            platform="ios"
        )
        register_device(device)
        
        # Then get status
        status = get_device_status("test_device")
        assert status is not None
        assert status.get("device_id") == "test_device"
    
    def test_get_nonexistent_device(self):
        """Test getting status for nonexistent device."""
        status = get_device_status("nonexistent_device")
        assert status is None

