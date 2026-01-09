"""
Rate limiting middleware for API Gateway
"""

import time
import asyncio
from typing import Dict, Optional
from collections import defaultdict, deque
from fastapi import Request, HTTPException
import redis.asyncio as redis

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import settings
from shared.models import TrustTier

# In-memory rate limiter (fallback)
class MemoryRateLimiter:
    """In-memory rate limiter using sliding window"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
    
    async def is_allowed(
        self,
        key: str,
        limit: int,
        window: int,
        current_time: Optional[float] = None
    ) -> bool:
        """Check if request is allowed"""
        if current_time is None:
            current_time = time.time()
        
        async with self.locks[key]:
            request_times = self.requests[key]
            
            # Remove old requests outside window
            while request_times and request_times[0] <= current_time - window:
                request_times.popleft()
            
            # Check if under limit
            if len(request_times) < limit:
                request_times.append(current_time)
                return True
            
            return False

# Redis-based rate limiter
class RedisRateLimiter:
    """Redis-based rate limiter using sliding window"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def is_allowed(
        self,
        key: str,
        limit: int,
        window: int,
        current_time: Optional[float] = None
    ) -> bool:
        """Check if request is allowed using Redis sliding window"""
        if current_time is None:
            current_time = time.time()
        
        # Lua script for atomic sliding window
        lua_script = """
        local key = KEYS[1]
        local current_time = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        
        -- Remove old entries
        redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
        
        -- Count current requests
        local current_requests = redis.call('ZCARD', key)
        
        -- Check if under limit
        if current_requests < limit then
            redis.call('ZADD', key, current_time, current_time)
            redis.call('EXPIRE', key, window)
            return 1
        else
            return 0
        end
        """
        
        try:
            result = await self.redis.eval(
                lua_script,
                1,  # number of keys
                f"rate_limit:{key}",
                current_time,
                window,
                limit
            )
            
            return bool(result)
            
        except Exception as e:
            # Fallback to allowing request if Redis fails
            print(f"Rate limiter error: {e}")
            return True

# Global rate limiter instances
memory_limiter = MemoryRateLimiter()
redis_limiter: Optional[RedisRateLimiter] = None

async def init_rate_limiter():
    """Initialize rate limiter"""
    global redis_limiter
    
    try:
        # Try to connect to Redis
        redis_client = redis.from_url(settings.REDIS_URL)
        await redis_client.ping()
        redis_limiter = RedisRateLimiter(redis_client)
        print("Rate limiter initialized with Redis")
    except Exception as e:
        print(f"Redis not available, using memory rate limiter: {e}")
        redis_limiter = None

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    # Check for forwarded headers
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    return request.client.host if request.client else "unknown"

def get_rate_limit_key(request: Request) -> str:
    """Generate rate limit key"""
    # Use user ID if authenticated, otherwise IP
    user = getattr(request.state, 'user', None)
    
    if user:
        return f"user:{user.id}"
    else:
        ip = get_client_ip(request)
        return f"ip:{ip}"

def get_rate_limits(request: Request) -> tuple:
    """Get rate limits based on user trust tier"""
    user = getattr(request.state, 'user', None)
    
    if user:
        from middleware.auth import get_rate_limit_for_tier
        return get_rate_limit_for_tier(user.trust_tier)
    else:
        # Default limits for unauthenticated users
        return (10, 60)  # 10 requests per minute

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    # Skip rate limiting for certain paths
    skip_paths = [
        "/health",
        "/metrics",
        "/docs",
        "/redoc"
    ]
    
    if request.url.path in skip_paths:
        return await call_next(request)
    
    # Get rate limit parameters
    key = get_rate_limit_key(request)
    limit, window = get_rate_limits(request)
    
    # Check rate limit
    allowed = False
    
    if redis_limiter:
        allowed = await redis_limiter.is_allowed(key, limit, window)
    else:
        allowed = await memory_limiter.is_allowed(key, limit, window)
    
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: {limit} requests per {window} seconds"
        )
    
    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Window"] = str(window)
    
    return response
