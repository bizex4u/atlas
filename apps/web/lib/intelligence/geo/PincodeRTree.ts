/**
 * rbush-backed R-tree index over pincode polygons.
 * Provides O(log n) point-in-polygon lookup and radius queries.
 */
import RBush from 'rbush';
import type { PincodeRecord, LngLat } from '../types';
import { makeCircle, intersectPolygons, polygonBbox, pointInPolygon, areaKm2 } from './GeoSpatialOps';
import type { GeoPolygon } from './GeoSpatialOps';
import { haversineKm } from '../SpatialIndex';

interface RTreeItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  pincode: string;
}

export interface IndexedPincode {
  record: PincodeRecord;
  polygon: GeoPolygon;
  areaKm2: number;
}

export class PincodeRTree {
  private readonly tree: RBush<RTreeItem>;
  private readonly byPincode = new Map<string, IndexedPincode>();

  constructor() {
    this.tree = new RBush<RTreeItem>();
  }

  /** Load all indexed pincodes in bulk — call once after building. */
  load(entries: IndexedPincode[]): void {
    const items: RTreeItem[] = [];
    for (const entry of entries) {
      this.byPincode.set(entry.record.pincode, entry);
      const [minX, minY, maxX, maxY] = polygonBbox(entry.polygon);
      items.push({ minX, minY, maxX, maxY, pincode: entry.record.pincode });
    }
    this.tree.load(items);
  }

  get size(): number {
    return this.byPincode.size;
  }

  /** Exact point-in-polygon lookup. Returns null for points outside all polygons. */
  findByCoordinates(lngLat: LngLat): PincodeRecord | null {
    const candidates = this.tree.search({
      minX: lngLat.lng,
      minY: lngLat.lat,
      maxX: lngLat.lng,
      maxY: lngLat.lat,
    });

    for (const c of candidates) {
      const entry = this.byPincode.get(c.pincode)!;
      if (pointInPolygon(lngLat, entry.polygon)) {
        return entry.record;
      }
    }
    return null;
  }

  /**
   * Nearest centroid fallback — returns the pincode whose centroid is closest
   * to the given point. Used when the point falls outside all indexed polygons.
   */
  findNearest(lngLat: LngLat): PincodeRecord | null {
    if (this.byPincode.size === 0) return null;
    let best: PincodeRecord | null = null;
    let bestDist = Infinity;
    for (const { record } of this.byPincode.values()) {
      const d = haversineKm(lngLat, record.centroid);
      if (d < bestDist) { bestDist = d; best = record; }
    }
    return best;
  }

  /** Lookup by pincode string. */
  get(pincode: string): PincodeRecord | null {
    return this.byPincode.get(pincode)?.record ?? null;
  }

  /** All pincode records whose centroid is within radiusKm of the given point. */
  getNeighbors(lngLat: LngLat, radiusKm: number): PincodeRecord[] {
    const circle = makeCircle(lngLat, radiusKm);
    const [minX, minY, maxX, maxY] = polygonBbox(circle);
    const candidates = this.tree.search({ minX, minY, maxX, maxY });
    return candidates
      .map((c) => this.byPincode.get(c.pincode)!.record)
      .filter((r) => haversineKm(lngLat, r.centroid) <= radiusKm)
      .sort((a, b) => haversineKm(lngLat, a.centroid) - haversineKm(lngLat, b.centroid));
  }

  /**
   * Return all indexed pincodes whose polygon overlaps the given circle,
   * along with the intersection area fractions.
   * Used by CatchmentEngine for population-weighted catchment.
   */
  intersectCircle(
    center: LngLat,
    radiusKm: number,
  ): Array<{ record: PincodeRecord; intersectionPct: number; intersectionKm2: number }> {
    const circle = makeCircle(center, radiusKm);
    const [minX, minY, maxX, maxY] = polygonBbox(circle);
    const candidates = this.tree.search({ minX, minY, maxX, maxY });

    const results: Array<{ record: PincodeRecord; intersectionPct: number; intersectionKm2: number }> = [];
    for (const c of candidates) {
      const entry = this.byPincode.get(c.pincode)!;
      const intersection = intersectPolygons(circle, entry.polygon);
      if (!intersection) continue;
      const intersectionKm2 = areaKm2(intersection);
      const intersectionPct = Math.min(1, intersectionKm2 / entry.areaKm2);
      results.push({ record: entry.record, intersectionPct, intersectionKm2 });
    }
    return results;
  }
}
