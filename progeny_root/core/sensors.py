"""Environmental monitoring and sensors."""

import time
import psutil
import os
from pathlib import Path
from typing import Dict, Any, Optional

class SensorSystem:
    """
    Provides peripheral awareness of the Creator's environment.
    Monitors system load, battery status, and file activity.
    """
    def __init__(self):
        self.last_scan_time = time.time()
        self._file_cache: Dict[str, float] = {}

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
