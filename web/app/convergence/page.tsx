'use client';

import { useState, useEffect } from 'react';
import { ConvergenceFlow } from '@/components/ConvergenceFlow';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

export default function ConvergencePage() {
  const [convergenceStatus, setConvergenceStatus] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [elasticMode, setElasticMode] = useState(false);
  const [resonancePatterns, setResonancePatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadConvergenceData();
  }, []);

  const loadConvergenceData = async () => {
    try {
      // Load convergence status
      const statusResponse = await fetch('/api/convergence/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setConvergenceStatus(statusData);
      }

      // Load questions
      const questionsResponse = await fetch('/api/convergence/questions');
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }

      // Load elastic mode status
      const elasticResponse = await fetch('/api/convergence/elastic-mode/status');
      if (elasticResponse.ok) {
        const elasticData = await elasticResponse.json();
        setElasticMode(elasticData.enabled);
      }

      // Load resonance patterns
      const resonanceResponse = await fetch('/api/resonance/patterns');
      if (resonanceResponse.ok) {
        const resonanceData = await resonanceResponse.json();
        setResonancePatterns(resonanceData);
      }

    } catch (error) {
      console.error('Failed to load convergence data:', error);
      showError('Failed to load', 'Could not load Convergence data');
    } finally {
      setLoading(false);
    }
  };

  const enableElasticMode = async () => {
    try {
      const response = await fetch('/api/convergence/elastic-mode/enable', {
        method: 'POST'
      });
      
      if (response.ok) {
        setElasticMode(true);
        showSuccess('Elastic Mode Enabled', 'Convergence elastic mode activated');
      }
    } catch (error) {
      showError('Failed to enable', 'Could not enable elastic mode');
    }
  };

  const disableElasticMode = async () => {
    try {
      const response = await fetch('/api/convergence/elastic-mode/disable', {
        method: 'POST'
      });
      
      if (response.ok) {
        setElasticMode(false);
        showInfo('Elastic Mode Disabled', 'Convergence elastic mode deactivated');
      }
    } catch (error) {
      showError('Failed to disable', 'Could not disable elastic mode');
    }
  };

  const performMirrorTest = async (responses: any[]) => {
    try {
      const response = await fetch('/api/convergence/mirror-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });
      
      if (response.ok) {
        const result = await response.json();
        showSuccess('Mirror Test Completed', `Alignment score: ${result.alignmentScore}`);
        return result;
      }
    } catch (error) {
      showError('Failed to perform', 'Could not perform mirror test');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Great Convergence</h1>
          <p className="text-gray-300">14-question onboarding, elastic mode, and heritage compilation</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Convergence Status</h3>
            <p className="text-lg font-semibold text-white">
              {convergenceStatus?.completed ? 'Complete' : 'In Progress'}
            </p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Questions Answered</h3>
            <p className="text-lg font-semibold text-white">
              {questions.filter(q => q.answered).length} / {questions.length}
            </p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Elastic Mode</h3>
            <p className="text-lg font-semibold text-white">
              {elasticMode ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Resonance Patterns</h3>
            <p className="text-lg font-semibold text-white">{resonancePatterns.length}</p>
          </div>
        </div>

        {/* Elastic Mode Toggle */}
        <div className="mb-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Elastic Mode</h3>
                <p className="text-sm text-gray-400">
                  Temporarily suspend constraints for enhanced exploration
                </p>
              </div>
              <button
                onClick={elasticMode ? disableElasticMode : enableElasticMode}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  elasticMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {elasticMode ? 'Disable' : 'Enable'} Elastic Mode
              </button>
            </div>
          </div>
        </div>

        {/* Main Convergence Flow */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
          <ConvergenceFlow 
            convergenceStatus={convergenceStatus}
            questions={questions}
            elasticMode={elasticMode}
            onQuestionAnswered={loadConvergenceData}
            onMirrorTest={performMirrorTest}
            isConnected={isConnected}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}

