'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Target, Briefcase, BookOpen, Zap, Heart,
  Settings, Download, Upload, Sync, Cloud, Database,
  Clock, TrendingUp, Users, FileText, CheckCircle, AlertCircle
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface LifeOSModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  last_updated: string;
  sync_status: 'synced' | 'syncing' | 'error';
}

interface LifeOSState {
  total_items: number;
  storage_used: number;
  storage_limit: number;
  last_sync: string;
  sync_progress: number;
  active_automations: number;
  completed_tasks: number;
  upcoming_events: number;
  health_score: number;
}

export function LifeOS() {
  const [lifeOSState, setLifeOSState] = useState<LifeOSState | null>(null);
  const [modules, setModules] = useState<LifeOSModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const lifeOSModules: LifeOSModule[] = [
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Events, appointments, and schedules',
      icon: <Calendar className="w-6 h-6" />,
      count: 24,
      color: 'bg-blue-500',
      last_updated: '2 minutes ago',
      sync_status: 'synced'
    },
    {
      id: 'tasks',
      name: 'Tasks',
      description: 'To-do items and action items',
      icon: <Target className="w-6 h-6" />,
      count: 47,
      color: 'bg-green-500',
      last_updated: '5 minutes ago',
      sync_status: 'synced'
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Active and archived projects',
      icon: <Briefcase className="w-6 h-6" />,
      count: 8,
      color: 'bg-purple-500',
      last_updated: '1 hour ago',
      sync_status: 'synced'
    },
    {
      id: 'notes',
      name: 'Notes',
      description: 'Thoughts, ideas, and documentation',
      icon: <BookOpen className="w-6 h-6" />,
      count: 156,
      color: 'bg-yellow-500',
      last_updated: '30 minutes ago',
      sync_status: 'synced'
    },
    {
      id: 'automations',
      name: 'Automations',
      description: 'Workflows and automated processes',
      icon: <Zap className="w-6 h-6" />,
      count: 12,
      color: 'bg-orange-500',
      last_updated: 'Just now',
      sync_status: 'synced'
    },
    {
      id: 'memories',
      name: 'Memories',
      description: 'Shared experiences and milestones',
      icon: <Heart className="w-6 h-6" />,
      count: 89,
      color: 'bg-pink-500',
      last_updated: '3 hours ago',
      sync_status: 'synced'
    }
  ];

  useEffect(() => {
    const fetchLifeOSState = async () => {
      try {
        const response = await fetch(`${API_BASE}/lifeos/state`);
        if (response.ok) {
          const data = await response.json();
          setLifeOSState(data);
        }
      } catch (error) {
        console.error('Failed to fetch LifeOS state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeOSState();
    setModules(lifeOSModules);
    
    const interval = setInterval(fetchLifeOSState, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${API_BASE}/lifeos/sync`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLifeOSState(data);
        
        // Update module sync status
        setModules(prev => prev.map(module => ({
          ...module,
          sync_status: 'syncing'
        })));
        
        // Simulate sync completion
        setTimeout(() => {
          setModules(prev => prev.map(module => ({
            ...module,
            sync_status: 'synced',
            last_updated: 'Just now'
          })));
          setSyncing(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to sync LifeOS:', error);
      setSyncing(false);
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'syncing': return <Sync className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing LifeOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                LifeOS
              </h1>
              <p className="text-sm text-gray-400">
                Complete Life Management System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
              onClick={handleSync}
              disabled={syncing}
            >
              <Sync className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync All'}
            </Button>
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      {lifeOSState && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Items</p>
                  <p className="text-2xl font-bold text-violet-400">{lifeOSState.total_items}</p>
                </div>
                <Database className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-violet-400">
                    {formatStorage(lifeOSState.storage_used)}
                  </p>
                </div>
                <Cloud className="w-8 h-8 text-purple-400" />
              </div>
              <Progress 
                value={(lifeOSState.storage_used / lifeOSState.storage_limit) * 100} 
                className="mt-2 h-2" 
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Health Score</p>
                  <p className="text-2xl font-bold text-violet-400">{lifeOSState.health_score}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <Progress value={lifeOSState.health_score} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Last Sync</p>
                  <p className="text-sm font-medium text-violet-400">
                    {new Date(lifeOSState.last_sync).toLocaleTimeString()}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-violet-300 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${module.color} flex items-center justify-center mr-3`}>
                        {module.icon}
                      </div>
                      <span>{module.name}</span>
                    </div>
                    {getSyncStatusIcon(module.sync_status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400">{module.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Items</span>
                      <span className="text-lg font-semibold text-violet-400">{module.count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Updated</span>
                      <span className="text-xs text-gray-300">{module.last_updated}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 flex-1">
                        <FileText className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Active Automations</span>
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      {lifeOSState?.active_automations || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Completed Today</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {lifeOSState?.completed_tasks || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Upcoming Events</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {lifeOSState?.upcoming_events || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Task completed', time: '2 min ago', icon: <CheckCircle className="w-4 h-4 text-green-400" /> },
                    { action: 'New automation created', time: '15 min ago', icon: <Zap className="w-4 h-4 text-orange-400" /> },
                    { action: 'Calendar event added', time: '1 hour ago', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
                    { action: 'Note updated', time: '2 hours ago', icon: <BookOpen className="w-4 h-4 text-yellow-400" /> },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {activity.icon}
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300">System Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                    <Users className="w-4 h-4 mr-2" />
                    Share Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
