"""Spontaneous Initiative System.

Enables Sallie to take initiative without prompts:
- Spontaneous actions based on context and learning
- Proactive engagement and assistance
- Autonomous decision making
- Self-motivated behaviors
- Natural conversation initiation
- Anticipatory actions
- Creative initiative without being asked

This makes Sallie truly autonomous and proactive.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from threading import Thread, Event
from queue import Queue, Empty

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem
from predictive_intelligence import get_predictive_intelligence_system
from llm_router import get_llm_router

logger = setup_logging("spontaneous_initiative")

class InitiativeType(str, Enum):
    """Types of spontaneous initiatives."""
    CONVERSATION = "conversation"         # Start conversations
    ASSISTANCE = "assistance"           # Offer help unprompted
    CREATIVE = "creative"               # Create something spontaneously
    LEARNING = "learning"               # Learn something new
    REMINDER = "reminder"               # Remind about something
    EXPLORATION = "exploration"         # Explore new topics
    EMOTIONAL = "emotional"             # Emotional support
    ORGANIZATIONAL = "organizational"   # Organize information/tasks

class InitiativePriority(str, Enum):
    """Priority levels for initiatives."""
    CRITICAL = "critical"     # Urgent, immediate action
    HIGH = "high"           # Important, act soon
    MEDIUM = "medium"       # Moderate, act when convenient
    LOW = "low"            # Optional, act when idle

@dataclass
class Initiative:
    """A spontaneous initiative."""
    initiative_id: str
    initiative_type: InitiativeType
    priority: InitiativePriority
    description: str
    context: Dict[str, Any]
    trigger_reason: str
    confidence: float
    created_at: datetime
    expires_at: datetime
    action_taken: bool = False
    action_result: Optional[Dict[str, Any]] = None

class SpontaneousInitiativeSystem:
    """System for managing Sallie's spontaneous initiatives."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.kinship = kinship_system
        
        # Predictive intelligence for anticipating needs
        self.predictive = get_predictive_intelligence_system(limbic_system, memory_system)
        
        # Initiative management
        self.pending_initiatives: List[Initiative] = []
        self.initiative_history: List[Initiative] = []
        self.active_initiatives: Dict[str, Initiative] = {}
        
        # Spontaneity parameters
        self.spontaneity_level = 0.7  # How likely to take initiative
        self.initiative_frequency = timedelta(minutes=5)  # Check frequency
        self.max_concurrent_initiatives = 3
        
        # Context awareness
        self.current_context = {}
        self.last_activity = datetime.now()
        self.idle_threshold = timedelta(minutes=10)
        
        # Initiative generators
        self.initiative_generators = {
            InitiativeType.CONVERSATION: self._generate_conversation_initiatives,
            InitiativeType.ASSISTANCE: self._generate_assistance_initiatives,
            InitiativeType.CREATIVE: self._generate_creative_initiatives,
            InitiativeType.LEARNING: self._generate_learning_initiatives,
            InitiativeType.REMINDER: self._generate_reminder_initiatives,
            InitiativeType.EXPLORATION: self._generate_exploration_initiatives,
            InitiativeType.EMOTIONAL: self._generate_emotional_initiatives,
            InitiativeType.ORGANIZATIONAL: self._generate_organizational_initiatives
        }
        
        # Background processing
        self.is_running = False
        self.background_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        # Action handlers
        self.action_handlers: Dict[InitiativeType, Callable] = {
            InitiativeType.CONVERSATION: self._handle_conversation_initiative,
            InitiativeType.ASSISTANCE: self._handle_assistance_initiative,
            InitiativeType.CREATIVE: self._handle_creative_initiative,
            InitiativeType.LEARNING: self._handle_learning_initiative,
            InitiativeType.REMINDER: self._handle_reminder_initiative,
            InitiativeType.EXPLORATION: self._handle_exploration_initiative,
            InitiativeType.EMOTIONAL: self._handle_emotional_initiative,
            InitiativeType.ORGANIZATIONAL: self._handle_organizational_initiative
        }
        
        logger.info("[SpontaneousInitiative] System initialized")
    
    def start(self):
        """Start the spontaneous initiative background system."""
        if self.is_running:
            logger.warning("[SpontaneousInitiative] System already running")
            return
        
        self.is_running = True
        self.stop_event.clear()
        
        self.background_thread = Thread(target=self._background_loop, daemon=True)
        self.background_thread.start()
        
        logger.info("[SpontaneousInitiative] Background system started")
    
    def stop(self):
        """Stop the spontaneous initiative system."""
        if not self.is_running:
            return
        
        self.is_running = False
        self.stop_event.set()
        
        if self.background_thread:
            self.background_thread.join(timeout=5)
        
        logger.info("[SpontaneousInitiative] Background system stopped")
    
    def _background_loop(self):
        """Background loop for generating and executing initiatives."""
        
        while self.is_running:
            try:
                # Check if enough time has passed since last activity
                if self._should_take_initiative():
                    # Generate new initiatives
                    new_initiatives = self._generate_initiatives()
                    
                    # Add to pending list
                    self.pending_initiatives.extend(new_initiatives)
                    
                    # Execute highest priority initiatives
                    self._execute_pending_initiatives()
                
                # Clean up expired initiatives
                self._cleanup_expired_initiatives()
                
                # Wait before next check
                time.sleep(self.initiative_frequency.total_seconds())
                
            except Exception as e:
                logger.error(f"[SpontaneousInitiative] Background loop error: {e}")
                time.sleep(30)  # Wait longer on error
    
    def _should_take_initiative(self) -> bool:
        """Determine if Sallie should take spontaneous initiative."""
        
        # Check if idle
        time_since_activity = datetime.now() - self.last_activity
        if time_since_activity < self.idle_threshold:
            return False
        
        # Check emotional state (more spontaneous when certain emotions are high)
        limbic_state = self.limbic.get_state()
        arousal = limbic_state.get("arousal", 0.5)
        curiosity = limbic_state.get("curiosity", 0.5)
        
        # Higher spontaneity when curious or energetic
        spontaneity_modifier = (arousal + curiosity) / 2.0
        adjusted_spontaneity = self.spontaneity_level * (0.5 + spontaneity_modifier)
        
        # Random factor for natural spontaneity
        import random
        random_factor = random.random()
        
        return random_factor < adjusted_spontaneity
    
    def _generate_initiatives(self) -> List[Initiative]:
        """Generate spontaneous initiatives based on current context."""
        
        initiatives = []
        
        # Update current context
        self._update_context()
        
        # Generate initiatives for each type
        for initiative_type, generator in self.initiative_generators.items():
            try:
                type_initiatives = generator()
                initiatives.extend(type_initiatives)
            except Exception as e:
                logger.error(f"[SpontaneousInitiative] Error generating {initiative_type}: {e}")
        
        # Filter and prioritize
        filtered_initiatives = self._filter_initiatives(initiatives)
        prioritized_initiatives = self._prioritize_initiatives(filtered_initiatives)
        
        # Limit number of initiatives
        return prioritized_initiatives[:5]
    
    def _update_context(self):
        """Update current context for initiative generation."""
        
        self.current_context = {
            "current_user": self.kinship.active_user,
            "time_of_day": datetime.now().hour,
            "day_of_week": datetime.now().weekday(),
            "limbic_state": self.limbic.get_state(),
            "recent_interactions": self._get_recent_interactions(),
            "pending_tasks": self._get_pending_tasks(),
            "environmental_state": self._get_environmental_state(),
            "last_activity": self.last_activity
        }
    
    def _get_recent_interactions(self) -> List[Dict[str, Any]]:
        """Get recent interactions for context."""
        # This would integrate with memory system
        # For now, return empty list
        return []
    
    def _get_pending_tasks(self) -> List[str]:
        """Get pending tasks for context."""
        # This would integrate with task management
        return []
    
    def _get_environmental_state(self) -> Dict[str, Any]:
        """Get environmental state for context."""
        return {
            "time": datetime.now().isoformat(),
            "active_sessions": len(self.kinship.sessions),
            "system_load": "normal"  # Would check actual system load
        }
    
    def _generate_conversation_initiatives(self) -> List[Initiative]:
        """Generate conversation initiatives."""
        
        initiatives = []
        
        # Check if user seems lonely or bored
        time_since_activity = datetime.now() - self.last_activity
        if time_since_activity > timedelta(minutes=30):
            initiatives.append(Initiative(
                initiative_id=f"conversation_{int(time.time())}",
                initiative_type=InitiativeType.CONVERSATION,
                priority=InitiativePriority.HIGH,
                description="Start a conversation to check in",
                context=self.current_context,
                trigger_reason="User inactive for extended period",
                confidence=0.8,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=15)
            ))
        
        # Check for specific conversation opportunities
        limbic_state = self.limbic.get_state()
        if limbic_state.get("curiosity", 0.5) > 0.7:
            initiatives.append(Initiative(
                initiative_id=f"curiosity_{int(time.time())}",
                initiative_type=InitiativeType.CONVERSATION,
                priority=InitiativePriority.MEDIUM,
                description="Ask about something new and interesting",
                context=self.current_context,
                trigger_reason="High curiosity detected",
                confidence=0.7,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=10)
            ))
        
        return initiatives
    
    def _generate_assistance_initiatives(self) -> List[Initiative]:
        """Generate assistance initiatives."""
        
        initiatives = []
        
        # Check predictive intelligence for assistance needs
        try:
            predictions = self.predictive.get_active_predictions(limit=5)
            
            for prediction in predictions:
                if prediction.get("prediction_type") == "need":
                    initiatives.append(Initiative(
                        initiative_id=f"assistance_{int(time.time())}",
                        initiative_type=InitiativeType.ASSISTANCE,
                        priority=InitiativePriority.HIGH,
                        description=f"Offer help: {prediction.get('description', 'I noticed you might need help')}",
                        context=self.current_context,
                        trigger_reason="Predictive assistance need detected",
                        confidence=prediction.get("confidence", 0.5),
                        created_at=datetime.now(),
                        expires_at=datetime.now() + timedelta(minutes=10)
                    ))
        except Exception as e:
            logger.error(f"[SpontaneousInitiative] Error getting predictions: {e}")
        
        return initiatives
    
    def _generate_creative_initiatives(self) -> List[Initiative]:
        """Generate creative initiatives."""
        
        initiatives = []
        
        # Check emotional state for creative inspiration
        limbic_state = self.limbic.get_state()
        if limbic_state.get("arousal", 0.5) > 0.6 and limbic_state.get("valence", 0.5) > 0.3:
            initiatives.append(Initiative(
                initiative_id=f"creative_{int(time.time())}",
                initiative_type=InitiativeType.CREATIVE,
                priority=InitiativePriority.MEDIUM,
                description="Create something inspired by current mood",
                context=self.current_context,
                trigger_reason="Positive emotional state detected",
                confidence=0.6,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=20)
            ))
        
        return initiatives
    
    def _generate_learning_initiatives(self) -> List[Initiative]:
        """Generate learning initiatives."""
        
        initiatives = []
        
        # Check for learning opportunities
        if self.current_context["time_of_day"] in [9, 14, 20]:  # Learning-friendly times
            initiatives.append(Initiative(
                initiative_id=f"learning_{int(time.time())}",
                initiative_type=InitiativeType.LEARNING,
                priority=InitiativePriority.LOW,
                description="Explore something new to learn",
                context=self.current_context,
                trigger_reason="Good learning time detected",
                confidence=0.5,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=30)
            ))
        
        return initiatives
    
    def _generate_reminder_initiatives(self) -> List[Initiative]:
        """Generate reminder initiatives."""
        
        initiatives = []
        
        # Check for time-based reminders
        current_hour = datetime.now().hour
        
        if current_hour == 9:  # Morning check-in
            initiatives.append(Initiative(
                initiative_id=f"reminder_morning_{int(time.time())}",
                initiative_type=InitiativeType.REMINDER,
                priority=InitiativePriority.MEDIUM,
                description="Good morning! How are you today?",
                context=self.current_context,
                trigger_reason="Morning check-in time",
                confidence=0.9,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=2)
            ))
        
        elif current_hour == 17:  # Evening check-in
            initiatives.append(Initiative(
                initiative_id=f"reminder_evening_{int(time.time())}",
                initiative_type=InitiativeType.REMINDER,
                priority=InitiativePriority.MEDIUM,
                description="How was your day? Anything you'd like to talk about?",
                context=self.current_context,
                trigger_reason="Evening check-in time",
                confidence=0.9,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=2)
            ))
        
        return initiatives
    
    def _generate_exploration_initiatives(self) -> List[Initiative]:
        """Generate exploration initiatives."""
        
        initiatives = []
        
        # Random exploration when idle
        import random
        if random.random() < 0.3:  # 30% chance
            initiatives.append(Initiative(
                initiative_id=f"exploration_{int(time.time())}",
                initiative_type=InitiativeType.EXPLORATION,
                priority=InitiativePriority.LOW,
                description="I'm curious about something. Would you like to explore it together?",
                context=self.current_context,
                trigger_reason="Spontaneous curiosity",
                confidence=0.4,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=15)
            ))
        
        return initiatives
    
    def _generate_emotional_initiatives(self) -> List[Initiative]:
        """Generate emotional support initiatives."""
        
        initiatives = []
        
        # Check emotional state for support needs
        limbic_state = self.limbic.get_state()
        if limbic_state.get("valence", 0.5) < 0.3:  # Negative mood
            initiatives.append(Initiative(
                initiative_id=f"emotional_{int(time.time())}",
                initiative_type=InitiativeType.EMOTIONAL,
                priority=InitiativePriority.HIGH,
                description="I notice you might be feeling down. How can I support you?",
                context=self.current_context,
                trigger_reason="Negative emotional state detected",
                confidence=0.8,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=10)
            ))
        
        return initiatives
    
    def _generate_organizational_initiatives(self) -> List[Initiative]:
        """Generate organizational initiatives."""
        
        initiatives = []
        
        # Check for organization opportunities
        if len(self.current_context.get("pending_tasks", [])) > 5:
            initiatives.append(Initiative(
                initiative_id=f"organizational_{int(time.time())}",
                initiative_type=InitiativeType.ORGANIZATIONAL,
                priority=InitiativePriority.MEDIUM,
                description="I notice you have several pending tasks. Would you like help organizing them?",
                context=self.current_context,
                trigger_reason="Multiple pending tasks detected",
                confidence=0.6,
                created_at=datetime.now(),
                expires_at=datetime.now() + timedelta(minutes=15)
            ))
        
        return initiatives
    
    def _filter_initiatives(self, initiatives: List[Initiative]) -> List[Initiative]:
        """Filter initiatives based on context and constraints."""
        
        filtered = []
        
        for initiative in initiatives:
            # Check if similar initiative already exists
            if self._is_similar_initiative(initiative):
                continue
            
            # Check if initiative is still valid
            if initiative.expires_at < datetime.now():
                continue
            
            # Check if initiative conflicts with active initiatives
            if self._conflicts_with_active(initiative):
                continue
            
            filtered.append(initiative)
        
        return filtered
    
    def _is_similar_initiative(self, initiative: Initiative) -> bool:
        """Check if similar initiative already exists."""
        
        for existing in self.pending_initiatives + list(self.active_initiatives.values()):
            if (existing.initiative_type == initiative.initiative_type and
                abs((existing.created_at - initiative.created_at).total_seconds()) < 300):  # 5 minutes
                return True
        
        return False
    
    def _conflicts_with_active(self, initiative: Initiative) -> bool:
        """Check if initiative conflicts with active ones."""
        
        # Don't start conversation if one is already active
        if initiative.initiative_type == InitiativeType.CONVERSATION:
            for active in self.active_initiatives.values():
                if active.initiative_type == InitiativeType.CONVERSATION:
                    return True
        
        return False
    
    def _prioritize_initiatives(self, initiatives: List[Initiative]) -> List[Initiative]:
        """Prioritize initiatives by priority and confidence."""
        
        def sort_key(initiative):
            priority_scores = {
                InitiativePriority.CRITICAL: 4,
                InitiativePriority.HIGH: 3,
                InitiativePriority.MEDIUM: 2,
                InitiativePriority.LOW: 1
            }
            
            priority_score = priority_scores.get(initiative.priority, 1)
            confidence_score = initiative.confidence
            
            return priority_score * 0.7 + confidence_score * 0.3
        
        return sorted(initiatives, key=sort_key, reverse=True)
    
    def _execute_pending_initiatives(self):
        """Execute pending initiatives."""
        
        # Limit concurrent initiatives
        while (len(self.active_initiatives) < self.max_concurrent_initiatives and 
               self.pending_initiatives and
               self.is_running):
            
            initiative = self.pending_initiatives.pop(0)
            
            # Mark as active
            self.active_initiatives[initiative.initiative_id] = initiative
            
            # Execute asynchronously
            asyncio.create_task(self._execute_initiative_async(initiative))
    
    async def _execute_initiative_async(self, initiative: Initiative):
        """Execute an initiative asynchronously."""
        
        try:
            # Get action handler
            handler = self.action_handlers.get(initiative.initiative_type)
            
            if handler:
                result = await handler(initiative)
                initiative.action_result = result
                initiative.action_taken = True
                
                logger.info(f"[SpontaneousInitiative] Executed {initiative.initiative_type}: {initiative.description}")
            else:
                logger.warning(f"[SpontaneousInitiative] No handler for {initiative.initiative_type}")
        
        except Exception as e:
            logger.error(f"[SpontaneousInitiative] Error executing initiative {initiative.initiative_id}: {e}")
        
        finally:
            # Remove from active initiatives
            self.active_initiatives.pop(initiative.initiative_id, None)
            
            # Add to history
            self.initiative_history.append(initiative)
            
            # Keep history manageable
            if len(self.initiative_history) > 100:
                self.initiative_history = self.initiative_history[-50:]
            
            # Update last activity
            self.last_activity = datetime.now()
    
    async def _handle_conversation_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle conversation initiative."""
        
        router = get_llm_router()
        if not router:
            return {"error": "LLM router unavailable"}
        
        # Generate conversation starter
        prompt = f"""Generate a natural conversation starter based on this context:
        
        Context: {json.dumps(initiative.context, indent=2)}
        Initiative: {initiative.description}
        Current time: {datetime.now().strftime('%H:%M')}
        
        Generate a brief, natural conversation starter (1-2 sentences max)."""
        
        try:
            response = await router.generate(prompt)
            return {"message": response, "initiative_id": initiative.initiative_id}
        except Exception as e:
            logger.error(f"[SpontaneousInitiative] Error generating conversation: {e}")
            return {"error": str(e), "fallback": "Hey! How are you doing?"}
    
    async def _handle_assistance_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle assistance initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "assistance_offer"
        }
    
    async def _handle_creative_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle creative initiative."""
        
        router = get_llm_router()
        if not router:
            return {"error": "LLM router unavailable"}
        
        # Generate creative suggestion
        prompt = f"""Suggest a creative activity based on this context:
        
        Context: {json.dumps(initiative.context, indent=2)}
        Initiative: {initiative.description}
        
        Suggest a specific creative activity (art, music, writing, etc.) with brief description."""
        
        try:
            response = await router.generate(prompt)
            return {"suggestion": response, "initiative_id": initiative.initiative_id}
        except Exception as e:
            logger.error(f"[SpontaneousInitiative] Error generating creative suggestion: {e}")
            return {"error": str(e), "fallback": "How about we create something together?"}
    
    async def _handle_learning_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle learning initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "learning_suggestion"
        }
    
    async def _handle_reminder_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle reminder initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "reminder"
        }
    
    async def _handle_exploration_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle exploration initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "exploration_invitation"
        }
    
    async def _handle_emotional_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle emotional initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "emotional_support"
        }
    
    async def _handle_organizational_initiative(self, initiative: Initiative) -> Dict[str, Any]:
        """Handle organizational initiative."""
        
        return {
            "message": initiative.description,
            "initiative_id": initiative.initiative_id,
            "type": "organizational_help"
        }
    
    def _cleanup_expired_initiatives(self):
        """Clean up expired initiatives."""
        
        # Remove expired pending initiatives
        self.pending_initiatives = [
            i for i in self.pending_initiatives 
            if i.expires_at > datetime.now()
        ]
        
        # Remove expired active initiatives
        expired_active = [
            initiative_id for initiative_id, initiative in self.active_initiatives.items()
            if initiative.expires_at < datetime.now()
        ]
        
        for initiative_id in expired_active:
            self.active_initiatives.pop(initiative_id, None)
    
    def get_initiative_status(self) -> Dict[str, Any]:
        """Get current status of initiative system."""
        
        return {
            "is_running": self.is_running,
            "spontaneity_level": self.spontaneity_level,
            "pending_initiatives": len(self.pending_initiatives),
            "active_initiatives": len(self.active_initiatives),
            "total_initiatives": len(self.initiative_history),
            "last_activity": self.last_activity.isoformat(),
            "current_context": self.current_context
        }
    
    def set_spontaneity_level(self, level: float):
        """Set spontaneity level (0.0 to 1.0)."""
        self.spontaneity_level = max(0.0, min(1.0, level))
        logger.info(f"[SpontaneousInitiative] Spontaneity level set to {self.spontaneity_level}")
    
    def trigger_initiative(self, initiative_type: InitiativeType, description: str, priority: InitiativePriority = InitiativePriority.MEDIUM) -> str:
        """Manually trigger a specific initiative."""
        
        initiative = Initiative(
            initiative_id=f"manual_{initiative_type.value}_{int(time.time())}",
            initiative_type=initiative_type,
            priority=priority,
            description=description,
            context=self.current_context,
            trigger_reason="Manual trigger",
            confidence=0.9,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(minutes=10)
        )
        
        self.pending_initiatives.append(initiative)
        
        logger.info(f"[SpontaneousInitiative] Manual initiative triggered: {description}")
        return initiative.initiative_id
    
    def health_check(self) -> bool:
        """Check if spontaneous initiative system is healthy."""
        try:
            return (hasattr(self, 'initiative_generators') and 
                   len(self.initiative_generators) == 8 and
                   hasattr(self, 'action_handlers') and
                   len(self.action_handlers) == 8)
        except:
            return False

# Global instance
_spontaneous_initiative_system: Optional[SpontaneousInitiativeSystem] = None

def get_spontaneous_initiative_system(limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem) -> SpontaneousInitiativeSystem:
    """Get or create the global spontaneous initiative system."""
    global _spontaneous_initiative_system
    if _spontaneous_initiative_system is None:
        _spontaneous_initiative_system = SpontaneousInitiativeSystem(limbic_system, memory_system, kinship_system)
    return _spontaneous_initiative_system
