#!/usr/bin/env python3
"""
Sallie - Automated Installer
Installs all dependencies and sets up the environment.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path
import json

# Get script directory
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

# Colors for terminal output
if platform.system() == 'Windows':
    # Windows doesn't support ANSI by default
    os.system('color')

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    """Print a styled header."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}{Colors.RESET}\n")

def print_success(text):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text):
    """Print error message."""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_warning(text):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def print_info(text):
    """Print info message."""
    print(f"{Colors.BLUE}→ {text}{Colors.RESET}")

def run_command(cmd, cwd=None, timeout=300, shell=False):
    """Run a command and return success status."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_python_version():
    """Check Python version."""
    print_info("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 11:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python {version.major}.{version.minor}.{version.micro} - Need Python 3.11+")
        return False

def check_docker():
    """Check if Docker is installed."""
    print_info("Checking Docker...")
    success, stdout, stderr = run_command(['docker', '--version'])
    if success:
        print_success(f"{stdout.strip()}")
        
        # Check if Docker is running
        success, _, _ = run_command(['docker', 'info'])
        if success:
            print_success("Docker is running")
            return True
        else:
            print_warning("Docker is installed but not running")
            print_info("Please start Docker Desktop and run this installer again")
            return False
    else:
        print_error("Docker not found")
        print_info("Please install Docker Desktop from https://www.docker.com/products/docker-desktop")
        return False

def check_node():
    """Check if Node.js is installed."""
    print_info("Checking Node.js...")
    success, stdout, stderr = run_command(['node', '--version'])
    if success:
        version = stdout.strip()
        print_success(f"Node.js {version}")
        major_version = int(version.replace('v', '').split('.')[0])
        if major_version >= 18:
            return True
        else:
            print_warning(f"Node.js version {version} is below recommended 18+")
            return True
    else:
        print_error("Node.js not found")
        print_info("Please install Node.js from https://nodejs.org/")
        return False

def install_python_dependencies():
    """Install Python dependencies."""
    print_header("Installing Python Dependencies")
    
    requirements_file = SCRIPT_DIR / 'progeny_root' / 'requirements.txt'
    
    if not requirements_file.exists():
        print_error(f"Requirements file not found: {requirements_file}")
        return False
    
    print_info(f"Installing from {requirements_file}...")
    
    # Use pip to install
    cmd = [sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)]
    
    print_info("This may take several minutes...")
    success, stdout, stderr = run_command(cmd, timeout=600)
    
    if success:
        print_success("Python dependencies installed")
    else:
        print_error("Failed to install Python dependencies")
        print_error(f"Error: {stderr}")
        return False
    
    # Install zeroconf for auto-discovery
    print()
    print_info("Installing zeroconf for auto-discovery...")
    print_info("This enables automatic device discovery on your local network!")
    
    cmd = [sys.executable, '-m', 'pip', 'install', 'zeroconf']
    success, stdout, stderr = run_command(cmd, timeout=120)
    
    if success:
        print_success("Zeroconf installed - auto-discovery enabled!")
        print_info("Your devices will automatically find each other - no manual IPs needed!")
    else:
        print_warning("Zeroconf installation failed")
        print_info("Auto-discovery will not work, but Sallie will still run")
        print_info("You can install it later with: pip install zeroconf")
    
    return True

def install_web_dependencies():
    """Install web interface dependencies."""
    print_header("Installing Web Interface Dependencies")
    
    web_dir = SCRIPT_DIR / 'web'
    package_json = web_dir / 'package.json'
    
    if not package_json.exists():
        print_error(f"package.json not found: {package_json}")
        return False
    
    print_info("Installing Node.js packages...")
    print_info("This may take several minutes...")
    
    success, stdout, stderr = run_command(['npm', 'install'], cwd=web_dir, timeout=600)
    
    if success:
        print_success("Web dependencies installed")
        return True
    else:
        print_error("Failed to install web dependencies")
        print_error(f"Error: {stderr}")
        return False

def setup_docker_services():
    """Set up Docker services."""
    print_header("Setting Up Docker Services")
    
    docker_compose_file = SCRIPT_DIR / 'progeny_root' / 'docker-compose.yml'
    
    if not docker_compose_file.exists():
        print_warning(f"docker-compose.yml not found: {docker_compose_file}")
        return True  # Not critical
    
    print_info("Pulling Docker images (Ollama, Qdrant)...")
    print_info("This may take several minutes on first run...")
    
    success, stdout, stderr = run_command(
        ['docker-compose', 'pull'],
        cwd=docker_compose_file.parent,
        timeout=600
    )
    
    if success:
        print_success("Docker images ready")
        return True
    else:
        print_warning("Could not pull Docker images (will try on startup)")
        return True  # Not critical

def create_config_files():
    """Create default configuration files if they don't exist."""
    print_header("Setting Up Configuration")
    
    # Create .env file if it doesn't exist
    env_file = SCRIPT_DIR / 'progeny_root' / '.env'
    env_example = SCRIPT_DIR / 'progeny_root' / '.env.example'
    
    if not env_file.exists() and env_example.exists():
        print_info("Creating .env file from template...")
        with open(env_example, 'r') as src:
            content = src.read()
        with open(env_file, 'w') as dst:
            dst.write(content)
        print_success(".env file created")
    
    # Check config.json
    config_file = SCRIPT_DIR / 'progeny_root' / 'core' / 'config.json'
    if config_file.exists():
        print_success("config.json found")
    else:
        print_info("Creating default config.json...")
        default_config = {
            "llm": {
                "ollama_url": "http://localhost:11434",
                "default_model": "deepseek-v3",
                "fallback_model": "llama3",
                "gemini_api_key": "",
                "gemini_model": "gemini-1.5-flash"
            },
            "qdrant": {
                "url": "http://localhost:6333",
                "collection_name": "progeny_memory"
            },
            "api": {
                "host": "127.0.0.1",
                "port": 8000
            },
            "web": {
                "port": 3000
            },
            "peer_network": {
                "enabled": False,
                "discovery": "local"
            },
            "features": {
                "creative_expression": True,
                "teaching": True,
                "project_management": True,
                "peer_communication": True
            }
        }
        
        config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(config_file, 'w') as f:
            json.dump(default_config, f, indent=2)
        print_success("config.json created")
    
    return True

def create_directories():
    """Create necessary directories."""
    print_header("Creating Directory Structure")
    
    directories = [
        'progeny_root/logs',
        'progeny_root/memory',
        'progeny_root/limbic',
        'progeny_root/working',
        'progeny_root/convergence',
        'progeny_root/projects',
        'progeny_root/drafts',
        'progeny_root/outbox',
    ]
    
    for dir_path in directories:
        full_path = SCRIPT_DIR / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
    
    print_success("Directory structure created")
    return True

def create_launcher_executable():
    """Create launcher executable instructions."""
    print_header("Launcher Setup")
    
    print_info("To create a distributable executable:")
    print_info("1. Install PyInstaller: pip install pyinstaller")
    print_info("2. Run: pyinstaller launcher.py --onefile --windowed --name Sallie")
    print_info("3. Find executable in: dist/Sallie.exe (Windows) or dist/Sallie (Mac/Linux)")
    print_info("")
    print_info("For now, you can run: python launcher.py")
    
    return True

def main():
    """Main installer function."""
    print_header("🌟 Sallie Installation 🌟")
    print(f"Version: 5.4.2")
    print(f"Platform: {platform.system()} {platform.release()}")
    print()
    
    # Track success
    all_success = True
    
    # Step 1: Check prerequisites
    print_header("Step 1: Checking Prerequisites")
    
    if not check_python_version():
        print_error("Python version check failed")
        all_success = False
    
    docker_ok = check_docker()
    node_ok = check_node()
    
    if not docker_ok:
        print_warning("Docker check failed - you'll need to install Docker")
        all_success = False
    
    if not node_ok:
        print_warning("Node.js check failed - you'll need to install Node.js")
        all_success = False
    
    # Step 2: Create directories
    if not create_directories():
        print_error("Failed to create directories")
        all_success = False
    
    # Step 3: Create config files
    if not create_config_files():
        print_error("Failed to create config files")
        all_success = False
    
    # Step 4: Install Python dependencies
    if not install_python_dependencies():
        print_error("Failed to install Python dependencies")
        all_success = False
    
    # Step 5: Install web dependencies
    if node_ok:
        if not install_web_dependencies():
            print_warning("Failed to install web dependencies")
            # Don't fail completely
    
    # Step 6: Setup Docker services
    if docker_ok:
        setup_docker_services()
    
    # Step 7: Launcher info
    create_launcher_executable()
    
    # Final status
    print_header("Installation Complete")
    
    if all_success:
        print_success("✨ Sallie is ready to launch! ✨")
        print()
        print_info("To start Sallie:")
        print_info("  Option 1: python launcher.py")
        print_info("  Option 2: ./start-sallie.sh (Mac/Linux) or start-sallie.bat (Windows)")
        print()
        print_info("The launcher provides a simple GUI to start all services.")
        print()
    else:
        print_warning("Installation completed with some issues")
        print_info("Please resolve the issues above and run the installer again")
        print()
    
    print(f"{Colors.CYAN}Thank you for choosing Sallie! 💜{Colors.RESET}")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Installation cancelled by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Installation failed with error: {e}{Colors.RESET}")
        sys.exit(1)
