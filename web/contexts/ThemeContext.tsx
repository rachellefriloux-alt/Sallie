/**
 * Enhanced Theme System
 * Complete styling and theme management for Sallie Studio
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeColor = 'violet' | 'blue' | 'green' | 'purple' | 'pink' | 'orange';
export type ThemeStyle = 'modern' | 'classic' | 'minimal' | 'vibrant';

export interface Theme {
  mode: ThemeMode;
  color: ThemeColor;
  style: ThemeStyle;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  applyTheme: () => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => void;
}

const defaultTheme: Theme = {
  mode: 'dark',
  color: 'violet',
  style: 'modern',
  customColors: {
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#ec4899',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Georgia, serif',
    mono: 'JetBrains Mono, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  }
};

const colorPalettes: Record<ThemeColor, Partial<Theme['customColors']>> = {
  violet: {
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#ec4899'
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    accent: '#06b6d4'
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#84cc16'
  },
  purple: {
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#c084fc'
  },
  pink: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6'
  },
  orange: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c'
  }
};

const stylePresets: Record<ThemeStyle, Partial<Theme>> = {
  modern: {
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },
  classic: {
    borderRadius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
      lg: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
      xl: '0 16px 32px 0 rgba(0, 0, 0, 0.18)'
    }
  },
  minimal: {
    borderRadius: {
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      full: '0'
    },
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none'
    }
  },
  vibrant: {
    borderRadius: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 8px 0 rgba(139, 92, 246, 0.3)',
      md: '0 4px 16px 0 rgba(139, 92, 246, 0.4)',
      lg: '0 8px 32px 0 rgba(139, 92, 246, 0.5)',
      xl: '0 16px 64px 0 rgba(139, 92, 246, 0.6)'
    }
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const setTheme = (newTheme: Partial<Theme>) => {
    setThemeState(prev => {
      const updated = { ...prev, ...newTheme };
      
      // Apply color palette
      if (newTheme.color && colorPalettes[newTheme.color]) {
        updated.customColors = {
          ...updated.customColors,
          ...colorPalettes[newTheme.color]
        };
      }
      
      // Apply style preset
      if (newTheme.style && stylePresets[newTheme.style]) {
        const preset = stylePresets[newTheme.style];
        updated.borderRadius = { ...updated.borderRadius, ...preset.borderRadius };
        updated.shadows = { ...updated.shadows, ...preset.shadows };
      }
      
      return updated;
    });
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.customColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply fonts
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
    // Apply spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply animations
    Object.entries(theme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value);
    });
    
    // Apply theme mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme.mode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto mode - respect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
    
    // Apply color class
    root.className = root.className.replace(/color-\w+/g, '');
    root.classList.add(`color-${theme.color}`);
    
    // Apply style class
    root.className = root.className.replace(/style-\w+/g, '');
    root.classList.add(`style-${theme.style}`);
    
    // Save to localStorage
    localStorage.setItem('sallie-theme', JSON.stringify(theme));
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
    localStorage.removeItem('sallie-theme');
  };

  const exportTheme = () => {
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = (themeData: string) => {
    try {
      const importedTheme = JSON.parse(themeData);
      setThemeState(importedTheme);
      localStorage.setItem('sallie-theme', themeData);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sallie-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setThemeState(parsed);
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme();
  }, [theme]);

  // Listen for system theme changes in auto mode
  useEffect(() => {
    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme.mode]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    applyTheme,
    resetTheme,
    exportTheme,
    importTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// CSS utility classes
export const themeStyles = {
  // Background colors
  bgPrimary: 'bg-primary',
  bgSecondary: 'bg-secondary',
  bgSurface: 'bg-surface',
  bgBackground: 'bg-background',
  
  // Text colors
  textPrimary: 'text-primary',
  textSecondary: 'text-secondary',
  
  // Border colors
  borderPrimary: 'border-primary',
  borderSecondary: 'border-secondary',
  
  // Component styles
  card: 'bg-surface border border-secondary rounded-lg shadow-md',
  button: 'bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors',
  input: 'bg-surface border border-secondary rounded-md px-3 py-2 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary',
  
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  flexCenter: 'flex items-center justify-center',
  
  // Spacing
  spacingY: 'space-y-4',
  spacingX: 'space-x-4',
  
  // Animations
  transition: 'transition-all duration-normal',
  hoverScale: 'hover:scale-105 transition-transform',
  
  // Shadows
  shadow: 'shadow-md',
  shadowLg: 'shadow-lg',
  
  // Border radius
  rounded: 'rounded-md',
  roundedLg: 'rounded-lg',
  roundedXl: 'rounded-xl',
  
  // Typography
  heading: 'text-2xl font-bold text-primary',
  subheading: 'text-xl font-semibold text-primary',
  body: 'text-base text-secondary',
  caption: 'text-sm text-secondary'
};

// Theme-aware CSS classes
export const themeClasses = {
  // Mode-aware
  darkMode: 'dark:bg-background dark:text-primary',
  lightMode: 'light:bg-white light:text-gray-900',
  
  // Color-aware
  violetTheme: 'color-violet',
  blueTheme: 'color-blue',
  greenTheme: 'color-green',
  purpleTheme: 'color-purple',
  pinkTheme: 'color-pink',
  orangeTheme: 'color-orange',
  
  // Style-aware
  modernStyle: 'style-modern',
  classicStyle: 'style-classic',
  minimalStyle: 'style-minimal',
  vibrantStyle: 'style-vibrant'
};
