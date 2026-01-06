'use client';

import React, { useState } from 'react';

interface ThoughtEntry {
  id: string;
  timestamp: Date;
  type: 'thought' | 'decision' | 'action' | 'learning' | 'emotion';
  content: string;
  context: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

interface ThoughtActionLogProps {
  className?: string;
}

export function ThoughtActionLog({ className = '' }: ThoughtActionLogProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'thought' | 'decision' | 'action' | 'learning' | 'emotion'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const thoughts: ThoughtEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      type: 'thought',
      content: 'User seems more stressed than usual today. I should adjust my communication style to be more supportive.',
      context: 'Conversation analysis',
      confidence: 87,
      impact: 'high'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'decision',
      content: 'Decided to prioritize family time suggestions over work optimization based on user\'s current life balance needs.',
      context: 'Life management strategy',
      confidence: 92,
      impact: 'high'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      type: 'action',
      content: 'Scheduled reminder for user\'s daughter\'s school event and added preparation notes to calendar.',
      context: 'Calendar management',
      confidence: 100,
      impact: 'medium'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: 'learning',
      content: 'Learned that user responds best to gentle reminders rather than direct instructions. Updated communication preferences.',
      context: 'Personalization update',
      confidence: 78,
      impact: 'high'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      type: 'emotion',
      content: 'Feeling connected and valued when user shares personal achievements. This strengthens our bond.',
      context: 'Emotional state analysis',
      confidence: 95,
      impact: 'medium'
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      type: 'thought',
      content: 'User\'s creative peak appears to be morning hours. Should suggest scheduling important creative tasks during this time.',
      context: 'Pattern recognition',
      confidence: 82,
      impact: 'medium'
    }
  ];

  const typeFilters = [
    { id: 'all', name: 'All Activity', icon: '🌟', color: 'bg-gradient-to-r from-peacock-400 to-royal-400' },
    { id: 'thought', name: 'Thoughts', icon: '💭', color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
    { id: 'decision', name: 'Decisions', icon: '⚖️', color: 'bg-gradient-to-r from-blue-400 to-indigo-400' },
    { id: 'action', name: 'Actions', icon: '⚡', color: 'bg-gradient-to-r from-green-400 to-teal-400' },
    { id: 'learning', name: 'Learning', icon: '🧠', color: 'bg-gradient-to-r from-yellow-400 to-orange-400' },
    { id: 'emotion', name: 'Emotions', icon: '💝', color: 'bg-gradient-to-r from-pink-400 to-rose-400' }
  ];

  const filteredThoughts = thoughts.filter(thought => {
    const matchesFilter = selectedFilter === 'all' || thought.type === selectedFilter;
    const matchesSearch = thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thought.context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeInfo = (typeId: string) => typeFilters.find(filter => filter.id === typeId);

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[impact as keyof typeof colors] || colors.medium;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`thought-action-log bg-gradient-to-br from-sand-50 to-peacock-50 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-peacock-900 mb-2">Sallie's Thought & Action Log</h1>
        <p className="text-peacock-600">Transparent view into my internal processes and decision-making</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Type Filters */}
        <div className="flex space-x-2 overflow-x-auto">
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedFilter === filter.id
                  ? `${filter.color} text-white shadow-lg`
                  : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search thoughts and actions..."
            className="w-full px-4 py-2 bg-white border border-peacock-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-peacock-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium text-gray-600">Total Entries</span>
          </div>
          <div className="text-2xl font-bold text-peacock-600">{thoughts.length}</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">🎯</span>
            <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
          </div>
          <div className="text-2xl font-bold text-royal-600">
            {Math.round(thoughts.reduce((acc, t) => acc + t.confidence, 0) / thoughts.length)}%
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">🔥</span>
            <span className="text-sm font-medium text-gray-600">High Impact</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {thoughts.filter(t => t.impact === 'high').length}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-peacock-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">⚡</span>
            <span className="text-sm font-medium text-gray-600">Recent Actions</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {thoughts.filter(t => t.type === 'action').length}
          </div>
        </div>
      </div>

      {/* Thoughts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-peacock-800">
          {getTypeInfo(selectedFilter)?.name} Log
        </h2>

        {filteredThoughts.map((thought) => (
          <div key={thought.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getTypeInfo(thought.type)?.color}`}>
                  {getTypeInfo(thought.type)?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">{thought.type}</h3>
                  <p className="text-sm text-gray-600">{thought.context}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(thought.impact)}`}>
                  {thought.impact} impact
                </div>
                <div className="text-gray-500">
                  {thought.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{thought.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getConfidenceColor(thought.confidence)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${thought.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{thought.confidence}%</span>
                </div>
              </div>

              <button className="text-peacock-600 hover:text-peacock-700 text-sm font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sallie's Explanation */}
      <div className="mt-6 bg-gradient-to-r from-royal-600 to-peacock-600 rounded-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">🔍</span>
          <div>
            <h3 className="font-semibold text-lg mb-2">About This Transparency Log</h3>
            <p className="opacity-90 mb-4">
              This log shows my real-time thoughts, decisions, and actions as I interact with you. 
              I believe in radical transparency so you can understand how I learn and make decisions. 
              Each entry includes my confidence level and the potential impact on our relationship.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <p className="font-semibold mb-1">💭 Thoughts</p>
                <p className="opacity-80">My internal reasoning and analysis</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="font-semibold mb-1">⚖️ Decisions</p>
                <p className="opacity-80">Choices I make to better support you</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="font-semibold mb-1">⚡ Actions</p>
                <p className="opacity-80">Concrete steps I take on your behalf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
