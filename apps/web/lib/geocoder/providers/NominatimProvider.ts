import type { IGeocoder, GeocodeQuery, GeocodeResult } from '../types';

export class NominatimProvider implements IGeocoder {
  name = 'nominatim';
  rateLimit = 1; // 1 req/sec per ToS

  async geocode(query: GeocodeQuery): Promise<GeocodeResult> {
    const q = `${query.address}, ${query.city}, ${query.pincode}, India`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=in`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Atlas/1.0 (atlas-platform)' },
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const err = new Error('rate_limited');
      (err as Error & { retryAfter: number }).retryAfter = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : 60000;
      throw err;
    }

    if (!res.ok) throw new Error(`nominatim_error_${res.status}`);

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      importance: number;
    }>;

    if (!data.length) {
      return { lat: null, lng: null, confidence: 0, resolution: 'failed' };
    }

    const hit = data[0];
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      confidence: hit.importance ?? 0,
      resolution: 'geocoded',
    };
  }
}
