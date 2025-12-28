'use client';

import { create } from 'zustand';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface LimbicStore {
  state: LimbicState;
  updateState: (newState: Partial<LimbicState>) => void;
}

const defaultState: LimbicState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.7,
  valence: 0.6,
  posture: 'PEER',
};

export const useLimbicStore = create<LimbicStore>((set) => ({
  state: defaultState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
}));

