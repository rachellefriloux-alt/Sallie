"""Input analysis and perception (The Amygdala Scan).

Analyzes user input for:
- Urgency (0.0-1.0): How immediate is the need?
- Load (0.0-1.0): Is the user stressed, tired, or overwhelmed?
- Sentiment (-1.0 to 1.0): Negative vs Positive
- Intent classification
- Entity extraction
- "Take the Wheel" detection
"""

import json
from typing import Dict, Any, Optional

from .llm_router import get_llm_router
from .prompts import PERCEPTION_SYSTEM_PROMPT
from .utils import setup_logging

logger = setup_logging("perception")


class PerceptionSystem:
    """
    The Amygdala - first stage of cognitive processing.
    Analyzes incoming input before it reaches the monologue system.
    """

    def __init__(self):
        self.router = None  # Lazy init

    def _get_router(self):
        """Lazy initialization of LLM router."""
        if self.router is None:
            self.router = get_llm_router()
        return self.router

    def analyze(self, user_input: str) -> Dict[str, Any]:
        """
        Analyze user input for urgency, load, sentiment, and intent.
        
        Args:
            user_input: Raw text from the user
            
        Returns:
            Dict with perception results:
            {
                "urgency": float (0.0-1.0),
                "load": float (0.0-1.0),
                "sentiment": float (-1.0 to 1.0),
                "take_the_wheel": bool,
                "suggested_posture": str,
                "intent": str,
                "entities": list
            }
        """
        router = self._get_router()
        
        # Quick heuristic pre-scan for obvious patterns
        quick_analysis = self._quick_scan(user_input)
        
        # LLM-based deep analysis
        try:
            response = router.chat(
                system_prompt=PERCEPTION_SYSTEM_PROMPT,
                user_prompt=f"Analyze this input:\n\n{user_input}",
                temperature=0.3,  # Low temp for consistent analysis
                expect_json=True,
            )
            
            result = json.loads(response)
            
            # Merge quick analysis with LLM analysis
            result = self._merge_analysis(quick_analysis, result)
            
            logger.info(f"Perception: urgency={result.get('urgency', 0):.2f}, "
                       f"load={result.get('load', 0):.2f}, "
                       f"sentiment={result.get('sentiment', 0):.2f}")
            
            return result
            
        except json.JSONDecodeError:
            logger.warning("Failed to parse perception JSON, using quick scan only")
            return quick_analysis
        except Exception as e:
            logger.error(f"Perception analysis failed: {e}")
            return quick_analysis

    def _quick_scan(self, text: str) -> Dict[str, Any]:
        """
        Fast heuristic analysis without LLM call.
        Used as fallback and for obvious patterns.
        """
        text_lower = text.lower()
        
        # Urgency detection
        urgency = 0.0
        urgent_words = ["urgent", "asap", "now", "immediately", "emergency", "help", "quick", "hurry"]
        if any(word in text_lower for word in urgent_words):
            urgency = 0.8
        elif "?" in text and len(text) < 50:
            urgency = 0.3
        
        # Load detection (stress indicators)
        load = 0.0
        load_words = ["tired", "exhausted", "overwhelmed", "stressed", "can't", "struggling", 
                      "frustrated", "confused", "lost", "stuck"]
        if any(word in text_lower for word in load_words):
            load = 0.7
        
        # Sentiment detection (simple)
        sentiment = 0.0
        positive_words = ["thanks", "great", "love", "amazing", "happy", "excited", "good", "awesome"]
        negative_words = ["hate", "angry", "sad", "upset", "annoyed", "terrible", "awful", "bad"]
        
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            sentiment = min(0.8, pos_count * 0.2)
        elif neg_count > pos_count:
            sentiment = max(-0.8, -neg_count * 0.2)
        
        # Take the wheel detection
        take_wheel = any(phrase in text_lower for phrase in [
            "just do it", "handle it", "take over", "you decide", "your call",
            "do what you think", "figure it out", "i don't care how"
        ])
        
        # Suggested posture based on analysis
        if load > 0.5:
            posture = "COMPANION"
        elif urgency > 0.6:
            posture = "CO_PILOT"
        elif "?" in text:
            posture = "EXPERT"
        else:
            posture = "PEER"
        
        return {
            "urgency": urgency,
            "load": load,
            "sentiment": sentiment,
            "take_the_wheel": take_wheel,
            "suggested_posture": posture,
            "intent": "unknown",
            "entities": [],
            "source": "quick_scan"
        }

    def _merge_analysis(self, quick: Dict[str, Any], llm: Dict[str, Any]) -> Dict[str, Any]:
        """Merge quick scan with LLM analysis, preferring LLM but keeping quick scan fallbacks."""
        result = {
            "urgency": llm.get("urgency", quick.get("urgency", 0.0)),
            "load": llm.get("load", quick.get("load", 0.0)),
            "sentiment": llm.get("sentiment", quick.get("sentiment", 0.0)),
            "take_the_wheel": llm.get("take_the_wheel", quick.get("take_the_wheel", False)),
            "suggested_posture": llm.get("suggested_posture", quick.get("suggested_posture", "PEER")),
            "intent": llm.get("intent", quick.get("intent", "unknown")),
            "entities": llm.get("entities", quick.get("entities", [])),
            "source": "llm" if "urgency" in llm else "quick_scan"
        }
        
        # If quick scan detected something LLM missed, boost it
        if quick.get("take_the_wheel") and not result["take_the_wheel"]:
            result["take_the_wheel"] = True
            
        return result


# Singleton instance
_perception: Optional[PerceptionSystem] = None


def get_perception_system() -> PerceptionSystem:
    """Get or create the global perception system."""
    global _perception
    if _perception is None:
        _perception = PerceptionSystem()
    return _perception
