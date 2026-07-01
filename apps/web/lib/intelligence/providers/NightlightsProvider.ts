/**
 * NightlightsProvider — NASA VIIRS Black Marble nighttime lights
 *
 * Queries NASA GIBS WMTS tiles to derive an economic activity score (0–100).
 * Nighttime light radiance is the best freely-available proxy for:
 *   - Purchasing power / income level
 *   - Commercial density
 *   - Economic development trajectory
 *
 * No API key required. Uses NASA GIBS public WMTS endpoint.
 */

import type { LngLat } from '../types';

export interface NightlightsResult {
  /** Normalized economic activity score 0–100 */
  economicScore: number;
  /** Human-readable tier */
  economicTier: 'Very High' | 'High' | 'Medium' | 'Low' | 'Minimal';
  /** Raw average radiance 0–255 from tile pixels */
  rawRadiance: number;
  /** Descriptive label for UI */
  label: string;
}

// GIBS WMTS endpoint — NASA's public tile server, no auth needed
const GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best';
const LAYER     = 'VIIRS_SNPP_NTL_at_Sensor_Radiance_v20_DNB';
const FORMAT    = 'image/png';
// Use most recent stable monthly composite
const DATE      = '2024-01-01';
const ZOOM      = 8;

function lngLatToTile(lng: number, lat: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return { x, y };
}

function tileUrl(x: number, y: number, z: number): string {
  return `${GIBS_BASE}/${LAYER}/default/${DATE}/500m/${z}/${y}/${x}.${FORMAT.split('/')[1]}`;
}

async function fetchTilePixels(url: string): Promise<Uint8ClampedArray | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
  } catch {
    return null;
  }
}

function avgRadiance(pixels: Uint8ClampedArray): number {
  // PNG is RGBA — red channel carries radiance for NASA nightlights layer
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += pixels[i]; // red channel
    count++;
  }
  return count > 0 ? sum / count : 0;
}

function scoreFromRadiance(r: number): number {
  // Raw radiance 0–255; nightlights layer: urban core ~150+, rural ~5–20
  // Log scale to differentiate mid-range values
  if (r <= 2)  return Math.round(r * 3);            // 0–6 → very dark
  if (r <= 10) return Math.round(6 + (r - 2) * 4); // 6–38
  if (r <= 40) return Math.round(38 + (r - 10) * 1.5); // 38–83
  return Math.min(100, Math.round(83 + (r - 40) * 0.4)); // 83–100
}

function toTier(score: number): NightlightsResult['economicTier'] {
  if (score >= 75) return 'Very High';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Medium';
  if (score >= 15) return 'Low';
  return 'Minimal';
}

function toLabel(tier: NightlightsResult['economicTier'], score: number): string {
  switch (tier) {
    case 'Very High': return `Very high economic activity (score ${score}) — bright commercial zone`;
    case 'High':      return `High economic activity (score ${score}) — active urban area`;
    case 'Medium':    return `Moderate economic activity (score ${score}) — mixed urban-residential`;
    case 'Low':       return `Low economic activity (score ${score}) — sparse development`;
    case 'Minimal':   return `Minimal economic activity (score ${score}) — rural or undeveloped`;
  }
}

export interface INightlightsProvider {
  query(lngLat: LngLat): Promise<NightlightsResult>;
}

class NightlightsProvider implements INightlightsProvider {
  async query(lngLat: LngLat): Promise<NightlightsResult> {
    const tile = lngLatToTile(lngLat.lng, lngLat.lat, ZOOM);
    const url  = tileUrl(tile.x, tile.y, ZOOM);

    const pixels = await fetchTilePixels(url);
    const raw    = pixels ? avgRadiance(pixels) : 0;
    const score  = scoreFromRadiance(raw);
    const tier   = toTier(score);

    return {
      economicScore: score,
      economicTier:  tier,
      rawRadiance:   Math.round(raw),
      label:         toLabel(tier, score),
    };
  }
}

export const nightlightsProvider: INightlightsProvider = new NightlightsProvider();
