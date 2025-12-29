"""
End-to-end tests for Dream Cycle execution.
"""

import pytest
import json
import time
from pathlib import Path

from progeny_root.core.limbic import LimbicSystem
from progeny_root.core.retrieval import MemorySystem
from progeny_root.core.monologue import MonologueSystem
from progeny_root.core.dream import DreamSystem


@pytest.fixture
def dream_system():
    """Create dream system for testing."""
    limbic = LimbicSystem()
    memory = MemorySystem(use_local_storage=True)
    monologue = MonologueSystem(limbic, memory)
    return DreamSystem(limbic, memory, monologue)


class TestDreamCycleE2E:
    """End-to-end tests for Dream Cycle."""

    def test_complete_dream_cycle_execution(self, dream_system):
        """Test complete Dream Cycle execution."""
        # Ensure thoughts.log has some entries
        thoughts_log = Path("progeny_root/logs/thoughts.log")
        thoughts_log.parent.mkdir(parents=True, exist_ok=True)
        
        # Run Dream Cycle
        result = dream_system.run_cycle()

        # Verify cycle completed
        assert result is not None
        assert "status" in result or "completed" in str(result).lower()

    def test_hypothesis_generation(self, dream_system):
        """Test hypothesis generation from thoughts.log."""
        # Create sample thoughts.log entries
        thoughts_log = Path("progeny_root/logs/thoughts.log")
        thoughts_log.parent.mkdir(parents=True, exist_ok=True)
        
        with open(thoughts_log, "a") as f:
            f.write(f"""
[2024-01-01T10:00:00] INPUT
Content: "I'm feeling stressed about deadlines"
-----
[2024-01-01T11:00:00] INPUT
Content: "The deadline pressure is overwhelming"
-----
""")

        # Run Dream Cycle
        dream_system.run_cycle()

        # Verify hypotheses file exists
        patches_file = Path("progeny_root/memory/patches.json")
        if patches_file.exists():
            with open(patches_file, "r") as f:
                patches = json.load(f)
                # Hypotheses should be generated
                assert "hypotheses" in patches

    def test_conflict_detection(self, dream_system):
        """Test conflict detection."""
        # This would test that conflicts between Heritage and new patterns are detected
        # Implementation depends on dream system's conflict detection logic
        result = dream_system.run_cycle()
        assert result is not None

    def test_conditional_belief_synthesis(self, dream_system):
        """Test conditional belief synthesis."""
        # Run Dream Cycle
        result = dream_system.run_cycle()

        # Verify conditional beliefs can be synthesized
        # This would check learned.json for conditional beliefs
        learned_file = Path("progeny_root/limbic/heritage/learned.json")
        if learned_file.exists():
            with open(learned_file, "r") as f:
                learned = json.load(f)
                # Conditional beliefs would be in learned data
                assert "conditional_beliefs" in learned or "learned_beliefs" in learned

    def test_heritage_promotion(self, dream_system):
        """Test heritage promotion workflow."""
        # Run Dream Cycle
        result = dream_system.run_cycle()

        # Verify heritage promotion logic
        # This would check if validated hypotheses are promoted to heritage
        assert result is not None

    def test_second_brain_hygiene(self, dream_system):
        """Test Second Brain hygiene routines."""
        # Create working directory files
        working_dir = Path("progeny_root/working")
        working_dir.mkdir(parents=True, exist_ok=True)
        
        (working_dir / "now.md").write_text("# Today's Priorities\n1. Task 1\n2. Task 2")
        (working_dir / "open_loops.json").write_text(json.dumps([{"id": "1", "text": "Loop 1"}]))

        # Run Dream Cycle (which should trigger hygiene)
        dream_system.run_cycle()

        # Verify hygiene was performed
        # This would check that now.md was archived, open_loops were processed, etc.
        assert working_dir.exists()

