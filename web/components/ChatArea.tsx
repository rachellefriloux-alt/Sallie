'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

interface EnhancedMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reactions?: string[];
  bookmarked?: boolean;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    emotionalTone?: string;
    relatedDimension?: string;
    wordCount?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
}

interface PerformanceMetrics {
  renderTime: number;
  messageLatency: number;
  memoryUsage: number;
}

interface ChatAreaProps {
  messages: EnhancedMessage[];
  onSend: (text: string) => void;
  isConnected: boolean;
  isTyping?: boolean;
  voiceLanguage?: string;
  performanceMetrics?: PerformanceMetrics;
}

export function ChatArea({ 
  messages, 
  onSend, 
  isConnected, 
  isTyping = false, 
  voiceLanguage = 'en-US',
  performanceMetrics = { renderTime: 0, messageLatency: 0, memoryUsage: 0 }
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Check voice support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  // Auto-scroll to latest message with smooth behavior
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Enhanced message analytics
  const messageAnalytics = useMemo(() => {
    const totalMessages = messages.length;
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const aiMessages = messages.filter(m => m.sender === 'ai').length;
    const systemMessages = messages.filter(m => m.sender === 'system').length;
    const bookmarkedCount = bookmarkedMessages.size;
    
    const averageResponseTime = messages
      .filter(m => m.sender === 'ai' && m.metadata?.processingTime)
      .reduce((acc, m) => acc + (m.metadata?.processingTime || 0), 0) / 
      Math.max(1, messages.filter(m => m.sender === 'ai').length);

    const averageConfidence = messages
      .filter(m => m.sender === 'ai' && m.metadata?.confidence)
      .reduce((acc, m) => acc + (m.metadata?.confidence || 0), 0) / 
      Math.max(1, messages.filter(m => m.sender === 'ai').length);

    return {
      totalMessages,
      userMessages,
      aiMessages,
      systemMessages,
      bookmarkedCount,
      averageResponseTime,
      averageConfidence,
    };
  }, [messages, bookmarkedMessages]);

  // Search functionality
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(message => 
      message.text.toLowerCase().includes(query) ||
      message.metadata?.relatedDimension?.toLowerCase().includes(query) ||
      message.metadata?.emotionalTone?.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  // Enhanced reaction handling
  const handleReaction = useCallback((messageId: string, reaction: string) => {
    // This would integrate with a backend service
    console.log('Reaction added:', messageId, reaction);
    // Show notification or update UI
  }, []);

  // Enhanced bookmark handling
  const handleBookmark = useCallback((messageId: string) => {
    setBookmarkedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  // Message selection for details
  const handleMessageSelect = useCallback((messageId: string) => {
    setSelectedMessage(messageId);
    setShowMessageDetails(true);
  }, []);

  // Voice recording functionality
  const startRecording = useCallback(async () => {
    if (!voiceSupported) return;
    
    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Initialize voice recognition
      // This would integrate with Web Speech API or a service
      console.log('Starting voice recording...');
      
      return timer;
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [voiceSupported]);

  const stopRecording = useCallback((timer?: NodeJS.Timeout) => {
    if (timer) {
      clearInterval(timer);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    console.log('Stopping voice recording...');
    // Process voice input and send message
  }, []);

  // Export chat functionality
  const exportChat = useCallback(() => {
    const chatData = {
      messages: filteredMessages,
      analytics: messageAnalytics,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sallie-chat-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredMessages, messageAnalytics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case 'e':
            e.preventDefault();
            exportChat();
            break;
          case 'b':
            e.preventDefault();
            // Toggle bookmarks view
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, exportChat]);

  const selectedMessageData = messages.find(m => m.id === selectedMessage);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-purple-900/20">
      {/* Enhanced Header */}
      <motion.header 
        className="flex items-center justify-between p-4 border-b border-purple-800/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-100">Chat with Sallie</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{messageAnalytics.totalMessages} messages</span>
            <span>•</span>
            <span>{messageAnalytics.bookmarkedCount} bookmarked</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg bg-purple-800/20 hover:bg-purple-800/30 transition-colors"
            title="Search messages (Ctrl+F)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
          
          {/* Export */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportChat}
            className="p-2 rounded-lg bg-purple-800/20 hover:bg-purple-800/30 transition-colors"
            title="Export chat (Ctrl+E)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </motion.button>
        </div>
      </motion.header>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-purple-800/20 border border-purple-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 placeholder-gray-400"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-400">
                Found {filteredMessages.length} messages
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white' 
                    : 'bg-gradient-to-r from-purple-800 to-purple-900 text-gray-100'
                } ${selectedMessage === message.id ? 'ring-2 ring-purple-400' : ''}`}
                onClick={() => handleMessageSelect(message.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium opacity-75">
                    {message.sender === 'user' ? 'You' : 'Sallie'}
                  </span>
                  <div className="flex items-center space-x-2">
                    {message.metadata?.confidence && (
                      <span className="text-xs opacity-60">
                        {Math.round(message.metadata.confidence * 100)}%
                      </span>
                    )}
                    {message.metadata?.processingTime && (
                      <span className="text-xs opacity-60">
                        {message.metadata.processingTime}ms
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </div>
                
                {message.metadata && (
                  <div className="mt-2 flex items-center space-x-2 text-xs opacity-60">
                    {message.metadata.emotionalTone && (
                      <span className="px-2 py-1 bg-purple-700/30 rounded">
                        {message.metadata.emotionalTone}
                      </span>
                    )}
                    {message.metadata.relatedDimension && (
                      <span className="px-2 py-1 bg-purple-700/30 rounded">
                        {message.metadata.relatedDimension}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(message.id);
                      }}
                      className={`p-1 rounded hover:bg-purple-700/30 transition-colors ${
                        bookmarkedMessages.has(message.id) ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                      title="Bookmark"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-r from-purple-800 to-purple-900 text-gray-100 p-4 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Chat Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="p-4 border-t border-purple-800/30"
      >
        <ChatInput
          onSend={onSend}
          isConnected={isConnected}
          voiceLanguage={voiceLanguage}
          voiceSupported={voiceSupported}
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />
      </motion.div>

      {/* Message Details Modal */}
      <AnimatePresence>
        {showMessageDetails && selectedMessageData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowMessageDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Message Details</h3>
                <button
                  onClick={() => setShowMessageDetails(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Content</h4>
                  <p className="text-gray-100 mt-1">{selectedMessageData.text}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Metadata</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Sender:</span> {selectedMessageData.sender}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Time:</span> {new Date(selectedMessageData.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Status:</span> {selectedMessageData.status}
                    </p>
                    {selectedMessageData.metadata?.processingTime && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Processing Time:</span> {selectedMessageData.metadata.processingTime}ms
                      </p>
                    )}
                    {selectedMessageData.metadata?.confidence && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Confidence:</span> {Math.round(selectedMessageData.metadata.confidence * 100)}%
                      </p>
                    )}
                    {selectedMessageData.metadata?.emotionalTone && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Emotional Tone:</span> {selectedMessageData.metadata.emotionalTone}
                      </p>
                    )}
                    {selectedMessageData.metadata?.relatedDimension && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Related Dimension:</span> {selectedMessageData.metadata.relatedDimension}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Metrics (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/50 text-white p-2 rounded text-xs">
          <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>Latency: {performanceMetrics.messageLatency.toFixed(2)}ms</div>
          <div>Memory: {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
        </div>
      )}
    </div>
  );
}
