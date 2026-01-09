"""
Enhanced Backend API Routes
Complete API endpoints for all frontend features
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import asyncio
from datetime import datetime, timedelta
import uuid

# Import shared modules
from backend.shared.enhanced_backend_security import backend_security
from backend.shared.enhanced_backend_performance import monitor_performance, cache_result
from backend.shared.models import APIResponse, ErrorResponse

# Create router
router = APIRouter(prefix="/api", tags=["api"])

# Pydantic models for API requests/responses
class FeatureRequest(BaseModel):
    id: str
    enabled: bool

class ProfileUpdateRequest(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications: Optional[bool] = None
    privacy: Optional[Dict[str, Any]] = None

class UserStats(BaseModel):
    totalInteractions: int
    sessionDuration: int
    featuresUsed: List[str]
    lastActive: str

class Feature(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    category: str
    enabled: bool
    interactive: bool
    route: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    displayName: str
    avatar: str
    bio: str
    preferences: Dict[str, Any]
    stats: Dict[str, Any]

# Mock data (in production, this would come from database)
DEFAULT_FEATURES = [
    Feature(
        id="convergence",
        name="Convergence",
        description="14-question onboarding and identity configuration",
        icon="🎯",
        category="onboarding",
        enabled=True,
        interactive=True,
        route="/convergence"
    ),
    Feature(
        id="avatar",
        name="Avatar Workshop",
        description="Create and customize your digital avatar",
        icon="🎨",
        category="personalization",
        enabled=True,
        interactive=True,
        route="/avatar"
    ),
    Feature(
        id="thoughts",
        name="Thought Journal",
        description="Record and organize your thoughts",
        icon="💭",
        category="productivity",
        enabled=True,
        interactive=True,
        route="/thoughts"
    ),
    Feature(
        id="projects",
        name="Project Manager",
        description="Manage and track your projects",
        icon="📁",
        category="productivity",
        enabled=True,
        interactive=True,
        route="/projects"
    ),
    Feature(
        id="genesis",
        name="Genesis Flow",
        description="Creative ideation and brainstorming",
        icon="🌟",
        category="creativity",
        enabled=True,
        interactive=True,
        route="/genesis"
    ),
    Feature(
        id="heritage",
        name="Heritage",
        description="View your digital heritage and memories",
        icon="📚",
        category="personalization",
        enabled=True,
        interactive=True,
        route="/heritage"
    ),
    Feature(
        id="hypotheses",
        name="Hypotheses",
        description="Test and validate your ideas",
        icon="🔬",
        category="creativity",
        enabled=True,
        interactive=True,
        route="/hypotheses"
    ),
    Feature(
        id="settings",
        name="Settings",
        description="Configure your preferences and API keys",
        icon="⚙️",
        category="system",
        enabled=True,
        interactive=True,
        route="/settings"
    ),
    Feature(
        id="voice",
        name="Voice Interface",
        description="Voice-powered interaction",
        icon="🎤",
        category="interface",
        enabled=True,
        interactive=True
    ),
    Feature(
        id="sync",
        name="Cloud Sync",
        description="Synchronize data across devices",
        icon="☁️",
        category="system",
        enabled=True,
        interactive=True
    ),
    Feature(
        id="notifications",
        name="Notifications",
        description="System notifications and alerts",
        icon="🔔",
        category="system",
        enabled=True,
        interactive=True
    ),
    Feature(
        id="themes",
        name="Themes",
        description="Customize appearance and themes",
        icon="🎨",
        category="personalization",
        enabled=True,
        interactive=True
    ),
    Feature(
        id="analytics",
        name="Analytics",
        description="View usage patterns and insights",
        icon="📊",
        category="system",
        enabled=True,
        interactive=True,
        route="/analytics"
    ),
    Feature(
        id="help",
        name="Help & Support",
        description="Get help and documentation",
        icon="❓",
        category="support",
        enabled=True,
        interactive=True
    )
]

DEFAULT_USER_PROFILE = UserProfile(
    id="user-123",
    username="sallie_user",
    email="user@sallie.studio",
    displayName="Sallie User",
    avatar="/default-avatar.png",
    bio="Digital creator and Sallie Studio user",
    preferences={
        "theme": "dark",
        "language": "en",
        "notifications": True,
        "privacy": {
            "showOnlineStatus": True,
            "showActivity": True,
            "allowDataCollection": False
        }
    },
    stats={
        "joinDate": "2024-01-01T00:00:00Z",
        "totalInteractions": 1250,
        "featuresUsed": 8,
        "sessionCount": 45
    }
)

# In-memory storage (in production, use database)
user_profiles = {}
feature_states = {}
user_stats = {}

@router.get("/features")
@monitor_performance
@cache_result(ttl=300)  # Cache for 5 minutes
async def get_features():
    """Get all available features"""
    return APIResponse(
        success=True,
        data={
            "features": DEFAULT_FEATURES
        }
    )

@router.post("/features/{feature_id}/toggle")
async def toggle_feature(feature_id: str, request: FeatureRequest):
    """Toggle a feature on/off"""
    # Update feature state
    for feature in DEFAULT_FEATURES:
        if feature.id == feature_id:
            feature.enabled = request.enabled
            break
    
    return APIResponse(
        success=True,
        data={
            "featureId": feature_id,
            "enabled": request.enabled
        }
    )

@router.get("/user/profile")
@monitor_performance
@cache_result(ttl=600)  # Cache for 10 minutes
async def get_user_profile():
    """Get current user profile"""
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in user_profiles:
        user_profiles[user_id] = DEFAULT_USER_PROFILE
    
    return APIResponse(
        success=True,
        data=user_profiles[user_id]
    )

@router.put("/user/profile")
async def update_user_profile(request: ProfileUpdateRequest):
    """Update user profile"""
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = user_profiles[user_id]
    
    # Update fields
    if request.displayName is not None:
        profile.displayName = request.displayName
    if request.bio is not None:
        profile.bio = request.bio
    if request.theme is not None:
        profile.preferences["theme"] = request.theme
    if request.language is not None:
        profile.preferences["language"] = request.language
    if request.notifications is not None:
        profile.preferences["notifications"] = request.notifications
    if request.privacy is not None:
        profile.preferences["privacy"].update(request.privacy)
    
    return APIResponse(
        success=True,
        data=profile
    )

@router.post("/user/avatar")
async def update_avatar(request: Request):
    """Update user avatar"""
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle file upload
    if "avatar" not in request.files:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file = request.files["avatar"]
    
    # Save file (in production, use proper file storage)
    file_location = f"/avatars/{user_id}_{file.filename}"
    
    # Update profile
    user_profiles[user_id].avatar = file_location
    
    return APIResponse(
        success=True,
        data={
            "avatar": file_location
        }
    )

@router.get("/user/stats")
@monitor_performance
async def get_user_stats():
    """Get user statistics"""
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in user_stats:
        # Calculate initial stats
        profile = user_profiles.get(user_id, DEFAULT_USER_PROFILE)
        stats = UserStats(
            totalInteractions=profile.stats["totalInteractions"],
            sessionDuration=3600,  # 1 hour
            featuresUsed=list(profile.stats["featuresUsed"]),
            lastActive=datetime.utcnow().isoformat()
        )
        user_stats[user_id] = stats
    else:
        stats = user_stats[user_id]
    
    return APIResponse(
        success=True,
        data=stats
    )

@router.post("/analytics/feature-used")
async def track_feature_usage(request: Dict[str, Any]):
    """Track feature usage for analytics"""
    user_id = "user-123"  # In production, get from auth token
    feature_id = request.get("featureId")
    
    if not feature_id:
        raise HTTPException(status_code=400, detail="Feature ID required")
    
    # Update user stats
    if user_id not in user_stats:
        user_stats[user_id] = UserStats(
            totalInteractions=0,
            sessionDuration=0,
            featuresUsed=[],
            lastActive=datetime.utcnow().isoformat()
        )
    
    stats = user_stats[user_id]
    stats.totalInteractions += 1
    
    if feature_id not in stats.featuresUsed:
        stats.featuresUsed.append(feature_id)
    
    stats.lastActive = datetime.utcnow().isoformat()
    
    return APIResponse(
        success=True,
        data={"message": "Usage tracked"}
    )

@router.get("/user/export")
async def export_user_data():
    """Export all user data"""
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = user_profiles[user_id]
    stats = user_stats.get(user_id)
    
    export_data = {
        "profile": profile.dict(),
        "stats": stats.dict() if stats else None,
        "features": [
            {"id": f.id, "enabled": f.enabled} for f in DEFAULT_FEATURES
        ],
        "exportDate": datetime.utcnow().isoformat()
    }
    
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=sallie_user_data_{datetime.utcnow().date().isoformat()}.json"
        }
    )

@router.delete("/user/delete")
async def delete_user_account():
    """Delete user account"""
    user_id = "user-123"  # In production, get from auth token
    
    # Clean up user data
    if user_id in user_profiles:
        del user_profiles[user_id]
    if user_id in user_stats:
        del user_stats[user_id]
    
    return APIResponse(
        success=True,
        data={"message": "Account deleted"}
    )

@router.post("/voice/toggle")
async def toggle_voice_interface():
    """Toggle voice interface"""
    # In production, implement actual voice interface toggle
    return APIResponse(
        success=True,
        data={"enabled": True}
    )

@router.post("/sync/toggle")
async def toggle_cloud_sync():
    """Toggle cloud sync"""
    # In production, implement actual cloud sync toggle
    return APIResponse(
        success=True,
        data={"enabled": True}
    )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return APIResponse(
        success=True,
        data={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "5.4.2",
            "features_count": len(DEFAULT_FEATURES)
        }
    )
