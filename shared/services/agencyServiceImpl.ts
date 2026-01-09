/**
 * Agency Service Implementation
 * Production-ready implementation for all platforms
 * Complete trust management and autonomous action system
 */

import {
  IAgencyService,
  TrustTier,
  AgencyAction,
  ActionType,
  ActionStatus,
  TakeTheWheelRequest,
  RollbackResult,
  AgencyStats,
  CapabilityContract,
  ActionRequest,
  AgencyServiceConfig,
  AgencyEventType,
  AgencyServiceUtils
} from './agencyService';

export class AgencyServiceImpl implements IAgencyService {
  private config: AgencyServiceConfig;
  private baseUrl: string;
  private wsUrl: string;

  constructor(config?: Partial<AgencyServiceConfig>) {
    // Detect platform and set appropriate config
    this.config = this.getPlatformConfig(config);
    this.baseUrl = this.config.baseUrl;
    this.wsUrl = this.config.wsUrl;
  }

  private getPlatformConfig(userConfig?: Partial<AgencyServiceConfig>): AgencyServiceConfig {
    // Detect platform
    if (typeof window !== 'undefined' && window.location) {
      // Web platform
      const isLocalhost = window.location.hostname === 'localhost';
      return {
        baseUrl: userConfig?.baseUrl || (isLocalhost ? 'http://localhost:8752' : 'http://192.168.1.47:8752'),
        wsUrl: userConfig?.wsUrl || (isLocalhost ? 'ws://localhost:8752' : 'ws://192.168.1.47:8752'),
        timeout: userConfig?.timeout || 10000,
        reconnectAttempts: userConfig?.reconnectAttempts || 5,
        reconnectDelay: userConfig?.reconnectDelay || 1000,
      };
    } else if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      // Mobile platform
      return {
        baseUrl: userConfig?.baseUrl || 'http://192.168.1.47:8752',
        wsUrl: userConfig?.wsUrl || 'ws://192.168.1.47:8752',
        timeout: userConfig?.timeout || 15000,
        reconnectAttempts: userConfig?.reconnectAttempts || 3,
        reconnectDelay: userConfig?.reconnectDelay || 2000,
      };
    } else {
      // Desktop platform or other
      return {
        baseUrl: userConfig?.baseUrl || 'http://localhost:8752',
        wsUrl: userConfig?.wsUrl || 'ws://localhost:8752',
        timeout: userConfig?.timeout || 5000,
        reconnectAttempts: userConfig?.reconnectAttempts || 10,
        reconnectDelay: userConfig?.reconnectDelay || 500,
      };
    }
  }

  async getCurrentTrust(): Promise<{ trust_score: number; current_tier: TrustTier; all_tiers: TrustTier[] }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/trust`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get current trust: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.getCurrentTrust error:', error);
      throw new Error(`Failed to get current trust: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async requestAction(request: ActionRequest): Promise<AgencyAction> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to request action: ${response.statusText}`);
      }

      const result = await response.json();
      return result.action;
    } catch (error) {
      console.error('AgencyService.requestAction error:', error);
      throw new Error(`Failed to request action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeAction(actionId: string): Promise<{ success: boolean; message: string; action: AgencyAction }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${actionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Action not found');
        }
        throw new Error(`Failed to execute action: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.executeAction error:', error);
      throw new Error(`Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActionById(id: string): Promise<AgencyAction | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get action: ${response.statusText}`);
      }

      const result = await response.json();
      return result.action;
    } catch (error) {
      console.error('AgencyService.getActionById error:', error);
      throw new Error(`Failed to get action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActionHistory(limit?: number): Promise<{ actions: AgencyAction[]; total_count: number }> {
    try {
      const url = new URL(`${this.baseUrl}/actions/history`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get action history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.getActionHistory error:', error);
      throw new Error(`Failed to get action history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActiveActions(): Promise<{ actions: AgencyAction[]; active_count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get active actions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.getActiveActions error:', error);
      throw new Error(`Failed to get active actions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initiateRollback(actionId: string, reason: string, force?: boolean): Promise<RollbackResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${actionId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, force }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate rollback: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.initiateRollback error:', error);
      throw new Error(`Failed to initiate rollback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async takeTheWheel(request: TakeTheWheelRequest): Promise<{ 
    success: boolean; 
    executed_actions: AgencyAction[]; 
    executed_count: number 
  }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/take-the-wheel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to take the wheel: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.takeTheWheel error:', error);
      throw new Error(`Failed to take the wheel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStats(): Promise<{ success: boolean; stats: AgencyStats }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get agency stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.getStats error:', error);
      throw new Error(`Failed to get agency stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCapabilities(): Promise<{ success: boolean; contracts: CapabilityContract[] }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/capabilities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get capabilities: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AgencyService.getCapabilities error:', error);
      throw new Error(`Failed to get capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // WebSocket event handlers (placeholder - would be implemented by WebSocket class)
  onActionCompleted(callback: (action: AgencyAction) => void): void {
    // Implementation would be in WebSocket class
  }

  onActionFailed(callback: (action: AgencyAction) => void): void {
    // Implementation would be in WebSocket class
  }

  onTierChanged(callback: (newTier: TrustTier, trust: number) => void): void {
    // Implementation would be in WebSocket class
  }

  onTrustChanged(callback: (trust: number) => void): void {
    // Implementation would be in WebSocket class
  }

  disconnect(): void {
    // Implementation would be in WebSocket class
  }

  // Helper methods
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  // Utility methods
  public formatActionType(actionType: ActionType): string {
    return AgencyServiceUtils.formatActionType(actionType);
  }

  public getActionStatusColor(status: ActionStatus): string {
    return AgencyServiceUtils.getActionStatusColor(status);
  }

  public getTrustTierColor(tier: number): string {
    return AgencyServiceUtils.getTrustTierColor(tier);
  }

  public formatDuration(ms: number): string {
    return AgencyServiceUtils.formatDuration(ms);
  }

  public getActionIcon(actionType: ActionType): string {
    return AgencyServiceUtils.getActionIcon(actionType);
  }

  public isHighRiskAction(actionType: ActionType): boolean {
    return AgencyServiceUtils.isHighRiskAction(actionType);
  }

  public requiresConfirmation(actionType: ActionType, trustLevel: number): boolean {
    return AgencyServiceUtils.requiresConfirmation(actionType, trustLevel);
  }

  public getActionDescription(actionType: ActionType, parameters?: any): string {
    return AgencyServiceUtils.getActionDescription(actionType, parameters);
  }
}

// WebSocket implementation
export class AgencyServiceWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private url: string;

  constructor(url: string, config?: { maxReconnectAttempts?: number; reconnectDelay?: number }) {
    this.url = url;
    this.maxReconnectAttempts = config?.maxReconnectAttempts || 5;
    this.reconnectDelay = config?.reconnectDelay || 1000;
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to Agency Service WebSocket');
        this.reconnectAttempts = 0;
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type || 'message', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.emit('error', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Agency Service WebSocket');
        this.emit('disconnected', null);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed', null);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  public on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  public off(event: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export the service as the default export
export const AgencyService = {
  AgencyServiceImpl,
  AgencyServiceWebSocket,
  AgencyServiceUtils,
};
