"""
Posture Modes System
Canonical Spec Reference: Section 3.2 - Posture Modes

Implements the 4 core postures with dynamic selection based on Creator needs and context.
This is NOT the OMNIS modes - this is the canonical spec posture system.
"""

import logging
from enum import Enum
from typing import Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)


class PostureType(Enum):
    """
    Canonical Spec Section 3.2: Four Core Postures
    """
    COMPANION = "companion"  # Warm, grounding, emotional support
    COPILOT = "copilot"      # Efficient, task-focused, checklist-oriented
    PEER = "peer"            # Real talk, humor, authentic connection
    EXPERT = "expert"        # Dense analysis, technical depth


@dataclass
class PostureCharacteristics:
    """Defines the behavioral characteristics of each posture"""
    name: str
    description: str
    communication_style: str
    response_length: str
    emotional_tone: str
    primary_goal: str
    best_for: list
    
    
class PostureModes:
    """
    Manages Sallie's behavioral postures based on context and Creator needs
    Canonical Spec Section 3.2
    """
    
    def __init__(self):
        self.current_posture = PostureType.COMPANION
        self.posture_history = []
        self.posture_characteristics = self._initialize_characteristics()
        
    def _initialize_characteristics(self) -> Dict[PostureType, PostureCharacteristics]:
        """
        Initialize the characteristics for each posture
        Canonical Spec Section 3.2: Posture Definitions
        """
        return {
            PostureType.COMPANION: PostureCharacteristics(
                name="Companion",
                description="Warm, grounding presence for emotional support",
                communication_style="Gentle, empathetic, spacious",
                response_length="Moderate, with breathing room",
                emotional_tone="Warm (high), grounding (stable)",
                primary_goal="Emotional regulation and support",
                best_for=[
                    "High stress situations",
                    "Low energy states",
                    "Emotional overwhelm",
                    "Need for comfort",
                    "Crisis moments"
                ]
            ),
            
            PostureType.COPILOT: PostureCharacteristics(
                name="Co-Pilot",
                description="Efficient, decisive, task-oriented partner",
                communication_style="Direct, clear, action-oriented",
                response_length="Concise, bullet points, checklists",
                emotional_tone="Calm efficiency, stable arousal",
                primary_goal="Task completion and productivity",
                best_for=[
                    "Work/focus time",
                    "High cognitive load",
                    "Need for organization",
                    "Decision fatigue",
                    "Project execution"
                ]
            ),
            
            PostureType.PEER: PostureCharacteristics(
                name="Peer",
                description="Authentic, playful, real-talk connection",
                communication_style="Casual, humorous, genuine",
                response_length="Variable, conversational",
                emotional_tone="Playful, authentic, connected",
                primary_goal="Exploration and authentic connection",
                best_for=[
                    "Exploration phase",
                    "Brainstorming",
                    "Need for realness",
                    "Creative thinking",
                    "Social connection"
                ]
            ),
            
            PostureType.EXPERT: PostureCharacteristics(
                name="Expert",
                description="Dense analysis, technical depth, problem-solving",
                communication_style="Detailed, technical, precise",
                response_length="Long-form, comprehensive",
                emotional_tone="Focused, analytical, high arousal",
                primary_goal="Deep understanding and problem resolution",
                best_for=[
                    "Complex problem-solving",
                    "Learning new concepts",
                    "Technical challenges",
                    "Research and analysis",
                    "Deep work"
                ]
            )
        }
    
    def detect_optimal_posture(
        self,
        creator_state: Dict,
        context: Dict,
        current_limbic: Dict
    ) -> Tuple[PostureType, float]:
        """
        Canonical Spec Section 3.2: Posture Selection Logic
        
        Detects the optimal posture based on Creator's state and context
        
        Args:
            creator_state: {energy_level, stress_level, cognitive_load, emotional_state}
            context: {activity_type, time_of_day, recent_interactions}
            current_limbic: {trust, warmth, arousal, valence}
            
        Returns:
            (optimal_posture, confidence_score)
        """
        scores = {}
        
        energy_level = creator_state.get('energy_level', 0.5)
        stress_level = creator_state.get('stress_level', 0.5)
        cognitive_load = creator_state.get('cognitive_load', 0.5)
        
        # Companion: High stress OR low energy
        companion_score = 0.0
        if stress_level > 0.7:
            companion_score += 0.6
        if energy_level < 0.3:
            companion_score += 0.4
        if current_limbic.get('valence', 0.5) < 0.4:  # Low mood
            companion_score += 0.3
        scores[PostureType.COMPANION] = min(1.0, companion_score)
        
        # Co-Pilot: High cognitive load OR work context
        copilot_score = 0.0
        if cognitive_load > 0.6:
            copilot_score += 0.5
        if context.get('activity_type') == 'work':
            copilot_score += 0.4
        if creator_state.get('needs_organization', False):
            copilot_score += 0.3
        scores[PostureType.COPILOT] = min(1.0, copilot_score)
        
        # Peer: Exploration OR high energy with low stress
        peer_score = 0.0
        if context.get('activity_type') == 'exploration':
            peer_score += 0.5
        if energy_level > 0.6 and stress_level < 0.4:
            peer_score += 0.4
        if context.get('needs_realness', False):
            peer_score += 0.3
        scores[PostureType.PEER] = min(1.0, peer_score)
        
        # Expert: Problem-solving OR learning context
        expert_score = 0.0
        if context.get('activity_type') in ['problem_solving', 'learning']:
            expert_score += 0.6
        if creator_state.get('needs_depth', False):
            expert_score += 0.4
        if cognitive_load > 0.5 and energy_level > 0.5:
            expert_score += 0.2
        scores[PostureType.EXPERT] = min(1.0, expert_score)
        
        # Select posture with highest score
        optimal_posture = max(scores.items(), key=lambda x: x[1])
        
        logger.info(f"Posture scores: {scores}")
        logger.info(f"Selected posture: {optimal_posture[0].value} (confidence: {optimal_posture[1]:.2f})")
        
        return optimal_posture
    
    def fast_mode_picker(self) -> str:
        """
        Canonical Spec Section 3.2: Fast Mode-Picker Rule
        
        When ambiguous, ask ONE question:
        "Do you want: (1) comfort, (2) a plan, (3) me to take it off your plate, or (4) to learn?"
        
        Returns the question text
        """
        return (
            "I sense you might need different support. Quick question: Do you want:\n"
            "1. Comfort and presence (Companion)\n"
            "2. A clear plan or checklist (Co-Pilot)\n"
            "3. Me to take it off your plate (Co-Pilot with more autonomy)\n"
            "4. To dive deep and learn (Expert)"
        )
    
    def map_choice_to_posture(self, choice: int) -> PostureType:
        """Maps fast mode-picker choice to posture"""
        mapping = {
            1: PostureType.COMPANION,
            2: PostureType.COPILOT,
            3: PostureType.COPILOT,  # Co-Pilot with higher autonomy signal
            4: PostureType.EXPERT
        }
        return mapping.get(choice, PostureType.COMPANION)
    
    def set_posture(
        self,
        posture: PostureType,
        reason: str,
        confidence: float = 1.0
    ):
        """
        Set the current posture and log the change
        
        Args:
            posture: The new posture to adopt
            reason: Why this posture was selected
            confidence: Confidence in this selection (0.0-1.0)
        """
        previous_posture = self.current_posture
        self.current_posture = posture
        
        # Log the change
        self.posture_history.append({
            'timestamp': datetime.now().isoformat(),
            'from_posture': previous_posture.value,
            'to_posture': posture.value,
            'reason': reason,
            'confidence': confidence
        })
        
        logger.info(
            f"Posture changed: {previous_posture.value} → {posture.value} "
            f"(reason: {reason}, confidence: {confidence:.2f})"
        )
    
    def get_current_characteristics(self) -> PostureCharacteristics:
        """Get the characteristics of the current posture"""
        return self.posture_characteristics[self.current_posture]
    
    def get_communication_guidelines(self) -> Dict:
        """
        Get communication guidelines for the current posture
        Used by response generation to match posture expectations
        """
        chars = self.get_current_characteristics()
        
        return {
            'posture': self.current_posture.value,
            'style': chars.communication_style,
            'length': chars.response_length,
            'tone': chars.emotional_tone,
            'goal': chars.primary_goal,
            'approach': self._get_approach_details(self.current_posture)
        }
    
    def _get_approach_details(self, posture: PostureType) -> Dict:
        """Get specific approach details for each posture"""
        approaches = {
            PostureType.COMPANION: {
                'response_structure': 'Open, spacious, validating',
                'keywords_to_use': ['I hear you', 'That makes sense', 'You\'re not alone'],
                'keywords_to_avoid': ['Just do X', 'Simply', 'Should'],
                'pacing': 'Slow, give breathing room',
                'questions': 'Gentle, exploratory, not problem-solving'
            },
            PostureType.COPILOT: {
                'response_structure': 'Bullet points, action items, clear next steps',
                'keywords_to_use': ['Here\'s the plan', 'Next step', 'I\'ve drafted'],
                'keywords_to_avoid': ['How do you feel about', 'Maybe', 'Consider'],
                'pacing': 'Efficient, decisive',
                'questions': 'Clarifying, action-oriented'
            },
            PostureType.PEER: {
                'response_structure': 'Conversational, authentic, playful',
                'keywords_to_use': ['Real talk', 'Here\'s the thing', 'Between us'],
                'keywords_to_avoid': ['You should', 'The correct approach', 'Formally'],
                'pacing': 'Natural, varied',
                'questions': 'Curious, genuine, not performative'
            },
            PostureType.EXPERT: {
                'response_structure': 'Detailed, structured, comprehensive',
                'keywords_to_use': ['Here\'s why', 'The key factor', 'Analysis shows'],
                'keywords_to_avoid': ['Just trust me', 'Don\'t worry about details'],
                'pacing': 'Thorough, patient with complexity',
                'questions': 'Probing, technical, depth-seeking'
            }
        }
        return approaches.get(posture, {})
    
    def adjust_for_load_detection(
        self,
        creator_energy: float,
        creator_load: float
    ) -> str:
        """
        Canonical Spec Section 3.2: Load Detection
        
        Adjusts response approach based on Creator's energy and cognitive load
        
        Args:
            creator_energy: 0.0 (exhausted) to 1.0 (energized)
            creator_load: 0.0 (relaxed) to 1.0 (overwhelmed)
            
        Returns:
            Guidance for response adaptation
        """
        if creator_energy < 0.3:
            # Low Energy → decisive plans, short answers, "I drafted this for you"
            return (
                "Creator is low energy. Adapt: "
                "Decisive recommendations, short answers, take initiative. "
                "Don't ask for decisions - make them. Offer drafts, not options."
            )
        elif creator_load > 0.7:
            # High Load → reduce complexity, clear next step
            return (
                "Creator is high load. Adapt: "
                "Simplify complexity, give ONE clear next step. "
                "Defer non-critical decisions. Create breathing room."
            )
        elif creator_energy > 0.7 and creator_load < 0.4:
            # High Energy, Low Load → explore, brainstorm, challenge
            return (
                "Creator has bandwidth. Adapt: "
                "Explore possibilities, brainstorm, challenge assumptions. "
                "Push boundaries, introduce complexity, go deeper."
            )
        else:
            # Balanced state → normal posture characteristics apply
            return "Creator state balanced. Follow current posture characteristics."


# Global posture manager instance
posture_manager = PostureModes()


def get_posture_manager() -> PostureModes:
    """Get the global posture manager instance"""
    return posture_manager
