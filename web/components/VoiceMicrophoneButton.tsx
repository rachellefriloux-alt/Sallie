'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSpeechRecognition, RecordingState } from '../hooks/useSpeechRecognition';

interface VoiceMicrophoneButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
  language?: string;
}

// Microphone SVG Icon
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

// Spinner SVG Icon for processing state
const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

// Warning SVG Icon for error state
const WarningIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

/**
 * Voice Microphone Button Component
 * Provides voice input functionality using the Web Speech API
 */
export function VoiceMicrophoneButton({
  onTranscript,
  disabled = false,
  className = '',
  language = 'en-US',
}: VoiceMicrophoneButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal && text.trim()) {
        onTranscript(text.trim());
      }
    },
    [onTranscript]
  );

  const {
    isListening,
    isSupported,
    recordingState,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  } = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onTranscript: handleTranscript,
  });

  // Update language when prop changes
  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  // Handle final transcript when recording stops
  useEffect(() => {
    if (recordingState === 'idle' && transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [recordingState, transcript, onTranscript, resetTranscript]);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [disabled, isListening, startListening, stopListening]);

  // Handle keyboard shortcut (Ctrl+Shift+V or Cmd+Shift+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handleClick();
      }
      // Escape to cancel while listening
      if (e.key === 'Escape' && isListening) {
        e.preventDefault();
        stopListening();
        resetTranscript();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, isListening, stopListening, resetTranscript]);

  // Get button styles based on state
  const getButtonStyles = (): string => {
    const baseStyles = `
      relative p-3 rounded-xl transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    `;

    if (!isSupported || disabled) {
      return `${baseStyles} bg-gray-800 text-gray-600 cursor-not-allowed opacity-50`;
    }

    switch (recordingState) {
      case 'listening':
        return `${baseStyles} bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 animate-pulse-recording`;
      case 'processing':
        return `${baseStyles} bg-violet-600 text-white cursor-wait focus:ring-violet-500`;
      case 'error':
        return `${baseStyles} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseStyles} bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:ring-primary`;
    }
  };

  // Get ARIA label based on state
  const getAriaLabel = (): string => {
    if (!isSupported) {
      return 'Voice input not supported in this browser. Use Chrome, Edge, or Safari.';
    }
    if (disabled) {
      return 'Voice input is disabled';
    }

    switch (recordingState) {
      case 'listening':
        return 'Listening for speech. Click to stop or press Escape.';
      case 'processing':
        return 'Processing speech...';
      case 'error':
        return error || 'Voice input error. Click to try again.';
      default:
        return 'Start voice input. Press Ctrl+Shift+V for keyboard shortcut.';
    }
  };

  // Get tooltip text
  const getTooltipText = (): string => {
    if (!isSupported) {
      return 'Voice input requires Chrome, Edge, or Safari';
    }
    if (error) {
      return error;
    }
    if (recordingState === 'listening') {
      return interimTranscript || 'Listening...';
    }
    if (recordingState === 'processing') {
      return 'Processing...';
    }
    return 'Voice input (Ctrl+Shift+V)';
  };

  // Render icon based on state
  const renderIcon = () => {
    const iconClass = 'w-5 h-5';

    switch (recordingState) {
      case 'processing':
        return <SpinnerIcon className={`${iconClass} animate-spin`} />;
      case 'error':
        return (
          <div className="relative">
            <MicrophoneIcon className={iconClass} />
            <WarningIcon className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
          </div>
        );
      default:
        return <MicrophoneIcon className={iconClass} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={getButtonStyles()}
        aria-label={getAriaLabel()}
        aria-pressed={isListening}
        aria-live="polite"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {renderIcon()}
        
        {/* Pulsing ring animation for listening state */}
        {recordingState === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-xl bg-violet-500 animate-ping opacity-25" />
            <span className="absolute inset-0 rounded-xl bg-violet-500 animate-pulse opacity-20" />
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 
                     bg-gray-800 text-white text-sm rounded-lg shadow-lg
                     whitespace-nowrap z-50 max-w-xs"
        >
          {getTooltipText()}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}

      {/* Screen reader live region for transcript updates */}
      <div className="sr-only" role="status" aria-live="polite">
        {recordingState === 'listening' && interimTranscript && `Hearing: ${interimTranscript}`}
        {recordingState === 'error' && error}
      </div>
    </div>
  );
}

export default VoiceMicrophoneButton;
