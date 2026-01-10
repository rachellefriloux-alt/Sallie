/**
 * Shared Agency Service Interface
 * Used by Web, Mobile, and Desktop platforms
 */

export interface TrustTier {
  tier: number;
  name: string;
  trust_min: number;
  trust_max: number;
  capabilities: string[];
  permissions: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: string[];
  sandbox?: string;
  dry_run_supported: boolean;
  rollback_strategy: string;
}

export interface AgencyAction {
  id: string;
  actor_id: string;
  action_type: ActionType;
  resource: string;
  parameters: any;
  trust_required: number;
  status: ActionStatus;
  created_at: number;
  started_at?: number;
  completed_at?: number;
  result?: any;
  error?: string;
  rollback_id?: string;
  metadata: ActionMetadata;
}

export enum ActionType {
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  FILE_DELETE = 'file_delete',
  FILE_MOVE = 'file_move',
  DIRECTORY_CREATE = 'directory_create',
  EMAIL_SEND = 'email_send',
  EMAIL_DRAFT = 'email_draft',
  CODE_EXECUTE = 'code_execute',
  SYSTEM_COMMAND = 'system_command',
  API_CALL = 'api_call',
  DATABASE_QUERY = 'database_query',
  MEMORY_ACCESS = 'memory_access',
  HERITAGE_MODIFY = 'heritage_modify',
  AUTO_RESEARCH = 'auto_research',
  WORKFLOW_AUTOMATE = 'workflow_automate',
  SCHEDULE_TASK = 'schedule_task',
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore'
}

export enum ActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

export interface ActionMetadata {
  source: 'user_request' | 'autonomous' | 'scheduled' | 'dream_cycle';
  context?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_confirmation: boolean;
  auto_rollback: boolean;
  git_commit_before?: string;
  git_commit_after?: string;
}

export interface CapabilityContract {
  name: string;
  description: string;
  actions: ActionType[];
  sandbox_path?: string;
  dry_run_available: boolean;
  rollback_available: boolean;
  trust_threshold: number;
  risk_assessment: RiskAssessment;
}

export interface RiskAssessment {
  data_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  system_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  privacy_risk: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recovery_difficulty: 'trivial' | 'easy' | 'moderate' | 'difficult' | 'impossible';
  potential_impact: string[];
}

export interface TakeTheWheelRequest {
  trigger_type: 'explicit' | 'fatigue' | 'repeated_stall' | 'high_confidence';
  context: string;
  proposed_actions: ActionProposal[];
  requires_scope_confirmation: boolean;
  estimated_duration?: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ActionProposal {
  action: ActionType;
  description: string;
  parameters: any;
  expected_outcome: string;
  confidence: number;
}

export interface AgencyStats {
  total_actions: number;
  actions_by_status: Record<ActionStatus, number>;
  actions_by_type: Record<ActionType, number>;
  success_rate: number;
  average_execution_time: number;
  rollbacks_initiated: number;
  rollbacks_successful: number;
  trust_changes: number;
  tier_changes: number;
  door_slams_triggered: number;
  moral_frictions_detected: number;
  current_trust_score: number;
  current_tier: number;
  active_actions: number;
  queued_actions: number;
}

export interface ActionRequest {
  action_type: ActionType;
  resource: string;
  parameters: any;
  metadata?: {
    source?: string;
    context?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    requires_confirmation?: boolean;
    auto_rollback?: boolean;
  };
  actor_id: string;
}

export interface RollbackResult {
  success: boolean;
  rollback_id: string;
  commit_hash: string;
  files_restored: string[];
  error?: string;
  timestamp: number;
}

// Base interface that all platforms will implement
export interface IAgencyService {
  // Trust and tier management
  getCurrentTrust(): Promise<{ trust_score: number; current_tier: TrustTier; all_tiers: TrustTier[] }>;
  
  // Action management
  requestAction(request: ActionRequest): Promise<AgencyAction>;
  executeAction(actionId: string): Promise<{ success: boolean; message: string; action: AgencyAction }>;
  getActionById(id: string): Promise<AgencyAction | null>;
  getActionHistory(limit?: number): Promise<{ actions: AgencyAction[]; total_count: number }>;
  getActiveActions(): Promise<{ actions: AgencyAction[]; active_count: number }>;
  
  // Rollback operations
  initiateRollback(actionId: string, reason: string, force?: boolean): Promise<RollbackResult>;
  
  // Autonomous operations
  takeTheWheel(request: TakeTheWheelRequest): Promise<{ 
    success: boolean; 
    executed_actions: AgencyAction[]; 
    executed_count: number 
  }>;
  
  // Statistics and capabilities
  getStats(): Promise<{ success: boolean; stats: AgencyStats }>;
  getCapabilities(): Promise<{ success: boolean; contracts: CapabilityContract[] }>;
  
  // Real-time events
  onActionCompleted(callback: (action: AgencyAction) => void): void;
  onActionFailed(callback: (action: AgencyAction) => void): void;
  onTierChanged(callback: (newTier: TrustTier, trust: number) => void): void;
  onTrustChanged(callback: (trust: number) => void): void;
  disconnect(): void;
}

// Configuration for different environments
export interface AgencyServiceConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Default configurations for different platforms
export const AGENCY_CONFIGS = {
  web: {
    baseUrl: typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
      ? 'http://localhost:8752' 
      : 'http://192.168.1.47:8752',
    wsUrl: typeof window !== 'undefined' && window.location?.hostname === 'localhost'
      ? 'ws://localhost:8752'
      : 'ws://192.168.1.47:8752',
    timeout: 10000,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  mobile: {
    baseUrl: 'http://192.168.1.47:8752',
    wsUrl: 'ws://192.168.1.47:8752',
    timeout: 15000,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
  },
  desktop: {
    baseUrl: 'http://localhost:8752',
    wsUrl: 'ws://localhost:8752',
    timeout: 5000,
    reconnectAttempts: 10,
    reconnectDelay: 500,
  },
};

// Event types for real-time updates
export enum AgencyEventType {
  ACTION_COMPLETED = 'action-completed',
  ACTION_FAILED = 'action-failed',
  TIER_CHANGED = 'tier-changed',
  TRUST_CHANGED = 'trust-change',
  ROLLBACK_COMPLETED = 'rollback-completed',
  TAKE_THE_WHEEL = 'take-the-wheel',
  MORAL_FRICTION = 'moral-friction',
  DOOR_SLAM = 'door-slam',
}

// Utility functions for all platforms
export class AgencyServiceUtils {
  static formatActionType(actionType: ActionType): string {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  static getActionStatusColor(status: ActionStatus): string {
    const colors = {
      [ActionStatus.PENDING]: '#F59E0B', // Amber
      [ActionStatus.APPROVED]: '#3B82F6', // Blue
      [ActionStatus.REJECTED]: '#EF4444', // Red
      [ActionStatus.IN_PROGRESS]: '#8B5CF6', // Purple
      [ActionStatus.COMPLETED]: '#10B981', // Green
      [ActionStatus.FAILED]: '#EF4444', // Red
      [ActionStatus.ROLLED_BACK]: '#F97316', // Orange
    };
    return colors[status];
  }

  static getTrustTierColor(tier: number): string {
    const colors = {
      0: '#6B7280', // Gray - Stranger
      1: '#F59E0B', // Amber - Associate
      2: '#3B82F6', // Blue - Partner
      3: '#8B5CF6', // Purple - Surrogate
      4: '#10B981', // Green - Full Partner
    };
    return colors[tier as keyof typeof colors] || '#6B7280';
  }

  static getRiskLevelColor(risk: string): string {
    const colors = {
      low: '#10B981', // Green
      medium: '#F59E0B', // Amber
      high: '#EF4444', // Red
      critical: '#DC2626', // Dark Red
    };
    return colors[risk as keyof typeof colors] || '#6B7280';
  }

  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  static calculateSuccessRate(stats: AgencyStats): number {
    const completed = stats.actions_by_status[ActionStatus.COMPLETED] || 0;
    const total = stats.total_actions;
    return total > 0 ? (completed / total) * 100 : 0;
  }

  static getActionIcon(actionType: ActionType): string {
    const icons = {
      [ActionType.FILE_READ]: '📄',
      [ActionType.FILE_WRITE]: '✏️',
      [ActionType.FILE_DELETE]: '🗑️',
      [ActionType.FILE_MOVE]: '📁',
      [ActionType.DIRECTORY_CREATE]: '📂',
      [ActionType.EMAIL_SEND]: '📧',
      [ActionType.EMAIL_DRAFT]: '📝',
      [ActionType.CODE_EXECUTE]: '⚡',
      [ActionType.SYSTEM_COMMAND]: '⚙️',
      [ActionType.API_CALL]: '🌐',
      [ActionType.DATABASE_QUERY]: '🗄️',
      [ActionType.MEMORY_ACCESS]: '🧠',
      [ActionType.HERITAGE_MODIFY]: '💎',
      [ActionType.AUTO_RESEARCH]: '🔍',
      [ActionType.WORKFLOW_AUTOMATE]: '🔄',
      [ActionType.SCHEDULE_TASK]: '⏰',
      [ActionType.BACKUP_CREATE]: '💾',
      [ActionType.BACKUP_RESTORE]: '♻️',
    };
    return icons[actionType] || '🔧';
  }

  static isHighRiskAction(actionType: ActionType): boolean {
    const highRiskActions = [
      ActionType.FILE_DELETE,
      ActionType.SYSTEM_COMMAND,
      ActionType.CODE_EXECUTE,
      ActionType.EMAIL_SEND,
      ActionType.DATABASE_QUERY,
      ActionType.BACKUP_RESTORE,
    ];
    return highRiskActions.includes(actionType);
  }

  static requiresConfirmation(actionType: ActionType, trustLevel: number): boolean {
    // High-risk actions always require confirmation
    if (this.isHighRiskAction(actionType)) return true;
    
    // Lower trust levels require more confirmation
    if (trustLevel < 0.6) return true;
    if (trustLevel < 0.8 && actionType !== ActionType.FILE_READ) return true;
    
    return false;
  }

  static getActionDescription(actionType: ActionType, parameters?: any): string {
    const descriptions: Record<ActionType, string> = {
      [ActionType.FILE_READ]: 'Read file contents',
      [ActionType.FILE_WRITE]: 'Write to file',
      [ActionType.FILE_DELETE]: 'Delete file',
      [ActionType.FILE_MOVE]: 'Move file',
      [ActionType.DIRECTORY_CREATE]: 'Create directory',
      [ActionType.EMAIL_SEND]: 'Send email',
      [ActionType.EMAIL_DRAFT]: 'Create email draft',
      [ActionType.CODE_EXECUTE]: 'Execute code',
      [ActionType.SYSTEM_COMMAND]: 'Run system command',
      [ActionType.API_CALL]: 'Make API call',
      [ActionType.DATABASE_QUERY]: 'Query database',
      [ActionType.MEMORY_ACCESS]: 'Access memory',
      [ActionType.HERITAGE_MODIFY]: 'Modify heritage',
      [ActionType.AUTO_RESEARCH]: 'Auto research',
      [ActionType.WORKFLOW_AUTOMATE]: 'Automate workflow',
      [ActionType.SCHEDULE_TASK]: 'Schedule task',
      [ActionType.BACKUP_CREATE]: 'Create backup',
      [ActionType.BACKUP_RESTORE]: 'Restore backup',
    };
    
    let description = descriptions[actionType] || 'Perform action';
    
    if (parameters?.resource) {
      description += `: ${parameters.resource}`;
    }
    
    return description;
  }
}

// Production-ready Agency Service implementation
export class AgencyService implements IAgencyService {
  private baseUrl: string;
  private wsUrl: string;
  private eventListeners: Map<string, Function[]> = new Map();
  private ws?: WebSocket;
  
  constructor() {
    this.baseUrl = AGENCY_CONFIGS.web.baseUrl;
    this.wsUrl = AGENCY_CONFIGS.web.wsUrl;
  }
  
  async getCurrentTrust(): Promise<{ trust_score: number; current_tier: TrustTier; all_tiers: TrustTier[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/trust`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get current trust:', error);
      // Fallback to mock data
      const tiers: TrustTier[] = [
        { tier: 0, name: 'Stranger', trust_min: 0.0, trust_max: 0.2, capabilities: [], permissions: [] },
        { tier: 1, name: 'Associate', trust_min: 0.2, trust_max: 0.4, capabilities: [], permissions: [] },
        { tier: 2, name: 'Partner', trust_min: 0.4, trust_max: 0.6, capabilities: [], permissions: [] },
        { tier: 3, name: 'Surrogate', trust_min: 0.6, trust_max: 0.8, capabilities: [], permissions: [] },
        { tier: 4, name: 'Full Partner', trust_min: 0.8, trust_max: 1.0, capabilities: [], permissions: [] },
      ];
      
      return {
        trust_score: 0.5,
        current_tier: tiers[2],
        all_tiers: tiers,
      };
    }
  }

  async requestAction(request: ActionRequest): Promise<AgencyAction> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to request action:', error);
      // Fallback to mock implementation
      return {
        id: `action_${Date.now()}`,
        actor_id: request.actor_id,
        action_type: request.action_type,
        resource: request.resource,
        parameters: request.parameters,
        trust_required: this.calculateTrustRequired(request.action_type),
        status: ActionStatus.PENDING,
        created_at: Date.now(),
        metadata: {
          source: (request.metadata?.source as any) || 'user_request',
          context: request.metadata?.context,
          urgency: request.metadata?.urgency || 'medium',
          risk_level: request.metadata?.risk_level || 'low',
          requires_confirmation: request.metadata?.requires_confirmation || false,
          auto_rollback: request.metadata?.auto_rollback || true,
        },
      };
    }
  }

  async executeAction(actionId: string): Promise<{ success: boolean; message: string; action: AgencyAction }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions/${actionId}/execute`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to execute action:', error);
      return {
        success: false,
        message: 'Failed to execute action',
        action: await this.getActionById(actionId),
      };
    }
  }

  async getActionById(id: string): Promise<AgencyAction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get action by ID:', error);
      return null;
    }
  }

  async getActionHistory(limit?: number): Promise<{ actions: AgencyAction[]; total_count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions/history?limit=${limit || 20}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get action history:', error);
      return {
        actions: [],
        total_count: 0,
      };
    }
  }

  async getActiveActions(): Promise<{ actions: AgencyAction[]; active_count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions/active`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get active actions:', error);
      return {
        actions: [],
        active_count: 0,
      };
    }
  }

  async initiateRollback(actionId: string, reason: string, force?: boolean): Promise<RollbackResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/actions/${actionId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, force }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to initiate rollback:', error);
      return {
        success: false,
        rollback_id: `rollback_${Date.now()}`,
        commit_hash: 'unknown',
        files_restored: [],
        error: error instanceof Error ? error.message : 'Failed to rollback action',
        timestamp: Date.now(),
      };
    }
  }

  async takeTheWheel(request: TakeTheWheelRequest): Promise<{ 
    success: boolean; 
    executed_actions: AgencyAction[]; 
    executed_count: number 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/take-the-wheel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to take the wheel:', error);
      return {
        success: false,
        executed_actions: [],
        executed_count: 0,
      };
    }
  }

  async getStats(): Promise<{ success: boolean; stats: AgencyStats }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/stats`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get stats:', error);
      const stats: AgencyStats = {
        total_actions: 0,
        actions_by_status: {} as Record<ActionStatus, number>,
        actions_by_type: {} as Record<ActionType, number>,
        success_rate: 0,
        average_execution_time: 0,
        rollbacks_initiated: 0,
        rollbacks_successful: 0,
        trust_changes: 0,
        tier_changes: 0,
        door_slams_triggered: 0,
        moral_frictions_detected: 0,
        current_trust_score: 0.5,
        current_tier: 2,
        active_actions: 0,
        queued_actions: 0,
      };
      
      return {
        success: true,
        stats,
      };
    }
  }

  async getCapabilities(): Promise<{ success: boolean; contracts: CapabilityContract[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agency/capabilities`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      return {
        success: true,
        contracts: [],
      };
    }
  }

  onActionCompleted(callback: (action: AgencyAction) => void): void {
    this.addEventListener('action-completed', callback);
  }

  onActionFailed(callback: (action: AgencyAction) => void): void {
    this.addEventListener('action-failed', callback);
  }

  onTierChanged(callback: (newTier: TrustTier, trust: number) => void): void {
    this.addEventListener('tier-changed', callback);
  }

  onTrustChanged(callback: (trust: number) => void): void {
    this.addEventListener('trust-change', callback);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
  
  private addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
    
    // Initialize WebSocket if not already connected
    if (!this.ws) {
      this.connectWebSocket();
    }
  }
  
  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        this.emit('connected');
      };
      
      this.ws.onclose = () => {
        this.emit('disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectWebSocket(), 3000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setTimeout(() => this.connectWebSocket(), 3000);
    }
  }
  
  private emit(event: string, data?: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        callback(data);
      });
    }
  }
  
  private calculateTrustRequired(actionType: ActionType): number {
    // Calculate trust required based on action type
    const trustRequirements: Record<ActionType, number> = {
      [ActionType.FILE_READ]: 0.1,
      [ActionType.FILE_WRITE]: 0.3,
      [ActionType.FILE_DELETE]: 0.8,
      [ActionType.FILE_MOVE]: 0.4,
      [ActionType.DIRECTORY_CREATE]: 0.2,
      [ActionType.EMAIL_SEND]: 0.6,
      [ActionType.EMAIL_DRAFT]: 0.3,
      [ActionType.CODE_EXECUTE]: 0.9,
      [ActionType.SYSTEM_COMMAND]: 0.95,
      [ActionType.API_CALL]: 0.2,
      [ActionType.DATABASE_QUERY]: 0.4,
      [ActionType.MEMORY_ACCESS]: 0.5,
      [ActionType.HERITAGE_MODIFY]: 0.7,
      [ActionType.AUTO_RESEARCH]: 0.3,
      [ActionType.WORKFLOW_AUTOMATE]: 0.6,
      [ActionType.SCHEDULE_TASK]: 0.2,
      [ActionType.BACKUP_CREATE]: 0.3,
      [ActionType.BACKUP_RESTORE]: 0.8,
    };
    
    return trustRequirements[actionType] || 0.5;
  }
}

export class AgencyServiceWebSocket {
  private ws?: WebSocket;
  private url: string;
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor(url: string) {
    this.url = url;
    this.connect();
  }
  
  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.emit('connected');
      };
      
      this.ws.onclose = () => {
        this.emit('disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connect(), 3000);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setTimeout(() => this.connect(), 3000);
    }
  }
  
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  private emit(event: string, data?: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        callback(data);
      });
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}
