interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class KnowledgeCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(private readonly ttlMs: number = 30 * 60 * 1000) {}

  // Snap to ~110m grid (3 decimal places ≈ 111m at equator)
  private key(lat: number, lng: number): string {
    return `${lat.toFixed(3)}_${lng.toFixed(3)}`;
  }

  get(lat: number, lng: number): T | null {
    const entry = this.store.get(this.key(lat, lng));
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(this.key(lat, lng));
      return null;
    }
    return entry.data;
  }

  set(lat: number, lng: number, data: T): void {
    this.store.set(this.key(lat, lng), {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  has(lat: number, lng: number): boolean {
    return this.get(lat, lng) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  get size(): number {
    return this.store.size;
  }
}
