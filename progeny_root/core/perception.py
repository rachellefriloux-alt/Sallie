"""
Perception System for Sallie
Analyzes user input for emotional and contextual cues
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("perception")

class PerceptionResult(BaseModel):
    """Result of perception analysis"""
    urgency: float = 0.5
    sentiment: float = 0.0
    load: float = 0.5
    confidence: float = 0.8
    timestamp: datetime = datetime.now()
    analysis: str = ""

class PerceptionSystem:
    """Mock Perception System"""
    
    def __init__(self):
        self.analysis_count = 0
        
    def analyze(self, text: str) -> Dict[str, Any]:
        """Analyze user input for perception data"""
        self.analysis_count += 1
        
        # Simple sentiment analysis
        positive_words = ["good", "great", "happy", "love", "excellent", "wonderful", "amazing"]
        negative_words = ["bad", "terrible", "hate", "awful", "horrible", "sad", "angry"]
        urgent_words = ["urgent", "emergency", "help", "now", "immediately", "asap"]
        
        text_lower = text.lower()
        
        # Calculate sentiment
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = min(0.8, 0.5 + (positive_count - negative_count) * 0.1)
        elif negative_count > positive_count:
            sentiment = max(-0.8, -0.5 - (negative_count - positive_count) * 0.1)
        else:
            sentiment = 0.0
        
        # Calculate urgency
        urgent_count = sum(1 for word in urgent_words if word in text_lower)
        urgency = min(1.0, 0.3 + urgent_count * 0.2)
        
        # Calculate cognitive load
        load = min(1.0, len(text.split()) / 50.0)
        
        result = PerceptionResult(
            urgency=urgency,
            sentiment=sentiment,
            load=load,
            confidence=0.8,
            analysis=f"Analyzed {len(text)} characters with {len(text.split())} words"
        )
        
        logger.debug(f"[Perception] Analyzed: urgency={urgency:.2f}, sentiment={sentiment:.2f}, load={load:.2f}")
        
        return result.model_dump()

def get_perception_system() -> PerceptionSystem:
    """Get perception system instance"""
    return PerceptionSystem()
