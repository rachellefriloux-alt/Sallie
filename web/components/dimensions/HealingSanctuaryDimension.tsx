'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MentalHealthMetrics {
  bipolar: {
    currentPhase: 'depressive' | 'stable' | 'hypomanic' | 'creative-manic' | 'full-manic';
    stability: number;
    medication: 'stable' | 'adjusting' | 'ineffective' | 'not-taken';
    triggers: string[];
    copingStrategies: string[];
    nextAppointment: string;
    moodHistory: Array<{
      date: string;
      mood: string;
      energy: number;
      sleep: number;
      medications: number;
      stress: number;
    }>;
  };
  adhd: {
    focus: number;
    hyperfocus: 'inactive' | 'building' | 'active' | 'deep';
    medication: 'effective' | 'adjusting' | 'ineffective' | 'not-taken';
    challenges: string[];
    strengths: string[];
    strategies: string[];
    productivity: number;
  };
  ptsd: {
    stability: number;
    triggers: string[];
    coping: string[];
    therapy: 'not-started' | 'early' | 'ongoing' | 'advanced' | 'maintenance';
    progress: number;
    nightmares: 'frequent' | 'occasional' | 'reduced' | 'rare';
    flashbacks: 'frequent' | 'occasional' | 'manageable' | 'rare';
  };
  overall: {
    stress: number;
    anxiety: number;
    depression: number;
    happiness: number;
    resilience: number;
    sleep: number;
    social: number;
    purpose: number;
  };
}

interface HealingSanctuaryDimensionProps {
  userState?: any;
  sallieState?: any;
}

const therapies = [
  { id: 'bipolar', name: 'Bipolar Management', icon: '🌊', color: 'blue' },
  { id: 'adhd', name: 'ADHD Focus', icon: '🧠', color: 'purple' },
  { id: 'ptsd', name: 'PTSD Healing', icon: '🛡️', color: 'green' },
  { id: 'overall', name: 'Overall Wellness', icon: '💚', color: 'emerald' }
];

export function HealingSanctuaryDimension({ userState, sallieState }: HealingSanctuaryDimensionProps) {
  const [activeTherapy, setActiveTherapy] = useState('bipolar');
  const [mentalHealthMetrics, setMentalHealthMetrics] = useState<MentalHealthMetrics>({
    bipolar: {
      currentPhase: 'stable',
      stability: 78,
      medication: 'stable',
      triggers: ['stress', 'sleep-disruption', 'caffeine', 'seasonal-changes'],
      copingStrategies: ['routine', 'meditation', 'exercise', 'creative-expression', 'social-support'],
      nextAppointment: '2024-01-15',
      moodHistory: [
        { date: '2024-01-08', mood: 'elevated', energy: 85, sleep: 6, medications: 8, stress: 30 },
        { date: '2024-01-07', mood: 'stable', energy: 72, sleep: 8, medications: 8, stress: 25 },
        { date: '2024-01-06', mood: 'depressed', energy: 45, sleep: 10, medications: 8, stress: 40 },
        { date: '2024-01-05', mood: 'stable', energy: 68, sleep: 7, medications: 8, stress: 20 },
        { date: '2024-01-04', mood: 'hypomanic', energy: 90, sleep: 5, medications: 8, stress: 35 },
        { date: '2024-01-03', mood: 'stable', energy: 75, sleep: 8, medications: 8, stress: 22 },
        { date: '2024-01-02', mood: 'stable', energy: 70, sleep: 9, medications: 8, stress: 18 },
      ]
    },
    adhd: {
      focus: 65,
      hyperfocus: 'active',
      medication: 'effective',
      challenges: ['time-management', 'organization', 'completion', 'impulse-control'],
      strengths: ['creativity', 'problem-solving', 'hyperfocus', 'pattern-recognition', 'energy'],
      strategies: ['pomodoro', 'body-doubling', 'gamification', 'visual-aids', 'movement-breaks'],
      productivity: 82
    },
    ptsd: {
      stability: 85,
      triggers: ['loud-noises', 'crowds', 'conflict', 'anniversaries', 'certain-smells'],
      coping: ['grounding', 'breathing', 'safe-space', 'mindfulness', 'progressive-relaxation'],
      therapy: 'ongoing',
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
      social: 80,
      purpose: 90
    }
  });

  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const { bipolar, adhd, ptsd, overall } = mentalHealthMetrics;
    
    return {
      overallStability: ((bipolar.stability + adhd.focus + ptsd.stability) / 3).toFixed(1),
      medicationCompliance: [bipolar.medication, adhd.medication].filter(m => m === 'stable' || m === 'effective').length * 50,
      copingEffectiveness: Math.round((bipolar.copingStrategies.length + adhd.strategies.length + ptsd.coping.length) / 3),
      therapyProgress: ptsd.progress,
      wellnessScore: Math.round((overall.happiness + overall.resilience + overall.social + overall.purpose) / 4),
      riskLevel: overall.stress > 70 || overall.anxiety > 70 ? 'high' : overall.stress > 40 || overall.anxiety > 40 ? 'moderate' : 'low'
    };
  }, [mentalHealthMetrics]);

  // Get current therapy data
  const currentTherapy = useMemo(() => {
    return therapies.find(t => t.id === activeTherapy) || therapies[0];
  }, [activeTherapy]);

  // Get therapy-specific metrics
  const therapyMetrics = useMemo(() => {
    return mentalHealthMetrics[activeTherapy as keyof MentalHealthMetrics] || mentalHealthMetrics.overall;
  }, [activeTherapy, mentalHealthMetrics]);

  // Handle metric updates
  const updateMetric = useCallback((path: string, value: any) => {
    setMentalHealthMetrics(prev => {
      const [category, metric] = path.split('.');
      return {
        ...prev,
        [category]: {
          ...prev[category as keyof MentalHealthMetrics],
          [metric]: value
        }
      };
    });
  }, []);

  // Add new mood entry
  const addMoodEntry = useCallback((moodData: any) => {
    setMentalHealthMetrics(prev => ({
      ...prev,
      bipolar: {
        ...prev.bipolar,
        moodHistory: [...prev.bipolar.moodHistory, {
          date: new Date().toISOString().split('T')[0],
          ...moodData
        }]
      }
    }));
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Healing Sanctuary</h1>
        <p className="text-gray-600">Your comprehensive mental health and wellness dashboard</p>
      </motion.div>

      {/* Therapy Tabs */}
      <div className="flex space-x-1 mb-8 bg-white rounded-xl p-1 shadow-sm">
        {therapies.map((therapy) => (
          <motion.button
            key={therapy.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTherapy(therapy.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
              activeTherapy === therapy.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-xl">{therapy.icon}</span>
            <span className="font-medium">{therapy.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Key Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Overall Stability</span>
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{derivedMetrics.overallStability}%</div>
          <div className="text-xs text-gray-500 mt-1">Combined stability score</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Wellness Score</span>
            <span className="text-2xl">💚</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{derivedMetrics.wellnessScore}</div>
          <div className="text-xs text-gray-500 mt-1">Overall wellness</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Risk Level</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className={`text-2xl font-bold capitalize ${
            derivedMetrics.riskLevel === 'high' ? 'text-red-600' :
            derivedMetrics.riskLevel === 'moderate' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {derivedMetrics.riskLevel}
          </div>
          <div className="text-xs text-gray-500 mt-1">Current risk assessment</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Therapy Progress</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{derivedMetrics.therapyProgress}%</div>
          <div className="text-xs text-gray-500 mt-1">Treatment progress</div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Therapy Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Mood History Chart */}
          {activeTherapy === 'bipolar' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mentalHealthMetrics.bipolar.moodHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="energy" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="sleep" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Current Phase Status */}
          {activeTherapy === 'bipolar' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Phase</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phase</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {mentalHealthMetrics.bipolar.currentPhase}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stability</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${mentalHealthMetrics.bipolar.stability}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{mentalHealthMetrics.bipolar.stability}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Medication</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mentalHealthMetrics.bipolar.medication === 'stable' ? 'bg-green-100 text-green-700' :
                    mentalHealthMetrics.bipolar.medication === 'adjusting' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {mentalHealthMetrics.bipolar.medication}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ADHD Focus Metrics */}
          {activeTherapy === 'adhd' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus & Productivity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Focus</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${mentalHealthMetrics.adhd.focus}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{mentalHealthMetrics.adhd.focus}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hyperfocus</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mentalHealthMetrics.adhd.hyperfocus === 'deep' ? 'bg-purple-100 text-purple-700' :
                    mentalHealthMetrics.adhd.hyperfocus === 'active' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {mentalHealthMetrics.adhd.hyperfocus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Productivity</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${mentalHealthMetrics.adhd.productivity}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{mentalHealthMetrics.adhd.productivity}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PTSD Progress */}
          {activeTherapy === 'ptsd' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Healing Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stability</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${mentalHealthMetrics.ptsd.stability}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{mentalHealthMetrics.ptsd.stability}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Therapy Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${mentalHealthMetrics.ptsd.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700">{mentalHealthMetrics.ptsd.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nightmares</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mentalHealthMetrics.ptsd.nightmares === 'rare' ? 'bg-green-100 text-green-700' :
                    mentalHealthMetrics.ptsd.nightmares === 'reduced' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {mentalHealthMetrics.ptsd.nightmares}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Overall Wellness */}
          {activeTherapy === 'overall' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Wellness Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Stress', value: mentalHealthMetrics.overall.stress, fill: '#ef4444' },
                  { name: 'Anxiety', value: mentalHealthMetrics.overall.anxiety, fill: '#f59e0b' },
                  { name: 'Depression', value: mentalHealthMetrics.overall.depression, fill: '#6b7280' },
                  { name: 'Happiness', value: mentalHealthMetrics.overall.happiness, fill: '#10b981' },
                  { name: 'Resilience', value: mentalHealthMetrics.overall.resilience, fill: '#3b82f6' },
                  { name: 'Sleep', value: mentalHealthMetrics.overall.sleep, fill: '#8b5cf6' },
                  { name: 'Social', value: mentalHealthMetrics.overall.social, fill: '#ec4899' },
                  { name: 'Purpose', value: mentalHealthMetrics.overall.purpose, fill: '#f97316' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Coping Strategies */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coping Strategies</h3>
            <div className="grid grid-cols-2 gap-3">
              {(activeTherapy === 'bipolar' ? mentalHealthMetrics.bipolar.copingStrategies :
                activeTherapy === 'adhd' ? mentalHealthMetrics.adhd.strategies :
                activeTherapy === 'ptsd' ? mentalHealthMetrics.ptsd.coping :
                []).map((strategy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg"
                >
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm text-gray-700">{strategy}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Log Current Mood
              </button>
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Meditation
              </button>
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Emergency Coping
              </button>
              <button className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Schedule Appointment
              </button>
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Appointment</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Date</span>
                <span className="text-sm font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time</span>
                <span className="text-sm font-medium">2:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type</span>
                <span className="text-sm font-medium">Medication Review</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              Reschedule
            </button>
          </div>

          {/* Recent Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Sleep quality improved by 15% this week</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Stress levels are within healthy range</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">Medication adherence is excellent</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
