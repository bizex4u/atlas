export interface GeocodeQuery {
  address: string;
  city: string;
  pincode: string;
  country: 'IN';
}

export interface GeocodeResult {
  lat: number | null;
  lng: number | null;
  confidence: number; // 0–1
  resolution: 'geocoded' | 'failed';
}

export interface IGeocoder {
  name: string;
  rateLimit: number; // requests per second
  geocode(query: GeocodeQuery): Promise<GeocodeResult>;
}
