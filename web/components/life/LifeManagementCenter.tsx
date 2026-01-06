'use client';

import React, { useState } from 'react';

interface Role {
  id: string;
  name: string;
  icon: string;
  color: string;
  tasks: number;
  priority: 'high' | 'medium' | 'low';
}

interface LifeManagementCenterProps {
  className?: string;
}

export function LifeManagementCenter({ className = '' }: LifeManagementCenterProps) {
  const [selectedRole, setSelectedRole] = useState<string>('mom');
  const [activeView, setActiveView] = useState<'overview' | 'schedule' | 'tasks'>('overview');

  const roles: Role[] = [
    { id: 'mom', name: 'Mom', icon: '👩‍👧‍👦', color: 'bg-pink-100 border-pink-300', tasks: 8, priority: 'high' },
    { id: 'spouse', name: 'Spouse', icon: '💑', color: 'bg-rose-100 border-rose-300', tasks: 5, priority: 'high' },
    { id: 'friend', name: 'Friend', icon: '👯‍♀️', color: 'bg-purple-100 border-purple-300', tasks: 3, priority: 'medium' },
    { id: 'daughter', name: 'Daughter', icon: '👨‍👩‍👧', color: 'bg-blue-100 border-blue-300', tasks: 4, priority: 'medium' },
    { id: 'business', name: 'Business Owner', icon: '💼', color: 'bg-royal-100 border-royal-300', tasks: 12, priority: 'high' }
  ];

  const scheduleItems = [
    { time: '8:00 AM', role: 'mom', task: 'Morning routine with kids', priority: 'high' },
    { time: '9:30 AM', role: 'business', task: 'Team standup meeting', priority: 'high' },
    { time: '11:00 AM', role: 'business', task: 'Client project review', priority: 'medium' },
    { time: '2:00 PM', role: 'mom', task: 'School pickup', priority: 'high' },
    { time: '3:30 PM', role: 'friend', task: 'Coffee with Sarah', priority: 'low' },
    { time: '6:00 PM', role: 'spouse', task: 'Dinner together', priority: 'high' },
    { time: '8:00 PM', role: 'daughter', task: 'Call parents', priority: 'medium' }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getRoleById = (roleId: string) => roles.find(role => role.id === roleId);

  return (
    <div className={`life-management-center bg-gradient-to-br from-sand-50 to-peacock-50 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-peacock-900 mb-2">Life Management Center</h1>
          <p className="text-peacock-600">Organize and balance all your important roles</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'overview' 
                ? 'bg-peacock-600 text-white' 
                : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('schedule')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'schedule' 
                ? 'bg-peacock-600 text-white' 
                : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'tasks' 
                ? 'bg-peacock-600 text-white' 
                : 'bg-white text-peacock-700 hover:bg-peacock-100 border border-peacock-200'
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles Grid */}
          <div>
            <h2 className="text-lg font-semibold text-peacock-800 mb-4">Your Roles</h2>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? `${role.color} border-current shadow-lg`
                      : 'bg-white border-peacock-200 hover:border-peacock-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{role.name}</h3>
                        <p className="text-sm text-gray-600">{role.tasks} active tasks</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(role.priority)}`}>
                      {role.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Details */}
          <div>
            <h2 className="text-lg font-semibold text-peacock-800 mb-4">
              {getRoleById(selectedRole)?.name} Details
            </h2>
            <div className="bg-white rounded-xl p-6 border border-peacock-200">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{getRoleById(selectedRole)?.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{getRoleById(selectedRole)?.name}</h3>
                  <p className="text-sm text-gray-600">Managing {getRoleById(selectedRole)?.tasks} responsibilities</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-peacock-50 rounded-lg">
                  <p className="text-sm font-medium text-peacock-800 mb-1">Sallie's Insight</p>
                  <p className="text-sm text-gray-700">
                    You've been excelling in this role! Your energy levels are highest when handling these tasks. 
                    Consider scheduling important {getRoleById(selectedRole)?.name} activities in the morning.
                  </p>
                </div>

                <div className="p-3 bg-royal-50 rounded-lg">
                  <p className="text-sm font-medium text-royal-800 mb-1">Recommended Action</p>
                  <p className="text-sm text-gray-700">
                    Schedule dedicated time blocks for this role to reduce context switching and improve focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="bg-white rounded-xl border border-peacock-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-peacock-800 mb-4">Today's Schedule</h2>
            <div className="space-y-2">
              {scheduleItems.map((item, index) => {
                const role = getRoleById(item.role);
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-20 text-sm font-medium text-gray-600">{item.time}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${role?.color}`}>
                      {role?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.task}</p>
                      <p className="text-sm text-gray-600 capitalize">{item.role}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tasks View */}
      {activeView === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['high', 'medium', 'low'].map((priority) => (
            <div key={priority} className="bg-white rounded-xl border border-peacock-200">
              <div className={`p-4 ${getPriorityColor(priority)} rounded-t-xl`}>
                <h3 className="font-semibold capitalize">{priority} Priority</h3>
              </div>
              <div className="p-4 space-y-3">
                {roles
                  .filter(role => role.priority === priority)
                  .map(role => (
                    <div key={role.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{role.icon}</span>
                        <span className="font-medium text-gray-800">{role.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {role.tasks} tasks need attention
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sallie's Assistant Panel */}
      <div className="mt-6 bg-gradient-to-r from-peacock-600 to-royal-600 rounded-xl p-4 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h3 className="font-semibold">Sallie's Life Assistant</h3>
            <p className="text-sm opacity-90">
              I can help you organize your schedule, remind you of important tasks, and suggest better work-life balance strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
