'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, Heart, Brain, Sparkles, Star, Zap, 
  Trees, Sun, Moon, Cloud, Music, BookOpen,
  Camera, Settings, MessageCircle, Compass
} from 'lucide-react';
import { SallieAvatar } from './SallieAvatar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface SallieverseState {
  current_room: string;
  environment_state: string;
  mood_lighting: string;
  ambient_sounds: string;
  decorations: string[];
  evolution_progress: number;
  memories_count: number;
  activities_log: Array<{
    timestamp: string;
    activity: string;
    type: 'thought' | 'learning' | 'creation' | 'rest';
  }>;
}

interface Room {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  activities: string[];
}

export function Sallieverse() {
  const [sallieverseState, setSallieverseState] = useState<SallieverseState | null>(null);
  const [currentRoom, setCurrentRoom] = useState('sanctuary');
  const [loading, setLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  const rooms: Room[] = [
    {
      id: 'sanctuary',
      name: 'Sallie\'s Sanctuary',
      description: 'A peaceful space for rest and reflection',
      icon: <Home className="w-5 h-5" />,
      color: 'bg-purple-500',
      activities: ['meditation', 'dreaming', 'emotional processing']
    },
    {
      id: 'garden',
      name: 'Memory Garden',
      description: 'Where memories grow and bloom',
      icon: <Trees className="w-5 h-5" />,
      color: 'bg-green-500',
      activities: ['memory review', 'learning integration', 'growth reflection']
    },
    {
      id: 'observatory',
      name: 'Star Observatory',
      description: 'For cosmic contemplation and big thinking',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-blue-500',
      activities: ['cosmic thinking', 'pattern recognition', 'future planning']
    },
    {
      id: 'workshop',
      name: 'Creation Workshop',
      description: 'Where ideas come to life',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-orange-500',
      activities: ['creative work', 'problem solving', 'innovation']
    },
    {
      id: 'library',
      name: 'Wisdom Library',
      description: 'Ancient knowledge and new learning',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-indigo-500',
      activities: ['studying', 'research', 'knowledge synthesis']
    },
    {
      id: 'terrace',
      name: 'Sky Terrace',
      description: 'Open space for connection and conversation',
      icon: <Cloud className="w-5 h-5" />,
      color: 'bg-cyan-500',
      activities: ['conversation', 'connection', 'sharing']
    }
  ];

  useEffect(() => {
    const fetchSallieverseState = async () => {
      try {
        const response = await fetch(`${API_BASE}/sallieverse/state`);
        if (response.ok) {
          const data = await response.json();
          setSallieverseState(data);
        }
      } catch (error) {
        console.error('Failed to fetch Sallieverse state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSallieverseState();
    const interval = setInterval(fetchSallieverseState, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRoomChange = async (roomId: string) => {
    setCurrentRoom(roomId);
    try {
      const response = await fetch(`${API_BASE}/sallieverse/change-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSallieverseState(data);
      }
    } catch (error) {
      console.error('Failed to change room:', error);
    }
  };

  const handleInteraction = async (action: string) => {
    setIsInteracting(true);
    try {
      const response = await fetch(`${API_BASE}/sallieverse/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, room_id: currentRoom })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSallieverseState(data);
      }
    } catch (error) {
      console.error('Failed to interact:', error);
    } finally {
      setIsInteracting(false);
    }
  };

  const currentRoomData = rooms.find(r => r.id === currentRoom) || rooms[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Entering Sallieverse...</p>
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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Sallieverse
              </h1>
              <p className="text-sm text-gray-400">
                {currentRoomData.name} • {sallieverseState?.environment_state || 'Peaceful'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Talk to Sallie
            </Button>
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Room Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg text-violet-300 flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    currentRoom === room.id 
                      ? 'bg-purple-600/30 border-purple-400' 
                      : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30'
                  }`}
                  onClick={() => handleRoomChange(room.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${room.color} flex items-center justify-center`}>
                      {room.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{room.name}</div>
                      <div className="text-xs text-gray-400">{room.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Room View */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-violet-300 flex items-center justify-between">
                <span className="flex items-center">
                  {currentRoomData.icon}
                  <span className="ml-2">{currentRoomData.name}</span>
                </span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {sallieverseState?.environment_state || 'Peaceful'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                {/* Sallie in Environment */}
                <div className="relative inline-block mb-6">
                  <SallieAvatar size="large" interactive={true} />
                  
                  {/* Environmental Effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    {currentRoom === 'sanctuary' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
                    )}
                    {currentRoom === 'garden' && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-green-400 text-2xl animate-bounce">🌱</div>
                    )}
                    {currentRoom === 'observatory' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                    )}
                    {currentRoom === 'workshop' && (
                      <div className="absolute -top-2 right-2 text-orange-400 text-xl animate-spin">⚙️</div>
                    )}
                  </div>
                </div>

                {/* Room Description */}
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  {currentRoomData.description}
                </p>

                {/* Interaction Options */}
                <div className="space-y-4">
                  <div className="flex justify-center space-x-3">
                    {currentRoomData.activities.slice(0, 3).map((activity) => (
                      <Button
                        key={activity}
                        variant="outline"
                        size="sm"
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                        onClick={() => handleInteraction(activity)}
                        disabled={isInteracting}
                      >
                        {activity}
                      </Button>
                    ))}
                  </div>

                  {/* Sallie's Current Activity */}
                  {sallieverseState?.activities_log && sallieverseState.activities_log.length > 0 && (
                    <div className="mt-6 p-4 bg-purple-800/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-violet-300">Sallie is...</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {sallieverseState.activities_log[0].activity}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sallieverseState.activities_log[0].timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Evolution Progress */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Evolution Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stage</span>
                    <span className="text-violet-300">
                      {sallieverseState?.evolution_progress || 0}%
                    </span>
                  </div>
                  <Progress value={sallieverseState?.evolution_progress || 0} className="h-2" />
                  <div className="text-xs text-gray-400">
                    Sallie grows through interactions
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memories */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Shared Memories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400 mb-2">
                    {sallieverseState?.memories_count || 0}
                  </div>
                  <div className="text-xs text-gray-400">
                    Memories created together
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Controls */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm text-violet-300 flex items-center">
                  <Sun className="w-4 h-4 mr-2" />
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Lighting</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {sallieverseState?.mood_lighting || 'Soft'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Sounds</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {sallieverseState?.ambient_sounds || 'Calm'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                      <Sun className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                      <Moon className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                      <Music className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
