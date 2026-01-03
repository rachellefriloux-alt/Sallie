"""Enhanced Context Switching System.

Enables Sallie to seamlessly handle multiple users and contexts:
- Instant context switching between users
- Maintains separate conversational states
- Preserves emotional continuity
- Handles concurrent conversations
- Context-aware responses
- Relationship memory across switches
- Seamless multi-user experience

This makes Sallie feel present with each user individually.
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
from threading import Thread, Event, RLock
from queue import Queue, Empty

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem
from llm_router import get_llm_router

logger = setup_logging("enhanced_context_switching")

class ContextState(str, Enum):
    """States of user contexts."""
    ACTIVE = "active"           # Currently engaged with user
    PAUSED = "paused"          # Temporarily paused
    IDLE = "idle"             # No recent activity
    AWAY = "away"             # User away for extended period

class ConversationMode(str, Enum):
    """Modes of conversation."""
    CHAT = "chat"             # Casual conversation
    TASK = "task"             # Task-focused interaction
    SUPPORT = "support"       # Support/help mode
    CREATIVE = "creative"     # Creative collaboration
    LEARNING = "learning"     # Learning/teaching mode
    EMOTIONAL = "emotional"   # Emotional support mode

@dataclass
class UserContext:
    """Complete context for a user."""
    user_id: str
    name: str
    relationship_type: str
    current_state: ContextState
    conversation_mode: ConversationMode
    last_activity: datetime
    last_message: str
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    emotional_state: Dict[str, float] = field(default_factory=dict)
    active_topics: List[str] = field(default_factory=list)
    pending_tasks: List[str] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    memory_context: Dict[str, Any] = field(default_factory=dict)
    session_start: datetime = field(default_factory=datetime.now)
    total_interactions: int = 0

@dataclass
class ContextSwitch:
    """A context switch event."""
    switch_id: str
    from_user: Optional[str]
    to_user: str
    switch_time: datetime
    switch_reason: str
    context_preserved: bool
    transition_smoothness: float  # 0.0 to 1.0

class EnhancedContextSwitchingSystem:
    """System for managing enhanced context switching between users."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.kinship = kinship_system
        
        # User contexts
        self.user_contexts: Dict[str, UserContext] = {}
        self.active_user: Optional[str] = None
        self.context_lock = RLock()
        
        # Context switching
        self.switch_history: List[ContextSwitch] = []
        self.switch_threshold = timedelta(minutes=5)  # Time before considering user idle
        self.max_conversation_history = 50
        
        # Context preservation
        self.context_preservation_methods = {
            "emotional_state": self._preserve_emotional_state,
            "conversation_topics": self._preserve_conversation_topics,
            "pending_tasks": self._preserve_pending_tasks,
            "preferences": self._preserve_preferences,
            "memory_context": self._preserve_memory_context
        }
        
        # Context restoration
        self.context_restoration_methods = {
            "emotional_state": self._restore_emotional_state,
            "conversation_topics": self._restore_conversation_topics,
            "pending_tasks": self._restore_pending_tasks,
            "preferences": self._restore_preferences,
            "memory_context": self._restore_memory_context
        }
        
        # Background monitoring
        self.is_monitoring = False
        self.monitor_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        # Switching performance metrics
        self.switch_times: List[float] = []
        self.context_preservation_scores: List[float] = []
        
        logger.info("[EnhancedContextSwitching] System initialized")
    
    def start_monitoring(self):
        """Start background monitoring of user contexts."""
        if self.is_monitoring:
            logger.warning("[EnhancedContextSwitching] Monitoring already started")
            return
        
        self.is_monitoring = True
        self.stop_event.clear()
        
        self.monitor_thread = Thread(target=self._monitoring_loop, daemon=True)
        self.monitor_thread.start()
        
        logger.info("[EnhancedContextSwitching] Context monitoring started")
    
    def stop_monitoring(self):
        """Stop background monitoring."""
        if not self.is_monitoring:
            return
        
        self.is_monitoring = False
        self.stop_event.set()
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        logger.info("[EnhancedContextSwitching] Context monitoring stopped")
    
    def _monitoring_loop(self):
        """Background loop for monitoring user contexts."""
        
        while self.is_monitoring:
            try:
                # Check for idle users
                self._check_idle_users()
                
                # Update conversation states
                self._update_conversation_states()
                
                # Clean up old contexts
                self._cleanup_old_contexts()
                
                # Wait before next check
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"[EnhancedContextSwitching] Monitoring loop error: {e}")
                time.sleep(60)
    
    def _check_idle_users(self):
        """Check for users who have been idle."""
        
        current_time = datetime.now()
        
        with self.context_lock:
            for user_id, context in self.user_contexts.items():
                time_since_activity = current_time - context.last_activity
                
                if time_since_activity > self.switch_threshold:
                    if context.current_state == ContextState.ACTIVE:
                        context.current_state = ContextState.IDLE
                        logger.info(f"[EnhancedContextSwitching] User {user_id} marked as idle")
                
                if time_since_activity > timedelta(hours=1):
                    if context.current_state in [ContextState.IDLE, ContextState.PAUSED]:
                        context.current_state = ContextState.AWAY
                        logger.info(f"[EnhancedContextSwitching] User {user_id} marked as away")
    
    def _update_conversation_states(self):
        """Update conversation states based on recent activity."""
        
        current_time = datetime.now()
        
        with self.context_lock:
            for user_id, context in self.user_contexts.items():
                if context.current_state == ContextState.ACTIVE:
                    # Check if conversation should continue
                    time_since_activity = current_time - context.last_activity
                    
                    if time_since_activity > timedelta(minutes=15):
                        context.conversation_mode = ConversationMode.CHAT  # Default to chat
                    elif len(context.pending_tasks) > 0:
                        context.conversation_mode = ConversationMode.TASK
                    elif any(emotion > 0.7 for emotion in context.emotional_state.values()):
                        context.conversation_mode = ConversationMode.EMOTIONAL
    
    def _cleanup_old_contexts(self):
        """Clean up old or inactive contexts."""
        
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(days=7)  # Keep contexts for 7 days
        
        with self.context_lock:
            inactive_users = [
                user_id for user_id, context in self.user_contexts.items()
                if context.last_activity < cutoff_time and user_id != self.active_user
            ]
            
            for user_id in inactive_users:
                del self.user_contexts[user_id]
                logger.info(f"[EnhancedContextSwitching] Cleaned up context for user {user_id}")
    
    def switch_context(self, to_user: str, switch_reason: str = "user_request") -> Dict[str, Any]:
        """Switch to a different user context."""
        
        start_time = time.time()
        
        with self.context_lock:
            from_user = self.active_user
            
            # Create context switch record
            switch = ContextSwitch(
                switch_id=f"switch_{int(time.time() * 1000)}",
                from_user=from_user,
                to_user=to_user,
                switch_time=datetime.now(),
                switch_reason=switch_reason,
                context_preserved=False,
                transition_smoothness=0.0
            )
            
            try:
                # Preserve current context
                if from_user:
                    self._preserve_context(from_user)
                
                # Switch to new user
                self._switch_to_user(to_user)
                
                # Restore new user's context
                self._restore_context(to_user)
                
                # Update switch record
                switch.context_preserved = True
                switch.transition_smoothness = 0.9  # Assume smooth transition
                
                # Record switch
                self.switch_history.append(switch)
                if len(self.switch_history) > 100:
                    self.switch_history = self.switch_history[-50:]
                
                # Update performance metrics
                switch_time = (time.time() - start_time) * 1000
                self.switch_times.append(switch_time)
                if len(self.switch_times) > 100:
                    self.switch_times = self.switch_times[-50:]
                
                logger.info(f"[EnhancedContextSwitching] Switched from {from_user} to {to_user} in {switch_time:.0f}ms")
                
                return {
                    "success": True,
                    "from_user": from_user,
                    "to_user": to_user,
                    "switch_time_ms": switch_time,
                    "switch_id": switch.switch_id
                }
                
            except Exception as e:
                logger.error(f"[EnhancedContextSwitching] Error switching context: {e}")
                return {
                    "success": False,
                    "error": str(e),
                    "from_user": from_user,
                    "to_user": to_user
                }
    
    def _preserve_context(self, user_id: str):
        """Preserve the current user's context."""
        
        if user_id not in self.user_contexts:
            return
        
        context = self.user_contexts[user_id]
        
        # Preserve different aspects of context
        for aspect, method in self.context_preservation_methods.items():
            try:
                method(user_id, context)
            except Exception as e:
                logger.error(f"[EnhancedContextSwitching] Error preserving {aspect}: {e}")
    
    def _restore_context(self, user_id: str):
        """Restore a user's context."""
        
        if user_id not in self.user_contexts:
            self._create_user_context(user_id)
        
        context = self.user_contexts[user_id]
        
        # Restore different aspects of context
        for aspect, method in self.context_restoration_methods.items():
            try:
                method(user_id, context)
            except Exception as e:
                logger.error(f"[EnhancedContextSwitching] Error restoring {aspect}: {e}")
    
    def _switch_to_user(self, user_id: str):
        """Switch to a specific user."""
        
        # Update kinship system
        self.kinship.switch_context(user_id, self.limbic, self.memory)
        
        # Update active user
        self.active_user = user_id
        
        # Update user context
        if user_id in self.user_contexts:
            self.user_contexts[user_id].current_state = ContextState.ACTIVE
            self.user_contexts[user_id].last_activity = datetime.now()
    
    def _create_user_context(self, user_id: str):
        """Create a new user context."""
        
        # Get user info from kinship
        user_info = self.kinship.users.get(user_id, {"id": user_id, "role": "unknown"})
        
        # Create context
        context = UserContext(
            user_id=user_id,
            name=user_info.get("name", user_id),
            relationship_type=user_info.get("role", "unknown"),
            current_state=ContextState.ACTIVE,
            conversation_mode=ConversationMode.CHAT,
            last_activity=datetime.now(),
            last_message="",
            emotional_state=self.limbic.get_state().copy()
        )
        
        self.user_contexts[user_id] = context
    
    def _preserve_emotional_state(self, user_id: str, context: UserContext):
        """Preserve emotional state."""
        context.emotional_state = self.limbic.get_state().copy()
    
    def _restore_emotional_state(self, user_id: str, context: UserContext):
        """Restore emotional state."""
        # Note: We don't actually change the limbic state (single soul policy)
        # But we preserve the context for reference
        pass
    
    def _preserve_conversation_topics(self, user_id: str, context: UserContext):
        """Preserve conversation topics."""
        # Extract topics from recent conversation history
        recent_messages = context.conversation_history[-10:]
        topics = []
        
        for message in recent_messages:
            if "topics" in message:
                topics.extend(message["topics"])
        
        context.active_topics = list(set(topics))[-10:]  # Keep last 10 unique topics
    
    def _restore_conversation_topics(self, user_id: str, context: UserContext):
        """Restore conversation topics."""
        # Topics are already stored in context
        pass
    
    def _preserve_pending_tasks(self, user_id: str, context: UserContext):
        """Preserve pending tasks."""
        # Extract tasks from recent conversation
        recent_messages = context.conversation_history[-20:]
        tasks = []
        
        for message in recent_messages:
            if "tasks" in message:
                tasks.extend(message["tasks"])
            elif "task" in message:
                tasks.append(message["task"])
        
        context.pending_tasks = tasks[-10:]  # Keep last 10 tasks
    
    def _restore_pending_tasks(self, user_id: str, context: UserContext):
        """Restore pending tasks."""
        # Tasks are already stored in context
        pass
    
    def _preserve_preferences(self, user_id: str, context: UserContext):
        """Preserve user preferences."""
        # Extract preferences from conversation
        recent_messages = context.conversation_history[-50:]
        preferences = {}
        
        for message in recent_messages:
            if "preferences" in message:
                preferences.update(message["preferences"])
        
        context.preferences.update(preferences)
    
    def _restore_preferences(self, user_id: str, context: UserContext):
        """Restore user preferences."""
        # Preferences are already stored in context
        pass
    
    def _preserve_memory_context(self, user_id: str, context: UserContext):
        """Preserve memory context."""
        # Store recent memory references
        recent_messages = context.conversation_history[-20:]
        memory_refs = []
        
        for message in recent_messages:
            if "memory_refs" in message:
                memory_refs.extend(message["memory_refs"])
        
        context.memory_context["recent_memory_refs"] = memory_refs[-20:]
    
    def _restore_memory_context(self, user_id: str, context: UserContext):
        """Restore memory context."""
        # Memory context is already stored in context
        pass
    
    def add_message(self, user_id: str, message: str, response: str, metadata: Dict[str, Any] = None):
        """Add a message to the user's conversation history."""
        
        with self.context_lock:
            if user_id not in self.user_contexts:
                self._create_user_context(user_id)
            
            context = self.user_contexts[user_id]
            
            # Create message record
            message_record = {
                "timestamp": datetime.now().isoformat(),
                "user_message": message,
                "sallie_response": response,
                "metadata": metadata or {}
            }
            
            # Add to conversation history
            context.conversation_history.append(message_record)
            context.last_message = message
            context.last_activity = datetime.now()
            context.total_interactions += 1
            
            # Limit history size
            if len(context.conversation_history) > self.max_conversation_history:
                context.conversation_history = context.conversation_history[-self.max_conversation_history:]
            
            # Update conversation mode based on content
            self._update_conversation_mode(user_id, message, response)
    
    def _update_conversation_mode(self, user_id: str, user_message: str, sallie_response: str):
        """Update conversation mode based on message content."""
        
        if user_id not in self.user_contexts:
            return
        
        context = self.user_contexts[user_id]
        
        # Analyze message content to determine mode
        message_lower = user_message.lower()
        response_lower = sallie_response.lower()
        
        # Task-focused indicators
        if any(word in message_lower for word in ["help", "do", "create", "fix", "task", "complete"]):
            context.conversation_mode = ConversationMode.TASK
        
        # Support indicators
        elif any(word in message_lower for word in ["sad", "worried", "stressed", "help me", "support"]):
            context.conversation_mode = ConversationMode.SUPPORT
        
        # Creative indicators
        elif any(word in message_lower for word in ["create", "design", "art", "music", "write", "imagine"]):
            context.conversation_mode = ConversationMode.CREATIVE
        
        # Learning indicators
        elif any(word in message_lower for word in ["learn", "teach", "explain", "understand", "study"]):
            context.conversation_mode = ConversationMode.LEARNING
        
        # Emotional indicators
        elif any(word in message_lower for word in ["feel", "emotion", "happy", "sad", "angry", "love"]):
            context.conversation_mode = ConversationMode.EMOTIONAL
        
        # Default to chat
        else:
            context.conversation_mode = ConversationMode.CHAT
    
    def get_user_context(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the current context for a user."""
        
        with self.context_lock:
            if user_id not in self.user_contexts:
                return None
            
            context = self.user_contexts[user_id]
            
            return {
                "user_id": context.user_id,
                "name": context.name,
                "relationship_type": context.relationship_type,
                "current_state": context.current_state.value,
                "conversation_mode": context.conversation_mode.value,
                "last_activity": context.last_activity.isoformat(),
                "last_message": context.last_message,
                "total_interactions": context.total_interactions,
                "active_topics": context.active_topics,
                "pending_tasks": context.pending_tasks,
                "emotional_state": context.emotional_state,
                "session_duration": (datetime.now() - context.session_start).total_seconds()
            }
    
    def get_active_context(self) -> Optional[Dict[str, Any]]:
        """Get the currently active user context."""
        
        if self.active_user:
            return self.get_user_context(self.active_user)
        
        return None
    
    def get_all_contexts(self) -> Dict[str, Dict[str, Any]]:
        """Get all user contexts."""
        
        with self.context_lock:
            return {
                user_id: self.get_user_context(user_id)
                for user_id in self.user_contexts.keys()
            }
    
    def get_switching_metrics(self) -> Dict[str, Any]:
        """Get context switching performance metrics."""
        
        if not self.switch_times:
            return {"status": "no_data", "message": "No switches recorded yet"}
        
        avg_switch_time = sum(self.switch_times) / len(self.switch_times)
        total_switches = len(self.switch_history)
        
        # Calculate switch frequency
        if len(self.switch_history) > 1:
            time_span = self.switch_history[-1].switch_time - self.switch_history[0].switch_time
            switch_frequency = total_switches / max(time_span.total_seconds() / 3600, 1)  # switches per hour
        else:
            switch_frequency = 0
        
        return {
            "total_switches": total_switches,
            "avg_switch_time_ms": avg_switch_time,
            "switch_frequency_per_hour": switch_frequency,
            "active_user": self.active_user,
            "total_contexts": len(self.user_contexts),
            "is_monitoring": self.is_monitoring
        }
    
    def set_conversation_mode(self, user_id: str, mode: ConversationMode):
        """Manually set conversation mode for a user."""
        
        with self.context_lock:
            if user_id not in self.user_contexts:
                self._create_user_context(user_id)
            
            self.user_contexts[user_id].conversation_mode = mode
            logger.info(f"[EnhancedContextSwitching] Set {user_id} conversation mode to {mode.value}")
    
    def add_pending_task(self, user_id: str, task: str):
        """Add a pending task for a user."""
        
        with self.context_lock:
            if user_id not in self.user_contexts:
                self._create_user_context(user_id)
            
            context = self.user_contexts[user_id]
            if task not in context.pending_tasks:
                context.pending_tasks.append(task)
                logger.info(f"[EnhancedContextSwitching] Added task for {user_id}: {task}")
    
    def complete_pending_task(self, user_id: str, task: str):
        """Complete a pending task for a user."""
        
        with self.context_lock:
            if user_id in self.user_contexts:
                context = self.user_contexts[user_id]
                if task in context.pending_tasks:
                    context.pending_tasks.remove(task)
                    logger.info(f"[EnhancedContextSwitching] Completed task for {user_id}: {task}")
    
    def health_check(self) -> bool:
        """Check if enhanced context switching system is healthy."""
        
        try:
            return (self.is_monitoring or len(self.user_contexts) > 0 and
                   len(self.context_preservation_methods) == 5 and
                   len(self.context_restoration_methods) == 5)
        except:
            return False

# Global instance
_enhanced_context_switching_system: Optional[EnhancedContextSwitchingSystem] = None

def get_enhanced_context_switching_system(limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem) -> EnhancedContextSwitchingSystem:
    """Get or create the global enhanced context switching system."""
    global _enhanced_context_switching_system
    if _enhanced_context_switching_system is None:
        _enhanced_context_switching_system = EnhancedContextSwitchingSystem(limbic_system, memory_system, kinship_system)
    return _enhanced_context_switching_system
