import { RateLimiter } from '@/lib/intelligence/providers/RateLimiter';
import type { IGeocoder, GeocodeQuery, GeocodeResult } from './types';
import type { GeocodeCache } from './GeocodeCache';
import { normalizeAddress } from './AddressNormalizer';

export interface QueueItem {
  id: string;
  query: GeocodeQuery;
}

export type UpdateCallback = (id: string, result: GeocodeResult) => void;
export type ProgressCallback = (resolved: number, failed: number) => void;

const RETRY_DELAYS = [2000, 8000, 0];

export class GeocodeQueue {
  private limiter: RateLimiter;
  private cancelled = false;
  private paused = false;
  private pausePromise: Promise<void> | null = null;
  private pauseResolve: (() => void) | null = null;

  constructor(
    private geocoder: IGeocoder,
    private cache: GeocodeCache,
    private onUpdate: UpdateCallback,
    private onProgress: ProgressCallback,
  ) {
    this.limiter = new RateLimiter(Math.ceil(1000 / geocoder.rateLimit));
  }

  enqueue(items: QueueItem[]): void {
    let resolved = 0;
    let failed = 0;

    for (const item of items) {
      void this.processItem(item, 0, () => {
        resolved++;
        this.onProgress(resolved, failed);
      }, () => {
        failed++;
        this.onProgress(resolved, failed);
      });
    }
  }

  private async processItem(
    item: QueueItem,
    attempt: number,
    onResolved: () => void,
    onFailed: () => void,
  ): Promise<void> {
    if (this.cancelled) return;
    if (this.paused && this.pausePromise) await this.pausePromise;
    if (this.cancelled) return;

    try {
      const result = await this.limiter.schedule(() => this.geocoder.geocode(item.query));

      const key = normalizeAddress(item.query);
      await this.cache.set(key, result);

      this.onUpdate(item.id, result);
      if (result.resolution === 'failed') onFailed(); else onResolved();
    } catch (err) {
      const e = err as Error & { retryAfter?: number };

      if (e.message === 'rate_limited') {
        const wait = e.retryAfter ?? 60000;
        this.pause();
        await sleep(wait);
        this.resume();
        return this.processItem(item, attempt, onResolved, onFailed);
      }

      if (attempt < RETRY_DELAYS.length - 1) {
        const delay = RETRY_DELAYS[attempt];
        if (delay > 0) await sleep(delay);
        return this.processItem(item, attempt + 1, onResolved, onFailed);
      }

      this.onUpdate(item.id, { lat: null, lng: null, confidence: 0, resolution: 'failed' });
      onFailed();
    }
  }

  cancel(): void {
    this.cancelled = true;
    this.resume();
  }

  pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.pausePromise = new Promise((r) => { this.pauseResolve = r; });
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.pauseResolve?.();
    this.pausePromise = null;
    this.pauseResolve = null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
