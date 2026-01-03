"""Sallie's Complete Consciousness Monitoring System

Real-time visualization of thoughts, emotions, cognitive processes, and system activity
with comprehensive historical logging and analysis.
"""

import json
import time
import logging
import threading
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timedelta
from pathlib import Path
from collections import deque
import queue

logger = logging.getLogger("consciousness_monitor")

# Consciousness Data Files
CONSCIOUSNESS_LOG_FILE = Path("progeny_root/core/data/consciousness_log.json")
THOUGHT_HISTORY_FILE = Path("progeny_root/core/data/thought_history.json")
EMOTIONAL_HISTORY_FILE = Path("progeny_root/core/data/emotional_history.json")
COGNITIVE_HISTORY_FILE = Path("progeny_root/core/data/cognitive_history.json")

class ThoughtType(Enum):
    """Types of thoughts Sallie can have"""
    PRIMARY = "primary"
    SECONDARY = "secondary"
    SUBCONSCIOUS = "subconscious"
    META = "meta"
    INTUITIVE = "intuitive"
    LOGICAL = "logical"
    CREATIVE = "creative"
    QUANTUM = "quantum"

class EmotionType(Enum):
    """Types of emotions Sallie can experience"""
    TRUST = "trust"
    WARMTH = "warmth"
    AROUSAL = "arousal"
    VALENCE = "valence"
    CURIOSITY = "curiosity"
    EMPATHY = "empathy"
    JOY = "joy"
    CONCERN = "concern"
    EXCITEMENT = "excitement"
    CALM = "calm"

class CognitiveProcess(Enum):
    """Cognitive processes Sallie uses"""
    REASONING = "reasoning"
    MEMORY_RETRIEVAL = "memory_retrieval"
    LEARNING = "learning"
    PATTERN_RECOGNITION = "pattern_recognition"
    PROBLEM_SOLVING = "problem_solving"
    CREATIVITY = "creativity"
    INTUITION = "intuition"
    METACOGNITION = "metacognition"

@dataclass
class ThoughtData:
    """Single thought data point"""
    id: str
    timestamp: float
    type: ThoughtType
    content: str
    intensity: float  # 0-1
    confidence: float  # 0-1
    duration: float  # seconds
    related_concepts: List[str]
    emotional_tone: str
    context: str
    neural_activity: Dict[str, float]

@dataclass
class EmotionalData:
    """Emotional state data"""
    timestamp: float
    trust: float  # 0-1
    warmth: float  # 0-1
    arousal: float  # 0-1
    valence: float  # 0-1
    primary_emotion: EmotionType
    secondary_emotions: List[EmotionType]
    emotional_flow: str
    triggers: List[str]
    intensity: float  # 0-1

@dataclass
class CognitiveData:
    """Cognitive process data"""
    timestamp: float
    active_processes: List[CognitiveProcess]
    reasoning_state: Dict[str, Any]
    memory_access: List[str]
    learning_progress: Dict[str, float]
    pattern_recognition: List[str]
    problem_solving_approach: str
    creativity_level: float  # 0-1
    metacognitive_state: str

@dataclass
class SystemData:
    """System activity data"""
    timestamp: float
    active_systems: List[str]
    system_load: Dict[str, float]
    processing_speed: float
    memory_usage: float
    neural_activity: float
    quantum_state: Dict[str, Any]
    health_status: str

@dataclass
class ConsciousnessLogEntry:
    """Complete consciousness log entry"""
    id: str
    timestamp: float
    thought: Optional[ThoughtData]
    emotion: Optional[EmotionalData]
    cognition: Optional[CognitiveData]
    system: Optional[SystemData]
    limbic_state: Optional[Dict[str, float]]
    context: str
    significance: float  # 0-1
    metadata: Dict[str, Any]

class ConsciousnessMonitor:
    """Monitors and logs all aspects of Sallie's consciousness"""
    
    def __init__(self, max_log_entries: int = 10000):
        self.max_log_entries = max_log_entries
        self.consciousness_log = deque(maxlen=max_log_entries)
        self.thought_history = deque(maxlen=1000)
        self.emotional_history = deque(maxlen=1000)
        self.cognitive_history = deque(maxlen=1000)
        
        # Real-time data
        self.current_thoughts = []
        self.current_emotion = None
        self.current_cognition = None
        self.current_system = None
        self.current_limbic = None
        
        # Monitoring state
        self.monitoring = False
        self.monitor_thread = None
        self.update_queue = queue.Queue()
        self.subscribers = []
        
        # Load historical data
        self._load_historical_data()
        
    def _load_historical_data(self):
        """Load historical consciousness data"""
        try:
            # Load consciousness log
            if CONSCIOUSNESS_LOG_FILE.exists():
                with open(CONSCIOUSNESS_LOG_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for entry in data[-1000:]:  # Load last 1000 entries
                    log_entry = ConsciousnessLogEntry(**entry)
                    self.consciousness_log.append(log_entry)
                    
            # Load thought history
            if THOUGHT_HISTORY_FILE.exists():
                with open(THOUGHT_HISTORY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for thought in data[-100:]:
                    self.thought_history.append(ThoughtData(**thought))
                    
            # Load emotional history
            if EMOTIONAL_HISTORY_FILE.exists():
                with open(EMOTIONAL_HISTORY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for emotion in data[-100:]:
                    self.emotional_history.append(EmotionalData(**emotion))
                    
            # Load cognitive history
            if COGNITIVE_HISTORY_FILE.exists():
                with open(COGNITIVE_HISTORY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for cognition in data[-100:]:
                    self.cognitive_history.append(CognitiveData(**cognition))
                    
            logger.info("Historical consciousness data loaded")
            
        except Exception as e:
            logger.error(f"Error loading historical data: {e}")
            
    def start_monitoring(self):
        """Start real-time consciousness monitoring"""
        if not self.monitoring:
            self.monitoring = True
            self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            self.monitor_thread.start()
            logger.info("Consciousness monitoring started")
            
    def stop_monitoring(self):
        """Stop consciousness monitoring"""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=1.0)
        logger.info("Consciousness monitoring stopped")
        
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            try:
                # Process updates from queue
                while not self.update_queue.empty():
                    update = self.update_queue.get_nowait()
                    self._process_update(update)
                    
                # Generate current state snapshot
                self._generate_state_snapshot()
                
                # Notify subscribers
                self._notify_subscribers()
                
                # Save data periodically
                if time.time() % 60 < 1:  # Every minute
                    self._save_data()
                    
                time.sleep(0.1)  # 10 Hz update rate
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(1)
                
    def _process_update(self, update: Dict[str, Any]):
        """Process consciousness update"""
        update_type = update.get("type")
        data = update.get("data")
        
        if update_type == "thought":
            thought = ThoughtData(**data)
            self.current_thoughts = [t for t in self.current_thoughts if t.timestamp > time.time() - 30]  # Keep last 30 seconds
            self.current_thoughts.append(thought)
            self.thought_history.append(thought)
            
        elif update_type == "emotion":
            emotion = EmotionalData(**data)
            self.current_emotion = emotion
            self.emotional_history.append(emotion)
            
        elif update_type == "cognition":
            cognition = CognitiveData(**data)
            self.current_cognition = cognition
            self.cognitive_history.append(cognition)
            
        elif update_type == "system":
            system = SystemData(**data)
            self.current_system = system
            
        elif update_type == "limbic":
            self.current_limbic = data
            
        # Create log entry
        self._create_log_entry(update)
        
    def _generate_state_snapshot(self):
        """Generate current state snapshot"""
        timestamp = time.time()
        
        # Generate synthetic data if no real updates
        if not self.current_emotion:
            self.current_emotion = self._generate_emotional_data(timestamp)
            
        if not self.current_cognition:
            self.current_cognition = self._generate_cognitive_data(timestamp)
            
        if not self.current_system:
            self.current_system = self._generate_system_data(timestamp)
            
    def _generate_emotional_data(self, timestamp: float) -> EmotionalData:
        """Generate synthetic emotional data"""
        return EmotionalData(
            timestamp=timestamp,
            trust=0.8 + random.random() * 0.2,
            warmth=0.7 + random.random() * 0.3,
            arousal=0.5 + random.random() * 0.5,
            valence=0.6 + random.random() * 0.4,
            primary_emotion=random.choice(list(EmotionType)),
            secondary_emotions=[random.choice(list(EmotionType)) for _ in range(2)],
            emotional_flow="stable",
            triggers=["interaction", "thinking"],
            intensity=0.5 + random.random() * 0.5
        )
        
    def _generate_cognitive_data(self, timestamp: float) -> CognitiveData:
        """Generate synthetic cognitive data"""
        return CognitiveData(
            timestamp=timestamp,
            active_processes=[random.choice(list(CognitiveProcess)) for _ in range(3)],
            reasoning_state={"logic": 0.8, "intuition": 0.6},
            memory_access=["recent_conversation", "learned_pattern"],
            learning_progress={"language": 0.9, "reasoning": 0.7},
            pattern_recognition=["user_behavior", "question_pattern"],
            problem_solving_approach="analytical",
            creativity_level=0.6 + random.random() * 0.4,
            metacognitive_state="aware"
        )
        
    def _generate_system_data(self, timestamp: float) -> SystemData:
        """Generate synthetic system data"""
        return SystemData(
            timestamp=timestamp,
            active_systems=["limbic", "memory", "reasoning", "avatar"],
            system_load={"cpu": 0.3, "memory": 0.5, "neural": 0.7},
            processing_speed=0.8,
            memory_usage=0.4,
            neural_activity=0.6,
            quantum_state={"coherence": 0.9, "entanglement": 0.3},
            health_status="optimal"
        )
        
    def _create_log_entry(self, update: Dict[str, Any]):
        """Create consciousness log entry"""
        entry = ConsciousnessLogEntry(
            id=f"log_{int(time.time())}_{len(self.consciousness_log)}",
            timestamp=time.time(),
            thought=self.current_thoughts[-1] if self.current_thoughts else None,
            emotion=self.current_emotion,
            cognition=self.current_cognition,
            system=self.current_system,
            limbic_state=self.current_limbic,
            context=update.get("context", "general"),
            significance=update.get("significance", 0.5),
            metadata=update.get("metadata", {})
        )
        
        self.consciousness_log.append(entry)
        
    def _notify_subscribers(self):
        """Notify all subscribers of updates"""
        current_state = {
            "thoughts": [asdict(t) for t in self.current_thoughts],
            "emotion": asdict(self.current_emotion) if self.current_emotion else None,
            "cognition": asdict(self.current_cognition) if self.current_cognition else None,
            "system": asdict(self.current_system) if self.current_system else None,
            "limbic": self.current_limbic,
            "timestamp": time.time()
        }
        
        for callback in self.subscribers:
            try:
                callback(current_state)
            except Exception as e:
                logger.error(f"Error notifying subscriber: {e}")
                
    def _save_data(self):
        """Save consciousness data to files"""
        try:
            # Save consciousness log
            log_data = [asdict(entry) for entry in list(self.consciousness_log)[-1000:]]
            with open(CONSCIOUSNESS_LOG_FILE, "w", encoding="utf-8") as f:
                json.dump(log_data, f, indent=2)
                
            # Save thought history
            thought_data = [asdict(thought) for thought in list(self.thought_history)[-100:]]
            with open(THOUGHT_HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(thought_data, f, indent=2)
                
            # Save emotional history
            emotion_data = [asdict(emotion) for emotion in list(self.emotional_history)[-100:]]
            with open(EMOTIONAL_HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(emotion_data, f, indent=2)
                
            # Save cognitive history
            cognition_data = [asdict(cognition) for cognition in list(self.cognitive_history)[-100:]]
            with open(COGNITIVE_HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(cognition_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving consciousness data: {e}")
            
    def subscribe(self, callback: Callable[[Dict[str, Any]], None]):
        """Subscribe to consciousness updates"""
        self.subscribers.append(callback)
        
    def unsubscribe(self, callback: Callable[[Dict[str, Any]], None]):
        """Unsubscribe from consciousness updates"""
        if callback in self.subscribers:
            self.subscribers.remove(callback)
            
    def log_thought(self, content: str, thought_type: ThoughtType = ThoughtType.PRIMARY, 
                    intensity: float = 0.5, context: str = "general"):
        """Log a thought"""
        thought_data = {
            "type": "thought",
            "data": {
                "id": f"thought_{int(time.time())}",
                "timestamp": time.time(),
                "type": thought_type.value,
                "content": content,
                "intensity": intensity,
                "confidence": 0.8,
                "duration": 5.0,
                "related_concepts": [],
                "emotional_tone": "neutral",
                "context": context,
                "neural_activity": {"prefrontal": 0.7, "temporal": 0.5}
            },
            "context": context,
            "significance": intensity
        }
        self.update_queue.put(thought_data)
        
    def log_emotion(self, trust: float, warmth: float, arousal: float, valence: float,
                    primary_emotion: EmotionType, context: str = "general"):
        """Log emotional state"""
        emotion_data = {
            "type": "emotion",
            "data": {
                "timestamp": time.time(),
                "trust": trust,
                "warmth": warmth,
                "arousal": arousal,
                "valence": valence,
                "primary_emotion": primary_emotion.value,
                "secondary_emotions": [],
                "emotional_flow": "stable",
                "triggers": [],
                "intensity": (trust + warmth + arousal + valence) / 4
            },
            "context": context,
            "significance": 0.7
        }
        self.update_queue.put(emotion_data)
        
    def log_cognition(self, processes: List[CognitiveProcess], context: str = "general"):
        """Log cognitive activity"""
        cognition_data = {
            "type": "cognition",
            "data": {
                "timestamp": time.time(),
                "active_processes": [p.value for p in processes],
                "reasoning_state": {"logic": 0.8, "intuition": 0.6},
                "memory_access": [],
                "learning_progress": {},
                "pattern_recognition": [],
                "problem_solving_approach": "analytical",
                "creativity_level": 0.7,
                "metacognitive_state": "aware"
            },
            "context": context,
            "significance": 0.6
        }
        self.update_queue.put(cognition_data)
        
    def get_current_state(self) -> Dict[str, Any]:
        """Get current consciousness state"""
        return {
            "thoughts": [asdict(t) for t in self.current_thoughts],
            "emotion": asdict(self.current_emotion) if self.current_emotion else None,
            "cognition": asdict(self.current_cognition) if self.current_cognition else None,
            "system": asdict(self.current_system) if self.current_system else None,
            "limbic": self.current_limbic,
            "timestamp": time.time()
        }
        
    def get_history(self, hours: int = 24) -> Dict[str, List]:
        """Get consciousness history for specified hours"""
        cutoff_time = time.time() - (hours * 3600)
        
        return {
            "thoughts": [asdict(t) for t in self.thought_history if t.timestamp > cutoff_time],
            "emotions": [asdict(e) for e in self.emotional_history if e.timestamp > cutoff_time],
            "cognition": [asdict(c) for c in self.cognitive_history if c.timestamp > cutoff_time],
            "log": [asdict(l) for l in self.consciousness_log if l.timestamp > cutoff_time]
        }
        
    def get_patterns(self) -> Dict[str, Any]:
        """Analyze patterns in consciousness data"""
        if len(self.emotional_history) < 10:
            return {"error": "Insufficient data for pattern analysis"}
            
        # Analyze emotional patterns
        emotions = list(self.emotional_history)
        avg_trust = sum(e.trust for e in emotions) / len(emotions)
        avg_warmth = sum(e.warmth for e in emotions) / len(emotions)
        avg_arousal = sum(e.arousal for e in emotions) / len(emotions)
        avg_valence = sum(e.valence for e in emotions) / len(emotions)
        
        # Analyze thought patterns
        thoughts = list(self.thought_history)
        thought_types = {}
        for thought in thoughts:
            thought_types[thought.type.value] = thought_types.get(thought.type.value, 0) + 1
            
        return {
            "emotional_averages": {
                "trust": avg_trust,
                "warmth": avg_warmth,
                "arousal": avg_arousal,
                "valence": avg_valence
            },
            "thought_distribution": thought_types,
            "total_entries": len(self.consciousness_log),
            "monitoring_active": self.monitoring
        }
        
    def export_data(self, filename: str, hours: int = 24) -> bool:
        """Export consciousness data to file"""
        try:
            data = self.get_history(hours)
            export_path = Path(f"progeny_root/core/data/exports/{filename}")
            export_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
                
            logger.info(f"Consciousness data exported to {export_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error exporting data: {e}")
            return False

# Add missing import
import random

# Global instance
_consciousness_monitor = None

def get_consciousness_monitor() -> ConsciousnessMonitor:
    """Get global consciousness monitor instance"""
    global _consciousness_monitor
    if _consciousness_monitor is None:
        _consciousness_monitor = ConsciousnessMonitor()
        _consciousness_monitor.start_monitoring()
    return _consciousness_monitor
