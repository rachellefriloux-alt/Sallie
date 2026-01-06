'use client';

import React, { useState, useEffect } from 'react';

interface SocialMasteryDimensionProps {
  userState: any;
  sallieState: any;
}

export function SocialMasteryDimension({ userState, sallieState }: SocialMasteryDimensionProps) {
  const [activeSocialArea, setActiveSocialArea] = useState('relationships');
  const [socialAreas, setSocialAreas] = useState([
    {
      id: 'relationships',
      name: 'Relationship Mastery',
      icon: '💕',
      progress: 82,
      phase: 'deepening',
      connections: [
        { name: 'Family Bonds', strength: 95, quality: 'excellent', next: 'Create family rituals' },
        { name: 'Friendship Network', strength: 88, quality: 'strong', next: 'Deepen key friendships' },
        { name: 'Romantic Partnership', strength: 92, quality: 'thriving', next: 'Plan future together' },
        { name: 'Community Ties', strength: 76, quality: 'growing', next: 'Join community groups' }
      ],
      skills: [
        { name: 'Active Listening', level: 90, next: 'Empathetic listening mastery' },
        { name: 'Communication', level: 85, next: 'Non-violent communication' },
        { name: 'Conflict Resolution', level: 78, next: 'Mediation techniques' },
        { name: 'Emotional Intelligence', level: 88, next: 'Advanced empathy skills' }
      ],
      practices: [
        'Daily connection check-ins',
        'Quality time allocation',
        'Appreciation and gratitude',
        'Boundary setting and respect'
      ]
    },
    {
      id: 'influence',
      name: 'Influence & Leadership',
      icon: '👑',
      progress: 75,
      phase: 'emerging',
      connections: [
        { name: 'Professional Network', strength: 82, quality: 'strong', next: 'Expand industry connections' },
        { name: 'Thought Leadership', strength: 70, quality: 'developing', next: 'Share expertise publicly' },
        { name: 'Mentorship Impact', strength: 85, quality: 'meaningful', next: 'Formal mentorship program' },
        { name: 'Community Leadership', strength: 68, quality: 'growing', next: 'Take leadership roles' }
      ],
      skills: [
        { name: 'Public Speaking', level: 72, next: 'Advanced presentation skills' },
        { name: 'Strategic Networking', level: 80, next: 'Relationship building mastery' },
        { name: 'Inspiration & Motivation', level: 78, next: 'Leadership development' },
        { name: 'Negotiation', level: 75, next: 'Advanced negotiation tactics' }
      ],
      practices: [
        'Regular networking events',
        'Thought leadership content',
        'Mentorship activities',
        'Leadership skill development'
      ]
    },
    {
      id: 'communication',
      name: 'Communication Excellence',
      icon: '🗣️',
      progress: 88,
      phase: 'mastering',
      connections: [
        { name: 'Verbal Communication', strength: 92, quality: 'excellent', next: 'Advanced rhetoric' },
        { name: 'Written Communication', strength: 85, quality: 'strong', next: 'Professional writing' },
        { name: 'Non-Verbal Skills', strength: 88, quality: 'excellent', next: 'Body language mastery' },
        { name: 'Digital Communication', strength: 90, quality: 'excellent', next: 'Multi-platform expertise' }
      ],
      skills: [
        { name: 'Storytelling', level: 85, next: 'Narrative mastery' },
        { name: 'Persuasion', level: 82, next: 'Ethical influence techniques' },
        { name: 'Clarity & Conciseness', level: 90, next: 'Advanced communication' },
        { name: 'Adaptability', level: 88, next: 'Contextual communication' }
      ],
      practices: [
        'Daily writing practice',
        'Public speaking opportunities',
        'Active listening exercises',
        'Communication skill development'
      ]
    },
    {
      id: 'community',
      name: 'Community Building',
      icon: '🌍',
      progress: 70,
      phase: 'growing',
      connections: [
        { name: 'Local Community', strength: 75, quality: 'developing', next: 'Join local initiatives' },
        { name: 'Online Communities', strength: 82, quality: 'active', next: 'Build online presence' },
        { name: 'Professional Groups', strength: 68, quality: 'emerging', next: 'Industry involvement' },
        { name: 'Social Impact', strength: 72, quality: 'meaningful', next: 'Scale impact projects' }
      ],
      skills: [
        { name: 'Community Organizing', level: 68, next: 'Advanced organizing skills' },
        { name: 'Event Planning', level: 75, next: 'Large-scale events' },
        { name: 'Facilitation', level: 70, next: 'Group facilitation mastery' },
        { name: 'Collaboration', level: 78, next: 'Partnership development' }
      ],
      practices: [
        'Community event participation',
        'Online engagement',
        'Collaborative projects',
        'Social impact initiatives'
      ]
    }
  ]);

  const [socialMetrics, setSocialMetrics] = useState({
    connections: 156,
    influence: 78,
    communication: 88,
    community: 72,
    overall: 79
  });

  const [sallieSocialInsights, setSallieSocialInsights] = useState([
    'Your relationship mastery is exceptional at 82% - focus on deepening community ties',
    'Communication skills excellent at 88% - leverage for greater influence',
    'Leadership emerging at 75% - ready for thought leadership development',
    'Community building growing at 70% - consider formal community roles',
    'Overall social mastery strong at 79% - balanced across all areas'
  ]);

  const [socialGoals, setSocialGoals] = useState([
    {
      title: 'Expand Professional Network',
      target: '50 new meaningful connections',
      timeline: '6 months',
      progress: 40,
      actions: ['Attend industry events', 'Join professional associations', 'Start thought leadership']
    },
    {
      title: 'Deepen Key Relationships',
      target: 'Quality time with top 10 connections',
      timeline: '3 months',
      progress: 65,
      actions: ['Schedule regular check-ins', 'Create shared experiences', 'Practice active listening']
    },
    {
      title: 'Build Community Influence',
      target: 'Become recognized community leader',
      timeline: '12 months',
      progress: 30,
      actions: ['Take leadership roles', 'Share expertise publicly', 'Mentor others']
    }
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-pink-600';
    if (progress >= 60) return 'text-rose-600';
    return 'text-red-600';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'mastering': return 'bg-pink-100 text-pink-700';
      case 'deepening': return 'bg-rose-100 text-rose-700';
      case 'emerging': return 'bg-red-100 text-red-700';
      case 'growing': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentArea = socialAreas.find(area => area.id === activeSocialArea) || socialAreas[0];

  return (
    <div className="social-mastery-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">👥 Social Mastery</h2>
            <p className="text-peacock-600">Relationship excellence and community leadership</p>
          </div>
          
          {/* Social Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-3 border border-pink-200">
              <div className="text-center">
                <div className="text-lg font-bold text-pink-700">{socialMetrics.overall}%</div>
                <div className="text-xs text-pink-600">Social Mastery</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-rose-100 to-red-100 rounded-xl p-3 border border-rose-200">
              <div className="text-center">
                <div className="text-lg font-bold text-rose-700">{socialMetrics.connections}</div>
                <div className="text-xs text-rose-600">Connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Area Selector */}
        <div className="flex space-x-2">
          {socialAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveSocialArea(area.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                activeSocialArea === area.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                  : 'bg-white text-pink-700 hover:bg-pink-100 border border-pink-200'
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
        {/* Social Area Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Social Area */}
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
                  className="bg-gradient-to-r from-pink-400 to-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentArea.progress}%` }}
                />
              </div>
            </div>

            {/* Connections */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Connections</h4>
              <div className="space-y-3">
                {currentArea.connections.map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">{connection.name}</h5>
                        <span className="text-sm font-bold text-pink-700">{connection.strength}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full"
                          style={{ width: `${connection.strength}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600 capitalize">{connection.quality}</span>
                        <span className="text-xs text-gray-500">Next: {connection.next}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Social Skills</h4>
              <div className="grid grid-cols-2 gap-3">
                {currentArea.skills.map((skill, index) => (
                  <div key={index} className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 text-sm">{skill.name}</h5>
                      <span className="text-sm font-bold text-rose-700">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-rose-400 to-red-500 h-1 rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Next: {skill.next}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practices */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Daily Practices</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentArea.practices.map((practice, index) => (
                  <div key={index} className="p-2 bg-pink-50 rounded-lg border border-pink-200">
                    <p className="text-sm text-gray-700">{practice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Goals */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Social Goals
            </h3>
            <div className="space-y-4">
              {socialGoals.map((goal, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <span className="text-sm font-bold text-pink-700">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Target: {goal.target}</span>
                    <span>Timeline: {goal.timeline}</span>
                  </div>
                  <div className="space-y-1">
                    {goal.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
                        <p className="text-xs text-gray-600">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Social Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Social Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Mastery</span>
                <span className="text-sm font-medium text-pink-700">{socialMetrics.overall}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connections</span>
                <span className="text-sm font-medium text-rose-700">{socialMetrics.connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Influence</span>
                <span className="text-sm font-medium text-red-700">{socialMetrics.influence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <span className="text-sm font-medium text-pink-700">{socialMetrics.communication}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Community</span>
                <span className="text-sm font-medium text-rose-700">{socialMetrics.community}%</span>
              </div>
            </div>
          </div>

          {/* Sallie's Social Guidance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💕</span>
              Sallie's Social Guidance
            </h3>
            <div className="space-y-3">
              {sallieSocialInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-pink-800 mb-4">Social Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium">
                Network Building
              </button>
              <button className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium">
                Relationship Deepening
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Community Leadership
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
