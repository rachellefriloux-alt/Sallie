# Sensor Array System for Sallie
# Environmental monitoring and contextual awareness

import asyncio
import json
import time
import os
from typing import Dict, Any, Optional, List, Callable
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

class SensorType(Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    LIGHT = "light"
    SOUND = "sound"
    MOTION = "motion"
    AIR_QUALITY = "air_quality"
    PRESENCE = "presence"
    BIOMETRIC = "biometric"

class SensorStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    CALIBRATING = "calibrating"

@dataclass
class SensorReading:
    sensor_id: str
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: float
    location: str
    quality: float  # 0-1 data quality score
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Sensor:
    id: str
    name: str
    sensor_type: SensorType
    location: str
    status: SensorStatus
    created_at: float = None
    last_reading: Optional[SensorReading] = None
    calibration_data: Dict[str, Any] = None
    thresholds: Dict[str, float] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
        if self.calibration_data is None:
            self.calibration_data = {}
        if self.thresholds is None:
            self.thresholds = {}
        if self.metadata is None:
            self.metadata = {}

class SensorArrayManager:
    """
    Advanced sensor array system for environmental monitoring.
    
    Features:
    - Multi-sensor data fusion
    - Real-time environmental awareness
    - Contextual adaptation
    - Predictive environmental modeling
    - Biometric integration
    - Smart home automation
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.sensors: Dict[str, Sensor] = {}
        self.readings_history: List[SensorReading] = []
        self.environmental_state = {}
        self.automation_rules = []
        self.is_initialized = False
        
        # Environmental thresholds for human comfort
        self.comfort_thresholds = {
            "temperature": {"min": 20.0, "max": 24.0, "unit": "celsius"},
            "humidity": {"min": 30.0, "max": 60.0, "unit": "percent"},
            "light": {"min": 300.0, "max": 1000.0, "unit": "lux"},
            "sound": {"min": 30.0, "max": 60.0, "unit": "decibel"},
            "air_quality": {"min": 0.0, "max": 50.0, "unit": "aqi"}
        }
        
        # Sensor fusion weights
        self.fusion_weights = {
            "temperature": 0.2,
            "humidity": 0.15,
            "light": 0.2,
            "sound": 0.15,
            "air_quality": 0.2,
            "presence": 0.1
        }
    
    async def initialize(self):
        """Initialize the sensor array manager."""
        try:
            # Load sensor configurations
            await self._load_sensor_configs()
            
            # Initialize default sensors
            await self._initialize_default_sensors()
            
            # Set up automation rules
            await self._setup_automation_rules()
            
            # Start sensor monitoring
            await self._start_monitoring()
            
            self.is_initialized = True
            logging.info("🌡️ Sensor Array Manager initialized")
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize Sensor Array Manager: {e}")
            return False
    
    async def add_sensor(self, sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new sensor to the array.
        
        Args:
            sensor_data: Sensor configuration data
            
        Returns:
            Dict with sensor addition result
        """
        if not self.is_initialized:
            return {"success": False, "error": "Sensor manager not initialized"}
        
        try:
            # Generate sensor ID
            sensor_id = f"sensor_{int(time.time())}_{len(self.sensors)}"
            
            # Create sensor
            sensor = Sensor(
                id=sensor_id,
                name=sensor_data.get("name", "New Sensor"),
                sensor_type=SensorType(sensor_data.get("type", "temperature")),
                location=sensor_data.get("location", "unknown"),
                status=SensorStatus.CALIBRATING,
                thresholds=sensor_data.get("thresholds", {}),
                metadata=sensor_data.get("metadata", {})
            )
            
            # Store sensor
            self.sensors[sensor_id] = sensor
            
            # Calibrate sensor
            await self._calibrate_sensor(sensor)
            
            return {
                "success": True,
                "sensor_id": sensor_id,
                "sensor": asdict(sensor),
                "message": "Sensor added successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Sensor addition failed: {str(e)}"}
    
    async def record_reading(self, sensor_id: str, reading_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Record a sensor reading with validation and processing.
        
        Args:
            sensor_id: Sensor identifier
            reading_data: Reading data
            
        Returns:
            Dict with recording result
        """
        try:
            sensor = self.sensors.get(sensor_id)
            if not sensor:
                return {"success": False, "error": "Sensor not found"}
            
            # Create reading
            reading = SensorReading(
                sensor_id=sensor_id,
                sensor_type=sensor.sensor_type,
                value=float(reading_data.get("value", 0)),
                unit=reading_data.get("unit", ""),
                timestamp=time.time(),
                location=sensor.location,
                quality=self._calculate_reading_quality(reading_data),
                metadata=reading_data.get("metadata", {})
            )
            
            # Validate reading
            validation_result = await self._validate_reading(sensor, reading)
            if not validation_result["valid"]:
                return {"success": False, "error": f"Invalid reading: {validation_result['reason']}"}
            
            # Store reading
            sensor.last_reading = reading
            self.readings_history.append(reading)
            
            # Update environmental state
            await self._update_environmental_state()
            
            # Check thresholds and triggers
            await self._check_thresholds(sensor, reading)
            
            # Apply sensor fusion
            await self._apply_sensor_fusion()
            
            return {
                "success": True,
                "reading_id": f"reading_{int(time.time())}",
                "sensor_id": sensor_id,
                "value": reading.value,
                "unit": reading.unit,
                "quality": reading.quality,
                "timestamp": reading.timestamp,
                "message": "Reading recorded successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Reading recording failed: {str(e)}"}
    
    async def get_environmental_state(self) -> Dict[str, Any]:
        """
        Get comprehensive environmental state with AI insights.
        
        Returns:
            Dict with environmental state and insights
        """
        try:
            # Calculate environmental comfort score
            comfort_score = await self._calculate_comfort_score()
            
            # Generate AI insights
            insights = []
            if self.brain:
                insights = await self._generate_environmental_insights()
            
            # Get active sensors summary
            active_sensors = len([s for s in self.sensors.values() if s.status == SensorStatus.ACTIVE])
            
            return {
                "success": True,
                "environmental_state": self.environmental_state,
                "comfort_score": comfort_score,
                "active_sensors": active_sensors,
                "total_sensors": len(self.sensors),
                "insights": insights,
                "last_updated": time.time(),
                "message": "Environmental state retrieved successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Environmental state retrieval failed: {str(e)}"}
    
    async def get_sensor_status(self, sensor_id: str = None) -> Dict[str, Any]:
        """
        Get sensor status and recent readings.
        
        Args:
            sensor_id: Specific sensor ID (optional)
            
        Returns:
            Dict with sensor status
        """
        try:
            if sensor_id:
                # Get specific sensor
                sensor = self.sensors.get(sensor_id)
                if not sensor:
                    return {"success": False, "error": "Sensor not found"}
                
                return {
                    "success": True,
                    "sensor": asdict(sensor),
                    "recent_readings": [asdict(r) for r in self.readings_history[-10:] if r.sensor_id == sensor_id],
                    "message": "Sensor status retrieved"
                }
            else:
                # Get all sensors
                sensors_summary = []
                for sensor in self.sensors.values():
                    summary = {
                        "id": sensor.id,
                        "name": sensor.name,
                        "type": sensor.sensor_type.value,
                        "location": sensor.location,
                        "status": sensor.status.value,
                        "last_reading": asdict(sensor.last_reading) if sensor.last_reading else None,
                        "created_at": sensor.created_at
                    }
                    sensors_summary.append(summary)
                
                return {
                    "success": True,
                    "sensors": sensors_summary,
                    "total_sensors": len(self.sensors),
                    "active_sensors": len([s for s in self.sensors.values() if s.status == SensorStatus.ACTIVE]),
                    "message": "All sensors status retrieved"
                }
                
        except Exception as e:
            return {"success": False, "error": f"Sensor status retrieval failed: {str(e)}"}
    
    async def _load_sensor_configs(self):
        """Load sensor configurations from storage."""
        try:
            # Placeholder for loading from database or file
            pass
        except Exception as e:
            logging.error(f"Failed to load sensor configs: {e}")
    
    async def _initialize_default_sensors(self):
        """Initialize default sensors for common environmental monitoring."""
        try:
            # Add default sensors
            default_sensors = [
                {"name": "Room Temperature", "type": "temperature", "location": "office"},
                {"name": "Room Humidity", "type": "humidity", "location": "office"},
                {"name": "Ambient Light", "type": "light", "location": "office"},
                {"name": "Sound Level", "type": "sound", "location": "office"},
                {"name": "Air Quality", "type": "air_quality", "location": "office"},
                {"name": "Presence Detection", "type": "presence", "location": "office"}
            ]
            
            for sensor_config in default_sensors:
                await self.add_sensor(sensor_config)
                
        except Exception as e:
            logging.error(f"Failed to initialize default sensors: {e}")
    
    async def _setup_automation_rules(self):
        """Set up automation rules for environmental responses."""
        try:
            self.automation_rules = [
                {
                    "condition": "temperature > 24",
                    "action": "activate_cooling",
                    "priority": "high"
                },
                {
                    "condition": "temperature < 20",
                    "action": "activate_heating",
                    "priority": "high"
                },
                {
                    "condition": "light < 300",
                    "action": "increase_lighting",
                    "priority": "medium"
                },
                {
                    "condition": "sound > 60",
                    "action": "noise_alert",
                    "priority": "medium"
                },
                {
                    "condition": "air_quality > 50",
                    "action": "activate_purification",
                    "priority": "high"
                }
            ]
        except Exception as e:
            logging.error(f"Failed to setup automation rules: {e}")
    
    async def _start_monitoring(self):
        """Start continuous sensor monitoring."""
        try:
            # Placeholder for starting background monitoring
            logging.info("🌡️ Sensor monitoring started")
        except Exception as e:
            logging.error(f"Failed to start monitoring: {e}")
    
    async def _calibrate_sensor(self, sensor: Sensor):
        """Calibrate a new sensor."""
        try:
            # Simulate calibration process
            await asyncio.sleep(1)
            sensor.status = SensorStatus.ACTIVE
            logging.info(f"🔧 Sensor {sensor.id} calibrated and activated")
        except Exception as e:
            sensor.status = SensorStatus.ERROR
            logging.error(f"Failed to calibrate sensor {sensor.id}: {e}")
    
    def _calculate_reading_quality(self, reading_data: Dict[str, Any]) -> float:
        """Calculate quality score for sensor reading."""
        try:
            # Simple quality calculation based on data completeness
            quality = 1.0
            
            # Check for missing required fields
            if not reading_data.get("value"):
                quality -= 0.3
            if not reading_data.get("unit"):
                quality -= 0.1
            if not reading_data.get("timestamp"):
                quality -= 0.2
            
            return max(0.0, quality)
        except Exception:
            return 0.5  # Default quality
    
    async def _validate_reading(self, sensor: Sensor, reading: SensorReading) -> Dict[str, Any]:
        """Validate sensor reading against expected ranges."""
        try:
            # Get expected range for sensor type
            expected_ranges = {
                SensorType.TEMPERATURE: {"min": -50, "max": 100},
                SensorType.HUMIDITY: {"min": 0, "max": 100},
                SensorType.LIGHT: {"min": 0, "max": 10000},
                SensorType.SOUND: {"min": 0, "max": 140},
                SensorType.AIR_QUALITY: {"min": 0, "max": 500},
                SensorType.PRESENCE: {"min": 0, "max": 1}
            }
            
            range_info = expected_ranges.get(sensor.sensor_type, {"min": -999999, "max": 999999})
            
            if reading.value < range_info["min"] or reading.value > range_info["max"]:
                return {"valid": False, "reason": f"Value {reading.value} outside expected range {range_info}"}
            
            return {"valid": True}
            
        except Exception as e:
            return {"valid": False, "reason": f"Validation error: {str(e)}"}
    
    async def _update_environmental_state(self):
        """Update overall environmental state based on latest readings."""
        try:
            # Group readings by sensor type
            latest_readings = {}
            for reading in self.readings_history[-100:]:  # Last 100 readings
                if reading.sensor_type.value not in latest_readings:
                    latest_readings[reading.sensor_type.value] = reading
                elif reading.timestamp > latest_readings[reading.sensor_type.value].timestamp:
                    latest_readings[reading.sensor_type.value] = reading
            
            # Update environmental state
            self.environmental_state = latest_readings
            
        except Exception as e:
            logging.error(f"Failed to update environmental state: {e}")
    
    async def _check_thresholds(self, sensor: Sensor, reading: SensorReading):
        """Check if reading exceeds thresholds and trigger actions."""
        try:
            # Check comfort thresholds
            comfort_threshold = self.comfort_thresholds.get(sensor.sensor_type.value)
            if comfort_threshold:
                if reading.value < comfort_threshold["min"] or reading.value > comfort_threshold["max"]:
                    await self._trigger_automation(sensor, reading, "threshold_exceeded")
        except Exception as e:
            logging.error(f"Failed to check thresholds: {e}")
    
    async def _apply_sensor_fusion(self):
        """Apply sensor fusion algorithms for comprehensive analysis."""
        try:
            # Calculate weighted environmental score
            total_score = 0
            total_weight = 0
            
            for sensor_type, weight in self.fusion_weights.items():
                if sensor_type in self.environmental_state:
                    reading = self.environmental_state[sensor_type]
                    # Normalize reading to 0-1 scale
                    normalized_value = self._normalize_reading(reading)
                    total_score += normalized_value * weight
                    total_weight += weight
            
            if total_weight > 0:
                environmental_score = total_score / total_weight
                self.environmental_state["fusion_score"] = environmental_score
                
        except Exception as e:
            logging.error(f"Failed to apply sensor fusion: {e}")
    
    def _normalize_reading(self, reading: SensorReading) -> float:
        """Normalize sensor reading to 0-1 scale."""
        try:
            # Simple normalization based on sensor type
            normalization_ranges = {
                SensorType.TEMPERATURE: {"min": 0, "max": 40},
                SensorType.HUMIDITY: {"min": 0, "max": 100},
                SensorType.LIGHT: {"min": 0, "max": 2000},
                SensorType.SOUND: {"min": 0, "max": 100},
                SensorType.AIR_QUALITY: {"min": 0, "max": 100},
                SensorType.PRESENCE: {"min": 0, "max": 1}
            }
            
            range_info = normalization_ranges.get(reading.sensor_type, {"min": 0, "max": 1})
            normalized = (reading.value - range_info["min"]) / (range_info["max"] - range_info["min"])
            return max(0.0, min(1.0, normalized))
            
        except Exception:
            return 0.5
    
    async def _trigger_automation(self, sensor: Sensor, reading: SensorReading, trigger_type: str):
        """Trigger automation based on sensor reading."""
        try:
            # Placeholder for automation triggering
            logging.info(f"🤖 Automation triggered: {trigger_type} for sensor {sensor.id}")
        except Exception as e:
            logging.error(f"Failed to trigger automation: {e}")
    
    async def _calculate_comfort_score(self) -> float:
        """Calculate overall environmental comfort score."""
        try:
            comfort_scores = []
            
            for sensor_type, threshold in self.comfort_thresholds.items():
                if sensor_type in self.environmental_state:
                    reading = self.environmental_state[sensor_type]
                    
                    # Calculate comfort score for this sensor type
                    if threshold["min"] <= reading.value <= threshold["max"]:
                        score = 1.0  # Perfect comfort
                    else:
                        # Calculate distance from optimal range
                        distance = min(
                            abs(reading.value - threshold["min"]),
                            abs(reading.value - threshold["max"])
                        )
                        # Normalize to 0-1 scale (higher is better)
                        score = max(0.0, 1.0 - (distance / 10.0))  # 10 unit tolerance
                    
                    comfort_scores.append(score)
            
            if comfort_scores:
                return sum(comfort_scores) / len(comfort_scores)
            else:
                return 0.5  # Default comfort score
                
        except Exception as e:
            logging.error(f"Failed to calculate comfort score: {e}")
            return 0.5
    
    async def _generate_environmental_insights(self) -> List[str]:
        """Generate AI insights about environmental conditions."""
        try:
            insights = []
            
            # Temperature insights
            if "temperature" in self.environmental_state:
                temp = self.environmental_state["temperature"].value
                if temp > 24:
                    insights.append("🌡️ Temperature is high - consider cooling")
                elif temp < 20:
                    insights.append("🌡️ Temperature is low - consider heating")
                else:
                    insights.append("🌡️ Temperature is optimal")
            
            # Light insights
            if "light" in self.environmental_state:
                light = self.environmental_state["light"].value
                if light < 300:
                    insights.append("💡 Light levels are low - increase lighting")
                elif light > 1000:
                    insights.append("💡 Light levels are high - consider dimming")
                else:
                    insights.append("💡 Light levels are comfortable")
            
            # Sound insights
            if "sound" in self.environmental_state:
                sound = self.environmental_state["sound"].value
                if sound > 60:
                    insights.append("🔊 Sound levels are high - reduce noise")
                else:
                    insights.append("🔊 Sound levels are acceptable")
            
            # Air quality insights
            if "air_quality" in self.environmental_state:
                aqi = self.environmental_state["air_quality"].value
                if aqi > 50:
                    insights.append("🌬️ Air quality is poor - activate purification")
                else:
                    insights.append("🌬️ Air quality is good")
            
            # Presence insights
            if "presence" in self.environmental_state:
                presence = self.environmental_state["presence"].value
                if presence > 0.5:
                    insights.append("👤 Presence detected - environment occupied")
                else:
                    insights.append("🏠 Environment unoccupied - energy saving mode")
            
            return insights
            
        except Exception as e:
            logging.error(f"Failed to generate environmental insights: {e}")
            return []

# Global sensor array manager instance
sensor_array = SensorArrayManager()
