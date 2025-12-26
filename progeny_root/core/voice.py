"""Voice interface (STT/TTS)."""

import logging
import threading

logger = logging.getLogger("system")

# Try importing dependencies
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    logger.warning("pyttsx3 not found. TTS disabled.")

try:
    import speech_recognition as sr
    STT_AVAILABLE = True
except ImportError:
    STT_AVAILABLE = False
    logger.warning("speech_recognition not found. STT disabled.")

class VoiceSystem:
    """
    Handles Speech-to-Text (Hearing) and Text-to-Speech (Speaking).
    """
    def __init__(self):
        self.is_listening = False
        
        # Initialize TTS
        if TTS_AVAILABLE:
            try:
                self.engine = pyttsx3.init()
                # Configure voice (optional, pick a female voice if available)
                voices = self.engine.getProperty('voices')
                for voice in voices:
                    if "female" in voice.name.lower() or "zira" in voice.name.lower():
                        self.engine.setProperty('voice', voice.id)
                        break
                self.engine.setProperty('rate', 160) # Slightly faster than default
            except Exception as e:
                logger.error(f"Failed to init TTS engine: {e}")
                self.engine = None

        # Initialize STT
        if STT_AVAILABLE:
            self.recognizer = sr.Recognizer()
            try:
                self.microphone = sr.Microphone()
            except Exception as e:
                logger.error(f"Failed to init Microphone: {e}")
                self.microphone = None

    def listen(self) -> str:
        """
        Blocks until speech is detected and transcribed.
        """
        if not STT_AVAILABLE or not getattr(self, 'microphone', None):
            return ""
            
        with self.microphone as source:
            logger.info("[VOICE] Listening...")
            try:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                text = self.recognizer.recognize_google(audio)
                logger.info(f"[VOICE] Heard: {text}")
                return text
            except sr.WaitTimeoutError:
                return ""
            except sr.UnknownValueError:
                return ""
            except Exception as e:
                logger.error(f"[VOICE] Error: {e}")
                return ""

    def speak(self, text: str):
        """
        Synthesizes audio from text.
        """
        logger.info(f"[VOICE] Speaking: {text}")
        if TTS_AVAILABLE and getattr(self, 'engine', None):
            # Run in a separate thread to avoid blocking the main loop
            threading.Thread(target=self._speak_thread, args=(text,)).start()

    def _speak_thread(self, text: str):
        try:
            # Re-initializing engine in thread might be safer for some engines, 
            # but pyttsx3 usually handles it if runAndWait is called.
            # However, pyttsx3 is not thread-safe by default on some platforms.
            # For simplicity in this prototype, we try direct call.
            self.engine.say(text)
            self.engine.runAndWait()
        except Exception as e:
            logger.error(f"[VOICE] TTS Error: {e}")
