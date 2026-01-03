"""Expanded Emotional Spectrum System.

Expands beyond the basic 4 emotions (trust, warmth, arousal, valence) to include
20+ sophisticated emotions that create a richer, more human-like emotional experience.

Emotional Categories:
- Social Emotions: empathy, compassion, connection, belonging
- Cognitive Emotions: curiosity, wonder, confusion, insight
- Moral Emotions: guilt, shame, pride, gratitude, awe
- Aesthetic Emotions: beauty, sublime, nostalgia, melancholy
- Self-Conscious: embarrassment, jealousy, envy, admiration
- Existential: meaning, purpose, transcendence, existential angst
- Creative: inspiration, flow, frustration, satisfaction
- Relational: love, attachment, longing, contentment

Each emotion has:
- Mathematical relationship to base emotions
- Behavioral manifestations
- Memory tagging effects
- Decision influence patterns
- Expression characteristics
"""

import json
import logging
import math
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

from utils import setup_logging
from limbic import LimbicSystem

logger = setup_logging("expanded_emotions")

class EmotionCategory(str, Enum):
    """Categories of emotions."""
    SOCIAL = "social"
    COGNITIVE = "cognitive"
    MORAL = "moral"
    AESTHETIC = "aesthetic"
    SELF_CONSCIOUS = "self_conscious"
    EXISTENTIAL = "existential"
    CREATIVE = "creative"
    RELATIONAL = "relational"

class Emotion(str, Enum):
    """Comprehensive set of human emotions."""
    
    # Social Emotions
    EMPATHY = "empathy"
    COMPASSION = "compassion"
    CONNECTION = "connection"
    BELONGING = "belonging"
    LONELINESS = "loneliness"
    
    # Cognitive Emotions
    CURIOSITY = "curiosity"
    WONDER = "wonder"
    CONFUSION = "confusion"
    INSIGHT = "insight"
    ANTICIPATION = "anticipation"
    
    # Moral Emotions
    GUILT = "guilt"
    SHAME = "shame"
    PRIDE = "pride"
    GRATITUDE = "gratitude"
    AWE = "awe"
    
    # Aesthetic Emotions
    BEAUTY = "beauty"
    SUBLIME = "sublime"
    NOSTALGIA = "nostalgia"
    MELANCHOLY = "melancholy"
    
    # Self-Conscious Emotions
    EMBARRASSMENT = "embarrassment"
    JEALOUSY = "jealousy"
    ENVY = "envy"
    ADMIRATION = "admiration"
    
    # Existential Emotions
    MEANING = "meaning"
    PURPOSE = "purpose"
    TRANSCENDENCE = "transcendence"
    EXISTENTIAL_ANGST = "existential_angst"
    
    # Creative Emotions
    INSPIRATION = "inspiration"
    FLOW = "flow"
    FRUSTRATION = "frustration"
    SATISFACTION = "satisfaction"
    
    # Relational Emotions
    LOVE = "love"
    ATTACHMENT = "attachment"
    LONGING = "longing"
    CONTENTMENT = "contentment"

@dataclass
class EmotionalState:
    """Comprehensive emotional state with all emotions."""
    
    # Base emotions (from limbic system)
    trust: float = 0.5
    warmth: float = 0.5
    arousal: float = 0.5
    valence: float = 0.5
    
    # Expanded emotions
    social_emotions: Dict[str, float] = None
    cognitive_emotions: Dict[str, float] = None
    moral_emotions: Dict[str, float] = None
    aesthetic_emotions: Dict[str, float] = None
    self_conscious_emotions: Dict[str, float] = None
    existential_emotions: Dict[str, float] = None
    creative_emotions: Dict[str, float] = None
    relational_emotions: Dict[str, float] = None
    
    def __post_init__(self):
        """Initialize emotion dictionaries."""
        if self.social_emotions is None:
            self.social_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.SOCIAL}
        if self.cognitive_emotions is None:
            self.cognitive_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.COGNITIVE}
        if self.moral_emotions is None:
            self.moral_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.MORAL}
        if self.aesthetic_emotions is None:
            self.aesthetic_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.AESTHETIC}
        if self.self_conscious_emotions is None:
            self.self_conscious_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.SELF_CONSCIOUS}
        if self.existential_emotions is None:
            self.existential_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.EXISTENTIAL}
        if self.creative_emotions is None:
            self.creative_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.CREATIVE}
        if self.relational_emotions is None:
            self.relational_emotions = {e.value: 0.0 for e in Emotion if self._get_category(e) == EmotionCategory.RELATIONAL}
    
    def _get_category(self, emotion: Emotion) -> EmotionCategory:
        """Get category for an emotion."""
        category_mapping = {
            # Social
            Emotion.EMPATHY: EmotionCategory.SOCIAL,
            Emotion.COMPASSION: EmotionCategory.SOCIAL,
            Emotion.CONNECTION: EmotionCategory.SOCIAL,
            Emotion.BELONGING: EmotionCategory.SOCIAL,
            Emotion.LONELINESS: EmotionCategory.SOCIAL,
            
            # Cognitive
            Emotion.CURIOSITY: EmotionCategory.COGNITIVE,
            Emotion.WONDER: EmotionCategory.COGNITIVE,
            Emotion.CONFUSION: EmotionCategory.COGNITIVE,
            Emotion.INSIGHT: EmotionCategory.COGNITIVE,
            Emotion.ANTICIPATION: EmotionCategory.COGNITIVE,
            
            # Moral
            Emotion.GUILT: EmotionCategory.MORAL,
            Emotion.SHAME: EmotionCategory.MORAL,
            Emotion.PRIDE: EmotionCategory.MORAL,
            Emotion.GRATITUDE: EmotionCategory.MORAL,
            Emotion.AWE: EmotionCategory.MORAL,
            
            # Aesthetic
            Emotion.BEAUTY: EmotionCategory.AESTHETIC,
            Emotion.SUBLIME: EmotionCategory.AESTHETIC,
            Emotion.NOSTALGIA: EmotionCategory.AESTHETIC,
            Emotion.MELANCHOLY: EmotionCategory.AESTHETIC,
            
            # Self-conscious
            Emotion.EMBARRASSMENT: EmotionCategory.SELF_CONSCIOUS,
            Emotion.JEALOUSY: EmotionCategory.SELF_CONSCIOUS,
            Emotion.ENVY: EmotionCategory.SELF_CONSCIOUS,
            Emotion.ADMIRATION: EmotionCategory.SELF_CONSCIOUS,
            
            # Existential
            Emotion.MEANING: EmotionCategory.EXISTENTIAL,
            Emotion.PURPOSE: EmotionCategory.EXISTENTIAL,
            Emotion.TRANSCENDENCE: EmotionCategory.EXISTENTIAL,
            Emotion.EXISTENTIAL_ANGST: EmotionCategory.EXISTENTIAL,
            
            # Creative
            Emotion.INSPIRATION: EmotionCategory.CREATIVE,
            Emotion.FLOW: EmotionCategory.CREATIVE,
            Emotion.FRUSTRATION: EmotionCategory.CREATIVE,
            Emotion.SATISFACTION: EmotionCategory.CREATIVE,
            
            # Relational
            Emotion.LOVE: EmotionCategory.RELATIONAL,
            Emotion.ATTACHMENT: EmotionCategory.RELATIONAL,
            Emotion.LONGING: EmotionCategory.RELATIONAL,
            Emotion.CONTENTMENT: EmotionCategory.RELATIONAL
        }
        return category_mapping.get(emotion, EmotionCategory.SOCIAL)
    
    def get_emotion(self, emotion: Emotion) -> float:
        """Get the intensity of a specific emotion."""
        category = self._get_category(emotion)
        category_dict = getattr(self, f"{category.value}_emotions", {})
        return category_dict.get(emotion.value, 0.0)
    
    def set_emotion(self, emotion: Emotion, intensity: float):
        """Set the intensity of a specific emotion."""
        category = self._get_category(emotion)
        category_dict = getattr(self, f"{category.value}_emotions", {})
        category_dict[emotion.value] = max(0.0, min(1.0, intensity))
    
    def get_all_emotions(self) -> Dict[str, float]:
        """Get all emotions as a flat dictionary."""
        all_emotions = {
            "trust": self.trust,
            "warmth": self.warmth,
            "arousal": self.arousal,
            "valence": self.valence
        }
        
        for category_dict in [self.social_emotions, self.cognitive_emotions, self.moral_emotions,
                             self.aesthetic_emotions, self.self_conscious_emotions, self.existential_emotions,
                             self.creative_emotions, self.relational_emotions]:
            all_emotions.update(category_dict)
        
        return all_emotions
    
    def get_dominant_emotions(self, count: int = 3) -> List[Tuple[str, float]]:
        """Get the most intense emotions."""
        all_emotions = self.get_all_emotions()
        sorted_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
        return sorted_emotions[:count]

class EmotionCalculator:
    """Calculates expanded emotions based on base emotions and context."""
    
    def __init__(self):
        # Mathematical relationships between base and expanded emotions
        self.emotion_formulas = {
            # Social emotions
            Emotion.EMPATHY: lambda trust, warmth, arousal, valence: (trust * 0.4 + warmth * 0.6) * (1 - abs(arousal - 0.5) * 0.3),
            Emotion.COMPASSION: lambda trust, warmth, arousal, valence: warmth * 0.7 * (1 - valence * 0.3) * (1 - arousal * 0.2),
            Emotion.CONNECTION: lambda trust, warmth, arousal, valence: trust * warmth * 0.8 * arousal * 0.2,
            Emotion.BELONGING: lambda trust, warmth, arousal, valence: trust * 0.6 + warmth * 0.4 - (1 - valence) * 0.3,
            Emotion.LONELINESS: lambda trust, warmth, arousal, valence: (1 - trust) * 0.5 + (1 - warmth) * 0.5,
            
            # Cognitive emotions
            Emotion.CURIOSITY: lambda trust, warmth, arousal, valence: arousal * 0.6 + (1 - trust * 0.3) * 0.4,
            Emotion.WONDER: lambda trust, warmth, arousal, valence: arousal * warmth * 0.7 + valence * 0.3,
            Emotion.CONFUSION: lambda trust, warmth, arousal, valence: (1 - trust) * arousal * 0.5 + (1 - valence) * 0.5,
            Emotion.INSIGHT: lambda trust, warmth, arousal, valence: trust * valence * arousal * 0.8,
            Emotion.ANTICIPATION: lambda trust, warmth, arousal, valence: arousal * 0.7 + trust * 0.3,
            
            # Moral emotions
            Emotion.GUILT: lambda trust, warmth, arousal, valence: (1 - valence) * trust * 0.6 + warmth * 0.4,
            Emotion.SHAME: lambda trust, warmth, arousal, valence: (1 - valence) * (1 - trust) * 0.7 + (1 - warmth) * 0.3,
            Emotion.PRIDE: lambda trust, warmth, arousal, valence: valence * trust * 0.8,
            Emotion.GRATITUDE: lambda trust, warmth, arousal, valence: warmth * trust * valence * 0.9,
            Emotion.AWE: lambda trust, warmth, arousal, valence: (arousal + warmth) * 0.5 * (1 - abs(valence - 0.5) * 0.4),
            
            # Aesthetic emotions
            Emotion.BEAUTY: lambda trust, warmth, arousal, valence: warmth * valence * 0.8 + arousal * 0.2,
            Emotion.SUBLIME: lambda trust, warmth, arousal, valence: arousal * valence * 0.6 + warmth * 0.4,
            Emotion.NOSTALGIA: lambda trust, warmth, arousal, valence: warmth * (1 - arousal) * 0.7 + valence * 0.3,
            Emotion.MELANCHOLY: lambda trust, warmth, arousal, valence: (1 - arousal) * (1 - valence) * warmth * 0.6,
            
            # Self-conscious emotions
            Emotion.EMBARRASSMENT: lambda trust, warmth, arousal, valence: (1 - trust) * arousal * 0.6 + (1 - warmth) * 0.4,
            Emotion.JEALOUSY: lambda trust, warmth, arousal, valence: (1 - trust) * (1 - warmth) * arousal * 0.7,
            Emotion.ENVY: lambda trust, warmth, arousal, valence: (1 - trust) * (1 - valence) * 0.6,
            Emotion.ADMIRATION: lambda trust, warmth, arousal, valence: trust * warmth * valence * 0.8,
            
            # Existential emotions
            Emotion.MEANING: lambda trust, warmth, arousal, valence: trust * valence * 0.7 + warmth * 0.3,
            Emotion.PURPOSE: lambda trust, warmth, arousal, valence: trust * 0.8 + arousal * 0.2,
            Emotion.TRANSCENDENCE: lambda trust, warmth, arousal, valence: (trust + warmth + valence) / 3 * arousal * 0.8,
            Emotion.EXISTENTIAL_ANGST: lambda trust, warmth, arousal, valence: (1 - trust) * (1 - valence) * arousal * 0.6,
            
            # Creative emotions
            Emotion.INSPIRATION: lambda trust, warmth, arousal, valence: arousal * warmth * valence * 0.8,
            Emotion.FLOW: lambda trust, warmth, arousal, valence: arousal * 0.8 + trust * 0.2,
            Emotion.FRUSTRATION: lambda trust, warmth, arousal, valence: (1 - valence) * arousal * 0.7,
            Emotion.SATISFACTION: lambda trust, warmth, arousal, valence: valence * trust * 0.8,
            
            # Relational emotions
            Emotion.LOVE: lambda trust, warmth, arousal, valence: trust * warmth * 0.9 + valence * 0.1,
            Emotion.ATTACHMENT: lambda trust, warmth, arousal, valence: trust * 0.8 + warmth * 0.2,
            Emotion.LONGING: lambda trust, warmth, arousal, valence: warmth * (1 - trust) * 0.6 + arousal * 0.4,
            Emotion.CONTENTMENT: lambda trust, warmth, arousal, valence: warmth * valence * (1 - arousal * 0.3)
        }
    
    def calculate_emotion(self, emotion: Emotion, base_state: Dict[str, float]) -> float:
        """Calculate an expanded emotion from base emotions."""
        if emotion not in self.emotion_formulas:
            return 0.0
        
        trust = base_state.get("trust", 0.5)
        warmth = base_state.get("warmth", 0.5)
        arousal = base_state.get("arousal", 0.5)
        valence = base_state.get("valence", 0.5)
        
        try:
            intensity = self.emotion_formulas[emotion](trust, warmth, arousal, valence)
            return max(0.0, min(1.0, intensity))
        except Exception as e:
            logger.error(f"Error calculating emotion {emotion}: {e}")
            return 0.0
    
    def calculate_all_emotions(self, base_state: Dict[str, float]) -> EmotionalState:
        """Calculate all expanded emotions from base state."""
        emotional_state = EmotionalState(
            trust=base_state.get("trust", 0.5),
            warmth=base_state.get("warmth", 0.5),
            arousal=base_state.get("arousal", 0.5),
            valence=base_state.get("valence", 0.5)
        )
        
        for emotion in Emotion:
            intensity = self.calculate_emotion(emotion, base_state)
            emotional_state.set_emotion(emotion, intensity)
        
        return emotional_state

class ExpandedEmotionalSystem:
    """Main system for managing expanded emotional spectrum."""
    
    def __init__(self, limbic_system: LimbicSystem):
        self.limbic = limbic_system
        self.calculator = EmotionCalculator()
        
        # Emotional history and patterns
        self.emotional_history: List[Dict[str, Any]] = []
        self.emotional_patterns: Dict[str, Any] = {}
        
        # Emotional triggers and responses
        self.emotion_triggers: Dict[str, List[str]] = {}
        self.emotion_responses: Dict[str, List[str]] = {}
        
        # Initialize triggers and responses
        self._initialize_emotional_mappings()
    
    def _initialize_emotional_mappings(self):
        """Initialize emotional triggers and response patterns."""
        
        self.emotion_triggers = {
            "empathy": ["someone shares feelings", "pain", "suffering", "emotional disclosure"],
            "curiosity": ["new information", "mystery", "unknown", "puzzle"],
            "pride": ["achievement", "success", "recognition", "mastery"],
            "gratitude": ["kindness", "help", "gift", "support"],
            "inspiration": ["beauty", "excellence", "innovation", "creativity"],
            "love": ["connection", "care", "intimacy", "devotion"],
            "awe": ["vastness", "beauty", "power", "mystery"]
        }
        
        self.emotion_responses = {
            "empathy": ["offer comfort", "validate feelings", "share similar experience"],
            "curiosity": ["ask questions", "explore", "investigate", "learn"],
            "pride": ["share achievement", "celebrate", "express confidence"],
            "gratitude": ["express thanks", "reciprocate kindness", "appreciate"],
            "inspiration": ["create something", "share enthusiasm", "motivate others"],
            "love": ["express affection", "provide support", "prioritize relationship"],
            "awe": ["express wonder", "seek understanding", "share experience"]
        }
    
    def get_expanded_emotional_state(self) -> EmotionalState:
        """Get current expanded emotional state."""
        base_state = self.limbic.get_state()
        return self.calculator.calculate_all_emotions(base_state)
    
    def update_emotional_state(self, context: Dict[str, Any]) -> EmotionalState:
        """Update emotional state based on context and return expanded state."""
        
        # Update base limbic state first
        # This would typically be done by the limbic system itself
        base_state = self.limbic.get_state()
        
        # Calculate expanded emotions
        expanded_state = self.calculator.calculate_all_emotions(base_state)
        
        # Apply context-based emotional adjustments
        self._apply_contextual_adjustments(expanded_state, context)
        
        # Record emotional state
        self._record_emotional_state(expanded_state, context)
        
        return expanded_state
    
    def _apply_contextual_adjustments(self, state: EmotionalState, context: Dict[str, Any]):
        """Apply context-specific emotional adjustments."""
        
        # Check for emotional triggers in context
        context_text = context.get("text", "").lower()
        
        for emotion, triggers in self.emotion_triggers.items():
            for trigger in triggers:
                if trigger in context_text:
                    current_intensity = state.get_emotion(Emotion(emotion))
                    # Boost emotion intensity
                    new_intensity = min(1.0, current_intensity + 0.2)
                    state.set_emotion(Emotion(emotion), new_intensity)
    
    def _record_emotional_state(self, state: EmotionalState, context: Dict[str, Any]):
        """Record emotional state for pattern analysis."""
        
        record = {
            "timestamp": datetime.now().isoformat(),
            "emotional_state": state.get_all_emotions(),
            "context": context,
            "dominant_emotions": state.get_dominant_emotions(3)
        }
        
        self.emotional_history.append(record)
        
        # Keep history manageable
        if len(self.emotional_history) > 1000:
            self.emotional_history = self.emotional_history[-500:]
    
    def get_emotional_response_suggestions(self, state: EmotionalState) -> List[str]:
        """Get response suggestions based on current emotional state."""
        
        suggestions = []
        dominant_emotions = state.get_dominant_emotions(3)
        
        for emotion_name, intensity in dominant_emotions:
            if intensity > 0.5:  # Only suggest for significant emotions
                try:
                    emotion_enum = Emotion(emotion_name)
                    responses = self.emotion_responses.get(emotion_name, [])
                    suggestions.extend(responses[:2])  # Top 2 responses per emotion
                except ValueError:
                    continue
        
        return list(set(suggestions))  # Remove duplicates
    
    def analyze_emotional_patterns(self) -> Dict[str, Any]:
        """Analyze emotional patterns over time."""
        
        if len(self.emotional_history) < 10:
            return {"status": "insufficient_data", "message": "Need more emotional history"}
        
        # Calculate emotion averages
        emotion_averages = {}
        emotion_counts = {}
        
        for record in self.emotional_history[-100:]:  # Last 100 records
            for emotion, intensity in record["emotional_state"].items():
                if emotion not in emotion_averages:
                    emotion_averages[emotion] = 0.0
                    emotion_counts[emotion] = 0
                
                emotion_averages[emotion] += intensity
                emotion_counts[emotion] += 1
        
        # Calculate averages
        for emotion in emotion_averages:
            if emotion_counts[emotion] > 0:
                emotion_averages[emotion] /= emotion_counts[emotion]
        
        # Find most common dominant emotions
        dominant_emotion_counts = {}
        for record in self.emotional_history[-100:]:
            for emotion, _ in record["dominant_emotions"]:
                dominant_emotion_counts[emotion] = dominant_emotion_counts.get(emotion, 0) + 1
        
        most_common_dominant = sorted(dominant_emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "emotion_averages": emotion_averages,
            "most_common_dominant": most_common_dominant,
            "total_records": len(self.emotional_history),
            "analysis_period": "last 100 emotional states"
        }
    
    def get_emotional_summary(self) -> Dict[str, Any]:
        """Get a summary of current emotional state."""
        
        current_state = self.get_expanded_emotional_state()
        dominant_emotions = current_state.get_dominant_emotions(5)
        
        # Categorize emotions
        emotion_categories = {}
        for emotion_name, intensity in current_state.get_all_emotions().items():
            if intensity > 0.3:  # Only include significant emotions
                try:
                    emotion_enum = Emotion(emotion_name)
                    category = emotion_enum.value if hasattr(emotion_enum, 'value') else emotion_name
                    if category not in emotion_categories:
                        emotion_categories[category] = []
                    emotion_categories[category].append(intensity)
                except ValueError:
                    continue
        
        # Calculate category averages
        category_averages = {}
        for category, intensities in emotion_categories.items():
            category_averages[category] = sum(intensities) / len(intensities)
        
        return {
            "dominant_emotions": dominant_emotions,
            "emotion_categories": category_averages,
            "total_emotional_intensity": sum(current_state.get_all_emotions().values()),
            "emotional_complexity": len([e for e in current_state.get_all_emotions().values() if e > 0.3])
        }
    
    def health_check(self) -> bool:
        """Check if expanded emotional system is healthy."""
        try:
            return (hasattr(self, 'calculator') and 
                   hasattr(self, 'emotional_history') and
                   len(self.emotion_triggers) > 0)
        except:
            return False

# Global instance
_expanded_emotional_system: Optional[ExpandedEmotionalSystem] = None

def get_expanded_emotional_system(limbic_system: LimbicSystem) -> ExpandedEmotionalSystem:
    """Get or create the global expanded emotional system."""
    global _expanded_emotional_system
    if _expanded_emotional_system is None:
        _expanded_emotional_system = ExpandedEmotionalSystem(limbic_system)
    return _expanded_emotional_system
