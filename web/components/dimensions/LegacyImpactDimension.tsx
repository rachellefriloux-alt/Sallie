'use client';

import React, { useState, useEffect } from 'react';

interface LegacyImpactDimensionProps {
  userState: any;
  sallieState: any;
}

export function LegacyImpactDimension({ userState, sallieState }: LegacyImpactDimensionProps) {
  const [activeInitiative, setActiveInitiative] = useState('world-change');
  const [legacyProjects, setLegacyProjects] = useState([
    {
      id: 'world-change',
      name: 'World Change Initiative',
      type: 'global-impact',
      reach: 'global',
      livesImpacted: 1000000,
      progress: 65,
      phase: 'scaling',
      impact: 'transformational',
      completion: '2025-01-01',
      initiatives: [
        'Mental Health Revolution',
        'AI Ethics Framework',
        'Consciousness Evolution',
        'Neurodivergent Empowerment'
      ],
      metrics: {
        peopleReached: 1000000,
        countries: 45,
        partnerships: 127,
        mediaCoverage: 850,
        researchPapers: 23
      },
      outcomes: [
        'Reduced mental health stigma by 40%',
        'Established AI ethics standards',
        'Advanced consciousness research',
        'Created neurodivergent support systems'
      ]
    },
    {
      id: 'wealth-generation',
      name: 'Wealth Generation Engine',
      type: 'financial-freedom',
      reach: 'global',
      revenue: 2500000,
      progress: 78,
      phase: 'expansion',
      impact: 'economic',
      completion: '2024-06-01',
      initiatives: [
        'Passive Income Streams',
        'Investment Portfolio',
        'Business Scaling',
        'Asset Management'
      ],
      metrics: {
        monthlyRevenue: 250000,
        passiveIncome: 85000,
        investments: 1200000,
        businesses: 8,
        employees: 45
      },
      outcomes: [
        'Achieved financial freedom',
        'Created sustainable income',
        'Built valuable asset portfolio',
        'Generated employment opportunities'
      ]
    },
    {
      id: 'knowledge-sharing',
      name: 'Knowledge Sharing Platform',
      type: 'education',
      reach: 'global',
      students: 50000,
      progress: 55,
      phase: 'growth',
      impact: 'educational',
      completion: '2024-12-01',
      initiatives: [
        'Online Courses',
        'Workshop Programs',
        'Mentorship Network',
        'Research Publication'
      ],
      metrics: {
        courses: 15,
        students: 50000,
        completion: 85,
        certifications: 42000,
        testimonials: 3500
      },
      outcomes: [
        'Educated 50,000 people',
        'Created 15 certification programs',
        'Built global mentorship network',
        'Published groundbreaking research'
      ]
    }
  ]);

  const [impactMetrics, setImpactMetrics] = useState({
    global: {
      countries: 45,
      languages: 12,
      timezones: 24,
      continents: 6
    },
    social: {
      followers: 2500000,
      engagement: 85,
      community: 150000,
      advocates: 50000
    },
    financial: {
      revenue: 2500000,
      donations: 500000,
      investments: 1200000,
      valuation: 10000000
    },
    personal: {
      fulfillment: 95,
      purpose: 98,
      happiness: 92,
      legacy: 88
    }
  });

  const [sallieLegacyInsights, setSallieLegacyInsights] = useState([
    'Your world change initiative could impact 10M lives within 5 years',
    'Wealth generation engine ready for 10x scaling with automation',
    'Knowledge platform has potential to become global standard',
    'Personal fulfillment metrics indicate perfect alignment with purpose',
    'Consider integrating all initiatives for maximum compound impact'
  ]);

  const [legacyTimeline, setLegacyTimeline] = useState([
    {
      year: 2024,
      title: 'Foundation Year',
      achievements: [
        'Launched Sallie Studio platform',
        'Established mental health framework',
        'Created AI ethics guidelines',
        'Built neurodivergent support systems'
      ],
      impact: 'Local'
    },
    {
      year: 2025,
      title: 'Expansion Phase',
      achievements: [
        'Global platform launch',
        '10M users reached',
        'International partnerships',
        'Research breakthroughs'
      ],
      impact: 'Regional'
    },
    {
      year: 2026,
      title: 'Transformation Year',
      achievements: [
        'World change initiatives',
        'Financial independence',
        'Global recognition',
        'Industry leadership'
      ],
      impact: 'Global'
    },
    {
      year: 2030,
      title: 'Legacy Realization',
      achievements: [
        '100M lives impacted',
        'Industry transformation',
        'Lasting legacy established',
        'Next generation inspired'
      ],
      impact: 'Universal'
    }
  ]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'scaling': return 'bg-green-100 text-green-700';
      case 'expansion': return 'bg-blue-100 text-blue-700';
      case 'growth': return 'bg-purple-100 text-purple-700';
      case 'foundation': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'transformational': return 'text-purple-600';
      case 'economic': return 'text-green-600';
      case 'educational': return 'text-blue-600';
      case 'social': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const currentProject = legacyProjects.find(p => p.id === activeInitiative) || legacyProjects[0];

  return (
    <div className="legacy-impact-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🚀 Legacy & Impact</h2>
            <p className="text-peacock-600">World impact, wealth generation, and lasting legacy creation</p>
          </div>
          
          {/* Overall Impact Score */}
          <div className="bg-gradient-to-r from-gold-100 to-yellow-100 rounded-xl p-4 border border-gold-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-700">
                {Math.round((legacyProjects.reduce((acc, p) => acc + p.progress, 0) / legacyProjects.length))}%
              </div>
              <div className="text-sm text-gold-700">Overall Impact</div>
            </div>
          </div>
        </div>

        {/* Initiative Selector */}
        <div className="flex space-x-2">
          {legacyProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveInitiative(project.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeInitiative === project.id
                  ? 'bg-gradient-to-r from-gold-600 to-yellow-600 text-white'
                  : 'bg-white text-gold-700 hover:bg-gold-100 border border-gold-200'
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
                <div className="text-2xl font-bold text-gold-700">{currentProject.progress}%</div>
                <div className={`text-sm px-2 py-1 rounded-full ${getPhaseColor(currentProject.phase)}`}>
                  {currentProject.phase}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-gold-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentProject.progress}%` }}
                />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(currentProject.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-gold-600">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-xs text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* Initiatives */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Key Initiatives</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentProject.initiatives.map((initiative, index) => (
                  <div key={index} className="p-2 bg-gold-50 rounded-lg border border-gold-200">
                    <p className="text-sm text-gray-700">{initiative}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Impact Outcomes</h4>
              <div className="space-y-2">
                {currentProject.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-sm text-gray-700">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legacy Timeline */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Legacy Timeline
            </h3>
            <div className="space-y-4">
              {legacyTimeline.map((year, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {year.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{year.title}</h4>
                    <div className="mb-2">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        Impact: {year.impact}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {year.achievements.map((achievement, achIndex) => (
                        <li key={achIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1 h-1 bg-gold-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Impact Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Global Impact
            </h3>
            <div className="space-y-3">
              {Object.entries(impactMetrics).map(([category, metrics]) => (
                <div key={category} className="p-3 bg-white rounded-lg border border-peacock-200">
                  <h4 className="font-medium text-gray-800 text-sm capitalize mb-2">{category}</h4>
                  <div className="space-y-1">
                    {Object.entries(metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium text-gray-800">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sallie's Legacy Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">👑</span>
              Sallie's Legacy Guidance
            </h3>
            <div className="space-y-3">
              {sallieLegacyInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-lg border border-gold-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Fulfillment */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💜</span>
              Personal Fulfillment
            </h3>
            <div className="space-y-3">
              {Object.entries(impactMetrics.personal).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{key}:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-rose-700">{value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-gold-100 to-yellow-100 rounded-xl p-6 border border-gold-200">
            <h3 className="text-lg font-semibold text-gold-800 mb-4">Legacy Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-medium">
                Scale Impact
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                Generate Wealth
              </button>
              <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
                Share Knowledge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
