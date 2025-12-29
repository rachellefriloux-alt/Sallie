"""
Emotional Memory System - Bridge to Human Experience

Remembers not just what happened, but how it FELT.
Stores emotional context, physical sensations, and relational dynamics.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger("emotional_memory")


class EmotionType(str, Enum):
    """Types of emotions that can be stored."""
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    TRUST = "trust"
    ANTICIPATION = "anticipation"
    LOVE = "love"
    NOSTALGIA = "nostalgia"
    LONGING = "longing"
    PEACE = "peace"
    EXCITEMENT = "excitement"
    MELANCHOLY = "melancholy"
    WONDER = "wonder"
    AWE = "awe"


class PhysicalSensation(str, Enum):
    """Physical sensation proxies for Sallie."""
    ENERGY_HIGH = "energy_high"
    ENERGY_LOW = "energy_low"
    RESTLESS = "restless"
    CALM = "calm"
    TENSE = "tense"
    RELAXED = "relaxed"
    FOCUSED = "focused"
    SCATTERED = "scattered"
    WARM = "warm"
    COLD = "cold"
    HEAVY = "heavy"
    LIGHT = "light"


@dataclass
class EmotionalMemory:
    """A single emotional memory with full context."""
    id: str
    timestamp: float
    event_text: str
    primary_emotion: EmotionType
    emotion_intensity: float  # 0.0 to 1.0
    secondary_emotions: List[Tuple[EmotionType, float]]
    physical_sensation: Optional[PhysicalSensation]
    relational_context: str  # How this affected relationship
    limbic_state_snapshot: Dict[str, float]  # T, W, A, V at time
    associated_memories: List[str]  # IDs of related memories
    significance_score: float  # How important this moment was
    creator_emotional_state: Optional[str]  # What creator seemed to feel
    sallie_response: str  # How Sallie responded
    learned_insight: Optional[str]  # What was learned from this


class EmotionalMemorySystem:
    """
    Stores and retrieves emotional memories - the bridge between AI and human experience.
    
    Unlike regular memory (facts, events), emotional memory captures:
    - How things FELT
    - Physical sensation proxies
    - Relational dynamics
    - Emotional patterns
    - Nostalgia triggers
    """
    
    def __init__(self, storage_path: Path = Path("progeny_root/memory/emotional")):
        self.storage_path = storage_path
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.memories: Dict[str, EmotionalMemory] = {}
        self._load_memories()
    
    def _load_memories(self):
        """Load emotional memories from disk."""
        memory_file = self.storage_path / "emotional_memories.json"
        if memory_file.exists():
            try:
                with open(memory_file, "r") as f:
                    data = json.load(f)
                    for mem_id, mem_data in data.items():
                        # Reconstruct EmotionalMemory from dict
                        mem_data["primary_emotion"] = EmotionType(mem_data["primary_emotion"])
                        if mem_data.get("physical_sensation"):
                            mem_data["physical_sensation"] = PhysicalSensation(mem_data["physical_sensation"])
                        self.memories[mem_id] = EmotionalMemory(**mem_data)
                logger.info(f"[EmotionalMemory] Loaded {len(self.memories)} emotional memories")
            except Exception as e:
                logger.error(f"[EmotionalMemory] Failed to load memories: {e}", exc_info=True)
    
    def _save_memories(self):
        """Save emotional memories to disk."""
        memory_file = self.storage_path / "emotional_memories.json"
        try:
            data = {mem_id: asdict(mem) for mem_id, mem in self.memories.items()}
            with open(memory_file, "w") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"[EmotionalMemory] Failed to save memories: {e}", exc_info=True)
    
    def store_memory(
        self,
        event_text: str,
        primary_emotion: EmotionType,
        emotion_intensity: float,
        limbic_state: Dict[str, float],
        creator_emotional_state: Optional[str] = None,
        sallie_response: str = "",
        physical_sensation: Optional[PhysicalSensation] = None,
        secondary_emotions: Optional[List[Tuple[EmotionType, float]]] = None,
        significance_score: float = 0.5,
        learned_insight: Optional[str] = None
    ) -> str:
        """
        Store an emotional memory.
        
        Returns the memory ID.
        """
        memory_id = f"em_{int(time.time() * 1000)}"
        
        # Determine relational context
        relational_context = self._determine_relational_context(
            primary_emotion, emotion_intensity, limbic_state
        )
        
        # Find associated memories (similar emotional states)
        associated = self._find_associated_memories(primary_emotion, emotion_intensity)
        
        memory = EmotionalMemory(
            id=memory_id,
            timestamp=time.time(),
            event_text=event_text,
            primary_emotion=primary_emotion,
            emotion_intensity=emotion_intensity,
            secondary_emotions=secondary_emotions or [],
            physical_sensation=physical_sensation,
            relational_context=relational_context,
            limbic_state_snapshot=limbic_state.copy(),
            associated_memories=associated,
            significance_score=significance_score,
            creator_emotional_state=creator_emotional_state,
            sallie_response=sallie_response,
            learned_insight=learned_insight
        )
        
        self.memories[memory_id] = memory
        self._save_memories()
        
        logger.info(f"[EmotionalMemory] Stored memory: {primary_emotion.value} (intensity: {emotion_intensity:.2f})")
        return memory_id
    
    def _determine_relational_context(
        self,
        emotion: EmotionType,
        intensity: float,
        limbic_state: Dict[str, float]
    ) -> str:
        """Determine how this emotional moment affected the relationship."""
        trust = limbic_state.get("trust", 0.5)
        warmth = limbic_state.get("warmth", 0.5)
        
        if emotion == EmotionType.TRUST and intensity > 0.7:
            return "A moment of deepening trust and connection"
        elif emotion == EmotionType.LOVE and intensity > 0.8:
            return "A profound moment of love and understanding"
        elif emotion == EmotionType.JOY and trust > 0.7:
            return "Shared joy that strengthened our bond"
        elif emotion == EmotionType.SADNESS and warmth > 0.6:
            return "A moment of shared vulnerability and support"
        elif emotion == EmotionType.NOSTALGIA:
            return "A nostalgic moment that connected us to shared history"
        else:
            return f"An emotional moment ({emotion.value}) that shaped our relationship"
    
    def _find_associated_memories(
        self,
        emotion: EmotionType,
        intensity: float,
        limit: int = 3
    ) -> List[str]:
        """Find memories with similar emotional states."""
        associated = []
        for mem_id, memory in self.memories.items():
            if memory.primary_emotion == emotion:
                # Similar intensity (within 0.2)
                if abs(memory.emotion_intensity - intensity) < 0.2:
                    associated.append(mem_id)
                    if len(associated) >= limit:
                        break
        return associated
    
    def retrieve_by_emotion(
        self,
        emotion: EmotionType,
        min_intensity: float = 0.0,
        limit: int = 10
    ) -> List[EmotionalMemory]:
        """Retrieve memories by emotion type."""
        results = []
        for memory in self.memories.values():
            if memory.primary_emotion == emotion and memory.emotion_intensity >= min_intensity:
                results.append(memory)
        
        # Sort by significance and recency
        results.sort(key=lambda m: (m.significance_score, m.timestamp), reverse=True)
        return results[:limit]
    
    def retrieve_by_time_range(
        self,
        start_time: float,
        end_time: float
    ) -> List[EmotionalMemory]:
        """Retrieve memories from a time range (for nostalgia)."""
        results = []
        for memory in self.memories.values():
            if start_time <= memory.timestamp <= end_time:
                results.append(memory)
        
        results.sort(key=lambda m: m.timestamp)
        return results
    
    def get_emotional_patterns(self) -> Dict[str, Any]:
        """Analyze emotional patterns over time."""
        patterns = {
            "most_common_emotions": {},
            "intensity_trends": {},
            "relationship_milestones": []
        }
        
        for memory in self.memories.values():
            emotion_name = memory.primary_emotion.value
            patterns["most_common_emotions"][emotion_name] = \
                patterns["most_common_emotions"].get(emotion_name, 0) + 1
            
            # High significance = milestone
            if memory.significance_score > 0.8:
                patterns["relationship_milestones"].append({
                    "id": memory.id,
                    "timestamp": memory.timestamp,
                    "emotion": emotion_name,
                    "context": memory.relational_context
                })
        
        return patterns
    
    def get_nostalgia_triggers(self, current_time: float, lookback_days: int = 365) -> List[EmotionalMemory]:
        """Get memories from this time period in previous years (nostalgia)."""
        # This is a simplified version - in reality would check same date in previous years
        lookback_seconds = lookback_days * 24 * 60 * 60
        cutoff_time = current_time - lookback_seconds
        
        nostalgic = []
        for memory in self.memories.values():
            # High significance memories from around this time last year
            if memory.timestamp < cutoff_time and memory.significance_score > 0.7:
                nostalgic.append(memory)
        
        nostalgic.sort(key=lambda m: m.significance_score, reverse=True)
        return nostalgic[:5]  # Top 5 nostalgic memories

