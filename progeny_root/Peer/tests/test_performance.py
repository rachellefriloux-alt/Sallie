"""Tests for performance optimization modules."""

import pytest
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.performance.cache import LRUCache, cached, get_limbic_cache
from core.performance.batch_processor import BatchProcessor, MemoryWriteBatcher
from core.performance.monitor import PerformanceMonitor, get_performance_monitor


class TestLRUCache:
    """Tests for LRU cache."""
    
    def test_cache_basic(self):
        """Test basic cache operations."""
        cache = LRUCache(max_size=3)
        
        cache.set("key1", "value1")
        assert cache.get("key1") == "value1"
        
        cache.set("key2", "value2")
        cache.set("key3", "value3")
        
        assert cache.size() == 3
    
    def test_cache_eviction(self):
        """Test LRU eviction."""
        cache = LRUCache(max_size=2)
        
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        cache.set("key3", "value3")  # Should evict key1
        
        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"
        assert cache.get("key3") == "value3"
    
    def test_cache_ttl(self):
        """Test TTL expiration."""
        cache = LRUCache(max_size=10, ttl=0.1)  # 100ms TTL
        
        cache.set("key1", "value1")
        assert cache.get("key1") == "value1"
        
        time.sleep(0.15)  # Wait for expiration
        assert cache.get("key1") is None
    
    def test_cache_decorator(self):
        """Test cache decorator."""
        cache = LRUCache(max_size=10)
        
        call_count = 0
        
        @cached(cache)
        def expensive_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2
        
        result1 = expensive_function(5)
        assert result1 == 10
        assert call_count == 1
        
        result2 = expensive_function(5)  # Should use cache
        assert result2 == 10
        assert call_count == 1  # Not called again


class TestBatchProcessor:
    """Tests for batch processor."""
    
    def test_batch_processor(self):
        """Test batch processing."""
        processed_items = []
        
        def processor(batch):
            processed_items.extend([item["item"] for item in batch])
        
        batcher = BatchProcessor(batch_size=3, processor=processor)
        
        batcher.add("item1")
        batcher.add("item2")
        batcher.add("item3")  # Should trigger flush
        
        assert len(processed_items) == 3
        assert "item1" in processed_items
    
    def test_manual_flush(self):
        """Test manual flush."""
        processed_items = []
        
        def processor(batch):
            processed_items.extend([item["item"] for item in batch])
        
        batcher = BatchProcessor(batch_size=10, processor=processor)
        
        batcher.add("item1")
        batcher.add("item2")
        
        assert len(processed_items) == 0
        
        batcher.flush()
        assert len(processed_items) == 2


class TestPerformanceMonitor:
    """Tests for performance monitor."""
    
    def test_timer(self):
        """Test timer functionality."""
        monitor = PerformanceMonitor()
        
        timer_id = monitor.start_timer("test_operation")
        time.sleep(0.01)  # 10ms
        monitor.end_timer(timer_id)
        
        stats = monitor.get_stats("test_operation")
        assert stats["count"] == 1
        assert stats["min"] > 0
        assert stats["max"] > 0
    
    def test_metrics(self):
        """Test metric recording."""
        monitor = PerformanceMonitor()
        
        monitor.record_metric("response_time", 0.1)
        monitor.record_metric("response_time", 0.2)
        monitor.record_metric("response_time", 0.3)
        
        stats = monitor.get_stats("response_time")
        assert stats["count"] == 3
        assert stats["min"] == 0.1
        assert stats["max"] == 0.3
        assert stats["mean"] == 0.2
    
    def test_counters(self):
        """Test counter functionality."""
        monitor = PerformanceMonitor()
        
        monitor.increment_counter("requests")
        monitor.increment_counter("requests", 2)
        
        counters = monitor.get_counters()
        assert counters["requests"] == 3
    
    def test_export_report(self, tmp_path):
        """Test report export."""
        monitor = PerformanceMonitor()
        monitor.record_metric("test_metric", 1.0)
        monitor.increment_counter("test_counter")
        
        report_path = tmp_path / "report.json"
        report = monitor.export_report(report_path)
        
        assert "timestamp" in report
        assert "metrics" in report
        assert "counters" in report
        assert report_path.exists()


class TestGlobalInstances:
    """Tests for global cache and monitor instances."""
    
    def test_limbic_cache(self):
        """Test global limbic cache."""
        cache = get_limbic_cache()
        assert cache is not None
        assert isinstance(cache, LRUCache)
    
    def test_performance_monitor(self):
        """Test global performance monitor."""
        monitor = get_performance_monitor()
        assert monitor is not None
        assert isinstance(monitor, PerformanceMonitor)

