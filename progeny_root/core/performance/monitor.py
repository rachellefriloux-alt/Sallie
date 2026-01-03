"""Performance monitoring and metrics collection."""

import time
import logging
from typing import Dict, Any, List, Optional
from collections import defaultdict
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("performance.monitor")


class PerformanceMonitor:
    """
    Performance monitoring system.
    
    Tracks:
    - API response times
    - Database query times
    - Cache hit rates
    - Memory usage
    - Error rates
    """
    
    def __init__(self):
        """Initialize performance monitor."""
        self.metrics: Dict[str, List[float]] = defaultdict(list)
        self.counters: Dict[str, int] = defaultdict(int)
        self.start_times: Dict[str, float] = {}
        self.max_metrics = 1000  # Keep last 1000 measurements
        
        logger.info("[PerformanceMonitor] Initialized")
    
    def start_timer(self, operation: str) -> str:
        """
        Start timing an operation.
        
        Args:
            operation: Operation name
            
        Returns:
            Timer ID
        """
        timer_id = f"{operation}_{time.time()}_{id(self)}"
        # Store both operation name and start time to avoid relying on string parsing.
        self.start_times[timer_id] = (operation, time.time())
        return timer_id
    
    def end_timer(self, timer_id: str):
        """
        End timing an operation.
        
        Args:
            timer_id: Timer ID from start_timer
        """
        if timer_id not in self.start_times:
            logger.warning(f"[PerformanceMonitor] Timer {timer_id} not found")
            return
        
        operation, started_at = self.start_times[timer_id]
        duration = time.time() - started_at
        
        self.record_metric(operation, duration)
        del self.start_times[timer_id]
    
    def record_metric(self, name: str, value: float):
        """
        Record a metric value.
        
        Args:
            name: Metric name
            value: Metric value
        """
        self.metrics[name].append(value)
        
        # Limit metrics history
        if len(self.metrics[name]) > self.max_metrics:
            self.metrics[name] = self.metrics[name][-self.max_metrics:]
    
    def increment_counter(self, name: str, value: int = 1):
        """
        Increment a counter.
        
        Args:
            name: Counter name
            value: Increment amount
        """
        self.counters[name] += value
    
    def get_stats(self, metric_name: str) -> Dict[str, float]:
        """Get statistics for a metric, returning defaults when absent."""
        if metric_name not in self.metrics or not self.metrics[metric_name]:
            return {"count": 0, "min": 0.0, "max": 0.0, "mean": 0.0, "median": 0.0, "p95": 0.0, "p99": 0.0, "latest": 0.0}

        values = sorted(self.metrics[metric_name])
        n = len(values)
        mean = round(sum(values) / n, 3)

        return {
            "count": n,
            "min": values[0],
            "max": values[-1],
            "mean": mean,
            "median": values[n // 2],
            "p95": values[int(n * 0.95)] if n > 0 else 0,
            "p99": values[int(n * 0.99)] if n > 0 else 0,
            "latest": values[-1]
        }
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get statistics for all metrics."""
        return {
            name: self.get_stats(name)
            for name in self.metrics.keys()
        }
    
    def get_counters(self) -> Dict[str, int]:
        """Get all counter values."""
        return dict(self.counters)
    
    def reset(self):
        """Reset all metrics and counters."""
        self.metrics.clear()
        self.counters.clear()
        self.start_times.clear()
        logger.info("[PerformanceMonitor] Reset all metrics")
    
    def export_report(self, file_path: Optional[Path] = None) -> Dict[str, Any]:
        """
        Export performance report.
        
        Args:
            file_path: Optional path to save report
            
        Returns:
            Report dictionary
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "metrics": self.get_all_stats(),
            "counters": self.get_counters(),
            "summary": self._generate_summary()
        }
        
        if file_path:
            import json
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w") as f:
                json.dump(report, f, indent=2)
            logger.info(f"[PerformanceMonitor] Exported report to {file_path}")
        
        return report
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate performance summary."""
        summary = {
            "total_metrics": len(self.metrics),
            "total_counters": len(self.counters),
            "active_timers": len(self.start_times)
        }
        
        # Find slowest operations
        slowest = []
        for name, stats in self.get_all_stats().items():
            if stats.get("p95", 0) > 1.0:  # Operations taking >1s
                slowest.append({
                    "operation": name,
                    "p95": stats.get("p95", 0),
                    "p99": stats.get("p99", 0)
                })
        
        slowest.sort(key=lambda x: x["p95"], reverse=True)
        summary["slowest_operations"] = slowest[:10]  # Top 10
        
        return summary


# Global performance monitor instance
_performance_monitor = PerformanceMonitor()


def get_performance_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance."""
    return _performance_monitor

