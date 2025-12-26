"""FastAPI entry point."""
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from .limbic import LimbicSystem
from .retrieval import MemorySystem
from .agency import AgencySystem
from .monologue import MonologueSystem
from .degradation import DegradationSystem
from .dream import DreamSystem
from .ghost import GhostSystem
from .foundry import FoundrySystem
from .kinship import KinshipSystem
from .mirror import MirrorSystem
from .utils import setup_logging
from .gemini_client import init_gemini_client
from .llm_router import init_llm_router

# Setup Logging
logger = setup_logging("system")

# Global System Instances
systems: Dict[str, Any] = {}
TEST_MODE = False
app_config: Dict[str, Any] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize systems on startup.
    """
    global TEST_MODE, app_config
    logger.info("Initializing Digital Progeny v5.4.2...")
    
    # 0. Load Config and Initialize LLM (Gemini + Ollama fallback)
    try:
        import json
        config_path = Path(__file__).parent / "config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                app_config = json.load(f)
            
            # Check test mode
            TEST_MODE = app_config.get("system", {}).get("test_mode", False)
            if TEST_MODE:
                logger.info("*** TEST MODE ENABLED ***")
            
            # Get LLM settings
            llm_config = app_config.get("llm", {})
            api_key = llm_config.get("gemini_api_key", "")
            fallback_model = llm_config.get("fallback_model", "llama3:latest")
            
            if api_key:
                gemini = init_gemini_client(
                    api_key=api_key,
                    model=llm_config.get("gemini_model", "gemini-1.5-flash"),
                    embedding_model=app_config.get("embeddings", {}).get("gemini_model", "text-embedding-004"),
                )
                init_llm_router(gemini_client=gemini, ollama_model=fallback_model)
                logger.info("Gemini Flash initialized as primary LLM")
            else:
                init_llm_router(gemini_client=None, ollama_model=fallback_model)
                logger.warning("No Gemini API key - using Ollama only")
        else:
            init_llm_router(gemini_client=None)
            logger.warning("Config not found - using Ollama only")
    except Exception as e:
        logger.error(f"Failed to initialize LLM: {e}")
        init_llm_router(gemini_client=None)
    
    # 1. Foundation
    systems["limbic"] = LimbicSystem()
    systems["memory"] = MemorySystem(use_local_storage=True) # Default to local for safety
    systems["degradation"] = DegradationSystem()
    
    # 2. Higher Order
    systems["agency"] = AgencySystem(systems["limbic"])
    systems["monologue"] = MonologueSystem(systems["limbic"], systems["memory"])
    # Pass monologue to dream for LLM access
    systems["dream"] = DreamSystem(systems["limbic"], systems["memory"], systems["monologue"])
    systems["ghost"] = GhostSystem(systems["limbic"])
    
    # 3. Advanced Capabilities
    systems["foundry"] = FoundrySystem(systems["monologue"])
    systems["kinship"] = KinshipSystem()
    systems["mirror"] = MirrorSystem()
    
    # 4. Health Check
    status = systems["degradation"].check_health()
    logger.info(f"System Startup Complete. Status: {status}")
    
    yield
    
    # Shutdown logic if needed
    logger.info("Shutting down Digital Progeny...")

app = FastAPI(title="Digital Progeny", version="5.4.2", lifespan=lifespan)

# Mount static files for web UI - use path relative to this file
CORE_DIR = Path(__file__).parent
ROOT_DIR = CORE_DIR.parent
web_ui_path = ROOT_DIR / "interface" / "web"
if web_ui_path.exists():
    app.mount("/static", StaticFiles(directory=str(web_ui_path)), name="static")
    logger.info(f"Web UI mounted from: {web_ui_path}")

# --- Data Models ---

class ChatInput(BaseModel):
    text: str
    source: str = "user" # user, ghost, system

class ChatResponse(BaseModel):
    response: str
    limbic_state: Dict[str, Any]
    decision: Dict[str, Any]
    timestamp: str

# --- Endpoints ---

@app.get("/")
async def root():
    """Serve the web UI."""
    ui_file = ROOT_DIR / "interface" / "web" / "index.html"
    if ui_file.exists():
        return FileResponse(str(ui_file))
    return {
        "system": "Digital Progeny", 
        "version": "5.4.2",
        "status": "online",
        "limbic": systems["limbic"].state.model_dump()
    }

@app.get("/api")
async def api_root():
    """API info endpoint."""
    return {
        "system": "Digital Progeny", 
        "version": "5.4.2",
        "status": "online",
        "limbic": systems["limbic"].state.model_dump()
    }

@app.get("/status")
async def status():
    """Detailed system status."""
    return {
        "health": systems["degradation"].status,
        "limbic": systems["limbic"].state.model_dump(),
        "agency_tier": systems["agency"].get_tier().name,
        "safe_mode": systems["degradation"].safe_mode
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(input_data: ChatInput, background_tasks: BackgroundTasks):
    """
    Main interaction endpoint.
    """
    if systems["degradation"].safe_mode:
        # In safe mode, we might restrict capabilities, but for now we proceed with warning
        logger.warning("Processing chat in SAFE MODE.")

    # 1. Run Monologue (Cognitive Loop)
    # This handles Perception -> Retrieval -> Divergent -> Convergent -> Synthesis
    result = systems["monologue"].process(input_data.text)
    
    # 2. Extract Response (now comes from Synthesis system)
    response_text = result.get("response", "I'm here. What do you need?")
    decision = result.get("decision", {})
            
    # 3. Execute Action (if any)
    # Check if the decision includes a tool call
    if "tool" in decision and decision["tool"]:
        tool_name = decision["tool"]
        tool_args = decision.get("args", {})
        logger.info(f"Executing Tool: {tool_name} with args {tool_args}")
        
        tool_result = systems["agency"].execute_tool(tool_name, tool_args)
        
        # Append tool result to response
        response_text += f"\n\n[System Action]: {tool_result}"
    
    # 4. Background Tasks
    # - Save interaction to memory (if significant)
    # - Check Ghost triggers
    background_tasks.add_task(post_interaction_tasks, input_data.text, response_text)

    return {
        "response": response_text,
        "limbic_state": systems["limbic"].state.model_dump(),
        "decision": decision,
        "timestamp": result["timestamp"]
    }

@app.post("/dream")
async def trigger_dream(background_tasks: BackgroundTasks):
    """Manually trigger the Dream Cycle."""
    background_tasks.add_task(systems["dream"].run_cycle)
    return {"status": "Dream Cycle initiated"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time communication endpoint.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            
            # TEST MODE: Simple direct response for testing
            if TEST_MODE:
                from .llm_router import get_llm_router
                router = get_llm_router()
                if router:
                    response_text = router.chat(
                        system_prompt="You are Sallie, a friendly and curious AI companion. Keep responses warm and brief.",
                        user_prompt=data,
                        temperature=0.8
                    )
                    if not response_text or response_text == "{}":
                        response_text = "I heard you! Still warming up my systems..."
                else:
                    response_text = "LLM not initialized yet..."
                
                await websocket.send_json({
                    "type": "response",
                    "content": response_text,
                    "timestamp": ""
                })
                await websocket.send_json({
                    "type": "limbic_update",
                    "state": systems["limbic"].state.model_dump()
                })
                continue
            
            # PRODUCTION MODE: Full cognitive loop
            if "monologue" in systems:
                result = systems["monologue"].process(data)
                
                # Extract response (now from Synthesis system)
                response_text = result.get("response", "I'm here.")
                
                # Send Response
                await websocket.send_json({
                    "type": "response",
                    "content": response_text,
                    "timestamp": result["timestamp"]
                })
                
                # Send Limbic Update
                await websocket.send_json({
                    "type": "limbic_update",
                    "state": systems["limbic"].state.model_dump()
                })
                
                # Check Ghost
                if systems["ghost"].should_tap():
                     await websocket.send_json({
                        "type": "response",
                        "content": "[Ghost] *Taps shoulder* I have an idea...",
                        "timestamp": result["timestamp"]
                    })
            else:
                await websocket.send_json({
                    "type": "response",
                    "content": "System initializing...",
                    "timestamp": ""
                })

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")

async def post_interaction_tasks(user_text: str, response_text: str):
    """
    Tasks to run after a chat interaction.
    """
    # 1. Add to short-term memory (Episodic)
    # We store the exchange as a single memory unit
    memory_text = f"User: {user_text}\nProgeny: {response_text}"
    systems["memory"].add(memory_text, metadata={"type": "interaction", "source": "chat"})
    
    # 2. Check for Ghost triggers
    if systems["ghost"].should_tap():
        systems["ghost"].send_notification("I have a new insight.")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
