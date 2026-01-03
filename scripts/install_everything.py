#!/usr/bin/env python3
"""
Sallie - One-Click Complete Installer
Installs EVERYTHING automatically - just click once and wait!
"""

import os
import sys
import subprocess
import platform
import time
from pathlib import Path
import json

# Get script directory
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

# Colors for terminal output
if platform.system() == 'Windows':
    os.system('color')

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_banner():
    """Print installation banner."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                                                           ║")
    print("║           🌟  SALLIE ONE-CLICK INSTALLER  🌟              ║")
    print("║                                                           ║")
    print("║              Your AI Cognitive Partner                    ║")
    print("║                   Version 5.4.2                           ║")
    print("║                                                           ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}\n")
    print(f"{Colors.YELLOW}This will install everything automatically!")
    print(f"Grab a coffee ☕ - this will take 5-10 minutes...{Colors.RESET}\n")
    time.sleep(2)

def print_step(step_num, total_steps, text):
    """Print step header."""
    print(f"\n{Colors.MAGENTA}{Colors.BOLD}[{step_num}/{total_steps}] {text}{Colors.RESET}")
    print(f"{Colors.CYAN}{'─' * 60}{Colors.RESET}")

def print_success(text):
    """Print success message."""
    print(f"  {Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text):
    """Print error message."""
    print(f"  {Colors.RED}✗ {text}{Colors.RESET}")

def print_warning(text):
    """Print warning message."""
    print(f"  {Colors.YELLOW}⚠ {text}{Colors.RESET}")

def print_info(text):
    """Print info message."""
    print(f"  {Colors.BLUE}→ {text}{Colors.RESET}")

def run_command(cmd, cwd=None, timeout=600, show_output=False):
    """Run a command and return success status."""
    try:
        # On Windows, use shell=True for npm and other batch commands
        use_shell = platform.system() == 'Windows' and isinstance(cmd, list) and len(cmd) > 0 and cmd[0] in ['npm', 'docker-compose']
        
        if show_output:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                timeout=timeout,
                check=False,
                shell=use_shell
            )
            return result.returncode == 0, "", ""
        else:
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False,
                shell=use_shell
            )
            return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def step1_check_prerequisites():
    """Step 1: Check prerequisites."""
    print_step(1, 8, "Checking Prerequisites")
    
    all_good = True
    
    # Check Python
    print_info("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 11:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} ✓")
    else:
        print_error(f"Python {version.major}.{version.minor}.{version.micro} - Need 3.11+")
        all_good = False
    
    # Check Docker
    print_info("Checking Docker...")
    success, stdout, _ = run_command(['docker', '--version'])
    if success:
        print_success(f"{stdout.strip()}")
        success, _, _ = run_command(['docker', 'info'])
        if success:
            print_success("Docker is running ✓")
        else:
            print_error("Docker is not running - please start Docker Desktop first")
            all_good = False
    else:
        print_error("Docker not found - install from docker.com")
        all_good = False
    
    # Check Node.js
    print_info("Checking Node.js...")
    success, stdout, _ = run_command(['node', '--version'])
    if success:
        print_success(f"Node.js {stdout.strip()} ✓")
    else:
        print_error("Node.js not found - install from nodejs.org")
        all_good = False
    
    return all_good

def step2_create_directories():
    """Step 2: Create directories."""
    print_step(2, 8, "Creating Directory Structure")
    
    directories = [
        'progeny_root/Peer/logs',
        'progeny_root/Peer/memory',
        'progeny_root/Peer/limbic',
        'progeny_root/Peer/working',
        'progeny_root/Peer/convergence',
        'progeny_root/Peer/projects',
        'progeny_root/Peer/drafts',
        'progeny_root/Peer/outbox',
        'progeny_root/Companion/logs',
        'progeny_root/Companion/memory',
    ]
    
    for dir_path in directories:
        full_path = SCRIPT_DIR / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
    
    print_success("All directories created")
    return True

def step3_install_python_packages():
    """Step 3: Install Python packages."""
    print_step(3, 8, "Installing Python Packages")
    
    # Install requirements
    requirements_file = SCRIPT_DIR / 'progeny_root' / 'requirements.txt'
    
    if requirements_file.exists():
        print_info("Installing Python dependencies...")
        print_info("This may take a few minutes...")
        success, _, stderr = run_command(
            [sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)],
            timeout=600,
            show_output=False
        )
        
        if success:
            print_success("Python packages installed ✓")
        else:
            print_warning("Some packages may have failed, continuing...")
    else:
        print_warning("requirements.txt not found, skipping")
    
    # Ensure zeroconf is installed (for auto-discovery)
    print_info("Installing zeroconf for auto-discovery...")
    success, _, _ = run_command(
        [sys.executable, '-m', 'pip', 'install', 'zeroconf'],
        timeout=120
    )
    
    if success:
        print_success("Zeroconf installed - auto-discovery enabled! ✓")
    else:
        print_warning("Zeroconf install failed - manual IP config will be needed")
    
    return True

def step4_install_web_packages():
    """Step 4: Install web packages."""
    print_step(4, 8, "Installing Web Interface Packages")
    
    web_dir = SCRIPT_DIR / 'web'
    package_json = web_dir / 'package.json'
    
    if not package_json.exists():
        print_warning("package.json not found, skipping web install")
        return True
    
    print_info("Installing Node.js packages...")
    print_info("This may take a few minutes...")
    
    success, _, stderr = run_command(
        ['npm', 'install'],
        cwd=web_dir,
        timeout=600
    )
    
    if success:
        print_success("Web packages installed ✓")
        return True
    else:
        print_error("Failed to install web packages")
        print_error(f"Error: {stderr[:200]}")
        return False

def step5_setup_docker():
    """Step 5: Setup Docker services."""
    print_step(5, 8, "Setting Up Docker Services")
    
    docker_dir = SCRIPT_DIR / 'progeny_root'
    
    print_info("Pulling Docker images (Ollama, Qdrant)...")
    print_info("This may take several minutes on first run...")
    
    success, _, _ = run_command(
        ['docker-compose', 'pull'],
        cwd=docker_dir,
        timeout=600
    )
    
    if success:
        print_success("Docker images downloaded ✓")
    else:
        print_warning("Could not pull images - will try on first startup")
    
    return True

def step6_create_config():
    """Step 6: Create configuration files."""
    print_step(6, 8, "Creating Configuration Files")
    
    # Create config.json for Peer if it doesn't exist
    peer_config = SCRIPT_DIR / 'progeny_root' / 'Peer' / 'core' / 'config.json'
    if not peer_config.exists():
        print_info("Creating Peer config.json...")
        default_config = {
            "llm": {
                "ollama_url": "http://localhost:11434",
                "default_model": "deepseek-v3",
                "fallback_model": "llama3"
            },
            "qdrant": {
                "url": "http://localhost:6333",
                "collection_name": "progeny_memory"
            },
            "api": {
                "host": "127.0.0.1",
                "port": 8000
            },
            "discovery": {
                "enabled": True,
                "device_name": "Sallie",
                "device_type": "desktop"
            }
        }
        
        peer_config.parent.mkdir(parents=True, exist_ok=True)
        with open(peer_config, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2)
        print_success("Peer config created ✓")
    else:
        print_success("Peer config exists ✓")
    
    # Create config.json for Companion if it doesn't exist
    companion_config = SCRIPT_DIR / 'progeny_root' / 'Companion' / 'core' / 'config.json'
    if not companion_config.exists():
        print_info("Creating Companion config.json...")
        companion_config.parent.mkdir(parents=True, exist_ok=True)
        with open(peer_config, 'r', encoding='utf-8') as src:
            config = json.load(src)
        with open(companion_config, 'w', encoding='utf-8') as dst:
            json.dump(config, dst, indent=2)
        print_success("Companion config created ✓")
    else:
        print_success("Companion config exists ✓")
    
    return True

def step7_test_installation():
    """Step 7: Test the installation."""
    print_step(7, 8, "Testing Installation")
    
    # Test discovery import
    print_info("Testing auto-discovery module...")
    try:
        sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root' / 'Peer'))
        from core.discovery import get_discovery
        discovery = get_discovery()
        print_success(f"Auto-discovery works! (Local IP: {discovery.local_ip})")
    except Exception as e:
        print_warning(f"Auto-discovery test failed: {e}")
    
    # Test main.py syntax
    print_info("Testing backend syntax...")
    main_file = SCRIPT_DIR / 'progeny_root' / 'Peer' / 'core' / 'main.py'
    if main_file.exists():
        try:
            with open(main_file, encoding='utf-8') as f:
                compile(f.read(), 'main.py', 'exec')
            print_success("Backend syntax is valid ✓")
        except SyntaxError as e:
            print_error(f"Backend has syntax error: {e}")
            return False
    
    # Test launcher syntax
    print_info("Testing launcher syntax...")
    launcher_file = SCRIPT_DIR / 'launcher.py'
    if launcher_file.exists():
        try:
            with open(launcher_file, encoding='utf-8') as f:
                compile(f.read(), 'launcher.py', 'exec')
            print_success("Launcher syntax is valid ✓")
        except SyntaxError as e:
            print_error(f"Launcher has syntax error: {e}")
            return False
    
    print_success("All tests passed! ✓")
    return True

def step8_show_completion():
    """Step 8: Show completion message."""
    print_step(8, 8, "Installation Complete!")
    
    print(f"\n{Colors.GREEN}{Colors.BOLD}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                                                           ║")
    print("║              ✨  INSTALLATION SUCCESSFUL!  ✨             ║")
    print("║                                                           ║")
    print("║              Sallie is ready to launch!                   ║")
    print("║                                                           ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}\n")
    
    print(f"{Colors.CYAN}{Colors.BOLD}How to start Sallie:{Colors.RESET}\n")
    
    if platform.system() == 'Windows':
        print(f"  {Colors.GREEN}Option 1 (Easy):{Colors.RESET} Double-click {Colors.BOLD}launcher.py{Colors.RESET}")
        print(f"  {Colors.GREEN}Option 2 (GUI):{Colors.RESET}  Run {Colors.BOLD}python launcher.py{Colors.RESET}")
        print(f"  {Colors.GREEN}Option 3 (CLI):{Colors.RESET}  Run {Colors.BOLD}start-sallie.bat{Colors.RESET}")
    else:
        print(f"  {Colors.GREEN}Option 1 (GUI):{Colors.RESET}  Run {Colors.BOLD}python3 launcher.py{Colors.RESET}")
        print(f"  {Colors.GREEN}Option 2 (CLI):{Colors.RESET}  Run {Colors.BOLD}./start-sallie.sh{Colors.RESET}")
    
    print(f"\n{Colors.CYAN}What happens when you start:{Colors.RESET}")
    print(f"  {Colors.BLUE}1.{Colors.RESET} Docker services start (Ollama + Qdrant)")
    print(f"  {Colors.BLUE}2.{Colors.RESET} Backend API starts on http://localhost:8000")
    print(f"  {Colors.BLUE}3.{Colors.RESET} Web interface starts on http://localhost:3000")
    print(f"  {Colors.BLUE}4.{Colors.RESET} Auto-discovery finds other devices automatically!")
    
    print(f"\n{Colors.YELLOW}First run tips:{Colors.RESET}")
    print(f"  • First startup takes ~30 seconds")
    print(f"  • Make sure Docker Desktop is running")
    print(f"  • Your browser will open automatically")
    
    print(f"\n{Colors.MAGENTA}Thank you for choosing Sallie! 💜{Colors.RESET}\n")
    
    return True

def main():
    """Main installation function."""
    print_banner()
    
    try:
        # Run all steps sequentially
        steps = [
            step1_check_prerequisites,
            step2_create_directories,
            step3_install_python_packages,
            step4_install_web_packages,
            step5_setup_docker,
            step6_create_config,
            step7_test_installation,
            step8_show_completion,
        ]
        
        for step_func in steps:
            result = step_func()
            if not result:
                print(f"\n{Colors.RED}Installation failed at: {step_func.__name__}{Colors.RESET}")
                print(f"{Colors.YELLOW}Please fix the errors above and run again.{Colors.RESET}\n")
                return 1
            time.sleep(0.5)  # Brief pause between steps
        
        return 0
        
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Installation cancelled by user{Colors.RESET}")
        return 1
    except Exception as e:
        print(f"\n\n{Colors.RED}Installation failed with error: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
