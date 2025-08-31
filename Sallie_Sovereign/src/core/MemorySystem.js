/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Persona: Tough love meets soul care with modern mobile intelligence
 * Function: Hierarchical memory system for conversation and user context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class MemorySystem {
  constructor() {
    this.memories = new Map(); // All memory objects by ID
    this.episodicMemory = []; // Ordered conversation history
    this.semanticMemory = new Map(); // Facts and knowledge
    this.emotionalMemory = new Map(); // Emotional associations
    this.workingMemory = []; // Current context
    this.privacySettings = {
      allowDeviceTransfer: true,
      encryptionEnabled: true,
    };
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadFromStorage();
      this.initialized = true;
      console.log('MemorySystem initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MemorySystem:', error);
      throw error;
    }
  }

  async store(memory) {
    if (!this.initialized) throw new Error('Memory system not initialized');
    const memoryId = this.generateId();
    const enrichedMemory = {
      ...memory,
      id: memoryId,
      timestamp: Date.now(),
    };
    this.memories.set(memoryId, enrichedMemory);
    if (enrichedMemory.type === 'episodic') this.episodicMemory.push(enrichedMemory);
    if (enrichedMemory.type === 'semantic') this.semanticMemory.set(memoryId, enrichedMemory);
    if (enrichedMemory.type === 'emotional') this.emotionalMemory.set(memoryId, enrichedMemory);
    if (enrichedMemory.type === 'working') this.workingMemory.push(enrichedMemory);
    await this.saveToStorage();
    return memoryId;
  }

  getMemoryById(id) {
    return this.memories.get(id);
  }

  getConversationHistory() {
    return this.episodicMemory;
  }

  getFacts() {
    return Array.from(this.semanticMemory.values());
  }

  getEmotionalAssociations() {
    return Array.from(this.emotionalMemory.values());
  }

  getCurrentContext() {
    return this.workingMemory;
  }

  async getRecentMemories(limit = 10) {
    const allMemories = Array.from(this.memories.values());
    return allMemories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async updateContext(context) {
    const contextMemory = {
      type: 'working',
      content: context,
      timestamp: Date.now(),
    };
    await this.store(contextMemory);
  }

  async saveToStorage() {
    try {
      const memoriesData = JSON.stringify(Array.from(this.memories.entries()));
      await AsyncStorage.setItem('sallie_memories', memoriesData);
    } catch (error) {
      console.error('Failed to save memories to storage:', error);
    }
  }

  async loadFromStorage() {
    try {
      const raw = await AsyncStorage.getItem('sallie_memories');
      if (raw) {
        const entries = JSON.parse(raw);
        this.memories = new Map(entries);
        this.episodicMemory = Array.from(this.memories.values()).filter(m => m.type === 'episodic');
        this.semanticMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'semantic'));
        this.emotionalMemory = new Map(Array.from(this.memories.entries()).filter(([_, m]) => m.type === 'emotional'));
        this.workingMemory = Array.from(this.memories.values()).filter(m => m.type === 'working');
      }
    } catch (error) {
      console.error('Failed to load memories from storage:', error);
    }
  }

  generateId() {
    return 'mem_' + Math.random().toString(36).substr(2, 9);
  }

  async transferToDevice(targetDevice) {
    if (!this.privacySettings.allowDeviceTransfer) throw new Error('Device transfer not allowed');
    // Implement secure transfer logic here (e.g., encrypted payload)
    // ...real transfer code...
    return true;
  }

  enableEncryption(flag) {
    this.privacySettings.encryptionEnabled = !!flag;
    // Implement encryption logic if needed
  }

  setPrivacy(setting, value) {
    if (setting in this.privacySettings) {
      this.privacySettings[setting] = value;
    }
  }
}