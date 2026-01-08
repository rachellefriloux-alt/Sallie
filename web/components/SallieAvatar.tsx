'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Brain, Sparkles, Star, Zap, Palette, 
  Settings, RefreshCw, Camera, Music, BookOpen
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

interface AvatarState {
  current_form: string;
  emotional_state: string;
  energy_level: number;
  evolution_stage: number;
  customization_options: string[];
  last_change: string;
}

interface AvatarCustomization {
  species: string;
  colors: string[];
  accessories: string[];
  animations: string[];
  backgrounds: string[];
}

export function SallieAvatar({ size = 'medium', interactive = true }: { size?: 'small' | 'medium' | 'large', interactive?: boolean }) {
  const [avatarState, setAvatarState] = useState<AvatarState | null>(null);
  const [customization, setCustomization] = useState<AvatarCustomization | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-64 h-64'
  };

  const avatarForms = [
    { id: 'peacock', name: 'Peacock', icon: '🦚', colors: ['emerald', 'blue', 'purple'] },
    { id: 'phoenix', name: 'Phoenix', icon: '🔥', colors: ['red', 'orange', 'gold'] },
    { id: 'dragon', name: 'Dragon', icon: '🐉', colors: ['purple', 'indigo', 'silver'] },
    { id: 'unicorn', name: 'Unicorn', icon: '🦄', colors: ['white', 'pink', 'rainbow'] },
    { id: 'crystal', name: 'Crystal', icon: '💎', colors: ['cyan', 'blue', 'clear'] },
    { id: 'cosmic', name: 'Cosmic', icon: '🌌', colors: ['purple', 'black', 'starlight'] },
  ];

  useEffect(() => {
    const fetchAvatarData = async () => {
      try {
        const response = await fetch(`${API_BASE}/avatar/state`);
        if (response.ok) {
          const data = await response.json();
          setAvatarState(data);
        }
      } catch (error) {
        console.error('Failed to fetch avatar state:', error);
      } finally {
        setLoading(false);
      }
    };

    if (interactive) {
      fetchAvatarData();
      const interval = setInterval(fetchAvatarData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [interactive]);

  const handleFormChange = async (formId: string) => {
    try {
      const response = await fetch(`${API_BASE}/avatar/change-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: formId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvatarState(data);
      }
    } catch (error) {
      console.error('Failed to change avatar form:', error);
    }
  };

  const handleCustomization = async (customizationData: Partial<AvatarCustomization>) => {
    try {
      const response = await fetch(`${API_BASE}/avatar/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customizationData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomization(data);
      }
    } catch (error) {
      console.error('Failed to customize avatar:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse flex items-center justify-center`}>
        <div className="w-1/2 h-1/2 rounded-full bg-white/30 animate-spin"></div>
      </div>
    );
  }

  const currentForm = avatarForms.find(f => f.id === avatarState?.current_form) || avatarForms[0];

  return (
    <div className="relative">
      {/* Main Avatar */}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105`}>
        {/* Peacock Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 via-transparent to-blue-400/20"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-400/20 via-transparent to-pink-400/20"></div>
        </div>
        
        {/* Core Avatar */}
        <div className="relative z-10 text-center">
          <div className="text-4xl md:text-6xl animate-pulse">{currentForm.icon}</div>
          {avatarState && (
            <div className="mt-1">
              <Badge className="bg-purple-500/20 text-purple-300 text-xs border-purple-500/30">
                {avatarState.emotional_state}
              </Badge>
            </div>
          )}
        </div>

        {/* Energy Ring */}
        {avatarState && (
          <div className="absolute -inset-2 rounded-full border-2 border-violet-400/30 animate-pulse"></div>
        )}

        {/* Interactive Controls */}
        {interactive && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/20">
                <Camera className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/20">
                <Palette className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <Card className="absolute top-full mt-4 left-0 right-0 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-purple-500/30 backdrop-blur-sm z-50">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-2">Choose Form</h4>
                <div className="grid grid-cols-3 gap-2">
                  {avatarForms.map((form) => (
                    <Button
                      key={form.id}
                      size="sm"
                      variant={avatarState?.current_form === form.id ? "default" : "outline"}
                      className={`${
                        avatarState?.current_form === form.id 
                          ? 'bg-purple-600 text-white' 
                          : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                      }`}
                      onClick={() => handleFormChange(form.id)}
                    >
                      <span className="mr-1">{form.icon}</span>
                      <span className="text-xs">{form.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-2">Colors</h4>
                <div className="flex space-x-2">
                  {currentForm.colors.map((color) => (
                    <div
                      key={color}
                      className={`w-6 h-6 rounded-full bg-${color}-500 border-2 border-white/30 cursor-pointer hover:scale-110 transition-transform`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Randomize
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Apply Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicators */}
      {avatarState && interactive && (
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-150"></div>
        </div>
      )}
    </div>
  );
}
