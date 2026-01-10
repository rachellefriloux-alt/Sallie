# Working Memory Hygiene Integration for Sallie Server
# Adds memory management and cleanup endpoints

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from working_memory_hygiene import WorkingMemoryHygiene, MemoryStatus

class MemoryHygieneManager:
    """Manages the Working Memory Hygiene System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.hygiene_system: Optional[WorkingMemoryHygiene] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the Working Memory Hygiene System."""
        try:
            self.hygiene_system = WorkingMemoryHygiene(self.brain)
            self.is_initialized = True
            
            # Start the scheduler
            self.hygiene_system.start_scheduler()
            
            logging.info("Working Memory Hygiene System initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Working Memory Hygiene System: {e}")
            raise
    
    async def get_memory_status(self) -> Dict[str, Any]:
        """Get current memory status."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            return self.hygiene_system.get_memory_status()
            
        except Exception as e:
            logging.error(f"Failed to get memory status: {e}")
            return {"error": str(e)}
    
    async def manual_cleanup(self, operation: str = "all") -> Dict[str, Any]:
        """Perform manual cleanup operation."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            report = await self.hygiene_system.manual_cleanup(operation)
            
            return {
                "operation": report.operation,
                "timestamp": report.timestamp,
                "items_processed": report.items_processed,
                "items_archived": report.items_archived,
                "items_deleted": report.items_deleted,
                "space_freed_bytes": report.space_freed,
                "space_freed_mb": report.space_freed / (1024 * 1024),
                "errors": report.errors,
                "details": report.details
            }
            
        except Exception as e:
            logging.error(f"Failed to perform manual cleanup: {e}")
            return {"error": str(e)}
    
    async def trigger_daily_reset(self) -> Dict[str, Any]:
        """Trigger a daily reset manually."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            report = await self.hygiene_system.daily_reset()
            
            return {
                "operation": report.operation,
                "timestamp": report.timestamp,
                "items_processed": report.items_processed,
                "items_archived": report.items_archived,
                "items_deleted": report.items_deleted,
                "space_freed_bytes": report.space_freed,
                "space_freed_mb": report.space_freed / (1024 * 1024),
                "errors": report.errors,
                "details": report.details
            }
            
        except Exception as e:
            logging.error(f"Failed to trigger daily reset: {e}")
            return {"error": str(e)}
    
    async def trigger_weekly_review(self) -> Dict[str, Any]:
        """Trigger a weekly review manually."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            report = await self.hygiene_system.weekly_review()
            
            return {
                "operation": report.operation,
                "timestamp": report.timestamp,
                "items_processed": report.items_processed,
                "items_archived": report.items_archived,
                "items_deleted": report.items_deleted,
                "space_freed_bytes": report.space_freed,
                "space_freed_mb": report.space_freed / (1024 * 1024),
                "errors": report.errors,
                "details": report.details
            }
            
        except Exception as e:
            logging.error(f"Failed to trigger weekly review: {e}")
            return {"error": str(e)}
    
    def get_recent_reports(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent hygiene reports."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            reports = self.hygiene_system.get_recent_reports(limit)
            
            return {
                "reports": reports,
                "count": len(reports)
            }
            
        except Exception as e:
            logging.error(f"Failed to get recent reports: {e}")
            return {"error": str(e)}
    
    def get_configuration(self) -> Dict[str, Any]:
        """Get current hygiene configuration."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            return {
                "daily_reset_enabled": self.hygiene_system.daily_reset_enabled,
                "weekly_review_enabled": self.hygiene_system.weekly_review_enabled,
                "stale_threshold_hours": self.hygiene_system.stale_threshold_hours,
                "old_threshold_days": self.hygiene_system.old_threshold_days,
                "max_working_memory_mb": self.hygiene_system.max_working_memory_mb,
                "archive_before_delete": self.hygiene_system.archive_before_delete,
                "daily_reset_time": self.hygiene_system.daily_reset_time,
                "weekly_review_day": self.hygiene_system.weekly_review_day,
                "weekly_review_time": self.hygiene_system.weekly_review_time,
                "last_daily_reset": self.hygiene_system.last_daily_reset,
                "last_weekly_review": self.hygiene_system.last_weekly_review,
                "scheduler_running": self.hygiene_system.is_running
            }
            
        except Exception as e:
            logging.error(f"Failed to get configuration: {e}")
            return {"error": str(e)}
    
    def update_configuration(self, config_updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update hygiene configuration."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            # Update configuration
            for key, value in config_updates.items():
                if hasattr(self.hygiene_system, key):
                    setattr(self.hygiene_system, key, value)
            
            # Save configuration
            self.hygiene_system.save_config()
            
            # Restart scheduler if needed
            if any(key in ['daily_reset_enabled', 'weekly_review_enabled', 'daily_reset_time', 'weekly_review_day', 'weekly_review_time'] for key in config_updates.keys()):
                self.hygiene_system.stop_scheduler()
                self.hygiene_system.start_scheduler()
            
            return {
                "success": True,
                "message": "Configuration updated successfully",
                "updated_keys": list(config_updates.keys())
            }
            
        except Exception as e:
            logging.error(f"Failed to update configuration: {e}")
            return {"error": str(e)}
    
    def get_memory_analysis(self) -> Dict[str, Any]:
        """Get detailed memory analysis."""
        if not self.hygiene_system or not self.is_initialized:
            return {"error": "Working Memory Hygiene System not initialized"}
        
        try:
            # Update memory tracking
            self.hygiene_system.update_memory_tracking()
            
            # Analyze memory items
            memory_items = self.hygiene_system.memory_items
            active_items = [item for item in memory_items if item.status == MemoryStatus.ACTIVE]
            
            # Analysis
            analysis = {
                "total_items": len(memory_items),
                "active_items": len(active_items),
                "by_type": {},
                "by_status": {},
                "by_age": {"recent": 0, "moderate": 0, "old": 0},
                "by_size": {"small": 0, "medium": 0, "large": 0},
                "access_patterns": {"high": 0, "medium": 0, "low": 0},
                "top_consumers": [],
                "stale_items": 0,
                "old_items": 0
            }
            
            current_time = datetime.now().timestamp()
            
            for item in active_items:
                # By type
                type_key = item.type.value
                analysis["by_type"][type_key] = analysis["by_type"].get(type_key, 0) + 1
                
                # By status
                status_key = item.status.value
                analysis["by_status"][status_key] = analysis["by_status"].get(status_key, 0) + 1
                
                # By age
                age_hours = (current_time - item.created) / 3600
                if age_hours < 24:
                    analysis["by_age"]["recent"] += 1
                elif age_hours < 168:  # 1 week
                    analysis["by_age"]["moderate"] += 1
                else:
                    analysis["by_age"]["old"] += 1
                
                # By size
                if item.size_bytes < 1024:  # < 1KB
                    analysis["by_size"]["small"] += 1
                elif item.size_bytes < 1024 * 1024:  # < 1MB
                    analysis["by_size"]["medium"] += 1
                else:
                    analysis["by_size"]["large"] += 1
                
                # Access patterns
                if item.access_count > 10:
                    analysis["access_patterns"]["high"] += 1
                elif item.access_count > 3:
                    analysis["access_patterns"]["medium"] += 1
                else:
                    analysis["access_patterns"]["low"] += 1
                
                # Stale and old items
                if item.is_stale(self.hygiene_system.stale_threshold_hours):
                    analysis["stale_items"] += 1
                
                if item.is_old(self.hygiene_system.old_threshold_days):
                    analysis["old_items"] += 1
            
            # Top consumers (largest items)
            top_consumers = sorted(active_items, key=lambda x: x.size_bytes, reverse=True)[:10]
            analysis["top_consumers"] = [
                {
                    "id": item.id,
                    "type": item.type.value,
                    "size_bytes": item.size_bytes,
                    "size_mb": item.size_bytes / (1024 * 1024),
                    "access_count": item.access_count,
                    "created": item.created,
                    "last_accessed": item.last_accessed
                }
                for item in top_consumers
            ]
            
            return analysis
            
        except Exception as e:
            logging.error(f"Failed to get memory analysis: {e}")
            return {"error": str(e)}
    
    async def run(self):
        """Run the Working Memory Hygiene System."""
        try:
            # The hygiene system runs on a scheduler, so we just monitor it
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Check if scheduler is running
                if not self.hygiene_system.is_running:
                    logging.warning("Memory hygiene scheduler stopped, restarting...")
                    self.hygiene_system.start_scheduler()
                
        except Exception as e:
            logging.error(f"Working Memory Hygiene System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Working Memory Hygiene System."""
        try:
            if self.hygiene_system:
                self.hygiene_system.stop_scheduler()
            
            logging.info("Working Memory Hygiene System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Working Memory Hygiene System: {e}")

# Global instance
memory_hygiene_manager: Optional[MemoryHygieneManager] = None

async def initialize_memory_hygiene_system(brain_instance=None):
    """Initialize the global Memory Hygiene Manager."""
    global memory_hygiene_manager
    try:
        memory_hygiene_manager = MemoryHygieneManager(brain_instance)
        await memory_hygiene_manager.initialize()
        return memory_hygiene_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Memory Hygiene System: {e}")
        return None

def get_memory_hygiene_manager() -> Optional[MemoryHygieneManager]:
    """Get the global Memory Hygiene Manager."""
    return memory_hygiene_manager
