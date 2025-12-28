'use client';

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const defaultShortcuts: Shortcut[] = [
  {
    key: 'k',
    ctrl: true,
    action: () => {
      const input = document.querySelector('#chat-input') as HTMLTextAreaElement;
      input?.focus();
    },
    description: 'Focus chat input',
  },
  {
    key: '/',
    action: () => {
      const search = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
      search?.focus();
    },
    description: 'Focus search',
  },
  {
    key: 'Escape',
    action: () => {
      // Close modals, clear search, etc.
      const search = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
      if (search) {
        search.value = '';
        search.blur();
      }
    },
    description: 'Close/clear',
  },
];

