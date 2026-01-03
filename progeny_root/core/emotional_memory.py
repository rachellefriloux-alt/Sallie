"""
Emotional Memory System for Sallie
Stores and retrieves emotionally charged memories
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("emotional_memory")

class EmotionalMemory(BaseModel):
    """Emotional memory entry"""
    content: str
    emotion: str
    intensity: float
    timestamp: datetime = datetime.now()
    context: Dict[str, Any] = {}

class EmotionalMemorySystem:
    """Mock Emotional Memory System"""
    
    def __init__(self):
        self.memories = []
        self.next_id = 1
        
    def add_memory(self, content: str, emotion: str, intensity: float, **kwargs) -> str:
        """Add an emotional memory"""
        memory = EmotionalMemory(
            content=content,
            emotion=emotion,
            intensity=intensity,
            **kwargs
        )
        
        self.memories.append(memory)
        logger.info(f"Added emotional memory: {emotion} ({intensity:.2f})")
        return str(self.next_id - 1)
    
    def get_memories_by_emotion(self, emotion: str, limit: int = 10) -> List[EmotionalMemory]:
        """Get memories by emotion type"""
        filtered = [m for m in self.memories if m.emotion == emotion]
        return sorted(filtered, key=lambda m: m.intensity, reverse=True)[:limit]
    
    def get_recent_memories(self, limit: int = 10) -> List[EmotionalMemory]:
        """Get recent memories"""
        return sorted(self.memories, key=lambda m: m.timestamp, reverse=True)[:limit]
    
    def get_intense_memories(self, min_intensity: float = 0.7, limit: int = 10) -> List[EmotionalMemory]:
        """Get intense memories"""
        filtered = [m for m in self.memories if m.intensity >= min_intensity]
        return sorted(filtered, key=lambda m: m.intensity, reverse=True)[:limit]
    
    def search_memories(self, query: str, limit: int = 10) -> List[EmotionalMemory]:
        """Search memories by content"""
        query_lower = query.lower()
        results = []
        
        for memory in self.memories:
            if query_lower in memory.content.lower():
                results.append(memory)
        
        return sorted(results, key=lambda m: m.intensity, reverse=True)[:limit]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get memory statistics"""
        if not self.memories:
            return {
                "total_memories": 0,
                "emotion_counts": {},
                "average_intensity": 0.0
            }
        
        # Count by emotion
        emotion_counts = {}
        total_intensity = 0.0
        
        for memory in self.memories:
            emotion_counts[memory.emotion] = emotion_counts.get(memory.emotion, 0) + 1
            total_intensity += memory.intensity
        
        return {
            "total_memories": len(self.memories),
            "emotion_counts": emotion_counts,
            "average_intensity": total_intensity / len(self.memories)
        }
