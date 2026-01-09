'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';

export default function OmnisPage() {
  const [activeMode, setActiveMode] = useState<string>('architect');
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { sendMessage, isConnected } = useWebSocket();
  const { showInfo, showSuccess, showError } = useNotifications();

  useEffect(() => {
    loadOmnisData();
  }, []);

  const loadOmnisData = async () => {
    try {
      // Load knowledge base
      const kbResponse = await fetch('/api/omnis/knowledge-base');
      if (kbResponse.ok) {
        const kbData = await kbResponse.json();
        setKnowledgeBase(kbData);
      }

      // Load statistics
      const statsResponse = await fetch('/api/omnis/statistics');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }

      // Load history
      const historyResponse = await fetch('/api/omnis/history');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.queries);
      }

    } catch (error) {
      console.error('Failed to load OMNIS data:', error);
      showError('Failed to load', 'Could not load OMNIS system data');
    }
  };

  const processQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/omnis/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context })
      });

      if (response.ok) {
        const data = await response.json();
        setResponse(data);
        showSuccess('Query processed', 'OMNIS analysis completed successfully');
      }
    } catch (error) {
      console.error('Failed to process query:', error);
      showError('Failed to process', 'Could not process OMNIS query');
    } finally {
      setLoading(false);
    }
  };

  const setMode = async (modeId: string) => {
    try {
      const response = await fetch(`/api/omnis/modes/${modeId}/activate`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setActiveMode(modeId);
        showInfo('Mode changed', `Switched to ${data.activeMode.name}`);
      }
    } catch (error) {
      console.error('Failed to set mode:', error);
      showError('Failed to set mode', 'Could not change OMNIS mode');
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'tier-1': return 'text-blue-400';
      case 'tier-2': return 'text-green-400';
      case 'tier-3': return 'text-yellow-400';
      case 'tier-4': return 'text-purple-400';
      case 'tier-5': return 'text-pink-400';
      case 'tier-6': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'architect': return '🏗️';
      case 'oracle': return '🔮';
      case 'optimizer': return '⚡';
      default: return '🧠';
    }
  };

  const filteredKnowledgeBase = selectedTier === 'all' 
    ? knowledgeBase 
    : knowledgeBase.filter(kb => kb.tier.id === selectedTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SALLIE OMNIS ARCHITECTURE</h1>
          <p className="text-gray-300">Universal Architect with unified knowledge base integrating 52,000+ topics</p>
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

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Knowledge Domains</h3>
              <p className="text-lg font-semibold text-white">{statistics.totalKnowledgeDomains}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Total Queries</h3>
              <p className="text-lg font-semibold text-white">{statistics.totalQueries}</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Average Expertise</h3>
              <p className="text-lg font-semibold text-white">{statistics.averageExpertise.toFixed(1)}%</p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-violet-500/30 p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-1">Active Mode</h3>
              <p className="text-lg font-semibold text-white">{getModeIcon(activeMode)} {activeMode}</p>
            </div>
          </div>
        )}

        {/* Operational Modes */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Operational Modes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMode('architect')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'architect'
                  ? 'bg-violet-600 border-violet-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-violet-500'
              }`}
            >
              <div className="text-2xl mb-2">🏗️</div>
              <h3 className="font-semibold mb-1">ARCHITECT</h3>
              <p className="text-sm opacity-80">Design, explain, or create</p>
            </button>
            
            <button
              onClick={() => setMode('oracle')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'oracle'
                  ? 'bg-violet-600 border-violet-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-violet-500'
              }`}
            >
              <div className="text-2xl mb-2">🔮</div>
              <h3 className="font-semibold mb-1">ORACLE</h3>
              <p className="text-sm opacity-80">Predict, analyze trends, uncover secrets</p>
            </button>
            
            <button
              onClick={() => setMode('optimizer')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'optimizer'
                  ? 'bg-violet-600 border-violet-400 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-violet-500'
              }`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">OPTIMIZER</h3>
              <p className="text-sm opacity-80">Personal advice, health, growth</p>
            </button>
          </div>
        </div>

        {/* Query Interface */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Query Interface</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Query</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query for OMNIS analysis..."
                className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Context (Optional)</label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Additional context for the query..."
                className="w-full px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={processQuery}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Process Query'}
              </button>
              
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">OMNIS Response</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Mode: {response.mode}</span>
                <span className="text-sm text-gray-400">Confidence: {(response.synthesis.confidence * 100).toFixed(1)}%</span>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{response.content}</pre>
              </div>
              
              {response.synthesis.predictions && response.synthesis.predictions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Predictions</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {response.synthesis.predictions.map((prediction: string, index: number) => (
                      <li key={index}>{prediction}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {response.synthesis.recommendations && response.synthesis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {response.synthesis.recommendations.map((recommendation: string, index: number) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Base Browser */}
        <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Knowledge Base</h2>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="tier-1">Tier I: Concrete Reality</option>
              <option value="tier-2">Tier II: Digital Synthesis</option>
              <option value="tier-3">Tier III: Social Structure</option>
              <option value="tier-4">Tier IV: Human Software</option>
              <option value="tier-5">Tier V: Hidden Knowledge</option>
              <option value="tier-6">Tier VI: Cosmic & Paranormal</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKnowledgeBase.map((domain) => (
              <div key={domain.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{domain.title}</h3>
                  <span className={`text-xs font-medium ${getTierColor(domain.tier.id)}`}>
                    {domain.tier.name}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{domain.tier.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Expertise: {domain.expertise}%</span>
                  <span>Access: {domain.accessCount}</span>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {domain.topics.slice(0, 3).map((topic: string, index: number) => (
                      <span key={index} className="text-xs bg-violet-600/20 text-violet-400 px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                    {domain.topics.length > 3 && (
                      <span className="text-xs text-gray-400">+{domain.topics.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Query History */}
        {history.length > 0 && (
          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Query History</h2>
            <div className="space-y-4">
              {history.slice(0, 10).map((query) => (
                <div key={query.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{query.query}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(query.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Mode: {query.mode.name}</span>
                    <span>Intent: {query.userIntent}</span>
                    <span>Confidence: {(query.synthesis.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
