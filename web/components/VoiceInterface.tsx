'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Globe, 
  Waves, 
  Activity,
  Zap,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Headphones,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSpeechRecognition, RecordingState } from '../hooks/useSpeechRecognition';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  onPartialTranscript?: (text: string) => void;
  disabled?: boolean;
  className?: string;
  language?: string;
  compact?: boolean;
  showVisualizer?: boolean;
  showSettings?: boolean;
  autoStart?: boolean;
}

interface VoiceSettings {
  language: string;
  sensitivity: number;
  autoSubmit: boolean;
  continuous: boolean;
  interimResults: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

interface AudioLevel {
  peak: number;
  average: number;
  timestamp: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
];

export function VoiceInterface({
  onTranscript,
  onPartialTranscript,
  disabled = false,
  className = '',
  language = 'en-US',
  compact = false,
  showVisualizer = true,
  showSettings = true,
  autoStart = false,
}: VoiceInterfaceProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [audioLevels, setAudioLevels] = useState<AudioLevel[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [settings, setSettings] = useState<VoiceSettings>({
    language,
    sensitivity: 0.7,
    autoSubmit: true,
    continuous: false,
    interimResults: true,
    noiseSuppression: true,
    echoCancellation: true,
  });

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal && text.trim()) {
        onTranscript(text.trim());
      } else if (!isFinal && text.trim()) {
        onPartialTranscript?.(text.trim());
      }
    },
    [onTranscript, onPartialTranscript]
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
    language: settings.language,
    continuous: settings.continuous,
    interimResults: settings.interimResults,
    onTranscript: handleTranscript,
  });

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && isSupported && !disabled && !isListening) {
      startListening();
    }
  }, [autoStart, isSupported, disabled, isListening, startListening]);

  // Simulate audio level monitoring
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const newLevel: AudioLevel = {
          peak: Math.random() * 0.8 + (Math.random() > 0.7 ? Math.random() * 0.2 : 0),
          average: Math.random() * 0.4 + 0.1,
          timestamp: Date.now(),
        };
        setAudioLevels(prev => [...prev.slice(-20), newLevel]);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevels([]);
    }
  }, [isListening]);

  // Monitor connection quality
  useEffect(() => {
    const checkConnection = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g') setConnectionQuality('excellent');
        else if (effectiveType === '3g') setConnectionQuality('good');
        else if (effectiveType === '2g') setConnectionQuality('fair');
        else setConnectionQuality('poor');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update language when settings change
  useEffect(() => {
    setLanguage(settings.language);
  }, [settings.language, setLanguage]);

  // Handle final transcript when recording stops
  useEffect(() => {
    if (recordingState === 'idle' && transcript && settings.autoSubmit) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [recordingState, transcript, onTranscript, resetTranscript, settings.autoSubmit]);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [disabled, isListening, startListening, stopListening]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        handleClick();
      }
      if (e.key === 'Escape' && isListening) {
        e.preventDefault();
        stopListening();
        resetTranscript();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettingsPanel(!showSettingsPanel);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, isListening, stopListening, resetTranscript, showSettingsPanel]);

  const currentLanguage = useMemo(() => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language) || SUPPORTED_LANGUAGES[0],
    [settings.language]
  );

  const getButtonStyles = (): string => {
    const baseStyles = `
      relative p-4 rounded-2xl transition-all duration-300 transform
      focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900
      ${compact ? 'scale-90' : 'scale-100'}
    `;

    if (!isSupported || disabled) {
      return `${baseStyles} bg-gray-800 text-gray-600 cursor-not-allowed opacity-50`;
    }

    switch (recordingState) {
      case 'listening':
        return `${baseStyles} bg-gradient-to-br from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 focus:ring-violet-500 shadow-lg shadow-violet-500/25`;
      case 'processing':
        return `${baseStyles} bg-gradient-to-br from-blue-600 to-cyan-600 text-white cursor-wait focus:ring-blue-500 shadow-lg shadow-blue-500/25`;
      case 'error':
        return `${baseStyles} bg-gradient-to-br from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 focus:ring-red-500 shadow-lg shadow-red-500/25`;
      default:
        return `${baseStyles} bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 hover:from-gray-600 hover:to-gray-700 hover:text-white focus:ring-primary shadow-lg hover:shadow-gray-500/10`;
    }
  };

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

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'good': return <Wifi className="w-4 h-4 text-blue-400" />;
      case 'fair': return <Wifi className="w-4 h-4 text-yellow-400" />;
      case 'poor': return <WifiOff className="w-4 h-4 text-red-400" />;
    }
  };

  const renderVisualizer = () => {
    if (!showVisualizer || !isListening) return null;

    return (
      <div className="absolute -inset-2 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20" />
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center space-x-1">
          {audioLevels.slice(-15).map((level, index) => (
            <motion.div
              key={index}
              className="w-1 bg-gradient-to-t from-violet-400 to-purple-400 rounded-full"
              initial={{ height: 2 }}
              animate={{ 
                height: Math.max(2, level.peak * 60),
                opacity: level.peak > 0.5 ? 1 : 0.6
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPulseAnimation = () => {
    if (recordingState !== 'listening') return null;

    return (
      <>
        <motion.div
          className="absolute inset-0 rounded-2xl bg-violet-500"
          animate={{ scale: [1, 1.2, 1.3], opacity: [0.3, 0.1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl bg-purple-500"
          animate={{ scale: [1, 1.1, 1.2], opacity: [0.2, 0.05, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
        />
      </>
    );
  };

  const renderIcon = () => {
    const iconClass = 'w-6 h-6';

    switch (recordingState) {
      case 'processing':
        return <Loader2 className={`${iconClass} animate-spin`} />;
      case 'error':
        return (
          <div className="relative">
            <MicOff className={iconClass} />
            <AlertCircle className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
          </div>
        );
      case 'listening':
        return <Mic className={iconClass} />;
      default:
        return <Mic className={iconClass} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className="relative"
      >
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
          {renderVisualizer()}
          {renderPulseAnimation()}
        </button>

        {/* Status indicators */}
        <div className="absolute -top-2 -right-2 flex items-center space-x-1">
          {isListening && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          )}
          {getConnectionIcon()}
        </div>
      </motion.div>

      {/* Premium Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3 shadow-2xl max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Voice Interface</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                {recordingState === 'listening' && (
                  <>
                    <div>Listening... {interimTranscript && `"${interimTranscript}"`}</div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-3 h-3 text-green-400" />
                      <span>Connection: {connectionQuality}</span>
                    </div>
                  </>
                )}
                {recordingState === 'processing' && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Processing speech...</span>
                  </div>
                )}
                {recordingState === 'error' && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error || 'Voice input error'}</span>
                  </div>
                )}
                {recordingState === 'idle' && (
                  <>
                    <div>Click to start or press Ctrl+Shift+V</div>
                    <div>Language: {currentLanguage.flag} {currentLanguage.name}</div>
                  </>
                )}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-2xl w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-violet-400" />
                  <span>Voice Settings</span>
                </h3>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {/* Language Selector */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Language</label>
                  <button
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span>{currentLanguage.flag} {currentLanguage.name}</span>
                    <Globe className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Sensitivity Slider */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Sensitivity: {Math.round(settings.sensitivity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sensitivity * 100}
                    onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: parseInt(e.target.value) / 100 }))}
                    className="w-full"
                    title="Adjust microphone sensitivity"
                    aria-label="Microphone sensitivity"
                  />
                </div>

                {/* Toggle Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.autoSubmit}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoSubmit: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                    <span>Auto-submit when done</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.continuous}
                      onChange={(e) => setSettings(prev => ({ ...prev, continuous: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                    <span>Continuous listening</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={settings.noiseSuppression}
                      onChange={(e) => setSettings(prev => ({ ...prev, noiseSuppression: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                    <span>Noise suppression</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Selector Dropdown */}
      <AnimatePresence>
        {showLanguageSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSettings(prev => ({ ...prev, language: lang.code }));
                    setShowLanguageSelector(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors flex items-center space-x-2 ${
                    lang.code === settings.language ? 'bg-violet-600/20 text-violet-400' : 'text-gray-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader live region */}
      <div className="sr-only" role="status" aria-live="polite">
        {recordingState === 'listening' && interimTranscript && `Hearing: ${interimTranscript}`}
        {recordingState === 'error' && error}
      </div>
    </div>
  );
}

export default VoiceInterface;