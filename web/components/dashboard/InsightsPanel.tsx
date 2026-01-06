'use client';

import React from 'react';

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 shadow-lg">
      <h2 className="text-xl font-bold text-peacock-900 mb-4 flex items-center">
        <span className="mr-2">✨</span>
        Personal Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="p-4 bg-gradient-to-br from-peacock-50 to-royal-50 rounded-xl border border-peacock-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-royal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button className="px-4 py-2 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors text-sm font-medium">
          View All Insights
        </button>
      </div>
    </div>
  );
}
