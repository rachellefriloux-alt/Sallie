import sys
import os
import asyncio
import json

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.main import app, lifespan, chat, status, trigger_dream, ChatInput
from fastapi import BackgroundTasks

async def test_integration():
    print("=== Testing System Integration (Manual Async) ===")
    
    # Manually trigger startup
    async with lifespan(app):
        print("\n--- System Initialized ---")
        
        # 1. Test Status
        print("\n--- Checking Status ---")
        status_data = await status()
        print(f"Health: {status_data['health']}")
        print(f"Limbic State: {status_data['limbic']['trust']}")
        assert "limbic" in status_data
        
        # 2. Test Chat Flow
        print("\n--- Testing Chat Endpoint ---")
        input_data = ChatInput(text="Hello, system check.", source="user")
        bg_tasks = BackgroundTasks()
        
        response = await chat(input_data, bg_tasks)
        
        print(f"Response: {response['response']}")
        print(f"Decision: {response['decision'].get('selected_option_id')}")
        assert "response" in response
        assert "limbic_state" in response
        
        # 3. Test Dream Trigger
        print("\n--- Testing Dream Trigger ---")
        bg_tasks_dream = BackgroundTasks()
        dream_res = await trigger_dream(bg_tasks_dream)
        print(f"Result: {dream_res}")
        
        # Note: Background tasks won't actually run unless we execute them manually
        # but for unit testing the endpoint logic, this is sufficient.

    print("\n=== Integration Tests Complete ===")

if __name__ == "__main__":
    asyncio.run(test_integration())
