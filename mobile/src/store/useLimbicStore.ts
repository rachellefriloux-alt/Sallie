/**
 * Zustand store for limbic state management.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: 'COMPANION' | 'COPILOT' | 'PEER' | 'EXPERT';
  interaction_count: number;
  last_interaction_ts: number;
}

interface LimbicStore {
  state: LimbicState;
  updateState: (updates: Partial<LimbicState>) => void;
  reset: () => void;
}

const defaultState: LimbicState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.7,
  valence: 0.6,
  posture: 'PEER',
  interaction_count: 0,
  last_interaction_ts: 0,
};

export const useLimbicStore = create<LimbicStore>()(
  persist(
    (set) => ({
      state: defaultState,
      updateState: (updates) =>
        set((store) => ({
          state: { ...store.state, ...updates },
        })),
      reset: () => set({ state: defaultState }),
    }),
    {
      name: 'limbic-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

