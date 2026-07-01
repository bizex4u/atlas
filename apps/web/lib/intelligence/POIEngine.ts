import type {
  AttentionInput,
  LngLat,
  POICategory,
  POIRecord,
  POISummary,
  SignalBreakdown,
} from './types';
import {
  filterInRadius,
  deterministicFloat,
  deterministicInt,
} from './SpatialIndex';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface IPOIDataSource {
  /** Return all POIs within radiusKm of a coordinate */
  getNear(lngLat: LngLat, radiusKm: number): Promise<POIRecord[]>;
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface IPOIEngine {
  getNear(lngLat: LngLat, radiusKm: number): Promise<POIRecord[]>;
  summarize(lngLat: LngLat, radiusKm: number): Promise<POISummary>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

const POI_CATEGORIES: POICategory[] = [
  'mall', 'market', 'hospital', 'school', 'college',
  'bus-stop', 'metro-station', 'bank', 'atm', 'petrol-pump',
];

const HIGH_VALUE_CATEGORIES: Set<POICategory> = new Set([
  'mall', 'market', 'metro-station', 'railway-station',
]);

/** Generate a deterministic set of POIs around a coordinate */
function generatePOIs(center: LngLat, seed: string): POIRecord[] {
  const count = 5 + deterministicInt(seed, 30, 25);
  const records: POIRecord[] = [];
  for (let i = 0; i < count; i++) {
    const angle = deterministicFloat(`${seed}:a${i}`, 31) * 2 * Math.PI;
    const dist = deterministicFloat(`${seed}:d${i}`, 32) * 0.05; // ~5km max
    records.push({
      id: `placeholder-poi-${seed}-${i}`,
      category: POI_CATEGORIES[deterministicInt(`${seed}:c${i}`, 33, POI_CATEGORIES.length)],
      name: `POI ${i + 1}`,
      lngLat: {
        lng: center.lng + Math.cos(angle) * dist,
        lat: center.lat + Math.sin(angle) * dist,
      },
    });
  }
  return records;
}

export class PlaceholderPOIDataSource implements IPOIDataSource {
  private readonly cache = new Map<string, POIRecord[]>();

  async getNear(lngLat: LngLat, radiusKm: number): Promise<POIRecord[]> {
    const seed = `${lngLat.lat.toFixed(2)}:${lngLat.lng.toFixed(2)}`;
    if (!this.cache.has(seed)) {
      this.cache.set(seed, generatePOIs(lngLat, seed));
    }
    return filterInRadius(lngLat, radiusKm, this.cache.get(seed)!);
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class POIEngine implements IPOIEngine {
  constructor(
    private readonly dataSource: IPOIDataSource = new PlaceholderPOIDataSource(),
  ) {}

  async getNear(lngLat: LngLat, radiusKm: number): Promise<POIRecord[]> {
    return this.dataSource.getNear(lngLat, radiusKm);
  }

  async summarize(lngLat: LngLat, radiusKm: number): Promise<POISummary> {
    const pois = await this.dataSource.getNear(lngLat, radiusKm);
    const byCategory: Partial<Record<POICategory, number>> = {};
    let nearestDistanceKm = Infinity;

    for (const poi of pois) {
      byCategory[poi.category] = (byCategory[poi.category] ?? 0) + 1;
      const { haversineKm } = await import('./SpatialIndex');
      const d = haversineKm(lngLat, poi.lngLat);
      if (d < nearestDistanceKm) nearestDistanceKm = d;
    }

    return {
      totalCount: pois.length,
      byCategory,
      nearestDistanceKm: nearestDistanceKm === Infinity ? -1 : nearestDistanceKm,
    };
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const fallbackLngLat: LngLat = {
      lng: 72 + deterministicFloat(input.pincode, 34) * 15,
      lat: 18 + deterministicFloat(input.pincode, 35) * 12,
    };
    const lngLat = input.lngLat ?? fallbackLngLat;
    const summary = await this.summarize(lngLat, 2);

    const highValueCount = Object.entries(summary.byCategory)
      .filter(([cat]) => HIGH_VALUE_CATEGORIES.has(cat as POICategory))
      .reduce((sum, [, n]) => sum + n, 0);

    // Score: total POIs (capped at 30) + bonus for high-value categories
    const base = Math.min(summary.totalCount / 30, 1) * 60;
    const bonus = Math.min(highValueCount * 8, 30);
    const score = Math.round(Math.min(100, base + bonus));
    const isPlaceholder =
      this.dataSource instanceof PlaceholderPOIDataSource;

    const topCategories = Object.entries(summary.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, n]) => `${cat}×${n}`)
      .join(', ');

    return {
      id: 'poi',
      name: 'Points of Interest',
      score,
      confidence: input.lngLat ? (isPlaceholder ? 0.35 : 0.9) : 0.15,
      weight: 0.20,
      explanation: `${summary.totalCount} POIs within 2 km. High-value anchors: ${highValueCount}. Top categories: ${topCategories || 'none found'}.`,
      metadata: {
        totalCount: summary.totalCount,
        highValueCount,
        byCategory: summary.byCategory,
        nearestKm: summary.nearestDistanceKm,
      },
    };
  }
}
