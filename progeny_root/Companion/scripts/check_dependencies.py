#!/usr/bin/env python3
"""
Dependency check script for Digital Progeny.
Checks all required dependencies and reports status.
"""

import sys
import subprocess
import platform
import shutil
from pathlib import Path
from typing import Dict, List, Tuple

def check_command(command: str, version_flag: str = "--version") -> Tuple[bool, str]:
    """Check if a command is available and get its version."""
    try:
        result = subprocess.run(
            [command, version_flag],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.strip().split('\n')[0]
            return True, version
        return False, ""
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False, ""

def check_python_version() -> Tuple[bool, str]:
    """Check Python version."""
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    if version.major >= 3 and version.minor >= 11:
        return True, version_str
    return False, version_str

def check_node_version() -> Tuple[bool, str]:
    """Check Node.js version."""
    return check_command("node", "--version")

def check_docker() -> Tuple[bool, str]:
    """Check Docker availability."""
    return check_command("docker", "--version")

def check_git() -> Tuple[bool, str]:
    """Check Git availability."""
    return check_command("git", "--version")

def check_pip_package(package: str) -> Tuple[bool, str]:
    """Check if a Python package is installed."""
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "show", package],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Extract version from output
            for line in result.stdout.split('\n'):
                if line.startswith('Version:'):
                    return True, line.split(':', 1)[1].strip()
            return True, "installed"
        return False, ""
    except Exception:
        return False, ""

def check_port_available(port: int) -> bool:
    """Check if a port is available."""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def check_disk_space(path: Path, required_gb: int = 50) -> Tuple[bool, str]:
    """Check available disk space."""
    try:
        import shutil
        total, used, free = shutil.disk_usage(path)
        free_gb = free / (1024**3)
        return free_gb >= required_gb, f"{free_gb:.1f} GB free"
    except Exception:
        return False, "unknown"

def get_system_info() -> Dict[str, any]:
    """Get system information."""
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "cpu_count": platform.processor() if platform.system() == "Windows" else None
    }

def main():
    """Run dependency checks."""
    print("=" * 60)
    print("Digital Progeny - Dependency Check")
    print("=" * 60)
    print()
    
    all_ok = True
    checks = []
    
    # System info
    sys_info = get_system_info()
    print(f"Platform: {sys_info['platform']} {sys_info['platform_version']}")
    print(f"Architecture: {sys_info['architecture']}")
    print()
    
    # Required commands
    print("Required Commands:")
    print("-" * 60)
    
    # Python
    py_ok, py_version = check_python_version()
    status = "✓" if py_ok else "✗"
    print(f"{status} Python: {py_version} {'(>= 3.11 required)' if not py_ok else ''}")
    if not py_ok:
        all_ok = False
        print("  → Install Python 3.11+ from https://www.python.org/downloads/")
    checks.append(("Python", py_ok))
    
    # Node.js
    node_ok, node_version = check_node_version()
    status = "✓" if node_ok else "✗"
    print(f"{status} Node.js: {node_version if node_ok else 'Not found'} {'(>= 18.0 required)' if not node_ok else ''}")
    if not node_ok:
        all_ok = False
        print("  → Install Node.js from https://nodejs.org/")
    checks.append(("Node.js", node_ok))
    
    # Docker
    docker_ok, docker_version = check_docker()
    status = "✓" if docker_ok else "✗"
    print(f"{status} Docker: {docker_version if docker_ok else 'Not found'}")
    if not docker_ok:
        all_ok = False
        print("  → Install Docker Desktop from https://www.docker.com/products/docker-desktop/")
    checks.append(("Docker", docker_ok))
    
    # Git
    git_ok, git_version = check_git()
    status = "✓" if git_ok else "✗"
    print(f"{status} Git: {git_version if git_ok else 'Not found'}")
    if not git_ok:
        all_ok = False
        print("  → Install Git from https://git-scm.com/downloads")
    checks.append(("Git", git_ok))
    
    print()
    
    # Port availability
    print("Port Availability:")
    print("-" * 60)
    ports_to_check = [
        (8000, "Main API server"),
        (3000, "Web UI"),
        (11434, "Ollama"),
        (6333, "Qdrant")
    ]
    
    for port, description in ports_to_check:
        available = check_port_available(port)
        status = "✓" if available else "⚠"
        print(f"{status} Port {port} ({description}): {'Available' if available else 'In use'}")
        if not available:
            print(f"  → Port {port} is already in use. You may need to stop other services.")
    
    print()
    
    # Disk space
    print("System Resources:")
    print("-" * 60)
    check_path = Path.cwd()
    disk_ok, disk_info = check_disk_space(check_path, 50)
    status = "✓" if disk_ok else "⚠"
    print(f"{status} Disk Space: {disk_info} ({'50+ GB recommended' if not disk_ok else 'OK'})")
    
    # Python packages (sample check)
    print()
    print("Python Packages (sample):")
    print("-" * 60)
    key_packages = ["fastapi", "pydantic", "numpy"]
    for pkg in key_packages:
        installed, version = check_pip_package(pkg)
        status = "✓" if installed else "✗"
        print(f"{status} {pkg}: {version if installed else 'Not installed'}")
    
    print()
    print("=" * 60)
    if all_ok:
        print("✓ All required dependencies are installed!")
        print("  Run 'pip install -r requirements.txt' to install Python packages.")
        return 0
    else:
        print("✗ Some dependencies are missing.")
        print("  Please install the missing dependencies and run this check again.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

