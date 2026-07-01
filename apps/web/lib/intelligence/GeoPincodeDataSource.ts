/**
 * Production-grade PincodeDataSource backed by the real metro-pincodes dataset.
 *
 * Polygon boundaries are derived via per-metro Voronoi tessellation of the
 * known centroids — a close approximation until real shapefile polygons are
 * available. Replace computePolygons() with a GeoJSON loader to upgrade.
 */
import type { PincodeRecord, ZoneType } from './types';
import type { IPincodeDataSource } from './PincodeEngine';
import { METRO_PINCODES, METRO_BBOXES, type RawPincodeEntry } from './data/metro-pincodes';
import { T2_CITY_PINCODES } from './data/india-t2-cities';
import { lookupCensusDistrict, getStateFallback } from './data/india-census-districts';

/** Combined dataset: 8 indexed metros + 250+ T2/T3 city localities */
const ALL_PINCODES: RawPincodeEntry[] = [...METRO_PINCODES, ...T2_CITY_PINCODES];
import { voronoiPolygons, areaKm2, makeCircle } from './geo/GeoSpatialOps';
import type { GeoPolygon } from './geo/GeoSpatialOps';
import { PincodeRTree, type IndexedPincode } from './geo/PincodeRTree';
import type { LngLat } from './types';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toZoneType(zone: string): ZoneType {
  return zone as ZoneType;
}

/** Pincode prefix → metro name (only the 8 indexed metros with bboxes) */
const PREFIX_TO_METRO: Record<string, string> = {
  '110': 'Delhi',  '111': 'Delhi',  '112': 'Delhi',  '113': 'Delhi',
  '121': 'Delhi',  '122': 'Delhi',  // Gurugram/Faridabad share Delhi bbox loosely
  '400': 'Mumbai', '401': 'Mumbai', '402': 'Mumbai', '403': 'Mumbai',
  '560': 'Bangalore',
  '500': 'Hyderabad', '501': 'Hyderabad', '502': 'Hyderabad', '503': 'Hyderabad',
  '600': 'Chennai', '601': 'Chennai', '602': 'Chennai', '603': 'Chennai',
  '700': 'Kolkata',  '701': 'Kolkata',
  '411': 'Pune',
  '380': 'Ahmedabad',
};

function getMetroName(entry: RawPincodeEntry): string {
  const prefix3 = entry.pincode.substring(0, 3);
  if (PREFIX_TO_METRO[prefix3]) return PREFIX_TO_METRO[prefix3];
  // T2/T3 cities: group by district+state so each city gets its own
  // small cluster → falls through to circle-buffer polygons (< 3 pts or no bbox)
  return `${entry.district}__${entry.state}`;
}

/**
 * Group entries by metro, compute per-metro Voronoi, return polygon per entry.
 * For isolated entries (no metro bbox), fall back to a circle buffer.
 */
function computePolygons(
  entries: RawPincodeEntry[],
): Map<string, GeoPolygon> {
  const result = new Map<string, GeoPolygon>();

  // Group by metro
  const byMetro = new Map<string, RawPincodeEntry[]>();
  for (const e of entries) {
    const metro = getMetroName(e);
    if (!byMetro.has(metro)) byMetro.set(metro, []);
    byMetro.get(metro)!.push(e);
  }

  for (const [metro, metroEntries] of byMetro.entries()) {
    const bbox = METRO_BBOXES[metro];
    if (!bbox || metroEntries.length < 3) {
      // Not enough points for Voronoi — use circles
      for (const e of metroEntries) {
        const r = e.zone === 'metro' ? 0.8 : e.zone === 'urban' ? 1.5 : 3;
        result.set(e.pincode, makeCircle({ lng: e.lng, lat: e.lat }, r));
      }
      continue;
    }

    const points: LngLat[] = metroEntries.map((e) => ({ lng: e.lng, lat: e.lat }));
    const polygons = voronoiPolygons(points, bbox);

    for (let i = 0; i < metroEntries.length; i++) {
      const poly = polygons[i];
      if (!poly) {
        // Voronoi failed for this point — circle fallback
        const e = metroEntries[i];
        const r = e.zone === 'metro' ? 0.8 : e.zone === 'urban' ? 1.5 : 3;
        result.set(e.pincode, makeCircle({ lng: e.lng, lat: e.lat }, r));
      } else {
        result.set(metroEntries[i].pincode, poly);
      }
    }
  }

  return result;
}

// ─── Data Source ─────────────────────────────────────────────────────────────

export class GeoPincodeDataSource implements IPincodeDataSource {
  private readonly index: PincodeRTree;
  /** Map pincode → full record (for fast direct lookups) */
  private readonly records = new Map<string, PincodeRecord>();

  constructor(entries: RawPincodeEntry[] = METRO_PINCODES) {
    this.index = new PincodeRTree();
    const polygons = computePolygons(entries);

    const indexed: IndexedPincode[] = [];
    for (const e of entries) {
      const poly = polygons.get(e.pincode);
      if (!poly) continue;

      const area = areaKm2(poly);
      // Use the original seed coordinate as centroid — Voronoi cells
      // in peripheral areas can shift the geometric centroid far from
      // the actual locality. Seed coords are the authoritative address point.
      const seedCentroid: LngLat = { lng: e.lng, lat: e.lat };

      const record: PincodeRecord = {
        pincode: e.pincode,
        locality: e.locality,
        state: e.state,
        district: e.district,
        taluk: e.district,
        zoneType: toZoneType(e.zone),
        centroid: seedCentroid,
        boundary: poly.geometry.coordinates[0].map(([lng, lat]: number[]) => ({ lng, lat })),
        areaKm2: area,
        populationDensity: (() => {
          if (e.densityPerKm2) return e.densityPerKm2;
          const census = lookupCensusDistrict(e.district, e.state);
          if (census) return census.density;
          const fallback = getStateFallback(e.state);
          return fallback?.density;
        })(),
      };

      this.records.set(e.pincode, record);
      indexed.push({ record, polygon: poly, areaKm2: area });
    }

    this.index.load(indexed);
  }

  async lookup(pincode: string): Promise<PincodeRecord | null> {
    return this.records.get(pincode) ?? null;
  }

  async findByCoordinates(lngLat: LngLat): Promise<PincodeRecord | null> {
    const exact = this.index.findByCoordinates(lngLat);
    if (exact) return exact;
    // Fall back to nearest centroid if point is in a gap between polygons
    return this.index.findNearest(lngLat);
  }

  async getNeighbors(pincode: string, radiusKm = 3): Promise<PincodeRecord[]> {
    const record = this.records.get(pincode);
    if (!record) return [];
    return this.index.getNeighbors(record.centroid, radiusKm).filter(
      (r) => r.pincode !== pincode,
    );
  }

  /** Exposed for CatchmentEngine polygon intersection */
  getIndex(): PincodeRTree {
    return this.index;
  }

  get indexedCount(): number {
    return this.index.size;
  }
}

/** Shared singleton — initialised once, reused across engine calls */
export const geoPincodeDataSource = new GeoPincodeDataSource(ALL_PINCODES);
