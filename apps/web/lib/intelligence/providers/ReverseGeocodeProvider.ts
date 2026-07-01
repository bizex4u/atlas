import type { LngLat, GeoLocation } from './types';
import { KnowledgeCache } from './KnowledgeCache';
import { RateLimiter } from './RateLimiter';

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  place_id: number;
  display_name: string;
  address: NominatimAddress;
}

export interface IReverseGeocodeProvider {
  reverse(lngLat: LngLat): Promise<GeoLocation | null>;
}

export class NominatimProvider implements IReverseGeocodeProvider {
  private readonly cache = new KnowledgeCache<GeoLocation>(60 * 60 * 1000); // 1 hr
  private readonly limiter = new RateLimiter(1100); // ≤ 1 req/s per Nominatim ToS

  async reverse(lngLat: LngLat): Promise<GeoLocation | null> {
    const cached = this.cache.get(lngLat.lat, lngLat.lng);
    if (cached) return cached;

    return this.limiter.schedule(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/reverse` +
          `?lat=${lngLat.lat}&lon=${lngLat.lng}&format=json&addressdetails=1`;

        const res = await fetchTimeout(url, { headers: { 'Accept-Language': 'en' } }, 8000);
        if (!res.ok) return null;

        const data = (await res.json()) as NominatimResponse;
        const result = parse(data, lngLat);
        this.cache.set(lngLat.lat, lngLat.lng, result);
        return result;
      } catch {
        return null;
      }
    });
  }
}

function parse(data: NominatimResponse, coordinates: LngLat): GeoLocation {
  const a = data.address;
  const firstPart = data.display_name.split(',')[0]?.trim() ?? '';

  // City resolution: prefer the most specific non-administrative name.
  // Problem: for NCR India, Nominatim often returns city="Delhi" even for
  // Gurgaon/Noida coordinates because Delhi is the administrative parent.
  // city_district ("Gurugram", "Noida") is more precise in these cases.
  // Rule: if city_district exists and differs from city, city_district wins.
  const rawCity     = a.city ?? a.town ?? a.village ?? '';
  const rawDistrict = a.city_district ?? a.state_district ?? a.county ?? '';
  const city = rawDistrict && rawDistrict !== rawCity
    ? rawDistrict
    : rawCity || rawDistrict;

  return {
    name:          a.road ?? a.suburb ?? a.neighbourhood ?? firstPart,
    neighbourhood: a.neighbourhood ?? a.suburb ?? a.city_district ?? '',
    suburb:        a.suburb ?? a.city_district ?? '',
    city,
    district:      rawDistrict,
    state:         a.state ?? '',
    pincode:       a.postcode ?? '',
    country:       a.country ?? '',
    countryCode:   (a.country_code ?? '').toUpperCase(),
    coordinates,
  };
}

function fetchTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  );
}

export const nominatimProvider = new NominatimProvider();
