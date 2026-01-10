"""
Wake Word Detection System for Sallie
Real-time, low-latency wake word detection with continuous monitoring
"""

import asyncio
import numpy as np
import threading
import queue
import time
from typing import Optional, Callable, Dict, Any
from dataclasses import dataclass
from pathlib import Path
import logging
from collections import deque
import json

@dataclass
class WakeWordConfig:
    """Configuration for wake word detection"""
    wake_word: str = "Sallie"
    sensitivity: float = 0.7
    window_size: float = 2.0  # seconds
    sample_rate: int = 16000
    chunk_size: int = 1024
    silence_threshold: float = 0.01
    min_confidence: float = 0.8
    cooldown_period: float = 1.0  # seconds between detections
    
@dataclass
class DetectionResult:
    """Result of wake word detection"""
    detected: bool
    confidence: float
    timestamp: float
    audio_data: Optional[np.ndarray] = None
    processing_time: float = 0.0

class WakeWordDetector:
    """Advanced wake word detection with real-time processing"""
    
    def __init__(self, config: WakeWordConfig):
        self.config = config
        self.audio_queue = queue.Queue()
        self.is_listening = False
        self.detection_callback: Optional[Callable] = None
        self.last_detection_time = 0
        self.audio_buffer = deque(maxlen=int(config.sample_rate * config.window_size))
        
        # Wake word model (simplified for production)
        self.wake_word_features = self._extract_wake_word_features()
        
        # Performance tracking
        self.detection_stats = {
            'total_detections': 0,
            'false_positives': 0,
            'average_confidence': 0.0,
            'processing_times': deque(maxlen=100)
        }
        
        self.logger = logging.getLogger(__name__)
        
    def _extract_wake_word_features(self) -> Dict[str, Any]:
        """Extract acoustic features for 'Sallie' wake word"""
        # In production, this would use a trained model
        # For now, we'll use phonetic patterns
        return {
            'phonetic_pattern': ['S', 'AE', 'L', 'IY'],
            'duration_range': (0.5, 1.5),  # seconds
            'frequency_profile': {
                'fundamental': 150,  # Hz
                'formants': [500, 1500, 2500],  # Hz
                'energy_profile': [0.2, 0.8, 0.6, 0.3]
            },
            'spectral_centroid': 1200,  # Hz
            'zero_crossing_rate': 0.1
        }
    
    def start_listening(self, callback: Callable[[DetectionResult], None]):
        """Start continuous wake word detection"""
        self.detection_callback = callback
        self.is_listening = True
        
        # Start audio processing thread
        self.audio_thread = threading.Thread(target=self._audio_processing_loop, daemon=True)
        self.audio_thread.start()
        
        self.logger.info(f"Wake word detection started for '{self.config.wake_word}'")
    
    def stop_listening(self):
        """Stop wake word detection"""
        self.is_listening = False
        if hasattr(self, 'audio_thread'):
            self.audio_thread.join(timeout=1.0)
        
        self.logger.info("Wake word detection stopped")
    
    def _audio_processing_loop(self):
        """Main audio processing loop"""
        while self.is_listening:
            try:
                # Get audio chunk
                audio_chunk = self.audio_queue.get(timeout=0.1)
                if audio_chunk is not None:
                    self._process_audio_chunk(audio_chunk)
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"Audio processing error: {e}")
    
    def _process_audio_chunk(self, audio_chunk: np.ndarray):
        """Process incoming audio chunk"""
        start_time = time.time()
        
        # Add to buffer
        self.audio_buffer.extend(audio_chunk)
        
        # Check for wake word
        if len(self.audio_buffer) >= self.config.sample_rate * self.config.window_size:
            detection_result = self._detect_wake_word()
            
            if detection_result.detected:
                # Check cooldown period
                current_time = time.time()
                if current_time - self.last_detection_time >= self.config.cooldown_period:
                    self.last_detection_time = current_time
                    self.detection_stats['total_detections'] += 1
                    
                    # Update confidence tracking
                    self.detection_stats['average_confidence'] = (
                        (self.detection_stats['average_confidence'] * (self.detection_stats['total_detections'] - 1) + 
                         detection_result.confidence) / self.detection_stats['total_detections']
                    )
                    
                    # Trigger callback
                    if self.detection_callback:
                        self.detection_callback(detection_result)
                else:
                    self.detection_stats['false_positives'] += 1
        
        # Track processing time
        processing_time = time.time() - start_time
        self.detection_stats['processing_times'].append(processing_time)
    
    def _detect_wake_word(self) -> DetectionResult:
        """Detect wake word in audio buffer"""
        audio_data = np.array(list(self.audio_buffer))
        
        # Extract features
        features = self._extract_audio_features(audio_data)
        
        # Calculate confidence
        confidence = self._calculate_confidence(features)
        
        # Determine if detected
        detected = confidence >= self.config.min_confidence
        
        return DetectionResult(
            detected=detected,
            confidence=confidence,
            timestamp=time.time(),
            audio_data=audio_data if detected else None,
            processing_time=0.0
        )
    
    def _extract_audio_features(self, audio_data: np.ndarray) -> Dict[str, float]:
        """Extract acoustic features from audio"""
        # Energy
        energy = np.sqrt(np.mean(audio_data ** 2))
        
        # Zero crossing rate
        zero_crossings = np.sum(np.diff(np.sign(audio_data)) != 0) / len(audio_data)
        
        # Spectral centroid
        fft = np.fft.fft(audio_data)
        freqs = np.fft.fftfreq(len(audio_data), 1/self.config.sample_rate)
        spectral_centroid = np.sum(np.abs(freqs[:len(freqs)//2]) * np.abs(fft[:len(fft)//2])) / np.sum(np.abs(fft[:len(fft)//2]))
        
        # Duration
        duration = len(audio_data) / self.config.sample_rate
        
        # Fundamental frequency (simplified)
        autocorr = np.correlate(audio_data, audio_data, mode='full')
        peak_idx = np.argmax(autocorr[len(autocorr)//2:]) + len(autocorr)//2
        fundamental_freq = self.config.sample_rate / (peak_idx - len(autocorr)//2) if peak_idx != len(autocorr)//2 else 0
        
        return {
            'energy': energy,
            'zero_crossing_rate': zero_crossings,
            'spectral_centroid': spectral_centroid,
            'duration': duration,
            'fundamental_freq': fundamental_freq
        }
    
    def _calculate_confidence(self, features: Dict[str, float]) -> float:
        """Calculate confidence score for wake word detection"""
        confidence = 0.0
        weight_sum = 0.0
        
        # Energy matching
        target_energy = np.mean(self.wake_word_features['energy_profile'])
        energy_diff = abs(features['energy'] - target_energy)
        energy_confidence = max(0, 1 - energy_diff / target_energy)
        confidence += energy_confidence * 0.3
        weight_sum += 0.3
        
        # Duration matching
        min_duration, max_duration = self.wake_word_features['duration_range']
        duration_confidence = 1.0 if min_duration <= features['duration'] <= max_duration else 0.5
        confidence += duration_confidence * 0.2
        weight_sum += 0.2
        
        # Spectral centroid matching
        target_centroid = self.wake_word_features['spectral_centroid']
        centroid_diff = abs(features['spectral_centroid'] - target_centroid) / target_centroid
        centroid_confidence = max(0, 1 - centroid_diff)
        confidence += centroid_confidence * 0.3
        weight_sum += 0.3
        
        # Zero crossing rate matching
        target_zcr = self.wake_word_features['zero_crossing_rate']
        zcr_diff = abs(features['zero_crossing_rate'] - target_zcr) / target_zcr
        zcr_confidence = max(0, 1 - zcr_diff)
        confidence += zcr_confidence * 0.2
        weight_sum += 0.2
        
        return confidence / weight_sum if weight_sum > 0 else 0.0
    
    def add_audio_data(self, audio_data: np.ndarray):
        """Add audio data for processing"""
        try:
            self.audio_queue.put(audio_data, block=False)
        except queue.Full:
            # Drop oldest data if queue is full
            try:
                self.audio_queue.get(block=False)
                self.audio_queue.put(audio_data, block=False)
            except queue.Empty:
                pass
    
    def get_detection_stats(self) -> Dict[str, Any]:
        """Get detection statistics"""
        stats = self.detection_stats.copy()
        
        # Calculate average processing time
        if stats['processing_times']:
            stats['average_processing_time'] = np.mean(stats['processing_times'])
            stats['max_processing_time'] = np.max(stats['processing_times'])
            stats['min_processing_time'] = np.min(stats['processing_times'])
        else:
            stats['average_processing_time'] = 0.0
            stats['max_processing_time'] = 0.0
            stats['min_processing_time'] = 0.0
        
        # Calculate detection rate
        if stats['total_detections'] > 0:
            stats['false_positive_rate'] = stats['false_positives'] / stats['total_detections']
        else:
            stats['false_positive_rate'] = 0.0
        
        return stats
    
    def update_config(self, new_config: WakeWordConfig):
        """Update detection configuration"""
        self.config = new_config
        self.audio_buffer = deque(maxlen=int(self.config.sample_rate * self.config.window_size))
        self.logger.info("Wake word detection configuration updated")

class VoiceActivationSystem:
    """Complete voice activation system with wake word detection"""
    
    def __init__(self):
        self.wake_detector = WakeWordDetector(WakeWordConfig())
        self.is_active = False
        self.activation_callback: Optional[Callable] = None
        self.logger = logging.getLogger(__name__)
    
    def initialize(self, activation_callback: Callable):
        """Initialize the voice activation system"""
        self.activation_callback = activation_callback
        
        def on_wake_word_detected(result: DetectionResult):
            self.logger.info(f"Wake word detected with confidence: {result.confidence:.2f}")
            if self.activation_callback:
                self.activation_callback(result)
        
        self.wake_detector.start_listening(on_wake_word_detected)
        self.is_active = True
        
        self.logger.info("Voice activation system initialized")
    
    def shutdown(self):
        """Shutdown the voice activation system"""
        self.wake_detector.stop_listening()
        self.is_active = False
        self.logger.info("Voice activation system shutdown")
    
    def process_audio_stream(self, audio_data: np.ndarray):
        """Process audio stream for wake word detection"""
        if self.is_active:
            self.wake_detector.add_audio_data(audio_data)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get system status"""
        return {
            'is_active': self.is_active,
            'wake_word': self.wake_detector.config.wake_word,
            'sensitivity': self.wake_detector.config.sensitivity,
            'detection_stats': self.wake_detector.get_detection_stats()
        }

# Global voice activation system instance
voice_activation_system = VoiceActivationSystem()
