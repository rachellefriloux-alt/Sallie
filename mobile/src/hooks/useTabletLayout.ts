/**
 * Hook to detect tablet and provide responsive layout values.
 */

import { useWindowDimensions } from 'react-native';

export function useTabletLayout() {
  const { width, height } = useWindowDimensions();
  
  // Tablet detection: width > 600px or height > 600px
  const isTablet = width > 600 || height > 600;
  
  // Determine layout orientation
  const isLandscape = width > height;
  
  // Responsive values
  const spacing = isTablet ? 24 : 16;
  const fontSize = {
    small: isTablet ? 14 : 12,
    base: isTablet ? 18 : 16,
    large: isTablet ? 24 : 20,
    xl: isTablet ? 32 : 24,
  };
  
  const maxContentWidth = isTablet ? 1200 : '100%';
  
  return {
    isTablet,
    isLandscape,
    width,
    height,
    spacing,
    fontSize,
    maxContentWidth,
  };
}

