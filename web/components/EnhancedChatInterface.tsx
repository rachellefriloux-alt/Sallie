'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

interface EnhancedChatInterfaceProps {
  className?: string;
  onMessageSend?: (message: string) => void;
  onSallieResponse?: (response: string) => void;
}

export function EnhancedChatInterface({ className = '', onMessageSend, onSallieResponse }: EnhancedChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isRichTextMode, setIsRichTextMode] = useState(false);
  const [showThreadView, setShowThreadView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    chatHistory,
    loading,
    searchMessages,
    addMessage,
    createThread,
    getThreadMessages,
    addReaction,
    removeReaction,
    toggleBookmark,
    exportChatHistory
  } = useChatHistory();
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory.messages]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const message = isRichTextMode 
      ? inputMessage
      : inputMessage;

    try {
      const savedMessage = await addMessage({
        content: message,
        sender: 'user',
        type: 'text',
        threadId: selectedThreadId || undefined,
        metadata: {
          richText: isRichTextMode ? message : undefined,
          markdown: !isRichTextMode ? message : undefined
        }
      });

      setInputMessage('');
      setIsTyping(false);
      onMessageSend?.(message);

      // Send to WebSocket for real-time updates
      if (sendMessage) {
        sendMessage({
          type: 'chat-message',
          data: savedMessage
        });
      
        // Trigger Sallie response
        setTimeout(() => {
          onSallieResponse?.('I received your message and I\'m thinking about it...');
        }, 1000);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      showError('Failed to send', 'Could not send your message');
    }
  }, [inputMessage, isRichTextMode, selectedThreadId, addMessage, onMessageSend, onSallieResponse, sendMessage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    for (const file of files) {
      const message = await addMessage({
        content: `📎 Uploaded: ${file.name}`,
        sender: 'user',
        type: 'file',
        metadata: {
          attachments: [{
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
          }]
        }
      });
      
      onMessageSend?.(`📎 Uploaded: ${file.name}`);
    }
  }, [addMessage, onMessageSend]);

  // Handle voice recording
  const toggleVoiceRecording = useCallback(() => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      showInfo('Voice recording stopped', 'Voice recording has been stopped');
    } else {
      showInfo('Voice recording started', 'Voice recording is now active');
    }
  }, [isRecording, showInfo]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await searchMessages(searchQuery);
    } else {
      // Clear search results
    }
  }, [searchQuery, searchMessages]);

  // Handle thread creation
  const handleCreateThread = useCallback(async (messageIds: string[]) => {
    try {
      const thread = await createThread('New Thread', messageIds);
      setSelectedThreadId(thread.id);
      showSuccess('Thread created', 'Conversation thread created successfully');
    } catch (error) {
      console.error('Failed to create thread:', error);
      showError('Failed to create thread', 'Could not create conversation thread');
    }
  }, [createThread, showSuccess, showError]);

  // Handle reactions
  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
      showSuccess('Reaction added', `${emoji} reaction added`);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      showError('Failed to add reaction', 'Could not add reaction');
    }
  }, [addReaction, showSuccess, showError]);

  // Handle bookmarks
  const handleBookmark = useCallback(async (messageId: string) => {
    try {
      const isBookmarked = await toggleBookmark(messageId);
      showInfo(
        isBookmarked ? 'Message bookmarked' : 'Bookmark removed',
        isBookmarked ? 'Message has been bookmarked' : 'Bookmark removed'
      );
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      showError('Failed to toggle bookmark', 'Could not toggle bookmark');
    }
  }, [toggleBookmark, showInfo, showError]);

  // Get messages for current view
  const currentMessages = selectedThreadId 
    ? getThreadMessages(selectedThreadId)
    : chatHistory.messages;

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Enhanced Chat</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowThreadView(!showThreadView)}
              className={`px-3 py-2 rounded-lg text-sm ${
                showThreadView 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🧵 Threads
            </button>
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`px-3 py-2 rounded-lg text-sm ${
                showReactions 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              😊 Reactions
            </button>
            <button
              onClick={() => setIsRichTextMode(!isRichTextMode)}
              className={`px-3 py-2 rounded-lg text-sm ${
                isRichTextMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isRichTextMode ? '📝 Rich Text' : '📝 Plain Text'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`group flex gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-violet-600'
              }`}>
                <span className="text-white text-sm font-medium">
                  {message.sender === 'user' ? 'U' : 'S'}
                </span>
              </div>

              {/* Message Content */}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                {message.metadata?.richText ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: message.content }} 
                    className="text-sm" 
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                
                {/* Message Metadata */}
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {message.threadId && (
                    <span className="text-xs text-violet-400">
                      🧵 Thread
                    </span>
                  )}
                  
                  {message.bookmarks && (
                    <span className="text-xs text-yellow-400">
                      ⭐ Bookmarked
                    </span>
                  )}
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <span className="text-xs text-pink-400">
                      {message.reactions.length} reactions
                    </span>
                  )}
                </div>

                {/* Reactions */}
                {showReactions && (
                  <div className="flex items-center space-x-2 mt-2">
                    {['👍', '❤️', '👎', '😊', '🎉', '🤔', '👁', '🎯'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="text-lg hover:scale-110 transition-transform"
                        title={`${emoji} ${message.reactions?.some(r => r.emoji === emoji) ? 'Remove' : 'Add'} reaction`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bookmark */}
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => handleBookmark(message.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      message.bookmarks
                        ? 'bg-yellow-600 text-yellow-200'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {message.bookmarks ? '⭐ Bookmarked' : '🔖 Bookmark'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-2 px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-gray-400">Sallie is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-end space-x-2 p-4 border-t border-gray-700">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            placeholder={isRichTextMode ? "Enter rich text..." : "Type your message..."}
            className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          {isRichTextMode && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Rich text mode enabled
            </div>
          )}
        </div>
        
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
        
        <button
          onClick={toggleVoiceRecording}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isRecording ? '🔴 Stop' : '🎤 Voice'}
        </button>
      </div>
    </div>
  );
}
