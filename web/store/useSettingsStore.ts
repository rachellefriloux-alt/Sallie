'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  posture: string;
  notifications: boolean;
  theme: 'dark' | 'light';
  voiceLanguage: string;
  voiceAutoSend: boolean;
}

interface SettingsStore {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

const defaultSettings: SettingsState = {
  posture: 'PEER',
  notifications: true,
  theme: 'dark',
  voiceLanguage: 'en-US',
  voiceAutoSend: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((store) => ({
          settings: { ...store.settings, ...newSettings },
        })),
    }),
    {
      name: 'sallie-settings',
    }
  )
);
