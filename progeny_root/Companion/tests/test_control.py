"""Tests for Control Mechanism."""

import pytest
from pathlib import Path
import tempfile
import shutil

from core.control import ControlSystem, ControlState


class TestControlSystem:
    """Test control system functionality."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)
    
    @pytest.fixture
    def control_system(self, temp_dir, monkeypatch):
        """Create control system with temp directory."""
        # Patch path to use temp directory
        monkeypatch.setattr("core.control.CONTROL_STATE_FILE", temp_dir / "control_state.json")
        
        # Clear singleton
        import core.control
        core.control._control_system = None
        
        return ControlSystem()
    
    def test_is_controllable(self, control_system):
        """Test that controllability is always true."""
        assert control_system.is_controllable() is True
    
    def test_creator_take_control(self, control_system):
        """Test creator taking control."""
        success = control_system.creator_take_control("Test intervention")
        
        assert success is True
        assert control_system.state.creator_has_control is True
        assert control_system.state.control_reason == "Test intervention"
    
    def test_creator_release_control(self, control_system):
        """Test creator releasing control."""
        control_system.creator_take_control("Test")
        success = control_system.creator_release_control()
        
        assert success is True
        assert control_system.state.creator_has_control is False
    
    def test_emergency_stop(self, control_system):
        """Test emergency stop."""
        success = control_system.emergency_stop("Test emergency")
        
        assert success is True
        assert control_system.state.emergency_stop_active is True
        assert control_system.can_proceed("test action") is False
    
    def test_resume_after_emergency_stop(self, control_system):
        """Test resuming after emergency stop."""
        control_system.emergency_stop("Test")
        success = control_system.resume_after_emergency_stop()
        
        assert success is True
        assert control_system.state.emergency_stop_active is False
        assert control_system.can_proceed("test action") is True
    
    def test_lock_state(self, control_system):
        """Test state lock."""
        success = control_system.lock_state("Test lock")
        
        assert success is True
        assert control_system.state.state_locked is True
        assert control_system.can_proceed("test action") is False
    
    def test_unlock_state(self, control_system):
        """Test state unlock."""
        control_system.lock_state("Test")
        success = control_system.unlock_state()
        
        assert success is True
        assert control_system.state.state_locked is False
        assert control_system.can_proceed("test action") is True
    
    def test_can_proceed(self, control_system):
        """Test can_proceed logic."""
        # Normal state
        assert control_system.can_proceed("test") is True
        
        # Emergency stop
        control_system.emergency_stop("Test")
        assert control_system.can_proceed("test") is False
        control_system.resume_after_emergency_stop()
        
        # State locked
        control_system.lock_state("Test")
        assert control_system.can_proceed("test") is False
        control_system.unlock_state()
    
    def test_control_history(self, control_system):
        """Test control history tracking."""
        control_system.creator_take_control("Test 1")
        control_system.emergency_stop("Test 2")
        control_system.lock_state("Test 3")
        
        history = control_system.get_control_history()
        assert len(history) >= 3
        
        # Check last entry
        assert history[-1]["action"] == "lock_state"
    
    def test_get_control_status(self, control_system):
        """Test getting control status."""
        status = control_system.get_control_status()
        
        assert "creator_has_control" in status
        assert "emergency_stop_active" in status
        assert "state_locked" in status
        assert "controllable" in status
        assert status["controllable"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

