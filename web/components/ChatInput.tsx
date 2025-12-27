'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Connecting...' : 'Message Sallie...'}
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                     text-gray-100 placeholder-gray-500 resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Chat input"
          aria-describedby="input-help"
        />
        <span id="input-help" className="sr-only">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
      
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="px-6 py-3 bg-gradient-to-br from-primary to-primary-dark 
                   text-white rounded-xl font-medium
                   hover:from-primary-dark hover:to-primary
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}

