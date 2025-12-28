'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Hypothesis {
  id: string;
  pattern: string;
  evidence: Array<{ timestamp: number; observation: string }>;
  weight: number;
  status: 'pending_veto' | 'testing' | 'near_heritage' | 'rejected';
  conditional?: any;
  category: string;
}

export function HypothesisManager() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);

  useEffect(() => {
    loadHypotheses();
  }, []);

  const loadHypotheses = async () => {
    try {
      const response = await fetch(`${API_BASE}/ghost/veto_pending`);
      if (response.ok) {
        const data = await response.json();
        setHypotheses(data.hypotheses || []);
      }
    } catch (err) {
      console.error('Failed to load hypotheses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (hypothesisId: string, action: 'confirm' | 'deny' | 'add_context') => {
    try {
      // In a real implementation, this would call an API endpoint
      console.log(`Action: ${action} on hypothesis ${hypothesisId}`);
      
      if (action === 'confirm') {
        // Confirm hypothesis
      } else if (action === 'deny') {
        // Deny hypothesis
      } else if (action === 'add_context') {
        // Add context to hypothesis
      }
      
      await loadHypotheses();
    } catch (err) {
      console.error('Failed to process action:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading hypotheses...</p>
        </div>
      </div>
    );
  }

  const pendingHypotheses = hypotheses.filter((h) => h.status === 'pending_veto');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hypothesis Management</h1>
        <p className="text-gray-400">Review and validate patterns discovered by the Dream Cycle</p>
      </div>

      {pendingHypotheses.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
          <p>No pending hypotheses</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingHypotheses.map((hypothesis) => (
            <div
              key={hypothesis.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{hypothesis.pattern}</h3>
                  <span className="text-xs px-2 py-1 bg-violet-600/20 text-violet-400 rounded">
                    {hypothesis.category}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Weight: {hypothesis.weight.toFixed(2)} | Evidence: {hypothesis.evidence.length} observations
                </div>
              </div>

              {/* Evidence */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Evidence</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  {hypothesis.evidence.slice(0, 3).map((ev, idx) => (
                    <li key={idx}>
                      • {ev.observation} ({new Date(ev.timestamp * 1000).toLocaleDateString()})
                    </li>
                  ))}
                  {hypothesis.evidence.length > 3 && (
                    <li className="text-gray-500">... and {hypothesis.evidence.length - 3} more</li>
                  )}
                </ul>
              </div>

              {/* Conditional Belief */}
              {hypothesis.conditional && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">Conditional Belief</h4>
                  <p className="text-sm text-gray-400">
                    {hypothesis.conditional.base_belief} EXCEPT when {hypothesis.conditional.exception}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(hypothesis.id, 'confirm')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleAction(hypothesis.id, 'deny')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => handleAction(hypothesis.id, 'add_context')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Add Context
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

