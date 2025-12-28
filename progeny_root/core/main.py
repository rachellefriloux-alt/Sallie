"""FastAPI entry point."""
import logging
import time
import json
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Body, Query
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
from .convergence import ConvergenceSystem, QUESTIONS
from .convergence_response import ConvergenceResponseGenerator
from .identity import get_identity_system
from .control import get_control_system
from .learning import LearningSystem
from .avatar import get_avatar_system
from .sync import SyncClient
from .api import PushNotificationService, DeviceManager
from .device_access import FileSystemAccess, AppControl, SystemInfo, PermissionManager
from .smart_home import SmartHomeAPI
from .performance import get_performance_monitor
from .heritage_versioning import get_heritage_versioning
from .emotional_memory import EmotionalMemorySystem
from .intuition import IntuitionEngine
from .spontaneity import SpontaneitySystem
from .uncertainty import UncertaintySystem
from .aesthetic import AestheticSystem
from .energy_cycles import EnergyCyclesSystem
from .utils import setup_logging
from .gemini_client import init_gemini_client
from .llm_router import init_llm_router

# Setup Logging
logger = setup_logging("system")

# Global System Instances
systems: Dict[str, Any] = {}
TEST_MODE = False
app_config: Dict[str, Any] = {}
initialization_status: Dict[str, bool] = {}
initialization_errors: Dict[str, str] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize systems on startup with proper dependency order, error handling, and health checks.
    """
    global TEST_MODE, app_config, initialization_status, initialization_errors
    logger.info("Initializing Digital Progeny v5.4.2...")
    
    initialization_status.clear()
    initialization_errors.clear()
    
    def _init_system(name: str, init_func, *args, **kwargs) -> bool:
        """Initialize a system with error handling and health check."""
        try:
            logger.info(f"[Init] Initializing {name}...")
            system = init_func(*args, **kwargs)
            systems[name] = system
            
            # Health check if system has a health_check method
            if hasattr(system, 'health_check'):
                health = system.health_check()
                if not health:
                    logger.warning(f"[Init] {name} initialized but health check failed")
                    initialization_status[name] = False
                    return False
            
            initialization_status[name] = True
            logger.info(f"[Init] ✓ {name} initialized successfully")
            return True
        except Exception as e:
            error_msg = str(e)
            initialization_status[name] = False
            initialization_errors[name] = error_msg
            logger.error(f"[Init] ✗ {name} failed to initialize: {error_msg}", exc_info=True)
            return False
    
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
                logger.info("[Init] ✓ Gemini Flash initialized as primary LLM")
            else:
                init_llm_router(gemini_client=None, ollama_model=fallback_model)
                logger.warning("[Init] No Gemini API key - using Ollama only")
        else:
            init_llm_router(gemini_client=None)
            logger.warning("[Init] Config not found - using Ollama only")
    except Exception as e:
        logger.error(f"[Init] ✗ Failed to initialize LLM: {e}", exc_info=True)
        init_llm_router(gemini_client=None)
    
    # 1. Foundation Systems (no dependencies)
    _init_system("limbic", LimbicSystem)
    _init_system("memory", MemorySystem, use_local_storage=True)
    _init_system("degradation", DegradationSystem)
    _init_system("identity", get_identity_system)
    _init_system("control", get_control_system)
    
    # Verify critical foundation systems
    if not initialization_status.get("limbic", False):
        logger.critical("[Init] CRITICAL: Limbic system failed to initialize. System may not function correctly.")
    if not initialization_status.get("memory", False):
        logger.critical("[Init] CRITICAL: Memory system failed to initialize. System may not function correctly.")
    
    # 2. Higher Order Systems (depend on foundation)
    if initialization_status.get("limbic", False):
        _init_system("agency", AgencySystem, systems["limbic"])
    else:
        logger.error("[Init] Cannot initialize Agency: Limbic system not available")
    
    if initialization_status.get("limbic", False) and initialization_status.get("memory", False):
        _init_system("monologue", MonologueSystem, systems["limbic"], systems["memory"])
    else:
        logger.error("[Init] Cannot initialize Monologue: Required systems not available")
    
    if initialization_status.get("limbic", False) and initialization_status.get("memory", False) and initialization_status.get("monologue", False):
        _init_system("dream", DreamSystem, systems["limbic"], systems["memory"], systems["monologue"])
    else:
        logger.error("[Init] Cannot initialize Dream: Required systems not available")
    
    if initialization_status.get("limbic", False):
        _init_system("ghost", GhostSystem, systems["limbic"])
    else:
        logger.error("[Init] Cannot initialize Ghost: Limbic system not available")
    
    if initialization_status.get("limbic", False):
        _init_system("convergence", ConvergenceSystem, systems["limbic"])
    else:
        logger.error("[Init] Cannot initialize Convergence: Limbic system not available")
    
    # 3. Advanced Capabilities (depend on higher order systems)
    if initialization_status.get("monologue", False):
        _init_system("foundry", FoundrySystem, systems["monologue"])
    else:
        logger.warning("[Init] Cannot initialize Foundry: Monologue system not available")
    
    _init_system("kinship", KinshipSystem)
    _init_system("mirror", MirrorSystem)
    
    if initialization_status.get("memory", False):
        _init_system("learning", LearningSystem, systems["memory"])
    else:
        logger.warning("[Init] Cannot initialize Learning: Memory system not available")
    
    # 4. Sync System (for cross-device synchronization)
    try:
        import platform
        device_id = f"{platform.node()}-{platform.system().lower()}"
        _init_system("sync", SyncClient, device_id=device_id)
    except Exception as e:
        logger.warning(f"[Init] Sync system initialization failed: {e}")
    
    # 5. Mobile API Services
    try:
        _init_system("push", PushNotificationService)
        _init_system("devices", DeviceManager)
    except Exception as e:
        logger.warning(f"[Init] Mobile API services initialization failed: {e}")
    
    # 6. Device Access Systems
    try:
        config_whitelist = app_config.get("paths", {}).get("whitelist", ["./work", "./projects"])
        config_blacklist = app_config.get("paths", {}).get("blacklist", ["./secrets", "./.ssh"])
        _init_system("filesystem", FileSystemAccess, whitelist=config_whitelist, blacklist=config_blacklist)
        _init_system("app_control", AppControl)
        _init_system("system_info", SystemInfo)
        _init_system("permissions", PermissionManager)
    except Exception as e:
        logger.warning(f"[Init] Device access systems initialization failed: {e}")
    
    # 7. Smart Home Integration
    try:
        smarthome_config = app_config.get("smart_home", {})
        _init_system("smart_home", SmartHomeAPI,
            home_assistant_url=smarthome_config.get("home_assistant_url"),
            home_assistant_token=smarthome_config.get("home_assistant_token"),
            alexa_api_key=smarthome_config.get("alexa_api_key"),
            google_api_key=smarthome_config.get("google_api_key"),
            copilot_api_key=smarthome_config.get("copilot_api_key"),
        )
    except Exception as e:
        logger.warning(f"[Init] Smart home integration initialization failed: {e}")
    
    # 8. Performance Monitor
    try:
        _init_system("performance", get_performance_monitor)
    except Exception as e:
        logger.warning(f"[Init] Performance monitor initialization failed: {e}")
    
    # 9. Heritage Versioning
    try:
        _init_system("heritage_versioning", get_heritage_versioning)
    except Exception as e:
        logger.warning(f"[Init] Heritage versioning initialization failed: {e}")
    
    # 10. Human-Bridging Systems (Emotional Memory, Intuition, Spontaneity, etc.)
    if initialization_status.get("limbic", False):
        try:
            _init_system("emotional_memory", EmotionalMemorySystem)
            if "emotional_memory" in systems:
                _init_system("intuition", IntuitionEngine, systems["limbic"], systems["emotional_memory"])
            _init_system("spontaneity", SpontaneitySystem, systems["limbic"])
            _init_system("uncertainty", UncertaintySystem)
            _init_system("aesthetic", AestheticSystem)
            _init_system("energy_cycles", EnergyCyclesSystem)
            _init_system("convergence_response", ConvergenceResponseGenerator)
            logger.info("[Init] ✓ Human-bridging systems initialized")
        except Exception as e:
            logger.warning(f"[Init] Human-bridging systems initialization failed: {e}")
    
    # Final Health Check
    if initialization_status.get("degradation", False):
        try:
            status = systems["degradation"].check_health()
            logger.info(f"[Init] System health check: {status}")
        except Exception as e:
            logger.error(f"[Init] Health check failed: {e}")
    
    # Summary
    successful = sum(1 for v in initialization_status.values() if v)
    total = len(initialization_status)
    logger.info(f"[Init] Initialization complete: {successful}/{total} systems initialized successfully")
    
    if initialization_errors:
        logger.warning(f"[Init] Systems with errors: {list(initialization_errors.keys())}")
        for system, error in initialization_errors.items():
            logger.warning(f"[Init]   {system}: {error}")
    
    # Critical systems check
    critical_systems = ["limbic", "memory", "monologue"]
    missing_critical = [s for s in critical_systems if not initialization_status.get(s, False)]
    if missing_critical:
        logger.critical(f"[Init] CRITICAL: Missing required systems: {missing_critical}")
        logger.critical("[Init] System may not function correctly. Please check logs and configuration.")
    
    # Register state change observers for systems that depend on limbic state
    if initialization_status.get("limbic", False) and initialization_status.get("ghost", False):
        def _ghost_limbic_update(old_state, new_state):
            """Notify ghost system of significant limbic changes."""
            try:
                # Only notify on significant changes (threshold: 0.1)
                if abs(new_state.trust - old_state.trust) > 0.1 or \
                   abs(new_state.warmth - old_state.warmth) > 0.1 or \
                   abs(new_state.arousal - old_state.arousal) > 0.1 or \
                   abs(new_state.valence - old_state.valence) > 0.1:
                    # Ghost system will check pulse state on next access
                    logger.debug("[StateSync] Notified Ghost of limbic state change")
            except Exception as e:
                logger.error(f"[StateSync] Ghost observer error: {e}")
        
        systems["limbic"].add_observer(_ghost_limbic_update)
        logger.info("[Init] Registered Ghost as limbic state observer")
    
    logger.info("[Init] State synchronization observers registered")
    
    yield
    
    # Shutdown logic
    logger.info("Shutting down Digital Progeny...")
    for name, system in systems.items():
        try:
            if hasattr(system, 'shutdown'):
                system.shutdown()
                logger.debug(f"[Shutdown] {name} shut down")
        except Exception as e:
            logger.warning(f"[Shutdown] Error shutting down {name}: {e}")

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
    status_data = {
        "version": "5.4.2",
        "initialization": {
            "status": initialization_status,
            "errors": initialization_errors,
            "successful": sum(1 for v in initialization_status.values() if v),
            "total": len(initialization_status)
        }
    }
    
    # Add system-specific status if available
    try:
        if "degradation" in systems:
            status_data["health"] = systems["degradation"].get_current_state()
        if "limbic" in systems:
            status_data["limbic"] = systems["limbic"].state.model_dump()
        if "agency" in systems:
            status_data["agency_tier"] = systems["agency"].get_tier().name
            status_data["advisory_mode"] = systems["agency"].advisory_mode
        if "control" in systems:
            status_data["control_status"] = systems["control"].get_control_status()
        if "identity" in systems:
            status_data["identity_summary"] = systems["identity"].get_identity_summary()
        if "degradation" in systems:
            status_data["safe_mode"] = getattr(systems["degradation"], "safe_mode", False)
    except Exception as e:
        logger.error(f"Error gathering system status: {e}")
        status_data["error"] = str(e)
    
    return status_data

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint."""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "systems": {}
    }
    
    # Check each system's health
    for name, system in systems.items():
        try:
            if hasattr(system, 'health_check'):
                health = system.health_check()
                health_status["systems"][name] = {
                    "status": "healthy" if health else "degraded",
                    "initialized": initialization_status.get(name, False)
                }
            else:
                health_status["systems"][name] = {
                    "status": "unknown",
                    "initialized": initialization_status.get(name, False)
                }
        except Exception as e:
            health_status["systems"][name] = {
                "status": "error",
                "error": str(e),
                "initialized": initialization_status.get(name, False)
            }
    
    # Overall health determination
    critical_systems = ["limbic", "memory", "monologue"]
    critical_healthy = all(
        health_status["systems"].get(s, {}).get("status") == "healthy" 
        for s in critical_systems 
        if s in systems
    )
    
    if not critical_healthy:
        health_status["status"] = "degraded"
    
    # Check for any errors
    if any(s.get("status") == "error" for s in health_status["systems"].values()):
        health_status["status"] = "unhealthy"
    
    return health_status

@app.post("/chat", response_model=ChatResponse)
async def chat(input_data: ChatInput, background_tasks: BackgroundTasks):
    """
    Main interaction endpoint.
    """
    # Performance monitoring
    monitor = systems.get("performance")
    timer_id = monitor.start_timer("chat_endpoint") if monitor else None
    
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
    
    # End performance timer
    if timer_id and monitor:
        monitor.end_timer(timer_id)
        monitor.increment_counter("chat_requests")

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

# Control Mechanism Endpoints
@app.post("/control/take")
async def creator_take_control(reason: str = "Creator intervention"):
    """Creator takes full control of Sallie."""
    systems["control"].creator_take_control(reason)
    return {"status": "control_taken", "control_status": systems["control"].get_control_status()}

@app.post("/control/release")
async def creator_release_control():
    """Creator releases control, returning autonomy to Sallie."""
    systems["control"].creator_release_control()
    return {"status": "control_released", "control_status": systems["control"].get_control_status()}

@app.post("/control/emergency_stop")
async def emergency_stop(reason: str = "Emergency stop activated"):
    """Immediate halt of all autonomous actions."""
    systems["control"].emergency_stop(reason)
    return {"status": "emergency_stop_active", "control_status": systems["control"].get_control_status()}

@app.post("/control/resume")
async def resume_after_emergency_stop():
    """Resume operations after emergency stop."""
    systems["control"].resume_after_emergency_stop()
    return {"status": "resumed", "control_status": systems["control"].get_control_status()}

@app.post("/control/lock")
async def lock_state(reason: str = "State locked for review"):
    """Freeze Sallie's state for review/intervention."""
    systems["control"].lock_state(reason)
    return {"status": "state_locked", "control_status": systems["control"].get_control_status()}

@app.post("/control/unlock")
async def unlock_state():
    """Unlock state, allowing normal operations to resume."""
    systems["control"].unlock_state()
    return {"status": "state_unlocked", "control_status": systems["control"].get_control_status()}

@app.get("/control/status")
async def get_control_status():
    """Get current control status."""
    return systems["control"].get_control_status()

@app.get("/control/history")
async def get_control_history(limit: int = 50):
    """Get control history."""
    return {"history": systems["control"].get_control_history(limit)}

@app.get("/agency/advisory")
async def get_advisory_summary():
    """Get advisory trust summary."""
    return systems["agency"].get_advisory_summary()

@app.get("/agency/overrides")
async def get_override_history(limit: int = 50):
    """Get recent override history."""
    return {"overrides": systems["agency"].get_override_history(limit)}

@app.post("/agency/rollback")
async def rollback_action(request: Dict[str, Any]):
    """
    Rollback an action by reverting to pre-action commit.
    Requires either action_id or commit_hash, and explanation.
    """
    action_id = request.get("action_id")
    commit_hash = request.get("commit_hash")
    explanation = request.get("explanation", "Creator requested rollback")
    
    if not explanation:
        raise HTTPException(status_code=400, detail="explanation is required")
    
    if not action_id and not commit_hash:
        raise HTTPException(status_code=400, detail="Either action_id or commit_hash must be provided")
    
    result = systems["agency"].rollback_action(action_id, commit_hash, explanation)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message", "Rollback failed"))
    
    return result

# Learning System Endpoints
@app.post("/learning/read")
async def learning_read(content: str, source: Optional[str] = None):
    """Read and analyze content."""
    return systems["learning"].read_and_analyze(content, source)

@app.post("/learning/write")
async def learning_write(topic: str, style: str = "creative", length: str = "medium"):
    """Write creatively or technically."""
    return systems["learning"].write_creatively(topic, style, length)

@app.post("/learning/create")
async def learning_create(project_description: str, project_type: str = "experiment"):
    """Create a project or experiment."""
    return systems["learning"].create_project(project_description, project_type)

@app.post("/learning/explore")
async def learning_explore(topic: str, depth: str = "medium"):
    """Autonomous exploration of a topic."""
    return systems["learning"].explore_autonomously(topic, depth)

@app.post("/learning/skill")
async def learning_skill(skill_name: str, method: str = "research"):
    """Acquire a new skill."""
    return systems["learning"].acquire_skill(skill_name, method)

@app.post("/learning/practice")
async def learning_practice(skill_name: str, exercise: Optional[str] = None):
    """Practice a learned skill."""
    return systems["learning"].practice_skill(skill_name, exercise)

@app.post("/learning/apply")
async def learning_apply(skill_name: str, task: str, context: Optional[Dict[str, Any]] = None):
    """Apply a learned skill to a real task."""
    return systems["learning"].apply_skill(skill_name, task, context)

@app.get("/learning/summary")
async def get_learning_summary():
    """Get learning activity summary."""
    return systems["learning"].get_learning_summary()

# Avatar System Endpoints
@app.get("/avatar/current")
async def get_current_avatar():
    """Get current avatar configuration."""
    avatar = get_avatar_system()
    return avatar.get_current_avatar()

@app.get("/avatar/options")
async def get_avatar_options():
    """Get available avatar options."""
    avatar = get_avatar_system()
    return {"options": avatar.get_avatar_options()}

@app.post("/avatar/choose")
async def choose_avatar(option_id: str, custom_config: Optional[Dict[str, Any]] = None):
    """Sallie chooses an avatar."""
    avatar = get_avatar_system()
    success = avatar.choose_avatar(option_id, custom_config)
    return {"success": success, "avatar": avatar.get_current_avatar() if success else None}

@app.post("/avatar/update")
async def update_avatar(config: Dict[str, Any], chosen_by: str = "sallie"):
    """Update avatar configuration."""
    avatar = get_avatar_system()
    success = avatar.update_avatar(config, chosen_by)
    return {"success": success, "avatar": avatar.get_current_avatar() if success else None}

@app.get("/avatar/css")
async def get_avatar_css():
    """Get CSS for current avatar."""
    avatar = get_avatar_system()
    return {"css": avatar.get_avatar_css()}

@app.get("/avatar/html")
async def get_avatar_html():
    """Get HTML for current avatar."""
    avatar = get_avatar_system()
    return {"html": avatar.get_avatar_html()}

# Sync Endpoints (for cross-device synchronization)
@app.get("/sync/status")
async def get_sync_status():
    """Get current sync status."""
    return systems["sync"].get_sync_status()

@app.post("/sync/limbic")
async def sync_limbic_state():
    """Sync limbic state to other devices."""
    limbic_data = systems["limbic"].state.model_dump()
    result = systems["sync"].sync_limbic_state(limbic_data)
    return result

@app.post("/sync/memory")
async def sync_memory(limit: int = 100):
    """Sync recent memory entries to other devices."""
    # Get recent memories (simplified - in production would use MemorySystem)
    memory_data = []  # Would retrieve from MemorySystem
    result = systems["sync"].sync_memory(memory_data)
    return result

@app.post("/sync/conversation")
async def sync_conversation(conversation_data: Dict[str, Any]):
    """Sync conversation to other devices."""
    result = systems["sync"].sync_conversation(conversation_data)
    return result

@app.get("/sync/devices")
async def list_sync_devices():
    """List all registered sync devices."""
    from .sync import SyncStateManager
    state_manager = SyncStateManager()
    return {"devices": state_manager.list_devices()}

# Mobile API Endpoints
@app.post("/mobile/register")
async def register_mobile_device(
    device_id: str,
    platform: str,
    version: str,
    capabilities: List[str],
    push_token: Optional[str] = None,
    push_platform: Optional[str] = None
):
    """Register a mobile device."""
    # Register device
    device_info = systems["devices"].register_device(
        device_id=device_id,
        platform=platform,
        version=version,
        capabilities=capabilities
    )
    
    # Register push token if provided
    if push_token and push_platform:
        from .api.push_notifications import PushPlatform
        try:
            platform_enum = PushPlatform(push_platform.lower())
            systems["push"].register_device_token(device_id, platform_enum, push_token)
        except ValueError:
            logger.warning(f"[Mobile] Invalid push platform: {push_platform}")
    
    return {"status": "registered", "device": device_info}

@app.post("/mobile/push")
async def send_push_notification(
    device_id: str,
    title: str,
    body: str,
    data: Optional[Dict[str, Any]] = None
):
    """Send push notification to a device."""
    result = systems["push"].send_notification(device_id, title, body, data)
    return result

@app.post("/mobile/shoulder_tap")
async def send_shoulder_tap(
    device_id: str,
    message: str,
    seed_type: str = "insight"
):
    """Send proactive engagement (Shoulder Tap) notification."""
    result = systems["push"].send_proactive_engagement(device_id, message, seed_type)
    return result

@app.get("/mobile/devices")
async def list_mobile_devices():
    """List all registered mobile devices."""
    return {"devices": systems["devices"].list_devices()}

@app.get("/mobile/devices/{device_id}")
async def get_mobile_device(device_id: str):
    """Get information about a specific device."""
    device = systems["devices"].get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return {"device": device}

# Device Access Endpoints
@app.get("/device/status")
async def get_device_status():
    """Get device status (battery, network, etc.)."""
    return systems["system_info"].get_device_status()

@app.get("/device/resources")
async def get_device_resources():
    """Get system resource usage (CPU, memory, disk)."""
    return systems["system_info"].get_system_resources()

@app.get("/device/files/read")
async def read_device_file(file_path: str):
    """Read a file from the device."""
    try:
        return systems["filesystem"].read_file(file_path)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/device/files/list")
async def list_device_directory(dir_path: str, recursive: bool = False):
    """List directory contents."""
    try:
        return {"items": systems["filesystem"].list_directory(dir_path, recursive)}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except NotADirectoryError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/device/files/write")
async def write_device_file(request: Dict[str, Any]):
    """Write a file to the device."""
    file_path = request.get("file_path")
    content = request.get("content", "")
    create_dirs = request.get("create_dirs", True)
    
    if not file_path:
        raise HTTPException(status_code=400, detail="file_path is required")
    
    try:
        return systems["filesystem"].write_file(file_path, content, create_dirs)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@app.post("/device/apps/launch")
async def launch_app(request: Dict[str, Any]):
    """Launch an application."""
    app_name = request.get("app_name")
    args = request.get("args")
    
    if not app_name:
        raise HTTPException(status_code=400, detail="app_name is required")
    
    return systems["app_control"].launch_app(app_name, args)

@app.post("/device/apps/message")
async def send_app_message(request: Dict[str, Any]):
    """Send message via app."""
    app = request.get("app")
    recipient = request.get("recipient")
    message = request.get("message")
    
    if not all([app, recipient, message]):
        raise HTTPException(status_code=400, detail="app, recipient, and message are required")
    
    return systems["app_control"].send_message(app, recipient, message)

@app.get("/device/permissions")
async def get_device_permissions(device_id: str):
    """Get permissions for a device."""
    return {"permissions": systems["permissions"].get_device_permissions(device_id)}

@app.post("/device/permissions/grant")
async def grant_device_permission(request: Dict[str, Any]):
    """Grant permission to a device."""
    device_id = request.get("device_id")
    permission = request.get("permission")
    
    if not all([device_id, permission]):
        raise HTTPException(status_code=400, detail="device_id and permission are required")
    
    from .device_access.permissions import PermissionType
    try:
        perm_type = PermissionType(permission)
        systems["permissions"].grant_permission(device_id, perm_type)
        return {"status": "granted", "device_id": device_id, "permission": permission}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid permission type: {permission}")

@app.post("/device/permissions/revoke")
async def revoke_device_permission(request: Dict[str, Any]):
    """Revoke permission from a device."""
    device_id = request.get("device_id")
    permission = request.get("permission")
    
    if not all([device_id, permission]):
        raise HTTPException(status_code=400, detail="device_id and permission are required")
    
    from .device_access.permissions import PermissionType
    try:
        perm_type = PermissionType(permission)
        systems["permissions"].revoke_permission(device_id, perm_type)
        return {"status": "revoked", "device_id": device_id, "permission": permission}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid permission type: {permission}")

# Smart Home Endpoints
@app.get("/smarthome/devices")
async def get_smart_home_devices():
    """Get all devices from all smart home platforms."""
    return systems["smart_home"].get_all_devices()

@app.post("/smarthome/control")
async def control_smart_home_device(request: Dict[str, Any]):
    """Control a smart home device."""
    device_id = request.get("device_id")
    action = request.get("action")
    platform = request.get("platform", "home_assistant")
    value = request.get("value")
    
    if not all([device_id, action]):
        raise HTTPException(status_code=400, detail="device_id and action are required")
    
    return systems["smart_home"].control_device(device_id, action, platform, value)

@app.get("/smarthome/automations")
async def get_smart_home_automations():
    """Get all automations from Home Assistant."""
    return {"automations": systems["smart_home"].get_automations()}

@app.post("/smarthome/automations/trigger")
async def trigger_smart_home_automation(request: Dict[str, Any]):
    """Trigger a smart home automation."""
    automation_id = request.get("automation_id")
    
    if not automation_id:
        raise HTTPException(status_code=400, detail="automation_id is required")
    
    return systems["smart_home"].trigger_automation(automation_id)

@app.get("/smarthome/scenes")
async def get_smart_home_scenes():
    """Get all scenes from Home Assistant."""
    return {"scenes": systems["smart_home"].get_scenes()}

@app.post("/smarthome/scenes/activate")
async def activate_smart_home_scene(request: Dict[str, Any]):
    """Activate a smart home scene."""
    scene_id = request.get("scene_id")
    
    if not scene_id:
        raise HTTPException(status_code=400, detail="scene_id is required")
    
    return systems["smart_home"].activate_scene(scene_id)

# Performance Monitoring Endpoints
@app.get("/performance/stats")
async def get_performance_stats():
    """Get performance statistics."""
    monitor = systems.get("performance")
    if not monitor:
        return {"error": "Performance monitor not available"}
    
    return {
        "metrics": monitor.get_all_stats(),
        "counters": monitor.get_counters(),
        "summary": monitor._generate_summary()
    }

@app.get("/performance/metrics/{metric_name}")
async def get_metric_stats(metric_name: str):
    """Get statistics for a specific metric."""
    monitor = systems.get("performance")
    if not monitor:
        return {"error": "Performance monitor not available"}
    
    return {
        "metric": metric_name,
        "stats": monitor.get_stats(metric_name)
    }

@app.post("/performance/reset")
async def reset_performance_metrics():
    """Reset all performance metrics."""
    monitor = systems.get("performance")
    if not monitor:
        return {"error": "Performance monitor not available"}
    
    monitor.reset()
    return {"status": "reset", "message": "All performance metrics reset"}

@app.get("/performance/report")
async def get_performance_report():
    """Get full performance report."""
    monitor = systems.get("performance")
    if not monitor:
        return {"error": "Performance monitor not available"}
    
    return monitor.export_report()

# Kinship API Endpoints (Section 13)
@app.post("/kinship/register")
async def register_kin(request: Dict[str, Any]):
    """Register a new Kin user."""
    user_id = request.get("user_id")
    permissions = request.get("permissions", [])
    token = request.get("token")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    result = systems["kinship"].register_kin(user_id, permissions, token)
    if result:
        return {"status": "success", "user_id": user_id}
    else:
        raise HTTPException(status_code=400, detail="Registration failed")

@app.post("/kinship/authenticate")
async def authenticate_kin(request: Dict[str, Any]):
    """Authenticate a user and create session."""
    token = request.get("token")
    
    if not token:
        raise HTTPException(status_code=400, detail="token is required")
    
    user = systems["kinship"].authenticate(token)
    if user:
        session_id = systems["kinship"].create_session(user["id"], token)
        return {
            "status": "success",
            "user": user,
            "session_id": session_id
        }
    else:
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.post("/kinship/switch_context")
async def switch_kinship_context(request: Dict[str, Any]):
    """Switch active context to a different user."""
    user_id = request.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    result = systems["kinship"].switch_context(
        user_id,
        limbic_system=systems.get("limbic"),
        memory_system=systems.get("memory")
    )
    
    if result:
        return {
            "status": "success",
            "active_context": user_id,
            "context_info": systems["kinship"].get_user_context(user_id)
        }
    else:
        raise HTTPException(status_code=400, detail="Context switch failed")

@app.get("/kinship/context")
async def get_kinship_context():
    """Get current kinship context."""
    return {
        "active_context": systems["kinship"].active_context,
        "context_info": systems["kinship"].get_user_context(systems["kinship"].active_context)
    }

@app.get("/kinship/users")
async def list_kinship_users():
    """List all registered users (Creator only)."""
    # In production, check if requester is Creator
    users = []
    for user_id, user_data in systems["kinship"].users.items():
        users.append({
            "user_id": user_id,
            "role": user_data.get("role"),
            "permissions": user_data.get("permissions", [])
        })
    return {"users": users}

# Heritage Endpoints
@app.get("/api/heritage/files")
async def get_heritage_files():
    """Get list of all heritage files."""
    heritage_dir = Path("progeny_root/limbic/heritage")
    files = []
    
    if heritage_dir.exists():
        for file_path in heritage_dir.glob("*.json"):
            try:
                with open(file_path, "r") as f:
                    content = json.load(f)
                files.append({
                    "name": file_path.name,
                    "content": content,
                    "path": str(file_path)
                })
            except Exception as e:
                logger.error(f"Error reading heritage file {file_path}: {e}")
    
    return files

@app.get("/api/heritage/version/snapshots")
async def get_heritage_snapshots():
    """Get list of heritage version snapshots."""
    if "heritage_versioning" not in systems:
        raise HTTPException(status_code=503, detail="Heritage versioning system not available")
    
    history_dir = Path("progeny_root/limbic/heritage/history")
    snapshots = []
    
    if history_dir.exists():
        for file_path in sorted(history_dir.glob("*.json"), reverse=True):
            try:
                # Extract timestamp and description from filename
                # Format: {timestamp}_{heritage_type}_v{version}.json
                filename = file_path.stem
                parts = filename.split("_")
                if len(parts) >= 2:
                    timestamp_str = parts[0]
                    heritage_type = parts[1] if len(parts) > 1 else "unknown"
                    
                    # Try to parse timestamp
                    try:
                        timestamp = int(timestamp_str)
                        from datetime import datetime
                        dt = datetime.fromtimestamp(timestamp)
                        datetime_str = dt.isoformat()
                    except:
                        datetime_str = timestamp_str
                    
                    snapshots.append({
                        "name": file_path.name,
                        "path": str(file_path),
                        "timestamp": timestamp_str,
                        "datetime": datetime_str,
                        "heritage_type": heritage_type,
                        "description": f"Version snapshot for {heritage_type}"
                    })
            except Exception as e:
                logger.error(f"Error reading snapshot {file_path}: {e}")
    
    return snapshots

# Heritage Versioning Endpoints
@app.post("/heritage/version/snapshot")
async def create_heritage_snapshot(request: Dict[str, Any]):
    """Create a version snapshot before modification."""
    heritage_type = request.get("heritage_type")
    reason = request.get("reason", "Manual snapshot")
    
    if not heritage_type:
        raise HTTPException(status_code=400, detail="heritage_type is required")
    
    trust = systems["limbic"].state.trust if "limbic" in systems else None
    snapshot_path = systems["heritage_versioning"].create_version_snapshot(
        heritage_type, reason, trust
    )
    
    if snapshot_path:
        return {"status": "success", "snapshot": str(snapshot_path)}
    else:
        raise HTTPException(status_code=400, detail="Snapshot creation failed")

@app.post("/heritage/version/restore")
async def restore_heritage_version(request: Dict[str, Any]):
    """Restore a previous version."""
    heritage_type = request.get("heritage_type")
    version = request.get("version")
    
    if not all([heritage_type, version]):
        raise HTTPException(status_code=400, detail="heritage_type and version are required")
    
    result = systems["heritage_versioning"].restore_version(heritage_type, version)
    if result:
        return {"status": "success", "heritage_type": heritage_type, "version": version}
    else:
        raise HTTPException(status_code=400, detail="Restore failed")

@app.get("/heritage/version/current")
async def get_current_heritage_version(heritage_type: str):
    """Get current version number for a heritage file."""
    version = systems["heritage_versioning"].get_current_version(heritage_type)
    return {"heritage_type": heritage_type, "version": version}

# Ghost Interface Endpoints
@app.get("/ghost/pulse")
async def get_ghost_pulse():
    """Get Pulse visual state."""
    return systems["ghost"].get_pulse_state()

@app.post("/ghost/shoulder_tap")
async def send_ghost_shoulder_tap(request: Dict[str, Any]):
    """Send Shoulder Tap notification."""
    message = request.get("message")
    seed_type = request.get("seed_type", "insight")
    
    if not message:
        raise HTTPException(status_code=400, detail="message is required")
    
    result = systems["ghost"].send_shoulder_tap(message, seed_type)
    return {"status": "success" if result else "blocked", "message": message}

@app.get("/ghost/veto_pending")
async def get_pending_veto_hypotheses():
    """Get pending hypotheses for Veto Popup."""
    hypotheses = systems["ghost"].get_pending_veto_hypotheses()
    return {"hypotheses": hypotheses, "count": len(hypotheses)}

# Voice Interface Endpoints
@app.post("/voice/command")
async def process_voice_command(request: Dict[str, Any]):
    """Process a voice command."""
    command = request.get("command")
    
    if not command:
        raise HTTPException(status_code=400, detail="command is required")
    
    if "voice" not in systems:
        from .voice import VoiceSystem
        systems["voice"] = VoiceSystem(limbic_system=systems.get("limbic"))
    
    result = systems["voice"].process_voice_command(command)
    return result

@app.post("/voice/speak")
async def voice_speak(request: Dict[str, Any]):
    """Speak text with optional emotional prosody."""
    text = request.get("text")
    emotion = request.get("emotion")
    
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    
    if "voice" not in systems:
        from .voice import VoiceSystem
        systems["voice"] = VoiceSystem(limbic_system=systems.get("limbic"))
    
    systems["voice"].speak_with_prosody(text, emotion)
    return {"status": "success", "text": text}

# Foundry Endpoints
@app.post("/foundry/evaluate")
async def run_foundry_evaluation(request: Dict[str, Any]):
    """Run evaluation harness tests."""
    model_version = request.get("model_version", "current")
    
    results = systems["foundry"].run_evals(model_version)
    return {"status": "complete", "results": results}

@app.post("/foundry/drift_report")
async def generate_foundry_drift_report(request: Dict[str, Any]):
    """Generate drift report."""
    model_version = request.get("model_version", "current")
    
    report = systems["foundry"].generate_drift_report(model_version)
    return {"status": "complete", "report": report}

@app.post("/foundry/rollback")
async def foundry_rollback(request: Dict[str, Any]):
    """Rollback to last-known-good model."""
    target_version = request.get("target_version")
    
    systems["foundry"].rollback(target_version)
    return {"status": "rollback_initiated", "target_version": target_version}

# Sensors Endpoints
@app.get("/sensors/status")
async def get_sensors_status():
    """Get current sensor status."""
    if "sensors" not in systems:
        from .sensors import SensorSystem
        systems["sensors"] = SensorSystem()
    
    return {
        "system_load": systems["sensors"].scan_system_load(),
        "context": systems["sensors"].get_context_snapshot(),
        "workload_spike": systems["sensors"].detect_workload_spike(),
        "stress_detected": systems["sensors"].detect_stress()
    }

@app.post("/sensors/watch")
async def start_sensors_watch(request: Dict[str, Any]):
    """Start file system watcher for specified paths."""
    paths = request.get("paths", [])
    
    if not paths:
        raise HTTPException(status_code=400, detail="paths are required")
    
    if "sensors" not in systems:
        from .sensors import SensorSystem
        systems["sensors"] = SensorSystem()
    
    path_objects = [Path(p) for p in paths]
    systems["sensors"].start_file_watcher(path_objects)
    return {"status": "watching", "paths": paths}

# Convergence (Onboarding) Endpoints
@app.post("/convergence/start")
async def convergence_start():
    """Start a new Convergence session."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    systems["convergence"].start_session()
    return {
        "status": "started",
        "message": "Convergence session started. Entering Elastic Mode.",
        "total_questions": len(QUESTIONS)
    }

@app.get("/convergence/status")
async def convergence_status():
    """Get current Convergence session status."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    session = systems["convergence"].session_state
    return {
        "current_index": session.get("current_index", 0),
        "total_questions": len(QUESTIONS),
        "completed": session.get("completed", False),
        "started_at": session.get("started_at"),
        "completed_at": session.get("completed_at"),
        "answers_count": len(session.get("answers", {}))
    }

@app.get("/convergence/question/{question_id}")
async def get_convergence_question(question_id: int):
    """Get a specific question by ID."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    if question_id < 1 or question_id > len(QUESTIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Question ID must be between 1 and {len(QUESTIONS)}"
        )
    
    # Get question from QUESTIONS list
    question = QUESTIONS[question_id - 1]
    # If Q13, generate dynamic Mirror Test
    if question.id == 13:
        question.text = systems["convergence"]._generate_mirror_test()
    
    return {
        "id": question.id,
        "phase": question.phase.value,
        "text": question.text,
        "purpose": question.purpose,
        "extraction_key": question.extraction_key
    }

@app.get("/convergence/question")
async def get_current_question():
    """Get the current question based on session progress."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    question = systems["convergence"].get_next_question()
    if not question:
        return {
            "status": "completed",
            "message": "All questions have been answered."
        }
    
    return {
        "id": question.id,
        "phase": question.phase.value,
        "text": question.text,
        "purpose": question.purpose,
        "extraction_key": question.extraction_key,
        "current_index": systems["convergence"].session_state["current_index"]
    }

@app.post("/convergence/answer")
async def submit_convergence_answer(request: Dict[str, Any]):
    """Submit an answer to the current question."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    answer_text = request.get("answer", "")
    if not answer_text:
        raise HTTPException(status_code=400, detail="Answer text is required")
    
    try:
        # Get current question to extract insights
        current_idx = systems["convergence"].session_state["current_index"]
        current_question = QUESTIONS[current_idx] if current_idx < len(QUESTIONS) else None
        
        # Submit answer (this will extract insights internally)
        systems["convergence"].submit_answer(answer_text)
        
        # Get extraction preview from the stored answer
        extraction_preview = None
        if current_question:
            answer_data = systems["convergence"].session_state["answers"].get(current_question.extraction_key, {})
            if isinstance(answer_data, dict) and "extracted" in answer_data:
                extraction_preview = answer_data["extracted"]
        
        # Generate conversational response
        conversational_response = None
        transition = None
        if "convergence_response" in systems:
            try:
                previous_answers = systems["convergence"].session_state.get("answers", {})
                conversational_response = systems["convergence_response"].generate_response_to_answer(
                    question_id=current_question.id if current_question else current_idx + 1,
                    answer=answer_text,
                    extracted_insights=extraction_preview,
                    previous_answers=previous_answers
                )
            except Exception as e:
                logger.warning(f"[Convergence] Failed to generate conversational response: {e}")
        
        # Check if completed
        session = systems["convergence"].session_state
        if session.get("completed", False):
            return {
                "status": "completed",
                "message": "Convergence complete! Heritage has been compiled.",
                "heritage_compiled": True,
                "extraction_preview": extraction_preview,
                "conversational_response": conversational_response or "I think I see you now. I'm becoming Sallie."
            }
        
        # Get next question
        next_question = systems["convergence"].get_next_question()
        
        # Generate transition if available
        if "convergence_response" in systems and next_question:
            try:
                transition = systems["convergence_response"].generate_transition_to_next_question(
                    current_question_id=current_question.id if current_question else current_idx + 1,
                    next_question_id=next_question.id,
                    phase=next_question.phase.value
                )
            except Exception as e:
                logger.debug(f"[Convergence] Failed to generate transition: {e}")
        
        return {
            "status": "accepted",
            "message": "Answer submitted successfully",
            "extraction_preview": extraction_preview,
            "conversational_response": conversational_response,
            "transition": transition,
            "next_question": {
                "id": next_question.id if next_question else None,
                "phase": next_question.phase.value if next_question else None,
                "text": next_question.text if next_question else None
            } if next_question else None,
            "progress": {
                "current": session["current_index"],
                "total": len(QUESTIONS)
            }
        }
    except Exception as e:
        logger.error(f"[Convergence] Error submitting answer: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process answer: {str(e)}")

@app.post("/convergence/complete")
async def finalize_convergence():
    """Finalize Convergence and compile Heritage."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    session = systems["convergence"].session_state
    if not session.get("completed", False):
        # Check if all questions answered
        if session["current_index"] < len(QUESTIONS):
            raise HTTPException(status_code=400, detail="Not all questions have been answered")
        
        # Finalize if not already done
        systems["convergence"].finalize_convergence()
    
    # Exit Elastic Mode
    systems["convergence"].limbic.state.elastic_mode = False
    systems["convergence"].limbic.save()
    
    return {
        "status": "completed",
        "message": "Convergence finalized. Heritage compiled.",
        "heritage_files": [
            "core.json",
            "preferences.json",
            "learned.json"
        ],
        "heritage_path": str(systems["convergence"].heritage_dir)
    }

@app.get("/convergence/resume")
async def resume_convergence():
    """Resume a partially completed Convergence session."""
    if "convergence" not in systems:
        raise HTTPException(status_code=503, detail="Convergence system not available")
    
    session = systems["convergence"].session_state
    if session.get("completed", False):
        return {
            "status": "already_completed",
            "message": "Convergence has already been completed."
        }
    
    # Re-enter Elastic Mode if resuming
    if not systems["convergence"].limbic.state.elastic_mode:
        systems["convergence"].limbic.state.elastic_mode = True
        systems["convergence"].limbic.save()
    
    next_question = systems["convergence"].get_next_question()
    return {
        "status": "resumed",
        "current_index": session["current_index"],
        "total_questions": len(QUESTIONS),
        "next_question": {
            "id": next_question.id if next_question else None,
            "phase": next_question.phase.value if next_question else None,
            "text": next_question.text if next_question else None
        } if next_question else None
    }

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
    import time
    
    # 1. Add to short-term memory (Episodic)
    # We store the exchange as a single memory unit
    memory_text = f"User: {user_text}\nProgeny: {response_text}"
    systems["memory"].add(memory_text, metadata={"type": "interaction", "source": "chat"})
    
    # 2. Check for Ghost triggers
    if systems["ghost"].should_tap():
        systems["ghost"].send_notification("I have a new insight.")
    
    # 3. Sync conversation to other devices (if sync enabled)
    if "sync" in systems:
        conversation_data = {
            "user_input": user_text,
            "response": response_text,
            "limbic_state": systems["limbic"].state.model_dump(),
            "timestamp": time.time()
        }
        systems["sync"].sync_conversation(conversation_data)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
