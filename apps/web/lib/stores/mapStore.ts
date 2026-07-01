'use client';

import { create } from 'zustand';
import type { Map } from 'maplibre-gl';

interface MapStore {
  map: Map | null;
  setMap: (map: Map | null) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
  map: null,
  setMap: (map) => set({ map }),
  flyTo: (lng, lat, zoom = 15) => {
    get().map?.flyTo({ center: [lng, lat], zoom, duration: 1200 });
  },
}));
