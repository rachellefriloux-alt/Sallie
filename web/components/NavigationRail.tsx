'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  HeartIcon,
  UserGroupIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface NavigationRailProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onMessengerToggle: () => void;
}

export function NavigationRail({ activeSection, onSectionChange, onMessengerToggle }: NavigationRailProps) {
  const pathname = usePathname();

  const navigationItems = [
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'genesis', label: 'Genesis', icon: SparklesIcon },
    { id: 'heritage', label: 'Heritage', icon: DocumentTextIcon },
    { id: 'mood', label: 'Mood', icon: HeartIcon },
    { id: 'social', label: 'Social', icon: UserGroupIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const multiModalItems = [
    { id: 'voice', label: 'Voice', icon: MicrophoneIcon },
    { id: 'video', label: 'Video', icon: VideoCameraIcon },
    { id: 'messenger', label: 'Messenger', icon: ChatBubbleBottomCenterTextIcon, action: onMessengerToggle },
  ];

  return (
    <div className="nav-rail w-20 flex flex-col items-center py-6 space-y-8 infj-gentle">
      {/* Logo/Avatar Area */}
      <div className="avatar-presence online mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-purple to-peacock-blue flex items-center justify-center">
          <span className="text-white font-bold text-lg">S</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col space-y-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                relative group p-3 rounded-xl transition-all duration-300 infj-soft
                ${isActive 
                  ? 'bg-white/20 shadow-lg scale-110' 
                  : 'hover:bg-white/10 hover:scale-105'
                }
              `}
              title={item.label}
            >
              <Icon className={`
                w-6 h-6 transition-colors duration-300
                ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
              `} />
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-1 h-8 bg-gold rounded-full" />
              )}
              
              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-xl gemini-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </nav>

      {/* Multi-Modal Controls */}
      <div className="flex flex-col space-y-3 border-t border-white/20 pt-6">
        {multiModalItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={item.action || (() => onSectionChange(item.id))}
              className={`
                relative group p-3 rounded-xl transition-all duration-300 infj-soft
                hover:bg-white/10 hover:scale-105
              `}
              title={item.label}
            >
              <div className={`
                ${item.id === 'voice' ? 'voice-indicator' : ''}
                ${item.id === 'video' ? 'video-indicator' : ''}
                ${item.id === 'messenger' ? '' : ''}
              `}>
                <Icon className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-300" />
              </div>
              
              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-xl gemini-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          );
        })}
      </div>

      {/* Bottom decorative element */}
      <div className="w-12 h-1 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full opacity-60" />
    </div>
  );
}
