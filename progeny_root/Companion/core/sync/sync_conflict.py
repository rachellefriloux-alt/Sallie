"""Conflict resolution for sync operations.

Implements last-write-wins with manual merge option.
"""

import logging
import time
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger("sync.conflict")


class ConflictResolution(str, Enum):
    """Conflict resolution strategies."""
    LAST_WRITE_WINS = "last_write_wins"
    MANUAL_MERGE = "manual_merge"
    CREATOR_CHOICE = "creator_choice"


class SyncConflictResolver:
    """
    Resolves conflicts during sync operations.
    
    Default strategy: Last-write-wins with manual merge option.
    """
    
    def __init__(self, default_strategy: ConflictResolution = ConflictResolution.LAST_WRITE_WINS):
        """Initialize conflict resolver."""
        self.default_strategy = default_strategy
        logger.info(f"[SyncConflict] Initialized with strategy: {default_strategy.value}")
    
    def detect_conflict(self, local_data: Dict[str, Any], remote_data: Dict[str, Any]) -> bool:
        """
        Detect if there's a conflict between local and remote data.
        
        Args:
            local_data: Local version of data
            remote_data: Remote version of data
            
        Returns:
            True if conflict detected
        """
        # Check if both have same key but different values
        local_ts = local_data.get("last_modified_ts", 0)
        remote_ts = remote_data.get("last_modified_ts", 0)
        
        # Conflict if both modified and timestamps are close (within 1 hour)
        if abs(local_ts - remote_ts) < 3600 and local_ts > 0 and remote_ts > 0:
            # Check if content differs
            local_content = local_data.get("content_hash") or str(local_data)
            remote_content = remote_data.get("content_hash") or str(remote_data)
            
            if local_content != remote_content:
                return True
        
        return False
    
    def resolve_conflict(
        self,
        local_data: Dict[str, Any],
        remote_data: Dict[str, Any],
        strategy: Optional[ConflictResolution] = None
    ) -> Dict[str, Any]:
        """
        Resolve conflict using specified strategy.
        
        Args:
            local_data: Local version
            remote_data: Remote version
            strategy: Resolution strategy (defaults to instance default)
            
        Returns:
            Resolved data
        """
        strategy = strategy or self.default_strategy
        
        if strategy == ConflictResolution.LAST_WRITE_WINS:
            return self._last_write_wins(local_data, remote_data)
        elif strategy == ConflictResolution.MANUAL_MERGE:
            return self._manual_merge(local_data, remote_data)
        elif strategy == ConflictResolution.CREATOR_CHOICE:
            # Return both for Creator to choose
            return {
                "conflict": True,
                "local": local_data,
                "remote": remote_data,
                "requires_choice": True
            }
        
        return local_data  # Default: keep local
    
    def _last_write_wins(self, local_data: Dict[str, Any], remote_data: Dict[str, Any]) -> Dict[str, Any]:
        """Last-write-wins resolution."""
        local_ts = local_data.get("last_modified_ts", 0)
        remote_ts = remote_data.get("last_modified_ts", 0)
        
        if remote_ts > local_ts:
            logger.info(f"[SyncConflict] Remote wins (remote: {remote_ts}, local: {local_ts})")
            return remote_data
        else:
            logger.info(f"[SyncConflict] Local wins (local: {local_ts}, remote: {remote_ts})")
            return local_data
    
    def _manual_merge(self, local_data: Dict[str, Any], remote_data: Dict[str, Any]) -> Dict[str, Any]:
        """Manual merge resolution (returns merged structure for Creator review)."""
        merged = {
            "conflict": True,
            "merged": True,
            "local_changes": local_data,
            "remote_changes": remote_data,
            "requires_review": True,
            "merged_at": time.time()
        }
        
        logger.info("[SyncConflict] Created manual merge structure")
        return merged


# Convenience function expected by tests
_resolver = SyncConflictResolver()


def resolve_conflict(local_data: Dict[str, Any], remote_data: Dict[str, Any], strategy: str = "last_write_wins") -> Dict[str, Any]:
    chosen = ConflictResolution(strategy) if isinstance(strategy, str) else strategy
    return _resolver.resolve_conflict(local_data, remote_data, chosen)

