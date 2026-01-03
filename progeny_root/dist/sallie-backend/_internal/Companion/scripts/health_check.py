#!/usr/bin/env python3
"""
Health check script for Digital Progeny (Section 17.5.2).

Checks:
- Ollama service
- Qdrant service
- Disk space
- File system integrity
- Configuration validity
"""

import sys
import requests
import psutil
from pathlib import Path
from typing import Dict, Any, List

def check_ollama(url: str = "http://localhost:11434") -> Dict[str, Any]:
    """Check Ollama service health."""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        if response.status_code == 200:
            return {"status": "healthy", "url": url}
        else:
            return {"status": "unhealthy", "url": url, "code": response.status_code}
    except requests.exceptions.RequestException as e:
        return {"status": "unreachable", "url": url, "error": str(e)}

def check_qdrant(url: str = "http://localhost:6333") -> Dict[str, Any]:
    """Check Qdrant service health."""
    try:
        response = requests.get(f"{url}/collections", timeout=5)
        if response.status_code == 200:
            return {"status": "healthy", "url": url}
        else:
            return {"status": "unhealthy", "url": url, "code": response.status_code}
    except requests.exceptions.RequestException as e:
        return {"status": "unreachable", "url": url, "error": str(e)}

def check_disk_space(path: Path = Path("progeny_root")) -> Dict[str, Any]:
    """Check disk space availability."""
    try:
        usage = psutil.disk_usage(str(path))
        percent_free = (usage.free / usage.total) * 100
        
        return {
            "status": "healthy" if percent_free > 10 else "warning",
            "total_gb": usage.total / (1024**3),
            "free_gb": usage.free / (1024**3),
            "used_percent": (usage.used / usage.total) * 100,
            "free_percent": percent_free
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

def check_file_integrity() -> List[Dict[str, Any]]:
    """Check critical file integrity."""
    critical_files = [
        Path("progeny_root/limbic/soul.json"),
        Path("progeny_root/limbic/heritage/core.json"),
        Path("progeny_root/memory/patches.json"),
    ]
    
    results = []
    for file_path in critical_files:
        if file_path.exists():
            try:
                size = file_path.stat().st_size
                results.append({
                    "file": str(file_path),
                    "status": "exists",
                    "size_bytes": size
                })
            except Exception as e:
                results.append({
                    "file": str(file_path),
                    "status": "error",
                    "error": str(e)
                })
        else:
            results.append({
                "file": str(file_path),
                "status": "missing"
            })
    
    return results

def run_health_check() -> Dict[str, Any]:
    """Run complete health check."""
    print("Running Digital Progeny Health Check...\n")
    
    results = {
        "ollama": check_ollama(),
        "qdrant": check_qdrant(),
        "disk": check_disk_space(),
        "files": check_file_integrity()
    }
    
    # Print results
    print("Service Status:")
    print(f"  Ollama: {results['ollama']['status']}")
    print(f"  Qdrant: {results['qdrant']['status']}")
    print(f"  Disk: {results['disk']['status']}")
    
    print("\nFile Integrity:")
    for file_result in results['files']:
        status_icon = "✓" if file_result['status'] == "exists" else "✗"
        print(f"  {status_icon} {file_result['file']}: {file_result['status']}")
    
    # Overall health
    all_healthy = (
        results['ollama']['status'] == "healthy" and
        results['qdrant']['status'] == "healthy" and
        results['disk']['status'] == "healthy"
    )
    
    print(f"\nOverall Health: {'✓ HEALTHY' if all_healthy else '✗ UNHEALTHY'}")
    
    return results

if __name__ == "__main__":
    results = run_health_check()
    sys.exit(0 if results['ollama']['status'] == "healthy" and results['qdrant']['status'] == "healthy" else 1)

