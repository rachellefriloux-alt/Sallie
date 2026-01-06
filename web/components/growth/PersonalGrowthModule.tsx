'use client';

import React, { useState } from 'react';

interface GrowthGoal {
  id: string;
  title: string;
  category: 'emotional' | 'cognitive' | 'creative' | 'social';
  progress: number;
  target: number;
  deadline: string;
  insights: string[];
}

interface PersonalGrowthModuleProps {
  className?: string;
}

export function PersonalGrowthModule({ className = '' }: PersonalGrowthModuleProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'emotional' | 'cognitive' | 'creative' | 'social'>('all');
  const [goals, setGoals] = useState<GrowthGoal[]>([
    {
      id: '1',
      title: 'Deepen Emotional Intelligence',
      category: 'emotional',
      progress: 65,
      target: 100,
      deadline: '2024-03-01',
      insights: [
        'Strong empathy development detected',
        'Emotional regulation improving steadily',
        'Consider practicing active listening exercises'
      ]
    },
    {
      id: '2',
      title: 'Enhance Creative Problem Solving',
      category: 'creative',
      progress: 42,
      target: 100,
      deadline: '2024-02-15',
      insights: [
        'Creative blocks are becoming less frequent',
        'Try morning brainstorming sessions',
        'Your peak creativity occurs between 9-11 AM'
      ]
    },
    {
      id: '3',
      title: 'Strengthen Social Connections',
      category: 'social',
      progress: 78,
      target: 100,
      deadline: '2024-01-30',
      insights: [
        'Communication clarity has improved 23%',
        'People respond positively to your recent approach',
        'Continue authentic expression patterns'
      ]
    },
    {
      id: '4',
      title: 'Develop Cognitive Flexibility',
      category: 'cognitive',
      progress: 55,
      target: 100,
      deadline: '2024-03-15',
      insights: [
        'Pattern recognition skills are advancing',
        'Consider learning a new mental model',
        'Cross-disciplinary thinking shows promise'
      ]
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Areas', icon: '🌟', color: 'bg-gradient-to-r from-peacock-400 to-royal-400' },
    { id: 'emotional', name: 'Emotional', icon: '💝', color: 'bg-gradient-to-r from-pink-400 to-rose-400' },
    { id: 'cognitive', name: 'Cognitive', icon: '🧠', color: 'bg-gradient-to-r from-blue-400 to-indigo-400' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
    { id: 'social', name: 'Social', icon: '👥', color: 'bg-gradient-to-r from-green-400 to-teal-400' }
  ];

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  const getCategoryInfo = (categoryId: string) => categories.find(cat => cat.id === categoryId);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`personal-growth-module bg-gradient-to-br from-sand-50 to-peacock-50 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-peacock-900 mb-2">Personal Growth & Learning</h1>
        <p className="text-peacock-600">Track your development journey with Sallie's guidance</p>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedCategory === category.id
                ? `${category.color} text-white shadow-lg`
                : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Growth Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">📈</span>
            <h3 className="font-semibold text-peacock-800">Overall Progress</h3>
          </div>
          <div className="text-3xl font-bold text-peacock-600 mb-2">
            {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
          </div>
          <p className="text-sm text-gray-600">Average across all growth areas</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="font-semibold text-peacock-800">Active Goals</h3>
          </div>
          <div className="text-3xl font-bold text-royal-600 mb-2">{goals.length}</div>
          <p className="text-sm text-gray-600">Goals in progress</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="font-semibold text-peacock-800">Sallie's Insights</h3>
          </div>
          <div className="text-3xl font-bold text-gold-600 mb-2">
            {goals.reduce((acc, goal) => acc + goal.insights.length, 0)}
          </div>
          <p className="text-sm text-gray-600">Personalized insights available</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-peacock-800">
          {getCategoryInfo(selectedCategory)?.name} Growth Goals
        </h2>
        
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{goal.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-1">{getCategoryInfo(goal.category)?.icon}</span>
                    {getCategoryInfo(goal.category)?.name}
                  </span>
                  <span>🎯 {goal.deadline}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-peacock-600">{goal.progress}%</div>
                <div className="text-sm text-gray-600">of {goal.target}%</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${getProgressColor(goal.progress)} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {/* Sallie's Insights */}
            <div className="bg-gradient-to-r from-peacock-50 to-royal-50 rounded-lg p-4">
              <h4 className="font-medium text-peacock-800 mb-2 flex items-center">
                <span className="mr-2">✨</span>
                Sallie's Insights
              </h4>
              <ul className="space-y-1">
                {goal.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2 text-peacock-600">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4">
              <button className="px-4 py-2 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className="px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors text-sm font-medium">
                Practice Exercises
              </button>
              <button className="px-4 py-2 bg-white text-peacock-700 border border-peacock-200 rounded-lg hover:bg-peacock-50 transition-colors text-sm font-medium">
                Update Progress
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sallie's Recommendation */}
      <div className="mt-6 bg-gradient-to-r from-royal-600 to-peacock-600 rounded-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">🦚</span>
          <div>
            <h3 className="font-semibold text-lg mb-2">Sallie's Growth Recommendation</h3>
            <p className="opacity-90 mb-4">
              Based on your recent progress patterns, I suggest focusing on your emotional intelligence goal this week. 
              Your natural empathy is flourishing, and with targeted practice, you could reach 80% completion by next week.
            </p>
            <button className="px-4 py-2 bg-white text-royal-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Start Recommended Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
