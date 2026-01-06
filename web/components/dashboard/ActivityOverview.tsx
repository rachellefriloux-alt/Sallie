'use client';

import React from 'react';

interface Activity {
  type: 'learning' | 'analysis' | 'insight' | 'connection';
  description: string;
  time: string;
}

interface ActivityOverviewProps {
  activities: Activity[];
}

export function ActivityOverview({ activities }: ActivityOverviewProps) {
  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      learning: '🧠',
      analysis: '📊', 
      insight: '💡',
      connection: '💜'
    };
    return icons[type];
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      learning: 'bg-royal-100 text-royal-700 border-royal-200',
      analysis: 'bg-teal-100 text-teal-700 border-teal-200',
      insight: 'bg-gold-100 text-gold-700 border-gold-200',
      connection: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return colors[type];
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 shadow-lg">
      <h2 className="text-xl font-bold text-peacock-900 mb-4 flex items-center">
        <span className="mr-2">🌟</span>
        Current Activities
      </h2>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div 
            key={index}
            className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:shadow-md ${getActivityColor(activity.type)}`}
          >
            <div className="text-2xl flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-gray-800">{activity.description}</p>
              <p className="text-sm opacity-75">{activity.time}</p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
