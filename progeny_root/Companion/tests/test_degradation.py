"""Tests for degradation system."""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.degradation import DegradationSystem, SystemHealthState


class TestDegradationSystem:
    """Tests for degradation system."""
    
    def test_init(self):
        """Test DegradationSystem initialization."""
        system = DegradationSystem()
        assert system._current_state == SystemHealthState.FULL
    
    @patch('requests.get')
    def test_check_health_full(self, mock_get):
        """Test health check when all services are up."""
        # Mock successful responses
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {}
        
        system = DegradationSystem()
        state = system.check_health()
        
        assert state == SystemHealthState.FULL
    
    @patch('requests.get')
    def test_check_health_amnesia(self, mock_get):
        """Test health check when Qdrant is down."""
        def side_effect(url, **kwargs):
            mock = Mock()
            if "6333" in url:  # Qdrant
                raise Exception("Connection refused")
            mock.status_code = 200
            return mock
        
        mock_get.side_effect = side_effect
        
        system = DegradationSystem()
        state = system.check_health()
        
        assert state == SystemHealthState.AMNESIA
    
    @patch('requests.get')
    def test_check_health_offline(self, mock_get):
        """Test health check when Ollama is down."""
        def side_effect(url, **kwargs):
            mock = Mock()
            if "11434" in url:  # Ollama
                raise Exception("Connection refused")
            mock.status_code = 200
            return mock
        
        mock_get.side_effect = side_effect
        
        system = DegradationSystem()
        state = system.check_health()
        
        assert state == SystemHealthState.OFFLINE
    
    def test_get_behavior_modifications_full(self):
        """Test behavior modifications for FULL state."""
        system = DegradationSystem()
        system._current_state = SystemHealthState.FULL
        
        mods = system.get_behavior_modifications()
        assert mods.get("capabilities_retained") is not None
        assert "llm_processing" in mods.get("capabilities_retained", [])
    
    def test_get_behavior_modifications_amnesia(self):
        """Test behavior modifications for AMNESIA state."""
        system = DegradationSystem()
        system._current_state = SystemHealthState.AMNESIA
        
        mods = system.get_behavior_modifications()
        assert "memory_retrieval" not in mods.get("capabilities_retained", [])
        assert "heritage_access" in mods.get("capabilities_retained", [])

