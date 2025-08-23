/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Hierarchical memory system for conversation and user context.
    * Got it, love.
     */

     export class MemorySystem {
         constructor() {
                 this.memories = new Map();
                         this.episodicMemory = []; // Conversation history
                                 this.semanticMemory = new Map(); // Facts and knowledge
                                         this.emotionalMemory = new Map(); // Emotional associations
                                                 this.workingMemory = []; // Current context
                                                         this.initialized = false;
                                                             }

                                                                 async initialize() {
                                                                         try {
                                                                                     // Load existing memories from localStorage
                                                                                                 this.loadFromStorage();
                                                                                                             this.initialized = true;
                                                                                                                         console.log('💾 Memory system initialized');
                                                                                                                                 } catch (error) {
                                                                                                                                             console.error('Failed to initialize memory system:', error);
                                                                                                                                                         throw error;
                                                                                                                                                                 }
                                                                                                                                                                     }

                                                                                                                                                                         async store(memory) {
                                                                                                                                                                                 if (!this.initialized) {
                                                                                                                                                                                             throw new Error('Memory system not initialized');
                                                                                                                                                                                                     }

                                                                                                                                                                                                             const memoryId = this.generateId();
                                                                                                                                                                                                                     const enrichedMemory = {
                                                                                                                                                                                                                     