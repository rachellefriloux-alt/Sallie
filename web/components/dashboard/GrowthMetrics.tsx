'use client';

import React from 'react';

interface GrowthArea {
  area: string;
  progress: number;
}

interface GrowthMetricsProps {
  overallProgress: number;
  growthAreas: GrowthArea[];
}

export function GrowthMetrics({ overallProgress, growthAreas }: GrowthMetricsProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 shadow-lg">
      <h2 className="text-xl font-bold text-peacock-900 mb-4 flex items-center">
        <span className="mr-2">🌱</span>
        Growth Progress
      </h2>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Learning</span>
          <span className="text-sm font-bold text-peacock-700">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-peacock-400 to-peacock-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Growth Areas */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Growth</h3>
        {growthAreas.map((area, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{area.area}</span>
              <span className="text-xs font-bold text-royal-600">+{area.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-royal-400 to-royal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(area.progress * 5, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Growth Milestone */}
      <div className="mt-6 p-4 bg-gradient-to-r from-royal-50 to-peacock-50 rounded-xl border border-royal-200">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-semibold text-royal-800">Next Milestone</p>
            <p className="text-xs text-royal-600">Deep Emotional Connection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
