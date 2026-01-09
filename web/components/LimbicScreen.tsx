'use client';

import { useState, useEffect } from 'react';
import { LimbicGauges } from './LimbicGauges';
import { useLimbicStore } from '@/store/useLimbicStore';
import { useWebSocket } from '@/hooks/useWebSocket';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LimbicHistoryEntry {
  timestamp: number;
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  event?: string;
}

export function LimbicScreen() {
  const { state: limbicState, updateState } = useLimbicStore();
  const [history, setHistory] = useState<LimbicHistoryEntry[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LimbicHistoryEntry | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const { connect, isConnected } = useWebSocket();

  useEffect(() => {
    // Load historical data
    loadHistory();

    // Subscribe to real-time updates
    connect((data) => {
      if (data.type === 'limbic_update' && data.state) {
        updateState(data.state);
        // Add to history
        addHistoryEntry(data.state);
      }
    });
  }, []);

  const loadHistory = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll use localStorage or fetch from thoughts.log
      const stored = localStorage.getItem('limbic_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const addHistoryEntry = (state: any) => {
    const entry: LimbicHistoryEntry = {
      timestamp: Date.now(),
      trust: state.trust || 0,
      warmth: state.warmth || 0,
      arousal: state.arousal || 0,
      valence: state.valence || 0,
      posture: state.posture || 'PEER',
    };
    
    setHistory((prev) => {
      const updated = [...prev, entry].slice(-1000); // Keep last 1000 entries
      localStorage.setItem('limbic_history', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredHistory = history.filter((entry) => {
    const now = Date.now();
    const entryTime = entry.timestamp;
    const ranges = {
      '1h': 3600000,
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
    };
    return now - entryTime < ranges[timeRange];
  });

  const getSignificantEvents = () => {
    const events: LimbicHistoryEntry[] = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      
      // Detect significant changes
      const trustDelta = Math.abs(curr.trust - prev.trust);
      const warmthDelta = Math.abs(curr.warmth - prev.warmth);
      const arousalDelta = Math.abs(curr.arousal - prev.arousal);
      const valenceDelta = Math.abs(curr.valence - prev.valence);
      
      if (trustDelta > 0.1 || warmthDelta > 0.1 || arousalDelta > 0.1 || valenceDelta > 0.2) {
        events.push({
          ...curr,
          event: `Significant state change: Trust ${trustDelta > 0.1 ? `±${trustDelta.toFixed(2)}` : ''} ${warmthDelta > 0.1 ? `Warmth ±${warmthDelta.toFixed(2)}` : ''}`,
        });
      }
    }
    return events;
  };

  const significantEvents = getSignificantEvents();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Limbic State</h1>
        <p className="text-gray-400">Real-time emotional state and historical trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current State */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            {limbicState ? (
              <LimbicGauges state={limbicState} />
            ) : (
              <p className="text-gray-400">Loading...</p>
            )}
          </div>
        </div>

        {/* Historical Graph */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Historical Trends</h2>
              <select
                aria-label="Select time range for historical trends"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-gray-700 text-gray-100 px-3 py-1 rounded-lg border border-gray-600"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {filteredHistory.length > 0 ? (
              <div className="h-64 relative">
                {/* Simple line chart visualization */}
                <svg width="100%" height="100%" className="overflow-visible">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y * 100 + '%'}
                      x2="100%"
                      y2={y * 100 + '%'}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Trust line */}
                  {filteredHistory.length > 1 && (
                    <polyline
                      points={filteredHistory
                        .map(
                          (entry, idx) =>
                            `${(idx / (filteredHistory.length - 1)) * 100},${
                              (1 - entry.trust) * 100
                            }`
                        )
                        .join(' ')}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                    />
                  )}

                  {/* Warmth line */}
                  {filteredHistory.length > 1 && (
                    <polyline
                      points={filteredHistory
                        .map(
                          (entry, idx) =>
                            `${(idx / (filteredHistory.length - 1)) * 100},${
                              (1 - entry.warmth) * 100
                            }`
                        )
                        .join(' ')}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                    />
                  )}

                  {/* Arousal line */}
                  {filteredHistory.length > 1 && (
                    <polyline
                      points={filteredHistory
                        .map(
                          (entry, idx) =>
                            `${(idx / (filteredHistory.length - 1)) * 100},${
                              (1 - entry.arousal) * 100
                            }`
                        )
                        .join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  )}

                  {/* Event markers */}
                  {significantEvents.map((event, idx) => {
                    const xPos =
                      ((event.timestamp - filteredHistory[0]?.timestamp || 0) /
                        (filteredHistory[filteredHistory.length - 1]?.timestamp -
                          filteredHistory[0]?.timestamp || 1)) *
                      100;
                    return (
                      <circle
                        key={idx}
                        cx={`${xPos}%`}
                        cy="50%"
                        r="4"
                        fill="#ef4444"
                        className="cursor-pointer hover:r-6"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <title>{event.event ?? ''}</title>
                      </circle>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-violet-500"></div>
                    <span className="text-gray-400">Trust</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-cyan-500"></div>
                    <span className="text-gray-400">Warmth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span className="text-gray-400">Arousal</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No historical data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Event Details</h3>
          <p className="text-gray-400 mb-4">{selectedEvent.event}</p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500">Trust</div>
              <div className="text-lg font-semibold">{selectedEvent.trust.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Warmth</div>
              <div className="text-lg font-semibold">{selectedEvent.warmth.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Arousal</div>
              <div className="text-lg font-semibold">{selectedEvent.arousal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Valence</div>
              <div className="text-lg font-semibold">{selectedEvent.valence.toFixed(2)}</div>
            </div>
          </div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-4 text-sm text-violet-400 hover:text-violet-300"
          >
            Close
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="text-center text-sm text-gray-500">
        Status: {isConnected ? (
          <span className="text-emerald-400">Connected</span>
        ) : (
          <span className="text-red-400">Disconnected</span>
        )}
      </div>
    </div>
  );
}

