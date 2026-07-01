'use client';

import { useEffect, useRef } from 'react';
import type { Map, Marker } from 'maplibre-gl';
import { Marker as MaplibreMarker } from 'maplibre-gl';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { usePanelStore } from '@/lib/stores/panelStore';
import type { OOHSite } from '@/types/inventory';
import { STATUS_COLORS, FORMAT_LABELS } from '@/types/inventory';

interface Props {
  map: Map | null;
  visible: boolean;
}

export function InventoryLayer({ map, visible }: Props) {
  const sites = useInventoryStore((s) => s.sites);
  const analyzeLocation = usePanelStore((s) => s.analyzeLocation);
  const markerInstancesRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear old markers
    markerInstancesRef.current.forEach((m) => m.remove());
    markerInstancesRef.current = [];

    if (!visible) return;

    sites.forEach((site: OOHSite) => {
      if (site.lat === null || site.lng === null) return;

      const color = STATUS_COLORS[site.status];

      // Square marker element
      const el = document.createElement('div');
      el.style.cssText = `
        width: 22px; height: 22px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.15s;
        position: relative;
      `;

      // Format initial letter
      const letter = document.createElement('span');
      letter.textContent = FORMAT_LABELS[site.format].charAt(0);
      letter.style.cssText = 'color:white; font-size:10px; font-weight:700; font-family:system-ui;';
      el.appendChild(letter);

      // Tooltip
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position: absolute;
        bottom: 110%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(17,24,39,0.95);
        color: white;
        font-size: 11px;
        font-family: system-ui;
        padding: 5px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 10;
        min-width: 120px;
        text-align: center;
      `;
      tooltip.innerHTML = `<div style="font-weight:600">${site.siteCode}</div><div style="opacity:0.7;font-size:10px">${site.name}</div>`;
      el.appendChild(tooltip);

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        tooltip.style.opacity = '1';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        tooltip.style.opacity = '0';
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (site.lat !== null && site.lng !== null) {
          analyzeLocation({ lng: site.lng, lat: site.lat });
        }
      });

      const marker = new MaplibreMarker({ element: el, anchor: 'center' })
        .setLngLat([site.lng, site.lat])
        .addTo(map);

      markerInstancesRef.current.push(marker);
    });

    return () => {
      markerInstancesRef.current.forEach((m) => m.remove());
      markerInstancesRef.current = [];
    };
  }, [map, sites, visible, analyzeLocation]);

  return null;
}
