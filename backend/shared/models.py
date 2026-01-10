"""
Shared data models and schemas
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, validator
from uuid import UUID, uuid4

# Base models
class BaseSchema(BaseModel):
    """Base schema with common fields"""
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()))
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class TimestampedSchema(BaseSchema):
    """Schema with timestamp fields"""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enums
class TrustTier(str, Enum):
    """Trust tier levels"""
    STRANGER = "stranger"
    ASSOCIATE = "associate"
    PARTNER = "partner"
    SURROGATE = "surrogate"

class PostureMode(str, Enum):
    """Posture modes for interaction"""
    COMPANION = "companion"
    CO_PILOT = "co_pilot"
    PEER = "peer"
    EXPERT = "expert"

class MemoryType(str, Enum):
    """Types of memory storage"""
    WORKING = "working"
    HERITAGE = "heritage"
    DRAFT = "draft"
    ARCHIVE = "archive"

class ActionType(str, Enum):
    """Types of agency actions"""
    FILE_READ = "file_read"
    FILE_WRITE = "file_write"
    FILE_DELETE = "file_delete"
    CODE_EXECUTE = "code_execute"
    MESSAGE_SEND = "message_send"
    SYSTEM_COMMAND = "system_command"

class CommunicationType(str, Enum):
    """Communication modalities"""
    TEXT = "text"
    VOICE = "voice"
    FILE = "file"
    WEBSOCKET = "websocket"

# User models
class UserCreate(BaseModel):
    """Schema for user creation"""
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1, max_length=100)

class UserLogin(BaseModel):
    """Schema for user login"""
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    password: str = Field(...)

class UserResponse(BaseSchema):
    """Schema for user response"""
    email: str
    name: str
    is_active: bool = True
    trust_tier: TrustTier = TrustTier.STRANGER
    
    class Config:
        from_attributes = True

class UserToken(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

# Limbic Engine models
class LimbicState(BaseSchema):
    """Limbic engine state"""
    user_id: str
    trust: float = Field(0.0, ge=0.0, le=1.0)
    warmth: float = Field(0.0, ge=0.0, le=1.0)
    arousal: float = Field(0.0, ge=0.0, le=1.0)
    valence: float = Field(0.0, ge=0.0, le=1.0)
    posture: PostureMode = PostureMode.COMPANION
    
    @validator('trust')
    def validate_trust(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Trust must be between 0.0 and 1.0')
        return v
    
    @validator('warmth')
    def validate_warmth(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Warmth must be between 0.0 and 1.0')
        return v
    
    @validator('arousal')
    def validate_arousal(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Arousal must be between 0.0 and 1.0')
        return v
    
    @validator('valence')
    def validate_valence(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Valence must be between 0.0 and 1.0')
        return v

class LimbicUpdate(BaseModel):
    """Schema for limbic state updates"""
    trust: Optional[float] = Field(None, ge=0.0, le=1.0)
    warmth: Optional[float] = Field(None, ge=0.0, le=1.0)
    arousal: Optional[float] = Field(None, ge=0.0, le=1.0)
    valence: Optional[float] = Field(None, ge=0.0, le=1.0)
    posture: Optional[PostureMode] = None

class LimbicResponse(TimestampedSchema):
    """Schema for limbic state response"""
    user_id: str
    state: LimbicState
    trust_tier: TrustTier
    capabilities: List[str]

# Trust System models
class TrustRecord(BaseSchema):
    """Trust system record"""
    user_id: str
    action_type: ActionType
    outcome: str  # success, failure, penalty
    trust_score: float = Field(0.0, ge=0.0, le=1.0)
    trust_tier: TrustTier = TrustTier.STRANGER
    reason: Optional[str] = None

class TrustUpdate(BaseModel):
    """Schema for trust updates"""
    action_type: ActionType
    outcome: str
    reason: Optional[str] = None

class PermissionCheck(BaseModel):
    """Schema for permission checks"""
    user_id: str
    action_type: ActionType
    tool_name: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class PermissionResponse(BaseModel):
    """Schema for permission response"""
    allowed: bool
    trust_tier: TrustTier
    reason: str
    requires_approval: bool = False

# Memory models
class MemoryEntry(BaseSchema):
    """Memory entry schema"""
    user_id: str
    content: str
    memory_type: MemoryType
    tags: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}
    is_archived: bool = False
    expires_at: Optional[datetime] = None

class MemorySearch(BaseModel):
    """Schema for memory search"""
    query: str
    memory_type: Optional[MemoryType] = None
    tags: Optional[List[str]] = None
    limit: int = Field(10, ge=1, le=100)
    similarity_threshold: float = Field(0.7, ge=0.0, le=1.0)

class MemoryResponse(BaseSchema):
    """Schema for memory response"""
    entries: List[MemoryEntry]
    total: int
    query_time_ms: float

# Communication models
class MessageBase(BaseModel):
    """Base message schema"""
    content: str
    message_type: CommunicationType = CommunicationType.TEXT
    metadata: Optional[Dict[str, Any]] = {}

class MessageCreate(MessageBase):
    """Schema for message creation"""
    user_id: str
    limbic_state: Optional[LimbicState] = None

class MessageResponse(MessageBase, TimestampedSchema):
    """Schema for message response"""
    id: str
    user_id: str
    response_content: Optional[str] = None
    processing_time_ms: Optional[float] = None

class WebSocketMessage(BaseModel):
    """WebSocket message schema"""
    type: str
    id: str = Field(default_factory=lambda: str(uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    content: str
    metadata: Optional[Dict[str, Any]] = {}

# Agency models
class AgencyAction(BaseModel):
    """Schema for agency actions"""
    action_type: ActionType
    tool_name: str
    parameters: Dict[str, Any]
    dry_run: bool = False
    requires_approval: bool = False

class AgencyResponse(BaseModel):
    """Schema for agency response"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    rollback_available: bool = False
    rollback_hash: Optional[str] = None

class AgencyLog(BaseSchema):
    """Schema for agency logging"""
    user_id: str
    action_type: ActionType
    tool_name: str
    parameters: Dict[str, Any]
    outcome: str
    rollback_available: bool = False
    rollback_hash: Optional[str] = None
    creator_approval: bool = False

# Sensor Array models
class SensorEvent(BaseModel):
    """Schema for sensor events"""
    event_type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    confidence: float = Field(1.0, ge=0.0, le=1.0)

class SensorConfig(BaseModel):
    """Schema for sensor configuration"""
    enabled: bool = True
    refractory_hours: int = Field(24, ge=1, le=168)
    thresholds: Dict[str, float] = {}

class SensorResponse(BaseModel):
    """Schema for sensor response"""
    events: List[SensorEvent]
    insights: List[str]
    recommendations: List[str]

# API Response models
class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class PaginatedResponse(BaseModel):
    """Paginated response schema"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

# Health check models
class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    services: Dict[str, str]
    uptime_seconds: float

# Error models
class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValidationError(BaseModel):
    """Validation error details"""
    field: str
    message: str
    value: Any
