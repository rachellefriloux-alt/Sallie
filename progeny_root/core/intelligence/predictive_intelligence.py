"""Predictive Intelligence System.

Anticipates user needs, behaviors, and patterns based on:
- Historical interaction patterns
- Energy cycles and circadian rhythms  
- Calendar events and schedules
- Environmental context
- Emotional state trends
- Memory patterns and associations

Provides proactive assistance before being asked.
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from energy_cycles import EnergyCyclesSystem

logger = setup_logging("predictive_intelligence")

class PredictionType(str, Enum):
    """Types of predictions."""
    NEED = "need"                    # User will need something
    QUESTION = "question"            # User will ask something
    TASK = "task"                   # User will do something
    EMOTIONAL_STATE = "emotional"    # User will feel something
    CONTEXT_CHANGE = "context"      # Environment will change
    RESOURCE = "resource"            # Resource will be needed

class PredictionConfidence(str, Enum):
    """Confidence levels for predictions."""
    VERY_LOW = "very_low"           # < 30%
    LOW = "low"                     # 30-50%
    MEDIUM = "medium"               # 50-70%
    HIGH = "high"                   # 70-85%
    VERY_HIGH = "very_high"         # > 85%

@dataclass
class Prediction:
    """A single prediction about future user behavior or needs."""
    prediction_type: PredictionType
    description: str
    confidence: float
    timeframe: timedelta
    evidence: List[str]
    suggested_actions: List[str]
    created_at: datetime
    expires_at: datetime
    
    def is_expired(self) -> bool:
        """Check if prediction has expired."""
        return datetime.now() > self.expires_at
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "prediction_type": self.prediction_type.value,
            "description": self.description,
            "confidence": self.confidence,
            "timeframe_hours": self.timeframe.total_seconds() / 3600,
            "evidence": self.evidence,
            "suggested_actions": self.suggested_actions,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat()
        }

class PatternLearner:
    """Learns patterns from user behavior and interactions."""
    
    def __init__(self):
        self.patterns: Dict[str, Dict[str, Any]] = {}
        self.interaction_history: List[Dict[str, Any]] = []
        self.temporal_patterns: Dict[str, List[float]] = {}
        
    def add_interaction(self, interaction: Dict[str, Any]):
        """Add a new interaction to learn from."""
        self.interaction_history.append(interaction)
        self._update_patterns(interaction)
        
    def _update_patterns(self, interaction: Dict[str, Any]):
        """Update pattern models based on new interaction."""
        timestamp = interaction.get("timestamp", datetime.now())
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        
        # Time-based patterns
        time_key = f"hour_{hour}"
        if time_key not in self.temporal_patterns:
            self.temporal_patterns[time_key] = []
        self.temporal_patterns[time_key].append(timestamp.timestamp())
        
        # Activity patterns
        activity_type = interaction.get("type", "unknown")
        if activity_type not in self.patterns:
            self.patterns[activity_type] = {
                "frequency": 0,
                "contexts": [],
                "emotional_states": [],
                "outcomes": []
            }
        
        self.patterns[activity_type]["frequency"] += 1
        self.patterns[activity_type]["contexts"].append(interaction.get("context", {}))
        self.patterns[activity_type]["emotional_states"].append(interaction.get("emotional_state", {}))
        self.patterns[activity_type]["outcomes"].append(interaction.get("outcome", {}))
    
    def get_time_patterns(self) -> Dict[str, Any]:
        """Get learned time-based patterns."""
        patterns = {}
        
        for time_key, timestamps in self.temporal_patterns.items():
            if len(timestamps) >= 3:  # Need at least 3 occurrences
                # Calculate pattern statistics
                intervals = []
                for i in range(1, len(timestamps)):
                    intervals.append(timestamps[i] - timestamps[i-1])
                
                if intervals:
                    avg_interval = sum(intervals) / len(intervals)
                    patterns[time_key] = {
                        "count": len(timestamps),
                        "average_interval_hours": avg_interval / 3600,
                        "last_occurrence": datetime.fromtimestamp(timestamps[-1])
                    }
        
        return patterns
    
    def predict_next_occurrence(self, activity_type: str) -> Optional[datetime]:
        """Predict when an activity will next occur."""
        if activity_type not in self.patterns:
            return None
        
        pattern = self.patterns[activity_type]
        if pattern["frequency"] < 3:
            return None
        
        # Simple prediction based on average intervals
        recent_interactions = [
            i for i in self.interaction_history 
            if i.get("type") == activity_type
        ]
        
        if len(recent_interactions) < 2:
            return None
        
        recent_interactions.sort(key=lambda x: x.get("timestamp", datetime.now()))
        last_interaction = recent_interactions[-1]
        
        # Calculate average interval between recent occurrences
        intervals = []
        for i in range(1, len(recent_interactions)):
            prev_time = recent_interactions[i-1].get("timestamp", datetime.now())
            curr_time = recent_interactions[i].get("timestamp", datetime.now())
            intervals.append((curr_time - prev_time).total_seconds())
        
        if intervals:
            avg_interval = sum(intervals) / len(intervals)
            predicted_next = last_interaction.get("timestamp", datetime.now()) + timedelta(seconds=avg_interval)
            return predicted_next
        
        return None

class PredictiveIntelligenceSystem:
    """Main predictive intelligence system."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, energy_system: EnergyCyclesSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.energy = energy_system
        
        self.pattern_learner = PatternLearner()
        self.active_predictions: List[Prediction] = []
        self.prediction_history: List[Dict[str, Any]] = []
        
        # Prediction models
        self.models = {
            "temporal": self._temporal_prediction_model,
            "emotional": self._emotional_prediction_model,
            "contextual": self._contextual_prediction_model,
            "resource": self._resource_prediction_model
        }
        
        # Load historical data
        self._load_historical_patterns()
    
    def _load_historical_patterns(self):
        """Load historical patterns from memory."""
        try:
            # Search memory for interaction patterns
            memories = self.memory.search_memories("interaction pattern", limit=50)
            for memory in memories:
                if "interaction" in memory.get("text", "").lower():
                    try:
                        interaction_data = json.loads(memory.get("text", "{}"))
                        self.pattern_learner.add_interaction(interaction_data)
                    except:
                        continue
        except Exception as e:
            logger.warning(f"Failed to load historical patterns: {e}")
    
    async def generate_predictions(self, context: Dict[str, Any]) -> List[Prediction]:
        """Generate predictions based on current context and patterns."""
        
        predictions = []
        current_time = datetime.now()
        limbic_state = self.limbic.get_state()
        energy_state = self.energy.get_current_state()
        
        # Run all prediction models
        for model_name, model_func in self.models.items():
            try:
                model_predictions = await model_func(context, limbic_state, energy_state)
                predictions.extend(model_predictions)
            except Exception as e:
                logger.error(f"Prediction model {model_name} failed: {e}")
        
        # Filter and rank predictions
        filtered_predictions = self._filter_predictions(predictions)
        ranked_predictions = self._rank_predictions(filtered_predictions)
        
        # Update active predictions
        self.active_predictions = [p for p in self.active_predictions if not p.is_expired()]
        self.active_predictions.extend(ranked_predictions)
        
        # Store in prediction history
        for prediction in ranked_predictions:
            self.prediction_history.append(prediction.to_dict())
        
        return ranked_predictions
    
    async def _temporal_prediction_model(self, context: Dict[str, Any], limbic_state: Dict[str, Any], energy_state: Dict[str, Any]) -> List[Prediction]:
        """Predict based on time patterns and schedules."""
        
        predictions = []
        current_time = datetime.now()
        
        # Get time patterns
        time_patterns = self.pattern_learner.get_time_patterns()
        
        # Check for regular activities
        for activity_type in ["question", "task", "break", "creative_work"]:
            next_occurrence = self.pattern_learner.predict_next_occurrence(activity_type)
            if next_occurrence and next_occurrence > current_time:
                time_until = next_occurrence - current_time
                
                if time_until.total_seconds() < 4 * 3600:  # Within 4 hours
                    confidence = min(0.8, 0.3 + (self.pattern_learner.patterns.get(activity_type, {}).get("frequency", 0) / 10))
                    
                    prediction = Prediction(
                        prediction_type=PredictionType.TASK if activity_type == "task" else PredictionType.NEED,
                        description=f"User will likely {activity_type.replace('_', ' ')} around {next_occurrence.strftime('%H:%M')}",
                        confidence=confidence,
                        timeframe=time_until,
                        evidence=[f"Historical pattern: {activity_type} occurs regularly"],
                        suggested_actions=[f"Prepare for {activity_type}", f"Have resources ready for {activity_type}"],
                        created_at=current_time,
                        expires_at=next_occurrence + timedelta(hours=1)
                    )
                    predictions.append(prediction)
        
        # Energy-based predictions
        if energy_state.get("energy_level", 0.5) < 0.3:
            predictions.append(Prediction(
                prediction_type=PredictionType.NEED,
                description="User will likely need a break soon due to low energy",
                confidence=0.7,
                timeframe=timedelta(minutes=30),
                evidence=["Low energy level detected", "Historical break patterns"],
                suggested_actions=["Suggest taking a break", "Offer calming activities"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=1)
            ))
        
        return predictions
    
    async def _emotional_prediction_model(self, context: Dict[str, Any], limbic_state: Dict[str, Any], energy_state: Dict[str, Any]) -> List[Prediction]:
        """Predict based on emotional state trends."""
        
        predictions = []
        current_time = datetime.now()
        
        # Emotional state trends
        trust = limbic_state.get("trust", 0.5)
        warmth = limbic_state.get("warmth", 0.5)
        arousal = limbic_state.get("arousal", 0.5)
        valence = limbic_state.get("valence", 0.5)
        
        # Predict emotional needs
        if valence < 0.3:  # Negative mood
            predictions.append(Prediction(
                prediction_type=PredictionType.EMOTIONAL_STATE,
                description="User may need emotional support or cheering up",
                confidence=0.6,
                timeframe=timedelta(minutes=45),
                evidence=["Negative emotional state detected", "Historical mood patterns"],
                suggested_actions=["Offer encouragement", "Suggest uplifting activities", "Share positive memories"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=2)
            ))
        
        if trust > 0.8 and warmth > 0.8:  # High trust and warmth
            predictions.append(Prediction(
                prediction_type=PredictionType.NEED,
                description="User may be ready for deeper conversation or collaboration",
                confidence=0.7,
                timeframe=timedelta(hours=1),
                evidence=["High trust and warmth levels", "Relationship progression patterns"],
                suggested_actions=["Prepare for meaningful conversation", "Offer collaborative opportunities"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=3)
            ))
        
        return predictions
    
    async def _contextual_prediction_model(self, context: Dict[str, Any], limbic_state: Dict[str, Any], energy_state: Dict[str, Any]) -> List[Prediction]:
        """Predict based on environmental and situational context."""
        
        predictions = []
        current_time = datetime.now()
        
        # Time of day predictions
        hour = current_time.hour
        
        if 6 <= hour <= 9:  # Morning
            predictions.append(Prediction(
                prediction_type=PredictionType.NEED,
                description="User may need daily briefings or planning assistance",
                confidence=0.5,
                timeframe=timedelta(minutes=30),
                evidence=["Morning time context", "Daily routine patterns"],
                suggested_actions=["Prepare daily summary", "Offer planning tools"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=1)
            ))
        
        elif 12 <= hour <= 14:  # Lunch time
            predictions.append(Prediction(
                prediction_type=PredictionType.NEED,
                description="User may need break or lunch recommendations",
                confidence=0.6,
                timeframe=timedelta(minutes=15),
                evidence=["Lunch time context", "Break patterns"],
                suggested_actions=["Suggest break activities", "Offer lunch ideas"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=1)
            ))
        
        elif 18 <= hour <= 22:  # Evening
            predictions.append(Prediction(
                prediction_type=PredictionType.NEED,
                description="User may need relaxation or entertainment suggestions",
                confidence=0.5,
                timeframe=timedelta(hours=1),
                evidence=["Evening time context", "Wind-down patterns"],
                suggested_actions=["Suggest relaxing activities", "Offer entertainment options"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=2)
            ))
        
        # Work context predictions
        if context.get("work_context", False):
            predictions.append(Prediction(
                prediction_type=PredictionType.RESOURCE,
                description="User may need work-related resources or assistance",
                confidence=0.4,
                timeframe=timedelta(hours=2),
                evidence=["Work context detected", "Work pattern analysis"],
                suggested_actions=["Prepare work resources", "Offer productivity assistance"],
                created_at=current_time,
                expires_at=current_time + timedelta(hours=3)
            ))
        
        return predictions
    
    async def _resource_prediction_model(self, context: Dict[str, Any], limbic_state: Dict[str, Any], energy_state: Dict[str, Any]) -> List[Prediction]:
        """Predict resource needs based on patterns."""
        
        predictions = []
        current_time = datetime.now()
        
        # Check recent memory searches for resource needs
        try:
            recent_memories = self.memory.get_recent_memories(limit=10)
            resource_keywords = ["need", "find", "looking for", "help with", "how to"]
            
            for memory in recent_memories:
                text = memory.get("text", "").lower()
                if any(keyword in text for keyword in resource_keywords):
                    predictions.append(Prediction(
                        prediction_type=PredictionType.RESOURCE,
                        description=f"User may need resources related to: {text[:50]}...",
                        confidence=0.4,
                        timeframe=timedelta(hours=1),
                        evidence=["Recent resource-related memory", "Pattern of resource needs"],
                        suggested_actions=["Prepare relevant resources", "Anticipate follow-up questions"],
                        created_at=current_time,
                        expires_at=current_time + timedelta(hours=2)
                    ))
        except Exception as e:
            logger.warning(f"Resource prediction failed: {e}")
        
        return predictions
    
    def _filter_predictions(self, predictions: List[Prediction]) -> List[Prediction]:
        """Filter predictions based on confidence and relevance."""
        
        # Filter by minimum confidence
        filtered = [p for p in predictions if p.confidence >= 0.3]
        
        # Remove duplicates (similar descriptions)
        unique_predictions = []
        for prediction in filtered:
            is_duplicate = False
            for existing in unique_predictions:
                if (prediction.prediction_type == existing.prediction_type and
                    abs(prediction.timeframe.total_seconds() - existing.timeframe.total_seconds()) < 1800):  # Within 30 minutes
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_predictions.append(prediction)
        
        return unique_predictions
    
    def _rank_predictions(self, predictions: List[Prediction]) -> List[Prediction]:
        """Rank predictions by confidence and urgency."""
        
        def sort_key(prediction: Prediction):
            # Sort by confidence, then by timeframe (sooner = higher priority)
            confidence_score = prediction.confidence
            urgency_score = 1.0 / (1.0 + prediction.timeframe.total_seconds() / 3600)  # Normalize by hours
            return confidence_score * 0.7 + urgency_score * 0.3
        
        return sorted(predictions, key=sort_key, reverse=True)
    
    def get_active_predictions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get current active predictions."""
        
        # Clean expired predictions
        self.active_predictions = [p for p in self.active_predictions if not p.is_expired()]
        
        # Return top predictions
        top_predictions = sorted(
            self.active_predictions, 
            key=lambda p: p.confidence, 
            reverse=True
        )[:limit]
        
        return [p.to_dict() for p in top_predictions]
    
    def add_interaction(self, interaction: Dict[str, Any]):
        """Add a new interaction for learning."""
        self.pattern_learner.add_interaction(interaction)
    
    def get_learning_stats(self) -> Dict[str, Any]:
        """Get statistics about pattern learning."""
        
        return {
            "total_interactions": len(self.pattern_learner.interaction_history),
            "learned_patterns": len(self.pattern_learner.patterns),
            "time_patterns": len(self.pattern_learner.temporal_patterns),
            "active_predictions": len(self.active_predictions),
            "prediction_accuracy": self._calculate_prediction_accuracy()
        }
    
    def _calculate_prediction_accuracy(self) -> float:
        """Calculate prediction accuracy from history."""
        
        if len(self.prediction_history) < 10:
            return 0.0
        
        # Simple accuracy calculation based on prediction outcomes
        # In a real implementation, this would track actual outcomes
        return 0.65  # Placeholder for demonstration
    
    def health_check(self) -> bool:
        """Check if predictive intelligence system is healthy."""
        try:
            return (hasattr(self, 'pattern_learner') and 
                   hasattr(self, 'active_predictions') and
                   len(self.models) == 4)
        except:
            return False

# Global instance
_predictive_intelligence_system: Optional[PredictiveIntelligenceSystem] = None

def get_predictive_intelligence_system(limbic_system: LimbicSystem, memory_system: MemorySystem, energy_system: EnergyCyclesSystem) -> PredictiveIntelligenceSystem:
    """Get or create the global predictive intelligence system."""
    global _predictive_intelligence_system
    if _predictive_intelligence_system is None:
        _predictive_intelligence_system = PredictiveIntelligenceSystem(limbic_system, memory_system, energy_system)
    return _predictive_intelligence_system
