import type { LngLat, BoundingBox } from './types';

const EARTH_RADIUS_KM = 6371;

/** Haversine great-circle distance between two coordinates */
export function haversineKm(a: LngLat, b: LngLat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Approximate axis-aligned bounding box around a center point.
 * Not exact near poles, sufficient for city-scale radii.
 */
export function boundingBox(center: LngLat, radiusKm: number): BoundingBox {
  const latDelta = radiusKm / EARTH_RADIUS_KM * (180 / Math.PI);
  const lngDelta =
    latDelta / Math.cos((center.lat * Math.PI) / 180);
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export function pointInBoundingBox(point: LngLat, box: BoundingBox): boolean {
  return (
    point.lat >= box.minLat &&
    point.lat <= box.maxLat &&
    point.lng >= box.minLng &&
    point.lng <= box.maxLng
  );
}

/** Filter candidates within radiusKm of center */
export function filterInRadius<T extends { lngLat: LngLat }>(
  center: LngLat,
  radiusKm: number,
  candidates: T[],
): T[] {
  const box = boundingBox(center, radiusKm);
  return candidates.filter(
    (c) =>
      pointInBoundingBox(c.lngLat, box) &&
      haversineKm(center, c.lngLat) <= radiusKm,
  );
}

/** Return the k nearest candidates sorted ascending by distance */
export function nearestNeighbors<T extends { lngLat: LngLat }>(
  center: LngLat,
  candidates: T[],
  k = 1,
): T[] {
  return [...candidates]
    .sort((a, b) => haversineKm(center, a.lngLat) - haversineKm(center, b.lngLat))
    .slice(0, k);
}

/**
 * Deterministic integer in [0, max) derived from a string seed + salt.
 * Stable across runs — same inputs always yield the same output.
 * Used by placeholder data sources; real sources replace with live data.
 */
export function deterministicInt(seed: string, salt: number, max: number): number {
  let h = (salt * 2654435761) | 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % max;
}

/** Deterministic float in [0, 1) */
export function deterministicFloat(seed: string, salt: number): number {
  return deterministicInt(seed, salt, 10000) / 10000;
}
