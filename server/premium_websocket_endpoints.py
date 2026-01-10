"""
Premium WebSocket Endpoints for Sallie Studio
Zero-latency real-time synchronization with enterprise features
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import json
import logging
from datetime import datetime, timezone
import asyncio

from premium_websocket import premium_ws_manager, ConnectedClient, SyncEvent
from security import get_current_user_websocket

logger = logging.getLogger(__name__)

# Create router
premium_ws_router = APIRouter(prefix="/ws", tags=["websocket"])

@premium_ws_router.websocket("/premium/{platform}/{user_id}")
async def premium_websocket_endpoint(
    websocket: WebSocket,
    platform: str,
    user_id: str,
    room_id: Optional[str] = Query(None)
):
    """
    Premium WebSocket endpoint with zero-latency sync
    
    Features:
    - Real-time encryption key exchange
    - Heartbeat/latency monitoring
    - Automatic reconnection support
    - Message queuing and prioritization
    - Dream cycle processing
    - State persistence and synchronization
    """
    
    client_id = None
    
    try:
        # Connect client with premium features
        client_id = await premium_ws_manager.connect_client(
            websocket=websocket,
            platform=platform,
            user_id=user_id,
            room_id=room_id
        )
        
        logger.info(f"Premium WebSocket connection established: {client_id}")
        
        # Send welcome message with connection info
        welcome_message = {
            "type": "connection_established",
            "data": {
                "client_id": client_id,
                "platform": platform,
                "user_id": user_id,
                "room_id": room_id,
                "server_time": datetime.now(timezone.utc).isoformat(),
                "features": {
                    "encryption": True,
                    "heartbeat": True,
                    "state_sync": True,
                    "dream_cycle": True,
                    "message_queuing": True,
                    "prioritization": True
                }
            },
            "timestamp": datetime.now().timestamp() * 1000
        }
        
        await premium_ws_manager.send_to_client(client_id, welcome_message)
        
        # Main message loop
        while True:
            try:
                # Receive message with timeout
                message = await websocket.receive_text(timeout=60.0)  # 60 second timeout
                
                # Parse message
                try:
                    message_data = json.loads(message)
                except json.JSONDecodeError:
                    await premium_ws_manager.send_error(client_id, "Invalid JSON format")
                    continue
                
                # Handle message
                await premium_ws_manager.handle_message(client_id, message_data)
                
            except asyncio.TimeoutError:
                # Send heartbeat to check connection
                heartbeat = {
                    "type": "server_heartbeat",
                    "timestamp": datetime.now().timestamp() * 1000
                }
                await premium_ws_manager.send_to_client(client_id, heartbeat)
                
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected: {client_id}")
                break
                
            except Exception as e:
                logger.error(f"Error in WebSocket loop for {client_id}: {e}")
                await premium_ws_manager.send_error(client_id, "Internal server error")
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected during setup: {platform}/{user_id}")
        
    except Exception as e:
        logger.error(f"Error in premium WebSocket endpoint: {e}")
        
    finally:
        # Ensure cleanup
        if client_id:
            await premium_ws_manager.disconnect_client(client_id)

@premium_ws_router.websocket("/sync/{platform}/{user_id}")
async def sync_websocket_endpoint(
    websocket: WebSocket,
    platform: str,
    user_id: str,
    room_id: Optional[str] = Query(None)
):
    """
    Dedicated synchronization endpoint for state updates
    
    Optimized for:
    - Limbic system updates
    - Convergence progress
    - Posture changes
    - Real-time state synchronization
    """
    
    client_id = None
    
    try:
        # Connect with sync-specific settings
        client_id = await premium_ws_manager.connect_client(
            websocket=websocket,
            platform=platform,
            user_id=user_id,
            room_id=room_id
        )
        
        # Send sync-specific welcome
        sync_welcome = {
            "type": "sync_ready",
            "data": {
                "client_id": client_id,
                "sync_types": [
                    "limbic_update",
                    "convergence_update", 
                    "posture_change",
                    "state_sync",
                    "heartbeat"
                ],
                "update_frequency": "real-time",
                "compression": "enabled",
                "batching": "enabled"
            },
            "timestamp": datetime.now().timestamp() * 1000
        }
        
        await premium_ws_manager.send_to_client(client_id, sync_welcome)
        
        # Sync-specific message loop with higher frequency
        while True:
            try:
                message = await websocket.receive_text(timeout=30.0)  # Shorter timeout for sync
                
                message_data = json.loads(message)
                
                # Only handle sync-related messages
                if message_data.get("type") in [
                    "limbic_update", "convergence_update", "posture_change", 
                    "state_sync", "heartbeat"
                ]:
                    await premium_ws_manager.handle_message(client_id, message_data)
                else:
                    await premium_ws_manager.send_error(
                        client_id, 
                        f"Message type {message_data.get('type')} not supported on sync endpoint"
                    )
                
            except asyncio.TimeoutError:
                # More frequent heartbeat for sync
                heartbeat = {
                    "type": "sync_heartbeat",
                    "timestamp": datetime.now().timestamp() * 1000
                }
                await premium_ws_manager.send_to_client(client_id, heartbeat)
                
            except WebSocketDisconnect:
                break
                
            except Exception as e:
                logger.error(f"Error in sync WebSocket for {client_id}: {e}")
                break
    
    except Exception as e:
        logger.error(f"Error in sync WebSocket endpoint: {e}")
        
    finally:
        if client_id:
            await premium_ws_manager.disconnect_client(client_id)

@premium_ws_router.websocket("/dream/{platform}/{user_id}")
async def dream_cycle_websocket_endpoint(
    websocket: WebSocket,
    platform: str,
    user_id: str
):
    """
    Dedicated endpoint for dream cycle processing
    
    Features:
    - Asynchronous processing
    - Background task management
    - Result streaming
    - Progress updates
    """
    
    client_id = None
    
    try:
        client_id = await premium_ws_manager.connect_client(
            websocket=websocket,
            platform=platform,
            user_id=user_id,
            room_id="dream_cycle"
        )
        
        # Send dream cycle welcome
        dream_welcome = {
            "type": "dream_cycle_ready",
            "data": {
                "client_id": client_id,
                "processing_mode": "asynchronous",
                "supported_operations": [
                    "analyze_patterns",
                    "generate_insights",
                    "process_memories",
                    "synthesize_dreams"
                ],
                "queue_status": "ready"
            },
            "timestamp": datetime.now().timestamp() * 1000
        }
        
        await premium_ws_manager.send_to_client(client_id, dream_welcome)
        
        # Dream cycle message loop
        while True:
            try:
                message = await websocket.receive_text(timeout=120.0)  # Longer timeout for processing
                
                message_data = json.loads(message)
                
                # Handle dream cycle messages
                if message_data.get("type") == "dream_cycle":
                    await premium_ws_manager.handle_message(client_id, message_data)
                elif message_data.get("type") == "dream_status":
                    # Send current dream cycle status
                    user_state = premium_ws_manager.user_states.get(user_id)
                    if user_state:
                        status = {
                            "type": "dream_status_response",
                            "data": {
                                "queued_cycles": len(premium_ws_manager.dream_cycle_queue),
                                "completed_cycles": len([d for d in user_state.dream_cycles if d.get("processed", False)]),
                                "total_cycles": len(user_state.dream_cycles),
                                "last_processed": user_state.dream_cycles[-1].get("timestamp") if user_state.dream_cycles else None
                            },
                            "timestamp": datetime.now().timestamp() * 1000
                        }
                        await premium_ws_manager.send_to_client(client_id, status)
                else:
                    await premium_ws_manager.send_error(
                        client_id,
                        f"Message type {message_data.get('type')} not supported on dream cycle endpoint"
                    )
                
            except asyncio.TimeoutError:
                # Send dream cycle status update
                user_state = premium_ws_manager.user_states.get(user_id)
                if user_state:
                    status = {
                        "type": "dream_cycle_ping",
                        "data": {
                            "queued": len(premium_ws_manager.dream_cycle_queue),
                            "processed": len([d for d in user_state.dream_cycles if d.get("processed", False)])
                        },
                        "timestamp": datetime.now().timestamp() * 1000
                    }
                    await premium_ws_manager.send_to_client(client_id, status)
                
            except WebSocketDisconnect:
                break
                
            except Exception as e:
                logger.error(f"Error in dream cycle WebSocket for {client_id}: {e}")
                break
    
    except Exception as e:
        logger.error(f"Error in dream cycle WebSocket endpoint: {e}")
        
    finally:
        if client_id:
            await premium_ws_manager.disconnect_client(client_id)

# REST API endpoints for WebSocket management

@premium_ws_router.get("/metrics")
async def get_websocket_metrics():
    """Get WebSocket connection metrics"""
    try:
        metrics = premium_ws_manager.get_metrics()
        
        # Add additional computed metrics
        if metrics["connected_clients"] > 0:
            # Calculate average latency and quality
            total_latency = sum(client.latency for client in premium_ws_manager.connected_clients.values())
            total_quality = sum(client.connection_quality for client in premium_ws_manager.connected_clients.values())
            
            metrics["average_latency"] = total_latency / metrics["connected_clients"]
            metrics["average_quality"] = total_quality / metrics["connected_clients"]
        else:
            metrics["average_latency"] = 0
            metrics["average_quality"] = 0
        
        # Add platform breakdown
        platform_breakdown = {}
        for client in premium_ws_manager.connected_clients.values():
            platform_breakdown[client.platform] = platform_breakdown.get(client.platform, 0) + 1
        
        metrics["platform_breakdown"] = platform_breakdown
        
        return JSONResponse(content=metrics)
        
    except Exception as e:
        logger.error(f"Error getting WebSocket metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get metrics")

@premium_ws_router.get("/clients/{user_id}")
async def get_user_clients(user_id: str):
    """Get all connected clients for a user"""
    try:
        client_ids = premium_ws_manager.user_clients.get(user_id, set())
        clients = []
        
        for client_id in client_ids:
            if client_id in premium_ws_manager.connected_clients:
                client = premium_ws_manager.connected_clients[client_id]
                clients.append({
                    "client_id": client_id,
                    "platform": client.platform,
                    "room_id": client.room_id,
                    "connected_at": client.connected_at.isoformat(),
                    "last_ping": client.last_ping.isoformat(),
                    "latency": client.latency,
                    "connection_quality": client.connection_quality,
                    "message_count": client.message_count,
                    "bytes_sent": client.bytes_sent,
                    "bytes_received": client.bytes_received
                })
        
        return JSONResponse(content={"clients": clients})
        
    except Exception as e:
        logger.error(f"Error getting user clients: {e}")
        raise HTTPException(status_code=500, detail="Failed to get client information")

@premium_ws_router.post("/broadcast/{user_id}")
async def broadcast_to_user(user_id: str, message: Dict[str, Any]):
    """Broadcast message to all connected clients for a user"""
    try:
        client_ids = premium_ws_manager.user_clients.get(user_id, set())
        
        if not client_ids:
            raise HTTPException(status_code=404, detail="No connected clients found")
        
        # Create broadcast event
        event = SyncEvent(
            event_type="admin_broadcast",
            user_id=user_id,
            platform="server",
            data=message,
            timestamp=datetime.now(timezone.utc),
            event_id=f"admin_broadcast_{user_id}_{datetime.now().timestamp()}",
            priority=2  # Critical priority
        )
        
        # Broadcast to all user's clients
        await premium_ws_manager.broadcast_event(event)
        
        return JSONResponse(content={
            "status": "broadcast_sent",
            "client_count": len(client_ids),
            "message_id": event.event_id
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error broadcasting to user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to broadcast message")

@premium_ws_router.post("/disconnect/{client_id}")
async def disconnect_client(client_id: str):
    """Force disconnect a client"""
    try:
        if client_id not in premium_ws_manager.connected_clients:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = premium_ws_manager.connected_clients[client_id]
        
        # Send disconnect message
        disconnect_message = {
            "type": "server_disconnect",
            "data": {
                "reason": "admin_disconnect",
                "message": "You have been disconnected by an administrator"
            },
            "timestamp": datetime.now().timestamp() * 1000
        }
        
        await premium_ws_manager.send_to_client(client_id, disconnect_message)
        
        # Disconnect client
        await premium_ws_manager.disconnect_client(client_id)
        
        return JSONResponse(content={
            "status": "disconnected",
            "client_id": client_id,
            "user_id": client.user_id,
            "platform": client.platform
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disconnecting client {client_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to disconnect client")
