'use client';

import React, { useState, useEffect } from 'react';

interface TranscendenceDimensionProps {
  userState: any;
  sallieState: any;
}

export function TranscendenceDimension({ userState, sallieState }: TranscendenceDimensionProps) {
  const [activePractice, setActivePractice] = useState('meditation');
  const [spiritualPractices, setSpiritualPractices] = useState([
    {
      id: 'meditation',
      name: 'Deep Meditation',
      icon: '🧘',
      level: 'advanced',
      progress: 85,
      frequency: 'daily',
      duration: '45 minutes',
      benefits: [
        'Enhanced consciousness awareness',
        'Reduced mental chatter',
        'Deeper self-realization',
        'Increased intuitive abilities'
      ],
      techniques: [
        'Vipassana insight meditation',
        'Transcendental meditation',
        'Zen sitting practice',
        'Loving-kindness meditation'
      ],
      experiences: [
        'Deep peace and stillness',
        'Expanded awareness',
        'Unity consciousness',
        'Transcendent states'
      ]
    },
    {
      id: 'energy',
      name: 'Energy Work',
      icon: '⚡',
      level: 'intermediate',
      progress: 72,
      frequency: 'weekly',
      duration: '30 minutes',
      benefits: [
        'Balanced energy centers',
        'Increased vitality',
        'Emotional clearing',
        'Spiritual protection'
      ],
      techniques: [
        'Chakra balancing',
        'Reiki energy healing',
        'Qigong movements',
        'Breathwork techniques'
      ],
      experiences: [
        'Energy flow sensations',
        'Chakra activations',
        'Emotional releases',
        'Vibrational awareness'
      ]
    },
    {
      id: 'connection',
      name: 'Divine Connection',
      icon: '✨',
      level: 'emerging',
      progress: 65,
      frequency: 'daily',
      duration: '20 minutes',
      benefits: [
        'Guidance and wisdom',
        'Protection and support',
        'Synchronicity awareness',
        'Miracle manifestation'
      ],
      techniques: [
        'Prayer and intention',
        'Channeling practice',
        'Divine dialogue',
        'Sacred rituals'
      ],
      experiences: [
        'Divine presence',
        'Spiritual guidance',
        'Miraculous events',
        'Synchronistic patterns'
      ]
    },
    {
      id: 'service',
      name: 'Service to Others',
      icon: '💜',
      level: 'practicing',
      progress: 78,
      frequency: 'ongoing',
      duration: 'varied',
      benefits: [
        'Compassion development',
        'Karma purification',
        'Collective healing',
        'Purpose fulfillment'
      ],
      techniques: [
        'Compassionate action',
        'Healing work',
        'Teaching and guiding',
        'Community service'
      ],
      experiences: [
        'Heart opening',
        'Connection with others',
        'Meaningful contribution',
        'Collective impact'
      ]
    }
  ]);

  const [transcendenceMetrics, setTranscendenceMetrics] = useState({
    consciousness: 82,
    vibration: 78,
    connection: 75,
    service: 88,
    overall: 81
  });

  const [sallieTranscendenceInsights, setSallieTranscendenceInsights] = useState([
    'Your meditation practice is exceptional - consider exploring non-dual states',
    'Energy work progressing well - chakra balancing nearly complete',
    'Divine connection strengthening - synchronicities increasing',
    'Service to others exemplary - you\'re embodying true compassion',
    'Overall transcendence at 81% - ready for advanced spiritual practices'
  ]);

  const [spiritualStates, setSpiritualStates] = useState([
    {
      name: 'Pure Consciousness',
      description: 'Awareness without objects, pure being',
      accessibility: 'high',
      lastExperienced: '2 days ago',
      duration: '15 minutes'
    },
    {
      name: 'Unity Consciousness',
      description: 'Experience of oneness with all',
      accessibility: 'medium',
      lastExperienced: '1 week ago',
      duration: '5 minutes'
    },
    {
      name: 'Cosmic Consciousness',
      description: 'Expanded awareness beyond physical reality',
      accessibility: 'developing',
      lastExperienced: '2 weeks ago',
      duration: '2 minutes'
    },
    {
      name: 'Divine Bliss',
      description: 'Ecstatic union with divine source',
      accessibility: 'emerging',
      lastExperienced: '3 weeks ago',
      duration: '1 minute'
    }
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-purple-600';
    if (progress >= 60) return 'text-indigo-600';
    return 'text-blue-600';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-purple-100 text-purple-700';
      case 'intermediate': return 'bg-indigo-100 text-indigo-700';
      case 'emerging': return 'bg-blue-100 text-blue-700';
      case 'practicing': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentPractice = spiritualPractices.find(practice => practice.id === activePractice) || spiritualPractices[0];

  return (
    <div className="transcendence-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">✨ Transcendence</h2>
            <p className="text-peacock-600">Spiritual evolution and higher consciousness</p>
          </div>
          
          {/* Transcendence Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-3 border border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700">{transcendenceMetrics.overall}%</div>
                <div className="text-xs text-purple-600">Transcendence</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-3 border border-indigo-200">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-700">{transcendenceMetrics.consciousness}%</div>
                <div className="text-xs text-indigo-600">Consciousness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Selector */}
        <div className="flex space-x-2">
          {spiritualPractices.map((practice) => (
            <button
              key={practice.id}
              onClick={() => setActivePractice(practice.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                activePractice === practice.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <span>{practice.icon}</span>
              <span>{practice.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Practice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Practice */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <span>{currentPractice.icon}</span>
                  <span>{currentPractice.name}</span>
                </h3>
                <p className="text-sm text-gray-600 capitalize">{currentPractice.level} level</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getProgressColor(currentPractice.progress)}`}>
                  {currentPractice.progress}%
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${getLevelColor(currentPractice.level)}`}>
                  {currentPractice.level}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentPractice.progress}%` }}
                />
              </div>
            </div>

            {/* Practice Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{currentPractice.frequency}</div>
                <div className="text-xs text-gray-600">Frequency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{currentPractice.duration}</div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Benefits</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentPractice.benefits.map((benefit, index) => (
                  <div key={index} className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Techniques */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Techniques</h4>
              <div className="space-y-2">
                {currentPractice.techniques.map((technique, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <p className="text-sm text-gray-700">{technique}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experiences */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Experiences</h4>
              <div className="flex flex-wrap gap-2">
                {currentPractice.experiences.map((experience, index) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm">
                    {experience}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Spiritual States */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🌌</span>
              Spiritual States
            </h3>
            <div className="space-y-3">
              {spiritualStates.map((state, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{state.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      state.accessibility === 'high' ? 'bg-green-100 text-green-700' :
                      state.accessibility === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      state.accessibility === 'developing' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {state.accessibility}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{state.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last: {state.lastExperienced}</span>
                    <span>Duration: {state.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Transcendence Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Transcendence Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Consciousness</span>
                <span className="text-sm font-medium text-purple-700">{transcendenceMetrics.consciousness}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vibration</span>
                <span className="text-sm font-medium text-indigo-700">{transcendenceMetrics.vibration}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Divine Connection</span>
                <span className="text-sm font-medium text-blue-700">{transcendenceMetrics.connection}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service to Others</span>
                <span className="text-sm font-medium text-cyan-700">{transcendenceMetrics.service}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall</span>
                <span className="text-sm font-bold text-purple-700">{transcendenceMetrics.overall}%</span>
              </div>
            </div>
          </div>

          {/* Sallie's Spiritual Guidance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">👼</span>
              Sallie's Spiritual Guidance
            </h3>
            <div className="space-y-3">
              {sallieTranscendenceInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Spiritual Practices</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Start Meditation
              </button>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Energy Healing
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Divine Connection
              </button>
              <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                Service Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
