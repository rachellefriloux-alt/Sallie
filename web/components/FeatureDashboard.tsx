/**
 * Enhanced Frontend Components with Full Interactivity
 * Complete feature accessibility and proper backend connectivity
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
  interactive: boolean;
  route?: string;
  action?: () => void;
}

interface UserStats {
  totalInteractions: number;
  sessionDuration: number;
  featuresUsed: string[];
  lastActive: string;
}

export function FeatureDashboard() {
  const router = useRouter();
  const { settings, updateSettings } = useSettingsStore();
  const { showInfo, showSuccess, showError } = useNotifications();
  const { sendMessage, isConnected } = useWebSocket();
  
  const [features, setFeatures] = useState<Feature[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load all available features
  useEffect(() => {
    loadFeatures();
    loadUserStats();
  }, []);

  const loadFeatures = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/features`);
      if (response.ok) {
        const data = await response.json();
        setFeatures(data.features || []);
      }
    } catch (error) {
      console.error('Failed to load features:', error);
      // Fallback to default features
      setFeatures(getDefaultFeatures());
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/stats`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const getDefaultFeatures = (): Feature[] => [
    {
      id: 'convergence',
      name: 'Convergence',
      description: '14-question onboarding and identity configuration',
      icon: '🎯',
      category: 'onboarding',
      enabled: true,
      interactive: true,
      route: '/convergence'
    },
    {
      id: 'avatar',
      name: 'Avatar Workshop',
      description: 'Create and customize your digital avatar',
      icon: '🎨',
      category: 'personalization',
      enabled: true,
      interactive: true,
      route: '/avatar'
    },
    {
      id: 'thoughts',
      name: 'Thought Journal',
      description: 'Record and organize your thoughts',
      icon: '💭',
      category: 'productivity',
      enabled: true,
      interactive: true,
      route: '/thoughts'
    },
    {
      id: 'projects',
      name: 'Project Manager',
      description: 'Manage and track your projects',
      icon: '📁',
      category: 'productivity',
      enabled: true,
      interactive: true,
      route: '/projects'
    },
    {
      id: 'genesis',
      name: 'Genesis Flow',
      description: 'Creative ideation and brainstorming',
      icon: '🌟',
      category: 'creativity',
      enabled: true,
      interactive: true,
      route: '/genesis'
    },
    {
      id: 'heritage',
      name: 'Heritage',
      description: 'View your digital heritage and memories',
      icon: '📚',
      category: 'personalization',
      enabled: true,
      interactive: true,
      route: '/heritage'
    },
    {
      id: 'hypotheses',
      name: 'Hypotheses',
      description: 'Test and validate your ideas',
      icon: '🔬',
      category: 'creativity',
      enabled: true,
      interactive: true,
      route: '/hypotheses'
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Configure your preferences and API keys',
      icon: '⚙️',
      category: 'system',
      enabled: true,
      interactive: true,
      route: '/settings'
    },
    {
      id: 'voice',
      name: 'Voice Interface',
      description: 'Voice-powered interaction',
      icon: '🎤',
      category: 'interface',
      enabled: settings.voiceEnabled,
      interactive: true,
      action: () => toggleVoiceInterface()
    },
    {
      id: 'sync',
      name: 'Cloud Sync',
      description: 'Synchronize data across devices',
      icon: '☁️',
      category: 'system',
      enabled: settings.cloudSyncEnabled,
      interactive: true,
      action: () => toggleCloudSync()
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'System notifications and alerts',
      icon: '🔔',
      category: 'system',
      enabled: settings.notifications,
      interactive: true,
      action: () => toggleNotifications()
    },
    {
      id: 'themes',
      name: 'Themes',
      description: 'Customize appearance and themes',
      icon: '🎨',
      category: 'personalization',
      enabled: true,
      interactive: true,
      action: () => openThemeSelector()
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View usage patterns and insights',
      icon: '📊',
      category: 'system',
      enabled: true,
      interactive: true,
      route: '/analytics'
    },
    {
      id: 'help',
      name: 'Help & Support',
      description: 'Get help and documentation',
      icon: '❓',
      category: 'support',
      enabled: true,
      interactive: true,
      action: () => openHelpCenter()
    }
  ];

  const toggleVoiceInterface = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/voice/toggle`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        updateSettings({ voiceEnabled: result.enabled });
        showSuccess('Voice Interface', result.enabled ? 'Voice interface enabled' : 'Voice interface disabled');
      }
    } catch (error) {
      showError('Voice Interface', 'Failed to toggle voice interface');
    }
  };

  const toggleCloudSync = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sync/toggle`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        updateSettings({ cloudSyncEnabled: result.enabled });
        showSuccess('Cloud Sync', result.enabled ? 'Cloud sync enabled' : 'Cloud sync disabled');
      }
    } catch (error) {
      showError('Cloud Sync', 'Failed to toggle cloud sync');
    }
  };

  const toggleNotifications = () => {
    updateSettings({ notifications: !settings.notifications });
    showSuccess('Notifications', settings.notifications ? 'Notifications disabled' : 'Notifications enabled');
  };

  const openThemeSelector = () => {
    // Open theme selector modal or navigate to theme page
    showInfo('Themes', 'Theme selector coming soon!');
  };

  const openHelpCenter = () => {
    // Open help center or navigate to help page
    window.open('/docs', '_blank');
  };

  const handleFeatureClick = async (feature: Feature) => {
    try {
      // Track feature usage
      await fetch(`${API_BASE}/api/analytics/feature-used`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureId: feature.id })
      });

      // Execute feature action or navigate
      if (feature.action) {
        feature.action();
      } else if (feature.route) {
        router.push(feature.route);
      }
    } catch (error) {
      console.error('Failed to track feature usage:', error);
      // Still execute the feature even if tracking fails
      if (feature.action) {
        feature.action();
      } else if (feature.route) {
        router.push(feature.route);
      }
    }
  };

  const toggleFeature = async (featureId: string, enabled: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/api/features/${featureId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        setFeatures(prev => 
          prev.map(f => f.id === featureId ? { ...f, enabled } : f)
        );
        showSuccess('Feature Updated', `${features.find(f => f.id === featureId)?.name} ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      showError('Feature Update', 'Failed to update feature');
    }
  };

  // Filter features based on search and category
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      all: '🌟',
      onboarding: '🎯',
      personalization: '🎨',
      productivity: '📁',
      creativity: '🌟',
      interface: '🎤',
      system: '⚙️',
      support: '❓'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading features...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Feature Dashboard</h1>
          <p className="text-gray-300">Access all Sallie Studio features and capabilities</p>
          
          {/* Connection Status */}
          <div className="mt-4">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isConnected ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected to Backend' : 'Backend Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Interactions</h3>
              <p className="text-lg font-semibold text-white">{userStats.totalInteractions}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Session Duration</h3>
              <p className="text-lg font-semibold text-white">{Math.floor(userStats.sessionDuration / 60)}m</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Features Used</h3>
              <p className="text-lg font-semibold text-white">{userStats.featuresUsed.length}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Last Active</h3>
              <p className="text-lg font-semibold text-white">
                {new Date(userStats.lastActive).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/20 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
            />
            <select
              aria-label="Filter features by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-black/20 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFeatures.map(feature => (
            <div
              key={feature.id}
              className={`bg-black/20 backdrop-blur-sm rounded-xl border ${
                feature.enabled 
                  ? 'border-violet-500/30 hover:border-violet-500/50' 
                  : 'border-gray-500/30 hover:border-gray-500/50'
              } p-6 transition-all duration-200 hover:transform hover:scale-105 cursor-pointer`}
              onClick={() => handleFeatureClick(feature)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{feature.icon}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFeature(feature.id, !feature.enabled);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    feature.enabled 
                      ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30' 
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {feature.enabled ? '✓' : '○'}
                </button>
              </div>
              
              <h3 className={`text-lg font-semibold mb-2 ${
                feature.enabled ? 'text-white' : 'text-gray-400'
              }`}>
                {feature.name}
              </h3>
              
              <p className={`text-sm mb-4 ${
                feature.enabled ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {feature.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  feature.enabled 
                    ? 'bg-violet-500/20 text-violet-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {feature.category}
                </span>
                
                {feature.interactive && (
                  <span className="text-xs text-green-400">Interactive</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No features found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
