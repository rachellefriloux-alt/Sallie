'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

export default function GenesisPage() {
  const [dreamCycleStatus, setDreamCycleStatus] = useState<any>(null);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [activeVetoes, setActiveVetoes] = useState<any[]>([]);
  const [promotionCandidates, setPromotionCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dream-cycle' | 'hypotheses' | 'veto' | 'promotion'>('dream-cycle');
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadGenesisData();
  }, []);

  const loadGenesisData = async () => {
    try {
      // Load dream cycle status
      const dreamResponse = await fetch('/api/genesis/dream-cycle/status');
      if (dreamResponse.ok) {
        const dreamData = await dreamResponse.json();
        setDreamCycleStatus(dreamData);
      }

      // Load hypotheses
      const hypothesesResponse = await fetch('/api/genesis/hypotheses');
      if (hypothesesResponse.ok) {
        const hypothesesData = await hypothesesResponse.json();
        setHypotheses(hypothesesData);
      }

      // Load active vetoes
      const vetoResponse = await fetch('/api/genesis/veto/active');
      if (vetoResponse.ok) {
        const vetoData = await vetoResponse.json();
        setActiveVetoes(vetoData);
      }

      // Load promotion candidates
      const promotionResponse = await fetch('/api/genesis/promotion/candidates');
      if (promotionResponse.ok) {
        const promotionData = await promotionResponse.json();
        setPromotionCandidates(promotionData);
      }

    } catch (error) {
      console.error('Failed to load genesis data:', error);
      showError('Failed to load', 'Could not load Genesis Flow data');
    } finally {
      setLoading(false);
    }
  };

  const startDreamCycle = async () => {
    try {
      const response = await fetch('/api/genesis/dream-cycle/start', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setDreamCycleStatus(result);
        showSuccess('Dream Cycle Started', 'Genesis Flow dream cycle initiated');
      }
    } catch (error) {
      showError('Failed to start', 'Could not start dream cycle');
    }
  };

  const stopDreamCycle = async () => {
    try {
      const response = await fetch('/api/genesis/dream-cycle/stop', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setDreamCycleStatus(result);
        showInfo('Dream Cycle Stopped', 'Genesis Flow dream cycle stopped');
      }
    } catch (error) {
      showError('Failed to stop', 'Could not stop dream cycle');
    }
  };

  const createHypothesis = async (hypothesis: any) => {
    try {
      const response = await fetch('/api/genesis/hypotheses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hypothesis)
      });
      
      if (response.ok) {
        const result = await response.json();
        setHypotheses(prev => [result, ...prev]);
        showSuccess('Hypothesis Created', 'New hypothesis added to Genesis Flow');
      }
    } catch (error) {
      showError('Failed to create', 'Could not create hypothesis');
    }
  };

  const triggerVeto = async (reason: string, context: string, action: string) => {
    try {
      const response = await fetch('/api/genesis/veto/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, context, action })
      });
      
      if (response.ok) {
        const result = await response.json();
        setActiveVetoes(prev => [result, ...prev]);
        showInfo('Veto Triggered', 'Genesis Flow veto system activated');
      }
    } catch (error) {
      showError('Failed to trigger', 'Could not trigger veto');
    }
  };

  const promoteToHeritage = async (hypothesisId: string, reasoning: string) => {
    try {
      const response = await fetch('/api/genesis/promotion/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesisId, reasoning })
      });
      
      if (response.ok) {
        const result = await response.json();
        showSuccess('Promotion Completed', 'Hypothesis promoted to Heritage DNA');
        
        // Remove from candidates
        setPromotionCandidates(prev => prev.filter(c => c.id !== hypothesisId));
      }
    } catch (error) {
      showError('Failed to promote', 'Could not promote to heritage');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Genesis Flow</h1>
          <p className="text-gray-300">Dream cycle, hypothesis management, and heritage promotion</p>
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-black/20 rounded-lg p-1">
          {['dream-cycle', 'hypotheses', 'veto', 'promotion'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
          {activeTab === 'dream-cycle' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Dream Cycle</h2>
              
              {dreamCycleStatus && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white">Cycle Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      dreamCycleStatus.isActive 
                        ? 'bg-green-600 text-green-200' 
                        : 'bg-gray-600 text-gray-200'
                    }`}>
                      {dreamCycleStatus.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Current Phase:</span>
                      <p className="text-white capitalize">{dreamCycleStatus.currentPhase}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Progress:</span>
                      <p className="text-white">{dreamCycleStatus.progress}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Runs:</span>
                      <p className="text-white">{dreamCycleStatus.totalRuns}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Run:</span>
                      <p className="text-white">
                        {dreamCycleStatus.lastRun 
                          ? new Date(dreamCycleStatus.lastRun).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${dreamCycleStatus.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={startDreamCycle}
                  disabled={dreamCycleStatus?.isActive}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Dream Cycle
                </button>
                <button
                  onClick={stopDreamCycle}
                  disabled={!dreamCycleStatus?.isActive}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stop Dream Cycle
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hypotheses' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Hypotheses</h2>
              
              <div className="space-y-4">
                {hypotheses.map((hypothesis, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{hypothesis.content || 'Untitled Hypothesis'}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        hypothesis.confidence > 0.8 ? 'bg-green-600 text-green-200' :
                        hypothesis.confidence > 0.6 ? 'bg-yellow-600 text-yellow-200' :
                        'bg-red-600 text-red-200'
                      }`}>
                        {(hypothesis.confidence || 0).toFixed(2)} confidence
                      </span>
                    </div>
                    
                    {hypothesis.evidence && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm mb-1">Evidence:</p>
                        <ul className="text-gray-300 text-sm space-y-1">
                          {hypothesis.evidence.map((evidence: string, i: number) => (
                            <li key={i} className="flex items-center">
                              <span className="w-1 h-1 bg-violet-400 rounded-full mr-2"></span>
                              {evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1 bg-violet-600 text-white rounded text-sm hover:bg-violet-700">
                        Test
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Analyze
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Promote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => createHypothesis({
                  content: 'New hypothesis',
                  confidence: 0.5,
                  evidence: []
                })}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Create New Hypothesis
              </button>
            </div>
          )}

          {activeTab === 'veto' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Veto System</h2>
              
              <div className="space-y-4">
                {activeVetoes.map((veto, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{veto.reason || 'Veto Triggered'}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        veto.status === 'active' ? 'bg-red-600 text-red-200' :
                        veto.status === 'resolved' ? 'bg-green-600 text-green-200' :
                        'bg-yellow-600 text-yellow-200'
                      }`}>
                        {veto.status || 'active'}
                      </span>
                    </div>
                    
                    {veto.context && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm">Context:</p>
                        <p className="text-gray-300 text-sm">{veto.context}</p>
                      </div>
                    )}
                    
                    {veto.action && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm">Action:</p>
                        <p className="text-gray-300 text-sm">{veto.action}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                        Resolve
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => triggerVeto('Manual veto', 'User initiated veto', 'test action')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Trigger Veto
              </button>
            </div>
          )}

          {activeTab === 'promotion' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Heritage Promotion</h2>
              
              <div className="space-y-4">
                {promotionCandidates.map((candidate, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{candidate.content || 'Promotion Candidate'}</h3>
                      <span className="px-2 py-1 rounded text-xs bg-green-600 text-green-200">
                        {(candidate.confidence || 0).toFixed(2)} confidence
                      </span>
                    </div>
                    
                    {candidate.reasoning && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm">Reasoning:</p>
                        <p className="text-gray-300 text-sm">{candidate.reasoning}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => promoteToHeritage(candidate.id, 'High confidence and strong evidence')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Promote to Heritage
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
