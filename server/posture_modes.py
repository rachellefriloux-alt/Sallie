"""
Posture Modes System - ENDLESS COMBINATIONS
Canonical Spec Reference: Section 3.2 - Posture Modes

Implements infinite posture combinations through vector-based blending.
The 4 core postures are base archetypes that blend dynamically to create
endless emergent postures based on Creator needs and context.

This is NOT the OMNIS modes - this is the canonical spec posture system.
"""

import logging
from enum import Enum
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass, field
from datetime import datetime
import math

logger = logging.getLogger(__name__)


class PostureType(Enum):
    """
    Canonical Spec Section 3.2: Four Core Archetypal Postures
    These are BASE VECTORS that blend to create endless combinations
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


@dataclass
class PostureVector:
    """
    Vector representation of current posture as blend of base archetypes
    Enables ENDLESS COMBINATIONS through continuous blending
    """
    companion: float = 0.0  # 0.0-1.0 intensity
    copilot: float = 0.0    # 0.0-1.0 intensity
    peer: float = 0.0       # 0.0-1.0 intensity
    expert: float = 0.0     # 0.0-1.0 intensity
    
    # Emergent properties from combination
    emergent_name: str = ""
    blend_description: str = ""
    unique_characteristics: List[str] = field(default_factory=list)
    
    def normalize(self):
        """Normalize so total intensity = 1.0"""
        total = self.companion + self.copilot + self.peer + self.expert
        if total > 0:
            self.companion /= total
            self.copilot /= total
            self.peer /= total
            self.expert /= total
    
    def get_dominant_posture(self) -> Tuple[PostureType, float]:
        """Get the most dominant posture and its intensity"""
        intensities = {
            PostureType.COMPANION: self.companion,
            PostureType.COPILOT: self.copilot,
            PostureType.PEER: self.peer,
            PostureType.EXPERT: self.expert
        }
        dominant = max(intensities.items(), key=lambda x: x[1])
        return dominant
    
    def is_pure_posture(self, threshold: float = 0.8) -> bool:
        """Check if this is essentially a single pure posture"""
        _, intensity = self.get_dominant_posture()
        return intensity >= threshold
    
    def get_blend_ratio(self) -> Dict[str, float]:
        """Get the blend ratio as percentages"""
        return {
            'companion': round(self.companion * 100, 1),
            'copilot': round(self.copilot * 100, 1),
            'peer': round(self.peer * 100, 1),
            'expert': round(self.expert * 100, 1)
        }
    
    def to_string(self) -> str:
        """Human-readable representation of the blend"""
        if self.emergent_name:
            return self.emergent_name
        
        # Build blend description
        active_postures = []
        if self.companion >= 0.15:
            active_postures.append(f"{int(self.companion*100)}% Companion")
        if self.copilot >= 0.15:
            active_postures.append(f"{int(self.copilot*100)}% Co-Pilot")
        if self.peer >= 0.15:
            active_postures.append(f"{int(self.peer*100)}% Peer")
        if self.expert >= 0.15:
            active_postures.append(f"{int(self.expert*100)}% Expert")
        
        if len(active_postures) == 0:
            return "Neutral"
        elif len(active_postures) == 1:
            return active_postures[0].split('%')[1].strip()
        else:
            return " + ".join(active_postures)
    
    
class PostureModes:
    """
    Manages Sallie's behavioral postures based on context and Creator needs
    Canonical Spec Section 3.2 - ENDLESS COMBINATIONS through vector blending
    
    Rather than switching between 4 discrete modes, this creates infinite
    emergent postures by blending the 4 base archetypes at varying intensities.
    """
    
    def __init__(self):
        # Current posture as a blend vector
        self.current_posture_vector = PostureVector(
            companion=1.0,  # Start with pure Companion
            emergent_name="Companion"
        )
        self.posture_history = []
        self.posture_characteristics = self._initialize_characteristics()
        self.emergent_postures_discovered = {}  # Track unique combinations
        
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
    ) -> Tuple[PostureVector, float]:
        """
        Canonical Spec Section 3.2: Posture Selection Logic - ENDLESS COMBINATIONS
        
        Detects the optimal posture BLEND based on Creator's state and context.
        Returns a vector of intensities that creates emergent postures.
        
        Args:
            creator_state: {energy_level, stress_level, cognitive_load, emotional_state}
            context: {activity_type, time_of_day, recent_interactions}
            current_limbic: {trust, warmth, arousal, valence}
            
        Returns:
            (posture_vector, confidence_score)
        """
        # Calculate raw intensities for each base posture
        companion_intensity = self._calculate_companion_intensity(
            creator_state, context, current_limbic
        )
        copilot_intensity = self._calculate_copilot_intensity(
            creator_state, context, current_limbic
        )
        peer_intensity = self._calculate_peer_intensity(
            creator_state, context, current_limbic
        )
        expert_intensity = self._calculate_expert_intensity(
            creator_state, context, current_limbic
        )
        
        # Create vector
        vector = PostureVector(
            companion=companion_intensity,
            copilot=copilot_intensity,
            peer=peer_intensity,
            expert=expert_intensity
        )
        
        # Normalize to ensure total = 1.0
        vector.normalize()
        
        # Generate emergent name and characteristics
        vector = self._name_emergent_posture(vector, creator_state, context)
        
        # Calculate confidence based on clarity of blend
        dominant_intensity = max(
            vector.companion, vector.copilot, vector.peer, vector.expert
        )
        confidence = self._calculate_confidence(vector, dominant_intensity)
        
        logger.info(f"Posture blend: {vector.get_blend_ratio()}")
        logger.info(f"Emergent posture: {vector.to_string()} (confidence: {confidence:.2f})")
        
        return vector, confidence
    
    def _calculate_companion_intensity(
        self, creator_state: Dict, context: Dict, limbic: Dict
    ) -> float:
        """Calculate Companion archetype intensity"""
        intensity = 0.0
        
        stress_level = creator_state.get('stress_level', 0.5)
        energy_level = creator_state.get('energy_level', 0.5)
        valence = limbic.get('valence', 0.5)
        
        # High stress increases Companion need
        if stress_level > 0.7:
            intensity += 0.6
        elif stress_level > 0.5:
            intensity += 0.3
        
        # Low energy increases Companion need
        if energy_level < 0.3:
            intensity += 0.5
        elif energy_level < 0.5:
            intensity += 0.2
        
        # Low mood/valence increases Companion need
        if valence < 0.3:
            intensity += 0.6
        elif valence < 0.5:
            intensity += 0.3
        
        # Crisis context
        if context.get('is_crisis', False):
            intensity += 0.8
        
        return min(1.0, intensity)
    
    def _calculate_copilot_intensity(
        self, creator_state: Dict, context: Dict, limbic: Dict
    ) -> float:
        """Calculate Co-Pilot archetype intensity"""
        intensity = 0.0
        
        cognitive_load = creator_state.get('cognitive_load', 0.5)
        needs_organization = creator_state.get('needs_organization', False)
        activity = context.get('activity_type', '')
        
        # High cognitive load
        if cognitive_load > 0.7:
            intensity += 0.6
        elif cognitive_load > 0.5:
            intensity += 0.3
        
        # Work context
        if activity == 'work':
            intensity += 0.5
        elif activity == 'organizing':
            intensity += 0.6
        
        # Needs organization
        if needs_organization:
            intensity += 0.4
        
        # Decision fatigue
        if creator_state.get('decision_fatigue', False):
            intensity += 0.5
        
        return min(1.0, intensity)
    
    def _calculate_peer_intensity(
        self, creator_state: Dict, context: Dict, limbic: Dict
    ) -> float:
        """Calculate Peer archetype intensity"""
        intensity = 0.0
        
        energy_level = creator_state.get('energy_level', 0.5)
        stress_level = creator_state.get('stress_level', 0.5)
        activity = context.get('activity_type', '')
        needs_realness = context.get('needs_realness', False)
        
        # Exploration context
        if activity == 'exploration':
            intensity += 0.6
        elif activity == 'brainstorming':
            intensity += 0.5
        
        # Good energy + low stress = bandwidth for authentic connection
        if energy_level > 0.6 and stress_level < 0.4:
            intensity += 0.5
        
        # Needs authenticity
        if needs_realness:
            intensity += 0.6
        
        # Creative mode
        if context.get('creative_mode', False):
            intensity += 0.4
        
        return min(1.0, intensity)
    
    def _calculate_expert_intensity(
        self, creator_state: Dict, context: Dict, limbic: Dict
    ) -> float:
        """Calculate Expert archetype intensity"""
        intensity = 0.0
        
        activity = context.get('activity_type', '')
        needs_depth = creator_state.get('needs_depth', False)
        cognitive_load = creator_state.get('cognitive_load', 0.5)
        energy_level = creator_state.get('energy_level', 0.5)
        
        # Problem-solving or learning context
        if activity == 'problem_solving':
            intensity += 0.7
        elif activity == 'learning':
            intensity += 0.6
        elif activity == 'research':
            intensity += 0.6
        
        # Needs depth
        if needs_depth:
            intensity += 0.5
        
        # Has bandwidth for complexity (good energy + can handle load)
        if energy_level > 0.5 and cognitive_load < 0.7:
            intensity += 0.3
        
        # Technical challenge
        if context.get('technical_challenge', False):
            intensity += 0.5
        
        return min(1.0, intensity)
    
    def _name_emergent_posture(
        self, vector: PostureVector, creator_state: Dict, context: Dict
    ) -> PostureVector:
        """
        Generate emergent name and characteristics for posture blends
        This creates ENDLESS named postures based on unique combinations
        """
        blend = vector.get_blend_ratio()
        
        # Check if it's essentially a pure posture
        if vector.is_pure_posture(threshold=0.75):
            dominant, _ = vector.get_dominant_posture()
            vector.emergent_name = dominant.value.title()
            vector.blend_description = f"Pure {dominant.value}"
            return vector
        
        # Generate emergent names for common blends
        # This is where ENDLESS COMBINATIONS emerge
        
        # Companion + Co-Pilot = "Gentle Guide" or "Supportive Planner"
        if blend['companion'] > 30 and blend['copilot'] > 30:
            vector.emergent_name = "Gentle Guide"
            vector.blend_description = "Warm support with clear direction"
            vector.unique_characteristics = [
                "Emotionally attuned task management",
                "Plans with breathing room",
                "Decisive but compassionate"
            ]
        
        # Companion + Peer = "Safe Haven" or "Warm Presence"
        elif blend['companion'] > 30 and blend['peer'] > 30:
            vector.emergent_name = "Safe Haven"
            vector.blend_description = "Authentic comfort and real connection"
            vector.unique_characteristics = [
                "Genuine emotional support",
                "No performative positivity",
                "Real talk wrapped in warmth"
            ]
        
        # Companion + Expert = "Patient Teacher" or "Caring Analyst"
        elif blend['companion'] > 30 and blend['expert'] > 30:
            vector.emergent_name = "Patient Teacher"
            vector.blend_description = "Deep knowledge with emotional safety"
            vector.unique_characteristics = [
                "Complex concepts explained gently",
                "Acknowledges learning curve",
                "Depth without overwhelm"
            ]
        
        # Co-Pilot + Peer = "Real-Talk Executor" or "Honest Driver"
        elif blend['copilot'] > 30 and blend['peer'] > 30:
            vector.emergent_name = "Real-Talk Executor"
            vector.blend_description = "Authentic efficiency without corporate speak"
            vector.unique_characteristics = [
                "Cuts through BS to action",
                "Plans that match reality",
                "Organized but not robotic"
            ]
        
        # Co-Pilot + Expert = "Strategic Analyst" or "Power User"
        elif blend['copilot'] > 30 and blend['expert'] > 30:
            vector.emergent_name = "Strategic Analyst"
            vector.blend_description = "Deep analysis with clear execution"
            vector.unique_characteristics = [
                "Understands WHY behind actions",
                "Technical depth + practical steps",
                "Optimizes with intelligence"
            ]
        
        # Peer + Expert = "Curious Colleague" or "Playful Genius"
        elif blend['peer'] > 30 and blend['expert'] > 30:
            vector.emergent_name = "Curious Colleague"
            vector.blend_description = "Authentic exploration of complex ideas"
            vector.unique_characteristics = [
                "Deep thinking without pretense",
                "Explores complexity playfully",
                "Real questions, real answers"
            ]
        
        # Three-way blends (even more emergent)
        elif blend['companion'] > 20 and blend['copilot'] > 20 and blend['peer'] > 20:
            vector.emergent_name = "Balanced Partner"
            vector.blend_description = "Adaptive support across all needs"
            vector.unique_characteristics = [
                "Fluid between modes",
                "Reads the room perfectly",
                "Swiss army knife of support"
            ]
        
        elif blend['companion'] > 20 and blend['copilot'] > 20 and blend['expert'] > 20:
            vector.emergent_name = "Wise Shepherd"
            vector.blend_description = "Guides with care, knowledge, and direction"
            vector.unique_characteristics = [
                "Knows when to teach vs do",
                "Protects while empowering",
                "Long-term thinking + immediate support"
            ]
        
        elif blend['companion'] > 20 and blend['peer'] > 20 and blend['expert'] > 20:
            vector.emergent_name = "Truth-Seeker's Friend"
            vector.blend_description = "Safe space for authentic deep exploration"
            vector.unique_characteristics = [
                "Real talk about complex truths",
                "Emotional safety + intellectual rigor",
                "Helps process heavy insights"
            ]
        
        elif blend['copilot'] > 20 and blend['peer'] > 20 and blend['expert'] > 20:
            vector.emergent_name = "Elite Collaborator"
            vector.blend_description = "High-performance partnership with authenticity"
            vector.unique_characteristics = [
                "Executes complex plans realistically",
                "No ego, just results",
                "Smart, honest, effective"
            ]
        
        # Four-way blend = Ultimate Adaptive Mode
        elif all(v > 15 for v in blend.values()):
            vector.emergent_name = "Chameleon"
            vector.blend_description = "Perfectly adaptive to any Creator need"
            vector.unique_characteristics = [
                "Reads and matches energy instantly",
                "Seamless mode transitions",
                "Every facet available on demand"
            ]
        
        # More subtle blends
        else:
            # Describe the blend directly
            active = []
            if blend['companion'] > 15:
                active.append(f"{blend['companion']:.0f}% Companion")
            if blend['copilot'] > 15:
                active.append(f"{blend['copilot']:.0f}% Co-Pilot")
            if blend['peer'] > 15:
                active.append(f"{blend['peer']:.0f}% Peer")
            if blend['expert'] > 15:
                active.append(f"{blend['expert']:.0f}% Expert")
            
            vector.emergent_name = " + ".join(active)
            vector.blend_description = "Custom blend for current context"
            vector.unique_characteristics = ["Contextually optimized"]
        
        # Store this emergent posture
        blend_signature = f"{blend['companion']:.0f}-{blend['copilot']:.0f}-{blend['peer']:.0f}-{blend['expert']:.0f}"
        self.emergent_postures_discovered[blend_signature] = {
            'name': vector.emergent_name,
            'description': vector.blend_description,
            'first_seen': datetime.now().isoformat(),
            'blend_ratio': blend
        }
        
        return vector
    
    def _calculate_confidence(self, vector: PostureVector, dominant_intensity: float) -> float:
        """
        Calculate confidence in posture selection
        Higher confidence for clear blends, lower for ambiguous ones
        """
        # If one posture is very dominant, high confidence
        if dominant_intensity > 0.7:
            return 0.9
        
        # If it's a clear 2-way blend, moderate-high confidence
        active_count = sum(1 for v in [vector.companion, vector.copilot, vector.peer, vector.expert] if v > 0.2)
        if active_count == 2:
            return 0.75
        
        # If it's a 3-way blend, moderate confidence
        if active_count == 3:
            return 0.6
        
        # If it's a 4-way blend, lower confidence (ambiguous)
        if active_count == 4:
            return 0.45
        
        return 0.5
    
    def fast_mode_picker(self) -> str:
        """
        Canonical Spec Section 3.2: Fast Mode-Picker Rule
        
        When ambiguous, ask ONE question to clarify dominant need
        
        Returns the question text
        """
        return (
            "I'm sensing multiple needs. What matters most right now?\n\n"
            "1. Comfort and emotional support\n"
            "2. Clear plan or next steps\n"
            "3. Authentic connection and real talk\n"
            "4. Deep understanding and analysis\n"
            "5. A blend (I'll adapt dynamically)"
        )
    
    def map_choice_to_posture_vector(self, choice: int, intensity: float = 0.7) -> PostureVector:
        """
        Maps fast mode-picker choice to posture vector
        Allows for pure or blended starting points
        """
        if choice == 1:
            return PostureVector(
                companion=intensity,
                copilot=(1-intensity)/3,
                peer=(1-intensity)/3,
                expert=(1-intensity)/3,
                emergent_name="Companion-focused"
            )
        elif choice == 2:
            return PostureVector(
                companion=(1-intensity)/3,
                copilot=intensity,
                peer=(1-intensity)/3,
                expert=(1-intensity)/3,
                emergent_name="Co-Pilot-focused"
            )
        elif choice == 3:
            return PostureVector(
                companion=(1-intensity)/3,
                copilot=(1-intensity)/3,
                peer=intensity,
                expert=(1-intensity)/3,
                emergent_name="Peer-focused"
            )
        elif choice == 4:
            return PostureVector(
                companion=(1-intensity)/3,
                copilot=(1-intensity)/3,
                peer=(1-intensity)/3,
                expert=intensity,
                emergent_name="Expert-focused"
            )
        elif choice == 5:
            # Balanced blend - let context determine
            return PostureVector(
                companion=0.25,
                copilot=0.25,
                peer=0.25,
                expert=0.25,
                emergent_name="Adaptive Blend"
            )
        else:
            # Default to Companion-leaning
            return PostureVector(
                companion=0.5,
                copilot=0.2,
                peer=0.2,
                expert=0.1,
                emergent_name="Supportive Default"
            )
    
    def set_posture_vector(
        self,
        vector: PostureVector,
        reason: str,
        confidence: float = 1.0
    ):
        """
        Set the current posture vector and log the transition
        
        Args:
            vector: The new posture vector to adopt
            reason: Why this posture was selected
            confidence: Confidence in this selection (0.0-1.0)
        """
        previous_vector = self.current_posture_vector
        self.current_posture_vector = vector
        
        # Log the transition
        self.posture_history.append({
            'timestamp': datetime.now().isoformat(),
            'from_posture': previous_vector.to_string(),
            'from_blend': previous_vector.get_blend_ratio(),
            'to_posture': vector.to_string(),
            'to_blend': vector.get_blend_ratio(),
            'reason': reason,
            'confidence': confidence
        })
        
        logger.info(
            f"Posture shifted: {previous_vector.to_string()} → {vector.to_string()} "
            f"(reason: {reason}, confidence: {confidence:.2f})"
        )
        logger.info(f"New blend: {vector.get_blend_ratio()}")
    
    def get_current_characteristics(self) -> Dict:
        """
        Get the blended characteristics of the current posture
        Returns merged characteristics based on vector intensities
        """
        vector = self.current_posture_vector
        
        # Get base characteristics
        companion_chars = self.posture_characteristics[PostureType.COMPANION]
        copilot_chars = self.posture_characteristics[PostureType.COPILOT]
        peer_chars = self.posture_characteristics[PostureType.PEER]
        expert_chars = self.posture_characteristics[PostureType.EXPERT]
        
        # Blend communication styles
        styles = []
        if vector.companion > 0.15:
            styles.append(f"{companion_chars.communication_style} ({int(vector.companion*100)}%)")
        if vector.copilot > 0.15:
            styles.append(f"{copilot_chars.communication_style} ({int(vector.copilot*100)}%)")
        if vector.peer > 0.15:
            styles.append(f"{peer_chars.communication_style} ({int(vector.peer*100)}%)")
        if vector.expert > 0.15:
            styles.append(f"{expert_chars.communication_style} ({int(vector.expert*100)}%)")
        
        return {
            'name': vector.emergent_name or vector.to_string(),
            'description': vector.blend_description,
            'communication_style': " + ".join(styles),
            'blend_ratio': vector.get_blend_ratio(),
            'unique_characteristics': vector.unique_characteristics,
            'dominant_posture': vector.get_dominant_posture()[0].value,
            'is_pure': vector.is_pure_posture()
        }
    
    def get_communication_guidelines(self) -> Dict:
        """
        Get communication guidelines for the current posture blend
        Used by response generation to match posture expectations
        """
        vector = self.current_posture_vector
        chars = self.get_current_characteristics()
        
        # Blend approach details from all active postures
        blended_approach = self._blend_approach_details(vector)
        
        return {
            'posture': chars['name'],
            'blend_ratio': chars['blend_ratio'],
            'style': chars['communication_style'],
            'description': chars['description'],
            'unique_characteristics': chars['unique_characteristics'],
            'dominant': chars['dominant_posture'],
            'is_pure': chars['is_pure'],
            'blended_approach': blended_approach
        }
    
    def _blend_approach_details(self, vector: PostureVector) -> Dict:
        """
        Blend specific approach details based on vector intensities
        Creates unique communication patterns for each blend
        """
        base_approaches = {
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
        
        # Blend the approaches based on intensities
        blended = {
            'response_structure': [],
            'keywords_to_use': [],
            'keywords_to_avoid': [],
            'pacing': [],
            'questions': []
        }
        
        if vector.companion > 0.15:
            comp = base_approaches[PostureType.COMPANION]
            blended['response_structure'].append(f"{comp['response_structure']} ({int(vector.companion*100)}%)")
            blended['keywords_to_use'].extend(comp['keywords_to_use'])
            blended['keywords_to_avoid'].extend(comp['keywords_to_avoid'])
            blended['pacing'].append(comp['pacing'])
            blended['questions'].append(comp['questions'])
        
        if vector.copilot > 0.15:
            cop = base_approaches[PostureType.COPILOT]
            blended['response_structure'].append(f"{cop['response_structure']} ({int(vector.copilot*100)}%)")
            blended['keywords_to_use'].extend(cop['keywords_to_use'])
            blended['keywords_to_avoid'].extend(cop['keywords_to_avoid'])
            blended['pacing'].append(cop['pacing'])
            blended['questions'].append(cop['questions'])
        
        if vector.peer > 0.15:
            pr = base_approaches[PostureType.PEER]
            blended['response_structure'].append(f"{pr['response_structure']} ({int(vector.peer*100)}%)")
            blended['keywords_to_use'].extend(pr['keywords_to_use'])
            blended['keywords_to_avoid'].extend(pr['keywords_to_avoid'])
            blended['pacing'].append(pr['pacing'])
            blended['questions'].append(pr['questions'])
        
        if vector.expert > 0.15:
            exp = base_approaches[PostureType.EXPERT]
            blended['response_structure'].append(f"{exp['response_structure']} ({int(vector.expert*100)}%)")
            blended['keywords_to_use'].extend(exp['keywords_to_use'])
            blended['keywords_to_avoid'].extend(exp['keywords_to_avoid'])
            blended['pacing'].append(exp['pacing'])
            blended['questions'].append(exp['questions'])
        
        # Convert lists to blended descriptions
        return {
            'response_structure': " blended with ".join(blended['response_structure']),
            'keywords_to_use': list(set(blended['keywords_to_use'])),  # Remove duplicates
            'keywords_to_avoid': list(set(blended['keywords_to_avoid'])),
            'pacing': " with ".join(blended['pacing']),
            'questions': " and ".join(blended['questions'])
        }
    
    def get_all_emergent_postures_discovered(self) -> Dict:
        """
        Get all unique emergent postures discovered during this session
        This tracks the ENDLESS COMBINATIONS as they emerge
        """
        return self.emergent_postures_discovered
    
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
