'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  FaceSmileIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
}

interface SalliePresence {
  online: boolean;
  thinking: boolean;
  mood: string;
  energy: number;
}

interface FloatingMessengerProps {
  isOpen: boolean;
  onClose: () => void;
  presence: SalliePresence;
}

export function FloatingMessenger({ isOpen, onClose, presence }: FloatingMessengerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here and ready to chat. How can I help you today?",
      sender: 'sallie',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulate Sallie response
      setTimeout(() => {
        const sallieResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I understand. Let me think about that...",
          sender: 'sallie',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sallieResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  if (!isOpen) return null;

  return (
    <div className="floating-messenger w-96 h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-leopard-accent/20">
        <div className="flex items-center space-x-3">
          <div className={`avatar-presence ${presence.online ? 'online' : ''} ${presence.thinking ? 'thinking' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-purple to-peacock-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sallie</h3>
            <p className="text-xs text-gray-500 capitalize">
              {presence.online ? 'Online' : 'Offline'} • {presence.mood}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Close messenger"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] px-4 py-2 rounded-2xl
                ${message.sender === 'user' 
                  ? 'bg-peacock-blue text-white rounded-br-sm' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }
                infj-soft
              `}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-leopard-accent/20">
        <div className="chat-input-container">
          <div className="flex items-end space-x-2">
            {/* Attachment button */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Attach file">
              <PaperClipIcon className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Voice recording button */}
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isRecording 
                  ? 'bg-red-500 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            
            {/* Text input */}
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-transparent border-none outline-none resize-none text-sm"
                rows={1}
              />
            </div>
            
            {/* Emoji button */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Add emoji">
              <FaceSmileIcon className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2 bg-peacock-blue text-white rounded-lg hover:bg-peacock-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
