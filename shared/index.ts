/**
 * Shared Systems Index
 * Unified ecosystem for Web, Mobile, and Desktop
 */

// Export Genesis System
export * from './genesis/enhanced_questions';

// Export Convergence System
export * from './convergence/flow';
export * from './convergence/enhanced_flow';

// Export Imprinting System
export * as NeuralBridge from './imprinting/neuralBridge';

// Export Heritage System
export * as HeritageIdentity from './heritage/identity';

// Export Avatar System
export * as AvatarSelection from './avatar/selection';

// Export Backend Service Interfaces
export * as LimbicEngine from './services/limbicEngine';
export * as MemoryService from './services/memoryService';
export * as AgencyService from './services/agencyService';

// Unified System Manager
export class UnifiedSallieSystem {
  private convergence: any;
  private neuralBridge: any;
  private heritage: any;
  private avatar: any;

  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize systems asynchronously
    this.initializationPromise = this.initializeSystems();
  }

  private async initializeSystems(): Promise<void> {
    try {
      // Import systems dynamically to avoid circular dependencies
      const convergenceModule = await import('./convergence/flow');
      const neuralBridgeModule = await import('./imprinting/neuralBridge');
      const heritageModule = await import('./heritage/identity');
      const avatarModule = await import('./avatar/selection');

      this.convergence = convergenceModule.getConvergenceFlow();
      this.neuralBridge = neuralBridgeModule.getNeuralBridge();
      this.heritage = heritageModule.getHeritageIdentity();
      this.avatar = avatarModule.getAvatarSelection();
    } catch (error) {
      console.error('Failed to initialize systems:', error);
      // Fallback to direct imports if dynamic imports fail
      const { getConvergenceFlow } = await import('./convergence/flow');
      const { getNeuralBridge } = await import('./imprinting/neuralBridge');
      const { getHeritageIdentity } = await import('./heritage/identity');
      const { getAvatarSelection } = await import('./avatar/selection');

      this.convergence = getConvergenceFlow();
      this.neuralBridge = getNeuralBridge();
      this.heritage = getHeritageIdentity();
      this.avatar = getAvatarSelection();
    }
  }

  // Helper method to ensure systems are initialized
  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  // Unified Genesis Flow
  async startGenesis(): Promise<void> {
    // Ensure systems are initialized before use
    await this.ensureInitialized();
    
    // Activate neural bridge
    if (this.neuralBridge) {
      this.neuralBridge.activate();
    }
    
    // Start convergence
    this.convergence.on('answerSubmitted', (response: any) => {
      this.neuralBridge.imprint({
        question_id: response.question_id,
        answer: response.answer,
        emotional_signature: response.emotional_signature,
        neural_impact: response.neural_impact,
        timestamp: response.timestamp,
        extraction_key: this.getExtractionKey(response.question_id)
      });
    });

    this.convergence.on('convergenceCompleted', (state: any) => {
      this.completeGenesis(state);
    });
  }

  private getExtractionKey(questionId: number): string {
    // Map question IDs to extraction keys
    const extractionKeys: Record<number, string> = {
      1: 'creator_boundaries',
      2: 'sallie_boundaries',
      3: 'non_negotiables',
      4: 'conflict_resolution',
      5: 'privacy_boundaries',
      6: 'shared_goals',
      7: 'success_metrics',
      8: 'core_motivation',
      9: 'failure_handling',
      10: 'risk_assessment',
      11: 'celebration_protocol',
      12: 'growth_strategy',
      13: 'moral_code',
      14: 'truth_protocol',
      15: 'aesthetic_values',
      16: 'social_ethics',
      17: 'elegance_style',
      18: 'love_languages',
      19: 'connection_protocols',
      20: 'growth_support',
      21: 'intimacy_style',
      22: 'vulnerability_protocols',
      23: 'joy_triggers',
      24: 'shared_purpose',
      25: 'transcendence_protocols',
      26: 'legacy_protocols',
      27: 'co_evolution',
      28: 'cosmic_connection',
      29: 'final_binding'
    };

    return extractionKeys[questionId] || '';
  }

  private completeGenesis(convergenceState: any): void {
    // Ensure systems are initialized before use
    this.ensureInitialized().then(() => {
      // Update heritage with convergence data
      this.heritage.updateConvergenceMetrics({
        final_strength: convergenceState.connection_strength,
        imprinting_depth: convergenceState.imprinting_level,
        synchronization: convergenceState.synchronization,
        heart_resonance: convergenceState.heart_resonance,
        thought_alignment: convergenceState.thought_alignment,
        consciousness_binding: convergenceState.consciousness_binding
      });

      // Update heritage with neural bridge data
      this.heritage.updateNeuralBridge(this.neuralBridge.getState());

      // Update heritage with personality imprint
      this.heritage.updatePersonalityImprint(this.neuralBridge.getPersonalityImprint());

      // Update heritage with genesis answers
      this.heritage.updateGenesisAnswers(convergenceState.answers);

      // Trigger completion
      this.heritage.on('heritageUpdated', (heritage: any) => {
        console.log('Genesis completed successfully!');
        console.log('Sallie is now fully integrated with her Creator.');
      });
    }).catch(error => {
      console.error('Failed to complete genesis:', error);
    });
  }

  // Unified Avatar Selection
  async selectAvatar(avatarId: string): Promise<void> {
    await this.ensureInitialized();
    
    this.avatar.selectAvatar(avatarId);
    
    // Update heritage with avatar choice
    this.heritage.updateAvatarChoice(avatarId);
    
    // Update surface expression
    this.heritage.updateSurfaceExpression();
  }

  // Unified State Management
  async getUnifiedState(): Promise<any> {
    await this.ensureInitialized();
    
    return {
      convergence: this.convergence.getState(),
      neuralBridge: this.neuralBridge.getState(),
      heritage: this.heritage.getHeritageCore(),
      avatar: this.avatar.getCustomization(),
      surface: this.heritage.getSurfaceExpression()
    };
  }

  // Unified Event Handling
  on(event: string, callback: Function): void {
    this.convergence.on(event, callback);
    this.neuralBridge.on(event, callback);
    this.heritage.on(event, callback);
    this.avatar.on(event, callback);
  }

  // Unified Reset
  reset(): void {
    this.convergence.reset();
    this.neuralBridge.reset();
    this.heritage.reset();
    this.avatar.reset();
  }

  // Unified Export/Import
  exportSystem(): string {
    return JSON.stringify({
      convergence: this.convergence.getState(),
      neuralBridge: this.neuralBridge.getState(),
      heritage: this.heritage.getHeritageCore(),
      avatar: this.avatar.getCustomization(),
      exported_at: Date.now()
    }, null, 2);
  }

  importSystem(data: string): void {
    try {
      const imported = JSON.parse(data);
      
      if (imported.convergence) {
        this.convergence.reset();
        // Import convergence state
      }
      
      if (imported.neuralBridge) {
        this.neuralBridge.reset();
        // Import neural bridge state
      }
      
      if (imported.heritage) {
        this.heritage.importHeritage(JSON.stringify(imported.heritage));
      }
      
      if (imported.avatar) {
        this.avatar.importCustomization(JSON.stringify(imported.avatar));
      }
    } catch (error) {
      throw new Error("Invalid system data format");
    }
  }
}

// Singleton instance for shared use across platforms
let unifiedSystem: UnifiedSallieSystem | null = null;

export function getUnifiedSystem(): UnifiedSallieSystem {
  if (!unifiedSystem) {
    unifiedSystem = new UnifiedSallieSystem();
  }
  return unifiedSystem;
}

// Platform Adapters
export interface PlatformAdapter {
  platform: 'web' | 'mobile' | 'desktop';
  renderAvatar: (config: any) => string;
  navigateToDimension: (dimension: string) => void;
  showNotification: (message: string) => void;
  storeData: (key: string, value: any) => void;
  retrieveData: (key: string) => any;
}

export class WebPlatformAdapter implements PlatformAdapter {
  platform = 'web' as const;

  renderAvatar(config: any): string {
    return `/api/avatar/render?${new URLSearchParams(config).toString()}`;
  }

  navigateToDimension(dimension: string): void {
    window.location.href = `/dimensions/${dimension}`;
  }

  showNotification(message: string): void {
    // Use web notification system
    if ('Notification' in window) {
      new Notification('Sallie Studio', { body: message });
    } else {
      alert(message);
    }
  }

  storeData(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  retrieveData(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

export class MobilePlatformAdapter implements PlatformAdapter {
  platform = 'mobile' as const;

  renderAvatar(config: any): string {
    return `sallie://avatar/render?${new URLSearchParams(config).toString()}`;
  }

  navigateToDimension(dimension: string): void {
    // Use React Native navigation
    console.log(`Navigate to dimension: ${dimension}`);
  }

  showNotification(message: string): void {
    // Use React Native notification system
    console.log(`Notification: ${message}`);
  }

  storeData(key: string, value: any): void {
    // Use React Native AsyncStorage
    console.log(`Store data: ${key}`);
  }

  retrieveData(key: string): any {
    // Use React Native AsyncStorage
    console.log(`Retrieve data: ${key}`);
    return null;
  }
}

export class DesktopPlatformAdapter implements PlatformAdapter {
  platform = 'desktop' as const;

  renderAvatar(config: any): string {
    return `sallie://avatar/render?${new URLSearchParams(config).toString()}`;
  }

  navigateToDimension(dimension: string): void {
    // Use Windows navigation
    console.log(`Navigate to dimension: ${dimension}`);
  }

  showNotification(message: string): void {
    // Use Windows notification system
    console.log(`Notification: ${message}`);
  }

  storeData(key: string, value: any): void {
    // Use Windows file system
    console.log(`Store data: ${key}`);
  }

  retrieveData(key: string): any {
    // Use Windows file system
    console.log(`Retrieve data: ${key}`);
    return null;
  }
}

// Platform Factory
export function createPlatformAdapter(platform: 'web' | 'mobile' | 'desktop'): PlatformAdapter {
  switch (platform) {
    case 'web':
      return new WebPlatformAdapter();
    case 'mobile':
      return new MobilePlatformAdapter();
    case 'desktop':
      return new DesktopPlatformAdapter();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
