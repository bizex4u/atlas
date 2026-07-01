// ─── Primitives ─────────────────────────────────────────────────────────────

export type LngLat = { readonly lng: number; readonly lat: number };

export type BoundingBox = {
  readonly minLng: number;
  readonly minLat: number;
  readonly maxLng: number;
  readonly maxLat: number;
};

export type ZoneType = 'metro' | 'urban' | 'semi-urban' | 'rural';

export type RoadClass = 'highway' | 'arterial' | 'collector' | 'local';

export type POICategory =
  | 'mall'
  | 'market'
  | 'hospital'
  | 'school'
  | 'college'
  | 'bus-stop'
  | 'metro-station'
  | 'railway-station'
  | 'bank'
  | 'atm'
  | 'petrol-pump';

export type OpportunityTier = 'Low' | 'Medium' | 'High';

export type SignalId =
  | 'population'
  | 'pincode'
  | 'poi'
  | 'catchment'
  | 'road-network'
  | 'competition';

// ─── Engine Input ────────────────────────────────────────────────────────────

export interface AttentionInput {
  /** Dealer store name */
  storeName: string;
  /** City/town name */
  city: string;
  /** Postal code (6-digit Indian pincode expected) */
  pincode: string;
  /** Optional precise coordinates — improves confidence of all signals */
  lngLat?: LngLat;
}

// ─── Signal Output ───────────────────────────────────────────────────────────

export interface SignalBreakdown {
  id: SignalId;
  name: string;
  /** Normalised score 0–100 */
  score: number;
  /** How much to trust this signal: 0 (placeholder) – 1 (real data) */
  confidence: number;
  /** Fractional weight of this signal in the composite index */
  weight: number;
  /** Human-readable explanation of the score */
  explanation: string;
  /** Raw engine output for debugging / future dashboards */
  metadata: Record<string, unknown>;
}

export interface AttentionResult {
  /** Weighted composite score 0–100 */
  compositeScore: number;
  tier: OpportunityTier;
  /** Weighted average confidence across all signals */
  weightedConfidence: number;
  signals: SignalBreakdown[];
  computedAt: Date;
}

// ─── Domain Records (returned by data sources) ───────────────────────────────

export interface PopulationRecord {
  pincode: string;
  densityPerKm2: number;
  totalPopulation: number;
  ageDistribution: {
    under18Pct: number;
    workingAgePct: number;
    over60Pct: number;
  };
  incomeTier: 'Low' | 'Middle' | 'High';
}

export interface PincodeRecord {
  pincode: string;
  /** Short locality / area name */
  locality?: string;
  state: string;
  district: string;
  taluk: string;
  zoneType: ZoneType;
  centroid: LngLat;
  /** Approximate polygon boundary (ring — last point equals first) */
  boundary?: LngLat[];
  /** Polygon area in km² (present when boundary is known) */
  areaKm2?: number;
  /** Approximate population density per km² */
  populationDensity?: number;
}

export interface POIRecord {
  id: string;
  category: POICategory;
  name: string;
  lngLat: LngLat;
}

export interface POISummary {
  totalCount: number;
  byCategory: Partial<Record<POICategory, number>>;
  nearestDistanceKm: number;
}

export interface CatchmentPincodeSlice {
  pincode: string;
  /** Fraction of the pincode area that falls inside the catchment circle (0–1) */
  intersectionPct: number;
  /** Estimated population contributed by this slice */
  contributedPopulation: number;
}

export interface CatchmentRecord {
  radiusKm: number;
  estimatedPopulation: number;
  poiCount: number;
  /** 0–1 ratio of commercial to total area */
  commercialDensityRatio: number;
  /** Per-pincode breakdown (present when a real geo data source is used) */
  pincodeBreakdown?: CatchmentPincodeSlice[];
}

export interface RoadNetworkRecord {
  /** Overall 0–100 connectivity score */
  connectivityScore: number;
  nearestHighwayKm: number;
  roadClasses: RoadClass[];
  /** Multi-modal access score 0–100 (road + transit) */
  accessScore: number;
}

export interface CompetitorRecord {
  id: string;
  name: string;
  lngLat: LngLat;
  distanceKm: number;
  brand?: string;
}

export interface CompetitionSummary {
  nearestCompetitorKm: number;
  competitorsWithin5Km: number;
  /** 0–1: 0 = no competition, 1 = saturated */
  saturationIndex: number;
}
