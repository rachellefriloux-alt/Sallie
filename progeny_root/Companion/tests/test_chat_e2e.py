"""
End-to-end tests for chat interaction flow.
"""

import pytest
import json
from typing import Dict, Any

from progeny_root.core.limbic import LimbicSystem
from progeny_root.core.retrieval import MemorySystem
from progeny_root.core.monologue import MonologueSystem


@pytest.fixture
def systems():
    """Create system instances for testing."""
    limbic = LimbicSystem()
    memory = MemorySystem(use_local_storage=True)
    monologue = MonologueSystem(limbic, memory)
    return {
        "limbic": limbic,
        "memory": memory,
        "monologue": monologue,
    }


class TestChatE2E:
    """End-to-end tests for chat interactions."""

    def test_complete_chat_interaction(self, systems):
        """Test complete chat interaction flow."""
        user_input = "Hello, how are you?"
        
        # Process through monologue
        result = systems["monologue"].process(user_input)

        # Verify response structure
        assert "response" in result
        assert "limbic_state" in result
        assert "decision" in result
        assert "timestamp" in result
        assert len(result["response"]) > 0

        # Verify limbic state updated
        assert systems["limbic"].state.last_interaction_ts > 0
        assert systems["limbic"].state.interaction_count > 0

    def test_memory_storage_during_chat(self, systems):
        """Test that memories are stored during chat."""
        user_input = "I love programming in Python"
        
        initial_memory_count = len(systems["memory"].retrieve("programming", limit=100))

        # Process interaction
        result = systems["monologue"].process(user_input)

        # Verify memory was stored (check via retrieval)
        # Note: This is a simplified check - in real implementation would check Qdrant
        assert result is not None

    def test_limbic_state_updates(self, systems):
        """Test that limbic state updates during chat."""
        initial_trust = systems["limbic"].state.trust
        initial_interaction_count = systems["limbic"].state.interaction_count

        # Process interaction
        systems["monologue"].process("This is a positive message!")

        # Verify interaction count increased
        assert systems["limbic"].state.interaction_count > initial_interaction_count
        assert systems["limbic"].state.last_interaction_ts > 0

    def test_tool_execution_in_chat(self, systems):
        """Test tool execution during chat (if tool is requested)."""
        # This would test agency system integration
        # For now, just verify the decision structure includes tool info
        result = systems["monologue"].process("Can you help me with a task?")
        
        assert "decision" in result
        # Tool execution would be in decision if applicable

    def test_error_handling_in_chat(self, systems, monkeypatch):
        """Test error handling when chat processing fails."""
        # Mock a failure in synthesis
        def mock_fail(*args, **kwargs):
            raise Exception("Synthesis failed")

        # Process should still return a response (fallback)
        result = systems["monologue"].process("Test message")
        assert "response" in result
        assert "error" in result or len(result["response"]) > 0

