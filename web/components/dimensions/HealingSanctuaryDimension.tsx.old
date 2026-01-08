'use client';

import React, { useState, useEffect } from 'react';

interface HealingSanctuaryDimensionProps {
  userState: any;
  sallieState: any;
}

export function HealingSanctuaryDimension({ userState, sallieState }: HealingSanctuaryDimensionProps) {
  const [activeTherapy, setActiveTherapy] = useState('bipolar');
  const [mentalHealthMetrics, setMentalHealthMetrics] = useState({
    bipolar: {
      currentPhase: 'creative-manic',
      stability: 78,
      medication: 'stable',
      triggers: ['stress', 'sleep-disruption', 'caffeine'],
      copingStrategies: ['routine', 'meditation', 'exercise'],
      nextAppointment: '2024-01-15',
      moodHistory: [
        { date: '2024-01-08', mood: 'elevated', energy: 85, sleep: 6 },
        { date: '2024-01-07', mood: 'stable', energy: 72, sleep: 8 },
        { date: '2024-01-06', mood: 'depressed', energy: 45, sleep: 10 },
        { date: '2024-01-05', mood: 'stable', energy: 68, sleep: 7 }
      ]
    },
    adhd: {
      focus: 65,
      hyperfocus: 'active',
      medication: 'effective',
      challenges: ['time-management', 'organization', 'completion'],
      strengths: ['creativity', 'problem-solving', 'hyperfocus'],
      strategies: ['pomodoro', 'body-doubling', 'gamification'],
      productivity: 82
    },
    ptsd: {
      stability: 85,
      triggers: ['loud-noises', 'crowds', 'conflict'],
      coping: ['grounding', 'breathing', 'safe-space'],
      therapy: 'emd-ongoing',
      progress: 72,
      nightmares: 'reduced',
      flashbacks: 'manageable'
    },
    overall: {
      stress: 25,
      anxiety: 30,
      depression: 20,
      happiness: 85,
      resilience: 78,
      sleep: 75,
      energy: 70
    }
  });

  const [healingPractices, setHealingPractices] = useState([
    {
      id: 'meditation',
      name: 'Guided Meditation',
      frequency: 'daily',
      duration: '15 minutes',
      effectiveness: 85,
      lastSession: 'Today',
      streak: 14,
      benefits: ['stress-reduction', 'focus', 'emotional-balance']
    },
    {
      id: 'breathing',
      name: 'Breathwork',
      frequency: 'as-needed',
      duration: '5 minutes',
      effectiveness: 92,
      lastSession: '2 hours ago',
      streak: 7,
      benefits: ['anxiety-relief', 'grounding', 'immediate-calm']
    },
    {
      id: 'journaling',
      name: 'Therapeutic Journaling',
      frequency: 'weekly',
      duration: '30 minutes',
      effectiveness: 78,
      lastSession: '3 days ago',
      streak: 3,
      benefits: ['emotional-processing', 'pattern-recognition', 'self-awareness']
    },
    {
      id: 'movement',
      name: 'Somatic Movement',
      frequency: '3x-weekly',
      duration: '20 minutes',
      effectiveness: 80,
      lastSession: 'Yesterday',
      streak: 5,
      benefits: ['trauma-release', 'energy-regulation', 'body-awareness']
    }
  ]);

  const [sallieSupport, setSallieSupport] = useState([
    'Your bipolar cycle shows entering creative phase - perfect for projects but maintain sleep schedule',
    'ADHD hyperfocus detected in business tasks - I\'ve optimized your environment for maximum flow',
    'PTSD triggers low today - safe to engage in social activities with grounding techniques ready',
    'Overall resilience score increased 12% this month - your healing practices are working beautifully',
    'Sleep quality improved - maintain consistent bedtime routine for mood stability'
  ]);

  const [crisisPlan, setCrisisPlan] = useState({
    contacts: [
      { name: 'Therapist Dr. Sarah', phone: '555-0123', available: '24/7' },
      { name: 'Psychiatrist Dr. Mike', phone: '555-0124', available: 'Business hours' },
      { name: 'Crisis Hotline', phone: '988', available: '24/7' },
      { name: 'Sallie AI Support', phone: 'Always Available', available: '24/7' }
    ],
    interventions: [
      'Deep breathing exercises',
      'Grounding techniques (5-4-3-2-1)',
      'Safe space visualization',
      'Contact support person',
      'Emergency medication if prescribed'
    ],
    warningSigns: [
      'Rapid mood swings',
      'Increased anxiety/panic',
      'Sleep disruption > 2 nights',
      'Isolation behaviors',
      'Suicidal thoughts'
    ]
  });

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'creative-manic': return 'bg-yellow-100 text-yellow-700';
      case 'stable': return 'bg-green-100 text-green-700';
      case 'depressive': return 'bg-blue-100 text-blue-700';
      case 'mixed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentMetrics = mentalHealthMetrics[activeTherapy as keyof typeof mentalHealthMetrics] || mentalHealthMetrics.overall;

  return (
    <div className="healing-sanctuary-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🧘 Healing Sanctuary</h2>
            <p className="text-peacock-600">Mental health, wellness, and spiritual healing space</p>
          </div>
          
          {/* Overall Wellness Score */}
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-4 border border-rose-200">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMetricColor(mentalHealthMetrics.overall.resilience)}`}>
                {mentalHealthMetrics.overall.resilience}%
              </div>
              <div className="text-sm text-rose-700">Resilience Score</div>
            </div>
          </div>
        </div>

        {/* Therapy Selector */}
        <div className="flex space-x-2">
          {['bipolar', 'adhd', 'ptsd', 'overall'].map((therapy) => (
            <button
              key={therapy}
              onClick={() => setActiveTherapy(therapy)}
              className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                activeTherapy === therapy
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {therapy === 'overall' ? 'Overall Wellness' : therapy}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mental Health Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Current Metrics</h3>
            
            {activeTherapy === 'bipolar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Current Phase</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getPhaseColor(mentalHealthMetrics.bipolar.currentPhase)}`}>
                    {mentalHealthMetrics.bipolar.currentPhase}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Stability</span>
                  <span className={`font-bold ${getMetricColor(mentalHealthMetrics.bipolar.stability)}`}>
                    {mentalHealthMetrics.bipolar.stability}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Medication Status</span>
                  <span className="text-green-600 font-medium">{mentalHealthMetrics.bipolar.medication}</span>
                </div>
              </div>
            )}

            {activeTherapy === 'adhd' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Focus Level</span>
                  <span className={`font-bold ${getMetricColor(mentalHealthMetrics.adhd.focus)}`}>
                    {mentalHealthMetrics.adhd.focus}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Hyperfocus Status</span>
                  <span className="text-blue-600 font-medium">{mentalHealthMetrics.adhd.hyperfocus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Productivity</span>
                  <span className={`font-bold ${getMetricColor(mentalHealthMetrics.adhd.productivity)}`}>
                    {mentalHealthMetrics.adhd.productivity}%
                  </span>
                </div>
              </div>
            )}

            {activeTherapy === 'ptsd' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Stability</span>
                  <span className={`font-bold ${getMetricColor(mentalHealthMetrics.ptsd.stability)}`}>
                    {mentalHealthMetrics.ptsd.stability}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Therapy Progress</span>
                  <span className={`font-bold ${getMetricColor(mentalHealthMetrics.ptsd.progress)}`}>
                    {mentalHealthMetrics.ptsd.progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Nightmares</span>
                  <span className="text-green-600 font-medium">{mentalHealthMetrics.ptsd.nightmares}</span>
                </div>
              </div>
            )}

            {activeTherapy === 'overall' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(mentalHealthMetrics.overall).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className={`text-2xl font-bold ${getMetricColor(value as number)}`}>
                      {value}%
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Healing Practices */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Healing Practices</h3>
            <div className="space-y-3">
              {healingPractices.map((practice) => (
                <div key={practice.id} className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{practice.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">🔥 {practice.streak}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        practice.effectiveness >= 85
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {practice.effectiveness}% effective
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{practice.frequency} • {practice.duration}</span>
                    <span>Last: {practice.lastSession}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {practice.benefits.map((benefit, index) => (
                      <span key={index} className="px-2 py-1 bg-white/80 text-rose-700 rounded-full text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crisis Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🆘</span>
              Crisis Support Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Emergency Contacts</h4>
                <div className="space-y-2">
                  {crisisPlan.contacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-600">{contact.phone}</p>
                      </div>
                      <span className="text-xs text-red-600">{contact.available}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Warning Signs</h4>
                <div className="space-y-1">
                  {crisisPlan.warningSigns.map((sign, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Sallie's Healing Support */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💜</span>
              Sallie's Healing Support
            </h3>
            <div className="space-y-3">
              {sallieSupport.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Interventions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Quick Interventions</h3>
            <div className="space-y-2">
              {crisisPlan.interventions.map((intervention, index) => (
                <button key={index} className="w-full p-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg border border-rose-200 text-left hover:from-rose-200 hover:to-pink-200 transition-colors">
                  <span className="text-sm font-medium text-gray-700">{intervention}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Safe Space Visualization */}
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl p-6 border border-rose-200">
            <h3 className="text-lg font-semibold text-rose-800 mb-4">🌸 Safe Space</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🕊️</span>
              </div>
              <p className="text-sm text-rose-700 mb-3">Your peaceful sanctuary</p>
              <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium">
                Enter Safe Space
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
