"""
Complete Genesis Flow System
Advanced creative ideation and brainstorming capabilities
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import random
import string
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class GenesisPhase(Enum):
    """Genesis flow phases"""
    EXPLORATION = "exploration"
    IDEATION = "ideation"
    CREATION = "creation"
    REFINEMENT = "refinement"
    SYNTHESIS = "synthesis"
    MANIFESTATION = "manifestation"

class CreativityType(Enum):
    """Types of creative work"""
    WRITING = "writing"
    VISUAL_ART = "visual_art"
    MUSIC = "music"
    CODE = "code"
    DESIGN = "design"
    BRAINSTORMING = "brainstorming"
    PROBLEM_SOLVING = "problem_solving"
    CONCEPTUAL = "conceptual"

class GenesisQuestion:
    """Genesis flow question"""
    id: int
    phase: GenesisPhase
    text: str
    type: CreativityType
    prompt: str
    context: Dict[str, Any] = field(default_factory=dict)
    required: bool = True
    options: Optional[List[str]] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    file_types: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    follow_up_questions: Optional[List[int]] = None

class GenesisResponse:
    """Response from genesis flow"""
    success: bool
    next_question: Optional[Dict[str, Any]] = None
    progress: Optional[Dict[str, Any]] = None
    creative_output: Optional[Any] = None
    insights: Optional[List[str]] = None
    error: Optional[str] = None

class GenesisEngine:
    """Advanced genesis flow for creative collaboration"""
    
    def __init__(self):
        self.questions = self._generate_genesis_questions()
        self.current_phase = GenesisPhase.EXPLORATION
        self.current_question = None
        self.answers = {}
        self.creative_outputs = []
        self.insights = []
        self.session_id = None
        self.user_preferences = {}
        
    def _generate_genesis_questions(self) -> List[GenesisQuestion]:
        """Generate all 29 genesis questions"""
        questions = []
        
        # Phase 1: Exploration (Questions 1-7)
        questions.extend([
            GenesisQuestion(
                id=1,
                phase=GenesisPhase.EXPLORATION,
                text="What creative project or idea brings you here today?",
                type=CreativityType.TEXT,
                prompt="Tell me about the creative project or idea that brought you here today.",
                required=True,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=2,
                phase=GenesisPhase.EXPLORATION,
                text="What medium or form of creative expression do you prefer?",
                type=CreativityType.MULTIPLE_CHOICE,
                options=[
                    "Writing - Stories, articles, essays, journals",
                    "Visual Art - Digital art, illustrations, design",
                    "Music - Composition, production, performance",
                    "Code - Programming, algorithms, systems",
                    "Design - UI/UX, graphics, architecture",
                    "Mixed Media - Combination approaches"
                ],
                required=True
            ),
            GenesisQuestion(
                id=3,
                phase=GenesisPhase.EXPLORATION,
                text="What inspires your creativity most right now?",
                type=CreativityType.TEXT,
                prompt="What creative inspiration is driving you today?",
                required=True,
                validation_rules={"min_length": 30, "max_length": 800}
            ),
            GenesisQuestion(
                id=4,
                phase=GenesiPhase.EXPLORATION,
                text="Describe your creative process or workflow when starting a project.",
                type=CreativityType.TEXT,
                prompt="How do you typically begin a creative project?",
                required=True,
                validation_rules={"min_length": 100, "max_length": 1500}
            ),
            GenesisQuestion(
                id=5,
                phase=GenesisPhase.EXPLORATION,
                text="What creative challenges or obstacles are you currently facing?",
                type=Creativity.TEXT,
                prompt="What creative challenges are you currently facing?",
                required=False,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=6,
                phase=GenesisPhase.EXPLORATION,
                text="What tools or resources would help your creative process?",
                type=CreativityType.MULTIPLE_CHOICE,
                options=[
                    "Digital tools (Adobe Creative Cloud, Figma, Sketch)",
                    "Traditional tools (pencil, paint, camera, instruments)",
                    "Software tools (IDE, code editors, compilers)",
                    "Analog tools (canvas, instruments, workshop tools)",
                    "Mixed approach - combine digital and traditional"
                ],
                required=False
            ),
            GenesisQuestion(
                id=7,
                phase=GenesisPhase.EXPLORATION,
                text="What creative environment helps you feel most inspired?",
                type=Creativity.TEXT,
                prompt="What creative environment helps you feel most inspired?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 500}
            )
        ])
        
        # Phase 2: Ideation (Questions 8-14)
        questions.extend([
            GenesisQuestion(
                id=8,
                phase=GenesisPhase.IDEATION,
                text="What problem or opportunity would you like to explore through creative ideation?",
                type=CreativityType.TEXT,
                prompt="What problem or opportunity would you like to explore?",
                required=True,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=9,
                phase=GenesisPhase.IDEATION,
                text="What kind of collaboration would enhance your creative process?",
                type=Creativity.TEXT,
                prompt="How would collaboration enhance your creative process?",
                required=False,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=10,
                phase=GenesisPhase.IDEATION,
                text="What constraints or limitations would you like to remove from your creative process?",
                type=Creativity.TEXT,
                prompt="What constraints would you like to remove?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=11,
                phase=GenesisPhase.IDEATION,
                text="What would enable your most creative self to emerge?",
                type=Creativity.TEXT,
                prompt="What would enable your most creative self?",
                required=True,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=12,
                phase=GenesisPhase.IDEATION,
                text="What patterns or themes would you like to explore in your creative work?",
                type=Creativity.MULTIPLE_CHOICE,
                options=[
                    "Geometric patterns and sacred geometry",
                    "Natural patterns and organic forms",
                    "Abstract concepts and theoretical concepts",
                    "Cultural motifs and traditions",
                    "Mathematical patterns and formulas",
                    "Historical artistic styles",
                    "Futuristic concepts and speculative ideas"
                ],
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=13,
                phase=GenesisPhase.IDEATION,
                text="What emotions or feelings would you like to express through your creative work?",
                type=Creativity.TEXT,
                prompt="What emotions or feelings would you like to express?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=14,
                phase=GenesisPhase.IDEATION,
                text="What would make your creative process feel effortless and natural?",
                type=Creativity.TEXT,
                prompt="What would make your creative process feel effortless and natural?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            )
        ])
        
        # Phase 3: Creation (Questions 15-21)
        questions.extend([
            GenesisQuestion(
                id=15,
                phase=GenesisPhase.CREATION,
                text="What creative medium or format would be best for this project?",
                type=CreativityType.CHOICE,
                options=[
                    "Text document (Word, Google Docs, Notion)",
                    "Presentation (PowerPoint, Keynote, Google Slides)",
                    "Spreadsheet (Excel, Google Sheets, Airtable)",
                    "Code repository (GitHub, GitLab, Bitbucket)",
                    "Design file (Figma, Sketch, Adobe XD)",
                    "Video content (YouTube, Vimeo, Loom)",
                    "Audio content (Spotify, SoundCloud, Podbean)",
                    "Interactive prototype (Framer, InVision, ProtoPie)",
                    "3D model (Blender, Unity, Unreal)",
                    "AR/VR content (Unity, Unreal, WebXR)"
                ],
                required=True
            ),
            GenesisQuestion(
                id=16,
                phase=GenesisPhase.CREATION,
                text="What style or aesthetic would best represent this creative work?",
                type=Creativity.TEXT,
                prompt="What style or aesthetic would best represent this creative work?",
                required=True,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=17,
                phase=GenesisPhase.CREATION,
                text="What title or heading would capture the essence of this project?",
                type=Creativity.TEXT,
                prompt="What title or heading would capture the essence of this project?",
                required=True,
                validation_rules={"min_length": 10, "max_length": 200}
            ),
            GenesisQuestion(
                id=18,
                phase=GenesisPhase.CREATION,
                text="What audience or user group would benefit most from this work?",
                type=Creativity.TEXT,
                prompt="What audience or user group would benefit most from this work?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=19,
                phase=GenesisPhase.CREATION,
                text="What impact or change would you like this work to create?",
                type=Creativity.TEXT,
                prompt="What impact or change would you like this work to create?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=20,
                phase=Phase3.CREATION,
                text="What resources or support would accelerate your creative process?",
                type=Creativity.TEXT,
                prompt="What resources or support would accelerate your creative process?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=21,
                phase=GenesisPhase.CREATION,
                text="What would make this creative work feel meaningful to you personally?",
                type=Creativity.TEXT,
                prompt="What would make this creative work feel meaningful to you personally?",
                required=True,
                validation_rules={"min_length": 30, "max_length": 1000}
            )
        ])
        
        # Phase 4: Refinement (Questions 22-29)
        questions.extend([
            GenesisQuestion(
                id=22,
                phase=GenesisPhase.REFINEMENT,
                text="How could this creative work be improved or enhanced?",
                type=Creativity.TEXT,
                prompt="How could this creative work be improved or enhanced?",
                required=False,
                validation_rules={"min_length": 50, "max_length": 1000}
            ),
            GenesisQuestion(
                id=23,
                phase=GenesisPhase.REFINEMENT,
                text="What additional features or capabilities would enhance this work?",
                type=Creativity.TEXT,
                prompt="What additional features or capabilities would enhance this work?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=24,
                phase=GenesisPhase.REFINEMENT,
                text="How could this creative work be shared or distributed?",
                type=Creativity.TEXT,
                prompt="How could this creative work be shared or distributed?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=25,
                phase=GenesisPhase.REFINEMENT,
                text="What would make this creative work more sustainable or maintainable?",
                type=Creativity.TEXT,
                prompt="What would make this creative work more sustainable or maintainable?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=26,
                phase=GenesisPhase.REFINEMENT,
                text="What would make this creative work more accessible or inclusive?",
                type=Creativity.TEXT,
                prompt="What would make this creative work more accessible or inclusive?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=27,
                phase=GenesisPhase.REFINEMENT,
                text="What would make this creative work more innovative or groundbreaking?",
                type=Creativity.TEXT,
                prompt="What would make this creative work more innovative or groundbreaking?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=28,
                phase=GenesisPhase.REFINEMENT,
                text="What would make this creative work more efficient or automated?",
                type=Creativity.TEXT,
                prompt="What would make this creative work more efficient or automated?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            ),
            GenesisQuestion(
                id=29,
                phase=GenesisPhase.REFINEMENT,
                text="What would make this creative work more personalized or adaptive?",
                type=Creativity.TEXT,
                prompt="What would make this creative work more personalized or adaptive?",
                required=False,
                validation_rules={"min_length": 30, "max_length": 1000}
            )
        ])
        
        return questions
    
    def get_current_question(self) -> Optional[GenesisQuestion]:
        """Get current genesis question"""
        if 0 <= self.current_question < len(self.questions):
            return self.questions[self.current_question]
        return None
    
    def submit_genesis_answer(self, question_id: int, answer: Any) -> GenesisResponse:
        """Submit answer to genesis question"""
        try:
            # Validate answer
            question = next((q for q in self.questions if q.id == question_id))
            
            validation_result = self._validate_genesis_answer(question, answer)
            if not validation_result["valid"]:
                return GenesisResponse(
                    success=False,
                    error=validation_result["error"],
                    question_id=question_id
                )
            
            # Store answer
            self.answers[question_id] = {
                "value": answer,
                "timestamp": datetime.utcnow().isoformat(),
                "question_type": question.type.value,
                "phase": question.phase.value,
                "creative_output": None,
                "insights": []
            }
            
            # Generate creative output if applicable
            creative_output = await self._generate_creative_output(question, answer)
            
            # Move to next question or complete
            if self.current_question < len(self.questions) - 1:
                self.current_question += 1
                return GenesisResponse(
                    success=True,
                    next_question=self.get_current_question(),
                    progress=self.get_progress(),
                    creative_output=creative_output
                )
            else:
                # Complete genesis flow
                self.current_phase = GenesisPhase.MANIFESTATION
                summary = self._generate_genesis_summary()
                
                return GenesisResponse(
                    success=True,
                    completed=True,
                    progress=self.get_progress(),
                    creative_outputs=self.creative_outputs,
                    insights=self.insights,
                    summary=summary
                )
            
        except Exception as e:
            logger.error(f"Error submitting genesis answer: {e}")
            return GenesisResponse(
                success=False,
                error=str(e),
                question_id=question_id
            )
    
    def _validate_genesis_answer(self, question: GenesisQuestion, answer: Any) -> Dict[str, Any]:
        """Validate genesis answer according to question type and rules"""
        try:
            if question.type == CreativityType.TEXT:
                if not isinstance(answer, str):
                    return {"valid": False, "error": "Text answer must be a string"}
                
                if question.validation_rules:
                    if "min_length" in question.validation_rules:
                        if len(answer) < question.validation_rules["min_length"]:
                            return {"valid": False, "error": f"Answer must be at least {question.validation_rules['min_length']} characters"}
                    
                    if "max_length" in question.validation_rules:
                        if len(answer) > question.validation_rules["max_length"]:
                            return {"valid": False, "error": f"Answer must be no more than {question.validation_rules['max_length']} characters"}
            
            elif question.type == CreativityType.CHOICE:
                if not isinstance(answer, str):
                    return {"valid": False, "error": "Choice answer must be a string"}
                
                if question.options and answer not in question.options:
                    return {"valid": False, "error": f"Answer must be one of: {question.options}"}
            
            elif question.type == CreativityType.MULTIPLE_CHOICE:
                if not isinstance(answer, list):
                    return {"valid": False, "error": "Multiple choice answer must be a list"}
                
                if question.options:
                    invalid_options = [opt for opt in answer if opt not in question.options]
                    if invalid_options:
                        return {"valid": False, "error": f"Invalid options: {invalid_options}"}
            
            elif question.type == CreativityType.FILE_UPLOAD:
                if question.required and not answer:
                    return {"valid": False, "error": "File upload is required"}
                
                # Additional file validation would go here
            
            elif question.type == Creativity_type.SLIDER:
                if not isinstance(answer, (int, float)):
                    return {"valid": False, "error": "Slider answer must be a number"}
                
                if question.min_value is not None and answer < question.min_value:
                    return {"valid": False, f"Answer must be at least {question.min_value}"}
                
                if question.max_value is not None and answer > question.max_value:
                    return {"valid": False, f"Answer must be no more than {question.max_value}"}
            
            return {"valid": True, "error": None}
            
        except Exception as e:
            return {"valid": False, "error": f"Validation error: {str(e)}"}
    
    async def _generate_creative_output(self, question: GenesisQuestion, answer: Any) -> Optional[Any]:
        """Generate creative output based on question and answer"""
        try:
            if question.type == Creativity.TEXT:
                # Generate creative text response
                if question.id == 22:  # Creative improvement
                    return f"I'll help enhance your creative work by suggesting improvements like: {answer}"
                elif question.id == 26:  # Sustainability
                    return f"I'll help make your creative work more sustainable by suggesting: {answer}"
                elif question.id == 27:  # Accessibility
                    return f"I'll help make your creative work more accessible by: {answer}"
                elif question.id == 28:  # Innovation
                    return f"I'll help make your creative work more innovative by: {answer}"
                else:
                    return f"I understand and will remember your creative input: {answer}"
            
            elif question.type == Creativity.CHOICE:
                # Generate creative choice response
                if question.id == 2:  # Creative medium preference
                    return f"I'll support your {answer} preference with appropriate tools and features."
                elif question.id == 6:  # Tools preference
                    return f"I'll ensure {answer} tools are available and accessible."
                elif question.id == 7:  # Environment preference
                    return f"I'll adapt the environment to support your {answer} preference."
                else:
                    return f"I'll support your {answer} choice in our interactions."
            
            elif question.type == Creativity.MULTIPLE_CHOICE:
                # Generate multiple choice response
                selected_options = [opt for opt in answer if opt in (question.options or [])]
                if selected_options:
                    return f"I'll support your choices: {', '.join(selected_options)}."
                else:
                    return "I'll support your creative choices with appropriate tools."
            
            elif question.type == Creativity.FILE_UPLOAD:
                # Handle file upload
                if answer and question.file_types:
                    return f"I'll help you process your {answer} file using appropriate tools."
                else:
                    return "I'll help you with file upload when you're ready."
            
            elif question.type == Creativity.SLIDER:
                # Generate slider response
                if question.id == 6:  # Privacy importance
                    return f"I'll respect your privacy setting of {answer}."
                elif question.id == 16:  # Growth balance
                    return f"I'll balance challenge and support according to your {answer}."
                else:
                    return f"I'll adapt to your {answer} preference."
                else:
                    return f"I'll respect your {answer} setting."
            
            elif question.type == Creativity.DATE:
                # Handle date input
                if answer and question.required:
                    return f"I'll remember and respect your {answer} date preference."
                else:
                    return f"I'll respect your date preference when provided."
            
            else:
                # Default response
                return "I understand and will remember your creative input."
            
        except Exception as e:
            logger.error(f"Error generating creative output: {e}")
            return None

class GenesisFlow:
    """Enhanced genesis flow with 29 questions"""
    
    def __init__(self):
        self.engine = GenesisEngine()
        self.session_id = None
        self.user_id = None
        self.current_phase = GenesisPhase.EXPLORATION
        self.start_time = None
        self.completion_time = None
        
    async def start_genesis(self, user_id: str = None) -> Dict[str, Any]:
        """Start genesis flow"""
        try:
            self.session_id = f"genesis_{datetime.utcnow().timestamp()}"
            self.user_id = user_id or "default_user"
            self.start_time = datetime.utcnow()
            self.current_phase = GenesisPhase.EXPLORATION
            self.engine.current_index = 0
            self.engine.answers = {}
            self.engine.creative_outputs = []
            self.engine.insights = []
            self.user_preferences = {}
            
            logger.info(f"Genesis flow started for user {user_id}")
            
            return {
                "success": True,
                "session_id": self.session_id,
                "total_questions": len(self.engine.questions),
                "first_question": self.engine.get_current_question(),
                "phase": self.current_phase.value,
                "message": "Genesis flow started successfully"
            }
            
        except Exception as e:
            logger.error(f"Error starting genesis flow: {e}")
            raise HTTPException(status_code=500, detail="Failed to start genesis flow")

@router.post("/start")
async def start_genesis(request: Dict[str, Any]):
    """Start genesis flow"""
    try:
        return await start_genesis(request.get("user_id"))
    except Exception as e:
        logger.error(f"Error in start_genesis: {e}")
        raise HTTPException(status_code=500, detail="Failed to start genesis flow")

@router.get("/status")
async def get_genesis_status():
    """Get genesis status"""
    try:
        return {
            "success": True,
            "current_phase": convergence_engine.current_phase.value,
            "total_questions": len(convergence_engine.questions),
            "answered_questions": len(convergence_engine.answers),
            "completed": convergence_engine.current_index >= len(convergence_engine.questions),
            "progress": convergence_engine.get_progress()
        }
    except Exception as e:
        logger.error(f"Error getting genesis status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genesis status")

@router.get("/questions")
async def get_genesis_questions():
    """Get all genesis questions"""
    try:
        questions_data = []
        
        for question in convergence_engine.questions:
            question_data = {
                "id": question.id,
                "phase": question.phase.value,
                "text": question.text,
                "type": question.type.value,
                "prompt": question.prompt,
                "category": question.category.value,
                "required": question.required,
                "options": question.options,
                "min_length": question.min_length,
                "max_length": question.max_length,
                "file_types": question.file_types,
                "validation_rules": question.validation_rules,
                "weight": question.weight,
                "follow_up_questions": question.follow_up_questions
            }
            questions_data.append(question_data)
        
        return {
            "success": True,
            "questions": questions_data,
            "total_questions": len(questions_data),
            "phases": list(set(q.phase.value for q in questions_data),
            "categories": list(set(q.category.value for q in questions_data)
        }
        
    except Exception as e:
        logger.error(f"Error getting genesis questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genesis questions")

@router.post("/answer")
async def submit_genesis_answer(request: Dict[str, Any]):
    """Submit answer to genesis question"""
    try:
        return await submit_genesis_answer(request.question_id, request.answer)
    except Exception as e:
        logger.error(f"Error submitting genesis answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit genesis answer")

@router.post("/complete")
async def complete_genesis():
    """Complete genesis flow and generate summary"""
    try:
        summary = convergence_engine.get_genesis_summary()
        
        # Mark as completed
        convergence_engine.current_phase = GenesisPhase.MANIFESTATION
        convergence_engine.current_index = len(convergence_engine.questions)
        
        logger.info("Genesis flow completed successfully")
        
        return {
            "success": True,
            "summary": summary,
            "completed": True,
            "message": "Genesis flow completed successfully",
            "creative_outputs": convergence_engine.creative_outputs,
            "insights": convergence_engine.insights,
            "recommendations": self._generate_genesis_recommendations()
        }
        
    except Exception as e:
        logger.error(f"Error completing genesis: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete genesis")

@router.get("/summary")
async def get_genesis_summary():
    """Get comprehensive genesis summary"""
    try:
        return convergence_engine.get_genesis_summary()
    except Exception as e:
        logger.error(f"Error getting genesis summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get genesis summary")

def _generate_genesis_recommendations() -> List[str]:
    """Generate personalized recommendations based on genesis insights"""
    recommendations = []
        
        insights = convergence_engine.insights
        
        # Based on creative outputs
        if len(convergence_engine.creative_outputs) > 0:
            recommendations.append("Continue exploring creative possibilities with enhanced tools")
        
        # Based on insights
        if "creative_patterns" in insights:
            recommendations.append("Leverage creative patterns detected - consider automation")
        
        # Based on phase
        if convergence_engine.current_phase == GenesisPhase.REFINEMENT:
            recommendations.append("Consider exploring refinement and enhancement opportunities")
        elif convergence_engine.current_phase == GenesisPhase.MANIFESTATION:
            recommendations.append("Review and finalize creative outputs")
        
        return recommendations

def _generate_genesis_summary() -> Dict[str, Any]:
    """Generate comprehensive genesis summary"""
        metrics = convergence_engine.get_limbic_metrics()
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "phase": convergence_engine.current_phase.value,
            "total_questions": len(convergence_engine.questions),
            "answered_questions": len(convergence_engine.answers),
            "completed": convergence_engine.current_index >= len(convergence_engine.questions),
            "progress": convergence_engine.get_progress(),
            "creative_outputs": convergence_engine.creative_outputs,
            "insights": convergence_engine.insights,
            "recommendations": self._generate_genesis_recommendations(),
            "limbic_metrics": metrics,
            "user_profile": convergence_engine.user_profile,
            "convergence_strength": metrics["convergence_strength"],
            "readiness_score": metrics["readiness_score"]
        }

# Global genesis engine instance
genesis_engine = GenesisEngine()
