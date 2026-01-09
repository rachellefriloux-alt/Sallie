/**
 * Limbic Engine Service Implementation
 * Production-ready implementation for all platforms
 */

import { 
  ILimbicEngineService, 
  LimbicState, 
  TrustTier, 
  PerceptionResult,
  LimbicEngineConfig,
  LimbicEventType,
  LimbicEngineUtils
} from './limbicEngine';

export class LimbicEngineServiceImpl implements ILimbicEngineService {
  private config: LimbicEngineConfig;
  private baseUrl: string;
  private wsUrl: string;

  constructor(config?: Partial<LimbicEngineConfig>) {
    // Detect platform and set appropriate config
    this.config = this.getPlatformConfig(config);
    this.baseUrl = this.config.baseUrl;
    this.wsUrl = this.config.wsUrl;
  }

  private getPlatformConfig(userConfig?: Partial<LimbicEngineConfig>): LimbicEngineConfig {
    // Detect platform
    if (typeof window !== 'undefined' && window.location) {
      // Web platform
      const isLocalhost = window.location.hostname === 'localhost';
      return {
        baseUrl: userConfig?.baseUrl || (isLocalhost ? 'http://localhost:8750' : 'http://192.168.1.47:8750'),
        wsUrl: userConfig?.wsUrl || (isLocalhost ? 'ws://localhost:8750' : 'ws://192.168.1.47:8750'),
        timeout: userConfig?.timeout || 10000,
        reconnectAttempts: userConfig?.reconnectAttempts || 5,
        reconnectDelay: userConfig?.reconnectDelay || 1000,
      };
    } else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      // Mobile platform
      return {
        baseUrl: userConfig?.baseUrl || 'http://192.168.1.47:8750',
        wsUrl: userConfig?.wsUrl || 'ws://192.168.1.47:8750',
        timeout: userConfig?.timeout || 15000,
        reconnectAttempts: userConfig?.reconnectAttempts || 3,
        reconnectDelay: userConfig?.reconnectDelay || 2000,
      };
    } else {
      // Desktop platform or other
      return {
        baseUrl: userConfig?.baseUrl || 'http://localhost:8750',
        wsUrl: userConfig?.wsUrl || 'ws://localhost:8750',
        timeout: userConfig?.timeout || 5000,
        reconnectAttempts: userConfig?.reconnectAttempts || 10,
        reconnectDelay: userConfig?.reconnectDelay || 500,
      };
    }
  }

  async getCurrentState(): Promise<LimbicState> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get limbic state: ${response.statusText}`);
      }

      const result = await response.json();
      return result.state;
    } catch (error) {
      console.error('LimbicEngineService.getCurrentState error:', error);
      throw new Error(`Failed to get current limbic state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrustTier(): Promise<{ current: TrustTier; all_tiers: TrustTier[] }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/trust`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get trust tier: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.getTrustTier error:', error);
      throw new Error(`Failed to get trust tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPerception(input: string, context?: any): Promise<{
    success: boolean;
    result: PerceptionResult;
    new_state: LimbicState;
  }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/perception`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          context,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process perception: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.processPerception error:', error);
      throw new Error(`Failed to process perception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/elastic-mode/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to enable elastic mode: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.enableElasticMode error:', error);
      throw new Error(`Failed to enable elastic mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/elastic-mode/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to disable elastic mode: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.disableElasticMode error:', error);
      throw new Error(`Failed to disable elastic mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async triggerReunionSurge(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/reunion-surge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger reunion surge: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.triggerReunionSurge error:', error);
      throw new Error(`Failed to trigger reunion surge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getInteractionHistory(): Promise<{ success: boolean; history: any[]; total_count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get interaction history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.getInteractionHistory error:', error);
      throw new Error(`Failed to get interaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reset(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset limbic engine: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.reset error:', error);
      throw new Error(`Failed to reset limbic engine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // WebSocket event handlers (placeholder - would be implemented by WebSocket class)
  onStateChange(callback: (state: LimbicState) => void): void {
    // Implementation would be in WebSocket class
  }

  onPerceptionResult(callback: (result: PerceptionResult) => void): void {
    // Implementation would be in WebSocket class
  }

  onTrustChange(callback: (trust: number, tier: TrustTier) => void): void {
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
  public formatTrustScore(trust: number): string {
    return LimbicEngineUtils.formatTrustScore(trust);
  }

  public getPostureColor(posture: string): string {
    return LimbicEngineUtils.getPostureColor(posture as any);
  }

  public calculateLimbicHealth(state: LimbicState): number {
    return LimbicEngineUtils.calculateLimbicHealth(state);
  }
}

// WebSocket implementation
export class LimbicEngineWebSocket {
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
        console.log('Connected to Limbic Engine WebSocket');
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
        console.log('Disconnected from Limbic Engine WebSocket');
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
export const LimbicEngine = {
  LimbicEngineServiceImpl,
  LimbicEngineWebSocket,
  LimbicEngineUtils,
};
