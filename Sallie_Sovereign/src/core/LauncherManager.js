/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Manages app launching and launcher functionality
 */

import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class LauncherManager {
  constructor() {
    this.installedApps = [];
    this.favoriteApps = [];
    this.recentApps = [];
    this.launcherSettings = {
      showFavorites: true,
      showRecent: true,
      showSuggestions: true,
      theme: 'dark',
      layout: 'grid'
    };
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadSettings();
      await this.loadFavorites();
      await this.loadRecentApps();
      this.initialized = true;
      console.log('LauncherManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LauncherManager:', error);
      throw error;
    }
  }

  async launchApp(packageName) {
    try {
      const url = `package:${packageName}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        await this.addToRecentApps(packageName);
        return {success: true, message: 'App launched successfully'};
      } else {
        return {success: false, message: 'Cannot launch app'};
      }
    } catch (error) {
      console.error('Failed to launch app:', error);
      return {success: false, message: 'Failed to launch app'};
    }
  }

  async addToFavorites(packageName) {
    if (!this.favoriteApps.includes(packageName)) {
      this.favoriteApps.push(packageName);
      await this.saveFavorites();
    }
  }

  async removeFromFavorites(packageName) {
    this.favoriteApps = this.favoriteApps.filter(app => app !== packageName);
    await this.saveFavorites();
  }

  async addToRecentApps(packageName) {
    // Remove if already exists
    this.recentApps = this.recentApps.filter(app => app !== packageName);
    // Add to beginning
    this.recentApps.unshift(packageName);
    // Keep only last 20
    this.recentApps = this.recentApps.slice(0, 20);
    await this.saveRecentApps();
  }

  getFavorites() {
    return this.favoriteApps;
  }

  getRecentApps() {
    return this.recentApps;
  }

  async updateSettings(newSettings) {
    this.launcherSettings = {...this.launcherSettings, ...newSettings};
    await this.saveSettings();
  }

  getSettings() {
    return this.launcherSettings;
  }

  async saveSettings() {
    try {
      await AsyncStorage.setItem('launcher_settings', JSON.stringify(this.launcherSettings));
    } catch (error) {
      console.error('Failed to save launcher settings:', error);
    }
  }

  async loadSettings() {
    try {
      const settings = await AsyncStorage.getItem('launcher_settings');
      if (settings) {
        this.launcherSettings = {...this.launcherSettings, ...JSON.parse(settings)};
      }
    } catch (error) {
      console.error('Failed to load launcher settings:', error);
    }
  }

  async saveFavorites() {
    try {
      await AsyncStorage.setItem('favorite_apps', JSON.stringify(this.favoriteApps));
    } catch (error) {
      console.error('Failed to save favorite apps:', error);
    }
  }

  async loadFavorites() {
    try {
      const favorites = await AsyncStorage.getItem('favorite_apps');
      if (favorites) {
        this.favoriteApps = JSON.parse(favorites);
      }
    } catch (error) {
      console.error('Failed to load favorite apps:', error);
    }
  }

  async saveRecentApps() {
    try {
      await AsyncStorage.setItem('recent_apps', JSON.stringify(this.recentApps));
    } catch (error) {
      console.error('Failed to save recent apps:', error);
    }
  }

  async loadRecentApps() {
    try {
      const recent = await AsyncStorage.getItem('recent_apps');
      if (recent) {
        this.recentApps = JSON.parse(recent);
      }
    } catch (error) {
      console.error('Failed to load recent apps:', error);
    }
  }
}