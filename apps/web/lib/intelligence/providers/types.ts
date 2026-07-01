export type { LngLat } from '../types';
export type { NightlightsResult } from './NightlightsProvider';
export type { TransitIntelligence } from './TransitProvider';
import type { LngLat } from '../types';

export interface GeoLocation {
  name: string;
  neighbourhood: string;
  suburb: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  countryCode: string;
  coordinates: LngLat;
}

export type OSMPOICategory =
  | 'shopping_mall'
  | 'market'
  | 'electronics_store'
  | 'metro_station'
  | 'railway_station'
  | 'bus_terminal'
  | 'corporate_office'
  | 'it_park'
  | 'hospital'
  | 'school'
  | 'university'
  | 'hotel'
  | 'restaurant'
  | 'cafe'
  | 'bank'
  | 'pharmacy'
  | 'fuel_station'
  | 'cinema'
  | 'government_office'
  | 'park'
  | 'landmark'
  | 'religious_place'
  | 'industrial_area'
  | 'other';

export interface OSMPOIResult {
  id: string;
  name: string;
  category: OSMPOICategory;
  distanceKm: number;
  coordinates: LngLat;
  tags: Record<string, string>;
}

export type AreaType =
  | 'Commercial Business District'
  | 'Retail Hub'
  | 'Residential'
  | 'Mixed Use'
  | 'Industrial'
  | 'Educational Zone'
  | 'Healthcare Zone'
  | 'Government Area'
  | 'Transit Hub'
  | 'Tourism Zone'
  | 'Rural / Agricultural'
  | 'Religious / Cultural'
  | 'Unknown';

export interface AreaClassification {
  areaType: AreaType;
  confidence: number;
  subTypes: string[];
}

export interface LandUseSummary {
  commercialPct: number;
  residentialPct: number;
  officePct: number;
  retailPct: number;
  openSpacePct: number;
  industrialPct: number;
  mixedPct: number;
}

export type ActivityLevel = 'Very High' | 'High' | 'Medium' | 'Low' | 'None';

export interface MobilitySummary {
  walkabilityScore: number;
  walkabilityLevel: ActivityLevel;
  transitScore: number;
  transitLevel: ActivityLevel;
  roadConnectivityScore: number;
  roadClasses: string[];
  trafficDrivers: string[];
  peakActivity: string;
  weekendActivity: string;
}

export interface OSMPoiSummary {
  byCategory: Record<string, number>;
  total: number;
  within500m: number;
  within1km: number;
  within1500m: number;
}

export type DataQuality = 'full' | 'partial' | 'unavailable';

export interface LocationKnowledge {
  location: GeoLocation;
  pois: OSMPOIResult[];
  poiSummary: OSMPoiSummary;
  areaClassification: AreaClassification;
  landUse: LandUseSummary;
  mobility: MobilitySummary;
  advertisingSignals: string[];
  dataQuality: DataQuality;
  computedAt: Date;
  /** OSM coverage quality score (0–1) and reason, computed from actual Overpass response */
  coverageScore: number;
  coverageReason: string;
  /** Raw POI count before deduplication — surfaces data quality to UI */
  rawPoiCount: number;
  /** NASA VIIRS nighttime lights — economic activity proxy (optional, loads async) */
  nightlights?: import('./NightlightsProvider').NightlightsResult;
  /** Transitland real transit stops — commuter intelligence (optional, loads async) */
  transit?: import('./TransitProvider').TransitIntelligence;
}
