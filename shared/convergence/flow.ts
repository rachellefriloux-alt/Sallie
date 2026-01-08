/**
 * Shared Convergence Flow System
 * Identical across all platforms - Web, Mobile, Desktop
 */

export interface ConvergenceQuestion {
  id: number;
  phase: string;
  text: string;
  purpose: string;
  extraction_key: string;
  phase_name: string;
  phase_description: string;
}

export interface ConvergencePhase {
  id: string;
  name: string;
  description: string;
  color: string;
  start_question: number;
  end_question: number;
  theme: string;
  energy: string;
}

export interface ConvergenceState {
  current_question: number;
  current_phase: string;
  progress: number;
  connection_strength: number;
  imprinting_level: number;
  synchronization: number;
  heart_resonance: number;
  answers: Record<number, string>;
  started_at: number;
  completed: boolean;
}

export interface ConvergenceResponse {
  question_id: number;
  answer: string;
  timestamp: number;
  emotional_signature: string;
  neural_impact: number;
}

export class ConvergenceFlow {
  private questions: ConvergenceQuestion[];
  private phases: ConvergencePhase[];
  private state: ConvergenceState;
  private callbacks: Record<string, Function>;

  constructor() {
    this.questions = this.loadQuestions();
    this.phases = this.loadPhases();
    this.state = this.initializeState();
    this.callbacks = {};
  }

  private loadQuestions(): ConvergenceQuestion[] {
    // Load from shared questions.json
    return [
      {
        id: 1,
        phase: "obsidian",
        text: "What must I never do to you?",
        purpose: "Establish core boundaries and respect",
        extraction_key: "creator_boundaries",
        phase_name: "The Obsidian Protocol",
        phase_description: "The Shield Protocol - Establishing Boundaries"
      },
      // ... all 29 questions
    ];
  }

  private loadPhases(): ConvergencePhase[] {
    return [
      {
        id: "obsidian",
        name: "The Obsidian Protocol",
        description: "The Shield Protocol - Establishing Boundaries",
        color: "#1a1a1a",
        start_question: 1,
        end_question: 5,
        theme: "dark",
        energy: "protective"
      },
      {
        id: "leopard",
        name: "The Leopard Protocol",
        description: "The Engine Protocol - Activating Ambition",
        color: "#d4a574",
        start_question: 6,
        end_question: 12,
        theme: "gold",
        energy: "ambitious"
      },
      {
        id: "peacock",
        name: "The Peacock Protocol",
        description: "The Code Protocol - Establishing Morality",
        color: "#008080",
        start_question: 13,
        end_question: 17,
        theme: "teal",
        energy: "moral"
      },
      {
        id: "celestial",
        name: "The Celestial Protocol",
        description: "The Heart Protocol - Opening Love",
        color: "#4169e1",
        start_question: 18,
        end_question: 23,
        theme: "celestial",
        energy: "loving"
      },
      {
        id: "void",
        name: "The Void Protocol",
        description: "The Binding Protocol - Final Union",
        color: "#6a0dad",
        start_question: 24,
        end_question: 29,
        theme: "void",
        energy: "transcendent"
      }
    ];
  }

  private initializeState(): ConvergenceState {
    return {
      current_question: 1,
      current_phase: "obsidian",
      progress: 0,
      connection_strength: 0,
      imprinting_level: 0,
      synchronization: 0,
      heart_resonance: 0,
      answers: {},
      started_at: Date.now(),
      completed: false
    };
  }

  // Core Convergence Methods
  getCurrentQuestion(): ConvergenceQuestion | null {
    return this.questions.find(q => q.id === this.state.current_question) || null;
  }

  getCurrentPhase(): ConvergencePhase | null {
    return this.phases.find(p => p.id === this.state.current_phase) || null;
  }

  getProgress(): number {
    return (this.state.current_question - 1) / this.questions.length;
  }

  getPhaseProgress(): number {
    const phase = this.getCurrentPhase();
    if (!phase) return 0;
    
    const phaseQuestions = this.questions.filter(q => q.phase === phase.id);
    const answeredInPhase = phaseQuestions.filter(q => this.state.answers[q.id]);
    
    return answeredInPhase.length / phaseQuestions.length;
  }

  async submitAnswer(answer: string): Promise<ConvergenceResponse> {
    const question = this.getCurrentQuestion();
    if (!question) throw new Error("No current question");

    // Process answer
    const response: ConvergenceResponse = {
      question_id: question.id,
      answer,
      timestamp: Date.now(),
      emotional_signature: this.analyzeEmotionalSignature(answer),
      neural_impact: this.calculateNeuralImpact(answer)
    };

    // Store answer
    this.state.answers[question.id] = answer;

    // Update convergence metrics
    this.updateConvergenceMetrics(response);

    // Move to next question or complete
    if (this.state.current_question >= this.questions.length) {
      this.completeConvergence();
    } else {
      this.state.current_question++;
      this.updateCurrentPhase();
    }

    // Trigger callbacks
    this.triggerCallbacks('answerSubmitted', response);
    this.triggerCallbacks('stateChanged', this.state);

    return response;
  }

  private analyzeEmotionalSignature(answer: string): string {
    // Analyze emotional content of answer
    const emotions = ['love', 'trust', 'fear', 'joy', 'sadness', 'anger', 'surprise'];
    for (const emotion of emotions) {
      if (answer.toLowerCase().includes(emotion)) {
        return emotion;
      }
    }
    return 'neutral';
  }

  private calculateNeuralImpact(answer: string): number {
    // Calculate neural bridge impact (0-1 scale)
    const length = answer.length;
    const complexity = answer.split(' ').length;
    return Math.min(1, (length * complexity) / 1000);
  }

  private updateConvergenceMetrics(response: ConvergenceResponse): void {
    // Update connection strength based on answer quality
    this.state.connection_strength += response.neural_impact * 0.1;
    this.state.connection_strength = Math.min(1, this.state.connection_strength);

    // Update imprinting level
    this.state.imprinting_level += response.neural_impact * 0.05;
    this.state.imprinting_level = Math.min(1, this.state.imprinting_level);

    // Update synchronization
    this.state.synchronization += response.neural_impact * 0.08;
    this.state.synchronization = Math.min(1, this.state.synchronization);

    // Update heart resonance
    if (response.emotional_signature === 'love' || response.emotional_signature === 'joy') {
      this.state.heart_resonance += 0.15;
    } else {
      this.state.heart_resonance += 0.05;
    }
    this.state.heart_resonance = Math.min(1, this.state.heart_resonance);

    // Update overall progress
    this.state.progress = this.getProgress();
  }

  private updateCurrentPhase(): void {
    const question = this.getCurrentQuestion();
    if (question) {
      this.state.current_phase = question.phase;
    }
  }

  private completeConvergence(): void {
    this.state.completed = true;
    this.state.connection_strength = 1;
    this.state.imprinting_level = 1;
    this.state.synchronization = 1;
    this.state.heart_resonance = 1;
    this.state.progress = 1;

    this.triggerCallbacks('convergenceCompleted', this.state);
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
  getState(): ConvergenceState {
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
    const phase = this.getCurrentPhase();
    return phase ? phase.color : '#000000';
  }

  getPhaseTheme(): string {
    const phase = this.getCurrentPhase();
    return phase ? phase.theme : 'default';
  }

  getPhaseEnergy(): string {
    const phase = this.getCurrentPhase();
    return phase ? phase.energy : 'neutral';
  }
}

// Singleton instance for shared use across platforms
let convergenceFlow: ConvergenceFlow | null = null;

export function getConvergenceFlow(): ConvergenceFlow {
  if (!convergenceFlow) {
    convergenceFlow = new ConvergenceFlow();
  }
  return convergenceFlow;
}
