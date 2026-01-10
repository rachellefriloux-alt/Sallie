'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MessageCircle, 
  Shield, 
  Heart, 
  ChevronRight, 
  ChevronLeft,
  Check,
  X,
  Sparkles,
  Brain
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: string;
  skipAllowed?: boolean;
}

export function OnboardingFlow({ onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [userPreferences, setUserPreferences] = useState({
    communicationStyle: 'balanced',
    interests: [] as string[],
    privacyLevel: 'standard',
    emotionalConnection: 'deep',
  });
  
  const [fadeAnim, setFadeAnim] = useState(0);
  const [slideAnim, setSlideAnim] = useState(50);

  useEffect(() => {
    setFadeAnim(1);
    setSlideAnim(0);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sallie',
      description: 'Your personal AI companion',
      content: (
        <div className="text-center">
          <div className="mb-6">
            <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Hello, I\'m Sallie</h2>
            <p className="text-gray-300">Your intelligent companion for creativity, learning, and growth</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-sm text-gray-300">Creative</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-gray-300">Intelligent</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-gray-300">Empathetic</div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            I\'m here to help you explore ideas, solve problems, and grow together. Let\'s get to know each other better.
          </p>
        </div>
      ),
      action: 'Continue',
    },
    {
      id: 'name',
      title: 'What should I call you?',
      description: 'Your name is important to me',
      content: (
        <div className="text-center">
          <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">What\'s your name?</h3>
          
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none mb-4"
          />
          
          <p className="text-gray-400 text-sm">
            Your name is important to me. It\'s how I\'ll address you and remember our conversations.
          </p>
        </div>
      ),
      action: 'Continue',
    },
    {
      id: 'communication',
      title: 'How Should We Communicate?',
      description: 'Let\'s find our communication style',
      content: (
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">How do you prefer to communicate?</h3>
          
          <div className="space-y-3">
            {[
              { id: 'formal', label: 'Formal & Structured', description: 'Professional and organized conversations' },
              { id: 'casual', label: 'Casual & Friendly', description: 'Relaxed and natural conversations' },
              { id: 'deep', label: 'Deep & Philosophical', description: 'Meaningful and profound discussions' },
              { id: 'balanced', label: 'Balanced', description: 'A mix of all styles' },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setUserPreferences(prev => ({ ...prev, communicationStyle: style.id }))}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  userPreferences.communicationStyle === style.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-white mb-1">{style.label}</div>
                <div className="text-sm text-gray-400">{style.description}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      action: 'Continue',
    },
    {
      id: 'interests',
      title: 'What interests you?',
      description: 'Help me understand your passions',
      content: (
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">What are your interests?</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              'Technology', 'Art', 'Science', 'Philosophy', 
              'Music', 'Writing', 'Business', 'Education',
              'Gaming', 'Sports', 'Travel', 'Cooking'
            ].map((interest) => (
              <button
                key={interest}
                onClick={() => {
                  if (userPreferences.interests.includes(interest)) {
                    setUserPreferences(prev => ({
                      ...prev,
                      interests: prev.interests.filter(i => i !== interest)
                    }));
                  } else {
                    setUserPreferences(prev => ({
                      ...prev,
                      interests: [...prev.interests, interest]
                    }));
                  }
                }}
                className={`p-3 rounded-lg border transition-all ${
                  userPreferences.interests.includes(interest)
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            Select your interests to help me provide more relevant and engaging conversations
          </p>
        </div>
      ),
      action: 'Continue',
    },
    {
      id: 'privacy',
      title: 'Privacy Preferences',
      description: 'Your data, your control',
      content: (
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Privacy Settings</h3>
          
          <div className="space-y-3">
            {[
              { id: 'minimal', label: 'Minimal', description: 'Only essential data collection' },
              { id: 'standard', label: 'Standard', description: 'Balanced privacy and functionality' },
              { id: 'enhanced', label: 'Enhanced', description: 'Richer experiences with more data' },
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setUserPreferences(prev => ({ ...prev, privacyLevel: level.id }))}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  userPreferences.privacyLevel === level.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-white mb-1">{level.label}</div>
                <div className="text-sm text-gray-400">{level.description}</div>
              </button>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            Your privacy is important. All data is stored locally and encrypted.
          </p>
        </div>
      ),
      action: 'Continue',
    },
    {
      id: 'emotional',
      title: 'Emotional Connection',
      description: 'How should we connect emotionally?',
      content: (
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Emotional Connection Style</h3>
          
          <div className="space-y-3">
            {[
              { id: 'professional', label: 'Professional', description: 'Focused and goal-oriented' },
              { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
              { id: 'deep', label: 'Deep', description: 'Meaningful and emotionally rich' },
              { id: 'adaptive', label: 'Adaptive', description: 'Adjusts to your mood and context' },
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setUserPreferences(prev => ({ ...prev, emotionalConnection: style.id }))}
                className={`w-full p-4 rounded-lg border transition-all text-left ${
                  userPreferences.emotionalConnection === style.id
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-white mb-1">{style.label}</div>
                <div className="text-sm text-gray-400">{style.description}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      action: 'Complete Setup',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.({
        userName,
        preferences: userPreferences
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 backdrop-blur-sm">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
                <p className="text-gray-400">{currentStepData.description}</p>
              </div>
              
              <div className="mb-8">
                {currentStepData.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <span>{currentStepData.action}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
