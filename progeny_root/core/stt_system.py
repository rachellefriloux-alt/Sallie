"""
Speech-to-Text System for Sallie
Multiple STT engines with fallbacks for maximum compatibility
"""

import logging
import asyncio
import json
from typing import Dict, Any, Optional, List, Callable
from enum import Enum
from pathlib import Path
import tempfile
import wave
import audioop
from datetime import datetime

logger = logging.getLogger(__name__)

class STTEngine(Enum):
    """Available STT engines"""
    WHISPER = "whisper"
    GOOGLE_SPEECH = "google_speech"
    BROWSER_API = "browser_api"
    VOSK = "vosk"
    SPEECHRECOGNITION = "speechrecognition"

class STTResult:
    """STT transcription result"""
    def __init__(
        self,
        text: str,
        confidence: float = 0.0,
        engine: STTEngine = STTEngine.WHISPER,
        processing_time: float = 0.0,
        alternatives: Optional[List[str]] = None
    ):
        self.text = text
        self.confidence = confidence
        self.engine = engine
        self.processing_time = processing_time
        self.alternatives = alternatives or []
        self.timestamp = datetime.now()

class STTSystem:
    """Multi-engine Speech-to-Text system"""
    
    def __init__(self):
        self.engines = {}
        self.fallback_order = [
            STTEngine.GOOGLE_SPEECH,
            STTEngine.BROWSER_API,
            STTEngine.SPEECHRECOGNITION,
            STTEngine.VOSK,
            STTEngine.WHISPER
        ]
        self.current_engine = None
        self.engine_status = {}
        self.audio_buffer = []
        self.is_recording = False
        self.on_transcription_callbacks = []
        
        # Initialize engines
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Initialize all available STT engines"""
        logger.info("Initializing STT engines...")
        
        # Try to initialize each engine
        for engine in self.fallback_order:
            try:
                if engine == STTEngine.WHISPER:
                    self._init_whisper()
                elif engine == STTEngine.GOOGLE_SPEECH:
                    self._init_google_speech()
                elif engine == STTEngine.BROWSER_API:
                    self._init_browser_api()
                elif engine == STTEngine.VOSK:
                    self._init_vosk()
                elif engine == STTEngine.SPEECHRECOGNITION:
                    self._init_speechrecognition()
                
                self.engine_status[engine] = "available"
                logger.info(f"✅ {engine.value} engine initialized")
                
                # Set first available engine as current
                if self.current_engine is None:
                    self.current_engine = engine
                    
            except Exception as e:
                self.engine_status[engine] = f"unavailable: {str(e)}"
                logger.warning(f"❌ {engine.value} engine failed: {e}")
        
        logger.info(f"STT engines initialized. Current engine: {self.current_engine.value if self.current_engine else 'None'}")
    
    def _init_whisper(self):
        """Initialize Whisper STT engine"""
        try:
            import whisper
            # Load the smallest model for faster processing
            model = whisper.load_model("tiny.en")
            self.engines[STTEngine.WHISPER] = {
                "model": model,
                "transcribe": self._whisper_transcribe
            }
        except ImportError:
            raise Exception("Whisper not installed")
        except Exception as e:
            raise Exception(f"Whisper initialization failed: {e}")
    
    def _init_google_speech(self):
        """Initialize Google Speech Recognition engine"""
        try:
            import speech_recognition as sr
            recognizer = sr.Recognizer()
            self.engines[STTEngine.GOOGLE_SPEECH] = {
                "recognizer": recognizer,
                "transcribe": self._google_speech_transcribe
            }
        except ImportError:
            raise Exception("SpeechRecognition not installed")
        except Exception as e:
            raise Exception(f"Google Speech initialization failed: {e}")
    
    def _init_browser_api(self):
        """Initialize Browser Web Speech API (for web interface)"""
        # This would be implemented in the frontend
        # Backend just provides the interface
        self.engines[STTEngine.BROWSER_API] = {
            "transcribe": self._browser_api_transcribe
        }
    
    def _init_vosk(self):
        """Initialize Vosk STT engine"""
        try:
            import vosk
            import json
            
            # Download and load a small model
            model_path = "vosk-model-small-en-us-0.15"
            if not Path(model_path).exists():
                logger.info("Vosk model not found - engine disabled")
                # Don't raise exception, just don't initialize the engine
                return
            
            try:
                model = vosk.Model(model_path)
            except Exception as e:
                logger.warning(f"Vosk model loading failed: {e}")
                return
            self.engines[STTEngine.VOSK] = {
                "model": model,
                "transcribe": self._vosk_transcribe
            }
        except ImportError:
            raise Exception("Vosk not installed")
        except Exception as e:
            raise Exception(f"Vosk initialization failed: {e}")
    
    def _init_speechrecognition(self):
        """Initialize basic SpeechRecognition engine"""
        try:
            import speech_recognition as sr
            recognizer = sr.Recognizer()
            self.engines[STTEngine.SPEECHRECOGNITION] = {
                "recognizer": recognizer,
                "transcribe": self._speechrecognition_transcribe
            }
        except ImportError:
            raise Exception("SpeechRecognition not installed")
        except Exception as e:
            raise Exception(f"SpeechRecognition initialization failed: {e}")
    
    async def transcribe_audio(self, audio_data: bytes, engine: Optional[STTEngine] = None) -> STTResult:
        """Transcribe audio data using specified or best available engine"""
        start_time = datetime.now()
        
        # Determine which engine to use
        if engine and engine in self.engines:
            target_engine = engine
        else:
            target_engine = self.current_engine
        
        if not target_engine:
            raise Exception("No STT engines available")
        
        try:
            # Transcribe using the selected engine
            engine_config = self.engines[target_engine]
            transcribe_func = engine_config["transcribe"]
            
            result = await transcribe_func(audio_data, target_engine)
            result.processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Transcription successful using {target_engine.value}: {result.text[:50]}...")
            return result
            
        except Exception as e:
            logger.error(f"Transcription failed with {target_engine.value}: {e}")
            
            # Try fallback engines
            if target_engine != self.current_engine:
                # Try current engine
                try:
                    return await self.transcribe_audio(audio_data, self.current_engine)
                except:
                    pass
            
            # Try all available engines
            for fallback_engine in self.fallback_order:
                if fallback_engine in self.engines and fallback_engine != target_engine:
                    try:
                        logger.info(f"Trying fallback engine: {fallback_engine.value}")
                        return await self.transcribe_audio(audio_data, fallback_engine)
                    except:
                        continue
            
            raise Exception("All STT engines failed")
    
    async def _whisper_transcribe(self, audio_data: bytes, engine: STTEngine) -> STTResult:
        """Transcribe using Whisper"""
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name
        
        try:
            # Transcribe with Whisper
            model = self.engines[engine]["model"]
            result = model.transcribe(temp_path)
            
            text = result["text"].strip()
            confidence = result.get("confidence", 0.0)
            
            return STTResult(
                text=text,
                confidence=confidence,
                engine=engine
            )
        finally:
            # Clean up temp file
            Path(temp_path).unlink(missing_ok=True)
    
    async def _google_speech_transcribe(self, audio_data: bytes, engine: STTEngine) -> STTResult:
        """Transcribe using Google Speech Recognition"""
        import speech_recognition as sr
        import io
        
        recognizer = self.engines[engine]["recognizer"]
        
        # Convert audio data to AudioFile
        audio_file = io.BytesIO(audio_data)
        
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
        
        try:
            # Try Google Speech Recognition
            text = recognizer.recognize_google(audio)
            confidence = 0.8  # Google doesn't provide confidence
            
            return STTResult(
                text=text,
                confidence=confidence,
                engine=engine
            )
        except sr.UnknownValueError:
            return STTResult(
                text="",
                confidence=0.0,
                engine=engine
            )
    
    async def _browser_api_transcribe(self, audio_data: bytes, engine: STTEngine) -> STTResult:
        """Transcribe using Browser Web Speech API (placeholder)"""
        # This would be implemented in the frontend
        # Backend just returns a placeholder
        return STTResult(
            text="[Browser API transcription would happen here]",
            confidence=0.5,
            engine=engine
        )
    
    async def _vosk_transcribe(self, audio_data: bytes, engine: STTEngine) -> STTResult:
        """Transcribe using Vosk"""
        import vosk
        import json
        import wave
        import io
        
        # Convert audio data to WAV format
        audio_io = io.BytesIO(audio_data)
        
        # Create a temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name
        
        try:
            # Read WAV file
            wf = wave.open(temp_path, 'rb')
            
            # Check if Vosk supports this format
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
                raise Exception("Audio format not supported by Vosk")
            
            model = self.engines[engine]["model"]
            rec = vosk.KaldiRecognizer(model, wf.getframerate())
            
            # Process audio in chunks
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text = result["text"]
                    confidence = result.get("confidence", 0.0)
                    
                    return STTResult(
                        text=text,
                        confidence=confidence,
                        engine=engine
                    )
            
            # Get final result
            final_result = json.loads(rec.FinalResult())
            text = final_result["text"]
            confidence = final_result.get("confidence", 0.0)
            
            return STTResult(
                text=text,
                confidence=confidence,
                engine=engine
            )
            
        finally:
            wf.close()
            Path(temp_path).unlink(missing_ok=True)
    
    async def _speechrecognition_transcribe(self, audio_data: bytes, engine: STTEngine) -> STTResult:
        """Transcribe using basic SpeechRecognition"""
        import speech_recognition as sr
        import io
        
        recognizer = self.engines[engine]["recognizer"]
        
        # Convert audio data to AudioFile
        audio_file = io.BytesIO(audio_data)
        
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
        
        try:
            # Try Sphinx (offline)
            text = recognizer.recognize_sphinx(audio)
            confidence = 0.6  # Sphinx doesn't provide confidence
            
            return STTResult(
                text=text,
                confidence=confidence,
                engine=engine
            )
        except sr.UnknownValueError:
            return STTResult(
                text="",
                confidence=0.0,
                engine=engine
            )
        except sr.RequestError:
            # Sphinx not available, try Google
            return await self._google_speech_transcribe(audio_data, STTEngine.GOOGLE_SPEECH)
    
    def start_recording(self):
        """Start recording audio"""
        self.is_recording = True
        self.audio_buffer = []
        logger.info("Started recording audio")
    
    def stop_recording(self) -> bytes:
        """Stop recording and return audio data"""
        self.is_recording = False
        
        # Combine audio buffer
        if self.audio_buffer:
            audio_data = b''.join(self.audio_buffer)
            self.audio_buffer = []
            logger.info(f"Stopped recording. Audio size: {len(audio_data)} bytes")
            return audio_data
        else:
            logger.warning("No audio data recorded")
            return b''
    
    def add_audio_chunk(self, chunk: bytes):
        """Add audio chunk to buffer"""
        if self.is_recording:
            self.audio_buffer.append(chunk)
    
    async def transcribe_recording(self) -> STTResult:
        """Transcribe the current recording"""
        audio_data = self.stop_recording()
        if not audio_data:
            return STTResult(
                text="",
                confidence=0.0,
                engine=self.current_engine or STTEngine.WHISPER
            )
        
        return await self.transcribe_audio(audio_data)
    
    def register_transcription_callback(self, callback: Callable[[STTResult], None]):
        """Register callback for transcription results"""
        self.on_transcription_callbacks.append(callback)
    
    async def continuous_transcription(self, audio_chunk: bytes):
        """Continuous transcription for real-time audio"""
        if self.is_recording:
            self.add_audio_chunk(audio_chunk)
            
            # Process if we have enough audio
            if len(self.audio_buffer) > 16000:  # About 1 second at 16kHz
                # Take a chunk for transcription
                chunk_size = 16000
                chunk_data = b''.join(self.audio_buffer[-chunk_size:])
                
                try:
                    result = await self.transcribe_audio(chunk_data)
                    
                    # Call callbacks
                    for callback in self.on_transcription_callbacks:
                        try:
                            callback(result)
                        except Exception as e:
                            logger.error(f"Transcription callback error: {e}")
                            
                except Exception as e:
                    logger.error(f"Continuous transcription error: {e}")
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Get status of all STT engines"""
        return {
            "current_engine": self.current_engine.value if self.current_engine else None,
            "available_engines": [engine.value for engine in self.engines.keys()],
            "engine_status": self.engine_status,
            "is_recording": self.is_recording,
            "buffer_size": len(self.audio_buffer)
        }
    
    def set_engine(self, engine: STTEngine):
        """Manually set the preferred STT engine"""
        if engine in self.engines:
            self.current_engine = engine
            logger.info(f"STT engine set to: {engine.value}")
        else:
            logger.error(f"Engine {engine.value} not available")

# Global STT system instance
_stt_system = None

def get_stt_system() -> STTSystem:
    """Get the global STT system instance"""
    global _stt_system
    if _stt_system is None:
        _stt_system = STTSystem()
    return _stt_system

# Convenience functions
async def transcribe_audio(audio_data: bytes, engine: Optional[STTEngine] = None) -> STTResult:
    """Convenience function to transcribe audio"""
    stt = get_stt_system()
    return await stt.transcribe_audio(audio_data, engine)

def start_recording():
    """Convenience function to start recording"""
    stt = get_stt_system()
    stt.start_recording()

def stop_recording() -> bytes:
    """Convenience function to stop recording"""
    stt = get_stt_system()
    return stt.stop_recording()

async def transcribe_recording() -> STTResult:
    """Convenience function to transcribe recording"""
    stt = get_stt_system()
    return await stt.transcribe_recording()
