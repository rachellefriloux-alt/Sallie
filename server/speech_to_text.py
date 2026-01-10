"""
Sallie's Voice Interface - Speech-to-Text (STT) System
Premium voice recognition with warm, grounded processing
"""

import asyncio
import json
import logging
import wave
import io
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import uuid
import hashlib
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class STTRequest:
    """Speech-to-Text request"""
    request_id: str
    user_id: str
    audio_data: bytes
    audio_format: str  # "wav", "mp3", "webm"
    sample_rate: int
    duration: float
    context: Dict[str, Any]
    timestamp: datetime

@dataclass
class STTResponse:
    """Speech-to-Text response"""
    request_id: str
    transcript: str
    confidence: float
    words: List[Dict[str, Any]]
    processing_time: float
    emotional_tone: str
    language: str
    timestamp: datetime

@dataclass
class VoiceProfile:
    """User voice profile for personalization"""
    user_id: str
    voice_characteristics: Dict[str, Any]
    accent: str
    speech_patterns: List[str]
    vocabulary_preferences: List[str]
    emotional_indicators: Dict[str, float]
    created_at: datetime
    updated_at: datetime

class AudioProcessor:
    """Audio processing utilities"""
    
    def __init__(self):
        self.supported_formats = ["wav", "mp3", "webm", "ogg"]
        self.default_sample_rate = 16000
    
    def validate_audio(self, audio_data: bytes, format: str) -> Tuple[bool, str]:
        """Validate audio data"""
        if format not in self.supported_formats:
            return False, f"Unsupported format: {format}"
        
        if len(audio_data) == 0:
            return False, "Empty audio data"
        
        if len(audio_data) > 50 * 1024 * 1024:  # 50MB limit
            return False, "Audio too large"
        
        return True, "Audio valid"
    
    def convert_to_wav(self, audio_data: bytes, format: str) -> bytes:
        """Convert audio to WAV format"""
        # For demo purposes, assume input is already WAV
        # In production, use libraries like pydub for conversion
        if format == "wav":
            return audio_data
        else:
            # Placeholder for conversion
            return audio_data
    
    def extract_audio_features(self, audio_data: bytes) -> Dict[str, Any]:
        """Extract features from audio for emotion detection"""
        try:
            # Read WAV file
            with io.BytesIO(audio_data) as audio_file:
                with wave.open(audio_file, 'rb') as wav_file:
                    sample_rate = wav_file.getframerate()
                    frames = wav_file.getnframes()
                    duration = frames / sample_rate
                    
                    # Get audio data
                    audio_data_np = np.frombuffer(audio_data, dtype=np.int16)
                    
                    # Extract basic features
                    features = {
                        'sample_rate': sample_rate,
                        'duration': duration,
                        'frames': frames,
                        'channels': wav_file.getnchannels(),
                        'sample_width': wav_file.getsampwidth(),
                        'rms_energy': np.sqrt(np.mean(audio_data_np**2)),
                        'zero_crossing_rate': self._calculate_zero_crossing_rate(audio_data_np),
                        'spectral_centroid': self._calculate_spectral_centroid(audio_data_np),
                    }
                    
                    return features
        except Exception as e:
            logger.error(f"Error extracting audio features: {e}")
            return {}
    
    def _calculate_zero_crossing_rate(self, audio_data: np.ndarray) -> float:
        """Calculate zero crossing rate"""
        zero_crossings = np.where(np.diff(np.sign(audio_data)))[0]
        return len(zero_crossings) / len(audio_data)
    
    def _calculate_spectral_centroid(self, audio_data: np.ndarray) -> float:
        """Calculate spectral centroid"""
        try:
            # Simple FFT
            fft = np.fft.fft(audio_data)
            freqs = np.fft.fftfreq(len(audio_data))
            magnitude = np.abs(fft)
            
            # Calculate centroid
            centroid = np.sum(freqs * magnitude) / np.sum(magnitude)
            return abs(centroid)
        except:
            return 0.0

class EmotionDetector:
    """Detect emotion from voice characteristics"""
    
    def __init__(self):
        self.emotion_patterns = {
            'happy': {
                'energy_range': (0.1, 1.0),
                'pitch_variance': (0.2, 0.8),
                'tempo_range': (120, 200)
            },
            'sad': {
                'energy_range': (0.01, 0.3),
                'pitch_variance': (0.1, 0.4),
                'tempo_range': (60, 100)
            },
            'angry': {
                'energy_range': (0.3, 1.0),
                'pitch_variance': (0.3, 0.9),
                'tempo_range': (140, 220)
            },
            'calm': {
                'energy_range': (0.05, 0.4),
                'pitch_variance': (0.1, 0.3),
                'tempo_range': (80, 120)
            },
            'excited': {
                'energy_range': (0.4, 1.0),
                'pitch_variance': (0.4, 1.0),
                'tempo_range': (160, 250)
            },
            'concerned': {
                'energy_range': (0.1, 0.5),
                'pitch_variance': (0.2, 0.6),
                'tempo_range': (100, 140)
            }
        }
    
    def detect_emotion(self, features: Dict[str, Any]) -> Tuple[str, float]:
        """Detect emotion from audio features"""
        if not features:
            return "neutral", 0.0
        
        # Extract relevant features
        energy = features.get('rms_energy', 0.1)
        zero_crossing = features.get('zero_crossing_rate', 0.1)
        spectral_centroid = features.get('spectral_centroid', 1000)
        
        # Calculate emotion scores
        emotion_scores = {}
        
        for emotion, pattern in self.emotion_patterns.items():
            score = 0.0
            
            # Energy matching
            energy_min, energy_max = pattern['energy_range']
            if energy_min <= energy <= energy_max:
                score += 0.3
            
            # Zero crossing (related to pitch variance)
            zc_min, zc_max = pattern['pitch_variance']
            zc_normalized = min(zero_crossing / 1000, 1.0)  # Normalize
            if zc_min <= zc_normalized <= zc_max:
                score += 0.3
            
            # Spectral centroid (related to tempo)
            sc_min, sc_max = pattern['tempo_range']
            sc_normalized = min(spectral_centroid / 2000, 1.0)  # Normalize
            if sc_min <= sc_normalized <= sc_max:
                score += 0.4
            
            emotion_scores[emotion] = score
        
        # Find best match
        if emotion_scores:
            best_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = emotion_scores[best_emotion]
            return best_emotion, confidence
        
        return "neutral", 0.0

class SpeechRecognizer:
    """Main speech recognition engine"""
    
    def __init__(self):
        self.audio_processor = AudioProcessor()
        self.emotion_detector = EmotionDetector()
        self.voice_profiles: Dict[str, VoiceProfile] = {}
        
        # Mock recognition patterns for demo
        self.recognition_patterns = {
            'hello': ['hello', 'hi', 'hey', 'greetings'],
            'how_are_you': ['how are you', 'how are you doing', "how's it going"],
            'sallie': ['sallie', 'sally', 'sali'],
            'convergence': ['convergence', 'questions', 'genesis'],
            'help': ['help', 'assist', 'support'],
            'thank_you': ['thank you', 'thanks', 'appreciate'],
            'goodbye': ['goodbye', 'bye', 'see you', 'later'],
            'yes': ['yes', 'yeah', 'yep', 'sure', 'okay'],
            'no': ['no', 'nope', 'not really', "don't think so"]
        }
    
    async def recognize_speech(self, request: STTRequest) -> STTResponse:
        """Recognize speech from audio data"""
        start_time = datetime.now(timezone.utc)
        
        try:
            # Validate audio
            is_valid, validation_message = self.audio_processor.validate_audio(
                request.audio_data, request.audio_format
            )
            
            if not is_valid:
                return STTResponse(
                    request_id=request.request_id,
                    transcript="",
                    confidence=0.0,
                    words=[],
                    processing_time=0.0,
                    emotional_tone="error",
                    language="en",
                    timestamp=start_time
                )
            
            # Convert to WAV if needed
            wav_data = self.audio_processor.convert_to_wav(request.audio_data, request.audio_format)
            
            # Extract audio features
            features = self.audio_processor.extract_audio_features(wav_data)
            
            # Detect emotion
            emotion, emotion_confidence = self.emotion_detector.detect_emotion(features)
            
            # Perform speech recognition (mock implementation)
            transcript, confidence, words = await self._mock_recognition(wav_data, request)
            
            # Apply voice profile if available
            if request.user_id in self.voice_profiles:
                transcript = self._apply_voice_profile(transcript, request.user_id)
            
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return STTResponse(
                request_id=request.request_id,
                transcript=transcript,
                confidence=confidence,
                words=words,
                processing_time=processing_time,
                emotional_tone=emotion,
                language="en",
                timestamp=start_time
            )
            
        except Exception as e:
            logger.error(f"Error in speech recognition: {e}")
            return STTResponse(
                request_id=request.request_id,
                transcript="",
                confidence=0.0,
                words=[],
                processing_time=0.0,
                emotional_tone="error",
                language="en",
                timestamp=start_time
            )
    
    async def _mock_recognition(self, audio_data: bytes, request: STTRequest) -> Tuple[str, float, List[Dict[str, Any]]]:
        """Mock speech recognition for demo purposes"""
        # In production, use actual STT service like:
        # - Google Speech-to-Text
        # - Azure Speech Services
        # - OpenAI Whisper
        # - Mozilla DeepSpeech
        
        # For demo, generate mock transcript based on context
        context = request.context.get('expected_phrases', [])
        
        if context:
            # Use expected phrases from context
            transcript = np.random.choice(context)
            confidence = 0.85 + np.random.random() * 0.15
        else:
            # Generate generic transcript
            generic_phrases = [
                "Hello Sallie",
                "How are you doing today",
                "Can you help me with something",
                "Thank you for your help",
                "I have a question for you",
                "Let's talk about the convergence",
                "I need some guidance"
            ]
            transcript = np.random.choice(generic_phrases)
            confidence = 0.70 + np.random.random() * 0.25
        
        # Generate word-level details
        words_list = transcript.split()
        words = []
        
        for i, word in enumerate(words_list):
            words.append({
                'word': word,
                'start_time': i * 0.3,
                'end_time': (i + 1) * 0.3,
                'confidence': confidence - np.random.random() * 0.1
            })
        
        return transcript, confidence, words
    
    def _apply_voice_profile(self, transcript: str, user_id: str) -> str:
        """Apply voice profile personalization"""
        profile = self.voice_profiles.get(user_id)
        if not profile:
            return transcript
        
        # Apply vocabulary preferences
        for vocab in profile.vocabulary_preferences:
            if vocab.lower() in transcript.lower():
                # Personalize based on vocabulary preferences
                pass
        
        return transcript
    
    def create_voice_profile(self, user_id: str, characteristics: Dict[str, Any]) -> VoiceProfile:
        """Create voice profile for user"""
        profile = VoiceProfile(
            user_id=user_id,
            voice_characteristics=characteristics,
            accent=characteristics.get('accent', 'neutral'),
            speech_patterns=characteristics.get('patterns', []),
            vocabulary_preferences=characteristics.get('vocabulary', []),
            emotional_indicators=characteristics.get('emotions', {}),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        self.voice_profiles[user_id] = profile
        return profile
    
    def update_voice_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[VoiceProfile]:
        """Update voice profile"""
        if user_id not in self.voice_profiles:
            return None
        
        profile = self.voice_profiles[user_id]
        
        if 'characteristics' in updates:
            profile.voice_characteristics.update(updates['characteristics'])
        
        if 'accent' in updates:
            profile.accent = updates['accent']
        
        if 'patterns' in updates:
            profile.speech_patterns.extend(updates['patterns'])
        
        if 'vocabulary' in updates:
            profile.vocabulary_preferences.extend(updates['vocabulary'])
        
        if 'emotions' in updates:
            profile.emotional_indicators.update(updates['emotions'])
        
        profile.updated_at = datetime.now(timezone.utc)
        return profile
    
    def get_voice_profile(self, user_id: str) -> Optional[VoiceProfile]:
        """Get voice profile for user"""
        return self.voice_profiles.get(user_id)

class STTService:
    """Speech-to-Text service"""
    
    def __init__(self):
        self.recognizer = SpeechRecognizer()
        self.active_requests: Dict[str, STTRequest] = {}
        self.processing_queue = asyncio.Queue()
        self.is_processing = False
        self.processing_task: Optional[asyncio.Task] = None
        
        # Statistics
        self.total_requests = 0
        self.successful_requests = 0
        self.average_processing_time = 0.0
        
    async def submit_stt_request(self, request: STTRequest) -> str:
        """Submit STT request for processing"""
        self.active_requests[request.request_id] = request
        self.total_requests += 1
        
        # Add to processing queue
        await self.processing_queue.put(request)
        
        # Start processing if not already running
        if not self.is_processing:
            self.processing_task = asyncio.create_task(self._process_stt_queue())
        
        return request.request_id
    
    async def _process_stt_queue(self):
        """Process STT requests from queue"""
        self.is_processing = True
        
        while True:
            try:
                request = await asyncio.wait_for(self.processing_queue.get(), timeout=5.0)
                
                # Process the request
                response = await self.recognizer.recognize_speech(request)
                
                # Update statistics
                if response.confidence > 0.5:
                    self.successful_requests += 1
                
                # Update average processing time
                if self.successful_requests > 0:
                    total_time = self.average_processing_time * (self.successful_requests - 1) + response.processing_time
                    self.average_processing_time = total_time / self.successful_requests
                
                # Store response (in production, would send via WebSocket)
                self._store_response(response)
                
                # Clean up
                if request.request_id in self.active_requests:
                    del self.active_requests[request.request_id]
                
            except asyncio.TimeoutError:
                # No more items in queue
                break
            except Exception as e:
                logger.error(f"Error processing STT request: {e}")
        
        self.is_processing = False
    
    def _store_response(self, response: STTResponse):
        """Store STT response (in production, would send via WebSocket)"""
        # For demo, just log the response
        logger.info(f"STT Response: {response.transcript} (confidence: {response.confidence:.2f})")
    
    def get_request_status(self, request_id: str) -> Dict[str, Any]:
        """Get status of STT request"""
        if request_id in self.active_requests:
            return {
                'status': 'processing',
                'request_id': request_id,
                'submitted_at': self.active_requests[request_id].timestamp.isoformat()
            }
        else:
            return {
                'status': 'completed',
                'request_id': request_id
            }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get STT service statistics"""
        return {
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'success_rate': self.successful_requests / max(self.total_requests, 1),
            'average_processing_time': self.average_processing_time,
            'active_requests': len(self.active_requests),
            'voice_profiles': len(self.recognizer.voice_profiles)
        }

# Global STT service instance
stt_service = STTService()
