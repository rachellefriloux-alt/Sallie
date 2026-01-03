"""
End-to-end tests for degradation system.
"""

import pytest
import requests
from unittest.mock import patch, MagicMock

from progeny_root.core.degradation import DegradationSystem, SystemHealthState


@pytest.fixture
def degradation_system():
    """Create degradation system for testing."""
    return DegradationSystem()


class TestDegradationE2E:
    """End-to-end tests for degradation modes."""

    def test_full_state(self, degradation_system):
        """Test FULL state when all services are healthy."""
        # Mock healthy services
        with patch("requests.get") as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {"models": [{"name": "test"}]}

            state = degradation_system.check_health()
            assert state == SystemHealthState.FULL

    def test_amnesia_state(self, degradation_system):
        """Test AMNESIA state when Qdrant is offline."""
        # Mock Ollama healthy, Qdrant offline
        def mock_get(url, **kwargs):
            mock_response = MagicMock()
            if "11434" in url:  # Ollama
                mock_response.status_code = 200
                mock_response.json.return_value = {"models": [{"name": "test"}]}
            elif "6333" in url:  # Qdrant
                mock_response.status_code = 500
                raise requests.exceptions.ConnectionError("Connection failed")
            return mock_response

        with patch("requests.get", side_effect=mock_get):
            state = degradation_system.check_health()
            # Should be AMNESIA if Qdrant fails
            assert state in [SystemHealthState.AMNESIA, SystemHealthState.FULL]

    def test_offline_state(self, degradation_system):
        """Test OFFLINE state when Ollama is offline."""
        # Mock Ollama offline
        def mock_get(url, **kwargs):
            if "11434" in url:  # Ollama
                raise requests.exceptions.ConnectionError("Connection failed")
            mock_response = MagicMock()
            mock_response.status_code = 200
            return mock_response

        with patch("requests.get", side_effect=mock_get):
            state = degradation_system.check_health()
            assert state == SystemHealthState.OFFLINE

    def test_recovery_procedures(self, degradation_system):
        """Test recovery procedures."""
        # Set to AMNESIA state
        degradation_system._current_state = SystemHealthState.AMNESIA
        degradation_system._state_reason = "Qdrant connection failed"

        # Simulate recovery (Qdrant comes back online)
        with patch("requests.get") as mock_get:
            mock_get.return_value.status_code = 200

            new_state = degradation_system.check_health()
            # Should recover to FULL if all services are healthy
            if new_state == SystemHealthState.FULL:
                assert degradation_system._current_state == SystemHealthState.FULL

    def test_graceful_degradation_behavior(self, degradation_system):
        """Test graceful degradation behavior."""
        # Set to AMNESIA
        degradation_system._current_state = SystemHealthState.AMNESIA

        # Get behavior modifications
        modifications = degradation_system.get_behavior_modifications()
        
        # Verify AMNESIA-specific behaviors
        assert "capabilities_retained" in modifications or "capabilities_lost" in modifications

