/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main orchestration of Sallie's cognitive and emotional systems.
    * Got it, love.
     */

     import { MemorySystem } from './MemorySystem.js';
     import { ValuesSystem } from './ValuesSystem.js';
     import { PersonaEngine } from './PersonaEngine.js';
     import { OpenAIIntegration } from '../ai/OpenAIIntegration.js';
     import { EmotionalIntelligence } from '../ai/EmotionalIntelligence.js';
     import { FeatureRegistry } from '../feature/FeatureRegistry.js';

     export class SallieBrain {
         constructor() {
                 this.initialized = false;
                         this.currentContext = {
                                     conversation: [],
                                                 userState: 'neutral',
                                                             sessionStartTime: Date.now(),
                                                                         lastInteractionTime: null
                                                                                 };
                                                                                         
                                                                                                 // Initialize core systems
                                                                                                         this.memory = new MemorySystem();
                                                                                                                 this.values = new ValuesSystem();
                                                                                                                         this.persona = new PersonaEngine();
                                                                                                                                 this.ai = new OpenAIIntegration();
                                                                                                                                         this.emotions = new EmotionalIntelligence();
                                                                                                                                                 
                                                                                                                                                         // Register systems with feature registry
                                                                                                                                                                 FeatureRegistry.register('memory', this.memory);
                                                                                                                                                                 