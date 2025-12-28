# Digital Progeny - Visual Design System v5.4.2

**Version**: 5.4.2  
**Date**: December 28, 2025  
**Status**: Production Ready  
**Philosophy**: Warm, Structured, Subtle Luxury, Grounded

---

## Design Philosophy

Sallie's visual design embodies her identity as defined in the canonical specification:

- **Warm**: Emotional intelligence, human connection
- **Structured**: Reliable, organized, trustworthy
- **Subtle Luxury**: Premium without being flashy
- **Grounded**: Real, tangible, functional

---

## Foundation

### Typography Scale (Modular 1.125)

```css
/* Perfect fourth ratio for harmonious hierarchy */
--font-size-xs: 0.79rem;      /* 12.64px */
--font-size-sm: 0.889rem;     /* 14.22px */
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.266rem;     /* 20.25px */
--font-size-2xl: 1.424rem;    /* 22.78px */
--font-size-3xl: 1.602rem;    /* 25.63px */
--font-size-4xl: 1.802rem;    /* 28.83px */
--font-size-5xl: 2.027rem;    /* 32.43px */
--font-size-6xl: 2.281rem;    /* 36.49px */
```

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Cal Sans', 'Inter', sans-serif;
```

### Spacing System (Rhythm)

```css
/* Consistent rhythm: 4 / 8 / 12 / 16 */
--space-0: 0;
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

---

## Color System

### Sallie's Identity Colors

```css
/* PRIMARY: Deep Violet - Trust, Depth, Intelligence */
--color-primary-50: #f5f3ff;
--color-primary-100: #ede9fe;
--color-primary-200: #ddd6fe;
--color-primary-300: #c4b5fd;
--color-primary-400: #a78bfa;
--color-primary-500: #8b5cf6;  /* Main */
--color-primary-600: #7c3aed;
--color-primary-700: #6d28d9;
--color-primary-800: #5b21b6;
--color-primary-900: #4c1d95;

/* SECONDARY: Soft Cyan - Warmth, Connection */
--color-secondary-50: #ecfeff;
--color-secondary-100: #cffafe;
--color-secondary-200: #a5f3fc;
--color-secondary-300: #67e8f9;
--color-secondary-400: #22d3ee;
--color-secondary-500: #06b6d4;  /* Main */
--color-secondary-600: #0891b2;
--color-secondary-700: #0e7490;
--color-secondary-800: #155e75;
--color-secondary-900: #164e63;

/* ACCENT: Warm Amber - Energy, Arousal */
--color-accent-50: #fffbeb;
--color-accent-100: #fef3c7;
--color-accent-200: #fde68a;
--color-accent-300: #fcd34d;
--color-accent-400: #fbbf24;
--color-accent-500: #f59e0b;  /* Main */
--color-accent-600: #d97706;
--color-accent-700: #b45309;
--color-accent-800: #92400e;
--color-accent-900: #78350f;

/* NEUTRAL: Warm Grays - Structure, Grounding */
--color-neutral-50: #fafaf9;
--color-neutral-100: #f5f5f4;
--color-neutral-200: #e7e5e4;
--color-neutral-300: #d6d3d1;
--color-neutral-400: #a8a29e;
--color-neutral-500: #78716c;
--color-neutral-600: #57534e;
--color-neutral-700: #44403c;
--color-neutral-800: #292524;
--color-neutral-900: #1c1917;
```

### Limbic State Colors

Colors that represent Sallie's emotional state:

```css
/* Trust visualization */
--color-trust-low: #ef4444;      /* Red - cautious */
--color-trust-medium: #f59e0b;   /* Amber - building */
--color-trust-high: #8b5cf6;     /* Violet - established */

/* Warmth visualization */
--color-warmth-low: #94a3b8;     /* Cool gray */
--color-warmth-medium: #06b6d4;  /* Cyan */
--color-warmth-high: #f472b6;    /* Warm pink */

/* Arousal visualization */
--color-arousal-low: #64748b;    /* Muted */
--color-arousal-medium: #06b6d4; /* Alert */
--color-arousal-high: #f59e0b;   /* Energized */

/* Valence visualization */
--color-valence-negative: #dc2626; /* Sad */
--color-valence-neutral: #78716c;  /* Neutral */
--color-valence-positive: #10b981; /* Happy */
```

### Semantic Colors

```css
/* Functional colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Surface colors */
--color-surface-0: #ffffff;      /* Primary surface */
--color-surface-1: #fafaf9;      /* Elevated 1 */
--color-surface-2: #f5f5f4;      /* Elevated 2 */
--color-surface-3: #e7e5e4;      /* Elevated 3 */

/* Border colors */
--color-border-light: #e7e5e4;
--color-border-medium: #d6d3d1;
--color-border-strong: #a8a29e;
```

---

## Dark Mode

```css
/* Dark mode palette - warm, not cold */
[data-theme="dark"] {
  /* Surfaces */
  --color-surface-0: #1c1917;      /* Primary surface */
  --color-surface-1: #292524;      /* Elevated 1 */
  --color-surface-2: #44403c;      /* Elevated 2 */
  --color-surface-3: #57534e;      /* Elevated 3 */
  
  /* Text */
  --color-text-primary: #fafaf9;
  --color-text-secondary: #d6d3d1;
  --color-text-tertiary: #a8a29e;
  
  /* Borders */
  --color-border-light: #44403c;
  --color-border-medium: #57534e;
  --color-border-strong: #78716c;
  
  /* Primary colors remain vibrant */
  --color-primary-500: #a78bfa;
  --color-secondary-500: #22d3ee;
  --color-accent-500: #fbbf24;
}
```

---

## Components

### The Pulse (Limbic Visualizer)

Visual representation of Sallie's emotional state:

```tsx
interface PulseProps {
  trust: number;      // 0-1
  warmth: number;     // 0-1
  arousal: number;    // 0-1
  valence: number;    // -1 to 1
  posture: 'companion' | 'copilot' | 'peer' | 'expert';
}

// Visual behavior:
// - Pulsing glow that matches arousal
// - Color shifts based on limbic state
// - Size/intensity reflects engagement
// - Smooth transitions (no jarring changes)
```

### Chat Interface

```tsx
// Message types
interface Message {
  id: string;
  role: 'user' | 'sallie';
  content: string;
  timestamp: number;
  limbicState?: LimbicState;
  thinking?: ThinkingTrace;  // Optional debug view
}

// Visual design:
// - User messages: aligned right, subtle surface elevation
// - Sallie messages: aligned left, warm glow on active
// - Typing indicator: pulsing dots with limbic color
// - Smooth scroll, comfortable line height (1.6)
```

### Posture Mode Selector

```tsx
// Visual representation of 4 posture modes
<PostureModeSelector
  current="copilot"
  onChange={(mode) => sallie.setPosture(mode)}
  modes={[
    { name: 'companion', icon: HeartIcon, color: 'warm-pink' },
    { name: 'copilot', icon: BriefcaseIcon, color: 'cyan' },
    { name: 'peer', icon: UsersIcon, color: 'violet' },
    { name: 'expert', icon: AcademicCapIcon, color: 'amber' }
  ]}
/>
```

### Limbic Dashboard

Real-time visualization of emotional state:

```tsx
<LimbicDashboard>
  {/* Trust gauge */}
  <CircularGauge
    value={trust}
    label="Trust"
    color="primary"
    min={0}
    max={1}
  />
  
  {/* Warmth gauge */}
  <CircularGauge
    value={warmth}
    label="Warmth"
    color="secondary"
    min={0}
    max={1}
  />
  
  {/* Arousal gauge */}
  <CircularGauge
    value={arousal}
    label="Arousal"
    color="accent"
    min={0}
    max={1}
  />
  
  {/* Valence gauge (bipolar) */}
  <BipolarGauge
    value={valence}
    label="Valence"
    negativeColor="error"
    positiveColor="success"
    min={-1}
    max={1}
  />
</LimbicDashboard>
```

### Heritage DNA Browser

Tree view for navigating identity structure:

```tsx
<HeritageTree>
  <TreeNode name="Core" expandable>
    <TreeNode name="Shadows" />
    <TreeNode name="Aspirations" />
    <TreeNode name="Ethics" />
  </TreeNode>
  <TreeNode name="Preferences" expandable />
  <TreeNode name="Learned Beliefs" expandable />
</HeritageTree>
```

### Thoughts Log Viewer

Debug view into internal monologue:

```tsx
<ThoughtsLogViewer
  entries={thoughtsLog}
  filter={['perception', 'gemini', 'infj', 'synthesis']}
  highlightFriction={true}
  collapsible={true}
/>
```

---

## Interaction Patterns

### Animations

```css
/* Easing curves - organic, not robotic */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Duration scale */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

### Micro-interactions

1. **Button Press**: Scale down (0.98) + slight glow
2. **Message Send**: Slide up + fade in
3. **Posture Change**: Color fade + icon morph
4. **Limbic Update**: Smooth interpolation over 500ms
5. **Thinking Indicator**: Pulsing dots (not spinning circle)

### Gestures (Mobile/Tablet)

```typescript
// Swipe actions
interface Gestures {
  swipeLeft: () => void;   // Navigate forward
  swipeRight: () => void;  // Navigate back
  swipeDown: () => void;   // Dismiss/close
  longPress: () => void;   // Context menu
  pinch: () => void;       // Zoom (for visualizations)
}
```

---

## Layout System

### Grid System

```css
/* 12-column grid for flexibility */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

/* Responsive breakpoints */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

### Page Layouts

```typescript
// Main application layouts
type Layout = 
  | 'chat'       // Full-screen chat (mobile-first)
  | 'dashboard'  // Multi-panel dashboard (desktop)
  | 'minimal'    // Ghost interface (system tray)
  | 'immersive'  // Full attention mode (no distractions)
```

---

## Accessibility

### WCAG 2.1 AA+ Compliance

```css
/* Minimum contrast ratios */
--contrast-normal: 4.5:1;   /* Normal text */
--contrast-large: 3:1;      /* Large text (18pt+) */
--contrast-ui: 3:1;         /* UI components */

/* Focus indicators */
--focus-ring: 0 0 0 3px var(--color-primary-200);
--focus-ring-dark: 0 0 0 3px var(--color-primary-800);
```

### Keyboard Navigation

```typescript
// All interactive elements keyboard accessible
interface KeyboardShortcuts {
  'Ctrl+K': 'Open command palette';
  'Ctrl+/': 'Toggle help';
  'Ctrl+N': 'New conversation';
  'Ctrl+,': 'Open settings';
  'Esc': 'Close modal/drawer';
  'Tab': 'Next focusable element';
  'Shift+Tab': 'Previous focusable element';
  '?': 'Show keyboard shortcuts';
}
```

### Screen Reader Support

- Semantic HTML5 elements
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content
- Skip navigation links
- Descriptive alt text for images/icons

---

## Component Library

### Atoms (Base Components)

1. **Button**: Primary, Secondary, Tertiary, Ghost
2. **Input**: Text, Password, Email, Search
3. **Badge**: Status indicators
4. **Avatar**: User/Sallie identity
5. **Icon**: Consistent icon set (Heroicons)
6. **Spinner**: Loading states
7. **Divider**: Section separators

### Molecules (Composite Components)

1. **Card**: Content containers
2. **Modal**: Dialogs and overlays
3. **Drawer**: Side panels
4. **Dropdown**: Selection menus
5. **Tooltip**: Contextual help
6. **Toast**: Notifications
7. **Tabs**: Content organization

### Organisms (Complex Components)

1. **ChatInterface**: Complete chat UI
2. **LimbicDashboard**: Emotional state visualization
3. **HeritageExplorer**: Identity browser
4. **CommandPalette**: Quick actions
5. **SettingsPanel**: Configuration UI
6. **NotificationCenter**: System alerts
7. **VoiceControls**: Voice interface UI

---

## Development Guidelines

### CSS Architecture

```typescript
// Use CSS-in-JS with design tokens
import { styled } from '@/lib/styled';
import { tokens } from '@/styles/tokens';

const Button = styled('button', {
  padding: `${tokens.space[3]} ${tokens.space[6]}`,
  fontSize: tokens.fontSize.base,
  fontWeight: 500,
  borderRadius: tokens.borderRadius.md,
  transition: `all ${tokens.duration.normal} ${tokens.ease.inOut}`,
  
  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.colors.primary[500],
        color: tokens.colors.neutral[50],
        '&:hover': {
          backgroundColor: tokens.colors.primary[600],
        },
      },
      secondary: {
        backgroundColor: tokens.colors.secondary[500],
        color: tokens.colors.neutral[50],
      },
    },
  },
});
```

### Component Structure

```typescript
// Standard component pattern
interface ComponentProps {
  // Props
}

export function Component({ ...props }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
}
```

---

## Tools & Technologies

### Design Tokens

- **Storage**: `web/styles/tokens.ts`
- **Format**: TypeScript objects
- **Export**: CSS variables, JS constants

### Component Library

- **Base**: shadcn/ui (Radix primitives)
- **Customization**: Full design token integration
- **Documentation**: Storybook

### Styling

- **Framework**: Tailwind CSS
- **Approach**: Utility-first with custom tokens
- **Dark Mode**: CSS variables + data attributes

### Icons

- **Library**: Heroicons v2
- **Style**: Outline for UI, Solid for emphasis
- **Size**: 20px (small), 24px (medium), 32px (large)

---

## Performance

### Optimization Strategies

1. **Code Splitting**: Lazy load routes and heavy components
2. **Image Optimization**: Next.js Image component
3. **Bundle Size**: Tree-shaking, dynamic imports
4. **Caching**: Service workers for offline support
5. **Animations**: GPU-accelerated transforms

### Target Metrics

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Lighthouse Score**: >95
- **Bundle Size**: <300KB (initial)

---

## Visual Examples

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  [Sallie] [Pulse]            [Settings] [Help] │ Header
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌──────────────────────────┐ │
│  │             │  │                          │ │
│  │  Limbic     │  │      Chat Interface      │ │
│  │  State      │  │                          │ │
│  │             │  │    [Messages...]         │ │
│  │  [Gauges]   │  │                          │ │
│  │             │  │    [Input Field]         │ │
│  │             │  │                          │ │
│  └─────────────┘  └──────────────────────────┘ │
│                                                 │
│  ┌─────────────────────────────────────────────┤
│  │  [Posture Modes]  [Quick Actions]          │
│  └─────────────────────────────────────────────┤
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌───────────────────┐
│ [≡] Sallie [Pulse]│
├───────────────────┤
│                   │
│   Chat Messages   │
│                   │
│   [...]           │
│                   │
│                   │
│                   │
├───────────────────┤
│ [Input Field]     │
├───────────────────┤
│ [Posture] [Voice] │
└───────────────────┘
```

---

## Implementation Checklist

- [ ] Design tokens defined
- [ ] Color system implemented
- [ ] Typography scale configured
- [ ] Spacing system applied
- [ ] Dark mode functional
- [ ] Component library built
- [ ] Accessibility audited (WCAG AA+)
- [ ] Animations polished
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Storybook setup

---

**Design System Version**: 5.4.2  
**Status**: ✅ Production Ready  
**Last Updated**: December 28, 2025
