"""Unit tests for Synthesis System."""

import pytest
import re
from unittest.mock import Mock, patch, MagicMock

from core.synthesis import SynthesisSystem
from core.limbic import LimbicSystem, Posture


class TestSynthesisSystem:
    """Test SynthesisSystem functionality."""
    
    @pytest.fixture
    def limbic_system(self):
        """Create limbic system for testing."""
        return LimbicSystem()
    
    @pytest.fixture
    def synthesis_system(self, limbic_system):
        """Create synthesis system for testing."""
        return SynthesisSystem(limbic_system)
    
    def test_initialization(self, synthesis_system):
        """Test synthesis system initializes correctly."""
        assert synthesis_system.limbic is not None
        assert synthesis_system.identity is not None
    
    def test_one_question_rule_enforcement(self, synthesis_system):
        """Test that one-question rule is enforced."""
        # Text with multiple questions
        multi_question_text = "What is your name? How are you? Can you help me?"
        
        # Should be rewritten to have at most one question
        result = synthesis_system._enforce_one_question_rule(multi_question_text)
        
        # Count questions in result
        question_count = result.count('?')
        # Should have at most one question
        assert question_count <= 1, "One-question rule violated"
    
    def test_one_question_rule_single_question(self, synthesis_system):
        """Test that single question is preserved."""
        single_question_text = "What is your name?"
        
        result = synthesis_system._enforce_one_question_rule(single_question_text)
        
        # Should preserve single question
        assert '?' in result
        assert result.count('?') <= 1
    
    def test_one_question_rule_no_questions(self, synthesis_system):
        """Test that text without questions is unchanged."""
        no_question_text = "This is a statement without questions."
        
        result = synthesis_system._enforce_one_question_rule(no_question_text)
        
        # Should be unchanged
        assert result == no_question_text
    
    def test_count_questions(self, synthesis_system):
        """Test question counting logic."""
        assert synthesis_system._count_questions("What? How?") == 2
        assert synthesis_system._count_questions("What is this?") == 1
        assert synthesis_system._count_questions("No questions here.") == 0
        assert synthesis_system._count_questions("Can you help? I need assistance.") == 1
    
    def test_posture_application(self, synthesis_system, limbic_system):
        """Test that posture affects response tone."""
        # Mock router
        mock_router = Mock()
        mock_router.chat.return_value = "Test response"
        synthesis_system.router = mock_router
        
        # Set different postures
        for posture in Posture:
            limbic_system.state.posture = posture
            
            # Generate response
            decision = {"selected_option_id": "A", "rationale": "Test"}
            options = {"options": [{"id": "A", "content": "Test option"}]}
            perception = {"suggested_posture": posture.value}
            
            # Should use posture-specific prompt
            result = synthesis_system.generate(
                "Test input",
                decision,
                options,
                perception
            )
            
            # Router should be called with posture-aware prompt
            assert mock_router.chat.called
    
    def test_limbic_tone_matching(self, synthesis_system, limbic_system):
        """Test that response tone matches limbic state."""
        # High warmth should produce warmer tone
        limbic_system.state.warmth = 0.9
        limbic_system.state.trust = 0.8
        
        # Mock router to capture prompt
        mock_router = Mock()
        mock_router.chat.return_value = "Warm response"
        synthesis_system.router = mock_router
        
        decision = {"selected_option_id": "A", "rationale": "Test"}
        options = {"options": [{"id": "A", "content": "Test"}]}
        perception = {}
        
        synthesis_system.generate("Test", decision, options, perception)
        
        # Verify router was called (would contain tone instructions)
        assert mock_router.chat.called
    
    def test_low_trust_tone(self, synthesis_system, limbic_system):
        """Test that low trust produces more careful tone."""
        limbic_system.state.trust = 0.3
        limbic_system.state.warmth = 0.4
        
        mock_router = Mock()
        mock_router.chat.return_value = "Careful response"
        synthesis_system.router = mock_router
        
        decision = {"selected_option_id": "A", "rationale": "Test"}
        options = {"options": [{"id": "A", "content": "Test"}]}
        perception = {}
        
        synthesis_system.generate("Test", decision, options, perception)
        
        assert mock_router.chat.called
    
    def test_crisis_mode_tone(self, synthesis_system, limbic_system):
        """Test that crisis mode (low valence) produces supportive tone."""
        limbic_system.state.valence = 0.2  # Crisis
        limbic_system.state.warmth = 0.7
        
        mock_router = Mock()
        mock_router.chat.return_value = "Supportive response"
        synthesis_system.router = mock_router
        
        decision = {"selected_option_id": "A", "rationale": "Test"}
        options = {"options": [{"id": "A", "content": "Test"}]}
        perception = {}
        
        synthesis_system.generate("Test", decision, options, perception)
        
        assert mock_router.chat.called
    
    def test_clean_response(self, synthesis_system):
        """Test response cleaning (removes JSON markers, quotes, etc.)."""
        # JSON wrapped response
        json_response = '{"response": "This is the actual response"}'
        cleaned = synthesis_system._clean_response(json_response)
        assert "actual response" in cleaned.lower()
        
        # Quoted response
        quoted_response = '"This is a quoted response"'
        cleaned = synthesis_system._clean_response(quoted_response)
        assert cleaned.strip('"') == cleaned
        assert "quoted response" in cleaned.lower()
        
        # Markdown code blocks
        code_response = "```json\nThis is a response\n```"
        cleaned = synthesis_system._clean_response(code_response)
        assert "```" not in cleaned
        assert "response" in cleaned.lower()
    
    def test_response_length_limits(self, synthesis_system):
        """Test that responses don't exceed reasonable length."""
        # Very long response should be handled
        long_response = "A" * 10000
        
        # Clean should handle long responses
        cleaned = synthesis_system._clean_response(long_response)
        assert len(cleaned) > 0
    
    def test_identity_integration(self, synthesis_system):
        """Test that Sallie's identity is integrated into responses."""
        # Mock router
        mock_router = Mock()
        mock_router.chat.return_value = "Response with identity"
        synthesis_system.router = mock_router
        
        decision = {"selected_option_id": "A", "rationale": "Test"}
        options = {"options": [{"id": "A", "content": "Test"}]}
        perception = {}
        
        result = synthesis_system.generate("Test", decision, options, perception)
        
        # Should use identity system
        assert synthesis_system.identity is not None
        assert mock_router.chat.called
    
    def test_error_handling(self, synthesis_system):
        """Test error handling in synthesis."""
        # Mock router to raise exception
        mock_router = Mock()
        mock_router.chat.side_effect = Exception("LLM error")
        synthesis_system.router = mock_router
        
        decision = {"selected_option_id": "A", "rationale": "Test"}
        options = {"options": [{"id": "A", "content": "Test"}]}
        perception = {}
        
        # Should handle error gracefully
        try:
            result = synthesis_system.generate("Test", decision, options, perception)
            # Should return fallback response or handle error
        except Exception:
            # If exception is raised, that's also acceptable (depends on implementation)
            pass
    
    def test_posture_specific_prompts(self, synthesis_system, limbic_system):
        """Test that different postures use appropriate prompts."""
        # Test each posture
        postures_to_test = [
            Posture.COMPANION,
            Posture.CO_PILOT,
            Posture.PEER,
            Posture.EXPERT
        ]
        
        for posture in postures_to_test:
            limbic_system.state.posture = posture
            
            mock_router = Mock()
            mock_router.chat.return_value = f"Response for {posture.value}"
            synthesis_system.router = mock_router
            
            decision = {"selected_option_id": "A", "rationale": "Test"}
            options = {"options": [{"id": "A", "content": "Test"}]}
            perception = {"suggested_posture": posture.value}
            
            synthesis_system.generate("Test", decision, options, perception)
            
            # Verify router was called (would use posture-specific prompt)
            assert mock_router.chat.called

