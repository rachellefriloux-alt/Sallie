'use client';

import { useState, useEffect } from 'react';

interface ControlStatus {
  creator_has_control: boolean;
  emergency_stop_active: boolean;
  state_locked: boolean;
  can_proceed: boolean;
  last_control_ts: number | null;
  control_reason: string | null;
}

interface HistoryEntry {
  action: string;
  timestamp: number;
  datetime: string;
  reason?: string;
}

export function ControlPanel() {
  const [status, setStatus] = useState<ControlStatus>({
    creator_has_control: false,
    emergency_stop_active: false,
    state_locked: false,
    can_proceed: true,
    last_control_ts: null,
    control_reason: null,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [advisoryMode, setAdvisoryMode] = useState(false);
  const [trustLevel, setTrustLevel] = useState(0.5);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/control/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
      
      const historyResponse = await fetch('/api/control/history?limit=10');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }
    } catch (err) {
      console.error('Failed to load control status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, reason?: string) => {
    try {
      const response = await fetch(`/api/control/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || `${action} via web dashboard` }),
      });
      
      if (response.ok) {
        await loadStatus();
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
  };

  const formatTimestamp = (ts: number | null) => {
    if (!ts) return 'Never';
    return new Date(ts * 1000).toLocaleString();
  };

  const getTierName = (trust: number) => {
    if (trust < 0.6) return 'Stranger';
    if (trust < 0.8) return 'Associate';
    if (trust < 0.9) return 'Partner';
    return 'Surrogate';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Control Panel</h1>
        <p className="text-gray-400">Creator control mechanisms and agency management</p>
      </div>

      {/* Current Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Current Status</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Control Mode</p>
            <p className={`text-lg font-semibold ${status.creator_has_control ? 'text-orange-400' : 'text-green-400'}`}>
              {status.creator_has_control ? 'Creator Control' : 'Autonomous'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">State Lock</p>
            <p className={`text-lg font-semibold ${status.state_locked ? 'text-orange-400' : 'text-green-400'}`}>
              {status.state_locked ? 'Locked' : 'Unlocked'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Emergency Stop</p>
            <p className={`text-lg font-semibold ${status.emergency_stop_active ? 'text-red-500' : 'text-green-400'}`}>
              {status.emergency_stop_active ? 'ACTIVE' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Control Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAction('take')}
            disabled={status.creator_has_control}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
          >
            Take Control
          </button>
          <button
            onClick={() => handleAction('release')}
            disabled={!status.creator_has_control}
            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
          >
            Release Control
          </button>
          <button
            onClick={() => handleAction('lock')}
            disabled={status.state_locked}
            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
          >
            Lock State
          </button>
          <button
            onClick={() => handleAction('unlock')}
            disabled={!status.state_locked}
            className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
          >
            Unlock State
          </button>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-gray-800 rounded-lg p-6 border border-red-600">
        <h2 className="text-lg font-semibold text-red-500 mb-2">Emergency Controls</h2>
        <p className="text-gray-400 text-sm mb-4">
          Use these controls only in emergency situations. Emergency stop will immediately halt all autonomous actions.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (confirm('This will immediately halt all autonomous actions. Are you sure?')) {
                handleAction('emergency_stop');
              }
            }}
            disabled={status.emergency_stop_active}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-bold transition-colors"
          >
            🛑 EMERGENCY STOP
          </button>
          {status.emergency_stop_active && (
            <button
              onClick={() => handleAction('resume')}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Resume Operations
            </button>
          )}
        </div>
      </div>

      {/* Agency Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agency Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Advisory Mode</p>
              <p className="text-gray-400 text-sm">Sallie asks before acting</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={advisoryMode}
                onChange={(e) => setAdvisoryMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Current Trust Level</p>
            <p className="text-white">{trustLevel.toFixed(2)} - {getTierName(trustLevel)} Level</p>
          </div>
        </div>
      </div>

      {/* Control History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Control History</h2>
          <button
            onClick={loadStatus}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Refresh
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-500 italic">No recent control activity</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                <span className="text-white">{entry.action.replace(/_/g, ' ')}</span>
                <span className="text-gray-500 text-sm">{formatTimestamp(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
