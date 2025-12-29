"""System information and status."""

import logging
import platform
import psutil
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger("device.systeminfo")


class SystemInfo:
    """
    Provides system information and status.
    
    Tracks:
    - Device status (battery, network)
    - System resources (CPU, memory)
    - Platform information
    """
    
    def __init__(self):
        """Initialize system info."""
        logger.info("[SystemInfo] System info initialized")
    
    def get_device_status(self) -> Dict[str, Any]:
        """Get current device status."""
        try:
            battery = psutil.sensors_battery()
            network = psutil.net_if_addrs()
            
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "battery": {
                    "percent": battery.percent if battery else None,
                    "plugged": battery.power_plugged if battery else None,
                },
                "network": {
                    "interfaces": list(network.keys()),
                    "connected": len(network) > 0,
                },
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"[SystemInfo] Failed to get device status: {e}")
            return {"error": str(e)}
    
    def get_system_resources(self) -> Dict[str, Any]:
        """Get system resource usage."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count(),
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100,
                },
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"[SystemInfo] Failed to get system resources: {e}")
            return {"error": str(e)}

