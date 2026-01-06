'use client';

import React, { useState } from 'react';

interface AvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited';
  interactive?: boolean;
  className?: string;
}

export function AvatarDisplay({ 
  size = 'md', 
  mood = 'peaceful', 
  interactive = false,
  className = ''
}: AvatarDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const moodExpressions = {
    peaceful: '😌',
    happy: '😊',
    attentive: '👀',
    thoughtful: '🤔',
    excited: '🤗'
  };

  const moodColors = {
    peaceful: 'from-teal-400 to-peacock-500',
    happy: 'from-gold-400 to-yellow-500',
    attentive: 'from-royal-400 to-purple-500',
    thoughtful: 'from-peacock-400 to-blue-500',
    excited: 'from-pink-400 to-rose-500'
  };

  return (
    <div 
      className={`avatar-display ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${moodColors[mood]} ${
        interactive ? 'cursor-pointer transition-transform hover:scale-105' : ''
      } ${isHovered ? 'animate-pulse' : ''}`}>
        {/* Avatar Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-2xl font-bold bg-black/20 rounded-full w-3/4 h-3/4 flex items-center justify-center">
            {moodExpressions[mood]}
          </div>
        </div>

        {/* Leopard print accent */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-leopard-spot rounded-full opacity-60"></div>
        
        {/* Interactive glow effect */}
        {interactive && isHovered && (
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
        )}
      </div>
    </div>
  );
}
