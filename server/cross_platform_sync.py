"""
Cross-Platform State Synchronization System
Handles real-time synchronization between web, desktop, and mobile applications
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from fastapi import WebSocket, WebSocketDisconnect
import websockets
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlatformType(Enum):
    WEB = "web"
    DESKTOP = "desktop"
    MOBILE = "mobile"

class SyncEventType(Enum):
    STATE_UPDATE = "state_update"
    AVATAR_CHANGE = "avatar_change"
    ROLE_SWITCH = "role_switch"
    MESSAGE_SENT = "message_sent"
    ROOM_CHANGE = "room_change"
    MODE_SWITCH = "mode_switch"
    LIMBIC_UPDATE = "limbic_update"
    COGNITIVE_UPDATE = "cognitive_update"

@dataclass
class SyncEvent:
    event_type: SyncEventType
    platform: PlatformType
    user_id: str
    data: Dict[str, Any]
    timestamp: datetime
    event_id: str

@dataclass
class ConnectedClient:
    websocket: WebSocket
    platform: PlatformType
    user_id: str
    client_id: str
    last_ping: datetime
    is_active: bool = True

@dataclass
class SyncState:
    limbic_variables: Dict[str, float]
    cognitive_state: Dict[str, Any]
    avatar_form: str
    active_role: str
    current_room: str
    active_mode: str
    messages: List[Dict[str, Any]]
    last_updated: datetime

class CrossPlatformSyncManager:
    def __init__(self):
        self.connected_clients: Dict[str, ConnectedClient] = {}
        self.user_states: Dict[str, SyncState] = {}
        self.event_history: List[SyncEvent] = []
        self.max_event_history = 1000
        
    async def register_client(self, websocket: WebSocket, platform: PlatformType, user_id: str) -> str:
        """Register a new client for synchronization"""
        client_id = f"{platform.value}_{user_id}_{datetime.now().timestamp()}"
        
        client = ConnectedClient(
            websocket=websocket,
            platform=platform,
            user_id=user_id,
            client_id=client_id,
            last_ping=datetime.now(timezone.utc)
        )
        
        self.connected_clients[client_id] = client
        
        # Initialize user state if not exists
        if user_id not in self.user_states:
            self.user_states[user_id] = SyncState(
                limbic_variables={},
                cognitive_state={},
                avatar_form="peacock",
                active_role="mom",
                current_room="sanctuary",
                active_mode="infj",
                messages=[],
                last_updated=datetime.now(timezone.utc)
            )
        
        logger.info(f"Client registered: {client_id} ({platform.value})")
        
        # Send current state to new client
        await self.send_state_update(client_id, "initial_sync")
        
        return client_id
    
    async def unregister_client(self, client_id: str):
        """Unregister a client"""
        if client_id in self.connected_clients:
            client = self.connected_clients[client_id]
            client.is_active = False
            del self.connected_clients[client_id]
            logger.info(f"Client unregistered: {client_id}")
    
    async def handle_client_message(self, client_id: str, message: Dict[str, Any]):
        """Handle incoming message from client"""
        try:
            event_type = SyncEventType(message.get("event_type"))
            user_id = self.connected_clients[client_id].user_id
            platform = self.connected_clients[client_id].platform
            
            # Create sync event
            event = SyncEvent(
                event_type=event_type,
                platform=platform,
                user_id=user_id,
                data=message.get("data", {}),
                timestamp=datetime.now(timezone.utc),
                event_id=f"{event_type.value}_{user_id}_{datetime.now().timestamp()}"
            )
            
            # Update user state
            await self.update_user_state(user_id, event)
            
            # Broadcast to other clients
            await self.broadcast_event(event, exclude_client=client_id)
            
            # Store in history
            self.event_history.append(event)
            if len(self.event_history) > self.max_event_history:
                self.event_history.pop(0)
                
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
    
    async def update_user_state(self, user_id: str, event: SyncEvent):
        """Update user state based on event"""
        if user_id not in self.user_states:
            return
        
        state = self.user_states[user_id]
        
        try:
            if event.event_type == SyncEventType.STATE_UPDATE:
                # General state update
                state.limbic_variables.update(event.data.get("limbic_variables", {}))
                state.cognitive_state.update(event.data.get("cognitive_state", {}))
                
            elif event.event_type == SyncEventType.AVATAR_CHANGE:
                state.avatar_form = event.data.get("form", "peacock")
                
            elif event.event_type == SyncEventType.ROLE_SWITCH:
                state.active_role = event.data.get("role", "mom")
                
            elif event.event_type == SyncEventType.ROOM_CHANGE:
                state.current_room = event.data.get("room", "sanctuary")
                
            elif event.event_type == SyncEventType.MODE_SWITCH:
                state.active_mode = event.data.get("mode", "infj")
                
            elif event.event_type == SyncEventType.MESSAGE_SENT:
                # Add message to history
                message_data = {
                    "id": event.data.get("message_id"),
                    "content": event.data.get("content"),
                    "sender": event.data.get("sender"),
                    "timestamp": event.timestamp.isoformat(),
                    "platform": event.platform.value
                }
                state.messages.append(message_data)
                
                # Keep only last 100 messages
                if len(state.messages) > 100:
                    state.messages = state.messages[-100:]
            
            elif event.event_type == SyncEventType.LIMBIC_UPDATE:
                state.limbic_variables.update(event.data.get("variables", {}))
                
            elif event.event_type == SyncEventType.COGNITIVE_UPDATE:
                state.cognitive_state.update(event.data.get("state", {}))
            
            state.last_updated = datetime.now(timezone.utc)
            
        except Exception as e:
            logger.error(f"Error updating user state: {e}")
    
    async def broadcast_event(self, event: SyncEvent, exclude_client: Optional[str] = None):
        """Broadcast event to all connected clients for the same user"""
        message = {
            "event_type": event.event_type.value,
            "platform": event.platform.value,
            "user_id": event.user_id,
            "data": event.data,
            "timestamp": event.timestamp.isoformat(),
            "event_id": event.event_id
        }
        
        # Send to all clients for the same user
        for client_id, client in self.connected_clients.items():
            if client.user_id == event.user_id and client_id != exclude_client and client.is_active:
                try:
                    await client.websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting to client {client_id}: {e}")
                    # Mark client as inactive
                    client.is_active = False
    
    async def send_state_update(self, client_id: str, reason: str = "sync"):
        """Send current state to a specific client"""
        if client_id not in self.connected_clients:
            return
        
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        if user_id not in self.user_states:
            return
        
        state = self.user_states[user_id]
        
        message = {
            "event_type": "state_update",
            "platform": "server",
            "user_id": user_id,
            "data": {
                "limbic_variables": state.limbic_variables,
                "cognitive_state": state.cognitive_state,
                "avatar_form": state.avatar_form,
                "active_role": state.active_role,
                "current_room": state.current_room,
                "active_mode": state.active_mode,
                "messages": state.messages[-10:],  # Send last 10 messages
                "reason": reason
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_id": f"state_update_{user_id}_{datetime.now().timestamp()}"
        }
        
        try:
            await client.websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending state update to {client_id}: {e}")
            client.is_active = False
    
    async def ping_clients(self):
        """Ping all clients to check connection health"""
        current_time = datetime.now(timezone.utc)
        
        for client_id, client in list(self.connected_clients.items()):
            if current_time - client.last_ping > timedelta(minutes=5):
                # Client hasn't responded in 5 minutes, mark as inactive
                client.is_active = False
                await self.unregister_client(client_id)
            else:
                try:
                    await client.websocket.send_text(json.dumps({"type": "ping"}))
                except Exception as e:
                    logger.error(f"Error pinging client {client_id}: {e}")
                    client.is_active = False
                    await self.unregister_client(client_id)
    
    async def get_user_state(self, user_id: str) -> Optional[SyncState]:
        """Get current state for a user"""
        return self.user_states.get(user_id)
    
    async def get_connected_platforms(self, user_id: str) -> List[PlatformType]:
        """Get list of connected platforms for a user"""
        platforms = []
        for client in self.connected_clients.values():
            if client.user_id == user_id and client.is_active:
                platforms.append(client.platform)
        return platforms
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        stats = {
            "total_clients": len(self.connected_clients),
            "active_clients": len([c for c in self.connected_clients.values() if c.is_active]),
            "platforms": {},
            "users": len(set(c.user_id for c in self.connected_clients.values())),
            "events_today": len([e for e in self.event_history if e.timestamp.date() == datetime.now(timezone.utc).date()])
        }
        
        for platform in PlatformType:
            stats["platforms"][platform.value] = len([
                c for c in self.connected_clients.values() 
                if c.platform == platform and c.is_active
            ])
        
        return stats

# Global sync manager instance
sync_manager = CrossPlatformSyncManager()

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, platform: str, user_id: str):
    """Handle WebSocket connections for real-time sync"""
    await websocket.accept()
    
    try:
        platform_type = PlatformType(platform.lower())
        client_id = await sync_manager.register_client(websocket, platform_type, user_id)
        
        # Keep connection alive and handle messages
        while True:
            try:
                # Receive message from client
                message = await websocket.receive_text()
                data = json.loads(message)
                
                # Handle different message types
                if data.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif data.get("type") == "sync_request":
                    # Send current state
                    await sync_manager.send_state_update(client_id, "request")
                else:
                    # Handle sync event
                    await sync_manager.handle_client_message(client_id, data)
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {e}")
                break
                
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        await sync_manager.unregister_client(client_id)

# Background task for periodic maintenance
async def sync_maintenance_task():
    """Background task for sync system maintenance"""
    while True:
        try:
            await sync_manager.ping_clients()
            await asyncio.sleep(60)  # Run every minute
        except Exception as e:
            logger.error(f"Error in sync maintenance: {e}")
            await asyncio.sleep(60)

# API endpoints for sync management
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

sync_router = APIRouter(prefix="/sync", tags=["sync"])

@sync_router.get("/stats")
async def get_sync_stats():
    """Get synchronization statistics"""
    return JSONResponse(content=sync_manager.get_connection_stats())

@sync_router.get("/state/{user_id}")
async def get_user_sync_state(user_id: str):
    """Get current sync state for a user"""
    state = await sync_manager.get_user_state(user_id)
    if not state:
        raise HTTPException(status_code=404, detail="User not found")
    
    return JSONResponse(content=asdict(state))

@sync_router.get("/platforms/{user_id}")
async def get_user_platforms(user_id: str):
    """Get connected platforms for a user"""
    platforms = await sync_manager.get_connected_platforms(user_id)
    return JSONResponse(content={"platforms": [p.value for p in platforms]})

@sync_router.post("/broadcast/{user_id}")
async def broadcast_to_user(user_id: str, event_data: Dict[str, Any]):
    """Broadcast an event to all connected clients for a user"""
    try:
        event_type = SyncEventType(event_data.get("event_type"))
        event = SyncEvent(
            event_type=event_type,
            platform=PlatformType.SERVER,
            user_id=user_id,
            data=event_data.get("data", {}),
            timestamp=datetime.now(timezone.utc),
            event_id=f"broadcast_{user_id}_{datetime.now().timestamp()}"
        )
        
        await sync_manager.broadcast_event(event)
        return JSONResponse(content={"message": "Event broadcasted successfully"})
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Start background task
async def start_sync_background_tasks():
    """Start background tasks for sync system"""
    asyncio.create_task(sync_maintenance_task())
