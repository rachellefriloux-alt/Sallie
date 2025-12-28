"""Heritage versioning protocol (Section 21.3.4).

Manages version history for heritage files:
- core.json (stable identity DNA)
- preferences.json (tunable support preferences)
- learned.json (learned beliefs)
"""

import json
import logging
import shutil
import time
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("heritage.versioning")

HERITAGE_DIR = Path("progeny_root/limbic/heritage")
HISTORY_DIR = HERITAGE_DIR / "history"
CHANGELOG_FILE = HERITAGE_DIR / "changelog.md"


class HeritageVersioning:
    """
    Manages versioning for heritage files.
    
    Protocol (Section 21.3.4):
    1. Copy current file to history/{timestamp}_v{N}.json
    2. Append entry to changelog.md
    3. Update the edited heritage file
    4. Increment version number
    """
    
    def __init__(self):
        """Initialize heritage versioning."""
        HISTORY_DIR.mkdir(parents=True, exist_ok=True)
        CHANGELOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        logger.info("[HeritageVersioning] Initialized")
    
    def get_current_version(self, heritage_type: str) -> int:
        """
        Get current version number for a heritage file.
        
        Args:
            heritage_type: "core", "preferences", or "learned"
            
        Returns:
            Current version number
        """
        file_path = HERITAGE_DIR / f"{heritage_type}.json"
        
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get("version", 1)
            except Exception:
                return 1
        
        return 1
    
    def create_version_snapshot(
        self,
        heritage_type: str,
        reason: str,
        trust_at_time: Optional[float] = None
    ) -> Path:
        """
        Create a version snapshot before modification.
        
        Args:
            heritage_type: "core", "preferences", or "learned"
            reason: Reason for version change
            trust_at_time: Trust value at time of change
            
        Returns:
            Path to snapshot file
        """
        file_path = HERITAGE_DIR / f"{heritage_type}.json"
        
        if not file_path.exists():
            logger.warning(f"[HeritageVersioning] File not found: {file_path}")
            return None
        
        # Get current version
        current_version = self.get_current_version(heritage_type)
        
        # Create snapshot
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_name = f"{timestamp}_{heritage_type}_v{current_version}.json"
        snapshot_path = HISTORY_DIR / snapshot_name
        
        try:
            shutil.copy2(file_path, snapshot_path)
            logger.info(f"[HeritageVersioning] Created snapshot: {snapshot_path}")
            
            # Append to changelog
            self._append_changelog(heritage_type, current_version, reason, trust_at_time)
            
            return snapshot_path
        except Exception as e:
            logger.error(f"[HeritageVersioning] Failed to create snapshot: {e}")
            return None
    
    def _append_changelog(
        self,
        heritage_type: str,
        version: int,
        reason: str,
        trust_at_time: Optional[float]
    ):
        """Append entry to changelog.md."""
        try:
            # Read existing changelog
            if CHANGELOG_FILE.exists():
                with open(CHANGELOG_FILE, "r", encoding="utf-8") as f:
                    changelog = f.read()
            else:
                changelog = "# Heritage Changelog\n\n"
            
            # Append new entry
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            trust_str = f" (Trust: {trust_at_time:.2f})" if trust_at_time else ""
            
            entry = f"""
## Version {version + 1} - {timestamp}

### File: {heritage_type}.json
### Reason: {reason}
{trust_str}

---
"""
            changelog += entry
            
            # Write changelog
            with open(CHANGELOG_FILE, "w", encoding="utf-8") as f:
                f.write(changelog)
            
            logger.info(f"[HeritageVersioning] Updated changelog")
        except Exception as e:
            logger.error(f"[HeritageVersioning] Failed to update changelog: {e}")
    
    def increment_version(self, heritage_type: str):
        """
        Increment version number in heritage file.
        
        Args:
            heritage_type: "core", "preferences", or "learned"
        """
        file_path = HERITAGE_DIR / f"{heritage_type}.json"
        
        if not file_path.exists():
            logger.warning(f"[HeritageVersioning] File not found: {file_path}")
            return
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            current_version = data.get("version", 1)
            data["version"] = current_version + 1
            data["last_modified_ts"] = int(time.time())
            
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"[HeritageVersioning] Incremented {heritage_type} to version {current_version + 1}")
        except Exception as e:
            logger.error(f"[HeritageVersioning] Failed to increment version: {e}")
    
    def restore_version(self, heritage_type: str, version: int) -> bool:
        """
        Restore a previous version.
        
        Args:
            heritage_type: "core", "preferences", or "learned"
            version: Version number to restore
            
        Returns:
            True if restore successful
        """
        # Find snapshot file
        snapshot_pattern = f"*_{heritage_type}_v{version}.json"
        snapshots = list(HISTORY_DIR.glob(snapshot_pattern))
        
        if not snapshots:
            logger.error(f"[HeritageVersioning] Snapshot not found for {heritage_type} v{version}")
            return False
        
        # Use most recent snapshot if multiple found
        snapshot_path = sorted(snapshots)[-1]
        target_path = HERITAGE_DIR / f"{heritage_type}.json"
        
        try:
            # Create backup of current
            self.create_version_snapshot(heritage_type, f"Restore to v{version}")
            
            # Restore snapshot
            shutil.copy2(snapshot_path, target_path)
            
            logger.info(f"[HeritageVersioning] Restored {heritage_type} to version {version}")
            return True
        except Exception as e:
            logger.error(f"[HeritageVersioning] Failed to restore version: {e}")
            return False


# Global instance
_heritage_versioning = HeritageVersioning()


def get_heritage_versioning() -> HeritageVersioning:
    """Get global heritage versioning instance."""
    return _heritage_versioning

