"""Windows-specific file system operations."""

import logging
import os
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger("device.windows.filesystem")


class WindowsFileSystem:
    """
    Windows-specific file system operations.
    
    Provides:
    - UNC path support
    - Windows shortcuts (.lnk) handling
    - Network drive access
    - Windows-specific permissions
    """
    
    def __init__(self):
        """Initialize Windows file system handler."""
        logger.info("[WindowsFS] Windows file system handler initialized")
    
    def resolve_unc_path(self, path: str) -> str:
        """
        Resolve UNC (network) path.
        
        Args:
            path: UNC path (e.g., "\\\\server\\share\\file.txt")
            
        Returns:
            Resolved path
        """
        try:
            resolved = os.path.realpath(path)
            logger.info(f"[WindowsFS] Resolved UNC path: {path} -> {resolved}")
            return resolved
        except Exception as e:
            logger.error(f"[WindowsFS] Failed to resolve UNC path {path}: {e}")
            return path
    
    def get_network_drives(self) -> List[Dict[str, Any]]:
        """
        Get list of mapped network drives.
        
        Returns:
            List of network drive info
        """
        drives = []
        try:
            import win32api
            import win32net
            
            # Get all drive letters
            for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
                drive_path = f"{letter}:\\"
                if os.path.exists(drive_path):
                    try:
                        drive_type = win32api.GetDriveType(drive_path)
                        if drive_type == 4:  # DRIVE_REMOTE
                            drives.append({
                                "letter": letter,
                                "path": drive_path,
                                "type": "network"
                            })
                    except Exception:
                        pass
        except ImportError:
            logger.warning("[WindowsFS] win32api not available - using fallback")
            # Fallback: check common network drive letters
            for letter in "ZYXWVUTSRQPONMLKJIHGFEDCBA":
                drive_path = f"{letter}:\\"
                if os.path.exists(drive_path):
                    try:
                        if os.path.ismount(drive_path):
                            drives.append({
                                "letter": letter,
                                "path": drive_path,
                                "type": "network"
                            })
                    except Exception:
                        pass
        
        return drives
    
    def create_shortcut(self, target_path: str, shortcut_path: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Create Windows shortcut (.lnk file).
        
        Args:
            target_path: Path to target file/folder
            shortcut_path: Path where shortcut will be created
            description: Optional description
            
        Returns:
            Operation result
        """
        try:
            import win32com.client
            
            shell = win32com.client.Dispatch("WScript.Shell")
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = target_path
            if description:
                shortcut.Description = description
            shortcut.save()
            
            logger.info(f"[WindowsFS] Created shortcut: {shortcut_path} -> {target_path}")
            return {
                "status": "success",
                "shortcut": shortcut_path,
                "target": target_path
            }
        except ImportError:
            logger.warning("[WindowsFS] win32com not available - shortcut creation disabled")
            return {"status": "error", "error": "win32com not available"}
        except Exception as e:
            logger.error(f"[WindowsFS] Failed to create shortcut: {e}")
            return {"status": "error", "error": str(e)}
    
    def get_file_permissions(self, file_path: str) -> Dict[str, Any]:
        """
        Get Windows file permissions (ACL).
        
        Args:
            file_path: Path to file
            
        Returns:
            Permission information
        """
        try:
            import win32security
            import ntsecuritycon as con
            
            sd = win32security.GetFileSecurity(file_path, win32security.DACL_SECURITY_INFORMATION)
            dacl = sd.GetSecurityDescriptorDacl()
            
            permissions = []
            if dacl:
                for i in range(dacl.GetAceCount()):
                    ace = dacl.GetAce(i)
                    sid = ace[2]
                    account, domain, _ = win32security.LookupAccountSid(None, sid)
                    permissions.append({
                        "account": f"{domain}\\{account}" if domain else account,
                        "access": str(ace[1])
                    })
            
            return {
                "path": file_path,
                "permissions": permissions
            }
        except ImportError:
            logger.warning("[WindowsFS] win32security not available - using fallback")
            # Fallback: basic file info
            stat = os.stat(file_path)
            return {
                "path": file_path,
                "permissions": {
                    "readable": os.access(file_path, os.R_OK),
                    "writable": os.access(file_path, os.W_OK),
                    "executable": os.access(file_path, os.X_OK),
                }
            }
        except Exception as e:
            logger.error(f"[WindowsFS] Failed to get permissions: {e}")
            return {"error": str(e)}

