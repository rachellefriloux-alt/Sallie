"""
End-to-end tests for the Great Convergence onboarding flow.
"""

import pytest
import json
import time
from pathlib import Path
from typing import Dict, Any

from progeny_root.core.convergence import ConvergenceSystem, QUESTIONS
from progeny_root.core.limbic import LimbicSystem


@pytest.fixture
def limbic_system():
    """Create a fresh limbic system for testing."""
    return LimbicSystem()


@pytest.fixture
def convergence_system(limbic_system):
    """Create a convergence system for testing."""
    return ConvergenceSystem(limbic_system)


class TestConvergenceE2E:
    """End-to-end tests for complete Convergence flow."""

    def test_complete_onboarding_flow(self, convergence_system):
        """Test complete onboarding from start to finish."""
        # Start session
        convergence_system.start_session()
        assert convergence_system.limbic.state.elastic_mode is True
        assert convergence_system.session_state["started_at"] is not None

        # Answer all questions
        for i, question in enumerate(QUESTIONS):
            # Get current question
            current_question = convergence_system.get_next_question()
            assert current_question is not None
            assert current_question.id == question.id

            # Submit answer
            test_answer = f"This is a test answer for question {question.id}. " * 10
            convergence_system.submit_answer(test_answer)

            # Verify answer stored
            assert question.extraction_key in convergence_system.session_state["answers"]
            answer_data = convergence_system.session_state["answers"][question.extraction_key]
            assert "raw" in answer_data
            assert "extracted" in answer_data

        # Verify completion
        assert convergence_system.session_state["completed"] is True
        assert convergence_system.session_state["current_index"] == len(QUESTIONS)

        # Verify heritage files created
        heritage_dir = Path("progeny_root/limbic/heritage")
        assert (heritage_dir / "core.json").exists()
        assert (heritage_dir / "preferences.json").exists()
        assert (heritage_dir / "learned.json").exists()

        # Verify Elastic Mode exited
        assert convergence_system.limbic.state.elastic_mode is False

    def test_partial_completion_and_resume(self, convergence_system):
        """Test partial completion and resume functionality."""
        # Start session
        convergence_system.start_session()

        # Answer first 5 questions
        for i in range(5):
            question = convergence_system.get_next_question()
            if question:
                convergence_system.submit_answer(f"Answer {i+1}")

        # Save session
        convergence_system._save_session()

        # Create new convergence system (simulating resume)
        new_convergence = ConvergenceSystem(convergence_system.limbic)

        # Verify session loaded
        assert new_convergence.session_state["current_index"] == 5
        assert not new_convergence.session_state["completed"]

        # Continue answering
        for i in range(5, len(QUESTIONS)):
            question = new_convergence.get_next_question()
            if question:
                new_convergence.submit_answer(f"Answer {i+1}")

        # Verify completion
        assert new_convergence.session_state["completed"] is True

    def test_extraction_failure_handling(self, convergence_system, monkeypatch):
        """Test handling of extraction failures."""
        convergence_system.start_session()

        # Mock extraction to fail
        def mock_extract(*args, **kwargs):
            raise Exception("Extraction failed")

        monkeypatch.setattr(convergence_system, "_extract_insights", mock_extract)

        # Submit answer - should still work with fallback
        question = convergence_system.get_next_question()
        convergence_system.submit_answer("Test answer")

        # Verify answer stored even if extraction failed
        assert question.extraction_key in convergence_system.session_state["answers"]

    def test_heritage_compilation(self, convergence_system):
        """Test heritage compilation creates all required files."""
        convergence_system.start_session()

        # Answer all questions with meaningful answers
        for question in QUESTIONS:
            test_answer = f"Detailed answer for {question.purpose}. " * 20
            convergence_system.submit_answer(test_answer)

        # Verify heritage files
        heritage_dir = Path("progeny_root/limbic/heritage")
        assert (heritage_dir / "core.json").exists()
        assert (heritage_dir / "preferences.json").exists()
        assert (heritage_dir / "learned.json").exists()
        assert (heritage_dir / "avatar.json").exists()
        assert (heritage_dir / "convergence_summary.json").exists()

        # Verify file contents
        with open(heritage_dir / "core.json", "r") as f:
            core_data = json.load(f)
            assert "version" in core_data
            assert "identity" in core_data
            assert "shadow" in core_data

        with open(heritage_dir / "preferences.json", "r") as f:
            pref_data = json.load(f)
            assert "version" in pref_data
            assert "support" in pref_data

        with open(heritage_dir / "learned.json", "r") as f:
            learned_data = json.load(f)
            assert "version" in learned_data
            assert "learned_beliefs" in learned_data

    def test_mirror_test_dynamic_generation(self, convergence_system):
        """Test that Q13 Mirror Test is dynamically generated."""
        convergence_system.start_session()

        # Answer questions 1-12
        for i in range(12):
            question = convergence_system.get_next_question()
            if question:
                convergence_system.submit_answer(f"Answer for question {question.id}")

        # Get Q13 - should be dynamically generated
        question_13 = convergence_system.get_next_question()
        assert question_13 is not None
        assert question_13.id == 13

        # Mirror test should be personalized based on previous answers
        mirror_text = convergence_system._generate_mirror_test()
        assert len(mirror_text) > 0
        assert "I see you as" in mirror_text or "Am I seeing" in mirror_text

    def test_limbic_state_updates_during_convergence(self, convergence_system):
        """Test that limbic state updates correctly during Convergence."""
        initial_trust = convergence_system.limbic.state.trust
        initial_warmth = convergence_system.limbic.state.warmth

        convergence_system.start_session()
        assert convergence_system.limbic.state.elastic_mode is True

        # Answer with deep answer (should increase trust/warmth)
        question = convergence_system.get_next_question()
        deep_answer = "This is a very detailed and thoughtful answer. " * 50
        convergence_system.submit_answer(deep_answer)

        # Verify limbic state increased (Elastic Mode allows larger changes)
        assert convergence_system.limbic.state.trust > initial_trust
        assert convergence_system.limbic.state.warmth > initial_warmth

    def test_convergence_validation(self, convergence_system):
        """Test that heritage is validated before allowing system use."""
        convergence_system.start_session()

        # Complete convergence
        for question in QUESTIONS:
            convergence_system.submit_answer(f"Answer for {question.id}")

        # Verify heritage files exist and are valid JSON
        heritage_dir = Path("progeny_root/limbic/heritage")
        for filename in ["core.json", "preferences.json", "learned.json"]:
            file_path = heritage_dir / filename
            assert file_path.exists()
            with open(file_path, "r") as f:
                data = json.load(f)
                assert "version" in data

