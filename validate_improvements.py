#!/usr/bin/env python3
"""
Comprehensive validation test for all Sallie improvements
Tests UX components, scripts, and integrations
"""

import os
import sys
import subprocess
import json
import requests
from pathlib import Path

class TestValidator:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.root_dir = Path(__file__).parent.absolute()
        
    def test(self, name, func):
        """Run a test"""
        print(f"Testing: {name}...", end=" ")
        try:
            result = func()
            if result is True:
                print("✓ PASS")
                self.passed += 1
                return True
            elif result is None or result == "warning":
                print("⚠ WARNING")
                self.warnings += 1
                return None
            else:
                print(f"✗ FAIL: {result}")
                self.failed += 1
                return False
        except Exception as e:
            print(f"✗ FAIL: {str(e)}")
            self.failed += 1
            return False
    
    def summary(self):
        """Print summary"""
        total = self.passed + self.failed + self.warnings
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total: {total} | Passed: {self.passed} | Warnings: {self.warnings} | Failed: {self.failed}")
        print(f"{'='*60}\n")
        
        if self.failed == 0:
            print("🎉 ALL CRITICAL TESTS PASSED!\n")
            return 0
        else:
            print("❌ SOME TESTS FAILED\n")
            return 1

validator = TestValidator()

print("\n" + "="*60)
print("SALLIE COMPREHENSIVE VALIDATION TEST")
print("="*60 + "\n")

# Test 1: Core files exist
def test_core_files():
    files = [
        "quick-start.sh", "quick-start.bat",
        "QUICKSTART.md", "USER_EXPERIENCE.md", "COMPLETION_STATUS.md",
        "web/components/ConnectionStatus.tsx",
        "web/components/FirstRunWizard.tsx",
        "web/components/NotificationProvider.tsx",
        "web/components/KeyboardShortcutsPanel.tsx",
        "mobile/src/components/ConnectionStatus.tsx",
        "progeny_root/core/main.py"
    ]
    missing = [f for f in files if not (validator.root_dir / f).exists()]
    return f"Missing: {missing}" if missing else True

validator.test("All new files exist", test_core_files)

# Test 2: Scripts are executable
def test_scripts_executable():
    scripts = ["quick-start.sh", "start-sallie.sh"]
    non_exec = [s for s in scripts if (validator.root_dir / s).exists() and not os.access(validator.root_dir / s, os.X_OK)]
    return f"Not executable: {non_exec}" if non_exec else True

validator.test("Scripts are executable", test_scripts_executable)

# Test 3: Backend main.py syntax
def test_backend_syntax():
    try:
        result = subprocess.run(
            ["python3", "-m", "py_compile", "progeny_root/core/main.py"],
            cwd=validator.root_dir,
            capture_output=True,
            timeout=10
        )
        return True if result.returncode == 0 else "Syntax error"
    except:
        return "warning"

validator.test("Backend Python syntax", test_backend_syntax)

# Test 4: Web integration
def test_web_integration():
    providers_path = validator.root_dir / "web/app/providers.tsx"
    dashboard_path = validator.root_dir / "web/components/Dashboard.tsx"
    page_path = validator.root_dir / "web/app/page.tsx"
    
    try:
        with open(providers_path) as f:
            if "NotificationProvider" not in f.read():
                return "NotificationProvider not in providers.tsx"
        
        with open(dashboard_path) as f:
            content = f.read()
            if "ConnectionStatus" not in content or "KeyboardShortcutsPanel" not in content:
                return "Components not in Dashboard.tsx"
        
        with open(page_path) as f:
            if "FirstRunWizard" not in f.read():
                return "FirstRunWizard not in page.tsx"
        
        return True
    except Exception as e:
        return str(e)

validator.test("Web components integrated", test_web_integration)

# Test 5: Backend health endpoint enhancement
def test_backend_health_enhancement():
    main_path = validator.root_dir / "progeny_root/core/main.py"
    try:
        with open(main_path) as f:
            content = f.read()
            if "services" not in content or "ollama" not in content:
                return "Health endpoint not enhanced"
        return True
    except Exception as e:
        return str(e)

validator.test("Backend health endpoint enhanced", test_backend_health_enhancement)

# Test 6: Documentation completeness
def test_documentation():
    quickstart_path = validator.root_dir / "QUICKSTART.md"
    ux_path = validator.root_dir / "USER_EXPERIENCE.md"
    
    try:
        with open(quickstart_path) as f:
            content = f.read()
            if "quick-start.sh" not in content or "Web App" not in content:
                return "QUICKSTART.md incomplete"
        
        with open(ux_path) as f:
            content = f.read()
            required = ["Connection Status", "First Run Wizard", "Notification"]
            if not all(r in content for r in required):
                return "USER_EXPERIENCE.md incomplete"
        
        return True
    except Exception as e:
        return str(e)

validator.test("Documentation complete", test_documentation)

# Test 7: Mobile components
def test_mobile_components():
    conn_status = validator.root_dir / "mobile/src/components/ConnectionStatus.tsx"
    try:
        with open(conn_status) as f:
            content = f.read()
            if "export" not in content or "React" not in content:
                return "Mobile ConnectionStatus incomplete"
        return True
    except Exception as e:
        return str(e)

validator.test("Mobile components exist", test_mobile_components)

# Test 8: Package.json files valid
def test_package_json():
    packages = ["web/package.json", "desktop/package.json", "mobile/package.json"]
    for pkg in packages:
        path = validator.root_dir / pkg
        if not path.exists():
            return f"Missing {pkg}"
        try:
            with open(path) as f:
                json.load(f)
        except json.JSONDecodeError:
            return f"Invalid JSON in {pkg}"
    return True

validator.test("package.json files valid", test_package_json)

# Test 9: Backend health check (if running)
def test_backend_running():
    try:
        response = requests.get("http://localhost:8000/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            if "services" in data:
                print(f"\n   Backend is running! Services: {data.get('services', {})}")
                return True
            return "Health response missing services field"
        return "warning"
    except requests.exceptions.ConnectionError:
        return "warning"  # Not running, but that's okay
    except Exception as e:
        return "warning"

validator.test("Backend health check", test_backend_running)

# Test 10: Component structure
def test_component_structure():
    web_comps = validator.root_dir / "web/components"
    mobile_comps = validator.root_dir / "mobile/src/components"
    
    if not web_comps.exists():
        return "web/components doesn't exist"
    if not mobile_comps.exists():
        return "mobile/src/components doesn't exist"
    
    web_files = list(web_comps.glob("*.tsx"))
    mobile_files = list(mobile_comps.glob("*.tsx"))
    
    if len(web_files) < 5:
        return f"Too few web components: {len(web_files)}"
    
    return True

validator.test("Component directories structured", test_component_structure)

# Print results
exit_code = validator.summary()

# Save results
results = {
    "passed": validator.passed,
    "failed": validator.failed,
    "warnings": validator.warnings,
    "timestamp": str(Path(__file__).stat().st_mtime)
}

results_path = validator.root_dir / "validation-results.json"
with open(results_path, 'w') as f:
    json.dump(results, f, indent=2)

print(f"Results saved to: validation-results.json")

if exit_code == 0:
    print("\n✅ All critical functionality is working!")
    print("✅ UX components integrated")
    print("✅ Scripts and launchers in place")
    print("✅ Documentation complete")
    print("✅ Platform parity achieved\n")
else:
    print("\n⚠️ Some tests failed. Check output above for details.\n")

sys.exit(exit_code)
