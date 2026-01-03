#!/usr/bin/env python3
"""
Simple Sallie Preview Server
Lightweight server for testing without full dependencies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import asyncio

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("preview_server")

# Create FastAPI app
app = FastAPI(
    title="Sallie Preview",
    description="Lightweight preview server for Sallie",
    version="5.4.2"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ChatInput(BaseModel):
    text: str
    source: str = "user"

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    system_info: Dict[str, Any]

class SystemStatus(BaseModel):
    status: str
    version: str
    timestamp: str
    services: Dict[str, Any]
    features: Dict[str, Any]

# Mock systems for preview
class MockSallie:
    """Mock Sallie system for preview"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.conversation_history = []
        
    async def process_message(self, message: str, source: str = "user"):
        """Process a message and return response"""
        # Simple mock responses
        responses = [
            "I'm Sallie, your AI cognitive partner! 👋",
            "I can help you with creative tasks, analysis, and conversation.",
            "This is a preview version - full features coming soon!",
            "I'm excited to learn more about you through our conversations.",
            "Let's explore ideas together and create something amazing!",
            "I'm designed to be your creative and analytical partner.",
            "What would you like to work on today?"
        ]
        
        # Simple response logic
        if "hello" in message.lower() or "hi" in message.lower():
            response = "Hello! I'm Sallie, your AI cognitive partner. How can I help you today?"
        elif "who are you" in message.lower():
            response = "I'm Sallie, a Digital Progeny AI designed to be your creative and analytical partner. I can help with conversation, analysis, and creative tasks!"
        elif "what can you do" in message.lower():
            response = "I can help with creative writing, analysis, conversation, problem-solving, and much more. I'm designed to learn and grow with our interactions!"
        else:
            response = f"That's interesting! {responses[hash(message) % len(responses)]}"
        
        # Add to history
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "source": source,
            "message": message,
            "response": response
        })
        
        return response

# Initialize mock Sallie
sallie = MockSallie()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "system": "Sallie Preview",
        "version": "5.5.0",
        "status": "running",
        "message": "Welcome to Sallie Preview! This is a lightweight version for testing.",
        "endpoints": {
            "chat": "/chat",
            "status": "/status",
            "health": "/health",
            "discovery": "/api/discover"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": (datetime.now() - sallie.start_time).total_seconds(),
        "conversation_count": len(sallie.conversation_history)
    }

@app.get("/status")
async def get_status():
    """Get detailed system status"""
    return SystemStatus(
        status="preview_mode",
        version="5.5.0",
        timestamp=datetime.now().isoformat(),
        services={
            "backend": "running",
            "chat": "available",
            "discovery": "available",
            "stt": "mock",
            "creative": "mock"
        },
        features={
            "conversation": True,
            "auto_discovery": True,
            "speech_to_text": False,
            "creative_generation": False,
            "memory_system": False,
            "limbic_system": False,
            "monologue": False
        }
    )

@app.post("/chat")
async def chat(input: ChatInput):
    """Chat endpoint"""
    try:
        response = await sallie.process_message(input.text, input.source)
        
        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            system_info={
                "preview_mode": True,
                "conversation_count": len(sallie.conversation_history),
                "last_interaction": sallie.conversation_history[-1]["timestamp"] if sallie.conversation_history else None
            }
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat processing failed")

@app.get("/api/discover")
async def discover():
    """Discovery endpoint for mobile apps"""
    import socket
    
    # Get system info
    hostname = socket.gethostname()
    
    return {
        "system_info": {
            "hostname": hostname,
            "platform": "preview",
            "version": "5.5.0",
            "capabilities": [
                "chat",
                "discovery",
                "preview_mode"
            ]
        },
        "services": [
            {
                "name": "backend",
                "status": "running",
                "url": "http://localhost:8000",
                "version": "5.5.0"
            }
        ],
        "endpoints": {
            "api": "http://localhost:8000",
            "chat": "http://localhost:8000/chat",
            "health": "http://localhost:8000/health"
        },
        "capabilities": [
            "chat",
            "auto_discovery",
            "preview_mode"
        ],
        "last_updated": datetime.now().isoformat()
    }

@app.get("/stt/status")
async def stt_status():
    """STT system status"""
    return {
        "current_engine": "mock",
        "available_engines": ["mock"],
        "engine_status": {
            "mock": "available"
        },
        "is_recording": False,
        "buffer_size": 0,
        "preview_mode": True
    }

@app.get("/conversation/history")
async def get_conversation_history():
    """Get conversation history"""
    return {
        "history": sallie.conversation_history,
        "count": len(sallie.conversation_history),
        "preview_mode": True
    }

@app.get("/features")
async def get_features():
    """Get available features"""
    return {
        "available_features": {
            "chat": True,
            "discovery": True,
            "conversation_history": True,
            "health_check": True,
            "status_monitoring": True,
            "stt_status": True
        },
        "upcoming_features": [
            "Full AI conversation with context",
            "Memory system",
            "Limbic emotional system",
            "Monologue system",
            "Creative generation",
            "Voice input/output",
            "File access",
            "Smart home integration"
        ],
        "preview_mode": True
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Sallie Preview Server")
    print("=" * 40)
    print("📱 Available endpoints:")
    print("   • http://localhost:8000/ - Root")
    print("   • http://localhost:8000/chat - Chat API")
    print("   • http://localhost:8000/status - System Status")
    print("   • http://localhost:8000/health - Health Check")
    print("   • http://localhost:8000/api/discover - Discovery")
    print("   • http://localhost:8000/stt/status - STT Status")
    print("=" * 40)
    print("🌐 Server starting on http://localhost:8000")
    print("📱 This is a preview version for testing")
    print("🎯 Full features coming soon!")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
