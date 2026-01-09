// 🦚 SALLIE PEACOCK THEME - REACT NATIVE DESIGN SYSTEM
// Complete peacock/leopard theme for Sallie Studio mobile application

import { StyleSheet } from 'react-native';

// Color Palette
export const Colors = {
  // Peacock Colors
  peacockPrimary: '#6A5ACD',
  peacockSecondary: '#4B0082',
  peacockAccent: '#9370DB',
  peacockLight: '#DDA0DD',
  peacockDark: '#2E0854',
  peacockVibrant: '#8A2BE2',
  peacockSoft: '#E6E6FA',
  
  // Leopard Colors
  leopardPrimary: '#FF8C00',
  leopardSecondary: '#FF6347',
  leopardAccent: '#FFD700',
  leopardDark: '#8B4513',
  leopardLight: '#FFE4B5',
  leopardSpot: '#CD853F',
  
  // Neutral Colors
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#E5E5E5',
  neutral300: '#D4D4D4',
  neutral400: '#A3A3A3',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral800: '#262626',
  neutral900: '#171717',
  neutral950: '#0A0A0A',
  
  // Semantic Colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Glass Colors (with opacity)
  glassPeacock: 'rgba(106, 90, 205, 0.1)',
  glassLeopard: 'rgba(255, 140, 0, 0.1)',
  glassMixed: 'rgba(106, 90, 205, 0.05)',
  
  // Shadow Colors
  shadowPeacock: 'rgba(106, 90, 205, 0.3)',
  shadowLeopard: 'rgba(255, 140, 0, 0.3)',
  shadowMixed: 'rgba(106, 90, 205, 0.2)',
};

// Gradients
export const Gradients = {
  peacock: {
    colors: [Colors.peacockPrimary, Colors.peacockSecondary, Colors.peacockAccent],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  peacockReverse: {
    colors: [Colors.peacockAccent, Colors.peacockSecondary, Colors.peacockPrimary],
    start: { x: 1, y: 1 },
    end: { x: 0, y: 0 },
  },
  peacockVertical: {
    colors: [Colors.peacockPrimary, Colors.peacockAccent, Colors.peacockSecondary],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  leopard: {
    colors: [Colors.leopardPrimary, Colors.leopardSecondary, Colors.leopardAccent],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  mixed: {
    colors: [Colors.peacockPrimary, Colors.leopardPrimary, Colors.peacockAccent],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  mixedSubtle: {
    colors: ['rgba(106, 90, 205, 0.1)', 'rgba(255, 140, 0, 0.1)', 'rgba(147, 112, 219, 0.1)'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Typography
export const Typography = {
  // Font Families
  fontFamily: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  
  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Spacing
export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
};

// Shadow
export const Shadow = {
  peacock: {
    shadowColor: Colors.shadowPeacock,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  peacockStrong: {
    shadowColor: Colors.shadowPeacock,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  leopard: {
    shadowColor: Colors.shadowLeopard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  leopardStrong: {
    shadowColor: Colors.shadowLeopard,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  mixed: {
    shadowColor: Colors.shadowMixed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};

// Component Styles
export const Styles = StyleSheet.create({
  // Base Container
  container: {
    flex: 1,
    backgroundColor: Colors.peacockDark,
  },
  
  // Glass Morphism
  glassCard: {
    backgroundColor: Colors.glassMixed,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Shadow.mixed,
  },
  
  glassCardPeacock: {
    backgroundColor: Colors.glassPeacock,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(106, 90, 205, 0.2)',
    ...Shadow.peacock,
  },
  
  glassCardLeopard: {
    backgroundColor: Colors.glassLeopard,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.2)',
    ...Shadow.leopard,
  },
  
  // Buttons
  button: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.peacock,
  },
  
  buttonPeacock: {
    backgroundColor: Colors.peacockPrimary,
    ...Shadow.peacock,
  },
  
  buttonLeopard: {
    backgroundColor: Colors.leopardPrimary,
    ...Shadow.leopard,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.peacockPrimary,
  },
  
  buttonOutlineLeopard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.leopardPrimary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  buttonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: 'white',
  },
  
  // Cards
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[6],
    ...Shadow.mixed,
  },
  
  cardPeacock: {
    backgroundColor: Colors.glassPeacock,
    borderWidth: 1,
    borderColor: 'rgba(106, 90, 205, 0.2)',
    ...Shadow.peacock,
  },
  
  cardLeopard: {
    backgroundColor: Colors.glassLeopard,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.2)',
    ...Shadow.leopard,
  },
  
  // Inputs
  input: {
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontSize: Typography.fontSize.base,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  inputPeacock: {
    backgroundColor: Colors.glassPeacock,
    borderColor: 'rgba(106, 90, 205, 0.2)',
  },
  
  inputLeopard: {
    backgroundColor: Colors.glassLeopard,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  
  // Text
  text: {
    color: 'white',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
  },
  
  textPeacock: {
    color: Colors.peacockPrimary,
  },
  
  textLeopard: {
    color: Colors.leopardPrimary,
  },
  
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    color: 'white',
  },
  
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  body: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    color: 'white',
  },
  
  caption: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  
  // Avatar
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.peacock,
  },
  
  avatarPeacock: {
    backgroundColor: Colors.peacockPrimary,
    borderWidth: 3,
    borderColor: Colors.peacockAccent,
  },
  
  avatarLeopard: {
    backgroundColor: Colors.leopardPrimary,
    borderWidth: 3,
    borderColor: Colors.leopardAccent,
  },
  
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  
  avatarMedium: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarLarge: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  
  // Badge
  badge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: 20,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: 'white',
  },
  
  badgePeacock: {
    backgroundColor: Colors.peacockPrimary,
  },
  
  badgeLeopard: {
    backgroundColor: Colors.leopardPrimary,
  },
  
  badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.peacockPrimary,
    color: Colors.peacockPrimary,
  },
  
  badgeOutlineLeopard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.leopardPrimary,
    color: Colors.leopardPrimary,
  },
  
  // Progress Bar
  progress: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressPeacock: {
    backgroundColor: Colors.peacockPrimary,
  },
  
  progressLeopard: {
    backgroundColor: Colors.leopardPrimary,
  },
  
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.glassMixed,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[2],
    gap: Spacing[2],
  },
  
  tab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  
  tabActive: {
    backgroundColor: Colors.peacockPrimary,
    color: 'white',
    ...Shadow.peacock,
  },
  
  // Navigation
  nav: {
    flexDirection: 'row',
    backgroundColor: Colors.glassMixed,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    gap: Spacing[2],
  },
  
  navItem: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  navItemActive: {
    backgroundColor: Colors.peacockPrimary,
    color: 'white',
  },
  
  // Modal
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  
  modalContent: {
    backgroundColor: Colors.glassMixed,
    borderRadius: BorderRadius['3xl'],
    padding: Spacing[8],
    maxWidth: '90%',
    maxHeight: '90%',
    ...Shadow.mixed,
  },
  
  modalContentPeacock: {
    backgroundColor: Colors.glassPeacock,
    borderWidth: 1,
    borderColor: 'rgba(106, 90, 205, 0.2)',
  },
  
  modalContentLeopard: {
    backgroundColor: Colors.glassLeopard,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  
  // Loading
  loading: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: Colors.peacockPrimary,
  },
  
  loadingLeopard: {
    borderTopColor: Colors.leopardPrimary,
  },
  
  // Utility
  textCenter: {
    textAlign: 'center',
  },
  
  textLeft: {
    textAlign: 'left',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexCol: {
    flexDirection: 'column',
  },
  
  itemsCenter: {
    alignItems: 'center',
  },
  
  itemsStart: {
    alignItems: 'flex-start',
  },
  
  itemsEnd: {
    alignItems: 'flex-end',
  },
  
  justifyCenter: {
    justifyContent: 'center',
  },
  
  justifyStart: {
    justifyContent: 'flex-start',
  },
  
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  flex1: {
    flex: 1,
  },
  
  absolute: {
    position: 'absolute',
  },
  
  relative: {
    position: 'relative',
  },
  
  overflowHidden: {
    overflow: 'hidden',
  },
  
  rounded: {
    borderRadius: BorderRadius.lg,
  },
  
  roundedFull: {
    borderRadius: BorderRadius.full,
  },
  
  shadow: {
    ...Shadow.mixed,
  },
  
  shadowPeacock: {
    ...Shadow.peacock,
  },
  
  shadowLeopard: {
    ...Shadow.leopard,
  },
});

// Animation Presets
export const Animations = {
  shimmer: {
    duration: 2000,
    useNativeDriver: true,
  },
  
  pulse: {
    duration: 1000,
    useNativeDriver: true,
  },
  
  bounce: {
    duration: 1000,
    useNativeDriver: true,
  },
  
  fadeIn: {
    duration: 500,
    useNativeDriver: true,
  },
  
  slideIn: {
    duration: 500,
    useNativeDriver: true,
  },
};

// Platform-specific adjustments
export const Platform = {
  ios: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  
  android: {
    elevation: 4,
  },
};

// Responsive breakpoints
export const Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Export everything as a single theme object
export const PeacockTheme = {
  Colors,
  Gradients,
  Typography,
  Spacing,
  BorderRadius,
  Shadow,
  Styles,
  Animations,
  Platform,
  Breakpoints,
};

export default PeacockTheme;
