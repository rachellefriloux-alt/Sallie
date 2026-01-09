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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-violet-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Sallie Studio</h1>
              <div className="text-sm text-gray-400">
                Welcome back, {settings.displayName || 'User'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {userStats && `${userStats.totalInteractions} interactions`}
              </div>
              <button
                onClick={() => router.push('/convergence')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
              >
                Convergence
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-violet-500/30 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'features' && <FeatureDashboard />}
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'analytics' && (
          <div className="text-center text-white py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-400">Detailed usage analytics and insights</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center text-white py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-gray-400">Configure your preferences</p>
            <button
              onClick={() => router.push('/settings')}
              className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
            >
              Open Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
