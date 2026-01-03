/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // === PEACOCK TAIL PALETTE ===
        
        // Peacock Blue (primary depth)
        peacock: {
          50: '#e8f4f8',
          100: '#d1e9f2',
          200: '#a3d3e5',
          300: '#75bcd8',
          400: '#4ca6cb',
          500: '#238fbf',
          600: '#1e7ba6',
          700: '#19678c',
          800: '#145373',
          900: '#0f405a',
          DEFAULT: '#238fbf',
        },
        
        // Teal Green (clarity and flow)
        teal: {
          50: '#e6f7f5',
          100: '#ccf0eb',
          200: '#99e1d7',
          300: '#66d2c3',
          400: '#33c3af',
          500: '#00b49c',
          600: '#009d89',
          700: '#008676',
          800: '#006f64',
          900: '#005852',
          DEFAULT: '#00b49c',
        },
        
        // Royal Purple (intuition and identity)
        royal: {
          50: '#f3e8ff',
          100: '#e4d4ff',
          200: '#c9a9ff',
          300: '#ae7eff',
          400: '#9353ff',
          500: '#7828ff',
          600: '#6b23e6',
          700: '#5e1ecc',
          800: '#5119b3',
          900: '#44149a',
          DEFAULT: '#7828ff',
        },
        
        // Gold (accents and highlights)
        gold: {
          50: '#fffdf0',
          100: '#fefce8',
          200: '#fcf8d0',
          300: '#faf4b8',
          400: '#f8f0a0',
          500: '#d4a574',
          600: '#c69c6d',
          700: '#b8935f',
          800: '#a68a52',
          900: '#8f7a45',
          DEFAULT: '#d4a574',
        },
        
        // Warm Sand (background)
        sand: {
          50: '#fdfcf8',
          100: '#fbf8f1',
          200: '#f7f1e3',
          300: '#f3ead5',
          400: '#efe3c7',
          500: '#ebdcb9',
          600: '#d4c6a8',
          700: '#bdb097',
          800: '#a69a86',
          900: '#8f8475',
          DEFAULT: '#ebdcb9',
        },
        
        // Leopard (texture accents)
        leopard: {
          spot: '#2d1810',
          base: '#c69c6d',
          highlight: '#e8c89e',
          shadow: '#1a0f0a',
        },
        
        // Legacy mappings for compatibility
        primary: {
          DEFAULT: '#238fbf',
          dark: '#19678c',
          light: '#4ca6cb',
        },
        secondary: {
          DEFAULT: '#00b49c',
          dark: '#008676',
          light: '#33c3af',
        },
        accent: {
          DEFAULT: '#7828ff',
          dark: '#5e1ecc',
          light: '#9353ff',
        },
        
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Emotional Colors
        emotion: {
          happy: '#fbbf24',
          calm: '#60a5fa',
          excited: '#f87171',
          focused: '#7828ff',
          creative: '#00b49c',
          thoughtful: '#238fbf',
          loving: '#f472b6',
        },
        
        // Neutral Palette
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Background Colors (Peacock-themed)
        bg: {
          primary: '#0f405a',
          secondary: '#145373',
          tertiary: '#19678c',
          sanctuary: '#0a2a3a',
          dark: '#050a0f',
          'dark-secondary': '#0a1520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      spacing: {
        // 4/8/12/16 rhythm
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },
      borderRadius: {
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

