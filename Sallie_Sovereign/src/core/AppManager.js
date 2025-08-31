/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Manages installed apps and app information
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AppManager {
  constructor() {
    this.installedApps = [];
    this.appCategories = {
      'social': ['com.whatsapp', 'com.facebook.katana', 'com.instagram.android', 'com.twitter.android'],
      'productivity': ['com.microsoft.office.word', 'com.microsoft.office.excel', 'com.google.android.apps.docs'],
      'entertainment': ['com.netflix.mediaclient', 'com.spotify.music', 'com.google.android.youtube'],
      'utilities': ['com.google.android.apps.maps', 'com.google.android.calculator', 'com.android.camera2'],
      'games': ['com.activision.callofduty.shooter', 'com.epicgames.fortnite', 'com.mojang.minecraftpe']
    };
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadInstalledApps();
      this.initialized = true;
      console.log('AppManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AppManager:', error);
      throw error;
    }
  }

  async getInstalledApps() {
    // In a real implementation, this would use React Native's DeviceInfo
    // or a native module to get the actual installed apps
    // For now, we'll return a mock list
    return this.installedApps;
  }

  async refreshInstalledApps() {
    // This would scan for installed apps
    // For now, we'll use a mock implementation
    this.installedApps = [
      {
        packageName: 'com.whatsapp',
        appName: 'WhatsApp',
        icon: 'whatsapp-icon',
        category: 'social',
        lastUsed: Date.now() - 3600000 // 1 hour ago
      },
      {
        packageName: 'com.google.android.apps.maps',
        appName: 'Google Maps',
        icon: 'maps-icon',
        category: 'utilities',
        lastUsed: Date.now() - 7200000 // 2 hours ago
      },
      {
        packageName: 'com.netflix.mediaclient',
        appName: 'Netflix',
        icon: 'netflix-icon',
        category: 'entertainment',
        lastUsed: Date.now() - 86400000 // 1 day ago
      },
      {
        packageName: 'com.google.android.apps.docs',
        appName: 'Google Docs',
        icon: 'docs-icon',
        category: 'productivity',
        lastUsed: Date.now() - 172800000 // 2 days ago
      }
    ];
    await this.saveInstalledApps();
    return this.installedApps;
  }

  getAppsByCategory(category) {
    return this.installedApps.filter(app => app.category === category);
  }

  searchApps(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.installedApps.filter(app => 
      app.appName.toLowerCase().includes(lowercaseQuery) ||
      app.packageName.toLowerCase().includes(lowercaseQuery)
    );
  }

  getAppInfo(packageName) {
    return this.installedApps.find(app => app.packageName === packageName);
  }

  async updateAppUsage(packageName) {
    const app = this.installedApps.find(app => app.packageName === packageName);
    if (app) {
      app.lastUsed = Date.now();
      await this.saveInstalledApps();
    }
  }

  getMostUsedApps(limit = 10) {
    return this.installedApps
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }

  async saveInstalledApps() {
    try {
      await AsyncStorage.setItem('installed_apps', JSON.stringify(this.installedApps));
    } catch (error) {
      console.error('Failed to save installed apps:', error);
    }
  }

  async loadInstalledApps() {
    try {
      const apps = await AsyncStorage.getItem('installed_apps');
      if (apps) {
        this.installedApps = JSON.parse(apps);
      } else {
        // Load default apps if none saved
        await this.refreshInstalledApps();
      }
    } catch (error) {
      console.error('Failed to load installed apps:', error);
      // Load default apps on error
      await this.refreshInstalledApps();
    }
  }

  getAppCategories() {
    return Object.keys(this.appCategories);
  }

  getCategoryApps(category) {
    const categoryPackages = this.appCategories[category] || [];
    return this.installedApps.filter(app => 
      categoryPackages.includes(app.packageName)
    );
  }
}