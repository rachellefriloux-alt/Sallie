"""
Uncertainty System for Sallie
Handles uncertainty and ambiguity in responses
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("uncertainty")

class UncertaintyLevel(BaseModel):
    """Uncertainty level assessment"""
    confidence: float
    uncertainty: float
    reasoning: str
    timestamp: datetime = datetime.now()

class UncertaintySystem:
    """Mock Uncertainty System"""
    
    def __init__(self):
        self.assessments = []
        
    def assess_uncertainty(self, response: str, context: str = "") -> UncertaintyLevel:
        """Assess uncertainty level of a response"""
        # Simple uncertainty assessment based on response characteristics
        uncertainty_indicators = ["maybe", "perhaps", "possibly", "might", "could be", "I think", "probably"]
        confidence_indicators = ["definitely", "certainly", "absolutely", "sure", "confident"]
        
        response_lower = response.lower()
        
        uncertainty_count = sum(1 for indicator in uncertainty_indicators if indicator in response_lower)
        confidence_count = sum(1 for indicator in confidence_indicators if indicator in response_lower)
        
        # Calculate uncertainty
        if confidence_count > uncertainty_count:
            confidence = min(0.9, 0.7 + confidence_count * 0.1)
            uncertainty = max(0.1, 1.0 - confidence)
        elif uncertainty_count > confidence_count:
            uncertainty = min(0.8, 0.3 + uncertainty_count * 0.15)
            confidence = max(0.2, 1.0 - uncertainty)
        else:
            confidence = 0.6
            uncertainty = 0.4
        
        assessment = UncertaintyLevel(
            confidence=confidence,
            uncertainty=uncertainty,
            reasoning=f"Based on {uncertainty_count} uncertainty indicators and {confidence_count} confidence indicators"
        )
        
        self.assessments.append(assessment)
        logger.debug(f"[Uncertainty] Assessed: confidence={confidence:.2f}, uncertainty={uncertainty:.2f}")
        
        return assessment
