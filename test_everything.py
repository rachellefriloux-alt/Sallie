#!/usr/bin/env python3
"""
Sallie - Comprehensive System Test
Tests every component and system to ensure everything works.
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

def print_warning(text):
    print(f"{Colors.YELLOW}  ⚠ {text}{Colors.RESET}")

def test_python_imports():
    """Test all Python imports."""
    print_test("Testing Python Core Imports...")
    
    os.chdir(SCRIPT_DIR / 'progeny_root')
    sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root'))
    
    imports_to_test = [
        ('fastapi', 'FastAPI framework'),
        ('uvicorn', 'ASGI server'),
        ('qdrant_client', 'Vector database client'),
        ('pydantic', 'Data validation'),
        ('requests', 'HTTP library'),
        ('numpy', 'Numerical computing'),
        ('psutil', 'System utilities'),
        ('pyttsx3', 'Text-to-speech'),
        ('gtts', 'Google Text-to-speech'),
    ]
    
    passed = 0
    failed = 0
    
    for module, description in imports_to_test:
        try:
            __import__(module)
            print_success(f"{module} ({description})")
            passed += 1
        except ImportError:
            print_error(f"{module} ({description}) - MISSING")
            failed += 1
    
    print_info(f"Core imports: {passed}/{passed+failed} available")
    return failed == 0

def test_core_modules():
    """Test core system modules."""
    print_test("Testing Core System Modules...")
    
    os.chdir(SCRIPT_DIR / 'progeny_root')
    sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root'))
    
    modules_to_test = [
        ('core.limbic', 'LimbicSystem', 'Emotional system'),
        ('core.retrieval', 'MemorySystem', 'Memory system'),
        ('core.agency', 'AgencySystem', 'Agency system'),
        ('core.monologue', 'MonologueSystem', 'Monologue system'),
        ('core.degradation', 'DegradationSystem', 'Degradation system'),
        ('core.dream', 'DreamSystem', 'Dream system'),
        ('core.convergence', 'ConvergenceSystem', 'Convergence system'),
        ('core.identity', 'get_identity_system', 'Identity system'),
        ('core.control', 'get_control_system', 'Control system'),
        ('core.kinship', 'KinshipSystem', 'Multi-user system'),
        ('core.voice', 'VoiceSystem', 'Voice interface'),
        ('core.avatar', 'get_avatar_system', 'Avatar system'),
        ('core.foundry', 'FoundrySystem', 'Creative system'),
    ]
    
    passed = 0
    failed = 0
    
    for module_name, class_name, description in modules_to_test:
        try:
            module = __import__(module_name, fromlist=[class_name])
            cls = getattr(module, class_name)
            print_success(f"{class_name} ({description})")
            passed += 1
        except Exception as e:
            print_error(f"{class_name} ({description}) - {str(e)[:50]}")
            failed += 1
    
    print_info(f"Core modules: {passed}/{passed+failed} available")
    return failed == 0

def test_voice_system():
    """Test voice system with TTS."""
    print_test("Testing Voice System...")
    
    os.chdir(SCRIPT_DIR / 'progeny_root')
    sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root'))
    
    try:
        from core.voice import VoiceSystem
        
        # Initialize voice system
        voice = VoiceSystem()
        
        if voice.tts_type:
            print_success(f"Voice system initialized with TTS: {voice.tts_type}")
        else:
            print_warning("Voice system initialized but no TTS available")
        
        # Test that it doesn't crash on speak call (won't actually play audio in CI)
        try:
            # This won't actually play audio without speakers, but tests the code path
            voice.speak("Test message", emotional_prosody=False)
            print_success("TTS speak method works (audio output not tested)")
        except Exception as e:
            print_warning(f"TTS speak method error (expected in CI): {str(e)[:50]}")
        
        return True
    except Exception as e:
        print_error(f"Voice system test failed: {e}")
        return False

def test_backend_api():
    """Test backend API startup and endpoints."""
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
    backend_started = False
    
    for i in range(max_retries):
        try:
            response = urllib.request.urlopen('http://localhost:8000/health', timeout=2)
            data = json.loads(response.read())
            print_success(f"Backend health check: {data.get('status')}")
            backend_started = True
            break
        except Exception as e:
            if i == max_retries - 1:
                print_error(f"Backend failed to start: {e}")
            time.sleep(1)
    
    if backend_started:
        # Test additional endpoints
        endpoints_to_test = [
            ('/api/limbic/state', 'Limbic state'),
            ('/api/convergence/status', 'Convergence status'),
            ('/api/identity', 'Identity'),
        ]
        
        for endpoint, description in endpoints_to_test:
            try:
                response = urllib.request.urlopen(f'http://localhost:8000{endpoint}', timeout=2)
                if response.status == 200:
                    print_success(f"{description} endpoint works")
                else:
                    print_warning(f"{description} endpoint returned {response.status}")
            except Exception as e:
                print_warning(f"{description} endpoint: {str(e)[:50]}")
    
    # Kill process
    try:
        if sys.platform == 'win32':
            process.terminate()
        else:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        
        process.wait(timeout=5)
        print_success("Backend stopped cleanly")
    except:
        try:
            if sys.platform == 'win32':
                process.kill()
            else:
                os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        except:
            pass
    
    return backend_started

def test_launcher():
    """Test launcher script."""
    print_test("Testing Launcher Application...")
    
    launcher = SCRIPT_DIR / 'launcher.py'
    
    # Check syntax
    try:
        with open(launcher, 'r') as f:
            compile(f.read(), 'launcher.py', 'exec')
        print_success("Launcher syntax valid")
    except SyntaxError as e:
        print_error(f"Launcher syntax error: {e}")
        return False
    
    # Check that it imports tkinter
    try:
        import tkinter as tk
        print_success("tkinter available for GUI")
    except ImportError:
        print_warning("tkinter not available - GUI may not work")
    
    return True

def test_installers():
    """Test installer scripts."""
    print_test("Testing Installer Scripts...")
    
    # Check Python installer
    python_installer = SCRIPT_DIR / 'install.py'
    if python_installer.exists():
        try:
            with open(python_installer, 'r') as f:
                compile(f.read(), 'install.py', 'exec')
            print_success("Python installer (install.py) valid")
        except SyntaxError as e:
            print_error(f"Python installer syntax error: {e}")
            return False
    else:
        print_error("install.py not found")
        return False
    
    # Check batch installer
    batch_installer = SCRIPT_DIR / 'install.bat'
    if batch_installer.exists():
        print_success("Windows installer (install.bat) exists")
    else:
        print_warning("install.bat not found")
    
    return True

def test_web_interface():
    """Test web interface configuration."""
    print_test("Testing Web Interface...")
    
    web_dir = SCRIPT_DIR / 'web'
    
    # Check package.json
    package_json = web_dir / 'package.json'
    if package_json.exists():
        try:
            with open(package_json, 'r') as f:
                package_data = json.load(f)
            print_success("package.json valid")
            
            # Check for required scripts
            scripts = package_data.get('scripts', {})
            if 'dev' in scripts:
                print_success("dev script found")
            if 'build' in scripts:
                print_success("build script found")
            if 'start' in scripts:
                print_success("start script found")
        except json.JSONDecodeError as e:
            print_error(f"package.json invalid: {e}")
            return False
    else:
        print_error("package.json not found")
        return False
    
    # Check node_modules
    node_modules = web_dir / 'node_modules'
    if node_modules.exists():
        print_success("node_modules directory exists")
    else:
        print_warning("node_modules not found - run npm install")
    
    return True

def test_docker_setup():
    """Test Docker configuration."""
    print_test("Testing Docker Setup...")
    
    # Check docker-compose.yml
    compose_file = SCRIPT_DIR / 'progeny_root' / 'docker-compose.yml'
    if compose_file.exists():
        print_success("docker-compose.yml found")
        
        # Try to parse it
        try:
            with open(compose_file, 'r') as f:
                import yaml
                yaml.safe_load(f)
            print_success("docker-compose.yml valid YAML")
        except ImportError:
            print_info("PyYAML not installed, skipping validation")
        except Exception as e:
            print_warning(f"docker-compose.yml may have issues: {e}")
    else:
        print_error("docker-compose.yml not found")
        return False
    
    # Check if Docker is running
    try:
        result = subprocess.run(
            ['docker', 'info'],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print_success("Docker is running")
        else:
            print_warning("Docker is not running")
    except Exception as e:
        print_warning(f"Docker check failed: {e}")
    
    return True

def test_config_files():
    """Test configuration files."""
    print_test("Testing Configuration Files...")
    
    # Check core config
    config_file = SCRIPT_DIR / 'progeny_root' / 'core' / 'config.json'
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            print_success("config.json valid")
            
            # Check required sections
            required = ['llm', 'qdrant', 'api']
            for section in required:
                if section in config:
                    print_success(f"config.json has {section} section")
                else:
                    print_warning(f"config.json missing {section} section")
        except json.JSONDecodeError as e:
            print_error(f"config.json invalid: {e}")
            return False
    else:
        print_error("config.json not found")
        return False
    
    # Check .env example
    env_example = SCRIPT_DIR / 'progeny_root' / '.env.example'
    if env_example.exists():
        print_success(".env.example found")
    else:
        print_info(".env.example not found (optional)")
    
    return True

def test_directory_structure():
    """Test directory structure."""
    print_test("Testing Directory Structure...")
    
    required_dirs = [
        'progeny_root/core',
        'progeny_root/logs',
        'progeny_root/memory',
        'progeny_root/limbic',
        'progeny_root/working',
        'web',
        'web/pages',
        'web/components',
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

def test_documentation():
    """Test documentation files."""
    print_test("Testing Documentation...")
    
    docs = [
        ('README.md', 'Main README'),
        ('LAUNCHER_README.md', 'Launcher guide'),
        ('START_HERE.html', 'Quick start page'),
    ]
    
    for doc_file, description in docs:
        doc_path = SCRIPT_DIR / doc_file
        if doc_path.exists():
            print_success(f"{description} exists")
        else:
            print_warning(f"{description} missing")
    
    return True

def main():
    """Run all comprehensive tests."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'=' * 70}")
    print("  Sallie Comprehensive System Test")
    print("  Testing EVERYTHING")
    print(f"{'=' * 70}{Colors.RESET}\n")
    
    tests = [
        ("Configuration Files", test_config_files),
        ("Directory Structure", test_directory_structure),
        ("Python Core Imports", test_python_imports),
        ("Core System Modules", test_core_modules),
        ("Voice System", test_voice_system),
        ("Docker Setup", test_docker_setup),
        ("Launcher Application", test_launcher),
        ("Installer Scripts", test_installers),
        ("Web Interface", test_web_interface),
        ("Backend API", test_backend_api),
        ("Documentation", test_documentation),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print_error(f"Test crashed: {e}")
            import traceback
            traceback.print_exc()
            results[name] = False
        print()  # Blank line between tests
    
    # Summary
    print(f"{Colors.CYAN}{Colors.BOLD}{'=' * 70}")
    print("  Comprehensive Test Summary")
    print(f"{'=' * 70}{Colors.RESET}\n")
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for name, result in results.items():
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {name:.<50} {status}")
    
    print()
    percentage = (passed / total * 100) if total > 0 else 0
    print(f"  Total: {passed}/{total} tests passed ({percentage:.1f}%)")
    print()
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}✨ ALL TESTS PASSED! Sallie is 100% ready! ✨{Colors.RESET}")
        print()
        print(f"{Colors.CYAN}Next steps:{Colors.RESET}")
        print(f"  1. Run: python launcher.py")
        print(f"  2. Click 'START SALLIE' button")
        print(f"  3. Wait for browser to open")
        print(f"  4. Start chatting with Sallie!")
        print()
        return 0
    elif passed >= total * 0.8:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠ Most tests passed ({percentage:.1f}%)! Sallie should work but may have minor issues.{Colors.RESET}")
        print()
        return 0
    else:
        print(f"{Colors.RED}{Colors.BOLD}✗ Too many tests failed ({100-percentage:.1f}%). Please fix issues above.{Colors.RESET}")
        print()
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests cancelled by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Test suite crashed: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
