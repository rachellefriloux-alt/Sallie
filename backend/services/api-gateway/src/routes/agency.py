"""
Agency service routes for API Gateway
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import httpx

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import SERVICE_URLS
from shared.models import (
    AgencyAction, AgencyResponse, AgencyLog, PermissionCheck,
    PermissionResponse, APIResponse, UserResponse, ActionType
)
from middleware.auth import get_current_user, require_trust_tier, TrustTier

router = APIRouter()

@router.post("/check-permission", response_model=PermissionResponse)
async def check_permission(
    permission_check: PermissionCheck,
    current_user: UserResponse = Depends(get_current_user)
):
    """Check if user has permission for an action"""
    # Set user_id from authenticated user
    permission_check.user_id = current_user.id
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['agency']}/check-permission",
                json=permission_check.dict(),
                timeout=10.0
            )
            
            if response.status_code == 200:
                return PermissionResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Permission check failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.post("/execute", response_model=AgencyResponse)
@require_trust_tier(TrustTier.ASSOCIATE)
async def execute_action(
    action: AgencyAction,
    current_user: UserResponse = Depends(get_current_user)
):
    """Execute an agency action"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['agency']}/execute",
                json={**action.dict(), "user_id": current_user.id},
                timeout=30.0  # Longer timeout for action execution
            )
            
            if response.status_code == 200:
                return AgencyResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Action execution failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.post("/execute-dry-run", response_model=AgencyResponse)
async def execute_action_dry_run(
    action: AgencyAction,
    current_user: UserResponse = Depends(get_current_user)
):
    """Execute an agency action in dry-run mode"""
    action.dry_run = True
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['agency']}/execute",
                json={**action.dict(), "user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return AgencyResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Dry run failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.get("/trust-tier", response_model=APIResponse)
async def get_trust_tier(current_user: UserResponse = Depends(get_current_user)):
    """Get current trust tier for user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['agency']}/trust-tier/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get trust tier")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.get("/capabilities", response_model=APIResponse)
async def get_user_capabilities(current_user: UserResponse = Depends(get_current_user)):
    """Get user capabilities based on trust tier"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['agency']}/capabilities/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get capabilities")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.get("/logs", response_model=APIResponse)
async def get_agency_logs(
    limit: int = 50,
    action_type: Optional[ActionType] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get agency action logs for user"""
    params = {"limit": limit}
    if action_type:
        params["action_type"] = action_type.value
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['agency']}/logs/{current_user.id}",
                params=params,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get agency logs")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.post("/rollback", response_model=APIResponse)
@require_trust_tier(TrustTier.PARTNER)
async def rollback_action(
    rollback_hash: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Rollback a previous agency action"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['agency']}/rollback",
                json={
                    "user_id": current_user.id,
                    "rollback_hash": rollback_hash
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Rollback failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.get("/contracts", response_model=APIResponse)
async def get_capability_contracts(current_user: UserResponse = Depends(get_current_user)):
    """Get capability contracts for available tools"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['agency']}/contracts",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get contracts")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )

@router.post("/take-the-wheel", response_model=AgencyResponse)
@require_trust_tier(TrustTier.PARTNER)
async def take_the_wheel(
    task_description: str,
    auto_execute: bool = False,
    current_user: UserResponse = Depends(get_current_user)
):
    """Execute 'Take the Wheel' protocol for autonomous task execution"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['agency']}/take-the-wheel",
                json={
                    "user_id": current_user.id,
                    "task_description": task_description,
                    "auto_execute": auto_execute
                },
                timeout=60.0  # Longer timeout for complex tasks
            )
            
            if response.status_code == 200:
                return AgencyResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Take the Wheel failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Agency service unavailable: {str(e)}"
            )
