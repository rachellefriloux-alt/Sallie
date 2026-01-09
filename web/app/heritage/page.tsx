'use client';

import { useState, useEffect } from 'react';
import { HeritageBrowser } from '@/components/HeritageBrowser';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

export default function HeritagePage() {
  const [heritageData, setHeritageData] = useState({
    core: {},
    preferences: {},
    learned: [],
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'core' | 'preferences' | 'learned' | 'history'>('core');
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadHeritageData();
  }, []);

  const loadHeritageData = async () => {
    try {
      const response = await fetch('/api/heritage/dna');
      if (response.ok) {
        const data = await response.json();
        setHeritageData(data);
      }
    } catch (error) {
      console.error('Failed to load heritage data:', error);
      showError('Failed to load', 'Could not load heritage data');
    } finally {
      setLoading(false);
    }
  };

  const updateHeritageData = async (section: string, updates: any) => {
    try {
      const response = await fetch(`/api/heritage/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setHeritageData(prev => ({ ...prev, [section]: data }));
        showSuccess('Updated', 'Heritage data updated successfully');
      }
    } catch (error) {
      showError('Failed to update', 'Could not update heritage data');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Heritage DNA</h1>
          <p className="text-gray-300">Explore and manage Sallie's persistent identity and learned behaviors</p>
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

        {/* Section Navigation */}
        <div className="flex space-x-1 mb-8 bg-black/20 rounded-lg p-1">
          {['core', 'preferences', 'learned', 'history'].map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section as any)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                selectedSection === section
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Heritage Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
          <HeritageBrowser 
            heritageData={heritageData}
            loading={loading}
            selectedSection={selectedSection}
            onUpdate={updateHeritageData}
            isConnected={isConnected}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

