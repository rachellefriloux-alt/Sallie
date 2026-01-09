#!/usr/bin/env python3
"""
System Structure Check
Verifies all components are properly connected and in the right places
"""

import os
import json
from pathlib import Path
from datetime import datetime

class SystemStructureChecker:
    """Check if all system components are properly placed"""
    
    def __init__(self):
        self.base_path = Path("c:/Sallie")
        self.results = {}
        self.issues = []
        self.successes = []
        
    def check_core_directories(self):
        """Check if core directories exist"""
        print("🔍 Checking Core Directories...")
        
        required_dirs = [
            "progeny_root/core",
            "progeny_root/core/api",
            "progeny_root/core/infrastructure",
            "progeny_root/core/creative",
            "progeny_root/core/emotional",
            "progeny_root/core/intelligence",
            "progeny_root/core/communication",
            "progeny_root/core/data",
            "progeny_root/limbic",
            "mobile/src",
            "mobile/src/services",
            "mobile/src/screens",
            "web/components",
            "SallieStudioApp",
            "scripts"
        ]
        
        for dir_path in required_dirs:
            full_path = self.base_path / dir_path
            if full_path.exists():
                self.successes.append(f"✅ Directory exists: {dir_path}")
                print(f"✅ {dir_path}")
            else:
                self.issues.append(f"❌ Missing directory: {dir_path}")
                print(f"❌ {dir_path}")
    
    def check_core_files(self):
        """Check if core files exist"""
        print("\n🔍 Checking Core Files...")
        
        required_files = [
            "progeny_root/core/main.py",
            "progeny_root/core/error_handling.py",
            "progeny_root/core/stt_system.py",
            "progeny_root/core/api/discovery.py",
            "progeny_root/core/data/config.json",
            "create_qdrant_collection.py",
            "preview_server.py",
            "test_all_integrations.py",
            "test_creative_features.py",
            "mobile/package.json",
            "mobile/src/services/DiscoveryService.ts",
            "mobile/src/screens/DiscoveryScreen.tsx",
            "web/components/FirstRunWizard.tsx",
            "scripts/install.py",
            "scripts/launcher.py"
        ]
        
        for file_path in required_files:
            full_path = self.base_path / file_path
            if full_path.exists():
                self.successes.append(f"✅ File exists: {file_path}")
                print(f"✅ {file_path}")
            else:
                self.issues.append(f"❌ Missing file: {file_path}")
                print(f"❌ {file_path}")
    
    def check_mobile_structure(self):
        """Check mobile app structure"""
        print("\n🔍 Checking Mobile App Structure...")
        
        mobile_path = self.base_path / "mobile"
        
        # Check package.json
        package_json = mobile_path / "package.json"
        if package_json.exists():
            try:
                with open(package_json, 'r') as f:
                    package_data = json.load(f)
                
                # Check required dependencies
                required_deps = [
                    "react-native",
                    "react-native-camera",
                    "react-native-permissions",
                    "@react-native-community/netinfo"
                ]
                
                for dep in required_deps:
                    if dep in package_data.get("dependencies", {}):
                        self.successes.append(f"✅ Mobile dependency: {dep}")
                        print(f"✅ {dep}")
                    else:
                        self.issues.append(f"❌ Missing mobile dependency: {dep}")
                        print(f"❌ {dep}")
                
                # Check scripts
                required_scripts = ["build:android", "build:ios"]
                for script in required_scripts:
                    if script in package_data.get("scripts", {}):
                        self.successes.append(f"✅ Mobile script: {script}")
                        print(f"✅ {script}")
                    else:
                        self.issues.append(f"❌ Missing mobile script: {script}")
                        print(f"❌ {script}")
                        
            except Exception as e:
                self.issues.append(f"❌ Error reading package.json: {e}")
                print(f"❌ package.json error: {e}")
        else:
            self.issues.append("❌ Missing package.json")
            print("❌ package.json")
        
        # Check TypeScript files
        ts_files = [
            "mobile/src/services/DiscoveryService.ts",
            "mobile/src/screens/DiscoveryScreen.tsx"
        ]
        
        for ts_file in ts_files:
            full_path = self.base_path / ts_file
            if full_path.exists():
                self.successes.append(f"✅ TypeScript file: {ts_file}")
                print(f"✅ {ts_file}")
            else:
                self.issues.append(f"❌ Missing TypeScript file: {ts_file}")
                print(f"❌ {ts_file}")
    
    def check_web_components(self):
        """Check web components"""
        print("\n🔍 Checking Web Components...")
        
        web_files = [
            "web/components/FirstRunWizard.tsx",
            "web/components/ConvergenceExperience.tsx",
            "web/components/DreamStateInterface.tsx",
            "web/components/Avatar3DViewer.tsx"
        ]
        
        for web_file in web_files:
            full_path = self.base_path / web_file
            if full_path.exists():
                self.successes.append(f"✅ Web component: {web_file}")
                print(f"✅ {web_file}")
            else:
                self.issues.append(f"❌ Missing web component: {web_file}")
                print(f"❌ {web_file}")
    
    def check_desktop_app(self):
        """Check desktop application"""
        print("\n🔍 Checking Desktop Application...")
        
        desktop_files = [
            "SallieStudioApp/SallieStudioApp.csproj",
            "SallieStudioApp/MainWindow.xaml",
            "SallieStudioApp/ConvergencePage.xaml",
            "SallieStudioApp/AvatarPage.xaml"
        ]
        
        for desktop_file in desktop_files:
            full_path = self.base_path / desktop_file
            if full_path.exists():
                self.successes.append(f"✅ Desktop file: {desktop_file}")
                print(f"✅ {desktop_file}")
            else:
                self.issues.append(f"❌ Missing desktop file: {desktop_file}")
                print(f"❌ {desktop_file}")
    
    def check_api_endpoints(self):
        """Check API endpoints are properly defined"""
        print("\n🔍 Checking API Endpoints...")
        
        # Check main.py for endpoints
        main_py = self.base_path / "progeny_root/core/main.py"
        if main_py.exists():
            try:
                with open(main_py, 'r') as f:
                    content = f.read()
                
                required_endpoints = [
                    "@app.get(\"/health\")",
                    "@app.post(\"/chat\")",
                    "@app.post(\"/stt/transcribe\")",
                    "@app.get(\"/stt/status\")"
                ]
                
                # Check for discovery router
                if "include_router(discovery_router" in content:
                    self.successes.append("✅ Discovery router included")
                    print("✅ Discovery router included")
                else:
                    self.issues.append("❌ Discovery router not included")
                    print("❌ Discovery router not included")
                
                for endpoint in required_endpoints:
                    if endpoint in content:
                        self.successes.append(f"✅ API endpoint: {endpoint}")
                        print(f"✅ {endpoint}")
                    else:
                        self.issues.append(f"❌ Missing API endpoint: {endpoint}")
                        print(f"❌ {endpoint}")
                        
            except Exception as e:
                self.issues.append(f"❌ Error reading main.py: {e}")
                print(f"❌ main.py error: {e}")
        else:
            self.issues.append("❌ Missing main.py")
            print("❌ main.py")
    
    def check_config_files(self):
        """Check configuration files"""
        print("\n🔍 Checking Configuration Files...")
        
        config_files = [
            ("progeny_root/core/data/config.json", "Main config"),
            ("create_qdrant_collection.py", "Qdrant setup"),
            ("preview_server.py", "Preview server")
        ]
        
        for config_file, description in config_files:
            full_path = self.base_path / config_file
            if full_path.exists():
                self.successes.append(f"✅ {description}: {config_file}")
                print(f"✅ {description}")
            else:
                self.issues.append(f"❌ Missing {description}: {config_file}")
                print(f"❌ {description}")
    
    def check_services_running(self):
        """Check if services are properly configured"""
        print("\n🔍 Checking Service Configuration...")
        
        # Check if preview server is running
        try:
            import requests
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                self.successes.append("✅ Preview server is running")
                print("✅ Preview server running")
            else:
                self.issues.append("❌ Preview server not responding correctly")
                print("❌ Preview server not responding")
        except:
            self.issues.append("❌ Preview server not running")
            print("❌ Preview server not running")
        
        # Check Ollama
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                self.successes.append("✅ Ollama is running")
                print("✅ Ollama running")
            else:
                self.issues.append("❌ Ollama not responding correctly")
                print("❌ Ollama not responding")
        except:
            self.issues.append("❌ Ollama not running")
            print("❌ Ollama not running")
        
        # Check Qdrant
        try:
            response = requests.get("http://localhost:6333/", timeout=2)
            if response.status_code == 200:
                self.successes.append("✅ Qdrant is running")
                print("✅ Qdrant running")
            else:
                self.issues.append("❌ Qdrant not responding correctly")
                print("❌ Qdrant not responding")
        except:
            self.issues.append("❌ Qdrant not running")
            print("❌ Qdrant not running")
    
    def generate_report(self):
        """Generate comprehensive report"""
        print("\n" + "=" * 60)
        print("📊 SYSTEM STRUCTURE REPORT")
        print("=" * 60)
        
        total_issues = len(self.issues)
        total_successes = len(self.successes)
        
        print(f"✅ Successful: {total_successes}")
        print(f"❌ Issues: {total_issues}")
        print(f"📊 Total Checked: {total_issues + total_successes}")
        
        if total_issues == 0:
            print("\n🎉 ALL SYSTEMS PROPERLY CONNECTED!")
            print("✅ Everything is in the right place")
        else:
            print(f"\n⚠️ {total_issues} issues found")
            print("\nIssues:")
            for issue in self.issues:
                print(f"  {issue}")
        
        print("\n" + "=" * 60)
        
        # Save detailed report
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "total_successes": total_successes,
            "total_issues": total_issues,
            "successes": self.successes,
            "issues": self.issues,
            "status": "complete" if total_issues == 0 else "issues_found"
        }
        
        report_path = self.base_path / "system_structure_report.json"
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_path}")
        
        return report_data

def main():
    """Main checker"""
    print("🔍 SALLIE SYSTEM STRUCTURE CHECK")
    print("=" * 60)
    
    checker = SystemStructureChecker()
    
    # Run all checks
    checker.check_core_directories()
    checker.check_core_files()
    checker.check_mobile_structure()
    checker.check_web_components()
    checker.check_desktop_app()
    checker.check_api_endpoints()
    checker.check_config_files()
    checker.check_services_running()
    
    # Generate report
    report = checker.generate_report()
    
    return report

if __name__ == "__main__":
    main()
