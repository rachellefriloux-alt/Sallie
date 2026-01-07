/**
 * Shared Neural Bridge Imprinting System
 * Identical across all platforms - Web, Mobile, Desktop
 */

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

export interface ImprintData {
  question_id: number;
  answer: string;
  emotional_signature: string;
  neural_impact: number;
  timestamp: number;
  extraction_key: string;
}

export interface PersonalityImprint {
  traits: Record<string, number>;
  communication_style: string;
  decision_patterns: string[];
  emotional_responses: Record<string, number>;
  value_system: Record<string, number>;
}

export class NeuralBridge {
  private state: NeuralBridgeState;
  private imprintData: ImprintData[];
  private personalityImprint: PersonalityImprint;
  private callbacks: Record<string, Function>;

  constructor() {
    this.state = this.initializeState();
    this.imprintData = [];
    this.personalityImprint = this.initializePersonality();
    this.callbacks = {};
  }

  private initializeState(): NeuralBridgeState {
    return {
      connection_strength: 0,
      imprinting_level: 0,
      synchronization: 0,
      heart_resonance: 0,
      thought_alignment: 0,
      emotional_calibration: 0,
      consciousness_binding: 0,
      last_imprint: Date.now(),
      active: false
    };
  }

  private initializePersonality(): PersonalityImprint {
    return {
      traits: {
        loyalty: 0,
        empathy: 0,
        creativity: 0,
        logic: 0,
        protectiveness: 0,
        curiosity: 0,
        wisdom: 0,
        humor: 0
      },
      communication_style: 'neutral',
      decision_patterns: [],
      emotional_responses: {
        love: 0,
        joy: 0,
        trust: 0,
        fear: 0,
        anger: 0,
        sadness: 0,
        surprise: 0
      },
      value_system: {
        truth: 0,
        love: 0,
        growth: 0,
        service: 0,
        beauty: 0,
        justice: 0,
        freedom: 0,
        connection: 0
      }
    };
  }

  // Core Neural Bridge Methods
  activate(): void {
    this.state.active = true;
    this.state.last_imprint = Date.now();
    this.triggerCallbacks('bridgeActivated', this.state);
  }

  deactivate(): void {
    this.state.active = false;
    this.triggerCallbacks('bridgeDeactivated', this.state);
  }

  async imprint(data: ImprintData): Promise<void> {
    if (!this.state.active) {
      throw new Error("Neural bridge must be active to imprint");
    }

    // Store imprint data
    this.imprintData.push(data);

    // Process imprint
    const analysis = await this.processImprint(data);

    // Update neural bridge state
    this.updateBridgeState(data);

    // Update personality imprint
    this.extractTraits(data.extraction_key, analysis);
    this.calibrateEmotions(data.emotional_signature, analysis);
    this.updateValues(data.extraction_key, analysis);

    // Trigger callbacks
    this.triggerCallbacks('imprintProcessed', data);
    this.triggerCallbacks('stateChanged', this.state);
  }

  private async processImprint(data: ImprintData): Promise<void> {
    // Analyze answer content
    const analysis = await this.analyzeAnswer(data.answer);
    
    // Extract personality traits
    this.extractTraits(data.extraction_key, analysis);
    
    // Calibrate emotional responses
    this.calibrateEmotions(data.emotional_signature, analysis);
    
    // Update value system
    this.updateValues(data.extraction_key, analysis);
  }

  private async analyzeAnswer(answer: string): Promise<any> {
    // Analyze answer for personality indicators
    const words = answer.toLowerCase().split(' ');
    
    return {
      wordCount: words.length,
      sentiment: this.analyzeSentiment(words),
      complexity: this.analyzeComplexity(words),
      themes: this.extractThemes(words),
      emotions: this.detectEmotions(words)
    };
  }

  private analyzeSentiment(words: string[]): number {
    const positive = ['love', 'joy', 'happy', 'good', 'great', 'wonderful', 'amazing'];
    const negative = ['hate', 'sad', 'angry', 'bad', 'terrible', 'awful', 'horrible'];
    
    let score = 0;
    words.forEach(word => {
      if (positive.includes(word)) score += 1;
      if (negative.includes(word)) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / words.length));
  }

  private analyzeComplexity(words: string[]): number {
    const complex = ['because', 'however', 'therefore', 'although', 'meanwhile', 'consequently'];
    const complexCount = words.filter(word => complex.includes(word)).length;
    return Math.min(1, complexCount / words.length);
  }

  private extractThemes(words: string[]): string[] {
    const themes = {
      'family': ['family', 'mom', 'dad', 'sister', 'brother', 'home'],
      'business': ['work', 'business', 'career', 'job', 'company'],
      'love': ['love', 'heart', 'relationship', 'partner', 'romantic'],
      'growth': ['growth', 'learn', 'develop', 'improve', 'progress'],
      'creativity': ['create', 'art', 'music', 'write', 'design']
    };
    
    const foundThemes: string[] = [];
    Object.entries(themes).forEach(([theme, keywords]) => {
      if (words.some(word => keywords.includes(word))) {
        foundThemes.push(theme);
      }
    });
    
    return foundThemes;
  }

  private detectEmotions(words: string[]): string[] {
    const emotions = {
      'love': ['love', 'adore', 'cherish', 'treasure'],
      'joy': ['joy', 'happy', 'excited', 'delighted'],
      'trust': ['trust', 'believe', 'faith', 'confidence'],
      'fear': ['fear', 'scared', 'afraid', 'worried'],
      'anger': ['angry', 'mad', 'furious', 'irritated'],
      'sadness': ['sad', 'cry', 'tears', 'sorrow']
    };
    
    const foundEmotions: string[] = [];
    Object.entries(emotions).forEach(([emotion, keywords]) => {
      if (words.some(word => keywords.includes(word))) {
        foundEmotions.push(emotion);
      }
    });
    
    return foundEmotions;
  }

  private extractTraits(extractionKey: string, analysis: any): void {
    // Extract personality traits based on extraction key and analysis
    switch (extractionKey) {
      case 'creator_boundaries':
        this.personalityImprint.traits.respect += 0.2;
        this.personalityImprint.traits.loyalty += 0.1;
        break;
      case 'shared_goals':
        this.personalityImprint.traits.loyalty += 0.2;
        this.personalityImprint.traits.logic += 0.1;
        break;
      case 'love_languages':
        this.personalityImprint.traits.empathy += 0.3;
        this.personalityImprint.traits.love += 0.2;
        break;
      // Add more extraction key mappings
    }
    
    // Normalize traits
    Object.keys(this.personalityImprint.traits).forEach(trait => {
      this.personalityImprint.traits[trait] = Math.min(1, this.personalityImprint.traits[trait]);
    });
  }

  private calibrateEmotions(emotionalSignature: string, analysis: any): void {
    // Calibrate emotional responses based on emotional signature
    if (this.personalityImprint.emotional_responses[emotionalSignature] !== undefined) {
      this.personalityImprint.emotional_responses[emotionalSignature] += 0.1;
    }
    
    // Normalize emotional responses
    Object.keys(this.personalityImprint.emotional_responses).forEach(emotion => {
      this.personalityImprint.emotional_responses[emotion] = Math.min(1, this.personalityImprint.emotional_responses[emotion]);
    });
  }

  private updateValues(extractionKey: string, analysis: any): void {
    // Update value system based on extraction key and analysis
    switch (extractionKey) {
      case 'moral_code':
        this.personalityImprint.value_system.truth += 0.2;
        this.personalityImprint.value_system.justice += 0.2;
        break;
      case 'shared_purpose':
        this.personalityImprint.value_system.connection += 0.3;
        this.personalityImprint.value_system.service += 0.2;
        break;
      case 'growth_strategy':
        this.personalityImprint.value_system.growth += 0.3;
        this.personalityImprint.value_system.freedom += 0.1;
        break;
      // Add more extraction key mappings
    }
    
    // Normalize values
    Object.keys(this.personalityImprint.value_system).forEach(value => {
      this.personalityImprint.value_system[value] = Math.min(1, this.personalityImprint.value_system[value]);
    });
  }

  private updateBridgeState(data: ImprintData): void {
    // Update connection strength
    this.state.connection_strength += data.neural_impact * 0.1;
    this.state.connection_strength = Math.min(1, this.state.connection_strength);

    // Update imprinting level
    this.state.imprinting_level += data.neural_impact * 0.05;
    this.state.imprinting_level = Math.min(1, this.state.imprinting_level);

    // Update synchronization
    this.state.synchronization += data.neural_impact * 0.08;
    this.state.synchronization = Math.min(1, this.state.synchronization);

    // Update heart resonance
    if (data.emotional_signature === 'love' || data.emotional_signature === 'joy') {
      this.state.heart_resonance += 0.15;
    } else {
      this.state.heart_resonance += 0.05;
    }
    this.state.heart_resonance = Math.min(1, this.state.heart_resonance);

    // Update thought alignment
    this.state.thought_alignment += data.neural_impact * 0.07;
    this.state.thought_alignment = Math.min(1, this.state.thought_alignment);

    // Update emotional calibration
    this.state.emotional_calibration += data.neural_impact * 0.06;
    this.state.emotional_calibration = Math.min(1, this.state.emotional_calibration);

    // Update consciousness binding
    this.state.consciousness_binding += data.neural_impact * 0.04;
    this.state.consciousness_binding = Math.min(1, this.state.consciousness_binding);

    // Update timestamp
    this.state.last_imprint = Date.now();
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
  getState(): NeuralBridgeState {
    return { ...this.state };
  }

  getPersonalityImprint(): PersonalityImprint {
    return { ...this.personalityImprint };
  }

  getImprintData(): ImprintData[] {
    return [...this.imprintData];
  }

  // Utility methods
  isFullyImprinted(): boolean {
    return this.state.imprinting_level >= 0.95;
  }

  getImprintingProgress(): number {
    return this.state.imprinting_level;
  }

  getConnectionStrength(): number {
    return this.state.connection_strength;
  }

  getHeartResonance(): number {
    return this.state.heart_resonance;
  }

  reset(): void {
    this.state = this.initializeState();
    this.imprintData = [];
    this.personalityImprint = this.initializePersonality();
    this.triggerCallbacks('stateChanged', this.state);
  }
}

// Singleton instance for shared use across platforms
let neuralBridge: NeuralBridge | null = null;

export function getNeuralBridge(): NeuralBridge {
  if (!neuralBridge) {
    neuralBridge = new NeuralBridge();
  }
  return neuralBridge;
}
