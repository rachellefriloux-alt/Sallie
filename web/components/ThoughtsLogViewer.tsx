'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface LogEntry {
  timestamp: string;
  type: string;
  content: string;
  metadata?: any;
}

export function ThoughtsLogViewer() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'debates' | 'friction' | 'decisions'>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLogEntries();
  }, []);

  const loadLogEntries = async () => {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate loading
      setEntries([
        {
          timestamp: new Date().toISOString(),
          type: 'debate',
          content: 'Gemini proposed options, INFJ filtered...',
        },
      ]);
    } catch (err) {
      console.error('Failed to load log entries:', err);
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
    return false;
  });

  const handleExport = () => {
    const exportData = filteredEntries;
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
        <h1 className="text-3xl font-bold mb-2">Thoughts Log</h1>
        <p className="text-gray-400">Internal monologue and cognitive processes</p>
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
          filteredEntries.map((entry, idx) => {
            const entryId = `entry-${idx}`;
            const isExpanded = expandedEntries.has(entryId);
            return (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-violet-400 uppercase">
                        {entry.type}
                      </span>
                      <time className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                    </div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {isExpanded ? entry.content : `${entry.content.substring(0, 200)}...`}
                    </div>
                    {entry.content.length > 200 && (
                      <button
                        onClick={() => toggleExpand(entryId)}
                        className="text-xs text-violet-400 hover:text-violet-300 mt-2"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

