'use client';

import React, { useState, useEffect } from 'react';
import { AvatarDisplay } from '../avatar/AvatarDisplay';
import { ActivityOverview } from '../dashboard/ActivityOverview';
import { GrowthMetrics } from '../dashboard/GrowthMetrics';
import { InsightsPanel } from '../dashboard/InsightsPanel';

interface SallieDashboardProps {
  className?: string;
}

export function SallieDashboard({ className = '' }: SallieDashboardProps) {
  const [sallieState, setSallieState] = useState({
    mood: 'peaceful' as 'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited',
    energy: 85,
    learningProgress: 72,
    currentActivity: 'Analyzing your patterns',
    insights: [
      'Noticing increased creativity in your evening work sessions',
      'Your stress levels have decreased 15% this week',
      'You\'ve been more consistent with your morning routine'
    ],
    recentGrowth: [
      { area: 'Emotional Intelligence', progress: 8 },
      { area: 'Creative Problem Solving', progress: 12 },
      { area: 'Pattern Recognition', progress: 5 }
    ]
  });

  return (
    <div className={`sallie-dashboard bg-gradient-to-br from-sand-50 to-peacock-50 p-6 rounded-2xl ${className}`}>
      {/* Header with Avatar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <AvatarDisplay 
              size="xl"
              mood={sallieState.mood}
              interactive={true}
            />
            <div className="absolute -bottom-2 -right-2 bg-peacock-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-peacock-900 mb-2">Sallie's Sanctuary</h1>
            <p className="text-peacock-600">{sallieState.currentActivity}</p>
          </div>
        </div>
        
        {/* Energy & Mood Indicators */}
        <div className="flex space-x-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
            <div className="text-sm text-gray-600 mb-1">Energy</div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-royal-400 to-royal-600 h-2 rounded-full"
                  style={{ width: `${sallieState.energy}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-royal-700">{sallieState.energy}%</span>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
            <div className="text-sm text-gray-600 mb-1">Mood</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emotion-happy rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold capitalize text-peacock-700">{sallieState.mood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <ActivityOverview 
            activities={[
              { type: 'learning', description: 'Studying your communication patterns', time: '2 min ago' },
              { type: 'analysis', description: 'Analyzing your workflow efficiency', time: '5 min ago' },
              { type: 'insight', description: 'Generated new personal growth recommendation', time: '12 min ago' },
              { type: 'connection', description: 'Strengthening our emotional bond', time: '18 min ago' }
            ]}
          />
        </div>

        {/* Growth Metrics */}
        <div>
          <GrowthMetrics 
            overallProgress={sallieState.learningProgress}
            growthAreas={sallieState.recentGrowth}
          />
        </div>
      </div>

      {/* Insights Panel */}
      <div className="mt-6">
        <InsightsPanel insights={sallieState.insights} />
      </div>

      {/* Subtle leopard print accent */}
      <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
        <div className="w-32 h-32 bg-leopard-spot rounded-full transform translate-x-16 translate-y-16"></div>
      </div>
    </div>
  );
}
