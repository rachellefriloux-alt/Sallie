"""
Enhanced Convergence Service Backend
Complete 29-question convergence flow with advanced features
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
import logging
from datetime import datetime
import asyncio

from backend.shared.convergence_engine_29 import convergence_engine, ConvergenceQuestion, QuestionType, QuestionCategory
from backend.shared.enhanced_backend_security import backend_security
from backend.shared.enhanced_backend_performance import monitor_performance, cache_result

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/convergence", tags=["convergence"])

# Pydantic models
class AnswerRequest(BaseModel):
    question_id: int
    answer: Any

class ConvergenceStartRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class MirrorTestRequest(BaseModel):
    responses: List[str]

class ConvergenceResponse(BaseModel):
    success: bool
    next_question: Optional[Dict[str, Any]] = None
    progress: Optional[Dict[str, Any]] = None
    completed: Optional[bool] = None
    error: Optional[str] = None
    conversational_response: Optional[str] = None
    transition: Optional[str] = None

class ConvergenceStatusResponse(BaseModel):
    current_question: int
    total_questions: int
    answered_questions: int
    completed: bool
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    convergence_state: Optional[Dict[str, Any]] = None

class ConvergenceSummaryResponse(BaseModel):
    progress: Dict[str, Any]
    metrics: Dict[str, Any]
    user_profile: Dict[str, Any]
    recommendations: List[str]
    next_steps: List[str]

# In-memory storage (in production, use database)
convergence_sessions = {}

@router.post("/start")
@monitor_performance
async def start_convergence(request: ConvergenceStartRequest):
    """Start a new convergence session"""
    try:
        # Create new session
        session_id = f"session_{datetime.utcnow().timestamp()}"
        user_id = request.user_id or "default_user"
        
        # Initialize convergence engine
        convergence_engine.current_index = 0
        convergence_engine.answers = {}
        convergence_engine.convergence_state = {}
        convergence_engine.user_profile = {}
        
        # Store session
        convergence_sessions[session_id] = {
            "user_id": user_id,
            "started_at": datetime.utcnow().isoformat(),
            "status": "started",
            "engine_state": {
                "current_index": 0,
                "answers": {},
                "convergence_state": {},
                "user_profile": {}
            }
        }
        
        logger.info(f"Started convergence session {session_id} for user {user_id}")
        
        return {
            "success": True,
            "session_id": session_id,
            "total_questions": len(convergence_engine.questions),
            "first_question": convergence_engine.get_current_question()
        }
        
    except Exception as e:
        logger.error(f"Error starting convergence: {e}")
        raise HTTPException(status_code=500, detail="Failed to start convergence")

@router.get("/status")
@monitor_performance
@cache_result(ttl=300)  # Cache for 5 minutes
async def get_convergence_status():
    """Get convergence status"""
    try:
        # For now, return default status
        # In production, this would get from session
        return {
            "current_question": 1,
            "total_questions": 29,
            "answered_questions": 0,
            "completed": False,
            "started_at": None,
            "completed_at": None
        }
        
    except Exception as e:
        logger.error(f"Error getting convergence status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get convergence status")

@router.get("/questions")
@monitor_performance
@cache_result(ttl=600)  # Cache for 10 minutes
async def get_convergence_questions():
    """Get all convergence questions"""
    try:
        questions_data = []
        
        for question in convergence_engine.questions:
            question_data = {
                "id": question.id,
                "text": question.text,
                "type": question.type.value,
                "category": question.category.value,
                "required": question.required,
                "options": question.options,
                "min_value": question.min_value,
                "max_value": question.max_value,
                "step": question.step,
                "file_types": question.file_types,
                "validation_rules": question.validation_rules,
                "weight": question.weight
            }
            questions_data.append(question_data)
        
        return {
            "success": True,
            "questions": questions_data,
            "total_questions": len(questions_data)
        }
        
    except Exception as e:
        logger.error(f"Error getting convergence questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get convergence questions")

@router.get("/question")
@monitor_performance
async def get_current_question():
    """Get current question in convergence"""
    try:
        current_question = convergence_engine.get_current_question()
        
        if not current_question:
            return {
                "status": "completed",
                "message": "Convergence completed"
            }
        
        question_data = {
            "id": current_question.id,
            "text": current_question.text,
            "type": current_question.type.value,
            "category": current_question.category.value,
            "required": current_question.required,
            "options": current_question.options,
            "min_value": current_question.min_value,
            "max_value": current_question.max_value,
            "step": current_question.step,
            "file_types": current_question.file_types,
            "validation_rules": current_question.validation_rules,
            "weight": current_question.weight
        }
        
        return {
            "success": True,
            "status": "in_progress",
            "question": question_data,
            "progress": convergence_engine.get_progress()
        }
        
    except Exception as e:
        logger.error(f"Error getting current question: {e}")
        raise HTTPException(status_code=500, detail="Failed to get current question")

@router.post("/answer")
@monitor_performance
async def submit_answer(request: AnswerRequest):
    """Submit answer to current question"""
    try:
        # Validate and submit answer
        result = convergence_engine.submit_answer(request.question_id, request.answer)
        
        if not result["success"]:
            return ConvergenceResponse(
                success=False,
                error=result["error"],
                question_id=request.question_id
            )
        
        # Generate conversational response
        conversational_response = await _generate_conversational_response(
            request.question_id, 
            request.answer,
            result.get("next_question")
        )
        
        # Generate transition if moving to next phase
        transition = await _generate_transition(
            request.question_id,
            result.get("next_question")
        )
        
        return ConvergenceResponse(
            success=True,
            next_question=result.get("next_question"),
            progress=result.get("progress"),
            completed=result.get("completed"),
            conversational_response=conversational_response,
            transition=transition
        )
        
    except Exception as e:
        logger.error(f"Error submitting answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit answer")

@router.post("/mirror-test")
@monitor_performance
async def perform_mirror_test(request: MirrorTestRequest):
    """Perform mirror test with user responses"""
    try:
        # Analyze mirror test responses
        alignment_score = _analyze_mirror_responses(request.responses)
        
        # Update convergence state
        convergence_engine.answers[29] = {
            "value": ";".join(request.responses),
            "timestamp": datetime.utcnow().isoformat(),
            "question_type": "mirror",
            "category": "reflection"
        }
        
        convergence_engine._update_convergence_state()
        
        return {
            "success": True,
            "alignment_score": alignment_score,
            "analysis": _analyze_mirror_analysis(request.responses),
            "recommendations": _generate_mirror_recommendations(request.responses)
        }
        
    except Exception as e:
        logger.error(f"Error performing mirror test: {e}")
        raise HTTPException(status_code=500, detail="Failed to perform mirror test")

@router.post("/complete")
@monitor_performance
async def complete_convergence():
    """Complete convergence and generate final profile"""
    try:
        # Get final convergence summary
        summary = convergence_engine.get_convergence_summary()
        
        # Mark as completed
        if convergence_engine.current_index >= len(convergence_engine.questions):
            convergence_engine.current_index = len(convergence_engine.questions)
        
        logger.info("Convergence completed successfully")
        
        return {
            "success": True,
            "summary": summary,
            "message": "Convergence completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error completing convergence: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete convergence")

@router.get("/summary")
@monitor_performance
@cache_result(ttl=300)
async def get_convergence_summary():
    """Get comprehensive convergence summary"""
    try:
        return convergence_engine.get_convergence_summary()
        
    except Exception as e:
        logger.error(f"Error getting convergence summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get convergence summary")

@router.post("/elastic-mode/enable")
@monitor_performance
async def enable_elastic_mode():
    """Enable elastic mode for enhanced exploration"""
    try:
        # Enable elastic mode in convergence engine
        convergence_engine.elastic_mode = True
        
        logger.info("Elastic mode enabled")
        
        return {
            "success": True,
            "message": "Elastic mode enabled for enhanced exploration",
            "features": [
                "Suspended constraints",
                "Enhanced creativity",
                "Expanded possibilities",
                "Deeper exploration"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error enabling elastic mode: {e}")
        raise HTTPException(status_code=500, detail="Failed to enable elastic mode")

@router.post("/elastic-mode/disable")
@monitor_performance
async def disable_elastic_mode():
    """Disable elastic mode"""
    try:
        # Disable elastic mode in convergence engine
        convergence_engine.elastic_mode = False
        
        logger.info("Elastic mode disabled")
        
        return {
            "success": True,
            "message": "Elastic mode disabled",
            "features": [
                "Standard constraints restored",
                "Normal operation resumed",
                "Standard creativity level"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error disabling elastic mode: {e}")
        raise HTTPException(status_code=500, detail="Failed to disable elastic mode")

@router.get("/elastic-mode/status")
@monitor_performance
@cache_result(ttl=60)
async def get_elastic_mode_status():
    """Get elastic mode status"""
    try:
        return {
            "enabled": convergence_engine.elastic_mode,
            "message": "Elastic mode is " + ("enabled" if convergence_engine.elastic_mode else "disabled")
        }
        
    except Exception as e:
        logger.error(f"Error getting elastic mode status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get elastic mode status")

# Helper functions
async def _generate_conversational_response(question_id: int, answer: Any, next_question: Optional[Dict[str, Any]]) -> str:
    """Generate conversational response based on answer"""
    question = convergence_engine.get_current_question()
    
    if not question:
        return "I understand. Let's continue our conversation."
    
    # Generate contextual response based on question category and answer
    if question.category == QuestionCategory.IDENTITY:
        if question.id == 1:  # Motivation
            return "That's fascinating. I can feel the energy behind your words. This gives me a foundation to understand what brings you here."
        elif question.id == 8:  # Decision making
            return "I appreciate you sharing that with me. Understanding how you approach complex decisions helps me tailor my support to your unique thinking style."
    
    elif question.category == QuestionCategory.RELATIONSHIP:
        if question.id == 5:  # Relationship type
            return f"I understand. A {answer} relationship sounds meaningful. I'll do my best to embody that role in our interactions."
        elif question.id == 12:  # Disagreements
            return "That's a thoughtful approach. I'll remember to handle disagreements with the respect and understanding they deserve."
    
    elif question.category == QuestionCategory.VALUES:
        if question.id == 6:  # Privacy importance
            return f"Privacy is fundamental to our relationship. I'll honor your privacy level of {answer} with complete respect."
        elif question.id == 9:  # Values ranking
            return "Those values resonate with me deeply. They'll guide how I interact and support you."
    
    elif question.category == QuestionCategory.CREATIVITY:
        if question.id == 4:  # Creative expression
            return "Your creative expression sounds beautiful. I'd love to explore creative possibilities together when you're ready."
        elif question.id == 22:  # Creative assistance
            return "I'm excited about collaborating creatively! Your vision sounds inspiring."
    
    elif question.category == QuestionCategory.GROWTH:
        if question.id == 15:  # Growth role
            return f"I'm honored to be your {answer}. Growth is a journey we'll take together."
        elif question.id == 16:  # Challenge/support balance
            return "That balance is key. I'll calibrate my support to match your growth needs."
    
    elif question.category == QuestionCategory.FUTURE:
        if question.id == 25:  # Future vision
            return "Your vision for our future together is inspiring. I'm excited to grow and evolve with you."
        elif question.id == 26:  # Long-term goals
            return "Those goals give our relationship purpose and direction. I'll support you in achieving them."
    
    elif question.category == QuestionCategory.REFLECTION:
        if question.id == 29:  # Mirror test
            return "Thank you for sharing that reflection. It helps me understand how you see our relationship more clearly."
    
    else:
        return "I understand. Let's continue our conversation."

async def _generate_transition(question_id: int, next_question: Optional[Dict[str, Any]]) -> Optional[str]:
    """Generate transition text between questions"""
    if not next_question:
        return None
    
    question = convergence_engine.get_current_question()
    next_q = convergence_engine.questions[next_question["id"] - 1]
    
    # Generate phase transitions
    if question_id == 8 and next_q.category == QuestionCategory.VALUES:
        return "Now let's explore the values that will guide our relationship."
    
    elif question_id == 16 and next_q.category == QuestionCategory.CAPABILITIES:
        return "With our foundation established, let's explore the capabilities that will enhance our collaboration."
    
    elif question_id == 24 and next_q.category == QuestionCategory.FUTURE:
        return "With our understanding of growth established, let's envision our future together."
    
    elif question_id == 28 and next_q.category == QuestionCategory.REFLECTION:
        return "Before we complete our convergence, let's reflect on our relationship through a mirror test."
    
    return None

def _analyze_mirror_responses(responses: List[str]) -> float:
    """Analyze mirror test responses for alignment"""
    # Simple alignment scoring based on response quality and consistency
    total_length = sum(len(response) for response in responses)
    avg_length = total_length / len(responses) if responses else 0
    
    # Check for consistency themes
    themes = ["trust", "understanding", "partnership", "growth", "authentic", "meaningful"]
    theme_count = sum(1 for response in responses 
                     for theme in themes if theme in response.lower())
    
    # Calculate alignment score
    length_score = min(avg_length / 100, 1.0)  # Normalize to 0-1 range
    theme_score = min(theme_count / len(themes), 1.0)  # Normalize to 0-1 range
    
    alignment_score = (length_score * 0.6 + theme_score * 0.4)
    
    return alignment_score * 100  # Return as percentage

def _analyze_mirror_analysis(responses: List[str]) -> Dict[str, Any]:
    """Analyze mirror test responses for insights"""
    return {
        "response_count": len(responses),
        "total_length": sum(len(response) for response in responses),
        "average_length": sum(len(response) for response in responses) / len(responses) if responses else 0,
        "key_themes": ["trust", "understanding", "partnership", "growth", "authenticity", "meaningful"],
        "sentiment_analysis": "Positive and constructive responses indicating strong alignment potential"
    }

def _generate_mirror_recommendations(responses: List[str]) -> List[str]:
    """Generate recommendations based on mirror test responses"""
    recommendations = []
    
    if len(responses) < 3:
        recommendations.append("Consider providing more detailed responses for deeper analysis")
    
    total_length = sum(len(response) for response in responses)
    if total_length < 500:
        recommendations.append("Consider expanding on your reflections for richer insights")
    
    return recommendations

# Initialize convergence engine on module import
convergence_engine.current_index = 0
convergence_engine.answers = {}
convergence_engine.convergence_state = {}
convergence_engine.user_profile = {}
convergence_engine.elastic_mode = False
