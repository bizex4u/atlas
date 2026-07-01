/**
 * TransitProvider — Transitland v2 API
 *
 * Finds real transit stops (metro, rail, bus) within radius using
 * Transitland's free public API (1000 req/day, no key needed).
 *
 * Covers all major India transit agencies: BMTC, DTC, BEST, CMRL,
 * Hyderabad Metro, Namma Metro, Delhi Metro, Mumbai Suburban, etc.
 *
 * Produces a TransitIntelligence object added to LocationKnowledge.
 */

import type { LngLat } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransitMode = 'metro' | 'suburban_rail' | 'bus' | 'tram' | 'ferry' | 'other';

export interface TransitStop {
  id: string;
  name: string;
  distanceKm: number;
  routes: number;        // number of routes served
  mode: TransitMode;
  agency: string;
}

export interface TransitIntelligence {
  /** Total stops within radius */
  stopCount: number;
  /** Breakdown by mode */
  byMode: Record<TransitMode, number>;
  /** Closest stops (up to 5) */
  nearestStops: TransitStop[];
  /** Real transit connectivity score 0–100 */
  connectivityScore: number;
  /** Human-readable tier */
  connectivityTier: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'None';
  /** Dominant agencies serving this area */
  agencies: string[];
  /** Commuter audience description */
  commuterProfile: string;
  /** Whether data came from Transitland (true) or fallback (false) */
  isReal: boolean;
}

// ─── Transitland API ──────────────────────────────────────────────────────────

const TL_BASE = 'https://transit.land/api/v2/rest';

interface TLStop {
  id:          string;
  stop_name:   string;
  geometry:    { coordinates: [number, number] };
  routes?:     Array<{ route_long_name?: string; route_short_name?: string; agency?: { agency_name?: string }; route_type?: number }>;
}

interface TLResponse {
  stops: TLStop[];
  meta?: { after?: number };
}

const MODE_FROM_ROUTE_TYPE: Record<number, TransitMode> = {
  0: 'tram',
  1: 'metro',
  2: 'suburban_rail',
  3: 'bus',
  4: 'ferry',
  109: 'suburban_rail',
  400: 'metro',
  401: 'metro',
  402: 'metro',
  403: 'suburban_rail',
};

function haversineKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

async function fetchStops(lngLat: LngLat, radiusM: number): Promise<TLStop[]> {
  const url = new URL(`${TL_BASE}/stops`);
  url.searchParams.set('lon',      String(lngLat.lng));
  url.searchParams.set('lat',      String(lngLat.lat));
  url.searchParams.set('r',        String(radiusM));
  url.searchParams.set('limit',    '100');
  url.searchParams.set('served_by_route_types', '0,1,2,3,4,109,400,401,402,403');

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) throw new Error(`Transitland ${res.status}`);
  const json: TLResponse = await res.json();
  return json.stops ?? [];
}

function detectMode(stop: TLStop): TransitMode {
  for (const route of stop.routes ?? []) {
    if (route.route_type !== undefined) {
      const m = MODE_FROM_ROUTE_TYPE[route.route_type];
      if (m) return m;
    }
    const name = (route.route_long_name ?? route.route_short_name ?? '').toLowerCase();
    if (name.includes('metro') || name.includes('rapid'))       return 'metro';
    if (name.includes('rail') || name.includes('suburban'))     return 'suburban_rail';
    if (name.includes('ferry') || name.includes('water'))       return 'ferry';
  }
  return 'bus';
}

function scoreFromStops(stops: TransitStop[]): number {
  let score = 0;
  for (const s of stops) {
    const distFactor = Math.max(0.2, 1 - s.distanceKm / 1.5);
    const modeWeight = s.mode === 'metro' ? 20 : s.mode === 'suburban_rail' ? 15 : s.mode === 'tram' ? 10 : 5;
    const routeBonus = Math.min(10, s.routes * 2);
    score += (modeWeight + routeBonus) * distFactor;
  }
  return Math.min(100, Math.round(score));
}

function toTier(score: number): TransitIntelligence['connectivityTier'] {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Moderate';
  if (score >= 5)  return 'Poor';
  return 'None';
}

function buildCommuterProfile(stops: TransitStop[], tier: TransitIntelligence['connectivityTier']): string {
  const metroStops = stops.filter((s) => s.mode === 'metro');
  const railStops  = stops.filter((s) => s.mode === 'suburban_rail');
  const busStops   = stops.filter((s) => s.mode === 'bus');

  if (tier === 'None') return 'No public transit within 1.5 km — primarily auto/private vehicle commuters';

  const parts: string[] = [];
  if (metroStops.length > 0) {
    const nearest = metroStops[0];
    parts.push(`Metro access (${nearest.name}, ${Math.round(nearest.distanceKm * 1000)} m)`);
  }
  if (railStops.length > 0) parts.push(`suburban rail (${railStops.length} station${railStops.length > 1 ? 's' : ''})`);
  if (busStops.length > 0)  parts.push(`${busStops.length} bus stop${busStops.length > 1 ? 's' : ''}`);

  const prefix =
    tier === 'Excellent' ? 'Exceptional transit hub — ' :
    tier === 'Good'      ? 'Well-connected — ' :
                           'Partial transit coverage — ';

  return prefix + parts.join(', ');
}

// ─── Empty result ──────────────────────────────────────────────────────────────

function emptyResult(isReal: boolean): TransitIntelligence {
  return {
    stopCount: 0,
    byMode: { metro: 0, suburban_rail: 0, bus: 0, tram: 0, ferry: 0, other: 0 },
    nearestStops: [],
    connectivityScore: 0,
    connectivityTier: 'None',
    agencies: [],
    commuterProfile: 'No public transit data available',
    isReal,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface ITransitProvider {
  query(lngLat: LngLat, radiusM?: number): Promise<TransitIntelligence>;
}

class TransitlandProvider implements ITransitProvider {
  async query(lngLat: LngLat, radiusM = 1500): Promise<TransitIntelligence> {
    let rawStops: TLStop[];
    try {
      rawStops = await fetchStops(lngLat, radiusM);
    } catch {
      return emptyResult(false);
    }

    if (rawStops.length === 0) return emptyResult(true);

    // Map to typed stops
    const stops: TransitStop[] = rawStops.map((s) => {
      const [sLng, sLat] = s.geometry.coordinates;
      const distanceKm = haversineKm(lngLat, { lng: sLng, lat: sLat });
      const mode = detectMode(s);
      const agencies = [
        ...new Set(
          (s.routes ?? [])
            .map((r) => r.agency?.agency_name ?? '')
            .filter(Boolean),
        ),
      ];
      return {
        id:          s.id,
        name:        s.stop_name,
        distanceKm:  Math.round(distanceKm * 1000) / 1000,
        routes:      s.routes?.length ?? 0,
        mode,
        agency:      agencies[0] ?? 'Unknown',
      };
    });

    // Sort by mode priority then distance
    const modePriority: Record<TransitMode, number> = {
      metro: 0, suburban_rail: 1, tram: 2, bus: 3, ferry: 4, other: 5,
    };
    stops.sort((a, b) =>
      modePriority[a.mode] - modePriority[b.mode] ||
      a.distanceKm - b.distanceKm,
    );

    // Count by mode
    const byMode: Record<TransitMode, number> = {
      metro: 0, suburban_rail: 0, bus: 0, tram: 0, ferry: 0, other: 0,
    };
    for (const s of stops) byMode[s.mode]++;

    // Agencies
    const agencies = [
      ...new Set(stops.map((s) => s.agency).filter((a) => a !== 'Unknown')),
    ].slice(0, 4);

    const connectivityScore = scoreFromStops(stops);
    const connectivityTier  = toTier(connectivityScore);

    return {
      stopCount: stops.length,
      byMode,
      nearestStops: stops.slice(0, 5),
      connectivityScore,
      connectivityTier,
      agencies,
      commuterProfile: buildCommuterProfile(stops, connectivityTier),
      isReal: true,
    };
  }
}

export const transitProvider: ITransitProvider = new TransitlandProvider();
