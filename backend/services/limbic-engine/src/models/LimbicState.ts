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

export const TRUST_TIERS: TrustTier[] = [
  {
    tier: 0,
    name: 'Stranger',
    trust_min: 0.0,
    trust_max: 0.6,
    capabilities: ['suggest_actions', 'read_whitelisted_files']
  },
  {
    tier: 1,
    name: 'Associate',
    trust_min: 0.6,
    trust_max: 0.8,
    capabilities: ['suggest_actions', 'read_whitelisted_files', 'write_to_drafts']
  },
  {
    tier: 2,
    name: 'Partner',
    trust_min: 0.8,
    trust_max: 0.9,
    capabilities: ['suggest_actions', 'read_all_files', 'write_to_drafts', 'write_whitelist', 'send_drafts', 'execute_safe_code']
  },
  {
    tier: 3,
    name: 'Surrogate',
    trust_min: 0.9,
    trust_max: 1.0,
    capabilities: ['all_capabilities', 'direct_modification', 'send_messages', 'execute_code', 'system_automation']
  },
  {
    tier: 4,
    name: 'Full Partner',
    trust_min: 0.95,
    trust_max: 1.0,
    capabilities: ['all_capabilities', 'unrestricted_access', 'autonomous_decision_making', 'cross_platform_automation']
  }
];

export interface DecayRates {
  arousal_per_day: number;
  arousal_floor: number;
  valence_drift_per_hour: number;
  valence_baseline: number;
  warmth_decay_per_day: number;
  empathy_decay_per_day: number;
  creativity_decay_per_day: number;
  wisdom_decay_per_day: number;
  humor_decay_per_day: number;
}

export interface Thresholds {
  slumber_threshold: number;
  crisis_threshold: number;
  door_slam_threshold: number;
  elastic_mode_trigger: number;
  high_trust_threshold: number;
  high_warmth_threshold: number;
  high_arousal_threshold: number;
  low_valence_threshold: number;
}

export interface LimbicConfig {
  bootstrap: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    empathy: number;
    intuition: number;
    creativity: number;
    wisdom: number;
    humor: number;
  };
  decay_rates: DecayRates;
  thresholds: Thresholds;
  behavior: {
    dream_cycle_hour: number;
    refractory_hours: number;
    reunion_hours: number;
    max_hypotheses_per_veto: number;
  };
}
