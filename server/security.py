"""
Security module for Sallie Studio WebSocket endpoints
Handles authentication and authorization for WebSocket connections

Canonical Spec Reference: Section 8.0 - Security & Privacy
"""

from fastapi import WebSocket, HTTPException, status
from typing import Optional
import jwt
import logging
import os
import sys
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Canonical Spec Section 8.0: No secrets in code (use environment variables)
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

# Validate required environment variables on import
if not JWT_SECRET:
    logger.error("CRITICAL: JWT_SECRET environment variable is not set!")
    logger.error("Please set JWT_SECRET in your .env file")
    logger.error("Generate a secure key with: python -c \"import secrets; print(secrets.token_hex(32))\"")
    sys.exit(1)

if JWT_SECRET == "your-super-secret-jwt-key-change-this-in-production":
    logger.warning("WARNING: Using default JWT_SECRET! This is insecure for production.")
    logger.warning("Please generate a secure key and update your .env file")

async def get_current_user_websocket(websocket: WebSocket) -> Optional[str]:
    """
    Authenticate WebSocket connection and get current user
    For demo purposes, we'll use a simple token-based auth
    In production, implement proper authentication
    """
    try:
        # Get token from query params or headers
        token = None
        
        # Check query params
        if "token" in websocket.query_params:
            token = websocket.query_params["token"]
        
        # Check headers
        elif "authorization" in websocket.headers:
            auth_header = websocket.headers["authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
        
        # For demo, allow anonymous connections with user_id
        if not token and "user_id" in websocket.query_params:
            return websocket.query_params["user_id"]
        
        # If no token, allow anonymous for demo
        if not token:
            return "anonymous_user"
        
        # Verify JWT token
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("sub")
            
            if not user_id:
                logger.warning("Invalid token payload")
                return None
            
            return user_id
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
    
    except Exception as e:
        logger.error(f"Error authenticating WebSocket: {e}")
        return None

def create_websocket_token(user_id: str, expires_in: timedelta = timedelta(hours=24)) -> str:
    """
    Create a JWT token for WebSocket authentication
    """
    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + expires_in,
        "type": "websocket"
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_websocket_token(token: str) -> Optional[str]:
    """
    Verify a WebSocket token and return user_id
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None
