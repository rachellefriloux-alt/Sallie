import { useEffect, useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: any) => {
    // React Native keyboard event handling
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key?.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web platform - add keyboard listener
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      // Native platforms - handle back button and other hardware keys
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        const backShortcut = shortcuts.find(s => s.key === 'Back');
        if (backShortcut) {
          backShortcut.action();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [handleKeyDown, shortcuts]);
}

export const defaultShortcuts: Shortcut[] = [
  {
    key: 'k',
    ctrl: true,
    action: () => {
      // Focus chat input - would need to be implemented with ref
      console.log('Focus chat input shortcut');
    },
    description: 'Focus chat input',
  },
  {
    key: '/',
    action: () => {
      // Focus search - would need to be implemented with ref
      console.log('Focus search shortcut');
    },
    description: 'Focus search',
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals, clear search, etc.
      console.log('Escape shortcut');
    },
    description: 'Close/clear',
  },
  {
    key: 'Back',
    action: () => {
      // Handle back navigation
      console.log('Back shortcut');
    },
    description: 'Go back',
  },
];
