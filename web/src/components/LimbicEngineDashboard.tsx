import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { LimbicEngine, LimbicEngineUtils } from '../../../shared/services/limbicEngine';
import { LimbicState, PostureMode, SystemMode, TrustTier } from '../../../shared/services/limbicEngine';

interface LimbicEngineDashboardProps {
  className?: string;
}

export const LimbicEngineDashboard: React.FC<LimbicEngineDashboardProps> = ({ className }) => {
  const [currentState, setCurrentState] = useState<LimbicState | null>(null);
  const [trustTier, setTrustTier] = useState<TrustTier | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isElasticMode, setIsElasticMode] = useState(false);
  const [perceptionInput, setPerceptionInput] = useState('');
  const [perceptionResult, setPerceptionResult] = useState<any>(null);

  // Initialize limbic engine connection
  useEffect(() => {
    const limbicService = new LimbicEngine.LimbicEngineServiceImpl();
    
    const loadInitialState = async () => {
      try {
        const [state, trust] = await Promise.all([
          limbicService.getCurrentState(),
          limbicService.getTrustTier()
        ]);
        
        setCurrentState(state);
        setTrustTier(trust.current);
        setIsElasticMode(state.elastic_mode);
        
        // Load history
        const historyResult = await limbicService.getInteractionHistory();
        setHistory(historyResult.history || []);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load limbic state');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialState();

    // Set up real-time updates
    const ws = new LimbicEngine.LimbicEngineWebSocket('ws://localhost:8750');
    
    ws.on('limbic-state', (data) => {
      setCurrentState(data);
      setIsElasticMode(data.elastic_mode);
    });

    ws.on('trust-change', (data) => {
      setTrustTier(data.tier);
    });

    return () => {
      ws.disconnect();
    };
  }, []);

  const handleProcessPerception = useCallback(async () => {
    if (!perceptionInput.trim()) return;

    try {
      const limbicService = new LimbicEngine.LimbicEngineServiceImpl();
      const result = await limbicService.processPerception(perceptionInput);
      
      setPerceptionResult(result);
      setCurrentState(result.new_state);
      
      // Clear input after processing
      setPerceptionInput('');
      
      // Update history
      const historyResult = await limbicService.getInteractionHistory();
      setHistory(historyResult.history || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process perception');
    }
  }, [perceptionInput]);

  const handleToggleElasticMode = useCallback(async () => {
    try {
      const limbicService = new LimbicEngine.LimbicEngineServiceImpl();
      const result = isElasticMode 
        ? await limbicService.disableElasticMode()
        : await limbicService.enableElasticMode();
      
      setIsElasticMode(result.success);
      setCurrentState(result.state);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle elastic mode');
    }
  }, [isElasticMode]);

  const handleTriggerReunionSurge = useCallback(async () => {
    try {
      const limbicService = new LimbicEngine.LimbicEngineServiceImpl();
      const result = await limbicService.triggerReunionSurge();
      
      setCurrentState(result.state);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger reunion surge');
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  if (!currentState) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-gray-800">No limbic state available</div>
      </div>
    );
  }

  // Prepare chart data
  const limbicVariables = [
    { name: 'Trust', value: currentState.trust * 100, fill: '#10B981' },
    { name: 'Warmth', value: currentState.warmth * 100, fill: '#F59E0B' },
    { name: 'Arousal', value: currentState.arousal * 100, fill: '#EF4444' },
    { name: 'Valence', value: currentState.valence * 100, fill: '#3B82F6' },
    { name: 'Empathy', value: currentState.empathy * 100, fill: '#8B5CF6' },
    { name: 'Intuition', value: currentState.intuition * 100, fill: '#EC4899' },
    { name: 'Creativity', value: currentState.creativity * 100, fill: '#14B8A6' },
    { name: 'Wisdom', value: currentState.wisdom * 100, fill: '#F97316' },
    { name: 'Humor', value: currentState.humor * 100, fill: '#84CC16' },
  ];

  const extendedVariables = [
    { name: 'Empathy', value: currentState.empathy * 100, fill: '#8B5CF6' },
    { name: 'Intuition', value: currentState.intuition * 100, fill: '#EC4899' },
    { name: 'Creativity', value: currentState.creativity * 100, fill: '#14B8A6' },
    { name: 'Wisdom', value: currentState.wisdom * 100, fill: '#F97316' },
    { name: 'Humor', value: currentState.humor * 100, fill: '#84CC16' },
  ];

  const historyData = history.slice(-20).map((item, index) => ({
    time: index,
    trust: item.trust * 100,
    warmth: item.warmth * 100,
    arousal: item.arousal * 100,
    valence: item.valence * 100,
  }));

  const healthScore = LimbicEngineUtils.calculateLimbicHealth(currentState);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Limbic Engine Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentState.mode === SystemMode.LIVE ? 'bg-green-100 text-green-800' :
              currentState.mode === SystemMode.SLUMBER ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentState.mode}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentState.elastic_mode ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {currentState.elastic_mode ? 'Elastic' : 'Standard'}
            </div>
          </div>
        </div>

        {/* Trust Tier and Health Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Trust Tier</div>
            <div className="text-2xl font-bold text-purple-900">{trustTier?.name || 'Unknown'}</div>
            <div className="text-sm text-purple-600">
              {LimbicEngineUtils.formatTrustScore(currentState.trust)}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Posture</div>
            <div className="text-2xl font-bold text-blue-900">{currentState.posture}</div>
            <div className="text-sm text-blue-600">
              {currentState.interaction_count} interactions
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Health Score</div>
            <div className="text-2xl font-bold text-green-900">{healthScore.toFixed(1)}%</div>
            <div className="text-sm text-green-600">
              Overall balance
            </div>
          </div>
        </div>

        {/* Core Variables Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Limbic Variables</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={limbicVariables}>
              <PolarAngleAxis type="number" domain={[0, 100]} />
              <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Extended Variables */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Extended Human-Level Variables</h3>
          <div className="grid grid-cols-5 gap-4">
            {extendedVariables.map((variable) => (
              <div key={variable.name} className="text-center">
                <div 
                  className="w-full bg-gray-200 rounded-full h-2 mb-2"
                  style={{ backgroundColor: '#E5E7EB' }}
                >
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${variable.value}%`,
                      backgroundColor: variable.fill 
                    }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900">{variable.name}</div>
                <div className="text-xs text-gray-500">{variable.value.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Trends */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="trust" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="warmth" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="arousal" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="valence" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Controls</h3>
          
          {/* Perception Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={perceptionInput}
              onChange={(e) => setPerceptionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleProcessPerception()}
              placeholder="Enter perception to process..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleProcessPerception}
              disabled={!perceptionInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Process
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleToggleElasticMode}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isElasticMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isElasticMode ? 'Disable Elastic Mode' : 'Enable Elastic Mode'}
            </button>
            
            <button
              onClick={handleTriggerReunionSurge}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Trigger Reunion Surge
            </button>
          </div>
        </div>

        {/* Perception Result */}
        <AnimatePresence>
          {perceptionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <h4 className="font-semibold text-blue-900 mb-2">Perception Result</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Emotion:</strong> {perceptionResult.result.detected_emotion}</div>
                <div><strong>Urgency:</strong> {perceptionResult.result.urgency}</div>
                <div><strong>Alignment:</strong> {perceptionResult.result.alignment_score.toFixed(3)}</div>
                <div><strong>Processing Time:</strong> {perceptionResult.result.processing_time_ms}ms</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LimbicEngineDashboard;
