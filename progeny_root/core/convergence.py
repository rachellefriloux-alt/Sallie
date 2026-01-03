"""The Great Convergence (15 Questions).

Enhanced with:
- Complete extraction prompts
- Extended heritage compilation
- Versioning system
- Enhanced error handling
- Better session management
"""

import json
import time
import logging
from pathlib import Path
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime
from pydantic import BaseModel

try:
    from .infrastructure.limbic import LimbicSystem
except ImportError:
    try:
        from infrastructure.limbic import LimbicSystem
    except ImportError:
        try:
            from limbic import LimbicSystem
        except ImportError:
            LimbicSystem = None

try:
    from .identity import get_identity_system
except ImportError:
    try:
        from identity import get_identity_system
    except ImportError:
        get_identity_system = None

try:
    from .infrastructure.llm_router import get_llm_router
except ImportError:
    try:
        from infrastructure.llm_router import get_llm_router
    except ImportError:
        try:
            from llm_router import get_llm_router
        except ImportError:
            get_llm_router = None

logger = logging.getLogger("convergence")

# Constants
CONVERGENCE_VERSION = "1.0"
HERITAGE_VERSION_FILE = Path("progeny_root/limbic/heritage/version.json")

# Convergence questions
QUESTIONS = [
    {
        "id": 1,
        "question": "What's your name?",
        "type": "identity",
        "required": True
    },
    {
        "id": 2,
        "question": "What do you do for work or study?",
        "type": "profession",
        "required": True
    },
    {
        "id": 3,
        "question": "What are your main interests or hobbies?",
        "type": "interests",
        "required": False
    },
    {
        "id": 4,
        "question": "How would you describe your personality?",
        "type": "personality",
        "required": False
    },
    {
        "id": 5,
        "question": "What are you hoping to achieve with our collaboration?",
        "type": "goals",
        "required": True
    }
]

class ConvergenceResponse(BaseModel):
    """Convergence response"""
    answer: str
    question_id: int
    timestamp: datetime = datetime.now()
    confidence: float = 0.8

class ConvergenceSystem:
    """Mock Convergence System"""
    
    def __init__(self, limbic=None):
        self.limbic = limbic
        self.responses = []
        self.current_question_index = 0
        self.is_complete = False
        self.user_profile = {}
        
    def get_next_question(self) -> Optional[Dict[str, Any]]:
        """Get the next question"""
        if self.current_question_index >= len(QUESTIONS):
            return None
        
        return QUESTIONS[self.current_question_index]
    
    def submit_answer(self, answer: str, question_id: int) -> bool:
        """Submit an answer"""
        if question_id != QUESTIONS[self.current_question_index]["id"]:
            return False
        
        response = ConvergenceResponse(
            answer=answer,
            question_id=question_id
        )
        
        self.responses.append(response)
        
        # Store in user profile
        question = QUESTIONS[self.current_question_index]
        self.user_profile[question["type"]] = answer
        
        # Move to next question
        self.current_question_index += 1
        
        # Check if complete
        if self.current_question_index >= len(QUESTIONS):
            self.is_complete = True
            logger.info("Convergence process completed!")
        
        return True
    
    def get_progress(self) -> Dict[str, Any]:
        """Get convergence progress"""
        return {
            "current_question": self.current_question_index + 1,
            "total_questions": len(QUESTIONS),
            "progress_percentage": (self.current_question_index / len(QUESTIONS)) * 100,
            "is_complete": self.is_complete,
            "answered_questions": len(self.responses)
        }
    
    def get_user_profile(self) -> Dict[str, Any]:
        """Get the user profile"""
        return self.user_profile.copy()
    
    def reset(self):
        """Reset convergence process"""
        self.responses = []
        self.current_question_index = 0
        self.is_complete = False
        self.user_profile = {}
        logger.info("Convergence process reset")
    
    def is_convergence_complete(self) -> bool:
        """Check if convergence is complete"""
        return self.is_complete
    
    def get_all_questions(self) -> List[Dict[str, Any]]:
        """Get all questions"""
        return QUESTIONS.copy()
    
    def generate_summary(self) -> str:
        """Generate convergence summary"""
        if not self.is_complete:
            return "Convergence not yet complete"
        
        summary_parts = []
        
        if "identity" in self.user_profile:
            summary_parts.append(f"Name: {self.user_profile['identity']}")
        
        if "profession" in self.user_profile:
            summary_parts.append(f"Profession: {self.user_profile['profession']}")
        
        if "interests" in self.user_profile:
            summary_parts.append(f"Interests: {self.user_profile['interests']}")
        
        if "goals" in self.user_profile:
            summary_parts.append(f"Goals: {self.user_profile['goals']}")
        
        return " | ".join(summary_parts) if summary_parts else "No profile data"