'use client';

import { useEffect, useRef, useState } from 'react';
import { Map, NavigationControl, ScaleControl, LngLatBounds, Marker } from 'maplibre-gl';
import type { MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ScoredDealer } from '@/types/dealer';
import { isValidCoord } from '@/lib/geo/coordValidator';
import { MapCoordinates } from './MapCoordinates';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import { MapToolbar } from './MapToolbar';
import { HeatmapLayer } from './HeatmapLayer';
import { DealerLayer, CLUSTER_LAYER_ID, DEALER_DOT_LAYER } from '@/components/dealers/DealerLayer';
import { InventoryLayer } from './InventoryLayer';
import { usePanelStore } from '@/lib/stores/panelStore';
import { useMapStore } from '@/lib/stores/mapStore';

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapCanvasProps {
  dealers?: ScoredDealer[];
}

export function MapCanvas({ dealers = [] }: MapCanvasProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<Map | null>(null);

  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [loaded, setLoaded]           = useState(false);
  const [coords, setCoords]           = useState<{ lng: number | null; lat: number | null }>({ lng: null, lat: null });
  const [heatmapVisible, setHeatmapVisible] = useState(true);

  const analyzeLocation  = usePanelStore((s) => s.analyzeLocation);
  const selectedLocation = usePanelStore((s) => s.selectedLocation);
  const pinMarkerRef     = useRef<Marker | null>(null);
  const setMap           = useMapStore((s) => s.setMap);

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [78.9629, 20.5937],
      zoom: 4.5,
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => setLoaded(true));
    map.on('mousemove', (e: MapMouseEvent) => setCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat }));
    map.on('mouseleave', () => setCoords({ lng: null, lat: null }));

    map.on('click', (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [CLUSTER_LAYER_ID, DEALER_DOT_LAYER],
      });
      if (features.length === 0) {
        analyzeLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    });

    mapRef.current = map;
    setMapInstance(map);
    setMap(map);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
      setMap(null);
      setLoaded(false);
    };
  }, [analyzeLocation]);

  // ── Location pin — tracks selected analysis location ─────────────────────
  useEffect(() => {
    if (!mapInstance || !loaded) return;

    // Remove existing pin
    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (!selectedLocation) return;

    // Build custom pin element
    const el = document.createElement('div');
    el.className = 'atlas-location-pin';
    el.innerHTML = '<div class="pin-ring"></div><div class="pin-dot"></div>';

    const marker = new Marker({ element: el, anchor: 'center' })
      .setLngLat([selectedLocation.lng, selectedLocation.lat])
      .addTo(mapInstance);

    pinMarkerRef.current = marker;
  }, [selectedLocation, mapInstance, loaded]);

  // ── Zoom To Dealers ───────────────────────────────────────────────────────
  function zoomToDealers() {
    if (!mapInstance) return;
    const mappable = dealers.filter(
      (d): d is typeof d & { lat: number; lng: number } => isValidCoord(d.lat, d.lng),
    );
    if (!mappable.length) return;

    const bounds = mappable.reduce(
      (b, d) => b.extend([d.lng, d.lat]),
      new LngLatBounds([mappable[0].lng, mappable[0].lat], [mappable[0].lng, mappable[0].lat]),
    );

    mapInstance.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 100, right: 100 },
      maxZoom: 13,
      duration: 1200,
    });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <MapLoadingOverlay visible={!loaded} />
      <MapCoordinates lng={coords.lng} lat={coords.lat} />

      {loaded && mapInstance && (
        <>
          <MapToolbar heatmapVisible={heatmapVisible} onHeatmapToggle={() => setHeatmapVisible((v) => !v)} />
          <HeatmapLayer map={mapInstance} dealers={dealers} visible={heatmapVisible} />
          <DealerLayer map={mapInstance} dealers={dealers} />
          <InventoryLayer map={mapInstance} visible={true} />
        </>
      )}
    </div>
  );
}
