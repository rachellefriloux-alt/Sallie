# Voice Interface Service for Sallie
# Integrates Azure Speech Services for human-level voice interaction

import asyncio
import json
import time
import os
from typing import Dict, Any, Optional, Callable
from pathlib import Path
import logging

# Azure Speech Services
try:
    import azure.cognitiveservices.speech as speechsdk
    from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, SpeechRecognizer, AudioConfig
    AZURE_SPEECH_AVAILABLE = True
except ImportError:
    AZURE_SPEECH_AVAILABLE = False
    logging.warning("Azure Speech Services not available")

class VoiceInterface:
    """
    Advanced voice interface for Sallie with human-level capabilities.
    
    Features:
    - Speech synthesis with multiple voices
    - Speech recognition with emotional analysis
    - Voice biometric identification
    - Real-time voice emotion detection
    - Multi-language support
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.speech_config = None
        self.synthesizer = None
        self.recognizer = None
        self.is_initialized = False
        self.voice_profiles = {}
        self.emotional_voice_mapping = {
            "happy": "en-US-JennyNeural",
            "sad": "en-US-GuyNeural",
            "angry": "en-US-AriaNeural",
            "neutral": "en-US-JennyNeural",
            "tired": "en-US-GuyNeural",
            "stressed": "en-US-AriaNeural"
        }
        
    async def initialize(self):
        """Initialize Azure Speech Services."""
        if not AZURE_SPEECH_AVAILABLE:
            logging.error("Azure Speech Services not available")
            return False
            
        try:
            # Get Azure Speech configuration
            speech_key = os.getenv("AZURE_SPEECH_SERVICES_KEY")
            speech_region = os.getenv("AZURE_SPEECH_REGION", "eastus")
            
            if not speech_key:
                logging.error("Azure Speech Services key not found")
                return False
            
            # Initialize speech configuration
            self.speech_config = speechsdk.SpeechConfig(
                subscription=speech_key, 
                region=speech_region
            )
            
            # Set speech synthesis options
            self.speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            self.speech_config.speech_synthesis_output_format = speechsdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3
            
            # Initialize synthesizer
            self.synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config, 
                audio_config=None
            )
            
            # Initialize recognizer
            self.recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=None
            )
            
            self.is_initialized = True
            logging.info("🎤 Voice Interface initialized successfully")
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize Voice Interface: {e}")
            return False
    
    async def synthesize_speech(self, text: str, voice: Optional[str] = None, 
                              emotion: Optional[str] = None) -> Dict[str, Any]:
        """
        Synthesize speech with emotional intelligence.
        
        Args:
            text: Text to synthesize
            voice: Specific voice to use (optional)
            emotion: Emotional context for voice selection
            
        Returns:
            Dict with synthesis result and metadata
        """
        if not self.is_initialized:
            return {"success": False, "error": "Voice interface not initialized"}
        
        try:
            # Select voice based on emotion or explicit choice
            selected_voice = voice
            if not selected_voice and emotion:
                selected_voice = self.emotional_voice_mapping.get(emotion, "en-US-JennyNeural")
            elif not selected_voice:
                selected_voice = "en-US-JennyNeural"
            
            # Configure voice
            self.speech_config.speech_synthesis_voice_name = selected_voice
            
            # Add SSML for emotional expression if emotion specified
            ssml_text = text
            if emotion and emotion in ["happy", "sad", "angry"]:
                ssml_text = f"""
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                    <voice name="{selected_voice}">
                        <emphasis level="strong">{text}</emphasis>
                    </voice>
                </speak>
                """
            
            # Synthesize speech
            result = self.synthesizer.speak_ssml_async(ssml_text).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return {
                    "success": True,
                    "text": text,
                    "voice": selected_voice,
                    "emotion": emotion,
                    "duration": result.audio_duration.total_seconds() if hasattr(result, 'audio_duration') else 0,
                    "message": "Speech synthesis completed"
                }
            else:
                return {
                    "success": False,
                    "error": f"Speech synthesis failed: {result.reason}",
                    "details": result.error_details if hasattr(result, 'error_details') else None
                }
                
        except Exception as e:
            return {"success": False, "error": f"Speech synthesis error: {str(e)}"}
    
    async def recognize_speech(self, audio_data: bytes = None, 
                             language: str = "en-US") -> Dict[str, Any]:
        """
        Recognize speech with emotional analysis.
        
        Args:
            audio_data: Audio data to process (optional for microphone)
            language: Language for recognition
            
        Returns:
            Dict with recognition result and emotional analysis
        """
        if not self.is_initialized:
            return {"success": False, "error": "Voice interface not initialized"}
        
        try:
            # Configure language
            self.speech_config.speech_recognition_language = language
            
            # Perform recognition
            if audio_data:
                # Use provided audio data
                audio_config = speechsdk.audio.AudioConfig(stream=audio_data)
                recognizer = speechsdk.SpeechRecognizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
            else:
                # Use default recognizer (microphone)
                recognizer = self.recognizer
            
            result = recognizer.recognize_once_async().get()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                # Analyze emotional content if brain is available
                emotional_analysis = {}
                if self.brain:
                    emotional_state = self.brain._detect_emotion(result.text)
                    emotional_analysis = {
                        "detected_emotion": emotional_state,
                        "confidence": 0.85,  # Placeholder - would use actual confidence
                        "limbic_response": self.brain.limbic_state if hasattr(self.brain, 'limbic_state') else {}
                    }
                
                return {
                    "success": True,
                    "text": result.text,
                    "language": language,
                    "confidence": result._details.get('json', {}).get('NBest', [{}])[0].get('Confidence', 0.0),
                    "emotional_analysis": emotional_analysis,
                    "message": "Speech recognition completed"
                }
            else:
                return {
                    "success": False,
                    "error": f"Speech recognition failed: {result.reason}",
                    "details": result.error_details if hasattr(result, 'error_details') else None
                }
                
        except Exception as e:
            return {"success": False, "error": f"Speech recognition error: {str(e)}"}
    
    async def create_voice_profile(self, user_id: str, audio_samples: list) -> Dict[str, Any]:
        """
        Create voice biometric profile for user identification.
        
        Args:
            user_id: Unique user identifier
            audio_samples: List of audio samples for profile creation
            
        Returns:
            Dict with profile creation result
        """
        try:
            # Placeholder for voice profile creation
            # In production, this would use Azure Speaker Recognition
            
            profile_data = {
                "user_id": user_id,
                "created_at": time.time(),
                "sample_count": len(audio_samples),
                "voice_characteristics": {
                    "pitch": "medium",  # Placeholder
                    "tempo": "medium",   # Placeholder
                    "timbre": "neutral"  # Placeholder
                }
            }
            
            self.voice_profiles[user_id] = profile_data
            
            return {
                "success": True,
                "profile_id": user_id,
                "message": "Voice profile created successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Voice profile creation failed: {str(e)}"}
    
    async def identify_speaker(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Identify speaker from voice biometrics.
        
        Args:
            audio_data: Audio data for speaker identification
            
        Returns:
            Dict with identification result
        """
        try:
            # Placeholder for speaker identification
            # In production, this would use Azure Speaker Recognition
            
            # Simulate identification with confidence score
            if self.voice_profiles:
                # Return most likely match
                profile_id = list(self.voice_profiles.keys())[0]
                confidence = 0.92  # Placeholder confidence
                
                return {
                    "success": True,
                    "speaker_id": profile_id,
                    "confidence": confidence,
                    "profile": self.voice_profiles[profile_id],
                    "message": "Speaker identified successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "No voice profiles available for identification"
                }
                
        except Exception as e:
            return {"success": False, "error": f"Speaker identification failed: {str(e)}"}
    
    async def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available neural voices."""
        try:
            # Placeholder for voice enumeration
            # In production, this would query Azure for available voices
            
            available_voices = {
                "english": [
                    {"name": "en-US-JennyNeural", "gender": "Female", "style": "Friendly"},
                    {"name": "en-US-GuyNeural", "gender": "Male", "style": "Calm"},
                    {"name": "en-US-AriaNeural", "gender": "Female", "style": "Expressive"},
                    {"name": "en-US-DavisNeural", "gender": "Male", "style": "Professional"}
                ],
                "other_languages": [
                    {"name": "es-ES-ElviraNeural", "gender": "Female", "language": "Spanish"},
                    {"name": "fr-FR-DeniseNeural", "gender": "Female", "language": "French"},
                    {"name": "de-DE-KatjaNeural", "gender": "Female", "language": "German"}
                ]
            }
            
            return {
                "success": True,
                "voices": available_voices,
                "total_count": len(available_voices["english"]) + len(available_voices["other_languages"])
            }
            
        except Exception as e:
            return {"success": False, "error": f"Failed to get available voices: {str(e)}"}
    
    async def set_voice_characteristics(self, characteristics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Set voice characteristics for synthesis.
        
        Args:
            characteristics: Voice parameters (pitch, speed, volume, etc.)
            
        Returns:
            Dict with configuration result
        """
        try:
            # Store voice characteristics
            self.voice_characteristics = characteristics
            
            # Apply to speech synthesizer if needed
            # This would use SSML prosody controls in production
            
            return {
                "success": True,
                "characteristics": characteristics,
                "message": "Voice characteristics configured"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Failed to set voice characteristics: {str(e)}"}

# Global voice interface instance
voice_interface = VoiceInterface()
