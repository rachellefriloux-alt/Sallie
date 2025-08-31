/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Persona: Tough love meets soul care with modern mobile intelligence
 * Function: Main orchestration of Sallie's cognitive and emotional systems
 */

import MemorySystem from './MemorySystem';
import ValuesSystem from './ValuesSystem';
import PersonaEngine from './PersonaEngine';
import OpenAIIntegration from '../ai/OpenAIIntegration';
import EmotionalIntelligence from '../ai/EmotionalIntelligence';
import FeatureRegistry from './FeatureRegistry';
import IdentityManager from './IdentityManager';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import PersonaCore from '../personaCore/PersonaCore';
import ResponseTemplates from '../responseTemplates/ResponseTemplates';
import ToneManager from '../tone/ToneManager';
import LauncherManager from './LauncherManager';
import AppManager from './AppManager';

export default class SallieBrain {
  constructor() {
    this.initialized = false;
    this.currentContext = {
      conversation: [],
      userState: 'neutral',
      sessionStartTime: Date.now(),
      lastInteractionTime: null,
      deviceInfo: null,
      appUsage: [],
      launcherState: 'default'
    };

    // Initialize core systems
    this.memory = new MemorySystem();
    this.values = new ValuesSystem();
    this.persona = new PersonaEngine();
    this.ai = new OpenAIIntegration();
    this.emotions = new EmotionalIntelligence();
    this.identity = new IdentityManager();
    this.onboarding = new OnboardingFlow(this.identity, this.persona);
    this.personaCore = new PersonaCore(this.persona);
    this.responseTemplates = new ResponseTemplates();
    this.toneManager = new ToneManager();
    this.launcherManager = new LauncherManager();
    this.appManager = new AppManager();

    // Register systems with feature registry
    FeatureRegistry.register('memory', this.memory);
    FeatureRegistry.register('values', this.values);
    FeatureRegistry.register('persona', this.persona);
    FeatureRegistry.register('ai', this.ai);
    FeatureRegistry.register('emotions', this.emotions);
    FeatureRegistry.register('identity', this.identity);
    FeatureRegistry.register('onboarding', this.onboarding);
    FeatureRegistry.register('personaCore', this.personaCore);
    FeatureRegistry.register('responseTemplates', this.responseTemplates);
    FeatureRegistry.register('toneManager', this.toneManager);
    FeatureRegistry.register('launcherManager', this.launcherManager);
    FeatureRegistry.register('appManager', this.appManager);
  }

  async initialize() {
    try {
      await this.memory.initialize?.();
      await this.values.initialize?.();
      await this.persona.initialize?.();
      await this.ai.initialize?.();
      await this.emotions.initialize?.();
      await this.launcherManager.initialize?.();
      await this.appManager.initialize?.();
      
      this.initialized = true;
      console.log('SallieBrain initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SallieBrain:', error);
      throw error;
    }
  }

  async onboardUser(userId, profile) {
    await this.identity.registerUser(userId, profile);
    return await this.onboarding.startOnboarding(userId);
  }

  async generateResponse(message, userId) {
    const tone = await this.toneManager.analyzeTone(message);
    const template = await this.responseTemplates.getTemplate(tone);
    
    // Persona evolution and emotional analysis
    await this.personaCore.evolvePersona({ 
      trait: tone, 
      value: 1, 
      context: message 
    });
    await this.emotions.analyzeMessage?.(message);
    
    return template;
  }

  async getInstalledApps() {
    return await this.appManager.getInstalledApps();
  }

  async launchApp(packageName) {
    return await this.launcherManager.launchApp(packageName);
  }

  async getAppSuggestions(context) {
    return await this.ai.getAppSuggestions(context);
  }

  async updateContext(newContext) {
    this.currentContext = { ...this.currentContext, ...newContext };
    await this.memory.updateContext?.(this.currentContext);
  }

  async getPersonalityInsights() {
    return {
      persona: await this.persona.getCurrentPersona(),
      emotions: await this.emotions.getCurrentState(),
      values: await this.values.getCurrentValues(),
      memory: await this.memory.getRecentMemories()
    };
  }
}