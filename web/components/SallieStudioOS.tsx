'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Heart, Home, User, Briefcase, Users, Sparkles, 
  Settings, MessageCircle, Activity, Calendar, Star, Zap,
  Palette, Music, BookOpen, Target, Lightbulb, Compass
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface LifeRole {
  id: string;
  name: string;
  icon: React.ReactNode;
  tasks: number;
  priority: 'high' | 'medium' | 'low';
  energy: number;
  color: string;
}

interface SallieState {
  limbic_variables: Record<string, number>;
  cognitive_state: string;
  trust_tier: string;
  dynamic_posture: string;
  emotional_state: string;
}

export function SallieStudioOS() {
  const [activeRole, setActiveRole] = useState<string>('mom');
  const [sallieState, setSallieState] = useState<SallieState | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const lifeRoles: LifeRole[] = [
    { id: 'mom', name: 'Mom', icon: <Heart className="w-4 h-4" />, tasks: 12, priority: 'high', energy: 85, color: 'bg-pink-500' },
    { id: 'spouse', name: 'Spouse', icon: <Heart className="w-4 h-4" />, tasks: 8, priority: 'high', energy: 75, color: 'bg-rose-500' },
    { id: 'entrepreneur', name: 'Entrepreneur', icon: <Briefcase className="w-4 h-4" />, tasks: 15, priority: 'high', energy: 60, color: 'bg-purple-500' },
    { id: 'creator', name: 'Creator', icon: <Sparkles className="w-4 h-4" />, tasks: 6, priority: 'medium', energy: 90, color: 'bg-indigo-500' },
    { id: 'friend', name: 'Friend', icon: <Users className="w-4 h-4" />, tasks: 4, priority: 'medium', energy: 70, color: 'bg-blue-500' },
    { id: 'daughter', name: 'Daughter', icon: <User className="w-4 h-4" />, tasks: 3, priority: 'low', energy: 80, color: 'bg-green-500' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/limbic`);
        if (response.ok) {
          const data = await response.json();
          setSallieState(data);
        }
      } catch (error) {
        console.error('Failed to fetch Sallie state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getLimbicColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Sallie Studio OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Sallie Studio OS
              </h1>
              <p className="text-sm text-gray-400">
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Sallie's State Bar */}
        {sallieState && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-violet-400" />
                    <span className="text-sm">Posture: {sallieState.dynamic_posture}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-sm">State: {sallieState.emotional_state}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm">Trust: {sallieState.trust_tier}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {Object.entries(sallieState.limbic_variables).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 capitalize">{key}:</span>
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getLimbicColor(value)} transition-all duration-300`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Life Roles Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg text-violet-300 flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                Life Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lifeRoles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    activeRole === role.id 
                      ? 'bg-purple-600/30 border-purple-400' 
                      : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30'
                  }`}
                  onClick={() => setActiveRole(role.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${role.color} flex items-center justify-center`}>
                        {role.icon}
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <Badge className={getPriorityColor(role.priority)}>
                      {role.priority}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tasks</span>
                      <span>{role.tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Energy</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={role.energy} className="w-16 h-2" />
                        <span>{role.energy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="dashboard" className="h-full">
            <TabsList className="grid grid-cols-5 w-full bg-purple-900/30 border-purple-500/30">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600/50">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="sallieverse" className="data-[state=active]:bg-purple-600/50">
                <Sparkles className="w-4 h-4 mr-2" />
                Sallieverse
              </TabsTrigger>
              <TabsTrigger value="messenger" className="data-[state=active]:bg-purple-600/50">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messenger
              </TabsTrigger>
              <TabsTrigger value="duality" className="data-[state=active]:bg-purple-600/50">
                <Brain className="w-4 h-4 mr-2" />
                Duality
              </TabsTrigger>
              <TabsTrigger value="lifeos" className="data-[state=active]:bg-purple-600/50">
                <Target className="w-4 h-4 mr-2" />
                LifeOS
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Role Details */}
                <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-violet-300">
                      {lifeRoles.find(r => r.id === activeRole)?.name} Workspace
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Active Tasks</span>
                        <span className="text-2xl font-bold text-violet-400">
                          {lifeRoles.find(r => r.id === activeRole)?.tasks}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Energy Level</span>
                        <Progress value={lifeRoles.find(r => r.id === activeRole)?.energy} className="w-32" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Priority</span>
                        <Badge className={getPriorityColor(lifeRoles.find(r => r.id === activeRole)?.priority || 'medium')}>
                          {lifeRoles.find(r => r.id === activeRole)?.priority}
                        </Badge>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                        <Zap className="w-4 h-4 mr-2" />
                        Let Sallie Handle It
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-violet-300">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        <Activity className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Ideas
                      </Button>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sallieverse Tab */}
            <TabsContent value="sallieverse" className="mt-6">
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Sallie's World</h3>
                <p className="text-gray-400 mb-6">An immersive 3D environment where Sallie lives and grows</p>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  Enter Sallieverse
                </Button>
              </div>
            </TabsContent>

            {/* Messenger Tab */}
            <TabsContent value="messenger" className="mt-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-violet-300 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Messenger Mirror
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 mx-auto mb-6 text-violet-400" />
                    <h3 className="text-xl font-semibold mb-2">Private Communication</h3>
                    <p className="text-gray-400 mb-6">Your private channel with Sallie - text, voice, and video</p>
                    <div className="flex justify-center space-x-3">
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        Start Chat
                      </Button>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        Voice Call
                      </Button>
                      <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                        Video Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Duality Tab */}
            <TabsContent value="duality" className="mt-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-violet-300 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Duality Engine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { mode: 'INFJ', icon: <Heart className="w-6 h-6" />, color: 'bg-pink-500' },
                      { mode: 'Gemini', icon: <Sparkles className="w-6 h-6" />, color: 'bg-yellow-500' },
                      { mode: 'ADHD', icon: <Zap className="w-6 h-6" />, color: 'bg-orange-500' },
                      { mode: 'OCD', icon: <Target className="w-6 h-6" />, color: 'bg-blue-500' },
                      { mode: 'PTSD', icon: <Brain className="w-6 h-6" />, color: 'bg-purple-500' },
                    ].map(({ mode, icon, color }) => (
                      <div key={mode} className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-2 rounded-full ${color} flex items-center justify-center`}>
                          {icon}
                        </div>
                        <span className="text-sm">{mode}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 mb-4">Adaptive interface for your neurodivergent mind</p>
                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      Activate Mode Switching
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LifeOS Tab */}
            <TabsContent value="lifeos" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Calendar', icon: <Calendar className="w-8 h-8" />, count: 24 },
                  { title: 'Tasks', icon: <Target className="w-8 h-8" />, count: 47 },
                  { title: 'Projects', icon: <Briefcase className="w-8 h-8" />, count: 8 },
                  { title: 'Notes', icon: <BookOpen className="w-8 h-8" />, count: 156 },
                  { title: 'Automations', icon: <Zap className="w-8 h-8" />, count: 12 },
                  { title: 'Memories', icon: <Heart className="w-8 h-8" />, count: 89 },
                ].map(({ title, icon, count }) => (
                  <div key={title} className="text-center p-4 bg-purple-800/20 rounded-lg border border-purple-500/30">
                    <div className="text-violet-400 mb-2">{icon}</div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-400">{title}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  Open LifeOS
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
