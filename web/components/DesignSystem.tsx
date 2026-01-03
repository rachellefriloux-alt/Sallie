import React, { createContext, useContext, useState, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';

// Peacock Tail Palette Design System
export const DesignTokens = {
  // Colors - Peacock Tail Palette
  colors: {
    // Primary - Peacock Blue (depth)
    primary: {
      50: '#e8f4f8',
      100: '#d1e9f2',
      200: '#a3d3e5',
      300: '#75bcd8',
      400: '#4ca6cb',
      500: '#238fbf', // Primary Peacock Blue
      600: '#1e7ba6',
      700: '#19678c',
      800: '#145373',
      900: '#0f405a',
    },
    
    // Secondary - Teal Green (clarity and flow)
    secondary: {
      50: '#e6f7f5',
      100: '#ccf0eb',
      200: '#99e1d7',
      300: '#66d2c3',
      400: '#33c3af',
      500: '#00b49c', // Primary Teal
      600: '#009d89',
      700: '#008676',
      800: '#006f64',
      900: '#005852',
    },
    
    // Accent - Royal Purple (intuition and identity)
    accent: {
      50: '#f3e8ff',
      100: '#e4d4ff',
      200: '#c9a9ff',
      300: '#ae7eff',
      400: '#9353ff',
      500: '#7828ff', // Primary Royal Purple
      600: '#6b23e6',
      700: '#5e1ecc',
      800: '#5119b3',
      900: '#44149a',
    },
    
    // Gold (accents and highlights)
    gold: {
      50: '#fffdf0',
      100: '#fefce8',
      200: '#fcf8d0',
      300: '#faf4b8',
      400: '#f8f0a0',
      500: '#f6ec88', // Primary Gold
      600: '#ddd470',
      700: '#c4bc58',
      800: '#aba340',
      900: '#928a28',
    },
    
    // Warm Sand (background)
    sand: {
      50: '#fdfcf8',
      100: '#fbf8f1',
      200: '#f7f1e3',
      300: '#f3ead5',
      400: '#efe3c7',
      500: '#ebdcb9', // Primary Sand
      600: '#d4c6a8',
      700: '#bdb097',
      800: '#a69a86',
      900: '#8f8475',
    },
    
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Neutral colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Emotional colors
    emotion: {
      happy: '#fbbf24',
      calm: '#60a5fa',
      excited: '#f87171',
      focused: '#a78bfa',
      creative: '#34d399',
      thoughtful: '#f472b6',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      display: ['Cal Sans', 'Inter', 'sans-serif'],
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
  },
  
  // Spacing
  spacing: {
    0: '0px',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Mystical shadows with color
    mystical: {
      primary: '0 4px 20px rgba(35, 143, 191, 0.3)',
      secondary: '0 4px 20px rgba(0, 180, 156, 0.3)',
      accent: '0 4px 20px rgba(120, 40, 255, 0.3)',
      gold: '0 4px 20px rgba(246, 236, 136, 0.3)',
    },
  },
  
  // Animations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '1000ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      
      // Gemini duality shimmer
      shimmer: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      
      // INFJ softness
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  
  // Leopard print patterns
  patterns: {
    leopard: {
      subtle: 'radial-gradient(circle at 20% 50%, transparent 20%, rgba(35, 143, 191, 0.1) 20.5%, rgba(35, 143, 191, 0.1) 21%, transparent 21.5%)',
      medium: 'radial-gradient(circle at 20% 50%, transparent 20%, rgba(35, 143, 191, 0.2) 20.5%, rgba(35, 143, 191, 0.2) 21%, transparent 21.5%)',
      bold: 'radial-gradient(circle at 20% 50%, transparent 20%, rgba(35, 143, 191, 0.3) 20.5%, rgba(35, 143, 191, 0.3) 21%, transparent 21.5%)',
    },
  },
};

// Design context
export const DesignContext = createContext<{
  tokens: typeof DesignTokens;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  emotionalState: string;
  setEmotionalState: (state: string) => void;
}>({
  tokens: DesignTokens,
  theme: 'light',
  toggleTheme: () => {},
  emotionalState: 'calm',
  setEmotionalState: () => {},
});

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [emotionalState, setEmotionalState] = useState('calm');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <DesignContext.Provider value={{
      tokens: DesignTokens,
      theme,
      toggleTheme,
      emotionalState,
      setEmotionalState,
    }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};

// Component styles
export const createStyles = (theme: 'light' | 'dark', emotionalState: string) => {
  const { colors, typography, spacing, borderRadius, shadows, animation } = DesignTokens;
  
  return StyleSheet.create({
    // Base styles
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? colors.sand[50] : colors.gray[900],
    },
    
    card: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      shadowColor: colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    // Mystical card with leopard texture
    mysticalCard: {
      backgroundColor: theme === 'light' ? colors.white : colors.gray[800],
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      // Leopard texture overlay
      position: 'relative',
      overflow: 'hidden',
    },
    
    // Text styles
    heading: {
      fontFamily: typography.fontFamily.display.join(', '),
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme === 'light' ? colors.gray[900] : colors.white,
      marginBottom: spacing[2],
    },
    
    subheading: {
      fontFamily: typography.fontFamily.sans.join(', '),
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme === 'light' ? colors.gray[700] : colors.gray[300],
      marginBottom: spacing[1],
    },
    
    body: {
      fontFamily: typography.fontFamily.sans.join(', '),
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      color: theme === 'light' ? colors.gray[600] : colors.gray[400],
      lineHeight: typography.lineHeight.normal,
    },
    
    // Button styles
    button: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      transition: `all ${animation.duration.normal} ${animation.easing.ease}`,
    },
    
    primaryButton: {
      backgroundColor: colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    secondaryButton: {
      backgroundColor: colors.secondary[500],
      shadowColor: colors.secondary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    accentButton: {
      backgroundColor: colors.accent[500],
      shadowColor: colors.accent[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    // Emotional styles
    emotionalBackground: {
      backgroundColor: colors.emotion[emotionalState as keyof typeof colors.emotion] || colors.primary[100],
      opacity: 0.1,
    },
    
    emotionalBorder: {
      borderColor: colors.emotion[emotionalState as keyof typeof colors.emotion] || colors.primary[500],
      borderWidth: 2,
    },
    
    // Gemini duality shimmer effect
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)`,
      transform: [{ translateX: '-100%' }],
    },
    
    // Leopard texture
    leopardTexture: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
      backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 20%, rgba(35, 143, 191, 0.1) 20.5%, rgba(35, 143, 191, 0.1) 21%, transparent 21.5%)',
      backgroundSize: '20px 20px',
    },
    
    // INFJ softness animations
    gentlePulse: {
      animation: 'gentlePulse 3s ease-in-out infinite',
    },
    
    // Layout styles
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    column: {
      flexDirection: 'column',
    },
    
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    spaceBetween: {
      justifyContent: 'space-between',
    },
    
    // Spacing utilities
    m1: { margin: spacing[1] },
    m2: { margin: spacing[2] },
    m3: { margin: spacing[3] },
    m4: { margin: spacing[4] },
    m6: { margin: spacing[6] },
    
    p1: { padding: spacing[1] },
    p2: { padding: spacing[2] },
    p3: { padding: spacing[3] },
    p4: { padding: spacing[4] },
    p6: { padding: spacing[6] },
    
    mt1: { marginTop: spacing[1] },
    mt2: { marginTop: spacing[2] },
    mt3: { marginTop: spacing[3] },
    mt4: { marginTop: spacing[4] },
    mt6: { marginTop: spacing[6] },
    
    mb1: { marginBottom: spacing[1] },
    mb2: { marginBottom: spacing[2] },
    mb3: { marginBottom: spacing[3] },
    mb4: { marginBottom: spacing[4] },
    mb6: { marginBottom: spacing[6] },
  });
};

export default DesignSystem;
