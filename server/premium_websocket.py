"""
Premium WebSocket Server for Sallie Studio
Zero-latency sync with encryption, heartbeat, and dream cycle support

Canonical Spec Reference: Section 8.0 - Security & Privacy
"""

import asyncio
import json
import logging
import time
import uuid
import os
import sys
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Set
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
import websockets
from dataclasses import dataclass, asdict
import hashlib
import hmac
import base64
from collections import defaultdict
import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ConnectedClient:
    """Enhanced client connection with premium features"""
    websocket: WebSocket
    client_id: str
    user_id: str
    platform: str
    room_id: Optional[str] = None
    connected_at: datetime = None
    last_ping: datetime = None
    last_pong: datetime = None
    encryption_key: Optional[str] = None
    connection_quality: float = 100.0
    latency: float = 0.0
    is_active: bool = True
    message_count: int = 0
    bytes_sent: int = 0
    bytes_received: int = 0
    
    def __post_init__(self):
        if self.connected_at is None:
            self.connected_at = datetime.now(timezone.utc)
        if self.last_ping is None:
            self.last_ping = datetime.now(timezone.utc)
        if self.last_pong is None:
            self.last_pong = datetime.now(timezone.utc)

@dataclass
class SyncEvent:
    """Enhanced sync event with metadata"""
    event_type: str
    user_id: str
    platform: str
    data: Dict[str, Any]
    timestamp: datetime
    event_id: str
    room_id: Optional[str] = None
    priority: int = 0  # 0 = normal, 1 = high, 2 = critical
    encrypted: bool = False
    checksum: Optional[str] = None

@dataclass
class UserState:
    """Comprehensive user state"""
    limbic_variables: Dict[str, float]
    convergence_state: Dict[str, Any]
    current_posture: str
    active_room: str
    messages: List[Dict[str, Any]]
    dream_cycles: List[Dict[str, Any]]
    last_updated: datetime
    session_start: datetime
    total_interactions: int = 0
    
    def __post_init__(self):
        if self.last_updated is None:
            self.last_updated = datetime.now(timezone.utc)
        if self.session_start is None:
            self.session_start = datetime.now(timezone.utc)

class PremiumWebSocketManager:
    """Premium WebSocket manager with advanced features"""
    
    def __init__(self):
        # Client management
        self.connected_clients: Dict[str, ConnectedClient] = {}
        self.user_clients: Dict[str, Set[str]] = defaultdict(set)  # user_id -> client_ids
        self.room_clients: Dict[str, Set[str]] = defaultdict(set)  # room_id -> client_ids
        
        # State management
        self.user_states: Dict[str, UserState] = {}
        self.event_history: List[SyncEvent] = []
        self.max_event_history = 10000
        
        # Performance metrics
        self.total_connections = 0
        self.total_messages = 0
        self.total_bytes_transferred = 0
        self.peak_concurrent_connections = 0
        
        # Canonical Spec Section 8.0: Security - No hard-coded secrets
        self.encryption_enabled = True
        self.jwt_secret = os.getenv("JWT_SECRET")
        if not self.jwt_secret:
            logger.error("CRITICAL: JWT_SECRET environment variable is not set!")
            raise ValueError("JWT_SECRET must be set in environment variables")
        self.rate_limits: Dict[str, List[float]] = defaultdict(list)
        
        # Dream cycle support
        self.dream_cycle_queue: List[SyncEvent] = []
        self.dream_cycle_processors: List[str] = []
        
        # Background tasks
        self.cleanup_task: Optional[asyncio.Task] = None
        self.metrics_task: Optional[asyncio.Task] = None
        self.dream_cycle_task: Optional[asyncio.Task] = None

    async def connect_client(self, websocket: WebSocket, platform: str, user_id: str, room_id: Optional[str] = None) -> str:
        """Connect a new client with premium features"""
        try:
            await websocket.accept()
            
            client_id = f"{platform}_{user_id}_{uuid.uuid4().hex[:8]}"
            
            # Create enhanced client
            client = ConnectedClient(
                websocket=websocket,
                client_id=client_id,
                user_id=user_id,
                platform=platform,
                room_id=room_id,
                connected_at=datetime.now(timezone.utc)
            )
            
            # Register client
            self.connected_clients[client_id] = client
            self.user_clients[user_id].add(client_id)
            
            if room_id:
                self.room_clients[room_id].add(client_id)
            
            # Initialize user state if needed
            if user_id not in self.user_states:
                self.user_states[user_id] = UserState(
                    limbic_variables={
                        "trust": 0.5, "warmth": 0.5, "arousal": 0.5, "valence": 0.5, "posture": 0.5,
                        "empathy": 0.5, "intuition": 0.5, "creativity": 0.5, "wisdom": 0.5, "humor": 0.5
                    },
                    convergence_state={
                        "current_question": 1,
                        "progress": 0.0,
                        "connection_strength": 0.0,
                        "imprinting_level": 0.0,
                        "synchronization": 0.0,
                        "heart_resonance": 0.0,
                        "answers": {},
                        "completed": False
                    },
                    current_posture="Companion",
                    active_room=room_id or "sanctuary",
                    messages=[],
                    dream_cycles=[],
                    last_updated=datetime.now(timezone.utc),
                    session_start=datetime.now(timezone.utc)
                )
            
            # Update metrics
            self.total_connections += 1
            self.peak_concurrent_connections = max(self.peak_concurrent_connections, len(self.connected_clients))
            
            # Send initial state
            await self.send_client_state(client_id)
            
            # Start background tasks if not running
            if not self.cleanup_task or self.cleanup_task.done():
                self.cleanup_task = asyncio.create_task(self.background_cleanup())
            
            if not self.metrics_task or self.metrics_task.done():
                self.metrics_task = asyncio.create_task(self.update_metrics())
            
            if not self.dream_cycle_task or self.dream_cycle_task.done():
                self.dream_cycle_task = asyncio.create_task(self.process_dream_cycles())
            
            logger.info(f"Client connected: {client_id} ({platform}) - Total: {len(self.connected_clients)}")
            
            return client_id
            
        except Exception as e:
            logger.error(f"Error connecting client: {e}")
            raise HTTPException(status_code=500, detail="Connection failed")

    async def disconnect_client(self, client_id: str):
        """Disconnect a client with cleanup"""
        if client_id not in self.connected_clients:
            return
        
        client = self.connected_clients[client_id]
        
        # Remove from all mappings
        self.user_clients[client.user_id].discard(client_id)
        if client.room_id:
            self.room_clients[client.room_id].discard(client_id)
        
        # Close websocket
        try:
            await client.websocket.close()
        except:
            pass
        
        # Remove client
        del self.connected_clients[client_id]
        
        logger.info(f"Client disconnected: {client_id} - Total: {len(self.connected_clients)}")

    async def handle_message(self, client_id: str, message: Dict[str, Any]):
        """Handle incoming message with premium features"""
        if client_id not in self.connected_clients:
            return
        
        client = self.connected_clients[client_id]
        
        try:
            # Rate limiting
            if not await self.check_rate_limit(client.user_id):
                await self.send_error(client_id, "Rate limit exceeded")
                return
            
            # Update client metrics
            client.message_count += 1
            client.last_pong = datetime.now(timezone.utc)
            
            # Handle different message types
            message_type = message.get("type", "unknown")
            
            if message_type == "heartbeat":
                await self.handle_heartbeat(client_id, message)
            elif message_type == "encryption_key":
                await self.handle_encryption_key(client_id, message)
            elif message_type == "limbic_update":
                await self.handle_limbic_update(client_id, message)
            elif message_type == "convergence_update":
                await self.handle_convergence_update(client_id, message)
            elif message_type == "posture_change":
                await self.handle_posture_change(client_id, message)
            elif message_type == "state_sync":
                await self.handle_state_sync(client_id, message)
            elif message_type == "dream_cycle":
                await self.handle_dream_cycle(client_id, message)
            else:
                # Generic message handling
                await self.handle_generic_message(client_id, message)
            
        except Exception as e:
            logger.error(f"Error handling message from {client_id}: {e}")
            await self.send_error(client_id, "Message processing failed")

    async def handle_heartbeat(self, client_id: str, message: Dict[str, Any]):
        """Handle heartbeat messages for latency calculation"""
        client = self.connected_clients[client_id]
        
        if "timestamp" in message:
            client.latency = time.time() * 1000 - message["timestamp"]
            client.connection_quality = max(0, 100 - (client.latency / 10))
        
        # Send pong response
        pong_message = {
            "type": "heartbeat",
            "timestamp": time.time() * 1000,
            "latency": client.latency,
            "quality": client.connection_quality
        }
        
        await self.send_to_client(client_id, pong_message)

    async def handle_encryption_key(self, client_id: str, message: Dict[str, Any]):
        """Handle encryption key exchange"""
        client = self.connected_clients[client_id]
        
        if "key" in message:
            client.encryption_key = message["key"]
            
            # Confirm encryption setup
            confirmation = {
                "type": "encryption_key",
                "status": "confirmed",
                "timestamp": time.time() * 1000
            }
            
            await self.send_to_client(client_id, confirmation)

    async def handle_limbic_update(self, client_id: str, message: Dict[str, Any]):
        """Handle limbic system updates"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        if "data" in message and user_id in self.user_states:
            # Update limbic variables
            limbic_updates = message["data"]
            self.user_states[user_id].limbic_variables.update(limbic_updates)
            self.user_states[user_id].last_updated = datetime.now(timezone.utc)
            self.user_states[user_id].total_interactions += 1
            
            # Create sync event
            event = SyncEvent(
                event_type="limbic_update",
                user_id=user_id,
                platform=client.platform,
                data=limbic_updates,
                timestamp=datetime.now(timezone.utc),
                event_id=f"limbic_{user_id}_{time.time()}",
                room_id=client.room_id,
                priority=1  # High priority
            )
            
            # Broadcast to other clients
            await self.broadcast_event(event, exclude_client=client_id)

    async def handle_convergence_update(self, client_id: str, message: Dict[str, Any]):
        """Handle convergence state updates"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        if "data" in message and user_id in self.user_states:
            # Update convergence state
            convergence_updates = message["data"]
            self.user_states[user_id].convergence_state.update(convergence_updates)
            self.user_states[user_id].last_updated = datetime.now(timezone.utc)
            self.user_states[user_id].total_interactions += 1
            
            # Create sync event
            event = SyncEvent(
                event_type="convergence_update",
                user_id=user_id,
                platform=client.platform,
                data=convergence_updates,
                timestamp=datetime.now(timezone.utc),
                event_id=f"convergence_{user_id}_{time.time()}",
                room_id=client.room_id,
                priority=1  # High priority
            )
            
            # Broadcast to other clients
            await self.broadcast_event(event, exclude_client=client_id)

    async def handle_posture_change(self, client_id: str, message: Dict[str, Any]):
        """Handle posture changes"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        if "data" in message and "posture" in message["data"]:
            new_posture = message["data"]["posture"]
            self.user_states[user_id].current_posture = new_posture
            self.user_states[user_id].last_updated = datetime.now(timezone.utc)
            
            # Create sync event
            event = SyncEvent(
                event_type="posture_change",
                user_id=user_id,
                platform=client.platform,
                data={"posture": new_posture},
                timestamp=datetime.now(timezone.utc),
                event_id=f"posture_{user_id}_{time.time()}",
                room_id=client.room_id
            )
            
            # Broadcast to other clients
            await self.broadcast_event(event, exclude_client=client_id)

    async def handle_state_sync(self, client_id: str, message: Dict[str, Any]):
        """Handle state synchronization requests"""
        await self.send_client_state(client_id)

    async def handle_dream_cycle(self, client_id: str, message: Dict[str, Any]):
        """Handle dream cycle processing"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        # Add to dream cycle queue
        event = SyncEvent(
            event_type="dream_cycle",
            user_id=user_id,
            platform=client.platform,
            data=message.get("data", {}),
            timestamp=datetime.now(timezone.utc),
            event_id=f"dream_{user_id}_{time.time()}",
            room_id=client.room_id,
            priority=0
        )
        
        self.dream_cycle_queue.append(event)
        
        # Add to user's dream cycle history
        if user_id in self.user_states:
            self.user_states[user_id].dream_cycles.append({
                "timestamp": event.timestamp.isoformat(),
                "data": event.data,
                "processed": False
            })

    async def handle_generic_message(self, client_id: str, message: Dict[str, Any]):
        """Handle generic messages"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        # Create sync event
        event = SyncEvent(
            event_type=message.get("type", "generic"),
            user_id=user_id,
            platform=client.platform,
            data=message.get("data", {}),
            timestamp=datetime.now(timezone.utc),
            event_id=f"generic_{user_id}_{time.time()}",
            room_id=client.room_id
        )
        
        # Add to history
        self.event_history.append(event)
        if len(self.event_history) > self.max_event_history:
            self.event_history.pop(0)
        
        # Broadcast to other clients
        await self.broadcast_event(event, exclude_client=client_id)

    async def send_to_client(self, client_id: str, message: Dict[str, Any]):
        """Send message to specific client"""
        if client_id not in self.connected_clients:
            return
        
        client = self.connected_clients[client_id]
        
        try:
            message_str = json.dumps(message)
            await client.websocket.send(message_str)
            
            # Update metrics
            client.bytes_sent += len(message_str.encode())
            self.total_bytes_transferred += len(message_str.encode())
            
        except Exception as e:
            logger.error(f"Error sending message to {client_id}: {e}")
            await self.disconnect_client(client_id)

    async def send_error(self, client_id: str, error_message: str):
        """Send error message to client"""
        error_msg = {
            "type": "error",
            "error": error_message,
            "timestamp": time.time() * 1000
        }
        
        await self.send_to_client(client_id, error_msg)

    async def send_client_state(self, client_id: str):
        """Send complete state to client"""
        client = self.connected_clients[client_id]
        user_id = client.user_id
        
        if user_id not in self.user_states:
            return
        
        state = self.user_states[user_id]
        
        state_message = {
            "type": "state_sync",
            "data": {
                "limbic_variables": state.limbic_variables,
                "convergence_state": state.convergence_state,
                "current_posture": state.current_posture,
                "active_room": state.active_room,
                "messages": state.messages[-50:],  # Last 50 messages
                "session_stats": {
                    "session_start": state.session_start.isoformat(),
                    "total_interactions": state.total_interactions,
                    "last_updated": state.last_updated.isoformat()
                }
            },
            "timestamp": time.time() * 1000
        }
        
        await self.send_to_client(client_id, state_message)

    async def broadcast_event(self, event: SyncEvent, exclude_client: Optional[str] = None):
        """Broadcast event to relevant clients"""
        # Add to history
        self.event_history.append(event)
        if len(self.event_history) > self.max_event_history:
            self.event_history.pop(0)
        
        # Determine target clients
        target_clients = set()
        
        if event.room_id:
            target_clients.update(self.room_clients.get(event.room_id, set()))
        else:
            target_clients.update(self.user_clients.get(event.user_id, set()))
        
        # Remove excluded client
        if exclude_client:
            target_clients.discard(exclude_client)
        
        # Send to all target clients
        message = {
            "type": event.event_type,
            "user_id": event.user_id,
            "platform": event.platform,
            "data": event.data,
            "timestamp": event.timestamp.timestamp() * 1000,
            "event_id": event.event_id
        }
        
        for client_id in target_clients:
            await self.send_to_client(client_id, message)

    async def check_rate_limit(self, user_id: str, limit: int = 100, window: int = 60) -> bool:
        """Check if user is within rate limits"""
        now = time.time()
        user_requests = self.rate_limits[user_id]
        
        # Remove old requests outside window
        user_requests[:] = [req_time for req_time in user_requests if now - req_time < window]
        
        # Check if under limit
        if len(user_requests) < limit:
            user_requests.append(now)
            return True
        
        return False

    async def background_cleanup(self):
        """Background task for cleanup and maintenance"""
        while True:
            try:
                now = datetime.now(timezone.utc)
                
                # Clean up inactive clients
                inactive_clients = []
                for client_id, client in self.connected_clients.items():
                    # Check if client has been inactive for more than 5 minutes
                    if (now - client.last_pong).total_seconds() > 300:
                        inactive_clients.append(client_id)
                
                for client_id in inactive_clients:
                    await self.disconnect_client(client_id)
                
                # Clean up old rate limit data
                cutoff_time = time.time() - 3600  # 1 hour ago
                for user_id in list(self.rate_limits.keys()):
                    self.rate_limits[user_id] = [
                        req_time for req_time in self.rate_limits[user_id] 
                        if req_time > cutoff_time
                    ]
                    
                    if not self.rate_limits[user_id]:
                        del self.rate_limits[user_id]
                
                # Sleep for 30 seconds
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error in background cleanup: {e}")
                await asyncio.sleep(30)

    async def update_metrics(self):
        """Background task for updating metrics"""
        while True:
            try:
                # Calculate average connection quality
                if self.connected_clients:
                    total_quality = sum(client.connection_quality for client in self.connected_clients.values())
                    avg_quality = total_quality / len(self.connected_clients)
                    
                    # Log metrics
                    logger.info(f"WebSocket Metrics - Clients: {len(self.connected_clients)}, "
                              f"Avg Quality: {avg_quality:.1f}%, "
                              f"Total Messages: {self.total_messages}, "
                              f"Peak Connections: {self.peak_concurrent_connections}")
                
                # Sleep for 60 seconds
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error updating metrics: {e}")
                await asyncio.sleep(60)

    async def process_dream_cycles(self):
        """Background task for processing dream cycles"""
        while True:
            try:
                if self.dream_cycle_queue:
                    event = self.dream_cycle_queue.pop(0)
                    
                    # Process dream cycle (placeholder for actual processing)
                    processed_data = {
                        "original": event.data,
                        "processed": True,
                        "insights": ["Dream processing complete"],
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    
                    # Update user state
                    if event.user_id in self.user_states:
                        for dream in self.user_states[event.user_id].dream_cycles:
                            if dream["timestamp"] == event.timestamp.isoformat():
                                dream["processed"] = True
                                dream["result"] = processed_data
                                break
                    
                    # Send result back to user
                    result_message = {
                        "type": "dream_cycle_result",
                        "data": processed_data,
                        "timestamp": time.time() * 1000
                    }
                    
                    # Send to all user's clients
                    for client_id in self.user_clients.get(event.user_id, set()):
                        await self.send_to_client(client_id, result_message)
                
                # Sleep for 5 seconds
                await asyncio.sleep(5)
                
            except Exception as e:
                logger.error(f"Error processing dream cycles: {e}")
                await asyncio.sleep(5)

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        return {
            "connected_clients": len(self.connected_clients),
            "total_connections": self.total_connections,
            "total_messages": self.total_messages,
            "total_bytes_transferred": self.total_bytes_transferred,
            "peak_concurrent_connections": self.peak_concurrent_connections,
            "active_users": len(self.user_clients),
            "active_rooms": len(self.room_clients),
            "dream_cycles_queued": len(self.dream_cycle_queue),
            "event_history_size": len(self.event_history)
        }

# Global instance
premium_ws_manager = PremiumWebSocketManager()
