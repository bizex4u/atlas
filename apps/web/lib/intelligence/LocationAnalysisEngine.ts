/**
 * LocationAnalysisEngine — top-level orchestrator.
 *
 * Composes all signal engines into a single async call that populates every
 * tab in the Location Intelligence Panel. Future engines plug in here via
 * the deps object without touching React components.
 *
 * NO React imports.
 */
import type { LngLat, AttentionInput, AttentionResult, CatchmentRecord, PincodeRecord, PopulationRecord, CompetitionSummary, RoadNetworkRecord, POISummary, POIRecord } from './types';
import { AttentionEngine } from './AttentionEngine';
import { PopulationEngine } from './PopulationEngine';
import { PincodeEngine } from './PincodeEngine';
import { CompetitionEngine } from './CompetitionEngine';
import { RoadNetworkEngine } from './RoadNetworkEngine';
import { POIEngine } from './POIEngine';
import { GeoPincodeDataSource, geoPincodeDataSource } from './GeoPincodeDataSource';
import { GeoCatchmentDataSource, geoCatchmentDataSource } from './GeoCatchmentDataSource';
import type { ScoredDealer } from '@/types/dealer';
import { knowledgeEngine } from './KnowledgeEngine';
import type { LocationKnowledge } from './KnowledgeEngine';
import { censusPopulationProvider } from './providers/CensusPopulationProvider';

// ─── Result type ──────────────────────────────────────────────────────────────

export interface LocationAnalysis {
  lngLat: LngLat;
  pincode: string;
  city: string;
  pincodeRecord: PincodeRecord | null;
  attentionResult: AttentionResult;
  catchmentRecord: CatchmentRecord;
  populationRecord: PopulationRecord | null;
  competitionSummary: CompetitionSummary;
  roadNetwork: RoadNetworkRecord;
  poiSummary: POISummary;
  poiRecords: POIRecord[];
  /** Present when triggered by a dealer click */
  dealer: ScoredDealer | null;
  /** Real-world OSM intelligence — null if API unavailable */
  knowledge: LocationKnowledge | null;
  computedAt: Date;
}

export interface AnalyzeOptions {
  lngLat?: LngLat;
  dealer?: ScoredDealer | null;
}

// ─── DI interfaces ────────────────────────────────────────────────────────────

interface LocationAnalysisEngineDeps {
  attentionEngine: AttentionEngine;
  populationEngine: PopulationEngine;
  pincodeEngine: PincodeEngine;
  competitionEngine: CompetitionEngine;
  roadNetworkEngine: RoadNetworkEngine;
  poiEngine: POIEngine;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class LocationAnalysisEngine {
  private readonly deps: LocationAnalysisEngineDeps;
  private readonly geoPincode: GeoPincodeDataSource;
  private readonly geoCatchment: GeoCatchmentDataSource;

  constructor(
    deps?: Partial<LocationAnalysisEngineDeps>,
    geoPincode: GeoPincodeDataSource = geoPincodeDataSource,
    geoCatchment: GeoCatchmentDataSource = geoCatchmentDataSource,
  ) {
    this.deps = {
      attentionEngine: deps?.attentionEngine ?? new AttentionEngine(),
      populationEngine: deps?.populationEngine ?? new PopulationEngine(censusPopulationProvider),
      pincodeEngine: deps?.pincodeEngine ?? new PincodeEngine(geoPincode),
      competitionEngine: deps?.competitionEngine ?? new CompetitionEngine(),
      roadNetworkEngine: deps?.roadNetworkEngine ?? new RoadNetworkEngine(),
      poiEngine: deps?.poiEngine ?? new POIEngine(),
    };
    this.geoPincode = geoPincode;
    this.geoCatchment = geoCatchment;
  }

  async analyze(options: AnalyzeOptions): Promise<LocationAnalysis> {
    const { dealer } = options;

    // ── 1. Resolve coordinates ─────────────────────────────────────────────
    let lngLat = options.lngLat;

    if (!lngLat && dealer) {
      if (dealer.lat !== null && dealer.lng !== null) {
        lngLat = { lat: dealer.lat, lng: dealer.lng };
      } else {
        // Fall back to pincode centroid
        const record = await this.geoPincode.lookup(dealer.pincode);
        if (record) lngLat = record.centroid;
      }
    }

    if (!lngLat) throw new Error('LocationAnalysisEngine: cannot resolve coordinates');

    // ── 2. Reverse-geocode to pincode ──────────────────────────────────────
    let pincodeRecord: PincodeRecord | null = null;
    if (dealer) {
      // Prefer the dealer's own pincode (known, accurate)
      pincodeRecord = await this.geoPincode.lookup(dealer.pincode) ??
        await this.geoPincode.findByCoordinates(lngLat);
    } else {
      pincodeRecord = await this.geoPincode.findByCoordinates(lngLat);
    }

    const pincode = dealer?.pincode ?? pincodeRecord?.pincode ?? '000000';
    const city    = dealer?.city    ?? pincodeRecord?.district ?? 'Unknown';

    const input: AttentionInput = {
      storeName: dealer?.storeName ?? 'Map Location',
      city,
      pincode,
      lngLat,
    };

    // ── 3. Concurrent signal computation (internal + OSM knowledge) ───────
    const [
      attentionResult,
      catchmentRecord,
      populationRecord,
      competitionSummary,
      roadNetwork,
      poiRecords,
      knowledge,
    ] = await Promise.all([
      this.deps.attentionEngine.compute(input),
      this.geoCatchment.analyze(lngLat, 2, {
        zoneType:    pincodeRecord?.zoneType,
        dataQuality: undefined,   // knowledge not yet resolved; re-checked below
      }),
      this.deps.populationEngine.getByPincode(pincode, pincodeRecord?.district, pincodeRecord?.state),
      this.deps.competitionEngine.summarize(lngLat),
      this.deps.roadNetworkEngine.getConnectivity(lngLat),
      this.deps.poiEngine.getNear(lngLat, 3),
      knowledgeEngine.analyze(lngLat).catch(() => null),
    ]);

    const poiSummary = await this.deps.poiEngine.summarize(lngLat, 3);

    // Post-correct catchment with knowledge context now available.
    // If OSM returned no data (rural/unmapped), re-run with fuller hint so
    // the density band is correct (avoids metro-scale numbers for rural areas).
    const osmPoiCount  = knowledge?.pois.length ?? -1;
    const dataQuality  = knowledge?.dataQuality ?? 'unavailable';
    const needsCorrect = dataQuality === 'unavailable' || osmPoiCount === 0;
    const finalCatchment = needsCorrect
      ? await this.geoCatchment.analyze(lngLat, 2, {
          zoneType:    pincodeRecord?.zoneType,
          areaType:    knowledge?.areaClassification.areaType,
          poiCount:    osmPoiCount === -1 ? 0 : osmPoiCount,
          dataQuality,
        })
      : catchmentRecord;

    // Canonical city: Nominatim result is district-corrected (Gurugram not Delhi).
    // Never return empty — cascade through all available sources.
    const canonicalCity =
      knowledge?.location.city?.trim() ||
      knowledge?.location.district?.trim() ||
      city;

    const canonicalPincode =
      knowledge?.location.pincode?.trim() ||
      pincode;

    return {
      lngLat,
      pincode:    canonicalPincode,
      city:       canonicalCity,
      pincodeRecord,
      attentionResult,
      catchmentRecord: finalCatchment,
      populationRecord,
      competitionSummary,
      roadNetwork,
      poiSummary,
      poiRecords,
      dealer: dealer ?? null,
      knowledge:  knowledge ?? null,
      computedAt: new Date(),
    };
  }
}

/** Singleton — replace constructor deps for production data sources */
export const locationAnalysisEngine = new LocationAnalysisEngine();
