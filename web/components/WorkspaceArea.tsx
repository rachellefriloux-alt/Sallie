'use client';

import React, { useState } from 'react';
import { ChatArea } from './ChatArea';
import { HumanLevelExpansion } from './HumanLevelExpansion';

interface WorkspaceAreaProps {
  activeSection: string;
  className?: string;
}

export function WorkspaceArea({ activeSection, className }: WorkspaceAreaProps) {
  const [workspaceState, setWorkspaceState] = useState({
    loading: false,
    error: null,
    data: null
  });

  // Mock data for ChatArea
  const mockMessages = [
    {
      id: '1',
      text: 'Hello! I am Sallie, your AI companion.',
      sender: 'ai' as const,
      timestamp: Date.now(),
      status: 'sent' as const
    }
  ];

  const handleSend = (text: string) => {
    console.log('Sending message:', text);
  };

  const renderWorkspace = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatArea messages={mockMessages} onSend={handleSend} isConnected={true} />;
      case 'genesis':
        return <div className="p-6"><p className="text-gray-600">Genesis Panel coming soon...</p></div>;
      case 'heritage':
        return <div className="p-6"><p className="text-gray-600">Heritage Panel coming soon...</p></div>;
      case 'mood':
        return <div className="p-6"><p className="text-gray-600">Mood Panel coming soon...</p></div>;
      case 'human-level':
        return <HumanLevelExpansion />;
      case 'social':
        return <div className="p-6"><p className="text-gray-600">Social Panel coming soon...</p></div>;
      case 'settings':
        return <div className="p-6"><p className="text-gray-600">Settings Panel coming soon...</p></div>;
      default:
        return <ChatArea messages={mockMessages} onSend={handleSend} isConnected={true} />;
    }
  };

  return (
    <div className={`workspace-area ${className}`}>
      <div className="h-full flex flex-col">
        {/* Workspace Header */}
        <div className="h-16 bg-white/80 backdrop-filter backdrop-blur-lg border-b border-leopard-accent/20 flex items-center px-6">
          <h1 className="text-2xl font-bold peacock-text capitalize infj-gentle">
            {activeSection}
          </h1>
          
          {/* Workspace actions */}
          <div className="ml-auto flex items-center space-x-3">
            <button className="px-4 py-2 bg-peacock-blue text-white rounded-lg hover:bg-peacock-light infj-soft gemini-hover">
              New
            </button>
            <button className="px-4 py-2 bg-royal-purple text-white rounded-lg hover:bg-royal-light infj-soft gemini-hover">
              Save
            </button>
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden">
          {renderWorkspace()}
        </div>
      </div>
    </div>
  );
}
