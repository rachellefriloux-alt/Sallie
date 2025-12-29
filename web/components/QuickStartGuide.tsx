'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Sallie!',
    description: 'Sallie is your AI cognitive partner. She learns, remembers, and grows alongside you. Let\'s get you started!',
    icon: <HeartIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Sallie runs 100% locally on your device',
      'Your conversations are private and never leave your network',
      'She gets smarter and more personalized over time',
    ],
  },
  {
    title: 'Start a Conversation',
    description: 'Simply type in the chat box at the bottom. Sallie responds to natural language - just talk to her like you would a friend.',
    icon: <ChatBubbleLeftRightIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Ask questions: "What can you help me with?"',
      'Request creative work: "Write me a poem about hope"',
      'Get assistance: "Help me plan my project"',
      'Share thoughts: "I\'m feeling overwhelmed today"',
    ],
  },
  {
    title: 'Check Service Status',
    description: 'The connection indicator (top right) shows if all systems are running. Click it for details.',
    icon: <CheckCircleIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Green = All systems operational',
      'Yellow = Some features limited',
      'Red = Backend disconnected',
      'Auto-checks every 30 seconds',
    ],
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Save time with keyboard shortcuts. Press Ctrl+/ to see all available shortcuts.',
    icon: <CommandLineIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Ctrl+K - Focus chat input',
      'Ctrl+B - Toggle sidebar',
      'Enter - Send message',
      'Ctrl+/ - Show all shortcuts',
    ],
  },
  {
    title: 'Customize Your Experience',
    description: 'Click the settings icon to adjust appearance, chat preferences, and privacy options.',
    icon: <Cog6ToothIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Adjust font size for better readability',
      'Toggle animations if they\'re distracting',
      'Control history and privacy settings',
      'All preferences are saved locally',
    ],
  },
  {
    title: 'Pro Tips',
    description: 'Make the most of your time with Sallie with these advanced tips.',
    icon: <LightBulbIcon className="w-12 h-12 text-violet-400" />,
    tips: [
      'Sallie remembers context - reference earlier conversations',
      'Be specific for better results',
      'Give feedback - it helps her learn your preferences',
      'Explore the sidebar for advanced features',
      'Check documentation for deep dives',
    ],
  },
];

export function QuickStartGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user has seen the guide
  const checkFirstTime = () => {
    const hasSeenGuide = localStorage.getItem('sallie_quick_start_seen');
    if (!hasSeenGuide) {
      setIsOpen(true);
      localStorage.setItem('sallie_quick_start_seen', 'true');
    }
  };

  // Only auto-show on mount if not seen before
  useState(() => {
    if (typeof window !== 'undefined') {
      setTimeout(checkFirstTime, 2000); // Show after 2 seconds
    }
  });

  const currentStepData = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg transition-colors z-30"
        title="Quick Start Guide"
      >
        <LightBulbIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick Start Guide</h2>
            <p className="text-sm text-gray-400 mt-1">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex justify-center mb-6">
            {currentStepData.icon}
          </div>
          
          <h3 className="text-2xl font-bold text-white text-center mb-4">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-300 text-center mb-6">
            {currentStepData.description}
          </p>

          <div className="bg-gray-900 rounded-lg p-4">
            <ul className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-300">
                  <span className="text-violet-400 mt-1">•</span>
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white flex items-center space-x-2 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep < TUTORIAL_STEPS.length - 1 && (
                <ArrowRightIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
