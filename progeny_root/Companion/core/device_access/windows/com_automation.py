"""Windows COM automation for app control."""

import logging
import platform
from typing import Dict, Any, Optional

logger = logging.getLogger("device.windows.com")

# Only import win32com on Windows
try:
    if platform.system() == "Windows":
        import win32com.client
        WIN32_AVAILABLE = True
    else:
        WIN32_AVAILABLE = False
except ImportError:
    WIN32_AVAILABLE = False
    logger.warning("[COM] win32com not available - COM automation disabled")


class COMAutomation:
    """
    Windows COM automation for controlling applications.
    
    Supports:
    - Office applications (Word, Excel, Outlook)
    - Internet Explorer automation
    - Windows Shell automation
    """
    
    def __init__(self):
        """Initialize COM automation."""
        if not WIN32_AVAILABLE:
            logger.warning("[COM] COM automation not available on this platform")
        self.available = WIN32_AVAILABLE and platform.system() == "Windows"
        logger.info(f"[COM] COM automation initialized (available: {self.available})")
    
    def create_application(self, app_name: str) -> Optional[Any]:
        """
        Create COM application instance.
        
        Args:
            app_name: Application name (e.g., "Word.Application", "Excel.Application")
            
        Returns:
            COM object or None if unavailable
        """
        if not self.available:
            return None
        
        try:
            return win32com.client.Dispatch(app_name)
        except Exception as e:
            logger.error(f"[COM] Failed to create {app_name}: {e}")
            return None
    
    def open_document(self, app_name: str, file_path: str) -> Dict[str, Any]:
        """
        Open a document in a COM application.
        
        Args:
            app_name: Application name
            file_path: Path to document
            
        Returns:
            Operation result
        """
        if not self.available:
            return {"status": "error", "error": "COM not available"}
        
        try:
            app = self.create_application(app_name)
            if not app:
                return {"status": "error", "error": f"Failed to create {app_name}"}
            
            doc = app.Open(file_path)
            app.Visible = True
            
            return {
                "status": "success",
                "app": app_name,
                "file": file_path,
                "document": str(doc)
            }
        except Exception as e:
            logger.error(f"[COM] Failed to open document: {e}")
            return {"status": "error", "error": str(e)}
    
    def send_email(self, to: str, subject: str, body: str, attachments: Optional[list] = None) -> Dict[str, Any]:
        """
        Send email via Outlook COM automation.
        
        Args:
            to: Recipient email
            subject: Email subject
            body: Email body
            attachments: Optional list of attachment paths
            
        Returns:
            Operation result
        """
        if not self.available:
            return {"status": "error", "error": "COM not available"}
        
        try:
            outlook = self.create_application("Outlook.Application")
            if not outlook:
                return {"status": "error", "error": "Failed to create Outlook"}
            
            mail = outlook.CreateItem(0)  # 0 = olMailItem
            mail.To = to
            mail.Subject = subject
            mail.Body = body
            
            if attachments:
                for att_path in attachments:
                    mail.Attachments.Add(att_path)
            
            mail.Send()
            
            return {
                "status": "success",
                "to": to,
                "subject": subject
            }
        except Exception as e:
            logger.error(f"[COM] Failed to send email: {e}")
            return {"status": "error", "error": str(e)}
    
    def execute_shell_command(self, command: str) -> Dict[str, Any]:
        """
        Execute Windows Shell command via COM.
        
        Args:
            command: Shell command to execute
            
        Returns:
            Operation result
        """
        if not self.available:
            return {"status": "error", "error": "COM not available"}
        
        try:
            shell = self.create_application("Shell.Application")
            if not shell:
                return {"status": "error", "error": "Failed to create Shell"}
            
            # Execute command via Shell
            shell.ShellExecute(command)
            
            return {
                "status": "success",
                "command": command
            }
        except Exception as e:
            logger.error(f"[COM] Failed to execute shell command: {e}")
            return {"status": "error", "error": str(e)}

