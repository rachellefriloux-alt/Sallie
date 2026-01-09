"""
Sallie Python AI Service
Advanced AI/ML processing service for Sallie Studio
"""

import asyncio
import logging
import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add src to path
sys.path.append(str(Path(__file__).parent))

from main import app as main_app
from sallie_brain import SallieBrain
from cross_platform_sync import SyncManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Sallie Python AI Service",
    description="Advanced AI/ML processing for Sallie Studio",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Sallie Brain
sallie_brain = None
sync_manager = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global sallie_brain, sync_manager
    
    try:
        logger.info("Starting Sallie Python AI Service...")
        
        # Initialize Sallie Brain
        sallie_brain = SallieBrain()
        await sallie_brain.initialize()
        logger.info("Sallie Brain initialized")
        
        # Initialize Sync Manager
        sync_manager = SyncManager()
        await sync_manager.initialize()
        logger.info("Sync Manager initialized")
        
        logger.info("Sallie Python AI Service started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start service: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global sallie_brain, sync_manager
    
    try:
        if sallie_brain:
            await sallie_brain.cleanup()
        if sync_manager:
            await sync_manager.cleanup()
        logger.info("Sallie Python AI Service shut down")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "python-ai-service",
        "version": "1.0.0",
        "components": {
            "sallie_brain": sallie_brain is not None,
            "sync_manager": sync_manager is not None
        }
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Sallie Python AI Service",
        "status": "running",
        "capabilities": [
            "natural_language_processing",
            "emotional_processing",
            "memory_management",
            "cross_platform_sync"
        ]
    }

# Include main app routes
app.include_router(main_app, prefix="/api", tags=["main"])

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "index:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
