"""
Shared configuration for Sallie Backend Services
Centralizes all environment variables and settings
"""

import os
from pathlib import Path
from typing import Optional
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Service Configuration
    SERVICE_NAME: str = Field(default="sallie-service", env="SERVICE_NAME")
    SERVICE_VERSION: str = Field(default="5.4.2", env="SERVICE_VERSION")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8742, env="PORT")
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./sallie.db",
        env="DATABASE_URL"
    )
    
    # Redis Configuration (for caching and sessions)
    REDIS_URL: str = Field(
        default="redis://localhost:6379",
        env="REDIS_URL"
    )
    
    # Qdrant Configuration (Vector Memory)
    QDRANT_URL: str = Field(
        default="http://localhost:6333",
        env="QDRANT_URL"
    )
    QDRANT_COLLECTION: str = Field(
        default="sallie_memory",
        env="QDRANT_COLLECTION"
    )
    
    # JWT Configuration
    JWT_SECRET_KEY: str = Field(
        default="your-super-secret-jwt-key-change-in-production",
        env="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRE_MINUTES: int = Field(default=60 * 24 * 7, env="JWT_EXPIRE_MINUTES")  # 7 days
    
    # CORS Configuration
    CORS_ORIGINS: list = Field(
        default=["http://localhost:3000", "http://192.168.1.47:3000"],
        env="CORS_ORIGINS"
    )
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # File Storage Configuration
    WORKING_DIR: Path = Field(
        default=Path("./working"),
        env="WORKING_DIR"
    )
    HERITAGE_DIR: Path = Field(
        default=Path("./heritage"),
        env="HERITAGE_DIR"
    )
    DRAFTS_DIR: Path = Field(
        default=Path("./drafts"),
        env="DRAFTS_DIR"
    )
    
    # Limbic Engine Configuration
    LIMBIC_DECAY_RATE: float = Field(default=0.1, env="LIMBIC_DECAY_RATE")
    LIMBIC_UPDATE_INTERVAL: int = Field(default=60, env="LIMBIC_UPDATE_INTERVAL")  # seconds
    
    # Trust System Configuration
    DEFAULT_TRUST_TIER: int = Field(default=0, env="DEFAULT_TRUST_TIER")
    TRUST_DECAY_RATE: float = Field(default=0.01, env="TRUST_DECAY_RATE")
    
    # Sensor Array Configuration
    SENSOR_ENABLED: bool = Field(default=True, env="SENSOR_ENABLED")
    SENSOR_REFRACTORY_HOURS: int = Field(default=24, env="SENSOR_REFRACTORY_HOURS")
    
    # Communication Configuration
    WEBSOCKET_HEARTBEAT_INTERVAL: int = Field(default=30, env="WEBSOCKET_HEARTBEAT_INTERVAL")
    MAX_CONNECTIONS: int = Field(default=100, env="MAX_CONNECTIONS")
    
    # Rate Limiting Configuration
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Service URLs (derived from base configuration)
def get_service_url(service_name: str, port: Optional[int] = None) -> str:
    """Get the URL for a specific service"""
    base_port = port or settings.PORT
    return f"http://{settings.HOST}:{base_port}"

# Database URLs for different services
def get_database_url(service_name: str) -> str:
    """Get database URL for a specific service"""
    if settings.DATABASE_URL.startswith("sqlite"):
        return f"sqlite:///./{service_name}.db"
    return settings.DATABASE_URL

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": settings.LOG_FORMAT,
        },
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "formatter": "detailed",
            "class": "logging.FileHandler",
            "filename": f"{settings.SERVICE_NAME}.log",
            "mode": "a",
        },
    },
    "loggers": {
        "": {
            "level": settings.LOG_LEVEL,
            "handlers": ["default", "file"],
        },
    },
}

# Trust Tier definitions
TRUST_TIER_THRESHOLDS = {
    0: (0.0, 0.6),    # Stranger
    1: (0.6, 0.8),    # Associate
    2: (0.8, 0.9),    # Partner
    3: (0.9, 1.0),    # Surrogate
}

# Posture modes
POSTURE_MODES = {
    "companion": {
        "description": "attuned, grounding, warm. Used for high-stress / low-energy moments.",
        "tone": "warm",
        "response_style": "supportive",
    },
    "co_pilot": {
        "description": "coworker execution. Plans, checklists, 'done.' Used for work/focus.",
        "tone": "professional",
        "response_style": "decisive",
    },
    "peer": {
        "description": "real talk, humor, boundary realism. Used for exploration/connection.",
        "tone": "casual",
        "response_style": "collaborative",
    },
    "expert": {
        "description": "dense technical analysis, assumptions, options. Used for problem-solving.",
        "tone": "analytical",
        "response_style": "detailed",
    },
}

# Limbic state ranges
LIMBIC_RANGES = {
    "trust": (0.0, 1.0),
    "warmth": (0.0, 1.0),
    "arousal": (0.0, 1.0),
    "valence": (0.0, 1.0),
}
