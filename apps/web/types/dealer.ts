// How accurately a dealer's coordinates were determined
export type GeoResolution =
  | 'exact'        // lat/lng came directly from the uploaded file
  | 'geocoded'     // resolved via address geocoding API
  | 'pin_centroid' // approximate — centroid of the 6-digit PIN zone
  | 'failed';      // geocoding failed; coordinates unavailable

export interface Dealer {
  id: string;
  storeName: string;
  address: string;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  geoResolution: GeoResolution;
}

export interface RowIssue {
  row: number;
  message: string;
}

export interface ParseResult {
  dealers: Dealer[];
  skipped: RowIssue[];
  missingColumns: string[];
  totalRows: number;
}

import type { AttentionIndex } from './attentionIndex';

export interface ScoredDealer extends Dealer {
  attention: AttentionIndex;
}
