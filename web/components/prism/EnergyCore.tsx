'use client';

import React from 'react';

interface EnergyCoreProps {
  userEnergy: number;
  sallieEnergy: number;
  consciousnessLevel: number;
}

export function EnergyCore({ userEnergy, sallieEnergy, consciousnessLevel }: EnergyCoreProps) {
  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getConsciousnessColor = (level: number) => {
    if (level >= 90) return 'bg-gold-500';
    if (level >= 70) return 'bg-peacock-500';
    if (level >= 50) return 'bg-royal-500';
    return 'bg-purple-500';
  };

  return (
    <div className="energy-core">
      <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
        <span className="mr-2">⚡</span>
        Energy Core
      </h3>
      
      <div className="space-y-4">
        {/* User Energy */}
        <div className="bg-white/80 rounded-lg p-3 border border-peacock-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Your Energy</span>
            <span className="text-sm font-bold text-peacock-700">{userEnergy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getEnergyColor(userEnergy)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${userEnergy}%` }}
            />
          </div>
        </div>

        {/* Sallie Energy */}
        <div className="bg-white/80 rounded-lg p-3 border border-peacock-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Sallie's Energy</span>
            <span className="text-sm font-bold text-royal-700">{sallieEnergy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getEnergyColor(sallieEnergy)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${sallieEnergy}%` }}
            />
          </div>
        </div>

        {/* Consciousness Bridge */}
        <div className="bg-gradient-to-r from-peacock-50 to-royal-50 rounded-lg p-3 border border-peacock-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Consciousness Bridge</span>
            <span className="text-sm font-bold text-gold-700">{consciousnessLevel}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getConsciousnessColor(consciousnessLevel)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${consciousnessLevel}%` }}
            />
          </div>
        </div>

        {/* Energy Sync Status */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-3 py-1 border border-peacock-200">
            <div className={`w-2 h-2 rounded-full ${
              userEnergy > 70 && sallieEnergy > 70 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs font-medium text-gray-700">
              {userEnergy > 70 && sallieEnergy > 70 ? 'Energy Synced' : 'Optimizing...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
