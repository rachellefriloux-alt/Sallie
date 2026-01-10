# Undo Window - Time-Travel File System
# Implements 1-hour undo functionality with version control and recovery

import asyncio
import json
import time
import os
import sys
import shutil
import hashlib
from typing import Dict, Any, Optional, List, Callable, Union
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import sqlite3
import gzip
import pickle

class ChangeType(Enum):
    """Types of changes tracked by Undo Window."""
    CREATE = "create"
    MODIFY = "modify"
    DELETE = "delete"
    MOVE = "move"
    COPY = "copy"
    RENAME = "rename"

class ChangeStatus(Enum):
    """Status of a change."""
    ACTIVE = "active"
    UNDONE = "undone"
    REDONE = "redone"
    EXPIRED = "expired"

@dataclass
class FileChange:
    """A file change tracked by the Undo Window."""
    id: str
    timestamp: float
    change_type: ChangeType
    file_path: str
    old_path: Optional[str]  # For move/rename operations
    content_hash: Optional[str]
    content_data: Optional[bytes]  # Compressed content
    metadata: Dict[str, Any]
    status: ChangeStatus = ChangeStatus.ACTIVE
    undo_timestamp: Optional[float] = None
    redo_timestamp: Optional[float] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class UndoSession:
    """A session of undo operations."""
    id: str
    start_time: float
    end_time: Optional[float]
    changes: List[FileChange]
    description: str
    user_context: Dict[str, Any]
    
    def __post_init__(self):
        if self.changes is None:
            self.changes = []
        if self.user_context is None:
            self.user_context = {}

class UndoWindow:
    """
    The Undo Window provides time-travel file system functionality.
    
    Features:
    - 1-hour undo window for all file operations
    - Automatic change tracking and versioning
    - Content compression for efficient storage
    - SQLite database for metadata tracking
    - Batch undo and redo operations
    - Change filtering and search
    - Session management
    - Automatic cleanup of expired changes
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.undo_dir = Path.cwd() / ".undo_window"
        self.db_path = self.undo_dir / "undo.db"
        self.content_dir = self.undo_dir / "content"
        self.max_age_hours = 1.0  # 1-hour undo window
        self.max_storage_mb = 1000  # 1GB max storage
        self.compression_level = 6
        self.is_initialized = False
        self.active_session: Optional[UndoSession] = None
        self.lock = threading.Lock()
        
        # Ensure directories exist
        self.undo_dir.mkdir(exist_ok=True)
        self.content_dir.mkdir(exist_ok=True)
        
        # Initialize database
        self.initialize_database()
        
        # Start cleanup thread
        self.start_cleanup_thread()
    
    def initialize_database(self):
        """Initialize the SQLite database for tracking changes."""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS changes (
                        id TEXT PRIMARY KEY,
                        timestamp REAL NOT NULL,
                        change_type TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        old_path TEXT,
                        content_hash TEXT,
                        content_file TEXT,
                        metadata TEXT,
                        status TEXT DEFAULT 'active',
                        undo_timestamp REAL,
                        redo_timestamp REAL
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        start_time REAL NOT NULL,
                        end_time REAL,
                        description TEXT,
                        user_context TEXT
                    )
                ''')
                
                conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_changes_timestamp ON changes(timestamp)
                ''')
                
                conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_changes_file_path ON changes(file_path)
                ''')
                
                conn.commit()
            
            self.is_initialized = True
            logging.info("Undo Window database initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Undo Window database: {e}")
            raise
    
    def start_cleanup_thread(self):
        """Start the cleanup thread for expired changes."""
        def cleanup_loop():
            while True:
                try:
                    self.cleanup_expired_changes()
                    time.sleep(300)  # Check every 5 minutes
                except Exception as e:
                    logging.error(f"Cleanup thread error: {e}")
        
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()
        logging.info("Undo Window cleanup thread started")
    
    def track_change(self, change_type: ChangeType, file_path: str, old_path: Optional[str] = None, 
                     content: Optional[bytes] = None, metadata: Dict[str, Any] = None) -> str:
        """Track a file change."""
        with self.lock:
            try:
                change_id = hashlib.sha256(f"{time.time()}{file_path}{change_type.value}".encode()).hexdigest()[:16]
                
                # Calculate content hash
                content_hash = None
                content_file = None
                if content:
                    content_hash = hashlib.sha256(content).hexdigest()
                    content_file = f"{change_id}.gz"
                    self._save_content(content_file, content)
                
                # Create change record
                change = FileChange(
                    id=change_id,
                    timestamp=time.time(),
                    change_type=change_type,
                    file_path=file_path,
                    old_path=old_path,
                    content_hash=content_hash,
                    content_data=content,
                    metadata=metadata or {},
                    status=ChangeStatus.ACTIVE
                )
                
                # Save to database
                with sqlite3.connect(str(self.db_path)) as conn:
                    conn.execute('''
                        INSERT INTO changes (
                            id, timestamp, change_type, file_path, old_path,
                            content_hash, content_file, metadata, status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        change.id, change.timestamp, change.change_type.value,
                        change.file_path, change.old_path, change.content_hash,
                        content_file, json.dumps(change.metadata), change.status.value
                    ))
                    conn.commit()
                
                # Add to active session
                if self.active_session:
                    self.active_session.changes.append(change)
                
                logging.debug(f"Tracked change: {change.change_type.value} {file_path}")
                return change_id
                
            except Exception as e:
                logging.error(f"Failed to track change: {e}")
                raise
    
    def _save_content(self, filename: str, content: bytes):
        """Save compressed content to file."""
        try:
            content_path = self.content_dir / filename
            with gzip.open(content_path, 'wb', compresslevel=self.compression_level) as f:
                f.write(content)
        except Exception as e:
            logging.error(f"Failed to save content: {e}")
            raise
    
    def _load_content(self, filename: str) -> bytes:
        """Load compressed content from file."""
        try:
            content_path = self.content_dir / filename
            with gzip.open(content_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logging.error(f"Failed to load content: {e}")
            raise
    
    async def undo_change(self, change_id: str) -> Dict[str, Any]:
        """Undo a specific change."""
        with self.lock:
            try:
                # Get change from database
                with sqlite3.connect(str(self.db_path)) as conn:
                    cursor = conn.execute('SELECT * FROM changes WHERE id = ?', (change_id,))
                    row = cursor.fetchone()
                
                if not row:
                    return {"success": False, "error": "Change not found"}
                
                # Parse change data
                change = self._parse_change_row(row)
                
                if change.status != ChangeStatus.ACTIVE:
                    return {"success": False, "error": f"Change already {change.status.value}"}
                
                # Check if change is within undo window
                if time.time() - change.timestamp > (self.max_age_hours * 3600):
                    return {"success": False, "error": "Change expired (beyond 1-hour window)"}
                
                # Perform undo operation
                success = await self._perform_undo(change)
                
                if success:
                    # Update change status
                    change.status = ChangeStatus.UNDONE
                    change.undo_timestamp = time.time()
                    
                    with sqlite3.connect(str(self.db_path)) as conn:
                        conn.execute('''
                            UPDATE changes SET status = ?, undo_timestamp = ? WHERE id = ?
                        ''', (change.status.value, change.undo_timestamp, change_id))
                        conn.commit()
                    
                    return {
                        "success": True,
                        "change_id": change_id,
                        "change_type": change.change_type.value,
                        "file_path": change.file_path,
                        "undo_timestamp": change.undo_timestamp
                    }
                else:
                    return {"success": False, "error": "Failed to perform undo operation"}
                
            except Exception as e:
                logging.error(f"Failed to undo change {change_id}: {e}")
                return {"success": False, "error": str(e)}
    
    async def _perform_undo(self, change: FileChange) -> bool:
        """Perform the actual undo operation."""
        try:
            file_path = Path(change.file_path)
            
            if change.change_type == ChangeType.CREATE:
                # Undo create = delete file
                if file_path.exists():
                    file_path.unlink()
                    return True
            
            elif change.change_type == ChangeType.DELETE:
                # Undo delete = restore file
                if change.content_data and not file_path.exists():
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(file_path, 'wb') as f:
                        f.write(change.content_data)
                    return True
            
            elif change.change_type == ChangeType.MODIFY:
                # Undo modify = restore previous content
                if change.content_data and file_path.exists():
                    with open(file_path, 'wb') as f:
                        f.write(change.content_data)
                    return True
            
            elif change.change_type == ChangeType.MOVE:
                # Undo move = move back to original location
                if change.old_path:
                    old_path = Path(change.old_path)
                    if file_path.exists():
                        old_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.move(str(file_path), str(old_path))
                        return True
            
            elif change.change_type == ChangeType.RENAME:
                # Undo rename = restore original name
                if change.old_path:
                    old_path = Path(change.old_path)
                    if file_path.exists():
                        shutil.move(str(file_path), str(old_path))
                        return True
            
            elif change.change_type == ChangeType.COPY:
                # Undo copy = delete copied file
                if file_path.exists():
                    file_path.unlink()
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to perform undo for {change.file_path}: {e}")
            return False
    
    async def redo_change(self, change_id: str) -> Dict[str, Any]:
        """Redo a previously undone change."""
        with self.lock:
            try:
                # Get change from database
                with sqlite3.connect(str(self.db_path)) as conn:
                    cursor = conn.execute('SELECT * FROM changes WHERE id = ?', (change_id,))
                    row = cursor.fetchone()
                
                if not row:
                    return {"success": False, "error": "Change not found"}
                
                # Parse change data
                change = self._parse_change_row(row)
                
                if change.status != ChangeStatus.UNDONE:
                    return {"success": False, "error": f"Change not undone (status: {change.status.value})"}
                
                # Perform redo operation
                success = await self._perform_redo(change)
                
                if success:
                    # Update change status
                    change.status = ChangeStatus.REDONE
                    change.redo_timestamp = time.time()
                    
                    with sqlite3.connect(str(self.db_path)) as conn:
                        conn.execute('''
                            UPDATE changes SET status = ?, redo_timestamp = ? WHERE id = ?
                        ''', (change.status.value, change.redo_timestamp, change_id))
                        conn.commit()
                    
                    return {
                        "success": True,
                        "change_id": change_id,
                        "change_type": change.change_type.value,
                        "file_path": change.file_path,
                        "redo_timestamp": change.redo_timestamp
                    }
                else:
                    return {"success": False, "error": "Failed to perform redo operation"}
                
            except Exception as e:
                logging.error(f"Failed to redo change {change_id}: {e}")
                return {"success": False, "error": str(e)}
    
    async def _perform_redo(self, change: FileChange) -> bool:
        """Perform the actual redo operation."""
        try:
            file_path = Path(change.file_path)
            
            if change.change_type == ChangeType.CREATE:
                # Redo create = recreate file
                if change.content_data and not file_path.exists():
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(file_path, 'wb') as f:
                        f.write(change.content_data)
                    return True
            
            elif change.change_type == ChangeType.DELETE:
                # Redo delete = delete file again
                if file_path.exists():
                    file_path.unlink()
                    return True
            
            elif change.change_type == ChangeType.MODIFY:
                # Redo modify = restore modified content
                if change.content_data:
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(file_path, 'wb') as f:
                        f.write(change.content_data)
                    return True
            
            elif change.change_type == ChangeType.MOVE:
                # Redo move = move file again
                if change.old_path and Path(change.old_path).exists():
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(change.old_path), str(file_path))
                    return True
            
            elif change.change_type == ChangeType.RENAME:
                # Redo rename = rename file again
                if change.old_path and Path(change.old_path).exists():
                    shutil.move(str(change.old_path), str(file_path))
                    return True
            
            elif change.change_type == ChangeType.COPY:
                # Redo copy = copy file again
                if change.old_path and Path(change.old_path).exists():
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(str(change.old_path), str(file_path))
                    return True
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to perform redo for {change.file_path}: {e}")
            return False
    
    def get_recent_changes(self, limit: int = 50, file_path: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent changes."""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                if file_path:
                    cursor = conn.execute('''
                        SELECT * FROM changes WHERE file_path LIKE ? 
                        ORDER BY timestamp DESC LIMIT ?
                    ''', (f"%{file_path}%", limit))
                else:
                    cursor = conn.execute('''
                        SELECT * FROM changes ORDER BY timestamp DESC LIMIT ?
                    ''', (limit,))
                
                rows = cursor.fetchall()
                
                changes = []
                for row in rows:
                    change = self._parse_change_row(row)
                    changes.append({
                        "id": change.id,
                        "timestamp": change.timestamp,
                        "change_type": change.change_type.value,
                        "file_path": change.file_path,
                        "old_path": change.old_path,
                        "content_hash": change.content_hash,
                        "status": change.status.value,
                        "undo_timestamp": change.undo_timestamp,
                        "redo_timestamp": change.redo_timestamp,
                        "metadata": change.metadata
                    })
                
                return changes
                
        except Exception as e:
            logging.error(f"Failed to get recent changes: {e}")
            return []
    
    def _parse_change_row(self, row) -> FileChange:
        """Parse a database row into a FileChange object."""
        return FileChange(
            id=row[0],
            timestamp=row[1],
            change_type=ChangeType(row[2]),
            file_path=row[3],
            old_path=row[4],
            content_hash=row[5],
            content_data=None,  # Loaded on demand
            metadata=json.loads(row[7]) if row[7] else {},
            status=ChangeStatus(row[8]),
            undo_timestamp=row[9],
            redo_timestamp=row[10]
        )
    
    def cleanup_expired_changes(self):
        """Clean up changes older than the undo window."""
        try:
            cutoff_time = time.time() - (self.max_age_hours * 3600)
            
            with sqlite3.connect(str(self.db_path)) as conn:
                # Get expired changes
                cursor = conn.execute('''
                    SELECT id, content_file FROM changes 
                    WHERE timestamp < ? AND status = 'active'
                ''', (cutoff_time,))
                
                expired_changes = cursor.fetchall()
                
                # Delete content files
                for change_id, content_file in expired_changes:
                    if content_file:
                        content_path = self.content_dir / content_file
                        if content_path.exists():
                            content_path.unlink()
                
                # Update database
                conn.execute('''
                    UPDATE changes SET status = 'expired' 
                    WHERE timestamp < ? AND status = 'active'
                ''', (cutoff_time,))
                
                conn.commit()
                
                if expired_changes:
                    logging.info(f"Cleaned up {len(expired_changes)} expired changes")
                
        except Exception as e:
            logging.error(f"Failed to cleanup expired changes: {e}")
    
    def start_session(self, description: str, user_context: Dict[str, Any] = None) -> str:
        """Start a new undo session."""
        with self.lock:
            try:
                session_id = hashlib.sha256(f"{time.time()}{description}".encode()).hexdigest()[:16]
                
                session = UndoSession(
                    id=session_id,
                    start_time=time.time(),
                    end_time=None,
                    changes=[],
                    description=description,
                    user_context=user_context or {}
                )
                
                # Save to database
                with sqlite3.connect(str(self.db_path)) as conn:
                    conn.execute('''
                        INSERT INTO sessions (id, start_time, description, user_context)
                        VALUES (?, ?, ?, ?)
                    ''', (session.id, session.start_time, session.description, json.dumps(session.user_context)))
                    conn.commit()
                
                self.active_session = session
                logging.info(f"Started undo session: {session_id}")
                return session_id
                
            except Exception as e:
                logging.error(f"Failed to start session: {e}")
                raise
    
    def end_session(self) -> Optional[str]:
        """End the current undo session."""
        with self.lock:
            if self.active_session:
                try:
                    self.active_session.end_time = time.time()
                    
                    # Update database
                    with sqlite3.connect(str(self.db_path)) as conn:
                        conn.execute('''
                            UPDATE sessions SET end_time = ? WHERE id = ?
                        ''', (self.active_session.end_time, self.active_session.id))
                        conn.commit()
                    
                    session_id = self.active_session.id
                    self.active_session = None
                    
                    logging.info(f"Ended undo session: {session_id}")
                    return session_id
                    
                except Exception as e:
                    logging.error(f"Failed to end session: {e}")
                    return None
            return None
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific session."""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                cursor = conn.execute('''
                    SELECT * FROM sessions WHERE id = ?
                ''', (session_id,))
                
                row = cursor.fetchone()
                if not row:
                    return None
                
                # Get changes for this session
                changes_cursor = conn.execute('''
                    SELECT id, timestamp, change_type, file_path, status 
                    FROM changes WHERE timestamp >= ? AND timestamp <= ?
                    ORDER BY timestamp
                ''', (row[1], row[2] if row[2] else time.time()))
                
                changes = []
                for change_row in changes_cursor.fetchall():
                    changes.append({
                        "id": change_row[0],
                        "timestamp": change_row[1],
                        "change_type": change_row[2],
                        "file_path": change_row[3],
                        "status": change_row[4]
                    })
                
                return {
                    "id": row[0],
                    "start_time": row[1],
                    "end_time": row[2],
                    "description": row[3],
                    "user_context": json.loads(row[4]) if row[4] else {},
                    "changes": changes,
                    "change_count": len(changes)
                }
                
        except Exception as e:
            logging.error(f"Failed to get session info: {e}")
            return None
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get Undo Window statistics."""
        try:
            with sqlite3.connect(str(self.db_path)) as conn:
                # Total changes
                cursor = conn.execute('SELECT COUNT(*) FROM changes')
                total_changes = cursor.fetchone()[0]
                
                # Changes by type
                cursor = conn.execute('''
                    SELECT change_type, COUNT(*) FROM changes GROUP BY change_type
                ''')
                changes_by_type = dict(cursor.fetchall())
                
                # Changes by status
                cursor = conn.execute('''
                    SELECT status, COUNT(*) FROM changes GROUP BY status
                ''')
                changes_by_status = dict(cursor.fetchall())
                
                # Storage usage
                storage_usage = sum(f.stat().st_size for f in self.content_dir.glob("*") if f.is_file())
                storage_usage_mb = storage_usage / (1024 * 1024)
                
                # Active changes within window
                cutoff_time = time.time() - (self.max_age_hours * 3600)
                cursor = conn.execute('''
                    SELECT COUNT(*) FROM changes 
                    WHERE timestamp >= ? AND status = 'active'
                ''', (cutoff_time,))
                active_changes = cursor.fetchone()[0]
                
                return {
                    "total_changes": total_changes,
                    "active_changes": active_changes,
                    "changes_by_type": changes_by_type,
                    "changes_by_status": changes_by_status,
                    "storage_usage_mb": storage_usage_mb,
                    "max_storage_mb": self.max_storage_mb,
                    "undo_window_hours": self.max_age_hours,
                    "content_files": len(list(self.content_dir.glob("*"))),
                    "active_session": self.active_session.id if self.active_session else None
                }
                
        except Exception as e:
            logging.error(f"Failed to get statistics: {e}")
            return {"error": str(e)}

# Factory function
def create_undo_window(brain_instance=None) -> UndoWindow:
    """Create and initialize an Undo Window."""
    undo_window = UndoWindow(brain_instance)
    return undo_window
