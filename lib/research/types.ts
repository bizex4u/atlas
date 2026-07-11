/**
 * Evidence-first Research types for Atlas.
 * All shapes are JSON-serializable (no unknown / ArrayBuffer / Record<string, unknown>).
 */

export type EvidenceKind =
  | 'inventory'
  | 'demographics'
  | 'poi'
  | 'traffic'
  | 'competition'
  | 'barter'
  | 'accounts'
  | 'geocode';

export type EvidenceFreshness = 'fresh' | 'stale' | 'unknown';

export interface EvidenceSource {
  id: string;
  kind: EvidenceKind;
  label: string;
  collectedAt: string;
  freshness: EvidenceFreshness;
  summary: string;
  confidence: number;
}

export interface MissingDataItem {
  field: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ResearchQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  city?: string;
  brandHint?: string;
  formatHint?: string;
}

export interface InventoryEvidencePayload {
  totalSites: number;
  availableSites: number;
  nearbyAvailable: number;
  nearbySiteCodes: string[];
  avgMonthlyRentInr: number | null;
}

export interface DemographicsEvidencePayload {
  city: string;
  state: string;
  population: number;
  incomeLevel: string;
  workingPopulation: number;
}

export interface PoiEvidencePayload {
  count: number;
  topCategories: string[];
  nearestNames: string[];
}

export interface TrafficEvidencePayload {
  avgDailyVehicles: number;
  roadType: string;
  peakHours: string[];
}

export interface CompetitionEvidencePayload {
  competitorCount: number;
  nearestDistanceKm: number | null;
  formats: string[];
}

export interface BarterEvidencePayload {
  activeDeals: number;
  partnerNames: string[];
  openBalanceInr: number;
}

export type EvidencePayload =
  | InventoryEvidencePayload
  | DemographicsEvidencePayload
  | PoiEvidencePayload
  | TrafficEvidencePayload
  | CompetitionEvidencePayload
  | BarterEvidencePayload;

export interface EvidenceItem {
  source: EvidenceSource;
  payload: EvidencePayload;
}

export interface SiteRecommendation {
  siteId: string | null;
  siteCode: string | null;
  title: string;
  rationale: string;
  score: number;
  confidence: number;
  sources: EvidenceSource[];
  freshness: EvidenceFreshness;
  missingData: MissingDataItem[];
}

export interface ResearchBrief {
  query: ResearchQuery;
  collectedAt: string;
  evidence: EvidenceItem[];
  summary: string;
  overallConfidence: number;
  missingData: MissingDataItem[];
  recommendations: SiteRecommendation[];
}

export interface ResearchOrchestratorInput {
  query: ResearchQuery;
  sites: ResearchSiteSnapshot[];
  barter: ResearchBarterSnapshot;
}

export interface ResearchSiteSnapshot {
  id: string;
  siteCode: string;
  name: string;
  city: string;
  state: string;
  format: string;
  status: string;
  monthlyRentInr: number;
  lat: number | null;
  lng: number | null;
}

export interface ResearchBarterSnapshot {
  activeDealCount: number;
  partnerNames: string[];
  openBalanceInr: number;
}

export interface RecommendRequestBody {
  lat: number;
  lng: number;
  radiusKm: number;
  city?: string;
  brandHint?: string;
  formatHint?: string;
  sites: ResearchSiteSnapshot[];
  barter: ResearchBarterSnapshot;
}

export interface RecommendResponseBody {
  brief: ResearchBrief;
  aiNarrative: string | null;
  model: string;
  error: string | null;
}
