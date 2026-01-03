'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'complete' | 'error';
  errorMessage?: string;
}

export function FirstRunWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'backend',
      title: 'Backend Connection',
      description: 'Verifying connection to Sallie backend...',
      status: 'pending',
    },
    {
      id: 'ollama',
      title: 'AI Models',
      description: 'Checking Ollama and AI models...',
      status: 'pending',
    },
    {
      id: 'qdrant',
      title: 'Memory System',
      description: 'Verifying Qdrant vector database...',
      status: 'pending',
    },
    {
      id: 'discovery',
      title: 'Network Discovery',
      description: 'Setting up auto-discovery for mobile devices...',
      status: 'pending',
    },
    {
      id: 'convergence',
      title: 'Great Convergence',
      description: 'Setting up your personal heritage...',
      status: 'pending',
    },
  ]);
  const [overallStatus, setOverallStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  useEffect(() => {
    runSetupChecks();
  }, []);

  const updateStepStatus = (id: string, status: SetupStep['status'], errorMessage?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, errorMessage } : step
      )
    );
  };

  const runSetupChecks = async () => {
    // Check backend
    updateStepStatus('backend', 'checking');
    try {
      const response = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        updateStepStatus('backend', 'complete');

        // Check Ollama
        updateStepStatus('ollama', 'checking');
        if (data.services?.ollama === 'healthy') {
          updateStepStatus('ollama', 'complete');
        } else {
          updateStepStatus('ollama', 'error', 'Ollama not responding. AI features will be limited.');
        }

        // Check Qdrant
        updateStepStatus('qdrant', 'checking');
        if (data.services?.qdrant === 'healthy') {
          updateStepStatus('qdrant', 'complete');
        } else {
          updateStepStatus('qdrant', 'error', 'Qdrant not responding. Memory features will be limited.');
        }

        // Check Discovery API
        updateStepStatus('discovery', 'checking');
        try {
          const discoveryResponse = await fetch(`${API_BASE}/api/discover`);
          if (discoveryResponse.ok) {
            updateStepStatus('discovery', 'complete');
          } else {
            updateStepStatus('discovery', 'error', 'Discovery API not available. Mobile devices may need manual connection.');
          }
        } catch (error) {
          updateStepStatus('discovery', 'error', 'Discovery API not available. Mobile devices may need manual connection.');
        }

        // Check convergence status
        updateStepStatus('convergence', 'checking');
        try {
          const convResponse = await fetch(`${API_BASE}/convergence/status`);
          if (convResponse.ok) {
            const convData = await convResponse.json();
            if (convData.completed) {
              updateStepStatus('convergence', 'complete');
              setOverallStatus('ready');
            } else {
              updateStepStatus('convergence', 'pending');
              setOverallStatus('ready');
            }
          } else {
            updateStepStatus('convergence', 'pending');
            setOverallStatus('ready');
          }
        } catch (error) {
          updateStepStatus('convergence', 'pending');
          setOverallStatus('ready');
        }
      } else {
        updateStepStatus('backend', 'error', 'Backend not responding');
        updateStepStatus('ollama', 'error', 'Cannot check - backend down');
        updateStepStatus('qdrant', 'error', 'Cannot check - backend down');
        updateStepStatus('convergence', 'error', 'Cannot check - backend down');
        setOverallStatus('error');
      }
    } catch (error) {
      updateStepStatus('backend', 'error', 'Connection failed. Is the backend running?');
      updateStepStatus('ollama', 'error', 'Cannot check - backend down');
      updateStepStatus('qdrant', 'error', 'Cannot check - backend down');
      updateStepStatus('convergence', 'error', 'Cannot check - backend down');
      setOverallStatus('error');
    }
  };

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'checking':
        return <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <div className="w-6 h-6 border-2 border-gray-600 rounded-full" />;
    }
  };

  const handleContinue = () => {
    if (overallStatus === 'ready') {
      const convergenceStep = steps.find((s) => s.id === 'convergence');
      if (convergenceStep?.status === 'pending') {
        // Redirect to convergence
        window.location.href = '/convergence';
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-violet-900 flex items-center justify-center z-50">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Sallie</h1>
            <p className="text-gray-400">
              Setting up your AI cognitive partner...
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all ${
                  step.status === 'complete'
                    ? 'bg-green-900/20 border-green-700'
                    : step.status === 'error'
                    ? 'bg-red-900/20 border-red-700'
                    : step.status === 'checking'
                    ? 'bg-violet-900/20 border-violet-700'
                    : 'bg-gray-700/50 border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                    {step.errorMessage && (
                      <p className="text-sm text-red-400 mt-2">
                        ⚠️ {step.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            {overallStatus === 'checking' && (
              <p className="text-gray-400 animate-pulse">
                Running system checks...
              </p>
            )}
            {overallStatus === 'ready' && (
              <p className="text-green-400">
                ✓ System ready! You can now continue.
              </p>
            )}
            {overallStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-400">
                  ⚠️ Connection failed. Please check your setup.
                </p>
                <div className="text-left bg-gray-900 rounded-lg p-4 text-sm">
                  <p className="text-gray-300 font-semibold mb-2">Quick Fix:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400">
                    <li>Make sure Docker Desktop is running</li>
                    <li>Open terminal in Sallie directory</li>
                    <li>Run: <code className="bg-gray-800 px-2 py-1 rounded text-violet-400">./start-sallie.sh</code></li>
                    <li>Wait for services to start (30-60 seconds)</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={runSetupChecks}
              className="px-4 py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              disabled={overallStatus === 'checking'}
            >
              ↻ Retry Checks
            </button>
            
            <button
              onClick={handleContinue}
              disabled={overallStatus !== 'ready'}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
                overallStatus === 'ready'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Option (for advanced users) */}
          <div className="mt-4 text-center">
            <button
              onClick={onComplete}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Skip setup wizard (not recommended)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
