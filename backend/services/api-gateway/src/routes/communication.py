"""
Communication service routes for API Gateway
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
import httpx
import json
from typing import Optional, List

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import SERVICE_URLS
from shared.models import (
    MessageCreate, MessageResponse, WebSocketMessage,
    APIResponse, UserResponse, CommunicationType
)
from middleware.auth import get_current_user, get_optional_user

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@router.post("/message", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Send a message and get response"""
    # Set user_id from authenticated user
    message.user_id = current_user.id
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['communication']}/message",
                json=message.dict(),
                timeout=30.0  # Longer timeout for AI response
            )
            
            if response.status_code == 200:
                return MessageResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Message processing failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.get("/messages", response_model=APIResponse)
async def get_message_history(
    limit: int = 50,
    before: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get message history for user"""
    params = {"limit": limit}
    if before:
        params["before"] = before
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['communication']}/messages/{current_user.id}",
                params=params,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get message history")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message = WebSocketMessage(**message_data)
                
                # Forward to communication service
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{SERVICE_URLS['communication']}/websocket-message",
                        json={**message.dict(), "user_id": user_id},
                        timeout=10.0
                    )
                    
                    if response.status_code == 200:
                        # Send response back to client
                        await websocket.send_text(response.text)
                    else:
                        error_response = {
                            "type": "error",
                            "content": "Message processing failed",
                            "error": response.json().get("error", "Unknown error")
                        }
                        await websocket.send_text(json.dumps(error_response))
                        
            except json.JSONDecodeError:
                error_response = {
                    "type": "error",
                    "content": "Invalid JSON format"
                }
                await websocket.send_text(json.dumps(error_response))
            except Exception as e:
                error_response = {
                    "type": "error",
                    "content": f"Error processing message: {str(e)}"
                }
                await websocket.send_text(json.dumps(error_response))
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.post("/voice/transcribe", response_model=APIResponse)
async def transcribe_audio(
    current_user: UserResponse = Depends(get_current_user)
):
    """Transcribe audio input (placeholder for future voice integration)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['communication']}/voice/transcribe",
                json={"user_id": current_user.id},
                timeout=15.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Transcription failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.post("/voice/synthesize", response_model=APIResponse)
async def synthesize_speech(
    text: str,
    voice_type: str = "default",
    current_user: UserResponse = Depends(get_current_user)
):
    """Synthesize speech from text (placeholder for future voice integration)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['communication']}/voice/synthesize",
                json={
                    "user_id": current_user.id,
                    "text": text,
                    "voice_type": voice_type
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Speech synthesis failed")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.get("/status", response_model=APIResponse)
async def get_communication_status(current_user: UserResponse = Depends(get_current_user)):
    """Get communication service status"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{SERVICE_URLS['communication']}/status/{current_user.id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to get status")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.post("/shoulder-tap", response_model=APIResponse)
async def send_shoulder_tap(
    message: str,
    priority: str = "normal",
    current_user: UserResponse = Depends(get_current_user)
):
    """Send a shoulder tap notification (proactive engagement)"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVICE_URLS['communication']}/shoulder-tap",
                json={
                    "user_id": current_user.id,
                    "message": message,
                    "priority": priority
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                return APIResponse(**response.json())
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json().get("error", "Failed to send shoulder tap")
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Communication service unavailable: {str(e)}"
            )

@router.get("/connections", response_model=APIResponse)
async def get_active_connections():
    """Get active WebSocket connections (admin endpoint)"""
    return APIResponse(
        success=True,
        data={
            "active_connections": len(manager.active_connections),
            "connected_users": list(manager.active_connections.keys())
        }
    )
