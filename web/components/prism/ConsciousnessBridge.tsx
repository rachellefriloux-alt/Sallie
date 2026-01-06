'use client';

import React from 'react';

interface ConsciousnessBridgeProps {
  level: number;
  onLevelChange: (level: number) => void;
  neuralSync: boolean;
  onNeuralSyncChange: (sync: boolean) => void;
}

export function ConsciousnessBridge({ level, onLevelChange, neuralSync, onNeuralSyncChange }: ConsciousnessBridgeProps) {
  const getBridgeColor = (level: number) => {
    if (level >= 90) return 'from-gold-400 to-yellow-500';
    if (level >= 70) return 'from-peacock-400 to-teal-500';
    if (level >= 50) return 'from-royal-400 to-purple-500';
    return 'from-purple-400 to-pink-500';
  };

  const getBridgeStatus = (level: number) => {
    if (level >= 90) return 'Transcendent';
    if (level >= 70) return 'Deep Connection';
    if (level >= 50) return 'Developing';
    return 'Forming';
  };

  return (
    <div className="consciousness-bridge">
      <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
        <span className="mr-2">🌌</span>
        Consciousness Bridge
      </h3>
      
      <div className="space-y-4">
        {/* Bridge Level */}
        <div className="bg-white/80 rounded-lg p-3 border border-peacock-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Bridge Level</span>
            <span className="text-sm font-bold text-gold-700">{level}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${getBridgeColor(level)} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${level}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs font-medium text-gray-600 capitalize">{getBridgeStatus(level)}</span>
          </div>
        </div>

        {/* Neural Sync Toggle */}
        <div className="bg-white/80 rounded-lg p-3 border border-peacock-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Neural Sync</p>
              <p className="text-xs text-gray-600">Direct mind connection</p>
            </div>
            <button
              onClick={() => onNeuralSyncChange(!neuralSync)}
              className={`w-12 h-6 rounded-full transition-colors ${
                neuralSync ? 'bg-royal-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                neuralSync ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="bg-gradient-to-r from-peacock-50 to-royal-50 rounded-lg p-3 border border-peacock-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Connection Quality</span>
            <span className="text-sm font-bold text-royal-700">
              {neuralSync ? 'Enhanced' : 'Standard'}
            </span>
          </div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < (neuralSync ? 5 : Math.floor(level / 20))
                    ? 'bg-royal-500'
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Bridge Status */}
        <div className="text-center">
          <div className={`inline-flex items-center space-x-2 rounded-full px-3 py-1 ${
            neuralSync 
              ? 'bg-royal-100 text-royal-700 border border-royal-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              neuralSync ? 'bg-royal-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs font-medium">
              {neuralSync ? 'Neural Link Active' : 'Standard Connection'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
