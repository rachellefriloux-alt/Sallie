"""Integration tests for complete system flows."""

import pytest
from pathlib import Path
import tempfile
import shutil

from core.identity import get_identity_system
from core.control import get_control_system
from core.agency import AgencySystem
from core.limbic import LimbicSystem
from core.retrieval import MemorySystem
from core.learning import LearningSystem
from core.monologue import MonologueSystem


class TestSystemIntegration:
    """Test complete system integration."""
    
    @pytest.fixture
    def systems(self):
        """Create all systems for integration testing."""
        limbic = LimbicSystem()
        memory = MemorySystem(use_local_storage=True)
        agency = AgencySystem(limbic)
        learning = LearningSystem(memory)
        monologue = MonologueSystem(limbic, memory)
        
        return {
            "limbic": limbic,
            "memory": memory,
            "agency": agency,
            "learning": learning,
            "monologue": monologue
        }
    
    def test_identity_control_integration(self, systems):
        """Test identity and control system integration."""
        identity = get_identity_system()
        control = get_control_system()
        
        # Identity should enforce principles even when control is active
        assert identity.enforce_always_confirm() is True
        assert identity.enforce_never_choose_for_creator() is True
        
        # Control should work independently
        control.emergency_stop("Test")
        assert control.can_proceed("test") is False
        
        control.resume_after_emergency_stop()
        assert control.can_proceed("test") is True
    
    def test_agency_limbic_integration(self, systems):
        """Test agency and limbic system integration."""
        agency = systems["agency"]
        limbic = systems["limbic"]
        
        # Trust level affects tier
        limbic.state.trust = 0.5
        assert agency.get_tier().value == "STRANGER"
        
        limbic.state.trust = 0.95
        assert agency.get_tier().value == "SURROGATE"
    
    def test_learning_memory_integration(self, systems):
        """Test learning and memory system integration."""
        learning = systems["learning"]
        memory = systems["memory"]
        
        # Learning should store in memory
        result = learning.read_and_analyze("Test content", source="test")
        assert result["status"] == "success" or result["status"] == "blocked"
        
        # Memory should be searchable
        memories = memory.retrieve("test content", limit=5)
        assert isinstance(memories, list)
    
    def test_monologue_complete_flow(self, systems):
        """Test complete monologue flow."""
        monologue = systems["monologue"]
        
        # Process should handle input
        result = monologue.process("Hello, Sallie!")
        
        assert "response" in result
        assert "limbic_state" in result
        assert "decision" in result
    
    def test_control_blocks_processing(self, systems):
        """Test that control mechanism blocks processing."""
        control = get_control_system()
        monologue = systems["monologue"]
        
        # Activate emergency stop
        control.emergency_stop("Test emergency")
        
        # Processing should be blocked
        result = monologue.process("Test input")
        assert result.get("decision", {}).get("blocked") is True or "controlled" in result.get("response", "").lower()
        
        # Resume
        control.resume_after_emergency_stop()
        
        # Processing should work again
        result = monologue.process("Test input")
        assert "response" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
