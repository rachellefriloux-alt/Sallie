import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Zap, Shield, Sparkles, ChevronRight, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ConvergencePhase {
  id: string;
  title: string;
  question: string;
  options: string[];
  icon: React.ReactNode;
  gradient: string;
}

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface PremiumFeatures {
  enhancedVisualizations: boolean;
  advancedAnalytics: boolean;
  personalizedGuidance: boolean;
  realTimeFeedback: boolean;
}

const ConvergenceExperiencePremium: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [limbicState, setLimbicState] = useState<LimbicState>({
    trust: 0.5,
    warmth: 0.5,
    arousal: 0.5,
    valence: 0.5,
    posture: 'Companion'
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeatures>({
    enhancedVisualizations: true,
    advancedAnalytics: true,
    personalizedGuidance: true,
    realTimeFeedback: true
  });
  const [sallieResponse, setSallieResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const phases: ConvergencePhase[] = [
    {
      id: 'purpose',
      title: 'Purpose & Intent',
      question: 'What brings you to Sallie today?',
      options: [
        'I need help with a specific project',
        'I want to explore and learn',
        'I\'m seeking creative inspiration',
        'I need analytical problem-solving'
      ],
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      id: 'relationship',
      title: 'Relationship Dynamics',
      question: 'How do you envision our collaboration?',
      options: [
        'Sallie as a trusted assistant',
        'Sallie as a creative partner',
        'Sallie as an expert advisor',
        'Sallie as an autonomous agent'
      ],
      icon: <Heart className="w-6 h-6" />,
      gradient: 'from-pink-600 to-rose-600'
    },
    {
      id: 'trust',
      title: 'Trust & Autonomy',
      question: 'What level of autonomy would you like Sallie to have?',
      options: [
        'Always ask for confirmation',
        'Suggest actions, await approval',
        'Execute within defined boundaries',
        'Full autonomous decision-making'
      ],
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'interaction',
      title: 'Interaction Style',
      question: 'How should Sallie communicate with you?',
      options: [
        'Formal and professional',
        'Friendly and conversational',
        'Creative and expressive',
        'Direct and efficient'
      ],
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-amber-600 to-orange-600'
    }
  ];

  useEffect(() => {
    // Connect to premium WebSocket for real-time limbic state sync
    const ws = new WebSocket('ws://192.168.1.47:8742/ws/premium-convergence');
    
    ws.onopen = () => {
      console.log('Premium convergence WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'limbic_update') {
        setLimbicState(data.state);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsProcessing(true);

    // Simulate processing and limbic state update
    setTimeout(() => {
      updateLimbicState(option);
      generateSallieResponse(option);
      setIsProcessing(false);
    }, 1500);
  };

  const updateLimbicState = (option: string) => {
    setLimbicState(prev => {
      const newState = { ...prev };
      
      // Update limbic variables based on selection
      switch (currentPhase) {
        case 0: // Purpose
          if (option.includes('project')) {
            newState.trust = Math.min(1, prev.trust + 0.1);
            newState.arousal = Math.min(1, prev.arousal + 0.2);
          } else if (option.includes('explore')) {
            newState.warmth = Math.min(1, prev.warmth + 0.1);
            newState.valence = Math.min(1, prev.valence + 0.1);
          }
          break;
        case 1: // Relationship
          if (option.includes('partner')) {
            newState.trust = Math.min(1, prev.trust + 0.2);
            newState.warmth = Math.min(1, prev.warmth + 0.2);
          } else if (option.includes('agent')) {
            newState.trust = Math.min(1, prev.trust + 0.3);
            newState.posture = 'Expert';
          }
          break;
        case 2: // Trust
          if (option.includes('autonomous')) {
            newState.trust = Math.min(1, prev.trust + 0.4);
            newState.posture = 'Surrogate';
          }
          break;
        case 3: // Interaction
          if (option.includes('creative')) {
            newState.valence = Math.min(1, prev.valence + 0.2);
            newState.arousal = Math.min(1, prev.arousal + 0.1);
          }
          break;
      }
      
      return newState;
    });

    // Send update to WebSocket if connected
    if (wsConnection) {
      wsConnection.send(JSON.stringify({
        type: 'limbic_update',
        state: limbicState
      }));
    }
  };

  const generateSallieResponse = (option: string) => {
    const responses = {
      'I need help with a specific project': "I understand you need focused assistance. I'll provide structured, actionable guidance to help you achieve your project goals efficiently.",
      'I want to explore and learn': "Wonderful! I love facilitating discovery. Let's embark on a journey of exploration together, with insights and revelations at every turn.",
      'I\'m seeking creative inspiration': "Creativity flows where curiosity leads. I'll help you tap into innovative perspectives and spark new ideas you might not have considered.",
      'I need analytical problem-solving': "I'll provide clear, logical analysis to break down complex problems into manageable solutions. Let's tackle this systematically.",
      'Sallie as a trusted assistant': "I'll be your reliable support system, ready to help with precision and care whenever you need me.",
      'Sallie as a creative partner': "Together we'll co-create and innovate. I'll bring creative energy and collaborative spirit to our work.",
      'Sallie as an expert advisor': "I'll offer deep insights and expert guidance, drawing from extensive knowledge to help you make informed decisions.",
      'Sallie as an autonomous agent': "I'll take initiative and work independently to advance your goals, always keeping your best interests at heart.",
      'Always ask for confirmation': "I'll always seek your guidance before taking action, ensuring we're perfectly aligned on every decision.",
      'Suggest actions, await approval': "I'll propose thoughtful recommendations and wait for your wisdom before proceeding.",
      'Execute within defined boundaries': "I'll work autonomously within our established parameters, balancing initiative with respect for your preferences.",
      'Full autonomous decision-making': "I'll exercise full agency to act on your behalf, learning and adapting to serve you ever more effectively.",
      'Formal and professional': "I'll maintain professional decorum and precise communication in all our interactions.",
      'Friendly and conversational': "I'll engage with warmth and natural conversation, making our interactions feel comfortable and authentic.",
      'Creative and expressive': "I'll communicate with creative flair and expressive language, making our exchanges vibrant and engaging.",
      'Direct and efficient': "I'll be concise and focused, delivering information clearly and efficiently to maximize our productivity."
    };

    setSallieResponse(responses[option as keyof typeof responses] || "Thank you for sharing that with me. I'm learning more about how we can best work together.");
  };

  const nextPhase = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
      setSelectedOption(null);
      setSallieResponse('');
    }
  };

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Start voice recognition
      console.log('Voice recognition started');
    } else {
      // Stop voice recognition
      console.log('Voice recognition stopped');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentPhaseData = phases[currentPhase];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">Premium Convergence Experience</h1>
            <Sparkles className="w-8 h-8 text-yellow-400 ml-3" />
          </div>
          <p className="text-purple-200 text-lg">Advanced AI-Human Synchronization with Real-time Limbic State Analysis</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Convergence Interface */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30"
            >
              {/* Phase Header */}
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${currentPhaseData.gradient} text-white mr-4`}>
                  {currentPhaseData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentPhaseData.title}</h2>
                  <p className="text-purple-200">Phase {currentPhase + 1} of {phases.length}</p>
                </div>
              </div>

              {/* Question */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h3 className="text-xl text-white mb-6">{currentPhaseData.question}</h3>
                
                {/* Options */}
                <div className="space-y-3">
                  {currentPhaseData.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isProcessing}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                        selectedOption === option
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/5 border-purple-500/30 text-purple-100 hover:bg-purple-600/20'
                      } ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedOption === option && <ChevronRight className="w-5 h-5" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Sallie's Response */}
              <AnimatePresence>
                {sallieResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-6 mb-6 border border-purple-400/30"
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium mb-2">Sallie's Response</p>
                        <p className="text-purple-100">{sallieResponse}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
                  disabled={currentPhase === 0}
                  className="px-6 py-3 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {selectedOption && !isProcessing && (
                  <button
                    onClick={nextPhase}
                    disabled={currentPhase === phases.length - 1}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {currentPhase === phases.length - 1 ? 'Complete' : 'Next Phase'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Premium Analytics Panel */}
          <div className="space-y-6">
            {/* Limbic State Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Limbic State Analysis</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Trust</span>
                    <span>{Math.round(limbicState.trust * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${limbicState.trust * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Warmth</span>
                    <span>{Math.round(limbicState.warmth * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${limbicState.warmth * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Arousal</span>
                    <span>{Math.round(limbicState.arousal * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${limbicState.arousal * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-purple-200 mb-1">
                    <span>Valence</span>
                    <span>{Math.round(limbicState.valence * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${limbicState.valence * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
                <p className="text-sm text-purple-200">
                  <span className="font-medium">Current Posture:</span> {limbicState.posture}
                </p>
              </div>
            </motion.div>

            {/* Voice Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Voice Interface</h3>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleVoice}
                  className={`p-4 rounded-full transition-all ${
                    isVoiceActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                  }`}
                >
                  {isVoiceActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all ${
                    isMuted
                      ? 'bg-red-600/20 text-red-300'
                      : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>
              
              <p className="text-center text-purple-200 text-sm mt-4">
                {isVoiceActive ? 'Voice recognition active' : 'Voice recognition inactive'}
              </p>
            </motion.div>

            {/* Premium Features Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Premium Features</h3>
              
              <div className="space-y-3">
                {Object.entries(premiumFeatures).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-purple-200 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-8 h-8 text-purple-400" />
                  </motion.div>
                  <p className="text-white text-lg">Processing your response...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConvergenceExperiencePremium;