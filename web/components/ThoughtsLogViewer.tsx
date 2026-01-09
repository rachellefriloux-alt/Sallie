'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'debate' | 'friction' | 'decision' | 'monologue' | 'synthesis' | 'perception';
  content: string;
  metadata?: {
    participants?: string[];
    outcome?: string;
    confidence?: number;
    context?: string;
  };
}

export function ThoughtsLogViewer() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'debates' | 'friction' | 'decisions' | 'monologue'>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { sendMessage, isConnected, lastMessage } = useWebSocket();

  useEffect(() => {
    loadLogEntries();
  }, []);

  useEffect(() => {
    // Handle real-time WebSocket updates
    if (lastMessage && isConnected) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'thoughts-log-update') {
          setEntries(prev => [data.entry, ...prev].slice(0, 1000)); // Keep last 1000 entries
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  }, [lastMessage, isConnected]);

  useEffect(() => {
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadLogEntries, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/monologue/thoughts');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      } else {
        // Fallback to simulated data
        setEntries([
          {
            id: '1',
            timestamp: new Date().toISOString(),
            type: 'debate',
            content: 'Gemini: "We should optimize for efficiency" | INFJ: "We must consider emotional impact"',
            metadata: {
              participants: ['Gemini', 'INFJ'],
              outcome: 'Balanced approach chosen',
              confidence: 0.85,
              context: 'Task prioritization'
            }
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            type: 'monologue',
            content: 'Analyzing user patterns: increased creative output detected, suggesting shift to creative mode',
            metadata: {
              confidence: 0.92,
              context: 'User behavior analysis'
            }
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            type: 'synthesis',
            content: 'Synthesis: Combining analytical insights with emotional intelligence for optimal response',
            metadata: {
              confidence: 0.88,
              context: 'Response generation'
            }
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load log entries:', err);
      // Set fallback data on error
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === 'all') return true;
    if (filter === 'debates' && entry.type === 'debate') return true;
    if (filter === 'friction' && entry.type === 'friction') return true;
    if (filter === 'decisions' && entry.type === 'decision') return true;
    if (filter === 'monologue' && (entry.type === 'monologue' || entry.type === 'synthesis' || entry.type === 'perception')) return true;
    return false;
  });

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      entries: filteredEntries,
      filters: { searchQuery, filter },
      totalEntries: entries.length
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thoughts-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (entryId: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const getTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'debate': return 'text-yellow-400';
      case 'friction': return 'text-red-400';
      case 'decision': return 'text-green-400';
      case 'monologue': return 'text-blue-400';
      case 'synthesis': return 'text-purple-400';
      case 'perception': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'debate': return '⚖️';
      case 'friction': return '⚡';
      case 'decision': return '✅';
      case 'monologue': return '💭';
      case 'synthesis': return '🔮';
      case 'perception': return '👁️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading thoughts log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thoughts Log</h1>
            <p className="text-gray-400">Internal monologue and cognitive processes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log entries..."
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('debates')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'debates' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Debates
            </button>
            <button
              onClick={() => setFilter('friction')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'friction' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Friction
            </button>
            <button
              onClick={() => setFilter('decisions')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'decisions' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Decisions
            </button>
            <button
              onClick={() => setFilter('monologue')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'monologue' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Monologue
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg ${
                autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Auto'}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            <p>No log entries found</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const entryId = entry.id;
            const isExpanded = expandedEntries.has(entryId);
            return (
              <div
                key={entry.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getTypeIcon(entry.type)}</span>
                      <span className={`text-xs font-semibold uppercase ${getTypeColor(entry.type)}`}>
                        {entry.type}
                      </span>
                      <time className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                      {entry.metadata?.confidence && (
                        <span className="text-xs text-gray-400">
                          Confidence: {(entry.metadata.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap mb-2">
                      {isExpanded ? entry.content : `${entry.content.substring(0, 200)}...`}
                    </div>
                    {entry.content.length > 200 && (
                      <button
                        onClick={() => toggleExpand(entryId)}
                        className="text-xs text-violet-400 hover:text-violet-300"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                    {entry.metadata && (
                      <div className="mt-2 text-xs text-gray-400">
                        {entry.metadata.participants && (
                          <div>Participants: {entry.metadata.participants.join(', ')}</div>
                        )}
                        {entry.metadata.outcome && (
                          <div>Outcome: {entry.metadata.outcome}</div>
                        )}
                        {entry.metadata.context && (
                          <div>Context: {entry.metadata.context}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-violet-400">{entries.length}</div>
            <div className="text-xs text-gray-400">Total Entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {entries.filter(e => e.type === 'debate').length}
            </div>
            <div className="text-xs text-gray-400">Debates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {entries.filter(e => e.type === 'decision').length}
            </div>
            <div className="text-xs text-gray-400">Decisions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {entries.filter(e => e.type === 'monologue').length}
            </div>
            <div className="text-xs text-gray-400">Monologues</div>
          </div>
        </div>
      </div>
    </div>
  );
}

