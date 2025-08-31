/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: User identity and profile management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class IdentityManager {
  constructor() {
    this.users = new Map();
    this.currentUser = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      await this.loadUsers();
      this.initialized = true;
      console.log('IdentityManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IdentityManager:', error);
      throw error;
    }
  }

  async registerUser(userId, profile) {
    const user = {
      id: userId,
      profile,
      createdAt: Date.now(),
      lastActive: Date.now(),
      preferences: {}
    };

    this.users.set(userId, user);
    await this.saveUsers();
    return user;
  }

  async getUser(userId) {
    return this.users.get(userId);
  }

  async updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, updates);
      user.lastActive = Date.now();
      await this.saveUsers();
    }
    return user;
  }

  async setCurrentUser(userId) {
    this.currentUser = userId;
    await AsyncStorage.setItem('current_user', userId);
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = await AsyncStorage.getItem('current_user');
    }
    return this.currentUser ? this.users.get(this.currentUser) : null;
  }

  async saveUsers() {
    try {
      const usersData = JSON.stringify(Array.from(this.users.entries()));
      await AsyncStorage.setItem('sallie_users', usersData);
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  async loadUsers() {
    try {
      const usersData = await AsyncStorage.getItem('sallie_users');
      if (usersData) {
        const entries = JSON.parse(usersData);
        this.users = new Map(entries);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }
}