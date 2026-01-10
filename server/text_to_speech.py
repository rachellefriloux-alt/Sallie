"""
Sallie's Voice Interface - Text-to-Speech (TTS) System
Premium voice synthesis with warm, grounded "Wise Big Sister" persona
"""

import asyncio
import json
import logging
import io
import wave
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import uuid
import tempfile
import os
import subprocess
import platform

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TTSRequest:
    """Text-to-Speech request"""
    request_id: str
    user_id: str
    text: str
    voice_profile: str  # "wise_big_sister", "warm", "grounded", "intimate"
    emotion: str  # "neutral", "warm", "caring", "wise", "gentle", "encouraging"
    language: str
    speed: float  # 0.5 to 2.0
    pitch: float  # 0.5 to 2.0
    volume: float  # 0.0 to 1.0
    context: Dict[str, Any]
    timestamp: datetime

@dataclass
class TTSResponse:
    """Text-to-Speech response"""
    request_id: str
    audio_url: str
    duration: float
    file_size: int
    processing_time: float
    voice_used: str
    emotion_applied: str
    language: str
    timestamp: datetime

@dataclass
class VoiceProfile:
    """Voice profile configuration"""
    profile_id: str
    name: str
    description: str
    voice_characteristics: Dict[str, Any]
    emotion_mappings: Dict[str, Dict[str, Any]]
    language: str
    created_at: datetime
    updated_at: datetime

class VoiceSynthesizer:
    """Voice synthesis engine"""
    
    def __init__(self):
        self.voice_profiles = self._initialize_voice_profiles()
        self.audio_cache: Dict[str, bytes] = {}
        self.cache_dir = Path("audio_cache")
        self.cache_dir.mkdir(exist_ok=True)
        
        # Initialize system-specific TTS
        self.tts_engine = self._initialize_tts_engine()
    
    def _initialize_voice_profiles(self) -> Dict[str, VoiceProfile]:
        """Initialize voice profiles"""
        profiles = {}
        
        # Wise Big Sister - Primary voice
        profiles["wise_big_sister"] = VoiceProfile(
            profile_id="wise_big_sister",
            name="Wise Big Sister",
            description="Warm, grounded, and deeply caring voice with wisdom and gentle authority",
            voice_characteristics={
                "gender": "female",
                "age_range": "25-35",
                "tone": "warm",
                "pitch": "medium-low",
                "pace": "medium",
                "accent": "neutral_american",
                "warmth": 0.8,
                "authority": 0.6,
                "empathy": 0.9
            },
            emotion_mappings={
                "neutral": {"pitch": 1.0, "speed": 1.0, "warmth": 0.7},
                "warm": {"pitch": 0.9, "speed": 0.9, "warmth": 0.9},
                "caring": {"pitch": 0.8, "speed": 0.8, "warmth": 1.0},
                "wise": {"pitch": 0.7, "speed": 0.7, "warmth": 0.8},
                "gentle": {"pitch": 1.1, "speed": 0.9, "warmth": 0.9},
                "encouraging": {"pitch": 1.0, "speed": 1.1, "warmth": 0.8}
            },
            language="en",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Warm and Grounded
        profiles["warm_grounded"] = VoiceProfile(
            profile_id="warm_grounded",
            name="Warm & Grounded",
            description="Comforting voice with earthy, authentic qualities",
            voice_characteristics={
                "gender": "female",
                "age_range": "30-40",
                "tone": "warm",
                "pitch": "medium",
                "pace": "slow-medium",
                "accent": "neutral_american",
                "warmth": 0.9,
                "authority": 0.5,
                "empathy": 0.8
            },
            emotion_mappings={
                "neutral": {"pitch": 1.0, "speed": 0.9, "warmth": 0.8},
                "warm": {"pitch": 0.9, "speed": 0.8, "warmth": 1.0},
                "caring": {"pitch": 0.8, "speed": 0.8, "warmth": 1.0},
                "wise": {"pitch": 0.7, "speed": 0.7, "warmth": 0.9},
                "gentle": {"pitch": 1.1, "speed": 0.9, "warmth": 0.9},
                "encouraging": {"pitch": 1.0, "speed": 1.0, "warmth": 0.9}
            },
            language="en",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Intimate and Personal
        profiles["intimate"] = VoiceProfile(
            profile_id="intimate",
            name="Intimate & Personal",
            description="Soft, close voice for personal conversations",
            voice_characteristics={
                "gender": "female",
                "age_range": "20-30",
                "tone": "soft",
                "pitch": "medium-high",
                "pace": "slow",
                "accent": "neutral_american",
                "warmth": 0.9,
                "authority": 0.4,
                "empathy": 1.0
            },
            emotion_mappings={
                "neutral": {"pitch": 1.1, "speed": 0.8, "warmth": 0.9},
                "warm": {"pitch": 1.0, "speed": 0.7, "warmth": 1.0},
                "caring": {"pitch": 0.9, "speed": 0.7, "warmth": 1.0},
                "wise": {"pitch": 0.8, "speed": 0.6, "warmth": 0.9},
                "gentle": {"pitch": 1.2, "speed": 0.8, "warmth": 1.0},
                "encouraging": {"pitch": 1.1, "speed": 0.9, "warmth": 0.9}
            },
            language="en",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        return profiles
    
    def _initialize_tts_engine(self) -> str:
        """Initialize TTS engine based on platform"""
        system = platform.system().lower()
        
        if system == "windows":
            # Use Windows built-in SAPI
            return "sapi"
        elif system == "darwin":  # macOS
            # Use macOS built-in say command
            return "say"
        elif system == "linux":
            # Try to find available TTS engines
            if self._check_engine_available("espeak"):
                return "espeak"
            elif self._check_engine_available("festival"):
                return "festival"
            else:
                return "mock"
        else:
            return "mock"
    
    def _check_engine_available(self, engine: str) -> bool:
        """Check if TTS engine is available"""
        try:
            result = subprocess.run([engine, "--help"], 
                                      capture_output=True, 
                                      text=True, 
                                      timeout=5)
            return result.returncode == 0
        except:
            return False
    
    async def synthesize_speech(self, request: TTSRequest) -> TTSResponse:
        """Synthesize speech from text"""
        start_time = datetime.now(timezone.utc)
        
        try:
            # Get voice profile
            profile = self.voice_profiles.get(request.voice_profile, self.voice_profiles["wise_big_sister"])
            
            # Apply emotion mapping
            emotion_config = profile.emotion_mappings.get(request.emotion, profile.emotion_mappings["neutral"])
            
            # Process text
            processed_text = self._preprocess_text(request.text)
            
            # Generate audio
            audio_data = await self._generate_audio(processed_text, profile, emotion_config, request)
            
            # Save to cache
            audio_url = await self._save_audio(audio_data, request.request_id)
            
            # Calculate duration
            duration = self._calculate_duration(audio_data)
            
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return TTSResponse(
                request_id=request.request_id,
                audio_url=audio_url,
                duration=duration,
                file_size=len(audio_data),
                processing_time=processing_time,
                voice_used=request.voice_profile,
                emotion_applied=request.emotion,
                language=request.language,
                timestamp=start_time
            )
            
        except Exception as e:
            logger.error(f"Error in speech synthesis: {e}")
            return TTSResponse(
                request_id=request.request_id,
                audio_url="",
                duration=0.0,
                file_size=0,
                processing_time=0.0,
                voice_used=request.voice_profile,
                emotion_applied=request.emotion,
                language=request.language,
                timestamp=start_time
            )
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for better speech synthesis"""
        # Add natural pauses
        text = text.replace(".", ". ")
        text = text.replace("!", "! ")
        text = text.replace("?", "? ")
        
        # Add emphasis for important words
        important_words = ["Sallie", "love", "wisdom", "growth", "journey", "connection"]
        for word in important_words:
            if word.lower() in text.lower():
                text = text.replace(word, f"<emphasis>{word}</emphasis>")
        
        return text
    
    async def _generate_audio(self, text: str, profile: VoiceProfile, emotion_config: Dict[str, Any], request: TTSRequest) -> bytes:
        """Generate audio using appropriate TTS engine"""
        if self.tts_engine == "mock":
            return await self._mock_synthesis(text, profile, emotion_config, request)
        elif self.tts_engine == "say":
            return await self._macos_say_synthesis(text, profile, emotion_config, request)
        elif self.tts_engine == "espeak":
            return await self._espeak_synthesis(text, profile, emotion_config, request)
        elif self.tts_engine == "sapi":
            return await self._windows_sapi_synthesis(text, profile, emotion_config, request)
        else:
            return await self._mock_synthesis(text, profile, emotion_config, request)
    
    async def _mock_synthesis(self, text: str, profile: VoiceProfile, emotion_config: Dict[str, Any], request: TTSRequest) -> bytes:
        """Mock synthesis for demo purposes"""
        # Generate simple sine wave audio
        sample_rate = 22050
        duration = len(text) * 0.1  # Rough estimate: 0.1s per character
        samples = int(sample_rate * duration)
        
        # Generate sine wave with modulation
        t = np.linspace(0, duration, samples)
        
        # Base frequency (adjusted for pitch)
        base_freq = 200  # Hz
        pitch_factor = emotion_config.get("pitch", 1.0)
        frequency = base_freq * pitch_factor
        
        # Generate audio with envelope
        audio = np.sin(2 * np.pi * frequency * t)
        
        # Apply envelope (fade in/out)
        envelope = np.ones_like(audio)
        fade_samples = int(0.1 * sample_rate)
        envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
        envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
        
        audio = audio * envelope
        
        # Convert to 16-bit PCM
        audio_int16 = (audio * 32767).astype(np.int16)
        
        # Create WAV file in memory
        with io.BytesIO() as wav_buffer:
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(sample_rate)
                wav_file.writeframes(audio_int16)
            
            return wav_buffer.getvalue()
    
    async def _macos_say_synthesis(self, text: str, profile: VoiceProfile, emotion_config: Dict[str, Any], request: TTSRequest) -> bytes:
        """macOS say command synthesis"""
        try:
            # Build say command
            cmd = ['say', '-v', str(emotion_config.get('speed', 200)), '-r', str(int(emotion_config.get('pitch', 200))), text]
            
            # Execute command
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            
            if result.returncode == 0:
                # Convert AIFF to WAV
                return await self._convert_aiff_to_wav(result.stdout)
            else:
                logger.error(f"say command failed: {result.stderr}")
                return await self._mock_synthesis(text, profile, emotion_config, request)
                
        except Exception as e:
            logger.error(f"Error in macOS synthesis: {e}")
            return await self._mock_synthesis(text, profile, emotion_config, request)
    
    async def _espeak_synthesis(self, text: str, profile: VoiceProfile, emotion_config: Dict[str, Any], request: TTSRequest) -> bytes:
        """eSpeak synthesis"""
        try:
            # Build espeak command
            cmd = ['espeak', '-w', '-s', str(int(emotion_config.get('speed', 175))), '-p', str(int(emotion_config.get('pitch', 50))), text]
            
            # Execute command
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            
            if result.returncode == 0:
                return result.stdout
            else:
                logger.error(f"espeak command failed: {result.stderr}")
                return await self._mock_synthesis(text, profile, emotion_config, request)
                
        except Exception as e:
            logger.error(f"Error in espeak synthesis: {e}")
            return await self._mock_synthesis(text, profile, emotion_config, request)
    
    async def _windows_sapi_synthesis(self, text: str, profile: VoiceProfile, emotion_config: Dict[str, Any], request: TTSRequest) -> bytes:
        """Windows SAPI synthesis"""
        try:
            # Use PowerShell with SAPI
            powershell_script = f'''
            Add-Type -AssemblyName System.Speech
            $synth = New-Object System.Speech.Synthesis.Synthesizer
            $voice = $synth.GetInstalledVoices() | Where-Object {{$_.Gender -eq "Female"}} | Select-Object -First
            $synth.SelectVoice($voice.Name)
            $synth.Rate = {emotion_config.get('speed', 0)}
            $synth.Volume = {request.volume}
            $synth.Speak("{text}")
            '''
            
            # Execute PowerShell script
            result = subprocess.run(['powershell', '-Command', powershell_script], 
                                      capture_output=True, timeout=30)
            
            if result.returncode == 0:
                # SAPI doesn't directly output audio, so use mock
                return await self._mock_synthesis(text, profile, emotion_config, request)
            else:
                logger.error(f"SAPI synthesis failed: {result.stderr}")
                return await self._mock_synthesis(text, profile, emotion_config, request)
                
        except Exception as e:
            logger.error(f"Error in SAPI synthesis: {e}")
            return await self._mock_synthesis(text, profile, emotion_config, request)
    
    async def _convert_aiff_to_wav(self, aiff_data: bytes) -> bytes:
        """Convert AIFF to WAV format"""
        try:
            # Use ffmpeg if available
            result = subprocess.run(['ffmpeg', '-i', 'pipe:0', '-f', 'wav', 'pipe:1'],
                                      input=aiff_data, capture_output=True, timeout=30)
            
            if result.returncode == 0:
                return result.stdout
            else:
                logger.error(f"ffmpeg conversion failed: {result.stderr}")
                return aiff_data  # Return original if conversion fails
                
        except Exception as e:
            logger.error(f"Error converting AIFF to WAV: {e}")
            return aiff_data
    
    async def _save_audio(self, audio_data: bytes, request_id: str) -> str:
        """Save audio data to cache"""
        filename = f"{request_id}.wav"
        file_path = self.cache_dir / filename
        
        with open(file_path, 'wb') as f:
            f.write(audio_data)
        
        # Return relative URL for serving
        return f"/audio_cache/{filename}"
    
    def _calculate_duration(self, audio_data: bytes) -> float:
        """Calculate audio duration from WAV file"""
        try:
            with io.BytesIO(audio_data) as audio_file:
                with wave.open(audio_file, 'rb') as wav_file:
                    frames = wav_file.getnframes()
                    sample_rate = wav_file.getframerate()
                    return frames / sample_rate
        except:
            return 0.0
    
    def get_voice_profile(self, profile_id: str) -> Optional[VoiceProfile]:
        """Get voice profile by ID"""
        return self.voice_profiles.get(profile_id)
    
    def list_voice_profiles(self) -> List[VoiceProfile]:
        """List all available voice profiles"""
        return list(self.voice_profiles.values())
    
    def create_custom_profile(self, profile_id: str, name: str, characteristics: Dict[str, Any]) -> VoiceProfile:
        """Create custom voice profile"""
        profile = VoiceProfile(
            profile_id=profile_id,
            name=name,
            description=characteristics.get('description', 'Custom voice profile'),
            voice_characteristics=characteristics.get('characteristics', {}),
            emotion_mappings=characteristics.get('emotion_mappings', {}),
            language=characteristics.get('language', 'en'),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        self.voice_profiles[profile_id] = profile
        return profile
    
    def clear_cache(self):
        """Clear audio cache"""
        for file_path in self.cache_dir.glob("*.wav"):
            try:
                file_path.unlink()
            except:
                pass
        
        self.audio_cache.clear()

class TTSService:
    """Text-to-Speech service"""
    
    def __init__(self):
        self.synthesizer = VoiceSynthesizer()
        self.active_requests: Dict[str, TTSRequest] = {}
        self.processing_queue = asyncio.Queue()
        self.is_processing = False
        self.processing_task: Optional[asyncio.Task] = None
        
        # Statistics
        self.total_requests = 0
        self.successful_requests = 0
        self.average_processing_time = 0.0
        self.cache_hits = 0
        
    async def submit_tts_request(self, request: TTSRequest) -> str:
        """Submit TTS request for processing"""
        self.active_requests[request.request_id] = request
        self.total_requests += 1
        
        # Add to processing queue
        await self.processing_queue.put(request)
        
        # Start processing if not already running
        if not self.is_processing:
            self.processing_task = asyncio.create_task(self._process_tts_queue())
        
        return request.request_id
    
    async def _process_tts_queue(self):
        """Process TTS requests from queue"""
        self.is_processing = True
        
        while True:
            try:
                request = await asyncio.wait_for(self.processing_queue.get(), timeout=5.0)
                
                # Process the request
                response = await self.synthesizer.synthesize_speech(request)
                
                # Update statistics
                if response.audio_url:
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
                logger.error(f"Error processing TTS request: {e}")
        
        self.is_processing = False
    
    def _store_response(self, response: TTSResponse):
        """Store TTS response (in production, would send via WebSocket)"""
        # For demo, just log the response
        logger.info(f"TTS Response: {response.audio_url} (duration: {response.duration:.2f}s)")
    
    def get_request_status(self, request_id: str) -> Dict[str, Any]:
        """Get status of TTS request"""
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
        """Get TTS service statistics"""
        return {
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'success_rate': self.successful_requests / max(self.total_requests, 1),
            'average_processing_time': self.average_processing_time,
            'active_requests': len(self.active_requests),
            'cache_size': len(self.synthesizer.audio_cache),
            'available_voices': len(self.synthesizer.voice_profiles),
            'tts_engine': self.synthesizer.tts_engine
        }

# Global TTS service instance
tts_service = TTSService()
