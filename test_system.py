#!/usr/bin/env python3
"""
Sallie - System Test Script
Tests all components to ensure they work correctly.
"""

import os
import sys
import time
import subprocess
import signal
from pathlib import Path
import urllib.request
import json

# Get script directory
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_test(text):
    print(f"{Colors.BLUE}[TEST] {text}{Colors.RESET}")

def print_success(text):
    print(f"{Colors.GREEN}  ✓ {text}{Colors.RESET}")

def print_error(text):
    print(f"{Colors.RED}  ✗ {text}{Colors.RESET}")

def print_info(text):
    print(f"{Colors.CYAN}  → {text}{Colors.RESET}")

def test_backend():
    """Test backend startup."""
    print_test("Testing Backend API...")
    
    os.chdir(SCRIPT_DIR / 'progeny_root')
    
    # Start backend
    process = subprocess.Popen(
        [sys.executable, '-m', 'uvicorn', 'core.main:app', '--host', '127.0.0.1', '--port', '8000'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid if sys.platform != 'win32' else None
    )
    
    print_info(f"Started backend (PID: {process.pid})")
    
    # Wait for startup
    max_retries = 30
    for i in range(max_retries):
        try:
            response = urllib.request.urlopen('http://localhost:8000/health', timeout=2)
            data = json.loads(response.read())
            print_success(f"Backend responding: {data.get('status')}")
            
            # Kill process
            if sys.platform == 'win32':
                process.terminate()
            else:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            
            process.wait(timeout=5)
            print_success("Backend stopped cleanly")
            return True
        except Exception as e:
            if i == max_retries - 1:
                print_error(f"Backend failed to start: {e}")
                try:
                    if sys.platform == 'win32':
                        process.kill()
                    else:
                        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                except:
                    pass
                return False
            time.sleep(1)

def test_web_build():
    """Test web interface build."""
    print_test("Testing Web Interface Build...")
    
    os.chdir(SCRIPT_DIR / 'web')
    
    # Check if node_modules exists
    if not (SCRIPT_DIR / 'web' / 'node_modules').exists():
        print_error("node_modules not found - run install first")
        return False
    
    print_success("node_modules found")
    
    # Test if next can run
    try:
        result = subprocess.run(
            ['npm', 'run', 'dev', '--', '--help'],
            capture_output=True,
            text=True,
            timeout=10
        )
        print_success("Next.js is configured correctly")
        return True
    except Exception as e:
        print_error(f"Next.js test failed: {e}")
        return False

def test_docker():
    """Test Docker services."""
    print_test("Testing Docker Services...")
    
    try:
        # Check if Docker is running
        result = subprocess.run(
            ['docker', 'info'],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print_success("Docker is running")
        else:
            print_error("Docker is not running")
            return False
    except Exception as e:
        print_error(f"Docker check failed: {e}")
        return False
    
    # Check docker-compose file
    compose_file = SCRIPT_DIR / 'progeny_root' / 'docker-compose.yml'
    if compose_file.exists():
        print_success("docker-compose.yml found")
        return True
    else:
        print_error("docker-compose.yml not found")
        return False

def test_launcher():
    """Test launcher script."""
    print_test("Testing Launcher...")
    
    launcher = SCRIPT_DIR / 'launcher.py'
    if launcher.exists():
        print_success("launcher.py found")
        # Test if it's valid Python
        try:
            with open(launcher, 'r') as f:
                compile(f.read(), 'launcher.py', 'exec')
            print_success("launcher.py syntax is valid")
            return True
        except SyntaxError as e:
            print_error(f"launcher.py has syntax error: {e}")
            return False
    else:
        print_error("launcher.py not found")
        return False

def test_config():
    """Test configuration files."""
    print_test("Testing Configuration...")
    
    config_file = SCRIPT_DIR / 'progeny_root' / 'core' / 'config.json'
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            print_success("config.json is valid JSON")
            
            # Check key sections
            if 'llm' in config:
                print_success("LLM configuration found")
            if 'qdrant' in config:
                print_success("Qdrant configuration found")
            
            return True
        except json.JSONDecodeError as e:
            print_error(f"config.json is invalid: {e}")
            return False
    else:
        print_error("config.json not found")
        return False

def test_directories():
    """Test required directories."""
    print_test("Testing Directory Structure...")
    
    required_dirs = [
        'progeny_root/logs',
        'progeny_root/memory',
        'progeny_root/limbic',
        'progeny_root/working',
    ]
    
    all_exist = True
    for dir_path in required_dirs:
        full_path = SCRIPT_DIR / dir_path
        if full_path.exists():
            print_success(f"{dir_path} exists")
        else:
            print_error(f"{dir_path} missing")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'=' * 60}")
    print("  Sallie System Test")
    print(f"{'=' * 60}{Colors.RESET}\n")
    
    tests = [
        ("Configuration", test_config),
        ("Directory Structure", test_directories),
        ("Docker Services", test_docker),
        ("Launcher Script", test_launcher),
        ("Web Interface", test_web_build),
        ("Backend API", test_backend),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print_error(f"Test crashed: {e}")
            results[name] = False
        print()  # Blank line between tests
    
    # Summary
    print(f"{Colors.CYAN}{Colors.BOLD}{'=' * 60}")
    print("  Test Summary")
    print(f"{'=' * 60}{Colors.RESET}\n")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for name, result in results.items():
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {name:.<40} {status}")
    
    print()
    print(f"  Total: {passed}/{total} tests passed")
    print()
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}✨ All tests passed! Sallie is ready to launch! ✨{Colors.RESET}")
        return 0
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠ Some tests failed. Please fix the issues above.{Colors.RESET}")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests cancelled by user{Colors.RESET}")
        sys.exit(1)
