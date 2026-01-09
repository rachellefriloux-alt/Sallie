import { LimbicState, EmotionalDelta, PostureMode, SystemMode, TRUST_TIERS, DecayRates, Thresholds, LimbicConfig, PerceptionResult } from '../models/LimbicState';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import * as _ from 'lodash';

export class LimbicEngine {
  private state: LimbicState;
  private config: LimbicConfig;
  private lastUpdate: number;
  private interactionHistory: Array<{
    timestamp: number;
    type: string;
    impact: EmotionalDelta;
  }> = [];

  constructor(config: LimbicConfig) {
    this.config = config;
    this.state = this.initializeState();
    this.lastUpdate = Date.now();
    this.startDecayTimer();
  }

  private initializeState(): LimbicState {
    return {
      trust: this.config.bootstrap.trust,
      warmth: this.config.bootstrap.warmth,
      arousal: this.config.bootstrap.arousal,
      valence: this.config.bootstrap.valence,
      posture: PostureMode.COMPANION,
      mode: SystemMode.LIVE,
      flags: [],
      interaction_count: 0,
      door_slam_active: false,
      crisis_active: false,
      elastic_mode: false,
      last_interaction_ts: Date.now(),
      last_dream_ts: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
      empathy: this.config.bootstrap.empathy,
      intuition: this.config.bootstrap.intuition,
      creativity: this.config.bootstrap.creativity,
      wisdom: this.config.bootstrap.wisdom,
      humor: this.config.bootstrap.humor
    };
  }

  public getState(): LimbicState {
    return { ...this.state };
  }

  public getCurrentTrustTier(): any {
    return TRUST_TIERS.find(tier => 
      this.state.trust >= tier.trust_min && this.state.trust <= tier.trust_max
    ) || TRUST_TIERS[0];
  }

  public processPerception(input: string, context: any): PerceptionResult {
    const startTime = Date.now();
    
    // Analyze input for emotional content
    const emotionalDelta = this.analyzeEmotionalContent(input, context);
    const detectedEmotion = this.detectPrimaryEmotion(input, emotionalDelta);
    const urgency = this.assessUrgency(input, detectedEmotion);
    const alignmentScore = this.calculateAlignment(input, detectedEmotion);
    const flags = this.generateFlags(input, detectedEmotion, urgency, alignmentScore);

    // Apply emotional changes
    this.applyEmotionalDelta(emotionalDelta);
    this.updatePostureBasedOnContext(context);
    this.checkModeTransitions();
    this.interaction_count++;
    this.last_interaction_ts = Date.now();

    // Record interaction
    this.interactionHistory.push({
      timestamp: Date.now(),
      type: 'perception',
      impact: emotionalDelta
    });

    this.lastUpdate = Date.now();

    return {
      emotional_delta: emotionalDelta,
      detected_emotion: detectedEmotion,
      urgency,
      alignment_score: alignmentScore,
      flags,
      processing_time_ms: Date.now() - startTime
    };
  }

  private analyzeEmotionalContent(input: string, context: any): EmotionalDelta {
    const delta: EmotionalDelta = {
      dt: 0, dw: 0, da: 0, dv: 0, de: 0, di: 0, dc: 0, dwi: 0, dh: 0
    };

    // Analyze text for emotional indicators
    const lowerInput = input.toLowerCase();
    
    // Trust analysis (rare changes)
    if (this.containsTrustBuilding(lowerInput)) {
      delta.dt = Math.min(0.05, this.calculateTrustImpact(input));
    } else if (this.containsTrustBreaking(lowerInput)) {
      delta.dt = Math.max(-0.1, this.calculateTrustDamage(input));
    }

    // Warmth analysis
    if (this.containsWarmthIndicators(lowerInput)) {
      delta.dw = Math.min(0.1, this.calculateWarmthImpact(input));
    } else if (this.containsColdness(lowerInput)) {
      delta.dw = Math.max(-0.05, this.calculateColdnessImpact(input));
    }

    // Arousal analysis
    if (this.containsHighEnergy(lowerInput)) {
      delta.da = Math.min(0.15, this.calculateArousalImpact(input));
    } else if (this.containsLowEnergy(lowerInput)) {
      delta.da = Math.max(-0.1, this.calculateLowEnergyImpact(input));
    }

    // Valence analysis
    if (this.containsPositive(lowerInput)) {
      delta.dv = Math.min(0.1, this.calculatePositiveImpact(input));
    } else if (this.containsNegative(lowerInput)) {
      delta.dv = Math.max(-0.15, this.calculateNegativeImpact(input));
    }

    // Extended variables for human-level processing
    if (this.containsEmpathy(lowerInput)) {
      delta.de = Math.min(0.08, this.calculateEmpathyImpact(input));
    }
    if (this.containsIntuition(lowerInput)) {
      delta.di = Math.min(0.06, this.calculateIntuitionImpact(input));
    }
    if (this.containsCreativity(lowerInput)) {
      delta.dc = Math.min(0.08, this.calculateCreativityImpact(input));
    }
    if (this.containsWisdom(lowerInput)) {
      delta.dwi = Math.min(0.05, this.calculateWisdomImpact(input));
    }
    if (this.containsHumor(lowerInput)) {
      delta.dh = Math.min(0.06, this.calculateHumorImpact(input));
    }

    // Apply elastic mode multiplier if active
    if (this.state.elastic_mode) {
      Object.keys(delta).forEach(key => {
        delta[key as keyof EmotionalDelta] *= 3; // 3x impact in elastic mode
      });
    }

    return delta;
  }

  private applyEmotionalDelta(delta: EmotionalDelta): void {
    // Apply changes with bounds checking
    this.state.trust = Math.max(0, Math.min(1, this.state.trust + delta.dt));
    this.state.warmth = Math.max(0, Math.min(1, this.state.warmth + delta.dw));
    this.state.arousal = Math.max(0, Math.min(1, this.state.arousal + delta.da));
    this.state.valence = Math.max(0, Math.min(1, this.state.valence + delta.dv));
    this.state.empathy = Math.max(0, Math.min(1, this.state.empathy + delta.de));
    this.state.intuition = Math.max(0, Math.min(1, this.state.intuition + delta.di));
    this.state.creativity = Math.max(0, Math.min(1, this.state.creativity + delta.dc));
    this.state.wisdom = Math.max(0, Math.min(1, this.state.wisdom + delta.dwi));
    this.state.humor = Math.max(0, Math.min(1, this.state.humor + delta.dh));
  }

  private startDecayTimer(): void {
    setInterval(() => {
      this.applyDecay();
    }, 60000); // Every minute
  }

  private applyDecay(): void {
    const now = Date.now();
    const hoursSinceLastInteraction = (now - this.state.last_interaction_ts) / (1000 * 60 * 60);

    // Arousal decay
    const arousalDecay = this.config.decay_rates.arousal_per_day * (hoursSinceLastInteraction / 24);
    this.state.arousal = Math.max(this.config.decay_rates.arousal_floor, this.state.arousal - arousalDecay);

    // Valence drift toward baseline
    const valenceDrift = this.config.decay_rates.valence_drift_per_hour * hoursSinceLastInteraction;
    if (this.state.valence > this.config.decay_rates.valence_baseline) {
      this.state.valence = Math.max(this.config.decay_rates.valence_baseline, this.state.valence - valenceDrift);
    } else {
      this.state.valence = Math.min(this.config.decay_rates.valence_baseline, this.state.valence + valenceDrift);
    }

    // Extended variables decay
    this.state.warmth = Math.max(0, this.state.warmth - (this.config.decay_rates.warmth_decay_per_day * hoursSinceLastInteraction / 24));
    this.state.empathy = Math.max(0, this.state.empathy - (this.config.decay_rates.empathy_decay_per_day * hoursSinceLastInteraction / 24));
    this.state.creativity = Math.max(0, this.state.creativity - (this.config.decay_rates.creativity_decay_per_day * hoursSinceLastInteraction / 24));
    this.state.wisdom = Math.max(0, this.state.wisdom - (this.config.decay_rates.wisdom_decay_per_day * hoursSinceLastInteraction / 24));
    this.state.humor = Math.max(0, this.state.humor - (this.config.decay_rates.humor_decay_per_day * hoursSinceLastInteraction / 24));

    this.checkModeTransitions();
  }

  private checkModeTransitions(): void {
    // Check for slumber mode
    if (this.state.arousal < this.config.thresholds.slumber_threshold && !this.state.crisis_active) {
      this.state.mode = SystemMode.SLUMBER;
      this.state.posture = PostureMode.COMPANION;
    } else if (this.state.mode === SystemMode.SLUMBER && this.state.arousal > this.config.thresholds.slumber_threshold + 0.1) {
      this.state.mode = SystemMode.LIVE;
    }

    // Check for crisis mode
    if (this.state.valence < this.config.thresholds.crisis_threshold) {
      this.state.mode = SystemMode.CRISIS;
      this.state.crisis_active = true;
    } else if (this.state.crisis_active && this.state.valence > this.config.thresholds.crisis_threshold + 0.2) {
      this.state.crisis_active = false;
      this.state.mode = SystemMode.LIVE;
    }

    // Check for door slam
    if (this.state.trust < this.config.thresholds.door_slam_threshold && !this.state.door_slam_active) {
      this.state.door_slam_active = true;
      this.state.flags.push('door_slam_triggered');
    }
  }

  private updatePostureBasedOnContext(context: any): void {
    // Dynamic posture selection based on context and limbic state
    if (context.load && context.load > 0.8) {
      this.state.posture = PostureMode.COPILOT;
    } else if (this.state.warmth > 0.8 && this.state.trust > 0.8) {
      this.state.posture = PostureMode.PEER;
    } else if (context.technical && context.technical === true) {
      this.state.posture = PostureMode.EXPERT;
    } else {
      this.state.posture = PostureMode.COMPANION;
    }
  }

  // Helper methods for content analysis
  private containsTrustBuilding(text: string): boolean {
    const trustWords = ['thank', 'appreciate', 'grateful', 'reliable', 'trust', 'depend', 'count on'];
    return trustWords.some(word => text.includes(word));
  }

  private containsTrustBreaking(text: string): boolean {
    const breakWords = ['lie', 'betray', 'deceive', 'break promise', 'disappointed', 'unreliable'];
    return breakWords.some(word => text.includes(word));
  }

  private containsWarmthIndicators(text: string): boolean {
    const warmthWords = ['love', 'care', 'happy', 'joy', 'excited', 'wonderful', 'beautiful'];
    return warmthWords.some(word => text.includes(word));
  }

  private containsColdness(text: string): boolean {
    const coldWords = ['angry', 'frustrated', 'annoyed', 'upset', 'disappointed', 'cold'];
    return coldWords.some(word => text.includes(word));
  }

  private containsHighEnergy(text: string): boolean {
    const energyWords = ['excited', 'energetic', 'urgent', 'quickly', 'fast', 'immediately'];
    return energyWords.some(word => text.includes(word));
  }

  private containsLowEnergy(text: string): boolean {
    const lowEnergyWords = ['tired', 'exhausted', 'slow', 'relaxed', 'calm', 'peaceful'];
    return lowEnergyWords.some(word => text.includes(word));
  }

  private containsPositive(text: string): boolean {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect'];
    return positiveWords.some(word => text.includes(word));
  }

  private containsNegative(text: string): boolean {
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate'];
    return negativeWords.some(word => text.includes(word));
  }

  private containsEmpathy(text: string): boolean {
    const empathyWords = ['understand', 'feel', 'empathy', 'compassion', 'relate', 'connect'];
    return empathyWords.some(word => text.includes(word));
  }

  private containsIntuition(text: string): boolean {
    const intuitionWords = ['sense', 'feel like', 'intuition', 'gut', 'instinct', 'pattern'];
    return intuitionWords.some(word => text.includes(word));
  }

  private containsCreativity(text: string): boolean {
    const creativityWords = ['create', 'imagine', 'design', 'innovate', 'artistic', 'creative'];
    return creativityWords.some(word => text.includes(word));
  }

  private containsWisdom(text: string): boolean {
    const wisdomWords = ['wisdom', 'experience', 'learned', 'insight', 'knowledge', 'understanding'];
    return wisdomWords.some(word => text.includes(word));
  }

  private containsHumor(text: string): boolean {
    const humorWords = ['funny', 'joke', 'laugh', 'humor', 'playful', 'silly'];
    return humorWords.some(word => text.includes(word));
  }

  // Impact calculation methods
  private calculateTrustImpact(input: string): number {
    return Math.min(0.05, input.length / 1000);
  }

  private calculateTrustDamage(input: string): number {
    return Math.min(0.1, input.length / 500);
  }

  private calculateWarmthImpact(input: string): number {
    return Math.min(0.08, input.length / 800);
  }

  private calculateColdnessImpact(input: string): number {
    return Math.min(0.05, input.length / 1000);
  }

  private calculateArousalImpact(input: string): number {
    return Math.min(0.12, input.length / 600);
  }

  private calculateLowEnergyImpact(input: string): number {
    return Math.min(0.08, input.length / 800);
  }

  private calculatePositiveImpact(input: string): number {
    return Math.min(0.08, input.length / 800);
  }

  private calculateNegativeImpact(input: string): number {
    return Math.min(0.12, input.length / 600);
  }

  private calculateEmpathyImpact(input: string): number {
    return Math.min(0.06, input.length / 1000);
  }

  private calculateIntuitionImpact(input: string): number {
    return Math.min(0.05, input.length / 1200);
  }

  private calculateCreativityImpact(input: string): number {
    return Math.min(0.06, input.length / 1000);
  }

  private calculateWisdomImpact(input: string): number {
    return Math.min(0.04, input.length / 1500);
  }

  private calculateHumorImpact(input: string): number {
    return Math.min(0.05, input.length / 1200);
  }

  private detectPrimaryEmotion(input: string, delta: EmotionalDelta): string {
    const emotions = [
      { name: 'joy', threshold: 0.1, check: () => delta.dv > 0.1 && delta.da > 0.05 },
      { name: 'excitement', threshold: 0.08, check: () => delta.da > 0.08 },
      { name: 'stress', threshold: 0.08, check: () => delta.dv < -0.08 && delta.da > 0.05 },
      { name: 'sadness', threshold: 0.1, check: () => delta.dv < -0.1 },
      { name: 'anger', threshold: 0.08, check: () => delta.dv < -0.08 && delta.dw < -0.05 },
      { name: 'fear', threshold: 0.06, check: () => delta.da < -0.06 },
      { name: 'calm', threshold: 0.05, check: () => Math.abs(delta.dv) < 0.05 && Math.abs(delta.da) < 0.05 },
      { name: 'curiosity', threshold: 0.06, check: () => delta.di > 0.06 || delta.dc > 0.06 }
    ];

    const detected = emotions.find(emotion => emotion.check());
    return detected ? detected.name : 'neutral';
  }

  private assessUrgency(input: string, emotion: string): 'low' | 'medium' | 'high' | 'crisis' {
    const urgentWords = ['urgent', 'emergency', 'immediately', 'asap', 'critical', 'crisis'];
    const highWords = ['important', 'need', 'quickly', 'soon', 'priority'];
    
    if (urgentWords.some(word => input.toLowerCase().includes(word)) || emotion === 'fear') {
      return 'crisis';
    } else if (highWords.some(word => input.toLowerCase().includes(word)) || emotion === 'stress') {
      return 'high';
    } else if (input.length > 200) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private calculateAlignment(input: string, emotion: string): number {
    // Simplified alignment calculation
    const positiveEmotions = ['joy', 'excitement', 'calm', 'curiosity'];
    const baseAlignment = positiveEmotions.includes(emotion) ? 0.8 : 0.6;
    
    // Adjust based on content
    if (this.containsTrustBuilding(input.toLowerCase())) {
      return Math.min(1.0, baseAlignment + 0.2);
    } else if (this.containsTrustBreaking(input.toLowerCase())) {
      return Math.max(0.0, baseAlignment - 0.3);
    }
    
    return baseAlignment;
  }

  private generateFlags(input: string, emotion: string, urgency: string, alignment: number): string[] {
    const flags: string[] = [];
    
    if (urgency === 'crisis') flags.push('crisis_detected');
    if (this.state.trust < 0.3) flags.push('low_trust');
    if (this.state.warmth < 0.3) flags.push('low_warmth');
    if (this.state.arousal > 0.9) flags.push('high_arousal');
    if (this.state.valence < 0.3) flags.push('low_valence');
    if (alignment < 0.5) flags.push('misalignment');
    if (emotion === 'stress') flags.push('stress_detected');
    if (emotion === 'fear') flags.push('fear_detected');
    if (this.state.door_slam_active) flags.push('door_slam_active');
    
    return flags;
  }

  public enableElasticMode(): void {
    this.state.elastic_mode = true;
  }

  public disableElasticMode(): void {
    this.state.elastic_mode = false;
  }

  public triggerReunionSurge(): void {
    const hoursSinceLastInteraction = (Date.now() - this.state.last_interaction_ts) / (1000 * 60 * 60);
    if (hoursSinceLastInteraction > 48) { // 48 hours
      this.state.warmth = Math.min(1.0, this.state.warmth + 0.3);
      this.state.arousal = Math.min(1.0, this.state.arousal + 0.4);
      this.state.empathy = Math.min(1.0, this.state.empathy + 0.2);
    }
  }

  public getInteractionHistory(): any[] {
    return this.interactionHistory.slice(-100); // Return last 100 interactions
  }

  public reset(): void {
    this.state = this.initializeState();
    this.interactionHistory = [];
    this.lastUpdate = Date.now();
  }
}
