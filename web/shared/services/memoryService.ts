// Memory Service Implementation for Sallie Studio
// Provides comprehensive memory management, storage, and retrieval capabilities

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  source: MemorySource;
  timestamp: number;
  metadata: {
    emotionalTone?: string;
    importance?: number;
    tags?: string[];
    relatedMemories?: string[];
    context?: string;
  };
  embedding?: number[];
  accessCount: number;
  lastAccessed: number;
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  EXPERIENCE = 'experience',
  KNOWLEDGE = 'knowledge',
  EMOTION = 'emotion',
  REFLECTION = 'reflection',
  GOAL = 'goal',
  INSIGHT = 'insight'
}

export enum MemorySource {
  USER = 'user',
  SALLIE = 'sallie',
  SYSTEM = 'system',
  EXTERNAL = 'external'
}

export interface MemorySearchRequest {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    type?: MemoryType[];
    source?: MemorySource[];
    dateRange?: {
      start: number;
      end: number;
    };
    tags?: string[];
    importance?: number;
  };
  sortBy?: 'relevance' | 'timestamp' | 'importance' | 'accessCount';
  sortOrder?: 'asc' | 'desc';
}

export interface MemorySearchResponse {
  memories: Memory[];
  total: number;
  hasMore: boolean;
  suggestions?: string[];
}

export interface MemoryStats {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  memoriesBySource: Record<MemorySource, number>;
  averageImportance: number;
  mostAccessed: Memory[];
  recentMemories: Memory[];
  storageUsage: number;
}

// Memory Service Implementation
export class MemoryServiceImpl {
  private memories: Map<string, Memory> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  constructor() {
    this.initializeDefaultMemories();
  }

  private initializeDefaultMemories(): void {
    // Initialize with some default memories for demonstration
    const defaultMemories: Memory[] = [
      {
        id: 'mem-1',
        content: 'First conversation with Creator',
        type: MemoryType.CONVERSATION,
        source: MemorySource.USER,
        timestamp: Date.now() - 86400000,
        metadata: {
          emotionalTone: 'positive',
          importance: 8,
          tags: ['first', 'conversation', 'creator'],
          context: 'Initial interaction'
        },
        accessCount: 5,
        lastAccessed: Date.now() - 3600000
      },
      {
        id: 'mem-2',
        content: 'Learned about Creator\'s preferences',
        type: MemoryType.KNOWLEDGE,
        source: MemorySource.SALLIE,
        timestamp: Date.now() - 43200000,
        metadata: {
          emotionalTone: 'neutral',
          importance: 7,
          tags: ['preferences', 'learning', 'creator'],
          context: 'Preference analysis'
        },
        accessCount: 3,
        lastAccessed: Date.now() - 1800000
      }
    ];

    defaultMemories.forEach(memory => {
      this.memories.set(memory.id, memory);
    });
  }

  async createMemory(memoryData: Omit<Memory, 'id' | 'timestamp' | 'accessCount' | 'lastAccessed'>): Promise<Memory> {
    const memory: Memory = {
      ...memoryData,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.memories.set(memory.id, memory);
    
    // Generate embedding (simplified)
    if (memory.content) {
      const embedding = await this.generateEmbedding(memory.content);
      memory.embedding = embedding;
      this.embeddings.set(memory.id, embedding);
    }

    return memory;
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | null> {
    const memory = this.memories.get(id);
    if (!memory) return null;

    const updatedMemory = { ...memory, ...updates };
    this.memories.set(id, updatedMemory);
    return updatedMemory;
  }

  async deleteMemory(id: string): Promise<boolean> {
    const deleted = this.memories.delete(id);
    if (deleted) {
      this.embeddings.delete(id);
    }
    return deleted;
  }

  async getMemory(id: string): Promise<Memory | null> {
    const memory = this.memories.get(id);
    if (memory) {
      memory.accessCount += 1;
      memory.lastAccessed = Date.now();
      this.memories.set(id, memory);
    }
    return memory || null;
  }

  async searchMemories(request: MemorySearchRequest): Promise<MemorySearchResponse> {
    let memories = Array.from(this.memories.values());

    // Apply filters
    if (request.filters) {
      if (request.filters.type?.length) {
        memories = memories.filter(m => request.filters!.type!.includes(m.type));
      }
      if (request.filters.source?.length) {
        memories = memories.filter(m => request.filters!.source!.includes(m.source));
      }
      if (request.filters.dateRange) {
        memories = memories.filter(m => 
          m.timestamp >= request.filters!.dateRange!.start && 
          m.timestamp <= request.filters!.dateRange!.end
        );
      }
      if (request.filters.tags?.length) {
        memories = memories.filter(m => 
          m.metadata.tags?.some(tag => request.filters!.tags!.includes(tag))
        );
      }
      if (request.filters.importance !== undefined) {
        memories = memories.filter(m => 
          (m.metadata.importance || 0) >= request.filters!.importance!
        );
      }
    }

    // Text search
    if (request.query) {
      const query = request.query.toLowerCase();
      memories = memories.filter(m => 
        m.content.toLowerCase().includes(query) ||
        m.metadata.context?.toLowerCase().includes(query) ||
        m.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sortBy = request.sortBy || 'timestamp';
    const sortOrder = request.sortOrder || 'desc';
    
    memories.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'importance':
          comparison = (a.metadata.importance || 0) - (b.metadata.importance || 0);
          break;
        case 'accessCount':
          comparison = a.accessCount - b.accessCount;
          break;
        case 'relevance':
        default:
          // Simplified relevance based on query matching
          const aRelevance = this.calculateRelevance(a, request.query);
          const bRelevance = this.calculateRelevance(b, request.query);
          comparison = aRelevance - bRelevance;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const limit = request.limit || 50;
    const offset = request.offset || 0;
    const paginatedMemories = memories.slice(offset, offset + limit);

    return {
      memories: paginatedMemories,
      total: memories.length,
      hasMore: offset + limit < memories.length,
      suggestions: this.generateSuggestions(request.query)
    };
  }

  async getStats(): Promise<MemoryStats> {
    const memories = Array.from(this.memories.values());
    
    const memoriesByType = memories.reduce((acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1;
      return acc;
    }, {} as Record<MemoryType, number>);

    const memoriesBySource = memories.reduce((acc, memory) => {
      acc[memory.source] = (acc[memory.source] || 0) + 1;
      return acc;
    }, {} as Record<MemorySource, number>);

    const averageImportance = memories.reduce((sum, m) => sum + (m.metadata.importance || 0), 0) / memories.length;

    const mostAccessed = memories
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);

    const recentMemories = memories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalMemories: memories.length,
      memoriesByType,
      memoriesBySource,
      averageImportance,
      mostAccessed,
      recentMemories,
      storageUsage: JSON.stringify(memories).length
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation (in production, use actual embedding model)
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 128] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateRelevance(memory: Memory, query: string): number {
    if (!query) return 0;
    
    const queryLower = query.toLowerCase();
    let relevance = 0;
    
    // Content matching
    if (memory.content.toLowerCase().includes(queryLower)) {
      relevance += 10;
    }
    
    // Context matching
    if (memory.metadata.context?.toLowerCase().includes(queryLower)) {
      relevance += 5;
    }
    
    // Tag matching
    memory.metadata.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        relevance += 3;
      }
    });
    
    // Boost based on importance and access
    relevance += (memory.metadata.importance || 0) * 0.1;
    relevance += memory.accessCount * 0.01;
    
    return relevance;
  }

  private generateSuggestions(query: string): string[] {
    // Simple suggestion generation based on existing memories
    const memories = Array.from(this.memories.values());
    const allTags = memories.flatMap(m => m.metadata.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    
    return uniqueTags
      .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }
}

// Memory Service Utils
export class MemoryServiceUtils {
  static formatMemoryType(type: MemoryType): string {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }

  static formatMemorySource(source: MemorySource): string {
    return source.charAt(0).toUpperCase() + source.slice(1);
  }

  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  static formatDuration(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }

  static getImportanceColor(importance: number): string {
    if (importance >= 8) return 'text-red-600';
    if (importance >= 6) return 'text-orange-600';
    if (importance >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  }

  static getTypeIcon(type: MemoryType): string {
    switch (type) {
      case MemoryType.CONVERSATION: return '💬';
      case MemoryType.EXPERIENCE: return '🎯';
      case MemoryType.KNOWLEDGE: return '📚';
      case MemoryType.EMOTION: return '❤️';
      case MemoryType.REFLECTION: return '🤔';
      case MemoryType.GOAL: return '🎯';
      case MemoryType.INSIGHT: return '💡';
      default: return '📝';
    }
  }
}

// Export singleton instance
export const memoryService = new MemoryServiceImpl();
