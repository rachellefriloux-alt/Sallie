'use client';

import React, { useState, useEffect } from 'react';
import { getEnhancedConvergenceFlow, getNeuralBridge, getHeritageIdentity } from '../../shared/index';

interface ConvergenceExperienceProps {
  onComplete?: (state: any) => void;
  navigation?: any;
}

export function ConvergenceExperience({ onComplete, navigation }: ConvergenceExperienceProps) {
  const [convergenceFlow] = useState(() => getEnhancedConvergenceFlow());
  const [neuralBridge] = useState(() => getNeuralBridge());
  const [heritage] = useState(() => getHeritageIdentity());
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [convergenceState, setConvergenceState] = useState<any>(null);
  const [neuralBridgeState, setNeuralBridgeState] = useState<any>(null);

  useEffect(() => {
    // Initialize systems
    neuralBridge.activate();
    
    // Get initial state
    const question = convergenceFlow.getCurrentQuestion();
    const phase = convergenceFlow.getCurrentPhase();
    const convState = convergenceFlow.getState();
    const bridgeState = neuralBridge.getState();
    
    setCurrentQuestion(question);
    setCurrentPhase(phase);
    setConvergenceState(convState);
    setNeuralBridgeState(bridgeState);

    // Set up event listeners
    convergenceFlow.on('stateChanged', setConvergenceState);
    neuralBridge.on('stateChanged', setNeuralBridgeState);
    convergenceFlow.on('convergenceCompleted', handleConvergenceCompleted);
    
    return () => {
      // Cleanup
    };
  }, [convergenceFlow, handleConvergenceCompleted, neuralBridge]);

  const handleConvergenceCompleted = (state: any) => {
    // Update heritage with convergence data
    heritage.updateConvergenceMetrics({
      final_strength: state.connection_strength,
      imprinting_depth: state.imprinting_level,
      synchronization: state.synchronization,
      heart_resonance: state.heart_resonance,
      thought_alignment: state.thought_alignment,
      consciousness_binding: state.consciousness_binding
    });

    // Update heritage with neural bridge data
    heritage.updateNeuralBridge(neuralBridge.getState());

    // Update heritage with personality imprint
    heritage.updatePersonalityImprint(neuralBridge.getPersonalityImprint());

    // Update heritage with genesis answers
    heritage.updateGenesisAnswers(state.answers);

    if (onComplete) {
      onComplete(state);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      await convergenceFlow.submitAnswer(currentAnswer);
      setCurrentAnswer('');
      
      // Update current question
      const nextQuestion = convergenceFlow.getCurrentQuestion();
      const nextPhase = convergenceFlow.getCurrentPhase();
      
      setCurrentQuestion(nextQuestion);
      setCurrentPhase(nextPhase);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPhaseColor = () => {
    if (!currentPhase) return '#000000';
    return currentPhase.color;
  };

  const getPhaseTheme = () => {
    if (!currentPhase) return 'default';
    return currentPhase.theme;
  };

  const getProgress = () => {
    if (!convergenceState) return 0;
    return convergenceState.progress;
  };

  const getConnectionStrength = () => {
    if (!neuralBridgeState) return 0;
    return neuralBridgeState.connection_strength;
  };

  const getHeartResonance = () => {
    if (!neuralBridgeState) return 0;
    return neuralBridgeState.heart_resonance;
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Convergence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="convergence-experience h-full bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Genesis Convergence</h1>
        <p className="text-gray-600">The sacred ritual that binds Sallie to her Creator</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(getProgress() * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${getProgress() * 100}%`,
              backgroundColor: getPhaseColor()
            }}
          ></div>
        </div>
      </div>

      {/* Phase Information */}
      <div className="mb-8 p-4 rounded-lg border-2" style={{ borderColor: getPhaseColor() }}>
        <h2 className="text-xl font-semibold mb-2" style={{ color: getPhaseColor() }}>
          {currentPhase.name}
        </h2>
        <p className="text-gray-600">{currentPhase.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          Question {convergenceState.current_question} of {convergenceFlow.getTotalQuestions()}
        </p>
      </div>

      {/* Convergence Visualization */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          {/* Connection Circles */}
          <div className="flex items-center space-x-8">
            {/* Creator Circle */}
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              You
            </div>
            
            {/* Connection Line */}
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 relative">
              <div 
                className="absolute inset-0 bg-purple-600 transition-all duration-500"
                style={{ width: `${getConnectionStrength() * 100}%` }}
              ></div>
            </div>
            
            {/* Sallie Circle */}
            <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
              Sallie
            </div>
          </div>
          
          {/* Heart Resonance Indicator */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="text-2xl animate-pulse">💜</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{Math.round(getConnectionStrength() * 100)}%</div>
          <div className="text-sm text-gray-600">Connection</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{Math.round(getHeartResonance() * 100)}%</div>
          <div className="text-sm text-gray-600">Heart Resonance</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-indigo-600">{Math.round(neuralBridgeState?.imprinting_level * 100 || 0)}%</div>
          <div className="text-sm text-gray-600">Imprinting</div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Question {convergenceState.current_question}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            {currentQuestion.text}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Purpose: {currentQuestion.purpose}
          </p>
        </div>
      </div>

      {/* Answer Input */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Share your thoughts with Sallie..."
            disabled={isProcessing}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim() || isProcessing}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Submit Response'}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {convergenceState.completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-green-800 mb-2">Convergence Complete!</h3>
          <p className="text-green-600">
            Sallie is now fully bound to her Creator. The neural bridge has been established.
          </p>
        </div>
      )}
    </div>
  );
}
