/**
 * API client for mobile app.
 * Handles communication with the Digital Progeny backend.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  text: string;
  timestamp?: number;
}

export interface ChatResponse {
  response: string;
  limbic_state: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    posture: string;
  };
  decision?: any;
  timestamp: number;
}

export interface SyncStatus {
  device_id: string;
  last_sync: number;
  registered_devices: number;
  sync_enabled: boolean;
  encryption_enabled: boolean;
}

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private wsConnection: WebSocket | null = null;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth tokens
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Send chat message and get response.
   */
  async chat(message: string): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>('/chat', {
        text: message,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Chat failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Connect to WebSocket for real-time chat.
   */
  connectWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void
  ): void {
    const wsURL = this.baseURL.replace('http', 'ws') + '/ws';
    this.wsConnection = new WebSocket(wsURL);

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  /**
   * Send message via WebSocket.
   */
  sendWebSocketMessage(message: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(message);
    } else {
      console.warn('WebSocket not connected');
    }
  }

  /**
   * Close WebSocket connection.
   */
  closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Get sync status.
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const response = await this.client.get<SyncStatus>('/sync/status');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get sync status: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Register mobile device.
   */
  async registerDevice(
    deviceId: string,
    platform: string,
    version: string,
    capabilities: string[],
    pushToken?: string,
    pushPlatform?: string
  ): Promise<any> {
    try {
      const response = await this.client.post('/mobile/register', {
        device_id: deviceId,
        platform,
        version,
        capabilities,
        push_token: pushToken,
        push_platform: pushPlatform,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Device registration failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Sync limbic state.
   */
  async syncLimbicState(): Promise<any> {
    try {
      const response = await this.client.post('/sync/limbic');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Sync failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get limbic state.
   */
  async getLimbicState(): Promise<any> {
    try {
      const response = await this.client.get('/limbic/state');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get limbic state: ${error.message}`);
      }
      throw error;
    }
  }
}

export default APIClient;

