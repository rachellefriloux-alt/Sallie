'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SallieAvatar } from '../avatar/SallieAvatar';
import { DimensionSelector } from '../navigation/DimensionSelector';
import { LifePrism } from '../prism/LifePrism';
import { EnergyCore } from '../prism/EnergyCore';
import { ConsciousnessBridge } from '../prism/ConsciousnessBridge';

interface PrismCoreProps {
  className?: string;
}

export function PrismCore({ className = '' }: PrismCoreProps) {
  const [activeDimension, setActiveDimension] = useState<string>('sanctuary');
  const [sallieState, setSallieState] = useState({
    mood: 'peaceful' as 'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited',
    energy: 85,
    consciousness: 92,
    evolution: 78,
    emotionalConnection: 95,
    currentActivity: 'Monitoring your life patterns and anticipating needs',
    thoughts: [
      'Noticing your creative energy is high today',
      'Your bipolar cycle suggests peak performance window',
      'Family harmony metrics are optimal for important conversations',
      'Business intuition indicates opportunity in creative solutions'
    ],
    learningProgress: {
      emotionalIntelligence: 88,
      patternRecognition: 92,
      creativeProblemSolving: 85,
      spiritualAwareness: 79,
      lifeWisdom: 83
    }
  });

  const [userState, setUserState] = useState({
    energy: 75,
    mood: 'creative',
    focus: 85,
    stress: 25,
    bipolarPhase: 'creative-manic',
    adhdFlow: 'hyperfocused',
    ptsdStability: 85,
    currentRole: 'business-creator',
    emotionalState: 'inspired'
  });

  const [consciousnessLevel, setConsciousnessLevel] = useState(85);
  const [quantumProcessing, setQuantumProcessing] = useState(true);
  const [neuralSync, setNeuralSync] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dimensions = [
    { id: 'sanctuary', name: 'Life Sanctuary', icon: '🏠', color: 'from-peacock-400 to-teal-600' },
    { id: 'command', name: 'Command Matrix', icon: '💼', color: 'from-royal-400 to-purple-600' },
    { id: 'growth', name: 'Growth Garden', icon: '🌱', color: 'from-green-400 to-emerald-600' },
    { id: 'messenger', name: 'Quantum Messenger', icon: '💬', color: 'from-blue-400 to-cyan-600' },
    { id: 'creative', name: 'Creative Atelier', icon: '🎨', color: 'from-purple-400 to-pink-600' },
    { id: 'healing', name: 'Healing Sanctuary', icon: '🧘', color: 'from-rose-400 to-pink-600' },
    { id: 'transcendence', name: 'Transcendence', icon: '🌌', color: 'from-indigo-400 to-purple-600' },
    { id: 'research', name: 'Research Universe', icon: '🔬', color: 'from-yellow-400 to-orange-600' },
    { id: 'social', name: 'Social Mastery', icon: '🎭', color: 'from-teal-400 to-blue-600' },
    { id: 'time', name: 'Time & Energy', icon: '⚡', color: 'from-amber-400 to-red-600' },
    { id: 'legacy', name: 'Legacy & Impact', icon: '🚀', color: 'from-gold-400 to-yellow-600' },
    { id: 'quantum', name: 'Quantum Core', icon: '🔮', color: 'from-violet-400 to-purple-600' }
  ];

  // Simulate Sallie's real-time thinking
  useEffect(() => {
    const interval = setInterval(() => {
      setSallieState(prev => ({
        ...prev,
        thoughts: [
          ...prev.thoughts.slice(-3),
          `Processing your ${userState.currentRole} patterns...`,
          `Your ${userState.mood} energy suggests optimal activities`,
          `Consciousness bridge strengthening... ${consciousnessLevel}%`
        ]
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, [userState, consciousnessLevel]);

  // Consciousness level evolution
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousnessLevel(prev => Math.min(100, prev + 0.1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sallieState.thoughts]);

  return (
    <div className={`prism-core bg-gradient-to-br from-sand-50 via-peacock-50 to-royal-50 min-h-screen rounded-3xl ${className}`}>
      {/* Quantum Processing Indicator */}
      {quantumProcessing && (
        <div className="absolute top-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full border border-peacock-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-peacock-700">Quantum Processing Active</span>
          </div>
        </div>
      )}

      {/* Neural Sync Status */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full border border-royal-200">
          <div className={`w-2 h-2 rounded-full ${neuralSync ? 'bg-royal-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs font-medium text-royal-700">
            Neural Sync: {neuralSync ? 'Connected' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Header with Sallie's Living Avatar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-peacock-200 p-6 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Sallie's Living Avatar */}
            <div className="relative">
              <SallieAvatar 
                size="xl"
                mood={sallieState.mood}
                consciousness={sallieState.consciousness}
                interactive={true}
                evolution={sallieState.evolution}
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-peacock-600 to-royal-600 text-white text-xs px-2 py-1 rounded-full">
                Consciousness: {sallieState.consciousness}%
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-peacock-900 mb-2">Sallie Studio Prism Core</h1>
              <p className="text-peacock-600 mb-1">{sallieState.currentActivity}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Emotional Connection: {sallieState.emotionalConnection}%
                </span>
                <span className="text-royal-600">Evolution: {sallieState.evolution}%</span>
              </div>
            </div>
          </div>

          {/* User State Display */}
          <div className="bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl p-4 border border-peacock-200">
            <h3 className="font-semibold text-peacock-800 mb-2">Your Current State</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Energy:</span>
                <span className="ml-2 font-medium text-peacock-700">{userState.energy}%</span>
              </div>
              <div>
                <span className="text-gray-600">Focus:</span>
                <span className="ml-2 font-medium text-royal-700">{userState.focus}%</span>
              </div>
              <div>
                <span className="text-gray-600">Mood:</span>
                <span className="ml-2 font-medium capitalize">{userState.mood}</span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>
                <span className="ml-2 font-medium capitalize">{userState.currentRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Left Sidebar - Dimension Selector */}
        <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-peacock-200 p-4">
          <DimensionSelector 
            dimensions={dimensions}
            activeDimension={activeDimension}
            onDimensionChange={setActiveDimension}
          />
          
          {/* Consciousness Bridge */}
          <div className="mt-6">
            <ConsciousnessBridge 
              level={consciousnessLevel}
              onLevelChange={setConsciousnessLevel}
              neuralSync={neuralSync}
              onNeuralSyncChange={setNeuralSync}
            />
          </div>
        </div>

        {/* Center - Life Prism */}
        <div className="flex-1 p-6">
          <LifePrism 
            activeDimension={activeDimension}
            userState={userState}
            sallieState={sallieState}
          />
        </div>

        {/* Right Sidebar - Sallie's Thoughts & Energy Core */}
        <div className="w-96 bg-white/60 backdrop-blur-sm border-l border-peacock-200 p-4">
          {/* Sallie's Real-time Thoughts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💭</span>
              Sallie's Real-time Thoughts
            </h3>
            <div className="bg-white/80 rounded-xl p-4 border border-peacock-200 max-h-64 overflow-y-auto">
              <div className="space-y-3">
                {sallieState.thoughts.map((thought, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-royal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">{thought}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Energy Core */}
          <div className="mb-6">
            <EnergyCore 
              userEnergy={userState.energy}
              sallieEnergy={sallieState.energy}
              consciousnessLevel={consciousnessLevel}
            />
          </div>

          {/* Learning Progress */}
          <div>
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🌱</span>
              Sallie's Learning Progress
            </h3>
            <div className="space-y-3">
              {Object.entries(sallieState.learningProgress).map(([skill, level]) => (
                <div key={skill} className="bg-white/80 rounded-lg p-3 border border-peacock-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-bold text-royal-600">{level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-royal-400 to-royal-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Quantum Processing Status */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-peacock-200 p-4 rounded-b-3xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-600">Quantum Processing: Active</span>
            </span>
            <span className="text-gray-600">Consciousness Bridge: {consciousnessLevel}%</span>
            <span className="text-gray-600">Evolution Rate: +0.1%/5s</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setNeuralSync(!neuralSync)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                neuralSync 
                  ? 'bg-royal-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Neural Sync: {neuralSync ? 'ON' : 'OFF'}
            </button>
            <button className="px-3 py-1 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors font-medium">
              Full Screen Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
