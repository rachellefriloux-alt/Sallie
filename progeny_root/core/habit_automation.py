"""Habit Automation System.

Enables Sallie to learn user habits and automate them:
- Habit pattern recognition
- Routine learning and prediction
- Automated task execution
- Proactive habit support
- Personalized habit suggestions
- Habit tracking and analytics
- Adaptive habit recommendations
- Seamless habit integration

This makes Sallie a truly proactive personal assistant.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Callable, Tuple
from datetime import datetime, timedelta, time as dt_time
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from threading import Thread, Event
from queue import Queue, Empty
from collections import defaultdict, deque
import statistics

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem
from predictive_intelligence import get_predictive_intelligence_system
from llm_router import get_llm_router

logger = setup_logging("habit_automation")

class HabitType(str, Enum):
    """Types of habits."""
    DAILY = "daily"           # Daily routines
    WEEKLY = "weekly"         # Weekly patterns
    MONTHLY = "monthly"       # Monthly activities
    WORK = "work"            # Work-related habits
    PERSONAL = "personal"      # Personal care habits
    SOCIAL = "social"         # Social interaction habits
    LEARNING = "learning"      # Learning/study habits
    HEALTH = "health"         # Health and fitness habits
    CREATIVE = "creative"      # Creative habits
    PRODUCTIVITY = "productivity"  # Productivity habits

class HabitStatus(str, Enum):
    """Status of habits."""
    DETECTED = "detected"     # Pattern detected but not confirmed
    LEARNING = "learning"     # Currently learning pattern
    ACTIVE = "active"         # Active and automated
    PAUSED = "paused"         # Temporarily paused
    COMPLETED = "completed"   # Completed for today
    MISSED = "missed"         # Missed today

@dataclass
class HabitPattern:
    """A detected habit pattern."""
    habit_id: str
    user_id: str
    name: str
    habit_type: HabitType
    description: str
    trigger_conditions: Dict[str, Any]
    actions: List[str]
    time_patterns: List[Dict[str, Any]]  # When the habit occurs
    confidence: float  # 0.0 to 1.0
    frequency: float  # How often it occurs
    last_occurrence: datetime
    next_expected: datetime
    status: HabitStatus
    created_at: datetime
    updated_at: datetime
    execution_count: int = 0
    success_rate: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class HabitExecution:
    """A habit execution event."""
    execution_id: str
    habit_id: str
    user_id: str
    executed_at: datetime
    trigger_reason: str
    actions_taken: List[str]
    success: bool
    feedback: Optional[str]
    duration_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)

class HabitAutomationSystem:
    """System for learning and automating user habits."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.kinship = kinship_system
        
        # Predictive intelligence for pattern recognition
        self.predictive = get_predictive_intelligence_system(limbic_system, memory_system)
        
        # Habit storage
        self.habit_patterns: Dict[str, HabitPattern] = {}
        self.habit_executions: List[HabitExecution] = []
        self.user_habits: Dict[str, List[str]] = defaultdict(list)  # user_id -> habit_ids
        
        # Pattern detection
        self.pattern_detectors = {
            "time_based": self._detect_time_based_patterns,
            "activity_based": self._detect_activity_based_patterns,
            "context_based": self._detect_context_based_patterns,
            "emotional_based": self._detect_emotional_based_patterns
        }
        
        # Learning parameters
        self.min_pattern_occurrences = 5  # Minimum occurrences to detect pattern
        self.confidence_threshold = 0.7  # Confidence threshold for automation
        self.learning_window = timedelta(days=30)  # Look back window for learning
        
        # Automation
        self.automation_enabled = True
        self.max_concurrent_executions = 3
        self.execution_queue: Queue[HabitExecution] = Queue()
        
        # Background processing
        self.is_running = False
        self.learning_thread: Optional[Thread] = None
        self.execution_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        # Habit suggestions
        self.habit_suggestions: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        
        logger.info("[HabitAutomation] System initialized")
    
    def start(self):
        """Start the habit automation system."""
        if self.is_running:
            logger.warning("[HabitAutomation] System already running")
            return
        
        self.is_running = True
        self.stop_event.clear()
        
        # Start learning thread
        self.learning_thread = Thread(target=self._learning_loop, daemon=True)
        self.learning_thread.start()
        
        # Start execution thread
        self.execution_thread = Thread(target=self._execution_loop, daemon=True)
        self.execution_thread.start()
        
        logger.info("[HabitAutomation] System started")
    
    def stop(self):
        """Stop the habit automation system."""
        if not self.is_running:
            return
        
        self.is_running = False
        self.stop_event.set()
        
        if self.learning_thread:
            self.learning_thread.join(timeout=5)
        
        if self.execution_thread:
            self.execution_thread.join(timeout=5)
        
        logger.info("[HabitAutomation] System stopped")
    
    def _learning_loop(self):
        """Background loop for learning habit patterns."""
        
        while self.is_running:
            try:
                # Analyze recent interactions for patterns
                self._analyze_recent_interactions()
                
                # Update existing habits
                self._update_habit_patterns()
                
                # Generate habit suggestions
                self._generate_habit_suggestions()
                
                # Clean up old data
                self._cleanup_old_data()
                
                # Wait before next analysis
                time.sleep(300)  # Analyze every 5 minutes
                
            except Exception as e:
                logger.error(f"[HabitAutomation] Learning loop error: {e}")
                time.sleep(60)
    
    def _execution_loop(self):
        """Background loop for executing habits."""
        
        while self.is_running:
            try:
                # Check for habits to execute
                self._check_and_execute_habits()
                
                # Process execution queue
                self._process_execution_queue()
                
                # Wait before next check
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"[HabitAutomation] Execution loop error: {e}")
                time.sleep(60)
    
    def _analyze_recent_interactions(self):
        """Analyze recent interactions for habit patterns."""
        
        # Get recent interactions from memory
        cutoff_time = datetime.now() - self.learning_window
        
        for user_id in self.kinship.users.keys():
            try:
                # Get user's recent interactions
                recent_interactions = self._get_user_interactions(user_id, cutoff_time)
                
                if len(recent_interactions) < self.min_pattern_occurrences:
                    continue
                
                # Detect patterns
                for detector_name, detector in self.pattern_detectors.items():
                    try:
                        patterns = detector(user_id, recent_interactions)
                        
                        for pattern_data in patterns:
                            self._create_or_update_habit_pattern(user_id, pattern_data)
                            
                    except Exception as e:
                        logger.error(f"[HabitAutomation] Error in {detector_name} detector: {e}")
                        
            except Exception as e:
                logger.error(f"[HabitAutomation] Error analyzing interactions for {user_id}: {e}")
    
    def _get_user_interactions(self, user_id: str, since: datetime) -> List[Dict[str, Any]]:
        """Get user interactions since a specific time."""
        
        # This would integrate with the memory system
        # For now, return empty list
        return []
    
    def _detect_time_based_patterns(self, user_id: str, interactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect time-based habit patterns."""
        
        patterns = []
        
        # Group interactions by time of day
        time_groups = defaultdict(list)
        
        for interaction in interactions:
            try:
                timestamp = datetime.fromisoformat(interaction.get("timestamp", ""))
                hour = timestamp.hour
                minute = timestamp.minute
                time_key = f"{hour:02d}:{minute:02d}"
                time_groups[time_key].append(interaction)
            except:
                continue
        
        # Look for recurring time patterns
        for time_key, group in time_groups.items():
            if len(group) >= self.min_pattern_occurrences:
                # Check if this happens regularly
                dates = [datetime.fromisoformat(i.get("timestamp", "")).date() for i in group]
                date_counts = defaultdict(int)
                
                for date in dates:
                    date_counts[date.weekday()] += 1
                
                # Find most common day
                if date_counts:
                    most_common_day = max(date_counts.items(), key=lambda x: x[1])
                    
                    if most_common_day[1] >= self.min_pattern_occurrences:
                        patterns.append({
                            "type": "time_based",
                            "time": time_key,
                            "day": most_common_day[0],
                            "frequency": most_common_day[1],
                            "interactions": group,
                            "confidence": min(1.0, most_common_day[1] / len(interactions))
                        })
        
        return patterns
    
    def _detect_activity_based_patterns(self, user_id: str, interactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect activity-based habit patterns."""
        
        patterns = []
        
        # Group interactions by activity type
        activity_groups = defaultdict(list)
        
        for interaction in interactions:
            activity = interaction.get("activity_type", "general")
            activity_groups[activity].append(interaction)
        
        # Look for recurring activities
        for activity, group in activity_groups.items():
            if len(group) >= self.min_pattern_occurrences:
                # Analyze timing patterns
                timestamps = [datetime.fromisoformat(i.get("timestamp", "")) for i in group]
                hours = [t.hour for t in timestamps]
                
                # Find most common time
                if hours:
                    hour_counts = defaultdict(int)
                    for hour in hours:
                        hour_counts[hour] += 1
                    
                    most_common_hour = max(hour_counts.items(), key=lambda x: x[1])
                    
                    patterns.append({
                        "type": "activity_based",
                        "activity": activity,
                        "time": f"{most_common_hour[0]:02d}:00",
                        "frequency": most_common_hour[1],
                        "interactions": group,
                        "confidence": min(1.0, most_common_hour[1] / len(group))
                    })
        
        return patterns
    
    def _detect_context_based_patterns(self, user_id: str, interactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect context-based habit patterns."""
        
        patterns = []
        
        # Group interactions by context
        context_groups = defaultdict(list)
        
        for interaction in interactions:
            context = interaction.get("context", {})
            context_key = json.dumps(context, sort_keys=True)
            context_groups[context_key].append(interaction)
        
        # Look for recurring contexts
        for context_key, group in context_groups.items():
            if len(group) >= self.min_pattern_occurrences:
                try:
                    context = json.loads(context_key)
                    
                    patterns.append({
                        "type": "context_based",
                        "context": context,
                        "frequency": len(group),
                        "interactions": group,
                        "confidence": min(1.0, len(group) / len(interactions))
                    })
                except:
                    continue
        
        return patterns
    
    def _detect_emotional_based_patterns(self, user_id: str, interactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect emotional-based habit patterns."""
        
        patterns = []
        
        # Group interactions by emotional state
        emotion_groups = defaultdict(list)
        
        for interaction in interactions:
            emotions = interaction.get("emotional_state", {})
            if emotions:
                # Find dominant emotion
                dominant_emotion = max(emotions.items(), key=lambda x: x[1])
                emotion_groups[dominant_emotion[0]].append(interaction)
        
        # Look for recurring emotional patterns
        for emotion, group in emotion_groups.items():
            if len(group) >= self.min_pattern_occurrences:
                patterns.append({
                    "type": "emotional_based",
                    "emotion": emotion,
                    "frequency": len(group),
                    "interactions": group,
                    "confidence": min(1.0, len(group) / len(interactions))
                })
        
        return patterns
    
    def _create_or_update_habit_pattern(self, user_id: str, pattern_data: Dict[str, Any]):
        """Create or update a habit pattern."""
        
        pattern_type = pattern_data.get("type", "unknown")
        
        # Generate habit ID
        habit_id = f"{user_id}_{pattern_type}_{int(time.time())}"
        
        # Determine habit type
        habit_type = self._classify_habit_type(pattern_data)
        
        # Create habit pattern
        habit = HabitPattern(
            habit_id=habit_id,
            user_id=user_id,
            name=self._generate_habit_name(pattern_data),
            habit_type=habit_type,
            description=self._generate_habit_description(pattern_data),
            trigger_conditions=pattern_data,
            actions=self._extract_actions(pattern_data),
            time_patterns=self._extract_time_patterns(pattern_data),
            confidence=pattern_data.get("confidence", 0.5),
            frequency=pattern_data.get("frequency", 0.0),
            last_occurrence=datetime.now(),
            next_expected=self._calculate_next_expected(pattern_data),
            status=HabitStatus.LEARNING,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        # Store habit
        self.habit_patterns[habit_id] = habit
        self.user_habits[user_id].append(habit_id)
        
        logger.info(f"[HabitAutomation] Created habit pattern: {habit.name} for {user_id}")
    
    def _classify_habit_type(self, pattern_data: Dict[str, Any]) -> HabitType:
        """Classify the type of habit."""
        
        pattern_type = pattern_data.get("type", "")
        activity = pattern_data.get("activity", "")
        context = pattern_data.get("context", {})
        
        # Classification logic
        if "work" in activity.lower() or context.get("location") == "work":
            return HabitType.WORK
        elif "exercise" in activity.lower() or "health" in activity.lower():
            return HabitType.HEALTH
        elif "learn" in activity.lower() or "study" in activity.lower():
            return HabitType.LEARNING
        elif "create" in activity.lower() or "art" in activity.lower():
            return HabitType.CREATIVE
        elif "social" in activity.lower() or context.get("people"):
            return HabitType.SOCIAL
        elif "task" in activity.lower() or "productivity" in activity.lower():
            return HabitType.PRODUCTIVITY
        else:
            return HabitType.PERSONAL
    
    def _generate_habit_name(self, pattern_data: Dict[str, Any]) -> str:
        """Generate a name for the habit."""
        
        pattern_type = pattern_data.get("type", "")
        activity = pattern_data.get("activity", "")
        time_pattern = pattern_data.get("time", "")
        
        if pattern_type == "time_based":
            return f"Daily {time_pattern} routine"
        elif pattern_type == "activity_based":
            return f"Daily {activity}"
        elif pattern_type == "context_based":
            context = pattern_data.get("context", {})
            location = context.get("location", "unknown")
            return f"{location} routine"
        else:
            return "Daily habit"
    
    def _generate_habit_description(self, pattern_data: Dict[str, Any]) -> str:
        """Generate a description for the habit."""
        
        pattern_type = pattern_data.get("type", "")
        frequency = pattern_data.get("frequency", 0)
        
        descriptions = {
            "time_based": f"Occurs at {pattern_data.get('time', 'specific time')} with {frequency} occurrences",
            "activity_based": f"Involves {pattern_data.get('activity', 'specific activity')} with {frequency} occurrences",
            "context_based": f"Happens in {pattern_data.get('context', 'specific context')} with {frequency} occurrences",
            "emotional_based": f"Triggered by {pattern_data.get('emotion', 'emotional state')} with {frequency} occurrences"
        }
        
        return descriptions.get(pattern_type, f"Detected pattern with {frequency} occurrences")
    
    def _extract_actions(self, pattern_data: Dict[str, Any]) -> List[str]:
        """Extract actions from pattern data."""
        
        interactions = pattern_data.get("interactions", [])
        actions = []
        
        for interaction in interactions:
            message = interaction.get("user_message", "")
            response = interaction.get("sallie_response", "")
            
            if message:
                actions.append(f"User: {message[:100]}...")
            if response:
                actions.append(f"Sallie: {response[:100]}...")
        
        return actions[:10]  # Limit to 10 actions
    
    def _extract_time_patterns(self, pattern_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract time patterns from pattern data."""
        
        patterns = []
        
        if "time" in pattern_data:
            patterns.append({
                "type": "daily",
                "time": pattern_data["time"],
                "day": pattern_data.get("day", "daily")
            })
        
        return patterns
    
    def _calculate_next_expected(self, pattern_data: Dict[str, Any]) -> datetime:
        """Calculate when the habit is next expected."""
        
        pattern_type = pattern_data.get("type", "")
        
        if pattern_type == "time_based":
            time_str = pattern_data.get("time", "09:00")
            hour, minute = map(int, time_str.split(":"))
            
            # Calculate next occurrence
            today = datetime.now()
            next_occurrence = today.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            if next_occurrence <= today:
                next_occurrence += timedelta(days=1)
            
            return next_occurrence
        
        # Default to tomorrow same time
        return datetime.now() + timedelta(days=1)
    
    def _update_habit_patterns(self):
        """Update existing habit patterns."""
        
        current_time = datetime.now()
        
        for habit_id, habit in self.habit_patterns.items():
            try:
                # Check if habit should be updated
                if habit.status == HabitStatus.LEARNING:
                    # Update confidence based on recent executions
                    recent_executions = [
                        e for e in self.habit_executions
                        if e.habit_id == habit_id and 
                        (current_time - e.executed_at).days <= 7
                    ]
                    
                    if recent_executions:
                        success_count = sum(1 for e in recent_executions if e.success)
                        new_success_rate = success_count / len(recent_executions)
                        
                        if abs(new_success_rate - habit.success_rate) > 0.1:
                            habit.success_rate = new_success_rate
                            habit.updated_at = current_time
                            
                            # Update status based on success rate
                            if new_success_rate >= 0.8 and habit.confidence >= self.confidence_threshold:
                                habit.status = HabitStatus.ACTIVE
                                logger.info(f"[HabitAutomation] Activated habit: {habit.name}")
                
                # Update next expected time
                if habit.next_expected <= current_time:
                    habit.next_expected = self._calculate_next_expected(habit.trigger_conditions)
                    
                    # Mark as missed if not executed
                    if habit.status == HabitStatus.ACTIVE:
                        habit.status = HabitStatus.MISSED
                        logger.info(f"[HabitAutomation] Missed habit: {habit.name}")
                
            except Exception as e:
                logger.error(f"[HabitAutomation] Error updating habit {habit_id}: {e}")
    
    def _generate_habit_suggestions(self):
        """Generate habit suggestions for users."""
        
        for user_id in self.kinship.users.keys():
            try:
                suggestions = []
                
                # Analyze user's current habits
                user_habits = [self.habit_patterns[habit_id] for habit_id in self.user_habits[user_id] 
                              if habit_id in self.habit_patterns]
                
                # Suggest new habits based on patterns
                if len(user_habits) < 5:  # User has few habits
                    suggestions.extend(self._suggest_basic_habits(user_id))
                
                # Suggest habit improvements
                suggestions.extend(self._suggest_habit_improvements(user_habits))
                
                # Suggest habit combinations
                suggestions.extend(self._suggest_habit_combinations(user_habits))
                
                self.habit_suggestions[user_id] = suggestions[-10:]  # Keep last 10 suggestions
                
            except Exception as e:
                logger.error(f"[HabitAutomation] Error generating suggestions for {user_id}: {e}")
    
    def _suggest_basic_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Suggest basic habits for new users."""
        
        basic_habits = [
            {
                "name": "Morning check-in",
                "description": "Start your day with a quick check-in",
                "type": "daily",
                "suggested_time": "09:00",
                "reason": "Helps establish a daily routine"
            },
            {
                "name": "Evening reflection",
                "description": "End your day with reflection and planning",
                "type": "daily",
                "suggested_time": "20:00",
                "reason": "Helps with work-life balance"
            },
            {
                "name": "Weekly review",
                "description": "Review your week and plan the next one",
                "type": "weekly",
                "suggested_time": "Sunday 18:00",
                "reason": "Improves productivity and goal achievement"
            }
        ]
        
        return basic_habits
    
    def _suggest_habit_improvements(self, user_habits: List[HabitPattern]) -> List[Dict[str, Any]]:
        """Suggest improvements to existing habits."""
        
        suggestions = []
        
        for habit in user_habits:
            if habit.success_rate < 0.7:
                suggestions.append({
                    "name": f"Improve {habit.name}",
                    "description": f"This habit has a {habit.success_rate:.0%} success rate",
                    "suggestion": "Consider adjusting the time or context",
                    "reason": "Higher success rates build better habits"
                })
        
        return suggestions
    
    def _suggest_habit_combinations(self, user_habits: List[HabitPattern]) -> List[Dict[str, Any]]:
        """Suggest combinations of existing habits."""
        
        suggestions = []
        
        # Look for habits that could be combined
        time_habits = [h for h in user_habits if h.habit_type in [HabitType.DAILY, HabitType.PERSONAL]]
        
        if len(time_habits) >= 2:
            suggestions.append({
                "name": "Habit stacking",
                "description": "Combine your daily habits for better efficiency",
                "suggestion": "Link habits together to create routines",
                "reason": "Habit stacking increases success rates"
            })
        
        return suggestions
    
    def _check_and_execute_habits(self):
        """Check for habits that should be executed."""
        
        current_time = datetime.now()
        
        for habit_id, habit in self.habit_patterns.items():
            try:
                # Check if habit should be executed
                if (habit.status == HabitStatus.ACTIVE and 
                    habit.next_expected <= current_time and
                    habit.next_expected >= current_time - timedelta(minutes=5)):
                    
                    # Create execution
                    execution = HabitExecution(
                        execution_id=f"exec_{int(time.time() * 1000)}",
                        habit_id=habit_id,
                        user_id=habit.user_id,
                        executed_at=current_time,
                        trigger_reason="scheduled_execution",
                        actions_taken=[],
                        success=False,
                        feedback=None,
                        duration_ms=0.0
                    )
                    
                    # Add to execution queue
                    self.execution_queue.put(execution)
                    
                    # Update habit status
                    habit.status = HabitStatus.COMPLETED
                    habit.last_occurrence = current_time
                    habit.execution_count += 1
                    
                    logger.info(f"[HabitAutomation] Executing habit: {habit.name}")
                    
            except Exception as e:
                logger.error(f"[HabitAutomation] Error checking habit {habit_id}: {e}")
    
    def _process_execution_queue(self):
        """Process the habit execution queue."""
        
        while not self.execution_queue.empty() and self.is_running:
            try:
                execution = self.execution_queue.get(timeout=1.0)
                
                # Execute habit
                self._execute_habit(execution)
                
            except Empty:
                break
            except Exception as e:
                logger.error(f"[HabitAutomation] Error processing execution queue: {e}")
    
    def _execute_habit(self, execution: HabitExecution):
        """Execute a habit."""
        
        start_time = time.time()
        
        try:
            habit = self.habit_patterns.get(execution.habit_id)
            if not habit:
                logger.error(f"[HabitAutomation] Habit not found: {execution.habit_id}")
                return
            
            # Switch to user context
            switch_result = self.kinship.switch_context(execution.user_id, self.limbic, self.memory)
            
            if not switch_result:
                logger.error(f"[HabitAutomation] Failed to switch context for {execution.user_id}")
                return
            
            # Execute habit actions
            for action in habit.actions:
                try:
                    # This would integrate with appropriate systems
                    # For now, just log the action
                    logger.info(f"[HabitAutomation] Executing action: {action}")
                    execution.actions_taken.append(action)
                    
                except Exception as e:
                    logger.error(f"[HabitAutomation] Error executing action {action}: {e}")
            
            # Mark as successful
            execution.success = True
            execution.duration_ms = (time.time() - start_time) * 1000
            
            # Update habit success rate
            self._update_habit_success_rate(execution.habit_id, True)
            
            # Store execution
            self.habit_executions.append(execution)
            if len(self.habit_executions) > 1000:
                self.habit_executions = self.habit_executions[-500:]
            
            logger.info(f"[HabitAutomation] Successfully executed habit: {habit.name}")
            
        except Exception as e:
            logger.error(f"[HabitAutomation] Error executing habit {execution.habit_id}: {e}")
            execution.success = False
            execution.duration_ms = (time.time() - start_time) * 1000
            execution.feedback = str(e)
            
            # Update habit success rate
            self._update_habit_success_rate(execution.habit_id, False)
    
    def _update_habit_success_rate(self, habit_id: str, success: bool):
        """Update habit success rate."""
        
        if habit_id not in self.habit_patterns:
            return
        
        habit = self.habit_patterns[habit_id]
        
        # Get recent executions
        recent_executions = [
            e for e in self.habit_executions
            if e.habit_id == habit_id and 
            (datetime.now() - e.executed_at).days <= 30
        ]
        
        if recent_executions:
            success_count = sum(1 for e in recent_executions if e.success)
            habit.success_rate = success_count / len(recent_executions)
            habit.updated_at = datetime.now()
    
    def _cleanup_old_data(self):
        """Clean up old data."""
        
        cutoff_time = datetime.now() - timedelta(days=90)
        
        # Clean up old executions
        self.habit_executions = [
            e for e in self.habit_executions
            if e.executed_at > cutoff_time
        ]
        
        # Clean up inactive habits
        inactive_habits = [
            habit_id for habit_id, habit in self.habit_patterns.items()
            if habit.last_occurrence < cutoff_time and habit.status != HabitStatus.ACTIVE
        ]
        
        for habit_id in inactive_habits:
            del self.habit_patterns[habit_id]
            logger.info(f"[HabitAutomation] Cleaned up inactive habit: {habit_id}")
    
    def get_user_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all habits for a user."""
        
        user_habit_ids = self.user_habits.get(user_id, [])
        habits = []
        
        for habit_id in user_habit_ids:
            if habit_id in self.habit_patterns:
                habit = self.habit_patterns[habit_id]
                habits.append({
                    "habit_id": habit.habit_id,
                    "name": habit.name,
                    "type": habit.habit_type.value,
                    "description": habit.description,
                    "status": habit.status.value,
                    "confidence": habit.confidence,
                    "success_rate": habit.success_rate,
                    "execution_count": habit.execution_count,
                    "next_expected": habit.next_expected.isoformat(),
                    "last_occurrence": habit.last_occurrence.isoformat()
                })
        
        return habits
    
    def get_habit_suggestions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get habit suggestions for a user."""
        
        return self.habit_suggestions.get(user_id, [])
    
    def get_habit_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get habit analytics for a user."""
        
        user_habits = self.get_user_habits(user_id)
        user_executions = [e for e in self.habit_executions if e.user_id == user_id]
        
        if not user_habits:
            return {"status": "no_habits", "message": "No habits detected yet"}
        
        # Calculate metrics
        total_executions = len(user_executions)
        successful_executions = sum(1 for e in user_executions if e.success)
        overall_success_rate = successful_executions / total_executions if total_executions > 0 else 0
        
        # Habit type distribution
        type_counts = defaultdict(int)
        for habit in user_habits:
            type_counts[habit["type"]] += 1
        
        # Status distribution
        status_counts = defaultdict(int)
        for habit in user_habits:
            status_counts[habit["status"]] += 1
        
        return {
            "total_habits": len(user_habits),
            "total_executions": total_executions,
            "overall_success_rate": overall_success_rate,
            "type_distribution": dict(type_counts),
            "status_distribution": dict(status_counts),
            "most_successful_habit": max(user_habits, key=lambda h: h["success_rate"]) if user_habits else None,
            "least_successful_habit": min(user_habits, key=lambda h: h["success_rate"]) if user_habits else None
        }
    
    def create_custom_habit(self, user_id: str, name: str, description: str, 
                          habit_type: HabitType, trigger_conditions: Dict[str, Any],
                          actions: List[str]) -> str:
        """Create a custom habit for a user."""
        
        habit_id = f"{user_id}_custom_{int(time.time())}"
        
        habit = HabitPattern(
            habit_id=habit_id,
            user_id=user_id,
            name=name,
            habit_type=habit_type,
            description=description,
            trigger_conditions=trigger_conditions,
            actions=actions,
            time_patterns=[],
            confidence=0.8,  # Higher confidence for custom habits
            frequency=1.0,
            last_occurrence=datetime.now(),
            next_expected=self._calculate_next_expected(trigger_conditions),
            status=HabitStatus.ACTIVE,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.habit_patterns[habit_id] = habit
        self.user_habits[user_id].append(habit_id)
        
        logger.info(f"[HabitAutomation] Created custom habit: {name} for {user_id}")
        return habit_id
    
    def enable_automation(self, enabled: bool):
        """Enable or disable habit automation."""
        self.automation_enabled = enabled
        logger.info(f"[HabitAutomation] Automation {'enabled' if enabled else 'disabled'}")
    
    def health_check(self) -> bool:
        """Check if habit automation system is healthy."""
        
        try:
            return (self.is_running and 
                   len(self.pattern_detectors) == 4 and
                   len(self.habit_patterns) >= 0)
        except:
            return False

# Global instance
_habit_automation_system: Optional[HabitAutomationSystem] = None

def get_habit_automation_system(limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem) -> HabitAutomationSystem:
    """Get or create the global habit automation system."""
    global _habit_automation_system
    if _habit_automation_system is None:
        _habit_automation_system = HabitAutomationSystem(limbic_system, memory_system, kinship_system)
    return _habit_automation_system
