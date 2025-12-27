"""Windows-specific device integrations."""

from .com_automation import COMAutomation
from .file_system_windows import WindowsFileSystem
from .notifications_windows import WindowsNotifications

__all__ = ["COMAutomation", "WindowsFileSystem", "WindowsNotifications"]

