import type {
  AttentionInput,
  CompetitionSummary,
  CompetitorRecord,
  LngLat,
  SignalBreakdown,
} from './types';
import {
  filterInRadius,
  deterministicFloat,
  deterministicInt,
} from './SpatialIndex';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface ICompetitionDataSource {
  /** Return known competitors within radiusKm of a coordinate */
  getCompetitors(lngLat: LngLat, radiusKm: number): Promise<CompetitorRecord[]>;
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface ICompetitionEngine {
  getCompetitors(lngLat: LngLat, radiusKm: number): Promise<CompetitorRecord[]>;
  summarize(lngLat: LngLat, radiusKm?: number): Promise<CompetitionSummary>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

function generateCompetitors(center: LngLat, seed: string): CompetitorRecord[] {
  const count = deterministicInt(seed, 60, 12);
  return Array.from({ length: count }, (_, i) => {
    const angle = deterministicFloat(`${seed}:a${i}`, 61) * 2 * Math.PI;
    const dist = 0.5 + deterministicFloat(`${seed}:d${i}`, 62) * 9.5;
    const lngLat: LngLat = {
      lng: center.lng + Math.cos(angle) * (dist / 111),
      lat: center.lat + Math.sin(angle) * (dist / 111),
    };
    return {
      id: `placeholder-comp-${seed}-${i}`,
      name: `Competitor ${i + 1}`,
      lngLat,
      distanceKm: dist,
    };
  });
}

export class PlaceholderCompetitionDataSource implements ICompetitionDataSource {
  private readonly cache = new Map<string, CompetitorRecord[]>();

  async getCompetitors(lngLat: LngLat, radiusKm: number): Promise<CompetitorRecord[]> {
    const seed = `${lngLat.lat.toFixed(2)}:${lngLat.lng.toFixed(2)}`;
    if (!this.cache.has(seed)) {
      this.cache.set(seed, generateCompetitors(lngLat, seed));
    }
    return filterInRadius(lngLat, radiusKm, this.cache.get(seed)!);
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class CompetitionEngine implements ICompetitionEngine {
  constructor(
    private readonly dataSource: ICompetitionDataSource = new PlaceholderCompetitionDataSource(),
  ) {}

  async getCompetitors(lngLat: LngLat, radiusKm: number): Promise<CompetitorRecord[]> {
    return this.dataSource.getCompetitors(lngLat, radiusKm);
  }

  async summarize(lngLat: LngLat, radiusKm = 5): Promise<CompetitionSummary> {
    const competitors = await this.dataSource.getCompetitors(lngLat, radiusKm);
    const nearest = competitors.reduce<number>(
      (min, c) => (c.distanceKm < min ? c.distanceKm : min),
      Infinity,
    );
    const saturation = Math.min(competitors.length / 10, 1);
    return {
      nearestCompetitorKm: nearest === Infinity ? -1 : nearest,
      competitorsWithin5Km: competitors.length,
      saturationIndex: saturation,
    };
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const fallbackLngLat: LngLat = {
      lng: 72 + deterministicFloat(input.pincode, 63) * 15,
      lat: 18 + deterministicFloat(input.pincode, 64) * 12,
    };
    const lngLat = input.lngLat ?? fallbackLngLat;
    const summary = await this.summarize(lngLat);
    const isPlaceholder =
      this.dataSource instanceof PlaceholderCompetitionDataSource;

    // Invert saturation: low competition = high opportunity score
    const score = Math.round((1 - summary.saturationIndex) * 100);

    const nearest =
      summary.nearestCompetitorKm >= 0
        ? `${summary.nearestCompetitorKm.toFixed(1)} km`
        : 'unknown';

    return {
      id: 'competition',
      name: 'Competition',
      score,
      confidence: input.lngLat ? (isPlaceholder ? 0.25 : 0.85) : 0.15,
      weight: 0.20,
      explanation: `${summary.competitorsWithin5Km} competitor(s) within 5 km. Nearest: ${nearest}. Market saturation: ${Math.round(summary.saturationIndex * 100)}%. Higher score = lower competition = greater opportunity.`,
      metadata: {
        competitorsWithin5Km: summary.competitorsWithin5Km,
        nearestCompetitorKm: summary.nearestCompetitorKm,
        saturationIndex: summary.saturationIndex,
      },
    };
  }
}
