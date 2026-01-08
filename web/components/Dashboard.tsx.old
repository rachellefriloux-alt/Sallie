'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ConnectionStatus } from './ConnectionStatus';
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLimbicStore } from '@/store/useLimbicStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useKeyboardShortcuts, defaultShortcuts } from '@/hooks/useKeyboardShortcuts';

export function Dashboard() {
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'ai' | 'system';
    timestamp: number;
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  
  const { connect, send, isConnected } = useWebSocket();
  const { state: limbicState, updateState } = useLimbicStore();
  const { settings } = useSettingsStore();
  
  // Keyboard shortcuts
  useKeyboardShortcuts(defaultShortcuts);

  useEffect(() => {
    connect((data) => {
      if (data.type === 'typing') {
        setIsTyping(data.status === 'thinking');
      } else if (data.type === 'response_chunk') {
        // Handle streaming response chunks
        if (currentResponseId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === currentResponseId
                ? { ...msg, text: msg.text + data.content }
                : msg
            )
          );
        } else {
          // Start new message
          const newId = Date.now().toString();
          setCurrentResponseId(newId);
          addMessage(data.content, 'ai', newId, 'sent');
        }
        
        if (data.is_complete) {
          setCurrentResponseId(null);
          setIsTyping(false);
        }
      } else if (data.type === 'response') {
        // Complete response
        setIsTyping(false);
        setCurrentResponseId(null);
        addMessage(data.content, 'ai', undefined, 'sent');
      } else if (data.type === 'limbic_update') {
        updateState(data.state);
      } else if (data.type === 'ghost_tap') {
        addMessage(data.content, 'system');
      }
    });
  }, [currentResponseId]);

  const addMessage = (
    text: string,
    sender: 'user' | 'ai' | 'system',
    id?: string,
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  ) => {
    const messageId = id || Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        text,
        sender,
        timestamp: Date.now(),
        status: status || (sender === 'user' ? 'sent' : undefined),
      },
    ]);
    return messageId;
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !isConnected) return;
    const messageId = addMessage(text, 'user', undefined, 'sending');
    
    // Send via WebSocket
    send(JSON.stringify({ type: 'chat', content: text }));
    
    // Update status to sent after a brief delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 100);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Sidebar limbicState={limbicState} isConnected={isConnected} />
      
      <main id="main-content" className="flex-1 flex flex-col" role="main">
        {/* Header with Connection Status */}
        <div className="flex items-center justify-end p-4 border-b border-gray-800">
          <ConnectionStatus />
        </div>
        
        <ChatArea
          messages={messages}
          onSend={handleSend}
          isConnected={isConnected}
          isTyping={isTyping}
          voiceLanguage={settings.voiceLanguage}
        />
      </main>
      
      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />
    </div>
  );
}

