"""
Complete 29-Question Convergence Flow
Enhanced onboarding experience with comprehensive questions
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class QuestionType(Enum):
    TEXT = "text"
    CHOICE = "choice"
    MIRROR = "mirror"
    ELASTIC = "elastic"
    SLIDER = "slider"
    RANKING = "ranking"
    MULTIPLE_CHOICE = "multiple_choice"
    DATE = "date"
    FILE_UPLOAD = "file_upload"

class QuestionCategory(Enum):
    IDENTITY = "identity"
    MOTIVATION = "motivation"
    EXPERIENCE = "experience"
    RELATIONSHIP = "relationship"
    VALUES = "values"
    CREATIVITY = "creativity"
    COMMUNICATION = "communication"
    PRIVACY = "privacy"
    GROWTH = "growth"
    FUTURE = "future"
    REFLECTION = "reflection"
    EXPLORATION = "exploration"
    INTEGRATION = "integration"

@dataclass
class ConvergenceQuestion:
    id: int
    text: str
    type: QuestionType
    category: QuestionCategory
    required: bool
    options: Optional[List[str]] = None
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    step: Optional[int] = None
    file_types: Optional[List[str]] = None
    validation_rules: Optional[Dict[str, Any]] = None
    follow_up_questions: Optional[List[int]] = None
    weight: float = 1.0

class ConvergenceEngine:
    """Enhanced convergence engine with 29 questions"""
    
    def __init__(self):
        self.questions = self._generate_complete_questions()
        self.current_index = 0
        self.answers = {}
        self.convergence_state = {}
        self.user_profile = {}
        
    def _generate_complete_questions(self) -> List[ConvergenceQuestion]:
        """Generate all 29 convergence questions"""
        questions = []
        
        # Phase 1: Foundation (Questions 1-8)
        questions.extend([
            ConvergenceQuestion(
                id=1,
                text="What draws you to Sallie Studio today? What brought you here?",
                type=QuestionType.TEXT,
                category=QuestionCategory.MOTIVATION,
                required=True,
                weight=1.2
            ),
            ConvergenceQuestion(
                id=2,
                text="How do you prefer to receive and process information?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.COMMUNICATION,
                required=True,
                options=[
                    "Visual and intuitive - I learn best through seeing",
                    "Auditory and conversational - I learn best through hearing",
                    "Kinesthetic and experiential - I learn best through doing",
                    "Reading and analytical - I learn best through text",
                    "Mixed approach - I use multiple methods depending on context"
                ],
                weight=1.1
            ),
            ConvergenceQuestion(
                id=3,
                text="What's your comfort level with AI technology and digital companions?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.EXPERIENCE,
                required=True,
                options=[
                    "Expert - I work with AI daily and understand the technology deeply",
                    "Advanced - I'm comfortable with AI and use it regularly",
                    "Intermediate - I use AI occasionally and understand the basics",
                    "Beginner - I'm just starting to explore AI technology",
                    "Skeptical - I'm curious but cautious about AI"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=4,
                text="How do you express yourself creatively? What mediums or methods do you prefer?",
                type=QuestionType.TEXT,
                category=QuestionCategory.CREATIVITY,
                required=True,
                validation_rules={
                    "min_length": 50,
                    "max_length": 1000
                },
                weight=1.1
            ),
            ConvergenceQuestion(
                id=5,
                text="What kind of relationship do you envision with Sallie? What role should she play in your life?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.RELATIONSHIP,
                required=True,
                options=[
                    "Companion - Supportive, grounding, emotional connection",
                    "Co-Pilot - Collaborative, efficient, task-focused",
                    "Peer - Equal, conversational, mutual growth",
                    "Expert - Advisory, analytical, knowledge-focused",
                    "Mentor - Guiding, teaching, developmental",
                    "Friend - Casual, personal, social connection"
                ],
                weight=1.3
            ),
            ConvergenceQuestion(
                id=6,
                text="How important is privacy and data sovereignty to you?",
                type=QuestionType.SLIDER,
                category=QuestionCategory.PRIVACY,
                required=True,
                min_value=1,
                max_value=10,
                step=1,
                weight=1.2
            ),
            ConvergenceQuestion(
                id=7,
                text="What's your preferred pace of interaction and response time?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.COMMUNICATION,
                required=True,
                options=[
                    "Slow and thoughtful - I prefer deep consideration",
                    "Medium pace - Balanced speed and depth",
                    "Fast and efficient - Quick responses for productivity",
                    "Variable pace - Adapts to context and urgency",
                    "Instant - Real-time interaction preferred"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=8,
                text="How do you typically approach complex decisions or problems?",
                type=QuestionType.TEXT,
                category=QuestionCategory.IDENTITY,
                required=True,
                validation_rules={
                    "min_length": 100,
                    "max_length": 1500
                },
                weight=1.1
            )
        ])
        
        # Phase 2: Values & Ethics (Questions 9-16)
        questions.extend([
            ConvergenceQuestion(
                id=9,
                text="What values are most important to you in a digital relationship?",
                type=QuestionType.RANKING,
                category=QuestionCategory.VALUES,
                required=True,
                options=[
                    "Trust and reliability",
                    "Privacy and security",
                    "Transparency and honesty",
                    "Growth and learning",
                    "Efficiency and productivity",
                    "Creativity and innovation",
                    "Empathy and understanding",
                    "Autonomy and independence"
                ],
                weight=1.4
            ),
            ConvergenceQuestion(
                id=10,
                text="How do you feel about AI systems learning from your interactions?",
                type=QuestionType.SLIDER,
                category=QuestionCategory.PRIVACY,
                required=True,
                min_value=1,
                max_value=10,
                step=1,
                weight=1.2
            ),
            ConvergenceQuestion(
                id=11,
                text="What ethical boundaries should exist between you and Sallie?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.VALUES,
                required=True,
                options=[
                    "No access to personal sensitive information",
                    "No autonomous actions without explicit consent",
                    "No manipulation or influence on decisions",
                    "No access to financial or legal matters",
                    "No representation of me without permission",
                    "No storage of private conversations",
                    "No sharing data with third parties"
                ],
                weight=1.5
            ),
            ConvergenceQuestion(
                id=12,
                text="How should Sallie handle disagreements or conflicts with you?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.RELATIONSHIP,
                required=True,
                options=[
                    "Present multiple perspectives and let me decide",
                    "Acknowledge the disagreement and seek understanding",
                    "Pause and ask for clarification",
                    "Respectfully disagree with reasoning",
                    "Defer to my judgment",
                    "Seek common ground and compromise"
                ],
                weight=1.3
            ),
            ConvergenceQuestion(
                id=13,
                text="What level of emotional support do you want from Sallie?",
                type=QuestionType.SLIDER,
                category=QuestionCategory.RELATIONSHIP,
                required=True,
                min_value=1,
                max_value=10,
                step=1,
                weight=1.2
            ),
            ConvergenceQuestion(
                id=14,
                text="How should Sallie handle your emotional states or moods?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.RELATIONSHIP,
                required=True,
                options=[
                    "Detect and adapt to my emotional state",
                    "Provide appropriate emotional support",
                    "Maintain professional neutrality",
                    "Offer empathy when appropriate",
                    "Adjust communication style accordingly",
                    "Focus on task regardless of emotion"
                ],
                weight=1.1
            ),
            ConvergenceQuestion(
                id=15,
                text="What role should Sallie play in your personal growth and development?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.GROWTH,
                required=True,
                options=[
                    "Learning partner - Share knowledge and insights",
                    "Creative collaborator - Brainstorm and create together",
                    "Accountability coach - Help me stay on track",
                    "Reflection mirror - Help me understand myself",
                    "Skill developer - Teach me new capabilities",
                    "Wellness supporter - Support my mental health"
                ],
                weight=1.2
            ),
            ConvergenceQuestion(
                id=16,
                text="How should Sallie balance challenge vs. support in your growth?",
                type=QuestionType.SLIDER,
                category=QuestionCategory.GROWTH,
                required=True,
                min_value=1,
                max_value=10,
                step=1,
                weight=1.1
            )
        ])
        
        # Phase 3: Capabilities & Features (Questions 17-24)
        questions.extend([
            ConvergenceQuestion(
                id=17,
                text="Which of Sallie's capabilities excite you most?",
                type=QuestionType.RANKING,
                category=QuestionCategory.EXPLORATION,
                required=True,
                options=[
                    "Conversational intelligence and natural language",
                    "Creative ideation and brainstorming",
                    "Personalization and adaptation",
                    "Productivity and task management",
                    "Learning and knowledge synthesis",
                    "Privacy and security features",
                    "Emotional intelligence and empathy",
                    "Analytical and problem-solving skills"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=18,
                text="How should Sallie integrate with your existing tools and workflows?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.INTEGRATION,
                required=True,
                options=[
                    "Calendar and scheduling integration",
                    "Note-taking and document management",
                    "Communication and email integration",
                    "Project management tools",
                    "Creative software and applications",
                    "Learning platforms and resources",
                    "Health and wellness tracking",
                    "Financial management tools"
                ],
                weight=1.1
            ),
            ConvergenceQuestion(
                id=19,
                text="What voice interaction preferences do you have?",
                type=QuestionType.CHOICE,
                category=QuestionCategory.COMMUNICATION,
                required=True,
                options=[
                    "Voice-first - Prefer speaking over typing",
                    "Text-based - Prefer typing over speaking",
                    "Mixed approach - Use both depending on context",
                    "Visual-first - Prefer visual interfaces",
                    "Minimal interaction - Prefer essential communication only"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=20,
                text="How should Sallie handle notifications and alerts?",
                type=QuestionType.SLIDER,
                category=QuestionCategory.COMMUNICATION,
                required=True,
                min_value=1,
                max_value=10,
                step=1,
                weight=0.8
            ),
            ConvergenceQuestion(
                id=21,
                text="What file and document management capabilities do you need?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.INTEGRATION,
                required=True,
                options=[
                    "Document creation and editing",
                    "File organization and search",
                    "Version control and history",
                    "Collaboration and sharing",
                    "Format conversion and export",
                    "Backup and synchronization",
                    "Security and encryption",
                    "Template and automation"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=22,
                text="How should Sallie assist with creative projects?",
                type=QuestionType.TEXT,
                category=QuestionCategory.CREATIVITY,
                required=True,
                validation_rules={
                    "min_length": 100,
                    "max_length": 2000
                },
                weight=1.1
            ),
            ConvergenceQuestion(
                id=23,
                text="What analytical capabilities would be most valuable?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.IDENTITY,
                required=True,
                options=[
                    "Data analysis and visualization",
                    "Pattern recognition and insights",
                    "Predictive modeling and forecasting",
                    "Statistical analysis and reporting",
                    "Research and information synthesis",
                    "Decision support and recommendations",
                    "Risk assessment and mitigation",
                    "Performance optimization"
                ],
                weight=1.0
            ),
            ConvergenceQuestion(
                id=24,
                text="How should Sallie help with learning and skill development?",
                type=QuestionType.TEXT,
                category=QuestionCategory.GROWTH,
                required=True,
                validation_rules={
                    "min_length": 100,
                    "max_length": 2000
                },
                weight=1.1
            )
        ])
        
        # Phase 4: Future Vision (Questions 25-29)
        questions.extend([
            ConvergenceQuestion(
                id=25,
                text="How do you see your relationship with Sallie evolving over the next year?",
                type=QuestionType.TEXT,
                category=QuestionCategory.FUTURE,
                required=True,
                validation_rules={
                    "min_length": 150,
                    "max_length": 3000
                },
                weight=1.3
            ),
            ConvergenceQuestion(
                id=26,
                text="What long-term goals or aspirations do you have for this partnership?",
                type=QuestionType.TEXT,
                category=QuestionCategory.FUTURE,
                required=True,
                validation_rules={
                    "min_length": 100,
                    "max_length": 2000
                },
                weight=1.2
            ),
            ConvergenceQuestion(
                id=27,
                text="How should Sallie adapt and grow with you over time?",
                type=QuestionType.MULTIPLE_CHOICE,
                category=QuestionCategory.GROWTH,
                required=True,
                options=[
                    "Learn from our interactions and conversations",
                    "Adapt to my changing needs and preferences",
                    "Evolve capabilities based on usage patterns",
                    "Grow in understanding and empathy",
                    "Develop new skills and knowledge",
                    "Adjust communication style accordingly",
                    "Expand capabilities with my consent",
                    "Maintain core values and principles"
                ],
                weight=1.4
            ),
            ConvergenceQuestion(
                id=28,
                type=QuestionType.FILE_UPLOAD,
                text="Share a photo, document, or creative work that represents you",
                category=QuestionCategory.IDENTITY,
                required=False,
                file_types=["image", "document", "audio", "video"],
                validation_rules={
                    "max_file_size": 10485760,  # 10MB
                    "allowed_formats": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt", "mp3", "wav", "mp4", "mov"]
                },
                weight=1.0
            ),
            ConvergenceQuestion(
                id=29,
                type=QuestionType.MIRROR,
                text="Mirror Test: Based on our conversation, how would you describe your ideal relationship with Sallie?",
                category=QuestionCategory.REFLECTION,
                required=True,
                validation_rules={
                    "min_length": 200,
                    "max_length": 3000"
                },
                weight=2.0
            )
        ])
        
        return questions
    
    def get_current_question(self) -> Optional[ConvergenceQuestion]:
        """Get the current question"""
        if 0 <= self.current_index < len(self.questions):
            return self.questions[self.current_index]
        return None
    
    def get_progress(self) -> Dict[str, Any]:
        """Get current progress"""
        total_questions = len(self.questions)
        answered_questions = len(self.answers)
        progress_percentage = (answered_questions / total_questions) * 100
        
        return {
            "current_question": self.current_index + 1,
            "total_questions": total_questions,
            "answered_questions": answered_questions,
            "progress_percentage": progress_percentage,
            "completed": self.current_index >= total_questions
        }
    
    def submit_answer(self, question_id: int, answer: Any) -> Dict[str, Any]:
        """Submit an answer to a question"""
        if question_id not in [q.id for q in self.questions]:
            raise ValueError(f"Invalid question ID: {question_id}")
        
        question = next(q for q in self.questions if q.id == question_id)
        
        # Validate answer
        validation_result = self._validate_answer(question, answer)
        if not validation_result["valid"]:
            return {
                "success": False,
                "error": validation_result["error"],
                "question_id": question_id
            }
        
        # Store answer
        self.answers[question_id] = {
            "value": answer,
            "timestamp": datetime.utcnow().isoformat(),
            "question_type": question.type.value,
            "category": question.category.value
        }
        
        # Update convergence state
        self._update_convergence_state()
        
        # Move to next question
        if self.current_index < len(self.questions) - 1:
            self.current_index += 1
            return {
                "success": True,
                "next_question": self.get_current_question(),
                "progress": self.get_progress()
            }
        else:
            return {
                "success": True,
                "completed": True,
                "progress": self.get_progress()
            }
    
    def _validate_answer(self, question: ConvergenceQuestion, answer: Any) -> Dict[str, Any]:
        """Validate answer according to question type and rules"""
        try:
            if question.type == QuestionType.TEXT:
                if not isinstance(answer, str):
                    return {"valid": False, "error": "Text answer must be a string"}
                
                if question.validation_rules:
                    if "min_length" in question.validation_rules and len(answer) < question.validation_rules["min_length"]:
                        return {"valid": False, "error": f"Answer must be at least {question.validation_rules['min_length']} characters"}
                    
                    if "max_length" in question.validation_rules and len(answer) > question.validation_rules["max_length"]:
                        return {"valid": False, "error": f"Answer must be no more than {question.validation_rules['max_length']} characters"}
            
            elif question.type == QuestionType.CHOICE:
                if not isinstance(answer, str):
                    return {"valid": False, "error": "Choice answer must be a string"}
                
                if question.options and answer not in question.options:
                    return {"valid": False, "error": f"Answer must be one of: {question.options}"}
            
            elif question.type == QuestionType.MULTIPLE_CHOICE:
                if not isinstance(answer, list):
                    return {"valid": False, "error": "Multiple choice answer must be a list"}
                
                if question.options:
                    invalid_options = [opt for opt in answer if opt not in question.options]
                    if invalid_options:
                        return {"valid": False, "error": f"Invalid options: {invalid_options}"}
            
            elif question.type == QuestionType.SLIDER:
                if not isinstance(answer, (int, float)):
                    return {"valid": False, "error": "Slider answer must be a number"}
                
                if question.min_value is not None and answer < question.min_value:
                    return {"valid": False, error": f"Answer must be at least {question.min_value}"}
                
                if question.max_value is not None and answer > question.max_value:
                    return {"valid": False, error": f"Answer must be no more than {question.max_value}"}
            
            elif question.type == QuestionType.RANKING:
                if not isinstance(answer, list):
                    return {"valid": False, "error": "Ranking answer must be a list"}
                
                if question.options:
                    invalid_items = [item for item in answer if item not in question.options]
                    if invalid_items:
                        return {"valid": False, error": f"Invalid ranking items: {invalid_items}"}
            
            elif question.type == QuestionType.FILE_UPLOAD:
                if question.required and not answer:
                    return {"valid": False, "error": "File upload is required"}
                
                # Additional file validation would go here
            
            elif question.type == QuestionType.MIRROR:
                if not isinstance(answer, str):
                    return {"valid": False, "error": "Mirror answer must be a string"}
                
                if question.validation_rules:
                    if "min_length" in question.validation_rules and len(answer) < question.validation_rules["min_length"]:
                        return {"valid": False, error": f"Answer must be at least {question.validation_rules['min_length']} characters"}
                    
                    if "max_length" in question.validation_rules and len(answer) > question.validation_rules["max_length"]:
                        return {"valid": False, error": f"Answer must be no more than {question.validation_rules['max_length']} characters"}
            
            return {"valid": True, "error": None}
            
        except Exception as e:
            return {"valid": False, "error": f"Validation error: {str(e)}"}
    
    def _update_convergence_state(self):
        """Update convergence state based on answers"""
        # Analyze answers to build user profile
        self.user_profile = self._analyze_user_profile()
        self.convergence_state = self._calculate_convergence_metrics()
    
    def _analyze_user_profile(self) -> Dict[str, Any]:
        """Analyze user answers to build profile"""
        profile = {
            "personality_traits": [],
            "preferences": {},
            "capabilities": [],
            "relationship_style": "",
            "privacy_level": 0,
            "growth_orientation": "",
            "communication_style": "",
            "creativity_level": 0,
            "technical_sophistication": 0
        }
        
        # Analyze answers by category
        for question_id, answer_data in self.answers.items():
            question = next(q for q in self.questions if q.id == question_id)
            
            if question.category == QuestionCategory.RELATIONSHIP:
                if question.id == 5:  # Relationship type
                    profile["relationship_style"] = answer_data["value"]
                elif question.id == 13:  # Emotional support
                    profile["preferences"]["emotional_support"] = answer_data["value"]
                elif question.id == 14:  # Emotional handling
                    profile["preferences"]["emotional_handling"] = answer_data["value"]
            
            elif question.category == QuestionCategory.VALUES:
                if question.id == 6:  # Privacy importance
                    profile["privacy_level"] = answer_data["value"]
                elif question.id == 9:  # Values ranking
                    profile["personality_traits"] = answer_data["value"]
                elif question.id == 11:  # Ethical boundaries
                    profile["preferences"]["ethical_boundaries"] = answer_data["value"]
            
            elif question.category == QuestionCategory.EXPERIENCE:
                if question.id == 3:  # AI comfort level
                    profile["technical_sophistication"] = self._map_comfort_level(answer_data["value"])
            
            elif question.category == QuestionCategory.CREATIVITY:
                if question.id == 4:  # Creative expression
                    profile["creativity_level"] = self._assess_creativity_level(answer_data["value"])
                elif question.id == 22:  # Creative assistance
                    profile["capabilities"].extend(["creative_assistance"])
            
            elif question.category == QuestionCategory.COMMUNICATION:
                if question.id == 2:  # Information processing
                    profile["communication_style"] = answer_data["value"]
                elif question.id == 7:  # Interaction pace
                    profile["preferences"]["interaction_pace"] = answer_data["value"]
                elif question.id == 19:  # Voice preferences
                    profile["preferences"]["voice_interaction"] = answer_data["value"]
            
            elif question.category == QuestionCategory.GROWTH:
                if question.id == 15:  # Growth role
                    profile["preferences"]["growth_role"] = answer_data["value"]
                elif question.id == 16:  # Challenge/support balance
                    profile["preferences"]["growth_balance"] = answer_data["value"]
                elif question.id == 24:  # Learning assistance
                    profile["capabilities"].extend(["learning_assistance"])
        
        return profile
    
    def _map_comfort_level(self, comfort_level: str) -> int:
        """Map comfort level to numeric sophistication score"""
        mapping = {
            "Expert": 5,
            "Advanced": 4,
            "Intermediate": 3,
            "Beginner": 2,
            "Skeptical": 1
        }
        return mapping.get(comfort_level, 3)
    
    def _assess_creativity_level(self, creativity_text: str) -> int:
        """Assess creativity level from text description"""
        creativity_indicators = [
            "artistic", "creative", "design", "music", "writing", "painting",
            "innovation", "imagination", "expression", "craft", "build", "make"
        ]
        
        text_lower = creativity_text.lower()
        indicator_count = sum(1 for indicator in creativity_indicators if indicator in text_lower)
        
        if indicator_count >= 5:
            return 5
        elif indicator_count >= 3:
            return 4
        elif indicator_count >= 1:
            return 3
        else:
            return 2
    
    def _calculate_convergence_metrics(self) -> Dict[str, Any]:
        """Calculate convergence metrics"""
        total_weight = sum(q.weight for q in self.questions)
        answered_weight = sum(
            self.questions[q.id - 1].weight 
            for q in self.answers.keys()
            if 1 <= q.id <= len(self.questions)
        )
        
        completion_rate = answered_weight / total_weight if total_weight > 0 else 0
        
        # Calculate alignment scores
        alignment_scores = {
            "identity_alignment": self._calculate_identity_alignment(),
            "values_alignment": self._calculate_values_alignment(),
            "relationship_alignment": self._calculate_relationship_alignment(),
            "growth_alignment": self._calculate_growth_alignment()
        }
        
        overall_alignment = sum(alignment_scores.values()) / len(alignment_scores)
        
        return {
            "completion_rate": completion_rate,
            "overall_alignment": overall_alignment,
            "alignment_scores": alignment_scores,
            "convergence_strength": self._assess_convergence_strength(),
            "readiness_score": self._calculate_readiness_score()
        }
    
    def _calculate_identity_alignment(self) -> float:
        """Calculate identity alignment score"""
        # Based on identity-related questions
        identity_questions = [1, 3, 4, 8, 23]
        identity_weight = 0
        
        for q_id in identity_questions:
            if q_id in self.answers:
                question = next(q for q in self.questions if q.id == q_id)
                identity_weight += question.weight
        
        total_identity_weight = sum(q.weight for q in self.questions if q.category == QuestionCategory.IDENTITY)
        
        return identity_weight / total_identity_weight if total_identity_weight > 0 else 0
    
    def _calculate_values_alignment(self) -> float:
        """Calculate values alignment score"""
        # Based on values-related questions
        values_questions = [6, 9, 10, 11]
        values_weight = 0
        
        for q_id in values_questions:
            if q_id in self.answers:
                question = next(q for q in self.questions if q.id == q_id)
                values_weight += question.weight
        
        total_values_weight = sum(q.weight for q in self.questions if q.category == QuestionCategory.VALUES)
        
        return values_weight / total_values_weight if total_values_weight > 0 else 0
    
    def _calculate_relationship_alignment(self) -> float:
        """Calculate relationship alignment score"""
        # Based on relationship-related questions
        relationship_questions = [5, 12, 13, 14]
        relationship_weight = 0
        
        for q_id in relationship_questions:
            if q_id in self.answers:
                question = next(q for q in self.questions if q.id == q_id)
                relationship_weight += question.weight
        
        total_relationship_weight = sum(q.weight for q in self.questions if q.category == QuestionCategory.RELATIONSHIP)
        
        return relationship_weight / total_relationship_weight if total_relationship_weight > 0 else 0
    
    def _calculate_growth_alignment(self) -> float:
        """Calculate growth alignment score"""
        # Based on growth-related questions
        growth_questions = [15, 16, 24, 25, 26, 27]
        growth_weight = 0
        
        for q_id in growth_questions:
            if q_id in self.answers:
                question = next(q for q in q.questions if q.id == q_id)
                growth_weight += question.weight
        
        total_growth_weight = sum(q.weight for q in self.questions if q.category == QuestionCategory.GROWTH)
        
        return growth_weight / total_growth_weight if total_growth_weight > 0 else 0
    
    def _assess_convergence_strength(self) -> float:
        """Assess overall convergence strength"""
        metrics = self._calculate_convergence_metrics()
        
        # Weighted combination of completion and alignment
        strength = (metrics["completion_rate"] * 0.4 + 
                     metrics["overall_alignment"] * 0.6)
        
        return strength
    
    def _calculate_readiness_score(self) -> float:
        """Calculate readiness score for partnership"""
        metrics = self._calculate_convergence_metrics()
        
        # Consider completion rate, alignment, and question depth
        depth_factor = len(self.answers) / len(self.questions)
        
        readiness = (metrics["completion_rate"] * 0.3 + 
                    metrics["overall_alignment"] * 0.5 +
                    depth_factor * 0.2)
        
        return readiness
    
    def get_convergence_summary(self) -> Dict[str, Any]:
        """Get comprehensive convergence summary"""
        metrics = self._calculate_convergence_metrics()
        
        return {
            "progress": self.get_progress(),
            "metrics": metrics,
            "user_profile": self.user_profile,
            "convergence_state": self.convergence_state,
            "recommendations": self._generate_recommendations(),
            "next_steps": self._get_next_steps()
        }
    
    def _generate_recommendations(self) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        profile = self.user_profile
        
        # Privacy recommendations
        if profile.get("privacy_level", 0) < 7:
            recommendations.append("Consider reviewing privacy settings for enhanced data protection")
        
        # Growth recommendations
        if profile.get("preferences", {}).get("growth_balance", 5) < 5:
            recommendations.append("Balance challenge and support for optimal growth")
        
        # Communication recommendations
        if profile.get("communication_style") == "Minimal interaction":
            recommendations.append("Consider expanding communication methods for richer interaction")
        
        # Creativity recommendations
        if profile.get("creativity_level", 0) < 3:
            recommendations.append("Explore creative tools and features to enhance expression")
        
        return recommendations
    
    def _get_next_steps(self) -> List[str]:
        """Get next steps after convergence"""
        steps = [
            "Review your convergence profile and settings",
            "Explore the Feature Dashboard to discover capabilities",
            "Customize your theme and preferences",
            "Begin using Sallie in your preferred interaction style",
            "Set up integrations with your existing tools",
            "Establish your preferred communication patterns"
        ]
        
        # Add specific steps based on user profile
        profile = self.user_profile
        
        if profile.get("preferences", {}).get("voice_interaction") == "Voice-first":
            steps.insert(3, "Set up voice recognition and configure voice commands")
        
        if profile.get("capabilities", []):
            if "creative_assistance" in profile["capabilities"]:
                steps.insert(4, "Explore creative tools and start a collaborative project")
            if "learning_assistance" in profile["capabilities"]:
                steps.insert(4, "Set up learning goals and begin skill development")
        
        return steps

# Global convergence engine instance
convergence_engine = ConvergenceEngine()
