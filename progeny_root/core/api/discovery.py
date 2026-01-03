"""
Discovery API endpoints for Sallie
Allows web and mobile apps to discover Sallie instances on the network
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import socket
import platform
import psutil
import asyncio
from datetime import datetime
import json

router = APIRouter()

class SystemInfo(BaseModel):
    """System information for discovery"""
    hostname: str
    platform: str
    architecture: str
    cpu_count: int
    memory_total: int
    memory_available: int
    disk_usage: Dict[str, Any]
    python_version: str
    sallie_version: str

class ServiceStatus(BaseModel):
    """Status of individual services"""
    name: str
    status: str
    url: str
    version: Optional[str] = None
    uptime: Optional[float] = None
    last_check: datetime

class DiscoveryInfo(BaseModel):
    """Complete discovery information"""
    system_info: SystemInfo
    services: List[ServiceStatus]
    endpoints: Dict[str, str]
    capabilities: List[str]
    last_updated: datetime

class NetworkScanner:
    """Network scanner for finding other Sallie instances"""
    
    def __init__(self):
        self.common_ports = [8000, 3000, 11434, 6333]
        self.local_ranges = self._get_local_ranges()
    
    def _get_local_ranges(self) -> List[str]:
        """Get local network ranges to scan"""
        try:
            # Get local IP and determine network range
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            if local_ip.startswith('192.168.1'):
                return ['192.168.1.0/24']
            elif local_ip.startswith('192.168.0'):
                return ['192.168.0.0/24']
            elif local_ip.startswith('10.0.0'):
                return ['10.0.0.0/24']
            else:
                return ['192.168.1.0/24', '192.168.0.0/24']  # Common defaults
        except:
            return ['192.168.1.0/24', '192.168.0.0/24']
    
    async def scan_network(self, timeout: float = 2.0) -> List[Dict[str, Any]]:
        """Scan network for other Sallie instances"""
        found_instances = []
        
        for range_cidr in self.local_ranges:
            # Extract base IP and range
            if '/' in range_cidr:
                base_ip = range_cidr.split('/')[0].rsplit('.', 1)[0]
                range_end = 254  # Don't scan broadcast addresses
            else:
                base_ip = range_cidr
                range_end = 254
            
            # Scan common Sallie ports
            for i in range(1, range_end + 1):
                ip = f"{base_ip}.{i}"
                
                # Skip our own IP
                try:
                    if ip == socket.gethostbyname(socket.gethostname()):
                        continue
                except:
                    pass
                
                # Check each port
                for port in self.common_ports:
                    if await self._check_port(ip, port, timeout):
                        # Try to get discovery info
                        info = await self._get_discovery_info(ip, port)
                        if info:
                            found_instances.append(info)
                            break  # Found Sallie on this IP, check next IP
        
        return found_instances
    
    async def _check_port(self, host: str, port: int, timeout: float) -> bool:
        """Check if port is open on host"""
        try:
            future = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(future, timeout=timeout)
            writer.close()
            await writer.wait_closed()
            return True
        except:
            return False
    
    async def _get_discovery_info(self, host: str, port: int) -> Optional[Dict[str, Any]]:
        """Get discovery info from a potential Sallie instance"""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=2)) as session:
                url = f"http://{host}:{port}/api/discover"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            'host': host,
                            'port': port,
                            'info': data
                        }
        except:
            pass
        
        return None

# Global scanner instance
scanner = NetworkScanner()

@router.get("/discover", response_model=DiscoveryInfo)
async def discover():
    """
    Get discovery information for this Sallie instance
    """
    try:
        # Get system information
        system_info = SystemInfo(
            hostname=socket.gethostname(),
            platform=platform.system(),
            architecture=platform.machine(),
            cpu_count=psutil.cpu_count(),
            memory_total=psutil.virtual_memory().total,
            memory_available=psutil.virtual_memory().available,
            disk_usage={
                'total': psutil.disk_usage('/').total,
                'used': psutil.disk_usage('/').used,
                'free': psutil.disk_usage('/').free,
            },
            python_version=platform.python_version(),
            sallie_version="5.4.2"  # Should come from config
        )
        
        # Check service statuses
        services = []
        
        # Check backend API
        services.append(ServiceStatus(
            name="backend",
            status="running",
            url="http://localhost:8000",
            version="5.4.2",
            uptime=0.0,  # Would calculate from process start time
            last_check=datetime.now()
        ))
        
        # Check Ollama
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:11434/api/tags") as response:
                    if response.status == 200:
                        services.append(ServiceStatus(
                            name="ollama",
                            status="running",
                            url="http://localhost:11434",
                            last_check=datetime.now()
                        ))
                    else:
                        services.append(ServiceStatus(
                            name="ollama",
                            status="error",
                            url="http://localhost:11434",
                            last_check=datetime.now()
                        ))
        except:
            services.append(ServiceStatus(
                name="ollama",
                status="stopped",
                url="http://localhost:11434",
                last_check=datetime.now()
            ))
        
        # Check Qdrant
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:6333/collections") as response:
                    if response.status == 200:
                        services.append(ServiceStatus(
                            name="qdrant",
                            status="running",
                            url="http://localhost:6333",
                            last_check=datetime.now()
                        ))
                    else:
                        services.append(ServiceStatus(
                            name="qdrant",
                            status="error",
                            url="http://localhost:6333",
                            last_check=datetime.now()
                        ))
        except:
            services.append(ServiceStatus(
                name="qdrant",
                status="stopped",
                url="http://localhost:6333",
                last_check=datetime.now()
            ))
        
        # Check web interface
        services.append(ServiceStatus(
            name="web",
            status="running",
            url="http://localhost:3000",
            last_check=datetime.now()
        ))
        
        # Available endpoints
        endpoints = {
            "api": "http://localhost:8000",
            "web": "http://localhost:3000",
            "ollama": "http://localhost:11434",
            "qdrant": "http://localhost:6333",
            "websocket": "ws://localhost:8000/ws"
        }
        
        # Capabilities
        capabilities = [
            "chat",
            "memory",
            "limbic_system",
            "monologue",
            "dream_cycle",
            "agency",
            "synthesis",
            "voice_input",
            "voice_output",
            "file_access",
            "app_control",
            "smart_home",
            "multimodal_ai"
        ]
        
        return DiscoveryInfo(
            system_info=system_info,
            services=services,
            endpoints=endpoints,
            capabilities=capabilities,
            last_updated=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")

@router.get("/scan")
async def scan_network():
    """
    Scan network for other Sallie instances
    """
    try:
        found_instances = await scanner.scan_network()
        return {
            "scan_time": datetime.now().isoformat(),
            "instances_found": len(found_instances),
            "instances": found_instances
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Network scan failed: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Simple health check endpoint
    """
    return {
        "status": "healthy",
        "version": "5.4.2",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/services")
async def get_services():
    """
    Get status of all services
    """
    services = []
    
    # Check each service
    service_checks = [
        ("backend", "http://localhost:8000/api/health"),
        ("ollama", "http://localhost:11434/api/tags"),
        ("qdrant", "http://localhost:6333/collections"),
        ("web", "http://localhost:3000")
    ]
    
    for name, url in service_checks:
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    status = "running" if response.status == 200 else "error"
                    services.append({
                        "name": name,
                        "status": status,
                        "url": url,
                        "response_code": response.status
                    })
        except:
            services.append({
                "name": name,
                "status": "stopped",
                "url": url,
                "response_code": None
            })
    
    return {
        "services": services,
        "timestamp": datetime.now().isoformat()
    }
