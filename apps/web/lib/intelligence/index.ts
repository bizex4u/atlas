// Types
export type {
  LngLat,
  BoundingBox,
  ZoneType,
  RoadClass,
  POICategory,
  OpportunityTier,
  SignalId,
  AttentionInput,
  SignalBreakdown,
  AttentionResult,
  PopulationRecord,
  PincodeRecord,
  POIRecord,
  POISummary,
  CatchmentRecord,
  RoadNetworkRecord,
  CompetitorRecord,
  CompetitionSummary,
} from './types';

// Spatial utilities
export {
  haversineKm,
  boundingBox,
  pointInBoundingBox,
  filterInRadius,
  nearestNeighbors,
  deterministicInt,
  deterministicFloat,
} from './SpatialIndex';

// Engines + their interfaces + placeholder data sources
export {
  PopulationEngine,
  PlaceholderPopulationDataSource,
} from './PopulationEngine';
export type { IPopulationEngine, IPopulationDataSource } from './PopulationEngine';

export {
  PincodeEngine,
  PlaceholderPincodeDataSource,
} from './PincodeEngine';
export type { IPincodeEngine, IPincodeDataSource } from './PincodeEngine';

export {
  POIEngine,
  PlaceholderPOIDataSource,
} from './POIEngine';
export type { IPOIEngine, IPOIDataSource } from './POIEngine';

export {
  CatchmentEngine,
  PlaceholderCatchmentDataSource,
} from './CatchmentEngine';
export type { ICatchmentEngine, ICatchmentDataSource } from './CatchmentEngine';

export {
  RoadNetworkEngine,
  PlaceholderRoadNetworkDataSource,
} from './RoadNetworkEngine';
export type { IRoadNetworkEngine, IRoadNetworkDataSource } from './RoadNetworkEngine';

export {
  CompetitionEngine,
  PlaceholderCompetitionDataSource,
} from './CompetitionEngine';
export type { ICompetitionEngine, ICompetitionDataSource } from './CompetitionEngine';

export {
  AttentionEngine,
  attentionEngine,
} from './AttentionEngine';
export type { IAttentionEngine, AttentionEngineDeps } from './AttentionEngine';

// Real geo data sources (Sprint 3)
export { GeoPincodeDataSource, geoPincodeDataSource } from './GeoPincodeDataSource';
export { GeoCatchmentDataSource, geoCatchmentDataSource } from './GeoCatchmentDataSource';

// Geo ops (for external consumers / tests)
export { makeCircle, areaKm2, centroid, pointInPolygon, voronoiPolygons } from './geo/GeoSpatialOps';
export { PincodeRTree } from './geo/PincodeRTree';
export type { IndexedPincode } from './geo/PincodeRTree';
