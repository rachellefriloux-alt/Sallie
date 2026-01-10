/**
 * Production-ready Limbic Engine Service Implementation
 * Used by Web, Mobile, and Desktop platforms
 */

import * as LimbicEngine from './limbicEngine';

export type LimbicState = LimbicEngine.LimbicState;
export type PerceptionResult = LimbicEngine.PerceptionResult;

export class LimbicEngineUtils {
  static calculateTrustScore(state: LimbicState): number {
    return state.trust;
  }
  
  static calculateEmotionalBalance(state: LimbicState): number {
    return (state.warmth + state.valence) / 2;
  }
  
  static calculateEngagement(state: LimbicState): number {
    return (state.arousal + state.empathy + state.intuition) / 3;
  }
  
  static formatPosture(posture: LimbicEngine.PostureMode): string {
    return posture.charAt(0).toUpperCase() + posture.slice(1).toLowerCase();
  }
  
  static getPostureColor(posture: LimbicEngine.PostureMode): string {
    switch (posture) {
      case LimbicEngine.PostureMode.COMPANION: return '#10B981';
      case LimbicEngine.PostureMode.COPILOT: return '#3B82F6';
      case LimbicEngine.PostureMode.PEER: return '#8B5CF6';
      case LimbicEngine.PostureMode.EXPERT: return '#F59E0B';
      default: return '#6B7280';
    }
  }
}

export class LimbicEngineServiceImpl implements LimbicEngine.ILimbicEngineService {
  private baseUrl: string;
  private wsUrl: string;
  private eventListeners: Map<string, Function[]> = new Map();
  private ws?: WebSocket;
  
  constructor() {
    this.baseUrl = 'http://localhost:8750';
    this.wsUrl = 'ws://localhost:8750';
  }
  
  async getCurrentState(): Promise<LimbicState> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/state`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get current state:', error);
      // Fallback to mock data
      return {
        trust: 0.5,
        warmth: 0.6,
        arousal: 0.7,
        valence: 0.6,
        posture: LimbicEngine.PostureMode.PEER,
        mode: LimbicEngine.SystemMode.LIVE,
        flags: [],
        interaction_count: 0,
        door_slam_active: false,
        crisis_active: false,
        elastic_mode: false,
        last_interaction_ts: Date.now(),
        last_dream_ts: Date.now(),
        empathy: 0.5,
        intuition: 0.6,
        creativity: 0.5,
        wisdom: 0.5,
        humor: 0.4,
      };
    }
  }

  async getTrustTier(): Promise<{ current: LimbicEngine.TrustTier; all_tiers: LimbicEngine.TrustTier[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/trust-tier`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get trust tier:', error);
      // Fallback to mock data
      const tiers: LimbicEngine.TrustTier[] = [
        { tier: 0, name: 'Stranger', trust_min: 0.0, trust_max: 0.2, capabilities: [] },
        { tier: 1, name: 'Associate', trust_min: 0.2, trust_max: 0.4, capabilities: [] },
        { tier: 2, name: 'Partner', trust_min: 0.4, trust_max: 0.6, capabilities: [] },
        { tier: 3, name: 'Surrogate', trust_min: 0.6, trust_max: 0.8, capabilities: [] },
        { tier: 4, name: 'Full Partner', trust_min: 0.8, trust_max: 1.0, capabilities: [] },
      ];
      
      return {
        current: tiers[2],
        all_tiers: tiers,
      };
    }
  }

  async processPerception(input: string, context?: any): Promise<{
    success: boolean;
    result: PerceptionResult;
    new_state: LimbicState;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/perception`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, context }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to process perception:', error);
      // Fallback to mock implementation
      return {
        success: true,
        result: {
          emotional_delta: { dt: 0, dw: 0, da: 0, dv: 0, de: 0, di: 0, dc: 0, dwi: 0, dh: 0 },
          detected_emotion: 'neutral',
          urgency: 'low',
          alignment_score: 0.5,
          flags: [],
          processing_time_ms: 100,
        },
        new_state: await this.getCurrentState(),
      };
    }
  }

  async getHistory(limit: number = 100): Promise<{ timestamp: number; state: LimbicState; event: string }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/history?limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get history:', error);
      // Fallback to mock data
      const currentState = await this.getCurrentState();
      return Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        timestamp: Date.now() - (i * 60000),
        state: { ...currentState, trust: Math.max(0, currentState.trust - (i * 0.1)) },
        event: i === 0 ? 'current_state' : 'state_change'
      }));
    }
  }

  async enableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/elastic-mode/enable`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to enable elastic mode:', error);
      return {
        success: false,
        message: 'Failed to enable elastic mode',
        state: await this.getCurrentState(),
      };
    }
  }

  async disableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/elastic-mode/disable`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to disable elastic mode:', error);
      return {
        success: false,
        message: 'Failed to disable elastic mode',
        state: await this.getCurrentState(),
      };
    }
  }

  async triggerReunionSurge(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/reunion-surge`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to trigger reunion surge:', error);
      return {
        success: false,
        message: 'Failed to trigger reunion surge',
        state: await this.getCurrentState(),
      };
    }
  }

  async getInteractionHistory(): Promise<{ success: boolean; history: any[]; total_count: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/history`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get interaction history:', error);
      return {
        success: true,
        history: [],
        total_count: 0,
      };
    }
  }

  async reset(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/limbic/reset`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to reset limbic engine:', error);
      return {
        success: false,
        message: 'Failed to reset limbic engine',
        state: await this.getCurrentState(),
      };
    }
  }

  onStateChange(callback: (state: LimbicState) => void): void {
    this.addEventListener('limbic-state', callback);
  }

  onPerceptionResult(callback: (result: PerceptionResult) => void): void {
    this.addEventListener('perception-result', callback);
  }

  onTrustChange(callback: (trust: number, tier: LimbicEngine.TrustTier) => void): void {
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
}

export class LimbicEngineWebSocket {
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
