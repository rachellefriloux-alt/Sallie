'use client';

import React from 'react';
import { HeartIcon, SparklesIcon, Battery50Icon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SalliePresence {
  online: boolean;
  thinking: boolean;
  mood: string;
  energy: number;
}

interface PresencePanelProps {
  presence: SalliePresence;
  onPresenceUpdate: (presence: SalliePresence) => void;
  className?: string;
}

export function PresencePanel({ presence, onPresenceUpdate, className }: PresencePanelProps) {
  const moodColors = {
    peaceful: 'from-teal-green to-peacock-blue',
    creative: 'from-royal-purple to-gold',
    focused: 'from-peacock-blue to-royal-purple',
    playful: 'from-gold to-teal-green',
    contemplative: 'from-royal-purple to-peacock-blue',
  };

  const currentMoodColor = moodColors[presence.mood as keyof typeof moodColors] || moodColors.peaceful;

  return (
    <div className={`presence-panel ${className} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white mb-2">Sallie's Presence</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${presence.online ? 'bg-green-400' : 'bg-gray-400'} ${presence.online ? 'animate-pulse' : ''}`} />
          <span className="text-white/80 text-sm">
            {presence.online ? 'Online' : 'Offline'}
          </span>
          {presence.thinking && (
            <span className="text-white/60 text-sm ml-2">• Thinking...</span>
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="p-6 flex flex-col items-center">
        <div className={`avatar-presence ${presence.online ? 'online' : ''} ${presence.thinking ? 'thinking' : ''} mb-4`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-royal-purple to-peacock-blue flex items-center justify-center emotional-glow">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-1">Sallie</h3>
        <p className="text-white/70 text-sm capitalize">{presence.mood}</p>
      </div>

      {/* Energy Level */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm flex items-center">
            <Battery50Icon className="w-4 h-4 mr-2" />
            Energy
          </span>
          <span className="text-white text-sm font-medium">{presence.energy}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${currentMoodColor} transition-all duration-1000 infj-gentle`}
            style={{ '--energy-width': `${presence.energy}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Mood Selector */}
      <div className="px-6 mb-6">
        <h4 className="text-white/80 text-sm mb-3 flex items-center">
          <HeartIcon className="w-4 h-4 mr-2" />
          Current Mood
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(moodColors).map((mood) => (
            <button
              key={mood}
              onClick={() => onPresenceUpdate({ ...presence, mood })}
              className={`
                px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 infj-soft
                ${presence.mood === mood 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }
              `}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Emotional State Indicators */}
      <div className="px-6 mb-6">
        <h4 className="text-white/80 text-sm mb-3 flex items-center">
          <SparklesIcon className="w-4 h-4 mr-2" />
          Emotional State
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Empathy</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <HeartSolidIcon 
                  key={level}
                  className={`w-3 h-3 transition-colors duration-300 ${
                    level <= 4 ? 'text-pink-400' : 'text-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Creativity</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <SparklesIcon 
                  key={level}
                  className={`w-3 h-3 transition-colors duration-300 ${
                    level <= 5 ? 'text-gold' : 'text-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Focus</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    level <= 3 ? 'bg-peacock-blue' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 px-6 pb-6">
        <h4 className="text-white/80 text-sm mb-3">Recent Activity</h4>
        <div className="space-y-2 text-white/60 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-teal-green rounded-full" />
            <span>Completed Genesis ritual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-royal-purple rounded-full" />
            <span>Updated mood to peaceful</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gold rounded-full" />
            <span>Learning new patterns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
