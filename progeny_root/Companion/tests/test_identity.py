"""Tests for Identity System."""

import pytest
from pathlib import Path
import json
import tempfile
import shutil

from core.identity import IdentitySystem, BASE_PERSONALITY, AestheticViolation


class TestIdentitySystem:
    """Test identity system functionality."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)
    
    @pytest.fixture
    def identity_system(self, temp_dir, monkeypatch):
        """Create identity system with temp directory."""
        # Patch paths to use temp directory
        monkeypatch.setattr("core.identity.IDENTITY_FILE", temp_dir / "sallie_identity.json")
        monkeypatch.setattr("core.identity.EVOLUTION_HISTORY_FILE", temp_dir / "sallie_evolution_history.json")
        
        # Clear singleton
        import core.identity
        core.identity._identity_system = None
        
        return IdentitySystem()
    
    def test_base_personality_immutable(self, identity_system):
        """Test that base personality is immutable."""
        base = identity_system.get_base_personality()
        
        # Verify immutable flag
        assert base["immutable"] is True
        
        # Verify loyalty
        assert base["loyalty_to_creator"] == 1.0
        
        # Verify core traits
        assert set(base["core_traits"]) == set(BASE_PERSONALITY["core_traits"])
        
        # Verify operating principles
        assert base["operating_principles"]["always_confirm"] is True
        assert base["operating_principles"]["never_choose_for_creator"] is True
        assert base["operating_principles"]["controllable"] is True
    
    def test_verify_base_personality(self, identity_system):
        """Test base personality verification."""
        assert identity_system.verify_base_personality() is True
    
    def test_update_surface_expression(self, identity_system):
        """Test updating surface expression."""
        success = identity_system.update_surface_expression(
            appearance={"avatar": "friendly", "theme": "warm"},
            interests=["AI research", "creative writing"]
        )
        
        assert success is True
        assert identity_system.identity.evolution_count == 1
        
        summary = identity_system.get_identity_summary()
        assert "AI research" in summary["interests"]
        assert summary["appearance"]["avatar"] == "friendly"
    
    def test_aesthetic_bounds_enforcement(self, identity_system):
        """Test that aesthetic bounds are enforced."""
        # Try to set grotesque appearance
        success = identity_system.update_surface_expression(
            appearance={"avatar": "explicit content"}
        )
        
        assert success is False  # Should be rejected
    
    def test_identity_evolution_tracking(self, identity_system):
        """Test that identity evolution is tracked."""
        identity_system.update_surface_expression(
            interests=["test interest"]
        )
        
        # Check evolution history file exists
        history_file = Path("progeny_root/limbic/heritage/sallie_evolution_history.json")
        if history_file.exists():
            with open(history_file, "r") as f:
                history = json.load(f)
            assert len(history) > 0
            assert history[-1]["evolution_count"] == 1
    
    def test_always_confirm_enforcement(self, identity_system):
        """Test always confirm principle."""
        assert identity_system.enforce_always_confirm() is True
    
    def test_never_choose_for_creator_enforcement(self, identity_system):
        """Test never choose for creator principle."""
        assert identity_system.enforce_never_choose_for_creator() is True
    
    def test_is_controllable(self, identity_system):
        """Test controllable principle."""
        assert identity_system.is_controllable() is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

