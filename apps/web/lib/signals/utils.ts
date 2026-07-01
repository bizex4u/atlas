/**
 * Deterministic float in [0, 1] from a string seed + numeric salt.
 * Same inputs always produce the same output — safe as a placeholder
 * until real data sources are wired in.
 */
export function deterministicFloat(seed: string, salt: number): number {
  let h = (salt * 2654435761) | 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

/** Map a [0,1] float to an integer score in [min, max] */
export function toScore(t: number, min: number, max: number): number {
  return Math.round(min + (max - min) * t);
}
