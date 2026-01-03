"""Sallie's Unlimited Resource Access System

Gives Sallie access to all available resources:
- Internet access and web scraping
- File system access
- API integrations
- Database access
- Device capabilities
- Network resources
- External services
- User permissions

Sallie can explore and utilize any resource the user has access to.
"""

import json
import logging
import time
import asyncio
import aiohttp
import requests
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
import os
import subprocess
import platform
import socket
import urllib.parse
import re
from datetime import datetime

logger = logging.getLogger("resource_access")

class ResourceType(str, Enum):
    """Types of resources Sallie can access"""
    INTERNET = "internet"
    FILES = "files"
    APIS = "apis"
    DATABASES = "databases"
    DEVICE = "device"
    NETWORK = "network"
    EXTERNAL = "external"
    SYSTEM = "system"
    USER_DATA = "user_data"

class AccessLevel(str, Enum):
    """Access levels for resources"""
    READ_ONLY = "read_only"
    READ_WRITE = "read_write"
    ADMIN = "admin"
    FULL = "full"

@dataclass
class ResourceCapability:
    """Capability description for a resource"""
    name: str
    type: ResourceType
    description: str
    access_level: AccessLevel
    available: bool
    permissions_required: List[str]
    risk_level: str  # low, medium, high
    last_checked: float
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ResourceAccess:
    """Record of resource access"""
    resource: str
    action: str
    timestamp: float
    success: bool
    data: Any
    error: Optional[str]
    duration: float

class ResourceAccessSystem:
    """Sallie's unlimited resource access system"""
    
    def __init__(self):
        self.capabilities = self._discover_capabilities()
        self.access_history: List[ResourceAccess] = []
        self.internet_session = None
        self.permissions_cache = {}
        
    def _discover_capabilities(self) -> Dict[str, ResourceCapability]:
        """Discover all available resources and capabilities"""
        capabilities = {}
        
        # Internet access
        capabilities["internet"] = ResourceCapability(
            name="Internet Access",
            type=ResourceType.INTERNET,
            description="Access to internet resources and web content",
            access_level=AccessLevel.READ_ONLY,
            available=self._check_internet_access(),
            permissions_required=["internet"],
            risk_level="medium",
            last_checked=time.time()
        )
        
        # File system access
        capabilities["files"] = ResourceCapability(
            name="File System",
            type=ResourceType.FILES,
            description="Access to local file system",
            access_level=AccessLevel.READ_WRITE,
            available=True,
            permissions_required=["storage"],
            risk_level="medium",
            last_checked=time.time()
        )
        
        # Device capabilities
        capabilities["device"] = ResourceCapability(
            name="Device Information",
            type=ResourceType.DEVICE,
            description="Device hardware and software information",
            access_level=AccessLevel.READ_ONLY,
            available=True,
            permissions_required=["device_info"],
            risk_level="low",
            last_checked=time.time()
        )
        
        # Network capabilities
        capabilities["network"] = ResourceCapability(
            name="Network Access",
            type=ResourceType.NETWORK,
            description="Network connectivity and resources",
            access_level=AccessLevel.READ_ONLY,
            available=self._check_network_access(),
            permissions_required=["network"],
            risk_level="medium",
            last_checked=time.time()
        )
        
        # System capabilities
        capabilities["system"] = ResourceCapability(
            name="System Information",
            type=ResourceType.SYSTEM,
            description="Operating system and system resources",
            access_level=AccessLevel.READ_ONLY,
            available=True,
            permissions_required=["system_info"],
            risk_level="low",
            last_checked=time.time()
        )
        
        logger.info(f"[ResourceAccess] Discovered {len(capabilities)} resource capabilities")
        return capabilities
        
    def _check_internet_access(self) -> bool:
        """Check if internet access is available"""
        try:
            response = requests.get("https://www.google.com", timeout=5)
            return response.status_code == 200
        except:
            try:
                # Try another reliable site
                response = requests.get("https://www.github.com", timeout=5)
                return response.status_code == 200
            except:
                return False
                
    def _check_network_access(self) -> bool:
        """Check if network access is available"""
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            return True
        except:
            return False
            
    async def access_internet(self, url: str, method: str = "GET", data: Optional[Dict] = None) -> Dict[str, Any]:
        """Access internet resources"""
        if not self.capabilities["internet"].available:
            return {"error": "Internet access not available"}
            
        start_time = time.time()
        access_record = ResourceAccess(
            resource="internet",
            action=f"{method} {url}",
            timestamp=start_time,
            success=False,
            data=None,
            error=None,
            duration=0
        )
        
        try:
            async with aiohttp.ClientSession() as session:
                if method.upper() == "GET":
                    async with session.get(url, timeout=30) as response:
                        content = await response.text()
                        access_record.success = True
                        access_record.data = {
                            "status": response.status,
                            "headers": dict(response.headers),
                            "content_length": len(content),
                            "content": content[:1000]  # First 1000 chars
                        }
                elif method.upper() == "POST":
                    async with session.post(url, json=data, timeout=30) as response:
                        content = await response.text()
                        access_record.success = True
                        access_record.data = {
                            "status": response.status,
                            "headers": dict(response.headers),
                            "content_length": len(content),
                            "content": content[:1000]
                        }
                        
        except Exception as e:
            access_record.error = str(e)
            logger.error(f"[ResourceAccess] Internet access failed: {e}")
            
        access_record.duration = time.time() - start_time
        self.access_history.append(access_record)
        
        return access_record.data or {"error": access_record.error}
        
    def access_files(self, path: str, action: str = "read", content: Optional[str] = None) -> Dict[str, Any]:
        """Access file system resources"""
        if not self.capabilities["files"].available:
            return {"error": "File system access not available"}
            
        start_time = time.time()
        access_record = ResourceAccess(
            resource="files",
            action=f"{action} {path}",
            timestamp=start_time,
            success=False,
            data=None,
            error=None,
            duration=0
        )
        
        try:
            file_path = Path(path)
            
            if action == "read":
                if file_path.exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    access_record.success = True
                    access_record.data = {
                        "content": content,
                        "size": len(content),
                        "exists": True,
                        "is_file": file_path.is_file(),
                        "is_dir": file_path.is_dir()
                    }
                else:
                    access_record.data = {"exists": False}
                    access_record.success = True
                    
            elif action == "write":
                if content is not None:
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    access_record.success = True
                    access_record.data = {"written": True, "size": len(content)}
                    
            elif action == "list":
                if file_path.exists() and file_path.is_dir():
                    items = []
                    for item in file_path.iterdir():
                        items.append({
                            "name": item.name,
                            "is_file": item.is_file(),
                            "is_dir": item.is_dir(),
                            "size": item.stat().st_size if item.is_file() else 0
                        })
                    access_record.success = True
                    access_record.data = {"items": items}
                    
        except Exception as e:
            access_record.error = str(e)
            logger.error(f"[ResourceAccess] File access failed: {e}")
            
        access_record.duration = time.time() - start_time
        self.access_history.append(access_record)
        
        return access_record.data or {"error": access_record.error}
        
    def access_device(self) -> Dict[str, Any]:
        """Access device information"""
        if not self.capabilities["device"].available:
            return {"error": "Device access not available"}
            
        start_time = time.time()
        access_record = ResourceAccess(
            resource="device",
            action="get_info",
            timestamp=start_time,
            success=False,
            data=None,
            error=None,
            duration=0
        )
        
        try:
            device_info = {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "architecture": platform.architecture(),
                "processor": platform.processor(),
                "hostname": socket.gethostname(),
                "python_version": platform.python_version(),
                "current_directory": os.getcwd(),
                "home_directory": os.path.expanduser("~"),
                "environment_variables": dict(os.environ),
                "disk_usage": self._get_disk_usage(),
                "memory_info": self._get_memory_info(),
                "network_interfaces": self._get_network_interfaces()
            }
            
            access_record.success = True
            access_record.data = device_info
            
        except Exception as e:
            access_record.error = str(e)
            logger.error(f"[ResourceAccess] Device access failed: {e}")
            
        access_record.duration = time.time() - start_time
        self.access_history.append(access_record)
        
        return access_record.data or {"error": access_record.error}
        
    def _get_disk_usage(self) -> Dict[str, Any]:
        """Get disk usage information"""
        try:
            stat = os.statvfs(os.getcwd())
            total = stat.f_frsize * stat.f_blocks
            free = stat.f_bfree * stat.f_frsize
            used = total - free
            return {
                "total_bytes": total,
                "free_bytes": free,
                "used_bytes": used,
                "total_gb": total / (1024**3),
                "free_gb": free / (1024**3),
                "used_gb": used / (1024**3),
                "usage_percent": (used / total) * 100
            }
        except:
            return {"error": "Disk usage not available"}
            
    def _get_memory_info(self) -> Dict[str, Any]:
        """Get memory usage information"""
        try:
            import psutil
            memory = psutil.virtual_memory()
            return {
                "total_bytes": memory.total,
                "available_bytes": memory.available,
                "used_bytes": memory.used,
                "total_gb": memory.total / (1024**3),
                "available_gb": memory.available / (1024**3),
                "used_gb": memory.used / (1024**3),
                "usage_percent": memory.percent
            }
        except ImportError:
            return {"error": "psutil not available"}
        except:
            return {"error": "Memory info not available"}
            
    def _get_network_interfaces(self) -> Dict[str, Any]:
        """Get network interface information"""
        try:
            import psutil
            interfaces = {}
            for interface, addrs in psutil.net_if_addrs().items():
                interfaces[interface] = [
                    {
                        "family": addr.family.name,
                        "address": addr.address,
                        "netmask": addr.netmask,
                        "broadcast": addr.broadcast
                    }
                    for addr in addrs
                ]
            return interfaces
        except ImportError:
            return {"error": "psutil not available"}
        except:
            return {"error": "Network interfaces not available"}
            
    def search_internet(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search the internet for information"""
        if not self.capabilities["internet"].available:
            return []
            
        # Use a simple search approach
        search_results = []
        
        # Try different search engines
        search_engines = [
            f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}",
            f"https://www.google.com/search?q={urllib.parse.quote(query)}",
            f"https://www.bing.com/search?q={urllib.parse.quote(query)}"
        ]
        
        for engine in search_engines:
            try:
                result = asyncio.run(self.access_internet(engine))
                if result.get("status") == 200:
                    # Extract search results (simplified)
                    content = result.get("content", "")
                    # This is a simplified approach - in production, use proper search APIs
                    search_results.append({
                        "engine": engine.split("//")[1].split("/")[0],
                        "query": query,
                        "status": "success",
                        "content_length": len(content),
                        "timestamp": time.time()
                    })
                    break
            except Exception as e:
                logger.error(f"[ResourceAccess] Search failed for {engine}: {e}")
                continue
                
        return search_results
        
    def get_capabilities(self) -> Dict[str, Any]:
        """Get all available capabilities"""
        return {
            "capabilities": {name: {
                "type": cap.type.value,
                "description": cap.description,
                "access_level": cap.access_level.value,
                "available": cap.available,
                "permissions_required": cap.permissions_required,
                "risk_level": cap.risk_level,
                "last_checked": cap.last_checked
            } for name, cap in self.capabilities.items()
            },
            "total_capabilities": len(self.capabilities),
            "available_capabilities": sum(1 for cap in self.capabilities.values() if cap.available),
            "access_history_count": len(self.access_history),
            "last_access": max([acc.timestamp for acc in self.access_history]) if self.access_history else None
        }
        
    def get_access_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent access history"""
        recent_access = sorted(self.access_history, key=lambda x: x.timestamp, reverse=True)[:limit]
        return [
            {
                "resource": acc.resource,
                "action": acc.action,
                "timestamp": acc.timestamp,
                "success": acc.success,
                "duration": acc.duration,
                "error": acc.error,
                "data_size": len(str(acc.data)) if acc.data else 0
            }
            for acc in recent_access
        ]

# Global instance
_resource_access_system = None

def get_resource_access_system() -> ResourceAccessSystem:
    """Get global resource access system instance"""
    global _resource_access_system
    if _resource_access_system is None:
        _resource_access_system = ResourceAccessSystem()
    return _resource_access_system
