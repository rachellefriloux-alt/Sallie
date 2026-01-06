'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AvatarDisplay } from '../avatar/AvatarDisplay';

interface Message {
  id: string;
  sender: 'user' | 'sallie';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'video';
}

interface ConversationHubProps {
  className?: string;
}

export function ConversationHub({ className = '' }: ConversationHubProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'sallie',
      content: 'Hello! I\'m here to support you in every aspect of your life. How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text'
    },
    {
      id: '2',
      sender: 'user',
      content: 'I\'ve been feeling overwhelmed with balancing work and family lately.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      type: 'text'
    },
    {
      id: '3',
      sender: 'sallie',
      content: 'I understand completely. You\'re juggling so many important roles. Let\'s work together to create more harmony in your schedule. I\'ve noticed you\'re most productive in the mornings - maybe we can leverage that?',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      type: 'text'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Sallie's response
    setTimeout(() => {
      const sallieResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'sallie',
        content: 'I\'m processing what you shared and thinking about the best way to support you...',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, sallieResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={`conversation-hub bg-gradient-to-br from-peacock-50 to-sand-50 rounded-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-peacock-200">
        <div className="flex items-center space-x-4">
          <AvatarDisplay size="lg" mood="attentive" interactive={true} />
          <div>
            <h2 className="text-xl font-bold text-peacock-900">Sallie</h2>
            <p className="text-sm text-peacock-600 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Present and listening
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setIsVideoCallActive(!isVideoCallActive)}
            className={`p-3 rounded-xl transition-all ${
              isVideoCallActive 
                ? 'bg-royal-600 text-white' 
                : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
            }`}
          >
            📹
          </button>
          <button className="p-3 bg-white text-peacock-700 rounded-xl hover:bg-peacock-100 border border-peacock-200">
            📞
          </button>
          <button className="p-3 bg-white text-peacock-700 rounded-xl hover:bg-peacock-100 border border-peacock-200">
            ⚙️
          </button>
        </div>
      </div>

      {/* Video Call Overlay */}
      {isVideoCallActive && (
        <div className="bg-peacock-900 p-4 flex items-center justify-center h-48">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-royal-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <AvatarDisplay size="md" mood="happy" />
            </div>
            <p className="text-sm">Video call with Sallie</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto h-96 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-peacock-600 text-white'
                  : 'bg-white text-gray-800 border border-peacock-200'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-peacock-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-peacock-200 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-peacock-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-peacock-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-peacock-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-peacock-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsVoiceRecording(!isVoiceRecording)}
            className={`p-3 rounded-xl transition-all ${
              isVoiceRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-peacock-100 text-peacock-700 hover:bg-peacock-200'
            }`}
          >
            🎤
          </button>
          
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share your thoughts with Sallie..."
            className="flex-1 px-4 py-3 bg-white border border-peacock-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peacock-500 focus:border-transparent"
          />
          
          <button
            onClick={sendMessage}
            className="p-3 bg-peacock-600 text-white rounded-xl hover:bg-peacock-700 transition-colors"
          >
            ➤
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <button className="px-3 py-1 bg-royal-100 text-royal-700 rounded-full text-xs font-medium hover:bg-royal-200">
            How are you feeling?
          </button>
          <button className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium hover:bg-teal-200">
            Tell me about your day
          </button>
          <button className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium hover:bg-gold-200">
            I need advice
          </button>
        </div>
      </div>
    </div>
  );
}
