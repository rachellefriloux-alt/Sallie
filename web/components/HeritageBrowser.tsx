'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HeritageData {
  core?: any;
  preferences?: any;
  learned?: any;
  version?: string;
}

export function HeritageBrowser() {
  const [heritage, setHeritage] = useState<HeritageData>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<'core' | 'preferences' | 'learned'>('core');
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    loadHeritage();
    loadVersions();
  }, []);

  const loadHeritage = async () => {
    try {
      // In a real implementation, these would be API endpoints
      // For now, we'll simulate loading
      setHeritage({
        core: { version: '1.0', note: 'Heritage core data' },
        preferences: { version: '1.0', note: 'Support preferences' },
        learned: { version: '1.0', learned_beliefs: [], conditional_beliefs: [] },
      });
    } catch (err) {
      console.error('Failed to load heritage:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await fetch(`${API_BASE}/heritage/version/current`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading heritage...</p>
        </div>
      </div>
    );
  }

  const currentData = heritage[selectedFile] || {};

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Heritage Browser</h1>
        <p className="text-gray-400">Explore Sallie's identity DNA and learned beliefs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Heritage Files</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedFile('core')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedFile === 'core'
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                📜 core.json
              </button>
              <button
                onClick={() => setSelectedFile('preferences')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedFile === 'preferences'
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                ⚙️ preferences.json
              </button>
              <button
                onClick={() => setSelectedFile('learned')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  selectedFile === 'learned'
                    ? 'bg-violet-600/20 text-violet-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                🧠 learned.json
              </button>
            </nav>
          </div>

          {/* Version History */}
          {versions.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold mb-2">Version History</h3>
              <ul className="space-y-1 text-sm text-gray-400">
                {versions.map((version, idx) => (
                  <li key={idx} className="hover:text-gray-200 cursor-pointer">
                    v{version.version} - {new Date(version.timestamp * 1000).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold capitalize">{selectedFile}.json</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="px-3 py-1 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm text-gray-300 font-mono">
                {JSON.stringify(currentData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

