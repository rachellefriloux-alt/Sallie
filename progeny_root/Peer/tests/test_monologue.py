import sys
import os
import json
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.limbic import LimbicSystem
from core.retrieval import MemorySystem
from core.monologue import MonologueSystem

def test_monologue():
    print("=== Testing Monologue System ===")
    
    # 1. Initialize Dependencies
    print("Initializing Subsystems...")
    limbic = LimbicSystem()
    # Use a temporary collection for testing to avoid polluting main DB
    # Note: MemorySystem init signature might differ, let's check
    memory = MemorySystem(use_local_storage=True) 
    
    # 2. Initialize Monologue
    monologue = MonologueSystem(limbic, memory)
    
    # Mock the LLM Client for testing without Ollama
    class MockClient:
        def chat(self, system_prompt, user_prompt, model=None):
            sys_p = system_prompt.lower()
            if "perception" in sys_p or "urgency" in sys_p:
                return json.dumps({"urgency": 0.5, "load": 0.2, "sentiment": 0.1})
            if "divergent" in sys_p:
                return json.dumps({"options": [{"id": "A", "content": "Test Option", "style": "Direct"}]})
            # Default to Convergent/INFJ
            return json.dumps({"selected_option_id": "A", "rationale": "Test"})
            
    monologue.llm_client = MockClient()
    
    # 3. Run Process
    user_input = "I'm feeling a bit overwhelmed with all this work."
    print(f"\nProcessing Input: '{user_input}'")
    
    result = monologue.process(user_input)
    
    # 4. Verify Output Structure
    print("\n--- Verifying Result Structure ---")
    print(f"Timestamp: {result.get('timestamp')}")
    
    perception = result.get("perception", {})
    print(f"Perception: {json.dumps(perception, indent=2)}")
    assert "urgency" in perception
    assert "sentiment" in perception
    
    options = result.get("options", {})
    print(f"Options Generated: {len(options.get('options', []))}")
    assert len(options.get("options", [])) > 0
    
    decision = result.get("decision", {})
    print(f"Decision: {json.dumps(decision, indent=2)}")
    assert "selected_option_id" in decision
    
    # 5. Verify Limbic Update
    print("\n--- Verifying Limbic Impact ---")
    # Mock LLM returns sentiment 0.1, urgency 0.5
    # Update logic: valence += 0.01, arousal += 0.1
    print(f"Current Valence: {limbic.state.valence}")
    print(f"Current Arousal: {limbic.state.arousal}")
    
    # 6. Check Logs
    log_path = Path("progeny_root/logs/thoughts.log")
    if log_path.exists():
        print(f"\nLog file exists at {log_path}")
        content = log_path.read_text(encoding='utf-8')
        if "Monologue Cycle Complete" in content:
            print("Log verification successful.")
        else:
            print("WARNING: 'Monologue Cycle Complete' not found in logs.")
    else:
        print("WARNING: Log file not found.")

    print("\n=== Monologue System Tests Complete ===")

if __name__ == "__main__":
    test_monologue()
