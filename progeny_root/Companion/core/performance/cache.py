"""Caching system for performance optimization."""

import time
import logging
from typing import Any, Dict, Optional, Callable
from functools import wraps
from collections import OrderedDict

logger = logging.getLogger("performance.cache")


class LRUCache:
    """
    Least Recently Used (LRU) cache implementation.
    
    Used for caching frequently accessed data like:
    - Limbic state
    - Heritage DNA
    - Device permissions
    """
    
    def __init__(self, max_size: int = 100, ttl: Optional[float] = None):
        """
        Initialize LRU cache.
        
        Args:
            max_size: Maximum number of items to cache
            ttl: Time-to-live in seconds (None = no expiration)
        """
        self.max_size = max_size
        self.ttl = ttl
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.timestamps: Dict[str, float] = {}
        logger.info(f"[Cache] Initialized LRU cache (max_size={max_size}, ttl={ttl})")
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache."""
        if key not in self.cache:
            return None
        
        # Check TTL
        if self.ttl and key in self.timestamps:
            if time.time() - self.timestamps[key] > self.ttl:
                # Expired
                del self.cache[key]
                del self.timestamps[key]
                return None
        
        # Move to end (most recently used)
        self.cache.move_to_end(key)
        return self.cache[key]["value"]
    
    def set(self, key: str, value: Any):
        """Set item in cache."""
        # Remove if exists
        if key in self.cache:
            del self.cache[key]
        
        # Add new item
        self.cache[key] = {"value": value, "timestamp": time.time()}
        self.timestamps[key] = time.time()
        
        # Evict if over max size
        if len(self.cache) > self.max_size:
            # Remove oldest (first item)
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            if oldest_key in self.timestamps:
                del self.timestamps[oldest_key]
    
    def clear(self):
        """Clear all cached items."""
        self.cache.clear()
        self.timestamps.clear()
        logger.info("[Cache] Cache cleared")
    
    def size(self) -> int:
        """Get current cache size."""
        return len(self.cache)
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "ttl": self.ttl,
            "keys": list(self.cache.keys())
        }


def cached(cache: LRUCache, key_func: Optional[Callable] = None, ttl: Optional[float] = None):
    """
    Decorator for caching function results.
    
    Args:
        cache: LRU cache instance
        key_func: Function to generate cache key from args/kwargs
        ttl: Override cache TTL for this function
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"[Cache] Cache hit for {func.__name__}")
                return cached_value
            
            # Compute value
            value = func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, value)
            logger.debug(f"[Cache] Cached result for {func.__name__}")
            
            return value
        return wrapper
    return decorator


# Global cache instances
_limbic_cache = LRUCache(max_size=10, ttl=60.0)  # 1 minute TTL
_heritage_cache = LRUCache(max_size=5, ttl=3600.0)  # 1 hour TTL
_permission_cache = LRUCache(max_size=50, ttl=300.0)  # 5 minutes TTL


def get_limbic_cache() -> LRUCache:
    """Get limbic state cache."""
    return _limbic_cache


def get_heritage_cache() -> LRUCache:
    """Get heritage DNA cache."""
    return _heritage_cache


def get_permission_cache() -> LRUCache:
    """Get permission cache."""
    return _permission_cache

