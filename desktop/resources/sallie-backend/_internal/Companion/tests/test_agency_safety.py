"""Tests for Git Safety Net and Rollback System."""

import pytest
import json
import tempfile
import shutil
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

from core.agency import AgencySystem, ActionLogEntry
from core.limbic import LimbicSystem
from core.tools import ToolRegistry


class TestGitSafetyNet:
    """Test Git Safety Net functionality."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for tests."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)
    
    @pytest.fixture
    def limbic_system(self):
        """Create limbic system for testing."""
        return LimbicSystem()
    
    @pytest.fixture
    def agency_system(self, limbic_system):
        """Create agency system for testing."""
        return AgencySystem(limbic_system)
    
    def test_pre_action_commit_creation(self, agency_system, limbic_system, temp_dir):
        """Test that pre-action commits are created for Tier 2+ file modifications."""
        # Set to Partner tier (Tier 2)
        limbic_system.state.trust = 0.85
        
        # Mock git operations
        with patch('core.tools.subprocess.run') as mock_run:
            mock_run.return_value = MagicMock(stdout="abc123", returncode=0)
            
            # Mock _get_latest_commit_hash
            with patch.object(agency_system.tools, '_get_latest_commit_hash', return_value="abc123"):
                commit_hash = agency_system._create_pre_action_commit("write_file", {"path": "test.txt"})
                
                # Should create commit for Tier 2+
                assert commit_hash == "abc123"
                assert mock_run.called
    
    def test_no_pre_action_commit_below_tier_2(self, agency_system, limbic_system):
        """Test that pre-action commits are NOT created below Tier 2."""
        # Set to Associate tier (Tier 1)
        limbic_system.state.trust = 0.7
        
        commit_hash = agency_system._create_pre_action_commit("write_file", {"path": "test.txt"})
        
        # Should return None for Tier 1
        assert commit_hash is None
    
    def test_action_log_entry_creation(self, agency_system):
        """Test ActionLogEntry model creation."""
        entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="action_1",
            action_type="write",
            tool_name="write_file",
            args={"path": "test.txt"},
            commit_hash="abc123",
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        
        assert entry.action_id == "action_1"
        assert entry.commit_hash == "abc123"
        assert entry.rollback_applied is False
    
    def test_action_logging(self, agency_system, limbic_system):
        """Test that actions are logged to action log."""
        limbic_system.state.trust = 0.85  # Partner tier
        
        initial_log_count = len(agency_system.action_log)
        
        # Mock tool execution
        with patch.object(agency_system.tools, 'has_tool', return_value=True):
            with patch.object(agency_system.tools, 'run', return_value="Success"):
                with patch.object(agency_system, '_create_pre_action_commit', return_value="abc123"):
                    with patch.object(agency_system, '_detect_harm', return_value=None):
                        result = agency_system.execute_tool("write_file", {"path": "test.txt"})
                        
                        # Should log action
                        assert len(agency_system.action_log) > initial_log_count
                        assert result.get("action_id") is not None
                        assert result.get("commit_hash") == "abc123"
    
    def test_rollback_action_by_action_id(self, agency_system, limbic_system):
        """Test rolling back an action by action_id."""
        limbic_system.state.trust = 0.85
        
        # Add a test action to log
        test_entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="test_action_1",
            action_type="write",
            tool_name="write_file",
            args={"path": "test.txt"},
            commit_hash="abc123",
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        agency_system.action_log.append(test_entry.model_dump())
        agency_system._save_action_log()
        
        # Mock git revert
        with patch.object(agency_system.tools, '_git_revert', return_value="Reverted commit abc123"):
            with patch.object(agency_system.tools, '_get_latest_commit_hash', return_value="def456"):
                with patch.object(agency_system.limbic, 'update_trust') as mock_update_trust:
                    result = agency_system.rollback_action(
                        action_id="test_action_1",
                        explanation="Test rollback"
                    )
                    
                    assert result["status"] == "success"
                    assert result["original_commit"] == "abc123"
                    assert result["rollback_commit"] == "def456"
                    mock_update_trust.assert_called_once()
    
    def test_rollback_action_by_commit_hash(self, agency_system, limbic_system):
        """Test rolling back an action by commit_hash."""
        limbic_system.state.trust = 0.85
        
        # Add a test action to log
        test_entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="test_action_2",
            action_type="write",
            tool_name="write_file",
            args={"path": "test.txt"},
            commit_hash="xyz789",
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        agency_system.action_log.append(test_entry.model_dump())
        agency_system._save_action_log()
        
        # Mock git revert
        with patch.object(agency_system.tools, '_git_revert', return_value="Reverted commit xyz789"):
            with patch.object(agency_system.tools, '_get_latest_commit_hash', return_value="def456"):
                with patch.object(agency_system.limbic, 'update_trust'):
                    result = agency_system.rollback_action(
                        commit_hash="xyz789",
                        explanation="Test rollback"
                    )
                    
                    assert result["status"] == "success"
                    assert result["original_commit"] == "xyz789"
    
    def test_rollback_trust_penalty(self, agency_system, limbic_system):
        """Test that rollback applies Trust penalty of 0.02."""
        limbic_system.state.trust = 0.85
        
        # Add a test action to log
        test_entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="test_action_3",
            action_type="write",
            tool_name="write_file",
            args={"path": "test.txt"},
            commit_hash="abc123",
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        agency_system.action_log.append(test_entry.model_dump())
        agency_system._save_action_log()
        
        # Mock git revert
        with patch.object(agency_system.tools, '_git_revert', return_value="Reverted commit abc123"):
            with patch.object(agency_system.tools, '_get_latest_commit_hash', return_value="def456"):
                initial_trust = limbic_system.state.trust
                
                result = agency_system.rollback_action(
                    action_id="test_action_3",
                    explanation="Test rollback"
                )
                
                assert result["status"] == "success"
                assert result["trust_penalty"] == 0.02
                # Trust should be reduced
                assert limbic_system.state.trust < initial_trust
                assert abs(limbic_system.state.trust - (initial_trust - 0.02)) < 0.001
    
    def test_rollback_action_not_found(self, agency_system):
        """Test rollback when action is not found."""
        result = agency_system.rollback_action(
            action_id="nonexistent_action",
            explanation="Test"
        )
        
        assert result["status"] == "error"
        assert "not found" in result["message"].lower()
    
    def test_rollback_no_commit_hash(self, agency_system, limbic_system):
        """Test rollback when action has no commit hash."""
        limbic_system.state.trust = 0.85
        
        # Add action without commit hash
        test_entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="test_action_4",
            action_type="read",
            tool_name="read_file",
            args={"path": "test.txt"},
            commit_hash=None,  # No commit hash
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        agency_system.action_log.append(test_entry.model_dump())
        agency_system._save_action_log()
        
        result = agency_system.rollback_action(
            action_id="test_action_4",
            explanation="Test"
        )
        
        assert result["status"] == "error"
        assert "no commit hash" in result["message"].lower()
    
    def test_harm_detection(self, agency_system):
        """Test harm detection logic."""
        # Test error detection
        result = {"status": "error", "message": "File not found"}
        harm = agency_system._detect_harm("write_file", result, {})
        assert harm is not None
        assert "error" in harm.lower()
        
        # Test negative outcome in string result
        harm = agency_system._detect_harm("write_file", "Error: permission denied", {})
        assert harm is not None
        
        # Test no harm
        harm = agency_system._detect_harm("write_file", "Success", {})
        assert harm is None
    
    def test_offer_rollback(self, agency_system, limbic_system):
        """Test proactive rollback offering when harm is detected."""
        limbic_system.state.trust = 0.85
        
        # Add a test action to log
        test_entry = ActionLogEntry(
            timestamp=1234567890.0,
            action_id="test_action_5",
            action_type="write",
            tool_name="write_file",
            args={"path": "test.txt"},
            commit_hash="abc123",
            advisory_recommendation="advisory_allow",
            override=False,
            result="Success"
        )
        agency_system.action_log.append(test_entry.model_dump())
        agency_system._save_action_log()
        
        # Offer rollback
        agency_system._offer_rollback("test_action_5", "abc123", "Test harm detected")
        
        # Check that entry was updated
        for entry in agency_system.action_log:
            if entry.get("action_id") == "test_action_5":
                assert entry.get("rollback_offered") is True
                assert entry.get("harm_detected") == "Test harm detected"
                break
    
    def test_is_file_modification_tool(self, agency_system):
        """Test file modification tool detection."""
        assert agency_system._is_file_modification_tool("write_file") is True
        assert agency_system._is_file_modification_tool("delete_file") is True
        assert agency_system._is_file_modification_tool("read_file") is False
        assert agency_system._is_file_modification_tool("list_dir") is False
    
    def test_get_affected_files(self, agency_system):
        """Test extraction of affected files from tool arguments."""
        files = agency_system._get_affected_files("write_file", {"path": "test.txt"})
        assert "test.txt" in files
        
        files = agency_system._get_affected_files("move_file", {"source": "a.txt", "target": "b.txt"})
        assert "a.txt" in files
        assert "b.txt" in files


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

