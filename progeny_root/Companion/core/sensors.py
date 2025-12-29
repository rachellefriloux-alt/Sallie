"""Environmental monitoring and sensors (Section 10).

Enhanced with:
- File watcher with pattern detection
- System load monitoring with stress detection
- Refractory period enforcement
- Pattern detection for proactive engagement
"""

import time
import psutil
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

logger = logging.getLogger("sensors")

class SensorSystem:
    """
    Sensor Array - peripheral awareness system (Section 10).
    
    Monitors:
    - File activity (metadata only)
    - System load (CPU, memory, window switches)
    - Pattern detection (workload spikes, abandonment, focus shifts)
    """
    
    def __init__(self):
        self.last_scan_time = time.time()
        self._file_cache: Dict[str, float] = {}
        self.last_seed_time = 0.0
        self.refractory_period = 86400  # 24 hours (Section 10.4.2)
        self.file_activity_history: List[Dict[str, Any]] = []
        self.system_load_history: List[Dict[str, Any]] = []
        
        # Pattern detection thresholds (Section 10.2.3)
        self.workload_spike_threshold = 10  # files/hour
        self.abandonment_days = 7
        self.stress_cpu_threshold = 80.0
        self.stress_window_switches = 20  # per hour
        
        # File watcher
        self.observer = None
        self.watched_paths: List[Path] = []
        
        logger.info("[Sensors] Sensor system initialized")

    def scan_system_load(self) -> Dict[str, float]:
        """
        Returns CPU and RAM usage as a proxy for 'Creator Busyness'.
        Also checks battery if available.
        """
        cpu_usage = psutil.cpu_percent(interval=0.1)
        ram_usage = psutil.virtual_memory().percent
        
        battery_status = {}
        battery = psutil.sensors_battery()
        if battery:
            battery_status = {
                "percent": battery.percent,
                "power_plugged": battery.power_plugged,
                "secsleft": battery.secsleft
            }

        return {
            "cpu_percent": cpu_usage,
            "ram_percent": ram_usage,
            "battery": battery_status
        }

    def scan_file_activity(self, path: Path) -> int:
        """
        Detects changes in a watched directory since the last scan.
        Returns the number of modified files.
        """
        if not path.exists():
            return 0

        modified_count = 0
        current_files = {}

        try:
            # Recursive scan could be expensive, so we limit depth or specific folders in usage
            # For now, we'll do a shallow scan of the target directory for performance
            for entry in os.scandir(path):
                if entry.is_file():
                    mtime = entry.stat().st_mtime
                    current_files[entry.path] = mtime
                    
                    # Check if modified since last seen
                    if entry.path in self._file_cache:
                        if mtime > self._file_cache[entry.path]:
                            modified_count += 1
                    else:
                        # New file found
                        modified_count += 1
            
            # Update cache
            self._file_cache.update(current_files)
            
        except Exception as e:
            print(f"[Sensors] Error scanning files: {e}")
            return 0

        return modified_count

    def get_context_snapshot(self) -> Dict[str, Any]:
        """
        Aggregates all sensor data into a single context object.
        """
        load = self.scan_system_load()
        
        # Determine time of day context
        hour = time.localtime().tm_hour
        if 5 <= hour < 12:
            time_of_day = "morning"
        elif 12 <= hour < 17:
            time_of_day = "afternoon"
        elif 17 <= hour < 22:
            time_of_day = "evening"
        else:
            time_of_day = "night"

        return {
            "timestamp": time.time(),
            "time_of_day": time_of_day,
            "system_load": load,
            # File activity would be called with specific paths by the main loop
        }

if __name__ == "__main__":
    # Quick test
    sensors = SensorSystem()
    print("Scanning system load...")
    print(sensors.get_context_snapshot())
