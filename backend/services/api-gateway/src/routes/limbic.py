"""
Limbic Engine routes for API Gateway
"""

from fastapi import APIRouter, Depends, HTTPException
import httpx

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import SERVICE_URLS
from shared.models import (
    LimbicState, LimbicUpdate, LimbicResponse, APIResponse,
    UserResponse
)
from middleware.auth import get_current_user, require_trust_tier, TrustTier

router = APIRouter()

@router.get("/state", response_model=LimbicResponse)
async def get_limbic_state(current_user: UserResponse = Depends(get_current_user)):
    """Get current limbic state for user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['limbic']}/state/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return LimbicResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get limbic state")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )

@router.post("/state", response_model=LimbicResponse)
async def update_limbic_state(
    update: LimbicUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update limbic state for user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['limbic']}/state/{current_user.id}",
                json=update.dict(),
                timeout=10.0
            )
            
            if response.status_code == 200:
                return LimbicResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to update limbic state")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )

@router.post("/calibrate", response_model=APIResponse)
async def calibrate_limbic_state(
    calibration_data: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """Calibrate limbic system based on user feedback"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['limbic']}/calibrate/{current_user.id}",
                json=calibration_data,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Calibration failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )

@router.get("/history", response_model=APIResponse)
async def get_limbic_history(
    limit: int = 100,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get limbic state history for user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['limbic']}/history/{current_user.id}",
                params={"limit": limit},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get limbic history")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )

@router.get("/postures", response_model=APIResponse)
async def get_available_postures(current_user: UserResponse = Depends(get_current_user)):
    """Get available posture modes"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['limbic']}/postures",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get postures")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )

@router.post("/reset", response_model=APIResponse)
@require_trust_tier(TrustTier.PARTNER)
async def reset_limbic_state(current_user: UserResponse = Depends(get_current_user)):
    """Reset limbic state to defaults (requires Partner tier or higher)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['limbic']}/reset/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to reset limbic state")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Limbic service unavailable: {str(e)}"
            )
