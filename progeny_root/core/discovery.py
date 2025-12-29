"""
Auto-Discovery System for Sallie
Automatically discovers and connects devices on the local network using mDNS/Zeroconf.
No manual IP addresses needed!
"""

import logging
import socket
import time
import json
from typing import Dict, List, Optional, Callable
from pathlib import Path
import threading

logger = logging.getLogger("discovery")

# Try to import zeroconf for mDNS discovery
ZEROCONF_AVAILABLE = False
try:
    from zeroconf import ServiceBrowser, ServiceInfo, Zeroconf
    ZEROCONF_AVAILABLE = True
    logger.info("[Discovery] Zeroconf available - automatic device discovery enabled")
except ImportError:
    logger.warning("[Discovery] Zeroconf not available - install with: pip install zeroconf")


class AutoDiscovery:
    """
    Automatic device discovery using mDNS/Bonjour.
    
    Features:
    - Zero-configuration networking
    - Automatic device detection on LAN
    - No manual IP addresses needed
    - Works across Windows, Mac, Linux, Android
    """
    
    def __init__(self, device_name: str = "Sallie", device_type: str = "desktop"):
        """
        Initialize auto-discovery.
        
        Args:
            device_name: Display name for this device
            device_type: Type of device (desktop, mobile, tablet, web)
        """
        self.device_name = device_name
        self.device_type = device_type
        self.discovered_devices: Dict[str, Dict] = {}
        self.zeroconf = None
        self.browser = None
        self.listener = None
        self.service_type = "_sallie._tcp.local."
        
        # Get local IP and info
        self.local_ip = self._get_local_ip()
        self.backend_port = 8000
        self.web_port = 3000
        
        logger.info(f"[Discovery] Initialized for device: {device_name} ({device_type})")
        logger.info(f"[Discovery] Local IP: {self.local_ip}")
    
    def _get_local_ip(self) -> str:
        """Get local IP address automatically."""
        try:
            # Connect to external server (doesn't actually send data)
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except Exception:
            return "127.0.0.1"
    
    def start_broadcast(self):
        """
        Start broadcasting this device so others can find it.
        Uses mDNS/Bonjour for zero-configuration networking.
        """
        if not ZEROCONF_AVAILABLE:
            logger.warning("[Discovery] Cannot broadcast without zeroconf - install: pip install zeroconf")
            return False
        
        try:
            self.zeroconf = Zeroconf()
            
            # Create service info
            info = ServiceInfo(
                self.service_type,
                f"{self.device_name}.{self.service_type}",
                addresses=[socket.inet_aton(self.local_ip)],
                port=self.backend_port,
                properties={
                    'device_name': self.device_name.encode('utf-8'),
                    'device_type': self.device_type.encode('utf-8'),
                    'web_port': str(self.web_port).encode('utf-8'),
                    'backend_port': str(self.backend_port).encode('utf-8'),
                    'version': '5.4.2'.encode('utf-8'),
                },
                server=f"{socket.gethostname()}.local."
            )
            
            self.zeroconf.register_service(info)
            logger.info(f"[Discovery] Broadcasting as: {self.device_name} at {self.local_ip}:{self.backend_port}")
            return True
            
        except Exception as e:
            logger.error(f"[Discovery] Failed to start broadcast: {e}")
            return False
    
    def start_discovery(self, on_device_found: Optional[Callable] = None):
        """
        Start discovering other Sallie devices on the network.
        Automatically finds devices without needing IP addresses!
        
        Args:
            on_device_found: Callback function called when device is found
        """
        if not ZEROCONF_AVAILABLE:
            logger.warning("[Discovery] Cannot discover without zeroconf - install: pip install zeroconf")
            return False
        
        try:
            if not self.zeroconf:
                self.zeroconf = Zeroconf()
            
            # Create listener for found devices
            self.listener = ServiceListener(self, on_device_found)
            self.browser = ServiceBrowser(self.zeroconf, self.service_type, self.listener)
            
            logger.info("[Discovery] Started automatic device discovery")
            return True
            
        except Exception as e:
            logger.error(f"[Discovery] Failed to start discovery: {e}")
            return False
    
    def get_discovered_devices(self) -> List[Dict]:
        """
        Get list of discovered devices.
        
        Returns:
            List of device info dictionaries
        """
        return list(self.discovered_devices.values())
    
    def get_backend_url(self, device_name: str) -> Optional[str]:
        """
        Get backend URL for a discovered device.
        No IP address needed - just use the device name!
        
        Args:
            device_name: Name of the device
            
        Returns:
            Backend URL or None if not found
        """
        device = self.discovered_devices.get(device_name)
        if device:
            return f"http://{device['ip']}:{device['backend_port']}"
        return None
    
    def get_primary_backend(self) -> Optional[str]:
        """
        Automatically get the primary backend URL.
        Looks for desktop devices first, then any available.
        
        Returns:
            Backend URL of primary device
        """
        # Prefer desktop devices
        for device in self.discovered_devices.values():
            if device.get('device_type') == 'desktop':
                return f"http://{device['ip']}:{device['backend_port']}"
        
        # Fallback to any device
        if self.discovered_devices:
            device = list(self.discovered_devices.values())[0]
            return f"http://{device['ip']}:{device['backend_port']}"
        
        # Use local if nothing found
        return f"http://{self.local_ip}:{self.backend_port}"
    
    def stop(self):
        """Stop broadcasting and discovery."""
        if self.zeroconf:
            try:
                self.zeroconf.unregister_all_services()
                self.zeroconf.close()
                logger.info("[Discovery] Stopped broadcasting and discovery")
            except Exception as e:
                logger.error(f"[Discovery] Error stopping: {e}")


class ServiceListener:
    """Listener for discovered Sallie services."""
    
    def __init__(self, discovery: AutoDiscovery, callback: Optional[Callable] = None):
        self.discovery = discovery
        self.callback = callback
    
    def add_service(self, zeroconf: Zeroconf, service_type: str, name: str):
        """Called when a new service is discovered."""
        info = zeroconf.get_service_info(service_type, name)
        if info:
            try:
                # Extract device info
                device_name = info.properties.get(b'device_name', b'Unknown').decode('utf-8')
                device_type = info.properties.get(b'device_type', b'unknown').decode('utf-8')
                backend_port = int(info.properties.get(b'backend_port', b'8000').decode('utf-8'))
                web_port = int(info.properties.get(b'web_port', b'3000').decode('utf-8'))
                
                # Get IP address
                ip = socket.inet_ntoa(info.addresses[0])
                
                # Store discovered device
                device_info = {
                    'device_name': device_name,
                    'device_type': device_type,
                    'ip': ip,
                    'backend_port': backend_port,
                    'web_port': web_port,
                    'backend_url': f"http://{ip}:{backend_port}",
                    'web_url': f"http://{ip}:{web_port}",
                    'discovered_at': time.time()
                }
                
                self.discovery.discovered_devices[device_name] = device_info
                logger.info(f"[Discovery] Found device: {device_name} ({device_type}) at {ip}")
                
                # Call callback if provided
                if self.callback:
                    self.callback(device_info)
                    
            except Exception as e:
                logger.error(f"[Discovery] Error processing discovered service: {e}")
    
    def remove_service(self, zeroconf: Zeroconf, service_type: str, name: str):
        """Called when a service goes offline."""
        # Extract device name from service name
        device_name = name.split('.')[0]
        if device_name in self.discovery.discovered_devices:
            logger.info(f"[Discovery] Device went offline: {device_name}")
            del self.discovery.discovered_devices[device_name]
    
    def update_service(self, zeroconf: Zeroconf, service_type: str, name: str):
        """Called when service info is updated."""
        # Re-add to update info
        self.add_service(zeroconf, service_type, name)


# Fallback: Simple network scan if zeroconf not available
class SimpleScan:
    """
    Simple network scanner as fallback when zeroconf not available.
    Scans common ports on local subnet.
    """
    
    def __init__(self):
        self.local_ip = self._get_local_ip()
        self.subnet = '.'.join(self.local_ip.split('.')[:3]) + '.'
    
    def _get_local_ip(self) -> str:
        """Get local IP address."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except Exception:
            return "127.0.0.1"
    
    def scan_for_backends(self, timeout: float = 0.5) -> List[str]:
        """
        Scan local subnet for Sallie backends.
        
        Args:
            timeout: Connection timeout in seconds
            
        Returns:
            List of found backend URLs
        """
        logger.info(f"[SimpleScan] Scanning subnet {self.subnet}0/24 for Sallie backends...")
        found_backends = []
        
        def check_host(ip: str) -> Optional[str]:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(timeout)
                result = sock.connect_ex((ip, 8000))
                sock.close()
                
                if result == 0:
                    # Port is open, verify it's Sallie
                    try:
                        import urllib.request
                        response = urllib.request.urlopen(f'http://{ip}:8000/health', timeout=1)
                        if response.status == 200:
                            return f"http://{ip}:8000"
                    except:
                        pass
            except:
                pass
            return None
        
        # Scan in parallel for speed
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = {executor.submit(check_host, f"{self.subnet}{i}"): i for i in range(1, 255)}
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    found_backends.append(result)
                    logger.info(f"[SimpleScan] Found backend: {result}")
        
        return found_backends


# Global instance
_discovery_instance = None


def get_discovery() -> AutoDiscovery:
    """Get global discovery instance."""
    global _discovery_instance
    if _discovery_instance is None:
        _discovery_instance = AutoDiscovery()
    return _discovery_instance


def auto_configure_backend() -> str:
    """
    Automatically configure and return the backend URL.
    NO MANUAL CONFIGURATION NEEDED!
    
    Returns:
        Backend URL (auto-discovered)
    """
    discovery = get_discovery()
    
    # Try zeroconf first
    if ZEROCONF_AVAILABLE:
        logger.info("[AutoConfig] Using automatic discovery (zeroconf)...")
        discovery.start_discovery()
        
        # Wait a bit for discovery
        time.sleep(3)
        
        # Get primary backend
        backend_url = discovery.get_primary_backend()
        if backend_url:
            logger.info(f"[AutoConfig] Auto-discovered backend: {backend_url}")
            return backend_url
    
    # Fallback to simple scan
    logger.info("[AutoConfig] Using network scan fallback...")
    scanner = SimpleScan()
    backends = scanner.scan_for_backends()
    
    if backends:
        logger.info(f"[AutoConfig] Found backend via scan: {backends[0]}")
        return backends[0]
    
    # Last resort: use localhost
    logger.info("[AutoConfig] Using localhost as fallback")
    return f"http://{discovery.local_ip}:8000"


if __name__ == "__main__":
    # Test auto-discovery
    print("Testing Auto-Discovery...")
    
    discovery = AutoDiscovery(device_name="Test-Device", device_type="desktop")
    
    # Start broadcasting
    print("Starting broadcast...")
    discovery.start_broadcast()
    
    # Start discovery
    print("Starting discovery...")
    discovery.start_discovery(on_device_found=lambda d: print(f"Found: {d}"))
    
    # Wait and show results
    print("Waiting 10 seconds for discovery...")
    time.sleep(10)
    
    print(f"\nDiscovered {len(discovery.get_discovered_devices())} devices:")
    for device in discovery.get_discovered_devices():
        print(f"  - {device['device_name']} ({device['device_type']}) at {device['backend_url']}")
    
    print(f"\nPrimary backend: {discovery.get_primary_backend()}")
    
    discovery.stop()
    print("Done!")
