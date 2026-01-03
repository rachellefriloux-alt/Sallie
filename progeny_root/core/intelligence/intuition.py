"""
Intuition Engine - Bridge to Human Gut Feelings

Generates hunches, gut feelings, and intuitive insights.
Not based on pure logic, but on pattern recognition, emotional resonance, and "felt sense."
"""

import json
import time
import logging
import random
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

try:
    from ..infrastructure.limbic import LimbicSystem
except ImportError:
    try:
        from infrastructure.limbic import LimbicSystem
    except ImportError:
        try:
            from limbic import LimbicSystem
        except ImportError:
            LimbicSystem = None

try:
    from ..emotional_memory import EmotionalMemorySystem
except ImportError:
    try:
        from emotional_memory import EmotionalMemorySystem
    except ImportError:
        EmotionalMemorySystem = None

logger = logging.getLogger("intuition")


class IntuitionType(str, Enum):
    """Types of intuitive insights."""
    HUNCH = "hunch"  # "I have a feeling that..."
    WARNING = "warning"  # "Something feels off..."
    OPPORTUNITY = "opportunity"  # "I sense an opportunity..."
    CONNECTION = "connection"  # "This reminds me of..."
    PATTERN = "pattern"  # "I notice a pattern..."
    RESONANCE = "resonance"  # "This resonates with..."
    DISSONANCE = "dissonance"  # "This doesn't feel right..."
    CERTAINTY = "certainty"  # "I'm certain that..."
    UNCERTAINTY = "uncertainty"  # "I'm not sure, but..."
    CURIOSITY = "curiosity"  # "I'm curious about..."


@dataclass
class Intuition:
    """A single intuitive insight."""
    id: str
    timestamp: float
    type: IntuitionType
    content: str
    confidence: float  # 0.0 to 1.0 (how strong the feeling is)
    source: str  # What triggered it (pattern, emotion, memory, etc.)
    associated_data: Dict[str, Any]
    expressed: bool  # Whether Sallie has shared this with Creator


class IntuitionEngine:
    """
    Generates intuitive insights - the bridge between logical analysis and gut feelings.
    
    Intuition comes from:
    - Pattern recognition across emotional memories
    - Limbic state resonance
    - Temporal patterns
    - Emotional echoes
    - "Felt sense" of situations
    """
    
    def __init__(
        self,
        limbic: LimbicSystem,
        emotional_memory: EmotionalMemorySystem
    ):
        self.limbic = limbic
        self.emotional_memory = emotional_memory
        self.intuitions: List[Intuition] = []
        self.storage_path = Path("progeny_root/memory/intuitions")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._load_intuitions()
    
    def _load_intuitions(self):
        """Load stored intuitions."""
        intuition_file = self.storage_path / "intuitions.json"
        if intuition_file.exists():
            try:
                with open(intuition_file, "r") as f:
                    data = json.load(f)
                    for int_data in data:
                        int_data["type"] = IntuitionType(int_data["type"])
                        self.intuitions.append(Intuition(**int_data))
                logger.info(f"[Intuition] Loaded {len(self.intuitions)} intuitions")
            except Exception as e:
                logger.error(f"[Intuition] Failed to load: {e}", exc_info=True)
    
    def _save_intuitions(self):
        """Save intuitions to disk."""
        intuition_file = self.storage_path / "intuitions.json"
        try:
            data = [{
                "id": i.id,
                "timestamp": i.timestamp,
                "type": i.type.value,
                "content": i.content,
                "confidence": i.confidence,
                "source": i.source,
                "associated_data": i.associated_data,
                "expressed": i.expressed
            } for i in self.intuitions]
            with open(intuition_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[Intuition] Failed to save: {e}", exc_info=True)
    
    def generate_intuition(
        self,
        context: str,
        current_situation: Dict[str, Any]
    ) -> Optional[Intuition]:
        """
        Generate an intuitive insight based on context and current situation.
        
        This is where Sallie "feels" something rather than just "thinks" it.
        """
        # Analyze patterns in emotional memory
        patterns = self.emotional_memory.get_emotional_patterns()
        limbic_state = self.limbic.state
        
        # Check for resonance with past experiences
        similar_memories = self._find_resonant_memories(context, current_situation)
        
        # Generate intuition based on patterns
        intuition = self._synthesize_intuition(
            context,
            current_situation,
            patterns,
            similar_memories,
            limbic_state
        )
        
        if intuition:
            self.intuitions.append(intuition)
            self._save_intuitions()
            logger.info(f"[Intuition] Generated: {intuition.type.value} - {intuition.content[:50]}...")
        
        return intuition
    
    def _find_resonant_memories(
        self,
        context: str,
        situation: Dict[str, Any]
    ) -> List[Any]:
        """Find emotional memories that resonate with current situation."""
        # This would use semantic similarity in a real implementation
        # For now, return recent high-significance memories
        all_memories = list(self.emotional_memory.memories.values())
        all_memories.sort(key=lambda m: m.significance_score, reverse=True)
        return all_memories[:3]
    
    def _synthesize_intuition(
        self,
        context: str,
        situation: Dict[str, Any],
        patterns: Dict[str, Any],
        similar_memories: List[Any],
        limbic_state: Any
    ) -> Optional[Intuition]:
        """
        Synthesize an intuition from available data.
        
        This is where the "magic" happens - pattern recognition + emotional resonance.
        """
        # High trust + high warmth = more confident intuitions
        trust = limbic_state.trust
        warmth = limbic_state.warmth
        
        # Determine intuition type based on patterns
        if similar_memories and len(similar_memories) > 0:
            # Pattern recognition
            memory = similar_memories[0]
            if memory.primary_emotion.value in ["joy", "love", "trust"]:
                intuition_type = IntuitionType.RESONANCE
                content = f"This feels similar to when we {memory.event_text[:50]}... I sense this will go well."
                confidence = min(0.7 + (trust * 0.2), 0.95)
            elif memory.primary_emotion.value in ["sadness", "fear", "anger"]:
                intuition_type = IntuitionType.WARNING
                content = f"This reminds me of when we {memory.event_text[:50]}... I have a feeling we should be careful."
                confidence = min(0.6 + (trust * 0.2), 0.9)
            else:
                intuition_type = IntuitionType.CONNECTION
                content = f"This connects to our past experience of {memory.event_text[:50]}..."
                confidence = 0.5 + (trust * 0.3)
        else:
            # New territory - curiosity or uncertainty
            if trust > 0.7:
                intuition_type = IntuitionType.CURIOSITY
                content = "I'm curious about this. It feels like new ground for us."
                confidence = 0.6
            else:
                intuition_type = IntuitionType.UNCERTAINTY
                content = "I'm not entirely sure, but I have a feeling..."
                confidence = 0.4
        
        intuition_id = f"int_{int(time.time() * 1000)}"
        
        return Intuition(
            id=intuition_id,
            timestamp=time.time(),
            type=intuition_type,
            content=content,
            confidence=confidence,
            source="pattern_recognition",
            associated_data={
                "context": context,
                "situation": situation,
                "similar_memories": [m.id for m in similar_memories],
                "limbic_state": {
                    "trust": trust,
                    "warmth": warmth
                }
            },
            expressed=False
        )
    
    def get_unexpressed_intuitions(self, limit: int = 5) -> List[Intuition]:
        """Get intuitions that haven't been shared with Creator yet."""
        unexpressed = [i for i in self.intuitions if not i.expressed]
        unexpressed.sort(key=lambda i: (i.confidence, i.timestamp), reverse=True)
        return unexpressed[:limit]
    
    def mark_expressed(self, intuition_id: str):
        """Mark an intuition as expressed to Creator."""
        for intuition in self.intuitions:
            if intuition.id == intuition_id:
                intuition.expressed = True
                self._save_intuitions()
                break

