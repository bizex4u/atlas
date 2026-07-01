import type { GeocodeResult } from './types';

const DB_NAME = 'atlas-geocache';
const STORE_NAME = 'results';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CacheEntry {
  result: GeocodeResult;
  ts: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class GeocodeCache {
  private memory = new Map<string, GeocodeResult>();

  async get(key: string): Promise<GeocodeResult | null> {
    const mem = this.memory.get(key);
    if (mem) return mem;

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => {
          const entry = req.result as CacheEntry | undefined;
          if (!entry || Date.now() - entry.ts > TTL_MS) {
            resolve(null);
            return;
          }
          this.memory.set(key, entry.result);
          resolve(entry.result);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async set(key: string, result: GeocodeResult): Promise<void> {
    this.memory.set(key, result);
    try {
      const db = await openDB();
      const entry: CacheEntry = { result, ts: Date.now() };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(entry, key);
    } catch {
      // IDB unavailable — memory cache still works
    }
  }
}
