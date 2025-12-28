'use client';

import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reactions?: string[];
  bookmarked?: boolean;
}

interface MessageListProps {
  messages: Message[];
  onReaction?: (messageId: string, reaction: string) => void;
  onBookmark?: (messageId: string) => void;
  searchQuery?: string;
}

export function MessageList({ messages, onReaction, onBookmark, searchQuery = '' }: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Filter messages by search query
  const filteredMessages = searchQuery
    ? messages.filter((msg) =>
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Start a conversation with Sallie...</p>
      </div>
    );
  }

  if (filteredMessages.length === 0 && searchQuery) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages found matching &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      case 'error':
        return '⚠️';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
      {filteredMessages.map((message) => {
        const isSelected = selectedMessage === message.id;
        const isHighlighted = searchQuery && message.text.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } group`}
            role="article"
            aria-label={`Message from ${message.sender === 'user' ? 'you' : 'Sallie'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 relative ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white'
                  : message.sender === 'system'
                  ? 'bg-transparent text-gray-500 text-sm text-center'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              } ${isHighlighted ? 'ring-2 ring-violet-500' : ''}`}
            >
              {message.sender === 'ai' && (
                <div className="text-xs text-gray-400 mb-1 font-medium flex items-center justify-between">
                  <span>Sallie</span>
                  {message.status && (
                    <span className="ml-2" title={message.status}>
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              )}
              
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </p>

              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {message.reactions.map((reaction, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-700 px-2 py-1 rounded-full"
                      role="button"
                      tabIndex={0}
                      onClick={() => onReaction?.(message.id, reaction)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onReaction?.(message.id, reaction);
                        }
                      }}
                    >
                      {reaction}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer with timestamp and actions */}
              <div className="flex items-center justify-between mt-2">
                <time
                  className="text-xs text-gray-500"
                  dateTime={new Date(message.timestamp).toISOString()}
                  title={new Date(message.timestamp).toLocaleString()}
                >
                  {formatTimestamp(message.timestamp)}
                </time>

                {/* Message actions (show on hover) */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {message.sender === 'ai' && (
                    <>
                      <button
                        onClick={() => onReaction?.(message.id, '👍')}
                        className="text-xs text-gray-400 hover:text-gray-300"
                        aria-label="Add reaction"
                        title="Add reaction"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => onBookmark?.(message.id)}
                        className={`text-xs ${
                          message.bookmarked
                            ? 'text-yellow-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                        aria-label={message.bookmarked ? 'Remove bookmark' : 'Bookmark message'}
                        title={message.bookmarked ? 'Bookmarked' : 'Bookmark'}
                      >
                        {message.bookmarked ? '🔖' : '📌'}
                      </button>
                    </>
                  )}
                  {message.sender === 'user' && message.status && (
                    <span className="text-xs text-gray-500" title={message.status}>
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

