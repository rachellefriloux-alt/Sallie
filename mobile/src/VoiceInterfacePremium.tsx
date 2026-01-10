import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
} from 'lucide-react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface VoiceInterfacePremiumProps {
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

export const VoiceInterfacePremium: React.FC<VoiceInterfacePremiumProps> = ({
  onTranscript,
  onPartialTranscript,
  disabled = false,
  className = '',
  language = 'en-US',
  compact = false,
  showVisualizer = true,
  showSettings = true,
  autoStart = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [audioLevels, setAudioLevels] = useState<AudioLevel[]>([]);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [isListening, setIsListening] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    language,
    sensitivity: 0.7,
    autoSubmit: true,
    continuous: false,
    interimResults: true,
    noiseSuppression: true,
    echoCancellation: true,
  });

  // Animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const waveHeights = useSharedValue([20, 40, 30, 50, 25]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !disabled && !isListening) {
      startListening();
    }
  }, [autoStart, disabled, isListening]);

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
        
        // Update wave animation
        waveHeights.value = [
          Math.random() * 40 + 20,
          Math.random() * 40 + 40,
          Math.random() * 40 + 30,
          Math.random() * 40 + 50,
          Math.random() * 40 + 25,
        ];
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevels([]);
      waveHeights.value = [20, 40, 30, 50, 25];
    }
  }, [isListening]);

  // Pulse animation
  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
      glowOpacity.value = withTiming(0.5);
    }
  }, [isListening]);

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal && text.trim()) {
        setTranscript(text.trim());
        onTranscript(text.trim());
        if (settings.autoSubmit) {
          stopListening();
        }
      } else if (!isFinal && text.trim()) {
        setInterimTranscript(text.trim());
        onPartialTranscript?.(text.trim());
      }
    },
    [onTranscript, onPartialTranscript, settings.autoSubmit]
  );

  const startListening = useCallback(() => {
    if (disabled) return;
    setIsListening(true);
    setRecordingState('listening');
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    
    // Simulate speech recognition
    setTimeout(() => {
      if (Math.random() > 0.3) {
        handleTranscript('Hello, this is a test transcript', true);
      }
    }, 2000);
  }, [disabled, handleTranscript]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setRecordingState('idle');
    setInterimTranscript('');
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [disabled, isListening, startListening, stopListening]);

  const currentLanguage = useMemo(() => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language) || SUPPORTED_LANGUAGES[0],
    [settings.language]
  );

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Wifi size={16} color="#10B981" />;
      case 'good': return <Wifi size={16} color="#3B82F6" />;
      case 'fair': return <Wifi size={16} color="#F59E0B" />;
      case 'poor': return <WifiOff size={16} color="#EF4444" />;
    }
  };

  const renderVisualizer = () => {
    if (!showVisualizer || !isListening) return null;

    return (
      <View style={styles.visualizerContainer}>
        <View style={styles.waveContainer}>
          {[0, 1, 2, 3, 4].map((index) => {
            const waveStyle = useAnimatedStyle(() => ({
              height: waveHeights.value[index],
              opacity: glowOpacity.value,
            }));
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  waveStyle,
                  { backgroundColor: index % 2 === 0 ? '#8B5CF6' : '#A855F7' }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  const renderPulseAnimation = () => {
    if (!isListening) return null;

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
      opacity: glowOpacity.value,
    }));

    return (
      <>
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
        <Animated.View style={[styles.pulseRing, styles.pulseRingDelayed, pulseStyle]} />
      </>
    );
  };

  const renderIcon = () => {
    switch (recordingState) {
      case 'processing':
        return <Loader2 size={24} color="#FFFFFF" />;
      case 'error':
        return (
          <View style={styles.errorIconContainer}>
            <MicOff size={24} color="#FFFFFF" />
            <AlertCircle size={12} color="#F59E0B" style={styles.errorIndicator} />
          </View>
        );
      case 'listening':
        return <Mic size={24} color="#FFFFFF" />;
      default:
        return <Mic size={24} color="#FFFFFF" />;
    }
  };

  const getButtonGradient = () => {
    if (disabled) {
      return ['#374151', '#1F2937'];
    }
    
    switch (recordingState) {
      case 'listening':
        return ['#8B5CF6', '#A855F7', '#6366F1'];
      case 'processing':
        return ['#3B82F6', '#06B6D4', '#0EA5E9'];
      case 'error':
        return ['#EF4444', '#F97316', '#F59E0B'];
      default:
        return ['#6B7280', '#4B5563', '#374151'];
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Sparkles size={20} color="#EAB308" />
          <Text style={styles.headerTitle}>Voice Interface</Text>
          <Sparkles size={20} color="#EAB308" />
        </View>
        <Text style={styles.headerSubtitle}>
          Premium Voice Recognition
        </Text>
      </View>

      {/* Main Voice Button */}
      <View style={styles.voiceButtonContainer}>
        <TouchableOpacity
          onPress={handleClick}
          disabled={disabled}
          style={[styles.voiceButton, compact && styles.voiceButtonCompact]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={getButtonGradient()}
            style={styles.voiceButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderIcon()}
            {renderVisualizer()}
            {renderPulseAnimation()}
          </LinearGradient>
        </TouchableOpacity>

        {/* Status indicators */}
        <View style={styles.statusIndicators}>
          {isListening && (
            <View style={styles.recordingIndicator} />
          )}
          {getConnectionIcon()}
        </View>
      </View>

      {/* Status Display */}
      <BlurView intensity={20} tint="dark" style={styles.statusCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.statusCardGradient}
        >
          <View style={styles.statusHeader}>
            <Brain size={16} color="#8B5CF6" />
            <Text style={styles.statusTitle}>Voice Status</Text>
            <View style={[styles.statusDot, { backgroundColor: isListening ? '#EF4444' : '#10B981' }]} />
          </View>
          
          <Text style={styles.statusText}>
            {recordingState === 'listening' && 'Listening...'}
            {recordingState === 'processing' && 'Processing...'}
            {recordingState === 'error' && (error || 'Voice input error')}
            {recordingState === 'idle' && 'Ready to listen'}
          </Text>
          
          {interimTranscript && (
            <Text style={styles.interimTranscript}>
              "{interimTranscript}"
            </Text>
          )}
          
          <View style={styles.connectionInfo}>
            <Activity size={12} color="#10B981" />
            <Text style={styles.connectionText}>
              Connection: {connectionQuality}
            </Text>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Settings Panel */}
      {showSettings && (
        <BlurView intensity={20} tint="dark" style={styles.settingsCard}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.settingsCardGradient}
          >
            <View style={styles.settingsHeader}>
              <Settings size={16} color="#8B5CF6" />
              <Text style={styles.settingsTitle}>Voice Settings</Text>
            </View>

            {/* Language Selection */}
            <TouchableOpacity
              onPress={() => setShowLanguageSelector(!showLanguageSelector)}
              style={styles.settingRow}
            >
              <Text style={styles.settingLabel}>Language</Text>
              <View style={styles.languageSelector}>
                <Text style={styles.languageText}>
                  {currentLanguage.flag} {currentLanguage.name}
                </Text>
                <Globe size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Language Dropdown */}
            {showLanguageSelector && (
              <View style={styles.languageDropdown}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      setSettings(prev => ({ ...prev, language: lang.code }));
                      setShowLanguageSelector(false);
                    }}
                    style={[
                      styles.languageOption,
                      lang.code === settings.language && styles.languageOptionSelected
                    ]}
                  >
                    <Text style={styles.languageOptionText}>
                      {lang.flag} {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Sensitivity Slider */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>
                Sensitivity: {Math.round(settings.sensitivity * 100)}%
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View 
                  style={[styles.sliderFill, { width: `${settings.sensitivity * 100}%` }]} 
                />
              </View>
            </View>

            {/* Toggle Options */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setSettings(prev => ({ ...prev, autoSubmit: !prev.autoSubmit }))}
                style={styles.toggleRow}
              >
                <View style={[styles.toggleSwitch, settings.autoSubmit && styles.toggleSwitchOn]} />
                <Text style={styles.toggleText}>Auto-submit when done</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSettings(prev => ({ ...prev, continuous: !prev.continuous }))}
                style={styles.toggleRow}
              >
                <View style={[styles.toggleSwitch, settings.continuous && styles.toggleSwitchOn]} />
                <Text style={styles.toggleText}>Continuous listening</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setSettings(prev => ({ ...prev, noiseSuppression: !prev.noiseSuppression }))}
                style={styles.toggleRow}
              >
                <View style={[styles.toggleSwitch, settings.noiseSuppression && styles.toggleSwitchOn]} />
                <Text style={styles.toggleText}>Noise suppression</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      )}

      {/* Voice Commands */}
      <BlurView intensity={20} tint="dark" style={styles.commandsCard}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.commandsCardGradient}
        >
          <View style={styles.commandsHeader}>
            <Radio size={16} color="#8B5CF6" />
            <Text style={styles.commandsTitle}>Voice Commands</Text>
          </View>
          
          <View style={styles.commandsList}>
            {[
              { command: 'Start listening', description: 'Begin voice input', shortcut: 'Ctrl+Shift+V' },
              { command: 'Stop listening', description: 'End voice input', shortcut: 'Escape' },
              { command: 'Open settings', description: 'Show voice settings', shortcut: 'Ctrl+Shift+S' },
            ].map((item, index) => (
              <View key={index} style={styles.commandItem}>
                <Text style={styles.commandName}>{item.command}</Text>
                <Text style={styles.commandDescription}>{item.description}</Text>
                <Text style={styles.commandShortcut}>{item.shortcut}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </BlurView>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarLeft}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusBarText}>Voice System Active</Text>
        </View>
        <View style={styles.statusBarRight}>
          <Text style={styles.statusBarText}>Premium Recognition</Text>
          <Text style={styles.statusBarSeparator}>•</Text>
          <Text style={styles.statusBarText}>Real-time Processing</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  voiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  voiceButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusIndicators: {
    position: 'absolute',
    top: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'center',
    space: 4,
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  visualizerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    space: 2,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  pulseRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    opacity: 0.3,
  },
  pulseRingDelayed: {
    opacity: 0.2,
  },
  errorIconContainer: {
    position: 'relative',
  },
  errorIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
    overflow: 'hidden',
  },
  statusCardGradient: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  interimTranscript: {
    fontSize: 11,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingsCardGradient: {
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  languageDropdown: {
    backgroundColor: '#1F2937',
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  languageOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  languageOptionSelected: {
    backgroundColor: '#8B5CF620',
  },
  languageOptionText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  toggleContainer: {
    space: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleSwitch: {
    width: 32,
    height: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginRight: 12,
  },
  toggleSwitchOn: {
    backgroundColor: '#8B5CF6',
  },
  toggleText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  commandsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
    overflow: 'hidden',
  },
  commandsCardGradient: {
    padding: 16,
  },
  commandsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  commandsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  commandsList: {
    space: 8,
  },
  commandItem: {
    backgroundColor: '#374151',
    borderRadius: 6,
    padding: 12,
  },
  commandName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  commandDescription: {
    fontSize: 11,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  commandShortcut: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statusBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBarText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBarSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
});