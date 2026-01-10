"""
Canonical Spec v5.4.1 Section 10.2: Enhanced Sensor Array
Complete ML-ready behavioral pattern detection with real-time monitoring.
"""

import os
import json
import time
import psutil
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict, field
from pathlib import Path
from collections import defaultdict, deque

logger = logging.getLogger(__name__)


@dataclass
class SystemHealthMetrics:
    """Real-time system health metrics."""
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_sent_mb: float
    network_recv_mb: float
    timestamp: str
    
    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class BehavioralPattern:
    """Detected behavioral pattern with evidence."""
    pattern_id: str
    pattern_type: str  # workload_spike, abandonment, focus_shift, stress
    detected_at: str
    confidence: float
    evidence: Dict[str, Any]
    intervention_suggested: Optional[str] = None
    status: str = "active"  # active, resolved, dismissed
    
    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class FileModificationEvent:
    """File modification event for workload tracking."""
    filepath: str
    timestamp: str
    modification_type: str  # created, modified, deleted
    
    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class FocusSession:
    """Focus session in a specific directory."""
    directory: str
    start_time: str
    end_time: Optional[str]
    duration_minutes: float
    file_count: int
    modification_count: int
    
    def to_dict(self) -> Dict:
        return asdict(self)


class SensorArrayComplete:
    """
    Canonical Spec v5.4.1: Complete Sensor Array
    
    ML-ready behavioral pattern detection with:
    - Workload spike detection
    - Abandonment pattern recognition
    - Focus shift tracking
    - Stress detection
    - System health monitoring
    - Proactive intervention triggers
    """
    
    def __init__(self, data_dir: str = "data/sensors"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Pattern storage
        self.patterns_file = self.data_dir / "patterns.json"
        self.health_log_file = self.data_dir / "health_log.json"
        self.interventions_file = self.data_dir / "interventions.json"
        
        # In-memory tracking
        self.file_modifications: deque = deque(maxlen=100)
        self.window_switches: deque = deque(maxlen=100)
        self.active_patterns: List[BehavioralPattern] = []
        self.focus_sessions: List[FocusSession] = []
        self.current_focus_directory: Optional[str] = None
        self.focus_start_time: Optional[datetime] = None
        
        # Configurable thresholds
        self.config = {
            "workload_spike_threshold": 10,  # modifications in 1 hour
            "abandonment_days": 7,
            "stress_cpu_threshold": 80.0,  # percent
            "stress_window_switches_per_hour": 20,
            "focus_shift_min_duration_minutes": 15,
        }
        
        # Load existing data
        self._load_patterns()
        
        logger.info("Sensor Array Complete initialized")
    
    def _load_patterns(self):
        """Load existing patterns from storage."""
        if self.patterns_file.exists():
            try:
                with open(self.patterns_file, 'r') as f:
                    data = json.load(f)
                    self.active_patterns = [
                        BehavioralPattern(**p) for p in data.get("patterns", [])
                    ]
                logger.info(f"Loaded {len(self.active_patterns)} patterns")
            except Exception as e:
                logger.error(f"Error loading patterns: {e}")
    
    def _save_patterns(self):
        """Save patterns to storage."""
        try:
            with open(self.patterns_file, 'w') as f:
                json.dump({
                    "patterns": [p.to_dict() for p in self.active_patterns],
                    "last_updated": datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving patterns: {e}")
    
    # ========== System Health Monitoring ==========
    
    def get_system_health(self) -> SystemHealthMetrics:
        """
        Get current system health metrics.
        Canonical Spec Section 10.2.1
        """
        try:
            # CPU and Memory
            cpu = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory().percent
            disk = psutil.disk_usage('/').percent
            
            # Network (MB)
            net = psutil.net_io_counters()
            net_sent = net.bytes_sent / (1024 * 1024)
            net_recv = net.bytes_recv / (1024 * 1024)
            
            metrics = SystemHealthMetrics(
                cpu_percent=cpu,
                memory_percent=memory,
                disk_percent=disk,
                network_sent_mb=round(net_sent, 2),
                network_recv_mb=round(net_recv, 2),
                timestamp=datetime.now().isoformat()
            )
            
            # Log to health log
            self._log_health_metrics(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting system health: {e}")
            return SystemHealthMetrics(0, 0, 0, 0, 0, datetime.now().isoformat())
    
    def _log_health_metrics(self, metrics: SystemHealthMetrics):
        """Log health metrics to file."""
        try:
            health_data = []
            if self.health_log_file.exists():
                with open(self.health_log_file, 'r') as f:
                    health_data = json.load(f)
            
            health_data.append(metrics.to_dict())
            
            # Keep last 1000 entries
            if len(health_data) > 1000:
                health_data = health_data[-1000:]
            
            with open(self.health_log_file, 'w') as f:
                json.dump(health_data, f)
                
        except Exception as e:
            logger.error(f"Error logging health metrics: {e}")
    
    # ========== Workload Spike Detection ==========
    
    def record_file_modification(self, filepath: str, modification_type: str = "modified"):
        """
        Record a file modification event.
        Canonical Spec Section 10.2.2
        """
        event = FileModificationEvent(
            filepath=filepath,
            timestamp=datetime.now().isoformat(),
            modification_type=modification_type
        )
        
        self.file_modifications.append(event)
        
        # Check for workload spike
        self._check_workload_spike()
        
        # Track focus shifts
        self._update_focus_tracking(filepath)
    
    def _check_workload_spike(self):
        """Detect workload spikes (>10 mods in 1 hour)."""
        now = datetime.now()
        one_hour_ago = now - timedelta(hours=1)
        
        recent_mods = [
            m for m in self.file_modifications
            if datetime.fromisoformat(m.timestamp) > one_hour_ago
        ]
        
        threshold = self.config["workload_spike_threshold"]
        
        if len(recent_mods) >= threshold:
            # Check if already detected
            existing = any(
                p.pattern_type == "workload_spike" and p.status == "active"
                for p in self.active_patterns
            )
            
            if not existing:
                pattern = BehavioralPattern(
                    pattern_id=f"workload_spike_{int(time.time())}",
                    pattern_type="workload_spike",
                    detected_at=now.isoformat(),
                    confidence=min(1.0, len(recent_mods) / (threshold * 2)),
                    evidence={
                        "modification_count": len(recent_mods),
                        "time_window_hours": 1,
                        "files_affected": list(set(m.filepath for m in recent_mods))
                    },
                    intervention_suggested="yang_offer"  # "Should I help organize?"
                )
                
                self.active_patterns.append(pattern)
                self._save_patterns()
                self._log_intervention(pattern)
                
                logger.info(f"Workload spike detected: {len(recent_mods)} modifications")
    
    # ========== Abandonment Pattern Detection ==========
    
    def check_abandonment_patterns(self, working_dir: str = ".") -> List[BehavioralPattern]:
        """
        Detect files untouched for >7 days after creation.
        Canonical Spec Section 10.2.3
        """
        patterns = []
        now = datetime.now()
        threshold_days = self.config["abandonment_days"]
        
        try:
            for filepath in Path(working_dir).rglob("*"):
                if filepath.is_file():
                    created = datetime.fromtimestamp(filepath.stat().st_ctime)
                    modified = datetime.fromtimestamp(filepath.stat().st_mtime)
                    
                    days_since_creation = (now - created).days
                    days_since_modification = (now - modified).days
                    
                    # Created recently but not touched in threshold days
                    if days_since_creation <= 14 and days_since_modification >= threshold_days:
                        pattern = BehavioralPattern(
                            pattern_id=f"abandonment_{filepath.name}_{int(time.time())}",
                            pattern_type="abandonment",
                            detected_at=now.isoformat(),
                            confidence=min(1.0, days_since_modification / (threshold_days * 2)),
                            evidence={
                                "filepath": str(filepath),
                                "created_at": created.isoformat(),
                                "last_modified": modified.isoformat(),
                                "days_abandoned": days_since_modification
                            },
                            intervention_suggested="gentle_inquiry"  # "Should we revisit Y?"
                        )
                        
                        patterns.append(pattern)
        
        except Exception as e:
            logger.error(f"Error checking abandonment patterns: {e}")
        
        return patterns
    
    # ========== Focus Shift Tracking ==========
    
    def _update_focus_tracking(self, filepath: str):
        """Track focus shifts between directories."""
        directory = str(Path(filepath).parent)
        now = datetime.now()
        
        if self.current_focus_directory is None:
            # First focus session
            self.current_focus_directory = directory
            self.focus_start_time = now
            return
        
        if directory != self.current_focus_directory:
            # Focus shift detected
            if self.focus_start_time:
                duration_minutes = (now - self.focus_start_time).total_seconds() / 60
                
                # Only record if meaningful duration
                if duration_minutes >= self.config["focus_shift_min_duration_minutes"]:
                    session = FocusSession(
                        directory=self.current_focus_directory,
                        start_time=self.focus_start_time.isoformat(),
                        end_time=now.isoformat(),
                        duration_minutes=round(duration_minutes, 2),
                        file_count=0,  # Would track in production
                        modification_count=0
                    )
                    
                    self.focus_sessions.append(session)
                    
                    # Detect focus shift pattern
                    self._detect_focus_shift_pattern(directory, session)
            
            # Start new focus session
            self.current_focus_directory = directory
            self.focus_start_time = now
    
    def _detect_focus_shift_pattern(self, new_directory: str, old_session: FocusSession):
        """Detect significant focus shifts."""
        pattern = BehavioralPattern(
            pattern_id=f"focus_shift_{int(time.time())}",
            pattern_type="focus_shift",
            detected_at=datetime.now().isoformat(),
            confidence=0.75,
            evidence={
                "from_directory": old_session.directory,
                "to_directory": new_directory,
                "session_duration_minutes": old_session.duration_minutes
            },
            intervention_suggested="inquiry"  # "I notice you're focused on X now"
        )
        
        self.active_patterns.append(pattern)
        self._save_patterns()
        logger.info(f"Focus shift: {old_session.directory} → {new_directory}")
    
    # ========== Stress Detection ==========
    
    def check_stress_indicators(self) -> Optional[BehavioralPattern]:
        """
        Detect stress through system metrics.
        Canonical Spec Section 10.2.4
        """
        health = self.get_system_health()
        
        # High CPU usage
        high_cpu = health.cpu_percent > self.config["stress_cpu_threshold"]
        
        # High window switching (if tracked)
        now = datetime.now()
        one_hour_ago = now - timedelta(hours=1)
        recent_switches = [
            s for s in self.window_switches
            if datetime.fromisoformat(s) > one_hour_ago
        ]
        high_switching = len(recent_switches) > self.config["stress_window_switches_per_hour"]
        
        if high_cpu or high_switching:
            # Check if already detected
            existing = any(
                p.pattern_type == "stress" and p.status == "active"
                for p in self.active_patterns
            )
            
            if not existing:
                pattern = BehavioralPattern(
                    pattern_id=f"stress_{int(time.time())}",
                    pattern_type="stress",
                    detected_at=now.isoformat(),
                    confidence=0.85,
                    evidence={
                        "cpu_percent": health.cpu_percent,
                        "window_switches_per_hour": len(recent_switches),
                        "high_cpu": high_cpu,
                        "high_switching": high_switching
                    },
                    intervention_suggested="yin_shift"  # Shift to Companion mode
                )
                
                self.active_patterns.append(pattern)
                self._save_patterns()
                self._log_intervention(pattern)
                
                logger.warning("Stress pattern detected")
                return pattern
        
        return None
    
    def record_window_switch(self):
        """Record a window switch event."""
        self.window_switches.append(datetime.now().isoformat())
    
    # ========== Intervention Logging ==========
    
    def _log_intervention(self, pattern: BehavioralPattern):
        """Log intervention trigger."""
        try:
            interventions = []
            if self.interventions_file.exists():
                with open(self.interventions_file, 'r') as f:
                    interventions = json.load(f)
            
            interventions.append({
                "pattern_id": pattern.pattern_id,
                "pattern_type": pattern.pattern_type,
                "detected_at": pattern.detected_at,
                "intervention": pattern.intervention_suggested,
                "confidence": pattern.confidence,
                "status": "triggered"
            })
            
            with open(self.interventions_file, 'w') as f:
                json.dump(interventions, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error logging intervention: {e}")
    
    # ========== Pattern Management ==========
    
    def get_active_patterns(self, pattern_type: Optional[str] = None) -> List[BehavioralPattern]:
        """Get all active patterns, optionally filtered by type."""
        if pattern_type:
            return [p for p in self.active_patterns if p.pattern_type == pattern_type and p.status == "active"]
        return [p for p in self.active_patterns if p.status == "active"]
    
    def dismiss_pattern(self, pattern_id: str):
        """Dismiss a pattern."""
        for pattern in self.active_patterns:
            if pattern.pattern_id == pattern_id:
                pattern.status = "dismissed"
                self._save_patterns()
                logger.info(f"Pattern dismissed: {pattern_id}")
                break
    
    def resolve_pattern(self, pattern_id: str):
        """Mark pattern as resolved."""
        for pattern in self.active_patterns:
            if pattern.pattern_id == pattern_id:
                pattern.status = "resolved"
                self._save_patterns()
                logger.info(f"Pattern resolved: {pattern_id}")
                break
    
    def get_focus_map(self, hours: int = 24) -> Dict[str, float]:
        """Get time distribution across directories."""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        focus_map = defaultdict(float)
        for session in self.focus_sessions:
            if datetime.fromisoformat(session.start_time) > cutoff:
                focus_map[session.directory] += session.duration_minutes
        
        return dict(focus_map)
    
    def configure_thresholds(self, **kwargs):
        """Update configuration thresholds."""
        for key, value in kwargs.items():
            if key in self.config:
                self.config[key] = value
                logger.info(f"Updated config: {key} = {value}")
    
    def get_pattern_history(self, hours: int = 168) -> List[BehavioralPattern]:
        """Get pattern history for last N hours (default: 1 week)."""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        return [
            p for p in self.active_patterns
            if datetime.fromisoformat(p.detected_at) > cutoff
        ]


# Singleton instance
_sensor_array_instance = None

def get_sensor_array() -> SensorArrayComplete:
    """Get singleton sensor array instance."""
    global _sensor_array_instance
    if _sensor_array_instance is None:
        _sensor_array_instance = SensorArrayComplete()
    return _sensor_array_instance
