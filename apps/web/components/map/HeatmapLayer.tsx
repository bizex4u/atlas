'use client';

import { useEffect } from 'react';
import type { Map, GeoJSONSource } from 'maplibre-gl';
import type { ScoredDealer } from '@/types/dealer';
import { isValidCoord } from '@/lib/geo/coordValidator';

const SOURCE_ID = 'atlas-heatmap-source';
const LAYER_ID  = 'atlas-heatmap-layer';

function buildGeoJSON(dealers: ScoredDealer[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: dealers
      .filter((d): d is ScoredDealer & { lat: number; lng: number } =>
        isValidCoord(d.lat, d.lng),
      )
      .map((d) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
        properties: { weight: d.attention.score / 100 },
      })),
  };
}

interface HeatmapLayerProps {
  map: Map;
  dealers: ScoredDealer[];
  visible: boolean;
}

export function HeatmapLayer({ map, dealers, visible }: HeatmapLayerProps) {
  useEffect(() => {
    if (!visible || dealers.length === 0) {
      if (map.getLayer(LAYER_ID))   map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      return;
    }

    const geojson = buildGeoJSON(dealers);

    const existing = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (existing) {
      existing.setData(geojson);
      return;
    }

    map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });

    // Opportunity heatmap: blue (low density) → amber → orange → red (hot)
    map.addLayer({
      id: LAYER_ID,
      type: 'heatmap',
      source: SOURCE_ID,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 12, 2.5],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,    'rgba(59,130,246,0)',
          0.1,  'rgba(59,130,246,0.4)',
          0.3,  'rgba(234,179,8,0.75)',
          0.55, 'rgba(249,115,22,0.85)',
          0.8,  'rgba(239,68,68,0.92)',
          1,    'rgb(185,28,28)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 18, 12, 50],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.85, 14, 0.3],
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID))   map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, dealers, visible]);

  return null;
}
