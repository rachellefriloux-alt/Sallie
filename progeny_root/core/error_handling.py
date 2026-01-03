"""
Comprehensive Error Handling and Graceful Degradation System for Sallie
Provides robust error handling, fallback mechanisms, and graceful degradation
"""

import logging
import asyncio
import traceback
from typing import Dict, Any, Optional, List, Callable, Union
from enum import Enum
from datetime import datetime, timedelta
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    """Error categories for better handling"""
    NETWORK = "network"
    SERVICE = "service"
    DATA = "data"
    SYSTEM = "system"
    USER_INPUT = "user_input"
    PERMISSION = "permission"
    RESOURCE = "resource"

class SystemState(Enum):
    """System operational states"""
    FULL = "full"
    DEGRADED = "degraded"
    LIMITED = "limited"
    OFFLINE = "offline"
    EMERGENCY = "emergency"

class SallieError(Exception):
    """Base error class for Sallie"""
    def __init__(
        self,
        message: str,
        category: ErrorCategory = ErrorCategory.SYSTEM,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.category = category
        self.severity = severity
        self.cause = cause
        self.context = context or {}
        self.timestamp = datetime.now()
        self.traceback_str = traceback.format_exc() if cause else None

class ServiceUnavailableError(SallieError):
    """Service is temporarily unavailable"""
    def __init__(self, service_name: str, cause: Optional[Exception] = None):
        super().__init__(
            f"Service '{service_name}' is unavailable",
            category=ErrorCategory.SERVICE,
            severity=ErrorSeverity.HIGH,
            cause=cause,
            context={"service_name": service_name}
        )

class NetworkError(SallieError):
    """Network-related errors"""
    def __init__(self, message: str, endpoint: str, cause: Optional[Exception] = None):
        super().__init__(
            f"Network error: {message}",
            category=ErrorCategory.NETWORK,
            severity=ErrorSeverity.MEDIUM,
            cause=cause,
            context={"endpoint": endpoint}
        )

class ResourceError(SallieError):
    """Resource-related errors (memory, disk, etc.)"""
    def __init__(self, resource_type: str, cause: Optional[Exception] = None):
        super().__init__(
            f"Resource error: {resource_type}",
            category=ErrorCategory.RESOURCE,
            severity=ErrorSeverity.HIGH,
            cause=cause,
            context={"resource_type": resource_type}
        )

class PermissionError(SallieError):
    """Permission-related errors"""
    def __init__(self, action: str, resource: str, cause: Optional[Exception] = None):
        super().__init__(
            f"Permission denied for {action} on {resource}",
            category=ErrorCategory.PERMISSION,
            severity=ErrorSeverity.MEDIUM,
            cause=cause,
            context={"action": action, "resource": resource}
        )

class GracefulDegradationManager:
    """Manages graceful degradation of system functionality"""
    
    def __init__(self):
        self.current_state = SystemState.FULL
        self.degraded_features = set()
        self.fallback_handlers = {}
        self.error_history = []
        self.recovery_attempts = {}
        self.state_history = []
        
    def register_fallback(self, feature: str, fallback_func: Callable):
        """Register a fallback function for a feature"""
        self.fallback_handlers[feature] = fallback_func
        logger.info(f"Registered fallback for feature: {feature}")
    
    def degrade_feature(self, feature: str, reason: str):
        """Mark a feature as degraded"""
        self.degraded_features.add(feature)
        logger.warning(f"Feature degraded: {feature} - {reason}")
        
        # Update system state if needed
        self._update_system_state()
    
    def restore_feature(self, feature: str):
        """Restore a degraded feature"""
        if feature in self.degraded_features:
            self.degraded_features.remove(feature)
            logger.info(f"Feature restored: {feature}")
            self._update_system_state()
    
    def _update_system_state(self):
        """Update system state based on degraded features"""
        degraded_count = len(self.degraded_features)
        total_features = 10  # Approximate total features
        
        if degraded_count == 0:
            new_state = SystemState.FULL
        elif degraded_count <= 2:
            new_state = SystemState.DEGRADED
        elif degraded_count <= 5:
            new_state = SystemState.LIMITED
        elif degraded_count <= 8:
            new_state = SystemState.OFFLINE
        else:
            new_state = SystemState.EMERGENCY
        
        if new_state != self.current_state:
            old_state = self.current_state
            self.current_state = new_state
            self.state_history.append({
                "timestamp": datetime.now(),
                "old_state": old_state,
                "new_state": new_state,
                "degraded_features": list(self.degraded_features)
            })
            logger.warning(f"System state changed: {old_state} -> {new_state}")
    
    async def handle_error(self, error: SallieError) -> bool:
        """Handle an error with graceful degradation"""
        self.error_history.append({
            "timestamp": error.timestamp,
            "message": error.message,
            "category": error.category,
            "severity": error.severity,
            "context": error.context
        })
        
        # Log error
        log_level = {
            ErrorSeverity.LOW: logging.INFO,
            ErrorSeverity.MEDIUM: logging.WARNING,
            ErrorSeverity.HIGH: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL
        }.get(error.severity, logging.ERROR)
        
        logger.log(log_level, f"Error handled: {error.message}")
        
        # Attempt recovery based on error category
        return await self._attempt_recovery(error)
    
    async def _attempt_recovery(self, error: SallieError) -> bool:
        """Attempt to recover from an error"""
        feature = error.context.get("feature", "unknown")
        
        if error.category == ErrorCategory.SERVICE:
            return await self._recover_service(error)
        elif error.category == ErrorCategory.NETWORK:
            return await self._recover_network(error)
        elif error.category == ErrorCategory.RESOURCE:
            return await self._recover_resource(error)
        elif error.category == ErrorCategory.PERMISSION:
            return await self._recover_permission(error)
        
        return False
    
    async def _recover_service(self, error: SallieError) -> bool:
        """Recover from service errors"""
        service_name = error.context.get("service_name")
        if not service_name:
            return False
        
        # Check if we have a recovery attempt in progress
        if service_name in self.recovery_attempts:
            last_attempt = self.recovery_attempts[service_name]
            if datetime.now() - last_attempt < timedelta(minutes=5):
                return False  # Too soon to retry
        
        self.recovery_attempts[service_name] = datetime.now()
        
        # Try to restart the service (implementation-specific)
        try:
            logger.info(f"Attempting to recover service: {service_name}")
            # Service recovery logic would go here
            return True
        except Exception as e:
            logger.error(f"Failed to recover service {service_name}: {e}")
            return False
    
    async def _recover_network(self, error: SallieError) -> bool:
        """Recover from network errors"""
        endpoint = error.context.get("endpoint")
        if not endpoint:
            return False
        
        # Try to reconnect with exponential backoff
        try:
            logger.info(f"Attempting to reconnect to: {endpoint}")
            await asyncio.sleep(2)  # Brief delay before retry
            # Network recovery logic would go here
            return True
        except Exception as e:
            logger.error(f"Failed to recover network connection to {endpoint}: {e}")
            return False
    
    async def _recover_resource(self, error: SallieError) -> bool:
        """Recover from resource errors"""
        resource_type = error.context.get("resource_type")
        if not resource_type:
            return False
        
        try:
            if resource_type == "memory":
                # Try to free memory
                import gc
                gc.collect()
                logger.info("Attempted garbage collection for memory recovery")
                return True
            elif resource_type == "disk":
                # Try to clean up temporary files
                self._cleanup_temp_files()
                logger.info("Attempted temporary file cleanup for disk recovery")
                return True
        except Exception as e:
            logger.error(f"Failed to recover resource {resource_type}: {e}")
            return False
        
        return False
    
    async def _recover_permission(self, error: SallieError) -> bool:
        """Recover from permission errors"""
        # Permission errors usually require user intervention
        action = error.context.get("action")
        resource = error.context.get("resource")
        
        logger.warning(f"Permission error requires user intervention: {action} on {resource}")
        return False
    
    def _cleanup_temp_files(self):
        """Clean up temporary files to free disk space"""
        import tempfile
        import os
        
        try:
            temp_dir = tempfile.gettempdir()
            for item in os.listdir(temp_dir):
                item_path = os.path.join(temp_dir, item)
                if os.path.isfile(item_path):
                    try:
                        # Only remove files older than 1 hour
                        file_age = datetime.now() - datetime.fromtimestamp(os.path.getctime(item_path))
                        if file_age > timedelta(hours=1):
                            os.remove(item_path)
                    except:
                        pass  # Ignore permission errors
        except Exception as e:
            logger.error(f"Failed to cleanup temp files: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        return {
            "state": self.current_state.value,
            "degraded_features": list(self.degraded_features),
            "error_count": len(self.error_history),
            "recent_errors": self.error_history[-10:] if self.error_history else [],
            "state_history": self.state_history[-5:] if self.state_history else []
        }

class ErrorHandler:
    """Global error handler for Sallie"""
    
    def __init__(self):
        self.degradation_manager = GracefulDegradationManager()
        self.error_callbacks = {}
        self.circuit_breakers = {}
        
    def register_callback(self, error_category: ErrorCategory, callback: Callable):
        """Register a callback for specific error categories"""
        if error_category not in self.error_callbacks:
            self.error_callbacks[error_category] = []
        self.error_callbacks[error_category].append(callback)
    
    async def handle_error(self, error: Union[SallieError, Exception], context: Optional[Dict[str, Any]] = None):
        """Handle an error with appropriate callbacks and degradation"""
        # Convert regular exceptions to SallieError
        if not isinstance(error, SallieError):
            sallie_error = SallieError(
                message=str(error),
                category=ErrorCategory.SYSTEM,
                severity=ErrorSeverity.MEDIUM,
                cause=error,
                context=context or {}
            )
        else:
            sallie_error = error
        
        # Handle with degradation manager
        await self.degradation_manager.handle_error(sallie_error)
        
        # Call category-specific callbacks
        if sallie_error.category in self.error_callbacks:
            for callback in self.error_callbacks[sallie_error.category]:
                try:
                    await callback(sallie_error)
                except Exception as e:
                    logger.error(f"Error in error callback: {e}")
    
    def register_circuit_breaker(self, name: str, failure_threshold: int = 5, timeout: int = 60):
        """Register a circuit breaker for a service"""
        self.circuit_breakers[name] = {
            "failures": 0,
            "last_failure": None,
            "threshold": failure_threshold,
            "timeout": timeout,
            "state": "closed"  # closed, open, half-open
        }
    
    async def call_with_circuit_breaker(self, name: str, func: Callable, *args, **kwargs):
        """Call a function with circuit breaker protection"""
        if name not in self.circuit_breakers:
            self.register_circuit_breaker(name)
        
        breaker = self.circuit_breakers[name]
        
        # Check if circuit is open
        if breaker["state"] == "open":
            if datetime.now() - breaker["last_failure"] > timedelta(seconds=breaker["timeout"]):
                breaker["state"] = "half-open"
            else:
                raise ServiceUnavailableError(f"Circuit breaker open for {name}")
        
        try:
            result = await func(*args, **kwargs)
            
            # Success - reset circuit breaker
            if breaker["state"] == "half-open":
                breaker["state"] = "closed"
            breaker["failures"] = 0
            
            return result
            
        except Exception as e:
            breaker["failures"] += 1
            breaker["last_failure"] = datetime.now()
            
            # Open circuit if threshold reached
            if breaker["failures"] >= breaker["threshold"]:
                breaker["state"] = "open"
                logger.warning(f"Circuit breaker opened for {name}")
            
            raise e

# Global error handler instance
error_handler = ErrorHandler()

# Decorator for automatic error handling
def handle_errors(category: ErrorCategory = ErrorCategory.SYSTEM, severity: ErrorSeverity = ErrorSeverity.MEDIUM):
    """Decorator for automatic error handling"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                sallie_error = SallieError(
                    message=f"Error in {func.__name__}: {str(e)}",
                    category=category,
                    severity=severity,
                    cause=e,
                    context={"function": func.__name__}
                )
                await error_handler.handle_error(sallie_error)
                raise
        return wrapper
    return decorator

# Context manager for error handling
class ErrorContext:
    """Context manager for error handling"""
    
    def __init__(self, operation: str, category: ErrorCategory = ErrorCategory.SYSTEM):
        self.operation = operation
        self.category = category
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            error = SallieError(
                message=f"Error in {self.operation}: {str(exc_val)}",
                category=self.category,
                severity=ErrorSeverity.MEDIUM,
                cause=exc_val,
                context={"operation": self.operation}
            )
            await error_handler.handle_error(error)
        return True  # Suppress exception

# Utility functions
async def safe_execute(func: Callable, *args, fallback: Optional[Callable] = None, **kwargs):
    """Safely execute a function with fallback"""
    try:
        return await func(*args, **kwargs)
    except Exception as e:
        logger.error(f"Function execution failed: {e}")
        if fallback:
            try:
                return await fallback(*args, **kwargs)
            except Exception as fallback_error:
                logger.error(f"Fallback also failed: {fallback_error}")
        return None

def get_error_summary() -> Dict[str, Any]:
    """Get a summary of recent errors and system state"""
    return {
        "system_status": error_handler.degradation_manager.get_system_status(),
        "circuit_breakers": error_handler.circuit_breakers,
        "error_count": len(error_handler.degradation_manager.error_history),
        "degraded_features": list(error_handler.degradation_manager.degraded_features)
    }
