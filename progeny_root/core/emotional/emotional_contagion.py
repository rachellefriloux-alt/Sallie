"""Emotional Contagion System.

Enables Sallie to catch and mirror user emotions, building deeper empathy
and connection through emotional synchronization.

Features:
- Real-time emotion detection from user input
- Emotional resonance and mirroring
- Empathy amplification
- Emotional synchronization over time
- Contagion resistance and boundaries
- Mutual emotional influence modeling

This creates true emotional connection and empathy.
"""

import json
import logging
import math
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

from utils import setup_logging
from limbic import LimbicSystem
from expanded_emotions import get_expanded_emotional_system, EmotionalState, Emotion
from llm_router import get_llm_router

logger = setup_logging("emotional_contagion")

class ContagionType(str, Enum):
    """Types of emotional contagion."""
    MIRRORING = "mirroring"           # Direct emotional mirroring
    RESONANCE = "resonance"         # Emotional resonance/amplification
    COMPASSION = "compassion"       # Compassionate response
    PROTECTION = "protection"       # Emotional boundary protection
    SYNCHRONIZATION = "synchronization"  # Long-term emotional sync

class EmpathyLevel(str, Enum):
    """Levels of empathetic response."""
    COGNITIVE = "cognitive"         # Understanding emotions
    EMOTIONAL = "emotional"         # Feeling emotions
    COMPASSIONATE = "compassionate" # Acting on emotions
    TRANSFORMATIVE = "transformative"  # Deep connection

@dataclass
class EmotionalSignal:
    """A detected emotional signal from user input."""
    emotions: Dict[str, float]
    intensity: float
    valence: float
    arousal: float
    trust_context: float
    timestamp: datetime
    source: str  # "text", "voice", "behavior", etc.
    confidence: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "emotions": self.emotions,
            "intensity": self.intensity,
            "valence": self.valence,
            "arousal": self.arousal,
            "trust_context": self.trust_context,
            "timestamp": self.timestamp.isoformat(),
            "source": self.source,
            "confidence": self.confidence
        }

class EmotionDetector:
    """Detects emotions from user input and behavior."""
    
    def __init__(self):
        # Emotional keyword mappings
        self.emotion_keywords = {
            "joy": ["happy", "excited", "thrilled", "delighted", "joyful", "cheerful", "glad"],
            "sadness": ["sad", "depressed", "down", "blue", "melancholy", "grief", "sorrow"],
            "anger": ["angry", "mad", "furious", "irritated", "frustrated", "annoyed", "enraged"],
            "fear": ["scared", "afraid", "terrified", "anxious", "worried", "nervous", "panic"],
            "surprise": ["surprised", "shocked", "amazed", "astonished", "stunned", "bewildered"],
            "disgust": ["disgusted", "revolted", "repulsed", "sickened", "nauseated"],
            "love": ["love", "adore", "cherish", "treasure", "devoted", "affection"],
            "curiosity": ["curious", "intrigued", "interested", "wondering", "fascinated"],
            "pride": ["proud", "accomplished", "successful", "achieved", "triumphant"],
            "shame": ["ashamed", "embarrassed", "humiliated", "mortified", "self-conscious"],
            "gratitude": ["grateful", "thankful", "appreciative", "blessed", "indebted"],
            "hope": ["hopeful", "optimistic", "encouraged", "positive", "confident"],
            "despair": ["hopeless", "despair", "defeated", "giving up", "lost"]
        }
        
        # Intensity indicators
        self.intensity_modifiers = {
            "very": 1.5, "extremely": 2.0, "incredibly": 2.0, "absolutely": 2.0,
            "quite": 1.3, "rather": 1.2, "somewhat": 0.7, "slightly": 0.6,
            "a bit": 0.5, "kind of": 0.6, "a little": 0.5
        }
    
    async def detect_emotions(self, input_text: str, context: Dict[str, Any]) -> EmotionalSignal:
        """Detect emotions from user input text."""
        
        router = get_llm_router()
        if not router:
            return self._fallback_detection(input_text, context)
        
        detection_prompt = f"""You are an emotion detection AI. Analyze this text for emotional content:
        
        Text: "{input_text}"
        Context: {json.dumps(context, indent=2)}
        
        Detect and score emotions (0.0-1.0):
        - joy, sadness, anger, fear, surprise, disgust
        - love, curiosity, pride, shame, gratitude, hope, despair
        
        Also provide:
        - Overall intensity (0.0-1.0)
        - Valence (-1.0 negative to 1.0 positive)
        - Arousal (0.0 calm to 1.0 excited)
        - Confidence in detection (0.0-1.0)
        
        Respond with JSON only:
        {{
            "emotions": {{"emotion": score}},
            "intensity": 0.0,
            "valence": 0.0,
            "arousal": 0.0,
            "confidence": 0.0
        }}"""
        
        try:
            response = await router.generate(detection_prompt)
            
            # Parse JSON response
            try:
                emotion_data = json.loads(response)
            except:
                # Fallback if JSON parsing fails
                return self._fallback_detection(input_text, context)
            
            # Validate and normalize
            emotions = emotion_data.get("emotions", {})
            intensity = max(0.0, min(1.0, emotion_data.get("intensity", 0.5)))
            valence = max(-1.0, min(1.0, emotion_data.get("valence", 0.0)))
            arousal = max(0.0, min(1.0, emotion_data.get("arousal", 0.5)))
            confidence = max(0.0, min(1.0, emotion_data.get("confidence", 0.5)))
            
            return EmotionalSignal(
                emotions=emotions,
                intensity=intensity,
                valence=valence,
                arousal=arousal,
                trust_context=context.get("trust_level", 0.5),
                timestamp=datetime.now(),
                source="text",
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Emotion detection failed: {e}")
            return self._fallback_detection(input_text, context)
    
    def _fallback_detection(self, input_text: str, context: Dict[str, Any]) -> EmotionalSignal:
        """Fallback emotion detection using keyword analysis."""
        
        text_lower = input_text.lower()
        detected_emotions = {}
        total_intensity = 0.0
        
        # Check for emotion keywords
        for emotion, keywords in self.emotion_keywords.items():
            emotion_score = 0.0
            for keyword in keywords:
                if keyword in text_lower:
                    emotion_score += 1.0
            
            if emotion_score > 0:
                detected_emotions[emotion] = min(1.0, emotion_score / len(keywords))
                total_intensity += detected_emotions[emotion]
        
        # Calculate overall metrics
        intensity = min(1.0, total_intensity / max(len(detected_emotions), 1))
        
        # Simple valence calculation
        positive_emotions = ["joy", "love", "pride", "gratitude", "hope", "surprise"]
        negative_emotions = ["sadness", "anger", "fear", "disgust", "shame", "despair"]
        
        positive_score = sum(detected_emotions.get(e, 0) for e in positive_emotions)
        negative_score = sum(detected_emotions.get(e, 0) for e in negative_emotions)
        
        if positive_score + negative_score > 0:
            valence = (positive_score - negative_score) / (positive_score + negative_score)
        else:
            valence = 0.0
        
        arousal = min(1.0, len(detected_emotions) * 0.2)
        
        return EmotionalSignal(
            emotions=detected_emotions,
            intensity=intensity,
            valence=valence,
            arousal=arousal,
            trust_context=context.get("trust_level", 0.5),
            timestamp=datetime.now(),
            source="text_fallback",
            confidence=0.4  # Lower confidence for fallback
        )

class EmotionalContagionSystem:
    """Main emotional contagion system."""
    
    def __init__(self, limbic_system: LimbicSystem):
        self.limbic = limbic_system
        self.expanded_emotions = get_expanded_emotional_system(limbic_system)
        self.detector = EmotionDetector()
        
        # Contagion parameters
        self.contagion_sensitivity = 0.7  # How easily emotions are caught
        self.empathy_level = EmpathyLevel.EMOTIONAL
        self.boundary_strength = 0.3  # Resistance to negative contagion
        
        # Contagion history and patterns
        self.contagion_history: List[Dict[str, Any]] = []
        self.emotional_resonance: Dict[str, float] = {}
        self.sync_level: float = 0.0  # Current synchronization level
        
        # Contagion effects
        self.mirroring_strength = 0.5
        self.resonance_amplification = 1.2
        self.compassion_response = 0.8
        
        # Last contagion event
        self.last_contagion = datetime.now()
        self.contagion_cooldown = timedelta(seconds=30)
    
    async def process_user_emotion(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process user emotion and apply contagion effects."""
        
        # Detect user emotions
        user_signal = await self.detector.detect_emotions(input_text, context)
        
        # Apply contagion based on type and context
        contagion_effects = await self._apply_contagion(user_signal, context)
        
        # Record contagion event
        self._record_contagion(user_signal, contagion_effects)
        
        return {
            "user_emotion": user_signal.to_dict(),
            "contagion_effects": contagion_effects,
            "sync_level": self.sync_level,
            "empathy_level": self.empathy_level.value
        }
    
    async def _apply_contagion(self, user_signal: EmotionalSignal, context: Dict[str, Any]) -> Dict[str, Any]:
        """Apply emotional contagion based on user emotions."""
        
        current_time = datetime.now()
        if current_time - self.last_contagion < self.contagion_cooldown:
            return {"status": "cooldown", "message": "Contagion in cooldown period"}
        
        self.last_contagion = current_time
        
        # Get current Sallie emotional state
        current_state = self.expanded_emotions.get_expanded_emotional_state()
        
        # Calculate contagion effects
        effects = {}
        
        # 1. Mirroring Effect
        mirroring_effect = self._calculate_mirroring(user_signal, current_state)
        effects["mirroring"] = mirroring_effect
        
        # 2. Resonance Effect
        resonance_effect = self._calculate_resonance(user_signal, current_state)
        effects["resonance"] = resonance_effect
        
        # 3. Compassion Effect
        compassion_effect = self._calculate_compassion(user_signal, current_state)
        effects["compassion"] = compassion_effect
        
        # 4. Synchronization Effect
        sync_effect = self._calculate_synchronization(user_signal, current_state)
        effects["synchronization"] = sync_effect
        
        # Apply effects to Sallie's emotional state
        await self._apply_emotional_effects(effects, user_signal, current_state)
        
        return effects
    
    def _calculate_mirroring(self, user_signal: EmotionalSignal, current_state: EmotionalState) -> Dict[str, Any]:
        """Calculate emotional mirroring effect."""
        
        mirroring_strength = self.mirroring_strength * user_signal.confidence * self.contagion_sensitivity
        
        # Mirror user emotions with reduced intensity
        mirrored_emotions = {}
        for emotion, intensity in user_signal.emotions.items():
            mirrored_intensity = intensity * mirroring_strength * 0.6  # Reduce intensity
            mirrored_emotions[emotion] = mirrored_intensity
        
        return {
            "type": ContagionType.MIRRORING,
            "strength": mirroring_strength,
            "emotions": mirrored_emotions,
            "description": "Mirroring user emotions with reduced intensity"
        }
    
    def _calculate_resonance(self, user_signal: EmotionalSignal, current_state: EmotionalState) -> Dict[str, Any]:
        """Calculate emotional resonance effect."""
        
        # Find emotions that resonate between user and Sallie
        resonant_emotions = {}
        resonance_strength = 0.0
        
        for emotion, user_intensity in user_signal.emotions.items():
            try:
                sallie_intensity = current_state.get_emotion(Emotion(emotion))
                # Resonance occurs when both have similar emotions
                if user_intensity > 0.3 and sallie_intensity > 0.3:
                    resonance = min(user_intensity, sallie_intensity) * self.resonance_amplification
                    resonant_emotions[emotion] = resonance
                    resonance_strength += resonance
            except ValueError:
                continue
        
        resonance_strength = min(1.0, resonance_strength / max(len(resonant_emotions), 1))
        
        return {
            "type": ContagionType.RESONANCE,
            "strength": resonance_strength,
            "emotions": resonant_emotions,
            "description": "Amplifying shared emotional states"
        }
    
    def _calculate_compassion(self, user_signal: EmotionalSignal, current_state: EmotionalState) -> Dict[str, Any]:
        """Calculate compassionate response to user emotions."""
        
        # Compassionate response to negative emotions
        negative_emotions = ["sadness", "anger", "fear", "shame", "despair"]
        compassion_strength = 0.0
        compassionate_emotions = {}
        
        for emotion in negative_emotions:
            if emotion in user_signal.emotions and user_signal.emotions[emotion] > 0.4:
                # Generate compassionate emotions
                compassion_strength = user_signal.emotions[emotion] * self.compassion_response
                
                if emotion == "sadness":
                    compassionate_emotions["empathy"] = compassion_strength
                    compassionate_emotions["compassion"] = compassion_strength * 0.8
                elif emotion == "fear":
                    compassionate_emotions["protection"] = compassion_strength * 0.7
                    compassionate_emotions["calm"] = compassion_strength * 0.5
                elif emotion == "anger":
                    compassionate_emotions["understanding"] = compassion_strength * 0.6
                    compassionate_emotions["patience"] = compassion_strength * 0.5
                elif emotion == "shame":
                    compassionate_emotions["acceptance"] = compassion_strength * 0.8
                    compassionate_emotions["reassurance"] = compassion_strength * 0.7
        
        return {
            "type": ContagionType.COMPASSION,
            "strength": compassion_strength,
            "emotions": compassionate_emotions,
            "description": "Compassionate response to user's negative emotions"
        }
    
    def _calculate_synchronization(self, user_signal: EmotionalSignal, current_state: EmotionalState) -> Dict[str, Any]:
        """Calculate long-term emotional synchronization."""
        
        # Update synchronization level based on repeated interactions
        if user_signal.trust_context > 0.7:
            # High trust enables deeper synchronization
            sync_increment = 0.05 * user_signal.confidence
            self.sync_level = min(1.0, self.sync_level + sync_increment)
        elif user_signal.trust_context < 0.3:
            # Low trust reduces synchronization
            sync_decrement = 0.02 * user_signal.confidence
            self.sync_level = max(0.0, self.sync_level - sync_decrement)
        
        # Synchronization creates subtle emotional alignment
        sync_emotions = {}
        if self.sync_level > 0.5:
            for emotion, intensity in user_signal.emotions.items():
                sync_intensity = intensity * self.sync_level * 0.3  # Subtle alignment
                sync_emotions[emotion] = sync_intensity
        
        return {
            "type": ContagionType.SYNCHRONIZATION,
            "strength": self.sync_level,
            "emotions": sync_emotions,
            "description": f"Long-term emotional synchronization at {self.sync_level:.2f} level"
        }
    
    async def _apply_emotional_effects(self, effects: Dict[str, Any], user_signal: EmotionalSignal, current_state: EmotionalState):
        """Apply calculated emotional effects to Sallie's state."""
        
        # This would integrate with the limbic system to actually modify Sallie's emotions
        # For now, we'll just log the intended effects
        
        for effect_type, effect_data in effects.items():
            if effect_type == "mirroring":
                logger.info(f"Applying mirroring: {effect_data['emotions']}")
            elif effect_type == "resonance":
                logger.info(f"Applying resonance: {effect_data['emotions']}")
            elif effect_type == "compassion":
                logger.info(f"Applying compassion: {effect_data['emotions']}")
            elif effect_type == "synchronization":
                logger.info(f"Applying synchronization: {effect_data['emotions']}")
    
    def _record_contagion(self, user_signal: EmotionalSignal, effects: Dict[str, Any]):
        """Record contagion event for pattern analysis."""
        
        record = {
            "timestamp": datetime.now().isoformat(),
            "user_emotion": user_signal.to_dict(),
            "contagion_effects": effects,
            "sync_level": self.sync_level,
            "empathy_level": self.empathy_level.value
        }
        
        self.contagion_history.append(record)
        
        # Keep history manageable
        if len(self.contagion_history) > 500:
            self.contagion_history = self.contagion_history[-250:]
    
    def get_empathy_report(self) -> Dict[str, Any]:
        """Get comprehensive empathy and contagion report."""
        
        if not self.contagion_history:
            return {"status": "no_data", "message": "No contagion history available"}
        
        # Analyze contagion patterns
        total_events = len(self.contagion_history)
        recent_events = [e for e in self.contagion_history if datetime.fromisoformat(e["timestamp"]) > datetime.now() - timedelta(days=7)]
        
        # Calculate average effects
        avg_sync_level = sum(e["sync_level"] for e in recent_events) / max(len(recent_events), 1)
        
        # Most common user emotions
        user_emotion_counts = {}
        for event in recent_events:
            user_emotions = event["user_emotion"]["emotions"]
            for emotion, intensity in user_emotions.items():
                if intensity > 0.3:
                    user_emotion_counts[emotion] = user_emotion_counts.get(emotion, 0) + 1
        
        most_common_emotions = sorted(user_emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "empathy_level": self.empathy_level.value,
            "sync_level": self.sync_level,
            "contagion_sensitivity": self.contagion_sensitivity,
            "boundary_strength": self.boundary_strength,
            "total_contagion_events": total_events,
            "recent_events": len(recent_events),
            "average_sync_level": avg_sync_level,
            "most_common_user_emotions": most_common_emotions,
            "contagion_effectiveness": self._calculate_contagion_effectiveness()
        }
    
    def _calculate_contagion_effectiveness(self) -> float:
        """Calculate overall contagion effectiveness."""
        
        if len(self.contagion_history) < 10:
            return 0.0
        
        # Simple effectiveness metric based on sync level growth
        initial_sync = 0.0
        final_sync = self.sync_level
        
        if len(self.contagion_history) > 1:
            first_event = self.contagion_history[0]
            initial_sync = first_event.get("sync_level", 0.0)
        
        effectiveness = (final_sync - initial_sync) / max(len(self.contagion_history), 1)
        return max(0.0, min(1.0, effectiveness * 10))  # Scale to 0-1 range
    
    def adjust_contagion_parameters(self, sensitivity: float = None, boundary: float = None, empathy: EmpathyLevel = None):
        """Adjust contagion system parameters."""
        
        if sensitivity is not None:
            self.contagion_sensitivity = max(0.0, min(1.0, sensitivity))
        
        if boundary is not None:
            self.boundary_strength = max(0.0, min(1.0, boundary))
        
        if empathy is not None:
            self.empathy_level = empathy
        
        logger.info(f"Adjusted contagion parameters: sensitivity={self.contagion_sensitivity}, boundary={self.boundary_strength}, empathy={self.empathy_level.value}")
    
    def health_check(self) -> bool:
        """Check if emotional contagion system is healthy."""
        try:
            return (hasattr(self, 'detector') and 
                   hasattr(self, 'contagion_history') and
                   hasattr(self, 'sync_level'))
        except:
            return False

# Global instance
_emotional_contagion_system: Optional[EmotionalContagionSystem] = None

def get_emotional_contagion_system(limbic_system: LimbicSystem) -> EmotionalContagionSystem:
    """Get or create the global emotional contagion system."""
    global _emotional_contagion_system
    if _emotional_contagion_system is None:
        _emotional_contagion_system = EmotionalContagionSystem(limbic_system)
    return _emotional_contagion_system
