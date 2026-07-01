/**
 * Coordinate validation — single source of truth for all spatial filtering.
 *
 * Rejects: null, NaN, Infinity, 0,0 (Gulf of Guinea), outside ±90/±180.
 * For India-specific callers use isIndiaBounds() as an additional check.
 */

// India bounding box with generous buffer (includes islands)
const INDIA_LAT_MIN =  6.5;
const INDIA_LAT_MAX = 37.5;
const INDIA_LNG_MIN = 68.0;
const INDIA_LNG_MAX = 97.5;

export function isValidCoord(lat: number | null | undefined, lng: number | null | undefined): lat is number {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90)   return false;
  if (lng < -180 || lng > 180) return false;
  // Reject exact (0,0) — no legitimate dealer sits in the Gulf of Guinea
  if (lat === 0 && lng === 0)  return false;
  return true;
}

export function isIndiaBounds(lat: number, lng: number): boolean {
  return lat >= INDIA_LAT_MIN && lat <= INDIA_LAT_MAX &&
         lng >= INDIA_LNG_MIN && lng <= INDIA_LNG_MAX;
}

export interface CoordAudit {
  total: number;
  valid: number;
  rejected: number;
  zeroZero: number;
  outsideIndia: number;
  invalidType: number;
}

export function auditCoords(
  dealers: Array<{ lat: number | null; lng: number | null }>,
): CoordAudit {
  let valid = 0, rejected = 0, zeroZero = 0, outsideIndia = 0, invalidType = 0;

  for (const d of dealers) {
    if (!isValidCoord(d.lat, d.lng)) {
      rejected++;
      if (d.lat === 0 && d.lng === 0) zeroZero++;
      else invalidType++;
    } else {
      if (!isIndiaBounds(d.lat as number, d.lng as number)) outsideIndia++;
      else valid++;
    }
  }

  return { total: dealers.length, valid, rejected, zeroZero, outsideIndia, invalidType };
}
