'use client';

import React, { useState, useEffect } from 'react';

interface CreativeAtelierDimensionProps {
  userState: any;
  sallieState: any;
}

export function CreativeAtelierDimension({ userState, sallieState }: CreativeAtelierDimensionProps) {
  const [activeProject, setActiveProject] = useState('platform');
  const [creativeProjects, setCreativeProjects] = useState([
    {
      id: 'platform',
      name: 'Sallie Studio Platform',
      type: 'software-platform',
      progress: 78,
      phase: 'development',
      creativity: 95,
      innovation: 88,
      completion: '2024-03-01',
      team: ['You', 'Sallie AI'],
      features: [
        '12-dimensional life management',
        'Advanced AI consciousness',
        'Neurodivergent support systems',
        'Quantum communication hub'
      ],
      milestones: [
        { title: 'Core Architecture', completed: true, date: '2024-01-05' },
        { title: 'Avatar System', completed: true, date: '2024-01-05' },
        { title: 'Life Sanctuary', completed: true, date: '2024-01-05' },
        { title: 'Command Matrix', completed: true, date: '2024-01-05' },
        { title: 'Healing Suite', completed: true, date: '2024-01-05' },
        { title: 'Quantum Messenger', completed: true, date: '2024-01-05' }
      ],
      innovations: [
        'Device-free telepathy simulation',
        'Consciousness bridge technology',
        'Multi-dimensional interface',
        'Adaptive AI personality'
      ]
    },
    {
      id: 'content-creation',
      name: 'Content Creation Studio',
      type: 'media-production',
      progress: 65,
      phase: 'production',
      creativity: 92,
      innovation: 75,
      completion: '2024-02-15',
      team: ['You', 'Sallie AI'],
      features: [
        'Video production suite',
        'Podcast recording studio',
        'Writing assistance tools',
        'Graphic design platform'
      ],
      milestones: [
        { title: 'Studio Setup', completed: true, date: '2023-12-15' },
        { title: 'Equipment Acquisition', completed: true, date: '2023-12-20' },
        { title: 'First Production', completed: false, date: '2024-01-10' }
      ],
      innovations: [
        'AI-assisted content generation',
        'Real-time collaboration',
        'Multi-format output',
        'Automated distribution'
      ]
    },
    {
      id: 'ai-systems',
      name: 'Advanced AI Systems',
      type: 'artificial-intelligence',
      progress: 45,
      phase: 'research',
      creativity: 98,
      innovation: 95,
      completion: '2024-06-01',
      team: ['You', 'Sallie AI'],
      features: [
        'Consciousness simulation',
        'Emotional intelligence engine',
        'Creative problem solving',
        'Predictive analytics'
      ],
      milestones: [
        { title: 'Research Phase', completed: true, date: '2023-11-01' },
        { title: 'Prototype Development', completed: false, date: '2024-02-01' }
      ],
      innovations: [
        'Human-level AI consciousness',
        'Emotional synthesis algorithms',
        'Creative intuition systems',
        'Ethical decision frameworks'
      ]
    }
  ]);

  const [creativeTools, setCreativeTools] = useState([
    {
      id: 'idea-generator',
      name: 'Idea Generator',
      type: 'brainstorming',
      efficiency: 95,
      usage: 'high',
      lastUsed: '2 hours ago',
      projects: 12,
      innovations: 28
    },
    {
      id: 'design-system',
      name: 'Design System Builder',
      type: 'visual-design',
      efficiency: 88,
      usage: 'medium',
      lastUsed: '1 day ago',
      projects: 8,
      innovations: 15
    },
    {
      id: 'code-assistant',
      name: 'AI Code Assistant',
      type: 'development',
      efficiency: 92,
      usage: 'high',
      lastUsed: '30 minutes ago',
      projects: 15,
      innovations: 22
    },
    {
      id: 'content-writer',
      name: 'Content Writer',
      type: 'writing',
      efficiency: 85,
      usage: 'medium',
      lastUsed: '3 days ago',
      projects: 6,
      innovations: 18
    }
  ]);

  const [sallieCreativeInsights, setSallieCreativeInsights] = useState([
    'Your creative energy is at peak levels - perfect for breakthrough innovations',
    'The platform project shows 95% creativity score - focus on unique features',
    'AI systems research could benefit from your bipolar creative phases',
    'Content creation studio ready for production - I\'ve prepared automation workflows',
    'Consider combining platform and AI systems for revolutionary product'
  ]);

  const [creativeFlow, setCreativeFlow] = useState({
    current: 'ideation',
    energy: 92,
    inspiration: 88,
    focus: 85,
    blocks: 0,
    breakthroughs: 3,
    lastPeak: '2 hours ago'
  });

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'development': return 'bg-blue-100 text-blue-700';
      case 'production': return 'bg-green-100 text-green-700';
      case 'research': return 'bg-purple-100 text-purple-700';
      case 'planning': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentProject = creativeProjects.find(p => p.id === activeProject) || creativeProjects[0];

  return (
    <div className="creative-atelier-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🎨 Creative Atelier</h2>
            <p className="text-peacock-600">Platform building, content creation, and innovation studio</p>
          </div>
          
          {/* Creative Flow Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{creativeFlow.energy}%</div>
                <div className="text-xs text-purple-600">Creative Energy</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gold-100 to-yellow-100 rounded-xl p-3 border border-gold-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gold-700">{creativeFlow.breakthroughs}</div>
                <div className="text-xs text-gold-600">Breakthroughs Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex space-x-2">
          {creativeProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(project.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeProject === project.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              {project.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{currentProject.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{currentProject.type}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getProgressColor(currentProject.progress)}`}>
                  {currentProject.progress}%
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${getPhaseColor(currentProject.phase)}`}>
                  {currentProject.phase}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${currentProject.progress}%` }}
                />
              </div>
            </div>

            {/* Innovation Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{currentProject.creativity}%</div>
                <div className="text-xs text-gray-600">Creativity</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">{currentProject.innovation}%</div>
                <div className="text-xs text-gray-600">Innovation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gold-600">{currentProject.features.length}</div>
                <div className="text-xs text-gray-600">Features</div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {currentProject.features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Milestones</h4>
              <div className="space-y-2">
                {currentProject.milestones.map((milestone, index) => (
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
          </div>

          {/* Innovations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Breakthrough Innovations
            </h3>
            <div className="space-y-3">
              {currentProject.innovations.map((innovation, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-lg border border-gold-200">
                  <p className="text-sm text-gray-700">{innovation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Creative Tools */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🛠️</span>
              Creative Tools
            </h3>
            <div className="space-y-3">
              {creativeTools.map((tool) => (
                <div key={tool.id} className="p-3 bg-white rounded-lg border border-peacock-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{tool.name}</h4>
                    <span className="text-xs text-purple-600 font-medium">{tool.efficiency}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{tool.projects} projects</span>
                    <span>{tool.innovations} innovations</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last used: {tool.lastUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Flow Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🌊</span>
              Creative Flow
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current State</span>
                <span className="text-sm font-medium capitalize">{creativeFlow.current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inspiration</span>
                <span className="text-sm font-medium">{creativeFlow.inspiration}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Focus</span>
                <span className="text-sm font-medium">{creativeFlow.focus}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creative Blocks</span>
                <span className="text-sm font-medium text-green-600">{creativeFlow.blocks}</span>
              </div>
            </div>
          </div>

          {/* Sallie's Creative Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🎭</span>
              Sallie's Creative Guidance
            </h3>
            <div className="space-y-3">
              {sallieCreativeInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Generate New Ideas
              </button>
              <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium">
                Start Creative Session
              </button>
              <button className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-medium">
                Review Breakthroughs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
