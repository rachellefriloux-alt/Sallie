# Undo Window Integration for Sallie Server
# Adds time-travel file system functionality and endpoints

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
from undo_window import UndoWindow, ChangeType

class UndoWindowManager:
    """Manages the Undo Window System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.undo_window: Optional[UndoWindow] = None
        self.is_initialized = False
        self.file_watchers: Dict[str, Any] = {}
        
    async def initialize(self):
        """Initialize the Undo Window System."""
        try:
            self.undo_window = UndoWindow(self.brain)
            self.is_initialized = True
            
            # Start file watching
            await self.start_file_watching()
            
            logging.info("Undo Window System initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Undo Window System: {e}")
            raise
    
    async def start_file_watching(self):
        """Start watching file changes for automatic tracking."""
        try:
            # Monitor working directory for changes
            working_dir = Path.cwd() / "working"
            if working_dir.exists():
                await self._watch_directory(working_dir)
            
            # Monitor other important directories
            important_dirs = [
                Path.cwd() / "heritage",
                Path.cwd() / "archive",
                Path.cwd() / "config"
            ]
            
            for dir_path in important_dirs:
                if dir_path.exists():
                    await self._watch_directory(dir_path)
            
            logging.info("File watching started for Undo Window")
            
        except Exception as e:
            logging.error(f"Failed to start file watching: {e}")
    
    async def _watch_directory(self, directory: Path):
        """Watch a directory for file changes."""
        # This is a simplified implementation
        # In a real implementation, you'd use a proper file watching library like watchdog
        try:
            # For now, we'll just track that we're watching this directory
            self.file_watchers[str(directory)] = {
                "path": str(directory),
                "watching": True,
                "files": list(directory.glob("*"))
            }
        except Exception as e:
            logging.error(f"Failed to watch directory {directory}: {e}")
    
    async def track_file_change(self, change_type: str, file_path: str, old_path: Optional[str] = None, 
                              content: Optional[bytes] = None, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Track a file change."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            # Convert string change_type to enum
            change_type_enum = ChangeType(change_type.lower())
            
            # Track the change
            change_id = self.undo_window.track_change(
                change_type=change_type_enum,
                file_path=file_path,
                old_path=old_path,
                content=content,
                metadata=metadata or {}
            )
            
            return {
                "success": True,
                "change_id": change_id,
                "change_type": change_type,
                "file_path": file_path,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to track file change: {e}")
            return {"error": str(e)}
    
    async def undo_change(self, change_id: str) -> Dict[str, Any]:
        """Undo a specific change."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            result = await self.undo_window.undo_change(change_id)
            return result
            
        except Exception as e:
            logging.error(f"Failed to undo change: {e}")
            return {"error": str(e)}
    
    async def redo_change(self, change_id: str) -> Dict[str, Any]:
        """Redo a previously undone change."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            result = await self.undo_window.redo_change(change_id)
            return result
            
        except Exception as e:
            logging.error(f"Failed to redo change: {e}")
            return {"error": str(e)}
    
    def get_recent_changes(self, limit: int = 50, file_path: Optional[str] = None) -> Dict[str, Any]:
        """Get recent changes."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            changes = self.undo_window.get_recent_changes(limit, file_path)
            
            return {
                "changes": changes,
                "count": len(changes)
            }
            
        except Exception as e:
            logging.error(f"Failed to get recent changes: {e}")
            return {"error": str(e)}
    
    def start_session(self, description: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Start a new undo session."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            session_id = self.undo_window.start_session(description, user_context)
            
            return {
                "success": True,
                "session_id": session_id,
                "description": description,
                "start_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to start session: {e}")
            return {"error": str(e)}
    
    def end_session(self) -> Dict[str, Any]:
        """End the current undo session."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            session_id = self.undo_window.end_session()
            
            if session_id:
                return {
                    "success": True,
                    "session_id": session_id,
                    "end_time": datetime.now().isoformat()
                }
            else:
                return {"success": False, "error": "No active session"}
                
        except Exception as e:
            logging.error(f"Failed to end session: {e}")
            return {"error": str(e)}
    
    def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get information about a specific session."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            session_info = self.undo_window.get_session_info(session_id)
            
            if session_info:
                return session_info
            else:
                return {"error": "Session not found"}
                
        except Exception as e:
            logging.error(f"Failed to get session info: {e}")
            return {"error": str(e)}
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get Undo Window statistics."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            stats = self.undo_window.get_statistics()
            
            # Add additional information
            stats.update({
                "file_watchers": len(self.file_watchers),
                "watched_directories": list(self.file_watchers.keys()),
                "active_session": self.undo_window.active_session.id if self.undo_window.active_session else None
            })
            
            return stats
            
        except Exception as e:
            logging.error(f"Failed to get statistics: {e}")
            return {"error": str(e)}
    
    async def batch_undo(self, change_ids: List[str]) -> Dict[str, Any]:
        """Undo multiple changes at once."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            results = []
            successful = 0
            failed = 0
            
            for change_id in change_ids:
                result = await self.undo_window.undo_change(change_id)
                results.append(result)
                
                if result.get("success"):
                    successful += 1
                else:
                    failed += 1
            
            return {
                "success": True,
                "total_changes": len(change_ids),
                "successful": successful,
                "failed": failed,
                "results": results
            }
            
        except Exception as e:
            logging.error(f"Failed to batch undo: {e}")
            return {"error": str(e)}
    
    async def batch_redo(self, change_ids: List[str]) -> Dict[str, Any]:
        """Redo multiple changes at once."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            results = []
            successful = 0
            failed = 0
            
            for change_id in change_ids:
                result = await self.undo_window.redo_change(change_id)
                results.append(result)
                
                if result.get("success"):
                    successful += 1
                else:
                    failed += 1
            
            return {
                "success": True,
                "total_changes": len(change_ids),
                "successful": successful,
                "failed": failed,
                "results": results
            }
            
        except Exception as e:
            logging.error(f"Failed to batch redo: {e}")
            return {"error": str(e)}
    
    def get_change_details(self, change_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific change."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            changes = self.undo_window.get_recent_changes(limit=1000)
            
            for change in changes:
                if change["id"] == change_id:
                    # Add additional details
                    change_details = change.copy()
                    
                    # Check if file exists
                    file_path = Path(change["file_path"])
                    change_details["file_exists"] = file_path.exists()
                    
                    if file_path.exists():
                        change_details["file_size"] = file_path.stat().st_size
                        change_details["file_modified"] = file_path.stat().st_mtime
                    
                    # Check if old path exists (for move/rename)
                    if change["old_path"]:
                        old_path = Path(change["old_path"])
                        change_details["old_path_exists"] = old_path.exists()
                    
                    return change_details
            
            return {"error": "Change not found"}
            
        except Exception as e:
            logging.error(f"Failed to get change details: {e}")
            return {"error": str(e)}
    
    async def restore_file(self, file_path: str, timestamp: Optional[float] = None) -> Dict[str, Any]:
        """Restore a file to a specific point in time."""
        if not self.undo_window or not self.is_initialized:
            return {"error": "Undo Window System not initialized"}
        
        try:
            # Get changes for this file
            changes = self.undo_window.get_recent_changes(limit=1000, file_path=file_path)
            
            if not changes:
                return {"error": "No changes found for this file"}
            
            # Find the most recent change before the specified timestamp
            target_change = None
            if timestamp:
                for change in changes:
                    if change["timestamp"] <= timestamp:
                        target_change = change
                        break
            else:
                # Use the most recent change
                target_change = changes[0]
            
            if not target_change:
                return {"error": "No suitable change found for restoration"}
            
            # Undo all changes after the target change
            changes_to_undo = []
            for change in changes:
                if change["timestamp"] > target_change["timestamp"] and change["status"] == "active":
                    changes_to_undo.append(change["id"])
            
            if changes_to_undo:
                result = await self.batch_undo(changes_to_undo)
                return {
                    "success": True,
                    "message": f"Restored {file_path} to {datetime.fromtimestamp(target_change['timestamp']).isoformat()}",
                    "changes_undone": result["successful"],
                    "target_change": target_change
                }
            else:
                return {
                    "success": True,
                    "message": f"File {file_path} is already at the target state",
                    "target_change": target_change
                }
                
        except Exception as e:
            logging.error(f"Failed to restore file: {e}")
            return {"error": str(e)}
    
    async def run(self):
        """Run the Undo Window System."""
        try:
            # The undo window system runs on its own cleanup thread
            # We just monitor it here
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Could perform periodic maintenance here
                pass
                
        except Exception as e:
            logging.error(f"Undo Window System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Undo Window System."""
        try:
            # End any active session
            if self.undo_window and self.undo_window.active_session:
                self.undo_window.end_session()
            
            logging.info("Undo Window System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Undo Window System: {e}")

# Global instance
undo_window_manager: Optional[UndoWindowManager] = None

async def initialize_undo_window_system(brain_instance=None):
    """Initialize the global Undo Window Manager."""
    global undo_window_manager
    try:
        undo_window_manager = UndoWindowManager(brain_instance)
        await undo_window_manager.initialize()
        return undo_window_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Undo Window System: {e}")
        return None

def get_undo_window_manager() -> Optional[UndoWindowManager]:
    """Get the global Undo Window Manager."""
    return undo_window_manager
