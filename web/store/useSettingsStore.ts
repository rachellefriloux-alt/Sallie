'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Core settings
  posture: string;
  notifications: boolean;
  voiceLanguage: string;
  voiceAutoSend: boolean;
  voiceEnabled: boolean;
  cloudSyncEnabled: boolean;
  
  // Theme settings
  theme: 'dark' | 'light' | 'auto';
  color: string;
  style: string;
  
  // User profile
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  
  // Privacy settings
  showOnlineStatus: boolean;
  showActivity: boolean;
  allowDataCollection: boolean;
  
  // Performance settings
  enableAnimations: boolean;
  enableSounds: boolean;
  
  // API settings
  apiKeys: {
    gemini: string;
    openai: string;
  };
}

interface SettingsStore {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

const defaultSettings: SettingsState = {
  posture: 'COMPANION',
  notifications: true,
  theme: 'dark',
  voiceLanguage: 'en-US',
  voiceAutoSend: false,
  voiceEnabled: true,
  cloudSyncEnabled: false,
  color: 'violet',
  style: 'modern',
  displayName: '',
  email: '',
  avatar: '/default-avatar.png',
  bio: '',
  showOnlineStatus: true,
  showActivity: true,
  allowDataCollection: false,
  enableAnimations: true,
  enableSounds: true,
  apiKeys: {
    gemini: '',
    openai: ''
  }
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((store) => ({
          settings: { ...store.settings, ...newSettings },
        })),
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
      exportSettings: () => {
        const state = get();
        const exportData = {
          ...state.settings,
          exportDate: new Date().toISOString()
        };
        return JSON.stringify(exportData, null, 2);
      },
      importSettings: (settingsString) => {
        try {
          const importedSettings = JSON.parse(settingsString);
          set((store) => ({
            settings: { ...store.settings, ...importedSettings }
          }));
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      }
    }),
    {
      name: 'sallie-settings',
      partialize: (state) => ({
        posture: state.settings.posture,
        notifications: state.settings.notifications,
        theme: state.settings.theme,
        voiceLanguage: state.settings.voiceLanguage,
        voiceAutoSend: state.settings.voiceAutoSend,
        voiceEnabled: state.settings.voiceEnabled,
        cloudSyncEnabled: state.settings.cloudSyncEnabled
      })
    }
  )
);
