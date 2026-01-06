'use client';

import React, { useState, useEffect } from 'react';

interface TimeEnergyDimensionProps {
  userState: any;
  sallieState: any;
}

export function TimeEnergyDimension({ userState, sallieState }: TimeEnergyDimensionProps) {
  const [activeManagementArea, setActiveManagementArea] = useState('time');
  const [managementAreas, setManagementAreas] = useState([
    {
      id: 'time',
      name: 'Time Mastery',
      icon: '⏰',
      progress: 78,
      phase: 'optimizing',
      metrics: {
        dailyStructure: 85,
        productivity: 82,
        workLifeBalance: 75,
        goalAlignment: 88
      },
      systems: [
        { name: 'Time Blocking', effectiveness: 92, usage: 'daily', description: 'Structured time allocation' },
        { name: 'Priority Management', effectiveness: 88, usage: 'daily', description: 'Eisenhower Matrix application' },
        { name: 'Deep Work Sessions', effectiveness: 85, usage: 'weekly', description: 'Focused work periods' },
        { name: 'Review & Planning', effectiveness: 90, usage: 'weekly', description: 'Strategic time review' }
      ],
      practices: [
        'Morning planning routine',
        'Focused work blocks',
        'Regular break scheduling',
        'Evening review and reflection'
      ],
      challenges: [
        'Context switching reduction',
        'Meeting optimization',
        'Distraction management',
        'Energy-time alignment'
      ]
    },
    {
      id: 'energy',
      name: 'Energy Management',
      icon: '⚡',
      progress: 82,
      phase: 'mastering',
      metrics: {
        physicalEnergy: 85,
        mentalEnergy: 78,
        emotionalEnergy: 88,
        spiritualEnergy: 80
      },
      systems: [
        { name: 'Energy Tracking', effectiveness: 88, usage: 'daily', description: 'Monitor energy levels' },
        { name: 'Recovery Protocols', effectiveness: 92, usage: 'as needed', description: 'Energy restoration techniques' },
        { name: 'Peak Time Utilization', effectiveness: 85, usage: 'daily', description: 'Align tasks with energy' },
        { name: 'Energy Budgeting', effectiveness: 80, usage: 'weekly', description: 'Plan energy allocation' }
      ],
      practices: [
        'Energy level monitoring',
        'Strategic break taking',
        'Peak performance scheduling',
        'Recovery ritual implementation'
      ],
      challenges: [
        'Energy drain identification',
        'Recovery optimization',
        'Sustained energy maintenance',
        'Energy type balancing'
      ]
    },
    {
      id: 'focus',
      name: 'Focus & Flow',
      icon: '🎯',
      progress: 75,
      phase: 'developing',
      metrics: {
        deepWork: 80,
        concentration: 72,
        flowStates: 78,
        distractionControl: 85
      },
      systems: [
        { name: 'Focus Training', effectiveness: 85, usage: 'daily', description: 'Attention building exercises' },
        { name: 'Environment Design', effectiveness: 88, usage: 'ongoing', description: 'Optimize physical space' },
        { name: 'Flow Triggers', effectiveness: 82, usage: 'daily', description: 'Create flow conditions' },
        { name: 'Distraction Elimination', effectiveness: 90, usage: 'ongoing', description: 'Remove interruptions' }
      ],
      practices: [
        'Pomodoro technique',
        'Environment optimization',
        'Single-tasking focus',
        'Flow state cultivation'
      ],
      challenges: [
        'Deep work consistency',
        'Flow state maintenance',
        'Distraction resistance',
        'Attention span building'
      ]
    },
    {
      id: 'rhythms',
      name: 'Life Rhythms',
      icon: '🌊',
      progress: 70,
      phase: 'establishing',
      metrics: {
        dailyRhythm: 75,
        weeklyRhythm: 70,
        monthlyRhythm: 68,
        seasonalAwareness: 80
      },
      systems: [
        { name: 'Circadian Alignment', effectiveness: 88, usage: 'daily', description: 'Work with natural cycles' },
        { name: 'Weekly Cycles', effectiveness: 75, usage: 'weekly', description: 'Structure weekly patterns' },
        { name: 'Monthly Planning', effectiveness: 70, usage: 'monthly', description: 'Monthly goal setting' },
        { name: 'Seasonal Awareness', effectiveness: 82, usage: 'seasonally', description: 'Align with seasons' }
      ],
      practices: [
        'Consistent wake/sleep times',
        'Weekly rhythm establishment',
        'Monthly review cycles',
        'Seasonal activity adjustment'
      ],
      challenges: [
        'Rhythm consistency',
        'Cycle optimization',
        'Seasonal adaptation',
        'Life phase integration'
      ]
    }
  ]);

  const [timeEnergyMetrics, setTimeEnergyMetrics] = useState({
    timeEfficiency: 82,
    energyOptimization: 85,
    focusAchievement: 78,
    rhythmHarmony: 75,
    overallMastery: 80
  });

  const [sallieTimeEnergyInsights, setSallieTimeEnergyInsights] = useState([
    'Time mastery at 78% - excellent blocking, improve work-life balance',
    'Energy management exceptional at 82% - recovery protocols working well',
    'Focus development at 75% - good progress, work on flow state consistency',
    'Life rhythms establishing at 70% - solid foundation, enhance consistency',
    'Overall time-energy mastery strong at 80% - balanced approach working'
  ]);

  const [dailySchedule, setDailySchedule] = useState([
    { time: '5:00-6:00', activity: 'Morning Ritual', energy: 'High', focus: 'Spiritual' },
    { time: '6:00-8:00', activity: 'Deep Work Block 1', energy: 'Peak', focus: 'Creative' },
    { time: '8:00-9:00', activity: 'Exercise & Nutrition', energy: 'High', focus: 'Physical' },
    { time: '9:00-12:00', activity: 'Deep Work Block 2', energy: 'High', focus: 'Analytical' },
    { time: '12:00-13:00', activity: 'Lunch & Recovery', energy: 'Medium', focus: 'Rest' },
    { time: '13:00-16:00', activity: 'Collaborative Work', energy: 'Medium', focus: 'Social' },
    { time: '16:00-17:00', activity: 'Admin & Planning', energy: 'Low', focus: 'Organizational' },
    { time: '17:00-18:00', activity: 'Transition Ritual', energy: 'Low', focus: 'Emotional' },
    { time: '18:00-21:00', activity: 'Personal & Family', energy: 'Medium', focus: 'Relational' },
    { time: '21:00-22:00', activity: 'Evening Review', energy: 'Low', focus: 'Reflective' }
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 60) return 'text-cyan-600';
    return 'text-teal-600';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'mastering': return 'bg-blue-100 text-blue-700';
      case 'optimizing': return 'bg-cyan-100 text-cyan-700';
      case 'developing': return 'bg-teal-100 text-teal-700';
      case 'establishing': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentArea = managementAreas.find(area => area.id === activeManagementArea) || managementAreas[0];

  return (
    <div className="time-energy-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">⏰ Time & Energy Mastery</h2>
            <p className="text-peacock-600">Optimize your time, energy, focus, and life rhythms</p>
          </div>
          
          {/* Time-Energy Metrics */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-3 border border-blue-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">{timeEnergyMetrics.overallMastery}%</div>
                <div className="text-xs text-blue-600">Mastery</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-100 to-teal-100 rounded-xl p-3 border border-cyan-200">
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-700">{timeEnergyMetrics.energyOptimization}%</div>
                <div className="text-xs text-cyan-600">Energy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Area Selector */}
        <div className="flex space-x-2">
          {managementAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveManagementArea(area.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                activeManagementArea === area.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-white text-blue-700 hover:bg-blue-100 border border-blue-200'
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
        {/* Management Area Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Management Area */}
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
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentArea.progress}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(currentArea.metrics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-800 text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <span className="text-sm font-bold text-blue-700">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-1 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Systems */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Management Systems</h4>
              <div className="space-y-3">
                {currentArea.systems.map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-800">{system.name}</h5>
                        <span className="text-sm font-bold text-cyan-700">{system.effectiveness}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{system.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Usage: {system.usage}</span>
                        <span>Effectiveness: {system.effectiveness}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practices */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-3">Daily Practices</h4>
              <div className="grid grid-cols-2 gap-2">
                {currentArea.practices.map((practice, index) => (
                  <div key={index} className="p-2 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-sm text-gray-700">{practice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Current Challenges</h4>
              <div className="space-y-2">
                {currentArea.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <p className="text-sm text-gray-700">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Optimized Daily Schedule
            </h3>
            <div className="space-y-2">
              {dailySchedule.map((block, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-700 w-24">{block.time}</span>
                    <span className="text-sm font-medium text-gray-800 w-32">{block.activity}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      block.energy === 'Peak' ? 'bg-green-100 text-green-700' :
                      block.energy === 'High' ? 'bg-blue-100 text-blue-700' :
                      block.energy === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {block.energy}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {block.focus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Time-Energy Metrics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Mastery Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Mastery</span>
                <span className="text-sm font-medium text-blue-700">{timeEnergyMetrics.overallMastery}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time Efficiency</span>
                <span className="text-sm font-medium text-cyan-700">{timeEnergyMetrics.timeEfficiency}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Energy Optimization</span>
                <span className="text-sm font-medium text-teal-700">{timeEnergyMetrics.energyOptimization}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Focus Achievement</span>
                <span className="text-sm font-medium text-blue-700">{timeEnergyMetrics.focusAchievement}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rhythm Harmony</span>
                <span className="text-sm font-medium text-cyan-700">{timeEnergyMetrics.rhythmHarmony}%</span>
              </div>
            </div>
          </div>

          {/* Sallie's Time-Energy Guidance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Sallie's Optimization Insights
            </h3>
            <div className="space-y-3">
              {sallieTimeEnergyInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Time-Energy Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Start Focus Session
              </button>
              <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                Energy Recovery
              </button>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                Schedule Optimization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
