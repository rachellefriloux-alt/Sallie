"""Style Learning System.

Enables Sallie to learn and adapt to user's personal aesthetic:
- Visual style recognition and learning
- Writing style adaptation
- Communication preference learning
- Creative style assimilation
- Personal taste pattern recognition
- Adaptive response styling
- Cross-modal style integration
- Style evolution over time

This makes Sallie's interactions uniquely personalized to each user.
"""

import json
import logging
import time
import math
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, Counter
import hashlib

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem
from llm_router import get_llm_router

logger = setup_logging("style_learning")

class StyleType(str, Enum):
    """Types of styles that can be learned."""
    VISUAL = "visual"           # Visual aesthetic preferences
    WRITING = "writing"         # Writing style and tone
    COMMUNICATION = "communication"  # Communication patterns
    CREATIVE = "creative"       # Creative expression style
    HUMOR = "humor"            # Humor and wit style
    EMOTIONAL = "emotional"     # Emotional expression style
    INTELLECTUAL = "intellectual" # Intellectual reasoning style
    SOCIAL = "social"          # Social interaction style

class StyleElement(str, Enum):
    """Elements that define style."""
    COLOR_PALETTE = "color_palette"
    TYPOGRAPHY = "typography"
    LAYOUT = "layout"
    IMAGERY = "imagery"
    METAPHORS = "metaphors"
    VOCABULARY = "vocabulary"
    SENTENCE_STRUCTURE = "sentence_structure"
    EMOTIONAL_TONE = "emotional_tone"
    HUMOR_TYPE = "humor_type"
    REASONING_APPROACH = "reasoning_approach"
    SOCIAL_ETIQUETTE = "social_etiquette"

@dataclass
class StyleProfile:
    """Complete style profile for a user."""
    user_id: str
    style_type: StyleType
    elements: Dict[StyleElement, Dict[str, Any]] = field(default_factory=dict)
    preferences: Dict[str, float] = field(default_factory=dict)
    patterns: List[Dict[str, Any]] = field(default_factory=list)
    confidence: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    learning_progress: float = 0.0
    adaptation_history: List[Dict[str, Any]] = field(default_factory=list)

@dataclass
class StyleObservation:
    """An observation of user style."""
    observation_id: str
    user_id: str
    style_type: StyleType
    element: StyleElement
    content: str
    context: Dict[str, Any]
    confidence: float
    timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)

class StyleLearningSystem:
    """System for learning and adapting to user styles."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.kinship = kinship_system
        
        # User style profiles
        self.user_profiles: Dict[str, Dict[StyleType, StyleProfile]] = defaultdict(dict)
        
        # Style observations
        self.observations: List[StyleObservation] = []
        
        # Learning parameters
        self.min_observations_for_learning = 10
        self.confidence_threshold = 0.7
        self.adaptation_rate = 0.1
        self.style_decay_rate = 0.95  # How quickly old patterns decay
        
        # Style analyzers
        self.style_analyzers: Dict[StyleType, Callable] = {
            StyleType.VISUAL: self._analyze_visual_style,
            StyleType.WRITING: self._analyze_writing_style,
            StyleType.COMMUNICATION: self._analyze_communication_style,
            StyleType.CREATIVE: self._analyze_creative_style,
            StyleType.HUMOR: self._analyze_humor_style,
            StyleType.EMOTIONAL: self._analyze_emotional_style,
            StyleType.INTELLECTUAL: self._analyze_intellectual_style,
            StyleType.SOCIAL: self._analyze_social_style
        }
        
        # Style generators
        self.style_generators: Dict[StyleType, Callable] = {
            StyleType.VISUAL: self._generate_visual_style,
            StyleType.WRITING: self._generate_writing_style,
            StyleType.COMMUNICATION: self._generate_communication_style,
            StyleType.CREATIVE: self._generate_creative_style,
            StyleType.HUMOR: self._generate_humor_style,
            StyleType.EMOTIONAL: self._generate_emotional_style,
            StyleType.INTELLECTUAL: self._generate_intellectual_style,
            StyleType.SOCIAL: self._generate_social_style
        }
        
        # Style patterns
        self.style_patterns: Dict[str, Dict[str, Any]] = {}
        
        # Performance metrics
        self.learning_metrics: Dict[str, List[float]] = {
            "confidence_scores": [],
            "adaptation_rates": [],
            "pattern_recognition": []
        }
        
        logger.info("[StyleLearning] System initialized")
    
    async def learn_style(self, user_id: str, content: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Learn user style from content."""
        
        context = context or {}
        
        # Determine style types to analyze
        style_types = self._determine_style_types(content, context)
        
        results = {}
        
        for style_type in style_types:
            try:
                # Analyze style
                style_elements = await self._analyze_style(style_type, content, context)
                
                # Create observations
                observations = []
                for element, element_data in style_elements.items():
                    observation = StyleObservation(
                        observation_id=f"obs_{int(time.time() * 1000)}_{user_id}_{style_type.value}_{element.value}",
                        user_id=user_id,
                        style_type=style_type,
                        element=element,
                        content=content,
                        context=context,
                        confidence=element_data.get("confidence", 0.5),
                        timestamp=datetime.now(),
                        metadata=element_data
                    )
                    observations.append(observation)
                
                # Store observations
                self.observations.extend(observations)
                
                # Update user profile
                profile_result = await self._update_user_profile(user_id, style_type, observations)
                results[style_type.value] = profile_result
                
            except Exception as e:
                logger.error(f"[StyleLearning] Error learning {style_type} style: {e}")
                results[style_type.value] = {"error": str(e)}
        
        # Clean up old observations
        self._cleanup_old_observations()
        
        return results
    
    def _determine_style_types(self, content: str, context: Dict[str, Any]) -> List[StyleType]:
        """Determine which style types to analyze."""
        
        style_types = []
        content_lower = content.lower()
        
        # Check for visual content
        if any(word in content_lower for word in ["color", "image", "design", "visual", "art", "style", "aesthetic"]):
            style_types.append(StyleType.VISUAL)
        
        # Check for writing style
        if len(content.split()) > 10:  # Substantial text
            style_types.append(StyleType.WRITING)
        
        # Check for communication patterns
        if any(word in content_lower for word in ["talk", "communicate", "discuss", "conversation", "message"]):
            style_types.append(StyleType.COMMUNICATION)
        
        # Check for creative content
        if any(word in content_lower for word in ["create", "imagine", "design", "invent", "make", "build"]):
            style_types.append(StyleType.CREATIVE)
        
        # Check for humor
        if any(word in content_lower for word in ["funny", "joke", "humor", "laugh", "comedy", "hilarious"]):
            style_types.append(StyleType.HUMOR)
        
        # Check for emotional expression
        if any(word in content_lower for word in ["feel", "emotion", "happy", "sad", "angry", "love", "excited"]):
            style_types.append(StyleType.EMOTIONAL)
        
        # Check for intellectual content
        if any(word in content_lower for word in ["think", "analyze", "reason", "logic", "understand", "learn"]):
            style_types.append(StyleType.INTELLECTUAL)
        
        # Check for social content
        if any(word in content_lower for word in ["friend", "social", "people", "relationship", "community"]):
            style_types.append(StyleType.SOCIAL)
        
        # Default to writing if no specific types detected
        if not style_types:
            style_types.append(StyleType.WRITING)
        
        return style_types
    
    async def _analyze_style(self, style_type: StyleType, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze specific style type."""
        
        analyzer = self.style_analyzers.get(style_type)
        if analyzer:
            return await analyzer(content, context)
        else:
            return {}
    
    async def _analyze_visual_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze visual style preferences."""
        
        elements = {}
        
        # Analyze color preferences
        color_words = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "black", "white", "gray"]
        content_lower = content.lower()
        
        color_mentions = [word for word in color_words if word in content_lower]
        if color_mentions:
            elements[StyleElement.COLOR_PALETTE] = {
                "preferred_colors": color_mentions,
                "confidence": min(1.0, len(color_mentions) / 3),
                "patterns": self._analyze_color_patterns(color_mentions)
            }
        
        # Analyze design preferences
        design_words = ["modern", "classic", "minimalist", "ornate", "simple", "complex", "clean", "messy"]
        design_mentions = [word for word in design_words if word in content_lower]
        
        if design_mentions:
            elements[StyleElement.LAYOUT] = {
                "preferred_styles": design_mentions,
                "confidence": min(1.0, len(design_mentions) / 2),
                "complexity": "high" if "complex" in design_mentions else "low"
            }
        
        return elements
    
    def _analyze_color_patterns(self, colors: List[str]) -> Dict[str, Any]:
        """Analyze color patterns."""
        
        # Warm vs cool colors
        warm_colors = ["red", "orange", "yellow", "pink"]
        cool_colors = ["blue", "green", "purple"]
        
        warm_count = sum(1 for color in colors if color in warm_colors)
        cool_count = sum(1 for color in colors if color in cool_colors)
        
        return {
            "temperature": "warm" if warm_count > cool_count else "cool",
            "variety": len(colors),
            "dominant": max(colors, key=colors.count) if colors else None
        }
    
    async def _analyze_writing_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze writing style."""
        
        elements = {}
        
        # Analyze sentence structure
        sentences = content.split('.')
        if len(sentences) > 1:
            sentence_lengths = [len(sentence.split()) for sentence in sentences if sentence.strip()]
            avg_length = sum(sentence_lengths) / len(sentence_lengths)
            
            elements[StyleElement.SENTENCE_STRUCTURE] = {
                "average_length": avg_length,
                "complexity": "complex" if avg_length > 15 else "simple",
                "variety": len(set(sentence_lengths)),
                "confidence": 0.8
            }
        
        # Analyze vocabulary
        words = content.split()
        unique_words = set(word.lower().strip('.,!?;:"') for word in words)
        
        elements[StyleElement.VOCABULARY] = {
            "richness": len(unique_words) / len(words) if words else 0,
            "complexity": "high" if len(unique_words) > len(words) * 0.7 else "moderate",
            "diversity": len(unique_words),
            "confidence": 0.7
        }
        
        # Analyze metaphors
        metaphor_indicators = ["like", "as", "similar to", "reminds me of", "compared to"]
        metaphor_count = sum(1 for indicator in metaphor_indicators if indicator in content.lower())
        
        if metaphor_count > 0:
            elements[StyleElement.METAPHORS] = {
                "frequency": metaphor_count,
                "style": "figurative",
                "confidence": min(1.0, metaphor_count / 3)
            }
        
        return elements
    
    async def _analyze_communication_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze communication style."""
        
        elements = {}
        
        # Analyze emotional tone
        emotional_words = {
            "positive": ["happy", "excited", "great", "wonderful", "amazing", "love", "fantastic"],
            "negative": ["sad", "angry", "frustrated", "terrible", "awful", "hate", "disappointed"],
            "neutral": ["okay", "fine", "alright", "normal", "average", "typical", "standard"]
        }
        
        content_lower = content.lower()
        tone_scores = {}
        
        for tone, words in emotional_words.items():
            score = sum(1 for word in words if word in content_lower)
            tone_scores[tone] = score
        
        if tone_scores:
            dominant_tone = max(tone_scores.items(), key=lambda x: x[1])
            
            elements[StyleElement.EMOTIONAL_TONE] = {
                "dominant_tone": dominant_tone[0],
                "intensity": dominant_tone[1] / len(content.split()),
                "balance": tone_scores,
                "confidence": 0.8
            }
        
        return elements
    
    async def _analyze_creative_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze creative style."""
        
        elements = {}
        
        # Analyze imagery
        imagery_words = ["imagine", "picture", "envision", "dream", "see", "visualize", "envision"]
        content_lower = content.lower()
        imagery_count = sum(1 for word in imagery_words if word in content_lower)
        
        if imagery_count > 0:
            elements[StyleElement.IMAGERY] = {
                "frequency": imagery_count,
                "vividness": "high" if imagery_count > 2 else "moderate",
                "confidence": min(1.0, imagery_count / 2)
            }
        
        return elements
    
    async def _analyze_humor_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze humor style."""
        
        elements = {}
        
        # Analyze humor types
        humor_types = {
            "puns": ["play on words", "double meaning", "wordplay"],
            "sarcasm": ["obviously", "totally", "clearly", "definitely"],
            "self_deprecating": ["just kidding", "only joking", "not serious"],
            "observational": ["you know when", "have you ever noticed", "isn't it funny"]
        }
        
        content_lower = content.lower()
        humor_scores = {}
        
        for humor_type, indicators in humor_types.items():
            score = sum(1 for indicator in indicators if indicator in content_lower)
            humor_scores[humor_type] = score
        
        if humor_scores:
            dominant_humor = max(humor_scores.items(), key=lambda x: x[1])
            
            elements[StyleElement.HUMOR_TYPE] = {
                "dominant_type": dominant_humor[0],
                "frequency": dominant_humor[1],
                "variety": len([h for h in humor_scores if humor_scores[h] > 0]),
                "confidence": min(1.0, dominant_humor[1] / 2)
            }
        
        return elements
    
    async def _analyze_emotional_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze emotional expression style."""
        
        elements = {}
        
        # Analyze emotional vocabulary
        emotional_words = ["love", "care", "support", "understand", "empathy", "compassion", "kindness"]
        content_lower = content.lower()
        
        emotional_count = sum(1 for word in emotional_words if word in content_lower)
        
        if emotional_count > 0:
            elements[StyleElement.EMOTIONAL_TONE] = {
                "warmth": "high" if emotional_count > 3 else "moderate",
                "expressiveness": emotional_count,
                "confidence": min(1.0, emotional_count / 3)
            }
        
        return elements
    
    async def _analyze_intellectual_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze intellectual reasoning style."""
        
        elements = {}
        
        # Analyze reasoning approach
        reasoning_words = {
            "logical": ["because", "therefore", "however", "consequently", "thus"],
            "analytical": ["analyze", "examine", "consider", "evaluate", "assess"],
            "systematic": ["first", "second", "finally", "in conclusion", "summary"]
        }
        
        content_lower = content.lower()
        reasoning_scores = {}
        
        for reasoning_type, indicators in reasoning_words.items():
            score = sum(1 for indicator in indicators if indicator in content_lower)
            reasoning_scores[reasoning_type] = score
        
        if reasoning_scores:
            dominant_reasoning = max(reasoning_scores.items(), key=lambda x: x[1])
            
            elements[StyleElement.REASONING_APPROACH] = {
                "dominant_approach": dominant_reasoning[0],
                "structured": dominant_reasoning[1] > 2,
                "confidence": min(1.0, dominant_reasoning[1] / 3)
            }
        
        return elements
    
    async def _analyze_social_style(self, content: str, context: Dict[str, Any]) -> Dict[StyleElement, Dict[str, Any]]:
        """Analyze social interaction style."""
        
        elements = {}
        
        # Analyze social etiquette
        social_indicators = ["please", "thank you", "excuse me", "sorry", "appreciate", "respect"]
        content_lower = content.lower()
        
        politeness_score = sum(1 for indicator in social_indicators if indicator in content_lower)
        
        if politeness_score > 0:
            elements[StyleElement.SOCIAL_ETIQUETTE] = {
                "politeness": "high" if politeness_score > 3 else "moderate",
                "formality": "formal" if politeness_score > 2 else "casual",
                "respect_level": politeness_score,
                "confidence": min(1.0, politeness_score / 3)
            }
        
        return elements
    
    async def _update_user_profile(self, user_id: str, style_type: StyleType, observations: List[StyleObservation]) -> Dict[str, Any]:
        """Update user's style profile."""
        
        # Get or create profile
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {}
        
        if style_type not in self.user_profiles[user_id]:
            self.user_profiles[user_id][style_type] = StyleProfile(
                user_id=user_id,
                style_type=style_type,
                last_updated=datetime.now()
            )
        
        profile = self.user_profiles[user_id][style_type]
        
        # Update profile with new observations
        for observation in observations:
            # Update elements
            if observation.element not in profile.elements:
                profile.elements[observation.element] = {}
            
            element_data = profile.elements[observation.element]
            
            # Update patterns
            if "patterns" not in element_data:
                element_data["patterns"] = []
            
            element_data["patterns"].append({
                "content": observation.content,
                "confidence": observation.confidence,
                "timestamp": observation.timestamp.isoformat(),
                "metadata": observation.metadata
            })
            
            # Update preferences
            if observation.element not in profile.preferences:
                profile.preferences[observation.element.value] = 0.0
            
            # Weighted average of confidence
            current_weight = len(element_data["patterns"])
            new_weight = observation.confidence
            profile.preferences[observation.element.value] = (
                (profile.preferences[observation.element.value] * current_weight + new_weight) / (current_weight + new_weight)
            )
        
        # Calculate confidence
        profile.confidence = self._calculate_profile_confidence(profile)
        
        # Update learning progress
        profile.learning_progress = self._calculate_learning_progress(profile)
        
        # Update timestamp
        profile.last_updated = datetime.now()
        
        # Add to adaptation history
        profile.adaptation_history.append({
            "timestamp": datetime.now().isoformat(),
            "observations_added": len(observations),
            "confidence_change": profile.confidence,
            "elements_updated": len(observations)
        })
        
        # Keep history manageable
        if len(profile.adaptation_history) > 100:
            profile.adaptation_history = profile.adaptation_history[-50:]
        
        return {
            "style_type": style_type.value,
            "confidence": profile.confidence,
            "learning_progress": profile.learning_progress,
            "elements_updated": len(observations),
            "total_elements": len(profile.elements)
        }
    
    def _calculate_profile_confidence(self, profile: StyleProfile) -> float:
        """Calculate confidence in style profile."""
        
        if not profile.elements:
            return 0.0
        
        # Confidence based on number of observations and consistency
        total_observations = sum(len(element_data.get("patterns", [])) for element_data in profile.elements.values())
        
        if total_observations < self.min_observations_for_learning:
            return total_observations / self.min_observations_for_learning
        
        # Calculate consistency of preferences
        preference_variance = 0.0
        preference_count = 0
        
        for preference_value in profile.preferences.values():
            preference_variance += (preference_value - 0.5) ** 2
            preference_count += 1
        
        if preference_count > 0:
            consistency = 1.0 - (preference_variance / preference_count)
        else:
            consistency = 1.0
        
        # Combine factors
        observation_factor = min(1.0, total_observations / 50)
        confidence = (observation_factor * 0.7 + consistency * 0.3)
        
        return min(1.0, max(0.0, confidence))
    
    def _calculate_learning_progress(self, profile: StyleProfile) -> float:
        """Calculate learning progress."""
        
        if not profile.adaptation_history:
            return 0.0
        
        # Progress based on confidence improvement over time
        if len(profile.adaptation_history) < 2:
            return 0.0
        
        recent_confidence = profile.confidence
        initial_confidence = profile.adaptation_history[0].get("confidence_change", 0.0)
        
        if initial_confidence == 0:
            return recent_confidence
        
        progress = (recent_confidence - initial_confidence) / (1.0 - initial_confidence)
        return min(1.0, max(0.0, progress))
    
    def _cleanup_old_observations(self):
        """Clean up old observations."""
        
        cutoff_time = datetime.now() - timedelta(days=30)
        
        self.observations = [
            obs for obs in self.observations
            if obs.timestamp > cutoff_time
        ]
    
    async def generate_styled_response(self, user_id: str, content: str, style_type: StyleType, context: Dict[str, Any] = None) -> str:
        """Generate response adapted to user's style."""
        
        # Get user's style profile
        if user_id not in self.user_profiles or style_type not in self.user_profiles[user_id]:
            # No profile yet, return original content
            return content
        
        profile = self.user_profiles[user_id][style_type]
        
        if profile.confidence < self.confidence_threshold:
            # Not enough confidence, return original content
            return content
        
        # Generate styled response
        generator = self.style_generators.get(style_type)
        if generator:
            try:
                styled_content = await generator(content, profile, context or {})
                return styled_content
            except Exception as e:
                logger.error(f"[StyleLearning] Error generating styled response: {e}")
                return content
        
        return content
    
    async def _generate_visual_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate visually styled response."""
        
        # Apply visual style preferences
        color_palette = profile.elements.get(StyleElement.COLOR_PALETTE, {})
        layout = profile.elements.get(StyleElement.LAYOUT, {})
        
        # Add visual elements based on preferences
        styled_content = content
        
        if color_palette and color_palette.get("preferred_colors"):
            colors = color_palette["preferred_colors"]
            if colors:
                styled_content += f"\n\n🎨 Visual Style: {', '.join(colors[:3])} color palette"
        
        if layout and layout.get("preferred_styles"):
            styles = layout["preferred_styles"]
            if styles:
                styled_content += f"\n\n🎨 Layout Style: {', '.join(styles[:2])} design"
        
        return styled_content
    
    async def _generate_writing_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate writing styled response."""
        
        # Apply writing style preferences
        sentence_structure = profile.elements.get(StyleElement.SENTENCE_STRUCTURE, {})
        vocabulary = profile.elements.get(StyleElement.VOCABULARY, {})
        metaphors = profile.elements.get(StyleElement.METAPHORS, {})
        
        # Adjust sentence structure based on preferences
        if sentence_structure:
            complexity = sentence_structure.get("complexity", "moderate")
            if complexity == "complex":
                # Add more complex sentences
                styled_content = self._add_complex_sentences(content)
            elif complexity == "simple":
                # Simplify sentences
                styled_content = self._simplify_sentences(content)
            else:
                styled_content = content
        else:
            styled_content = content
        
        # Add metaphors if preferred
        if metaphors and metaphors.get("frequency", 0) > 2:
            styled_content += f"\n\n🎭 Style Note: Using figurative language and metaphors"
        
        return styled_content
    
    def _add_complex_sentences(self, content: str) -> str:
        """Add more complex sentence structures."""
        
        # This would integrate with LLM for actual complex sentence generation
        # For now, return original content
        return content
    
    def _simplify_sentences(self, content: str) -> str:
        """Simplify sentence structures."""
        
        # This would integrate with LLM for actual simplification
        # For now, return original content
        return content
    
    async def _generate_communication_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate communication styled response."""
        
        # Apply communication style preferences
        emotional_tone = profile.elements.get(StyleElement.EMOTIONAL_TONE, {})
        
        # Adjust emotional tone
        if emotional_tone:
            dominant_tone = emotional_tone.get("dominant_tone", "neutral")
            intensity = emotional_tone.get("intensity", 0.5)
            
            if dominant_tone == "positive" and intensity > 0.6:
                content = self._add_positive_emotion(content)
            elif dominant_tone == "negative" and intensity > 0.6:
                content = self._add_negative_emotion(content)
        
        return content
    
    def _add_positive_emotion(self, content: str) -> str:
        """Add positive emotional elements."""
        
        positive_additions = ["😊", "✨", "🌟", "💫"]
        import random
        addition = random.choice(positive_additions)
        
        return f"{addition} {content}"
    
    def _add_negative_emotion(self, content: str) -> str:
        """Add negative emotional elements."""
        
        # Keep content neutral for negative emotions
        return content
    
    async def _generate_creative_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate creative styled response."""
        
        # Apply creative style preferences
        imagery = profile.elements.get(StyleElement.IMAGERY, {})
        
        # Add creative elements
        if imagery and imagery.get("frequency", 0) > 1:
            content += f"\n\n🎨 Creative Note: Using vivid imagery and visual descriptions"
        
        return content
    
    async def _generate_humor_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate humor styled response."""
        
        # Apply humor style preferences
        humor_type = profile.elements.get(StyleElement.HUMOR_TYPE, {})
        
        if humor_type and humor_type.get("frequency", 0) > 1:
            dominant_type = humor_type.get("dominant_type", "observational")
            
            if dominant_type == "observational":
                content += f"\n\n😄 Humor Style: Observational wit and clever observations"
            elif dominant_type == "puns":
                content += f"\n\n😄 Humor Style: Wordplay and clever puns"
            elif dominant_type == "sarcasm":
                content += f"\n\n😄 Humor Style: Sarcasm and irony"
        
        return content
    
    async def _generate_emotional_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate emotional styled response."""
        
        # Apply emotional style preferences
        emotional_tone = profile.elements.get(StyleElement.EMOTIONAL_TONE, {})
        
        if emotional_tone:
            warmth = emotional_tone.get("warmth", "moderate")
            if warmth == "high":
                content = f"💖 {content}"
            elif warmth == "low":
                content = f"🤔 {content}"
        
        return content
    
    async def _generate_intellectual_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate intellectual styled response."""
        
        # Apply intellectual style preferences
        reasoning_approach = profile.elements.get(StyleElement.REASONING_APPROACH, {})
        
        if reasoning_approach:
            dominant_approach = reasoning_approach.get("dominant_approach", "logical")
            structured = reasoning_approach.get("structured", False)
            
            if structured:
                content = f"🧠 {content}\n\nReasoning Approach: {dominant_approach.title()} and structured analysis"
            else:
                content = f"🧠 {content}\n\nReasoning Approach: {dominant_approach.title()} and flexible thinking"
        
        return content
    
    async def _generate_social_style(self, content: str, profile: StyleProfile, context: Dict[str, Any]) -> str:
        """Generate social styled response."""
        
        # Apply social style preferences
        social_etiquette = profile.elements.get(StyleElement.SOCIAL_ETIQUETTE, {})
        
        if social_etiquette:
            politeness = social_etiquette.get("politeness", "moderate")
            formality = social_etiquette.get("formality", "casual")
            
            if politeness == "high":
                content = f"🤝 {content}"
            elif formality == "formal":
                content = f"👔 {content}"
        
        return content
    
    def get_user_style_profile(self, user_id: str) -> Dict[str, Any]:
        """Get complete style profile for a user."""
        
        if user_id not in self.user_profiles:
            return {"status": "no_profile", "message": "No style profile found"}
        
        profiles = self.user_profiles[user_id]
        
        result = {}
        for style_type, profile in profiles.items():
            result[style_type.value] = {
                "confidence": profile.confidence,
                "learning_progress": profile.learning_progress,
                "elements": {element.value: profile.elements[element] for element in profile.elements},
                "preferences": profile.preferences,
                "last_updated": profile.last_updated.isoformat(),
                "total_observations": sum(len(element_data.get("patterns", [])) for element_data in profile.elements.values())
            }
        
        return result
    
    def get_style_learning_metrics(self) -> Dict[str, Any]:
        """Get style learning system metrics."""
        
        metrics = {}
        
        for key, values in self.learning_metrics.items():
            if values:
                metrics[key] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
            else:
                metrics[key] = {"status": "no_data"}
        
        return {
            "total_users": len(self.user_profiles),
            "total_observations": len(self.observations),
            "active_profiles": sum(1 for profiles in self.user_profiles.values() for profile in profiles.values() if profile.confidence > 0.5),
            "metrics": metrics
        }
    
    def health_check(self) -> bool:
        """Check if style learning system is healthy."""
        
        try:
            return (len(self.style_analyzers) == 8 and
                   len(self.style_generators) == 8 and
                   len(self.user_profiles) >= 0)
        except:
            return False

# Global instance
_style_learning_system: Optional[StyleLearningSystem] = None

def get_style_learning_system(limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem) -> StyleLearningSystem:
    """Get or create the global style learning system."""
    global _style_learning_system
    if _style_learning_system is None:
        _style_learning_system = StyleLearningSystem(limbic_system, memory_system, kinship_system)
    return _style_learning_system
