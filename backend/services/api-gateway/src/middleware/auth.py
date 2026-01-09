"""
Authentication middleware for API Gateway
"""

import jwt
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import settings
from shared.models import UserResponse, TrustTier

# JWT security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Get current user from JWT token"""
    try:
        # Decode JWT token
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Check expiration
        exp = payload.get('exp')
        if exp and datetime.fromtimestamp(exp, timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Token expired")
        
        # Extract user info
        user_id = payload.get('sub')
        email = payload.get('email')
        name = payload.get('name')
        trust_tier = payload.get('trust_tier', 'stranger')
        
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return UserResponse(
            id=user_id,
            email=email,
            name=name,
            trust_tier=TrustTier(trust_tier)
        )
        
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

async def get_optional_user(request: Request) -> Optional[UserResponse]:
    """Get optional user from request (doesn't raise exception)"""
    try:
        authorization = request.headers.get('authorization')
        if not authorization:
            return None
        
        # Create credentials object
        if authorization.startswith('Bearer '):
            token = authorization[7:]
            credentials = HTTPAuthorizationCredentials(scheme='Bearer', credentials=token)
            return await get_current_user(credentials)
        
        return None
        
    except Exception:
        return None

async def auth_middleware(request: Request, call_next):
    """Authentication middleware"""
    # Skip auth for certain paths
    skip_paths = [
        "/",
        "/health",
        "/metrics",
        "/docs",
        "/redoc",
        "/api/auth/login",
        "/api/auth/register",
        "/api/services"
    ]
    
    if request.url.path in skip_paths:
        return await call_next(request)
    
    # Add user to request state
    user = await get_optional_user(request)
    request.state.user = user
    
    # Check if authentication is required for this path
    if requires_auth(request.url.path) and not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return await call_next(request)

def requires_auth(path: str) -> bool:
    """Check if a path requires authentication"""
    # Public paths
    public_paths = [
        "/api/auth/",
        "/health",
        "/metrics",
        "/docs",
        "/redoc",
        "/api/services"
    ]
    
    for public_path in public_paths:
        if path.startswith(public_path):
            return False
    
    return True

def check_trust_tier(user: UserResponse, required_tier: TrustTier) -> bool:
    """Check if user has required trust tier"""
    tier_hierarchy = {
        TrustTier.STRANGER: 0,
        TrustTier.ASSOCIATE: 1,
        TrustTier.PARTNER: 2,
        TrustTier.SURROGATE: 3
    }
    
    user_level = tier_hierarchy.get(user.trust_tier, 0)
    required_level = tier_hierarchy.get(required_tier, 0)
    
    return user_level >= required_level

def require_trust_tier(required_tier: TrustTier):
    """Decorator to require specific trust tier"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get user from kwargs or request state
            user = None
            for arg in args:
                if isinstance(arg, UserResponse):
                    user = arg
                    break
            
            if not user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not check_trust_tier(user, required_tier):
                raise HTTPException(
                    status_code=403,
                    detail=f"Requires {required_tier.value} trust tier or higher"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Rate limiting by trust tier
def get_rate_limit_for_tier(trust_tier: TrustTier) -> tuple:
    """Get rate limit (requests, window_seconds) for trust tier"""
    limits = {
        TrustTier.STRANGER: (10, 60),      # 10 requests per minute
        TrustTier.ASSOCIATE: (50, 60),    # 50 requests per minute
        TrustTier.PARTNER: (200, 60),     # 200 requests per minute
        TrustTier.SURROGATE: (1000, 60),  # 1000 requests per minute
    }
    
    return limits.get(trust_tier, (10, 60))
