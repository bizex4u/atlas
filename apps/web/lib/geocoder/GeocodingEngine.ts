import type { GeoResolution } from '@/types/dealer';
import { GeocodeCache } from './GeocodeCache';
import { GeocodeQueue } from './GeocodeQueue';
import { createGeocoder } from './GeocoderFactory';
import { normalizeAddress } from './AddressNormalizer';
import type { GeocodeResult } from './types';

interface ResolveItem {
  id: string;
  address: string;
  city: string;
  pincode: string;
}

type UpdateFn = (id: string, lat: number | null, lng: number | null, resolution: GeoResolution) => void;

export class GeocodingEngine {
  private cache = new GeocodeCache();
  private queue: GeocodeQueue | null = null;

  resolve(items: ResolveItem[], onUpdate: UpdateFn): void {
    const geocoder = createGeocoder();
    const pending: typeof items = [];

    const handleResult = (id: string, result: GeocodeResult) => {
      if (result.resolution === 'failed' || result.lat == null || result.lng == null) {
        onUpdate(id, null, null, 'failed');
      } else {
        onUpdate(id, result.lat, result.lng, 'geocoded');
      }
    };

    // Check cache first (async, but fire immediately)
    void Promise.all(
      items.map(async (item) => {
        const key = normalizeAddress({ ...item, country: 'IN' });
        const cached = await this.cache.get(key);
        if (cached) {
          handleResult(item.id, cached);
        } else {
          pending.push(item);
        }
      }),
    ).then(() => {
      if (!pending.length) return;

      let resolved = 0;
      let failed = 0;

      this.queue = new GeocodeQueue(
        geocoder,
        this.cache,
        (id, result) => handleResult(id, result),
        (r, f) => { resolved = r; failed = f; void resolved; void failed; },
      );

      this.queue.enqueue(
        pending.map((item) => ({
          id: item.id,
          query: { address: item.address, city: item.city, pincode: item.pincode, country: 'IN' as const },
        })),
      );

      // Pause on offline, resume when back
      if (typeof window !== 'undefined') {
        window.addEventListener('offline', () => this.queue?.pause());
        window.addEventListener('online', () => this.queue?.resume());
      }
    });
  }

  cancel(): void { this.queue?.cancel(); }
  pause(): void  { this.queue?.pause(); }
  resume(): void { this.queue?.resume(); }
}

export const geocodingEngine = new GeocodingEngine();
