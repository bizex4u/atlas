'use client';

import { create } from 'zustand';

interface GeocodeState {
  total: number;
  resolved: number;
  pending: number;
  failed: number;
  isRunning: boolean;
}

interface GeocodeActions {
  init: (total: number) => void;
  increment: (resolution: 'resolved' | 'failed') => void;
  reset: () => void;
}

const initialState: GeocodeState = {
  total: 0,
  resolved: 0,
  pending: 0,
  failed: 0,
  isRunning: false,
};

export const useGeocodeStore = create<GeocodeState & GeocodeActions>((set) => ({
  ...initialState,

  init: (total) =>
    set({ total, resolved: 0, pending: total, failed: 0, isRunning: total > 0 }),

  increment: (resolution) =>
    set((s) => {
      const resolved = resolution === 'resolved' ? s.resolved + 1 : s.resolved;
      const failed   = resolution === 'failed'   ? s.failed + 1   : s.failed;
      const pending  = Math.max(0, s.total - resolved - failed);
      return { resolved, failed, pending, isRunning: pending > 0 };
    }),

  reset: () => set(initialState),
}));
