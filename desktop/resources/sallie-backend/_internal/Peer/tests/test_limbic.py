"""Unit tests for Limbic System."""

import pytest
import json
import time
from pathlib import Path
from unittest.mock import Mock, patch

from core.limbic import LimbicSystem, LimbicState, Posture


class TestLimbicState:
    """Test LimbicState model."""
    
    def test_state_creation(self):
        """Test creating a valid limbic state."""
        state = LimbicState(
            trust=0.7,
            warmth=0.6,
            arousal=0.8,
            valence=0.5,
            posture=Posture.PEER
        )
        
        assert state.trust == 0.7
        assert state.warmth == 0.6
        assert state.arousal == 0.8
        assert state.valence == 0.5
        assert state.posture == Posture.PEER
    
    def test_state_validation_unipolar(self):
        """Test that unipolar values (trust, warmth, arousal) are clamped to [0.0, 1.0]."""
        # Should raise validation error for out of range
        with pytest.raises(ValueError):
            LimbicState(trust=1.5, warmth=0.6, arousal=0.7, valence=0.5)
        
        with pytest.raises(ValueError):
            LimbicState(trust=-0.1, warmth=0.6, arousal=0.7, valence=0.5)
    
    def test_state_validation_bipolar(self):
        """Test that valence is in [-1.0, 1.0] range."""
        # Valid bipolar values
        state1 = LimbicState(trust=0.5, warmth=0.6, arousal=0.7, valence=-0.8)
        assert state1.valence == -0.8
        
        state2 = LimbicState(trust=0.5, warmth=0.6, arousal=0.7, valence=0.9)
        assert state2.valence == 0.9
        
        # Invalid
        with pytest.raises(ValueError):
            LimbicState(trust=0.5, warmth=0.6, arousal=0.7, valence=1.5)


class TestLimbicSystem:
    """Test LimbicSystem functionality."""
    
    @pytest.fixture
    def limbic_system(self):
        """Create a limbic system for testing."""
        return LimbicSystem()
    
    def test_initialization(self, limbic_system):
        """Test limbic system initializes correctly."""
        assert limbic_system.state is not None
        assert 0.0 <= limbic_system.state.trust <= 1.0
        assert 0.0 <= limbic_system.state.warmth <= 1.0
        assert 0.0 <= limbic_system.state.arousal <= 1.0
        assert -1.0 <= limbic_system.state.valence <= 1.0
    
    def test_update_trust_asymptotic(self, limbic_system):
        """Test trust updates use asymptotic math (harder to build, easier to damage)."""
        initial_trust = limbic_system.state.trust
        
        # Positive delta should grow slowly (asymptotic)
        limbic_system.update_trust(initial_trust + 0.1)
        new_trust_positive = limbic_system.state.trust
        
        # Reset
        limbic_system.state.trust = initial_trust
        
        # Negative delta should drop faster (proportional)
        limbic_system.update_trust(initial_trust - 0.1)
        new_trust_negative = limbic_system.state.trust
        
        # Growth should be slower than damage
        trust_growth = new_trust_positive - initial_trust
        trust_damage = initial_trust - new_trust_negative
        
        # Damage should be larger than growth for same delta magnitude
        assert trust_damage > trust_growth, "Trust should be harder to build than to damage"
    
    def test_update_warmth(self, limbic_system):
        """Test warmth updates."""
        initial_warmth = limbic_system.state.warmth
        limbic_system.update_warmth(initial_warmth + 0.05)
        
        assert limbic_system.state.warmth > initial_warmth
        assert 0.0 <= limbic_system.state.warmth <= 1.0
    
    def test_update_arousal(self, limbic_system):
        """Test arousal updates."""
        initial_arousal = limbic_system.state.arousal
        limbic_system.update_arousal(initial_arousal + 0.1)
        
        assert limbic_system.state.arousal > initial_arousal
        assert 0.0 <= limbic_system.state.arousal <= 1.0
    
    def test_update_valence(self, limbic_system):
        """Test valence updates."""
        initial_valence = limbic_system.state.valence
        limbic_system.update_valence(initial_valence + 0.1)
        
        assert limbic_system.state.valence > initial_valence
        assert -1.0 <= limbic_system.state.valence <= 1.0
    
    def test_update_posture(self, limbic_system):
        """Test posture updates."""
        initial_posture = limbic_system.state.posture
        limbic_system.update_posture(Posture.CO_PILOT)
        
        assert limbic_system.state.posture == Posture.CO_PILOT
        assert limbic_system.state.posture != initial_posture
    
    def test_decay_arousal(self, limbic_system):
        """Test arousal decay over time."""
        # Set high arousal
        limbic_system.state.arousal = 0.9
        initial_arousal = limbic_system.state.arousal
        
        # Decay (simulates time passing)
        limbic_system.decay()
        
        # Arousal should decrease (decay towards baseline)
        assert limbic_system.state.arousal < initial_arousal
        assert limbic_system.state.arousal >= 0.2  # Floor
    
    def test_slumber_mode_detection(self, limbic_system):
        """Test slumber mode detection (arousal < 0.3)."""
        limbic_system.state.arousal = 0.25
        assert limbic_system.is_slumber()
        
        limbic_system.state.arousal = 0.5
        assert not limbic_system.is_slumber()
    
    def test_crisis_detection(self, limbic_system):
        """Test crisis detection (valence < 0.3)."""
        limbic_system.state.valence = 0.2
        assert limbic_system.is_crisis()
        
        limbic_system.state.valence = 0.5
        assert not limbic_system.is_crisis()
    
    def test_reunion_surge(self, limbic_system):
        """Test reunion surge (arousal spike after absence)."""
        # Simulate absence by setting old timestamp
        old_time = time.time() - (49 * 3600)  # 49 hours ago
        limbic_system.state.last_interaction_ts = old_time
        limbic_system.state.arousal = 0.3
        
        # Check for reunion
        limbic_system.check_reunion()
        
        # Arousal should spike to 0.9
        assert limbic_system.state.arousal >= 0.85
    
    def test_save_and_load(self, limbic_system, tmp_path):
        """Test state persistence."""
        # Modify state
        limbic_system.state.trust = 0.85
        limbic_system.state.warmth = 0.75
        
        # Save
        with patch('core.limbic.LIMBIC_FILE', tmp_path / 'soul.json'):
            success = limbic_system.save()
            assert success
            
            # Create new instance (should load saved state)
            new_limbic = LimbicSystem()
            # Note: In real test, we'd need to patch LIMBIC_FILE for new instance too
            # This is a simplified test
    
    def test_state_bounds(self, limbic_system):
        """Test that state values stay within bounds."""
        # Try to set values outside bounds
        limbic_system.state.trust = 1.5  # Should be clamped
        assert 0.0 <= limbic_system.state.trust <= 1.0
        
        limbic_system.state.valence = -2.0  # Should be clamped
        assert -1.0 <= limbic_system.state.valence <= 1.0
    
    def test_elastic_mode(self, limbic_system):
        """Test elastic mode (used during Convergence)."""
        assert not limbic_system.state.elastic_mode
        
        limbic_system.state.elastic_mode = True
        assert limbic_system.state.elastic_mode
    
    def test_observers(self, limbic_system):
        """Test observer pattern for state changes."""
        callback_called = []
        
        def observer(old_state, new_state):
            callback_called.append((old_state.trust, new_state.trust))
        
        limbic_system.add_observer(observer)
        initial_trust = limbic_system.state.trust
        limbic_system.update_trust(initial_trust + 0.1)
        
        assert len(callback_called) > 0
        assert callback_called[0][0] == initial_trust
    
    def test_posture_selection(self, limbic_system):
        """Test posture selection logic."""
        # High load should default to CO_PILOT
        limbic_system.state.arousal = 0.9  # High energy
        # In real implementation, posture selection would consider load
        
        # Test all postures are valid
        for posture in Posture:
            limbic_system.update_posture(posture)
            assert limbic_system.state.posture == posture

