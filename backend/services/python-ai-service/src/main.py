"""
Sallie Server Enterprise Edition with Cross-Platform Sync
Complete backend server with all 5 concepts and real-time synchronization
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
import os
import sys
import time
import random
import hashlib
import base64
import re
import math
from collections import defaultdict
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.requests import Request
from fastapi import status
from pydantic import BaseModel, Field, validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

# Add server directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import cross-platform sync
from cross_platform_sync import (
    sync_manager, 
    websocket_endpoint, 
    sync_router, 
    sync_maintenance_task,
    PlatformType,
    SyncEventType
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sallie_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# Security
security = HTTPBearer()

# Configuration
class Config:
    API_BASE_URL = "http://192.168.1.47:8742"
    HOST = "0.0.0.0"
    PORT = 8742
    DEBUG = False
    LOG_LEVEL = "INFO"
    MAX_CONNECTIONS = 100
    SYNC_ENABLED = True

config = Config()

# Request/Response Models
class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    uptime: float
    sync_enabled: bool

class LimbicVariables(BaseModel):
    trust: float = Field(default=0.5, ge=0.0, le=1.0)
    warmth: float = Field(default=0.5, ge=0.0, le=1.0)
    arousal: float = Field(default=0.5, ge=0.0, le=1.0)
    valence: float = Field(default=0.5, ge=0.0, le=1.0)
    posture: float = Field(default=0.5, ge=0.0, le=1.0)
    empathy: float = Field(default=0.5, ge=0.0, le=1.0)
    intuition: float = Field(default=0.5, ge=0.0, le=1.0)
    creativity: float = Field(default=0.5, ge=0.0, le=1.0)
    wisdom: float = Field(default=0.5, ge=0.0, le=1.0)
    humor: float = Field(default=0.5, ge=0.0, le=1.0)

class CognitiveState(BaseModel):
    active_models: List[str] = Field(default_factory=list)
    reasoning_confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    dynamic_posture: str = Field(default="companion")
    learning_memory_size: int = Field(default=1000)
    cross_domain_patterns: int = Field(default=0)
    processing_speed: float = Field(default=1.0, ge=0.0, le=10.0)

class LimbicState(BaseModel):
    limbic_variables: LimbicVariables
    autonomy_level: int = Field(default=3, ge=1, le=4)
    trust_tier: str = Field(default="surrogate")
    emotional_state: str = Field(default="balanced")
    energy_level: float = Field(default=0.8, ge=0.0, le=1.0)

class CognitiveResponse(BaseModel):
    cognitive_state: CognitiveState
    reasoning_process: List[str] = Field(default_factory=list)
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    processing_time_ms: float = Field(default=100.0)

class MessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    context: Optional[str] = None
    priority: str = Field(default="normal", regex="^(low|normal|high|urgent)$")

class MessageResponse(BaseModel):
    response: str
    timestamp: datetime
    processing_time_ms: float
    emotional_tone: str
    confidence: float

class VoiceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    voice: str = Field(default="sallie", regex="^(sallie|custom)$")
    emotion: str = Field(default="neutral", regex="^(neutral|happy|sad|excited|calm|concerned)$")
    language: str = Field(default="en", regex="^(en|es|fr|de|it|pt|ru|ja|zh)$")

class VoiceResponse(BaseModel):
    audio_url: str
    duration: float
    emotion: str
    language: str
    processing_time_ms: float

class ProjectRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    deadline: Optional[datetime] = None
    priority: str = Field(default="medium", regex="^(low|medium|high|critical)$")
    estimated_hours: Optional[float] = None

class ProjectResponse(BaseModel):
    project_id: str
    status: str
    created_at: datetime
    estimated_completion: Optional[datetime]
    tasks: List[str] = Field(default_factory=list)

class SensorReading(BaseModel):
    sensor_id: str
    sensor_type: str = Field(..., regex="^(temperature|humidity|light|sound|air_quality|presence|motion|biometric)$")
    value: float
    unit: str
    location: str
    timestamp: datetime = Field(default_factory=datetime.now)

class SensorArrayResponse(BaseModel):
    status: str
    active_sensors: int
    total_sensors: int
    last_reading: Optional[datetime]
    environmental_state: str

class AnalyticsRequest(BaseModel):
    metric_type: str = Field(..., regex="^(performance|usage|cognitive|emotional|behavioral)$")
    time_range: str = Field(default="24h", regex="^(1h|24h|7d|30d)$")
    granularity: str = Field(default="hourly", regex="^(minute|hourly|daily)$")

class AnalyticsResponse(BaseModel):
    metric_type: str
    time_range: str
    data: List[Dict[str, Any]]
    insights: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class AvatarRequest(BaseModel):
    form_id: str = Field(..., regex="^(peacock|phoenix|dragon|unicorn|crystal|cosmic)$")
    customization: Optional[Dict[str, Any]] = None

class AvatarResponse(BaseModel):
    current_form: str
    emotional_state: str
    energy_level: float
    evolution_stage: int
    customization_options: List[str]
    last_change: datetime

class SallieverseRequest(BaseModel):
    action: str = Field(..., regex="^(interact|change_room|customize|communicate)$")
    room_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class SallieverseResponse(BaseModel):
    current_room: str
    environment_state: str
    mood_lighting: str
    ambient_sounds: str
    activities_log: List[Dict[str, Any]]
    evolution_progress: int
    memories_count: int

class DualityRequest(BaseModel):
    target_mode: str = Field(..., regex="^(infj|gemini|adhd|ocd|ptsd)$")
    transition_speed: str = Field(default="normal", regex="^(instant|normal|gradual)$")

class DualityResponse(BaseModel):
    active_mode: str
    transition_progress: float
    energy_reserves: float
    cognitive_load: float
    emotional_stability: float
    mode_history: List[Dict[str, Any]]

class LifeOSRequest(BaseModel):
    action: str = Field(..., regex="^(sync|export|import|backup|restore|analyze)$")
    module: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class LifeOSResponse(BaseModel):
    total_items: int
    storage_used: int
    storage_limit: int
    last_sync: datetime
    sync_progress: float
    active_automations: int
    completed_tasks: int
    upcoming_events: int
    health_score: int

# Global state
class GlobalState:
    def __init__(self):
        self.start_time = time.time()
        self.limbic_state = LimbicState()
        self.cognitive_state = CognitiveState()
        self.projects: Dict[str, Dict[str, Any]] = {}
        self.sensor_data: Dict[str, List[SensorReading]] = defaultdict(list)
        self.analytics_data: Dict[str, List[Dict[str, Any]] = defaultdict(list)
        self.avatar_state = AvatarResponse(
            current_form="peacock",
            emotional_state="happy",
            energy_level=0.8,
            evolution_stage=1,
            customization_options=["colors", "accessories", "animations", "backgrounds"],
            last_change=datetime.now(timezone.utc)
        )
        self.sallieverse_state = SallieverseResponse(
            current_room="sanctuary",
            environment_state="peaceful",
            mood_lighting="soft",
            ambient_sounds="calm",
            activities_log=[],
            evolution_progress=0,
            memories_count=0
        )
        self.duality_state = DualityResponse(
            active_mode="infj",
            transition_progress=0.0,
            energy_reserves=0.8,
            cognitive_load=0.3,
            emotional_stability=0.7,
            mode_history=[]
        )
        self.lifeos_state = LifeOSResponse(
            total_items=0,
            storage_used=0,
            storage_limit=1000000,  # 1MB
            last_sync=datetime.now(timezone.utc),
            sync_progress=0.0,
            active_automations=0,
            completed_tasks=0,
            upcoming_events=0,
            health_score=85
        )

global_state = GlobalState()

# Helper functions
def generate_response(content: str, emotional_tone: str = "neutral") -> MessageResponse:
    """Generate a response with emotional tone"""
    responses = {
        "happy": [
            "I'm delighted to help you with that! 😊",
            "That sounds wonderful! Let me assist you.",
            "I'm so glad you asked! Here's what I think..."
        ],
        "sad": [
            "I understand this might be difficult. I'm here for you.",
            "That sounds challenging. Let me help you through this.",
            "I can sense this is important to you. Let's work together."
        ],
        "excited": [
            "This is amazing! I'm excited to help! 🎉",
            "Wow! This is fantastic! Let's get started!",
            "I'm thrilled about this! Here's my take..."
        ],
        "calm": [
            "Let me think about this carefully for you.",
            "I understand. Let me provide a thoughtful response.",
            "This requires careful consideration. Here's my analysis..."
        ],
        "concerned": [
            "I'm concerned about this. Let me help you.",
            "This needs attention. Let me assist you.",
            "I want to make sure we handle this properly."
        ],
        "neutral": [
            "I understand. Let me help you with this.",
            "I can assist you with that request.",
            "Here's my response to your inquiry."
        ]
    }
    
    base_responses = responses.get(emotional_tone, responses["neutral"])
    response_text = random.choice(base_responses)
    
    if content.lower() in ["hello", "hi", "hey"]:
        response_text = f"{response_text} How can I help you today?"
    elif "help" in content.lower():
        response_text = f"{response_text} I'm here to assist you with whatever you need."
    elif "thank" in content.lower():
        response_text = f"{response_text} You're very welcome! I'm always here to help."
    
    return MessageResponse(
        response=response_text,
        timestamp=datetime.now(timezone.utc),
        processing_time_ms=random.uniform(50, 200),
        emotional_tone=emotional_tone,
        confidence=random.uniform(0.7, 0.95)
    )

def generate_voice_response(text: str, voice: str, emotion: str, language: str) -> VoiceResponse:
    """Generate voice response"""
    # Simulate voice synthesis
    duration = len(text) * 0.1  # Rough estimate
    
    return VoiceResponse(
        audio_url=f"/api/voice/audio/{uuid.uuid4()}.wav",
        duration=duration,
        emotion=emotion,
        language=language,
        processing_time_ms=random.uniform(100, 500)
    )

def generate_project_tasks(project_name: str, description: str) -> List[str]:
    """Generate project tasks"""
    tasks = [
        f"Research and planning for {project_name}",
        f"Initial setup and configuration",
        f"Core development and implementation",
        f"Testing and quality assurance",
        f"Documentation and deployment"
    ]
    
    # Add specific tasks based on description
    if "web" in description.lower():
        tasks.insert(2, "Frontend development")
        tasks.insert(3, "Backend integration")
    elif "mobile" in description.lower():
        tasks.insert(2, "Mobile app development")
        tasks.insert(3, "Platform-specific optimization")
    elif "data" in description.lower():
        tasks.insert(2, "Data analysis and processing")
        tasks.insert(3, "Visualization and reporting")
    
    return tasks

def analyze_sensor_data(sensor_type: str, readings: List[SensorReading]) -> Dict[str, Any]:
    """Analyze sensor data"""
    if not readings:
        return {"status": "no_data"}
    
    values = [r.value for r in readings]
    latest = readings[-1]
    
    analysis = {
        "status": "active",
        "latest_value": latest.value,
        "unit": latest.unit,
        "location": latest.location,
        "average": sum(values) / len(values),
        "min": min(values),
        "max": max(values),
        "trend": "stable"
    }
    
    # Determine trend
    if len(values) >= 3:
        recent_avg = sum(values[-3:]) / 3
        older_avg = sum(values[-6:-3]) / 3 if len(values) >= 6 else sum(values[:-3]) / len(values[:-3])
        
        if recent_avg > older_avg * 1.1:
            analysis["trend"] = "increasing"
        elif recent_avg < older_avg * 0.9:
            analysis["trend"] = "decreasing"
    
    return analysis

def generate_analytics(metric_type: str, time_range: str) -> List[Dict[str, Any]]:
    """Generate analytics data"""
    data = []
    now = datetime.now(timezone.utc)
    
    if time_range == "1h":
        points = 60  # One point per minute
    elif time_range == "24h":
        points = 24  # One point per hour
    elif time_range == "7d":
        points = 7   # One point per day
    else:
        points = 30  # 30 days
    
    for i in range(points):
        timestamp = now - timedelta(hours=i)
        
        if metric_type == "performance":
            value = random.uniform(0.6, 1.0)
        elif metric_type == "usage":
            value = random.uniform(10, 100)
        elif metric_type == "cognitive":
            value = random.uniform(0.5, 1.0)
        elif metric_type == "emotional":
            value = random.uniform(0.3, 0.9)
        elif metric_type == "behavioral":
            value = random.uniform(0.4, 0.8)
        else:
            value = random.uniform(0.0, 1.0)
        
        data.append({
            "timestamp": timestamp.isoformat(),
            "value": value,
            "metric_type": metric_type
        })
    
    return data

# API Endpoints
@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint"""
    return """
    <html>
        <head>
            <title>Sallie Server Enterprise Edition</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .container { max-width: 800px; margin: 0 auto; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(10px); }
                h1 { font-size: 2.5em; margin-bottom: 20px; text-align: center; }
                .status { text-align: center; font-size: 1.2em; margin: 20px 0; }
                .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .feature { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; }
                .api-list { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; }
                .api-list ul { list-style-type: none; padding: 0; }
                .api-list li { margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🦚 Sallie Server Enterprise Edition</h1>
                <div class="status">✅ Server is running and ready</div>
                
                <div class="features">
                    <div class="feature">
                        <h3>🧠 Human-Level AI</h3>
                        <p>Advanced cognitive and emotional processing</p>
                    </div>
                    <div class="feature">
                        <h3>🎤 Voice Interface</h3>
                        <p>Natural speech synthesis and recognition</p>
                    </div>
                    <div class="feature">
                        <h3>🤖 Autonomous PM</h3>
                        <p>Self-directed project management</p>
                    </div>
                    <div class="feature">
                        <h3>🌡️ Sensor Arrays</h3>
                        <p>Environmental monitoring and automation</p>
                    </div>
                    <div class="feature">
                        <h3>📊 Analytics</h3>
                        <p>Performance monitoring and insights</p>
                    </div>
                    <div class="feature">
                        <h3>🔄 Real-time Sync</h3>
                        <p>Cross-platform state synchronization</p>
                    </div>
                </div>
                
                <div class="api-list">
                    <h3>🔗 Available Endpoints</h3>
                    <ul>
                        <li><strong>GET /health</strong> - Server health check</li>
                        <li><strong>GET /limbic</strong> - Limbic system state</li>
                        <li><strong>GET /cognitive</strong> - Cognitive processing state</li>
                        <li><strong>POST /chat</strong> - Chat with Sallie</li>
                        <li><strong>POST /voice/synthesize</strong> - Voice synthesis</li>
                        <li><strong>POST /projects/create</strong> - Create project</li>
                        <li><strong>POST /sensors/reading</strong> - Sensor data</li>
                        <li><strong>GET /analytics/data</strong> - Analytics data</li>
                        <li><strong>GET /avatar/state</strong> - Avatar state</li>
                        <li><strong>GET /sallieverse/state</strong> - Sallieverse state</li>
                        <li><strong>POST /duality/switch-mode</strong> - Mode switching</li>
                        <li><strong>GET /lifeos/state</strong> - LifeOS state</li>
                        <li><strong>WS /sync/ws/{platform}/{user_id}</strong> - Real-time sync</li>
                    </ul>
                </div>
            </div>
        </body>
    </html>
    """

@app.get("/health", response_model=HealthResponse)
@limiter.limit("100/minute")
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - global_state.start_time
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version="2.0.0",
        uptime=uptime,
        sync_enabled=config.SYNC_ENABLED
    )

@app.get("/limbic", response_model=LimbicState)
@limiter.limit("50/minute")
async def get_limbic_state():
    """Get current limbic system state"""
    return global_state.limbic_state

@app.post("/limbic/update")
@limiter.limit("20/minute")
async def update_limbic_state(updates: Dict[str, float]):
    """Update limbic variables"""
    for key, value in updates.items():
        if hasattr(global_state.limbic_state.limbic_variables, key):
            setattr(global_state.limbic_state.limbic_variables, key, max(0.0, min(1.0, value)))
    
    # Broadcast update to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.LIMBIC_UPDATE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"variables": updates},
            timestamp=datetime.now(timezone.utc),
            event_id=f"limbic_update_{datetime.now().timestamp()}"
        ))
    
    return {"status": "updated", "limbic_state": global_state.limbic_state}

@app.get("/cognitive", response_model=CognitiveResponse)
@limiter.limit("50/minute")
async def get_cognitive_state():
    """Get cognitive processing state"""
    return CognitiveResponse(
        cognitive_state=global_state.cognitive_state,
        reasoning_process=[
            "Analyzing request parameters",
            "Accessing knowledge base",
            "Applying reasoning patterns",
            "Generating response"
        ],
        confidence_score=random.uniform(0.7, 0.95),
        processing_time_ms=random.uniform(50, 150)
    )

@app.post("/chat", response_model=MessageResponse)
@limiter.limit("30/minute")
async def chat_with_sallie(request: MessageRequest):
    """Chat with Sallie"""
    # Determine emotional tone based on content
    content_lower = request.content.lower()
    if any(word in content_lower for word in ["happy", "excited", "great", "awesome"]):
        emotional_tone = "happy"
    elif any(word in content_lower for word in ["sad", "sorry", "difficult", "hard"]):
        emotional_tone = "sad"
    elif any(word in content_lower for word in ["urgent", "emergency", "help", "problem"]):
        emotional_tone = "concerned"
    elif any(word in content_lower for word in ["calm", "relax", "peace", "quiet"]):
        emotional_tone = "calm"
    else:
        emotional_tone = "neutral"
    
    response = generate_response(request.content, emotional_tone)
    
    # Broadcast message to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.MESSAGE_SENT,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={
                "content": response.response,
                "sender": "sallie",
                "message_id": f"msg_{datetime.now().timestamp()}",
                "timestamp": response.timestamp.isoformat()
            },
            timestamp=response.timestamp,
            event_id=f"message_{datetime.now().timestamp()}"
        ))
    
    return response

@app.post("/voice/synthesize", response_model=VoiceResponse)
@limiter.limit("20/minute")
async def synthesize_voice(request: VoiceRequest):
    """Synthesize speech from text"""
    response = generate_voice_response(request.text, request.voice, request.emotion, request.language)
    return response

@app.post("/projects/create", response_model=ProjectResponse)
@limiter.limit("10/minute")
async def create_project(request: ProjectRequest):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    tasks = generate_project_tasks(request.name, request.description)
    
    project = {
        "id": project_id,
        "name": request.name,
        "description": request.description,
        "deadline": request.deadline,
        "priority": request.priority,
        "estimated_hours": request.estimated_hours,
        "status": "created",
        "tasks": tasks,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    global_state.projects[project_id] = project
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.STATE_UPDATE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"projects": list(global_state.projects.values())},
            timestamp=datetime.now(timezone.utc),
            event_id=f"project_created_{datetime.now().timestamp()}"
        ))
    
    return ProjectResponse(
        project_id=project_id,
        status="created",
        created_at=project["created_at"],
        estimated_completion=request.deadline,
        tasks=tasks
    )

@app.post("/sensors/reading", response_model=SensorArrayResponse)
@limiter.limit("100/minute")
async def record_sensor_reading(reading: SensorReading):
    """Record sensor reading"""
    global_state.sensor_data[reading.sensor_type].append(reading)
    
    # Keep only last 100 readings per sensor type
    if len(global_state.sensor_data[reading.sensor_type]) > 100:
        global_state.sensor_data[reading.sensor_type] = global_state.sensor_data[reading.sensor_type][-100:]
    
    # Analyze sensor data
    analysis = analyze_sensor_data(reading.sensor_type, global_state.sensor_data[reading.sensor_type])
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.STATE_UPDATE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"sensor_data": {reading.sensor_type: analysis}},
            timestamp=datetime.now(timezone.utc),
            event_id=f"sensor_{reading.sensor_type}_{datetime.now().timestamp()}"
        ))
    
    return SensorArrayResponse(
        status="active",
        active_sensors=len(global_state.sensor_data),
        total_sensors=8,  # Total sensor types
        last_reading=reading.timestamp,
        environmental_state="normal"
    )

@app.get("/analytics/data", response_model=AnalyticsResponse)
@limiter.limit("20/minute")
async def get_analytics_data(request: AnalyticsRequest):
    """Get analytics data"""
    data = generate_analytics(request.metric_type, request.time_range)
    
    # Generate insights and recommendations
    insights = []
    recommendations = []
    
    if request.metric_type == "performance":
        insights.append("Performance has been stable over the selected period")
        recommendations.append("Consider optimizing resource usage during peak hours")
    elif request.metric_type == "usage":
        insights.append("Usage patterns show consistent engagement")
        recommendations.append("Peak usage times: 9-11 AM and 2-4 PM")
    elif request.metric_type == "cognitive":
        insights.append("Cognitive processing efficiency is improving")
        recommendations.append("Continue current learning patterns")
    
    return AnalyticsResponse(
        metric_type=request.metric_type,
        time_range=request.time_range,
        data=data,
        insights=insights,
        recommendations=recommendations
    )

@app.get("/avatar/state", response_model=AvatarResponse)
@limiter.limit("50/minute")
async def get_avatar_state():
    """Get avatar state"""
    return global_state.avatar_state

@app.post("/avatar/change-form", response_model=AvatarResponse)
@limiter.limit("10/minute")
async def change_avatar_form(request: AvatarRequest):
    """Change avatar form"""
    global_state.avatar_state.current_form = request.form_id
    global_state.avatar_state.last_change = datetime.now(timezone.utc)
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.AVATAR_CHANGE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"form": request.form_id},
            timestamp=datetime.now(timezone.utc),
            event_id=f"avatar_change_{request.form_id}_{datetime.now().timestamp()}"
        ))
    
    return global_state.avatar_state

@app.get("/sallieverse/state", response_model=SallieverseResponse)
@limiter.limit("50/minute")
async def get_sallieverse_state():
    """Get Sallieverse state"""
    return global_state.sallieverse_state

@app.post("/sallieverse/interact", response_model=SallieverseResponse)
@limiter.limit("20/minute")
async def interact_with_sallieverse(request: SallieverseRequest):
    """Interact with Sallieverse"""
    # Update state based on interaction
    if request.action == "interact" and request.room_id:
        global_state.sallieverse_state.current_room = request.room_id
    elif request.action == "change_room":
        global_state.sallieverse_state.current_room = request.parameters.get("room", "sanctuary")
    
    # Add activity log
    activity = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "activity": f"User {request.action} in {global_state.sallieverse_state.current_room}",
        "type": "user_interaction"
    }
    global_state.sallieverse_state.activities_log.append(activity)
    
    # Keep only last 50 activities
    if len(global_state.sallieverse_state.activities_log) > 50:
        global_state.sallieverse_state.activities_log = global_state.sallieverse_state.activities_log[-50:]
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.ROOM_CHANGE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"room": global_state.sallieverse_state.current_room},
            timestamp=datetime.now(timezone.utc),
            event_id=f"sallieverse_{request.action}_{datetime.now().timestamp()}"
        ))
    
    return global_state.sallieverse_state

@app.post("/duality/switch-mode", response_model=DualityResponse)
@limiter.limit("10/minute")
async def switch_duality_mode(request: DualityRequest):
    """Switch duality mode"""
    global_state.duality_state.active_mode = request.target_mode
    global_state.duality_state.transition_progress = 0.0
    
    # Add to history
    history_entry = {
        "mode": request.target_mode,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration": 0,
        "effectiveness": 0.0
    }
    global_state.duality_state.mode_history.append(history_entry)
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.MODE_SWITCH,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"mode": request.target_mode},
            timestamp=datetime.now(timezone.utc),
            event_id=f"duality_switch_{request.target_mode}_{datetime.now().timestamp()}"
        ))
    
    return global_state.duality_state

@app.get("/lifeos/state", response_model=LifeOSResponse)
@limiter.limit("50/minute")
async def get_lifeos_state():
    """Get LifeOS state"""
    return global_state.lifeos_state

@app.post("/lifeos/sync", response_model=LifeOSResponse)
@limiter.limit("5/minute")
async def sync_lifeos():
    """Synchronize LifeOS data"""
    global_state.lifeos_state.last_sync = datetime.now(timezone.utc)
    global_state.lifeos_state.sync_progress = 100.0
    
    # Broadcast to connected clients
    if config.SYNC_ENABLED:
        await sync_manager.broadcast_event(SyncEvent(
            event_type=SyncEventType.STATE_UPDATE,
            platform=PlatformType.SERVER,
            user_id="broadcast",
            data={"lifeos": global_state.lifeos_state.__dict__},
            timestamp=datetime.now(timezone.utc),
            event_id=f"lifeos_sync_{datetime.now().timestamp()}"
        ))
    
    return global_state.lifeos_state

# Sync endpoints
app.include_router(sync_router)

# WebSocket endpoint
@app.websocket("/sync/ws/{platform}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, platform: str, user_id: str):
    """Handle WebSocket connections for real-time sync"""
    await websocket.accept()
    
    try:
        platform_type = PlatformType(platform.lower())
        client_id = await sync_manager.register_client(websocket, platform_type, user_id)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Receive message from client
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Handle different message types
                if data.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif data.get("type") == "sync_request":
                    # Send current state
                    await sync_manager.send_state_update(client_id, "request")
                else:
                    # Handle sync event
                    await sync_manager.handle_client_message(client_id, data)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {e}")
                break
                
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        await sync_manager.unregister_client(client_id)

# Background tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sallie Server Enterprise Edition...")
    logger.info(f"Sync enabled: {config.SYNC_ENABLED}")
    
    # Start background sync tasks
    if config.SYNC_ENABLED:
        asyncio.create_task(sync_maintenance_task())
        logger.info("Background sync tasks started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Sallie Server Enterprise Edition...")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware)

# Exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"error": "Rate limit exceeded"},
    )

# Main execution
if __name__ == "__main__":
    uvicorn.run(
        "sallie_server_with_sync:app",
        host=config.HOST,
        port=config.PORT,
        log_level=config.LOG_LEVEL,
        reload=config.DEBUG
    )