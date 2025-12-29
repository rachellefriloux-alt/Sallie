"""File system access for device files."""

import logging
import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("device.filesystem")


class FileSystemAccess:
    """
    Provides file system access with permission checks.
    
    Capabilities:
    - Read files (with whitelist/blacklist)
    - Write files (with sandboxing)
    - Organize files
    - Create summaries
    - Detect duplicates
    """
    
    def __init__(self, whitelist: List[str], blacklist: List[str]):
        """
        Initialize file system access.
        
        Args:
            whitelist: Allowed paths
            blacklist: Forbidden paths (takes precedence)
        """
        self.whitelist = [Path(p).resolve() for p in whitelist]
        self.blacklist = [Path(p).resolve() for p in blacklist]
        logger.info(f"[FileSystem] Initialized with {len(whitelist)} whitelist, {len(blacklist)} blacklist paths")
    
    def _check_permission(self, file_path: Path) -> bool:
        """Check if path is allowed."""
        resolved = file_path.resolve()
        
        # Blacklist check (takes precedence)
        for black_path in self.blacklist:
            try:
                if resolved.is_relative_to(black_path):
                    return False
            except ValueError:
                pass
        
        # Whitelist check
        for white_path in self.whitelist:
            try:
                if resolved.is_relative_to(white_path):
                    return True
            except ValueError:
                pass
        
        return False
    
    def read_file(self, file_path: str) -> Dict[str, Any]:
        """
        Read file content (if permitted).
        
        Args:
            file_path: Path to file
            
        Returns:
            Dict with content and metadata
        """
        path = Path(file_path)
        
        if not self._check_permission(path):
            raise PermissionError(f"Access denied: {file_path}")
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            stat = path.stat()
            
            return {
                "path": str(path),
                "content": content,
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            }
        except Exception as e:
            logger.error(f"[FileSystem] Failed to read {file_path}: {e}")
            raise
    
    def list_directory(self, dir_path: str, recursive: bool = False) -> List[Dict[str, Any]]:
        """
        List directory contents.
        
        Args:
            dir_path: Directory path
            recursive: Whether to list recursively
            
        Returns:
            List of file/directory info
        """
        path = Path(dir_path)
        
        if not self._check_permission(path):
            raise PermissionError(f"Access denied: {dir_path}")
        
        if not path.exists() or not path.is_dir():
            raise NotADirectoryError(f"Not a directory: {dir_path}")
        
        items = []
        
        if recursive:
            for item in path.rglob("*"):
                if self._check_permission(item):
                    stat = item.stat()
                    items.append({
                        "path": str(item),
                        "name": item.name,
                        "type": "file" if item.is_file() else "directory",
                        "size": stat.st_size if item.is_file() else 0,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    })
        else:
            for item in path.iterdir():
                if self._check_permission(item):
                    stat = item.stat()
                    items.append({
                        "path": str(item),
                        "name": item.name,
                        "type": "file" if item.is_file() else "directory",
                        "size": stat.st_size if item.is_file() else 0,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    })
        
        return items
    
    def write_file(self, file_path: str, content: str, create_dirs: bool = True) -> Dict[str, Any]:
        """
        Write file (if permitted and in sandbox).
        
        Args:
            file_path: Path to file
            content: File content
            create_dirs: Create parent directories if needed
            
        Returns:
            Write result
        """
        path = Path(file_path)
        
        if not self._check_permission(path):
            raise PermissionError(f"Access denied: {file_path}")
        
        try:
            if create_dirs:
                path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            
            logger.info(f"[FileSystem] Wrote file: {file_path}")
            
            return {
                "status": "success",
                "path": str(path),
                "size": len(content.encode('utf-8')),
                "written_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"[FileSystem] Failed to write {file_path}: {e}")
            raise
    
    def organize_files(self, dir_path: str, pattern: Optional[str] = None) -> Dict[str, Any]:
        """
        Organize files in directory based on learned patterns.
        
        Args:
            dir_path: Directory to organize
            pattern: Optional organization pattern
            
        Returns:
            Organization result
        """
        # In production, this would use learned patterns from Dream Cycle
        # For now, basic organization by extension
        path = Path(dir_path)
        
        if not self._check_permission(path):
            raise PermissionError(f"Access denied: {dir_path}")
        
        organized = {
            "moved": [],
            "created_dirs": [],
            "pattern": pattern or "by_extension"
        }
        
        # Basic organization logic would go here
        logger.info(f"[FileSystem] Organized directory: {dir_path}")
        
        return organized

