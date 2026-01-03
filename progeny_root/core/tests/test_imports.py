#!/usr/bin/env python3
"""Test basic imports to identify what's broken."""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_import(module_name, description):
    """Test if a module imports successfully."""
    try:
        exec(f"from {module_name} import *")
        print(f"✅ {description}")
        return True
    except Exception as e:
        print(f"❌ {description}: {e}")
        return False

# Test core systems
print("Testing Core Systems...")
test_import("limbic", "Limbic System (Emotions)")
test_import("performance", "Performance System")
test_import("utils", "Utilities")
test_import("gemini_client", "Gemini Client")
test_import("llm_router", "LLM Router")

print("\nTesting Cognitive Systems...")
test_import("retrieval", "Memory/Retrieval System")
test_import("agency", "Agency/Safety System")
test_import("perception", "Perception System")

print("\nTesting Advanced Systems...")
test_import("synthesis", "Synthesis System")
test_import("monologue", "Monologue System")

print("\nTesting Main App...")
try:
    from fastapi import FastAPI
    print("✅ FastAPI available")
    
    # Try to create a minimal app
    app = FastAPI()
    print("✅ Can create FastAPI app")
    
    # Try to import main
    # from main import app
    # print("✅ Main app imports")
    
except Exception as e:
    print(f"❌ FastAPI issue: {e}")

print("\nDone!")
