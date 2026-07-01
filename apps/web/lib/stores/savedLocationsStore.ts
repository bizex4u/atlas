import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';

export interface SavedLocation {
  id: string;
  savedAt: string;
  label: string;
  analysis: LocationAnalysis;
  note?: string;
}

interface SavedLocationsStore {
  saved:   SavedLocation[];
  save:    (analysis: LocationAnalysis) => void;
  remove:  (id: string) => void;
  isSaved: (lat: number, lng: number) => boolean;
}

function makeLabel(analysis: LocationAnalysis): string {
  const loc = analysis.knowledge?.location;
  return (
    [loc?.neighbourhood, loc?.suburb, loc?.city].filter(Boolean)[0] ??
    `${analysis.lngLat.lat.toFixed(4)}, ${analysis.lngLat.lng.toFixed(4)}`
  );
}

function coordId(lat: number, lng: number) {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

export const useSavedLocationsStore = create<SavedLocationsStore>()(
  persist(
    (set, get) => ({
      saved: [],

      save: (analysis) => {
        const id = coordId(analysis.lngLat.lat, analysis.lngLat.lng);
        // dedupe by coord
        set((s) => ({
          saved: [
            { id, savedAt: new Date().toISOString(), label: makeLabel(analysis), analysis },
            ...s.saved.filter((l) => l.id !== id),
          ],
        }));
      },

      remove: (id) => set((s) => ({ saved: s.saved.filter((l) => l.id !== id) })),

      isSaved: (lat, lng) => {
        const id = coordId(lat, lng);
        return get().saved.some((l) => l.id === id);
      },
    }),
    { name: 'atlas-saved-locations' },
  ),
);
