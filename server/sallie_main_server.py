"""
Sallie Main Server - Production Entry Point
Orchestrates all backend services for The Great Convergence
No coding knowledge required - just run this file!

Canonical Spec Reference: v5.4.1 Complete Implementation
"""

import asyncio
import logging
import sys
import os
from pathlib import Path
from datetime import datetime
import signal

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sallie_server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Validate environment
def validate_environment():
    """Validate that all required environment variables are set"""
    logger.info("Validating environment configuration...")
    
    required_vars = {
        'JWT_SECRET': 'JWT secret for authentication'
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            missing_vars.append(f"  - {var}: {description}")
        elif value == "your-super-secret-jwt-key-change-this-in-production":
            logger.warning(f"WARNING: {var} is using default value - please change it!")
    
    if missing_vars:
        logger.error("ERROR: Missing required environment variables:")
        for var in missing_vars:
            logger.error(var)
        logger.error("\nPlease create a .env file with these variables.")
        logger.error("See .env.example for a template.")
        return False
    
    logger.info("SUCCESS: Environment configuration validated!")
    return True

# Create necessary directories
def setup_directories():
    """Create necessary data directories"""
    logger.info("Setting up data directories...")
    
    directories = [
        'data/heritage',
        'data/dream_cycle',
        'data/working',
        'data/archive',
        'audio_cache',
        'logs'
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    
    logger.info("SUCCESS: Data directories ready!")

# Banner
def print_banner():
    """Print welcome banner"""
    banner = """
    ================================================================
    |                                                              |
    |         *  SALLIE - Your Cognitive Partner  *               |
    |                                                              |
    |       The Great Convergence - 30 Questions                  |
    |       Canonical Specification v5.4.1                       |
    |                                                              |
    ================================================================
    """
    print(banner)
    logger.info("Sallie Server Starting...")
    logger.info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

async def main():
    """Main server entry point"""
    print_banner()
    
    # Validate environment
    if not validate_environment():
        logger.error("❌ Environment validation failed. Server cannot start.")
        logger.error("Please run START_SALLIE.bat to set up automatically.")
        sys.exit(1)
    
    # Setup directories
    setup_directories()
    
    # Import FastAPI components
    logger.info("Loading server components...")
    try:
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        import uvicorn
        
        # Import our endpoints
        from premium_websocket_endpoints import premium_ws_router
        
        logger.info("✅ Server components loaded!")
    except ImportError as e:
        logger.error(f"❌ Failed to import required packages: {e}")
        logger.error("Please install dependencies: pip install -r ../backend/requirements.txt")
        sys.exit(1)
    
    # Create FastAPI app
    app = FastAPI(
        title="Sallie Backend API",
        description="The Great Convergence - 30-Question Psychological Excavation System",
        version="5.4.1"
    )
    
    # Configure CORS
    cors_origin = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[cors_origin, "http://localhost:3000", "http://localhost:3001"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(premium_ws_router)
    
    # Health check endpoint
    @app.get("/")
    async def root():
        return {
            "status": "running",
            "service": "Sallie Backend",
            "version": "5.4.1",
            "message": "Welcome to The Great Convergence"
        }
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "websocket": "ready",
                "convergence": "ready",
                "heritage_dna": "ready"
            }
        }
    
    # Startup message
    logger.info("=" * 60)
    logger.info("🚀 SALLIE BACKEND SERVER READY!")
    logger.info("=" * 60)
    logger.info("📡 WebSocket Server: ws://localhost:8742")
    logger.info("🌐 Web Interface: http://localhost:3000")
    logger.info("📊 API Docs: http://localhost:8742/docs")
    logger.info("❤️  Health Check: http://localhost:8742/health")
    logger.info("=" * 60)
    logger.info("✨ The Great Convergence awaits...")
    logger.info("=" * 60)
    
    # Graceful shutdown handler
    def signal_handler(sig, frame):
        logger.info("\n🛑 Shutting down Sallie server gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run server
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8742,
        log_level="info",
        access_log=True
    )
    server = uvicorn.Server(config)
    
    try:
        await server.serve()
    except Exception as e:
        logger.error(f"ERROR: Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\nSallie server stopped by user")
    except Exception as e:
        logger.error(f"FATAL ERROR: {e}")
        sys.exit(1)
