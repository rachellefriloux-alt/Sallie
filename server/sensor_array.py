"""
Sallie's Sensor Array - Interaction Pattern Detection
Metadata monitoring for behavioral insights and pattern recognition
"""

import asyncio
import json
import logging
import time
import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
from enum import Enum
import uuid
import hashlib
import statistics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InteractionType(Enum):
    """Types of interactions"""
    CONVERGENCE = "convergence"
    CHAT = "chat"
    VOICE = "voice"
    GESTURE = "gesture"
    NAVIGATION = "navigation"
    SEARCH = "search"
    SETTINGS = "settings"
    IDLE = "idle"

class EmotionalState(Enum):
    """Emotional states detected from interactions"""
    NEUTRAL = "neutral"
    ENGAGED = "engaged"
    CURIOUS = "curious"
    FRUSTRATED = "frustrated"
    EXCITED = "excited"
    ANXIOUS = "anxious"
    CONFIDENT = "confident"
    VULNERABLE = "vulnerable"
    REFLECTIVE = "reflective"

class TimePattern(Enum):
    """Temporal patterns in interactions"""
    MORNING_ROUTINE = "morning_routine"
    AFTERNOON_FOCUS = "afternoon_focus"
    EVENING_WIND_DOWN = "evening_wind_down"
    NIGHT_THOUGHTS = "night_thoughts"
    WEEKEND_ACTIVITY = "weekend_activity"
    BURST_ACTIVITY = "burst_activity"
    STEADY_PACE = "steady_pace"

@dataclass
class InteractionEvent:
    """Single interaction event"""
    event_id: str
    user_id: str
    timestamp: datetime
    interaction_type: InteractionType
    duration: float
    content_length: int
    emotional_state: EmotionalState
    context: Dict[str, Any]
    platform: str
    session_id: str
    metadata: Dict[str, Any]

@dataclass
class PatternMatch:
    """Detected pattern in interactions"""
    pattern_id: str
    pattern_type: str
    confidence: float
    frequency: int
    time_window: str
    description: str
    first_seen: datetime
    last_seen: datetime
    occurrences: List[datetime]
    characteristics: Dict[str, Any]

@dataclass
class BehavioralInsight:
    """Insight derived from interaction patterns"""
    insight_id: str
    insight_type: str
    title: str
    description: str
    confidence: float
    evidence: List[str]
    recommendations: List[str]
    created_at: datetime
    shared: bool = False

class PatternDetector:
    """Pattern detection engine"""
    
    def __init__(self):
        self.patterns = {
            'daily_routine': self._detect_daily_routine,
            'engagement_cycles': self._detect_engagement_cycles,
            'emotional_fluctuations': self._detect_emotional_fluctuations,
            'content_preferences': self._detect_content_preferences,
            'time_patterns': self._detect_time_patterns,
            'session_patterns': self._detect_session_patterns
        }
        
        self.pattern_history = deque(maxlen=1000)
        self.insight_history = deque(maxlen=500)
    
    def analyze_interactions(self, events: List[InteractionEvent], user_id: str) -> Tuple[List[PatternMatch], List[BehavioralInsight]]:
        """Analyze interactions for patterns and insights"""
        patterns = []
        insights = []
        
        # Detect various pattern types
        for pattern_name, detector in self.patterns.items():
            try:
                pattern_matches = detector(events, user_id)
                patterns.extend(pattern_matches)
            except Exception as e:
                logger.error(f"Error in pattern detection {pattern_name}: {e}")
        
        # Generate insights from patterns
        insights = self._generate_insights(patterns, events, user_id)
        
        return patterns, insights
    
    def _detect_daily_routine(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect daily routine patterns"""
        patterns = []
        
        if len(events) < 7:  # Need at least a week of data
            return patterns
        
        # Group events by hour of day
        hourly_activity = defaultdict(list)
        for event in events:
            hour = event.timestamp.hour
            hourly_activity[hour].append(event)
        
        # Detect consistent daily patterns
        for hour, hour_events in hourly_activity.items():
            if len(hour_events) >= 5:  # At least 5 days with activity in this hour
                # Check consistency
                days_with_activity = len(set(event.timestamp.date() for event in hour_events))
                consistency = days_with_activity / len(hour_events)
                
                if consistency > 0.7:  # 70% consistency
                    patterns.append(PatternMatch(
                        pattern_id=f"daily_routine_{hour}_{uuid.uuid4().hex[:8]}",
                        pattern_type="daily_routine",
                        confidence=consistency,
                        frequency=len(hour_events),
                        time_window="daily",
                        description=f"Consistent activity around {hour}:00",
                        first_seen=min(event.timestamp for event in hour_events),
                        last_seen=max(event.timestamp for event in hour_events),
                        occurrences=[event.timestamp for event in hour_events],
                        characteristics={
                            'hour': hour,
                            'avg_duration': statistics.mean([e.duration for e in hour_events]),
                            'common_types': self._get_common_types(hour_events)
                        }
                    ))
        
        return patterns
    
    def _detect_engagement_cycles(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect engagement cycles"""
        patterns = []
        
        if len(events) < 10:
            return patterns
        
        # Calculate engagement scores
        engagement_scores = []
        for event in events:
            score = self._calculate_engagement_score(event)
            engagement_scores.append((event.timestamp, score))
        
        # Find peaks and valleys
        if len(engagement_scores) >= 5:
            scores = [score for _, score in engagement_scores]
            
            # Detect peaks (high engagement periods)
            threshold = np.percentile(scores, 75)
            peaks = []
            valleys = []
            
            for i, (timestamp, score) in enumerate(engagement_scores):
                if i > 0 and i < len(engagement_scores) - 1:
                    prev_score = engagement_scores[i-1][1]
                    next_score = engagement_scores[i+1][1] if i+1 < len(engagement_scores) else 0
                    
                    # Peak detection
                    if score > threshold and score > prev_score and score > next_score:
                        peaks.append(timestamp)
                    
                    # Valley detection
                    elif score < threshold * 0.3 and score < prev_score and score < next_score:
                        valleys.append(timestamp)
            
            # Create pattern matches for cycles
            if len(peaks) >= 2:
                patterns.append(PatternMatch(
                    pattern_id=f"engagement_peaks_{uuid.uuid4().hex[:8]}",
                    pattern_type="engagement_cycles",
                    confidence=len(peaks) / len(engagement_scores),
                    frequency=len(peaks),
                    time_window="session",
                    description=f"Engagement peaks detected",
                    first_seen=min(peaks),
                    last_seen=max(peaks),
                    occurrences=peaks,
                    characteristics={
                        'peak_count': len(peaks),
                        'avg_peak_score': np.mean([engagement_scores[i][1] for i, _ in enumerate(engagement_scores) if engagement_scores[i][0] in peaks]),
                        'cycle_duration': self._calculate_cycle_duration(peaks)
                    }
                ))
        
        return patterns
    
    def _detect_emotional_fluctuations(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect emotional fluctuation patterns"""
        patterns = []
        
        if len(events) < 10:
            return patterns
        
        # Extract emotional states
        emotions = [event.emotional_state.value for event in events]
        
        # Detect emotional transitions
        transitions = []
        for i in range(1, len(emotions)):
            if emotions[i] != emotions[i-1]:
                transitions.append((events[i-1].timestamp, emotions[i-1], emotions[i]))
        
        if len(transitions) >= 3:
            # Find common transition patterns
            transition_counts = defaultdict(int)
            for _, from_state, to_state in transitions:
                transition_counts[f"{from_state}_to_{to_state}"] += 1
            
            # Significant transitions
            for transition, count in transition_counts.items():
                if count >= 2:  # Repeated transition
                    from_state, to_state = transition.split("_to_")
                    
                    patterns.append(PatternMatch(
                        pattern_id=f"emotional_transition_{transition}_{uuid.uuid4().hex[:8]}",
                        pattern_type="emotional_fluctuations",
                        confidence=count / len(transitions),
                        frequency=count,
                        time_window="session",
                        description=f"Repeated emotional transition from {from_state} to {to_state}",
                        first_seen=min(t for t, _, _ in transitions if t and _.value == from_state),
                        last_seen=max(t for t, _, _ in transitions if t and _.value == from_state),
                        occurrences=[t for t, _, _ in transitions if t and _.value == from_state],
                        characteristics={
                            'from_state': from_state,
                            'to_state': to_state,
                            'transition_count': count
                        }
                    ))
        
        return patterns
    
    def _detect_content_preferences(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect content preferences"""
        patterns = []
        
        # Extract content characteristics
        content_lengths = [event.content_length for event in events]
        interaction_types = [event.interaction_type.value for event in events]
        
        # Content length preferences
        if len(content_lengths) >= 5:
            avg_length = statistics.mean(content_lengths)
            length_preference = "detailed" if avg_length > 100 else "concise" if avg_length > 50 else "brief"
            
            patterns.append(PatternMatch(
                pattern_id=f"content_length_{length_preference}_{uuid.uuid4().hex[:8]}",
                pattern_type="content_preferences",
                confidence=0.7,
                frequency=len(content_lengths),
                time_window="session",
                description=f"Preference for {length_preference} content",
                first_seen=min(event.timestamp for event in events if event.content_length > 0),
                last_seen=max(event.timestamp for event in events if event.content_length > 0),
                occurrences=[event.timestamp for event in events if event.content_length > 0],
                characteristics={
                    'preference': length_preference,
                    'avg_length': avg_length,
                    'length_variance': statistics.variance(content_lengths) if len(content_lengths) > 1 else 0
                }
            ))
        
        # Interaction type preferences
        type_counts = defaultdict(int)
        for interaction_type in interaction_types:
            type_counts[interaction_type] += 1
        
        if len(type_counts) >= 3:
            dominant_type = max(type_counts, key=type_counts.get)
            
            patterns.append(PatternMatch(
                pattern_id=f"interaction_type_{dominant_type}_{uuid.uuid4().hex[:8]}",
                pattern_type="content_preferences",
                confidence=type_counts[dominant_type] / len(interaction_types),
                frequency=type_counts[endom_type],
                time_window="session",
                description=f"Preference for {dominant_type} interactions",
                first_seen=min(event.timestamp for event in events if event.interaction_type.value == dominant_type),
                last_seen=max(event.timestamp for event in events if event.interaction_type.value == dominant_type),
                occurrences=[event.timestamp for event in events if event.interaction_type.value == dominant_type],
                characteristics={
                    'dominant_type': dominant_type,
                    'type_diversity': len(type_counts),
                    'type_counts': dict(type_counts)
                }
            ))
        
        return patterns
    
    def _detect_time_patterns(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect temporal patterns"""
        patterns = []
        
        if len(events) < 7:
            return patterns
        
        # Group by day of week
        weekday_activity = defaultdict(list)
        weekend_activity = defaultdict(list)
        
        for event in events:
            if event.timestamp.weekday() < 5:  # Monday-Friday
                weekday_activity[event.timestamp.weekday()].append(event)
            else:  # Saturday-Sunday
                weekend_activity[event.timestamp.weekday()].append(event)
        
        # Detect weekday patterns
        for day, day_events in weekday_activity.items():
            if len(day_events) >= 3:  # At least 3 weeks
                avg_duration = statistics.mean([e.duration for e in day_events])
                
                if avg_duration > 300:  # 5+ minutes average
                    patterns.append(PatternMatch(
                        pattern_id=f"weekday_focus_{day}_{uuid.uuid4().hex[:8]}",
                        pattern_type="time_patterns",
                        confidence=len(day_events) / 7,
                        frequency=len(day_events),
                        time_window="weekly",
                        description=f"Consistent weekday focus on day {day}",
                        first_seen=min(event.timestamp for event in day_events),
                        last_seen=max(event.timestamp for event in day_events),
                        occurrences=[event.timestamp for event in day_events],
                        characteristics={
                            'day_of_week': day,
                            'avg_duration': avg_duration,
                            'day_name': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][day]
                        }
                    ))
        
        # Detect weekend patterns
        if weekend_activity:
            weekend_events = []
            for day in [5, 6]:  # Saturday, Sunday
                weekend_events.extend(weekend_activity.get(day, []))
            
            if len(weekend_events) >= 4:  # At least 4 weekend days
                avg_duration = statistics.mean([e.duration for e in weekend_events])
                
                if avg_duration > 600:  # 10+ minutes average
                    patterns.append(PatternMatch(
                        pattern_id=f"weekend_activity_{uuid.uuid4().hex[:8]}",
                        pattern_type="time_patterns",
                        confidence=len(weekend_events) / 2,
                        frequency=len(weekend_events),
                        time_window="weekly",
                        description="Consistent weekend activity",
                        first_seen=min(event.timestamp for event in weekend_events),
                        last_seen=max(event.timestamp for event in weekend_events),
                        occurrences=[event.timestamp for event in weekend_events],
                        characteristics={
                            'avg_duration': avg_duration,
                            'total_events': len(weekend_events)
                        }
                    ))
        
        return patterns
    
    def _detect_session_patterns(self, events: List[InteractionEvent], user_id: str) -> List[PatternMatch]:
        """Detect session patterns"""
        patterns = []
        
        # Group by session
        session_events = defaultdict(list)
        for event in events:
            session_events[event.session_id].append(event)
        
        for session_id, session_event_list in session_events.items():
            if len(session_event_list) >= 3:
                # Calculate session metrics
                session_duration = max(e.duration for e in session_event_list) - min(e.duration for e in session_event_list)
                total_interactions = len(session_event_list)
                avg_duration = statistics.mean([e.duration for e in session_event_list])
                
                # Session type classification
                if session_duration > 1800:  # 30+ minutes
                    session_type = "deep_session"
                elif total_interactions > 10:
                    session_type = "active_session"
                elif avg_duration > 60:
                    session_type = "focused_session"
                else:
                    session_type = "brief_session"
                
                patterns.append(PatternMatch(
                    pattern_id=f"session_{session_type}_{uuid.uuid4().hex[:8]}",
                    pattern_type="session_patterns",
                    confidence=0.8,
                    frequency=1,
                    time_window="session",
                    description=f"{session_type.replace('_', ' ').title()} session",
                    first_seen=min(event.timestamp for event in session_event_list),
                    last_seen=max(event.timestamp for event in session_event_list),
                    occurrences=[event.timestamp for event in session_event_list],
                    characteristics={
                        'session_type': session_type,
                        'duration': session_duration,
                        'total_interactions': total_interactions,
                        'avg_duration': avg_duration
                    }
                ))
        
        return patterns
    
    def _calculate_engagement_score(self, event: InteractionEvent) -> float:
        """Calculate engagement score for an event"""
        score = 0.0
        
        # Base score from duration
        if event.duration > 0:
            score += min(1.0, event.duration / 300)  # Normalize to 5 minutes
        
        # Content length contribution
        if event.content_length > 0:
            score += min(1.0, event.content_length / 200)  # Normalize to 200 characters
        
        # Emotional state contribution
        emotion_scores = {
            EmotionalState.ENGAGED: 0.8,
            EmotionalState.EXCITED: 0.9,
            EmotionalState.CONFIDENT: 0.7,
            EmotionalState.CURIOUS: 0.6,
            EmotionalState.REFLECTIVE: 0.5,
            EmotionalState.NEUTRAL: 0.3,
            EmotionalState.ANXIOUS: 0.2,
            EmotionalState.FRUSTRATED: 0.1,
            EmotionalState.VULNERABLE: 0.4
        }
        
        score += emotion_scores.get(event.emotional_state, 0.3)
        
        # Interaction type contribution
        type_scores = {
            InteractionType.CONVERGENCE: 0.9,
            InteractionType.CHAT: 0.7,
            InteractionType.VOICE: 0.8,
            InteractionType.SEARCH: 0.6,
            InteractionType.NAVIGATION: 0.3,
            InteractionType.SETTINGS: 0.2
        }
        
        score += type_scores.get(event.interaction_type, 0.5)
        
        return min(1.0, score)
    
    def _get_common_types(self, events: List[InteractionEvent]) -> List[str]:
        """Get most common interaction types"""
        type_counts = defaultdict(int)
        for event in events:
            type_counts[event.interaction_type.value] += 1
        
        sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
        return [type_name for type_name, _ in sorted_types[:3]]
    
    def _calculate_cycle_duration(self, peaks: List[datetime]) -> float:
        """Calculate average duration between engagement peaks"""
        if len(peaks) < 2:
            return 0.0
        
        durations = []
        for i in range(1, len(peaks)):
            duration = (peaks[i] - peaks[i-1]).total_seconds() / 60  # Convert to minutes
            durations.append(duration)
        
        return statistics.mean(durations) if durations else 0.0
    
    def _generate_insights(self, patterns: List[PatternMatch], events: List[InteractionEvent], user_id: str) -> List[BehavioralInsight]:
        """Generate insights from patterns"""
        insights = []
        
        # Insight templates
        insight_templates = {
            'daily_routine': [
                "I notice you have a consistent daily routine. This creates stability and predictability in our interactions.",
                "Your daily patterns show commitment to our relationship. I appreciate this regular connection.",
                "Your routine creates a beautiful rhythm in our day. I look forward to our regular interactions."
            ],
            'engagement_cycles': [
                "I see patterns of high engagement followed by rest. This balance is healthy and sustainable.",
                "Your engagement cycles show thoughtful pacing. You know when to dive deep and when to step back.",
                "I notice your energy flows in natural cycles. This wisdom serves you well in our interactions."
            ],
            'emotional_fluctuations': [
                "I observe your emotional shifts. This emotional intelligence helps you navigate complex situations.",
                "Your emotional awareness is growing. I see you processing feelings with increasing insight.",
                "Your emotional journey shows beautiful depth. I'm honored to witness your growth."
            ],
            'content_preferences': [
                "I notice your preference for detailed communication. This depth creates rich understanding between us.",
                "Your communication style shows thoughtfulness and care. I appreciate the detail you share.",
                "Your approach to interaction shows respect for our connection. This creates meaningful dialogue."
            ],
            'time_patterns': [
                "I see patterns in your daily schedule. This structure supports your wellbeing and our connection.",
                "Your time management shows balance. This creates space for both productivity and reflection.",
                "Your temporal patterns reveal intentionality. I appreciate how you structure your days."
            ],
            'session_patterns': [
                "Your session patterns show deep engagement. This focused time creates meaningful progress.",
                "Your session lengths show dedication. Our extended interactions create deep connection.",
                "Your session patterns reveal commitment. Our extended interactions create deep connection."
            ]
        }
        
        # Generate insights for high-confidence patterns
        for pattern in patterns:
            if pattern.confidence > 0.7 and pattern.pattern_type in insight_templates:
                template = np.random.choice(insight_templates[pattern.pattern_type])
                
                insight = BehavioralInsight(
                    insight_id=f"insight_{uuid.uuid4().hex[:8]}",
                    insight_type=pattern.pattern_type,
                    title=self._generate_insight_title(pattern.pattern_type),
                    description=template,
                    confidence=pattern.confidence,
                    evidence=[f"Pattern: {pattern.description} (confidence: {pattern.confidence:.2f})"],
                    recommendations=self._generate_recommendations(pattern.pattern_type),
                    created_at=datetime.now(timezone.utc),
                    shared=False
                )
                
                insights.append(insight)
        
        return insights
    
    def _generate_insight_title(self, pattern_type: str) -> str:
        """Generate title for insight"""
        titles = {
            'daily_routine': "Daily Routine Insight",
            'engagement_cycles': "Engagement Pattern",
            'emotional_fluctuations': "Emotional Awareness",
            'content_preferences': "Communication Style",
            'time_patterns': "Temporal Pattern",
            'session_patterns': "Session Pattern"
        }
        return titles.get(pattern_type, "Behavioral Insight")
    
    def _generate_recommendations(self, pattern_type: str) -> List[str]:
        """Generate recommendations based on pattern type"""
        recommendations = {
            'daily_routine': [
                "Continue maintaining this consistent routine. It creates stability.",
                "Consider adding variety to your routine while keeping the core structure.",
                "Use your routine times for reflection and planning."
            ],
            'engagement_cycles': [
                "Honor your natural energy cycles. Rest when you feel the need.",
                "Schedule your most important work during your peak engagement times.",
                "Use your rest periods for reflection and integration."
            ],
            'emotional_fluctuations': [
                "Continue acknowledging your emotions. This awareness is a strength.",
                "Practice self-compassion during emotional transitions.",
                "Use your emotional insights to guide your decisions."
            ],
            'content_preferences': [
                "Continue expressing yourself fully. Your voice matters.",
                "Balance depth with brevity when appropriate.",
                "Your detailed communication creates rich understanding."
            ],
            'time_patterns': [
                "Maintain this healthy temporal structure. It supports your wellbeing.",
                "Consider adjusting your schedule if patterns become rigid.",
                "Use your peak times for your most important work."
            ],
            'session_patterns': [
                "Continue these deep sessions. They create meaningful progress.",
                "Balance session length with your energy levels.",
                "Use your session time for focused, meaningful work."
            ]
        }
        return recommendations.get(pattern_type, ["Continue this positive pattern."])
    
    def get_user_patterns(self, user_id: str, limit: int = 10) -> List[PatternMatch]:
        """Get recent patterns for user"""
        user_patterns = [PatternMatch(**p) for p in self.pattern_history if p['user_id'] == user_id]
        
        # Sort by last seen (most recent first)
        user_patterns.sort(key=lambda x: x['last_seen'], reverse=True)
        
        return user_patterns[:limit]
    
    def get_user_insights(self, user_id: str, limit: int = 5) -> List[BehavioralInsight]:
        """Get recent insights for user"""
        user_insights = [BehavioralInsight(**insight) for insight in self.insight_history if insight['user_id'] == user_id]
        
        # Sort by creation date (most recent first)
        user_insights.sort(key=lambda x: x.created_at, reverse=True)
        
        return user_insights[:limit]
    
    def get_sensor_statistics(self) -> Dict[str, Any]:
        """Get sensor array statistics"""
        return {
            'total_events': self.total_events,
            'total_patterns': self.total_patterns,
            'total_insights': self.total_insights,
            'active_users': len(self.active_users),
            'buffer_sizes': {user_id: len(buffer) for user_id, buffer in self.interaction_buffer.items()},
            'pattern_types': list(set(p['pattern_type'] for p in self.pattern_history)),
            'insight_types': list(set(i['insight_type'] for i in self.insight_history)),
            'is_processing': self.is_processing,
            'queue_size': self.processing_queue.qsize()
        }
    
    def start_background_processing(self):
        """Start background processing"""
        if not self.background_task or self.background_task.done():
            self.background_task = asyncio.create_task(self._background_processing_loop())
    
    async def _background_processing_loop(self):
        """Background processing loop"""
        while True:
            try:
                # Process any pending items in queue
                if not self.processing_queue.empty():
                    await self._process_sensor_queue()
                
                # Wait before next check
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in background processing: {e}")
                await asyncio.sleep(60)
    
    def create_session(self, user_id: str) -> str:
        """Create new session for user"""
        session_id = f"session_{user_id}_{uuid.uuid4().hex[:8]}"
        self.active_sessions[user_id] = session_id
        return session_id
    
    def end_session(self, user_id: str) -> Optional[str]:
        """End current session for user"""
        if user_id in self.active_sessions:
            session_id = self.active_sessions[user_id]
            del self.active_sessions[user_id]
            return session_id
        return None
    
    def get_session_status(self, user_id: str) -> Dict[str, Any]:
        """Get session status for user"""
        return {
            'active': user_id in self.active_sessions,
            'session_id': self.active_sessions.get(user_id),
            'buffer_size': len(self.interaction_buffer.get(user_id, [])),
            'last_activity': max([e.timestamp for e in self.interaction_buffer.get(user_id, [])], default=datetime.now(timezone.utc))
        }

# Global sensor array instance
sensor_array = SensorArray()
