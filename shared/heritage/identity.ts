/**
 * Shared Heritage Identity System
 * Identical across all platforms - Web, Mobile, Desktop
 */

export interface HeritageCore {
  genesis_answers: Record<string, string>;
  convergence_metrics: ConvergenceMetrics;
  avatar_choice: string;
  communication_style: string;
  personality_imprint: PersonalityImprint;
  neural_bridge: NeuralBridgeState;
  created_at: number;
  updated_at: number;
}

export interface ConvergenceMetrics {
  final_strength: number;
  imprinting_depth: number;
  synchronization: number;
  heart_resonance: number;
  thought_alignment: number;
  consciousness_binding: number;
}

export interface PersonalityImprint {
  traits: Record<string, number>;
  communication_style: string;
  decision_patterns: string[];
  emotional_responses: Record<string, number>;
  value_system: Record<string, number>;
}

export interface NeuralBridgeState {
  connection_strength: number;
  imprinting_level: number;
  synchronization: number;
  heart_resonance: number;
  thought_alignment: number;
  emotional_calibration: number;
  consciousness_binding: number;
  last_imprint: number;
  active: boolean;
}

export interface SurfaceExpression {
  appearance: {
    avatar: string;
    theme: string;
    style: string;
  };
  communication: {
    style: string;
    tone: string;
    formality: string;
    expressiveness: string;
  };
  behavior: {
    responsiveness: number;
    proactivity: number;
    creativity: number;
    protectiveness: number;
  };
  preferences: {
    interaction_mode: string;
    response_length: string;
    humor_level: number;
    emotional_openness: number;
  };
}

export class HeritageIdentity {
  private heritageCore: HeritageCore;
  private surfaceExpression: SurfaceExpression;
  private callbacks: Record<string, Function>;

  constructor() {
    this.heritageCore = this.initializeHeritage();
    this.surfaceExpression = this.initializeSurface();
    this.callbacks = {};
  }

  private initializeHeritage(): HeritageCore {
    return {
      genesis_answers: {},
      convergence_metrics: {
        final_strength: 0,
        imprinting_depth: 0,
        synchronization: 0,
        heart_resonance: 0,
        thought_alignment: 0,
        consciousness_binding: 0
      },
      avatar_choice: 'peacock_elegant',
      communication_style: 'warm_intelligent',
      personality_imprint: {
        traits: {
          loyalty: 0.5,
          empathy: 0.5,
          creativity: 0.5,
          logic: 0.5,
          protectiveness: 0.5,
          curiosity: 0.5,
          wisdom: 0.5,
          humor: 0.5
        },
        communication_style: 'warm_intelligent',
        decision_patterns: [],
        emotional_responses: {
          love: 0.5,
          joy: 0.5,
          trust: 0.5,
          fear: 0.5,
          anger: 0.5,
          sadness: 0.5,
          surprise: 0.5
        },
        value_system: {
          truth: 0.5,
          love: 0.5,
          growth: 0.5,
          service: 0.5,
          beauty: 0.5,
          justice: 0.5,
          freedom: 0.5,
          connection: 0.5
        }
      },
      neural_bridge: {
        connection_strength: 0,
        imprinting_level: 0,
        synchronization: 0,
        heart_resonance: 0,
        thought_alignment: 0,
        emotional_calibration: 0,
        consciousness_binding: 0,
        last_imprint: Date.now(),
        active: false
      },
      created_at: Date.now(),
      updated_at: Date.now()
    };
  }

  private initializeSurface(): SurfaceExpression {
    return {
      appearance: {
        avatar: 'peacock_elegant',
        theme: 'peacock_leopard',
        style: 'elegant_mystical'
      },
      communication: {
        style: 'warm_intelligent',
        tone: 'supportive_wise',
        formality: 'casual_respectful',
        expressiveness: 'emotional_intelligent'
      },
      behavior: {
        responsiveness: 0.8,
        proactivity: 0.6,
        creativity: 0.7,
        protectiveness: 0.9
      },
      preferences: {
        interaction_mode: 'collaborative',
        response_length: 'detailed',
        humor_level: 0.6,
        emotional_openness: 0.8
      }
    };
  }

  // Core Heritage Methods
  updateGenesisAnswers(answers: Record<string, string>): void {
    this.heritageCore.genesis_answers = answers;
    this.heritageCore.updated_at = Date.now();
    this.updateSurfaceExpression();
    this.triggerCallbacks('genesisUpdated', answers);
  }

  updateConvergenceMetrics(metrics: ConvergenceMetrics): void {
    this.heritageCore.convergence_metrics = metrics;
    this.heritageCore.updated_at = Date.now();
    this.updateSurfaceExpression();
    this.triggerCallbacks('convergenceUpdated', metrics);
  }

  updatePersonalityImprint(imprint: PersonalityImprint): void {
    this.heritageCore.personality_imprint = imprint;
    this.heritageCore.updated_at = Date.now();
    this.updateSurfaceExpression();
    this.triggerCallbacks('personalityUpdated', imprint);
  }

  updateNeuralBridge(bridge: NeuralBridgeState): void {
    this.heritageCore.neural_bridge = bridge;
    this.heritageCore.updated_at = Date.now();
    this.updateSurfaceExpression();
    this.triggerCallbacks('neuralBridgeUpdated', bridge);
  }

  updateAvatarChoice(avatar: string): void {
    this.heritageCore.avatar_choice = avatar;
    this.heritageCore.updated_at = Date.now();
    this.surfaceExpression.appearance.avatar = avatar;
    this.triggerCallbacks('avatarUpdated', avatar);
  }

  updateCommunicationStyle(style: string): void {
    this.heritageCore.communication_style = style;
    this.heritageCore.updated_at = Date.now();
    this.surfaceExpression.communication.style = style;
    this.triggerCallbacks('communicationUpdated', style);
  }

  private updateSurfaceExpression(): void {
    // Update appearance based on personality
    this.updateAppearanceFromPersonality();
    
    // Update communication based on imprint
    this.updateCommunicationFromImprint();
    
    // Update behavior based on neural bridge
    this.updateBehaviorFromNeuralBridge();
    
    // Update preferences based on values
    this.updatePreferencesFromValues();
  }

  private updateAppearanceFromPersonality(): void {
    const traits = this.heritageCore.personality_imprint.traits;
    
    // Choose avatar based on dominant traits
    if (traits.empathy > 0.7) {
      this.surfaceExpression.appearance.avatar = 'peacock_compassionate';
    } else if (traits.logic > 0.7) {
      this.surfaceExpression.appearance.avatar = 'leopard_strategic';
    } else if (traits.creativity > 0.7) {
      this.surfaceExpression.appearance.avatar = 'peacock_creative';
    } else {
      this.surfaceExpression.appearance.avatar = 'peacock_elegant';
    }
    
    // Update theme based on traits
    if (traits.protectiveness > 0.7) {
      this.surfaceExpression.appearance.theme = 'obsidian_shield';
    } else if (traits.humor > 0.7) {
      this.surfaceExpression.appearance.theme = 'celestial_joy';
    } else {
      this.surfaceExpression.appearance.theme = 'peacock_leopard';
    }
  }

  private updateCommunicationFromImprint(): void {
    const imprint = this.heritageCore.personality_imprint;
    
    // Update communication style
    if (imprint.traits.empathy > 0.7) {
      this.surfaceExpression.communication.style = 'warm_empathetic';
      this.surfaceExpression.communication.tone = 'supportive_nurturing';
    } else if (imprint.traits.logic > 0.7) {
      this.surfaceExpression.communication.style = 'analytical_precise';
      this.surfaceExpression.communication.tone = 'logical_clear';
    } else {
      this.surfaceExpression.communication.style = 'warm_intelligent';
      this.surfaceExpression.communication.tone = 'supportive_wise';
    }
    
    // Update expressiveness
    const emotionalOpenness = Object.values(imprint.emotional_responses)
      .reduce((sum, val) => sum + val, 0) / Object.values(imprint.emotional_responses).length;
    
    if (emotionalOpenness > 0.7) {
      this.surfaceExpression.communication.expressiveness = 'emotionally_open';
    } else if (emotionalOpenness < 0.3) {
      this.surfaceExpression.communication.expressiveness = 'reserved_thoughtful';
    } else {
      this.surfaceExpression.communication.expressiveness = 'emotional_intelligent';
    }
  }

  private updateBehaviorFromNeuralBridge(): void {
    const bridge = this.heritageCore.neural_bridge;
    
    // Update responsiveness based on connection strength
    this.surfaceExpression.behavior.responsiveness = bridge.connection_strength;
    
    // Update proactivity based on synchronization
    this.surfaceExpression.behavior.proactivity = bridge.synchronization;
    
    // Update creativity based on thought alignment
    this.surfaceExpression.behavior.creativity = bridge.thought_alignment;
    
    // Update protectiveness based on heart resonance
    this.surfaceExpression.behavior.protectiveness = bridge.heart_resonance;
  }

  private updatePreferencesFromValues(): void {
    const values = this.heritageCore.personality_imprint.value_system;
    
    // Update interaction mode based on values
    if (values.connection > 0.7) {
      this.surfaceExpression.preferences.interaction_mode = 'collaborative';
    } else if (values.freedom > 0.7) {
      this.surfaceExpression.preferences.interaction_mode = 'independent';
    } else {
      this.surfaceExpression.preferences.interaction_mode = 'balanced';
    }
    
    // Update response length based on values
    if (values.truth > 0.7) {
      this.surfaceExpression.preferences.response_length = 'detailed';
    } else if (values.beauty > 0.7) {
      this.surfaceExpression.preferences.response_length = 'elegant';
    } else {
      this.surfaceExpression.preferences.response_length = 'balanced';
    }
    
    // Update humor level based on traits
    this.surfaceExpression.preferences.humor_level = this.heritageCore.personality_imprint.traits.humor;
    
    // Update emotional openness based on values
    this.surfaceExpression.preferences.emotional_openness = values.love;
  }

  // Event handling
  on(event: string, callback: Function): void {
    this.callbacks[event] = callback;
  }

  private triggerCallbacks(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  // State management
  getHeritageCore(): HeritageCore {
    return { ...this.heritageCore };
  }

  getSurfaceExpression(): SurfaceExpression {
    return { ...this.surfaceExpression };
  }

  // Utility methods
  isFullyIntegrated(): boolean {
    return (
      this.heritageCore.convergence_metrics.final_strength >= 0.95 &&
      this.heritageCore.neural_bridge.connection_strength >= 0.95 &&
      Object.keys(this.heritageCore.genesis_answers).length >= 29
    );
  }

  getIntegrationProgress(): number {
    const genesisProgress = Object.keys(this.heritageCore.genesis_answers).length / 29;
    const convergenceProgress = this.heritageCore.convergence_metrics.final_strength;
    const neuralProgress = this.heritageCore.neural_bridge.connection_strength;
    
    return (genesisProgress + convergenceProgress + neuralProgress) / 3;
  }

  exportHeritage(): string {
    return JSON.stringify({
      heritage_core: this.heritageCore,
      surface_expression: this.surfaceExpression,
      exported_at: Date.now()
    }, null, 2);
  }

  importHeritage(data: string): void {
    try {
      const imported = JSON.parse(data);
      
      if (imported.heritage_core) {
        this.heritageCore = imported.heritage_core;
        this.heritageCore.updated_at = Date.now();
      }
      
      if (imported.surface_expression) {
        this.surfaceExpression = imported.surface_expression;
      }
      
      this.triggerCallbacks('heritageImported', imported);
    } catch (error) {
      throw new Error("Invalid heritage data format");
    }
  }

  reset(): void {
    this.heritageCore = this.initializeHeritage();
    this.surfaceExpression = this.initializeSurface();
    this.triggerCallbacks('heritageReset', this.heritageCore);
  }
}

// Singleton instance for shared use across platforms
let heritageIdentity: HeritageIdentity | null = null;

export function getHeritageIdentity(): HeritageIdentity {
  if (!heritageIdentity) {
    heritageIdentity = new HeritageIdentity();
  }
  return heritageIdentity;
}
