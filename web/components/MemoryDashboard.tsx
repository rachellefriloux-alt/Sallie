'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryService, MemoryServiceUtils } from '../../../shared/services/memoryService';
import { Memory, MemoryType, MemorySource, MemorySearchRequest } from '../../../shared/services/memoryService';
import { Search, Filter, Calendar, Tag, Brain, Database, Activity } from 'lucide-react';

interface MemoryDashboardProps {
  className?: string;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({ className }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MemoryType | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<MemorySource | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Initialize Memory Service connection
  useEffect(() => {
    const initializeMemoryService = async () => {
      try {
        const memoryService = new MemoryService.MemoryServiceImpl();
        
        // Load initial memories
        await loadMemories();
        
        // Load stats
        const statsResult = await memoryService.getStats();
        setStats(statsResult.stats);
        
        // Set up WebSocket for real-time updates
        const ws = new MemoryService.MemoryServiceWebSocket('ws://localhost:8751');
        
        ws.on('connected', () => {
          setIsConnected(true);
          console.log('Connected to Memory Service WebSocket');
        });
        
        ws.on('disconnected', () => {
          setIsConnected(false);
          console.log('Disconnected from Memory Service WebSocket');
        });
        
        ws.on('memory-created', (memory) => {
          setMemories(prev => [memory, ...prev]);
        });
        
        ws.on('memory-updated', (memory) => {
          setMemories(prev => prev.map(m => m.id === memory.id ? memory : m));
        });
        
        ws.on('memory-deleted', (id) => {
          setMemories(prev => prev.filter(m => m.id !== id));
        });
        
        ws.on('search-result', (result) => {
          setMemories(result.memories);
        });
        
        return () => {
          ws.disconnect();
        };
        
      } catch (error) {
        console.error('Failed to initialize Memory Service:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to Memory Service');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMemoryService();
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const memoryService = new MemoryService.MemoryServiceImpl();
      
      const searchRequest: MemorySearchRequest = {
        query: searchQuery,
        limit: 50,
        filters: {
          type: selectedType !== 'all' ? [selectedType] : undefined,
          source: selectedSource !== 'all' ? [selectedSource] : undefined,
        },
      };
      
      const result = await memoryService.searchMemories(searchRequest);
      setMemories(result.memories);
      
    } catch (error) {
      console.error('Failed to load memories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load memories');
    }
  }, [searchQuery, selectedType, selectedSource]);

  // Update memories when filters change
  useEffect(() => {
    if (!isLoading) {
      loadMemories();
    }
  }, [loadMemories, isLoading]);

  const handleCreateMemory = useCallback(async () => {
    if (!newMemoryContent.trim()) return;

    try {
      const memoryService = new MemoryService.MemoryServiceImpl();
      
      const request = {
        content: newMemoryContent,
        metadata: {
          type: MemoryType.CONVERSATION,
          source: MemorySource.USER_INPUT,
          context: 'User created memory',
        },
        tags: [],
        generate_embedding: true,
      };
      
      const memory = await memoryService.createMemory(request);
      setMemories(prev => [memory, ...prev]);
      setNewMemoryContent('');
      setShowCreateForm(false);
      
    } catch (error) {
      console.error('Failed to create memory:', error);
      setError(error instanceof Error ? error.message : 'Failed to create memory');
    }
  }, [newMemoryContent]);

  const handleDeleteMemory = useCallback(async (memoryId: string) => {
    try {
      const memoryService = new MemoryService.MemoryServiceImpl();
      await memoryService.deleteMemory({ id: memoryId });
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('Failed to delete memory:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete memory');
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Memory Dashboard</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Memory
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Total Memories</div>
                  <div className="text-2xl font-bold text-blue-900">{stats.total_memories}</div>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-600 font-medium">Avg Salience</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(stats.average_salience * 100).toFixed(1)}%
                  </div>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 font-medium">Storage Used</div>
                  <div className="text-2xl font-bold text-purple-900">{stats.storage_size_mb}MB</div>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 font-medium">Access Frequency</div>
                  <div className="text-2xl font-bold text-orange-900">{stats.access_frequency}</div>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadMemories}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <div className="flex space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MemoryType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by memory type"
              title="Filter memories by type"
            >
              <option value="all">All Types</option>
              {Object.values(MemoryType).map(type => (
                <option key={type} value={type}>{MemoryServiceUtils.formatMemoryType(type)}</option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as MemorySource | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by memory source"
              title="Filter memories by source"
            >
              <option value="all">All Sources</option>
              {Object.values(MemorySource).map(source => (
                <option key={source} value={source}>{source.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Memory Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <h3 className="font-semibold text-blue-900 mb-3">Create New Memory</h3>
              <div className="space-y-3">
                <textarea
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  placeholder="Enter memory content..."
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateMemory}
                    disabled={!newMemoryContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Memory
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory List */}
        <div className="space-y-3">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: MemoryServiceUtils.getMemoryTypeColor(memory.metadata.type) + '20', color: MemoryServiceUtils.getMemoryTypeColor(memory.metadata.type) }}
                    >
                      {MemoryServiceUtils.formatMemoryType(memory.metadata.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {memory.metadata.source.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {MemoryServiceUtils.calculateMemoryAge(memory.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-2">
                    {MemoryServiceUtils.truncateContent(memory.content, 200)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>Salience: {(memory.salience * 100).toFixed(1)}%</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Activity className="h-3 w-3" />
                      <span>{memory.access_count} accesses</span>
                    </span>
                  </div>
                  
                  {memory.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {memory.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDeleteMemory(memory.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete memory: ${MemoryServiceUtils.truncateContent(memory.content, 50)}`}
                  title={`Delete memory: ${MemoryServiceUtils.truncateContent(memory.content, 50)}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
          
          {memories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No memories found</p>
              <p className="text-sm">Create your first memory to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      )}
    </div>
  );
};

export default MemoryDashboard;
