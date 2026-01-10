# CLI Integration for Sallie Server
# Adds CLI-specific endpoints for power user operations

import asyncio
import json
import logging
import sys
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path

class CLIManager:
    """Manages CLI-specific operations and endpoints."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.cli_config_file = Path.home() / ".sallie" / "cli_config.json"
        self.backup_dir = Path.home() / ".sallie" / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
    async def get_debug_info(self, component: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive debug information."""
        try:
            debug_info = {
                "timestamp": datetime.now().isoformat(),
                "system": {
                    "python_version": sys.version if 'sys' in globals() else "Unknown",
                    "platform": sys.platform if 'sys' in globals() else "Unknown",
                    "working_directory": str(Path.cwd())
                },
                "brain": {
                    "initialized": self.brain is not None,
                    "current_role": getattr(self.brain, 'current_role', 'Unknown') if self.brain else "Not initialized",
                    "trust_tier": getattr(self.brain, 'autonomy_level', 0) if self.brain else 0,
                    "limbic_state": self.brain.get_current_state() if self.brain else {}
                },
                "services": {
                    "voice_interface": VOICE_AVAILABLE and voice_interface is not None,
                    "autonomous_pm": AUTONOMOUS_PM_AVAILABLE and autonomous_pm is not None,
                    "sensor_array": SENSOR_ARRAY_AVAILABLE and sensor_array is not None,
                    "advanced_analytics": ANALYTICS_AVAILABLE and advanced_analytics is not None,
                    "ghost_interface": GHOST_INTERFACE_AVAILABLE and get_ghost_manager() is not None
                },
                "memory": {
                    "working_directory": str(Path.cwd() / "working") if (Path.cwd() / "working").exists() else "Not found",
                    "heritage_directory": str(Path.cwd() / "heritage") if (Path.cwd() / "heritage").exists() else "Not found",
                    "archive_directory": str(Path.cwd() / "archive") if (Path.cwd() / "archive").exists() else "Not found"
                }
            }
            
            # Add component-specific debug info
            if component == "brain" and self.brain:
                debug_info["brain_details"] = {
                    "conversation_history_length": len(getattr(self.brain, 'conversation_history', [])),
                    "heritage_keys": list(getattr(self.brain, 'heritage', {}).keys()),
                    "current_archetype": getattr(self.brain, 'current_archetype', 'Unknown'),
                    "sanctuary_mode": getattr(self.brain, 'sanctuary_mode', False)
                }
            elif component == "voice" and voice_interface:
                debug_info["voice_details"] = {
                    "initialized": getattr(voice_interface, 'is_initialized', False),
                    "available_voices": len(getattr(voice_interface, 'available_voices', [])),
                    "voice_profiles": len(getattr(voice_interface, 'voice_profiles', {})),
                    "emotional_mapping": list(getattr(voice_interface, 'emotional_voice_mapping', {}).keys())
                }
            elif component == "autonomous_pm" and autonomous_pm:
                debug_info["pm_details"] = {
                    "initialized": getattr(autonomous_pm, 'is_initialized', False),
                    "active_projects": len(getattr(autonomous_pm, 'projects', {})),
                    "pending_tasks": len(getattr(autonomous_pm, 'pending_tasks', [])),
                    "completed_tasks": len(getattr(autonomous_pm, 'completed_tasks', []))
                }
            elif component == "sensors" and sensor_array:
                debug_info["sensor_details"] = {
                    "initialized": getattr(sensor_array, 'is_initialized', False),
                    "active_sensors": len([s for s in getattr(sensor_array, 'sensors', {}).values() 
                                        if getattr(s, 'status', None) and s.status.value == "active"]),
                    "total_sensors": len(getattr(sensor_array, 'sensors', {})),
                    "automation_rules": len(getattr(sensor_array, 'automation_rules', []))
                }
            elif component == "analytics" and advanced_analytics:
                debug_info["analytics_details"] = {
                    "initialized": getattr(advanced_analytics, 'is_initialized', False),
                    "metrics_count": len(getattr(advanced_analytics, 'metrics', {})),
                    "performance_reports": len(getattr(advanced_analytics, 'performance_reports', [])),
                    "predictions": len(getattr(advanced_analytics, 'predictions', {}))
                }
            elif component == "ghost" and get_ghost_manager():
                ghost_manager = get_ghost_manager()
                debug_info["ghost_details"] = {
                    "initialized": ghost_manager.is_initialized,
                    "current_state": ghost_manager.ghost_interface.current_state.value,
                    "pending_taps": len(ghost_manager.ghost_interface.pending_taps),
                    "last_seed_time": ghost_manager.ghost_interface.last_seed_time
                }
            
            return debug_info
            
        except Exception as e:
            logging.error(f"Failed to get debug info: {e}")
            return {"error": str(e)}
    
    async def search_memory(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search Sallie's memory with advanced options."""
        try:
            if not self.brain:
                return {"error": "Brain not initialized"}
            
            # Search conversation history
            conversation_results = []
            history = getattr(self.brain, 'conversation_history', [])
            
            for entry in history[-100:]:  # Search last 100 entries
                content = entry.get('content', '')
                if query.lower() in content.lower():
                    conversation_results.append({
                        "type": "conversation",
                        "content": content,
                        "timestamp": entry.get('timestamp', datetime.now().isoformat()),
                        "score": self._calculate_relevance(content, query)
                    })
            
            # Search heritage
            heritage_results = []
            heritage = getattr(self.brain, 'heritage', {})
            
            for key, value in heritage.items():
                if isinstance(value, str) and query.lower() in value.lower():
                    heritage_results.append({
                        "type": "heritage",
                        "key": key,
                        "content": value,
                        "timestamp": "heritage",
                        "score": self._calculate_relevance(value, query)
                    })
            
            # Combine and sort by relevance
            all_results = conversation_results + heritage_results
            all_results.sort(key=lambda x: x['score'], reverse=True)
            
            return {
                "query": query,
                "total_results": len(all_results),
                "memories": all_results[:limit]
            }
            
        except Exception as e:
            logging.error(f"Failed to search memory: {e}")
            return {"error": str(e)}
    
    def _calculate_relevance(self, content: str, query: str) -> float:
        """Calculate relevance score for search results."""
        if not content or not query:
            return 0.0
        
        content_lower = content.lower()
        query_lower = query.lower()
        
        # Exact match gets highest score
        if query_lower in content_lower:
            base_score = 1.0
            # Bonus for shorter content (more focused)
            length_bonus = max(0, 1 - (len(content) / 1000))
            return base_score + length_bonus * 0.2
        
        # Partial match based on words
        query_words = query_lower.split()
        content_words = content_lower.split()
        
        matches = sum(1 for word in query_words if word in content_words)
        if matches > 0:
            return matches / len(query_words)
        
        return 0.0
    
    async def trigger_dream_cycle(self) -> Dict[str, Any]:
        """Trigger Dream Cycle processing."""
        try:
            if not self.brain:
                return {"error": "Brain not initialized"}
            
            # Check if Dream Cycle is available
            if not hasattr(self.brain, 'trigger_dream_cycle'):
                return {"error": "Dream Cycle not available"}
            
            # Trigger Dream Cycle
            result = await self.brain.trigger_dream_cycle()
            
            return {
                "status": "triggered",
                "timestamp": datetime.now().isoformat(),
                "result": result
            }
            
        except Exception as e:
            logging.error(f"Failed to trigger Dream Cycle: {e}")
            return {"error": str(e)}
    
    async def get_dream_status(self) -> Dict[str, Any]:
        """Get Dream Cycle status."""
        try:
            if not self.brain:
                return {"error": "Brain not initialized"}
            
            # Get Dream Cycle status
            status = {
                "status": "unknown",
                "last_run": getattr(self.brain, 'last_dream_cycle', None),
                "next_run": getattr(self.brain, 'next_dream_cycle', None),
                "active_hypotheses": 0,
                "processed_memories": 0
            }
            
            # Get hypotheses if available
            if hasattr(self.brain, 'get_active_hypotheses'):
                hypotheses = self.brain.get_active_hypotheses()
                status["active_hypotheses"] = len(hypotheses)
                status["hypotheses"] = [
                    {
                        "id": hyp.get('id', 'unknown'),
                        "pattern": hyp.get('pattern', 'unknown'),
                        "confidence": hyp.get('confidence', 0.0),
                        "created": hyp.get('created', datetime.now().isoformat())
                    }
                    for hyp in hypotheses[:10]  # Limit to 10
                ]
            
            return status
            
        except Exception as e:
            logging.error(f"Failed to get Dream Cycle status: {e}")
            return {"error": str(e)}
    
    async def manage_hypotheses(self, action: str, hypothesis_id: Optional[str] = None) -> Dict[str, Any]:
        """Manage Dream Cycle hypotheses."""
        try:
            if not self.brain:
                return {"error": "Brain not initialized"}
            
            if not hasattr(self.brain, 'manage_hypothesis'):
                return {"error": "Hypothesis management not available"}
            
            if action == "list":
                hypotheses = self.brain.get_active_hypotheses()
                return {
                    "hypotheses": [
                        {
                            "id": hyp.get('id', 'unknown'),
                            "pattern": hyp.get('pattern', 'unknown'),
                            "confidence": hyp.get('confidence', 0.0),
                            "created": hyp.get('created', datetime.now().isoformat()),
                            "evidence": hyp.get('evidence', [])
                        }
                        for hyp in hypotheses
                    ]
                }
            
            elif action in ["confirm", "deny"] and hypothesis_id:
                result = self.brain.manage_hypothesis(hypothesis_id, action)
                return {
                    "action": action,
                    "hypothesis_id": hypothesis_id,
                    "result": result
                }
            
            else:
                return {"error": "Invalid action or missing hypothesis_id"}
            
        except Exception as e:
            logging.error(f"Failed to manage hypotheses: {e}")
            return {"error": str(e)}
    
    async def create_backup(self) -> Dict[str, Any]:
        """Create a comprehensive backup."""
        try:
            backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_path = self.backup_dir / f"{backup_id}.json"
            
            # Gather all data to backup
            backup_data = {
                "backup_id": backup_id,
                "timestamp": datetime.now().isoformat(),
                "version": "2.0.0",
                "data": {
                    "brain_state": {},
                    "heritage": {},
                    "conversation_history": [],
                    "limbic_history": [],
                    "settings": {}
                }
            }
            
            # Backup brain state
            if self.brain:
                backup_data["data"]["brain_state"] = {
                    "current_role": getattr(self.brain, 'current_role', 'Unknown'),
                    "autonomy_level": getattr(self.brain, 'autonomy_level', 0),
                    "current_archetype": getattr(self.brain, 'current_archetype', 'Unknown'),
                    "limbic_state": self.brain.get_current_state()
                }
                
                # Backup heritage
                backup_data["data"]["heritage"] = getattr(self.brain, 'heritage', {})
                
                # Backup conversation history
                backup_data["data"]["conversation_history"] = getattr(self.brain, 'conversation_history', [])[-1000:]  # Last 1000
                
                # Backup limbic history
                backup_data["data"]["limbic_history"] = getattr(self.brain, 'limbic_history', [])[-500:]  # Last 500
            
            # Save backup
            with open(backup_path, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
            
            return {
                "backup_id": backup_id,
                "location": str(backup_path),
                "size": backup_path.stat().st_size,
                "timestamp": backup_data["timestamp"]
            }
            
        except Exception as e:
            logging.error(f"Failed to create backup: {e}")
            return {"error": str(e)}
    
    async def list_backups(self) -> Dict[str, Any]:
        """List available backups."""
        try:
            backups = []
            
            for backup_file in self.backup_dir.glob("backup_*.json"):
                try:
                    with open(backup_file, 'r') as f:
                        backup_data = json.load(f)
                    
                    backups.append({
                        "id": backup_data.get("backup_id", backup_file.stem),
                        "created": backup_data.get("timestamp", backup_file.stat().st_ctime),
                        "size": backup_file.stat().st_size,
                        "version": backup_data.get("version", "Unknown"),
                        "location": str(backup_file)
                    })
                except Exception:
                    continue
            
            # Sort by creation date (newest first)
            backups.sort(key=lambda x: x["created"], reverse=True)
            
            return {"backups": backups}
            
        except Exception as e:
            logging.error(f"Failed to list backups: {e}")
            return {"error": str(e)}
    
    async def restore_backup(self, backup_id: str) -> Dict[str, Any]:
        """Restore from backup."""
        try:
            backup_path = self.backup_dir / f"{backup_id}.json"
            
            if not backup_path.exists():
                return {"error": f"Backup {backup_id} not found"}
            
            with open(backup_path, 'r') as f:
                backup_data = json.load(f)
            
            if not self.brain:
                return {"error": "Brain not initialized - cannot restore"}
            
            # Restore heritage
            heritage = backup_data["data"].get("heritage", {})
            if heritage:
                for key, value in heritage.items():
                    setattr(self.brain, key, value)
            
            # Restore conversation history
            history = backup_data["data"].get("conversation_history", [])
            if history:
                setattr(self.brain, 'conversation_history', history)
            
            # Restore limbic history
            limbic_history = backup_data["data"].get("limbic_history", [])
            if limbic_history:
                setattr(self.brain, 'limbic_history', limbic_history)
            
            # Restore brain state
            brain_state = backup_data["data"].get("brain_state", {})
            if brain_state:
                for key, value in brain_state.items():
                    if hasattr(self.brain, key):
                        setattr(self.brain, key, value)
            
            return {
                "restored": backup_id,
                "timestamp": datetime.now().isoformat(),
                "components_restored": list(backup_data["data"].keys())
            }
            
        except Exception as e:
            logging.error(f"Failed to restore backup: {e}")
            return {"error": str(e)}

# Global instance
cli_manager: Optional[CLIManager] = None

def initialize_cli_manager(brain_instance=None):
    """Initialize the global CLI Manager."""
    global cli_manager
    try:
        cli_manager = CLIManager(brain_instance)
        return cli_manager
    except Exception as e:
        logging.error(f"Failed to initialize CLI Manager: {e}")
        return None

def get_cli_manager() -> Optional[CLIManager]:
    """Get the global CLI Manager."""
    return cli_manager
