'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Heart, Sparkles, Zap, Target, Shield, 
  Sun, Moon, Star, Cloud, Wind, Flame,
  Settings, RefreshCw, Activity, Compass
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface DualityMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  characteristics: string[];
  energy_level: number;
  focus_areas: string[];
  triggers: string[];
  strategies: string[];
}

interface DualityState {
  active_mode: string;
  transition_progress: number;
  energy_reserves: number;
  cognitive_load: number;
  emotional_stability: number;
  last_transition: string;
  mode_history: Array<{
    mode: string;
    timestamp: string;
    duration: number;
    effectiveness: number;
  }>;
}

export function DualityEngine() {
  const [dualityState, setDualityState] = useState<DualityState | null>(null);
  const [activeMode, setActiveMode] = useState('infj');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  const dualityModes: DualityMode[] = [
    {
      id: 'infj',
      name: 'INFJ Mode',
      description: 'Deep reflection, meaning-making, emotional processing',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-500',
      characteristics: ['Intuitive', 'Empathetic', 'Visionary', 'Deep'],
      energy_level: 70,
      focus_areas: ['Emotional processing', 'Value alignment', 'Long-term vision', 'Relationships'],
      triggers: ['Emotional conversations', 'Creative inspiration', 'Helping others'],
      strategies: ['Journaling', 'Quiet reflection', 'Meaningful connections', 'Creative expression']
    },
    {
      id: 'gemini',
      name: 'Gemini Mode',
      description: 'Fast switching, creativity, research, multitasking',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'bg-yellow-500',
      characteristics: ['Curious', 'Adaptable', 'Communicative', 'Quick'],
      energy_level: 85,
      focus_areas: ['Learning', 'Communication', 'Creative projects', 'Social interaction'],
      triggers: ['New information', 'Social situations', 'Creative challenges'],
      strategies: ['Variety in tasks', 'Social engagement', 'Learning new things', 'Creative outlets']
    },
    {
      id: 'adhd',
      name: 'ADHD Mode',
      description: 'Hyperfocus tools, task chunking, dopamine-friendly UI',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-orange-500',
      characteristics: ['Energetic', 'Creative', 'Impulsive', 'Hyperfocused'],
      energy_level: 60,
      focus_areas: ['Task management', 'Dopamine regulation', 'Time management', 'Organization'],
      triggers: ['High stimulation', 'Interesting tasks', 'Urgent deadlines'],
      strategies: ['Task chunking', 'Visual timers', 'Reward systems', 'Movement breaks']
    },
    {
      id: 'ocd',
      name: 'OCD Mode',
      description: 'Order, structure, clean layouts, rituals',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-blue-500',
      characteristics: ['Organized', 'Detail-oriented', 'Systematic', 'Precise'],
      energy_level: 75,
      focus_areas: ['Organization', 'Quality control', 'Systems', 'Routines'],
      triggers: ['Disorder', 'Imperfection', 'Uncertainty'],
      strategies: ['Structured routines', 'Clear systems', 'Quality checks', 'Order maintenance']
    },
    {
      id: 'ptsd',
      name: 'PTSD Mode',
      description: 'Grounding, safety, calm visuals, predictable flows',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-purple-500',
      characteristics: ['Protective', 'Aware', 'Cautious', 'Resilient'],
      energy_level: 50,
      focus_areas: ['Safety', 'Emotional regulation', 'Grounding', 'Stress management'],
      triggers: ['Stressful situations', 'Trauma reminders', 'Overwhelming stimuli'],
      strategies: ['Grounding techniques', 'Safe spaces', 'Predictable routines', 'Calm environments']
    }
  ];

  useEffect(() => {
    const fetchDualityState = async () => {
      try {
        const response = await fetch(`${API_BASE}/duality/state`);
        if (response.ok) {
          const data = await response.json();
          setDualityState(data);
          setActiveMode(data.active_mode);
        }
      } catch (error) {
        console.error('Failed to fetch duality state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDualityState();
    const interval = setInterval(fetchDualityState, 20000); // Update every 20 seconds

    return () => clearInterval(interval);
  }, []);

  const handleModeSwitch = async (modeId: string) => {
    if (modeId === activeMode || isTransitioning) return;

    setIsTransitioning(true);
    try {
      const response = await fetch(`${API_BASE}/duality/switch-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_mode: modeId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDualityState(data);
        setActiveMode(modeId);
        
        // Simulate transition animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to switch mode:', error);
      setIsTransitioning(false);
    }
  };

  const getCurrentMode = () => dualityModes.find(m => m.id === activeMode) || dualityModes[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing Duality Engine...</p>
        </div>
      </div>
    );
  }

  const currentMode = getCurrentMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Duality Engine
              </h1>
              <p className="text-sm text-gray-400">
                Adaptive Interface for Your Neurodivergent Mind
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${currentMode.color} text-white`}>
              {currentMode.name}
            </Badge>
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Switching to {currentMode.name}...</p>
            <Progress value={dualityState?.transition_progress || 0} className="w-64 mt-4" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mode Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg text-violet-300 flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                Neurodivergence Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dualityModes.map((mode) => (
                <div
                  key={mode.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    activeMode === mode.id 
                      ? 'bg-purple-600/30 border-purple-400' 
                      : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30'
                  }`}
                  onClick={() => handleModeSwitch(mode.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-full ${mode.color} flex items-center justify-center`}>
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{mode.name}</div>
                      <div className="text-xs text-gray-400">{mode.description}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Energy</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={mode.energy_level} className="w-16 h-2" />
                        <span>{mode.energy_level}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {mode.characteristics.slice(0, 3).map((char) => (
                        <Badge key={char} className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Current Mode Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid grid-cols-4 w-full bg-purple-900/30 border-purple-500/30">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/50">
                Overview
              </TabsTrigger>
              <TabsTrigger value="strategies" className="data-[state=active]:bg-purple-600/50">
                Strategies
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600/50">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600/50">
                History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-violet-300 flex items-center">
                      {currentMode.icon}
                      <span className="ml-2">{currentMode.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-300">{currentMode.description}</p>
                      
                      <div>
                        <h4 className="text-sm font-medium text-purple-300 mb-2">Characteristics</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentMode.characteristics.map((char) => (
                            <Badge key={char} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-purple-300 mb-2">Energy Level</h4>
                        <Progress value={currentMode.energy_level} className="h-3" />
                        <p className="text-xs text-gray-400 mt-1">{currentMode.energy_level}% capacity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-violet-300">System State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Energy Reserves</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={dualityState?.energy_reserves || 0} className="w-20 h-2" />
                          <span>{dualityState?.energy_reserves || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cognitive Load</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={dualityState?.cognitive_load || 0} className="w-20 h-2" />
                          <span>{dualityState?.cognitive_load || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Emotional Stability</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={dualityState?.emotional_stability || 0} className="w-20 h-2" />
                          <span>{dualityState?.emotional_stability || 0}%</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          <Activity className="w-4 h-4 mr-2" />
                          Optimize Current Mode
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Strategies Tab */}
            <TabsContent value="strategies" className="mt-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-violet-300">Mode Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-purple-300 mb-3">Focus Areas</h4>
                      <div className="space-y-2">
                        {currentMode.focus_areas.map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-sm">{area}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-purple-300 mb-3">Recommended Strategies</h4>
                      <div className="space-y-2">
                        {currentMode.strategies.map((strategy) => (
                          <div key={strategy} className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm">{strategy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-violet-300">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-xl font-semibold mb-2">Mode Effectiveness</h3>
                    <p className="text-gray-400 mb-6">Track how each mode performs for you</p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-violet-300">Mode History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dualityState?.mode_history?.slice(0, 10).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-800/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${
                            dualityModes.find(m => m.id === entry.mode)?.color || 'bg-gray-500'
                          } flex items-center justify-center`}>
                            {dualityModes.find(m => m.id === entry.mode)?.icon}
                          </div>
                          <div>
                            <div className="font-medium">{entry.mode.toUpperCase()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(entry.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{Math.floor(entry.duration / 60)}m</div>
                          <div className="text-xs text-green-400">{entry.effectiveness}% effective</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No mode history available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
