'use client';

import { create } from 'zustand';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
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
  empathy: 0.5,
  intuition: 0.6,
  creativity: 0.5,
  wisdom: 0.5,
  humor: 0.4,
};

export const useLimbicStore = create<LimbicStore>((set) => ({
  state: defaultState,
  updateState: (newState) =>
    set((store) => ({
      state: { ...store.state, ...newState },
    })),
}));

