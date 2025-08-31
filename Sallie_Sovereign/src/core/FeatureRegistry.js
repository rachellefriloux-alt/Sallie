/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Registry for managing system features and modules
 */

export default class FeatureRegistry {
  constructor() {
    this.features = new Map();
    this.hooks = new Map();
    this.initialized = false;
  }

  static register(name, feature) {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    FeatureRegistry.instance.features.set(name, feature);
    console.log(`Feature registered: ${name}`);
  }

  static get(name) {
    if (!FeatureRegistry.instance) {
      return null;
    }
    return FeatureRegistry.instance.features.get(name);
  }

  static getAll() {
    if (!FeatureRegistry.instance) {
      return new Map();
    }
    return FeatureRegistry.instance.features;
  }

  static addHook(event, callback) {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    if (!FeatureRegistry.instance.hooks.has(event)) {
      FeatureRegistry.instance.hooks.set(event, []);
    }
    FeatureRegistry.instance.hooks.get(event).push(callback);
  }

  static triggerHook(event, data) {
    if (!FeatureRegistry.instance) {
      return;
    }
    const hooks = FeatureRegistry.instance.hooks.get(event);
    if (hooks) {
      hooks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in hook ${event}:`, error);
        }
      });
    }
  }

  static async initialize() {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    
    try {
      const features = Array.from(FeatureRegistry.instance.features.values());
      for (const feature of features) {
        if (feature.initialize && typeof feature.initialize === 'function') {
          await feature.initialize();
        }
      }
      FeatureRegistry.instance.initialized = true;
      console.log('FeatureRegistry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FeatureRegistry:', error);
      throw error;
    }
  }

  static isInitialized() {
    return FeatureRegistry.instance?.initialized || false;
  }
}