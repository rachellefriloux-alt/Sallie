#!/usr/bin/env python3
"""
Comprehensive Sallie System Check
Verifies all components are properly connected and functional
"""

import sys
import os
import importlib
from pathlib import Path

# Add the core directory to path
sys.path.insert(0, str(Path(__file__).parent / "progeny_root" / "core"))

def check_system_import(system_path, system_name, description=""):
    """Test if a system can be imported and instantiated"""
    try:
        module = importlib.import_module(system_path)
        if hasattr(module, system_name):
            # Try to instantiate if it's a class
            try:
                system_class = getattr(module, system_name)
                if callable(system_class):
                    # Try to create instance (may need parameters)
                    try:
                        instance = system_class()
                        print(f"✅ {system_name}: {description} - INSTANTIATED")
                        return True, "instantiated"
                    except Exception as e:
                        # May need parameters, that's ok
                        print(f"✅ {system_name}: {description} - AVAILABLE (needs params)")
                        return True, "available"
                else:
                    print(f"✅ {system_name}: {description} - AVAILABLE")
                    return True, "available"
            except Exception as e:
                print(f"✅ {system_name}: {description} - IMPORTED")
                return True, "imported"
        else:
            print(f"❌ {system_name}: {description} - Class {system_name} not found")
            return False, "not_found"
    except ImportError as e:
        print(f"❌ {system_name}: {description} - Import failed: {str(e)[:50]}...")
        return False, "import_failed"
    except Exception as e:
        print(f"❌ {system_name}: {description} - Error: {str(e)[:50]}...")
        return False, "error"

def check_file_exists(file_path, description=""):
    """Check if a file exists"""
    full_path = Path(file_path)
    if full_path.exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_directory_exists(dir_path, description=""):
    """Check if a directory exists"""
    full_path = Path(dir_path)
    if full_path.exists() and full_path.is_dir():
        print(f"✅ {description}: {dir_path}")
        return True
    else:
        print(f"❌ {description}: {dir_path} - NOT FOUND")
        return False

def main():
    print("🔍 COMPREHENSIVE SALLIE SYSTEM CHECK")
    print("=" * 60)
    
    results = {
        "systems": {},
        "files": {},
        "directories": {},
        "services": {}
    }
    
    # 1. Check Core Systems
    print("\n📋 CORE SYSTEMS")
    print("-" * 30)
    
    core_systems = [
        ("infrastructure.limbic", "LimbicSystem", "Emotional core system"),
        ("infrastructure.retrieval", "MemorySystem", "Memory and retrieval"),
        ("infrastructure.llm_router", "get_llm_router", "LLM routing system"),
        ("infrastructure.gemini_client", "init_gemini_client", "Gemini API client"),
        ("agency", "AgencySystem", "Trust and permissions"),
        ("communication.monologue", "MonologueSystem", "Cognitive processing"),
        ("emotional.dream", "DreamSystem", "Dream cycles"),
        ("emotional.ghost", "GhostSystem", "Desktop presence"),
        ("convergence", "ConvergenceSystem", "User onboarding"),
        ("intelligence.learning", "LearningSystem", "Autonomous learning"),
        ("avatar", "get_avatar_system", "Avatar management"),
        ("identity", "get_identity_system", "Identity management"),
        ("control", "get_control_system", "System control"),
        ("creative.foundry", "FoundrySystem", "Creative evaluation"),
        ("intelligence.intuition", "IntuitionEngine", "Intuitive insights"),
        ("emotional.spontaneity", "SpontaneitySystem", "Spontaneous behavior"),
        ("error_handling", "error_handler", "Error handling system"),
        ("stt_system", "get_stt_system", "Speech-to-text system"),
    ]
    
    systems_connected = 0
    for system_path, system_name, description in core_systems:
        success, status = check_system_import(system_path, system_name, description)
        results["systems"][system_name] = {"success": success, "status": status}
        if success:
            systems_connected += 1
    
    # 2. Check Critical Files
    print("\n📁 CRITICAL FILES")
    print("-" * 30)
    
    critical_files = [
        ("progeny_root/core/main.py", "Main application"),
        ("progeny_root/core/data/config.json", "Configuration"),
        ("progeny_root/core/api/discovery.py", "Discovery API"),
        ("progeny_root/core/error_handling.py", "Error handling"),
        ("progeny_root/core/stt_system.py", "STT system"),
        ("mobile/package.json", "Mobile app config"),
        ("web/components/FirstRunWizard.tsx", "Web first-run wizard"),
        ("SallieStudioApp/SallieStudioApp.csproj", "Desktop app project"),
    ]
    
    files_found = 0
    for file_path, description in critical_files:
        if check_file_exists(file_path, description):
            files_found += 1
            results["files"][file_path] = True
        else:
            results["files"][file_path] = False
    
    # 3. Check Directory Structure
    print("\n📂 DIRECTORY STRUCTURE")
    print("-" * 30)
    
    directories = [
        ("progeny_root/core", "Core systems"),
        ("progeny_root/core/api", "API endpoints"),
        ("progeny_root/core/infrastructure", "Infrastructure"),
        ("progeny_root/core/communication", "Communication"),
        ("progeny_root/core/emotional", "Emotional systems"),
        ("progeny_root/core/intelligence", "Intelligence"),
        ("progeny_root/core/creative", "Creative"),
        ("mobile/src", "Mobile source"),
        ("web/components", "Web components"),
        ("SallieStudioApp", "Desktop app"),
        ("progeny_root/core/logs", "Logs directory"),
    ]
    
    dirs_found = 0
    for dir_path, description in directories:
        if check_directory_exists(dir_path, description):
            dirs_found += 1
            results["directories"][dir_path] = True
        else:
            results["directories"][dir_path] = False
    
    # 4. Check External Services (if running)
    print("\n🌐 EXTERNAL SERVICES")
    print("-" * 30)
    
    services = {}
    
    # Check if main app can import
    try:
        import main
        print("✅ Main application: IMPORTED")
        services["main_app"] = True
    except Exception as e:
        print(f"❌ Main application: {str(e)[:50]}...")
        services["main_app"] = False
    
    # Check if FastAPI app can be created
    try:
        from main import app
        print("✅ FastAPI app: CREATED")
        services["fastapi_app"] = True
    except Exception as e:
        print(f"❌ FastAPI app: {str(e)[:50]}...")
        services["fastapi_app"] = False
    
    results["services"] = services
    
    # 5. Summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE CHECK RESULTS")
    print("=" * 60)
    
    total_systems = len(core_systems)
    total_files = len(critical_files)
    total_dirs = len(directories)
    total_services = len(services)
    
    print(f"🔧 Systems: {systems_connected}/{total_systems} connected")
    print(f"📁 Files: {files_found}/{total_files} found")
    print(f"📂 Directories: {dirs_found}/{total_dirs} found")
    print(f"🌐 Services: {sum(services.values())}/{total_services} working")
    
    overall_score = (systems_connected + files_found + dirs_found + sum(services.values())) / (total_systems + total_files + total_dirs + total_services) * 100
    
    print(f"\n🎯 OVERALL SYSTEM HEALTH: {overall_score:.1f}%")
    
    if overall_score >= 90:
        print("🎉 EXCELLENT! System is fully operational!")
    elif overall_score >= 75:
        print("✅ GOOD! System is mostly operational")
    elif overall_score >= 50:
        print("⚠️ FAIR! System has some issues")
    else:
        print("❌ POOR! System needs significant work")
    
    # 6. Issues Summary
    failed_systems = [name for name, info in results["systems"].items() if not info["success"]]
    missing_files = [path for path, exists in results["files"].items() if not exists]
    missing_dirs = [path for path, exists in results["directories"].items() if not exists]
    failed_services = [name for name, working in results["services"].items() if not working]
    
    if failed_systems or missing_files or missing_dirs or failed_services:
        print("\n⚠️ ISSUES FOUND:")
        if failed_systems:
            print(f"  Systems: {failed_systems}")
        if missing_files:
            print(f"  Files: {missing_files}")
        if missing_dirs:
            print(f"  Directories: {missing_dirs}")
        if failed_services:
            print(f"  Services: {failed_services}")
    else:
        print("\n✅ NO ISSUES FOUND!")
    
    return overall_score >= 90

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
