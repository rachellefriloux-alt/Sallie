'use client';

import React, { useState, useEffect } from 'react';

interface LifeSanctuaryDimensionProps {
  userState: any;
  sallieState: any;
}

export function LifeSanctuaryDimension({ userState, sallieState }: LifeSanctuaryDimensionProps) {
  const [activeRole, setActiveRole] = useState('mom');
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 'spouse',
      name: 'Partner',
      relationship: 'spouse',
      energy: 85,
      mood: 'loving',
      needs: ['quality time', 'appreciation', 'intimacy'],
      recentInteractions: [
        { type: 'conversation', time: '2 hours ago', content: 'Discussed weekend plans' },
        { type: 'affection', time: '5 hours ago', content: 'Morning hug and coffee' }
      ],
      upcomingEvents: [
        { type: 'date', title: 'Date Night', time: 'Friday 7pm', priority: 'high' },
        { type: 'conversation', title: 'Business Discussion', time: 'Tomorrow 2pm', priority: 'medium' }
      ]
    },
    {
      id: 'children',
      name: 'Children',
      relationship: 'mom',
      energy: 78,
      mood: 'energetic',
      needs: ['attention', 'structure', 'fun'],
      recentInteractions: [
        { type: 'help', time: '1 hour ago', content: 'Helped with homework' },
        { type: 'play', time: '3 hours ago', content: 'Played creative games' }
      ],
      upcomingEvents: [
        { type: 'school', title: 'Parent-Teacher Meeting', time: 'Thursday 3pm', priority: 'high' },
        { type: 'activity', title: 'Soccer Practice', time: 'Tuesday 4pm', priority: 'medium' }
      ]
    },
    {
      id: 'parents',
      name: 'Parents',
      relationship: 'daughter',
      energy: 65,
      mood: 'content',
      needs: ['connection', 'care', 'respect'],
      recentInteractions: [
        { type: 'call', time: '1 day ago', content: 'Weekly check-in call' },
        { type: 'help', time: '3 days ago', content: 'Helped with technology' }
      ],
      upcomingEvents: [
        { type: 'visit', title: 'Family Dinner', time: 'Sunday 5pm', priority: 'medium' },
        { type: 'call', title: 'Weekly Check-in', time: 'Next Monday 6pm', priority: 'low' }
      ]
    },
    {
      id: 'friends',
      name: 'Friends',
      relationship: 'friend',
      energy: 70,
      mood: 'supportive',
      needs: ['connection', 'fun', 'support'],
      recentInteractions: [
        { type: 'coffee', time: '2 days ago', content: 'Coffee with Sarah' },
        { type: 'text', time: '4 days ago', content: 'Group chat planning' }
      ],
      upcomingEvents: [
        { type: 'gathering', title: 'Girls Night Out', time: 'Saturday 7pm', priority: 'medium' },
        { type: 'lunch', title: 'Lunch with Maria', time: 'Wednesday 12pm', priority: 'low' }
      ]
    }
  ]);

  const [familyInsights, setFamilyInsights] = useState([
    'Your spouse has been feeling particularly appreciative lately - perfect time for deep connection',
    'Children\'s energy levels suggest they need more creative outdoor activities',
    'Parents would benefit from more frequent, shorter check-ins rather than weekly calls',
    'Friend Sarah seems to need support - reach out for a deeper conversation',
    'Overall family harmony is at 87% - excellent time for important discussions'
  ]);

  const [rituals, setRituals] = useState([
    {
      id: 'morning',
      name: 'Morning Connection',
      frequency: 'daily',
      participants: ['spouse', 'children'],
      description: 'Family breakfast and intention setting',
      lastCompleted: 'Today',
      streak: 12,
      impact: 'high'
    },
    {
      id: 'evening',
      name: 'Evening Gratitude',
      frequency: 'daily',
      participants: ['all'],
      description: 'Share gratitudes and highlights from the day',
      lastCompleted: 'Yesterday',
      streak: 8,
      impact: 'medium'
    },
    {
      id: 'weekly',
      name: 'Family Adventure',
      frequency: 'weekly',
      participants: ['all'],
      description: 'Explore new places or try new activities together',
      lastCompleted: 'Last Sunday',
      streak: 3,
      impact: 'high'
    }
  ]);

  const getRoleIcon = (role: string) => {
    const icons = {
      mom: '👩‍👧‍👦',
      spouse: '💑',
      daughter: '👨‍👩‍👧',
      friend: '👯‍♀️'
    };
    return icons[role as keyof typeof icons] || '👤';
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'bg-green-500';
    if (energy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMoodEmoji = (mood: string) => {
    const moods = {
      loving: '💕',
      energetic: '⚡',
      content: '😊',
      supportive: '🤗',
      peaceful: '😌'
    };
    return moods[mood as keyof typeof moods] || '😊';
  };

  return (
    <div className="life-sanctuary-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">🏠 Life Sanctuary</h2>
            <p className="text-peacock-600">Your family and relationship harmony center</p>
          </div>
          
          {/* Family Harmony Score */}
          <div className="bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl p-4 border border-peacock-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-peacock-700">87%</div>
              <div className="text-sm text-peacock-600">Family Harmony</div>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex space-x-2">
          {['mom', 'spouse', 'daughter', 'friend'].map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeRole === role
                  ? 'bg-peacock-600 text-white'
                  : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
              }`}
            >
              <span className="mr-2">{getRoleIcon(role)}</span>
              <span className="capitalize">{role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Members Overview */}
        <div className="lg:col-span-2 space-y-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-peacock-400 to-royal-500 flex items-center justify-center text-white font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{member.relationship}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full ${getEnergyColor(member.energy)} mb-1`}></div>
                    <span className="text-xs text-gray-600">{member.energy}%</span>
                  </div>
                  <div className="text-center">
                    <div className="text-lg mb-1">{getMoodEmoji(member.mood)}</div>
                    <span className="text-xs text-gray-600 capitalize">{member.mood}</span>
                  </div>
                </div>
              </div>

              {/* Needs */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Needs</h4>
                <div className="flex flex-wrap gap-2">
                  {member.needs.map((need, index) => (
                    <span key={index} className="px-2 py-1 bg-peacock-100 text-peacock-700 rounded-full text-xs">
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Interactions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Interactions</h4>
                <div className="space-y-1">
                  {member.recentInteractions.slice(0, 2).map((interaction, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-royal-400 rounded-full"></span>
                      <span>{interaction.time}</span>
                      <span>•</span>
                      <span>{interaction.content}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Upcoming</h4>
                <div className="space-y-2">
                  {member.upcomingEvents.slice(0, 2).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{event.title}</span>
                        <span className="text-xs text-gray-500">{event.time}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.priority === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : event.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {event.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Sallie's Family Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Sallie's Family Insights
            </h3>
            <div className="space-y-3">
              {familyInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-peacock-50 to-royal-50 rounded-lg border border-peacock-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Family Rituals */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🕊️</span>
              Family Rituals
            </h3>
            <div className="space-y-3">
              {rituals.map((ritual) => (
                <div key={ritual.id} className="p-3 bg-white rounded-lg border border-peacock-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{ritual.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">🔥 {ritual.streak}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ritual.impact === 'high' 
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-peacock-100 text-peacock-700'
                      }`}>
                        {ritual.impact}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ritual.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{ritual.frequency}</span>
                    <span>Last: {ritual.lastCompleted}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors font-medium">
                Schedule Family Time
              </button>
              <button className="w-full px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors font-medium">
                Send Appreciation Messages
              </button>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                Plan Next Ritual
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
