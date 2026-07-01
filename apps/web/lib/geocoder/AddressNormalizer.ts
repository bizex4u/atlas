import type { GeocodeQuery } from './types';

export function normalizeAddress(q: GeocodeQuery): string {
  return [q.address, q.city, q.pincode]
    .map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .join('|');
}
