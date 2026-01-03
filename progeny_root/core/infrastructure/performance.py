"""Performance monitoring and caching for Sallie systems."""

import time
import logging
import threading
from typing import Dict, Any, Optional, Callable
from functools import wraps
from datetime import datetime, timedelta

logger = logging.getLogger("performance")

class PerformanceCache:
    """Simple LRU cache with TTL for performance optimization."""
    
    def __init__(self, max_size: int = 1000, ttl_seconds: int = 300):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.access_times: Dict[str, float] = {}
        self.lock = threading.RLock()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        with self.lock:
            if key not in self.cache:
                return None
            
            entry = self.cache[key]
            current_time = time.time()
            
            # Check if expired
            if current_time - entry['timestamp'] > self.ttl_seconds:
                del self.cache[key]
                if key in self.access_times:
                    del self.access_times[key]
                return None
            
            # Update access time
            self.access_times[key] = current_time
            
            # Evict if over capacity
            if len(self.cache) > self.max_size:
                self._evict_lru()
            
            return entry['value']
    
    def set(self, key: str, value: Any) -> None:
        """Set value in cache."""
        with self.lock:
            current_time = time.time()
            self.cache[key] = {
                'value': value,
                'timestamp': current_time
            }
            self.access_times[key] = current_time
            
            # Evict if over capacity
            if len(self.cache) > self.max_size:
                self._evict_lru()
    
    def _evict_lru(self) -> None:
        """Evict least recently used item."""
        if not self.access_times:
            return
        
        lru_key = min(self.access_times, key=self.access_times.get)
        del self.cache[lru_key]
        del self.access_times[lru_key]
    
    def clear(self) -> None:
        """Clear all cache entries."""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()

# Global cache instances
_limbic_cache = PerformanceCache(max_size=100, ttl_seconds=60)
_memory_cache = PerformanceCache(max_size=500, ttl_seconds=300)
_synthesis_cache = PerformanceCache(max_size=200, ttl_seconds=120)

def get_limbic_cache() -> PerformanceCache:
    """Get the limbic system cache."""
    return _limbic_cache

def get_memory_cache() -> PerformanceCache:
    """Get the memory system cache."""
    return _memory_cache

def get_synthesis_cache() -> PerformanceCache:
    """Get the synthesis system cache."""
    return _synthesis_cache

def performance_monitor(func: Callable) -> Callable:
    """Decorator to monitor function performance."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            end_time = time.time()
            duration = end_time - start_time
            
            if duration > 1.0:  # Log slow functions
                logger.warning(f"Slow function: {func.__name__} took {duration:.2f}s")
            
            return result
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            logger.error(f"Function {func.__name__} failed after {duration:.2f}s: {e}")
            raise
    
    return wrapper

class PerformanceMetrics:
    """Track system performance metrics."""
    
    def __init__(self):
        self.metrics: Dict[str, Any] = {
            'function_calls': {},
            'total_time': {},
            'cache_hits': {},
            'cache_misses': {}
        }
        self.lock = threading.Lock()
    
    def record_function_call(self, func_name: str, duration: float) -> None:
        """Record a function call."""
        with self.lock:
            if func_name not in self.metrics['function_calls']:
                self.metrics['function_calls'][func_name] = 0
                self.metrics['total_time'][func_name] = 0.0
            
            self.metrics['function_calls'][func_name] += 1
            self.metrics['total_time'][func_name] += duration
    
    def record_cache_hit(self, cache_name: str) -> None:
        """Record a cache hit."""
        with self.lock:
            if cache_name not in self.metrics['cache_hits']:
                self.metrics['cache_hits'][cache_name] = 0
            self.metrics['cache_hits'][cache_name] += 1
    
    def record_cache_miss(self, cache_name: str) -> None:
        """Record a cache miss."""
        with self.lock:
            if cache_name not in self.metrics['cache_misses']:
                self.metrics['cache_misses'][cache_name] = 0
            self.metrics['cache_misses'][cache_name] += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get performance statistics."""
        with self.lock:
            stats = {}
            
            for func_name in self.metrics['function_calls']:
                calls = self.metrics['function_calls'][func_name]
                total_time = self.metrics['total_time'][func_name]
                avg_time = total_time / calls if calls > 0 else 0
                stats[func_name] = {
                    'calls': calls,
                    'total_time': total_time,
                    'avg_time': avg_time
                }
            
            for cache_name in self.metrics['cache_hits']:
                hits = self.metrics['cache_hits'][cache_name]
                misses = self.metrics['cache_misses'].get(cache_name, 0)
                total = hits + misses
                hit_rate = hits / total if total > 0 else 0
                stats[f'{cache_name}_cache_hit_rate'] = hit_rate
                stats[f'{cache_name}_cache_total'] = total
            
            return stats

# Global metrics instance
_metrics = PerformanceMetrics()

def get_performance_monitor() -> PerformanceMetrics:
    """Get the global performance monitor."""
    return _metrics
