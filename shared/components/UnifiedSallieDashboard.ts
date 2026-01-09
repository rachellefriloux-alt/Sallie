/**
 * Unified Sallie Dashboard - Shared Component for All Platforms
 * This is the "same house" interface that Web, Mobile, and Desktop all access
 */

import { LimbicEngine } from '../services/limbicEngineImpl';
import { MemoryService } from '../services/memoryServiceImpl';
import { AgencyService } from '../services/agencyServiceImpl';
import { 
  LimbicState, 
  TrustTier, 
  PerceptionResult,
  LimbicEngineUtils
} from '../services/limbicEngine';
import { 
  Memory, 
  MemorySearchRequest,
  MemoryServiceUtils
} from '../services/memoryService';
import { 
  AgencyAction, 
  ActionType,
  ActionStatus,
  AgencyStats,
  AgencyServiceUtils
} from '../services/agencyService';

export interface UnifiedSallieState {
  // Limbic Engine State
  limbicState: any;
  trustTier: any;
  isConnected: boolean;
  
  // Memory Service State
  memories: any[];
  memoryStats: any;
  
  // Agency Service State
  agencyStats: any;
  activeActions: any[];
  
  // UI State
  loading: boolean;
  error: string | null;
  activeTab: 'limbic' | 'memory' | 'agency' | 'heritage' | 'convergence';
}

export interface UnifiedSallieActions {
  // Limbic Engine Actions
  updateLimbicState: (state: any) => void;
  processPerception: (input: string) => Promise<void>;
  toggleElasticMode: () => Promise<void>;
  
  // Memory Service Actions
  loadMemories: () => Promise<void>;
  createMemory: (content: string) => Promise<void>;
  searchMemories: (query: string) => Promise<void>;
  
  // Agency Service Actions
  requestAction: (action: any) => Promise<void>;
  executeAction: (actionId: string) => Promise<void>;
  
  // UI Actions
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

export class UnifiedSallieDashboard {
  private limbicService: any;
  private memoryService: any;
  private agencyService: any;
  private limbicWebSocket: any;
  private memoryWebSocket: any;
  private agencyWebSocket: any;

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize service instances based on platform
    const config = this.getPlatformConfig();
    
    this.limbicService = new LimbicEngine.LimbicEngineServiceImpl();
    this.memoryService = new MemoryService.MemoryServiceImpl();
    this.agencyService = new AgencyService.AgencyServiceImpl();

    // Initialize WebSocket connections
    this.limbicWebSocket = new LimbicEngine.LimbicEngineWebSocket(config.limbicWsUrl);
    this.memoryWebSocket = new MemoryService.MemoryServiceWebSocket(config.memoryWsUrl);
    this.agencyWebSocket = new AgencyService.AgencyServiceWebSocket(config.agencyWsUrl);
  }

  private getPlatformConfig() {
    // Detect platform
    if (typeof window !== 'undefined' && window.location) {
      // Web platform
      const isLocalhost = window.location.hostname === 'localhost';
      return {
        limbicWsUrl: isLocalhost ? 'ws://localhost:8750' : 'ws://192.168.1.47:8750',
        memoryWsUrl: isLocalhost ? 'ws://localhost:8751' : 'ws://192.168.1.47:8751', 
        agencyWsUrl: isLocalhost ? 'ws://localhost:8752' : 'ws://192.168.1.47:8752',
      };
    } else if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      // Mobile platform
      return {
        limbicWsUrl: 'ws://192.168.1.47:8750',
        memoryWsUrl: 'ws://192.168.1.47:8751',
        agencyWsUrl: 'ws://192.168.1.47:8752',
      };
    } else {
      // Desktop platform or other
      return {
        limbicWsUrl: 'ws://localhost:8750',
        memoryWsUrl: 'ws://localhost:8751',
        agencyWsUrl: 'ws://localhost:8752',
      };
    }
  }

  // Limbic Engine Methods
  public async getCurrentLimbicState() {
    try {
      return await this.limbicService.getCurrentState();
    } catch (error) {
      console.error('Failed to get limbic state:', error);
      throw error;
    }
  }

  public async getTrustTier() {
    try {
      return await this.limbicService.getTrustTier();
    } catch (error) {
      console.error('Failed to get trust tier:', error);
      throw error;
    }
  }

  public async processPerception(input: string) {
    try {
      return await this.limbicService.processPerception(input);
    } catch (error) {
      console.error('Failed to process perception:', error);
      throw error;
    }
  }

  public async enableElasticMode() {
    try {
      return await this.limbicService.enableElasticMode();
    } catch (error) {
      console.error('Failed to enable elastic mode:', error);
      throw error;
    }
  }

  public async disableElasticMode() {
    try {
      return await this.limbicService.disableElasticMode();
    } catch (error) {
      console.error('Failed to disable elastic mode:', error);
      throw error;
    }
  }

  // Memory Service Methods
  public async searchMemories(query: string, filters?: any) {
    try {
      const request = {
        query,
        limit: 50,
        filters,
      };
      return await this.memoryService.searchMemories(request);
    } catch (error) {
      console.error('Failed to search memories:', error);
      throw error;
    }
  }

  public async createMemory(content: string, metadata?: any) {
    try {
      const request = {
        content,
        metadata: metadata || {
          type: 'conversation',
          source: 'user_input',
          context: 'User created memory',
        },
        generate_embedding: true,
      };
      return await this.memoryService.createMemory(request);
    } catch (error) {
      console.error('Failed to create memory:', error);
      throw error;
    }
  }

  public async getMemoryStats() {
    try {
      return await this.memoryService.getStats();
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      throw error;
    }
  }

  // Agency Service Methods
  public async getCurrentTrust() {
    try {
      return await this.agencyService.getCurrentTrust();
    } catch (error) {
      console.error('Failed to get current trust:', error);
      throw error;
    }
  }

  public async requestAction(action: any) {
    try {
      return await this.agencyService.requestAction(action);
    } catch (error) {
      console.error('Failed to request action:', error);
      throw error;
    }
  }

  public async executeAction(actionId: string) {
    try {
      return await this.agencyService.executeAction(actionId);
    } catch (error) {
      console.error('Failed to execute action:', error);
      throw error;
    }
  }

  public async getAgencyStats() {
    try {
      return await this.agencyService.getStats();
    } catch (error) {
      console.error('Failed to get agency stats:', error);
      throw error;
    }
  }

  // WebSocket Event Handlers
  public onLimbicStateChange(callback: (state: any) => void) {
    this.limbicWebSocket.on('limbic-state', callback);
  }

  public onMemoryCreated(callback: (memory: any) => void) {
    this.memoryWebSocket.on('memory-created', callback);
  }

  public onActionCompleted(callback: (action: any) => void) {
    this.agencyWebSocket.on('action-completed', callback);
  }

  public onTrustChange(callback: (trust: number, tier: any) => void) {
    this.limbicWebSocket.on('trust-change', callback);
  }

  // Utility Methods
  public formatTrustScore(trust: number): string {
    return LimbicEngineUtils.formatTrustScore(trust);
  }

  public getPostureColor(posture: string): string {
    return LimbicEngineUtils.getPostureColor(posture as any);
  }

  public getMemoryTypeColor(type: string): string {
    return MemoryServiceUtils.getMemoryTypeColor(type as any);
  }

  public getActionStatusColor(status: string): string {
    return AgencyServiceUtils.getActionStatusColor(status as any);
  }

  public calculateLimbicHealth(state: any): number {
    return LimbicEngineUtils.calculateLimbicHealth(state);
  }

  public formatMemoryAge(timestamp: number): string {
    return MemoryServiceUtils.calculateMemoryAge(timestamp);
  }

  public formatDuration(ms: number): string {
    return AgencyServiceUtils.formatDuration(ms);
  }

  // Connection Management
  public connect(): void {
    // All WebSocket connections are established in constructor
    console.log('Unified Sallie Dashboard connected to all services');
  }

  public disconnect(): void {
    this.limbicWebSocket.disconnect();
    this.memoryWebSocket.disconnect();
    this.agencyWebSocket.disconnect();
    console.log('Unified Sallie Dashboard disconnected from all services');
  }

  // Health Check
  public async checkHealth(): Promise<{
    limbic: boolean;
    memory: boolean;
    agency: boolean;
    overall: boolean;
  }> {
    try {
      const [limbicState, memoryStats, agencyStats] = await Promise.all([
        this.getCurrentLimbicState().catch(() => null),
        this.getMemoryStats().catch(() => null),
        this.getAgencyStats().catch(() => null),
      ]);

      const limbic = !!limbicState;
      const memory = !!memoryStats;
      const agency = !!agencyStats;
      const overall = limbic && memory && agency;

      return { limbic, memory, agency, overall };
    } catch (error) {
      console.error('Health check failed:', error);
      return { limbic: false, memory: false, agency: false, overall: false };
    }
  }

  // Get Initial State
  public async getInitialState(): Promise<UnifiedSallieState> {
    try {
      const [limbicState, trustTier, memories, memoryStats, agencyStats] = await Promise.all([
        this.getCurrentLimbicState(),
        this.getTrustTier(),
        this.searchMemories('', {}),
        this.getMemoryStats(),
        this.getAgencyStats(),
      ]);

      return {
        limbicState,
        trustTier: trustTier.current,
        isConnected: true,
        memories: memories.memories,
        memoryStats: memoryStats.stats,
        agencyStats: agencyStats.stats,
        activeActions: [],
        loading: false,
        error: null,
        activeTab: 'limbic',
      };
    } catch (error) {
      console.error('Failed to get initial state:', error);
      return {
        limbicState: null,
        trustTier: null,
        isConnected: false,
        memories: [],
        memoryStats: null,
        agencyStats: null,
        activeActions: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize',
        activeTab: 'limbic',
      };
    }
  }
}

// Export singleton instance
export const unifiedSallieDashboard = new UnifiedSallieDashboard();
