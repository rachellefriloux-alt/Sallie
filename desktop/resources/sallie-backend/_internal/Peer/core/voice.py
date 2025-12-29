"""Voice interface (STT/TTS) - Section 9.1.2.

Enhanced with:
- Wake word detection (Porcupine or keyword matching)
- Voice commands
- Emotional prosody based on limbic state
- Voice calibration
- Local Whisper STT (preferred)
- Local Piper/Coqui TTS (preferred)
"""

import logging
import threading
import time
import subprocess
import tempfile
import wave
import numpy as np
from typing import Dict, Any, Optional, Callable
from pathlib import Path

logger = logging.getLogger("voice")

# Try importing dependencies - prefer local models (Whisper/Piper) over cloud
WHISPER_AVAILABLE = False
PIPER_AVAILABLE = False
COQUI_AVAILABLE = False
PYTTSX3_AVAILABLE = False
SPEECH_RECOGNITION_AVAILABLE = False
WHISPER_MODEL = None

# Try Whisper (local STT)
try:
    import whisper
    WHISPER_AVAILABLE = True
    # Load base model (configurable via config.json)
    try:
        WHISPER_MODEL = whisper.load_model("base")
        logger.info("Whisper (local STT) available - base model loaded")
    except Exception as e:
        logger.warning(f"Whisper model loading failed: {e}")
        WHISPER_AVAILABLE = False
except ImportError:
    logger.warning("openai-whisper not found. Local STT disabled. Falling back to speech_recognition.")

# Try Piper (local TTS)
try:
    # Piper uses piper-tts command-line tool
    result = subprocess.run(["piper", "--version"], capture_output=True, timeout=2)
    if result.returncode == 0:
        PIPER_AVAILABLE = True
        logger.info("Piper (local TTS) available")
except (FileNotFoundError, subprocess.TimeoutExpired):
    logger.warning("piper not found in PATH. Local TTS disabled. Falling back to Coqui or pyttsx3.")

# Try Coqui TTS (alternative local TTS)
try:
    from TTS.api import TTS
    COQUI_AVAILABLE = True
    logger.info("Coqui TTS (local TTS) available")
except ImportError:
    logger.debug("TTS (Coqui) not found. Coqui TTS disabled.")

# Fallback to pyttsx3 (basic TTS)
try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    logger.warning("pyttsx3 not found. Basic TTS fallback disabled.")

# Fallback to speech_recognition (Google STT - not local)
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    logger.warning("speech_recognition not found. Cloud STT fallback disabled.")

# Audio processing
try:
    import sounddevice as sd
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    logger.warning("sounddevice not found. Audio I/O disabled.")


class VoiceSystem:
    """
    Voice Interface - Section 9.1.2.
    
    Features:
    - Speech-to-Text (Whisper preferred, Google fallback)
    - Text-to-Speech (Piper/Coqui preferred, pyttsx3 fallback)
    - Wake word detection (keyword matching, Porcupine optional)
    - Voice commands
    - Emotional prosody based on limbic state
    - Voice calibration support
    """
    
    def __init__(self, wake_word: str = "Sallie", limbic_system=None, config: Optional[Dict[str, Any]] = None):
        """
        Initialize Voice System.
        
        Args:
            wake_word: Wake word for activation (default: "Sallie")
            limbic_system: LimbicSystem for emotional prosody
            config: Configuration dict (from config.json voice section)
        """
        self.wake_word = wake_word.lower()
        self.limbic = limbic_system
        self.is_listening = False
        self.wake_word_detected = False
        self.config = config or {}
        self.voice_config = self._load_voice_config()
        
        # Initialize Whisper model if available
        if WHISPER_AVAILABLE and WHISPER_MODEL:
            self.whisper_model = WHISPER_MODEL
            logger.info("[VOICE] Whisper STT initialized (local)")
        else:
            self.whisper_model = None
        
        # Initialize TTS (prefer local, fallback to pyttsx3)
        self.tts_engine = None
        self.tts_type = None
        
        if PIPER_AVAILABLE:
            self.tts_type = "piper"
            logger.info("[VOICE] Piper TTS initialized (local)")
        elif COQUI_AVAILABLE:
            try:
                self.tts_engine = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)
                self.tts_type = "coqui"
                logger.info("[VOICE] Coqui TTS initialized (local)")
            except Exception as e:
                logger.warning(f"[VOICE] Coqui TTS init failed: {e}")
                self.tts_engine = None
        elif PYTTSX3_AVAILABLE:
            try:
                self.tts_engine = pyttsx3.init()
                # Configure voice (prefer female voice)
                voices = self.tts_engine.getProperty('voices')
                for voice in voices:
                    if "female" in voice.name.lower() or "zira" in voice.name.lower():
                        self.tts_engine.setProperty('voice', voice.id)
                        break
                self.tts_engine.setProperty('rate', 160)
                self.tts_type = "pyttsx3"
                logger.info("[VOICE] pyttsx3 TTS initialized (fallback)")
            except Exception as e:
                logger.error(f"[VOICE] Failed to init pyttsx3: {e}")
                self.tts_engine = None
        
        # Initialize STT fallback (speech_recognition)
        if SPEECH_RECOGNITION_AVAILABLE and not WHISPER_AVAILABLE:
            self.recognizer = sr.Recognizer()
            try:
                self.microphone = sr.Microphone()
                logger.info("[VOICE] speech_recognition STT initialized (fallback, not local)")
            except Exception as e:
                logger.error(f"[VOICE] Failed to init Microphone: {e}")
                self.microphone = None
        else:
            self.recognizer = None
            self.microphone = None
        
        # Audio configuration (16kHz mono for STT, 24kHz for TTS)
        self.sample_rate_stt = 16000
        self.sample_rate_tts = 24000
        self.channels = 1
    
    def _load_voice_config(self) -> Dict[str, Any]:
        """Load voice configuration from heritage/preferences.json."""
        try:
            prefs_file = Path("progeny_root/limbic/heritage/preferences.json")
            if prefs_file.exists():
                import json
                with open(prefs_file, "r", encoding="utf-8") as f:
                    prefs = json.load(f)
                    return prefs.get("voice_config", {})
        except Exception as e:
            logger.debug(f"Could not load voice_config: {e}")
        return {}
    
    def listen(self, use_wake_word: bool = True) -> str:
        """
        Blocks until speech is detected and transcribed.
        
        Args:
            use_wake_word: If True, wait for wake word before listening
        
        Returns:
            Transcribed text (empty if timeout/no speech)
        """
        if use_wake_word:
            if not self._wait_for_wake_word():
                return ""
        
        # Record audio
        if not AUDIO_AVAILABLE:
            logger.error("[VOICE] sounddevice not available for audio recording")
            return ""
        
        try:
            logger.info("[VOICE] Listening for speech...")
            # Record 5 seconds max
            duration = 5
            audio_data = sd.rec(
                int(duration * self.sample_rate_stt),
                samplerate=self.sample_rate_stt,
                channels=self.channels,
                dtype='float32'
            )
            sd.wait()  # Wait until recording is finished
            
            # Transcribe using Whisper (preferred) or fallback
            if self.whisper_model:
                return self._transcribe_whisper(audio_data)
            elif self.recognizer and self.microphone:
                return self._transcribe_speech_recognition(audio_data)
            else:
                logger.error("[VOICE] No STT method available")
                return ""
                
        except Exception as e:
            logger.error(f"[VOICE] Listen error: {e}")
            return ""
    
    def _transcribe_whisper(self, audio_data: np.ndarray) -> str:
        """Transcribe audio using Whisper (local)."""
        try:
            # Whisper expects audio in [-1.0, 1.0] range
            audio_norm = audio_data.flatten().astype(np.float32)
            if audio_norm.max() > 1.0:
                audio_norm = audio_norm / np.abs(audio_norm).max()
            
            result = self.whisper_model.transcribe(audio_norm)
            text = result.get("text", "").strip()
            logger.info(f"[VOICE] Whisper transcribed: {text}")
            return text
        except Exception as e:
            logger.error(f"[VOICE] Whisper transcription error: {e}")
            return ""
    
    def _transcribe_speech_recognition(self, audio_data: np.ndarray) -> str:
        """Transcribe audio using speech_recognition (fallback, not local)."""
        try:
            # Convert numpy array to WAV format for speech_recognition
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                with wave.open(tmp_file.name, 'wb') as wf:
                    wf.setnchannels(self.channels)
                    wf.setsampwidth(2)  # 16-bit
                    wf.setframerate(self.sample_rate_stt)
                    # Convert float32 to int16
                    audio_int16 = (audio_data.flatten() * 32767).astype(np.int16)
                    wf.writeframes(audio_int16.tobytes())
                
                with sr.AudioFile(tmp_file.name) as source:
                    audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
                logger.info(f"[VOICE] speech_recognition transcribed: {text}")
                return text
        except sr.UnknownValueError:
            return ""
        except Exception as e:
            logger.error(f"[VOICE] speech_recognition error: {e}")
            return ""
    
    def speak(self, text: str, emotional_prosody: bool = True):
        """
        Synthesizes audio from text with optional emotional prosody.
        
        Args:
            text: Text to speak
            emotional_prosody: If True, adjust prosody based on limbic state
        """
        logger.info(f"[VOICE] Speaking: {text[:50]}...")
        
        # Adjust prosody based on limbic state if enabled
        if emotional_prosody and self.limbic:
            text = self._apply_emotional_prosody(text)
        
        # Speak using available TTS engine
        if self.tts_type == "piper":
            self._speak_piper(text)
        elif self.tts_type == "coqui" and self.tts_engine:
            self._speak_coqui(text)
        elif self.tts_type == "pyttsx3" and self.tts_engine:
            self._speak_pyttsx3(text)
        else:
            logger.error("[VOICE] No TTS engine available")
    
    def _apply_emotional_prosody(self, text: str) -> str:
        """
        Apply emotional prosody markers based on limbic state.
        
        Returns text with SSML-like markers or modified pacing hints.
        """
        if not self.limbic:
            return text
        
        state = self.limbic.get_state()
        warmth = state.get("warmth", 0.5)
        valence = state.get("valence", 0.5)
        arousal = state.get("arousal", 0.5)
        
        # High warmth: softer, slower
        # High valence: brighter, faster
        # High arousal: faster pace
        # Low valence: slower, more deliberate
        
        # Simple implementation: adjust punctuation for pacing hints
        # (Full prosody requires SSML or TTS engine support)
        if valence < 0.3:  # Low mood
            # Slower pacing hints
            text = text.replace(".", "...")
        elif arousal > 0.7:  # High energy
            # Faster pacing (no changes, let TTS handle)
            pass
        
        return text
    
    def _speak_piper(self, text: str):
        """Speak using Piper TTS (local)."""
        try:
            # Piper command-line usage
            # piper --model model.onnx --output_file output.wav --text "text"
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                cmd = [
                    "piper",
                    "--model", self.config.get("piper_model", "en_US-lessac-medium.onnx"),
                    "--output_file", tmp_file.name,
                    "--text", text
                ]
                result = subprocess.run(cmd, capture_output=True, timeout=10)
                if result.returncode == 0:
                    # Play audio file
                    if AUDIO_AVAILABLE:
                        import soundfile as sf
                        data, samplerate = sf.read(tmp_file.name)
                        sd.play(data, samplerate=samplerate)
                        sd.wait()
                else:
                    logger.error(f"[VOICE] Piper TTS failed: {result.stderr.decode()}")
        except Exception as e:
            logger.error(f"[VOICE] Piper TTS error: {e}")
    
    def _speak_coqui(self, text: str):
        """Speak using Coqui TTS (local)."""
        try:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                self.tts_engine.tts_to_file(text=text, file_path=tmp_file.name)
                if AUDIO_AVAILABLE:
                    import soundfile as sf
                    data, samplerate = sf.read(tmp_file.name)
                    sd.play(data, samplerate=samplerate)
                    sd.wait()
        except Exception as e:
            logger.error(f"[VOICE] Coqui TTS error: {e}")
    
    def _speak_pyttsx3(self, text: str):
        """Speak using pyttsx3 (fallback)."""
        try:
            # Run in separate thread to avoid blocking
            threading.Thread(target=self._speak_pyttsx3_thread, args=(text,), daemon=True).start()
        except Exception as e:
            logger.error(f"[VOICE] pyttsx3 error: {e}")
    
    def _speak_pyttsx3_thread(self, text: str):
        """Thread-safe pyttsx3 speaking."""
        try:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()
        except Exception as e:
            logger.error(f"[VOICE] pyttsx3 thread error: {e}")
    
    def _wait_for_wake_word(self, timeout: float = 30.0) -> bool:
        """
        Wait for wake word detection.
        
        Args:
            timeout: Maximum time to wait in seconds
        
        Returns:
            True if wake word detected, False if timeout
        """
        logger.info(f"[VOICE] Waiting for wake word: '{self.wake_word}'")
        start_time = time.time()
        
        # Simple keyword matching implementation
        # (Full implementation would use Porcupine or custom wake word model)
        while time.time() - start_time < timeout:
            try:
                # Listen briefly for wake word
                if not AUDIO_AVAILABLE:
                    time.sleep(0.5)
                    continue
                
                # Record 1 second chunks
                audio_chunk = sd.rec(
                    int(1.0 * self.sample_rate_stt),
                    samplerate=self.sample_rate_stt,
                    channels=self.channels,
                    dtype='float32'
                )
                sd.wait()
                
                # Transcribe chunk
                if self.whisper_model:
                    text = self._transcribe_whisper(audio_chunk)
                elif self.recognizer:
                    text = self._transcribe_speech_recognition(audio_chunk)
                else:
                    time.sleep(0.5)
                    continue
                
                # Check for wake word
                if self.wake_word in text.lower():
                    logger.info(f"[VOICE] Wake word detected: '{self.wake_word}'")
                    self.wake_word_detected = True
                    return True
                    
            except Exception as e:
                logger.debug(f"[VOICE] Wake word detection error: {e}")
                time.sleep(0.5)
        
        logger.debug("[VOICE] Wake word timeout")
        return False
    
    def start_ambient_listening(self, callback: Callable[[str], None]):
        """
        Start ambient listening mode (continuous listening with wake word).
        
        Args:
            callback: Function to call when command is detected
        """
        self.is_listening = True
        
        def listen_loop():
            while self.is_listening:
                if self._wait_for_wake_word(timeout=60.0):
                    # Wake word detected, now listen for command
                    command = self.listen(use_wake_word=False)
                    if command:
                        callback(command)
                time.sleep(0.1)
        
        threading.Thread(target=listen_loop, daemon=True).start()
        logger.info("[VOICE] Ambient listening started")
    
    def stop_ambient_listening(self):
        """Stop ambient listening mode."""
        self.is_listening = False
        logger.info("[VOICE] Ambient listening stopped")
    
    def calibrate_voice(self, sample_audio_path: Path) -> Dict[str, Any]:
        """
        Calibrate voice from sample audio (voice cloning preparation).
        
        Args:
            sample_audio_path: Path to audio sample of Creator's voice
        
        Returns:
            Calibration data dict
        """
        logger.info(f"[VOICE] Calibrating voice from: {sample_audio_path}")
        
        calibration_data = {
            "sample_path": str(sample_audio_path),
            "calibrated_at": time.time(),
            "status": "pending"
        }
        
        try:
            # Try to use librosa for advanced audio analysis
            try:
                import librosa
                import soundfile as sf
                
                # Load audio file
                audio, sr = librosa.load(str(sample_audio_path), sr=None)
                
                # Extract basic audio features
                duration = len(audio) / sr if sr > 0 else 0
                
                # Calculate RMS (volume) features
                rms = librosa.feature.rms(y=audio)[0]
                volume_mean = float(np.mean(rms))
                volume_std = float(np.std(rms))
                
                # Calculate pitch features (using YIN algorithm if available)
                try:
                    pitch = librosa.yin(audio, fmin=50, fmax=400, sr=sr)
                    pitch_mean = float(np.mean(pitch[pitch > 0])) if len(pitch[pitch > 0]) > 0 else 0.0
                    pitch_std = float(np.std(pitch[pitch > 0])) if len(pitch[pitch > 0]) > 0 else 0.0
                except Exception:
                    # Fallback if YIN not available
                    pitch_mean = 0.0
                    pitch_std = 0.0
                
                # Calculate speech rate (approximate: based on energy changes)
                energy = librosa.feature.rms(y=audio)[0]
                energy_changes = np.diff(energy > np.mean(energy))
                speech_rate = float(np.sum(np.abs(energy_changes)) / duration) if duration > 0 else 0.0
                
                calibration_data.update({
                    "pitch_mean": pitch_mean,
                    "pitch_std": pitch_std,
                    "volume_mean": volume_mean,
                    "volume_std": volume_std,
                    "speech_rate": speech_rate,
                    "duration": duration,
                    "sample_rate": int(sr),
                    "status": "calibrated",
                    "analysis_method": "librosa"
                })
            
            except ImportError:
                # Fallback: use basic audio file analysis
                try:
                    with wave.open(str(sample_audio_path), 'rb') as wf:
                        frames = wf.getnframes()
                        sample_rate = wf.getframerate()
                        duration = frames / float(sample_rate) if sample_rate > 0 else 0
                        
                        # Read audio data for basic volume calculation
                        audio_data = wf.readframes(frames)
                        audio_array = np.frombuffer(audio_data, dtype=np.int16)
                        volume_mean = float(np.mean(np.abs(audio_array))) / 32768.0  # Normalize
                        
                        calibration_data.update({
                            "volume_mean": volume_mean,
                            "duration": duration,
                            "sample_rate": sample_rate,
                            "status": "calibrated",
                            "analysis_method": "basic_wave"
                        })
                
                except Exception as e:
                    logger.warning(f"[VOICE] Basic audio analysis failed: {e}")
                    calibration_data["status"] = "failed"
                    calibration_data["error"] = str(e)
            
            # Update voice_config if available
            if self.voice_config:
                if "calibration" not in self.voice_config:
                    self.voice_config["calibration"] = {}
                self.voice_config["calibration"].update(calibration_data)
                logger.info(f"[VOICE] Voice calibration completed: {calibration_data.get('status')}")
            
        except Exception as e:
            logger.error(f"[VOICE] Voice calibration failed: {e}", exc_info=True)
            calibration_data.update({
                "status": "failed",
                "error": str(e)
            })
        
        return calibration_data
