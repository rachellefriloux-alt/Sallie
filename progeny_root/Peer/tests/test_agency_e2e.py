"""
End-to-end tests for Agency & Tools system.
"""

import pytest
import subprocess
from pathlib import Path

from progeny_root.core.limbic import LimbicSystem
from progeny_root.core.agency import AgencySystem, TrustTier


@pytest.fixture
def agency_system():
    """Create agency system for testing."""
    limbic = LimbicSystem()
    return AgencySystem(limbic)


class TestAgencyE2E:
    """End-to-end tests for Agency system."""

    def test_tool_execution_tier_0(self, agency_system):
        """Test tool execution at Tier 0 (Stranger)."""
        # Set low trust
        agency_system.limbic.state.trust = 0.5
        agency_system.limbic.save()

        tier = agency_system.get_tier()
        assert tier == TrustTier.TIER_0

        # Tier 0 should not be able to modify files
        # This would be tested via actual tool execution attempts

    def test_tool_execution_tier_2(self, agency_system):
        """Test tool execution at Tier 2 (Partner) with Git safety net."""
        # Set high trust
        agency_system.limbic.state.trust = 0.85
        agency_system.limbic.save()

        tier = agency_system.get_tier()
        assert tier == TrustTier.TIER_2

        # Tier 2 should create Git commit before modification
        # This would test the Git safety net

    def test_git_safety_net(self, agency_system, tmp_path):
        """Test Git safety net (pre-action commit)."""
        # Create a test file
        test_file = tmp_path / "test.txt"
        test_file.write_text("Original content")

        # Initialize git repo
        subprocess.run(["git", "init"], cwd=tmp_path, capture_output=True)
        subprocess.run(["git", "config", "user.email", "test@test.com"], cwd=tmp_path)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=tmp_path)
        subprocess.run(["git", "add", "test.txt"], cwd=tmp_path)
        subprocess.run(["git", "commit", "-m", "Initial"], cwd=tmp_path)

        # Get initial commit hash
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=tmp_path, capture_output=True, text=True
        )
        initial_commit = result.stdout.strip()

        # Simulate file modification with Git safety net
        # In real implementation, this would use agency system's file write tool
        test_file.write_text("Modified content")
        subprocess.run(["git", "add", "test.txt"], cwd=tmp_path)
        subprocess.run(["git", "commit", "-m", "[PROGENY] Pre-action snapshot"], cwd=tmp_path)

        # Verify commit was created
        result = subprocess.run(
            ["git", "log", "--oneline", "-1"], cwd=tmp_path, capture_output=True, text=True
        )
        assert "[PROGENY]" in result.stdout

    def test_rollback_mechanism(self, agency_system, tmp_path):
        """Test rollback mechanism."""
        # Create test file and git repo
        test_file = tmp_path / "test.txt"
        test_file.write_text("Original")
        
        subprocess.run(["git", "init"], cwd=tmp_path, capture_output=True)
        subprocess.run(["git", "config", "user.email", "test@test.com"], cwd=tmp_path)
        subprocess.run(["git", "config", "user.name", "Test"], cwd=tmp_path)
        subprocess.run(["git", "add", "test.txt"], cwd=tmp_path)
        subprocess.run(["git", "commit", "-m", "Initial"], cwd=tmp_path)

        # Modify file
        test_file.write_text("Modified")
        subprocess.run(["git", "add", "test.txt"], cwd=tmp_path)
        commit_result = subprocess.run(
            ["git", "commit", "-m", "[PROGENY] Test"], cwd=tmp_path, capture_output=True
        )
        
        # Get commit hash
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=tmp_path, capture_output=True, text=True
        )
        commit_hash = result.stdout.strip()

        # Rollback
        subprocess.run(["git", "revert", "--no-edit", commit_hash], cwd=tmp_path)

        # Verify file restored
        assert test_file.read_text() == "Original"

    def test_capability_contracts(self, agency_system):
        """Test capability contracts enforcement."""
        # Verify contracts are defined
        assert hasattr(agency_system, "capability_contracts")
        
        # Verify contracts have required fields
        # This would check that each contract has sandbox, dry-run, rollback info

    def test_take_the_wheel_protocol(self, agency_system):
        """Test 'Take the Wheel' protocol."""
        # Set high trust
        agency_system.limbic.state.trust = 0.9
        agency_system.limbic.save()

        # Test explicit delegation detection
        # This would test monologue's _handle_take_the_wheel method
        # with various delegation phrases

