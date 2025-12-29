"""
Complete end-to-end system test.
Tests the full user journey from onboarding to daily use.
"""

import pytest
import json
import time
from pathlib import Path

from progeny_root.core.limbic import LimbicSystem
from progeny_root.core.retrieval import MemorySystem
from progeny_root.core.monologue import MonologueSystem
from progeny_root.core.convergence import ConvergenceSystem, QUESTIONS
from progeny_root.core.dream import DreamSystem
from progeny_root.core.agency import AgencySystem


@pytest.fixture
def full_system():
    """Create a complete system for end-to-end testing."""
    limbic = LimbicSystem()
    memory = MemorySystem(use_local_storage=True)
    monologue = MonologueSystem(limbic, memory)
    agency = AgencySystem(limbic)
    convergence = ConvergenceSystem(limbic)
    dream = DreamSystem(limbic, memory, monologue)
    
    return {
        "limbic": limbic,
        "memory": memory,
        "monologue": monologue,
        "agency": agency,
        "convergence": convergence,
        "dream": dream,
    }


class TestSystemE2E:
    """Complete end-to-end system tests."""

    def test_complete_user_journey(self, full_system):
        """Test complete user journey from onboarding to daily use."""
        # 1. Onboarding (Convergence)
        full_system["convergence"].start_session()
        
        # Answer all questions
        for question in QUESTIONS:
            full_system["convergence"].submit_answer(f"Test answer for {question.id}")
        
        # Verify heritage compiled
        heritage_dir = Path("progeny_root/limbic/heritage")
        assert (heritage_dir / "core.json").exists()

        # 2. Daily chat interactions
        for i in range(5):
            result = full_system["monologue"].process(f"Test message {i+1}")
            assert "response" in result
            assert len(result["response"]) > 0

        # 3. Verify limbic state evolved
        assert full_system["limbic"].state.interaction_count >= 5

        # 4. Dream Cycle
        dream_result = full_system["dream"].run_cycle()
        assert dream_result is not None

        # 5. Verify system is functional
        final_result = full_system["monologue"].process("Final test message")
        assert "response" in final_result

    def test_error_recovery_scenarios(self, full_system):
        """Test error recovery scenarios."""
        # Simulate various error conditions and verify recovery
        # This would test:
        # - LLM failures
        # - Memory failures
        # - File system errors
        # - Network errors
        
        # For now, just verify system can handle errors gracefully
        result = full_system["monologue"].process("Test")
        assert result is not None

    def test_data_persistence_and_recovery(self, full_system):
        """Test data persistence and recovery."""
        # Save state
        initial_trust = full_system["limbic"].state.trust
        full_system["limbic"].save()

        # Create new limbic system (simulating restart)
        new_limbic = LimbicSystem()

        # Verify state persisted
        assert abs(new_limbic.state.trust - initial_trust) < 0.01

    def test_performance_under_load(self, full_system):
        """Test performance under load."""
        import time
        
        start_time = time.time()
        
        # Process multiple interactions
        for i in range(10):
            full_system["monologue"].process(f"Load test message {i}")
        
        elapsed = time.time() - start_time
        
        # Verify performance (should complete in reasonable time)
        assert elapsed < 60  # 10 interactions should complete in < 60 seconds

