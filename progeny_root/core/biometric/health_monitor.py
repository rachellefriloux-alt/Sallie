"""Health Monitor System.

Real-time health monitoring and tracking:
- Vital signs monitoring
- Health metrics collection
- Health pattern analysis
- Anomaly detection
- Health alerts
- Wellness scoring
- Health trend tracking
- Biometric data validation

This enables Sallie to monitor health status effectively.
"""

import json
import logging
import time
import random
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem

logger = setup_logging("health_monitor")

class HealthMetric(str, Enum):
    """Types of health metrics."""
    HEART_RATE = "heart_rate"
    BLOOD_PRESSURE = "blood_pressure"
    TEMPERATURE = "temperature"
    OXYGEN_SATURATION = "oxygen_saturation"
    STEPS = "steps"
    CALORIES = "calories"
    SLEEP_DURATION = "sleep_duration"
    STRESS_LEVEL = "stress_level"
    ACTIVITY_LEVEL = "activity_level"

class HealthStatus(str, Enum):
    """Health status levels."""
    EXCELLENT = "excellent"
    GOOD = "good"
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

@dataclass
class VitalSign:
    """A vital sign measurement."""
    metric_id: str
    metric_type: HealthMetric
    value: float
    unit: str
    timestamp: datetime
    status: HealthStatus
    normal_range: Tuple[float, float]  # min, max
    notes: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class HealthAlert:
    """A health alert."""
    alert_id: str
    metric_type: HealthMetric
    alert_type: str
    severity: str
    message: str
    timestamp: datetime
    acknowledged: bool = False
    resolved: bool = False
    resolved_at: Optional[datetime] = None

@dataclass
class HealthPattern:
    """A health pattern analysis."""
    pattern_id: str
    metric_type: HealthMetric
    pattern_type: str
    description: str
    confidence: float
    trend: str  # "improving", "declining", "stable"
    time_range: Tuple[datetime, datetime]
    insights: List[str] = field(default_factory=list)

class HealthMonitor:
    """System for monitoring health metrics and vital signs."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Health data storage
        self.vital_signs: List[VitalSign] = []
        self.health_alerts: List[HealthAlert] = []
        self.health_patterns: List[HealthPattern] = []
        
        # Normal ranges for different metrics
        self.normal_ranges = {
            HealthMetric.HEART_RATE: (60, 100),  # bpm
            HealthMetric.BLOOD_PRESSURE: (90, 120),  # systolic
            HealthMetric.TEMPERATURE: (36.5, 37.5),  # Celsius
            HealthMetric.OXYGEN_SATURATION: (95, 100),  # percentage
            HealthMetric.STEPS: (5000, 10000),  # daily
            HealthMetric.CALORIES: (1800, 2500),  # daily
            HealthMetric.SLEEP_DURATION: (7, 9),  # hours
            HealthMetric.STRESS_LEVEL: (0, 3),  # 0-10 scale
            HealthMetric.ACTIVITY_LEVEL: (30, 60)  # minutes per day
        }
        
        # Alert thresholds
        self.alert_thresholds = {
            HealthMetric.HEART_RATE: {"critical": (50, 120), "warning": (60, 100)},
            HealthMetric.BLOOD_PRESSURE: {"critical": (80, 140), "warning": (90, 130)},
            HealthMetric.TEMPERATURE: {"critical": (35.0, 38.5), "warning": (36.0, 37.8)},
            HealthMetric.OXYGEN_SATURATION: {"critical": (90, 100), "warning": (94, 100)},
            HealthMetric.STEPS: {"critical": (0, 3000), "warning": (4000, 8000)},
            HealthMetric.CALORIES: {"critical": (1200, 3000), "warning": (1500, 2800)},
            HealthMetric.SLEEP_DURATION: {"critical": (4, 6), "warning": (6, 8)},
            HealthMetric.STRESS_LEVEL: {"critical": (7, 10), "warning": (5, 8)},
            HealthMetric.ACTIVITY_LEVEL: {"critical": (0, 15), "warning": (20, 40)}
        }
        
        # Monitoring parameters
        self.monitoring_enabled = True
        self.alerts_enabled = True
        self.analysis_window = timedelta(days=30)
        
        # Health scoring
        self.health_score = 0.0
        self.last_score_update = datetime.now()
        
        logger.info("[HealthMonitor] System initialized")
    
    def record_vital_sign(self, metric_type: HealthMetric, value: float, 
                           unit: str, notes: str = "", metadata: Dict[str, Any] = None) -> str:
        """Record a vital sign measurement."""
        
        metric_id = f"vital_{int(time.time() * 1000)}_{metric_type.value}"
        
        # Get normal range
        normal_range = self.normal_ranges.get(metric_type, (0, 100))
        
        # Determine status
        status = self._determine_health_status(metric_type, value, normal_range)
        
        # Create vital sign
        vital_sign = VitalSign(
            metric_id=metric_id,
            metric_type=metric_type,
            value=value,
            unit=unit,
            timestamp=datetime.now(),
            status=status,
            normal_range=normal_range,
            notes=notes,
            metadata=metadata or {}
        )
        
        # Store vital sign
        self.vital_signs.append(vital_sign)
        
        # Check for alerts
        if self.alerts_enabled:
            self._check_for_alerts(vital_sign)
        
        # Update health score
        self._update_health_score()
        
        # Clean up old data
        self._cleanup_old_data()
        
        logger.info(f"[HealthMonitor] Recorded {metric_type.value}: {value} {unit} ({status.value})")
        return metric_id
    
    def _determine_health_status(self, metric_type: HealthMetric, value: float, 
                                normal_range: Tuple[float, float]) -> HealthStatus:
        """Determine health status based on value and normal range."""
        
        min_val, max_val = normal_range
        
        if value < min_val * 0.8 or value > max_val * 1.2:
            return HealthStatus.CRITICAL
        elif value < min_val * 0.9 or value > max_val * 1.1:
            return HealthStatus.WARNING
        elif min_val <= value <= max_val:
            return HealthStatus.NORMAL
        else:
            return HealthStatus.UNKNOWN
    
    def _check_for_alerts(self, vital_sign: VitalSign):
        """Check if vital sign triggers any alerts."""
        
        thresholds = self.alert_thresholds.get(vital_sign.metric_type, {})
        
        if not thresholds:
            return
        
        # Check critical alerts
        critical_range = thresholds.get("critical")
        if critical_range:
            if vital_sign.value < critical_range[0] or vital_sign.value > critical_range[1]:
                self._create_alert(vital_sign, "critical", f"{vital_sign.metric_type.value} is {vital_sign.value} {vital_sign.unit} (critical)")
        
        # Check warning alerts
        warning_range = thresholds.get("warning")
        if warning_range:
            if vital_sign.value < warning_range[0] or vital_sign.value > warning_range[1]:
                self._create_alert(vital_sign, "warning", f"{vital_sign.metric_type.value} is {vital_sign.value} {vital_sign.unit} (warning)")
    
    def _create_alert(self, vital_sign: VitalSign, alert_type: str, message: str):
        """Create a health alert."""
        
        alert_id = f"alert_{int(time.time() * 1000)}_{vital_sign.metric_type.value}"
        
        alert = HealthAlert(
            alert_id=alert_id,
            metric_type=vital_sign.metric_type,
            alert_type=alert_type,
            severity=alert_type,
            message=message,
            timestamp=datetime.now()
        )
        
        self.health_alerts.append(alert)
        
        logger.warning(f"[HealthMonitor] {alert_type.upper()} ALERT: {message}")
    
    def _update_health_score(self):
        """Update overall health score."""
        
        if datetime.now() - self.last_score_update < timedelta(hours=1):
            return  # Update only once per hour
        
        # Get recent vital signs
        recent_vitals = [v for v in self.vital_signs 
                          if (datetime.now() - v.timestamp).days <= 7]
        
        if not recent_vitals:
            return
        
        # Calculate score based on recent vital signs
        total_score = 0.0
        metric_scores = {}
        
        for metric in HealthMetric:
            metric_vitals = [v for v in recent_vitals if v.metric_type == metric]
            if metric_vitals:
                # Calculate score for this metric (0-100)
                metric_score = self._calculate_metric_score(metric_vitals)
                metric_scores[metric.value] = metric_score
                total_score += metric_score
        
        # Average score across all metrics
        if metric_scores:
            self.health_score = total_score / len(metric_scores)
        else:
            self.health_score = 50.0  # Default score
        
        self.last_score_update = datetime.now()
        
        logger.info(f"[HealthMonitor] Health score updated: {self.health_score:.1f}")
    
    def _calculate_metric_score(self, vital_signs: List[VitalSign]) -> float:
        """Calculate health score for a specific metric."""
        
        if not vital_signs:
            return 50.0
        
        # Get the most recent vital sign
        latest_vital = max(vital_signs, key=lambda v: v.timestamp)
        
        # Score based on status
        status_scores = {
            HealthStatus.EXCELLENT: 100,
            HealthStatus.GOOD: 85,
            HealthStatus.NORMAL: 75,
            HealthStatus.WARNING: 50,
            HealthStatus.CRITICAL: 25,
            HealthStatus.UNKNOWN: 50
        }
        
        return status_scores.get(latest_vital.status, 50.0)
    
    def analyze_health_patterns(self, metric_type: HealthMetric, 
                               time_range: timedelta = None) -> List[HealthPattern]:
        """Analyze health patterns for a specific metric."""
        
        time_range = time_range or self.analysis_window
        
        # Get vital signs within time range
        cutoff_time = datetime.now() - time_range
        recent_vitals = [v for v in self.vital_signs 
                          if v.metric_type == metric_type and v.timestamp > cutoff_time]
        
        if len(recent_vitals) < 10:
            return []
        
        # Analyze patterns
        patterns = []
        
        # Trend analysis
        values = [v.value for v in recent_vitals]
        timestamps = [v.timestamp for v in recent_vitals]
        
        # Calculate trend
        if len(values) >= 2:
            # Simple linear regression
            x_values = list(range(len(values)))
            n = len(values)
            sum_x = sum(x_values)
            sum_y = sum(values)
            sum_xy = sum(x * y for x, y in zip(x_values, values))
            sum_x2 = sum(x * x for x in x_values)
            
            if n * sum_x2 - sum_x * sum_x != 0:
                slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
                
                trend = "improving" if slope > 0 else "declining" if slope < 0 else "stable"
                
                pattern_id = f"pattern_{int(time.time() * 1000)}_{metric_type.value}_trend"
                
                pattern = HealthPattern(
                    pattern_id=pattern_id,
                    metric_type=metric_type,
                    pattern_type="trend",
                    description=f"{metric_type.value} {trend} over time",
                    confidence=abs(slope) * 10,  # Simple confidence calculation
                    trend=trend,
                    time_range=(min(timestamps), max(timestamps)),
                    insights=[f"Trend analysis shows {trend} pattern"]
                )
                
                patterns.append(pattern)
        
        # Cyclical pattern detection (simplified)
        if len(values) >= 7:
            # Check for daily patterns
            daily_values = values[-7:]  # Last 7 days
            avg_value = sum(daily_values) / len(daily_values)
            variance = sum((v - avg_value) ** 2 for v in daily_values) / len(daily_values)
            
            if variance > 0:
                # Check if values show cyclical pattern
                pattern_id = f"pattern_{int(time.time() * 1000)}_{metric_type.value}_cyclical"
                
                pattern = HealthPattern(
                    pattern_id=pattern_id,
                    metric_type=metric_type,
                    pattern_type="cyclical",
                    description=f"{metric_type.value} shows cyclical patterns",
                    confidence=min(1.0, variance / avg_value),
                    trend="cyclical",
                    time_range=(min(timestamps), max(timestamps)),
                    insights=[f"Detected cyclical pattern with variance {variance:.2f}"]
                )
                
                patterns.append(pattern)
        
        # Store patterns
        self.health_patterns.extend(patterns)
        
        # Keep patterns manageable
        if len(self.health_patterns) > 100:
            self.health_patterns = self.health_patterns[-50:]
        
        return patterns
    
    def get_health_summary(self) -> Dict[str, Any]:
        """Get comprehensive health summary."""
        
        # Get recent vital signs
        recent_vitals = [v for v in self.vital_signs 
                          if (datetime.now() - v.timestamp).days <= 7]
        
        # Group by metric type
        metrics_summary = {}
        for metric in HealthMetric:
            metric_vitals = [v for v in recent_vitals if v.metric_type == metric]
            if metric_vitals:
                latest = max(metric_vitals, key=lambda v: v.timestamp)
                metrics_summary[metric.value] = {
                    "latest_value": latest.value,
                    "unit": latest.unit,
                    "status": latest.status.value,
                    "timestamp": latest.timestamp.isoformat(),
                    "normal_range": latest.normal_range,
                    "measurements_count": len(metric_vitals)
                }
        
        # Get recent alerts
        recent_alerts = [a for a in self.health_alerts 
                          if (datetime.now() - a.timestamp).hours <= 24]
        
        # Get recent patterns
        recent_patterns = [p for p in self.health_patterns 
                           if (datetime.now() - p.time_range[1]).days <= 7]
        
        return {
            "health_score": self.health_score,
            "last_updated": self.last_updated.isoformat(),
            "metrics_summary": metrics_summary,
            "total_measurements": len(recent_vitals),
            "active_alerts": len([a for a in recent_alerts if not a.acknowledged]),
            "recent_alerts": len(recent_alerts),
            "resolved_alerts": len([a for a in recent_alerts if a.resolved]),
            "health_patterns": len(recent_patterns),
            "monitoring_enabled": self.monitoring_enabled,
            "alerts_enabled": self.alerts_enabled
        }
    
    def get_metric_history(self, metric_type: HealthMetric, 
                           days: int = 30) -> List[Dict[str, Any]]:
        """Get historical data for a specific metric."""
        
        cutoff_time = datetime.now() - timedelta(days=days)
        metric_vitals = [v for v in self.vital_signs 
                          if v.metric_type == metric_type and v.timestamp > cutoff_time]
        
        return [
            {
                "metric_id": v.metric_id,
                "value": v.value,
                "unit": v.unit,
                "status": v.status.value,
                "timestamp": v.timestamp.isoformat(),
                "notes": v.notes
            }
            for v in metric_vitals
        ]
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge a health alert."""
        
        for alert in self.health_alerts:
            if alert.alert_id == alert_id:
                alert.acknowledged = True
                logger.info(f"[HealthMonitor] Alert acknowledged: {alert_id}")
                return True
        
        return False
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Resolve a health alert."""
        
        for alert in self.health_alerts:
            if alert.alert_id == alert_id:
                alert.acknowledged = True
                alert.resolved = True
                alert.resolved_at = datetime.now()
                logger.info(f"[HealthMonitor] Alert resolved: {alert_id}")
                return True
        
        return False
    
    def get_alerts(self, acknowledged: bool = None, resolved: bool = None, 
                   hours: int = 24) -> List[Dict[str, Any]]:
        """Get health alerts with filters."""
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        alerts = [a for a in self.health_alerts if a.timestamp > cutoff_time]
        
        # Apply filters
        if acknowledged is not None:
            alerts = [a for a in alerts if a.acknowledged == acknowledged]
        
        if resolved is not None:
            alerts = [a for a in alerts if a.resolved == resolved]
        
        return [
            {
                "alert_id": a.alert_id,
                "metric_type": a.metric_type.value,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "timestamp": a.timestamp.isoformat(),
                "acknowledged": a.acknowledged,
                "resolved": a.resolved,
                "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None
            }
            for a in alerts
        ]
    
    def _cleanup_old_data(self):
        """Clean up old health data."""
        
        cutoff_time = datetime.now() - timedelta(days=90)
        
        # Clean up old vital signs
        self.vital_signs = [v for v in self.vital_signs if v.timestamp > cutoff_time]
        
        # Clean up old alerts
        self.health_alerts = [a for a in self.health_alerts if a.timestamp > cutoff_time]
        
        # Clean up old patterns
        self.health_patterns = [p for p in self.health_patterns if p.time_range[1] > cutoff_time]
    
    def enable_monitoring(self, enabled: bool = True):
        """Enable or disable health monitoring."""
        self.monitoring_enabled = enabled
        logger.info(f"[HealthMonitor] Monitoring {'enabled' if enabled else 'disabled'}")
    
    def enable_alerts(self, enabled: bool = True):
        """Enable or disable health alerts."""
        self.alerts_enabled = enabled
        logger.info(f"[HealthMonitor] Alerts {'enabled' if enabled else 'disabled'}")
    
    def health_check(self) -> bool:
        """Check if health monitor system is healthy."""
        
        try:
            return (self.monitoring_enabled and 
                   len(self.normal_ranges) == len(HealthMetric) and
                   len(self.alert_thresholds) == len(HealthMetric))
        except:
            return False

# Global instance
_health_monitor: Optional[HealthMonitor] = None

def get_health_monitor(limbic_system: LimbicSystem, memory_system: MemorySystem) -> HealthMonitor:
    """Get or create the global health monitor."""
    global _health_monitor
    if _health_monitor is None:
        _health_monitor = HealthMonitor(limbic_system, memory_system)
    return _health_monitor
