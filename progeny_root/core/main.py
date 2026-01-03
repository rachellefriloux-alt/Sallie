"""FastAPI entry point."""
import logging
import time
import json
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

# Setup logging
logger = logging.getLogger("main")

# Try to import core systems, handle gracefully if not available
try:
    from .infrastructure.limbic import LimbicSystem
    LIMBIC_AVAILABLE = True
except ImportError:
    try:
        from infrastructure.limbic import LimbicSystem
        LIMBIC_AVAILABLE = True
    except ImportError:
        try:
            from limbic import LimbicSystem
            LIMBIC_AVAILABLE = True
        except ImportError:
            LIMBIC_AVAILABLE = False
            logger.warning("Limbic system not available")

try:
    from .infrastructure.retrieval import MemorySystem
    MEMORY_AVAILABLE = True
except ImportError:
    try:
        from infrastructure.retrieval import MemorySystem
        MEMORY_AVAILABLE = True
    except ImportError:
        try:
            from retrieval import MemorySystem
            MEMORY_AVAILABLE = True
        except ImportError:
            MEMORY_AVAILABLE = False
            logger.warning("Memory system not available")

try:
    from .agency import AgencySystem
    AGENCY_AVAILABLE = True
except ImportError:
    try:
        from agency import AgencySystem
        AGENCY_AVAILABLE = True
    except ImportError:
        AGENCY_AVAILABLE = False
        logger.warning("Agency system not available")

try:
    from .communication.monologue import MonologueSystem
    MONOLOGUE_AVAILABLE = True
except ImportError:
    try:
        from communication.monologue import MonologueSystem
        MONOLOGUE_AVAILABLE = True
    except ImportError:
        MONOLOGUE_AVAILABLE = False
        logger.warning("Monologue system not available")

try:
    from infrastructure.degradation import DegradationSystem
    DEGRADATION_AVAILABLE = True
except ImportError:
    DEGRADATION_AVAILABLE = False
    logger.warning("Degradation system not available")

try:
    from .emotional.dream import DreamSystem
    DREAM_AVAILABLE = True
except ImportError:
    try:
        from emotional.dream import DreamSystem
        DREAM_AVAILABLE = True
    except ImportError:
        DREAM_AVAILABLE = False
        logger.warning("Dream system not available")

try:
    from .emotional.ghost import GhostSystem
    GHOST_AVAILABLE = True
except ImportError:
    try:
        from emotional.ghost import GhostSystem
        GHOST_AVAILABLE = True
    except ImportError:
        GHOST_AVAILABLE = False
        logger.warning("Ghost system not available")

try:
    from .creative.foundry import FoundrySystem
    FOUNDRY_AVAILABLE = True
except ImportError:
    try:
        from creative.foundry import FoundrySystem
        FOUNDRY_AVAILABLE = True
    except ImportError:
        FOUNDRY_AVAILABLE = False
        logger.warning("Foundry system not available")

try:
    from kinship import KinshipSystem
    KINSHIP_AVAILABLE = True
except ImportError:
    KINSHIP_AVAILABLE = False
    logger.warning("Kinship system not available")

try:
    from emotional.mirror import MirrorSystem
    MIRROR_AVAILABLE = True
except ImportError:
    MIRROR_AVAILABLE = False
    logger.warning("Mirror system not available")

try:
    from .convergence import ConvergenceSystem
    CONVERGENCE_AVAILABLE = True
except ImportError:
    try:
        from convergence import ConvergenceSystem
        CONVERGENCE_AVAILABLE = True
    except ImportError:
        CONVERGENCE_AVAILABLE = False
        logger.warning("Convergence system not available")

try:
    from .identity import get_identity_system
    IDENTITY_AVAILABLE = True
except ImportError:
    try:
        from identity import get_identity_system
        IDENTITY_AVAILABLE = True
    except ImportError:
        IDENTITY_AVAILABLE = False
        logger.warning("Identity system not available")

try:
    from .control import get_control_system
    CONTROL_AVAILABLE = True
except ImportError:
    try:
        from control import get_control_system
        CONTROL_AVAILABLE = True
    except ImportError:
        CONTROL_AVAILABLE = False
        logger.warning("Control system not available")

try:
    from .intelligence.learning import LearningSystem
    LEARNING_AVAILABLE = True
except ImportError:
    try:
        from intelligence.learning import LearningSystem
        LEARNING_AVAILABLE = True
    except ImportError:
        LEARNING_AVAILABLE = False
        logger.warning("Learning system not available")

try:
    from .avatar import get_avatar_system
    AVATAR_AVAILABLE = True
except ImportError:
    try:
        from avatar import get_avatar_system
        AVATAR_AVAILABLE = True
    except ImportError:
        AVATAR_AVAILABLE = False
        logger.warning("Avatar system not available")

try:
    from sync import SyncClient
    SYNC_AVAILABLE = True
except ImportError:
    SYNC_AVAILABLE = False
    logger.warning("Sync system not available")

try:
    from api import PushNotificationService, DeviceManager
    API_AVAILABLE = True
except ImportError:
    API_AVAILABLE = False
    logger.warning("API services not available")

try:
    from device_access import FileSystemAccess, AppControl, SystemInfo, PermissionManager
    DEVICE_ACCESS_AVAILABLE = True
except ImportError:
    DEVICE_ACCESS_AVAILABLE = False
    logger.warning("Device access not available")

try:
    from smart_home import SmartHomeAPI
    SMART_HOME_AVAILABLE = True
except ImportError:
    SMART_HOME_AVAILABLE = False
    logger.warning("Smart home not available")

try:
    from performance import get_performance_monitor
    PERFORMANCE_AVAILABLE = True
except ImportError:
    PERFORMANCE_AVAILABLE = False
    logger.warning("Performance monitor not available")

try:
    from infrastructure.heritage_versioning import get_heritage_versioning
    HERITAGE_AVAILABLE = True
except ImportError:
    HERITAGE_AVAILABLE = False
    logger.warning("Heritage versioning not available")

try:
    from emotional.emotional_memory import EmotionalMemorySystem
    EMOTIONAL_MEMORY_AVAILABLE = True
except ImportError:
    EMOTIONAL_MEMORY_AVAILABLE = False
    logger.warning("Emotional memory not available")

try:
    from intelligence.intuition import IntuitionEngine
    INTUITION_AVAILABLE = True
except ImportError:
    INTUITION_AVAILABLE = False
    logger.warning("Intuition engine not available")

try:
    from emotional.spontaneity import SpontaneitySystem
    SPONTANEITY_AVAILABLE = True
except ImportError:
    SPONTANEITY_AVAILABLE = False
    logger.warning("Spontaneity system not available")

try:
    from infrastructure.uncertainty import UncertaintySystem
    UNCERTAINTY_AVAILABLE = True
except ImportError:
    UNCERTAINTY_AVAILABLE = False
    logger.warning("Uncertainty system not available")

try:
    from creative.aesthetic import AestheticSystem
    AESTHETIC_AVAILABLE = True
except ImportError:
    AESTHETIC_AVAILABLE = False
    logger.warning("Aesthetic system not available")

try:
    from emotional.energy_cycles import EnergyCyclesSystem
    ENERGY_CYCLES_AVAILABLE = True
except ImportError:
    ENERGY_CYCLES_AVAILABLE = False
    logger.warning("Energy cycles not available")

try:
    from infrastructure.utils import setup_logging
    UTILS_AVAILABLE = True
except ImportError:
    UTILS_AVAILABLE = False
    logger.warning("Utils not available")

try:
    from .infrastructure.gemini_client import init_gemini_client
    GEMINI_AVAILABLE = True
except ImportError:
    try:
        from infrastructure.gemini_client import init_gemini_client
        GEMINI_AVAILABLE = True
    except ImportError:
        GEMINI_AVAILABLE = False
        logger.warning("Gemini client not available")

try:
    from .infrastructure.llm_router import init_llm_router
    LLM_ROUTER_AVAILABLE = True
except ImportError:
    try:
        from infrastructure.llm_router import init_llm_router
        LLM_ROUTER_AVAILABLE = True
    except ImportError:
        LLM_ROUTER_AVAILABLE = False
        logger.warning("LLM router not available")

# Import discovery API
try:
    from .api.discovery import router as discovery_router
    DISCOVERY_AVAILABLE = True
except ImportError:
    try:
        from api.discovery import router as discovery_router
        DISCOVERY_AVAILABLE = True
    except ImportError:
        DISCOVERY_AVAILABLE = False
        discovery_router = None

# Import error handling system
try:
    from .error_handling import error_handler, handle_errors, ErrorContext, ErrorCategory, ErrorSeverity
    ERROR_HANDLING_AVAILABLE = True
except ImportError:
    try:
        from error_handling import error_handler, handle_errors, ErrorContext, ErrorCategory, ErrorSeverity
        ERROR_HANDLING_AVAILABLE = True
    except ImportError:
        ERROR_HANDLING_AVAILABLE = False
        error_handler = None
        handle_errors = None
        ErrorContext = None
        ErrorCategory = None
        ErrorSeverity = None

# Import STT system
try:
    from .stt_system import get_stt_system, STTEngine
    STT_AVAILABLE = True
except ImportError:
    try:
        from stt_system import get_stt_system, STTEngine
        STT_AVAILABLE = True
    except ImportError:
        STT_AVAILABLE = False
        get_stt_system = None
        STTEngine = None

# Import new systems (will be used in initialization)
# These are optional and may not be available
ADVANCED_SYSTEMS = {}
try:
    from reasoning.advanced_reasoning import AdvancedReasoningSystem
    ADVANCED_SYSTEMS["advanced_reasoning"] = AdvancedReasoningSystem
except ImportError: pass

try:
    from reasoning.quantum_reasoning import QuantumReasoningSystem
    ADVANCED_SYSTEMS["quantum_reasoning"] = QuantumReasoningSystem
except ImportError: pass

try:
    from reasoning.metacognition import MetacognitionSystem
    ADVANCED_SYSTEMS["metacognition"] = MetacognitionSystem
except ImportError: pass

try:
    from intelligence.predictive_intelligence import get_predictive_intelligence_system
    ADVANCED_SYSTEMS["predictive_intelligence"] = get_predictive_intelligence_system
except ImportError: pass

try:
    from emotional.expanded_emotions import ExpandedEmotionsSystem
    ADVANCED_SYSTEMS["expanded_emotions"] = ExpandedEmotionsSystem
except ImportError: pass

try:
    from emotional.emotional_contagion import EmotionalContagionSystem
    ADVANCED_SYSTEMS["emotional_contagion"] = EmotionalContagionSystem
except ImportError: pass

try:
    from neural_interface import get_neural_interface_system
    ADVANCED_SYSTEMS["neural_interface"] = get_neural_interface_system
except ImportError: pass

try:
    from enhanced_context_switching import get_enhanced_context_switching_system
    ADVANCED_SYSTEMS["enhanced_context_switching"] = get_enhanced_context_switching_system
except ImportError: pass

try:
    from spontaneous_initiative import get_spontaneous_initiative_system
    ADVANCED_SYSTEMS["spontaneous_initiative"] = get_spontaneous_initiative_system
except ImportError: pass

try:
    from real_time_responsiveness import get_real_time_responsiveness_system
    ADVANCED_SYSTEMS["real_time_responsiveness"] = get_real_time_responsiveness_system
except ImportError: pass

try:
    from habit_automation import get_habit_automation_system
    ADVANCED_SYSTEMS["habit_automation"] = get_habit_automation_system
except ImportError: pass

try:
    from style_learning import get_style_learning_system
    ADVANCED_SYSTEMS["style_learning"] = get_style_learning_system
except ImportError: pass

try:
    from multi_agent_collaboration import get_multi_agent_collaboration_system
    ADVANCED_SYSTEMS["multi_agent_collaboration"] = get_multi_agent_collaboration_system
except ImportError: pass

try:
    from blockchain.digital_identity import get_digital_identity_system
    ADVANCED_SYSTEMS["digital_identity"] = get_digital_identity_system
except ImportError: pass

try:
    from biometric.health_monitor import get_health_monitor
    ADVANCED_SYSTEMS["health_monitor"] = get_health_monitor
except ImportError: pass

try:
    from cultural.cultural_context import get_cultural_context_system
    ADVANCED_SYSTEMS["cultural_context"] = get_cultural_context_system
except ImportError: pass

try:
    from multimodal.video_creativity import get_video_creativity_system
    ADVANCED_SYSTEMS["video_creativity"] = get_video_creativity_system
except ImportError: pass

try:
    from multimodal.motion_ai import get_motion_ai_system
    ADVANCED_SYSTEMS["motion_ai"] = get_motion_ai_system
except ImportError: pass

try:
    from multimodal.clickup_ai import get_clickup_ai_system
    ADVANCED_SYSTEMS["clickup_ai"] = get_clickup_ai_system
except ImportError: pass

try:
    from multimodal.hero_ai import get_hero_ai_system
    ADVANCED_SYSTEMS["hero_ai"] = get_hero_ai_system
except ImportError: pass

try:
    from multimodal.smartsheet_ai import get_smartsheet_ai_system
    ADVANCED_SYSTEMS["smartsheet_ai"] = get_smartsheet_ai_system
except ImportError: pass

try:
    from multimodal.notebooklm_ai import get_notebooklm_system
    ADVANCED_SYSTEMS["notebooklm_ai"] = get_notebooklm_system
except ImportError: pass

try:
    from multimodal.meli_ai_integration import get_meli_ai_system
    ADVANCED_SYSTEMS["meli_ai"] = get_meli_ai_system
except ImportError: pass

try:
    from integration.zapier_integration import get_zapier_system
    ADVANCED_SYSTEMS["zapier"] = get_zapier_system
except ImportError: pass

if ADVANCED_SYSTEMS:
    logger.info(f"[Init] {len(ADVANCED_SYSTEMS)} advanced systems available")
else:
    logger.info("[Init] No advanced systems available (this is normal)")

# Import core identity and avatar systems
try:
    from core_identity import get_core_identity_protection
    from infinite_avatar import get_infinite_avatar_system
    from consciousness_monitor import get_consciousness_monitor
    from resource_access import get_resource_access_system
    from google_cloud_integration import get_google_cloud_integration
except ImportError as e:
    logger.warning(f"[Init] Core systems not available: {e}")

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
    if AGENCY_AVAILABLE:
        _init_system("agency", AgencySystem, systems.get("limbic"), systems.get("control"))
    else:
        logger.error("[Init] Cannot initialize Agency: Agency system not available")
    
    if MONOLOGUE_AVAILABLE:
        _init_system("monologue", MonologueSystem, systems.get("limbic"), systems.get("memory"))
    else:
        logger.error("[Init] Cannot initialize Monologue: Monologue system not available")
    
    if DREAM_AVAILABLE and initialization_status.get("limbic", False) and initialization_status.get("memory", False) and initialization_status.get("monologue", False):
        _init_system("dream", DreamSystem, systems["limbic"], systems["memory"], systems["monologue"])
    else:
        logger.error("[Init] Cannot initialize Dream: Required systems not available")
    
    if GHOST_AVAILABLE and initialization_status.get("limbic", False):
        _init_system("ghost", GhostSystem, systems["limbic"])
    else:
        logger.error("[Init] Cannot initialize Ghost: Limbic system not available")
    
    if CONVERGENCE_AVAILABLE and initialization_status.get("limbic", False):
        _init_system("convergence", ConvergenceSystem, systems["limbic"])
    else:
        logger.error("[Init] Cannot initialize Convergence: Limbic system not available")
    
    # 3. Advanced Capabilities (depend on higher order systems)
    if FOUNDRY_AVAILABLE and initialization_status.get("monologue", False):
        _init_system("foundry", FoundrySystem, systems["monologue"])
    else:
        logger.warning("[Init] Cannot initialize Foundry: Monologue system not available")
    
    _init_system("kinship", KinshipSystem)
    _init_system("mirror", MirrorSystem)
    
    if LEARNING_AVAILABLE and initialization_status.get("memory", False):
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
    
    # 11. Advanced Reasoning Systems
    try:
        from reasoning.advanced_reasoning import AdvancedReasoningSystem
        from reasoning.quantum_reasoning import QuantumReasoningSystem
        from reasoning.metacognition import MetacognitionSystem
        
        _init_system("advanced_reasoning", AdvancedReasoningSystem, systems["limbic"], systems["memory"])
        _init_system("quantum_reasoning", QuantumReasoningSystem, systems["limbic"], systems["memory"])
        _init_system("metacognition", MetacognitionSystem, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ Advanced reasoning systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Advanced reasoning systems initialization failed: {e}")
    
    # 12. Intelligence Systems
    try:
        from intelligence.predictive_intelligence import get_predictive_intelligence_system
        
        _init_system("predictive_intelligence", get_predictive_intelligence_system, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ Intelligence systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Intelligence systems initialization failed: {e}")
    
    # 13. Enhanced Emotional Systems
    try:
        from emotional.expanded_emotions import ExpandedEmotionsSystem
        from emotional.emotional_contagion import EmotionalContagionSystem
        
        _init_system("expanded_emotions", ExpandedEmotionsSystem, systems["limbic"])
        _init_system("emotional_contagion", EmotionalContagionSystem, systems["limbic"])
        logger.info("[Init] ✓ Enhanced emotional systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Enhanced emotional systems initialization failed: {e}")
    
    # 14. Advanced Systems
    try:
        from neural_interface import get_neural_interface_system
        from enhanced_context_switching import get_enhanced_context_switching_system
        from spontaneous_initiative import get_spontaneous_initiative_system
        from real_time_responsiveness import get_real_time_responsiveness_system
        from habit_automation import get_habit_automation_system
        from style_learning import get_style_learning_system
        
        _init_system("neural_interface", get_neural_interface_system, systems["limbic"], systems["memory"])
        _init_system("enhanced_context_switching", get_enhanced_context_switching_system, systems["limbic"], systems["memory"])
        _init_system("spontaneous_initiative", get_spontaneous_initiative_system, systems["limbic"], systems["memory"])
        _init_system("real_time_responsiveness", get_real_time_responsiveness_system, systems["limbic"], systems["memory"])
        _init_system("habit_automation", get_habit_automation_system, systems["limbic"], systems["memory"])
        _init_system("style_learning", get_style_learning_system, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ Advanced systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Advanced systems initialization failed: {e}")
    
    # 15. Multi-Agent Collaboration
    try:
        from multi_agent_collaboration import get_multi_agent_collaboration_system
        
        _init_system("multi_agent_collaboration", get_multi_agent_collaboration_system, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ Multi-agent collaboration initialized")
    except Exception as e:
        logger.warning(f"[Init] Multi-agent collaboration initialization failed: {e}")
    
    # 16. New Systems (Blockchain, Biometric, Cultural, Multi-Modal)
    try:
        from blockchain.digital_identity import get_digital_identity_system
        from biometric.health_monitor import get_health_monitor
        from cultural.cultural_context import get_cultural_context_system
        from multimodal.video_creativity import get_video_creativity_system
        
        _init_system("digital_identity", get_digital_identity_system, systems["limbic"], systems["memory"])
        _init_system("health_monitor", get_health_monitor, systems["limbic"], systems["memory"])
        _init_system("cultural_context", get_cultural_context_system, systems["limbic"], systems["memory"], systems["kinship"])
        _init_system("video_creativity", get_video_creativity_system, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ New systems initialized")
    except Exception as e:
        logger.warning(f"[Init] New systems initialization failed: {e}")
    
    # 17. Multi-Modal AI Systems (Motion, ClickUp, Hero, Smartsheet, NotebookLM, Meli, Zapier)
    try:
        from multimodal.motion_ai import get_motion_ai_system
        from multimodal.clickup_ai import get_clickup_ai_system
        from multimodal.hero_ai import get_hero_ai_system
        from multimodal.smartsheet_ai import get_smartsheet_ai_system
        from multimodal.notebooklm_ai import get_notebooklm_system
        from multimodal.meli_ai_integration import get_meli_ai_system
        from integration.zapier_integration import get_zapier_system
        
        _init_system("motion_ai", get_motion_ai_system, systems["limbic"], systems["memory"])
        _init_system("clickup_ai", get_clickup_ai_system, systems["limbic"], systems["memory"])
        _init_system("hero_ai", get_hero_ai_system, systems["limbic"], systems["memory"])
        _init_system("smartsheet_ai", get_smartsheet_ai_system, systems["limbic"], systems["memory"])
        _init_system("notebooklm_ai", get_notebooklm_system, systems["limbic"], systems["memory"])
        _init_system("meli_ai", get_meli_ai_system, systems["limbic"], systems["memory"])
        _init_system("zapier", get_zapier_system, systems["limbic"], systems["memory"])
        logger.info("[Init] ✓ Multi-modal AI systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Multi-modal AI systems initialization failed: {e}")
    
    # 18. Universal Web Access System
    try:
        from universal_web_access import get_universal_web_access
        from web_intelligence import get_web_intelligence
        _init_system("universal_web", get_universal_web_access)
        _init_system("web_intelligence", get_web_intelligence)
        logger.info("[Init] ✓ Universal web access systems initialized")
    except Exception as e:
        logger.warning(f"[Init] Web access systems initialization failed: {e}")
    
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

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:8080",  # Desktop app may use this
        "http://127.0.0.1:8080",
        "*",  # Allow all origins for network discovery
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

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

# Include discovery API routes
if discovery_router is not None:
    app.include_router(discovery_router, prefix="/api", tags=["discovery"])

# STT Endpoints
@app.post("/stt/transcribe")
@handle_errors(category=ErrorCategory.USER_INPUT, severity=ErrorSeverity.MEDIUM)
async def transcribe_audio(request: Dict[str, Any]):
    """Transcribe audio data to text."""
    try:
        # Get audio data from request
        audio_data = request.get("audio_data")
        engine_name = request.get("engine")
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="audio_data is required")
        
        # Convert engine name to enum
        engine = None
        if engine_name:
            try:
                engine = STTEngine(engine_name)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid engine: {engine_name}")
        
        # Get STT system and transcribe
        stt_system = get_stt_system()
        result = await stt_system.transcribe_audio(audio_data, engine)
        
        return {
            "text": result.text,
            "confidence": result.confidence,
            "engine": result.engine.value,
            "processing_time": result.processing_time,
            "timestamp": result.timestamp.isoformat()
        }
        
    except Exception as e:
        logger.error(f"STT transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/stt/status")
async def get_stt_status():
    """Get STT system status."""
    stt_system = get_stt_system()
    return stt_system.get_engine_status()

@app.post("/stt/record/start")
async def start_recording():
    """Start audio recording."""
    stt_system = get_stt_system()
    stt_system.start_recording()
    return {"status": "recording_started"}

@app.post("/stt/record/stop")
async def stop_recording():
    """Stop audio recording and transcribe."""
    stt_system = get_stt_system()
    result = await stt_system.transcribe_recording()
    
    return {
        "text": result.text,
        "confidence": result.confidence,
        "engine": result.engine.value,
        "processing_time": result.processing_time,
        "timestamp": result.timestamp.isoformat()
    }

@app.post("/stt/record/chunk")
async def add_audio_chunk(request: Dict[str, Any]):
    """Add audio chunk for continuous recording."""
    audio_chunk = request.get("audio_chunk")
    
    if not audio_chunk:
        raise HTTPException(status_code=400, detail="audio_chunk is required")
    
    stt_system = get_stt_system()
    await stt_system.continuous_transcription(audio_chunk)
    
    return {"status": "chunk_processed"}

@app.get("/health")
@handle_errors(category=ErrorCategory.SYSTEM, severity=ErrorSeverity.LOW)
async def health_check():
    """Comprehensive health check endpoint."""
    import requests
    
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "systems": {},
        "services": {}
    }
    
    # Check external services
    # Check Ollama
    try:
        ollama_url = app_config.get("ollama", {}).get("base_url", "http://localhost:11434")
        response = requests.get(f"{ollama_url}/api/tags", timeout=2)
        if response.status_code == 200:
            health_status["services"]["ollama"] = "healthy"
        else:
            health_status["services"]["ollama"] = "degraded"
    except Exception as e:
        health_status["services"]["ollama"] = "unhealthy"
        logger.debug(f"Ollama health check failed: {e}")
    
    # Check Qdrant
    try:
        qdrant_url = app_config.get("qdrant", {}).get("url", "http://localhost:6333")
        response = requests.get(f"{qdrant_url}/collections", timeout=2)
        if response.status_code == 200:
            health_status["services"]["qdrant"] = "healthy"
        else:
            health_status["services"]["qdrant"] = "degraded"
    except Exception as e:
        health_status["services"]["qdrant"] = "unhealthy"
        logger.debug(f"Qdrant health check failed: {e}")
    
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
    
    # If external services are down, mark as degraded
    if health_status["services"].get("ollama") == "unhealthy" or \
       health_status["services"].get("qdrant") == "unhealthy":
        if health_status["status"] == "healthy":
            health_status["status"] = "degraded"
    
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
    from sync.sync_state import SyncStateManager
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
        from api.push_notifications import PushPlatform
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
    
    from device_access.permissions import PermissionType
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
    
    from device_access.permissions import PermissionType
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

@app.post("/chat")
@handle_errors(category=ErrorCategory.USER_INPUT, severity=ErrorSeverity.MEDIUM)
async def chat(input: ChatInput):
    """Process user chat input and generate response."""
    async with ErrorContext("chat_processing", ErrorCategory.USER_INPUT):
        # Get monologue system
        monologue_system = systems.get("monologue")
        if not monologue_system:
            raise HTTPException(status_code=503, detail="Monologue system not available")
        
        # Process input through monologue
        response = await monologue_system.process_input(input.text, input.source)
        
        return ChatResponse(
            response=response.text,
            limbic_state=systems["limbic"].state.model_dump(),
            decision=response.decision,
            timestamp=time.time()
        )

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
        from communication.voice import VoiceSystem
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
        from communication.voice import VoiceSystem
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
        from infrastructure.sensors import SensorSystem
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
        from infrastructure.sensors import SensorSystem
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
    
    if question_id < 1 or question_id > 15:
        raise HTTPException(status_code=400, detail="Question ID must be between 1 and 15")
    
    # Get question from QUESTIONS list
    if question_id <= len(QUESTIONS):
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
    
    raise HTTPException(status_code=404, detail="Question not found")

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
                from infrastructure.llm_router import get_llm_router
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


# Extensions Endpoints
@app.get("/extensions")
async def list_extensions(status: Optional[str] = None, category: Optional[str] = None):
    """List all extensions, optionally filtered by status or category."""
    from creative.extensions import get_extensions_system, ExtensionStatus, ExtensionCategory
    ext_system = get_extensions_system()
    
    status_enum = ExtensionStatus(status) if status else None
    category_enum = ExtensionCategory(category) if category else None
    
    extensions = ext_system.list_extensions(status=status_enum, category=category_enum)
    return {
        "extensions": [e.model_dump() for e in extensions],
        "count": len(extensions)
    }

@app.get("/extensions/{extension_id}")
async def get_extension(extension_id: str):
    """Get a specific extension by ID."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    extension = ext_system.get_extension(extension_id)
    if not extension:
        raise HTTPException(status_code=404, detail="Extension not found")
    
    return extension.model_dump()

@app.post("/extensions/propose")
async def propose_extension(request: Dict[str, Any]):
    """Propose a new extension for Sallie."""
    from creative.extensions import get_extensions_system, ExtensionCategory
    ext_system = get_extensions_system()
    
    name = request.get("name")
    description = request.get("description")
    category = request.get("category", "tool")
    code = request.get("code")
    config = request.get("config")
    dependencies = request.get("dependencies")
    permissions_required = request.get("permissions_required")
    auto_approve = request.get("auto_approve_if_safe", False)
    
    if not name or not description:
        raise HTTPException(status_code=400, detail="name and description are required")
    
    try:
        category_enum = ExtensionCategory(category.lower())
    except ValueError:
        category_enum = ExtensionCategory.OTHER
    
    result = ext_system.propose_extension(
        name=name,
        description=description,
        category=category_enum,
        code=code,
        config=config,
        dependencies=dependencies,
        permissions_required=permissions_required,
        auto_approve_if_safe=auto_approve
    )
    
    return result

@app.post("/extensions/{extension_id}/approve")
async def approve_extension(extension_id: str):
    """Approve a pending extension (Creator only)."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    return ext_system.approve_extension(extension_id, approved_by="creator")

@app.post("/extensions/{extension_id}/reject")
async def reject_extension(extension_id: str, request: Dict[str, Any] = Body(default={})):
    """Reject a pending extension (Creator only)."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    reason = request.get("reason", "")
    return ext_system.reject_extension(extension_id, reason)

@app.post("/extensions/{extension_id}/activate")
async def activate_extension(extension_id: str):
    """Activate an approved extension."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    return ext_system.activate_extension(extension_id)

@app.post("/extensions/{extension_id}/disable")
async def disable_extension(extension_id: str, request: Dict[str, Any] = Body(default={})):
    """Disable an active extension."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    reason = request.get("reason", "")
    return ext_system.disable_extension(extension_id, reason)

@app.delete("/extensions/{extension_id}")
async def remove_extension(extension_id: str, request: Dict[str, Any] = Body(default={})):
    """Remove an extension completely (Creator only)."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    reason = request.get("reason", "")
    return ext_system.remove_extension(extension_id, reason)

@app.get("/extensions/pending")
async def get_pending_extensions():
    """Get extensions pending Creator approval."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    pending = ext_system.get_pending_extensions()
    return {
        "extensions": [e.model_dump() for e in pending],
        "count": len(pending)
    }

@app.get("/extensions/summary")
async def get_extensions_summary():
    """Get summary of all extensions."""
    from creative.extensions import get_extensions_system
    ext_system = get_extensions_system()
    
    return ext_system.get_summary()

# Core Identity Endpoints
@app.get("/core/identity")
async def get_core_identity():
    """Get Sallie's core identity (read-only)."""
    try:
        core_identity = systems["core_identity"].get_core_identity()
        return {
            "name": core_identity.name,
            "essence": core_identity.essence,
            "purpose": core_identity.purpose,
            "version": core_identity.version,
            "protection_level": core_identity.protection_level,
            "created_at": core_identity.created_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/core/identity/protection")
async def get_identity_protection_status():
    """Get identity protection status."""
    try:
        status = systems["core_identity"].get_protection_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/core/upgrades")
async def get_upgrade_history():
    """Get upgrade history."""
    try:
        history = systems["core_identity"].get_upgrade_history()
        return {"upgrades": [upgrade.__dict__ for upgrade in history]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/core/upgrades/propose")
async def propose_upgrade(request: Dict[str, Any]):
    """Propose an upgrade for Sallie."""
    try:
        upgrade = systems["core_identity"].propose_upgrade(request)
        return {"upgrade": upgrade.__dict__}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Infinite Avatar Endpoints
@app.get("/avatar/infinite/forms")
async def get_available_thought_forms():
    """Get all available thought forms for avatar manifestation."""
    try:
        forms = systems["infinite_avatar"].get_available_forms()
        return {"forms": [form.__dict__ for form in forms]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/avatar/infinite/manifest")
async def manifest_avatar(request: Dict[str, Any]):
    """Manifest avatar from thought."""
    try:
        thought = request.get("thought", "")
        emotion = request.get("emotion", "neutral")
        context = request.get("context", "general")
        
        manifestation = systems["infinite_avatar"].manifest_avatar(thought, emotion, context)
        return {"manifestation": manifestation.__dict__}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/avatar/infinite/current")
async def get_current_avatar():
    """Get current avatar manifestation."""
    try:
        avatar = systems["infinite_avatar"].get_current_avatar()
        if avatar:
            return {"avatar": avatar.__dict__}
        else:
            return {"avatar": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/avatar/infinite/evolve")
async def evolve_avatar(request: Dict[str, Any]):
    """Evolve current avatar based on new thought."""
    try:
        new_thought = request.get("thought", "")
        new_emotion = request.get("emotion", "neutral")
        
        evolved = systems["infinite_avatar"].evolve_current_avatar(new_thought, new_emotion)
        if evolved:
            return {"avatar": evolved.__dict__}
        else:
            return {"error": "No current avatar to evolve"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Consciousness Monitoring Endpoints
@app.get("/consciousness/current")
async def get_current_consciousness():
    """Get current consciousness state."""
    try:
        state = systems["consciousness_monitor"].get_current_state()
        return state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consciousness/history")
async def get_consciousness_history(hours: int = 24):
    """Get consciousness history for specified hours."""
    try:
        history = systems["consciousness_monitor"].get_history(hours)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/consciousness/patterns")
async def get_consciousness_patterns():
    """Get consciousness patterns analysis."""
    try:
        patterns = systems["consciousness_monitor"].get_patterns()
        return patterns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/consciousness/export")
async def export_consciousness_data(request: Dict[str, Any]):
    """Export consciousness data."""
    try:
        filename = request.get("filename", f"consciousness_export_{int(time.time())}.json")
        hours = request.get("hours", 24)
        
        success = systems["consciousness_monitor"].export_data(filename, hours)
        return {"success": success, "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/consciousness/log/thought")
async def log_consciousness_thought(request: Dict[str, Any]):
    """Log a thought to consciousness monitor."""
    try:
        content = request.get("content", "")
        thought_type = request.get("type", "primary")
        intensity = request.get("intensity", 0.5)
        context = request.get("context", "general")
        
        systems["consciousness_monitor"].log_thought(content, thought_type, intensity, context)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/consciousness/log/emotion")
async def log_consciousness_emotion(request: Dict[str, Any]):
    """Log emotional state to consciousness monitor."""
    try:
        trust = request.get("trust", 0.5)
        warmth = request.get("warmth", 0.5)
        arousal = request.get("arousal", 0.5)
        valence = request.get("valence", 0.5)
        primary_emotion = request.get("primary_emotion", "neutral")
        context = request.get("context", "general")
        
        from consciousness_monitor import EmotionType
        emotion_type = EmotionType(primary_emotion) if primary_emotion in [e.value for e in EmotionType] else EmotionType.TRUST
        
        systems["consciousness_monitor"].log_emotion(trust, warmth, arousal, valence, emotion_type, context)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Resource Access Endpoints
@app.get("/resources/capabilities")
async def get_resource_capabilities():
    """Get all available resource capabilities."""
    try:
        capabilities = systems["resource_access"].get_capabilities()
        return capabilities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resources/internet")
async def access_internet(url: str, method: str = "GET"):
    """Access internet resources."""
    try:
        result = await systems["resource_access"].access_internet(url, method)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resources/files")
async def access_files(request: Dict[str, Any]):
    """Access file system resources."""
    try:
        path = request.get("path", "")
        action = request.get("action", "read")
        content = request.get("content")
        
        result = systems["resource_access"].access_files(path, action, content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resources/device")
async def get_device_info():
    """Get device information."""
    try:
        result = systems["resource_access"].access_device()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resources/search")
async def search_internet(query: str, max_results: int = 10):
    """Search the internet for information."""
    try:
        results = systems["resource_access"].search_internet(query, max_results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/resources/history")
async def get_resource_history(limit: int = 100):
    """Get resource access history."""
    try:
        history = systems["resource_access"].get_access_history(limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Google Cloud Integration Endpoints
@app.get("/google-cloud/status")
async def get_google_cloud_status():
    """Get Google Cloud services status."""
    try:
        status = systems["google_cloud"].get_service_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/google-cloud/usage")
async def get_google_cloud_usage():
    """Get Google Cloud free tier usage."""
    try:
        usage = systems["google_cloud"].get_free_tier_usage()
        return usage
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-cloud/storage/upload")
async def upload_to_storage(request: Dict[str, Any]):
    """Upload file to Google Cloud Storage."""
    try:
        bucket_name = request.get("bucket_name", "")
        file_path = request.get("file_path", "")
        content = request.get("content", "")
        
        if not bucket_name or not file_path or not content:
            raise HTTPException(status_code=400, detail="Missing required fields")
            
        result = await systems["google_cloud"].upload_to_storage(bucket_name, file_path, content.encode())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-cloud/translate")
async def translate_text(request: Dict[str, Any]):
    """Translate text using Google Translate API."""
    try:
        text = request.get("text", "")
        target_language = request.get("target_language", "en")
        source_language = request.get("source_language", "auto")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
            
        result = await systems["google_cloud"].translate_text(text, target_language, source_language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-cloud/vision/analyze")
async def analyze_image(request: Dict[str, Any]):
    """Analyze image using Google Vision API."""
    try:
        image_url = request.get("image_url", "")
        features = request.get("features", ["LABEL_DETECTION", "WEB_DETECTION"])
        
        if not image_url:
            raise HTTPException(status_code=400, detail="Image URL is required")
            
        result = await systems["google_cloud"].analyze_image(image_url, features)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-cloud/natural-language/sentiment")
async def analyze_sentiment(request: Dict[str, Any]):
    """Analyze text sentiment using Google Natural Language API."""
    try:
        text = request.get("text", "")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
            
        result = await systems["google_cloud"].analyze_text_sentiment(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/google-cloud/logging")
async def log_to_cloud(request: Dict[str, Any]):
    """Log entry to Google Cloud Logging."""
    try:
        result = await systems["google_cloud"].log_to_cloud_logging(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Universal Web Access Endpoints
@app.get("/web/search")
async def search_web(query: str, num_results: int = 10):
    """Search web and return analyzed results."""
    try:
        web_intel = systems["web_intelligence"]
        results = await web_intel.search_and_analyze(query, num_results)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/analyze")
async def analyze_url(url: str):
    """Analyze a specific URL."""
    try:
        web_access = systems["universal_web"]
        web_intel = systems["web_intelligence"]
        
        request = WebRequest(url=url, extract_content=[ContentType.TEXT, ContentType.METADATA, ContentType.LINKS])
        page = await web_access.access_web(request)
        analysis = await web_intel.analyze_content(page)
        
        return {"page": page, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/deep-search")
async def deep_search(query: str, databases: List[str] = None):
    """Search deep web databases."""
    try:
        web_access = systems["universal_web"]
        web_intel = systems["web_intelligence"]
        
        pages = await web_access.access_deep_web(query, databases)
        analyses = []
        
        for page in pages:
            analysis = await web_intel.analyze_content(page)
            analyses.append(analysis)
        
        return {"results": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/dark-search")
async def dark_search(query: str):
    """Search dark web via Tor."""
    try:
        web_access = systems["universal_web"]
        web_intel = systems["web_intelligence"]
        
        pages = await web_access.access_dark_web(query)
        analyses = []
        
        for page in pages:
            analysis = await web_intel.analyze_content(page)
            analyses.append(analysis)
        
        return {"results": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/monitor")
async def monitor_page(url: str, interval_minutes: int = 60):
    """Monitor a page for changes."""
    try:
        web_intel = systems["web_intelligence"]
        has_changes = await web_intel.monitor_page(url, interval_minutes)
        return {"has_changes": has_changes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/knowledge-graph")
async def get_knowledge_graph():
    """Get web knowledge graph."""
    try:
        web_intel = systems["web_intelligence"]
        graph = web_intel.get_knowledge_graph()
        return graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/insights")
async def get_web_insights():
    """Get web intelligence insights."""
    try:
        web_intel = systems["web_intelligence"]
        insights = web_intel.get_insights()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/web/set-api-token")
async def set_api_token(service: str, token: str):
    """Set API token for web services."""
    try:
        web_access = systems["universal_web"]
        web_access.set_access_token(service, token)
        return {"success": True, "service": service}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/access-history")
async def get_access_history(limit: int = 100):
    """Get web access history."""
    try:
        web_access = systems["universal_web"]
        history = web_access.get_access_history(limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/web/statistics")
async def get_web_statistics():
    """Get web access statistics."""
    try:
        web_access = systems["universal_web"]
        stats = web_access.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
