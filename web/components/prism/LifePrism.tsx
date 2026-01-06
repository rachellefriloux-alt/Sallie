'use client';

import React, { useState, useEffect } from 'react';
import { LifeSanctuaryDimension } from '../dimensions/LifeSanctuaryDimension';
import { CommandMatrixDimension } from '../dimensions/CommandMatrixDimension';
import { QuantumMessengerDimension } from '../dimensions/QuantumMessengerDimension';
import { CreativeAtelierDimension } from '../dimensions/CreativeAtelierDimension';
import { HealingSanctuaryDimension } from '../dimensions/HealingSanctuaryDimension';
import { LegacyImpactDimension } from '../dimensions/LegacyImpactDimension';
import { ResearchUniverseDimension } from '../dimensions/ResearchUniverseDimension';
import { GrowthGardenDimension } from '../dimensions/GrowthGardenDimension';
import { TranscendenceDimension } from '../dimensions/TranscendenceDimension';
import { SocialMasteryDimension } from '../dimensions/SocialMasteryDimension';
import { TimeEnergyDimension } from '../dimensions/TimeEnergyDimension';
import { QuantumCoreDimension } from '../dimensions/QuantumCoreDimension';

interface LifePrismProps {
  activeDimension: string;
  userState: any;
  sallieState: any;
}

export function LifePrism({ activeDimension, userState, sallieState }: LifePrismProps) {
  const [prismRotation, setPrismRotation] = useState(0);
  const [selectedFacet, setSelectedFacet] = useState<string | null>(null);

  const lifeFacets = [
    {
      id: 'mom',
      name: 'Mom',
      icon: '👩‍👧‍👦',
      color: 'from-pink-400 to-rose-500',
      energy: 85,
      tasks: 8,
      joy: 92,
      stress: 15
    },
    {
      id: 'spouse',
      name: 'Spouse',
      icon: '💑',
      color: 'from-rose-400 to-pink-500',
      energy: 78,
      tasks: 5,
      joy: 88,
      stress: 12
    },
    {
      id: 'friend',
      name: 'Friend',
      icon: '👯‍♀️',
      color: 'from-purple-400 to-pink-500',
      energy: 70,
      tasks: 3,
      joy: 85,
      stress: 8
    },
    {
      id: 'daughter',
      name: 'Daughter',
      icon: '👨‍👩‍👧',
      color: 'from-blue-400 to-indigo-500',
      energy: 65,
      tasks: 4,
      joy: 80,
      stress: 18
    },
    {
      id: 'business',
      name: 'Business Owner',
      icon: '💼',
      color: 'from-royal-400 to-purple-500',
      energy: 92,
      tasks: 12,
      joy: 95,
      stress: 25
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      icon: '🚀',
      color: 'from-gold-400 to-orange-500',
      energy: 88,
      tasks: 15,
      joy: 90,
      stress: 30
    },
    {
      id: 'creator',
      name: 'Creator',
      icon: '🎨',
      color: 'from-teal-400 to-green-500',
      energy: 95,
      tasks: 6,
      joy: 98,
      stress: 5
    },
    {
      id: 'researcher',
      name: 'Researcher',
      icon: '🔬',
      color: 'from-yellow-400 to-amber-500',
      energy: 82,
      tasks: 4,
      joy: 87,
      stress: 10
    }
  ];

  // Auto-rotate prism
  useEffect(() => {
    const interval = setInterval(() => {
      setPrismRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getDimensionContent = () => {
    switch (activeDimension) {
      case 'sanctuary':
        return <LifeSanctuaryDimension userState={userState} sallieState={sallieState} />;
      case 'command':
        return <CommandMatrixDimension userState={userState} sallieState={sallieState} />;
      case 'growth':
        return <GrowthGardenDimension userState={userState} sallieState={sallieState} />;
      case 'messenger':
        return <QuantumMessengerDimension userState={userState} sallieState={sallieState} />;
      case 'creative':
        return <CreativeAtelierDimension userState={userState} sallieState={sallieState} />;
      case 'healing':
        return <HealingSanctuaryDimension userState={userState} sallieState={sallieState} />;
      case 'transcendence':
        return <TranscendenceDimension userState={userState} sallieState={sallieState} />;
      case 'research':
        return <ResearchUniverseDimension userState={userState} sallieState={sallieState} />;
      case 'social':
        return <SocialMasteryDimension userState={userState} sallieState={sallieState} />;
      case 'time':
        return <TimeEnergyDimension userState={userState} sallieState={sallieState} />;
      case 'legacy':
        return <LegacyImpactDimension userState={userState} sallieState={sallieState} />;
      case 'quantum':
        return <QuantumCoreDimension userState={userState} sallieState={sallieState} />;
      default:
        return <LifeSanctuaryDimension userState={userState} sallieState={sallieState} />;
    }
  };

  return (
    <div className="life-prism h-full">
      {/* Dimension Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 capitalize">
              {activeDimension === 'sanctuary' ? 'Life Sanctuary' : 
               activeDimension === 'command' ? 'Command Matrix' :
               activeDimension === 'growth' ? 'Growth Garden' :
               activeDimension === 'messenger' ? 'Quantum Messenger' :
               activeDimension === 'creative' ? 'Creative Atelier' :
               activeDimension === 'healing' ? 'Healing Sanctuary' :
               activeDimension === 'transcendence' ? 'Transcendence' :
               activeDimension === 'research' ? 'Research Universe' :
               activeDimension === 'social' ? 'Social Mastery' :
               activeDimension === 'time' ? 'Time & Energy Mastery' :
               activeDimension === 'legacy' ? 'Legacy & Impact' :
               activeDimension === 'quantum' ? 'Quantum Core' : activeDimension}
            </h2>
            <p className="text-peacock-600">
              {activeDimension === 'sanctuary' ? 'Your personal and family life sanctuary' :
               activeDimension === 'command' ? 'Business and entrepreneurial command center' :
               activeDimension === 'growth' ? 'Personal growth and development garden' :
               activeDimension === 'messenger' ? 'Advanced communication and connection hub' :
               activeDimension === 'creative' ? 'Creative projects and innovation studio' :
               activeDimension === 'healing' ? 'Mental health and spiritual healing space' :
               activeDimension === 'transcendence' ? 'Higher consciousness and spiritual connection' :
               activeDimension === 'research' ? 'Research and knowledge exploration' :
               activeDimension === 'social' ? 'Social skills and relationship mastery' :
               activeDimension === 'time' ? 'Time management and energy optimization' :
               activeDimension === 'legacy' ? 'World impact and legacy creation' :
               activeDimension === 'quantum' ? 'Advanced quantum processing and AI core' : ''}
            </p>
          </div>
          
          {/* Life Facets Overview */}
          <div className="flex space-x-2">
            {lifeFacets.slice(0, 4).map((facet) => (
              <div key={facet.id} className="relative">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${facet.color} flex items-center justify-center text-white shadow-lg`}>
                  {facet.icon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dimension Content */}
      <div className="h-full">
        {getDimensionContent()}
      </div>

      {/* Life Prism Visualization */}
      <div className="fixed bottom-4 right-4 w-32 h-32 opacity-20 pointer-events-none">
        <div 
          className="w-full h-full relative"
          style={{ transform: `rotate(${prismRotation}deg)` }}
        >
          {lifeFacets.map((facet, index) => {
            const angle = (index * 360) / lifeFacets.length;
            const x = Math.cos((angle * Math.PI) / 180) * 40;
            const y = Math.sin((angle * Math.PI) / 180) * 40;
            
            return (
              <div
                key={facet.id}
                className={`absolute w-8 h-8 rounded-full bg-gradient-to-br ${facet.color} flex items-center justify-center text-white text-xs shadow-lg`}
                style={{
                  transform: `translate(${x + 40}px, ${y + 40}px)`,
                  left: 0,
                  top: 0
                }}
              >
                {facet.icon}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

