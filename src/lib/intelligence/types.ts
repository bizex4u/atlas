export type SiteFormat = 'HRD' | 'UNI' | 'GAN' | 'SHL' | 'BJB' | 'DFS';

export interface CityData {
  name: string;
  state: string;
  district: string;
  population: number;
  lat: number;
  lng: number;
  pincodes: string[];
}

export interface LocationAnalysis {
  id: string;
  lat: number;
  lng: number;
  address: string;
  pincode: string;
  city: string;
  state: string;
  radius: number;
  demographics: DemographicsData;
  poi: POIData[];
  transport: TransportData;
  competitors: CompetitorData[];
  catchment: CatchmentData;
  traffic: TrafficData;
  scores: LocationScores;
  recommendation: string;
  generatedAt: string;
}

export interface DemographicsData {
  population: number;
  households: number;
  avgHouseholdSize: number;
  sexRatio: number;
  literacyRate: number;
  workingPopulation: number;
  ageDistribution: { '0-14': number; '15-29': number; '30-44': number; '45-59': number; '60+': number };
  incomeLevel: 'low' | 'lower-middle' | 'middle' | 'upper-middle' | 'high';
}

export interface POIData {
  category: string;
  name: string;
  distance: number;
  type: string;
}

export interface TransportData {
  nearestAirport?: { name: string; distance: number };
  nearestRailway?: { name: string; distance: number };
  busStops: number;
  highways: string[];
}

export interface CompetitorData {
  name: string;
  format: SiteFormat;
  distance: number;
  operator?: string;
}

export interface CatchmentData {
  residentialPopulation: number;
  workingPopulation: number;
  floatingPopulation: number;
  vehicleOwnership: number;
  primaryAudience: string;
  secondaryAudience: string;
}

export interface TrafficData {
  avgDailyVehicles: number;
  peakHours: string[];
  vehicleSplit: { two_wheeler: number; car: number; commercial: number; three_wheeler: number };
  roadType: string;
}

export interface LocationScores {
  visibility: number;
  traffic: number;
  affluence: number;
  competition: number;
  overall: number;
}
