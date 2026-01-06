'use client';

import React, { useState, useEffect } from 'react';

interface GrowthGardenDimensionProps {
  userState: any;
  sallieState: any;
}

export function GrowthGardenDimension({ userState, sallieState }: GrowthGardenDimensionProps) {
  const [activeGrowthArea, setActiveGrowthArea] = useState('personal');
  const [growthAreas, setGrowthAreas] = useState([
    {
      id: 'personal',
      name: 'Personal Evolution',
      icon: '🌱',
      progress: 78,
      phase: 'active',
      skills: [
        { name: 'Emotional Intelligence', level: 85, next: 'Advanced empathy training' },
        { name: 'Mindfulness Practice', level: 92, next: 'Deep meditation techniques' },
        { name: 'Self-Awareness', level: 88, next: 'Shadow work integration' },
        { name: 'Adaptability', level: 76, next: 'Change mastery protocols' }
      ],
      milestones: [
        { title: 'Emotional Mastery', completed: true, date: '2024-01-05' },
        { title: 'Mind Integration', completed: true, date: '2024-01-05' },
        { title: 'Self-Actualization', completed: false, date: '2024-03-01' }
      ],
      practices: [
        'Daily meditation and reflection',
        'Journaling for self-discovery',
        'Emotional regulation techniques',
        'Growth mindset cultivation'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Development',
      icon: '🚀',
      progress: 65,
      phase: 'scaling',
      skills: [
        { name: 'Leadership', level: 72, next: 'Executive leadership training' },
        { name: 'Technical Skills', level: 88, next: 'Advanced AI integration' },
        { name: 'Business Acumen', level: 70, next: 'Strategic thinking mastery' },
        { name: 'Innovation', level: 85, next: 'Disruptive innovation methods' }
      ],
      milestones: [
        { title: 'Skill Mastery', completed: true, date: '2023-12-15' },
        { title: 'Leadership Development', completed: false, date: '2024-02-01' },
        { title: 'Industry Recognition', completed: false, date: '2024-06-01' }
      ],
      practices: [
        'Continuous learning and education',
        'Networking and relationship building',
        'Industry trend monitoring',
        'Innovation project development'
      ]
    },
    {
      id: 'spiritual',
      name: 'Spiritual Growth',
      icon: '✨',
      progress: 82,
      phase: 'deepening',
      skills: [
        { name: 'Intuition Development', level: 90, next: 'Advanced intuitive practices' },
        { name: 'Consciousness Expansion', level: 85, next: 'Higher consciousness states' },
        { name: 'Energy Work', level: 78, next: 'Advanced energy healing' },
        { name: 'Mystical Experiences', level: 88, next: 'Deep spiritual practices' }
      ],
      milestones: [
        { title: 'Spiritual Awakening', completed: true, date: '2023-11-01' },
        { title: 'Energy Mastery', completed: true, date: '2024-01-05' },
        { title: 'Consciousness Integration', completed: false, date: '2024-04-01' }
      ],
      practices: [
        'Daily spiritual practices',
        'Meditation and contemplation',
        'Energy healing and balancing',
        'Connection with higher self'
      ]
    },
    {
      id: 'creative',
      name: 'Creative Expression',
      icon: '🎨',
      progress: 70,
      phase: 'exploring',
      skills: [
        { name: 'Artistic Expression', level: 75, next: 'Advanced creative techniques' },
        { name: 'Creative Problem Solving', level: 82, next: 'Innovation methodologies' },
        { name: 'Design Thinking', level: 68, next: 'Human-centered design mastery' },
        { name: 'Content Creation', level: 85, next: 'Advanced content strategies' }
      ],
      milestones: [
        { title: 'Creative Foundation', completed: true, date: '2023-10-15' },
        { title: 'Expression Mastery', completed: false, date: '2024-03-01' },
        { title: 'Creative Innovation', completed: false, date: '2024-08-01' }
      ],
      practices: [
        'Daily creative practice',
        'Artistic skill development',
        'Creative exploration and experimentation',
        'Content creation and sharing'
      ]
    }
  ]);

  const [growthMetrics, setGrowthMetrics] = useState({
    overall: 74,
    momentum: 'accelerating',
    consistency: 92,
    breakthroughs: 3,
    challenges: 2,
    insights: 12
  });

  const [sallieGrowthInsights, setSallieGrowthInsights] = useState([
    'Your personal evolution is at 78% - focus on self-actualization next',
    'Professional growth accelerating - leadership skills ready for advancement',
    'Spiritual development exceptional - consciousness integration imminent',
    'Creative expression flourishing - consider sharing your work more widely',
    'Growth momentum strong - maintain current practices for maximum results'
  ]);

  const [growthPractices, setGrowthPractices] = useState([
    {
      name: 'Morning Growth Ritual',
      duration: '30 minutes',
      frequency: 'Daily',
      effectiveness: 95,
      description: 'Comprehensive morning routine for personal development'
    },
    {
      name: 'Weekly Review & Planning',
      duration: '60 minutes',
      frequency: 'Weekly',
      effectiveness: 88,
      description: 'Structured review of progress and goal setting'
    },
    {
      name: 'Learning Integration',
      duration: '45 minutes',
      frequency: 'Daily',
      effectiveness: 82,
      description: 'Active learning and skill development practice'
    },
    {
      name: 'Creative Expression',
      duration: '20 minutes',
      frequency: 'Daily',
      effectiveness: 76,
      description: 'Regular creative practice and exploration'
    }
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'scaling': return 'bg-blue-100 text-blue-700';
      case 'deepening': return 'bg-purple-100 text-purple-700';
      case 'exploring': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentArea = growthAreas.find(area => area.id === activeGrowthArea) || growthAreas[0];

  return (
    <div className="growth-garden-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🌱 Growth Garden</h2>
            <p className="text-peacock-600">Personal evolution and continuous development</p>
          </div>
          
          {/* Growth Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 border border-green-200">
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">{growthMetrics.overall}%</div>
                <div className="text-xs text-green-600">Overall Growth</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{growthMetrics.breakthroughs}</div>
                <div className="text-xs text-purple-600">Breakthroughs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Area Selector */}
        <div className="flex space-x-2">
          {growthAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveGrowthArea(area.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                activeGrowthArea === area.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white text-green-700 hover:bg-green-100 border border-green-200'
              }`}
            >
              <span>{area.icon}</span>
              <span>{area.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Area Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Growth Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <span>{currentArea.icon}</span>
                  <span>{currentArea.name}</span>
                </h3>
                <p className="text-sm text-gray-600 capitalize">{currentArea.phase}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getProgressColor(currentArea.progress)}`}>
                  {currentArea.progress}%
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${getPhaseColor(currentArea.phase)}`}>
                  {currentArea.phase}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentArea.progress}%` }}
                />
              </div>
            </div>

            {/* Skills Development */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Skills Development</h4>
              <div className="space-y-3">
                {currentArea.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">{skill.name}</h5>
                        <span className="text-sm font-bold text-green-700">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Next: {skill.next}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Growth Milestones</h4>
              <div className="space-y-2">
                {currentArea.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{milestone.title}</p>
                        <p className="text-xs text-gray-600">{milestone.date}</p>
                      </div>
                    </div>
                    {milestone.completed && (
                      <span className="text-xs text-green-600">✓ Complete</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Practices */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Daily Practices</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentArea.practices.map((practice, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Growth Practices Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🔄</span>
              Growth Practices
            </h3>
            <div className="space-y-3">
              {growthPractices.map((practice, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{practice.name}</h4>
                    <span className="text-sm font-bold text-green-700">{practice.effectiveness}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{practice.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{practice.duration}</span>
                    <span className="capitalize">{practice.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Growth Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Growth Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium text-green-700">{growthMetrics.overall}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Momentum</span>
                <span className="text-sm font-medium capitalize text-green-600">{growthMetrics.momentum}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Consistency</span>
                <span className="text-sm font-medium text-green-700">{growthMetrics.consistency}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Breakthroughs</span>
                <span className="text-sm font-medium text-green-700">{growthMetrics.breakthroughs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Challenges</span>
                <span className="text-sm font-medium text-yellow-600">{growthMetrics.challenges}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Insights</span>
                <span className="text-sm font-medium text-purple-700">{growthMetrics.insights}</span>
              </div>
            </div>
          </div>

          {/* Sallie's Growth Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🌟</span>
              Sallie's Growth Guidance
            </h3>
            <div className="space-y-3">
              {sallieGrowthInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Growth Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Start Growth Session
              </button>
              <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                Review Progress
              </button>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                Set New Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
