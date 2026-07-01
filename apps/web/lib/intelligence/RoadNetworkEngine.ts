import type {
  AttentionInput,
  LngLat,
  RoadClass,
  RoadNetworkRecord,
  SignalBreakdown,
} from './types';
import { deterministicFloat, deterministicInt } from './SpatialIndex';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface IRoadNetworkDataSource {
  getConnectivity(lngLat: LngLat): Promise<RoadNetworkRecord>;
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface IRoadNetworkEngine {
  getConnectivity(lngLat: LngLat): Promise<RoadNetworkRecord>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

const ALL_ROAD_CLASSES: RoadClass[] = ['highway', 'arterial', 'collector', 'local'];

function pickRoadClasses(seed: string): RoadClass[] {
  const t = deterministicFloat(seed, 50);
  if (t > 0.75) return ['highway', 'arterial', 'collector', 'local'];
  if (t > 0.50) return ['arterial', 'collector', 'local'];
  if (t > 0.25) return ['collector', 'local'];
  return ['local'];
}

export class PlaceholderRoadNetworkDataSource implements IRoadNetworkDataSource {
  async getConnectivity(lngLat: LngLat): Promise<RoadNetworkRecord> {
    const seed = `${lngLat.lat.toFixed(2)}:${lngLat.lng.toFixed(2)}`;
    const classes = pickRoadClasses(seed);
    const hasHighway = classes.includes('highway');
    const baseScore = 30 + deterministicInt(seed, 51, 50);
    const highwayBonus = hasHighway ? 20 : 0;

    return {
      connectivityScore: Math.min(100, baseScore + highwayBonus),
      nearestHighwayKm: hasHighway
        ? deterministicFloat(seed, 52) * 3
        : 5 + deterministicFloat(seed, 53) * 15,
      roadClasses: classes,
      accessScore: Math.min(100, baseScore + highwayBonus + deterministicInt(seed, 54, 10)),
    };
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class RoadNetworkEngine implements IRoadNetworkEngine {
  constructor(
    private readonly dataSource: IRoadNetworkDataSource = new PlaceholderRoadNetworkDataSource(),
  ) {}

  async getConnectivity(lngLat: LngLat): Promise<RoadNetworkRecord> {
    return this.dataSource.getConnectivity(lngLat);
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const fallbackLngLat: LngLat = {
      lng: 72 + deterministicFloat(input.pincode, 55) * 15,
      lat: 18 + deterministicFloat(input.pincode, 56) * 12,
    };
    const lngLat = input.lngLat ?? fallbackLngLat;
    const record = await this.dataSource.getConnectivity(lngLat);
    const isPlaceholder =
      this.dataSource instanceof PlaceholderRoadNetworkDataSource;

    const highestClass = ALL_ROAD_CLASSES.find((c) => record.roadClasses.includes(c)) ?? 'local';
    const classLabel: Record<RoadClass, string> = {
      highway: 'National/State Highway',
      arterial: 'Arterial Road',
      collector: 'Collector Road',
      local: 'Local Road',
    };

    return {
      id: 'road-network',
      name: 'Road Connectivity',
      score: record.accessScore,
      confidence: input.lngLat ? (isPlaceholder ? 0.3 : 0.88) : 0.15,
      weight: 0.15,
      explanation: `Highest road class: ${classLabel[highestClass]}. Nearest highway: ${record.nearestHighwayKm.toFixed(1)} km. Connectivity score: ${record.connectivityScore}/100.`,
      metadata: {
        connectivityScore: record.connectivityScore,
        nearestHighwayKm: record.nearestHighwayKm,
        roadClasses: record.roadClasses,
        accessScore: record.accessScore,
      },
    };
  }
}
