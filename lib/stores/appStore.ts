import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DrawerType = 'dashboard' | 'inventory' | 'barter' | 'accounts' | 'intelligence' | 'site-detail' | 'site-add' | 'client-add' | 'invoice-add' | 'deal-add' | 'partner-add' | 'settings';

interface AppStore {
  activeDrawer: DrawerType | null;
  drawerData: Record<string, unknown>;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  isAnalyzing: boolean;
  lastAnalysisPoint: { lat: number; lng: number } | null;

  openDrawer: (drawer: DrawerType | null, data?: Record<string, unknown>) => void;
  closeDrawer: () => void;
  closeAllDrawers: () => void;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setLastAnalysisPoint: (point: { lat: number; lng: number } | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeDrawer: null,
      drawerData: {},
      mapCenter: { lat: 26.8467, lng: 80.9462 },
      mapZoom: 12,
      isAnalyzing: false,
      lastAnalysisPoint: null,

      openDrawer: (drawer: DrawerType | null, data = {}) => {
        set({ activeDrawer: drawer, drawerData: data });
      },

      closeDrawer: () => {
        set((state) => ({ activeDrawer: null, drawerData: {} }));
      },

      closeAllDrawers: () => {
        set({ activeDrawer: null, drawerData: {} });
      },

      setMapCenter: (center) => {
        set({ mapCenter: center });
      },

      setMapZoom: (zoom) => {
        set({ mapZoom: zoom });
      },

      setIsAnalyzing: (analyzing) => {
        set({ isAnalyzing: analyzing });
      },

      setLastAnalysisPoint: (point) => {
        set({ lastAnalysisPoint: point });
      }
    }),
    {
      name: 'atlas-app',
      partialize: (state) => ({
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom
      })
    }
  )
);
