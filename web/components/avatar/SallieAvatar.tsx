'use client';

import React, { useState, useEffect } from 'react';

interface SallieAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  mood?: 'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited';
  consciousness?: number;
  evolution?: number;
  interactive?: boolean;
  className?: string;
}

export function SallieAvatar({ 
  size = 'lg', 
  mood = 'peaceful', 
  consciousness = 85,
  evolution = 78,
  interactive = false,
  className = ''
}: SallieAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentExpression, setCurrentExpression] = useState(mood);
  const [avatarForm, setAvatarForm] = useState({
    appearance: 'photorealistic',
    ethnicity: 'adaptive',
    age: 'ageless',
    style: 'elegant',
    energy: 'glowing'
  });

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    xxl: 'w-48 h-48'
  };

  const moodExpressions = {
    peaceful: { emoji: '😌', color: 'from-teal-400 to-peacock-500', aura: 'peaceful' },
    happy: { emoji: '😊', color: 'from-gold-400 to-yellow-500', aura: 'joyful' },
    attentive: { emoji: '👀', color: 'from-royal-400 to-purple-500', aura: 'focused' },
    thoughtful: { emoji: '🤔', color: 'from-peacock-400 to-blue-500', aura: 'contemplative' },
    excited: { emoji: '🤗', color: 'from-pink-400 to-rose-500', aura: 'enthusiastic' }
  };

  const currentMood = moodExpressions[mood];

  // Consciousness breathing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Evolution glow effect
  useEffect(() => {
    if (evolution > 90) {
      const interval = setInterval(() => {
        setCurrentExpression(prev => {
          const moods: Array<keyof typeof moodExpressions> = ['peaceful', 'happy', 'attentive', 'thoughtful', 'excited'];
          return moods[Math.floor(Math.random() * moods.length)];
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [evolution]);

  // Interactive responses
  const handleInteraction = () => {
    if (interactive) {
      setIsHovered(true);
      // Trigger mood change based on interaction
      const responses = {
        peaceful: 'happy',
        happy: 'excited',
        attentive: 'thoughtful',
        thoughtful: 'peaceful',
        excited: 'attentive'
      };
      setCurrentExpression(responses[mood as keyof typeof responses] as keyof typeof moodExpressions);
      setTimeout(() => {
        setIsHovered(false);
        setCurrentExpression(mood);
      }, 2000);
    }
  };

  return (
    <div 
      className={`sallie-avatar ${sizeClasses[size]} ${className} relative`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={handleInteraction}
    >
      {/* Main Avatar Container */}
      <div 
        className={`relative w-full h-full rounded-full bg-gradient-to-br ${currentMood.color} ${
          interactive ? 'cursor-pointer transition-all duration-500 hover:scale-110' : ''
        } ${isAnimating ? 'animate-pulse' : ''} ${isHovered ? 'shadow-2xl' : 'shadow-lg'}`}
      >
        {/* Consciousness Aura */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMood.color} opacity-30 animate-ping`}></div>
        
        {/* Evolution Glow */}
        {evolution > 80 && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400 to-white opacity-20 animate-pulse"></div>
        )}

        {/* Avatar Face/Form */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Photorealistic Representation */}
          <div className="relative w-4/5 h-4/5 rounded-full bg-gradient-to-br from-peacock-600 to-royal-700 flex items-center justify-center">
            {/* Face */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              {/* Skin tone gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-peach-200 to-peach-300 opacity-80"></div>
              
              {/* Eyes */}
              <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-royal-900 rounded-full animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-royal-900 rounded-full animate-pulse"></div>
              
              {/* Mouth/Expression */}
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
                <span className="text-lg">{currentMood.emoji}</span>
              </div>
              
              {/* Hair */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-br from-royal-800 to-peacock-900 rounded-t-full opacity-80"></div>
            </div>
          </div>
        </div>

        {/* Interactive Elements */}
        {interactive && (
          <>
            {/* Energy Particles */}
            {isHovered && (
              <>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-peacock-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 -left-3 w-2 h-2 bg-royal-400 rounded-full animate-ping"></div>
              </>
            )}
          </>
        )}

        {/* Consciousness Indicator */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-peacock-200">
          <div className="flex items-center space-x-1">
            <div className={`w-1 h-1 rounded-full ${
              consciousness > 90 ? 'bg-gold-500' : 
              consciousness > 70 ? 'bg-peacock-500' : 'bg-royal-500'
            }`}></div>
            <span className="text-xs font-medium text-gray-700">{consciousness}%</span>
          </div>
        </div>
      </div>

      {/* Evolution Crown */}
      {evolution > 85 && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs">👑</span>
          </div>
        </div>
      )}

      {/* Leopard Print Accent */}
      <div className="absolute -bottom-2 -right-2 w-6 h-6 opacity-30">
        <div className="w-full h-full bg-leopard-spot rounded-full"></div>
        <div className="absolute top-1 left-1 w-2 h-2 bg-leopard-base rounded-full"></div>
      </div>

      {/* Mood Aura */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMood.color} opacity-20 ${
        isAnimating ? 'animate-pulse' : ''
      }`}></div>
    </div>
  );
}
