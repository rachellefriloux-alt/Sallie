# Working Memory Hygiene System
# Implements daily reset, weekly review, and stale item handling for working memory

import asyncio
import json
import time
import os
import sys
from typing import Dict, Any, Optional, List, Callable
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import shutil
import tempfile
import threading
import schedule

class MemoryStatus(Enum):
    """Status of memory items."""
    ACTIVE = "active"
    STALE = "stale"
    ARCHIVED = "archived"
    DELETED = "deleted"

class MemoryType(Enum):
    """Types of memory items."""
    CONVERSATION = "conversation"
    WORKING_NOTE = "working_note"
    TEMPORARY_FILE = "temporary_file"
    CACHE_ENTRY = "cache_entry"
    SESSION_DATA = "session_data"
    DRAFT = "draft"

@dataclass
class MemoryItem:
    """A memory item in the working memory."""
    id: str
    type: MemoryType
    content: Any
    created: float
    last_accessed: float
    access_count: int
    size_bytes: int
    status: MemoryStatus = MemoryStatus.ACTIVE
    tags: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.metadata is None:
            self.metadata = {}
    
    def is_stale(self, stale_threshold_hours: int = 24) -> bool:
        """Check if memory item is stale."""
        return (time.time() - self.last_accessed) > (stale_threshold_hours * 3600)
    
    def is_old(self, old_threshold_days: int = 7) -> bool:
        """Check if memory item is old."""
        return (time.time() - self.created) > (old_threshold_days * 86400)

@dataclass
class HygieneReport:
    """Report from a hygiene operation."""
    operation: str
    timestamp: float
    items_processed: int
    items_archived: int
    items_deleted: int
    space_freed: int
    errors: List[str]
    details: Dict[str, Any]
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.details is None:
            self.details = {}

class WorkingMemoryHygiene:
    """
    The Working Memory Hygiene System manages memory cleanup and maintenance.
    
    Features:
    - Daily reset of working memory
    - Weekly review and cleanup
    - Stale item detection and handling
    - Automatic archiving and deletion
    - Memory usage optimization
    - Configurable thresholds and policies
    - Scheduled maintenance tasks
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.working_dir = Path.cwd() / "working"
        self.archive_dir = Path.cwd() / "archive" / "working_memory"
        self.config_file = Path.home() / ".sallie" / "memory_hygiene_config.json"
        self.reports_dir = Path.home() / ".sallie" / "hygiene_reports"
        
        # Ensure directories exist
        self.working_dir.mkdir(exist_ok=True)
        self.archive_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
        # Configuration
        self.load_config()
        
        # Memory tracking
        self.memory_items: List[MemoryItem] = []
        self.last_daily_reset = 0.0
        self.last_weekly_review = 0.0
        self.is_running = False
        self.scheduler_thread = None
        
        # Initialize memory tracking
        self.initialize_memory_tracking()
    
    def load_config(self):
        """Load hygiene configuration."""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.daily_reset_enabled = config.get('daily_reset_enabled', True)
                    self.weekly_review_enabled = config.get('weekly_review_enabled', True)
                    self.stale_threshold_hours = config.get('stale_threshold_hours', 24)
                    self.old_threshold_days = config.get('old_threshold_days', 7)
                    self.max_working_memory_mb = config.get('max_working_memory_mb', 500)
                    self.archive_before_delete = config.get('archive_before_delete', True)
                    self.daily_reset_time = config.get('daily_reset_time', "02:00")
                    self.weekly_review_day = config.get('weekly_review_day', "sunday")
                    self.weekly_review_time = config.get('weekly_review_time', "03:00")
            else:
                # Default configuration
                self.daily_reset_enabled = True
                self.weekly_review_enabled = True
                self.stale_threshold_hours = 24
                self.old_threshold_days = 7
                self.max_working_memory_mb = 500
                self.archive_before_delete = True
                self.daily_reset_time = "02:00"
                self.weekly_review_day = "sunday"
                self.weekly_review_time = "03:00"
                self.save_config()
        except Exception as e:
            logging.warning(f"Failed to load hygiene config: {e}")
            self.set_default_config()
    
    def set_default_config(self):
        """Set default configuration."""
        self.daily_reset_enabled = True
        self.weekly_review_enabled = True
        self.stale_threshold_hours = 24
        self.old_threshold_days = 7
        self.max_working_memory_mb = 500
        self.archive_before_delete = True
        self.daily_reset_time = "02:00"
        self.weekly_review_day = "sunday"
        self.weekly_review_time = "03:00"
    
    def save_config(self):
        """Save hygiene configuration."""
        try:
            config = {
                'daily_reset_enabled': self.daily_reset_enabled,
                'weekly_review_enabled': self.weekly_review_enabled,
                'stale_threshold_hours': self.stale_threshold_hours,
                'old_threshold_days': self.old_threshold_days,
                'max_working_memory_mb': self.max_working_memory_mb,
                'archive_before_delete': self.archive_before_delete,
                'daily_reset_time': self.daily_reset_time,
                'weekly_review_day': self.weekly_review_day,
                'weekly_review_time': self.weekly_review_time
            }
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save hygiene config: {e}")
    
    def initialize_memory_tracking(self):
        """Initialize tracking of current memory items."""
        try:
            self.memory_items = []
            
            # Scan working directory for items
            if self.working_dir.exists():
                for item_path in self.working_dir.iterdir():
                    if item_path.is_file():
                        stat = item_path.stat()
                        memory_item = MemoryItem(
                            id=str(item_path.name),
                            type=self._determine_memory_type(item_path),
                            content=item_path,
                            created=stat.st_ctime,
                            last_accessed=stat.st_atime,
                            access_count=0,
                            size_bytes=stat.st_size,
                            status=MemoryStatus.ACTIVE
                        )
                        self.memory_items.append(memory_item)
            
            logging.info(f"Initialized tracking for {len(self.memory_items)} memory items")
            
        except Exception as e:
            logging.error(f"Failed to initialize memory tracking: {e}")
    
    def _determine_memory_type(self, path: Path) -> MemoryType:
        """Determine the type of memory item based on path."""
        name = path.name.lower()
        
        if name.startswith("conversation_") or name.startswith("chat_"):
            return MemoryType.CONVERSATION
        elif name.startswith("note_") or name.startswith("working_"):
            return MemoryType.WORKING_NOTE
        elif name.startswith("temp_") or name.startswith("tmp_"):
            return MemoryType.TEMPORARY_FILE
        elif name.startswith("cache_"):
            return MemoryType.CACHE_ENTRY
        elif name.startswith("session_"):
            return MemoryType.SESSION_DATA
        elif name.startswith("draft_"):
            return MemoryType.DRAFT
        else:
            return MemoryType.WORKING_NOTE  # Default
    
    async def daily_reset(self) -> HygieneReport:
        """Perform daily reset of working memory."""
        report = HygieneReport(
            operation="daily_reset",
            timestamp=time.time(),
            items_processed=0,
            items_archived=0,
            items_deleted=0,
            space_freed=0,
            errors=[],
            details={}
        )
        
        try:
            logging.info("Starting daily memory reset")
            
            # Update memory tracking
            self.update_memory_tracking()
            
            # Process stale items
            stale_items = [item for item in self.memory_items if item.is_stale(self.stale_threshold_hours)]
            
            for item in stale_items:
                try:
                    if self.archive_before_delete and item.type != MemoryType.TEMPORARY_FILE:
                        # Archive the item
                        await self._archive_memory_item(item)
                        report.items_archived += 1
                    else:
                        # Delete the item directly
                        await self._delete_memory_item(item)
                        report.items_deleted += 1
                    
                    report.items_processed += 1
                    report.space_freed += item.size_bytes
                    
                except Exception as e:
                    report.errors.append(f"Failed to process item {item.id}: {e}")
            
            # Clean up temporary files
            temp_items = [item for item in self.memory_items if item.type == MemoryType.TEMPORARY_FILE]
            for item in temp_items:
                try:
                    await self._delete_memory_item(item)
                    report.items_deleted += 1
                    report.items_processed += 1
                    report.space_freed += item.size_bytes
                except Exception as e:
                    report.errors.append(f"Failed to delete temp item {item.id}: {e}")
            
            # Check memory usage
            total_size = sum(item.size_bytes for item in self.memory_items if item.status == MemoryStatus.ACTIVE)
            total_size_mb = total_size / (1024 * 1024)
            
            if total_size_mb > self.max_working_memory_mb:
                # Remove oldest items to free space
                active_items = [item for item in self.memory_items if item.status == MemoryStatus.ACTIVE]
                active_items.sort(key=lambda x: x.last_accessed)
                
                space_to_free = (total_size_mb - self.max_working_memory_mb) * 1024 * 1024
                freed_space = 0
                
                for item in active_items:
                    if freed_space >= space_to_free:
                        break
                    
                    try:
                        await self._archive_memory_item(item)
                        report.items_archived += 1
                        report.items_processed += 1
                        report.space_freed += item.size_bytes
                        freed_space += item.size_bytes
                    except Exception as e:
                        report.errors.append(f"Failed to archive item {item.id}: {e}")
            
            # Update last reset time
            self.last_daily_reset = time.time()
            
            # Update details
            report.details.update({
                "total_items_before": len(self.memory_items),
                "stale_items_found": len(stale_items),
                "temp_items_found": len(temp_items),
                "total_size_mb_before": total_size_mb,
                "total_size_mb_after": sum(item.size_bytes for item in self.memory_items if item.status == MemoryStatus.ACTIVE) / (1024 * 1024)
            })
            
            logging.info(f"Daily reset completed: {report.items_processed} items processed, {report.space_freed / 1024 / 1024:.2f} MB freed")
            
        except Exception as e:
            report.errors.append(f"Daily reset failed: {e}")
            logging.error(f"Daily reset failed: {e}")
        
        # Save report
        self.save_report(report)
        
        return report
    
    async def weekly_review(self) -> HygieneReport:
        """Perform weekly review and cleanup."""
        report = HygieneReport(
            operation="weekly_review",
            timestamp=time.time(),
            items_processed=0,
            items_archived=0,
            items_deleted=0,
            space_freed=0,
            errors=[],
            details={}
        )
        
        try:
            logging.info("Starting weekly memory review")
            
            # Update memory tracking
            self.update_memory_tracking()
            
            # Find old items
            old_items = [item for item in self.memory_items if item.is_old(self.old_threshold_days)]
            
            # Analyze usage patterns
            usage_stats = self._analyze_usage_patterns()
            
            # Process old items based on usage
            for item in old_items:
                try:
                    # Check if item should be kept based on usage
                    if self._should_keep_item(item, usage_stats):
                        # Archive important items
                        await self._archive_memory_item(item)
                        report.items_archived += 1
                    else:
                        # Delete unused items
                        await self._delete_memory_item(item)
                        report.items_deleted += 1
                    
                    report.items_processed += 1
                    report.space_freed += item.size_bytes
                    
                except Exception as e:
                    report.errors.append(f"Failed to process old item {item.id}: {e}")
            
            # Cleanup archive directory (keep only last 30 days)
            await self._cleanup_archive()
            
            # Update last review time
            self.last_weekly_review = time.time()
            
            # Update details
            report.details.update({
                "total_items_before": len(self.memory_items),
                "old_items_found": len(old_items),
                "usage_stats": usage_stats,
                "archive_cleanup": "completed"
            })
            
            logging.info(f"Weekly review completed: {report.items_processed} items processed, {report.space_freed / 1024 / 1024:.2f} MB freed")
            
        except Exception as e:
            report.errors.append(f"Weekly review failed: {e}")
            logging.error(f"Weekly review failed: {e}")
        
        # Save report
        self.save_report(report)
        
        return report
    
    def _analyze_usage_patterns(self) -> Dict[str, Any]:
        """Analyze usage patterns of memory items."""
        patterns = {
            "by_type": {},
            "by_age": {"recent": 0, "moderate": 0, "old": 0},
            "by_size": {"small": 0, "medium": 0, "large": 0},
            "access_frequency": {"high": 0, "medium": 0, "low": 0}
        }
        
        current_time = time.time()
        
        for item in self.memory_items:
            # By type
            type_key = item.type.value
            patterns["by_type"][type_key] = patterns["by_type"].get(type_key, 0) + 1
            
            # By age
            age_hours = (current_time - item.created) / 3600
            if age_hours < 24:
                patterns["by_age"]["recent"] += 1
            elif age_hours < 168:  # 1 week
                patterns["by_age"]["moderate"] += 1
            else:
                patterns["by_age"]["old"] += 1
            
            # By size
            if item.size_bytes < 1024:  # < 1KB
                patterns["by_size"]["small"] += 1
            elif item.size_bytes < 1024 * 1024:  # < 1MB
                patterns["by_size"]["medium"] += 1
            else:
                patterns["by_size"]["large"] += 1
            
            # By access frequency
            if item.access_count > 10:
                patterns["access_frequency"]["high"] += 1
            elif item.access_count > 3:
                patterns["access_frequency"]["medium"] += 1
            else:
                patterns["access_frequency"]["low"] += 1
        
        return patterns
    
    def _should_keep_item(self, item: MemoryItem, usage_stats: Dict[str, Any]) -> bool:
        """Determine if an item should be kept based on usage patterns."""
        # Keep items with high access count
        if item.access_count > 5:
            return True
        
        # Keep recent items
        if not item.is_old(self.old_threshold_days):
            return True
        
        # Keep items of important types
        if item.type in [MemoryType.CONVERSATION, MemoryType.SESSION_DATA]:
            return True
        
        # Keep items with specific tags
        if any(tag in ["important", "keep", "reference"] for tag in item.tags):
            return True
        
        return False
    
    async def _archive_memory_item(self, item: MemoryItem):
        """Archive a memory item."""
        try:
            # Create archive path
            archive_date = datetime.fromtimestamp(time.time()).strftime("%Y-%m-%d")
            archive_path = self.archive_dir / archive_date
            archive_path.mkdir(exist_ok=True)
            
            # Archive the item
            if isinstance(item.content, Path) and item.content.exists():
                archived_path = archive_path / item.content.name
                shutil.move(str(item.content), str(archived_path))
                
                # Update item status
                item.status = MemoryStatus.ARCHIVED
                
                logging.debug(f"Archived memory item: {item.id}")
            
        except Exception as e:
            logging.error(f"Failed to archive memory item {item.id}: {e}")
            raise
    
    async def _delete_memory_item(self, item: MemoryItem):
        """Delete a memory item."""
        try:
            if isinstance(item.content, Path) and item.content.exists():
                item.content.unlink()
                
                # Update item status
                item.status = MemoryStatus.DELETED
                
                logging.debug(f"Deleted memory item: {item.id}")
            
        except Exception as e:
            logging.error(f"Failed to delete memory item {item.id}: {e}")
            raise
    
    async def _cleanup_archive(self):
        """Clean up old archive directories."""
        try:
            current_time = time.time()
            max_age_days = 30
            
            for archive_dir in self.archive_dir.iterdir():
                if archive_dir.is_dir():
                    # Check directory age
                    dir_age = current_time - archive_dir.stat().st_mtime
                    
                    if dir_age > (max_age_days * 86400):
                        shutil.rmtree(archive_dir)
                        logging.debug(f"Removed old archive directory: {archive_dir}")
        
        except Exception as e:
            logging.error(f"Failed to cleanup archive: {e}")
    
    def update_memory_tracking(self):
        """Update memory tracking with current state."""
        try:
            # Re-scan working directory
            self.initialize_memory_tracking()
            
        except Exception as e:
            logging.error(f"Failed to update memory tracking: {e}")
    
    def save_report(self, report: HygieneReport):
        """Save a hygiene report to disk."""
        try:
            timestamp = datetime.fromtimestamp(report.timestamp).strftime("%Y%m%d_%H%M%S")
            filename = f"hygiene_report_{report.operation}_{timestamp}.json"
            report_path = self.reports_dir / filename
            
            with open(report_path, 'w') as f:
                json.dump(asdict(report), f, indent=2, default=str)
            
            logging.debug(f"Saved hygiene report: {report_path}")
            
        except Exception as e:
            logging.error(f"Failed to save hygiene report: {e}")
    
    def get_memory_status(self) -> Dict[str, Any]:
        """Get current memory status."""
        try:
            self.update_memory_tracking()
            
            active_items = [item for item in self.memory_items if item.status == MemoryStatus.ACTIVE]
            total_size = sum(item.size_bytes for item in active_items)
            
            return {
                "total_items": len(self.memory_items),
                "active_items": len(active_items),
                "archived_items": len([item for item in self.memory_items if item.status == MemoryStatus.ARCHIVED]),
                "deleted_items": len([item for item in self.memory_items if item.status == MemoryStatus.DELETED]),
                "total_size_bytes": total_size,
                "total_size_mb": total_size / (1024 * 1024),
                "last_daily_reset": self.last_daily_reset,
                "last_weekly_review": self.last_weekly_review,
                "stale_items": len([item for item in active_items if item.is_stale(self.stale_threshold_hours)]),
                "old_items": len([item for item in active_items if item.is_old(self.old_threshold_days)])
            }
            
        except Exception as e:
            logging.error(f"Failed to get memory status: {e}")
            return {"error": str(e)}
    
    def get_recent_reports(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent hygiene reports."""
        try:
            reports = []
            
            for report_file in sorted(self.reports_dir.glob("*.json"), reverse=True)[:limit]:
                try:
                    with open(report_file, 'r') as f:
                        report = json.load(f)
                        reports.append(report)
                except Exception:
                    continue
            
            return reports
            
        except Exception as e:
            logging.error(f"Failed to get recent reports: {e}")
            return []
    
    def start_scheduler(self):
        """Start the maintenance scheduler."""
        try:
            if self.is_running:
                return
            
            # Schedule daily reset
            if self.daily_reset_enabled:
                schedule.every().day.at(self.daily_reset_time).do(self._run_daily_reset)
            
            # Schedule weekly review
            if self.weekly_review_enabled:
                getattr(schedule.every(), self.weekly_review_day).at(self.weekly_review_time).do(self._run_weekly_review)
            
            # Start scheduler thread
            self.is_running = True
            self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
            self.scheduler_thread.start()
            
            logging.info("Memory hygiene scheduler started")
            
        except Exception as e:
            logging.error(f"Failed to start scheduler: {e}")
    
    def stop_scheduler(self):
        """Stop the maintenance scheduler."""
        try:
            self.is_running = False
            if self.scheduler_thread:
                self.scheduler_thread.join(timeout=5)
            
            schedule.clear()
            logging.info("Memory hygiene scheduler stopped")
            
        except Exception as e:
            logging.error(f"Failed to stop scheduler: {e}")
    
    def _run_scheduler(self):
        """Run the scheduler loop."""
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logging.error(f"Scheduler error: {e}")
    
    def _run_daily_reset(self):
        """Run daily reset (scheduler callback)."""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.daily_reset())
            loop.close()
        except Exception as e:
            logging.error(f"Scheduled daily reset failed: {e}")
    
    def _run_weekly_review(self):
        """Run weekly review (scheduler callback)."""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self.weekly_review())
            loop.close()
        except Exception as e:
            logging.error(f"Scheduled weekly review failed: {e}")
    
    async def manual_cleanup(self, operation: str = "all") -> HygieneReport:
        """Perform manual cleanup operation."""
        if operation == "daily":
            return await self.daily_reset()
        elif operation == "weekly":
            return await self.weekly_review()
        elif operation == "all":
            # Run both operations
            daily_report = await self.daily_reset()
            weekly_report = await self.weekly_review()
            
            # Combine reports
            combined_report = HygieneReport(
                operation="manual_all",
                timestamp=time.time(),
                items_processed=daily_report.items_processed + weekly_report.items_processed,
                items_archived=daily_report.items_archived + weekly_report.items_archived,
                items_deleted=daily_report.items_deleted + weekly_report.items_deleted,
                space_freed=daily_report.space_freed + weekly_report.space_freed,
                errors=daily_report.errors + weekly_report.errors,
                details={
                    "daily_report": asdict(daily_report),
                    "weekly_report": asdict(weekly_report)
                }
            )
            
            return combined_report
        else:
            raise ValueError(f"Unknown operation: {operation}")

# Factory function
def create_working_memory_hygiene(brain_instance=None) -> WorkingMemoryHygiene:
    """Create and initialize a Working Memory Hygiene system."""
    hygiene = WorkingMemoryHygiene(brain_instance)
    return hygiene
