"""
Sallie API Gateway
Main entry point for all backend services
"""

import asyncio
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import httpx

# Add shared modules to path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from shared.config import settings
from shared.logging import setup_logging, StructuredLogger
from shared.models import (
    APIResponse, ErrorResponse, HealthCheck, UserToken,
    LimbicState, LimbicResponse, MemoryResponse, AgencyResponse
)
from middleware.auth import auth_middleware, get_current_user
from middleware.rate_limit import rate_limit_middleware
from routes import auth, limbic, memory, agency, communication

# Setup logging
logger = setup_logging("api-gateway")
structured_logger = StructuredLogger("api-gateway")

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Counter('active_connections', 'Active connections')

# Service registry
SERVICE_URLS = {
    "auth": f"http://localhost:{settings.PORT + 1}",
    "limbic": f"http://localhost:{settings.PORT + 2}",
    "memory": f"http://localhost:{settings.PORT + 3}",
    "agency": f"http://localhost:{settings.PORT + 4}",
    "communication": f"http://localhost:{settings.PORT + 5}",
    "sensor": f"http://localhost:{settings.PORT + 6}",
}

# HTTP client for service communication
http_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global http_client
    
    # Startup
    logger.info("Starting Sallie API Gateway...")
    
    # Initialize HTTP client
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(30.0),
        limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
    )
    
    # Health check for services
    await health_check_services()
    
    logger.info("API Gateway started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down API Gateway...")
    if http_client:
        await http_client.aclose()
    logger.info("API Gateway shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Sallie API Gateway",
    description="Gateway for Sallie Backend Services",
    version=settings.SERVICE_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware for logging and metrics
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Middleware for request logging and metrics"""
    start_time = time.time()
    
    # Increment active connections
    ACTIVE_CONNECTIONS.inc()
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log request
        structured_logger.log_request(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration=duration
        )
        
        # Update metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        REQUEST_DURATION.observe(duration)
        
        return response
        
    except Exception as e:
        duration = time.time() - start_time
        structured_logger.log_error(e, {
            "method": request.method,
            "path": request.url.path,
            "duration": duration
        })
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=500
        ).inc()
        
        raise
    finally:
        # Decrement active connections
        ACTIVE_CONNECTIONS.dec()

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Authentication middleware for protected routes
app.middleware("http")(auth_middleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(limbic.router, prefix="/api/limbic", tags=["limbic"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(agency.router, prefix="/api/agency", tags=["agency"])
app.include_router(communication.router, prefix="/api/communication", tags=["communication"])

# Health endpoints
@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    return HealthCheck(
        status="healthy",
        version=settings.SERVICE_VERSION,
        services={name: "unknown" for name in SERVICE_URLS.keys()},
        uptime_seconds=time.time()
    )

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

async def health_check_services():
    """Check health of all services"""
    service_status = {}
    
    for service_name, url in SERVICE_URLS.items():
        try:
            response = await http_client.get(f"{url}/health", timeout=5.0)
            service_status[service_name] = "healthy" if response.status_code == 200 else "unhealthy"
        except Exception as e:
            logger.warning(f"Service {service_name} health check failed: {e}")
            service_status[service_name] = "unreachable"
    
    return service_status

async def proxy_request(service_name: str, path: str, method: str, headers: Dict[str, str] = None, data: Dict[str, Any] = None):
    """Proxy request to a service"""
    service_url = SERVICE_URLS.get(service_name)
    if not service_url:
        raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
    
    url = f"{service_url}{path}"
    
    try:
        if method.upper() == "GET":
            response = await http_client.get(url, headers=headers)
        elif method.upper() == "POST":
            response = await http_client.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = await http_client.put(url, json=data, headers=headers)
        elif method.upper() == "DELETE":
            response = await http_client.delete(url, headers=headers)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
        
        return response
        
    except httpx.RequestError as e:
        logger.error(f"Request to {service_name} failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            error_code=f"HTTP_{exc.status_code}"
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    structured_logger.log_error(exc, {"path": request.url.path})
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            error_code="INTERNAL_ERROR"
        ).dict()
    )

# Root endpoint
@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint"""
    return APIResponse(
        success=True,
        data={
            "service": "Sallie API Gateway",
            "version": settings.SERVICE_VERSION,
            "status": "running"
        }
    )

# Service discovery endpoint
@app.get("/api/services", response_model=APIResponse)
async def get_services():
    """Get list of available services"""
    return APIResponse(
        success=True,
        data={
            "services": list(SERVICE_URLS.keys()),
            "urls": SERVICE_URLS
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "index:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
