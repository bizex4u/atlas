'use client';

import { useEffect, useRef } from 'react';
import type { Map, GeoJSONSource } from 'maplibre-gl';
import type { ScoredDealer } from '@/types/dealer';
import { isValidCoord } from '@/lib/geo/coordValidator';

export const SOURCE_ID        = 'atlas-dealers';
export const DEALER_DOT_LAYER = 'atlas-dealer-dots';
export const CLUSTER_COUNT_LAYER = 'atlas-cluster-count';
export const CLUSTER_LAYER_ID    = 'atlas-clusters';

function buildGeoJSON(dealers: ScoredDealer[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: dealers
      .filter((d): d is ScoredDealer & { lat: number; lng: number } =>
        isValidCoord(d.lat, d.lng) && d.geoResolution !== 'failed',
      )
      .map((d) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
        properties: { id: d.id, resolution: d.geoResolution },
      })),
  };
}

interface DealerLayerProps {
  map: Map;
  dealers: ScoredDealer[];
}

export function DealerLayer({ map, dealers }: DealerLayerProps) {
  const layersReady = useRef(false);

  useEffect(() => {
    if (layersReady.current) return;
    layersReady.current = true;

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: buildGeoJSON(dealers),
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 50,
    });

    // Cluster circles
    map.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#6B21A8', 20,
          '#3b82f6', 100,
          '#1d4ed8',
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          18, 20,
          24, 100,
          30,
        ],
        'circle-opacity': 0.85,
      },
    });

    // Cluster count labels
    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12,
        'text-font': ['Noto Sans Bold'],
      },
      paint: { 'text-color': '#fff' },
    });

    // Individual dealer dots — data-driven by resolution
    map.addLayer({
      id: DEALER_DOT_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 7,
        'circle-color': ['match', ['get', 'resolution'],
          'exact',        '#6B21A8',
          'geocoded',     '#34d399',
          'pin_centroid', '#fb923c',
          'failed',       '#6b7280',
          '#6B21A8',
        ],
        'circle-opacity': ['match', ['get', 'resolution'],
          'pin_centroid', 0.65,
          'failed',       0.4,
          1.0,
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(0,0,0,0.25)',
      },
    });

    return () => {
      layersReady.current = false;
      for (const id of [DEALER_DOT_LAYER, CLUSTER_COUNT_LAYER, CLUSTER_LAYER_ID]) {
        if (map.getLayer(id)) map.removeLayer(id);
      }
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const src = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!src) return;
    src.setData(buildGeoJSON(dealers));
  }, [map, dealers]);

  return null;
}
