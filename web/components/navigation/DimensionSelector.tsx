'use client';

import React from 'react';

interface Dimension {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface DimensionSelectorProps {
  dimensions: Dimension[];
  activeDimension: string;
  onDimensionChange: (dimensionId: string) => void;
}

export function DimensionSelector({ dimensions, activeDimension, onDimensionChange }: DimensionSelectorProps) {
  return (
    <div className="dimension-selector">
      <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
        <span className="mr-2">🌟</span>
        Life Dimensions
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto slim-scrollbar">
        {dimensions.map((dimension) => (
          <button
            key={dimension.id}
            onClick={() => onDimensionChange(dimension.id)}
            className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center space-x-3 ${
              activeDimension === dimension.id
                ? 'border-peacock-500 bg-gradient-to-r from-peacock-50 to-royal-50 shadow-lg'
                : 'border-peacock-200 hover:border-peacock-300 bg-white/80 hover:bg-peacock-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${dimension.color} flex items-center justify-center text-white text-sm`}>
              {dimension.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{dimension.name}</p>
              <p className="text-xs text-gray-600 capitalize">{dimension.id}</p>
            </div>
            {activeDimension === dimension.id && (
              <div className="w-2 h-2 bg-peacock-600 rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl border border-peacock-200">
        <p className="text-xs font-medium text-peacock-800 mb-1">Quick Access</p>
        <div className="flex flex-wrap gap-1">
          {['🏠 Home', '💬 Chat', '🎨 Create', '🧘 Heal'].map((quick, index) => (
            <button
              key={index}
              className="px-2 py-1 bg-white/80 text-peacock-700 rounded-lg text-xs font-medium hover:bg-white transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
