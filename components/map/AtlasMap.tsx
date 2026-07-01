'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { useAppStore, useSiteStore } from '@/lib/stores';
import { STATUS_COLORS, type Site, type SiteStatus } from '@/types';

export default function AtlasMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const isProgrammaticMove = useRef(false);

  const { mapCenter, mapZoom, setMapCenter, setMapZoom, openDrawer, setIsAnalyzing, setLastAnalysisPoint } = useAppStore();
  const { sites, setSelectedSite } = useSiteStore();

  const handleMapClick = useCallback(async (e: maplibregl.MapMouseEvent) => {
    const { lat, lng } = e.lngLat;

    const clickedOnMarker = markers.current.some(marker => {
      const pos = marker.getLngLat();
      return Math.abs(pos.lat - lat) < 0.001 && Math.abs(pos.lng - lng) < 0.001;
    });

    if (!clickedOnMarker) {
      setLastAnalysisPoint({ lat, lng });
      setIsAnalyzing(true);
      openDrawer('intelligence', { lat, lng });
    }
  }, [openDrawer, setIsAnalyzing, setLastAnalysisPoint]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [mapCenter.lng, mapCenter.lat],
      zoom: mapZoom,
      pitch: 0,
      bearing: 0
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false
      }),
      'top-right'
    );

    map.current.on('click', handleMapClick);

    map.current.on('moveend', () => {
      if (isProgrammaticMove.current) return;
      const center = map.current?.getCenter();
      if (center) setMapCenter({ lat: center.lat, lng: center.lng });
    });

    map.current.on('zoomend', () => {
      if (isProgrammaticMove.current) return;
      const zoom = map.current?.getZoom();
      if (zoom !== undefined) setMapZoom(zoom);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    sites.forEach(site => {
      if (site.location.lat && site.location.lng) {
        const el = document.createElement('div');
        el.className = 'site-marker';
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: ${STATUS_COLORS[site.status]};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
        `;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([site.location.lng, site.location.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
              <div style="padding: 8px; font-family: system-ui; color: #1a1a2e;">
                <div style="font-weight: 600; margin-bottom: 4px;">${site.name}</div>
                <div style="font-size: 12px; color: #666;">${site.code}</div>
                <div style="font-size: 11px; margin-top: 4px; text-transform: capitalize;">${site.status}</div>
              </div>
            `)
          )
          .addTo(map.current!);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedSite(site.id);
          openDrawer('site-detail', { siteId: site.id });
        });

        markers.current.push(marker);
      }
    });
  }, [sites, setSelectedSite, openDrawer]);

  useEffect(() => {
    if (!map.current) return;
    const cur = map.current.getCenter();
    const curZoom = map.current.getZoom();
    const sameLoc = Math.abs(cur.lat - mapCenter.lat) < 0.0001 && Math.abs(cur.lng - mapCenter.lng) < 0.0001;
    const sameZoom = Math.abs(curZoom - mapZoom) < 0.01;
    if (sameLoc && sameZoom) return;
    isProgrammaticMove.current = true;
    map.current.flyTo({ center: [mapCenter.lng, mapCenter.lat], zoom: mapZoom, duration: 1500 });
    map.current.once('moveend', () => { isProgrammaticMove.current = false; });
  }, [mapCenter, mapZoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="map-container" />

      <div className="absolute bottom-4 left-[84px] z-30">
        <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400 border border-dark-100">
          Click anywhere on the map to analyze location
        </div>
      </div>

      <div className="absolute top-4 left-[84px] z-30">
        <div className="flex gap-2">
          <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-dark-100">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-gray-300">Available</span>
          </div>
          <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-dark-100">
            <div className="w-3 h-3 rounded-full bg-error" />
            <span className="text-xs text-gray-300">Occupied</span>
          </div>
          <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-dark-100">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-gray-300">Booked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
