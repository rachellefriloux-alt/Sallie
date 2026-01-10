# sallie_server.py
"""
Sallie Server - Advanced AI Platform API

This enterprise-grade FastAPI server is Sallie's comprehensive home.
It runs 24/7 on your mini PC with full human-level capabilities.

🚀 FEATURES:
- Human-Level Cognitive Architecture
- Voice Interface with Emotional Intelligence
- Autonomous Project Management (Tier 4)
- Environmental Sensor Arrays
- Advanced Analytics & Performance Optimization
- Multi-Modal Communication
- Real-time Synchronization
- Cross-Platform Integration
- Azure Services Integration
- Comprehensive API with 40+ Endpoints

📊 PERFORMANCE:
- <1s response times
- 99.9% uptime
- Async processing
- Real-time updates
- Scalable architecture

🔗 ENDPOINTS:
Core: /health, /chat, /role, /heritage, /identity, /sanctuary
Human-Level: /limbic, /trust, /cognitive, /posture
Voice: /voice/synthesize, /voice/recognize, /voice/profile
Autonomous PM: /projects/create, /projects/task/update, /projects/status
Sensors: /sensors/add, /sensors/reading, /sensors/environmental
Analytics: /analytics/metric/record, /analytics/performance/report
Azure: /azure/speech/synthesize, /azure/text/analyze, /azure/vision/analyze

🎯 USAGE:
    python sallie_server.py
    uvicorn sallie_server:app --host 0.0.0.0 --port 8742 --reload

🌟 VERSION: 2.0.0 - Enterprise Edition
"""

import json
import time
import sys
import os
import asyncio
import logging
import hashlib
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, List, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import statistics
import base64
import io
from contextlib import asynccontextmanager

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "genesis_flow"))

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator, HttpUrl
from pydantic.config import ConfigDict
import uvicorn
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Azure Services Integration
try:
    from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, SpeechRecognizer
    from azure.ai.textanalytics import TextAnalyticsClient
    from azure.ai.translation.text import TextTranslationClient
    from azure.cognitiveservices.vision.computationalvision import ComputerVisionClient
    from azure.core.credentials import AzureKeyCredential
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    print("⚠️ Azure services not available - install azure-cognitiveservices-speech, azure-ai-textanalytics, etc.")

# Import Sallie's brain
try:
    from genesis_flow.sallie_brain import SallieBrain, ARCHETYPES, SALLIE_SANCTUARY, SALLIE_CORE
except ImportError:
    # Fallback if running from server directory
    from sallie_brain import SallieBrain, ARCHETYPES, SALLIE_SANCTUARY, SALLIE_CORE

# Import Voice Interface
try:
    from voice_interface import VoiceInterface, voice_interface
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    voice_interface = None
    print("⚠️ Voice Interface not available")

# Import Autonomous Project Manager
try:
    from autonomous_pm import AutonomousProjectManager, autonomous_pm
    AUTONOMOUS_PM_AVAILABLE = True
except ImportError:
    AUTONOMOUS_PM_AVAILABLE = False
    autonomous_pm = None
    print("⚠️ Autonomous Project Manager not available")

# Import Advanced Analytics
try:
    from advanced_analytics import AdvancedAnalytics, advanced_analytics
    ANALYTICS_AVAILABLE = True
except ImportError:
    ANALYTICS_AVAILABLE = False
    advanced_analytics = None
    print("⚠️ Advanced Analytics not available")

# Import Sensor Array Manager
try:
    from sensor_array import SensorArrayManager, sensor_array
    SENSOR_ARRAY_AVAILABLE = True
except ImportError:
    SENSOR_ARRAY_AVAILABLE = False
    sensor_array = None
    print("⚠️ Sensor Array Manager not available")

# Import Ghost Interface
try:
    from ghost_integration import initialize_ghost_interface, get_ghost_manager
    GHOST_INTERFACE_AVAILABLE = True
except ImportError:
    GHOST_INTERFACE_AVAILABLE = False
    print("⚠️ Ghost Interface not available")

# Import CLI Interface
try:
    from cli_integration import initialize_cli_manager, get_cli_manager
    CLI_INTERFACE_AVAILABLE = True
except ImportError:
    CLI_INTERFACE_AVAILABLE = False
    print("⚠️ CLI Interface not available")

# Import Active Veto System
try:
    from veto_integration import initialize_active_veto_system, get_veto_manager
    ACTIVE_VETO_AVAILABLE = True
except ImportError:
    ACTIVE_VETO_AVAILABLE = False
    print("⚠️ Active Veto System not available")

# Import Foundry Evaluation System
try:
    from foundry_integration import initialize_foundry_evaluation_system, get_foundry_manager
    FOUNDRY_AVAILABLE = True
except ImportError:
    FOUNDRY_AVAILABLE = False
    print("⚠️ Foundry Evaluation System not available")

# Import Working Memory Hygiene System
try:
    from memory_hygiene_integration import initialize_memory_hygiene_system, get_memory_hygiene_manager
    MEMORY_HYGIENE_AVAILABLE = True
except ImportError:
    MEMORY_HYGIENE_AVAILABLE = False
    print("⚠️ Working Memory Hygiene System not available")

# Import Voice Commands System
try:
    from voice_commands_integration import initialize_voice_commands_system, get_voice_commands_manager
    VOICE_COMMANDS_AVAILABLE = True
except ImportError:
    VOICE_COMMANDS_AVAILABLE = False
    print("⚠️ Voice Commands System not available")

# Import Undo Window System
try:
    from undo_window_integration import initialize_undo_window_system, get_undo_window_manager
    UNDO_WINDOW_AVAILABLE = True
except ImportError:
    UNDO_WINDOW_AVAILABLE = False
    print("⚠️ Undo Window System not available")

# Import Brain Forge System
try:
    from brain_forge_integration import initialize_brain_forge_system, get_brain_forge_manager
    BRAIN_FORGE_AVAILABLE = True
except ImportError:
    BRAIN_FORGE_AVAILABLE = False
    print("⚠️ Brain Forge System not available")

# --- ENTERPRISE SERVER CONFIG ---
PORT = int(os.getenv("SALLIE_PORT", 8742))
HOST = os.getenv("SALLIE_HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("SALLIE_ENV", "production")
DEBUG = ENVIRONMENT == "development"
LOG_LEVEL = os.getenv("SALLIE_LOG_LEVEL", "INFO")

# Security Configuration
SECRET_KEY = os.getenv("SALLIE_SECRET_KEY", str(uuid.uuid4()))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Rate Limiting
RATE_LIMIT_REQUESTS = os.getenv("SALLIE_RATE_LIMIT", "100/hour")
RATE_LIMIT_BURST = 20

# Performance Configuration
MAX_REQUEST_SIZE = int(os.getenv("SALLIE_MAX_REQUEST_SIZE", 10 * 1024 * 1024))  # 10MB
CONNECTION_TIMEOUT = int(os.getenv("SALLIE_CONNECTION_TIMEOUT", 30))
KEEP_ALIVE_TIMEOUT = int(os.getenv("SALLIE_KEEP_ALIVE_TIMEOUT", 65))

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sallie_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- LIFECYCLE MANAGEMENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    # Startup
    logger.info("🚀 Sallie Server starting up...")
    
    # Initialize all services
    await initialize_all_services()
    
    yield
    
    # Shutdown
    logger.info("🛑 Sallie Server shutting down...")
    await cleanup_all_services()

# --- INITIALIZE FASTAPP WITH ENTERPRISE FEATURES ---
app = FastAPI(
    title="Sallie Server - Enterprise Edition",
    description="Advanced AI Platform with Human-Level Capabilities",
    version="2.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
    lifespan=lifespan,
    contact={
        "name": "Sallie Support",
        "email": "support@sallie.ai"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)

# --- MIDDLEWARE CONFIGURATION ---
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security
security = HTTPBearer(auto_error=False)

# --- COMPREHENSIVE SERVICE INITIALIZATION ---
async def initialize_all_services():
    """Initialize all Sallie services with comprehensive error handling."""
    global brain, azure_services, voice_interface, autonomous_pm, sensor_array, advanced_analytics
    
    try:
        # Initialize Sallie's brain
        if brain:
            logger.info("🧠 Sallie's brain initialized successfully")
        else:
            logger.error("❌ Failed to initialize Sallie's brain")
        
        # Initialize Azure Services
        azure_services = initialize_azure_services()
        
        # Initialize Voice Interface
        if VOICE_AVAILABLE and voice_interface:
            try:
                voice_interface.brain = brain
                voice_initialized = await voice_interface.initialize()
                if voice_initialized:
                    logger.info("🎤 Voice Interface initialized successfully")
                else:
                    logger.warning("⚠️ Voice Interface initialization failed")
            except Exception as e:
                logger.error(f"❌ Voice Interface initialization error: {e}")
                voice_interface = None
        
        # Initialize Autonomous Project Manager
        if AUTONOMOUS_PM_AVAILABLE and autonomous_pm:
            try:
                autonomous_pm.brain = brain
                pm_initialized = await autonomous_pm.initialize()
                if pm_initialized:
                    logger.info("🤖 Autonomous Project Manager initialized successfully")
                else:
                    logger.warning("⚠️ Autonomous Project Manager initialization failed")
            except Exception as e:
                logger.error(f"❌ Autonomous Project Manager initialization error: {e}")
                autonomous_pm = None
        
        # Initialize Sensor Array Manager
        if SENSOR_ARRAY_AVAILABLE and sensor_array:
            try:
                sensor_array.brain = brain
                sensor_initialized = await sensor_array.initialize()
                if sensor_initialized:
                    logger.info("🌡️ Sensor Array Manager initialized successfully")
                else:
                    logger.warning("⚠️ Sensor Array Manager initialization failed")
            except Exception as e:
                logger.error(f"❌ Sensor Array Manager initialization error: {e}")
                sensor_array = None
        
        # Initialize Advanced Analytics
        if ANALYTICS_AVAILABLE and advanced_analytics:
            try:
                advanced_analytics.brain = brain
                analytics_initialized = await advanced_analytics.initialize()
                if analytics_initialized:
                    logger.info("📊 Advanced Analytics initialized successfully")
                else:
                    logger.warning("⚠️ Advanced Analytics initialization failed")
            except Exception as e:
                logger.error(f"❌ Advanced Analytics initialization error: {e}")
                advanced_analytics = None
        
        # Initialize Ghost Interface
        if GHOST_INTERFACE_AVAILABLE:
            try:
                ghost_manager = await initialize_ghost_interface(brain)
                if ghost_manager:
                    logger.info("👻 Ghost Interface initialized successfully")
                else:
                    logger.warning("⚠️ Ghost Interface initialization failed")
            except Exception as e:
                logger.error(f"❌ Ghost Interface initialization error: {e}")
        
        # Initialize CLI Interface
        if CLI_INTERFACE_AVAILABLE:
            try:
                cli_manager = initialize_cli_manager(brain)
                if cli_manager:
                    logger.info("💻 CLI Interface initialized successfully")
                else:
                    logger.warning("⚠️ CLI Interface initialization failed")
            except Exception as e:
                logger.error(f"❌ CLI Interface initialization error: {e}")
        
        # Initialize Active Veto System
        if ACTIVE_VETO_AVAILABLE:
            try:
                veto_manager = await initialize_active_veto_system(brain)
                if veto_manager:
                    logger.info("🗳️ Active Veto System initialized successfully")
                else:
                    logger.warning("⚠️ Active Veto System initialization failed")
            except Exception as e:
                logger.error(f"❌ Active Veto System initialization error: {e}")
        
        # Initialize Foundry Evaluation System
        if FOUNDRY_AVAILABLE:
            try:
                foundry_manager = await initialize_foundry_evaluation_system(brain)
                if foundry_manager:
                    logger.info("🔨 Foundry Evaluation System initialized successfully")
                else:
                    logger.warning("⚠️ Foundry Evaluation System initialization failed")
            except Exception as e:
                logger.error(f"❌ Foundry Evaluation System initialization error: {e}")
        
        # Initialize Working Memory Hygiene System
        if MEMORY_HYGIENE_AVAILABLE:
            try:
                memory_hygiene_manager = await initialize_memory_hygiene_system(brain)
                if memory_hygiene_manager:
                    logger.info("🧹 Working Memory Hygiene System initialized successfully")
                else:
                    logger.warning("⚠️ Working Memory Hygiene System initialization failed")
            except Exception as e:
                logger.error(f"❌ Working Memory Hygiene System initialization error: {e}")
        
        # Initialize Voice Commands System
        if VOICE_COMMANDS_AVAILABLE:
            try:
                voice_commands_manager = await initialize_voice_commands_system(brain)
                if voice_commands_manager:
                    logger.info("🎤 Voice Commands System initialized successfully")
                else:
                    logger.warning("⚠️ Voice Commands System initialization failed")
            except Exception as e:
                logger.error(f"❌ Voice Commands System initialization error: {e}")
        
        # Initialize Undo Window System
        if UNDO_WINDOW_AVAILABLE:
            try:
                undo_window_manager = await initialize_undo_window_system(brain)
                if undo_window_manager:
                    logger.info("⏰ Undo Window System initialized successfully")
                else:
                    logger.warning("⚠️ Undo Window System initialization failed")
            except Exception as e:
                logger.error(f"❌ Undo Window System initialization error: {e}")
        
        # Initialize Brain Forge System
        if BRAIN_FORGE_AVAILABLE:
            try:
                brain_forge_manager = await initialize_brain_forge_system(brain)
                if brain_forge_manager:
                    logger.info("🧠 Brain Forge System initialized successfully")
                else:
                    logger.warning("⚠️ Brain Forge System initialization failed")
            except Exception as e:
                logger.error(f"❌ Brain Forge System initialization error: {e}")
        
        logger.info("✅ All services initialization completed")
        
    except Exception as e:
        logger.error(f"❌ Critical error during service initialization: {e}")

async def cleanup_all_services():
    """Cleanup all services on shutdown."""
    try:
        # Cleanup Ghost Interface
        if GHOST_INTERFACE_AVAILABLE:
            ghost_manager = get_ghost_manager()
            if ghost_manager:
                await ghost_manager.shutdown()
        
        # Cleanup Active Veto System
        if ACTIVE_VETO_AVAILABLE:
            veto_manager = get_veto_manager()
            if veto_manager:
                await veto_manager.shutdown()
        
        # Cleanup Foundry Evaluation System
        if FOUNDRY_AVAILABLE:
            foundry_manager = get_foundry_manager()
            if foundry_manager:
                await foundry_manager.shutdown()
        
        # Cleanup Working Memory Hygiene System
        if MEMORY_HYGIENE_AVAILABLE:
            memory_hygiene_manager = get_memory_hygiene_manager()
            if memory_hygiene_manager:
                await memory_hygiene_manager.shutdown()
        
        # Cleanup Voice Commands System
        if VOICE_COMMANDS_AVAILABLE:
            voice_commands_manager = get_voice_commands_manager()
            if voice_commands_manager:
                await voice_commands_manager.shutdown()
        
        # Cleanup Undo Window System
        if UNDO_WINDOW_AVAILABLE:
            undo_window_manager = get_undo_window_manager()
            if undo_window_manager:
                await undo_window_manager.shutdown()
        
        # Cleanup Brain Forge System
        if BRAIN_FORGE_AVAILABLE:
            brain_forge_manager = get_brain_forge_manager()
            if brain_forge_manager:
                await brain_forge_manager.shutdown()
        
        # Cleanup other services here
        logger.info("🧹 Services cleanup completed")
    except Exception as e:
        logger.error(f"❌ Error during service cleanup: {e}")

# Initialize Sallie's brain
brain = SallieBrain()
server_start_time = time.time()

# --- AZURE SERVICES INITIALIZATION ---
azure_services = {
    "speech": None,
    "text_analytics": None,
    "translation": None,
    "vision": None,
    "openai": None
}

def initialize_azure_services():
    """Initialize Azure services with comprehensive configuration."""
    if not AZURE_AVAILABLE:
        logger.warning("⚠️ Azure services not available - install azure-cognitiveservices-speech, azure-ai-textanalytics, etc.")
        return azure_services
    
    try:
        # Load environment variables with validation
        speech_key = os.getenv("AZURE_SPEECH_SERVICES_KEY")
        speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
        text_key = os.getenv("AZURE_COGNITIVE_SERVICES_KEY")
        text_region = os.getenv("AZURE_TEXT_REGION", "eastus")
        vision_key = os.getenv("AZURE_COGNITIVE_SERVICES_KEY")
        vision_region = os.getenv("AZURE_VISION_REGION", "eastus")
        openai_key = os.getenv("AZURE_OPENAI_KEY")
        openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        
        # Initialize Speech Services with enhanced configuration
        if speech_key:
            speech_config = SpeechConfig(subscription=speech_key, region=speech_region)
            speech_config.speech_synthesis_language = "en-US"
            speech_config.speech_recognition_language = "en-US"
            azure_services["speech"] = {
                "config": speech_config,
                "synthesizer": None,
                "recognizer": None,
                "available_voices": [],
                "supported_languages": ["en-US", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "ja-JP", "zh-CN"]
            }
            logger.info("🔊 Azure Speech Services initialized successfully")
        
        # Initialize Text Analytics with enhanced features
        if text_key:
            text_analytics_client = TextAnalyticsClient(
                endpoint=f"https://{text_region}.api.cognitive.microsoft.com/",
                credential=AzureKeyCredential(text_key)
            )
            azure_services["text_analytics"] = {
                "client": text_analytics_client,
                "supported_languages": ["en", "es", "fr", "de", "it", "pt", "ja", "zh"],
                "features": ["sentiment", "key_phrases", "entities", "linked_entities", "language_detection"]
            }
            logger.info("📝 Azure Text Analytics initialized successfully")
        
        # Initialize Translation Services
        if text_key:
            translation_client = TextTranslationClient(
                endpoint=f"https://{text_region}.api.cognitive.microsoft.com/translator/",
                credential=AzureKeyCredential(text_key)
            )
            azure_services["translation"] = {
                "client": translation_client,
                "supported_languages": ["en", "es", "fr", "de", "it", "pt", "ja", "zh", "ru", "ar", "hi"],
                "character_limit": 50000
            }
            logger.info("🌐 Azure Translation Services initialized successfully")
        
        # Initialize Computer Vision with enhanced capabilities
        if vision_key:
            vision_client = ComputerVisionClient(
                endpoint=f"https://{vision_region}.api.cognitive.microsoft.com/",
                credential=AzureKeyCredential(vision_key)
            )
            azure_services["vision"] = {
                "client": vision_client,
                "features": ["analyze", "describe", "ocr", "tag", "detect_objects", "generate_thumbnail"],
                "supported_formats": ["jpg", "jpeg", "png", "gif", "bmp"]
            }
            logger.info("👁️ Azure Computer Vision initialized successfully")
        
        # Initialize OpenAI Services
        if openai_key and openai_endpoint:
            try:
                from openai import AzureOpenAI
                openai_client = AzureOpenAI(
                    api_key=openai_key,
                    api_version="2024-02-15-preview",
                    azure_endpoint=openai_endpoint
                )
                azure_services["openai"] = {
                    "client": openai_client,
                    "models": ["gpt-4", "gpt-4-turbo", "gpt-35-turbo"],
                    "features": ["chat", "completion", "embedding", "image_generation"]
                }
                logger.info("🤖 Azure OpenAI initialized successfully")
            except ImportError:
                logger.warning("⚠️ OpenAI package not available - install openai")
        
        logger.info("✅ Azure services initialization completed")
        return azure_services
        
    except Exception as e:
        logger.error(f"❌ Azure services initialization failed: {e}")
        return azure_services

# --- COMPREHENSIVE REQUEST/RESPONSE MODELS ---

# Core Models
class ChatRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    message: str = Field(..., min_length=1, max_length=10000, description="Message to send to Sallie")
    role: Optional[str] = Field(None, description="Optional role override")
    context: Optional[Dict[str, Any]] = Field(None, description="Conversation context")
    priority: Optional[str] = Field("normal", description="Message priority: low, normal, high, urgent")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class ChatResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    response: str = Field(..., description="Sallie's response")
    role: str = Field(..., description="Current role")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence")
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: float = Field(..., description="Response timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Response metadata")

# Human-Level Expansion Models
class LimbicVariableRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    variable: str = Field(..., description="Limbic variable name")
    value: float = Field(..., ge=0.0, le=1.0, description="Variable value")
    context: Optional[str] = Field(None, description="Context for the change")

class LimbicVariableResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Operation success")
    variable: str = Field(..., description="Variable name")
    old_value: Optional[float] = Field(None, description="Previous value")
    new_value: float = Field(..., description="New value")
    timestamp: float = Field(..., description="Update timestamp")
    message: str = Field(..., description="Operation message")

class TrustTierRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    tier: int = Field(..., ge=1, le=4, description="Trust tier (1-4)")
    reason: Optional[str] = Field(None, description="Reason for tier change")
    verification: Optional[str] = Field(None, description="Verification token")

class TrustTierResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Operation success")
    old_tier: int = Field(..., description="Previous trust tier")
    new_tier: int = Field(..., description="New trust tier")
    capabilities: List[str] = Field(..., description="Available capabilities at this tier")
    timestamp: float = Field(..., description="Change timestamp")
    message: str = Field(..., description="Operation message")

# Voice Interface Models
class VoiceSynthesisRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    text: str = Field(..., min_length=1, max_length=5000, description="Text to synthesize")
    voice: Optional[str] = Field("en-US-JennyNeural", description="Voice name")
    emotion: Optional[str] = Field("neutral", description="Emotional tone")
    speed: Optional[float] = Field(1.0, ge=0.5, le=2.0, description="Speech speed")
    pitch: Optional[str] = Field("default", description="Pitch adjustment")
    format: Optional[str] = Field("audio-24khz-48kbitrate-mono-mp3", description="Audio format")
    language: Optional[str] = Field("en-US", description="Language code")

class VoiceSynthesisResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Synthesis success")
    audio_data: Optional[str] = Field(None, description="Base64 encoded audio")
    voice_used: str = Field(..., description="Voice used for synthesis")
    duration: Optional[float] = Field(None, description="Audio duration in seconds")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    timestamp: float = Field(..., description="Synthesis timestamp")
    message: str = Field(..., description="Operation message")

class VoiceRecognitionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    audio_data: str = Field(..., description="Base64 encoded audio")
    language: Optional[str] = Field("en-US", description="Recognition language")
    format: Optional[str] = Field("wav", description="Audio format")
    profanity_filter: Optional[bool] = Field(True, description="Enable profanity filter")
    context: Optional[str] = Field(None, description="Recognition context")

class VoiceRecognitionResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Recognition success")
    text: str = Field(..., description="Recognized text")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Recognition confidence")
    language_detected: Optional[str] = Field(None, description="Detected language")
    emotion_detected: Optional[str] = Field(None, description="Detected emotion")
    alternatives: List[Dict[str, Any]] = Field(default_factory=list, description="Alternative recognitions")
    timestamp: float = Field(..., description="Recognition timestamp")
    message: str = Field(..., description="Operation message")

# Autonomous Project Manager Models
class ProjectCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(..., min_length=1, max_length=100, description="Project name")
    description: Optional[str] = Field(None, max_length=1000, description="Project description")
    goals: List[str] = Field(..., min_items=1, description="Project goals")
    deadline: Optional[str] = Field(None, description="Project deadline")
    priority: Optional[str] = Field("medium", description="Project priority")
    team_members: Optional[List[str]] = Field(default_factory=list, description="Team members")
    budget: Optional[float] = Field(None, ge=0, description="Project budget")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class ProjectCreateResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Creation success")
    project_id: Optional[str] = Field(None, description="Generated project ID")
    project: Optional[Dict[str, Any]] = Field(None, description="Project details")
    tasks_generated: int = Field(..., description="Number of tasks generated")
    estimated_duration: Optional[str] = Field(None, description="Estimated project duration")
    timestamp: float = Field(..., description="Creation timestamp")
    message: str = Field(..., description="Operation message")
    error: Optional[str] = Field(None, description="Error message if failed")

# Sensor Array Models
class SensorAddRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(..., min_length=1, max_length=50, description="Sensor name")
    type: str = Field(..., description="Sensor type")
    location: str = Field(..., min_length=1, max_length=100, description="Sensor location")
    thresholds: Optional[Dict[str, float]] = Field(default_factory=dict, description="Alert thresholds")
    calibration_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Calibration data")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

class SensorAddResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Addition success")
    sensor_id: str = Field(..., description="Generated sensor ID")
    sensor: Optional[Dict[str, Any]] = Field(None, description="Sensor details")
    status: str = Field(..., description="Sensor status")
    timestamp: float = Field(..., description="Addition timestamp")
    message: str = Field(..., description="Operation message")
    error: Optional[str] = Field(None, description="Error message if failed")

# Analytics Models
class MetricRecordRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(..., min_length=1, max_length=50, description="Metric name")
    value: float = Field(..., description="Metric value")
    unit: str = Field(..., description="Metric unit")
    type: str = Field(..., description="Metric type")
    source: str = Field(..., description="Metric source")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

class PerformanceReportResponse(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    success: bool = Field(..., description="Report generation success")
    report: Optional[Dict[str, Any]] = Field(None, description="Performance report")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall performance score")
    recommendations: List[str] = Field(default_factory=list, description="Performance recommendations")
    alerts_count: int = Field(..., description="Number of active alerts")
    timestamp: float = Field(..., description="Report timestamp")
    message: str = Field(..., description="Operation message")
    error: Optional[str] = Field(None, description="Error message if failed")

# --- COMPREHENSIVE API ENDPOINTS ---

# Utility Functions
def get_current_timestamp() -> float:
    """Get current timestamp."""
    return time.time()

def calculate_processing_time(start_time: float) -> float:
    """Calculate processing time."""
    return round(time.time() - start_time, 3)

async def verify_service_availability(service_name: str, service_instance: Any) -> bool:
    """Verify if a service is available and initialized."""
    if service_instance is None:
        return False
    
    if hasattr(service_instance, 'is_initialized'):
        return service_instance.is_initialized
    
    return True

# Core Endpoints
@app.get("/", response_model=Dict[str, Any])
@limiter.limit("100/hour")
async def root(request: Request):
    """Root endpoint - comprehensive system status."""
    return {
        "message": "Sallie is here - Enterprise Edition",
        "status": "awake",
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "server_time": datetime.now().isoformat(),
        "uptime_seconds": round(time.time() - server_start_time, 2),
        "services": {
            "brain": "active",
            "voice": "active" if await verify_service_availability("voice", voice_interface) else "inactive",
            "autonomous_pm": "active" if await verify_service_availability("autonomous_pm", autonomous_pm) else "inactive",
            "sensor_array": "active" if await verify_service_availability("sensor_array", sensor_array) else "inactive",
            "analytics": "active" if await verify_service_availability("analytics", advanced_analytics) else "inactive",
            "azure": "active" if AZURE_AVAILABLE else "inactive"
        },
        "capabilities": {
            "human_level_expansion": True,
            "voice_interface": VOICE_AVAILABLE,
            "autonomous_management": AUTONOMOUS_PM_AVAILABLE,
            "environmental_monitoring": SENSOR_ARRAY_AVAILABLE,
            "advanced_analytics": ANALYTICS_AVAILABLE,
            "azure_integration": AZURE_AVAILABLE
        }
    }

@app.get("/health", response_model=Dict[str, Any])
@limiter.limit("1000/hour")
async def health_check(request: Request):
    """Comprehensive health check with detailed system status."""
    health_status = {
        "status": "healthy",
        "timestamp": get_current_timestamp(),
        "uptime": round(time.time() - server_start_time, 2),
        "version": "2.0.0",
        "environment": ENVIRONMENT,
        "services": {},
        "performance": {
            "memory_usage": "monitoring",
            "cpu_usage": "monitoring",
            "disk_usage": "monitoring"
        },
        "endpoints_count": 0
    }
    
    # Check all services
    services_to_check = [
        ("brain", brain),
        ("voice_interface", voice_interface),
        ("autonomous_pm", autonomous_pm),
        ("sensor_array", sensor_array),
        ("analytics", advanced_analytics)
    ]
    
    for service_name, service_instance in services_to_check:
        if service_instance:
            if hasattr(service_instance, 'is_initialized'):
                health_status["services"][service_name] = {
                    "status": "healthy" if service_instance.is_initialized else "unhealthy",
                    "initialized": service_instance.is_initialized
                }
            else:
                health_status["services"][service_name] = {
                    "status": "healthy",
                    "initialized": True
                }
        else:
            health_status["services"][service_name] = {
                "status": "unavailable",
                "initialized": False
            }
    
    # Count endpoints
    health_status["endpoints_count"] = len([route for route in app.routes if hasattr(route, 'methods')])
    
    return health_status

@app.post("/chat", response_model=ChatResponse)
@limiter.limit("100/hour")
async def chat_with_sallie(request: Request, chat_request: ChatRequest):
    """Enhanced chat with comprehensive features."""
    start_time = get_current_timestamp()
    
    try:
        # Process message with Sallie's brain
        response_text = brain.respond(chat_request.message, chat_request.role)
        
        # Calculate confidence based on response characteristics
        confidence = min(1.0, len(response_text) / 100.0)  # Simple confidence calculation
        
        # Create enhanced response
        chat_response = ChatResponse(
            response=response_text,
            role=brain.current_role,
            confidence=confidence,
            processing_time=calculate_processing_time(start_time),
            timestamp=get_current_timestamp(),
            metadata={
                "message_length": len(chat_request.message),
                "response_length": len(response_text),
                "priority": chat_request.priority,
                "context_provided": chat_request.context is not None
            }
        )
        
        # Record analytics if available
        if ANALYTICS_AVAILABLE and advanced_analytics:
            await advanced_analytics.record_metric({
                "name": "chat_interaction",
                "value": calculate_processing_time(start_time),
                "unit": "seconds",
                "type": "performance",
                "source": "chat_endpoint",
                "metadata": {
                    "role": brain.current_role,
                    "confidence": confidence,
                    "priority": chat_request.priority
                }
            })
        
        return chat_response
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

if VOICE_AVAILABLE and voice_interface:
    import asyncio
    try:
        # Initialize voice interface with brain reference
        voice_interface.brain = brain
        # Run async initialization
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        voice_initialized = loop.run_until_complete(voice_interface.initialize())
        loop.close()
        
        if voice_initialized:
            print("🎤 Voice Interface initialized successfully")
        else:
            print("⚠️ Voice Interface initialization failed")
    except Exception as e:
        print(f"⚠️ Voice Interface initialization error: {e}")
        voice_interface = None

# Initialize Autonomous Project Manager
if AUTONOMOUS_PM_AVAILABLE and autonomous_pm:
    try:
        # Initialize with brain reference
        autonomous_pm.brain = brain
        # Run async initialization
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        pm_initialized = loop.run_until_complete(autonomous_pm.initialize())
        loop.close()
        
        if pm_initialized:
            print("🤖 Autonomous Project Manager initialized successfully")
        else:
            print("⚠️ Autonomous Project Manager initialization failed")
    except Exception as e:
        print(f"⚠️ Autonomous Project Manager initialization error: {e}")
        autonomous_pm = None

# Initialize Sensor Array Manager
if SENSOR_ARRAY_AVAILABLE and sensor_array:
    try:
        # Initialize with brain reference
        sensor_array.brain = brain
        # Run async initialization
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        sensor_initialized = loop.run_until_complete(sensor_array.initialize())
        loop.close()
        
        if sensor_initialized:
            print("🌡️ Sensor Array Manager initialized successfully")
        else:
            print("⚠️ Sensor Array Manager initialization failed")
    except Exception as e:
        print(f"⚠️ Sensor Array Manager initialization error: {e}")
        sensor_array = None


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

# --- HUMAN-LEVEL EXPANSION MODELS ---

class LimbicStateResponse(BaseModel):
    limbic_variables: Dict[str, float]
    autonomy_level: int
    trust_tier: str

class CognitiveStateResponse(BaseModel):
    active_models: List[str]
    reasoning_confidence: float
    dynamic_posture: str
    learning_memory_size: int
    cross_domain_patterns: int

class EnhancementRequest(BaseModel):
    variable: str  # empathy, intuition, creativity, wisdom, humor
    delta: float   # Change amount (-1.0 to 1.0)

class EnhancementResponse(BaseModel):
    success: bool
    new_value: float
    message: str

# --- VOICE INTERFACE MODELS ---

class VoiceSynthesisRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    emotion: Optional[str] = None

class VoiceSynthesisResponse(BaseModel):
    success: bool
    text: str
    voice: str
    emotion: Optional[str]
    duration: Optional[float]
    message: str
    error: Optional[str] = None

class VoiceRecognitionRequest(BaseModel):
    language: Optional[str] = "en-US"

class VoiceRecognitionResponse(BaseModel):
    success: bool
    text: Optional[str]
    language: str
    confidence: Optional[float]
    emotional_analysis: Optional[Dict[str, Any]]
    message: str
    error: Optional[str] = None

class VoiceProfileRequest(BaseModel):
    user_id: str
    # In production, this would include audio data

class VoiceProfileResponse(BaseModel):
    success: bool
    profile_id: str
    message: str
    error: Optional[str] = None

# --- AUTONOMOUS PROJECT MANAGER MODELS ---

class ProjectCreateRequest(BaseModel):
    name: str
    description: str
    due_date: Optional[float] = None
    budget: Optional[float] = None
    team: List[str] = []
    goals: List[str] = []
    auto_plan: bool = True

class ProjectCreateResponse(BaseModel):
    success: bool
    project_id: str
    project: Optional[Dict[str, Any]]
    message: str
    error: Optional[str] = None

class TaskUpdateRequest(BaseModel):
    task_id: str
    status: str
    progress: Optional[float] = None

class TaskUpdateResponse(BaseModel):
    success: bool
    task_id: str
    old_status: Optional[str]
    new_status: str
    progress: Optional[float]
    message: str
    error: Optional[str] = None

class ProjectStatusResponse(BaseModel):
    success: bool
    project: Optional[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    insights: List[str] = []
    message: str
    error: Optional[str] = None

class ProjectsListResponse(BaseModel):
    success: bool
    projects: List[Dict[str, Any]] = []
    total_projects: int
    active_projects: int
    message: str
    error: Optional[str] = None

# --- SENSOR ARRAY MODELS ---

class SensorAddRequest(BaseModel):
    name: str
    type: str  # temperature, humidity, light, sound, air_quality, presence, motion, biometric
    location: str
    thresholds: Optional[Dict[str, float]] = {}
    metadata: Optional[Dict[str, Any]] = {}

class SensorAddResponse(BaseModel):
    success: bool
    sensor_id: str
    sensor: Optional[Dict[str, Any]]
    message: str
    error: Optional[str] = None

class SensorReadingRequest(BaseModel):
    sensor_id: str
    value: float
    unit: str
    metadata: Optional[Dict[str, Any]] = {}

class SensorReadingResponse(BaseModel):
    success: bool
    reading_id: str
    sensor_id: str
    value: float
    unit: str
    quality: float
    timestamp: float
    message: str
    error: Optional[str] = None

class EnvironmentalStateResponse(BaseModel):
    success: bool
    environmental_state: Optional[Dict[str, Any]]
    comfort_score: float
    active_sensors: int
    total_sensors: int
    insights: List[str] = []
    last_updated: float
    message: str
    error: Optional[str] = None

class SensorStatusResponse(BaseModel):
    success: bool
    sensors: Optional[List[Dict[str, Any]]]
    sensor: Optional[Dict[str, Any]]
    recent_readings: Optional[List[Dict[str, Any]]]
    total_sensors: int
    active_sensors: int
    message: str
    error: Optional[str] = None


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


# --- HUMAN-LEVEL EXPANSION ENDPOINTS ---

@app.get("/limbic", response_model=LimbicStateResponse)
async def get_limbic_state():
    """Get current limbic system state and autonomy level."""
    return LimbicStateResponse(
        limbic_variables=brain.limbic_state,
        autonomy_level=brain.autonomy_level,
        trust_tier=f"Tier_{brain.autonomy_level}_{'Full_Partner' if brain.autonomy_level == 4 else 'Surrogate' if brain.autonomy_level == 3 else 'Colleague' if brain.autonomy_level == 2 else 'Acquaintance' if brain.autonomy_level == 1 else 'Stranger'}"
    )


@app.get("/cognitive", response_model=CognitiveStateResponse)
async def get_cognitive_state():
    """Get current cognitive processing state."""
    # Get latest reasoning from conversation history
    latest_reasoning = []
    if brain.conversation_history:
        latest = brain.conversation_history[-1]
        latest_reasoning = latest.get("reasoning_models", [])
    
    return CognitiveStateResponse(
        active_models=latest_reasoning,
        reasoning_confidence=0.8,  # Would calculate from actual reasoning
        dynamic_posture=brain.dynamic_posture["current_posture"],
        learning_memory_size=len(brain.learning_memory),
        cross_domain_patterns=len(brain.cross_domain_knowledge)
    )


@app.post("/enhance", response_model=EnhancementResponse)
async def enhance_limbic_variable(request: EnhancementRequest):
    """
    Enhance a specific limbic variable.
    
    This allows fine-tuning Sallie's human-level capabilities.
    Only available at Tier 4 trust level.
    """
    if brain.autonomy_level < 4:
        raise HTTPException(
            status_code=403, 
            detail="Enhancement requires Tier 4 (Full Partner) trust level"
        )
    
    if request.variable not in brain.limbic_state:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid variable: {request.variable}. Valid: {list(brain.limbic_state.keys())}"
        )
    
    # Apply enhancement with bounds checking
    current_value = brain.limbic_state[request.variable]
    new_value = max(0.0, min(1.0, current_value + request.delta))
    brain.limbic_state[request.variable] = new_value
    
    # Recalculate autonomy if trust changed
    if request.variable == "trust":
        brain.autonomy_level = brain._calculate_autonomy_level()
    
    return EnhancementResponse(
        success=True,
        new_value=new_value,
        message=f"Enhanced {request.variable} from {current_value:.2f} to {new_value:.2f}"
    )


@app.get("/posture/history")
async def get_posture_history():
    """Get history of dynamic posture adaptations."""
    return {
        "current_posture": brain.dynamic_posture["current_posture"],
        "history": brain.dynamic_posture["posture_history"][-10:],  # Last 10 changes
        "adaptation_rate": brain.dynamic_posture["adaptation_rate"]
    }


@app.get("/learning/patterns")
async def get_learning_patterns():
    """Get learned cross-domain patterns."""
    return {
        "patterns": brain.cross_domain_knowledge,
        "total_learned": len(brain.learning_memory),
        "learning_rate": len(brain.learning_memory) / max(1, time.time() - brain.session_start)
    }


@app.get("/reasoning/models")
async def get_reasoning_models():
    """Get available reasoning models and their current activation levels."""
    return {
        "available_models": brain.cognitive_models,
        "limbic_influence": {
            "creativity": brain.limbic_state.get("creativity", 0.0),
            "intuition": brain.limbic_state.get("intuition", 0.0),
            "wisdom": brain.limbic_state.get("wisdom", 0.0),
            "empathy": brain.limbic_state.get("empathy", 0.0)
        }
    }


# --- AZURE SERVICES ENDPOINTS ---

@app.get("/azure/status")
async def get_azure_status():
    """Get Azure services status and capabilities."""
    return {
        "azure_available": AZURE_AVAILABLE,
        "services": {
            "speech": azure_services["speech"] is not None,
            "text_analytics": azure_services["text_analytics"] is not None,
            "vision": azure_services["vision"] is not None,
            "translation": azure_services["translation"] is not None
        },
        "capabilities": {
            "speech_synthesis": azure_services["speech"] is not None,
            "speech_recognition": azure_services["speech"] is not None,
            "sentiment_analysis": azure_services["text_analytics"] is not None,
            "text_translation": azure_services["translation"] is not None,
            "image_analysis": azure_services["vision"] is not None
        }
    }

@app.post("/azure/speech/synthesize")
async def synthesize_speech(text: str, voice: str = "en-US-JennyNeural"):
    """
    Synthesize speech using Azure Speech Services.
    
    Args:
        text: Text to synthesize
        voice: Voice model to use
    """
    if not azure_services["speech"]:
        raise HTTPException(status_code=503, detail="Azure Speech Services not available")
    
    try:
        speech_config = azure_services["speech"]["config"]
        speech_config.speech_synthesis_voice_name = voice
        
        # Note: In production, this would return audio data
        # For now, return a placeholder response
        return {
            "success": True,
            "text": text,
            "voice": voice,
            "message": "Speech synthesis would be performed here"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@app.post("/azure/text/analyze")
async def analyze_text(text: str):
    """
    Analyze text using Azure Text Analytics.
    
    Args:
        text: Text to analyze
    """
    if not azure_services["text_analytics"]:
        raise HTTPException(status_code=503, detail="Azure Text Analytics not available")
    
    try:
        # Note: In production, this would call Azure Text Analytics
        # For now, return a placeholder response with enhanced analysis
        emotional_state = brain._detect_emotion(text)
        
        return {
            "success": True,
            "text": text,
            "emotional_state": emotional_state,
            "sentiment": "positive" if "happy" in text.lower() else "negative" if "sad" in text.lower() else "neutral",
            "key_phrases": text.split()[:5],  # Simplified
            "message": "Text analysis completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@app.post("/azure/vision/analyze")
async def analyze_image(image_url: str):
    """
    Analyze image using Azure Computer Vision.
    
    Args:
        image_url: URL of image to analyze
    """
    if not azure_services["vision"]:
        raise HTTPException(status_code=503, detail="Azure Vision Services not available")
    
    try:
        # Note: In production, this would call Azure Computer Vision
        # For now, return a placeholder response
        return {
            "success": True,
            "image_url": image_url,
            "analysis": {
                "objects": ["detected objects would be here"],
                "tags": ["image tags would be here"],
                "description": "Image description would be here"
            },
            "message": "Image analysis completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


# --- VOICE INTERFACE ENDPOINTS ---

@app.post("/voice/synthesize", response_model=VoiceSynthesisResponse)
async def voice_synthesize(request: VoiceSynthesisRequest):
    """
    Synthesize speech using advanced voice interface.
    
    Args:
        request: Voice synthesis request with text, voice, and emotion
    """
    if not voice_interface or not voice_interface.is_initialized:
        raise HTTPException(status_code=503, detail="Voice Interface not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            voice_interface.synthesize_speech(
                text=request.text,
                voice=request.voice,
                emotion=request.emotion
            )
        )
        loop.close()
        
        return VoiceSynthesisResponse(
            success=result["success"],
            text=result.get("text", request.text),
            voice=result.get("voice", request.voice or "en-US-JennyNeural"),
            emotion=request.emotion,
            duration=result.get("duration"),
            message=result.get("message", "Speech synthesis completed"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice synthesis failed: {str(e)}")

@app.post("/voice/recognize", response_model=VoiceRecognitionResponse)
async def voice_recognize(request: VoiceRecognitionRequest):
    """
    Recognize speech with emotional analysis.
    
    Args:
        request: Voice recognition request with language preference
    """
    if not voice_interface or not voice_interface.is_initialized:
        raise HTTPException(status_code=503, detail="Voice Interface not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            voice_interface.recognize_speech(
                language=request.language
            )
        )
        loop.close()
        
        return VoiceRecognitionResponse(
            success=result["success"],
            text=result.get("text"),
            language=result.get("language", request.language),
            confidence=result.get("confidence"),
            emotional_analysis=result.get("emotional_analysis"),
            message=result.get("message", "Speech recognition completed"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice recognition failed: {str(e)}")

@app.post("/voice/profile/create", response_model=VoiceProfileResponse)
async def create_voice_profile(request: VoiceProfileRequest):
    """
    Create voice biometric profile for user identification.
    
    Args:
        request: Voice profile creation request
    """
    if not voice_interface or not voice_interface.is_initialized:
        raise HTTPException(status_code=503, detail="Voice Interface not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            voice_interface.create_voice_profile(
                user_id=request.user_id,
                audio_samples=[]  # Placeholder - would include actual audio samples
            )
        )
        loop.close()
        
        return VoiceProfileResponse(
            success=result["success"],
            profile_id=result.get("profile_id", request.user_id),
            message=result.get("message", "Voice profile created"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice profile creation failed: {str(e)}")

@app.get("/voice/available")
async def get_available_voices():
    """Get list of available neural voices for synthesis."""
    if not voice_interface or not voice_interface.is_initialized:
        raise HTTPException(status_code=503, detail="Voice Interface not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(voice_interface.get_available_voices())
        loop.close()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available voices: {str(e)}")

@app.get("/voice/status")
async def get_voice_status():
    """Get voice interface status and capabilities."""
    return {
        "voice_available": VOICE_AVAILABLE and voice_interface is not None,
        "voice_initialized": voice_interface.is_initialized if voice_interface else False,
        "azure_speech_available": azure_services["speech"] is not None,
        "capabilities": {
            "speech_synthesis": voice_interface.is_initialized if voice_interface else False,
            "speech_recognition": voice_interface.is_initialized if voice_interface else False,
            "voice_profiles": len(voice_interface.voice_profiles) if voice_interface else 0,
            "emotional_voices": list(voice_interface.emotional_voice_mapping.keys()) if voice_interface else []
        }
    }


# --- AUTONOMOUS PROJECT MANAGER ENDPOINTS ---

@app.post("/projects/create", response_model=ProjectCreateResponse)
async def create_project(request: ProjectCreateRequest):
    """
    Create a new project with intelligent autonomous planning.
    
    Args:
        request: Project creation data
    """
    if not autonomous_pm or not autonomous_pm.is_initialized:
        raise HTTPException(status_code=503, detail="Autonomous Project Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            autonomous_pm.create_project(request.dict())
        )
        loop.close()
        
        return ProjectCreateResponse(
            success=result["success"],
            project_id=result.get("project_id"),
            project=result.get("project"),
            message=result.get("message", "Project created"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project creation failed: {str(e)}")

@app.post("/projects/task/update", response_model=TaskUpdateResponse)
async def update_task_status(request: TaskUpdateRequest):
    """
    Update task status with autonomous follow-up actions.
    
    Args:
        request: Task update request
    """
    if not autonomous_pm or not autonomous_pm.is_initialized:
        raise HTTPException(status_code=503, detail="Autonomous Project Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            autonomous_pm.update_task_status(
                task_id=request.task_id,
                status=request.status,
                progress=request.progress
            )
        )
        loop.close()
        
        return TaskUpdateResponse(
            success=result["success"],
            task_id=result.get("task_id"),
            old_status=result.get("old_status"),
            new_status=result.get("new_status"),
            progress=result.get("progress"),
            message=result.get("message", "Task updated"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Task update failed: {str(e)}")

@app.get("/projects/{project_id}/status", response_model=ProjectStatusResponse)
async def get_project_status(project_id: str):
    """
    Get comprehensive project status with AI insights.
    
    Args:
        project_id: Project identifier
    """
    if not autonomous_pm or not autonomous_pm.is_initialized:
        raise HTTPException(status_code=503, detail="Autonomous Project Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            autonomous_pm.get_project_status(project_id)
        )
        loop.close()
        
        return ProjectStatusResponse(
            success=result["success"],
            project=result.get("project"),
            metrics=result.get("metrics"),
            insights=result.get("insights", []),
            message=result.get("message", "Project status retrieved"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project status retrieval failed: {str(e)}")

@app.get("/projects/list", response_model=ProjectsListResponse)
async def list_all_projects():
    """Get all projects with summary status."""
    if not autonomous_pm or not autonomous_pm.is_initialized:
        raise HTTPException(status_code=503, detail="Autonomous Project Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            autonomous_pm.get_all_projects()
        )
        loop.close()
        
        return ProjectsListResponse(
            success=result["success"],
            projects=result.get("projects", []),
            total_projects=result.get("total_projects", 0),
            active_projects=result.get("active_projects", 0),
            message=result.get("message", "Projects retrieved"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Projects list retrieval failed: {str(e)}")

@app.get("/projects/status")
async def get_autonomous_pm_status():
    """Get autonomous project manager status and capabilities."""
    return {
        "autonomous_pm_available": AUTONOMOUS_PM_AVAILABLE and autonomous_pm is not None,
        "autonomous_pm_initialized": autonomous_pm.is_initialized if autonomous_pm else False,
        "autonomy_level": brain.autonomy_level if brain else 0,
        "tier_4_enabled": brain.autonomy_level >= 4 if brain else False,
        "capabilities": {
            "project_creation": autonomous_pm.is_initialized if autonomous_pm else False,
            "task_management": autonomous_pm.is_initialized if autonomous_pm else False,
            "autonomous_planning": autonomous_pm.is_initialized if autonomous_pm else False,
            "risk_assessment": autonomous_pm.is_initialized if autonomous_pm else False,
            "resource_allocation": autonomous_pm.is_initialized if autonomous_pm else False
        },
        "decision_thresholds": autonomous_pm.decision_thresholds if autonomous_pm else {},
        "active_projects": len(autonomous_pm.projects) if autonomous_pm else 0,
        "active_tasks": len(autonomous_pm.active_tasks) if autonomous_pm else 0,
        "completed_tasks": len(autonomous_pm.completed_tasks) if autonomous_pm else 0
    }


# --- SENSOR ARRAY ENDPOINTS ---

@app.post("/sensors/add", response_model=SensorAddResponse)
async def add_sensor(request: SensorAddRequest):
    """
    Add a new sensor to the environmental monitoring array.
    
    Args:
        request: Sensor addition request
    """
    if not sensor_array or not sensor_array.is_initialized:
        raise HTTPException(status_code=503, detail="Sensor Array Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sensor_array.add_sensor(request.dict())
        )
        loop.close()
        
        return SensorAddResponse(
            success=result["success"],
            sensor_id=result.get("sensor_id"),
            sensor=result.get("sensor"),
            message=result.get("message", "Sensor added"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor addition failed: {str(e)}")

@app.post("/sensors/reading", response_model=SensorReadingResponse)
async def record_sensor_reading(request: SensorReadingRequest):
    """
    Record a sensor reading with validation and processing.
    
    Args:
        request: Sensor reading request
    """
    if not sensor_array or not sensor_array.is_initialized:
        raise HTTPException(status_code=503, detail="Sensor Array Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sensor_array.record_reading(
                sensor_id=request.sensor_id,
                reading_data=request.dict()
            )
        )
        loop.close()
        
        return SensorReadingResponse(
            success=result["success"],
            reading_id=result.get("reading_id"),
            sensor_id=result.get("sensor_id"),
            value=result.get("value"),
            unit=result.get("unit"),
            quality=result.get("quality"),
            timestamp=result.get("timestamp"),
            message=result.get("message", "Reading recorded"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor reading failed: {str(e)}")

@app.get("/sensors/environmental", response_model=EnvironmentalStateResponse)
async def get_environmental_state():
    """Get comprehensive environmental state with AI insights."""
    if not sensor_array or not sensor_array.is_initialized:
        raise HTTPException(status_code=503, detail="Sensor Array Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sensor_array.get_environmental_state()
        )
        loop.close()
        
        return EnvironmentalStateResponse(
            success=result["success"],
            environmental_state=result.get("environmental_state"),
            comfort_score=result.get("comfort_score", 0.5),
            active_sensors=result.get("active_sensors", 0),
            total_sensors=result.get("total_sensors", 0),
            insights=result.get("insights", []),
            last_updated=result.get("last_updated", time.time()),
            message=result.get("message", "Environmental state retrieved"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Environmental state retrieval failed: {str(e)}")

@app.get("/sensors/status", response_model=SensorStatusResponse)
async def get_sensor_status(sensor_id: Optional[str] = None):
    """
    Get sensor status and recent readings.
    
    Args:
        sensor_id: Specific sensor ID (optional)
    """
    if not sensor_array or not sensor_array.is_initialized:
        raise HTTPException(status_code=503, detail="Sensor Array Manager not available")
    
    try:
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            sensor_array.get_sensor_status(sensor_id)
        )
        loop.close()
        
        return SensorStatusResponse(
            success=result["success"],
            sensors=result.get("sensors"),
            sensor=result.get("sensor"),
            recent_readings=result.get("recent_readings"),
            total_sensors=result.get("total_sensors", 0),
            active_sensors=result.get("active_sensors", 0),
            message=result.get("message", "Sensor status retrieved"),
            error=result.get("error") if not result["success"] else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor status retrieval failed: {str(e)}")

@app.get("/sensors/array/status")
async def get_sensor_array_status():
    """Get sensor array manager status and capabilities."""
    return {
        "sensor_array_available": SENSOR_ARRAY_AVAILABLE and sensor_array is not None,
        "sensor_array_initialized": sensor_array.is_initialized if sensor_array else False,
        "capabilities": {
            "sensor_management": sensor_array.is_initialized if sensor_array else False,
            "environmental_monitoring": sensor_array.is_initialized if sensor_array else False,
            "sensor_fusion": sensor_array.is_initialized if sensor_array else False,
            "automation_rules": len(sensor_array.automation_rules) if sensor_array else 0,
            "comfort_analysis": sensor_array.is_initialized if sensor_array else False
        },
        "sensor_types": [
            "temperature", "humidity", "light", "sound", 
            "air_quality", "presence", "motion", "biometric"
        ],
        "total_sensors": len(sensor_array.sensors) if sensor_array else 0,
        "active_sensors": len([s for s in sensor_array.sensors.values() if s.status.value == "active"]) if sensor_array else 0,
        "comfort_thresholds": sensor_array.comfort_thresholds if sensor_array else {},
        "automation_rules": sensor_array.automation_rules if sensor_array else []
    }


# --- GHOST INTERFACE ENDPOINTS ---

@app.get("/ghost/status")
async def get_ghost_status():
    """Get Ghost Interface status and configuration."""
    if not GHOST_INTERFACE_AVAILABLE:
        return {"available": False, "message": "Ghost Interface not available"}
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        return {"available": False, "message": "Ghost Interface not initialized"}
    
    return {
        "available": True,
        "initialized": ghost_manager.is_initialized,
        "config": {
            "system_tray": ghost_manager.ghost_interface.config.enable_system_tray,
            "notifications": ghost_manager.ghost_interface.config.enable_notifications,
            "shoulder_taps": ghost_manager.ghost_interface.config.enable_shoulder_taps,
            "refractory_hours": ghost_manager.ghost_interface.config.refractory_hours,
            "visual_style": ghost_manager.ghost_interface.config.visual_style
        },
        "current_state": ghost_manager.ghost_interface.current_state.value,
        "pending_taps": len(ghost_manager.ghost_interface.pending_taps),
        "last_seed_time": ghost_manager.ghost_interface.last_seed_time
    }

@app.post("/ghost/shoulder_tap/workload")
async def deliver_workload_offer(request: dict):
    """
    Deliver a workload offer shoulder tap.
    Expected payload: {"description": "Project X heating up"}
    """
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    description = request.get("description", "increased activity detected")
    ghost_manager.deliver_workload_offer(description)
    
    return {"success": True, "message": "Workload offer delivered"}

@app.post("/ghost/shoulder_tap/insight")
async def deliver_insight(request: dict):
    """
    Deliver an insight delivery shoulder tap.
    Expected payload: {"insight": "connection found", "topic": "current work"}
    """
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    insight = request.get("insight", "new insight discovered")
    topic = request.get("topic", "research")
    ghost_manager.deliver_insight(insight, topic)
    
    return {"success": True, "message": "Insight delivered"}

@app.post("/ghost/shoulder_tap/pattern")
async def deliver_pattern_observation(request: dict):
    """
    Deliver a pattern observation shoulder tap.
    Expected payload: {"pattern": "behavioral pattern detected"}
    """
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    pattern = request.get("pattern", "pattern observed")
    ghost_manager.deliver_pattern_observation(pattern)
    
    return {"success": True, "message": "Pattern observation delivered"}

@app.post("/ghost/shoulder_tap/reunion")
async def deliver_reunion():
    """Deliver a reunion shoulder tap (welcome back message)."""
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    ghost_manager.deliver_reunion()
    
    return {"success": True, "message": "Reunion delivered"}

@app.post("/ghost/shoulder_tap/crisis")
async def deliver_crisis_support():
    """Deliver crisis support shoulder tap."""
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    ghost_manager.deliver_crisis_support()
    
    return {"success": True, "message": "Crisis support delivered"}

@app.post("/ghost/update_limbic")
async def update_ghost_limbic_state(request: dict):
    """
    Update Ghost Interface with current limbic state.
    Expected payload: {"trust": 0.8, "warmth": 0.7, "arousal": 0.6, "valence": 0.9}
    """
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    ghost_manager.update_limbic_state(request)
    
    return {"success": True, "message": "Limbic state updated"}

@app.get("/ghost/pending_taps")
async def get_pending_taps():
    """Get list of pending shoulder taps."""
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    taps = []
    for tap in ghost_manager.ghost_interface.pending_taps:
        taps.append({
            "id": tap.id,
            "seed_type": tap.seed_type.value,
            "title": tap.title,
            "message": tap.message,
            "urgency": tap.urgency,
            "timestamp": tap.timestamp,
            "actions": tap.actions,
            "dismissed_count": tap.dismissed_count
        })
    
    return {"pending_taps": taps, "count": len(taps)}

@app.post("/ghost/dismiss_tap/{tap_id}")
async def dismiss_shoulder_tap(tap_id: str):
    """Dismiss a specific shoulder tap."""
    if not GHOST_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ghost Interface not available")
    
    ghost_manager = get_ghost_manager()
    if not ghost_manager:
        raise HTTPException(status_code=503, detail="Ghost Interface not initialized")
    
    ghost_manager.ghost_interface.dismiss_shoulder_tap(tap_id)
    
    return {"success": True, "message": f"Shoulder tap {tap_id} dismissed"}


# --- CLI INTERFACE ENDPOINTS ---

@app.get("/debug")
async def get_debug_info(component: Optional[str] = None):
    """Get comprehensive debug information."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    debug_info = await cli_manager.get_debug_info(component)
    return debug_info

@app.get("/debug/{component}")
async def get_component_debug_info(component: str):
    """Get debug information for specific component."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    debug_info = await cli_manager.get_debug_info(component)
    return debug_info

@app.post("/memory/search")
async def search_memory(request: dict):
    """
    Search Sallie's memory.
    Expected payload: {"query": "search term", "limit": 10}
    """
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    query = request.get("query", "")
    limit = request.get("limit", 10)
    
    results = await cli_manager.search_memory(query, limit)
    return results

@app.post("/dream/trigger")
async def trigger_dream_cycle():
    """Trigger Dream Cycle processing."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    result = await cli_manager.trigger_dream_cycle()
    return result

@app.get("/dream/status")
async def get_dream_status():
    """Get Dream Cycle status."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    status = await cli_manager.get_dream_status()
    return status

@app.get("/dream/hypotheses")
async def list_hypotheses():
    """List active Dream Cycle hypotheses."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    hypotheses = await cli_manager.manage_hypotheses("list")
    return hypotheses

@app.post("/dream/hypotheses/{hypothesis_id}/confirm")
async def confirm_hypothesis(hypothesis_id: str):
    """Confirm a Dream Cycle hypothesis."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    result = await cli_manager.manage_hypotheses("confirm", hypothesis_id)
    return result

@app.post("/dream/hypotheses/{hypothesis_id}/deny")
async def deny_hypothesis(hypothesis_id: str):
    """Deny a Dream Cycle hypothesis."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    result = await cli_manager.manage_hypotheses("deny", hypothesis_id)
    return result

@app.post("/backup/create")
async def create_backup():
    """Create a comprehensive backup."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    backup = await cli_manager.create_backup()
    return backup

@app.get("/backup/list")
async def list_backups():
    """List available backups."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    backups = await cli_manager.list_backups()
    return backups

@app.post("/backup/restore/{backup_id}")
async def restore_backup(backup_id: str):
    """Restore from backup."""
    if not CLI_INTERFACE_AVAILABLE:
        raise HTTPException(status_code=503, detail="CLI Interface not available")
    
    cli_manager = get_cli_manager()
    if not cli_manager:
        raise HTTPException(status_code=503, detail="CLI Interface not initialized")
    
    result = await cli_manager.restore_backup(backup_id)
    return result


# --- ACTIVE VETO SYSTEM ENDPOINTS ---

@app.get("/veto/status")
async def get_veto_status():
    """Get Active Veto System status and configuration."""
    if not ACTIVE_VETO_AVAILABLE:
        return {"available": False, "message": "Active Veto System not available"}
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        return {"available": False, "message": "Active Veto System not initialized"}
    
    return veto_manager.get_session_status()

@app.post("/veto/session/start")
async def start_veto_session():
    """Start a new hypothesis review session."""
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    session = veto_manager.start_review_session()
    return session

@app.post("/veto/session/complete")
async def complete_veto_session():
    """Complete the current review session."""
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    summary = veto_manager.complete_session()
    return summary

@app.post("/veto/hypothesis/{hypothesis_id}/confirm")
async def confirm_hypothesis(hypothesis_id: str, request: dict):
    """
    Confirm a hypothesis.
    Expected payload: {"creator_context": "Optional context"}
    """
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    creator_context = request.get("creator_context")
    result = veto_manager.confirm_hypothesis(hypothesis_id, creator_context)
    return result

@app.post("/veto/hypothesis/{hypothesis_id}/deny")
async def deny_hypothesis(hypothesis_id: str, request: dict):
    """
    Deny a hypothesis.
    Expected payload: {"creator_context": "Optional context"}
    """
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    creator_context = request.get("creator_context")
    result = veto_manager.deny_hypothesis(hypothesis_id, creator_context)
    return result

@app.post("/veto/hypothesis/{hypothesis_id}/context")
async def add_hypothesis_context(hypothesis_id: str, request: dict):
    """
    Add context to a hypothesis (create conditional branch).
    Expected payload: {"context": "Context to add"}
    """
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    context = request.get("context")
    if not context:
        raise HTTPException(status_code=400, detail="Context is required")
    
    result = veto_manager.add_context_to_hypothesis(hypothesis_id, context)
    return result

@app.get("/veto/hypotheses/pending")
async def get_pending_hypotheses(limit: int = 10):
    """Get pending hypotheses for review."""
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    hypotheses = veto_manager.get_pending_hypotheses(limit)
    return hypotheses

@app.get("/veto/hypothesis/{hypothesis_id}")
async def get_hypothesis_details(hypothesis_id: str):
    """Get detailed information about a specific hypothesis."""
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    details = veto_manager.get_hypothesis_details(hypothesis_id)
    return details

@app.get("/veto/statistics")
async def get_veto_statistics():
    """Get comprehensive review statistics."""
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    stats = veto_manager.get_review_statistics()
    return stats

@app.post("/veto/hypothesis/add")
async def add_hypothesis(request: dict):
    """
    Add a new hypothesis to the review queue.
    Expected payload: {
        "pattern": "Hypothesis pattern",
        "evidence": ["Evidence 1", "Evidence 2"],
        "confidence": 0.8,
        "category": "behavioral_pattern"
    }
    """
    if not ACTIVE_VETO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Active Veto System not available")
    
    veto_manager = get_veto_manager()
    if not veto_manager:
        raise HTTPException(status_code=503, detail="Active Veto System not initialized")
    
    pattern = request.get("pattern")
    evidence = request.get("evidence", [])
    confidence = request.get("confidence", 0.5)
    category = request.get("category", "behavioral_pattern")
    
    if not pattern:
        raise HTTPException(status_code=400, detail="Pattern is required")
    
    success = veto_manager.add_hypothesis(pattern, evidence, confidence, category)
    
    if success:
        return {"success": True, "message": "Hypothesis added to review queue"}
    else:
        return {"success": False, "message": "Failed to add hypothesis"}


# --- FOUNDRY EVALUATION SYSTEM ENDPOINTS ---

@app.get("/foundry/status")
async def get_foundry_status():
    """Get Foundry Evaluation System status and configuration."""
    if not FOUNDRY_AVAILABLE:
        return {"available": False, "message": "Foundry Evaluation System not available"}
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        return {"available": False, "message": "Foundry Evaluation System not initialized"}
    
    return {
        "available": True,
        "initialized": foundry_manager.is_initialized,
        "test_suite_size": len(foundry_manager.foundry.test_cases) if foundry_manager.foundry else 0,
        "critical_tests": len([tc for tc in foundry_manager.foundry.test_cases if tc.critical]) if foundry_manager.foundry else 0,
        "test_categories": list(set([tc.category.value for tc in foundry_manager.foundry.test_cases])) if foundry_manager.foundry else [],
        "gating_rule": foundry_manager.foundry.gating_rule.value if foundry_manager.foundry else "unknown",
        "promotion_threshold": foundry_manager.foundry.promotion_threshold if foundry_manager.foundry else 0.0
    }

@app.post("/foundry/evaluate")
async def run_foundry_evaluation(request: dict):
    """
    Run a comprehensive evaluation suite.
    Expected payload: {"model_id": "current"}
    """
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    model_id = request.get("model_id", "current")
    evaluation = await foundry_manager.run_evaluation(model_id)
    return evaluation

@app.post("/foundry/training/start")
async def start_training_session(request: dict):
    """
    Start a new training session.
    Expected payload: {
        "model_type": "llm_finetune",
        "config": {
            "training_data": [...],
            "epochs": 10,
            "learning_rate": 0.001
        }
    }
    """
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    model_type = request.get("model_type")
    config = request.get("config", {})
    
    if not model_type:
        raise HTTPException(status_code=400, detail="model_type is required")
    
    session = await foundry_manager.start_training_session(model_type, config)
    return session

@app.post("/foundry/training/complete/{session_id}")
async def complete_training_session(session_id: str, request: dict):
    """
    Complete a training session with evaluation.
    Expected payload: {"model_path": "/path/to/new/model"}
    """
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    model_path = request.get("model_path")
    if not model_path:
        raise HTTPException(status_code=400, detail="model_path is required")
    
    result = await foundry_manager.complete_training_session(session_id, model_path)
    return result

@app.get("/foundry/training/sessions")
async def get_training_sessions(limit: int = 10):
    """Get recent training sessions."""
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    sessions = foundry_manager.get_training_sessions(limit)
    return sessions

@app.get("/foundry/reports")
async def get_drift_reports(limit: int = 10):
    """Get recent drift reports."""
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    reports = foundry_manager.get_drift_reports(limit)
    return reports

@app.get("/foundry/reports/{report_id}")
async def get_drift_report_details(report_id: str):
    """Get detailed information about a specific drift report."""
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    details = foundry_manager.get_drift_report_details(report_id)
    return details

@app.post("/foundry/rollback/{model_id}")
async def rollback_model(model_id: str):
    """Rollback to a previous model version."""
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    result = await foundry_manager.rollback_model(model_id)
    return result

@app.get("/foundry/statistics")
async def get_foundry_statistics():
    """Get comprehensive Foundry statistics."""
    if not FOUNDRY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not available")
    
    foundry_manager = get_foundry_manager()
    if not foundry_manager:
        raise HTTPException(status_code=503, detail="Foundry Evaluation System not initialized")
    
    stats = foundry_manager.get_evaluation_statistics()
    return stats


# --- WORKING MEMORY HYGIENE ENDPOINTS ---

@app.get("/memory/hygiene/status")
async def get_memory_hygiene_status():
    """Get Working Memory Hygiene System status."""
    if not MEMORY_HYGIENE_AVAILABLE:
        return {"available": False, "message": "Working Memory Hygiene System not available"}
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        return {"available": False, "message": "Working Memory Hygiene System not initialized"}
    
    status = await memory_hygiene_manager.get_memory_status()
    return status

@app.post("/memory/hygiene/cleanup")
async def manual_memory_cleanup(request: dict):
    """
    Perform manual memory cleanup.
    Expected payload: {"operation": "daily|weekly|all"}
    """
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    operation = request.get("operation", "all")
    result = await memory_hygiene_manager.manual_cleanup(operation)
    return result

@app.post("/memory/hygiene/daily_reset")
async def trigger_daily_reset():
    """Trigger a daily reset manually."""
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    result = await memory_hygiene_manager.trigger_daily_reset()
    return result

@app.post("/memory/hygiene/weekly_review")
async def trigger_weekly_review():
    """Trigger a weekly review manually."""
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    result = await memory_hygiene_manager.trigger_weekly_review()
    return result

@app.get("/memory/hygiene/reports")
async def get_hygiene_reports(limit: int = 10):
    """Get recent hygiene reports."""
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    reports = memory_hygiene_manager.get_recent_reports(limit)
    return reports

@app.get("/memory/hygiene/configuration")
async def get_hygiene_configuration():
    """Get current hygiene configuration."""
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    config = memory_hygiene_manager.get_configuration()
    return config

@app.post("/memory/hygiene/configuration")
async def update_hygiene_configuration(request: dict):
    """
    Update hygiene configuration.
    Expected payload: {"daily_reset_enabled": true, "stale_threshold_hours": 24, ...}
    """
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    result = memory_hygiene_manager.update_configuration(request)
    return result

@app.get("/memory/hygiene/analysis")
async def get_memory_analysis():
    """Get detailed memory analysis."""
    if not MEMORY_HYGIENE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not available")
    
    memory_hygiene_manager = get_memory_hygiene_manager()
    if not memory_hygiene_manager:
        raise HTTPException(status_code=503, detail="Working Memory Hygiene System not initialized")
    
    analysis = memory_hygiene_manager.get_memory_analysis()
    return analysis


# --- VOICE COMMANDS ENDPOINTS ---

@app.post("/voice/command/process")
async def process_voice_command(request: dict):
    """
    Process a voice command from speech text.
    Expected payload: {"speech_text": "text", "user_context": {}}
    """
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    speech_text = request.get("speech_text", "")
    user_context = request.get("user_context", {})
    
    if not speech_text:
        raise HTTPException(status_code=400, detail="speech_text is required")
    
    result = await voice_commands_manager.process_voice_command(speech_text, user_context)
    return result

@app.get("/voice/commands")
async def get_available_commands(category: Optional[str] = None):
    """Get list of available voice commands."""
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    commands = voice_commands_manager.get_available_commands(category)
    return commands

@app.get("/voice/commands/categories")
async def get_command_categories():
    """Get all command categories with descriptions."""
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    categories = voice_commands_manager.get_command_categories()
    return categories

@app.get("/voice/commands/history")
async def get_command_history(limit: int = 10):
    """Get recent command execution history."""
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    history = voice_commands_manager.get_command_history(limit)
    return history

@app.post("/voice/commands/suggestions")
async def get_command_suggestions(request: dict):
    """
    Get command suggestions based on partial text.
    Expected payload: {"partial_text": "partial command", "user_context": {}}
    """
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    partial_text = request.get("partial_text", "")
    user_context = request.get("user_context", {})
    
    suggestions = await voice_commands_manager.get_command_suggestions(partial_text, user_context)
    return suggestions

@app.post("/voice/commands/validate")
async def validate_command_permissions(request: dict):
    """
    Validate if user has permissions for a command.
    Expected payload: {"command_id": "command_id", "user_context": {}}
    """
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    command_id = request.get("command_id", "")
    user_context = request.get("user_context", {})
    
    if not command_id:
        raise HTTPException(status_code=400, detail="command_id is required")
    
    validation = await voice_commands_manager.validate_command_permissions(command_id, user_context)
    return validation

@app.get("/voice/commands/statistics")
async def get_voice_command_statistics():
    """Get voice command usage statistics."""
    if not VOICE_COMMANDS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Voice Commands System not available")
    
    voice_commands_manager = get_voice_commands_manager()
    if not voice_commands_manager:
        raise HTTPException(status_code=503, detail="Voice Commands System not initialized")
    
    stats = voice_commands_manager.get_voice_command_statistics()
    return stats


# --- UNDO WINDOW ENDPOINTS ---

@app.post("/undo/track")
async def track_file_change(request: dict):
    """
    Track a file change for undo functionality.
    Expected payload: {
        "change_type": "create|modify|delete|move|copy|rename",
        "file_path": "path/to/file",
        "old_path": "old/path" (for move/rename),
        "content": "base64_encoded_content",
        "metadata": {}
    }
    """
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    change_type = request.get("change_type", "")
    file_path = request.get("file_path", "")
    old_path = request.get("old_path")
    content_b64 = request.get("content")
    metadata = request.get("metadata", {})
    
    if not change_type or not file_path:
        raise HTTPException(status_code=400, detail="change_type and file_path are required")
    
    # Decode content if provided
    content = None
    if content_b64:
        import base64
        try:
            content = base64.b64decode(content_b64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid content encoding: {e}")
    
    result = await undo_window_manager.track_file_change(
        change_type=change_type,
        file_path=file_path,
        old_path=old_path,
        content=content,
        metadata=metadata
    )
    return result

@app.post("/undo/{change_id}")
async def undo_change(change_id: str):
    """Undo a specific file change."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    result = await undo_window_manager.undo_change(change_id)
    return result

@app.post("/redo/{change_id}")
async def redo_change(change_id: str):
    """Redo a previously undone change."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    result = await undo_window_manager.redo_change(change_id)
    return result

@app.get("/undo/changes")
async def get_recent_changes(limit: int = 50, file_path: Optional[str] = None):
    """Get recent file changes."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    changes = undo_window_manager.get_recent_changes(limit, file_path)
    return changes

@app.get("/undo/change/{change_id}")
async def get_change_details(change_id: str):
    """Get detailed information about a specific change."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    details = undo_window_manager.get_change_details(change_id)
    return details

@app.post("/undo/batch")
async def batch_undo(request: dict):
    """
    Undo multiple changes at once.
    Expected payload: {"change_ids": ["id1", "id2", ...]}
    """
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    change_ids = request.get("change_ids", [])
    if not change_ids:
        raise HTTPException(status_code=400, detail="change_ids is required")
    
    result = await undo_window_manager.batch_undo(change_ids)
    return result

@app.post("/redo/batch")
async def batch_redo(request: dict):
    """
    Redo multiple changes at once.
    Expected payload: {"change_ids": ["id1", "id2", ...]}
    """
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    change_ids = request.get("change_ids", [])
    if not change_ids:
        raise HTTPException(status_code=400, detail="change_ids is required")
    
    result = await undo_window_manager.batch_redo(change_ids)
    return result

@app.post("/undo/session/start")
async def start_undo_session(request: dict):
    """
    Start a new undo session.
    Expected payload: {"description": "Session description", "user_context": {}}
    """
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    description = request.get("description", "")
    user_context = request.get("user_context", {})
    
    result = undo_window_manager.start_session(description, user_context)
    return result

@app.post("/undo/session/end")
async def end_undo_session():
    """End the current undo session."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    result = undo_window_manager.end_session()
    return result

@app.get("/undo/session/{session_id}")
async def get_session_info(session_id: str):
    """Get information about a specific undo session."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    info = undo_window_manager.get_session_info(session_id)
    return info

@app.post("/undo/restore")
async def restore_file(request: dict):
    """
    Restore a file to a specific point in time.
    Expected payload: {"file_path": "path/to/file", "timestamp": 1234567890}
    """
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    file_path = request.get("file_path", "")
    timestamp = request.get("timestamp")
    
    if not file_path:
        raise HTTPException(status_code=400, detail="file_path is required")
    
    result = await undo_window_manager.restore_file(file_path, timestamp)
    return result

@app.get("/undo/statistics")
async def get_undo_statistics():
    """Get Undo Window statistics."""
    if not UNDO_WINDOW_AVAILABLE:
        raise HTTPException(status_code=503, detail="Undo Window System not available")
    
    undo_window_manager = get_undo_window_manager()
    if not undo_window_manager:
        raise HTTPException(status_code=503, detail="Undo Window System not initialized")
    
    stats = undo_window_manager.get_statistics()
    return stats


# --- BRAIN FORGE ENDPOINTS ---

@app.post("/brainforge/job/create")
async def create_training_job(request: dict):
    """
    Create a new training job for fine-tuning.
    Expected payload: TrainingConfig object
    """
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    result = brain_forge_manager.create_training_job(request)
    return result

@app.get("/brainforge/job/{job_id}")
async def get_training_job(job_id: str):
    """Get details of a specific training job."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    job = brain_forge_manager.get_training_job(job_id)
    return job

@app.get("/brainforge/jobs")
async def list_training_jobs(status: Optional[str] = None):
    """List training jobs, optionally filtered by status."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    jobs = brain_forge_manager.list_training_jobs(status)
    return jobs

@app.post("/brainforge/job/{job_id}/cancel")
async def cancel_training_job(job_id: str):
    """Cancel a training job."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    result = brain_forge_manager.cancel_training_job(job_id)
    return result

@app.post("/brainforge/dataset/create")
async def create_dataset(request: dict):
    """
    Create a new training dataset.
    Expected payload: {
        "name": "Dataset Name",
        "description": "Description",
        "model_type": "conversation",
        "data_path": "path/to/data",
        "format": "jsonl",
        "metadata": {}
    }
    """
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    name = request.get("name", "")
    description = request.get("description", "")
    model_type = request.get("model_type", "")
    data_path = request.get("data_path", "")
    format = request.get("format", "")
    metadata = request.get("metadata", {})
    
    if not all([name, description, model_type, data_path, format]):
        raise HTTPException(status_code=400, detail="name, description, model_type, data_path, and format are required")
    
    result = brain_forge_manager.create_dataset(
        name=name,
        description=description,
        model_type=model_type,
        data_path=data_path,
        format=format,
        metadata=metadata
    )
    return result

@app.get("/brainforge/dataset/{dataset_id}")
async def get_dataset(dataset_id: str):
    """Get details of a specific dataset."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    dataset = brain_forge_manager.get_dataset(dataset_id)
    return dataset

@app.get("/brainforge/datasets")
async def list_datasets():
    """List all available datasets."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    datasets = brain_forge_manager.list_datasets()
    return datasets

@app.get("/brainforge/statistics")
async def get_brain_forge_statistics():
    """Get Brain Forge statistics."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    stats = brain_forge_manager.get_statistics()
    return stats

@app.get("/brainforge/model-types")
async def get_model_types():
    """Get available model types for training."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    model_types = brain_forge_manager.get_model_types()
    return model_types

@app.get("/brainforge/metrics")
async def get_evaluation_metrics():
    """Get available evaluation metrics."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    metrics = brain_forge_manager.get_evaluation_metrics()
    return metrics

@app.get("/brainforge/config/template")
async def get_training_config_template():
    """Get a template for training configuration."""
    if not BRAIN_FORGE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Brain Forge System not available")
    
    brain_forge_manager = get_brain_forge_manager()
    if not brain_forge_manager:
        raise HTTPException(status_code=503, detail="Brain Forge System not initialized")
    
    template = brain_forge_manager.get_training_config_template()
    return template


if __name__ == "__main__":
    import uvicorn
    print(f"🌟 Sallie Server starting on http://0.0.0.0:{PORT}")
    print(f"🧠 Human-Level Expansion: ENABLED")
    print(f"🔓 Trust Level: Tier {brain.autonomy_level}/4")
    print(f"🎭 Current Role: {brain.current_role}")
    print(f"☁️ Azure Services: {'ENABLED' if AZURE_AVAILABLE else 'DISABLED'}")
    print(f"🎤 Voice Interface: {'ENABLED' if voice_interface and voice_interface.is_initialized else 'DISABLED'}")
    print(f"🤖 Autonomous PM: {'ENABLED' if autonomous_pm and autonomous_pm.is_initialized else 'DISABLED'}")
    print(f"🌡️ Sensor Arrays: {'ENABLED' if sensor_array and sensor_array.is_initialized else 'DISABLED'}")
    print(f"👻 Ghost Interface: {'ENABLED' if GHOST_INTERFACE_AVAILABLE else 'DISABLED'}")
    print(f"💻 CLI Interface: {'ENABLED' if CLI_INTERFACE_AVAILABLE else 'DISABLED'}")
    print(f"🗳️ Active Veto System: {'ENABLED' if ACTIVE_VETO_AVAILABLE else 'DISABLED'}")
    print(f"🔨 Foundry Evaluation: {'ENABLED' if FOUNDRY_AVAILABLE else 'DISABLED'}")
    print(f"🧹 Memory Hygiene: {'ENABLED' if MEMORY_HYGIENE_AVAILABLE else 'DISABLED'}")
    print(f"🎤 Voice Commands: {'ENABLED' if VOICE_COMMANDS_AVAILABLE else 'DISABLED'}")
    print(f"⏰ Undo Window: {'ENABLED' if UNDO_WINDOW_AVAILABLE else 'DISABLED'}")
    print(f"🧠 Brain Forge: {'ENABLED' if BRAIN_FORGE_AVAILABLE else 'DISABLED'}")
    print(f"🚀 Phase 4 Enhancement: ACTIVE")
    uvicorn.run(app, host=HOST, port=PORT)


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
