"""Tests for smart home integration."""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.smart_home import (
    HomeAssistantHub,
    SmartHomeAPI,
    AlexaIntegration,
    GoogleHomeIntegration,
)


class TestHomeAssistantHub:
    """Tests for Home Assistant hub."""
    
    def test_init(self):
        """Test HomeAssistantHub initialization."""
        hub = HomeAssistantHub(
            base_url="http://localhost:8123",
            access_token="test_token"
        )
        assert hub.base_url == "http://localhost:8123"
        assert hub.access_token == "test_token"
    
    @patch('requests.get')
    def test_get_devices(self, mock_get):
        """Test getting devices from Home Assistant."""
        mock_get.return_value.json.return_value = [
            {"entity_id": "light.living_room", "state": "on"},
            {"entity_id": "switch.kitchen", "state": "off"},
        ]
        mock_get.return_value.raise_for_status = Mock()
        
        hub = HomeAssistantHub(
            base_url="http://localhost:8123",
            access_token="test_token"
        )
        devices = hub.get_devices()
        
        assert len(devices) == 2
        assert devices[0]["entity_id"] == "light.living_room"
    
    @patch('requests.post')
    def test_control_device(self, mock_post):
        """Test controlling a device."""
        mock_post.return_value.json.return_value = {"success": True}
        mock_post.return_value.raise_for_status = Mock()
        
        hub = HomeAssistantHub(
            base_url="http://localhost:8123",
            access_token="test_token"
        )
        result = hub.control_device("light.living_room", "turn_on")
        
        assert "error" not in result or result.get("success") is True


class TestPlatformIntegrations:
    """Tests for platform integrations."""
    
    def test_alexa_init(self):
        """Test Alexa integration initialization."""
        alexa = AlexaIntegration(api_key="test_key")
        assert alexa.api_key == "test_key"
    
    def test_google_home_init(self):
        """Test Google Home integration initialization."""
        google = GoogleHomeIntegration(api_key="test_key")
        assert google.api_key == "test_key"
    
    def test_alexa_control_device(self):
        """Test Alexa device control."""
        alexa = AlexaIntegration()
        result = alexa.control_device("light", "turn_on")
        assert result["status"] == "success"


class TestSmartHomeAPI:
    """Tests for unified Smart Home API."""
    
    def test_init(self):
        """Test SmartHomeAPI initialization."""
        api = SmartHomeAPI(
            home_assistant_url="http://localhost:8123",
            home_assistant_token="test_token"
        )
        assert api.hub is not None
        assert api.alexa is not None
        assert api.google_home is not None
        assert api.homekit is not None
        assert api.copilot is not None
    
    def test_get_all_devices(self):
        """Test getting devices from all platforms."""
        api = SmartHomeAPI()
        devices = api.get_all_devices()
        
        assert "home_assistant" in devices
        assert "alexa" in devices
        assert "google_home" in devices
        assert "homekit" in devices
        assert "copilot" in devices
    
    def test_control_device(self):
        """Test controlling device via unified API."""
        api = SmartHomeAPI()
        result = api.control_device("light", "turn_on", platform="alexa")
        assert result["status"] == "success"

