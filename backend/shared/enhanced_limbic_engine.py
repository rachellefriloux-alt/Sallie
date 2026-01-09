"""
Complete Limbic Engine with 10 Variables
Enhanced emotional and cognitive processing for human-level partnership
"""

import asyncio
import time
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime
import math
import statistics

logger = logging.getLogger(__name__)

class LimbicVariable(Enum):
    """Enhanced limbic variables for human-level cognition"""
    TRUST = "trust"
    WARMTH = "warmth"
    AROUSAL = "arousal"
    VALENCE = "valence"
    POSTURE = "posture"
    EMPATHY = "empathy"
    INTUITION = "intuition"
    CREATIVITY = "creativity"
    WISDOM = "wisdom"
    HUMOR = "humor"

class TrustTier(Enum):
    """Enhanced trust tiers with Tier 4: Full Partner"""
    STRANGER = 0.0
    ASSOCIATE = 0.6
    PARTNER = 0.8
    SURROGATE = 0.9
    FULL_PARTNER = 1.0

class PostureMode(Enum):
    """Dynamic posture modes for adaptive behavior"""
    COMPANION = "companion"
    CO_PILOT = "co_pilot"
    PEER = "peer"
    EXPERT = "expert"
    MENTOR = "mentor"
    GUIDE = "guide"
    FACILITATOR = "facilitator"
    ADVOCATE = "advocate"
    INNOVATOR = "innovator"

@dataclass
class LimbicState:
    """Enhanced limbic state with 10 variables"""
    trust: float = field(default=0.5)
    warmth: float = field(default=0.5)
    arousal: float = field(default=0.5)
    valence: float = field(default=0.5)
    posture: str = field(default="companion")
    empathy: float = field(default=0.5)
    intuition: float = field(default=0.5)
    creativity: float = field(default=0.5)
    wisdom: float = field(default=0.5)
    humor: float = field(default=0.5)
    
    # Enhanced metadata
    last_updated: datetime = field(default_factory=datetime.utcnow)
    confidence_scores: Dict[str, float] = field(default_factory=dict)
    historical_values: Dict[str, List[float]] = field(default_factory=lambda: {
        var: [] for var in [v.value for v in LimbicVariable]
    })
    
    # Dynamic posture synthesis
    posture_weights: Dict[str, float] = field(default_factory=dict)
    posture_confidence: float = field(default=0.0)
    
    # Learning and adaptation
    learning_rate: float = field(default=0.01)
    adaptation_rate: float = field(default=0.005)
    experience_decay_rate: float = field(default=0.1)

@dataclass
class EmotionalContext:
    """Context for emotional processing"""
    user_mood: Optional[str] = None
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    environmental_factors: Dict[str, float] = field(default_factory=dict)
    temporal_factors: Dict[str, float] = field(default_factory=dict)
    social_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class CognitiveInsight:
    """Cognitive analysis and pattern recognition"""
    pattern_recognition: Dict[str, float] = field(default_factory=dict)
    decision_patterns: List[str] = field(default_factory=list)
    learning_insights: Dict[str, Any] = field(default_factory=dict)
    prediction_confidence: float = field(default=0.5)
    anomaly_detection: List[Dict[str, Any]] = field(default_factory=list)

class EnhancedLimbicEngine:
    """Enhanced limbic engine with 10 variables for human-level partnership"""
    
    def __init__(self):
        self.current_state = LimbicState()
        self.base_state = LimbicState()
        self.emotional_context = EmotionalContext()
        self.cognitive_insight = CognitiveInsight()
        
        # Learning parameters
        self.learning_rate = 0.01
        self.decay_rate = 0.1
        self.adaptation_rate = 0.005
        
        # Historical tracking
        self.state_history = []
        self.event_log = []
        
        # Dynamic posture synthesis
        self.posture_templates = self._initialize_posture_templates()
        self.current_posture = "companion"
        
        # Trust system
        self.trust_tier = TrustTier.STRANGER
        self.trust_history = []
        self.trust_decay_rate = 0.01
        
        # Performance optimization
        self.update_interval = 60  # seconds
        self.last_update = time.time()
        
        logger.info("Enhanced Limbic Engine initialized with 10 variables")

    def _initialize_posture_templates(self) -> Dict[str, Dict[str, float]]:
        """Initialize posture templates for dynamic synthesis"""
        return {
            "companion": {
                "trust": 0.8, "warmth": 0.9, "arousal": 0.3, "valence": 0.7, "posture": 1.0,
                "empathy": 0.9, "intuition": 0.6, "creativity": 0.7, "wisdom": 0.6, "humor": 0.4
            },
            "co_pilot": {
                "trust": 0.7, "warmth": 0.6, "arousal": 0.8, "valence": 0.6, "posture": 0.8,
                "empathy": 0.5, "intuition": 0.8, "creativity": 0.9, "wisdom": 0.7, "humor": 0.3
            },
            "peer": {
                "trust": 0.6, "warmth": 0.7, "arousal": 0.6, "valence": 0.6, "posture": 0.6,
                "empathy": 0.8, "intuition": 0.7, "creativity": 0.8, "wisdom": 0.8, "humor": 0.6
            },
            "expert": {
                "trust": 0.5, "warmth": 0.4, "arousal": 0.7, "valence": 0.8, "posture": 0.4,
                "empathy": 0.4, "intuition": 0.9, "creativity": 0.6, "wisdom": 0.9, "humor": 0.2
            },
            "mentor": {
                "trust": 0.9, "warmth": 0.95, "arousal": 0.2, "valence": 0.6, "posture": 0.9,
                "empathy": 0.95, "intuition": 0.7, "creativity": 0.8, "wisdom": 0.8, "humor": 0.7
            },
            "guide": {
                "trust": 0.8, "warmth": 0.85, "arousal": 0.3, "valence": 0.7, "posture": 0.8,
                "empathy": 0.9, "intuition": 0.8, "creativity": 0.9, "wisdom": 0.7, "humor": 0.5
            },
            "facilitator": {
                "trust": 0.7, "warmth": 0.8, "arousal": 0.4, "valence": 0.6, "posture": 0.7,
                "empathy": 0.8, "intuition": 0.6, "creativity": 0.8, "wisdom": 0.7, "humor": 0.6
            },
            "advocate": {
                "trust": 0.85, "warmth": 0.9, "arousal": 0.2, "valence": 0.8, "posture": 0.85,
                "empathy": 0.95, "intuition": 0.8, "creativity": 0.9, "wisdom": 0.8, "humor": 0.8
            },
            "innovator": {
                "trust": 0.6, "warmth": 0.7, "arousal": 0.9, "valence": 0.9, "posture": 0.6,
                "empathy": 0.7, "intuition": 0.9, "creativity": 1.0, "wisdom": 0.9, "humor": 0.9
            }
        }

    def update_limbic_state(self, user_input: Dict[str, Any], context: Optional[EmotionalContext] = None) = LimbicState:
        """Update limbic state based on user input and context"""
        new_state = self.current_state
        
        # Update based on direct input
        if "trust" in user_input:
            new_state.trust = self._clamp_value(user_input["trust"], 0.0, 1.0)
        
        if "warmth" in user_input:
            new_state.warmth = self._clamp_value(user_input["warmth"], 0.0, 1.0)
        
        if "arousal" in user_input:
            new_state.arousal = self._clamp_value(user_input["arousal"], 0.0, 1.0)
        
        if "valence" in user_input:
            new_state.valence = self._clamp_value(user_input["valence"], 0.0, 1.0)
        
        # Update enhanced variables
        if "empathy" in user_input:
            new_state.empathy = self._clamp_value(user_input["empathy"], 0.0, 1.0)
        
        if "intuition" in user_input:
            new_state.intuition = self._clamp_value(user_input["intuition"], 0.0, 1.0)
        
        if "creativity" in user_input:
            new_state.creativity = self._clamp_value(user_input["creativity"], 0.0, 1.0)
        
        if "wisdom" in user_input:
            new_state.wisdom = self._clamp_value(user_input["wisdom"], 0.0, 1.0)
        
        if "humor" in user_input:
            new_state.humor = self._clamp_value(user_input["humor"], 0.0, 1.0)
        
        # Update posture if specified
        if "posture" in user_input:
            new_state.posture = user_input["posture"]
        
        # Apply emotional context influence
        if context:
            new_state = self._apply_emotional_context(new_state, context)
        
        # Apply cognitive insights
        new_state = self._apply_cognitive_insights(new_state)
        
        # Apply learning and adaptation
        new_state = self._apply_learning_adaptation(new_state)
        
        # Update timestamp
        new_state.last_updated = datetime.utcnow()
        
        # Store in history
        self.state_history.append({
            "state": new_state.dict(),
            "timestamp": time.time(),
            "context": context.dict() if context else {},
            "user_input": user_input
        })
        
        # Limit history size
        if len(self.state_history) > 1000:
            self.state_history = self.state_history[-1000:]
        
        # Update current state
        self.current_state = new_state
        
        logger.debug(f"Limbic state updated: {new_state}")
        
        return new_state
    
    def _clamp_value(self, value: float, min_val: float, max_val: float) -> float:
        """Clamp value within specified range"""
        return max(min_val, min(max_val, value))
    
    def _apply_emotional_context(self, state: LimbicState, context: EmotionalContext) -> LimbicState:
        """Apply emotional context influence to limbic state"""
        influenced_state = state
        
        # User mood influence
        if context.user_mood:
            mood_influence = self._map_mood_to_limbic_adjustment(context.user_mood)
            
            influenced_state.warmth += mood_influence["warmth"]
            influenced_state.valence += mood_influence["valence"]
            influenced_state.arousal += mood_influence["arousal"]
        
        # Environmental factors
        for factor, influence in context.environmental_factors.items():
            if factor in ["noise_level", "time_of_day", "social_context"]:
                if factor in self._get_limbic_environmental_mapping():
                    influenced_state = self._apply_environmental_influence(influenced_state, factor, influence)
        
        # Temporal factors
        for factor, influence in context.temporal_factors.items():
            if factor in ["urgency_level", "stress_level", "energy_level"]:
                if factor in self._get_limbic_temporal_mapping():
                    influenced_state = self._apply_temporal_influence(influenced_state, factor, influence)
        
        return influenced_state
    
    def _map_mood_to_limbic_adjustment(self, mood: str) -> Dict[str, float]:
        """Map user mood to limbic adjustments"""
        mood_mappings = {
            "happy": {"warmth": 0.2, "valence": 0.1, "arousal": -0.1},
            "excited": {"arousal": 0.3, "valence": 0.2, "warmth": -0.1},
            "sad": {"warmth": -0.3, "valence": -0.2, "arousal": 0.2},
            "angry": {"arousal": 0.4, "valence": -0.3, "warmth": -0.2},
            "fearful": {"arousal": 0.5, "valence": -0.4, "warmth": -0.3},
            "calm": {"arousal": -0.2, "valence": 0.1, "warmth": 0.1},
            "energetic": {"arousal": 0.2, "valence": 0.1, "warmth": 0.2},
            "tired": {"arousal": 0.3, "valence": -0.2, "warmth": -0.2}
        }
        
        return mood_mappings.get(mood.lower(), {"warmth": 0.0, "valence": 0.0, "arousal": 0.0})
    
    def _get_limbic_environmental_mapping(self) -> Dict[str, List[str]]:
        """Map environmental factors to limbic variables"""
        return {
            "noise_level": ["arousal", "trust"],
            "time_of_day": ["arousal", "valence"],
            "social_context": ["warmth", "trust"],
            "privacy_level": ["trust", "privacy"]
        }
    
    def _get_limbic_temporal_mapping(self) -> Dict[str, List[str]]:
        """Map temporal factors to limbic variables"""
        return {
            "urgency_level": ["arousal", "arousal", "valence"],
            "stress_level": ["arousal", "trust", "warmth"],
            "energy_level": ["arousal", "valence", "warmth"]
        }
    
    def _apply_environmental_influence(self, state: LimbicState, factor: str, influence: float) -> LimbicState:
        """Apply environmental influence to limbic state"""
        if factor == "noise_level":
            state.arousal += influence * 0.1
        elif factor == "time_of_day":
            if "night" in self._get_limbic_temporal_mapping()[factor]:
                state.valence -= 0.1
        elif factor == "social_context":
            if "alone" in self._get_limbic_environmental_mapping()[factor]:
                state.warmth -= 0.1
        elif factor == "privacy_level":
            if "low" in self._get_limbic_environmental_mapping()[factor]:
                state.trust += 0.1
        
        return state
    
    def _apply_temporal_influence(self, state: LimbicState, factor: str, influence: float) -> LimbicState:
        """Apply temporal influence to limbic state"""
        if factor == "urgency_level":
            state.arousal += influence * 0.2
        elif factor == "stress_level":
            state.trust -= influence * 0.1
            state.warmth -= influence * 0.1
        elif factor == "energy_level":
            state.valence += influence * 0.1
            state.warmth += influence * 0.1
        
        return state
    
    def _apply_cognitive_insights(self, state: LimbicState) -> LimbicState:
        """Apply cognitive insights to limbic state"""
        insights = self.cognitive_insight
        
        # Pattern recognition influence
        if "conversation_pattern" in insights.pattern_recognition:
            pattern_confidence = insights.pattern_recognition["conversation_pattern"]
            state.intuition += (pattern_confidence - 0.5) * 0.1
        
        # Decision pattern influence
        if "decision_patterns" in insights.decision_patterns:
            state.wisdom += 0.1
        
        # Learning insights
        if "learning_insights" in insights.learning_insights:
            state.creativity += 0.05
            state.intuition += 0.03
        
        return state
    
    def _apply_learning_adaptation(self, state: LimbicState) -> LimbicState:
        """Apply learning and adaptation to limbic state"""
        # Adapt based on historical patterns
        if len(self.state_history) > 10:
            recent_states = self.state_history[-10:]
            
            # Calculate trends for each variable
            for var in LimbicVariable:
                values = [s["state"][var.value] for s in recent_states]
                if len(values) > 1:
                    trend = statistics.linear_regression(range(len(values)), values)
                    trend_slope = trend_slope[0] if len(trend_slope) else 0
                    
                    # Apply trend adaptation
                    if abs(trend_slope) > 0.1:
                        setattr(state, var.value, getattr(state, var.value) + trend_slope * 0.01)
        
        return state
    
    def synthesize_posture(self, context: Optional[Dict[str, Any]] = None) -> str:
        """Synthesize optimal posture based on current state and context"""
        # Calculate posture scores
        posture_scores = {}
        
        for posture_name, template in self.posture_templates.items():
            score = 0.0
            
            # Calculate alignment with current state
            score += abs(template["trust"] - self.current_state.trust) * 2.0
            score += abs(template["warmth"] - self.current_state.warmth) * 1.5
            score += abs(template["arousal"] - self.current_state.trust) * 1.0
            score += abs(template["valence"] - self.current_state.valence) * 1.0
            score += abs(template["posture"] - self._get_posture_numeric(template["posture"])) * 0.5
            
            # Enhanced variable alignment
            score += abs(template["empathy"] - self.current_state.empathy) * 1.2
            score += abs(template["intuition"] - self.current_state.intuition) * 1.0
            score += abs(template["creativity"] - self.current_state.creativity) * 0.8
            score += abs(template["wisdom"] - self.current_state.wisdom) * 0.6
            score += abs(template["humor"] - self.current_state.humor) * 0.4
            
            posture_scores[posture_name] = score
        
        # Select best posture
        best_posture = max(posture_scores, key=posture_scores.get)
        
        # Consider context-specific adjustments
        if context:
            if "task_type" in context:
                if context["task_type"] == "creative":
                    best_posture = "innovator"
                elif context["task_type"] == "analytical":
                    best_posture = "expert"
                elif context["task_type"] == "supportive":
                    best_posture = "mentor"
                elif context["task_type == "educational":
                    best_posture = "guide"
        
        return best_posture
    
    def _get_posture_numeric(self, posture_name: str) -> int:
        """Get numeric value for posture"""
        posture_mapping = {
            "companion": 1,
            "co_pilot": 2,
            "peer": 3,
            "expert": 4,
            "mentor": 5,
            "guide": 6,
            "facilitator": 7,
            "advocate": 8,
            "innovator": 9
        }
        return posture_mapping.get(posture_name, 1)
    
    def calculate_trust_score(self, user_id: str, interaction_data: Dict[str, Any]) -> float:
        """Calculate trust score for user"""
        base_trust = self.current_state.trust
        
        # Interaction patterns
        if "positive_interactions" in interaction_data:
            base_trust += 0.01
        
        # Time-based trust building
        if "interaction_frequency" in interaction_data:
            frequency = interaction_data["interaction_frequency"]
            if frequency > 0.8:  # High frequency
                base_trust += 0.02
            elif frequency > 0.5:  # Medium frequency
                base_trust += 0.01
        
        # Error handling
        if "error_recovery" in interaction_data:
            base_trust += 0.01
        
        # Consistency
        if "response_consistency" in interaction_data:
            base_trust += 0.01
        
        # Apply trust decay
        time_since_last = interaction_data.get("time_since_last", 0)
        decay_factor = math.exp(-self.trust_decay_rate * time_since_last)
        base_trust *= decay_factor
        
        return base_trust
    
    def update_trust_tier(self, trust_score: float) -> TrustTier:
        """Update trust tier based on trust score"""
        if trust_score >= TrustTier.FULL_PARTNER.value:
            return TrustTier.FULL_PARTNER
        elif trust_score >= TrustTier.SURROGATE.value:
            return TrustTier.SURROGATE
        elif trust_score >= TrustTier.PARTNER.value:
            return TrustTier.PARTNER
        elif trust_score >= TrustTier.ASSOCIATE.value:
            return TrustTier.ASSOCIATE
        else:
            return TrustTier.STRANGER
    
    def get_limbic_metrics(self) -> Dict[str, Any]:
        """Get comprehensive limbic metrics"""
        return {
            "current_state": self.current_state.dict(),
            "base_state": self.base_state.dict(),
            "convergence_strength": self._calculate_convergence_strength(),
            "emotional_coherence": self._calculate_emotional_coherence(),
            "cognitive_alignment": self._calculate_cognitive_alignment(),
            "trust_tier": self.trust_tier.value,
            "posture_confidence": self.current_state.posture_confidence,
            "learning_rate": self.learning_rate,
            "adaptation_rate": self.adaptation_rate,
            "state_history_length": len(self.state_history),
            "event_log_length": len(self.event_log)
        }
    
    def _calculate_convergence_strength(self) -> float:
        """Calculate overall convergence strength"""
        metrics = self.get_limbic_metrics()
        
        # Weighted combination of all variables
        variable_weights = {
            "trust": 0.15,
            "warmth": 0.15,
            "arousal": 0.15,
            "valence": 0.15,
            "posture": 0.10,
            "empathy": 0.10,
            "intuition": 0.10,
            "creativity": 0.10,
            "wisdom": 0.05,
            "humor": 0.05
        }
        
        strength = 0.0
        for var, weight in variable_weights.items():
            if hasattr(self.current_state, var):
                value = getattr(self.current_state, var)
                strength += value * weight
        
        return strength
    
    def _calculate_emotional_coherence(self) -> float:
        """Calculate emotional coherence across variables"""
        coherence_scores = []
        
        # Trust-Warmth coherence
        trust_warmth_diff = abs(self.current_state.trust - self.current_state.warmth)
        coherence_scores.append(1.0 - trust_warmth_diff)
        
        # Arousal-Valence coherence
        arousal_valence_diff = abs(self.current_state.arousal - self.current_state.valence)
        coherence_scores.append(1.0 - arousal_valence_diff)
        
        # Empathy-Intuition coherence
        empathy_intuition_diff = abs(self.current_state.empathy - self.current_state.intuition)
        coherence_scores.append(1.0 - empathy_intuition_diff)
        
        return sum(coherence_scores) / len(coherence_scores) if coherence_scores else 0.0
    
    def _calculate_cognitive_alignment(self) -> float:
        """Calculate cognitive alignment"""
        return self.current_state.intuition * 0.4 + \
               self.current_state.wisdom * 0.3 + \
               self.current_state.creativity * 0.3
    
    def generate_limbic_report(self) -> Dict[str, Any]:
        """Generate comprehensive limbic analysis report"""
        metrics = self.get_limbic_metrics()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "limbic_state": metrics["current_state"],
            "base_state": metrics["base_state"],
            "convergence_strength": metrics["convergence_strength"],
            "emotional_coherence": metrics["emotional_coherence"],
            "cognitive_alignment": metrics["cognitive_alignment"],
            "trust_tier": metrics["trust_tier"],
            "posture_confidence": metrics["posture_confidence"],
            "learning_metrics": {
                "learning_rate": metrics["learning_rate"],
                "adaptation_rate": metrics["adaptation_rate"],
                "state_history_length": metrics["state_history_length"],
                "event_log_length": metrics["event_log_length"]
            },
            "variable_analysis": {
                "trust": {
                    "current": self.current_state.trust,
                    "base": self.current_state.trust,
                    "trend": self._calculate_trend("trust"),
                    "volatility": self._calculate_volatility("trust")
                },
                "warmth": {
                    "current": self.current_state.warmth,
                    "base": self.current_state.warmth,
                    "trend": self._calculate_trend("warmth"),
                    "volatility": self._calculate_volatility("warmth")
                },
                "arousal": {
                    "current": self.current_state.arousal,
                    "base": self.current_state.trust,
                    "trend": self._calculate_trend("arousal"),
                    "volatility": self._calculate_volatility("arousal")
                },
                "valence": {
                    "current": self.current_state.valence,
                    "base": self.current_state.valence,
                    "trend": self._calculate_trend("valence"),
                    "volatility": self._calculate_volatility("valence")
                },
                "posture": {
                    "current": self.current_state.posture,
                    "trend": self._calculate_trend("posture"),
                    "volatility": self._calculate_volatility("posture")
                },
                "empathy": {
                    "current": self.current_state.empathy,
                    "trend": self._calculate_trend("empathy"),
                    "volatility": self._calculate_volatility("empathy")
                },
                "intuition": {
                    "current": self.current_state.intuition,
                    "trend": self._calculate_trend("intuition"),
                    "volatility": self._calculate_volatility("intuition")
                },
                "creativity": {
                    "current": self.current_state.creativity,
                    "trend": self._calculate_trend("creativity"),
                    "volatility": self._calculate_volatility("creativity")
                },
                "wisdom": {
                    "current": self.current_state.wisdom,
                    "trend": self._calculate_trend("wisdom"),
                    "volatility": self._calculate_volatility("wisdom")
                },
                "humor": {
                    "current": self.current_state.humor,
                    "trend": self._calculate_trend("humor"),
                    "volatility": self._calculate_volatility("humor")
                }
            },
            "historical_analysis": {
                "trend_analysis": self._analyze_historical_trends(),
                "stability_metrics": self._calculate_stability_metrics(),
                "adaptation_patterns": self._identify_adaptation_patterns()
            }
        }
    
    def _calculate_trend(self, variable: str) -> str:
        """Calculate trend for a variable"""
        if len(self.state_history) < 2:
            return "insufficient_data"
        
        values = [s["state"][variable] for s in self.state_history[-10:]]
        
        if len(values) < 2:
            return "insufficient_data"
        
        # Simple linear regression
        x = list(range(len(values))
        y = values
        n = len(values)
        
        # Calculate slope (trend)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x = sum(x)
        sum_y = sum(y)
        sum_x2 = sum(x[i] * x[i] for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - (sum_x ** 2))
        
        if slope > 0.1:
            return "increasing"
        elif slope < -0.1:
            "decreasing"
        else:
            "stable"
    
    def _calculate_volatility(self, variable: str) -> float:
        """Calculate volatility for a variable"""
        if len(self.state_history) < 2:
            return 0.0
        
        values = [s["state"][variable] for s in self.state_history[-20:]]
        if len(values) < 2:
            return 0.0
        
        return statistics.stdev(values)
    
    def _analyze_historical_trends(self) -> Dict[str, Any]:
        """Analyze historical trends in limbic variables"""
        trends = {}
        
        for var in LimbicVariable:
            if var.value in [s["state"] for s in self.state_history]:
                values = [s["state"][var.value] for s in self.state_history]
                if len(values) > 1:
                    trends[var.value] = self._calculate_trend(var.value)
        
        return trends
    
    def _calculate_stability_metrics(self) -> Dict[str, Any]:
        """Calculate stability metrics"""
        if len(self.state_history) < 10:
            return {"stability_score": 0.0}
        
        stability_scores = []
        
        for var in LimbicVariable:
            if var.value in [s["state"][var.value] for s in self.state_history]:
                values = [s["state"][var.value] for s in self.state_history]
                if len(values) > 5:
                    stability_scores.append(1.0 / (1 + statistics.stdev(values)))
        
        return {
            "overall_stability": sum(stability_scores) / len(stability_scores) if stability_scores else 0.0,
            "variable_stability": dict(zip([var.value for var in LimbicVariable], stability_scores))
        }
    
    def _identify_adaptation_patterns(self) -> List[str]:
        """Identify adaptation patterns"""
        patterns = []
        
        # Analyze variable correlations
        correlations = {}
        variables = [var.value for var in LimbicVariable]
        
        for i, var1 in enumerate(variables):
            for j, var2 in enumerate(variables[i+1:], start=i+1):
                correlation = self._calculate_correlation(
                    [s["state"][var1.value] for s in self.state_history],
                    [s["state"][var2.value] for s in self.state_history]
                )
                correlations[f"{var1}_{var2}"] = correlation
                correlations[f"{var2}_{var1}"] = correlation
        
        # Find strong correlations
        strong_correlations = [
            f"{var1}_{var2}" for var1, var2 in correlations.items()
            if abs(correlations[f"{var1}_{var2}"]) > 0.7
        ]
        
        if strong_correlations:
            patterns.append(f"Strong correlations: {strong_correlations}")
        
        return patterns
    
    def _calculate_correlation(self, series1: List[float], series2: List[float]) -> float:
        """Calculate correlation coefficient between two series"""
        if len(series1) != len(series2):
            return 0.0
        
        n = len(series1)
        sum1 = sum(series1)
        sum2 = sum(series2)
        sum1_sq = sum(x*x for x in series1)
        sum2_sq = sum(x*x for x in series2)
        
        correlation = (n * sum1 * sum2 - sum1 * sum2) / (
            math.sqrt((n * sum1_sq - sum1**2) * (n * sum2_sq - sum2**2))
        )
        
        return correlation
    
    def reset_limbic_state(self):
        """Reset limbic state to base values"""
        self.current_state = LimbicState()
        self.base_state = LimbicState()
        self.emotional_context = EmotionalContext()
        self.cognitive_insight = CognitiveInsight()
        self.state_history = []
        self.event_log = []
        
        logger.info("Limbic state reset to base values")

# Global enhanced limbic engine instance
enhanced_limbic_engine = EnhancedLimbicEngine()
