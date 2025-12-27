# Digital Progeny Style Guide

## Design Philosophy

The Digital Progeny UI is designed to be:
- **Adaptive**: Context-aware layouts for different roles and situations
- **Productivity-Focused**: Optimized for helping the Creator in all aspects of life
- **Beautiful**: Top-of-the-line visual design that feels premium
- **Accessible**: WCAG 2.1 AA compliant

## Design Tokens

### Colors

#### Primary Palette
```css
--color-primary: #6366f1;        /* Indigo - Trust, reliability */
--color-primary-dark: #4f46e5;
--color-primary-light: #818cf8;

--color-secondary: #8b5cf6;       /* Purple - Warmth, intimacy */
--color-secondary-dark: #7c3aed;
--color-secondary-light: #a78bfa;

--color-accent: #ec4899;          /* Pink - Energy, arousal */
--color-accent-dark: #db2777;
--color-accent-light: #f472b6;
```

#### Semantic Colors
```css
--color-success: #10b981;         /* Green - Positive valence */
--color-warning: #f59e0b;         /* Amber - Caution */
--color-error: #ef4444;           /* Red - Crisis, door slam */
--color-info: #3b82f6;            /* Blue - Information */
```

#### Neutral Palette
```css
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
```

#### Background Colors
```css
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f3f4f6;
--color-bg-dark: #1a1a1a;
--color-bg-dark-secondary: #2a2a2a;
```

### Typography

#### Font Families
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### Font Sizes (Modular Scale ~1.125)
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing (4/8/12/16 Rhythm)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

## Component Patterns

### Buttons

```css
.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
}
```

### Cards

```css
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

### Input Fields

```css
.input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

## Accessibility

### Color Contrast

- **Text on background**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Interactive elements**: Minimum 3:1 contrast ratio
- **Focus indicators**: 2px solid outline with 3:1 contrast

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order follows visual flow
- Focus indicators clearly visible
- Skip links for main content

### ARIA Labels

- All interactive elements have accessible names
- Form inputs have associated labels
- Landmark regions properly identified
- Live regions for dynamic content

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Dark Mode

Dark mode uses inverted color palette:

```css
[data-theme="dark"] {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2a2a2a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #d1d5db;
}
```

## Role-Based Layouts

### Work Mode
- Clean, minimal interface
- Focus on productivity tools
- Reduced visual noise

### Personal Mode
- Warmer color palette
- More spacious layout
- Emphasis on connection

### Crisis Mode
- Simplified UI
- High contrast
- Reduced complexity
- Focus on support

## Animation Guidelines

- **Purposeful**: Animations should enhance understanding, not distract
- **Fast**: Keep animations under 300ms
- **Respectful**: Honor `prefers-reduced-motion`
- **Smooth**: Use easing functions (ease-in-out)

## Implementation

### CSS Variables

All design tokens are available as CSS variables for easy theming:

```css
:root {
  /* Colors */
  --color-primary: #6366f1;
  /* ... */
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  /* ... */
  
  /* Spacing */
  --space-4: 1rem;
  /* ... */
}
```

### Tailwind Config

For Tailwind CSS projects, tokens are mapped to Tailwind utilities:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        // ...
      },
      spacing: {
        // 4/8/12/16 rhythm
      },
    },
  },
}
```
