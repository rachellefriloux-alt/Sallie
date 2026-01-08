import { useState, useEffect, useCallback, createContext, useContext } from 'react';

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
  skipLinks: boolean;
  landmarks: boolean;
  
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
  setFocus: (element: HTMLElement | null) => void;
  trapFocus: (container: HTMLElement) => () => void;
  getContrastRatio: (foreground: string, background: string) => number;
  isColorAccessible: (foreground: string, background: string) => boolean;
  getAccessibleColor: (color: string) => string;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindness: 'none',
  keyboardNavigation: true,
  focusVisible: true,
  skipLinks: true,
  landmarks: true,
  altText: true,
  captions: false,
  transcripts: false,
  readableFonts: false,
  reducedAnimations: false,
  extendedTimeouts: false,
  simpleInterface: false,
  voiceControl: false,
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
  const [focusTrapRefs, setFocusTrapRefs] = useState<Map<HTMLElement, () => void>>(new Map());

  // Load settings from localStorage and system preferences
  useEffect(() => {
    loadAccessibilitySettings();
    detectSystemPreferences();
    setupKeyboardNavigation();
    setupScreenReaderDetection();
  }, []);

  // Apply settings to document
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

  const loadAccessibilitySettings = () => {
    try {
      const stored = localStorage.getItem('accessibility-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const detectSystemPreferences = () => {
    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      updateSettings({ reducedMotion: true, reducedAnimations: true });
    }

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      updateSettings({ highContrast: true });
    }

    // Detect screen reader
    const screenReaderDetected = detectScreenReader();
    if (screenReaderDetected) {
      updateSettings({ screenReader: true });
    }

    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', detectSystemPreferences);
    });
  };

  const detectScreenReader = (): boolean => {
    // Common screen reader detection methods
    return (
      window.speechSynthesis?.getVoices().length > 0 ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.navigator?.userAgent?.includes('ChromeVox')
    );
  };

  const setupKeyboardNavigation = () => {
    // Handle Tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Handle mouse interactions
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Handle Escape key for closing modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Trigger escape event for components to handle
        document.dispatchEvent(new CustomEvent('accessibility-escape'));
      }
    });
  };

  const setupScreenReaderDetection = () => {
    // Add ARIA live regions
    createLiveRegion('polite');
    createLiveRegion('assertive');
  };

  const createLiveRegion = (politeness: 'polite' | 'assertive') => {
    const existingRegion = document.getElementById(`accessibility-live-${politeness}`);
    if (existingRegion) return;

    const liveRegion = document.createElement('div');
    liveRegion.id = `accessibility-live-${politeness}`;
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(liveRegion);
  };

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Apply font size
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px',
    };
    root.style.setProperty('--accessibility-font-size', fontSizes[newSettings.fontSize]);

    // Apply high contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (newSettings.reducedMotion || newSettings.reducedAnimations) {
      root.style.setProperty('--accessibility-animation-duration', '0.01ms');
      root.style.setProperty('--accessibility-transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--accessibility-animation-duration');
      root.style.removeProperty('--accessibility-transition-duration');
    }

    // Apply color blindness filters
    applyColorBlindnessFilter(newSettings.colorBlindness);

    // Apply readable fonts
    if (newSettings.readableFonts) {
      root.style.setProperty('--accessibility-font-family', 'system-ui, -apple-system, sans-serif');
    } else {
      root.style.removeProperty('--accessibility-font-family');
    }

    // Apply simple interface
    if (newSettings.simpleInterface) {
      root.classList.add('simple-interface');
    } else {
      root.classList.remove('simple-interface');
    }

    // Save to localStorage
    try {
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const applyColorBlindnessFilter = (type: string) => {
    const root = document.documentElement;
    
    // Remove existing filters
    root.style.removeProperty('--accessibility-color-filter');

    const filters = {
      'protanopia': 'url(#protanopia-filter)',
      'deuteranopia': 'url(#deuteranopia-filter)',
      'tritanopia': 'url(#tritanopia-filter)',
    };

    if (filters[type as keyof typeof filters]) {
      root.style.setProperty('--accessibility-color-filter', filters[type as keyof typeof filters]);
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
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById(`accessibility-live-${priority}`);
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
    }
  }, []);

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      announce(`Focused on ${element.getAttribute('aria-label') || element.textContent || 'element'}`);
    }
  }, [announce]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Set initial focus
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
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

  // Voice control setup
  useEffect(() => {
    if (settings.voiceControl && 'webkitSpeechRecognition' in window) {
      setupVoiceControl();
    }
  }, [settings.voiceControl]);

  const setupVoiceControl = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      
      // Handle voice commands
      handleVoiceCommand(transcript);
    };

    recognition.start();
  };

  const handleVoiceCommand = (command: string) => {
    // Basic voice command handling
    if (command.includes('navigate')) {
      const page = command.replace('navigate', '').trim();
      announce(`Navigating to ${page}`);
    } else if (command.includes('click')) {
      const element = command.replace('click', '').trim();
      announce(`Clicking ${element}`);
    } else if (command.includes('scroll')) {
      announce('Scrolling');
    }
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
    announcements,
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
