#!/usr/bin/env python3
"""
Final System Connection Verification
Verifies all Sallie systems are properly connected
"""

import sys
import importlib
from pathlib import Path

def test_system_import(system_path, system_name):
    """Test if a system can be imported"""
    try:
        module = importlib.import_module(system_path)
        if hasattr(module, system_name):
            print(f"✅ {system_name}: Available")
            return True
        else:
            print(f"❌ {system_name}: Class {system_name} not found")
            return False
    except ImportError as e:
        print(f"❌ {system_name}: Import failed - {e}")
        return False

def main():
    print("🔍 SALLIE SYSTEM CONNECTION VERIFICATION")
    print("=" * 50)
    
    # Test all core systems
    systems = [
        ("infrastructure.limbic", "LimbicSystem"),
        ("infrastructure.retrieval", "MemorySystem"),
        ("agency", "AgencySystem"),
        ("communication.monologue", "MonologueSystem"),
        ("emotional.dream", "DreamSystem"),
        ("emotional.ghost", "GhostSystem"),
        ("convergence", "ConvergenceSystem"),
        ("intelligence.learning", "LearningSystem"),
        ("avatar", "get_avatar_system"),
        ("identity", "get_identity_system"),
        ("control", "get_control_system"),
        ("creative.foundry", "FoundrySystem"),
        ("intelligence.intuition", "IntuitionEngine"),
        ("emotional.spontaneity", "SpontaneitySystem"),
    ]
    
    connected = 0
    total = len(systems)
    
    for system_path, system_name in systems:
        if test_system_import(system_path, system_name):
            connected += 1
    
    print("\n" + "=" * 50)
    print(f"📊 CONNECTION RESULTS: {connected}/{total} Systems Connected")
    
    if connected == total:
        print("🎉 ALL SYSTEMS SUCCESSFULLY CONNECTED!")
        return True
    else:
        print(f"⚠️ {total - connected} systems still need connection")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
