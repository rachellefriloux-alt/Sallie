"""
Voice Input Integration for The Great Convergence
Canonical Spec Reference: Section 9.1.2 - Voice System
Complete implementation for speech-to-text during Convergence
"""

import asyncio
import logging
from typing import Optional, Callable
from pathlib import Path
import io

logger = logging.getLogger(__name__)

class VoiceInputHandler:
    """
    Handles voice input for Convergence questions
    Uses browser's built-in Speech Recognition API (Web Speech API)
    """
    
    def __init__(self):
        self.is_listening = False
        self.recognition_language = 'en-US'
        self.continuous_mode = True
        self.interim_results = True
        
    def get_browser_config(self) -> dict:
        """
        Returns configuration for browser-side Speech Recognition
        The browser handles the actual speech recognition using Web Speech API
        """
        return {
            'continuous': self.continuous_mode,
            'interimResults': self.interim_results,
            'language': self.recognition_language,
            'maxAlternatives': 1
        }
    
    async def start_listening(self) -> dict:
        """Start voice input session"""
        self.is_listening = True
        logger.info("Voice input started")
        
        return {
            'status': 'listening',
            'config': self.get_browser_config(),
            'message': 'Speak now... (Sallie is listening)'
        }
    
    async def stop_listening(self) -> dict:
        """Stop voice input session"""
        self.is_listening = False
        logger.info("Voice input stopped")
        
        return {
            'status': 'stopped',
            'message': 'Voice input stopped'
        }
    
    async def process_speech_result(self, transcript: str, is_final: bool) -> dict:
        """
        Process speech recognition result from browser
        
        Args:
            transcript: The recognized text
            is_final: Whether this is the final result or interim
        """
        if not is_final:
            return {
                'type': 'interim',
                'transcript': transcript,
                'confidence': 0.0
            }
        
        # Clean up the transcript
        transcript = transcript.strip()
        
        # Calculate simple confidence based on length and clarity
        word_count = len(transcript.split())
        confidence = min(1.0, word_count / 50.0)  # More words = higher confidence
        
        logger.info(f"Speech processed: {len(transcript)} chars, confidence: {confidence:.2f}")
        
        return {
            'type': 'final',
            'transcript': transcript,
            'word_count': word_count,
            'confidence': confidence,
            'language': self.recognition_language
        }

# Global handler instance
voice_input_handler = VoiceInputHandler()


# Browser-side JavaScript template for voice input
VOICE_INPUT_JS_TEMPLATE = """
// Speech Recognition setup for Convergence
class ConvergenceVoiceInput {
    constructor() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            this.supported = false;
            return;
        }
        
        this.supported = true;
        this.recognition = new SpeechRecognition();
        this.isListening = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.language = 'en-US';
        this.recognition.maxAlternatives = 1;
        
        // Event handlers
        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            this.isListening = true;
            this.onStart && this.onStart();
        };
        
        this.recognition.onresult = (event) => {
            this.interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript + ' ';
                    this.onFinalResult && this.onFinalResult(this.finalTranscript.trim());
                } else {
                    this.interimTranscript += transcript;
                    this.onInterimResult && this.onInterimResult(this.interimTranscript);
                }
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.onError && this.onError(event.error);
        };
        
        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;
            this.onEnd && this.onEnd();
        };
    }
    
    start() {
        if (!this.supported) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return false;
        }
        
        if (this.isListening) {
            return false;
        }
        
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            return false;
        }
    }
    
    stop() {
        if (!this.isListening) {
            return;
        }
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }
    
    // Callback setters
    onStart(callback) {
        this.onStartCallback = callback;
    }
    
    onInterimResult(callback) {
        this.onInterimResultCallback = callback;
    }
    
    onFinalResult(callback) {
        this.onFinalResultCallback = callback;
    }
    
    onError(callback) {
        this.onErrorCallback = callback;
    }
    
    onEnd(callback) {
        this.onEndCallback = callback;
    }
}

// Export for use in components
window.ConvergenceVoiceInput = ConvergenceVoiceInput;
"""

def get_voice_input_instructions() -> str:
    """
    Returns user-friendly instructions for voice input
    """
    return """
    🎤 Voice Input Guide:
    
    1. Click the microphone button to start
    2. Allow browser access to your microphone (first time only)
    3. Speak clearly and naturally
    4. Your words will appear as you speak
    5. Click the microphone again to stop
    6. Edit the text if needed before submitting
    
    Tips:
    • Find a quiet environment
    • Speak at a normal pace
    • Pause briefly between thoughts
    • Say "period" for punctuation
    • Say "new paragraph" for line breaks
    
    Supported Browsers:
    ✅ Chrome / Edge (best support)
    ✅ Safari (good support)
    ❌ Firefox (limited support)
    """

# Export the JavaScript template for frontend integration
def get_voice_js_code() -> str:
    """Returns the JavaScript code for voice input"""
    return VOICE_INPUT_JS_TEMPLATE
