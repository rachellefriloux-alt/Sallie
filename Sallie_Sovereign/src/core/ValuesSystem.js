/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Manages user values and preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ValuesSystem {
  constructor() {
    this.values = new Map();
    this.preferences = {};
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadValues();
      await this.loadPreferences();
      this.initialized = true;
      console.log('ValuesSystem initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ValuesSystem:', error);
      throw error;
    }
  }

  async setValue(key, value) {
    this.values.set(key, value);
    await this.saveValues();
  }

  getValue(key) {
    return this.values.get(key);
  }

  async getCurrentValues() {
    return Object.fromEntries(this.values);
  }

  async setPreference(key, value) {
    this.preferences[key] = value;
    await this.savePreferences();
  }

  getPreference(key) {
    return this.preferences[key];
  }

  async saveValues() {
    try {
      const valuesData = JSON.stringify(Array.from(this.values.entries()));
      await AsyncStorage.setItem('sallie_values', valuesData);
    } catch (error) {
      console.error('Failed to save values:', error);
    }
  }

  async loadValues() {
    try {
      const valuesData = await AsyncStorage.getItem('sallie_values');
      if (valuesData) {
        const entries = JSON.parse(valuesData);
        this.values = new Map(entries);
      }
    } catch (error) {
      console.error('Failed to load values:', error);
    }
  }

  async savePreferences() {
    try {
      await AsyncStorage.setItem('sallie_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  async loadPreferences() {
    try {
      const preferencesData = await AsyncStorage.getItem('sallie_preferences');
      if (preferencesData) {
        this.preferences = JSON.parse(preferencesData);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }
}