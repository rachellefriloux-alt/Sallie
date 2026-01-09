/**
 * Chat History Hook
 * Implements full conversation history with search, threading, and persistence
 */

import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
  type: 'text' | 'voice' | 'file' | 'image' | 'video';
  threadId?: string;
  parentMessageId?: string;
  reactions?: MessageReaction[];
  bookmarks?: boolean;
  metadata?: {
    edited?: boolean;
    editedAt?: Date;
    attachments?: any[];
    mentions?: string[];
    richText?: string;
    markdown?: string;
  };
}

export interface MessageThread {
  id: string;
  title: string;
  participants: string[];
  messageCount: number;
  lastMessage: Date;
  tags: string[];
  isArchived: boolean;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface ChatHistory {
  messages: Message[];
  threads: MessageThread[];
  searchResults: Message[];
  bookmarks: Message[];
}

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    threads: [],
    searchResults: [],
    bookmarks: []
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add message
  const addMessage = useCallback(async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      metadata: {
        ...message.metadata,
        edited: false
      }
    };

    // Update local state
    setChatHistory(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Send to backend
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        const savedMessage = await response.json();
        // Replace with server-generated message
        setChatHistory(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === newMessage.id ? savedMessage : msg
          )
        }));
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    return newMessage;
  }, []);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string, richText?: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent,
          richText,
          metadata: {
            edited: true,
            editedAt: new Date()
          }
        })
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setChatHistory(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? updatedMessage : msg
          )
        }));
        return updatedMessage;
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChatHistory(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId),
          bookmarks: prev.bookmarks.filter(msg => msg.id !== messageId)
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  // Search messages
  const searchMessages = useCallback(async (query: string) => {
    try {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setChatHistory(prev => ({
          ...prev,
          searchResults: results
        }));
        return results;
      }
    } catch (error) {
      console.error('Failed to search messages:', error);
      return [];
    }
  }, []);

  // Create thread
  const createThread = useCallback(async (title: string, messageIds: string[]) => {
    try {
      const response = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          messageIds,
          tags: []
        })
      });

      if (response.ok) {
        const thread = await response.json();
        setChatHistory(prev => ({
          ...prev,
          threads: [...prev.threads, thread],
          messages: prev.messages.map(msg => 
            messageIds.includes(msg.id) ? { ...msg, threadId: thread.id } : msg
          )
        }));
        return thread;
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }, []);

  // Get thread messages
  const getThreadMessages = useCallback((threadId: string) => {
    return chatHistory.messages.filter(msg => msg.threadId === threadId);
  }, [chatHistory.messages]);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji,
          userId: 'current-user' // In real implementation, this would be the actual user ID
        })
      });

      if (response.ok) {
        const reaction = await response.json();
        setChatHistory(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), reaction]
                }
              : msg
          )
        }));
        return reaction;
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  }, []);

  // Remove reaction
  const removeReaction = useCallback(async (messageId: string, reactionId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions/${reactionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChatHistory(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  reactions: (msg.reactions || []).filter(r => r.id !== reactionId)
                }
              : msg
          )
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }, []);

  // Toggle bookmark
  const toggleBookmark = useCallback(async (messageId: string) => {
    const message = chatHistory.messages.find(msg => msg.id === messageId);
    const isBookmarked = message?.bookmarks || false;

    try {
      const response = await fetch(`/api/chat/messages/${messageId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST'
      });

      if (response.ok) {
        setChatHistory(prev => {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, bookmarks: !isBookmarked }
              : msg
          ),
          bookmarks: isBookmarked 
            ? prev.bookmarks.filter(msg => msg.id !== messageId)
            : [...prev.bookmarks, message]
        }));
        return !isBookmarked;
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      throw error;
    }
  }, [chatHistory.messages, chatHistory.bookmarks]);

  // Get conversation statistics
  const getStats = useCallback(() => {
    return {
      totalMessages: chatHistory.messages.length,
      totalThreads: chatHistory.threads.length,
      totalBookmarks: chatHistory.bookmarks.length,
      totalReactions: chatHistory.messages.reduce((sum, msg) => sum + (msg.reactions?.length || 0), 0),
      lastMessage: chatHistory.messages[chatHistory.messages.length - 1]?.timestamp,
      activeThreads: chatHistory.threads.filter(thread => !thread.isArchived).length
    };
  }, [chatHistory]);

  // Export chat history
  const exportChatHistory = useCallback(async (format: 'json' | 'csv' | 'txt' = 'json') => {
    const exportData = {
      exportDate: new Date().toISOString(),
      stats: getStats(),
      messages: chatHistory.messages,
      threads: chatHistory.threads,
      bookmarks: chatHistory.bookmarks
    };

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        filename = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'csv':
        // Simple CSV export
        const csvHeader = 'ID,Content,Sender,Timestamp,Type,ThreadId,Bookmarked,Reactions\n';
        const csvRows = chatHistory.messages.map(msg => 
          `${msg.id},"${msg.content.replace(/"/g, '""')}","${msg.sender}","${msg.timestamp}","${msg.type || ''}","${msg.threadId || ''}","${msg.bookmarks || false}","${msg.reactions?.length || 0}"`
        ).join('\n');
        content = csvHeader + csvRows;
        mimeType = 'text/csv';
        filename = `chat-history-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'txt':
        content = chatHistory.messages.map(msg => 
          `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender.toUpperCase()}: ${msg.content}`
        ).join('\n\n');
        mimeType = 'text/plain';
        filename = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [chatHistory, getStats]);

  // Import chat history
  const importChatHistory = useCallback(async (file: File) => {
    try {
      const content = await file.text();
      const data = JSON.parse(content);
      
      // Validate and merge with existing history
      if (data.messages && Array.isArray(data.messages)) {
        setChatHistory(prev => ({
          ...prev,
          messages: [...prev.messages, ...data.messages],
          threads: data.threads ? [...prev.threads, ...data.threads] : prev.threads,
          bookmarks: data.bookmarks ? [...prev.bookmarks, ...data.bookmarks] : prev.bookmarks
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to import chat history:', error);
      throw error;
    }
  }, []);

  // Clear history
  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/history', {
        method: 'DELETE'
      });

      if (response.ok) {
        setChatHistory({
          messages: [],
          threads: [],
          searchResults: [],
          bookmarks: []
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw error;
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (chatHistory.messages.length > 0) {
      localStorage.setItem('sallie-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sallie-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatHistory(parsed);
      } catch (error) {
        console.error('Failed to load saved chat history:', error);
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  return {
    chatHistory,
    loading,
    searchQuery,
    setSearchQuery,
    activeThreadId,
    setActiveThreadId,
    
    // Actions
    loadChatHistory,
    addMessage,
    editMessage,
    deleteMessage,
    searchMessages,
    createThread,
    getThreadMessages,
    addReaction,
    removeReaction,
    toggleBookmark,
    getStats,
    exportChatHistory,
    importChatHistory,
    clearHistory
  };
}
