#!/usr/bin/env python3
"""
Sallie System Health Check
Verifies that all dependencies and services are properly configured.
Run this before starting Sallie to identify any issues.
"""

import sys
import subprocess
import platform
from pathlib import Path

def print_header(text):
    """Print section header."""
    print(f"\n{'=' * 60}")
    print(f" {text}")
    print('=' * 60)

def check_item(description, success, details=""):
    """Print check result."""
    status = "✓" if success else "✗"
    color = "\033[92m" if success else "\033[91m"
    reset = "\033[0m"
    print(f"  {color}{status}{reset} {description}")
    if details:
        print(f"    → {details}")
    return success

def check_python():
    """Check Python version."""
    print_header("Python Environment")
    version = sys.version_info
    success = version >= (3, 11)
    check_item(
        f"Python {version.major}.{version.minor}.{version.micro}",
        success,
        "Requires Python 3.11+" if not success else "OK"
    )
    return success

def check_module(module_name, import_name=None):
    """Check if a Python module is installed."""
    if import_name is None:
        import_name = module_name
    try:
        __import__(import_name)
        check_item(f"{module_name}", True, "Installed")
        return True
    except ImportError:
        check_item(f"{module_name}", False, "Not installed")
        return False

def check_python_packages():
    """Check required Python packages."""
    print_header("Python Dependencies")
    
    packages = [
        ("FastAPI", "fastapi"),
        ("Uvicorn", "uvicorn"),
        ("Pydantic", "pydantic"),
        ("Qdrant Client", "qdrant_client"),
        ("NumPy", "numpy"),
        ("Requests", "requests"),
        ("Zeroconf", "zeroconf"),
        ("Plyer (Notifications)", "plyer"),
        ("pystray (System Tray)", "pystray"),
        ("Pillow (Image Processing)", "PIL"),
    ]
    
    results = []
    for name, import_name in packages:
        results.append(check_module(name, import_name))
    
    return all(results)

def check_node():
    """Check Node.js installation."""
    print_header("Node.js Environment")
    try:
        result = subprocess.run(
            ['node', '--version'],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            check_item(f"Node.js {version}", True, "OK")
            return True
        else:
            check_item("Node.js", False, "Command failed")
            return False
    except FileNotFoundError:
        check_item("Node.js", False, "Not found in PATH")
        return False

def check_npm():
    """Check npm installation."""
    try:
        result = subprocess.run(
            ['npm', '--version'],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            check_item(f"npm {version}", True, "OK")
            return True
        else:
            check_item("npm", False, "Command failed")
            return False
    except FileNotFoundError:
        check_item("npm", False, "Not found in PATH")
        return False

def check_docker():
    """Check Docker installation."""
    print_header("Docker Environment")
    try:
        result = subprocess.run(
            ['docker', '--version'],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            check_item(f"Docker {version}", True, "Installed")
            
            # Check if Docker is running
            result2 = subprocess.run(
                ['docker', 'ps'],
                capture_output=True,
                text=True,
                check=False
            )
            if result2.returncode == 0:
                check_item("Docker Service", True, "Running")
                return True
            else:
                check_item("Docker Service", False, "Not running - Start Docker Desktop")
                return False
        else:
            check_item("Docker", False, "Command failed")
            return False
    except FileNotFoundError:
        check_item("Docker", False, "Not found in PATH")
        return False

def check_web_dependencies():
    """Check web app dependencies."""
    print_header("Web Interface")
    web_dir = Path(__file__).parent / 'web'
    node_modules = web_dir / 'node_modules'
    
    if node_modules.exists():
        check_item("Web dependencies", True, "Installed")
        return True
    else:
        check_item("Web dependencies", False, "Run: cd web && npm install")
        return False

def check_desktop_dependencies():
    """Check desktop app dependencies."""
    print_header("Desktop App (Optional)")
    desktop_dir = Path(__file__).parent / 'desktop'
    node_modules = desktop_dir / 'node_modules'
    
    if node_modules.exists():
        check_item("Desktop dependencies", True, "Installed")
        return True
    else:
        check_item("Desktop dependencies", False, "Run: cd desktop && npm install")
        return False

def check_config():
    """Check configuration files."""
    print_header("Configuration")
    
    config_files = [
        ('progeny_root/Peer/core/config.json', 'Backend config'),
        ('progeny_root/docker-compose.yml', 'Docker config'),
    ]
    
    results = []
    for file_path, description in config_files:
        full_path = Path(__file__).parent / file_path
        if full_path.exists():
            check_item(description, True, "Found")
            results.append(True)
        else:
            check_item(description, False, f"Missing: {file_path}")
            results.append(False)
    
    return all(results)

def check_gui_support():
    """Check GUI support on this platform."""
    print_header("GUI Support")
    
    is_windows = platform.system() == 'Windows'
    is_mac = platform.system() == 'Darwin'
    is_linux = platform.system() == 'Linux'
    
    if is_windows:
        check_item("Platform", True, "Windows - Native GUI support")
        return True
    elif is_mac:
        check_item("Platform", True, "macOS - Native GUI support")
        return True
    elif is_linux:
        # Check if display is available
        import os
        if os.environ.get('DISPLAY'):
            check_item("Platform", True, "Linux with X11/Wayland")
            return True
        else:
            check_item("Platform", False, "Linux headless - GUI disabled")
            return False
    else:
        check_item("Platform", False, f"Unknown OS: {platform.system()}")
        return False

def main():
    """Run all health checks."""
    print("\n" + "=" * 60)
    print(" 🔍 SALLIE SYSTEM HEALTH CHECK")
    print("=" * 60)
    print(f" Platform: {platform.system()} {platform.release()}")
    print(f" Python: {sys.version.split()[0]}")
    print("=" * 60)
    
    results = []
    
    # Critical checks
    results.append(("Python", check_python()))
    results.append(("Python Packages", check_python_packages()))
    results.append(("Node.js", check_node()))
    results.append(("npm", check_npm()))
    results.append(("Docker", check_docker()))
    
    # Optional checks
    results.append(("Web Dependencies", check_web_dependencies()))
    results.append(("Desktop Dependencies", check_desktop_dependencies()))
    results.append(("Configuration", check_config()))
    results.append(("GUI Support", check_gui_support()))
    
    # Summary
    print_header("Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\n  Checks passed: {passed}/{total}")
    
    if passed == total:
        print("\n  ✓ All systems ready! You can start Sallie now.")
        print("  → Run: ./start-sallie.sh (Linux/Mac) or start-sallie.bat (Windows)")
        return 0
    else:
        print("\n  ⚠ Some checks failed. Please fix the issues above.")
        print("  → Read WINDOWS_SETUP.md (Windows) or QUICK_START.md for help")
        return 1

if __name__ == '__main__':
    sys.exit(main())
