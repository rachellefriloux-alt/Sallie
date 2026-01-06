'use client';

import React, { useState, useEffect } from 'react';

interface CommandMatrixDimensionProps {
  userState: any;
  sallieState: any;
}

export function CommandMatrixDimension({ userState, sallieState }: CommandMatrixDimensionProps) {
  const [activeBusiness, setActiveBusiness] = useState('service');
  const [businesses, setBusinesses] = useState([
    {
      id: 'service',
      name: 'Service Business',
      type: 'service',
      revenue: 12500,
      expenses: 3200,
      clients: 28,
      growth: 15,
      energy: 92,
      automation: 75,
      nextMilestone: '50K Monthly Revenue',
      kpis: {
        clientSatisfaction: 94,
        projectCompletion: 88,
        newClients: 4,
        retention: 92
      },
      tasks: [
        { title: 'Client Proposal - Tech Corp', priority: 'high', deadline: 'Today 5pm', automated: false },
        { title: 'Team Meeting - Q4 Planning', priority: 'medium', deadline: 'Tomorrow 10am', automated: true },
        { title: 'Invoice Processing', priority: 'low', deadline: 'Weekly', automated: true }
      ],
      opportunities: [
        { title: 'Enterprise Contract - Global Inc', value: 75000, probability: 75 },
        { title: 'Partnership - Startup Hub', value: 25000, probability: 60 },
        { title: 'Product Line Extension', value: 15000, probability: 85 }
      ]
    },
    {
      id: 'entrepreneurial',
      name: 'Entrepreneurial Ventures',
      type: 'multiple',
      revenue: 8500,
      expenses: 1200,
      projects: 6,
      growth: 25,
      energy: 88,
      automation: 60,
      nextMilestone: 'Passive Income Stream',
      kpis: {
        projectCompletion: 72,
        innovationRate: 85,
        marketValidation: 78,
        scalability: 65
      },
      tasks: [
        { title: 'Market Research - New Product', priority: 'high', deadline: 'Friday', automated: false },
        { title: 'Investor Pitch Preparation', priority: 'high', deadline: 'Next Week', automated: false },
        { title: 'Social Media Content', priority: 'medium', deadline: 'Daily', automated: true }
      ],
      opportunities: [
        { title: 'AI Platform Launch', value: 150000, probability: 70 },
        { title: 'Eco-Product Line', value: 45000, probability: 80 },
        { title: 'Consulting Program', value: 35000, probability: 65 }
      ]
    }
  ]);

  const [automationSystems, setAutomationSystems] = useState([
    {
      id: 'client-management',
      name: 'Client Relationship Management',
      status: 'active',
      efficiency: 85,
      tasksAutomated: 45,
      timeSaved: '12 hours/week',
      accuracy: 94
    },
    {
      id: 'financial',
      name: 'Financial Processing',
      status: 'active',
      efficiency: 92,
      tasksAutomated: 78,
      timeSaved: '8 hours/week',
      accuracy: 99
    },
    {
      id: 'marketing',
      name: 'Marketing Automation',
      status: 'optimizing',
      efficiency: 73,
      tasksAutomated: 60,
      timeSaved: '6 hours/week',
      accuracy: 87
    },
    {
      id: 'project-management',
      name: 'Project Management',
      status: 'learning',
      efficiency: 65,
      tasksAutomated: 35,
      timeSaved: '4 hours/week',
      accuracy: 91
    }
  ]);

  const [sallieInsights, setSallieInsights] = useState([
    'Your service business shows 23% growth potential - focus on enterprise clients',
    'Automation systems can save 30+ hours weekly - prioritize financial and client management',
    'Entrepreneurial ventures need market validation - start with AI platform MVP',
    'Energy patterns show peak creativity 9-11 AM - schedule important decisions then',
    'Revenue projections indicate 50K monthly achievable within 4 months with current strategy'
  ]);

  const getRevenueColor = (revenue: number) => {
    if (revenue >= 20000) return 'text-green-600';
    if (revenue >= 10000) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const currentBusiness = businesses.find(b => b.id === activeBusiness) || businesses[0];

  return (
    <div className="command-matrix-dimension h-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-peacock-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-peacock-900 mb-2">💼 Command Matrix</h2>
            <p className="text-peacock-600">Business intelligence and automation command center</p>
          </div>
          
          {/* Total Revenue Display */}
          <div className="bg-gradient-to-r from-gold-100 to-yellow-100 rounded-xl p-4 border border-gold-200">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRevenueColor(currentBusiness.revenue)}`}>
                ${currentBusiness.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gold-700">Monthly Revenue</div>
            </div>
          </div>
        </div>

        {/* Business Selector */}
        <div className="flex space-x-2">
          {businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => setActiveBusiness(business.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeBusiness === business.id
                  ? 'bg-royal-600 text-white'
                  : 'bg-white text-royal-700 hover:bg-royal-100 border border-royal-200'
              }`}
            >
              {business.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Dashboard */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentBusiness.kpis).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-royal-600">{value}%</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tasks */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Active Tasks</h3>
            <div className="space-y-3">
              {currentBusiness.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.automated}
                      readOnly
                      className="w-4 h-4 text-royal-600 rounded focus:ring-royal-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.automated && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Auto
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities Pipeline */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Opport Pipeline</h3>
            <div className="space-y-3">
              {currentBusiness.opportunities.map((opportunity, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-gold-50 to-yellow-50 rounded-lg border border-gold-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{opportunity.title}</h4>
                    <span className="text-lg font-bold text-gold-700">
                      ${opportunity.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Probability: {opportunity.probability}%</span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gold-600 text-white rounded-lg text-sm">Pursue</button>
                      <button className="px-3 py-1 bg-royal-600 text-white rounded-lg text-sm">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Automation Systems */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              Automation Systems
            </h3>
            <div className="space-y-3">
              {automationSystems.map((system) => (
                <div key={system.id} className="p-3 bg-white rounded-lg border border-peacock-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">{system.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      system.status === 'active' 
                        ? 'bg-green-100 text-green-700'
                        : system.status === 'optimizing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {system.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className="font-medium">{system.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Saved:</span>
                      <span className="font-medium">{system.timeSaved}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sallie's Business Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4 flex items-center">
              <span className="mr-2">🧠</span>
              Sallie's Business Intelligence
            </h3>
            <div className="space-y-3">
              {sallieInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-royal-50 to-peacock-50 rounded-lg border border-royal-200">
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-royal-100 to-peacock-100 rounded-xl p-6 border border-royal-200">
            <h3 className="text-lg font-semibold text-royal-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors font-medium">
                Generate Business Report
              </button>
              <button className="w-full px-4 py-2 bg-peacock-600 text-white rounded-lg hover:bg-peacock-700 transition-colors font-medium">
                Optimize Automation
              </button>
              <button className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors font-medium">
                Scale Operations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
