/**
 * Main Dashboard Page
 * Central hub for all Sallie Studio features
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FeatureDashboard } from '@/components/FeatureDashboard';
import { UserProfile } from '@/components/UserProfile';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function DashboardPage() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('features');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const tabs = [
    { id: 'features', name: 'Features', icon: '🌟' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'features':
        return <FeatureDashboard />;
      case 'profile':
        return <UserProfile />;
      case 'analytics':
        return (
          <div className="text-center text-white py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-400">Detailed usage analytics and insights</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center text-white py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-gray-400">Application settings and preferences</p>
          </div>
        );
      default:
        return <FeatureDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-violet-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Sallie Studio</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Welcome back, User
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="px-3 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-violet-500/30 bg-black/10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-violet-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>🧠 Limbic Engine: Connected</span>
              <span>💾 Memory Service: Active</span>
              <span>🛡️ Agency Service: Ready</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>📊 System Health: Optimal</span>
              <span>⚡ Response Time: 12ms</span>
              <span>🔄 Last Sync: Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
