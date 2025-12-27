'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reactions?: string[];
  bookmarked?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  onSend: (text: string) => void;
  isConnected: boolean;
  isTyping?: boolean;
}

export function ChatArea({ messages, onSend, isConnected, isTyping = false }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleReaction = (messageId: string, reaction: string) => {
    // Toggle reaction logic would go here
    console.log('Reaction:', messageId, reaction);
  };

  const handleBookmark = (messageId: string) => {
    setBookmarkedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

  const handleExport = () => {
    const exportData = messages.map((msg) => ({
      timestamp: new Date(msg.timestamp).toISOString(),
      sender: msg.sender,
      text: msg.text,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sallie-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const messagesWithBookmarks = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        bookmarked: bookmarkedMessages.has(msg.id),
      })),
    [messages, bookmarkedMessages]
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <header className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Conversation</h1>
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-800"
            aria-label="Search messages"
            title="Search messages"
          >
            🔍
          </button>
          
          {/* Export */}
          <button
            onClick={handleExport}
            className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-800"
            aria-label="Export conversation"
            title="Export conversation"
          >
            📥
          </button>

          <span
            className={`text-xs px-2 py-1 rounded ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-6 py-2 border-b border-gray-800 bg-gray-800/50">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            aria-label="Search messages"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4" role="log" aria-live="polite" aria-label="Chat messages">
        <MessageList
          messages={messagesWithBookmarks}
          onReaction={handleReaction}
          onBookmark={handleBookmark}
          searchQuery={searchQuery}
        />
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mt-4">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <ChatInput onSend={onSend} disabled={!isConnected} />
      </div>
    </div>
  );
}

