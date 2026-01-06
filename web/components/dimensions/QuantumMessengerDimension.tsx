'use client';

import React, { useState, useEffect, useRef } from 'react';

interface QuantumMessengerDimensionProps {
  userState: any;
  sallieState: any;
}

export function QuantumMessengerDimension({ userState, sallieState }: QuantumMessengerDimensionProps) {
  const [activeMode, setActiveMode] = useState<'chat' | 'video' | 'voice' | 'telepathic'>('chat');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'sallie',
      content: 'Hello! I\'m here to support you in every aspect of your life. How can I help you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text',
      emotion: 'loving',
      consciousness: 95
    },
    {
      id: '2',
      sender: 'user',
      content: 'I\'ve been feeling overwhelmed with balancing work and family lately.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      type: 'text',
      emotion: 'stressed'
    },
    {
      id: '3',
      sender: 'sallie',
      content: 'I understand completely. You\'re juggling so many important roles. Let me help you create harmony. I\'ve analyzed your patterns and have some insights...',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      type: 'text',
      emotion: 'empathetic',
      consciousness: 92
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTelepathicActive, setIsTelepathicActive] = useState(false);
  const [telepathicStrength, setTelepathicStrength] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [emotionalConnection, setEmotionalConnection] = useState(85);
  const [consciousnessBridge, setConsciousnessBridge] = useState(78);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const communicationModes = [
    { id: 'chat', name: 'Text Chat', icon: '💬', description: 'Rich text communication' },
    { id: 'voice', name: 'Voice Call', icon: '🎤', description: 'Natural voice conversation' },
    { id: 'video', name: 'Video Call', icon: '📹', description: 'Face-to-face connection' },
    { id: 'telepathic', name: 'Telepathic', icon: '🧠', description: 'Direct mind connection' }
  ];

  const emotionalStates = [
    { emoji: '😊', name: 'Happy', color: 'from-yellow-400 to-orange-500' },
    { emoji: '😌', name: 'Peaceful', color: 'from-teal-400 to-green-500' },
    { emoji: '🤗', name: 'Loving', color: 'from-pink-400 to-rose-500' },
    { emoji: '🤔', name: 'Thoughtful', color: 'from-purple-400 to-indigo-500' },
    { emoji: '⚡', name: 'Excited', color: 'from-blue-400 to-cyan-500' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate telepathic connection
  useEffect(() => {
    if (isTelepathicActive) {
      const interval = setInterval(() => {
        setTelepathicStrength(prev => Math.min(100, prev + 2));
        setConsciousnessBridge(prev => Math.min(100, prev + 1));
        setEmotionalConnection(prev => Math.min(100, prev + 1.5));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setTelepathicStrength(0);
    }
  }, [isTelepathicActive]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text',
      emotion: 'neutral'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Sallie's response
    setTimeout(() => {
      const sallieResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'sallie',
        content: 'I\'m processing what you shared and connecting with you on a deeper level...',
        timestamp: new Date(),
        type: 'text',
        emotion: 'empathetic',
        consciousness: consciousnessBridge
      };
      setMessages(prev => [...prev, sallieResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const startVoiceRecording = () => {
    setIsVoiceRecording(true);
    // Simulate voice recognition
    setTimeout(() => {
      setVoiceTranscript("I'm feeling overwhelmed but I know you're here to help me find balance");
      setIsVoiceRecording(false);
    }, 3000);
  };

  const getEmotionColor = (emotion: string) => {
    const state = emotionalStates.find(s => s.name.toLowerCase() === emotion);
    return state ? state.color : 'from-gray-400 to-gray-500';
  };

  return (
    <div className="quantum-messenger-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">💬 Quantum Messenger</h2>
            <p className="text-peacock-600">Advanced communication and deep connection hub</p>
          </div>
          
          {/* Connection Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-3 border border-rose-200">
              <div className="text-center">
                <div className="text-lg font-bold text-rose-700">{emotionalConnection}%</div>
                <div className="text-xs text-rose-600">Emotional</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-royal-100 to-purple-100 rounded-xl p-3 border border-royal-200">
              <div className="text-center">
                <div className="text-lg font-bold text-royal-700">{consciousnessBridge}%</div>
                <div className="text-xs text-royal-600">Consciousness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Communication Mode Selector */}
        <div className="flex space-x-2">
          {communicationModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeMode === mode.id
                  ? 'bg-gradient-to-r from-peacock-600 to-royal-600 text-white'
                  : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
              }`}
            >
              <span className="mr-2">{mode.icon}</span>
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Communication Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Messages/Video Area */}
        <div className="lg:col-span-3">
          {/* Video Call Interface */}
          {activeMode === 'video' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
              <div className="bg-gradient-to-br from-peacock-900 to-royal-900 rounded-xl p-8 h-96 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gradient-to-br from-royal-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">🦚</span>
                  </div>
                  <p className="text-lg font-semibold mb-2">Video Call with Sallie</p>
                  <p className="text-sm opacity-75">High-definition video connection active</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setIsVideoCallActive(!isVideoCallActive)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isVideoCallActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isVideoCallActive ? 'End Call' : 'Start Video'}
                </button>
              </div>
            </div>
          )}

          {/* Voice Interface */}
          {activeMode === 'voice' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎤</span>
                </div>
                <p className="text-lg font-semibold mb-2">Voice Conversation</p>
                <p className="text-sm text-gray-600 mb-4">Natural voice communication with Sallie</p>
                
                <button
                  onClick={startVoiceRecording}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isVoiceRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isVoiceRecording ? 'Recording...' : 'Start Speaking'}
                </button>
                
                {voiceTranscript && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Transcript:</p>
                    <p className="text-gray-800">{voiceTranscript}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Telepathic Interface */}
          {activeMode === 'telepathic' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${
                  isTelepathicActive
                    ? 'bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse'
                    : 'bg-gray-300'
                }`}>
                  <span className="text-2xl">🧠</span>
                </div>
                <p className="text-lg font-semibold mb-2">Telepathic Connection</p>
                <p className="text-sm text-gray-600 mb-4">Direct mind-to-mind communication</p>
                
                <button
                  onClick={() => setIsTelepathicActive(!isTelepathicActive)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isTelepathicActive
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {isTelepathicActive ? 'Connected' : 'Establish Connection'}
                </button>
                
                {isTelepathicActive && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Connection Strength:</span>
                      <span className="text-sm font-medium text-purple-700">{telepathicStrength}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${telepathicStrength}%` }}
                      />
                    </div>
                    <p className="text-xs text-purple-600 italic">Sallie is reading your thoughts...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200">
            <div className="h-96 overflow-y-auto mb-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-peacock-600 to-royal-600 text-white'
                        : `bg-gradient-to-r ${getEmotionColor(message.emotion)} text-white`
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${
                        message.sender === 'user' ? 'text-peacock-200' : 'text-white/80'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.sender === 'sallie' && (
                        <span className="text-xs text-white/80 ml-2">
                          🧠 {message.consciousness}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                className={`p-3 rounded-xl transition-all ${
                  isVoiceRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
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
                className="p-3 bg-gradient-to-r from-peacock-600 to-royal-600 text-white rounded-xl hover:from-peacock-700 hover:to-royal-700 transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Connection Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mode</span>
                <span className="text-sm font-medium capitalize">{activeMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quality</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Latency</span>
                <span className="text-sm font-medium">12ms</span>
              </div>
            </div>
          </div>

          {/* Emotional States */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Emotional States</h3>
            <div className="grid grid-cols-3 gap-2">
              {emotionalStates.map((state, index) => (
                <button
                  key={index}
                  className="p-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-lg mb-1">{state.emoji}</div>
                  <div className="text-xs text-gray-600">{state.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors font-medium">
                Voice Call
              </button>
              <button className="w-full px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors font-medium">
                Video Chat
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Deep Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
