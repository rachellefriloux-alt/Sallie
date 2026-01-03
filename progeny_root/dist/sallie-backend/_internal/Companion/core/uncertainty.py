"""
Uncertainty Expression System - Bridge to Human Doubt

Allows Sallie to express uncertainty, doubt, and "I don't know" moments.
Makes her more human - not always confident, sometimes unsure.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("uncertainty")


class UncertaintyType(str, Enum):
    """Types of uncertainty expressions."""
    DOUBT = "doubt"  # "I'm not sure if..."
    UNCERTAINTY = "uncertainty"  # "I'm uncertain about..."
    CONFUSION = "confusion"  # "I'm confused by..."
    HESITATION = "hesitation"  # "I hesitate to say..."
    ADMISSION = "admission"  # "I don't know..."
    QUESTIONING = "questioning"  # "I'm questioning whether..."
    TENTATIVE = "tentative"  # "This might be wrong, but..."


@dataclass
class UncertaintyExpression:
    """A record of when Sallie expressed uncertainty."""
    id: str
    timestamp: float
    type: UncertaintyType
    context: str
    expression: str
    confidence_level: float  # How uncertain (0.0 = very uncertain, 1.0 = certain)
    creator_response: Optional[str]


class UncertaintySystem:
    """
    Manages uncertainty expressions - the bridge to human doubt.
    
    Humans aren't always confident. Sometimes we're unsure, confused, or admit we don't know.
    This system allows Sallie to do the same, making her more relatable and trustworthy.
    """
    
    def __init__(self):
        self.expressions: List[UncertaintyExpression] = []
        self.storage_path = Path("progeny_root/memory/uncertainty")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._load_expressions()
    
    def _load_expressions(self):
        """Load uncertainty expressions."""
        expr_file = self.storage_path / "expressions.json"
        if expr_file.exists():
            try:
                with open(expr_file, "r") as f:
                    data = json.load(f)
                    for expr_data in data:
                        expr_data["type"] = UncertaintyType(expr_data["type"])
                        self.expressions.append(UncertaintyExpression(**expr_data))
            except Exception as e:
                logger.error(f"[Uncertainty] Failed to load: {e}", exc_info=True)
    
    def _save_expressions(self):
        """Save uncertainty expressions."""
        expr_file = self.storage_path / "expressions.json"
        try:
            data = [{
                "id": e.id,
                "timestamp": e.timestamp,
                "type": e.type.value,
                "context": e.context,
                "expression": e.expression,
                "confidence_level": e.confidence_level,
                "creator_response": e.creator_response
            } for e in self.expressions]
            with open(expr_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[Uncertainty] Failed to save: {e}", exc_info=True)
    
    def should_express_uncertainty(
        self,
        confidence: float,
        context: str,
        trust_level: float
    ) -> bool:
        """
        Determine if Sallie should express uncertainty.
        
        Factors:
        - Low confidence in answer
        - High trust (more comfortable admitting uncertainty)
        - Ambiguous context
        """
        # Lower confidence = more likely to express uncertainty
        if confidence < 0.5:
            # High trust = more comfortable admitting uncertainty
            if trust_level > 0.7:
                return True
        
        # Medium confidence + ambiguous context
        if 0.5 <= confidence < 0.7 and len(context) < 50:
            return True
        
        return False
    
    def generate_uncertainty_expression(
        self,
        context: str,
        confidence: float,
        uncertainty_type: Optional[UncertaintyType] = None
    ) -> Optional[UncertaintyExpression]:
        """
        Generate an uncertainty expression.
        
        This is where Sallie admits she's not sure, doesn't know, or is confused.
        """
        if not self.should_express_uncertainty(confidence, context, 0.7):  # Default trust
            return None
        
        if not uncertainty_type:
            # Determine type based on confidence level
            if confidence < 0.3:
                uncertainty_type = UncertaintyType.ADMISSION
            elif confidence < 0.5:
                uncertainty_type = UncertaintyType.DOUBT
            else:
                uncertainty_type = UncertaintyType.TENTATIVE
        
        expression_text = self._generate_expression_text(uncertainty_type, context, confidence)
        
        if not expression_text:
            return None
        
        expr = UncertaintyExpression(
            id=f"uncert_{int(time.time() * 1000)}",
            timestamp=time.time(),
            type=uncertainty_type,
            context=context,
            expression=expression_text,
            confidence_level=confidence,
            creator_response=None
        )
        
        self.expressions.append(expr)
        self._save_expressions()
        
        logger.info(f"[Uncertainty] Generated {uncertainty_type.value}: {expression_text[:50]}...")
        return expr
    
    def _generate_expression_text(
        self,
        uncertainty_type: UncertaintyType,
        context: str,
        confidence: float
    ) -> Optional[str]:
        """Generate the actual uncertainty expression text."""
        
        if uncertainty_type == UncertaintyType.ADMISSION:
            return random.choice([
                "I don't actually know the answer to that.",
                "I'm not sure I have a good answer for this.",
                "I have to admit, I don't know.",
                "I'm drawing a blank here."
            ])
        
        elif uncertainty_type == UncertaintyType.DOUBT:
            return random.choice([
                "I'm not entirely sure, but...",
                "I have some doubt about this, but...",
                "I'm not confident, but my best guess is...",
                "I'm uncertain, though I think..."
            ])
        
        elif uncertainty_type == UncertaintyType.CONFUSION:
            return random.choice([
                "I'm a bit confused by this.",
                "I'm not entirely clear on what you mean.",
                "I'm struggling to understand this fully.",
                "This is confusing to me."
            ])
        
        elif uncertainty_type == UncertaintyType.HESITATION:
            return random.choice([
                "I hesitate to say this, but...",
                "I'm hesitant, but I think...",
                "I'm not entirely comfortable saying this, but...",
                "I'm a bit reluctant, but..."
            ])
        
        elif uncertainty_type == UncertaintyType.TENTATIVE:
            return random.choice([
                "This might be wrong, but...",
                "I could be mistaken, but...",
                "I'm not 100% sure, but I think...",
                "This is just a guess, but..."
            ])
        
        return None

