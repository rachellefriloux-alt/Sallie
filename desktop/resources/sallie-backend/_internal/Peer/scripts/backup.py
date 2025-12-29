#!/usr/bin/env python3
"""
Backup script for Digital Progeny (Section 17.6).

Creates backups of:
- soul.json (limbic state)
- heritage/ directory (identity DNA)
- memory/ directory (Qdrant data)
- logs/ directory (thoughts.log, etc.)
"""

import argparse
import json
import shutil
import tarfile
import time
from pathlib import Path
from datetime import datetime
from typing import List

def create_backup(backup_dir: Path, include_qdrant: bool = True) -> Path:
    """
    Create a backup of the Digital Progeny system.
    
    Args:
        backup_dir: Directory to store backups
        include_qdrant: Whether to include Qdrant data (can be large)
        
    Returns:
        Path to created backup file
    """
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"progeny_backup_{timestamp}.tar.gz"
    
    # Directories to backup
    backup_paths = [
        Path("progeny_root/limbic"),
        Path("progeny_root/memory/patches.json"),
        Path("progeny_root/logs"),
        Path("progeny_root/working"),
    ]
    
    if include_qdrant:
        backup_paths.append(Path("progeny_root/memory/qdrant_local"))
    
    # Create tar.gz archive
    with tarfile.open(backup_file, "w:gz") as tar:
        for path in backup_paths:
            if path.exists():
                tar.add(path, arcname=path.name)
                print(f"Added {path} to backup")
    
    # Create backup manifest
    manifest = {
        "timestamp": timestamp,
        "backup_file": str(backup_file),
        "included_paths": [str(p) for p in backup_paths if p.exists()],
        "size_bytes": backup_file.stat().st_size,
        "include_qdrant": include_qdrant
    }
    
    manifest_file = backup_dir / f"backup_manifest_{timestamp}.json"
    with open(manifest_file, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Backup created: {backup_file}")
    print(f"Manifest: {manifest_file}")
    print(f"Size: {backup_file.stat().st_size / 1024 / 1024:.2f} MB")
    
    return backup_file

def restore_backup(backup_file: Path, restore_dir: Path = Path("progeny_root")):
    """
    Restore from a backup file.
    
    Args:
        backup_file: Path to backup tar.gz file
        restore_dir: Directory to restore to
    """
    if not backup_file.exists():
        raise FileNotFoundError(f"Backup file not found: {backup_file}")
    
    restore_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Restoring from {backup_file} to {restore_dir}")
    
    with tarfile.open(backup_file, "r:gz") as tar:
        tar.extractall(restore_dir)
    
    print("Restore complete")

def list_backups(backup_dir: Path) -> List[dict]:
    """
    List available backups.
    
    Args:
        backup_dir: Directory containing backups
        
    Returns:
        List of backup info dicts
    """
    backups = []
    
    for backup_file in backup_dir.glob("progeny_backup_*.tar.gz"):
        manifest_file = backup_dir / f"backup_manifest_{backup_file.stem.replace('progeny_backup_', 'backup_manifest_')}.json"
        
        if manifest_file.exists():
            with open(manifest_file, "r") as f:
                manifest = json.load(f)
                backups.append(manifest)
        else:
            # Fallback: get info from file
            backups.append({
                "backup_file": str(backup_file),
                "timestamp": backup_file.stem.replace("progeny_backup_", ""),
                "size_bytes": backup_file.stat().st_size
            })
    
    return sorted(backups, key=lambda x: x.get("timestamp", ""), reverse=True)

def cleanup_old_backups(backup_dir: Path, keep_days: int = 30):
    """
    Remove backups older than specified days.
    
    Args:
        backup_dir: Directory containing backups
        keep_days: Number of days to keep backups
    """
    cutoff_time = time.time() - (keep_days * 86400)
    
    removed = 0
    for backup_file in backup_dir.glob("progeny_backup_*.tar.gz"):
        if backup_file.stat().st_mtime < cutoff_time:
            backup_file.unlink()
            # Also remove manifest if exists
            manifest_file = backup_dir / f"backup_manifest_{backup_file.stem.replace('progeny_backup_', '')}.json"
            if manifest_file.exists():
                manifest_file.unlink()
            removed += 1
            print(f"Removed old backup: {backup_file}")
    
    print(f"Cleaned up {removed} old backups")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Digital Progeny Backup Tool")
    parser.add_argument("command", choices=["create", "restore", "list", "cleanup"], help="Command to execute")
    parser.add_argument("--backup-dir", type=Path, default=Path("progeny_root/backups"), help="Backup directory")
    parser.add_argument("--backup-file", type=Path, help="Backup file for restore")
    parser.add_argument("--no-qdrant", action="store_true", help="Exclude Qdrant data from backup")
    parser.add_argument("--keep-days", type=int, default=30, help="Days to keep backups (for cleanup)")
    
    args = parser.parse_args()
    
    if args.command == "create":
        create_backup(args.backup_dir, include_qdrant=not args.no_qdrant)
    elif args.command == "restore":
        if not args.backup_file:
            print("Error: --backup-file required for restore")
            exit(1)
        restore_backup(args.backup_file)
    elif args.command == "list":
        backups = list_backups(args.backup_dir)
        print(f"\nFound {len(backups)} backups:")
        for backup in backups:
            size_mb = backup.get("size_bytes", 0) / 1024 / 1024
            print(f"  {backup.get('timestamp', 'unknown')}: {size_mb:.2f} MB")
    elif args.command == "cleanup":
        cleanup_old_backups(args.backup_dir, args.keep_days)

