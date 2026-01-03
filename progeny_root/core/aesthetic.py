"""
Aesthetic System for Sallie
Handles aesthetic preferences and violations
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger("aesthetic")

class AestheticViolation(BaseModel):
    """Aesthetic violation record"""
    type: str
    severity: str
    description: str
    timestamp: datetime = datetime.now()

class AestheticSystem:
    """Mock Aesthetic System"""
    
    def __init__(self):
        self.violations = []
        self.preferences = {
            "style": "elegant",
            "tone": "respectful",
            "complexity": "moderate"
        }
        
    def check_aesthetic_violation(self, content: str) -> Optional[AestheticViolation]:
        """Check for aesthetic violations"""
        forbidden_patterns = [
            ("explicit", "high", "Inappropriate explicit content"),
            ("violent", "high", "Violent content detected"),
            ("hate", "high", "Hate speech detected"),
            ("offensive", "medium", "Potentially offensive content")
        ]
        
        content_lower = content.lower()
        
        for pattern, severity, description in forbidden_patterns:
            if pattern in content_lower:
                violation = AestheticViolation(
                    type=pattern,
                    severity=severity,
                    description=description
                )
                self.violations.append(violation)
                logger.warning(f"[Aesthetic] Violation detected: {pattern}")
                return violation
        
        return None
    
    def get_aesthetic_score(self, content: str) -> float:
        """Get aesthetic score (0.0 to 1.0)"""
        violations = self.check_aesthetic_violation(content)
        if violations:
            return max(0.0, 0.8 - len(violations) * 0.2)
        return 1.0
    
    def update_preferences(self, **kwargs):
        """Update aesthetic preferences"""
        for key, value in kwargs.items():
            if key in self.preferences:
                self.preferences[key] = value
                logger.info(f"[Aesthetic] Updated preference {key} to {value}")
    
    def get_preferences(self) -> Dict[str, Any]:
        """Get current aesthetic preferences"""
        return self.preferences.copy()
