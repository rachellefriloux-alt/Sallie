import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, StatusBar } from 'react-native';

interface AccessibilitySettings {
  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Navigation
  keyboardNavigation: boolean;
  focusVisible: boolean;
  voiceOver: boolean;
  talkBack: boolean;
  
  // Content
  altText: boolean;
  captions: boolean;
  transcripts: boolean;
  readableFonts: boolean;
  
  // Interaction
  reducedAnimations: boolean;
  extendedTimeouts: boolean;
  simpleInterface: boolean;
  voiceControl: boolean;
  hapticFeedback: boolean;
  
  // Mobile specific
  reduceTransparency: boolean;
  buttonShapes: boolean;
  onOffLabels: boolean;
  differentiateWithoutColor: boolean;
}

interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive' | 'off';
  timestamp: number;
  clearAfter?: number;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announceToScreenReader: (message: string) => void;
  setFocus: (ref: any) => void;
  trapFocus: (container: any) => () => void;
  getContrastRatio: (foreground: string, background: string) => number;
  isColorAccessible: (foreground: string, background: string) => boolean;
  getAccessibleColor: (color: string) => string;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindness: 'none',
  keyboardNavigation: true,
  focusVisible: true,
  voiceOver: false,
  talkBack: false,
  altText: true,
  captions: false,
  transcripts: false,
  readableFonts: false,
  reducedAnimations: false,
  extendedTimeouts: false,
  simpleInterface: false,
  voiceControl: false,
  hapticFeedback: true,
  reduceTransparency: false,
  buttonShapes: false,
  onOffLabels: false,
  differentiateWithoutColor: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
  const [focusTrapRefs, setFocusTrapRefs] = useState<Map<any, () => void>>(new Map());

  // Load settings from AsyncStorage and system preferences
  useEffect(() => {
    loadAccessibilitySettings();
    detectSystemPreferences();
    setupScreenReaderDetection();
    setupVoiceControl();
  }, []);

  // Apply settings to app
  useEffect(() => {
    applyAccessibilitySettings(settings);
  }, [settings]);

  // Clean up announcements
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setAnnouncements(prev => prev.filter(announcement => {
        if (announcement.clearAfter) {
          return now - announcement.timestamp < announcement.clearAfter;
        }
        return true;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('accessibility-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const detectSystemPreferences = async () => {
    // Detect screen reader
    const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    if (screenReaderEnabled) {
      updateSettings({ 
        screenReader: true,
        voiceOver: Platform.OS === 'ios',
        talkBack: Platform.OS === 'android'
      });
    }

    // Detect reduce motion
    const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
    if (reduceMotionEnabled) {
      updateSettings({ reducedMotion: true, reducedAnimations: true });
    }

    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        updateSettings({ 
          screenReader: enabled,
          voiceOver: enabled && Platform.OS === 'ios',
          talkBack: enabled && Platform.OS === 'android'
        });
      }
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        updateSettings({ reducedMotion: enabled, reducedAnimations: enabled });
      }
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  };

  const setupScreenReaderDetection = () => {
    // Screen reader detection is handled by AccessibilityInfo
    // Additional setup can be added here if needed
  };

  const setupVoiceControl = () => {
    // Voice control setup for mobile
    if (settings.voiceControl) {
      // Initialize voice recognition if available
      initializeVoiceRecognition();
    }
  };

  const initializeVoiceRecognition = () => {
    // Voice recognition setup would go here
    // This would use platform-specific APIs
    console.log('Voice control initialized');
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    // Apply font size
    const fontSizes = {
      'small': 14,
      'medium': 16,
      'large': 18,
      'extra-large': 20,
    };

    // Apply high contrast
    if (newSettings.highContrast) {
      StatusBar.setBarStyle('light-content', true);
    } else {
      StatusBar.setBarStyle('dark-content', true);
    }

    // Apply reduced motion
    if (newSettings.reducedMotion || newSettings.reducedAnimations) {
      // Disable animations globally
    }

    // Apply haptic feedback settings
    if (!newSettings.hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Save to AsyncStorage
    try {
      AsyncStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement: AccessibilityAnnouncement = {
      id: Date.now().toString(),
      message,
      priority,
      timestamp: Date.now(),
      clearAfter: 5000, // Clear after 5 seconds
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Announce to screen reader
    announceToScreenReader(message, priority);

    // Trigger haptic feedback if enabled
    if (settings.hapticFeedback) {
      triggerHaptic('light');
    }
  }, [settings.hapticFeedback]);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (settings.screenReader) {
      // Use AccessibilityInfo to announce to screen reader
      // This is platform-specific and may require additional libraries
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [settings.screenReader]);

  const setFocus = useCallback((ref: any) => {
    if (ref && ref.focus) {
      ref.focus();
      announce(`Focused on ${ref.accessibilityLabel || 'element'}`);
    }
  }, [announce]);

  const trapFocus = useCallback((container: any) => {
    // Focus trapping for mobile components
    // This would need to be implemented based on the specific component library
    const cleanup = () => {
      // Cleanup logic
    };
    
    return cleanup;
  }, []);

  const getContrastRatio = useCallback((foreground: string, background: string): number => {
    const getLuminance = (color: string): number => {
      const rgb = hexToRgb(color);
      if (!rgb) return 0;

      const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const hexToRgb = (hex: string): [number, number, number] | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const isColorAccessible = useCallback((foreground: string, background: string): boolean => {
    const ratio = getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard
  }, [getContrastRatio]);

  const getAccessibleColor = useCallback((color: string): string => {
    // Return a high-contrast version of the color
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const [r, g, b] = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black or white based on brightness
    return brightness > 128 ? '#000000' : '#ffffff';
  }, []);

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!settings.hapticFeedback) return;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }, [settings.hapticFeedback]);

  // Voice command handling
  const handleVoiceCommand = useCallback((command: string) => {
    // Basic voice command handling for mobile
    if (command.includes('navigate')) {
      const page = command.replace('navigate', '').trim();
      announce(`Navigating to ${page}`);
    } else if (command.includes('tap')) {
      const element = command.replace('tap', '').trim();
      announce(`Tapping ${element}`);
    } else if (command.includes('scroll')) {
      announce('Scrolling');
      triggerHaptic('light');
    }
  }, [announce, triggerHaptic]);

  // Mobile-specific accessibility features
  useEffect(() => {
    // Setup mobile-specific accessibility features
    setupMobileAccessibility();
  }, []);

  const setupMobileAccessibility = () => {
    // Setup mobile-specific features
    if (Platform.OS === 'ios') {
      setupiOSAccessibility();
    } else if (Platform.OS === 'android') {
      setupAndroidAccessibility();
    }
  };

  const setupiOSAccessibility = () => {
    // iOS-specific accessibility setup
    // This would use iOS-specific APIs
  };

  const setupAndroidAccessibility = () => {
    // Android-specific accessibility setup
    // This would use Android-specific APIs
  };

  return {
    settings,
    updateSettings,
    announce,
    announceToScreenReader,
    setFocus,
    trapFocus,
    getContrastRatio,
    isColorAccessible,
    getAccessibleColor,
    triggerHaptic,
    announcements,
    handleVoiceCommand,
  };
}

// Accessibility context
const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const accessibility = useAccessibility();
  
  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};
