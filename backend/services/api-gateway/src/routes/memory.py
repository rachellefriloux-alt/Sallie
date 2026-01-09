"""
Memory service routes for API Gateway
"""

from fastapi import APIRouter, Depends, HTTPException, Query
import httpx
from typing import Optional, List

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import SERVICE_URLS
from shared.models import (
    MemoryEntry, MemorySearch, MemoryResponse, MemoryType,
    APIResponse, UserResponse
)
from middleware.auth import get_current_user, require_trust_tier, TrustTier

router = APIRouter()

@router.post("/store", response_model=APIResponse)
async def store_memory(
    memory: MemoryEntry,
    current_user: UserResponse = Depends(get_current_user)
):
    """Store a memory entry"""
    # Set user_id from authenticated user
    memory.user_id = current_user.id
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['memory']}/store",
                json=memory.dict(),
                timeout=10.0
            )
            
            if response.status_code == 201:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to store memory")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.get("/search", response_model=MemoryResponse)
async def search_memories(
    query: str,
    memory_type: Optional[MemoryType] = None,
    tags: Optional[List[str]] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    similarity_threshold: float = Query(0.7, ge=0.0, le=1.0),
    current_user: UserResponse = Depends(get_current_user)
):
    """Search memories"""
    search_params = {
        "query": query,
        "limit": limit,
        "similarity_threshold": similarity_threshold
    }
    
    if memory_type:
        search_params["memory_type"] = memory_type.value
    if tags:
        search_params["tags"] = tags
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['memory']}/search/{current_user.id}",
                params=search_params,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return MemoryResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Search failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.get("/recent", response_model=APIResponse)
async def get_recent_memories(
    memory_type: Optional[MemoryType] = None,
    limit: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get recent memories for user"""
    params = {"limit": limit}
    if memory_type:
        params["memory_type"] = memory_type.value
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['memory']}/recent/{current_user.id}",
                params=params,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get recent memories")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.get("/{memory_id}", response_model=APIResponse)
async def get_memory(
    memory_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific memory by ID"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['memory']}/{memory_id}",
                params={"user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Memory not found")
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get memory")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.put("/{memory_id}", response_model=APIResponse)
async def update_memory(
    memory_id: str,
    memory_update: dict,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a memory entry"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(
                f"{SERVICE_URLS['memory']}/{memory_id}",
                json={**memory_update, "user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Memory not found")
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to update memory")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.delete("/{memory_id}", response_model=APIResponse)
@require_trust_tier(TrustTier.ASSOCIATE)
async def delete_memory(
    memory_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a memory entry (requires Associate tier or higher)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{SERVICE_URLS['memory']}/{memory_id}",
                params={"user_id": current_user.id},
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="Memory not found")
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to delete memory")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.post("/archive", response_model=APIResponse)
async def archive_old_memories(
    days: int = Query(30, ge=1),
    current_user: UserResponse = Depends(get_current_user)
):
    """Archive memories older than specified days"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['memory']}/archive/{current_user.id}",
                params={"days": days},
                timeout=30.0  # Longer timeout for bulk operation
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Archive operation failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )

@router.get("/stats/summary", response_model=APIResponse)
async def get_memory_stats(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get memory statistics for user"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['memory']}/stats/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get memory stats")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Memory service unavailable: {str(e)}"
            )
