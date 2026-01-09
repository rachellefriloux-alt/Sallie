"""
Shared database utilities and models
"""

import asyncio
import logging
from typing import AsyncGenerator, Optional
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import redis.asyncio as redis
from .config import settings, get_database_url

logger = logging.getLogger(__name__)

# SQLAlchemy Base class
Base = declarative_base()

# Database engines
engine = None
async_engine = None
SessionLocal = None
AsyncSessionLocal = None

# Redis connection
redis_client: Optional[redis.Redis] = None

async def init_database():
    """Initialize database connections"""
    global engine, async_engine, SessionLocal, AsyncSessionLocal, redis_client
    
    try:
        # Sync engine for migrations/admin
        engine = create_engine(
            get_database_url("main"),
            poolclass=StaticPool if "sqlite" in get_database_url("main") else None,
            connect_args={"check_same_thread": False} if "sqlite" in get_database_url("main") else {},
            echo=settings.DEBUG
        )
        
        # Async engine for application use
        db_url = get_database_url("main")
        if "sqlite" in db_url:
            async_db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")
        else:
            async_db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
        
        async_engine = create_async_engine(
            async_db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True
        )
        
        # Session makers
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine
        )
        
        AsyncSessionLocal = async_sessionmaker(
            async_engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        
        # Redis connection
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        
        # Test Redis connection
        await redis_client.ping()
        logger.info("Redis connection established")
        
        # Create tables
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def close_database():
    """Close database connections"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")
    
    if async_engine:
        await async_engine.dispose()
        logger.info("Database connections closed")

def get_db() -> Generator[Session, None, None]:
    """Get synchronous database session"""
    if SessionLocal is None:
        raise RuntimeError("Database not initialized")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Get asynchronous database session"""
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_redis() -> redis.Redis:
    """Get Redis client"""
    if redis_client is None:
        raise RuntimeError("Redis not initialized")
    return redis_client

# Database models
class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    limbic_states = relationship("LimbicState", back_populates="user")
    trust_records = relationship("TrustRecord", back_populates="user")

class LimbicState(Base):
    """Limbic engine state for user"""
    __tablename__ = "limbic_states"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Core limbic variables
    trust = Column(Float, default=0.5)
    warmth = Column(Float, default=0.5)
    arousal = Column(Float, default=0.5)
    valence = Column(Float, default=0.5)
    posture = Column(String, default="companion")
    
    # Relationships
    user = relationship("User", back_populates="limbic_states")

class TrustRecord(Base):
    """Trust tier and permission records"""
    __tablename__ = "trust_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Trust metrics
    trust_score = Column(Float, default=0.0)
    trust_tier = Column(Integer, default=0)
    action_type = Column(String, nullable=False)
    outcome = Column(String, nullable=False)  # success, failure, penalty
    reason = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="trust_records")

class MemoryEntry(Base):
    """Working memory entries"""
    __tablename__ = "memory_entries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Memory content
    content = Column(Text, nullable=False)
    memory_type = Column(String, nullable=False)  # working, heritage, draft
    tags = Column(JSON)
    metadata = Column(JSON)
    is_archived = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=True)

class AgencyLog(Base):
    """Agency action logs for audit trail"""
    __tablename__ = "agency_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Action details
    action_type = Column(String, nullable=False)
    tool_name = Column(String, nullable=False)
    parameters = Column(JSON)
    outcome = Column(String, nullable=False)
    rollback_available = Column(Boolean, default=False)
    rollback_hash = Column(String, nullable=True)
    creator_approval = Column(Boolean, default=False)

# Database utility functions
async def create_user(db: AsyncSession, email: str, password_hash: str, name: str) -> User:
    """Create a new user"""
    user = User(
        email=email,
        password_hash=password_hash,
        name=name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def update_limbic_state(db: AsyncSession, user_id: str, **kwargs) -> LimbicState:
    """Update or create limbic state for user"""
    # Get latest state
    result = await db.execute(
        select(LimbicState)
        .where(LimbicState.user_id == user_id)
        .order_by(LimbicState.timestamp.desc())
    )
    state = result.scalar_one_or_none()
    
    if state:
        # Update existing
        for key, value in kwargs.items():
            if hasattr(state, key):
                setattr(state, key, value)
        state.timestamp = datetime.utcnow()
    else:
        # Create new
        state = LimbicState(user_id=user_id, **kwargs)
        db.add(state)
    
    await db.commit()
    await db.refresh(state)
    return state

async def get_trust_tier(db: AsyncSession, user_id: str) -> int:
    """Get current trust tier for user"""
    result = await db.execute(
        select(TrustRecord.trust_tier)
        .where(TrustRecord.user_id == user_id)
        .order_by(TrustRecord.timestamp.desc())
    )
    tier = result.scalar_one_or_none()
    return tier if tier is not None else settings.DEFAULT_TRUST_TIER

async def log_agency_action(
    db: AsyncSession,
    user_id: str,
    action_type: str,
    tool_name: str,
    parameters: dict,
    outcome: str,
    rollback_available: bool = False,
    rollback_hash: Optional[str] = None
) -> AgencyLog:
    """Log an agency action for audit trail"""
    log = AgencyLog(
        user_id=user_id,
        action_type=action_type,
        tool_name=tool_name,
        parameters=parameters,
        outcome=outcome,
        rollback_available=rollback_available,
        rollback_hash=rollback_hash
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
