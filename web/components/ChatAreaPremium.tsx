'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  MoreVertical,
  User,
  Bot,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Zap,
  Brain,
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Download,
  Share,
  Bookmark,
  Flag
} from 'lucide-react';

// Enhanced types for better type safety
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  metadata?: {
    processingTime?: number;
    confidence?: number;
    emotionalTone?: string;
    relatedDimension?: string;
    limbicState?: {
      trust: number;
      warmth: number;
      arousal: number;
      valence: number;
      posture: string;
    };
    reactions?: {
      [key: string]: number;
    };
    bookmarks?: number;
    isEdited?: boolean;
    editHistory?: Array<{
      timestamp: number;
      text: string;
    }>;
  };
}

interface ChatAreaProps {
  messages: Message[];
  onSend: (message: string, metadata?: any) => Promise<void>;
  isConnected: boolean;
  isTyping: boolean;
  voiceLanguage: string;
  performanceMetrics: {
    renderTime: number;
    messageLatency: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  systemStatus: {
    ghostInterface: boolean;
    cliInterface: boolean;
    activeVeto: boolean;
    foundryEval: boolean;
    memoryHygiene: boolean;
    voiceCommands: boolean;
    undoWindow: boolean;
    brainForge: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export function ChatArea({
  messages,
  onSend,
  isConnected,
  isTyping,
  voiceLanguage,
  performanceMetrics,
  systemStatus,
  theme
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollY = useScroll();

  // Enhanced auto-scroll with smooth behavior
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced message status icons
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-blue-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-green-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-purple-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  // Enhanced message formatting with markdown support
  const formatMessage = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-purple-500/20 px-1 py-0.5 rounded text-purple-300">$1</code>')
      .replace(/\n/g, '<br />');
  };

  // Enhanced message sending with better error handling
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !isConnected) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await onSend(messageText, {
        timestamp: Date.now(),
        limbicState: {
          trust: 0.8,
          warmth: 0.7,
          arousal: 0.6,
          valence: 0.7,
          posture: 'companion'
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(messageText); // Restore text on error
    }
  }, [inputText, isConnected, onSend]);

  // Enhanced voice recording
  const handleVoiceToggle = useCallback(() => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  }, [isRecording]);

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line
    } else if (e.key === 'Escape') {
      setInputText('');
    }
  }, [handleSend]);

  // Enhanced message reactions
  const handleReaction = useCallback((messageId: string, emoji: string) => {
    // Reaction logic would go here
    console.log(`Reacted to message ${messageId} with ${emoji}`);
  }, []);

  // Enhanced message actions
  const handleMessageAction = useCallback((messageId: string, action: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(messages.find(m => m.id === messageId)?.text || '');
        break;
      case 'bookmark':
        // Bookmark logic
        break;
      case 'flag':
        // Flag logic
        break;
      case 'share':
        // Share logic
        break;
      case 'download':
        // Download logic
        break;
    }
  }, [messages]);

  // Enhanced message grouping
  const groupedMessages = useMemo(() => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      if (index === 0) {
        currentGroup.push(message);
      } else {
        const prevMessage = messages[index - 1];
        const timeDiff = message.timestamp - prevMessage.timestamp;
        const sameSender = message.sender === prevMessage.sender;
        
        if (sameSender && timeDiff < 60000) { // Same sender within 1 minute
          currentGroup.push(message);
        } else {
          groups.push(currentGroup);
          currentGroup = [message];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/50 to-slate-800/50">
      {/* Enhanced Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollY.ref}>
        <AnimatePresence>
          {groupedMessages.map((group, groupIndex) => (
            <motion.div
              key={`group-${groupIndex}`}
              className={`flex ${group[0].sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
            >
              <div className={`max-w-3xl ${group[0].sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Group Header */}
                {group.length > 1 && (
                  <div className={`text-xs text-gray-500 mb-2 ${group[0].sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {group[0].sender === 'user' ? 'You' : 'Sallie'} • {group.length} messages
                  </div>
                )}

                {/* Messages in Group */}
                {group.map((message, messageIndex) => (
                  <motion.div
                    key={message.id}
                    className={`group relative ${messageIndex > 0 ? 'mt-1' : ''}`}
                    onMouseEnter={() => setSelectedMessage(message.id)}
                    onMouseLeave={() => setSelectedMessage(null)}
                  >
                    <div
                      className={`relative px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-12'
                          : 'bg-slate-700/50 text-white border border-purple-500/20 mr-12'
                      } backdrop-blur-sm`}
                    >
                      {/* Message Content */}
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                      />

                      {/* Message Metadata */}
                      {message.metadata && (
                        <div className="mt-2 flex items-center space-x-2 text-xs opacity-70">
                          {message.metadata.processingTime && (
                            <span className="flex items-center space-x-1">
                              <Zap className="w-3 h-3" />
                              <span>{message.metadata.processingTime.toFixed(0)}ms</span>
                            </span>
                          )}
                          {message.metadata.confidence && (
                            <span className="flex items-center space-x-1">
                              <Brain className="w-3 h-3" />
                              <span>{(message.metadata.confidence * 100).toFixed(0)}%</span>
                            </span>
                          )}
                          {message.metadata.emotionalTone && (
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{message.metadata.emotionalTone}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Status */}
                      <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Message Actions */}
                      <AnimatePresence>
                        {selectedMessage === message.id && (
                          <motion.div
                            className={`absolute ${message.sender === 'user' ? 'left-0 -ml-32' : 'right-0 -mr-32'} top-0 bg-slate-800 rounded-lg border border-purple-500/20 p-1 flex space-x-1`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <button
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              onClick={() => handleMessageAction(message.id, 'copy')}
                              title="Copy message"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              onClick={() => handleMessageAction(message.id, 'bookmark')}
                              title="Bookmark message"
                            >
                              <Bookmark className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              onClick={() => handleMessageAction(message.id, 'share')}
                              title="Share message"
                            >
                              <Share className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              onClick={() => handleMessageAction(message.id, 'flag')}
                              title="Flag message"
                            >
                              <Flag className="w-3 h-3" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Message Reactions */}
                      {message.metadata?.reactions && Object.keys(message.metadata.reactions).length > 0 && (
                        <div className="absolute bottom-0 right-0 flex space-x-1">
                          {Object.entries(message.metadata.reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              className="px-1 py-0.5 bg-slate-600/50 rounded text-xs hover:bg-slate-600/70 transition-colors"
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              {emoji} {count}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`absolute ${message.sender === 'user' ? '-right-10' : '-left-10'} top-0`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-3xl mr-12">
                <div className="bg-slate-700/50 border border-purple-500/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">Sallie is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-purple-500/20 bg-slate-800/50 backdrop-blur-xl p-4">
        {/* System Status Bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-gray-400">
                {performanceMetrics.renderTime.toFixed(0)}ms render
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {Object.values(systemStatus).filter(Boolean).length}/{Object.keys(systemStatus).length} systems active
            </div>
          </div>
        </div>

        {/* Input Container */}
        <div className="relative">
          <div className="flex items-end space-x-2">
            {/* Attachment Button */}
            <motion.button
              className="p-2 rounded-lg bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
              aria-label="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                aria-label="Message input"
                aria-describedby="character-count"
              />
              
              {/* Character Count */}
              {inputText.length > 0 && (
                <div id="character-count" className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {inputText.length}/2000
                </div>
              )}
            </div>

            {/* Voice Button */}
            <motion.button
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30'
                  : 'bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceToggle}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>

            {/* Emoji Button */}
            <motion.button
              className="p-2 rounded-lg bg-slate-700/50 border border-purple-500/20 hover:bg-slate-700/70 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </motion.button>

            {/* Send Button */}
            <motion.button
              className={`px-4 py-2 rounded-xl transition-all ${
                inputText.trim() && isConnected
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'bg-slate-700/50 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={inputText.trim() && isConnected ? { scale: 1.05 } : {}}
              whileTap={inputText.trim() && isConnected ? { scale: 0.95 } : {}}
              onClick={handleSend}
              disabled={!inputText.trim() || !isConnected}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            title="Upload files"
            aria-label="Upload files"
          />

          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg border border-purple-500/20 p-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-8 gap-1">
                  {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'].map((emoji) => (
                  <button
                    key={emoji}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                    onClick={() => {
                      setInputText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
