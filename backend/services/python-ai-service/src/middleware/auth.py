from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..core.security import verify_token, verify_api_key
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def AuthMiddleware(request: Request, call_next):
    """Authentication middleware for API requests"""
    try:
        # Skip authentication for health endpoints
        if request.url.path.startswith("/health") or request.url.path.startswith("/metrics"):
            return await call_next(request)
        
        # Check for API key in headers
        api_key = request.headers.get("X-API-Key")
        if api_key:
            try:
                payload = verify_api_key(api_key)
                request.state.user = {"id": payload["sub"], "api_key": True}
                return await call_next(request)
            except Exception as e:
                logger.warning(f"Invalid API key: {e}")
                pass
        
        # Check for JWT token
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            try:
                token = authorization.split(" ")[1]
                payload = verify_token(token)
                request.state.user = {"id": payload["sub"], "email": payload.get("email")}
                return await call_next(request)
            except Exception as e:
                logger.warning(f"Invalid JWT token: {e}")
                pass
        
        # No authentication found
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication middleware error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error"
        )

class OptionalAuth:
    """Optional authentication for endpoints that can work without auth"""
    
    def __init__(self, auto_error: bool = False):
        self.auto_error = auto_error
        self.security = HTTPBearer(auto_error=auto_error)
    
    async def __call__(self, request: Request):
        try:
            # Check for API key
            api_key = request.headers.get("X-API-Key")
            if api_key:
                try:
                    payload = verify_api_key(api_key)
                    return {"id": payload["sub"], "api_key": True}
                except Exception:
                    pass
            
            # Check for JWT token
            authorization = request.headers.get("Authorization")
            if authorization and authorization.startswith("Bearer "):
                try:
                    token = authorization.split(" ")[1]
                    payload = verify_token(token)
                    return {"id": payload["sub"], "email": payload.get("email")}
                except Exception:
                    pass
            
            # No authentication found
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            return None
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Optional authentication error: {e}")
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Authentication error"
                )
            return None

optional_auth = OptionalAuth(auto_error=False)
