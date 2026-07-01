import type {
  AttentionInput,
  PopulationRecord,
  SignalBreakdown,
} from './types';
import { deterministicFloat, deterministicInt } from './SpatialIndex';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface IPopulationDataSource {
  /** Fetch population data for a pincode (district/state improve accuracy) */
  getByPincode(pincode: string, district?: string, state?: string): Promise<PopulationRecord | null>;
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface IPopulationEngine {
  getByPincode(pincode: string): Promise<PopulationRecord | null>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

const METRO_PREFIXES = new Set(['110', '400', '560', '500', '600', '700']);
const URBAN_PREFIXES = new Set(['411', '380', '302', '208', '226', '641', '440', '474', '831']);

function inferDensity(pincode: string): number {
  const prefix = pincode.slice(0, 3);
  const spread = deterministicInt(pincode, 10, 8000);
  if (METRO_PREFIXES.has(prefix)) return 15000 + spread;
  if (URBAN_PREFIXES.has(prefix)) return 4000 + spread;
  if (/^\d{6}$/.test(pincode)) return 600 + deterministicInt(pincode, 11, 800);
  return 100 + deterministicInt(pincode, 12, 200);
}

export class PlaceholderPopulationDataSource implements IPopulationDataSource {
  async getByPincode(pincode: string, _district?: string, _state?: string): Promise<PopulationRecord> {
    const density = inferDensity(pincode);
    const incomeSeed = deterministicFloat(pincode, 13);
    return {
      pincode,
      densityPerKm2: density,
      totalPopulation: Math.round(density * (2 + deterministicFloat(pincode, 14) * 8)),
      ageDistribution: {
        under18Pct: 0.25 + deterministicFloat(pincode, 15) * 0.1,
        workingAgePct: 0.55 + deterministicFloat(pincode, 16) * 0.1,
        over60Pct: 0.10 + deterministicFloat(pincode, 17) * 0.1,
      },
      incomeTier:
        incomeSeed > 0.65 ? 'High' : incomeSeed > 0.35 ? 'Middle' : 'Low',
    };
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class PopulationEngine implements IPopulationEngine {
  constructor(
    private readonly dataSource: IPopulationDataSource = new PlaceholderPopulationDataSource(),
  ) {}

  async getByPincode(pincode: string, district?: string, state?: string): Promise<PopulationRecord | null> {
    return this.dataSource.getByPincode(pincode, district, state);
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const record = await this.dataSource.getByPincode(input.pincode);

    if (!record) {
      return {
        id: 'population',
        name: 'Population Density',
        score: 30,
        confidence: 0.1,
        weight: 0.20,
        explanation: 'No population data found for this pincode.',
        metadata: { pincode: input.pincode },
      };
    }

    const density = record.densityPerKm2;
    // Log-scale normalisation: 50/km² → 0, 50,000/km² → 100
    const raw = Math.log10(Math.max(density, 50)) / Math.log10(50000);
    const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

    const isPlaceholder =
      this.dataSource instanceof PlaceholderPopulationDataSource;

    return {
      id: 'population',
      name: 'Population Density',
      score,
      confidence: isPlaceholder ? 0.3 : 0.9,
      weight: 0.20,
      explanation: `Estimated ${density.toLocaleString()} people/km² in pincode ${record.pincode}. Income tier: ${record.incomeTier}. Working-age population: ${Math.round(record.ageDistribution.workingAgePct * 100)}%.`,
      metadata: {
        densityPerKm2: density,
        totalPopulation: record.totalPopulation,
        incomeTier: record.incomeTier,
      },
    };
  }
}
