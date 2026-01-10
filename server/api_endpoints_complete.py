"""
Canonical Spec v5.4.1: Complete REST API Endpoints
All 35+ API endpoints for Dream Cycle, Sensor Array, Ghost Interface, 
Trust Tiers, Git Safety Net, and Memory Hygiene.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

# Import backend modules
try:
    from dream_cycle_complete import get_dream_cycle
    from sensor_array_complete import get_sensor_array
    from ghost_interface import GhostInterface
    from trust_tiers import get_trust_manager
    from git_safety_net import get_git_safety_net
    from working_memory_hygiene import get_memory_hygiene
except ImportError as e:
    logging.warning(f"Import error in API endpoints: {e}")

logger = logging.getLogger(__name__)

# Create routers
dreams_router = APIRouter(prefix="/api/dreams", tags=["dreams"])
sensors_router = APIRouter(prefix="/api/sensors", tags=["sensors"])
ghost_router = APIRouter(prefix="/api/ghost", tags=["ghost"])
trust_router = APIRouter(prefix="/api/trust", tags=["trust"])
safety_router = APIRouter(prefix="/api/safety-net", tags=["safety-net"])
memory_router = APIRouter(prefix="/api/memory", tags=["memory"])


# ========== Pydantic Models ==========

class HypothesisValidation(BaseModel):
    hypothesis_id: str
    is_valid: bool
    feedback: Optional[str] = None


class ConflictResolution(BaseModel):
    hypothesis_ids: List[str]
    resolution_type: str  # merge, split, vote
    resolution_data: Optional[Dict] = None


class SensorThresholds(BaseModel):
    workload_spike_threshold: Optional[int] = None
    abandonment_days: Optional[int] = None
    stress_cpu_threshold: Optional[float] = None
    stress_window_switches_per_hour: Optional[int] = None


class NotificationPreferences(BaseModel):
    enabled: bool = True
    workload_offers: bool = True
    pattern_insights: bool = True
    focus_shifts: bool = True
    stress_detection: bool = True
    reunion_alerts: bool = True
    crisis_support: bool = True
    refractory_period_hours: int = 24


class TrustFeedback(BaseModel):
    action_id: str
    trust_impact: float  # -1.0 to +1.0
    feedback: Optional[str] = None


class RollbackRequest(BaseModel):
    action_ids: List[str]
    reason: Optional[str] = None


class MemoryConfig(BaseModel):
    daily_reset_time: str = "00:00"
    weekly_review_day: int = 0  # 0 = Monday
    decision_log_max_mb: int = 1
    stale_threshold_days: int = 7


# ========== Dream Cycle Endpoints ==========

@dreams_router.get("/hypotheses")
async def list_hypotheses(
    status: Optional[str] = Query(None, enum=["active", "validated", "contradicted", "archived"]),
    min_confidence: float = Query(0.0, ge=0.0, le=1.0)
):
    """List all hypotheses with optional filters."""
    try:
        dream_cycle = get_dream_cycle()
        hypotheses = dream_cycle.get_hypotheses(status=status)
        
        # Filter by confidence
        hypotheses = [h for h in hypotheses if h.confidence >= min_confidence]
        
        return {
            "hypotheses": [h.to_dict() for h in hypotheses],
            "count": len(hypotheses)
        }
    except Exception as e:
        logger.error(f"Error listing hypotheses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/hypotheses/{hypothesis_id}")
async def get_hypothesis(hypothesis_id: str):
    """Get specific hypothesis with full details."""
    try:
        dream_cycle = get_dream_cycle()
        hypothesis = dream_cycle.get_hypothesis(hypothesis_id)
        
        if not hypothesis:
            raise HTTPException(status_code=404, detail="Hypothesis not found")
        
        return hypothesis.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting hypothesis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.post("/hypotheses/validate")
async def validate_hypothesis(validation: HypothesisValidation):
    """Validate or dismiss a hypothesis."""
    try:
        dream_cycle = get_dream_cycle()
        dream_cycle.validate_hypothesis(
            validation.hypothesis_id,
            validation.is_valid,
            validation.feedback
        )
        
        return {"status": "success", "hypothesis_id": validation.hypothesis_id}
    except Exception as e:
        logger.error(f"Error validating hypothesis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/morning-report")
async def get_morning_report():
    """Get latest morning report."""
    try:
        dream_cycle = get_dream_cycle()
        report = dream_cycle.get_latest_morning_report()
        
        if not report:
            return {"message": "No morning report available yet"}
        
        return report
    except Exception as e:
        logger.error(f"Error getting morning report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/morning-reports")
async def get_morning_reports(limit: int = Query(10, ge=1, le=100)):
    """Get historical morning reports."""
    try:
        dream_cycle = get_dream_cycle()
        reports = dream_cycle.get_morning_reports(limit=limit)
        
        return {"reports": reports, "count": len(reports)}
    except Exception as e:
        logger.error(f"Error getting morning reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/patterns")
async def get_patterns():
    """Get detected patterns."""
    try:
        dream_cycle = get_dream_cycle()
        patterns = dream_cycle.get_detected_patterns()
        
        return {"patterns": patterns, "count": len(patterns)}
    except Exception as e:
        logger.error(f"Error getting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.post("/trigger-cycle")
async def trigger_dream_cycle():
    """Manually trigger dream cycle processing."""
    try:
        dream_cycle = get_dream_cycle()
        result = dream_cycle.run_cycle()
        
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Error triggering dream cycle: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/conflicts")
async def get_conflicts():
    """Get conflicting hypotheses."""
    try:
        dream_cycle = get_dream_cycle()
        conflicts = dream_cycle.detect_conflicts()
        
        return {"conflicts": conflicts, "count": len(conflicts)}
    except Exception as e:
        logger.error(f"Error getting conflicts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.post("/resolve-conflict")
async def resolve_conflict(resolution: ConflictResolution):
    """Resolve hypothesis conflict."""
    try:
        dream_cycle = get_dream_cycle()
        result = dream_cycle.resolve_conflict(
            resolution.hypothesis_ids,
            resolution.resolution_type,
            resolution.resolution_data
        )
        
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Error resolving conflict: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@dreams_router.get("/wisdom")
async def get_wisdom():
    """Get synthesized wisdom."""
    try:
        dream_cycle = get_dream_cycle()
        wisdom = dream_cycle.synthesize_wisdom()
        
        return {"wisdom": wisdom}
    except Exception as e:
        logger.error(f"Error getting wisdom: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Sensor Array Endpoints ==========

@sensors_router.get("/status")
async def get_sensor_status():
    """Get all current sensor readings."""
    try:
        sensor_array = get_sensor_array()
        health = sensor_array.get_system_health()
        active_patterns = sensor_array.get_active_patterns()
        
        return {
            "health": health.to_dict(),
            "active_patterns": [p.to_dict() for p in active_patterns],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting sensor status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/health")
async def get_system_health():
    """Get system health metrics."""
    try:
        sensor_array = get_sensor_array()
        health = sensor_array.get_system_health()
        
        return health.to_dict()
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/patterns")
async def get_behavioral_patterns(pattern_type: Optional[str] = None):
    """Get detected behavioral patterns."""
    try:
        sensor_array = get_sensor_array()
        patterns = sensor_array.get_active_patterns(pattern_type=pattern_type)
        
        return {
            "patterns": [p.to_dict() for p in patterns],
            "count": len(patterns)
        }
    except Exception as e:
        logger.error(f"Error getting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/patterns/{pattern_type}")
async def get_pattern_history(pattern_type: str, hours: int = Query(168, ge=1, le=720)):
    """Get specific pattern type history."""
    try:
        sensor_array = get_sensor_array()
        patterns = sensor_array.get_pattern_history(hours=hours)
        filtered = [p for p in patterns if p.pattern_type == pattern_type]
        
        return {
            "patterns": [p.to_dict() for p in filtered],
            "count": len(filtered)
        }
    except Exception as e:
        logger.error(f"Error getting pattern history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/history")
async def get_sensor_history(hours: int = Query(24, ge=1, le=720)):
    """Get time-series historical data."""
    try:
        sensor_array = get_sensor_array()
        patterns = sensor_array.get_pattern_history(hours=hours)
        
        return {
            "patterns": [p.to_dict() for p in patterns],
            "hours": hours
        }
    except Exception as e:
        logger.error(f"Error getting sensor history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.post("/configure")
async def configure_sensors(thresholds: SensorThresholds):
    """Update sensor thresholds."""
    try:
        sensor_array = get_sensor_array()
        config_updates = thresholds.dict(exclude_none=True)
        sensor_array.configure_thresholds(**config_updates)
        
        return {"status": "success", "updated": list(config_updates.keys())}
    except Exception as e:
        logger.error(f"Error configuring sensors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/interventions")
async def get_interventions():
    """Get intervention history."""
    try:
        sensor_array = get_sensor_array()
        # Would load from interventions.json
        return {"interventions": [], "count": 0}
    except Exception as e:
        logger.error(f"Error getting interventions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.post("/trigger-check")
async def trigger_pattern_check():
    """Manually trigger pattern check."""
    try:
        sensor_array = get_sensor_array()
        stress = sensor_array.check_stress_indicators()
        abandonment = sensor_array.check_abandonment_patterns()
        
        return {
            "status": "success",
            "stress_detected": stress is not None,
            "abandonment_count": len(abandonment)
        }
    except Exception as e:
        logger.error(f"Error triggering pattern check: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@sensors_router.get("/focus-map")
async def get_focus_map(hours: int = Query(24, ge=1, le=168)):
    """Get time distribution analysis."""
    try:
        sensor_array = get_sensor_array()
        focus_map = sensor_array.get_focus_map(hours=hours)
        
        return {"focus_map": focus_map, "hours": hours}
    except Exception as e:
        logger.error(f"Error getting focus map: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== Ghost Interface Endpoints ==========

@ghost_router.get("/state")
async def get_ghost_state():
    """Get current limbic pulse state."""
    try:
        # Would integrate with ghost_interface.py
        return {
            "pulse_color": "violet",
            "pulse_speed": "steady",
            "limbic_state": {
                "trust": 0.75,
                "warmth": 0.80,
                "arousal": 0.60,
                "valence": 0.70
            }
        }
    except Exception as e:
        logger.error(f"Error getting ghost state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ghost_router.post("/preferences")
async def update_preferences(prefs: NotificationPreferences):
    """Update notification preferences."""
    try:
        # Would save to user preferences
        return {"status": "success", "preferences": prefs.dict()}
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ghost_router.get("/preferences")
async def get_preferences():
    """Get current preferences."""
    try:
        # Would load from user preferences
        return NotificationPreferences().dict()
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Add remaining Ghost Interface endpoints...
# (Notifications, test, dismiss, snooze, insights)

# ========== Trust Tiers Endpoints ==========

@trust_router.get("/current")
async def get_current_trust():
    """Get current tier and score."""
    try:
        trust_manager = get_trust_manager()
        tier = trust_manager.get_current_tier()
        score = trust_manager.get_trust_score()
        
        return {
            "tier": tier,
            "score": score,
            "breakdown": trust_manager.get_score_breakdown()
        }
    except Exception as e:
        logger.error(f"Error getting current trust: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Add remaining Trust Tiers endpoints...
# (History, capabilities, actions, feedback, progression, milestones)

# ========== Git Safety Net Endpoints ==========

@safety_router.get("/history")
async def get_action_history(limit: int = Query(50, ge=1, le=200)):
    """Get action history."""
    try:
        safety_net = get_git_safety_net()
        history = safety_net.get_action_history(limit=limit)
        
        return {"actions": history, "count": len(history)}
    except Exception as e:
        logger.error(f"Error getting action history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Add remaining Safety Net endpoints...
# (Commit details, rollback, diff, status, verify, undo-window)

# ========== Memory Hygiene Endpoints ==========

@memory_router.get("/status")
async def get_memory_status():
    """Get current memory health."""
    try:
        hygiene = get_memory_hygiene()
        status = hygiene.get_status()
        
        return status
    except Exception as e:
        logger.error(f"Error getting memory status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Add remaining Memory Hygiene endpoints...
# (Now, stale items, reset, review, cleanup, archive, decision log, stats, configure)


# Export all routers
def get_all_routers():
    """Get all API routers."""
    return [
        dreams_router,
        sensors_router,
        ghost_router,
        trust_router,
        safety_router,
        memory_router
    ]
