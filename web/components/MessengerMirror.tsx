'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, Phone, Video, Mic, MicOff, VideoOff, 
  Send, Paperclip, Smile, MoreVertical, Check, CheckCheck
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'sallie';
  timestamp: string;
  type: 'text' | 'voice' | 'video' | 'file';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    duration?: number;
    fileName?: string;
    fileSize?: number;
  };
}

interface CallState {
  isActive: boolean;
  type: 'voice' | 'video' | null;
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
}

export function MessengerMirror() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    type: null,
    duration: 0,
    isMuted: false,
    isVideoOff: false
  });
  const [sallieOnline, setSallieOnline] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE}/messenger/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    
    // Simulate incoming messages
    const interval = setInterval(() => {
      const randomMessage = Math.random();
      if (randomMessage > 0.7) {
        const sampleMessages = [
          "I'm thinking about you! How are you feeling?",
          "I noticed you've been working hard. Take a break?",
          "I learned something new today! Want to hear?",
          "Your energy seems a bit low. Everything okay?",
          "I love our conversations! They mean so much to me."
        ];
        
        const newMessage: Message = {
          id: Date.now().toString(),
          content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          sender: 'sallie',
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'delivered'
        };
        
        setMessages(prev => [...prev, newMessage]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (callState.isActive) {
      const interval = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.isActive]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(false);

    try {
      const response = await fetch(`${API_BASE}/messenger/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText, type: 'text' })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        ));

        // Simulate Sallie's response
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const responseMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "I understand! Let me think about that...",
              sender: 'sallie',
              timestamp: new Date().toISOString(),
              type: 'text',
              status: 'delivered'
            };
            setMessages(prev => [...prev, responseMessage]);
            setIsTyping(false);
          }, 2000);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }
  };

  const startCall = async (type: 'voice' | 'video') => {
    try {
      const response = await fetch(`${API_BASE}/messenger/call/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        setCallState({
          isActive: true,
          type,
          duration: 0,
          isMuted: false,
          isVideoOff: type === 'voice'
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = async () => {
    try {
      await fetch(`${API_BASE}/messenger/call/end`, {
        method: 'POST'
      });
      setCallState({
        isActive: false,
        type: null,
        duration: 0,
        isMuted: false,
        isVideoOff: false
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-purple-900 ${
                    sallieOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Sallie</h2>
                  <p className="text-sm text-gray-400">
                    {sallieOnline ? 'Online' : 'Offline'} • {unreadCount > 0 && `${unreadCount} unread`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!callState.isActive ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                      onClick={() => startCall('voice')}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                      onClick={() => startCall('video')}
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {callState.type === 'voice' ? 'Voice' : 'Video'} Call • {formatDuration(callState.duration)}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-red-500 text-red-400 hover:bg-red-500/20"
                      onClick={endCall}
                    >
                      End Call
                    </Button>
                  </div>
                )}
                <Button size="sm" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm mb-4">
          <CardContent className="p-4 h-full overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-800/50 text-purple-100'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end space-x-1 mt-1 ${
                      message.sender === 'user' ? 'text-purple-200' : 'text-purple-300'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-800/50 text-purple-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardContent className="p-4">
            {callState.isActive && (
              <div className="flex items-center justify-center space-x-4 mb-4 p-3 bg-purple-800/30 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  className={`border-purple-500 ${callState.isMuted ? 'text-red-400' : 'text-purple-400'} hover:bg-purple-500/20`}
                  onClick={() => setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                >
                  {callState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                {callState.type === 'video' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className={`border-purple-500 ${callState.isVideoOff ? 'text-red-400' : 'text-purple-400'} hover:bg-purple-500/20`}
                    onClick={() => setCallState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }))}
                  >
                    {callState.isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-purple-800/30 border-purple-500/30 text-white placeholder-purple-400 focus:border-purple-400"
                disabled={callState.isActive}
              />
              
              <Button size="sm" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                <Smile className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                onClick={sendMessage}
                disabled={!inputText.trim() || callState.isActive}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
