'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface EnhancedChatInputProps {
  onSend: (text: string) => void;
  isConnected?: boolean;
  voiceLanguage?: string;
  voiceSupported?: boolean;
  isRecording?: boolean;
  recordingTime?: number;
  onStartRecording?: () => void | NodeJS.Timeout;
  onStopRecording?: (timer?: NodeJS.Timeout) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  isConnected = true,
  voiceLanguage = 'en-US',
  voiceSupported = false,
  isRecording = false,
  recordingTime = 0,
  onStartRecording,
  onStopRecording,
  disabled = false,
  placeholder = 'Message Sallie...',
  maxLength = 2000,
}: EnhancedChatInputProps) {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();

  // Update word and character count
  useEffect(() => {
    setWordCount(input.trim() ? input.trim().split(/\s+/).length : 0);
    setCharCount(input.length);
  }, [input]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Enhanced send handler
  const handleSend = useCallback(() => {
    if (!input.trim() || disabled || !isConnected) return;
    
    const message = input.trim();
    onSend(message);
    setInput('');
    setWordCount(0);
    setCharCount(0);
    
    // Focus back to input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [input, disabled, isConnected, onSend]);

  // Enhanced keyboard handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      setInput('');
      setShowEmojiPicker(false);
    } else if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          setShowEmojiPicker(!showEmojiPicker);
          break;
        case 'Enter':
          if (e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
          break;
      }
    }
  }, [handleSend, isComposing, showEmojiPicker]);

  // Composition handlers for international input
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // Voice recording handlers
  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      onStopRecording?.(recordingTimerRef.current);
    } else {
      const timer = onStartRecording?.();
      if (timer) {
        recordingTimerRef.current = timer;
      }
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  // Emoji insertion
  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = input.substring(0, start) + emoji + input.substring(end);
    
    setInput(newText);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }, [input]);

  // Common emojis
  const commonEmojis = ['😊', '❤️', '🎉', '🚀', '💡', '🌟', '🔥', '💜', '🙏', '✨'];

  // Format recording time
  const formatRecordingTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="relative">
      {/* Main Input Container */}
      <motion.div
        className={`flex items-end gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-800/20 to-purple-900/20 backdrop-blur-sm border transition-all ${
          isFocused 
            ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
            : 'border-purple-800/30'
        } ${disabled ? 'opacity-50' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Emoji Picker Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 rounded-lg hover:bg-purple-700/30 transition-colors"
          title="Add emoji (Ctrl+K)"
          disabled={disabled}
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? 'Connecting...' : placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-transparent border-0 resize-none focus:outline-none text-gray-100 placeholder-gray-400"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          {/* Character/Word Count */}
          {(charCount > 0 || wordCount > 0) && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {charCount}/{maxLength} {wordCount > 0 && `• ${wordCount} words`}
            </div>
          )}
        </div>

        {/* Voice Recording Button */}
        {voiceSupported && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceToggle}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'hover:bg-purple-700/30'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
            disabled={disabled}
          >
            {isRecording ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">
                  {formatRecordingTime(recordingTime)}
                </span>
              </div>
            ) : (
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </motion.button>
        )}

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || disabled || !isConnected}
          className={`p-3 rounded-full transition-all ${
            input.trim() && isConnected && !disabled
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30'
              : 'bg-purple-800/30 text-gray-400 cursor-not-allowed'
          }`}
          title="Send message (Enter)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-xl shadow-xl border border-purple-700/30 p-3 z-50"
          >
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => insertEmoji(emoji)}
                  className="p-2 hover:bg-purple-700/30 rounded-lg transition-colors text-xl"
                  title={emoji}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status Indicator */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-8 left-0 text-sm text-orange-400 flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span>Reconnecting...</span>
        </motion.div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-8 left-0 text-sm text-red-400 flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span>Recording... {formatRecordingTime(recordingTime)}</span>
        </motion.div>
      )}
    </div>
  );
}
