'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Focus chat input', category: 'Navigation' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Ctrl', 'L'], description: 'Open limbic view', category: 'Navigation' },
  { keys: ['Ctrl', 'H'], description: 'Open heritage browser', category: 'Navigation' },
  { keys: ['Ctrl', ','], description: 'Open settings', category: 'Navigation' },
  
  // Chat
  { keys: ['Enter'], description: 'Send message', category: 'Chat' },
  { keys: ['Shift', 'Enter'], description: 'New line', category: 'Chat' },
  { keys: ['Ctrl', 'U'], description: 'Clear input', category: 'Chat' },
  { keys: ['↑'], description: 'Edit last message', category: 'Chat' },
  
  // Actions
  { keys: ['Ctrl', 'N'], description: 'New conversation', category: 'Actions' },
  { keys: ['Ctrl', 'S'], description: 'Save conversation', category: 'Actions' },
  { keys: ['Ctrl', '/'], description: 'Toggle this help', category: 'Actions' },
  { keys: ['Esc'], description: 'Close dialogs', category: 'Actions' },
];

export function KeyboardShortcutsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ to toggle help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg border border-gray-700 transition-colors z-40"
        title="Keyboard Shortcuts (Ctrl+/)"
      >
        <CommandLineIcon className="w-6 h-6 text-gray-300" />
      </button>
    );
  }

  const categories = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <CommandLineIcon className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {categories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS.filter((s) => s.category === category).map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-900 border border-gray-700 rounded">
                            {key}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-gray-500 mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">Ctrl</kbd>
            {' + '}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">/</kbd>
            {' '} to toggle this panel
          </p>
        </div>
      </div>
    </div>
  );
}
