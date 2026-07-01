'use client';

import { create } from 'zustand';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import { locationAnalysisEngine } from '@/lib/intelligence/LocationAnalysisEngine';
import type { LngLat } from '@/lib/intelligence/types';
import type { ScoredDealer } from '@/types/dealer';

export type TabId =
  | 'overview'
  | 'market'
  | 'demographics'
  | 'nearby'
  | 'mobility'
  | 'advertising'
  | 'ai-summary';

export const PANEL_MIN = 320;
export const PANEL_MAX = 650;
export const PANEL_DEFAULT = 420;

interface PanelState {
  // Selection
  selectedDealer: ScoredDealer | null;
  selectedLocation: LngLat | null;

  // Analysis
  analysis: LocationAnalysis | null;
  isLoading: boolean;
  error: string | null;

  // UI
  activeTab: TabId;
  panelWidth: number;
}

interface PanelActions {
  analyzeDealer: (dealer: ScoredDealer) => Promise<void>;
  analyzeLocation: (lngLat: LngLat) => Promise<void>;
  setActiveTab: (tab: TabId) => void;
  setPanelWidth: (width: number) => void;
  clearSelection: () => void;
}

export type PanelStore = PanelState & PanelActions;

export const usePanelStore = create<PanelStore>((set) => ({
  // State
  selectedDealer: null,
  selectedLocation: null,
  analysis: null,
  isLoading: false,
  error: null,
  activeTab: 'overview',
  panelWidth: PANEL_DEFAULT,

  // Actions
  analyzeDealer: async (dealer) => {
    set({ selectedDealer: dealer, selectedLocation: null, isLoading: true, error: null, activeTab: 'overview' });
    try {
      const analysis = await locationAnalysisEngine.analyze({ dealer });
      set({ analysis, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Analysis failed' });
    }
  },

  analyzeLocation: async (lngLat) => {
    set({ selectedLocation: lngLat, selectedDealer: null, isLoading: true, error: null, activeTab: 'overview' });
    try {
      const analysis = await locationAnalysisEngine.analyze({ lngLat });
      set({ analysis, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: e instanceof Error ? e.message : 'Analysis failed' });
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setPanelWidth: (panelWidth) =>
    set({ panelWidth: Math.min(PANEL_MAX, Math.max(PANEL_MIN, panelWidth)) }),
  clearSelection: () =>
    set({ selectedDealer: null, selectedLocation: null, analysis: null, error: null }),
}));
