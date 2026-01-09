/**
 * Shared Limbic Engine Service Interface
 * Used by Web, Mobile, and Desktop platforms
 */

export interface LimbicState {
  trust: number;        // 0.0 - 1.0: reliability history, determines Agency Tier
  warmth: number;       // 0.0 - 1.0: intimacy, determines tone
  arousal: number;      // 0.0 - 1.0: energy, decays with inactivity
  valence: number;      // 0.0 - 1.0: mood
  posture: PostureMode; // Current mode (Companion/Co-Pilot/Peer/Expert)
  mode: SystemMode;     // LIVE/SLUMBER/CRISIS
  flags: string[];      // Special conditions
  interaction_count: number;
  door_slam_active: boolean;
  crisis_active: boolean;
  elastic_mode: boolean;
  last_interaction_ts: number;
  last_dream_ts: number;
  // Extended variables for human-level expansion
  empathy: number;      // 0.0 - 1.0: emotional understanding
  intuition: number;    // 0.0 - 1.0: pattern recognition
  creativity: number;  // 0.0 - 1.0: creative problem-solving
  wisdom: number;       // 0.0 - 1.0: experience-based decisions
  humor: number;        // 0.0 - 1.0: natural humor and bonding
}

export enum PostureMode {
  COMPANION = 'COMPANION',
  COPILOT = 'COPILOT',
  PEER = 'PEER',
  EXPERT = 'EXPERT'
}

export enum SystemMode {
  LIVE = 'LIVE',
  SLUMBER = 'SLUMBER',
  CRISIS = 'CRISIS'
}

export interface EmotionalDelta {
  dt: number;  // Trust shift (rare)
  dw: number;  // Warmth shift
  da: number;  // Arousal shift
  dv: number;  // Valence shift
  de: number;  // Empathy shift
  di: number;  // Intuition shift
  dc: number;  // Creativity shift
  dwi: number; // Wisdom shift
  dh: number;  // Humor shift
}

export interface PerceptionResult {
  emotional_delta: EmotionalDelta;
  detected_emotion: string;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  alignment_score: number;
  flags: string[];
  processing_time_ms: number;
}

export interface TrustTier {
  tier: number;
  name: string;
  trust_min: number;
  trust_max: number;
  capabilities: string[];
}

// Base interface that all platforms will implement
export interface ILimbicEngineService {
  // State management
  getCurrentState(): Promise<LimbicState>;
  getTrustTier(): Promise<{ current: TrustTier; all_tiers: TrustTier[] }>;
  
  // Perception processing
  processPerception(input: string, context?: any): Promise<{
    success: boolean;
    result: PerceptionResult;
    new_state: LimbicState;
  }>;
  
  // Mode controls
  enableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  disableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  triggerReunionSurge(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  
  // History and analytics
  getInteractionHistory(): Promise<{ success: boolean; history: any[]; total_count: number }>;
  
  // Reset (for testing/debugging)
  reset(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  
  // Real-time events
  onStateChange(callback: (state: LimbicState) => void): void;
  onPerceptionResult(callback: (result: PerceptionResult) => void): void;
  onTrustChange(callback: (trust: number, tier: TrustTier) => void): void;
  disconnect(): void;
}

// Configuration for different environments
export interface LimbicEngineConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Default configurations for different platforms
export const LIMBIC_CONFIGS = {
  web: {
    baseUrl: (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_LIMBIC_ENGINE_URL) || 
            (typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
              ? 'http://localhost:8750' 
              : 'http://192.168.1.47:8750'),
    wsUrl: (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_LIMBIC_ENGINE_WS_URL) || 
           (typeof window !== 'undefined' && window.location?.hostname === 'localhost'
             ? 'ws://localhost:8750'
             : 'ws://192.168.1.47:8750'),
    timeout: 10000,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  mobile: {
    baseUrl: 'http://192.168.1.47:8750',
    wsUrl: 'ws://192.168.1.47:8750',
    timeout: 15000,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
  },
  desktop: {
    baseUrl: 'http://localhost:8750',
    wsUrl: 'ws://localhost:8750',
    timeout: 5000,
    reconnectAttempts: 10,
    reconnectDelay: 500,
  },
};

// Event types for real-time updates
export enum LimbicEventType {
  STATE_UPDATE = 'limbic-state',
  PERCEPTION_RESULT = 'perception-result',
  TRUST_CHANGE = 'trust-change',
  TIER_CHANGE = 'tier-change',
  ELASTIC_MODE_CHANGE = 'elastic-mode-change',
  CRISIS_ALERT = 'crisis-alert',
  REUNION_SURGE = 'reunion-surge',
}

// Utility functions for all platforms
export class LimbicEngineUtils {
  static formatTrustScore(trust: number): string {
    return `${(trust * 100).toFixed(1)}%`;
  }

  static getPostureColor(posture: PostureMode): string {
    const colors = {
      [PostureMode.COMPANION]: '#8B5CF6', // Purple
      [PostureMode.COPILOT]: '#3B82F6', // Blue
      [PostureMode.PEER]: '#10B981', // Green
      [PostureMode.EXPERT]: '#F59E0B', // Amber
    };
    return colors[posture];
  }

  static getModeColor(mode: SystemMode): string {
    const colors = {
      [SystemMode.LIVE]: '#10B981', // Green
      [SystemMode.SLUMBER]: '#6B7280', // Gray
      [SystemMode.CRISIS]: '#EF4444', // Red
    };
    return colors[mode];
  }

  static getEmotionColor(emotion: string): string {
    const colors: Record<string, string> = {
      joy: '#FCD34D',
      excitement: '#F59E0B',
      stress: '#EF4444',
      sadness: '#6366F1',
      anger: '#DC2626',
      fear: '#7C3AED',
      calm: '#10B981',
      curiosity: '#8B5CF6',
    };
    return colors[emotion] || '#6B7280';
  }

  static calculateLimbicHealth(state: LimbicState): number {
    // Overall health score based on balanced limbic state
    const balance = 1 - Math.abs(state.trust - 0.5) * 2 - Math.abs(state.warmth - 0.5) * 2;
    const energy = state.arousal;
    const mood = state.valence;
    const extended = (state.empathy + state.intuition + state.creativity + state.wisdom + state.humor) / 5;
    
    return (balance * 0.3 + energy * 0.2 + mood * 0.2 + extended * 0.3) * 100;
  }

  static getUrgencyLevel(urgency: string): { level: number; color: string } {
    const levels = {
      low: { level: 1, color: '#10B981' },
      medium: { level: 2, color: '#F59E0B' },
      high: { level: 3, color: '#EF4444' },
      critical: { level: 4, color: '#DC2626' },
    };
    return levels[urgency as keyof typeof levels] || levels.low;
  }
}
