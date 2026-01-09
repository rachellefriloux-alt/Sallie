from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import time
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

MODEL_REQUESTS = Counter(
    'model_requests_total',
    'Total model requests',
    ['model', 'request_type', 'status']
)

MODEL_RESPONSE_TIME = Histogram(
    'model_response_time_seconds',
    'Model response time in seconds',
    ['model', 'request_type']
)

class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to collect Prometheus metrics"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Increment active connections
        ACTIVE_CONNECTIONS.inc()
        
        try:
            response = await call_next(request)
            
            # Record request metrics
            method = request.method
            endpoint = request.url.path
            status_code = str(response.status_code)
            
            REQUEST_COUNT.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            duration = time.time() - start_time
            REQUEST_DURATION.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
            
            return response
            
        except Exception as e:
            # Record error metrics
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code="500"
            ).inc()
            
            raise e
        finally:
            # Decrement active connections
            ACTIVE_CONNECTIONS.dec()
    
    @staticmethod
    def record_model_request(model: str, request_type: str, status: str, duration: float):
        """Record model-specific metrics"""
        MODEL_REQUESTS.labels(
            model=model,
            request_type=request_type,
            status=status
        ).inc()
        
        MODEL_RESPONSE_TIME.labels(
            model=model,
            request_type=request_type
        ).observe(duration)

# Function to get metrics endpoint
async def metrics_endpoint():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Decorator for recording model metrics
def record_model_metrics(model: str, request_type: str):
    """Decorator to automatically record model metrics"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"
            
            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status = "error"
                logger.error(f"Model request failed: {e}")
                raise
            finally:
                duration = time.time() - start_time
                MetricsMiddleware.record_model_request(model, request_type, status, duration)
        
        return wrapper
    return decorator
