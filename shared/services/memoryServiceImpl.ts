/**
 * Memory Service Implementation
 * Production-ready implementation for all platforms
 */

import {
  IMemoryService,
  Memory,
  MemorySearchRequest,
  MemorySearchResult,
  MemoryCreateRequest,
  MemoryUpdateRequest,
  MemoryDeleteRequest,
  MemoryType,
  MemorySource,
  MemoryServiceConfig,
  MemoryEventType,
  MemoryServiceUtils
} from './memoryService';

export class MemoryServiceImpl implements IMemoryService {
  private config: MemoryServiceConfig;
  private baseUrl: string;
  private wsUrl: string;

  constructor(config?: Partial<MemoryServiceConfig>) {
    // Detect platform and set appropriate config
    this.config = this.getPlatformConfig(config);
    this.baseUrl = this.config.baseUrl;
    this.wsUrl = this.config.wsUrl;
  }

  private getPlatformConfig(userConfig?: Partial<MemoryServiceConfig>): MemoryServiceConfig {
    // Detect platform
    if (typeof window !== 'undefined' && window.location) {
      // Web platform
      const isLocalhost = window.location.hostname === 'localhost';
      return {
        baseUrl: userConfig?.baseUrl || (isLocalhost ? 'http://localhost:8751' : 'http://192.168.1.47:8751'),
        wsUrl: userConfig?.wsUrl || (isLocalhost ? 'ws://localhost:8751' : 'ws://192.168.1.47:8751'),
        timeout: userConfig?.timeout || 10000,
        reconnectAttempts: userConfig?.reconnectAttempts || 5,
        reconnectDelay: userConfig?.reconnectDelay || 1000,
      };
    } else if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      // Mobile platform
      return {
        baseUrl: userConfig?.baseUrl || 'http://192.168.1.47:8751',
        wsUrl: userConfig?.wsUrl || 'ws://192.168.1.47:8751',
        timeout: userConfig?.timeout || 15000,
        reconnectAttempts: userConfig?.reconnectAttempts || 3,
        reconnectDelay: userConfig?.reconnectDelay || 2000,
      };
    } else {
      // Desktop platform or other
      return {
        baseUrl: userConfig?.baseUrl || 'http://localhost:8751',
        wsUrl: userConfig?.wsUrl || 'ws://localhost:8751',
        timeout: userConfig?.timeout || 5000,
        reconnectAttempts: userConfig?.reconnectAttempts || 10,
        reconnectDelay: userConfig?.reconnectDelay || 500,
      };
    }
  }

  async createMemory(request: MemoryCreateRequest): Promise<Memory> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to create memory: ${response.statusText}`);
      }

      const result = await response.json();
      return result.memory;
    } catch (error) {
      console.error('MemoryService.createMemory error:', error);
      throw new Error(`Failed to create memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchMemories(request: MemorySearchRequest): Promise<MemorySearchResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/memories/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to search memories: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('MemoryService.searchMemories error:', error);
      throw new Error(`Failed to search memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMemoryById(id: string): Promise<Memory | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/memories/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get memory: ${response.statusText}`);
      }

      const result = await response.json();
      return result.memory;
    } catch (error) {
      console.error('MemoryService.getMemoryById error:', error);
      throw new Error(`Failed to get memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateMemory(request: MemoryUpdateRequest): Promise<Memory> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/memories/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Memory not found');
        }
        throw new Error(`Failed to update memory: ${response.statusText}`);
      }

      const result = await response.json();
      return result.memory;
    } catch (error) {
      console.error('MemoryService.updateMemory error:', error);
      throw new Error(`Failed to update memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMemory(request: MemoryDeleteRequest): Promise<void> {
    try {
      const url = new URL(`${this.baseUrl}/memories/${request.id}`);
      if (request.actor_id) {
        url.searchParams.set('actor_id', request.actor_id);
      }
      if (request.permanent) {
        url.searchParams.set('permanent', 'true');
      }

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete memory: ${response.statusText}`);
      }
    } catch (error) {
      console.error('MemoryService.deleteMemory error:', error);
      throw new Error(`Failed to delete memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStats(): Promise<{ success: boolean; stats: any }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get memory stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MemoryService.getStats error:', error);
      throw new Error(`Failed to get memory stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMetadata(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/metadata`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get memory metadata: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MemoryService.getMetadata error:', error);
      throw new Error(`Failed to get memory metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // WebSocket event handlers (placeholder - would be implemented by WebSocket class)
  onMemoryCreated(callback: (memory: Memory) => void): void {
    // Implementation would be in WebSocket class
  }

  onMemoryUpdated(callback: (memory: Memory) => void): void {
    // Implementation would be in WebSocket class
  }

  onMemoryDeleted(callback: (id: string) => void): void {
    // Implementation would be in WebSocket class
  }

  onSearchCompleted(callback: (result: MemorySearchResult) => void): void {
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
  public formatMemoryType(type: MemoryType): string {
    return MemoryServiceUtils.formatMemoryType(type);
  }

  public getMemoryTypeColor(type: MemoryType): string {
    return MemoryServiceUtils.getMemoryTypeColor(type);
  }

  public calculateMemoryAge(timestamp: number): string {
    return MemoryServiceUtils.calculateMemoryAge(timestamp);
  }

  public truncateContent(content: string, maxLength: number = 100): string {
    return MemoryServiceUtils.truncateContent(content, maxLength);
  }
}

// WebSocket implementation
export class MemoryServiceWebSocket {
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
        console.log('Connected to Memory Service WebSocket');
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
        console.log('Disconnected from Memory Service WebSocket');
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
export const MemoryService = {
  MemoryServiceImpl,
  MemoryServiceWebSocket,
  MemoryServiceUtils,
};
