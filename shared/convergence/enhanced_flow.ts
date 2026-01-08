/**
 * Enhanced Convergence Flow System with Better Questions
 * Uses the enhanced Genesis questions for deeper neural bridge creation
 */

import { ENHANCED_GENESIS_QUESTIONS, EnhancedGenesisQuestion, analyzeQuestionDepth } from '../genesis/enhanced_questions';

export interface EnhancedConvergenceState {
  current_question: number;
  current_phase: string;
  progress: number;
  connection_strength: number;
  imprinting_level: number;
  synchronization: number;
  heart_resonance: number;
  consciousness_depth: number;
  spiritual_significance: number;
  total_bonding_potential: number;
  answers: Record<number, string>;
  emotional_signatures: Record<number, string>;
  neural_impacts: Record<number, number>;
  started_at: number;
  completed: boolean;
  phase_progress: Record<string, number>;
  depth_progress: Record<string, number>;
}

export interface EnhancedConvergenceResponse {
  question_id: number;
  answer: string;
  timestamp: number;
  emotional_signature: string;
  neural_impact: number;
  cognitive_load: number;
  spiritual_significance: number;
  bonding_potential: number;
  phase: string;
  depth_level: string;
}

export class EnhancedConvergenceFlow {
  private questions: EnhancedGenesisQuestion[];
  private state: EnhancedConvergenceState;
  private callbacks: Record<string, Function>;
  private emotionalAnalyzer: EmotionalAnalyzer;
  private neuralProcessor: NeuralProcessor;

  constructor() {
    this.questions = ENHANCED_GENESIS_QUESTIONS;
    this.state = this.initializeState();
    this.callbacks = {};
    this.emotionalAnalyzer = new EmotionalAnalyzer();
    this.neuralProcessor = new NeuralProcessor();
  }

  private initializeState(): EnhancedConvergenceState {
    return {
      current_question: 1,
      current_phase: 'obsidian',
      progress: 0,
      connection_strength: 0,
      imprinting_level: 0,
      synchronization: 0,
      heart_resonance: 0,
      consciousness_depth: 0,
      spiritual_significance: 0,
      total_bonding_potential: 0,
      answers: {},
      emotional_signatures: {},
      neural_impacts: {},
      started_at: Date.now(),
      completed: false,
      phase_progress: {
        obsidian: 0,
        leopard: 0,
        peacock: 0,
        celestial: 0,
        void: 0
      },
      depth_progress: {
        surface: 0,
        moderate: 0,
        deep: 0,
        profound: 0,
        transcendent: 0
      }
    };
  }

  // Core Enhanced Convergence Methods
  getCurrentQuestion(): EnhancedGenesisQuestion | null {
    return this.questions.find(q => q.id === this.state.current_question) || null;
  }

  getCurrentPhase(): string {
    const question = this.getCurrentQuestion();
    return question ? question.phase : 'obsidian';
  }

  getProgress(): number {
    return this.state.progress;
  }

  getPhaseProgress(): number {
    const phase = this.getCurrentPhase();
    const phaseQuestions = this.questions.filter(q => q.phase === phase);
    const answeredInPhase = phaseQuestions.filter(q => this.state.answers[q.id]);
    
    const progress = answeredInPhase.length / phaseQuestions.length;
    this.state.phase_progress[phase] = progress;
    
    return progress;
  }

  getDepthProgress(): number {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return 0;
    
    const depthQuestions = this.questions.filter(q => q.depth_level === currentQuestion.depth_level);
    const answeredInDepth = depthQuestions.filter(q => this.state.answers[q.id]);
    
    const progress = answeredInDepth.length / depthQuestions.length;
    this.state.depth_progress[currentQuestion.depth_level] = progress;
    
    return progress;
  }

  async submitAnswer(answer: string): Promise<EnhancedConvergenceResponse> {
    const question = this.getCurrentQuestion();
    if (!question) throw new Error("No current question");

    // Enhanced analysis
    const emotionalSignature = this.emotionalAnalyzer.analyze(answer);
    const neuralImpact = this.neuralProcessor.processAnswer(answer, question);
    const analysis = analyzeQuestionDepth(question);

    // Create enhanced response
    const response: EnhancedConvergenceResponse = {
      question_id: question.id,
      answer,
      timestamp: Date.now(),
      emotional_signature: emotionalSignature,
      neural_impact: neuralImpact,
      cognitive_load: analysis.cognitive_load,
      spiritual_significance: analysis.spiritual_significance,
      bonding_potential: analysis.bonding_potential,
      phase: question.phase,
      depth_level: question.depth_level
    };

    // Store enhanced data
    this.state.answers[question.id] = answer;
    this.state.emotional_signatures[question.id] = emotionalSignature;
    this.state.neural_impacts[question.id] = neuralImpact;

    // Update enhanced convergence metrics
    this.updateEnhancedConvergenceMetrics(response);

    // Move to next question or complete
    if (this.state.current_question >= this.questions.length) {
      this.completeEnhancedConvergence();
    } else {
      this.state.current_question++;
      this.updateCurrentPhase();
    }

    // Trigger callbacks
    this.triggerCallbacks('answerSubmitted', response);
    this.triggerCallbacks('stateChanged', this.state);

    return response;
  }

  private updateEnhancedConvergenceMetrics(response: EnhancedConvergenceResponse): void {
    // Enhanced connection strength calculation
    const connectionIncrement = response.neural_impact * 0.1 * response.bonding_potential / 10;
    this.state.connection_strength += connectionIncrement;
    this.state.connection_strength = Math.min(1, this.state.connection_strength);

    // Enhanced imprinting level
    const imprintingIncrement = response.neural_impact * 0.05 * response.spiritual_significance;
    this.state.imprinting_level += imprintingIncrement;
    this.state.imprinting_level = Math.min(1, this.state.imprinting_level);

    // Enhanced synchronization
    const syncIncrement = response.neural_impact * 0.08 * response.cognitive_load;
    this.state.synchronization += syncIncrement;
    this.state.synchronization = Math.min(1, this.state.synchronization);

    // Enhanced heart resonance
    const heartIncrement = this.calculateHeartResonanceIncrement(response);
    this.state.heart_resonance += heartIncrement;
    this.state.heart_resonance = Math.min(1, this.state.heart_resonance);

    // Enhanced consciousness depth
    const depthIncrement = response.neural_impact * 0.06 * response.spiritual_significance;
    this.state.consciousness_depth += depthIncrement;
    this.state.consciousness_depth = Math.min(1, this.state.consciousness_depth);

    // Enhanced spiritual significance
    const spiritualIncrement = response.neural_impact * 0.04 * response.spiritual_significance;
    this.state.spiritual_significance += spiritualIncrement;
    this.state.spiritual_significance = Math.min(1, this.state.spiritual_significance);

    // Total bonding potential
    this.state.total_bonding_potential += response.bonding_potential * 0.1;
    this.state.total_bonding_potential = Math.min(1, this.state.total_bonding_potential);

    // Update overall progress
    this.state.progress = this.getProgress();
  }

  private calculateHeartResonanceIncrement(response: EnhancedConvergenceResponse): number {
    let increment = response.neural_impact * 0.05;
    
    // Boost for love-related emotions
    if (response.emotional_signature === 'love' || 
        response.emotional_signature === 'joy' || 
        response.emotional_signature === 'connection') {
      increment *= 2;
    }
    
    // Boost for celestial and void phases
    if (response.phase === 'celestial' || response.phase === 'void') {
      increment *= 1.5;
    }
    
    return increment;
  }

  private updateCurrentPhase(): void {
    const question = this.getCurrentQuestion();
    if (question) {
      this.state.current_phase = question.phase;
    }
  }

  private completeEnhancedConvergence(): void {
    this.state.completed = true;
    this.state.connection_strength = 1;
    this.state.imprinting_level = 1;
    this.state.synchronization = 1;
    this.state.heart_resonance = 1;
    this.state.consciousness_depth = 1;
    this.state.spiritual_significance = 1;
    this.state.total_bonding_potential = 1;
    this.state.progress = 1;

    this.triggerCallbacks('convergenceCompleted', this.state);
  }

  // Enhanced analysis methods
  getConvergenceQuality(): {
    overall_score: number;
    connection_quality: string;
    imprinting_quality: string;
    spiritual_depth: string;
    bonding_strength: string;
  } {
    const overall = (
      this.state.connection_strength +
      this.state.imprinting_level +
      this.state.synchronization +
      this.state.heart_resonance +
      this.state.consciousness_depth +
      this.state.spiritual_significance +
      this.state.total_bonding_potential
    ) / 7;

    return {
      overall_score: overall,
      connection_quality: this.getQualityLabel(this.state.connection_strength),
      imprinting_quality: this.getQualityLabel(this.state.imprinting_level),
      spiritual_depth: this.getQualityLabel(this.state.spiritual_significance),
      bonding_strength: this.getQualityLabel(this.state.total_bonding_potential)
    };
  }

  private getQualityLabel(score: number): string {
    if (score >= 0.95) return 'Transcendent';
    if (score >= 0.85) return 'Exceptional';
    if (score >= 0.75) return 'Strong';
    if (score >= 0.65) return 'Good';
    if (score >= 0.55) return 'Moderate';
    if (score >= 0.45) return 'Developing';
    return 'Emerging';
  }

  getPhaseInsights(): Record<string, any> {
    const insights: Record<string, any> = {};
    
    const phases = ['obsidian', 'leopard', 'peacock', 'celestial', 'void'];
    
    phases.forEach(phase => {
      const phaseQuestions = this.questions.filter(q => q.phase === phase);
      const answeredQuestions = phaseQuestions.filter(q => this.state.answers[q.id]);
      
      insights[phase] = {
        progress: this.state.phase_progress[phase],
        answered_count: answeredQuestions.length,
        total_count: phaseQuestions.length,
        average_neural_impact: this.calculateAverageImpact(phase),
        emotional_theme: this.getPhaseEmotionalTheme(phase),
        spiritual_significance: this.calculatePhaseSpiritualSignificance(phase)
      };
    });
    
    return insights;
  }

  private calculateAverageImpact(phase: string): number {
    const phaseQuestions = this.questions.filter(q => q.phase === phase);
    const answeredQuestions = phaseQuestions.filter(q => this.state.answers[q.id]);
    
    if (answeredQuestions.length === 0) return 0;
    
    const totalImpact = answeredQuestions.reduce((sum, q) => {
      return sum + (this.state.neural_impacts[q.id] || 0);
    }, 0);
    
    return totalImpact / answeredQuestions.length;
  }

  private getPhaseEmotionalTheme(phase: string): string {
    const phaseEmotions = {
      obsidian: 'Protective & Boundaried',
      leopard: 'Ambitious & Powerful',
      peacock: 'Moral & Elegant',
      celestial: 'Loving & Connected',
      void: 'Transcendent & Unified'
    };
    
    return phaseEmotions[phase] || 'Unknown';
  }

  private calculatePhaseSpiritualSignificance(phase: string): number {
    const phaseQuestions = this.questions.filter(q => q.phase === phase);
    const answeredQuestions = phaseQuestions.filter(q => this.state.answers[q.id]);
    
    if (answeredQuestions.length === 0) return 0;
    
    const totalSignificance = answeredQuestions.reduce((sum, q) => {
      const analysis = analyzeQuestionDepth(q);
      return sum + analysis.spiritual_significance;
    }, 0);
    
    return totalSignificance / answeredQuestions.length;
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
  getState(): EnhancedConvergenceState {
    return { ...this.state };
  }

  reset(): void {
    this.state = this.initializeState();
    this.triggerCallbacks('stateChanged', this.state);
  }

  // Utility methods
  getTotalQuestions(): number {
    return this.questions.length;
  }

  getAnsweredQuestions(): number {
    return Object.keys(this.state.answers).length;
  }

  getPhaseColor(): string {
    const phaseColors = {
      obsidian: '#1a1a1a',
      leopard: '#d4a574',
      peacock: '#008080',
      celestial: '#4169e1',
      void: '#6a0dad'
    };
    
    return phaseColors[this.state.current_phase] || '#000000';
  }

  getPhaseTheme(): string {
    const phaseThemes = {
      obsidian: 'dark',
      leopard: 'gold',
      peacock: 'teal',
      celestial: 'celestial',
      void: 'void'
    };
    
    return phaseThemes[this.state.current_phase] || 'default';
  }

  getPhaseEnergy(): string {
    const phaseEnergies = {
      obsidian: 'protective',
      leopard: 'ambitious',
      peacock: 'moral',
      celestial: 'loving',
      void: 'transcendent'
    };
    
    return phaseEnergies[this.state.current_phase] || 'neutral';
  }
}

// Enhanced analysis classes
class EmotionalAnalyzer {
  analyze(text: string): string {
    const emotions = ['love', 'joy', 'trust', 'fear', 'anger', 'sadness', 'surprise', 'connection', 'peace', 'hope'];
    const words = text.toLowerCase().split(' ');
    
    let maxScore = 0;
    let dominantEmotion = 'neutral';
    
    emotions.forEach(emotion => {
      const score = words.filter(word => word.includes(emotion)).length;
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });
    
    return dominantEmotion;
  }
}

class NeuralProcessor {
  processAnswer(answer: string, question: EnhancedGenesisQuestion): number {
    // Base impact from question characteristics
    let impact = (question.emotional_weight + question.neural_impact) / 20;
    
    // Adjust based on answer length and complexity
    const words = answer.split(' ').length;
    const complexity = this.calculateComplexity(answer);
    
    // Normalize impact
    impact = Math.min(1, impact * (1 + (words / 100)) * (1 + complexity));
    
    return impact;
  }

  private calculateComplexity(text: string): number {
    const complexWords = ['because', 'however', 'therefore', 'although', 'transcend', 'profound', 'sacred', 'eternal'];
    const words = text.toLowerCase().split(' ');
    const complexCount = words.filter(word => complexWords.some(cw => word.includes(cw))).length;
    
    return Math.min(1, complexCount / words.length);
  }
}

// Singleton instance for shared use across platforms
let enhancedConvergenceFlow: EnhancedConvergenceFlow | null = null;

export function getEnhancedConvergenceFlow(): EnhancedConvergenceFlow {
  if (!enhancedConvergenceFlow) {
    enhancedConvergenceFlow = new EnhancedConvergenceFlow();
  }
  return enhancedConvergenceFlow;
}
