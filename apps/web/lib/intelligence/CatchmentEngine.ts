import type {
  AttentionInput,
  CatchmentRecord,
  LngLat,
  SignalBreakdown,
  ZoneType,
} from './types';
import { deterministicFloat, deterministicInt } from './SpatialIndex';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface CatchmentHint {
  zoneType?:   ZoneType;   // from PincodeEngine
  areaType?:   string;     // from AreaClassificationProvider e.g. "Rural", "Residential"
  poiCount?:   number;     // from KnowledgeEngine — 0 POIs = rural/sparse
  dataQuality?: string;    // 'full' | 'partial' | 'unavailable'
}

export interface ICatchmentDataSource {
  /** Estimate catchment metrics for a given location and radius */
  analyze(lngLat: LngLat, radiusKm: number, hint?: CatchmentHint): Promise<CatchmentRecord>;
}

// ─── Zone-aware density bands (people/km²) ───────────────────────────────────

const DENSITY_BAND: Record<string, { min: number; max: number }> = {
  metro:       { min: 8000,  max: 25000 },
  urban:       { min: 3000,  max: 12000 },
  'semi-urban':{ min: 600,   max: 3500  },
  rural:       { min: 100,   max: 700   },
};

function densityForHint(hint: CatchmentHint | undefined, seed: string): number {
  // If we have POI evidence of sparse/no-data area, treat as rural
  if (hint?.dataQuality === 'unavailable' || (hint?.poiCount !== undefined && hint.poiCount === 0)) {
    const { min, max } = DENSITY_BAND['rural'];
    return min + deterministicInt(seed, 40, max - min);
  }

  const areaLower = hint?.areaType?.toLowerCase() ?? '';
  if (areaLower.includes('rural') || areaLower.includes('agricultural') || areaLower.includes('industrial')) {
    const { min, max } = DENSITY_BAND['rural'];
    return min + deterministicInt(seed, 40, max - min);
  }

  const zone = hint?.zoneType ?? 'semi-urban';
  const band = DENSITY_BAND[zone] ?? DENSITY_BAND['semi-urban'];
  return band.min + deterministicInt(seed, 40, band.max - band.min);
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface ICatchmentEngine {
  analyze(lngLat: LngLat, radiusKm: number): Promise<CatchmentRecord>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

export class PlaceholderCatchmentDataSource implements ICatchmentDataSource {
  async analyze(lngLat: LngLat, radiusKm: number, hint?: CatchmentHint): Promise<CatchmentRecord> {
    const seed = `${lngLat.lat.toFixed(2)}:${lngLat.lng.toFixed(2)}:${radiusKm}`;
    const densityPerKm2 = densityForHint(hint, seed);
    const area = Math.PI * radiusKm * radiusKm;

    // Commercial density: rural/unavailable areas get near-zero ratio
    const isRural = densityPerKm2 < 700;
    const commercialDensityRatio = isRural
      ? 0.01 + deterministicFloat(seed, 42) * 0.04
      : 0.05 + deterministicFloat(seed, 42) * 0.35;

    return {
      radiusKm,
      estimatedPopulation: Math.round(densityPerKm2 * area),
      poiCount: isRural ? deterministicInt(seed, 41, 5) : 5 + deterministicInt(seed, 41, 40),
      commercialDensityRatio,
    };
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class CatchmentEngine implements ICatchmentEngine {
  constructor(
    private readonly dataSource: ICatchmentDataSource = new PlaceholderCatchmentDataSource(),
  ) {}

  async analyze(lngLat: LngLat, radiusKm: number, hint?: CatchmentHint): Promise<CatchmentRecord> {
    return this.dataSource.analyze(lngLat, radiusKm, hint);
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const fallbackLngLat: LngLat = {
      lng: 72 + deterministicFloat(input.pincode, 43) * 15,
      lat: 18 + deterministicFloat(input.pincode, 44) * 12,
    };
    const lngLat = input.lngLat ?? fallbackLngLat;
    const hint: CatchmentHint = {};
    const catchment = await this.dataSource.analyze(lngLat, 2, hint);

    // Normalise population: 0 → 0, 500,000+ → 100
    const popScore = Math.min(catchment.estimatedPopulation / 5000, 100);
    // Commercial density bonus (0–20)
    const commercialBonus = catchment.commercialDensityRatio * 20;
    const score = Math.round(Math.min(100, popScore * 0.8 + commercialBonus));
    const isPlaceholder =
      this.dataSource instanceof PlaceholderCatchmentDataSource;

    return {
      id: 'catchment',
      name: 'Catchment Area',
      score,
      confidence: input.lngLat ? (isPlaceholder ? 0.35 : 0.9) : 0.2,
      weight: 0.15,
      explanation: `~${catchment.estimatedPopulation.toLocaleString()} people within ${catchment.radiusKm} km. Commercial density: ${Math.round(catchment.commercialDensityRatio * 100)}%. ${catchment.poiCount} POIs detected in catchment.`,
      metadata: {
        radiusKm: catchment.radiusKm,
        estimatedPopulation: catchment.estimatedPopulation,
        poiCount: catchment.poiCount,
        commercialDensityRatio: catchment.commercialDensityRatio,
      },
    };
  }
}
