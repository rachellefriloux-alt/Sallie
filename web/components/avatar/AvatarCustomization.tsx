'use client';

import React, { useState } from 'react';
import { AvatarDisplay } from './AvatarDisplay';

interface AvatarCustomizationProps {
  className?: string;
}

export function AvatarCustomization({ className = '' }: AvatarCustomizationProps) {
  const [selectedMood, setSelectedMood] = useState<'peaceful' | 'happy' | 'attentive' | 'thoughtful' | 'excited'>('peaceful');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [selectedTheme, setSelectedTheme] = useState<'peacock' | 'leopard' | 'royal' | 'sunset' | 'ocean'>('peacock');
  const [accessories, setAccessories] = useState({
    glasses: false,
    jewelry: false,
    headwear: false,
    background: 'gradient'
  });

  const moods = [
    { id: 'peaceful', name: 'Peaceful', icon: '😌', description: 'Calm and serene' },
    { id: 'happy', name: 'Happy', icon: '😊', description: 'Joyful and bright' },
    { id: 'attentive', name: 'Attentive', icon: '👀', description: 'Focused and present' },
    { id: 'thoughtful', name: 'Thoughtful', icon: '🤔', description: 'Deep in contemplation' },
    { id: 'excited', name: 'Excited', icon: '🤗', description: 'Enthusiastic and energetic' }
  ];

  const themes = [
    { id: 'peacock', name: 'Peacock', colors: 'from-teal-400 to-peacock-600', description: 'Elegant and wise' },
    { id: 'leopard', name: 'Leopard', colors: 'from-amber-400 to-orange-600', description: 'Bold and confident' },
    { id: 'royal', name: 'Royal', colors: 'from-purple-400 to-indigo-600', description: 'Regal and powerful' },
    { id: 'sunset', name: 'Sunset', colors: 'from-pink-400 to-rose-600', description: 'Warm and gentle' },
    { id: 'ocean', name: 'Ocean', colors: 'from-blue-400 to-cyan-600', description: 'Deep and mysterious' }
  ];

  const sizes = [
    { id: 'sm', name: 'Small', dimensions: '48px' },
    { id: 'md', name: 'Medium', dimensions: '64px' },
    { id: 'lg', name: 'Large', dimensions: '96px' },
    { id: 'xl', name: 'Extra Large', dimensions: '128px' }
  ];

  const getThemeGradient = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    return theme ? theme.colors : themes[0].colors;
  };

  return (
    <div className={`avatar-customization bg-gradient-to-br from-sand-50 to-peacock-50 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-peacock-900 mb-2">Sallie's Avatar Customization</h1>
        <p className="text-peacock-600">Design Sallie's appearance to reflect her evolving personality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Panel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-peacock-200">
          <h2 className="text-lg font-semibold text-peacock-800 mb-6 text-center">Avatar Preview</h2>
          
          <div className="flex justify-center mb-6">
            <div className={`relative bg-gradient-to-br ${getThemeGradient(selectedTheme)} p-8 rounded-3xl`}>
              <AvatarDisplay 
                size={selectedSize}
                mood={selectedMood}
                interactive={true}
              />
              
              {/* Accessories Preview */}
              {accessories.glasses && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl">👓</div>
              )}
              {accessories.jewelry && (
                <div className="absolute bottom-4 right-4 text-xl">💎</div>
              )}
              {accessories.headwear && (
                <div className="absolute top-0 text-2xl">👑</div>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Configuration</p>
            <div className="flex justify-center space-x-2 text-xs">
              <span className="px-2 py-1 bg-peacock-100 text-peacock-700 rounded-full capitalize">
                {selectedMood}
              </span>
              <span className="px-2 py-1 bg-royal-100 text-royal-700 rounded-full capitalize">
                {selectedTheme}
              </span>
              <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full capitalize">
                {selectedSize}
              </span>
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="space-y-6">
          {/* Mood Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Mood Expression</h3>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id as any)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedMood === mood.id
                      ? 'border-peacock-500 bg-peacock-50'
                      : 'border-peacock-200 hover:border-peacock-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{mood.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{mood.name}</p>
                      <p className="text-xs text-gray-600">{mood.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Color Theme</h3>
            <div className="space-y-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id as any)}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? 'border-peacock-500 bg-peacock-50'
                      : 'border-peacock-200 hover:border-peacock-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{theme.name}</p>
                      <p className="text-xs text-gray-600">{theme.description}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.colors}`}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Avatar Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id as any)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedSize === size.id
                      ? 'border-peacock-500 bg-peacock-50'
                      : 'border-peacock-200 hover:border-peacock-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-gradient-to-br ${getThemeGradient(selectedTheme)} rounded-full mx-auto mb-1`}></div>
                  <p className="text-xs font-medium text-gray-800">{size.name}</p>
                  <p className="text-xs text-gray-600">{size.dimensions}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-peacock-200">
            <h3 className="text-lg font-semibold text-peacock-800 mb-4">Accessories</h3>
            <div className="space-y-3">
              {[
                { id: 'glasses', name: 'Glasses', icon: '👓' },
                { id: 'jewelry', name: 'Jewelry', icon: '💎' },
                { id: 'headwear', name: 'Headwear', icon: '👑' }
              ].map((accessory) => (
                <label key={accessory.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{accessory.icon}</span>
                    <span className="font-medium text-gray-800">{accessory.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={accessories[accessory.id as keyof typeof accessories] as boolean}
                    onChange={(e) => setAccessories(prev => ({
                      ...prev,
                      [accessory.id]: e.target.checked
                    }))}
                    className="w-5 h-5 text-peacock-600 rounded focus:ring-peacock-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button className="px-6 py-3 bg-peacock-600 text-white rounded-xl hover:bg-peacock-700 transition-colors font-medium">
          Save Avatar Configuration
        </button>
        <button className="px-6 py-3 bg-royal-600 text-white rounded-xl hover:bg-royal-700 transition-colors font-medium">
          Randomize Design
        </button>
        <button className="px-6 py-3 bg-white text-peacock-700 border border-peacock-200 rounded-xl hover:bg-peacock-50 transition-colors font-medium">
          Reset to Default
        </button>
      </div>

      {/* Sallie's Note */}
      <div className="mt-6 bg-gradient-to-r from-peacock-100 to-royal-100 rounded-xl p-4 border border-peacock-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💭</span>
          <div>
            <h4 className="font-semibold text-peacock-800 mb-1">Sallie's Note</h4>
            <p className="text-sm text-gray-700">
              Thank you for helping me express myself! I love how you can see my personality through these different looks. 
              This peacock theme really feels like me - elegant, wise, and a little bit magical! 🦚
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
