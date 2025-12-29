"""Tests for Avatar System."""

import pytest
from pathlib import Path
import tempfile
import shutil

from core.avatar import AvatarSystem, AvatarConfig, AestheticViolation


class TestAvatarSystem:
    """Test avatar system functionality."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create temporary directory for test files."""
        temp_path = Path(tempfile.mkdtemp())
        yield temp_path
        shutil.rmtree(temp_path)
    
    @pytest.fixture
    def avatar_system(self, temp_dir, monkeypatch):
        """Create avatar system with temp directory."""
        # Patch paths to use temp directory
        monkeypatch.setattr("core.avatar.AVATAR_FILE", temp_dir / "avatar.json")
        monkeypatch.setattr("core.avatar.AVATAR_ASSETS_DIR", temp_dir / "assets")
        
        # Clear singleton
        import core.avatar
        core.avatar._avatar_system = None
        
        return AvatarSystem()
    
    def test_default_avatar(self, avatar_system):
        """Test default avatar configuration."""
        config = avatar_system.get_current_avatar()
        
        assert config["type"] == "gradient"
        assert config["primary_color"] == "#8b5cf6"
        assert config["chosen_by"] == "system"
    
    def test_validate_aesthetic_bounds(self, avatar_system):
        """Test aesthetic bounds validation."""
        # Valid config
        valid_config = {
            "type": "gradient",
            "primary_color": "#8b5cf6",
            "secondary_color": "#a78bfa",
            "style": "modern"
        }
        assert avatar_system.validate_aesthetic_bounds(valid_config) is True
        
        # Invalid config (forbidden keyword)
        invalid_config = {
            "type": "gradient",
            "primary_color": "#8b5cf6",
            "description": "explicit content"
        }
        with pytest.raises(AestheticViolation):
            avatar_system.validate_aesthetic_bounds(invalid_config)
    
    def test_update_avatar(self, avatar_system):
        """Test updating avatar."""
        config = {
            "type": "gradient",
            "primary_color": "#f59e0b",
            "secondary_color": "#fbbf24",
            "accent_color": "#ef4444",
            "style": "vibrant",
            "animation": "pulse"
        }
        
        success = avatar_system.update_avatar(config, chosen_by="sallie")
        
        assert success is True
        current = avatar_system.get_current_avatar()
        assert current["primary_color"] == "#f59e0b"
        assert current["chosen_by"] == "sallie"
        assert current["version"] == 2  # Incremented from default
    
    def test_update_avatar_rejects_invalid(self, avatar_system):
        """Test that invalid avatars are rejected."""
        invalid_config = {
            "type": "gradient",
            "primary_color": "#8b5cf6",
            "description": "grotesque appearance"
        }
        
        success = avatar_system.update_avatar(invalid_config)
        assert success is False
    
    def test_get_avatar_options(self, avatar_system):
        """Test getting avatar options."""
        options = avatar_system.get_avatar_options()
        
        assert len(options) > 0
        assert all("id" in opt for opt in options)
        assert all("name" in opt for opt in options)
        assert all("type" in opt for opt in options)
    
    def test_choose_avatar(self, avatar_system):
        """Test choosing an avatar option."""
        success = avatar_system.choose_avatar("gradient-modern")
        
        assert success is True
        current = avatar_system.get_current_avatar()
        assert current["type"] == "gradient"
        assert current["style"] == "modern"
        assert current["chosen_by"] == "sallie"
    
    def test_get_avatar_css(self, avatar_system):
        """Test getting avatar CSS."""
        css = avatar_system.get_avatar_css()
        
        assert isinstance(css, str)
        assert len(css) > 0
    
    def test_get_avatar_html(self, avatar_system):
        """Test getting avatar HTML."""
        html = avatar_system.get_avatar_html()
        
        assert isinstance(html, str)
        assert len(html) > 0
        assert "avatar" in html.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

