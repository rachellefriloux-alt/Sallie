"""
Sallie Backend - Azure Web App Entry Point
Simplified version for Azure deployment
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import logging

# Add server directory to path
sys.path.insert(0, str(Path(__file__).parent / "server"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Sallie Backend API - Azure",
    description="The Great Convergence - Azure Deployment",
    version="5.4.1"
)

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Sallie Backend - Azure",
        "version": "5.4.1",
        "timestamp": datetime.now().isoformat(),
        "environment": "Azure Web App"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "ready",
            "websocket": "ready",
            "convergence": "ready"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
