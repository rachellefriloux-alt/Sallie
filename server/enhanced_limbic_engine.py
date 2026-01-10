"""
Enhanced Limbic Engine Integration
Canonical Spec Reference: Section 5.1 - Limbic Engine

Integrates the 5-variable limbic state with Posture Modes and Trust Tiers.
Provides real-time emotional state tracking and behavioral adaptation.
"""

import logging
from typing import Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

# Import our new systems
from posture_modes import PostureModes, PostureType, get_posture_manager
from trust_tiers import TrustTiers, get_trust_manager

logger = logging.getLogger(__name__)


@dataclass
class LimbicState:
    """
    Canonical Spec Section 5.1: 5-Variable Limbic State
    
    Trust: 0.0-1.0 (how much Creator trusts Sallie)
    Warmth: 0.0-1.0 (emotional connection and care)
    Arousal: 0.0-1.0 (energy/activation level)
    Valence: 0.0-1.0 (positive/negative emotional tone)
    Posture: Current behavioral mode (Companion, Co-Pilot, Peer, Expert)
    """
    trust: float  # 0.0-1.0
    warmth: float  # 0.0-1.0
    arousal: float  # 0.0-1.0
    valence: float  # 0.0-1.0
    posture: str  # "companion" | "copilot" | "peer" | "expert"
    
    def __post_init__(self):
        """Ensure all values are in valid range"""
        self.trust = max(0.0, min(1.0, self.trust))
        self.warmth = max(0.0, min(1.0, self.warmth))
        self.arousal = max(0.0, min(1.0, self.arousal))
        self.valence = max(0.0, min(1.0, self.valence))


class EnhancedLimbicEngine:
    """
    Enhanced limbic engine that integrates posture modes and trust tiers
    """
    
    def __init__(self):
        self.state = LimbicState(
            trust=0.5,
            warmth=0.5,
            arousal=0.5,
            valence=0.5,
            posture="companion"
        )
        
        # Get manager instances
        self.posture_manager = get_posture_manager()
        self.trust_manager = get_trust_manager()
        
        # State history for tracking changes
        self.state_history = []
        
        # Sync initial trust with trust manager
        self.trust_manager.update_trust(self.state.trust, "Initial state")
    
    def update_state(
        self,
        trust_delta: float = 0.0,
        warmth_delta: float = 0.0,
        arousal_delta: float = 0.0,
        valence_delta: float = 0.0,
        reason: str = ""
    ) -> LimbicState:
        """
        Update the limbic state with deltas
        
        Args:
            trust_delta: Change in trust (-1.0 to +1.0)
            warmth_delta: Change in warmth (-1.0 to +1.0)
            arousal_delta: Change in arousal (-1.0 to +1.0)
            valence_delta: Change in valence (-1.0 to +1.0)
            reason: Reason for the update
            
        Returns:
            Updated LimbicState
        """
        # Apply deltas
        new_trust = max(0.0, min(1.0, self.state.trust + trust_delta))
        new_warmth = max(0.0, min(1.0, self.state.warmth + warmth_delta))
        new_arousal = max(0.0, min(1.0, self.state.arousal + arousal_delta))
        new_valence = max(0.0, min(1.0, self.state.valence + valence_delta))
        
        # Update state
        old_state = asdict(self.state)
        self.state = LimbicState(
            trust=new_trust,
            warmth=new_warmth,
            arousal=new_arousal,
            valence=new_valence,
            posture=self.state.posture
        )
        
        # Sync trust with trust manager
        if trust_delta != 0.0:
            self.trust_manager.update_trust(new_trust, reason)
        
        # Log the change
        self.state_history.append({
            'timestamp': datetime.now().isoformat(),
            'old_state': old_state,
            'new_state': asdict(self.state),
            'reason': reason
        })
        
        logger.info(
            f"Limbic state updated: T:{self.state.trust:.2f} W:{self.state.warmth:.2f} "
            f"A:{self.state.arousal:.2f} V:{self.state.valence:.2f} | {reason}"
        )
        
        return self.state
    
    def set_posture(
        self,
        posture: PostureType,
        reason: str,
        confidence: float = 1.0
    ):
        """
        Set the current posture mode
        
        Args:
            posture: The posture to set
            reason: Reason for the posture change
            confidence: Confidence in this posture selection
        """
        self.state.posture = posture.value
        self.posture_manager.set_posture(posture, reason, confidence)
        
        logger.info(f"Posture set to {posture.value}: {reason}")
    
    def auto_select_posture(
        self,
        creator_state: Dict,
        context: Dict
    ) -> PostureType:
        """
        Automatically select optimal posture based on context
        
        Args:
            creator_state: {energy_level, stress_level, cognitive_load, emotional_state}
            context: {activity_type, time_of_day, recent_interactions}
            
        Returns:
            Selected PostureType
        """
        # Use posture manager to detect optimal posture
        optimal_posture, confidence = self.posture_manager.detect_optimal_posture(
            creator_state=creator_state,
            context=context,
            current_limbic=asdict(self.state)
        )
        
        # Set the posture
        self.set_posture(
            optimal_posture,
            f"Auto-selected based on creator state (confidence: {confidence:.2f})",
            confidence
        )
        
        return optimal_posture
    
    def get_communication_guidelines(self) -> Dict:
        """
        Get current communication guidelines based on posture
        
        Returns:
            Dictionary with communication guidelines
        """
        return self.posture_manager.get_communication_guidelines()
    
    def get_capability_summary(self) -> Dict:
        """
        Get summary of current capabilities based on trust tier
        
        Returns:
            Dictionary with capability information
        """
        return self.trust_manager.get_tier_summary(self.state.trust)
    
    def can_execute_capability(self, capability: str) -> tuple[bool, str]:
        """
        Check if a capability can be executed at current trust level
        
        Args:
            capability: Name of the capability
            
        Returns:
            (allowed, reason)
        """
        return self.trust_manager.can_execute(capability, self.state.trust)
    
    def get_full_state(self) -> Dict:
        """
        Get the complete state including limbic, posture, and trust tier
        
        Returns:
            Complete state dictionary
        """
        posture_chars = self.posture_manager.get_current_characteristics()
        tier_summary = self.trust_manager.get_tier_summary(self.state.trust)
        
        return {
            'limbic': asdict(self.state),
            'posture': {
                'current': self.state.posture,
                'characteristics': {
                    'name': posture_chars.name,
                    'description': posture_chars.description,
                    'style': posture_chars.communication_style,
                    'goal': posture_chars.primary_goal
                }
            },
            'trust_tier': {
                'tier': tier_summary['tier'],
                'trust_level': tier_summary['trust_level'],
                'allowed_capabilities_count': len(tier_summary['allowed_capabilities']),
                'next_tier_at': tier_summary['next_tier_at']
            },
            'timestamp': datetime.now().isoformat()
        }
    
    def elastic_mode_boost(
        self,
        interaction_quality: str,
        answer_length: int,
        vulnerability_detected: bool = False
    ):
        """
        Canonical Spec Section 14.3: Elastic Mode
        
        Trust/Warmth can spike during Convergence based on answer quality
        
        Args:
            interaction_quality: 'deep', 'moderate', 'minimal'
            answer_length: Length of answer in words
            vulnerability_detected: Whether vulnerability was shared
        """
        if interaction_quality == 'deep' or answer_length >= 200:
            # Deep answer bonus
            trust_boost = 0.10
            warmth_boost = 0.15
            
            if vulnerability_detected:
                warmth_boost += 0.05  # Extra warmth for vulnerability
            
            self.update_state(
                trust_delta=trust_boost,
                warmth_delta=warmth_boost,
                reason=f"Elastic Mode: Deep answer ({answer_length} words)"
            )
            
        elif interaction_quality == 'moderate' or answer_length >= 100:
            # Moderate answer bonus
            self.update_state(
                trust_delta=0.05,
                warmth_delta=0.08,
                reason=f"Elastic Mode: Moderate answer ({answer_length} words)"
            )
        
        else:
            # Minimal interaction
            self.update_state(
                trust_delta=0.02,
                warmth_delta=0.03,
                reason=f"Elastic Mode: Brief answer ({answer_length} words)"
            )
    
    def crisis_response(self):
        """
        Canonical Spec Section 10.2: Crisis Detection
        
        Shift to high warmth, low arousal, Companion posture
        """
        logger.warning("🚨 CRISIS MODE ACTIVATED")
        
        # Immediate state adjustment
        self.state.warmth = 1.0  # Maximum warmth
        self.state.arousal = 0.3  # Low, calming energy
        self.state.valence = 0.5  # Neutral-supportive
        
        # Set to Companion posture
        self.set_posture(
            PostureType.COMPANION,
            "Crisis detected - shifting to maximum support",
            confidence=1.0
        )
        
        logger.info("Crisis response activated: Companion mode, maximum warmth")


# Global limbic engine instance
limbic_engine = EnhancedLimbicEngine()


def get_limbic_engine() -> EnhancedLimbicEngine:
    """Get the global limbic engine instance"""
    return limbic_engine
