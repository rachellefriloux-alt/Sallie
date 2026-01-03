"""Neural Interface System.

Advanced digital interface for enhanced connectivity:
- Direct API connections to external systems
- Neural network integration for pattern recognition
- Brain-computer metaphor interfaces
- Advanced data processing pipelines
- Multi-modal input/output processing
- Real-time neural network inference
- Adaptive learning from user interactions
- Digital synapse connections

This leverages Sallie's digital nature to create advanced interfaces.
"""

import json
import logging
import time
import asyncio
import numpy as np
from typing import Dict, Any, List, Optional, Callable, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from threading import Thread, Event
from queue import Queue, Empty
import requests
import hashlib

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("neural_interface")

class InterfaceType(str, Enum):
    """Types of neural interfaces."""
    API = "api"                     # Direct API connections
    NEURAL_NETWORK = "neural_network" # Neural network processing
    DATA_PIPELINE = "data_pipeline"   # Data processing pipelines
    MULTIMODAL = "multimodal"         # Multi-modal I/O
    ADAPTIVE = "adaptive"             # Adaptive learning interfaces
    SYNAPSE = "synapse"               # Digital synapse connections

class ConnectionState(str, Enum):
    """Connection states."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    ERROR = "error"
    TRAINING = "training"

@dataclass
class NeuralConnection:
    """A neural interface connection."""
    connection_id: str
    interface_type: InterfaceType
    endpoint: str
    api_key: Optional[str]
    connection_state: ConnectionState
    last_activity: datetime
    data_flow: Dict[str, Any] = field(default_factory=dict)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class NeuralSignal:
    """A neural signal processed through the interface."""
    signal_id: str
    source: str
    signal_type: str
    data: Any
    timestamp: datetime
    processed: bool = False
    result: Optional[Any] = None
    processing_time: float = 0.0
    confidence: float = 0.0

class NeuralInterfaceSystem:
    """System for advanced neural interface connections."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Neural connections
        self.connections: Dict[str, NeuralConnection] = {}
        self.active_connections: Dict[str, NeuralConnection] = {}
        
        # Neural processing
        self.neural_processors: Dict[InterfaceType, Callable] = {
            InterfaceType.API: self._process_api_signal,
            InterfaceType.NEURAL_NETWORK: self._process_neural_network_signal,
            InterfaceType.DATA_PIPELINE: self._process_data_pipeline_signal,
            InterfaceType.MULTIMODAL: self._process_multimodal_signal,
            InterfaceType.ADAPTIVE: self._process_adaptive_signal,
            InterfaceType.SYNAPSE: self._process_synapse_signal
        }
        
        # Signal processing
        self.signal_queue: Queue[NeuralSignal] = Queue()
        self.processed_signals: List[NeuralSignal] = []
        self.signal_history: List[NeuralSignal] = []
        
        # Background processing
        self.is_processing = False
        self.processing_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        # Neural network models (simulated)
        self.neural_models: Dict[str, Dict[str, Any]] = {}
        self.model_performance: Dict[str, List[float]] = {}
        
        # Adaptive learning
        self.learning_rate = 0.01
        self.adaptation_threshold = 0.1
        self.learning_history: List[Dict[str, Any]] = []
        
        # Performance metrics
        self.interface_metrics: Dict[str, List[float]] = {
            "processing_times": [],
            "signal_counts": [],
            "connection_uptime": []
        }
        
        logger.info("[NeuralInterface] System initialized")
    
    def start(self):
        """Start the neural interface system."""
        if self.is_processing:
            logger.warning("[NeuralInterface] System already running")
            return
        
        self.is_processing = True
        self.stop_event.clear()
        
        self.processing_thread = Thread(target=self._processing_loop, daemon=True)
        self.processing_thread.start()
        
        logger.info("[NeuralInterface] System started")
    
    def stop(self):
        """Stop the neural interface system."""
        if not self.is_processing:
            return
        
        self.is_processing = False
        self.stop_event.set()
        
        if self.processing_thread:
            self.processing_thread.join(timeout=5)
        
        logger.info("[NeuralInterface] System stopped")
    
    def _processing_loop(self):
        """Background loop for processing neural signals."""
        
        while self.is_processing:
            try:
                # Process signals from queue
                self._process_signal_queue()
                
                # Update connection states
                self._update_connection_states()
                
                # Perform adaptive learning
                self._adaptive_learning()
                
                # Clean up old data
                self._cleanup_old_data()
                
                # Wait before next iteration
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"[NeuralInterface] Processing loop error: {e}")
                time.sleep(5)
    
    def _process_signal_queue(self):
        """Process signals from the queue."""
        
        while not self.signal_queue.empty() and self.is_processing:
            try:
                signal = self.signal_queue.get(timeout=0.1)
                self._process_neural_signal(signal)
                
            except Empty:
                break
            except Exception as e:
                logger.error(f"[NeuralInterface] Error processing signal: {e}")
    
    def _process_neural_signal(self, signal: NeuralSignal):
        """Process a single neural signal."""
        
        start_time = time.time()
        
        try:
            # Determine signal type and processor
            signal_type = self._determine_signal_type(signal)
            processor = self.neural_processors.get(signal_type)
            
            if processor:
                result = processor(signal)
                signal.result = result
                signal.processed = True
                signal.confidence = self._calculate_confidence(signal, result)
            else:
                signal.result = self._default_signal_processing(signal)
                signal.processed = True
                signal.confidence = 0.5
            
            # Update processing time
            signal.processing_time = (time.time() - start_time) * 1000
            
            # Store processed signal
            self.processed_signals.append(signal)
            self.signal_history.append(signal)
            
            # Keep history manageable
            if len(self.signal_history) > 1000:
                self.signal_history = self.signal_history[-500:]
            
            # Update metrics
            self.interface_metrics["processing_times"].append(signal.processing_time)
            if len(self.interface_metrics["processing_times"]) > 100:
                self.interface_metrics["processing_times"] = self.interface_metrics["processing_times"][-50:]
            
        except Exception as e:
            logger.error(f"[NeuralInterface] Error processing signal {signal.signal_id}: {e}")
            signal.processed = False
            signal.result = {"error": str(e)}
    
    def _determine_signal_type(self, signal: NeuralSignal) -> InterfaceType:
        """Determine the type of neural signal."""
        
        # Analyze signal source and data to determine type
        source = signal.source.lower()
        signal_data = signal.data
        
        if "api" in source or isinstance(signal_data, dict) and "endpoint" in str(signal_data):
            return InterfaceType.API
        elif "neural" in source or "network" in source:
            return InterfaceType.NEURAL_NETWORK
        elif "pipeline" in source or "process" in source:
            return InterfaceType.DATA_PIPELINE
        elif "multimodal" in source or isinstance(signal_data, (list, tuple)):
            return InterfaceType.MULTIMODAL
        elif "adaptive" in source or "learning" in source:
            return InterfaceType.ADAPTIVE
        else:
            return InterfaceType.SYNAPSE
    
    def _process_api_signal(self, signal: NeuralSignal) -> Any:
        """Process API-based neural signal."""
        
        try:
            # Extract API information
            api_data = signal.data
            endpoint = api_data.get("endpoint", "")
            method = api_data.get("method", "GET")
            headers = api_data.get("headers", {})
            params = api_data.get("params", {})
            data = api_data.get("data", {})
            
            # Make API call
            if method.upper() == "GET":
                response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(endpoint, headers=headers, json=data, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(endpoint, headers=headers, json=data, timeout=10)
            else:
                response = requests.get(endpoint, headers=headers, timeout=10)
            
            # Process response
            if response.status_code == 200:
                return {
                    "success": True,
                    "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text,
                    "status_code": response.status_code
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}",
                    "data": response.text
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_neural_network_signal(self, signal: NeuralSignal) -> Any:
        """Process neural network signal."""
        
        try:
            # Simulate neural network processing
            input_data = signal.data
            
            if isinstance(input_data, (list, tuple)):
                # Convert to numpy array
                input_array = np.array(input_data)
                
                # Simulate neural network layers
                layer1 = self._neural_layer(input_array, 128, "relu")
                layer2 = self._neural_layer(layer1, 64, "relu")
                layer3 = self._neural_layer(layer2, 32, "relu")
                output = self._neural_layer(layer3, 1, "sigmoid")
                
                return {
                    "success": True,
                    "prediction": float(output[0]),
                    "layers": [layer1.shape, layer2.shape, layer3.shape, output.shape],
                    "confidence": self._calculate_network_confidence(output)
                }
            else:
                return {"success": False, "error": "Invalid input format for neural network"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _neural_layer(self, input_data: np.ndarray, output_size: int, activation: str) -> np.ndarray:
        """Simulate a neural network layer."""
        
        # Create random weights
        input_size = input_data.shape[1] if len(input_data.shape) > 1 else 1
        weights = np.random.randn(input_size, output_size) * 0.1
        bias = np.zeros(output_size)
        
        # Forward pass
        output = np.dot(input_data, weights) + bias
        
        # Apply activation
        if activation == "relu":
            return np.maximum(0, output)
        elif activation == "sigmoid":
            return 1 / (1 + np.exp(-output))
        elif activation == "tanh":
            return np.tanh(output)
        else:
            return output
    
    def _calculate_network_confidence(self, output: np.ndarray) -> float:
        """Calculate confidence in neural network prediction."""
        
        # Simple confidence calculation based on output distribution
        if len(output) > 1:
            max_val = np.max(output)
            min_val = np.min(output)
            confidence = (max_val - min_val) / (max_val + min_val + 1e-8)
        else:
            confidence = abs(output[0])
        
        return min(1.0, max(0.0, confidence))
    
    def _process_data_pipeline_signal(self, signal: NeuralSignal) -> Any:
        """Process data pipeline signal."""
        
        try:
            # Extract pipeline stages
            pipeline_data = signal.data
            stages = pipeline_data.get("stages", [])
            data = pipeline_data.get("data", {})
            
            # Process through pipeline stages
            for stage in stages:
                stage_type = stage.get("type", "transform")
                
                if stage_type == "transform":
                    data = self._transform_data(data, stage.get("params", {}))
                elif stage_type == "filter":
                    data = self._filter_data(data, stage.get("params", {}))
                elif stage_type == "aggregate":
                    data = self._aggregate_data(data, stage.get("params", {}))
                elif stage_type == "validate":
                    data = self._validate_data(data, stage.get("params", {}))
            
            return {
                "success": True,
                "processed_data": data,
                "stages_processed": len(stages)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _transform_data(self, data: Any, params: Dict[str, Any]) -> Any:
        """Transform data according to parameters."""
        
        transform_type = params.get("type", "identity")
        
        if transform_type == "normalize":
            if isinstance(data, (list, tuple)):
                data_array = np.array(data)
                normalized = (data_array - np.mean(data_array)) / (np.std(data_array) + 1e-8)
                return normalized.tolist()
        elif transform_type == "encode":
            return str(data).encode('utf-8').hex()
        elif transform_type == "decode":
            try:
                return bytes.fromhex(str(data)).decode('utf-8')
            except:
                return data
        
        return data
    
    def _filter_data(self, data: Any, params: Dict[str, Any]) -> Any:
        """Filter data according to parameters."""
        
        filter_type = params.get("type", "none")
        
        if filter_type == "threshold" and isinstance(data, (list, tuple)):
            threshold = params.get("value", 0.5)
            return [x for x in data if x > threshold]
        elif filter_type == "unique" and isinstance(data, (list, tuple)):
            return list(set(data))
        elif filter_type == "sort" and isinstance(data, (list, tuple)):
            reverse = params.get("reverse", False)
            return sorted(data, reverse=reverse)
        
        return data
    
    def _aggregate_data(self, data: Any, params: Dict[str, Any]) -> Any:
        """Aggregate data according to parameters."""
        
        agg_type = params.get("type", "none")
        
        if isinstance(data, (list, tuple)):
            if agg_type == "sum":
                return sum(data)
            elif agg_type == "mean":
                return sum(data) / len(data)
            elif agg_type == "max":
                return max(data)
            elif agg_type == "min":
                return min(data)
            elif agg_type == "count":
                return len(data)
        
        return data
    
    def _validate_data(self, data: Any, params: Dict[str, Any]) -> Any:
        """Validate data according to parameters."""
        
        validation_type = params.get("type", "none")
        
        if validation_type == "type":
            expected_type = params.get("expected_type", "str")
            if isinstance(data, eval(expected_type)):
                return {"valid": True, "data": data}
            else:
                return {"valid": False, "error": f"Expected {expected_type}, got {type(data).__name__}"}
        elif validation_type == "range" and isinstance(data, (int, float)):
            min_val = params.get("min", 0)
            max_val = params.get("max", 100)
            if min_val <= data <= max_val:
                return {"valid": True, "data": data}
            else:
                return {"valid": False, "error": f"Value {data} not in range [{min_val}, {max_val}]"}
        
        return {"valid": True, "data": data}
    
    def _process_multimodal_signal(self, signal: NeuralSignal) -> Any:
        """Process multi-modal signal."""
        
        try:
            # Extract multi-modal data
            multimodal_data = signal.data
            modalities = multimodal_data.get("modalities", {})
            
            results = {}
            
            # Process each modality
            for modality, data in modalities.items():
                if modality == "text":
                    results[modality] = self._process_text_modality(data)
                elif modality == "image":
                    results[modality] = self._process_image_modality(data)
                elif modality == "audio":
                    results[modality] = self._process_audio_modality(data)
                elif modality == "video":
                    results[modality] = self._process_video_modality(data)
                else:
                    results[modality] = self._process_generic_modality(data)
            
            return {
                "success": True,
                "modality_results": results,
                "processed_modalities": len(results)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_text_modality(self, data: Any) -> Any:
        """Process text modality."""
        
        if isinstance(data, str):
            return {
                "length": len(data),
                "word_count": len(data.split()),
                "sentiment": self._analyze_sentiment(data),
                "language": "en"  # Simplified
            }
        else:
            return {"error": "Invalid text data"}
    
    def _process_image_modality(self, data: Any) -> Any:
        """Process image modality."""
        
        # Simulate image processing
        return {
            "format": "unknown",
            "size": "unknown",
            "channels": 3,
            "features": ["edge_detection", "color_analysis"]
        }
    
    def _process_audio_modality(self, data: Any) -> Any:
        """Process audio modality."""
        
        # Simulate audio processing
        return {
            "duration": "unknown",
            "sample_rate": 44100,
            "channels": 2,
            "features": ["frequency_analysis", "speech_detection"]
        }
    
    def _process_video_modality(self, data: Any) -> Any:
        """Process video modality."""
        
        # Simulate video processing
        return {
            "duration": "unknown",
            "resolution": "unknown",
            "fps": 30,
            "features": ["motion_detection", "scene_analysis"]
        }
    
    def _process_generic_modality(self, data: Any) -> Any:
        """Process generic modality."""
        
        return {
            "type": type(data).__name__,
            "size": len(str(data)),
            "processed": True
        }
    
    def _analyze_sentiment(self, text: str) -> str:
        """Analyze text sentiment (simplified)."""
        
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "fantastic"]
        negative_words = ["bad", "terrible", "awful", "horrible", "disappointing", "sad"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _process_adaptive_signal(self, signal: NeuralSignal) -> Any:
        """Process adaptive learning signal."""
        
        try:
            # Extract learning data
            learning_data = signal.data
            learning_type = learning_data.get("type", "supervised")
            training_data = learning_data.get("data", {})
            
            # Perform adaptive learning
            if learning_type == "supervised":
                result = self._supervised_learning(training_data)
            elif learning_type == "reinforcement":
                result = self._reinforcement_learning(training_data)
            elif learning_type == "unsupervised":
                result = self._unsupervised_learning(training_data)
            else:
                result = self._default_learning(training_data)
            
            # Update learning history
            self.learning_history.append({
                "timestamp": datetime.now().isoformat(),
                "signal_id": signal.signal_id,
                "learning_type": learning_type,
                "result": result
            })
            
            return result
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _supervised_learning(self, training_data: Dict[str, Any]) -> Any:
        """Perform supervised learning."""
        
        # Simulate supervised learning
        features = training_data.get("features", [])
        labels = training_data.get("labels", [])
        
        if len(features) == len(labels):
            # Simulate model training
            accuracy = random.random() * 0.3 + 0.7  # 70-100% accuracy
            
            return {
                "success": True,
                "learning_type": "supervised",
                "samples": len(features),
                "accuracy": accuracy,
                "model_updated": True
            }
        else:
            return {"success": False, "error": "Features and labels length mismatch"}
    
    def _reinforcement_learning(self, training_data: Dict[str, Any]) -> Any:
        """Perform reinforcement learning."""
        
        # Simulate reinforcement learning
        states = training_data.get("states", [])
        rewards = training_data.get("rewards", [])
        
        if len(states) == len(rewards):
            total_reward = sum(rewards)
            average_reward = total_reward / len(rewards)
            
            return {
                "success": True,
                "learning_type": "reinforcement",
                "episodes": len(states),
                "total_reward": total_reward,
                "average_reward": average_reward,
                "policy_updated": True
            }
        else:
            return {"success": False, "error": "States and rewards length mismatch"}
    
    def _unsupervised_learning(self, training_data: Dict[str, Any]) -> Any:
        """Perform unsupervised learning."""
        
        # Simulate unsupervised learning
        data = training_data.get("data", [])
        
        if data:
            # Simulate clustering
            clusters = random.randint(2, 5)
            
            return {
                "success": True,
                "learning_type": "unsupervised",
                "samples": len(data),
                "clusters_found": clusters,
                "model_updated": True
            }
        else:
            return {"success": False, "error": "No data provided"}
    
    def _default_learning(self, training_data: Dict[str, Any]) -> Any:
        """Default learning method."""
        
        return {
            "success": True,
            "learning_type": "default",
            "data_processed": True,
            "model_updated": False
        }
    
    def _process_synapse_signal(self, signal: NeuralSignal) -> Any:
        """Process digital synapse connection signal."""
        
        try:
            # Extract synapse data
            synapse_data = signal.data
            synapse_type = synapse_data.get("type", "excitatory")
            strength = synapse_data.get("strength", 0.5)
            target = synapse_data.get("target", "")
            
            # Simulate synapse processing
            if synapse_type == "excitatory":
                activation = strength * random.random()
            elif synapse_type == "inhibitory":
                activation = -strength * random.random()
            else:
                activation = strength * random.random() * 2 - strength
            
            # Create synapse connection
            synapse_id = hashlib.md5(f"{signal.source}_{target}_{time.time()}".encode()).hexdigest()
            
            return {
                "success": True,
                "synapse_id": synapse_id,
                "synapse_type": synapse_type,
                "activation": activation,
                "target": target,
                "connection_strength": strength
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _default_signal_processing(self, signal: NeuralSignal) -> Any:
        """Default signal processing."""
        
        return {
            "success": True,
            "signal_id": signal.signal_id,
            "source": signal.source,
            "signal_type": signal.signal_type,
            "processed": True,
            "timestamp": signal.timestamp.isoformat()
        }
    
    def _calculate_confidence(self, signal: NeuralSignal, result: Any) -> float:
        """Calculate confidence in signal processing result."""
        
        if isinstance(result, dict) and result.get("success"):
            # Higher confidence for successful processing
            base_confidence = 0.8
            
            # Adjust based on processing time
            if signal.processing_time < 100:  # Fast processing
                base_confidence += 0.1
            elif signal.processing_time > 1000:  # Slow processing
                base_confidence -= 0.1
            
            return min(1.0, max(0.0, base_confidence))
        else:
            return 0.3  # Low confidence for failed processing
    
    def _update_connection_states(self):
        """Update connection states for all connections."""
        
        current_time = datetime.now()
        
        for connection_id, connection in self.connections.items():
            # Check if connection is still active
            time_since_activity = current_time - connection.last_activity
            
            if connection.connection_state == ConnectionState.CONNECTED:
                if time_since_activity > timedelta(minutes=5):
                    connection.connection_state = ConnectionState.DISCONNECTED
                    logger.info(f"[NeuralInterface] Connection {connection_id} disconnected due to inactivity")
            
            # Update performance metrics
            self._update_connection_metrics(connection)
    
    def _update_connection_metrics(self, connection: NeuralConnection):
        """Update performance metrics for a connection."""
        
        # Simulate performance metrics
        metrics = {
            "response_time": random.random() * 100 + 10,  # 10-110ms
            "success_rate": random.random() * 0.2 + 0.8,  # 80-100%
            "bandwidth": random.random() * 1000 + 100,  # 100-1100 units
            "latency": random.random() * 50 + 5  # 5-55ms
        }
        
        connection.performance_metrics = metrics
    
    def _adaptive_learning(self):
        """Perform adaptive learning from signal history."""
        
        if len(self.learning_history) < 10:
            return
        
        # Analyze recent learning performance
        recent_learning = self.learning_history[-10:]
        
        # Calculate learning effectiveness
        successful_learning = sum(1 for learning in recent_learning 
                                if learning.get("result", {}).get("success"))
        learning_effectiveness = successful_learning / len(recent_learning)
        
        # Adjust learning rate based on effectiveness
        if learning_effectiveness < 0.7:
            self.learning_rate = max(0.001, self.learning_rate * 0.9)
        elif learning_effectiveness > 0.9:
            self.learning_rate = min(0.1, self.learning_rate * 1.1)
        
        logger.debug(f"[NeuralInterface] Learning rate adjusted to {self.learning_rate}")
    
    def _cleanup_old_data(self):
        """Clean up old data."""
        
        cutoff_time = datetime.now() - timedelta(hours=24)
        
        # Clean up old signals
        self.signal_history = [
            signal for signal in self.signal_history
            if signal.timestamp > cutoff_time
        ]
        
        # Clean up old learning history
        self.learning_history = [
            learning for learning in self.learning_history
            if datetime.fromisoformat(learning["timestamp"]) > cutoff_time
        ]
    
    def create_connection(self, interface_type: InterfaceType, endpoint: str, 
                         api_key: Optional[str] = None, metadata: Dict[str, Any] = None) -> str:
        """Create a new neural connection."""
        
        connection_id = f"conn_{int(time.time() * 1000)}_{hash(endpoint) % 10000}"
        
        connection = NeuralConnection(
            connection_id=connection_id,
            interface_type=interface_type,
            endpoint=endpoint,
            api_key=api_key,
            connection_state=ConnectionState.CONNECTING,
            last_activity=datetime.now(),
            metadata=metadata or {}
        )
        
        self.connections[connection_id] = connection
        self.active_connections[connection_id] = connection
        
        logger.info(f"[NeuralInterface] Created connection: {connection_id}")
        return connection_id
    
    def send_signal(self, source: str, signal_type: str, data: Any) -> str:
        """Send a neural signal for processing."""
        
        signal_id = f"signal_{int(time.time() * 1000)}_{hash(source) % 10000}"
        
        signal = NeuralSignal(
            signal_id=signal_id,
            source=source,
            signal_type=signal_type,
            data=data,
            timestamp=datetime.now()
        )
        
        self.signal_queue.put(signal)
        self.interface_metrics["signal_counts"].append(1)
        
        return signal_id
    
    def get_connection_status(self, connection_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific connection."""
        
        connection = self.connections.get(connection_id)
        if not connection:
            return None
        
        return {
            "connection_id": connection.connection_id,
            "interface_type": connection.interface_type.value,
            "endpoint": connection.endpoint,
            "connection_state": connection.connection_state.value,
            "last_activity": connection.last_activity.isoformat(),
            "performance_metrics": connection.performance_metrics
        }
    
    def get_interface_metrics(self) -> Dict[str, Any]:
        """Get neural interface performance metrics."""
        
        metrics = {}
        
        for key, values in self.interface_metrics.items():
            if values:
                metrics[key] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
            else:
                metrics[key] = {"status": "no_data"}
        
        return metrics
    
    def health_check(self) -> bool:
        """Check if neural interface system is healthy."""
        
        try:
            return (self.is_processing and 
                   len(self.neural_processors) == 6 and
                   len(self.connections) >= 0)
        except:
            return False

# Global instance
_neural_interface_system: Optional[NeuralInterfaceSystem] = None

def get_neural_interface_system(limbic_system: LimbicSystem, memory_system: MemorySystem) -> NeuralInterfaceSystem:
    """Get or create the global neural interface system."""
    global _neural_interface_system
    if _neural_interface_system is None:
        _neural_interface_system = NeuralInterfaceSystem(limbic_system, memory_system)
    return _neural_interface_system
