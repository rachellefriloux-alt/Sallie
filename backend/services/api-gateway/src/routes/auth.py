"""
Authentication routes for API Gateway
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
import httpx

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import settings, SERVICE_URLS
from shared.models import (
    UserCreate, UserLogin, UserToken, UserResponse, APIResponse
)
from middleware.auth import get_current_user, get_optional_user

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=UserToken)
async def register(user_data: UserCreate):
    """Register a new user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['auth']}/register",
                json=user_data.dict(),
                timeout=10.0
            )
            
            if response.status_code == 201:
                return UserToken(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Registration failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Auth service unavailable: {str(e)}"
            )

@router.post("/login", response_model=UserToken)
async def login(user_data: UserLogin):
    """Authenticate user and return token"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['auth']}/login",
                json=user_data.dict(),
                timeout=10.0
            )
            
            if response.status_code == 200:
                return UserToken(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Login failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Auth service unavailable: {str(e)}"
            )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.post("/refresh", response_model=UserToken)
async def refresh_token(current_user: UserResponse = Depends(get_current_user)):
    """Refresh JWT token"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['auth']}/refresh",
                json={"user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return UserToken(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Token refresh failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Auth service unavailable: {str(e)}"
            )

@router.post("/logout", response_model=APIResponse)
async def logout(current_user: UserResponse = Depends(get_current_user)):
    """Logout user (invalidate token)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['auth']}/logout",
                json={"user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(success=True, data={"message": "Logged out successfully"})
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Logout failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Auth service unavailable: {str(e)}"
            )

@router.get("/verify", response_model=APIResponse)
async def verify_token(current_user: UserResponse = Depends(get_current_user)):
    """Verify token is valid"""
    return APIResponse(
        success=True,
        data={
            "valid": True,
            "user": current_user.dict()
        }
    )
