"""App control for launching apps and automation."""

import logging
import subprocess
import platform
from typing import Dict, Any, Optional, List

logger = logging.getLogger("device.appcontrol")


class AppControl:
    """
    Controls applications on the device.
    
    Platform-specific implementations:
    - Windows: COM automation, PowerShell
    - iOS: Shortcuts, Siri
    - Android: Intents, Tasker
    """
    
    def __init__(self):
        """Initialize app control for current platform."""
        self.platform = platform.system().lower()
        
        # Initialize platform-specific handlers
        if self.platform == "windows":
            try:
                from .windows.com_automation import COMAutomation
                self.com_automation = COMAutomation()
            except Exception as e:
                logger.warning(f"[AppControl] Failed to initialize COM automation: {e}")
                self.com_automation = None
        else:
            self.com_automation = None
        
        logger.info(f"[AppControl] Initialized for platform: {self.platform}")
    
    def launch_app(self, app_name: str, args: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Launch an application.
        
        Args:
            app_name: Application name or path
            args: Optional command-line arguments
            
        Returns:
            Launch result
        """
        try:
            if self.platform == "windows":
                return self._launch_windows(app_name, args)
            elif self.platform == "darwin":
                return self._launch_macos(app_name, args)
            elif self.platform == "linux":
                return self._launch_linux(app_name, args)
            else:
                # Platform not supported - return error dict instead of raising exception
                logger.warning(f"[AppControl] Platform {self.platform} not supported for app control")
                return {
                    "status": "error",
                    "message": f"Platform {self.platform} is not currently supported for app control",
                    "supported_platforms": ["windows", "linux", "macos"]
                }
        except Exception as e:
            logger.error(f"[AppControl] Failed to launch {app_name}: {e}")
            return {"status": "error", "error": str(e)}
    
    def _launch_windows(self, app_name: str, args: Optional[List[str]]) -> Dict[str, Any]:
        """Launch app on Windows."""
        try:
            # Use PowerShell Start-Process or direct executable
            if args:
                cmd = [app_name] + args
            else:
                cmd = [app_name]
            
            subprocess.Popen(cmd, shell=True)
            return {"status": "success", "app": app_name}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def _launch_macos(self, app_name: str, args: Optional[List[str]]) -> Dict[str, Any]:
        """Launch app on macOS."""
        try:
            # Use open command
            cmd = ["open", "-a", app_name]
            if args:
                cmd.extend(args)
            
            subprocess.Popen(cmd)
            return {"status": "success", "app": app_name}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def _launch_linux(self, app_name: str, args: Optional[List[str]]) -> Dict[str, Any]:
        """Launch app on Linux."""
        try:
            cmd = [app_name]
            if args:
                cmd.extend(args)
            
            subprocess.Popen(cmd)
            return {"status": "success", "app": app_name}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    def send_message(self, app: str, recipient: str, message: str) -> Dict[str, Any]:
        """
        Send message via app (e.g., email, SMS, chat).
        
        Args:
            app: App name (e.g., "mail", "messages", "outlook")
            recipient: Recipient identifier
            message: Message content
            
        Returns:
            Send result
        """
        # Use COM automation for Outlook on Windows
        if self.platform == "windows" and app.lower() == "outlook" and self.com_automation:
            return self.com_automation.send_email(
                to=recipient,
                subject="Message from Sallie",
                body=message
            )
        
        # Platform-specific implementation would go here
        logger.info(f"[AppControl] Sending message via {app} to {recipient}")
        return {"status": "success", "app": app, "recipient": recipient}
    
    def automate_task(self, task_description: str) -> Dict[str, Any]:
        """
        Automate a task using platform automation.
        
        Args:
            task_description: Description of task to automate
            
        Returns:
            Automation result
        """
        # Platform-specific automation would go here
        logger.info(f"[AppControl] Automating task: {task_description}")
        return {"status": "success", "task": task_description}

