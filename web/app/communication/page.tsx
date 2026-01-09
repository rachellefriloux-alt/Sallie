'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'email' | 'voice' | 'files'>('chat');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<any[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Load initial data
    loadChatHistory();
    loadEmailDrafts();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/communication/text/history');
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.items || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadEmailDrafts = async () => {
    try {
      const response = await fetch('/api/communication/email/outbox');
      if (response.ok) {
        const data = await response.json();
        setEmailDrafts(data || []);
      }
    } catch (error) {
      console.error('Failed to load email drafts:', error);
    }
  };

  const sendChatMessage = async (message: string) => {
    try {
      const response = await fetch('/api/communication/text/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, data]);
        showSuccess('Message sent', 'Your message has been delivered');
      }
    } catch (error) {
      showError('Failed to send', 'Could not send your message');
    }
  };

  const createEmailDraft = async (draft: any) => {
    try {
      const response = await fetch('/api/communication/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailDrafts(prev => [data, ...prev]);
        showSuccess('Draft created', 'Email draft saved successfully');
      }
    } catch (error) {
      showError('Failed to create', 'Could not create email draft');
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      showInfo('Recording stopped', 'Voice recording has been stopped');
    } else {
      // Start recording
      setIsRecording(true);
      showInfo('Recording started', 'Voice recording is now active');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Communication Hub</h1>
          <p className="text-gray-300">Manage chat, email, voice, and file communications</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-black/20 rounded-lg p-1">
          {['chat', 'email', 'voice', 'files'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Chat Interface</h2>
              
              {/* Chat Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendChatMessage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button 
                  aria-label="Send message"
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    sendChatMessage(input.value);
                    input.value = '';
                  }}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Email Drafts</h2>
              
              <div className="space-y-4">
                {emailDrafts.map((draft, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{draft.subject}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        draft.status === 'draft' ? 'bg-gray-600 text-gray-200' :
                        draft.status === 'outbox' ? 'bg-yellow-600 text-yellow-200' :
                        'bg-green-600 text-green-200'
                      }`}>
                        {draft.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">To: {draft.to?.join(', ')}</p>
                    <p className="text-gray-400 text-sm">{draft.body?.substring(0, 100)}...</p>
                    <div className="flex space-x-2 mt-3">
                      <button 
                        aria-label="Edit email draft"
                        className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700"
                      >
                        Edit
                      </button>
                      <button 
                        aria-label="Send email draft"
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => createEmailDraft({
                  to: [''],
                  subject: 'New Email',
                  body: '',
                  tone: 'professional'
                })}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Create New Draft
              </button>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Voice Interface</h2>
              
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <button
                    aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                    onClick={toggleVoiceRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-violet-600 hover:bg-violet-700'
                    }`}
                  >
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
                  )}
                </div>
                
                <p className="text-gray-300">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>

                <div className="flex justify-center space-x-4">
                  <button
                    aria-label={voiceEnabled ? 'Disable voice interface' : 'Enable voice interface'}
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      voiceEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
                    }`}
                  >
                    {voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">File Interface</h2>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-300 mb-2">Drop files here or click to upload</p>
                <button 
                  aria-label="Select files to upload"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Select Files
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Recent Files</h3>
                <div className="space-y-2">
                  {['document.pdf', 'presentation.pptx', 'spreadsheet.xlsx'].map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-300">{file}</span>
                      </div>
                      <button 
                        aria-label={`Analyze ${file}`}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        Analyze
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
