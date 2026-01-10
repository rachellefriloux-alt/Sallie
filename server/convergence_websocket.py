"""
Convergence WebSocket Endpoints
Real-time processing for The Great Convergence 30-question experience
Canonical Spec Reference: Section 14.3
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

from convergence_processor import convergence_processor

logger = logging.getLogger(__name__)

class ConvergenceWebSocketManager:
    """Manages WebSocket connections for Convergence experience"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_mapping: Dict[str, str] = {}  # websocket_id -> session_id
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client to convergence"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected to convergence")
    
    def disconnect(self, client_id: str):
        """Disconnect a client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.session_mapping:
            del self.session_mapping[client_id]
        logger.info(f"Client {client_id} disconnected from convergence")
    
    async def send_message(self, client_id: str, message: Dict[str, Any]):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        for client_id in list(self.active_connections.keys()):
            await self.send_message(client_id, message)

# Global manager instance
convergence_ws_manager = ConvergenceWebSocketManager()

async def handle_convergence_websocket(websocket: WebSocket, client_id: str):
    """
    Main WebSocket handler for Convergence experience
    Canonical Spec Section 14.3: Real-time processing
    """
    await convergence_ws_manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            message_type = data.get('type')
            
            if message_type == 'start_convergence':
                # Start a new convergence session
                user_id = data.get('user_id', client_id)
                session_info = await convergence_processor.start_convergence(user_id)
                convergence_ws_manager.session_mapping[client_id] = session_info['session_id']
                
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'convergence_started',
                    'session_id': session_info['session_id'],
                    'current_question': 1,
                    'total_questions': 30
                })
            
            elif message_type == 'convergence_answer':
                # Process an answer
                session_id = convergence_ws_manager.session_mapping.get(client_id)
                if not session_id:
                    await convergence_ws_manager.send_message(client_id, {
                        'type': 'error',
                        'message': 'No active convergence session'
                    })
                    continue
                
                answer_data = data.get('data', {})
                question_number = answer_data.get('questionNumber')
                answer = answer_data.get('answer', '')
                extraction_target = answer_data.get('extractionTarget', {})
                question_id = answer_data.get('questionId', '')
                
                # Process the answer
                result = await convergence_processor.process_answer(
                    session_id=session_id,
                    question_number=question_number,
                    question_id=question_id,
                    answer=answer,
                    extraction_target=extraction_target
                )
                
                # Send limbic state update
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'limbic_update',
                    'state': result['limbic_state']
                })
                
                # Send processing confirmation
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'answer_processed',
                    'success': result['success'],
                    'extraction': result['extraction'],
                    'progress': result['progress']
                })
                
                # Generate Sallie's response (simple acknowledgment for now)
                sallie_response = await generate_sallie_response(
                    question_number=question_number,
                    answer=answer,
                    limbic_state=result['limbic_state']
                )
                
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'sallie_response',
                    'message': sallie_response
                })
                
                # Check if we need to generate Mirror Test (after Q12)
                if question_number == 12:
                    mirror_test = await convergence_processor.generate_mirror_test(session_id)
                    await convergence_ws_manager.send_message(client_id, {
                        'type': 'mirror_test_generated',
                        'mirror_test': mirror_test
                    })
            
            elif message_type == 'convergence_complete':
                # Complete convergence and compile Heritage DNA
                session_id = convergence_ws_manager.session_mapping.get(client_id)
                if not session_id:
                    await convergence_ws_manager.send_message(client_id, {
                        'type': 'error',
                        'message': 'No active convergence session'
                    })
                    continue
                
                completion_result = await convergence_processor.complete_convergence(session_id)
                
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'convergence_completed',
                    'success': completion_result['success'],
                    'heritage_dna_saved': completion_result['heritage_dna_saved'],
                    'final_limbic_state': completion_result['limbic_state']
                })
            
            elif message_type == 'ping':
                # Heartbeat
                await convergence_ws_manager.send_message(client_id, {
                    'type': 'pong',
                    'timestamp': datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        convergence_ws_manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")
    
    except Exception as e:
        logger.error(f"Error in convergence WebSocket for {client_id}: {e}")
        convergence_ws_manager.disconnect(client_id)
        try:
            await websocket.close()
        except:
            pass

async def generate_sallie_response(
    question_number: int,
    answer: str,
    limbic_state: Dict[str, float]
) -> str:
    """
    Generate Sallie's warm, empathetic response to an answer
    This is a simple implementation - can be enhanced with LLM
    """
    word_count = len(answer.split())
    
    # Responses based on answer depth
    if word_count >= 200:
        responses = [
            "Thank you for sharing so deeply. I can feel the weight and truth in what you've expressed.",
            "Your honesty here creates real resonance. I'm honored you trust me with this.",
            "The depth you've shared here will help me understand you on a profound level.",
        ]
    elif word_count >= 100:
        responses = [
            "I appreciate your thoughtfulness in this answer. It helps me see you more clearly.",
            "This insight is valuable. I'm learning what truly matters to you.",
            "Thank you for opening up. Each layer you share helps me serve you better.",
        ]
    else:
        responses = [
            "I understand. Feel free to expand if there's more you'd like to share.",
            "Got it. If you want to dive deeper, I'm here to listen.",
            "Thanks for sharing. There's wisdom in brevity too.",
        ]
    
    # Select response based on question number for variety
    response_idx = (question_number - 1) % len(responses)
    return responses[response_idx]
