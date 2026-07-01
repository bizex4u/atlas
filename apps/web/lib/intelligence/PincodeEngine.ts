import type {
  AttentionInput,
  PincodeRecord,
  SignalBreakdown,
  ZoneType,
  LngLat,
} from './types';
import { deterministicFloat } from './SpatialIndex';
import { lookupPostalPincode } from './providers/PostalPincodeProvider';

// ─── Data Source Interface ───────────────────────────────────────────────────

export interface IPincodeDataSource {
  lookup(pincode: string): Promise<PincodeRecord | null>;
  /** Return the pincode whose polygon contains this coordinate, or null */
  findByCoordinates?(lngLat: LngLat): Promise<PincodeRecord | null>;
  /** Return neighbouring pincodes within radiusKm of the given pincode's centroid */
  getNeighbors?(pincode: string, radiusKm?: number): Promise<PincodeRecord[]>;
}

// ─── Engine Interface ────────────────────────────────────────────────────────

export interface IPincodeEngine {
  lookup(pincode: string): Promise<PincodeRecord | null>;
  getZoneType(pincode: string): Promise<ZoneType>;
  getScore(input: AttentionInput): Promise<SignalBreakdown>;
  /** Spatial reverse-lookup: which pincode contains these coordinates? */
  findByCoordinates(lngLat: LngLat): Promise<PincodeRecord | null>;
  /** Neighbouring pincodes within radiusKm (default 3 km) */
  getNeighbors(pincode: string, radiusKm?: number): Promise<PincodeRecord[]>;
}

// ─── Placeholder Data Source ─────────────────────────────────────────────────

const ZONE_MAP: Record<string, { state: string; zone: ZoneType; district: string }> = {
  '110': { state: 'Delhi', zone: 'metro', district: 'New Delhi' },
  '400': { state: 'Maharashtra', zone: 'metro', district: 'Mumbai' },
  '560': { state: 'Karnataka', zone: 'metro', district: 'Bangalore Urban' },
  '500': { state: 'Telangana', zone: 'metro', district: 'Hyderabad' },
  '600': { state: 'Tamil Nadu', zone: 'metro', district: 'Chennai' },
  '700': { state: 'West Bengal', zone: 'metro', district: 'Kolkata' },
  '380': { state: 'Gujarat', zone: 'urban', district: 'Ahmedabad' },
  '411': { state: 'Maharashtra', zone: 'urban', district: 'Pune' },
  '302': { state: 'Rajasthan', zone: 'urban', district: 'Jaipur' },
  '226': { state: 'Uttar Pradesh', zone: 'urban', district: 'Lucknow' },
  '641': { state: 'Tamil Nadu', zone: 'urban', district: 'Coimbatore' },
  '440': { state: 'Maharashtra', zone: 'urban', district: 'Nagpur' },
};

function lookupZone(pincode: string): { state: string; zone: ZoneType; district: string } {
  for (const [prefix, info] of Object.entries(ZONE_MAP)) {
    if (pincode.startsWith(prefix)) return info;
  }
  const t = deterministicFloat(pincode, 20);
  return {
    state: 'Unknown',
    district: 'Unknown',
    zone: t > 0.6 ? 'semi-urban' : 'rural',
  };
}

function syntheticCentroid(pincode: string): LngLat {
  // Spread within rough India bounds [68E–97E, 8N–37N]
  return {
    lng: 68 + deterministicFloat(pincode, 21) * 29,
    lat: 8 + deterministicFloat(pincode, 22) * 29,
  };
}

export class PlaceholderPincodeDataSource implements IPincodeDataSource {
  async lookup(pincode: string): Promise<PincodeRecord | null> {
    if (!/^\d{6}$/.test(pincode)) return null;
    const { state, zone, district } = lookupZone(pincode);
    return {
      pincode,
      state,
      district,
      taluk: district,
      zoneType: zone,
      centroid: syntheticCentroid(pincode),
    };
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

const ZONE_BASE_SCORES: Record<ZoneType, number> = {
  metro: 80,
  urban: 60,
  'semi-urban': 40,
  rural: 20,
};

export class PincodeEngine implements IPincodeEngine {
  constructor(
    private readonly dataSource: IPincodeDataSource = new PlaceholderPincodeDataSource(),
  ) {}

  async lookup(pincode: string): Promise<PincodeRecord | null> {
    const local = await this.dataSource.lookup(pincode);
    if (local) return local;
    // Fallback: India Post API — real district/state for any of 155k pincodes
    return lookupPostalPincode(pincode);
  }

  async getZoneType(pincode: string): Promise<ZoneType> {
    const record = await this.lookup(pincode);
    return record?.zoneType ?? 'rural';
  }

  async findByCoordinates(lngLat: LngLat): Promise<PincodeRecord | null> {
    return this.dataSource.findByCoordinates
      ? this.dataSource.findByCoordinates(lngLat)
      : null;
  }

  async getNeighbors(pincode: string, radiusKm = 3): Promise<PincodeRecord[]> {
    return this.dataSource.getNeighbors
      ? this.dataSource.getNeighbors(pincode, radiusKm)
      : [];
  }

  async getScore(input: AttentionInput): Promise<SignalBreakdown> {
    const record = await this.dataSource.lookup(input.pincode);

    if (!record) {
      return {
        id: 'pincode',
        name: 'Pincode Zone',
        score: 20,
        confidence: 0.05,
        weight: 0.10,
        explanation: `Pincode "${input.pincode}" could not be classified. Verify the pincode is valid.`,
        metadata: { pincode: input.pincode },
      };
    }

    const base = ZONE_BASE_SCORES[record.zoneType];
    const spread = Math.round(deterministicFloat(input.pincode, 23) * 15);
    const score = Math.min(100, base + spread);
    const isPlaceholder =
      this.dataSource instanceof PlaceholderPincodeDataSource;

    return {
      id: 'pincode',
      name: 'Pincode Zone',
      score,
      confidence: isPlaceholder ? 0.4 : 0.95,
      weight: 0.10,
      explanation: `${input.pincode} classified as ${record.zoneType} zone in ${record.district}, ${record.state}. Zone classification directly affects footfall potential.`,
      metadata: {
        zoneType: record.zoneType,
        state: record.state,
        district: record.district,
      },
    };
  }
}
