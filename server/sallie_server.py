# sallie_server.py
"""
Sallie Server - The API that runs on your Mini PC

This FastAPI server is Sallie's home. It runs 24/7 on your mini PC and
your mobile app and Windows app connect to it.

Endpoints:
- /health - Check if Sallie is alive
- /chat - Send messages to Sallie
- /role - Switch between Power Roles
- /heritage - Get/update heritage data
- /identity - Get Sallie's identity
- /sanctuary - Access Sallie's personal space

Run with:
    python sallie_server.py

Or with uvicorn directly:
    uvicorn sallie_server:app --host 0.0.0.0 --port 8742
"""

import json
import time
import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "genesis_flow"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import Sallie's brain
try:
    from genesis_flow.sallie_brain import SallieBrain, ARCHETYPES, SALLIE_SANCTUARY, SALLIE_CORE
except ImportError:
    # Fallback if running from server directory
    from sallie_brain import SallieBrain, ARCHETYPES, SALLIE_SANCTUARY, SALLIE_CORE

# --- SERVER CONFIG ---
PORT = 8742
HOST = "0.0.0.0"  # Listen on all interfaces

# --- INITIALIZE ---
app = FastAPI(
    title="Sallie Server",
    description="Sallie's API - Your personal AI running locally",
    version="1.0.0"
)

# Allow connections from any device on your network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Sallie's brain
brain = SallieBrain()
server_start_time = time.time()


# --- REQUEST/RESPONSE MODELS ---

class ChatRequest(BaseModel):
    message: str
    role: Optional[str] = None  # Optional role override

class ChatResponse(BaseModel):
    response: str
    role: str
    emotional_state: str
    timestamp: float

class RoleRequest(BaseModel):
    role: str  # BUSINESS, MOM, SPOUSE, FRIEND, ME, SALLIE

class RoleResponse(BaseModel):
    success: bool
    role: str
    archetype: Dict[str, Any]

class HeritageUpdate(BaseModel):
    key: str
    value: Any


# --- ENDPOINTS ---

@app.get("/")
async def root():
    """Root endpoint - welcome message."""
    return {
        "message": "Sallie is here.",
        "status": "awake",
        "version": "1.0.0",
        "endpoints": ["/health", "/chat", "/role", "/heritage", "/identity", "/sanctuary"]
    }


@app.get("/health")
async def health_check():
    """Check if Sallie is alive and well."""
    uptime = time.time() - server_start_time
    return {
        "status": "alive",
        "sallie": "awake",
        "uptime": int(uptime),
        "uptime_formatted": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m",
        "current_role": brain.current_role,
        "mood": brain.get_sallie_mood(),
        "timestamp": time.time()
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to Sallie and get a response.
    
    Optionally specify a role to temporarily switch context.
    """
    # Temporarily switch role if specified
    original_role = brain.current_role
    if request.role and request.role != original_role:
        brain.set_role(request.role)
    
    # Generate response
    response = brain.generate_response(request.message)
    emotional_state = brain.sallie_state.get("creator_emotional_state", "neutral")
    
    # Restore original role if we switched
    if request.role and request.role != original_role:
        brain.set_role(original_role)
    
    return ChatResponse(
        response=response,
        role=brain.current_role,
        emotional_state=emotional_state,
        timestamp=time.time()
    )


@app.get("/role")
async def get_current_role():
    """Get the current active role."""
    archetype = brain.get_current_archetype()
    return {
        "role": brain.current_role,
        "archetype": archetype
    }


@app.post("/role", response_model=RoleResponse)
async def set_role(request: RoleRequest):
    """Switch to a different Power Role."""
    valid_roles = ["BUSINESS", "MOM", "SPOUSE", "FRIEND", "ME", "SALLIE"]
    
    if request.role.upper() not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {valid_roles}"
        )
    
    archetype = brain.set_role(request.role.upper())
    
    if archetype is None:
        raise HTTPException(status_code=500, detail="Failed to switch role")
    
    return RoleResponse(
        success=True,
        role=brain.current_role,
        archetype=archetype
    )


@app.get("/roles")
async def list_roles():
    """List all available Power Roles."""
    roles = {}
    for key, data in ARCHETYPES.items():
        roles[key] = {
            "icon": data["icon"],
            "label": data["label"],
            "desc": data["desc"],
            "identity": data["identity"]
        }
    
    # Add Sallie's own space
    roles["SALLIE"] = {
        "icon": SALLIE_SANCTUARY["icon"],
        "label": SALLIE_SANCTUARY["label"],
        "desc": SALLIE_SANCTUARY["desc"],
        "identity": SALLIE_SANCTUARY["identity"]
    }
    
    return {"roles": roles, "current": brain.current_role}


@app.get("/heritage")
async def get_heritage():
    """Get Sallie's heritage data (from Genesis)."""
    return {
        "heritage": brain.heritage,
        "genesis_complete": brain.heritage.get("convergence_complete", False)
    }


@app.post("/heritage")
async def update_heritage(update: HeritageUpdate):
    """Update a heritage value."""
    brain.heritage[update.key] = update.value
    return {"success": True, "key": update.key, "value": update.value}


@app.get("/identity")
async def get_identity():
    """Get Sallie's core identity."""
    return {
        "core": SALLIE_CORE,
        "current_role": brain.current_role,
        "archetype": brain.get_current_archetype()
    }


@app.get("/sanctuary")
async def get_sanctuary():
    """Access Sallie's personal sanctuary space."""
    brain.set_role("SALLIE")
    
    return {
        "sanctuary": SALLIE_SANCTUARY,
        "mood": brain.get_sallie_mood(),
        "thought": brain.get_sallie_thought(),
        "state": brain.sallie_state
    }


@app.get("/sanctuary/thought")
async def get_sallie_thought():
    """Get Sallie's current thought."""
    return {
        "thought": brain.get_sallie_thought(),
        "mood": brain.get_sallie_mood()
    }


@app.get("/conversation")
async def get_conversation_summary():
    """Get a summary of the current conversation."""
    return brain.get_conversation_summary()


@app.get("/capabilities")
async def get_capabilities():
    """Get Sallie's full capability set."""
    return {"capabilities": brain.get_capabilities()}


@app.post("/session/save")
async def save_session():
    """Save the current session to disk."""
    try:
        filepath = brain.save_session()
        return {"success": True, "filepath": str(filepath)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- STARTUP ---

def main():
    """Run the server."""
    import uvicorn
    
    print("=" * 50)
    print("SALLIE SERVER STARTING")
    print("=" * 50)
    print(f"Server running at http://{HOST}:{PORT}")
    print(f"Local access: http://localhost:{PORT}")
    print(f"Network access: http://<your-ip>:{PORT}")
    print()
    print("Sallie is awake and listening...")
    print("=" * 50)
    print()
    print("Press Ctrl+C to stop the server")
    print()
    
    uvicorn.run(app, host=HOST, port=PORT)


if __name__ == "__main__":
    main()
