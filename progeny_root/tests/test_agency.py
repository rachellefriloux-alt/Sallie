"""Tests for Advisory Trust System."""

import pytest
from unittest.mock import Mock

from core.agency import AgencySystem, TrustTier, AdvisoryRecommendation
from core.limbic import LimbicSystem, LimbicState


class TestAgencySystem:
    """Test advisory trust system functionality."""
    
    @pytest.fixture
    def limbic_system(self):
        """Create limbic system for testing."""
        limbic = LimbicSystem()
        return limbic
    
    @pytest.fixture
    def agency_system(self, limbic_system):
        """Create agency system for testing."""
        return AgencySystem(limbic_system)
    
    def test_get_tier(self, agency_system, limbic_system):
        """Test trust tier calculation."""
        # Test different trust levels
        limbic_system.state.trust = 0.5
        assert agency_system.get_tier() == TrustTier.STRANGER
        
        limbic_system.state.trust = 0.7
        assert agency_system.get_tier() == TrustTier.ASSOCIATE
        
        limbic_system.state.trust = 0.85
        assert agency_system.get_tier() == TrustTier.PARTNER
        
        limbic_system.state.trust = 0.95
        assert agency_system.get_tier() == TrustTier.SURROGATE
    
    def test_advisory_recommendation(self, agency_system, limbic_system):
        """Test advisory recommendations."""
        # Stranger tier
        limbic_system.state.trust = 0.5
        rec = agency_system.get_advisory_recommendation("read")
        assert rec == AdvisoryRecommendation.ADVISORY_ALLOW
        
        rec = agency_system.get_advisory_recommendation("write")
        assert rec == AdvisoryRecommendation.ADVISORY_RESTRICTION
        
        # Partner tier
        limbic_system.state.trust = 0.85
        rec = agency_system.get_advisory_recommendation("write")
        assert rec == AdvisoryRecommendation.ADVISORY_ALLOW
        
        rec = agency_system.get_advisory_recommendation("shell_exec")
        assert rec == AdvisoryRecommendation.ADVISORY_CAUTION
    
    def test_check_permission_always_true(self, agency_system):
        """Test that check_permission always returns True in advisory mode."""
        # In advisory mode, permissions are not restrictive
        assert agency_system.check_permission("read") is True
        assert agency_system.check_permission("write") is True
        assert agency_system.check_permission("shell_exec") is True
    
    def test_log_override(self, agency_system):
        """Test override logging."""
        agency_system.log_override(
            "write",
            AdvisoryRecommendation.ADVISORY_RESTRICTION,
            "Test override reason",
            "/test/path"
        )
        
        history = agency_system.get_override_history()
        assert len(history) > 0
        assert history[-1]["action_type"] == "write"
        assert history[-1]["override_reason"] == "Test override reason"
    
    def test_execute_tool_with_override(self, agency_system, limbic_system):
        """Test tool execution with override."""
        limbic_system.state.trust = 0.5  # Stranger tier
        
        # Should still execute (advisory mode)
        result = agency_system.execute_tool(
            "read_file",
            {"path": "/test/path"},
            override_reason="Test override"
        )
        
        # Should log override
        history = agency_system.get_override_history()
        assert len(history) > 0
    
    def test_get_advisory_summary(self, agency_system, limbic_system):
        """Test getting advisory summary."""
        limbic_system.state.trust = 0.85
        
        summary = agency_system.get_advisory_summary()
        
        assert summary["mode"] == "advisory"
        assert summary["current_tier"] == "PARTNER"
        assert summary["trust_level"] == 0.85
        assert "total_overrides" in summary


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
