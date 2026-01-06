'use client';

import React, { useState } from 'react';
import { SallieDashboard } from '../dashboard/SallieDashboard';
import { ConversationHub } from '../conversation/ConversationHub';
import { LifeManagementCenter } from '../life/LifeManagementCenter';
import { PersonalGrowthModule } from '../growth/PersonalGrowthModule';
import { AvatarCustomization } from '../avatar/AvatarCustomization';
import { ThoughtActionLog } from '../transparency/ThoughtActionLog';
import { AvatarDisplay } from '../avatar/AvatarDisplay';

interface SallieMainInterfaceProps {
  className?: string;
}

type ScreenType = 'dashboard' | 'conversation' | 'life' | 'growth' | 'avatar' | 'thoughts' | 'settings';

export function SallieMainInterface({ className = '' }: SallieMainInterfaceProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');
  const [sallieMood, setSallieMood] = useState<'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited'>('peaceful');

  const navigationItems = [
    {
      id: 'dashboard' as ScreenType,
      name: "Sallie's Dashboard",
      icon: '🏠',
      description: 'Central home and overview',
      color: 'from-peacock-400 to-peacock-600'
    },
    {
      id: 'conversation' as ScreenType,
      name: 'Conversation Hub',
      icon: '💬',
      description: 'Chat and video calls',
      color: 'from-royal-400 to-royal-600'
    },
    {
      id: 'life' as ScreenType,
      name: 'Life Management',
      icon: '🗂️',
      description: 'Organize your roles',
      color: 'from-teal-400 to-teal-600'
    },
    {
      id: 'growth' as ScreenType,
      name: 'Personal Growth',
      icon: '🌱',
      description: 'Learning and development',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'avatar' as ScreenType,
      name: 'Avatar Studio',
      icon: '🎨',
      description: 'Customize appearance',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'thoughts' as ScreenType,
      name: 'Thought Log',
      icon: '🔍',
      description: 'Transparent processes',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'settings' as ScreenType,
      name: 'Settings',
      icon: '⚙️',
      description: 'Preferences and config',
      color: 'from-gray-400 to-gray-600'
    }
  ];

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <SallieDashboard />;
      case 'conversation':
        return <ConversationHub />;
      case 'life':
        return <LifeManagementCenter />;
      case 'growth':
        return <PersonalGrowthModule />;
      case 'avatar':
        return <AvatarCustomization />;
      case 'thoughts':
        return <ThoughtActionLog />;
      case 'settings':
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-peacock-200">
            <h2 className="text-2xl font-bold text-peacock-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <SallieDashboard />;
    }
  };

  const getCurrentScreenInfo = () => {
    return navigationItems.find(item => item.id === activeScreen);
  };

  return (
    <div className={`sallie-main-interface bg-gradient-to-br from-sand-50 to-peacock-50 min-h-screen rounded-2xl ${className}`}>
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-peacock-200 p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AvatarDisplay size="lg" mood={sallieMood} interactive={true} />
            <div>
              <h1 className="text-2xl font-bold text-peacock-900">Sallie Studio</h1>
              <p className="text-peacock-600">{getCurrentScreenInfo()?.description}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <button className="p-3 bg-peacock-100 text-peacock-700 rounded-xl hover:bg-peacock-200 transition-colors">
              🔔
            </button>
            <button className="p-3 bg-royal-100 text-royal-700 rounded-xl hover:bg-royal-200 transition-colors">
              💜
            </button>
            <button className="p-3 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-colors">
              📊
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-peacock-200 p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeScreen === item.id
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {renderActiveScreen()}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-peacock-200 p-4 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">Sallie is active and present</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Mood: {sallieMood}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSallieMood('happy')}
              className="text-gray-600 hover:text-peacock-600 transition-colors"
            >
              Make Sallie happy 😊
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Last sync: Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
