/**
 * Shared Memory Service Interface
 * Used by Web, Mobile, and Desktop platforms
 */

export interface Memory {
  id: string;
  content: string;
  embedding: number[];
  metadata: MemoryMetadata;
  created_at: number;
  updated_at: number;
  access_count: number;
  last_accessed: number;
  salience: number;
  tags: string[];
  actor_id?: string; // For Kinship multi-user support
}

export interface MemoryMetadata {
  type: MemoryType;
  source: MemorySource;
  context?: string;
  emotional_weight?: number;
  importance?: number;
  freshness?: number;
  creator_id?: string;
  session_id?: string;
  interaction_id?: string;
  heritage_relevance?: number;
  hypothesis_id?: string;
  dream_cycle_id?: string;
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  OBSERVATION = 'observation',
  LEARNING = 'learning',
  HERITAGE = 'heritage',
  HYPOTHESIS = 'hypothesis',
  DECISION = 'decision',
  REFLECTION = 'reflection',
  INSIGHT = 'insight',
  PATTERN = 'pattern',
  GOAL = 'goal',
  EVENT = 'event',
  FACT = 'fact',
  QUESTION = 'question',
  ANSWER = 'answer'
}

export enum MemorySource {
  USER_INPUT = 'user_input',
  AI_RESPONSE = 'ai_response',
  SYSTEM_GENERATED = 'system_generated',
  SENSOR_ARRAY = 'sensor_array',
  DREAM_CYCLE = 'dream_cycle',
  CONVERGENCE = 'convergence',
  HERITAGE_IMPORT = 'heritage_import',
  EXTERNAL_IMPORT = 'external_import'
}

export interface MemorySearchRequest {
  query: string;
  query_embedding?: number[];
  limit?: number;
  threshold?: number;
  filters?: MemoryFilter;
  include_metadata?: boolean;
  actor_id?: string;
}

export interface MemoryFilter {
  type?: MemoryType[];
  source?: MemorySource[];
  tags?: string[];
  date_range?: {
    start: number;
    end: number;
  };
  salience_min?: number;
  importance_min?: number;
  creator_id?: string;
  actor_id?: string;
}

export interface MemorySearchResult {
  memories: Memory[];
  total_count: number;
  search_time_ms: number;
  query_used: string;
  filters_applied: MemoryFilter;
}

export interface MemoryCreateRequest {
  content: string;
  metadata: MemoryMetadata;
  tags?: string[];
  actor_id?: string;
  generate_embedding?: boolean;
}

export interface MemoryUpdateRequest {
  id: string;
  content?: string;
  metadata?: Partial<MemoryMetadata>;
  tags?: string[];
  regenerate_embedding?: boolean;
}

export interface MemoryDeleteRequest {
  id: string;
  actor_id?: string;
  permanent?: boolean;
}

export interface MemoryStats {
  total_memories: number;
  memories_by_type: Record<MemoryType, number>;
  memories_by_source: Record<MemorySource, number>;
  average_salience: number;
  most_recent_memory: number;
  oldest_memory: number;
  access_frequency: number;
  storage_size_mb: number;
  actor_stats?: Record<string, {
    memory_count: number;
    last_access: number;
  }>;
}

// Base interface that all platforms will implement
export interface IMemoryService {
  // Memory operations
  createMemory(request: MemoryCreateRequest): Promise<Memory>;
  searchMemories(request: MemorySearchRequest): Promise<MemorySearchResult>;
  getMemoryById(id: string): Promise<Memory | null>;
  updateMemory(request: MemoryUpdateRequest): Promise<Memory>;
  deleteMemory(request: MemoryDeleteRequest): Promise<void>;
  
  // Statistics and metadata
  getStats(): Promise<{ success: boolean; stats: any }>;
  getMetadata(): Promise<{ success: boolean; data: any }>;
  
  // Real-time events
  onMemoryCreated(callback: (memory: Memory) => void): void;
  onMemoryUpdated(callback: (memory: Memory) => void): void;
  onMemoryDeleted(callback: (id: string) => void): void;
  onSearchCompleted(callback: (result: MemorySearchResult) => void): void;
  disconnect(): void;
}

// Configuration for different environments
export interface MemoryServiceConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Default configurations for different platforms
export const MEMORY_CONFIGS = {
  web: {
    baseUrl: typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
      ? 'http://localhost:8751' 
      : 'http://192.168.1.47:8751',
    wsUrl: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
      ? 'ws://localhost:8751'
      : 'ws://192.168.1.47:8751',
    timeout: 10000,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  mobile: {
    baseUrl: 'http://192.168.1.47:8751',
    wsUrl: 'ws://192.168.1.47:8751',
    timeout: 15000,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
  },
  desktop: {
    baseUrl: 'http://localhost:8751',
    wsUrl: 'ws://localhost:8751',
    timeout: 5000,
    reconnectAttempts: 10,
    reconnectDelay: 500,
  },
};

// Event types for real-time updates
export enum MemoryEventType {
  MEMORY_CREATED = 'memory-created',
  MEMORY_UPDATED = 'memory-updated',
  MEMORY_DELETED = 'memory-deleted',
  SEARCH_COMPLETED = 'search-result',
  STATS_UPDATED = 'stats-updated',
}

// Utility functions for all platforms
export class MemoryServiceUtils {
  static formatMemoryType(type: MemoryType): string {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  static getMemoryTypeColor(type: MemoryType): string {
    const colors = {
      [MemoryType.CONVERSATION]: '#8B5CF6',
      [MemoryType.OBSERVATION]: '#3B82F6',
      [MemoryType.LEARNING]: '#10B981',
      [MemoryType.HERITAGE]: '#F59E0B',
      [MemoryType.HYPOTHESIS]: '#EF4444',
      [MemoryType.DECISION]: '#8B5CF6',
      [MemoryType.REFLECTION]: '#6366F1',
      [MemoryType.INSIGHT]: '#EC4899',
      [MemoryType.PATTERN]: '#14B8A6',
      [MemoryType.GOAL]: '#F97316',
      [MemoryType.EVENT]: '#84CC16',
      [MemoryType.FACT]: '#6B7280',
      [MemoryType.QUESTION]: '#F59E0B',
      [MemoryType.ANSWER]: '#10B981',
    };
    return colors[type];
  }

  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  static calculateMemoryAge(created_at: number): string {
    const now = Date.now();
    const diff = now - created_at;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }

  static getSalienceColor(salience: number): string {
    if (salience >= 0.8) return '#EF4444'; // High - Red
    if (salience >= 0.6) return '#F59E0B'; // Medium-High - Amber
    if (salience >= 0.4) return '#10B981'; // Medium - Green
    if (salience >= 0.2) return '#3B82F6'; // Low-Medium - Blue
    return '#6B7280'; // Low - Gray
  }

  static truncateContent(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  static extractKeywords(content: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }

  static calculateRelevanceScore(memory: Memory, query: string): number {
    const content = memory.content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Simple relevance calculation
    let score = 0;
    
    // Exact match
    if (content.includes(queryLower)) {
      score += 1.0;
    }
    
    // Word matches
    const queryWords = queryLower.split(/\s+/);
    const contentWords = content.split(/\s+/);
    
    queryWords.forEach(queryWord => {
      const matches = contentWords.filter(word => word.includes(queryWord)).length;
      score += (matches / contentWords.length) * 0.5;
    });
    
    // Salience boost
    score += memory.salience * 0.2;
    
    // Recency boost (more recent memories get slight boost)
    const ageInHours = (Date.now() - memory.created_at) / (1000 * 60 * 60);
    const recencyBoost = Math.max(0, 1 - ageInHours / (24 * 30)); // Decay over 30 days
    score += recencyBoost * 0.1;
    
    return Math.min(1.0, score);
  }
}
