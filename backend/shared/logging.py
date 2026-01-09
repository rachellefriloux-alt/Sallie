"""
Shared logging configuration and utilities
"""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Optional
from .config import settings, LOGGING_CONFIG

def setup_logging(service_name: Optional[str] = None):
    """Setup logging configuration for a service"""
    # Update service name in logging config
    config = LOGGING_CONFIG.copy()
    if service_name:
        config["handlers"]["file"]["filename"] = f"{service_name}.log"
    
    # Apply configuration
    logging.config.dictConfig(config)
    
    # Get logger
    logger = logging.getLogger(service_name or __name__)
    
    logger.info(f"Logging configured for {service_name or 'default service'}")
    return logger

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(name)

class StructuredLogger:
    """Structured logger for consistent log formatting"""
    
    def __init__(self, service_name: str):
        self.logger = get_logger(service_name)
        self.service_name = service_name
    
    def log_request(self, method: str, path: str, status_code: int, duration: float, user_id: Optional[str] = None):
        """Log HTTP request"""
        self.logger.info(
            "HTTP Request",
            extra={
                "event_type": "http_request",
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration_ms": duration * 1000,
                "user_id": user_id,
                "service": self.service_name
            }
        )
    
    def log_error(self, error: Exception, context: Optional[dict] = None):
        """Log error with context"""
        self.logger.error(
            f"Error: {str(error)}",
            extra={
                "event_type": "error",
                "error_type": type(error).__name__,
                "error_message": str(error),
                "context": context or {},
                "service": self.service_name
            },
            exc_info=True
        )
    
    def log_limbic_update(self, user_id: str, changes: dict):
        """Log limbic state changes"""
        self.logger.info(
            "Limbic State Updated",
            extra={
                "event_type": "limbic_update",
                "user_id": user_id,
                "changes": changes,
                "service": self.service_name
            }
        )
    
    def log_trust_change(self, user_id: str, old_tier: int, new_tier: int, reason: str):
        """Log trust tier changes"""
        self.logger.info(
            "Trust Tier Changed",
            extra={
                "event_type": "trust_change",
                "user_id": user_id,
                "old_tier": old_tier,
                "new_tier": new_tier,
                "reason": reason,
                "service": self.service_name
            }
        )
    
    def log_agency_action(self, user_id: str, action: str, tool: str, outcome: str):
        """Log agency actions"""
        self.logger.info(
            "Agency Action",
            extra={
                "event_type": "agency_action",
                "user_id": user_id,
                "action": action,
                "tool": tool,
                "outcome": outcome,
                "service": self.service_name
            }
        )
    
    def log_memory_operation(self, user_id: str, operation: str, memory_type: str, count: int = 1):
        """Log memory operations"""
        self.logger.info(
            "Memory Operation",
            extra={
                "event_type": "memory_operation",
                "user_id": user_id,
                "operation": operation,
                "memory_type": memory_type,
                "count": count,
                "service": self.service_name
            }
        )

# Performance monitoring decorator
def log_performance(logger: StructuredLogger):
    """Decorator to log function performance"""
    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                logger.logger.info(
                    f"Function {func.__name__} completed",
                    extra={
                        "event_type": "performance",
                        "function": func.__name__,
                        "duration_ms": duration * 1000,
                        "success": True,
                        "service": logger.service_name
                    }
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.log_error(e, {
                    "function": func.__name__,
                    "duration_ms": duration * 1000
                })
                raise
        
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                logger.logger.info(
                    f"Function {func.__name__} completed",
                    extra={
                        "event_type": "performance",
                        "function": func.__name__,
                        "duration_ms": duration * 1000,
                        "success": True,
                        "service": logger.service_name
                    }
                )
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.log_error(e, {
                    "function": func.__name__,
                    "duration_ms": duration * 1000
                })
                raise
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

# Import needed modules
import time
import asyncio
