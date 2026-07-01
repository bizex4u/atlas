import { describe, it, expect } from 'vitest';
import { haversineKm, boundingBox, filterInRadius, nearestNeighbors, deterministicInt, deterministicFloat } from '../SpatialIndex';
import { makeCircle, areaKm2, centroid, pointInPolygon, intersectPolygons, polygonBbox } from '../geo/GeoSpatialOps';

// ─── haversineKm ──────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm({ lat: 28.6, lng: 77.2 }, { lat: 28.6, lng: 77.2 })).toBe(0);
  });

  it('computes ~2231 km from Delhi to Mumbai', () => {
    const delhi   = { lat: 28.6315, lng: 77.2167 };
    const mumbai  = { lat: 18.9344, lng: 72.8355 };
    const dist = haversineKm(delhi, mumbai);
    expect(dist).toBeGreaterThan(1100);
    expect(dist).toBeLessThan(1200);
  });

  it('is symmetric', () => {
    const a = { lat: 12.97, lng: 77.59 };
    const b = { lat: 13.02, lng: 77.60 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

// ─── boundingBox ──────────────────────────────────────────────────────────────

describe('boundingBox', () => {
  it('contains the center point', () => {
    const center = { lat: 28.6, lng: 77.2 };
    const box = boundingBox(center, 5);
    expect(box.minLat).toBeLessThan(center.lat);
    expect(box.maxLat).toBeGreaterThan(center.lat);
    expect(box.minLng).toBeLessThan(center.lng);
    expect(box.maxLng).toBeGreaterThan(center.lng);
  });

  it('scales with radius', () => {
    const center = { lat: 19.0, lng: 72.8 };
    const small = boundingBox(center, 1);
    const large = boundingBox(center, 10);
    const spanSmall = small.maxLat - small.minLat;
    const spanLarge = large.maxLat - large.minLat;
    expect(spanLarge).toBeGreaterThan(spanSmall * 5);
  });
});

// ─── filterInRadius ───────────────────────────────────────────────────────────

describe('filterInRadius', () => {
  const candidates = [
    { lngLat: { lat: 28.6315, lng: 77.2167 }, name: 'Delhi CP' },
    { lngLat: { lat: 28.6419, lng: 77.2260 }, name: 'Delhi Darya Ganj' },
    { lngLat: { lat: 18.9344, lng: 72.8355 }, name: 'Mumbai Fort' },
  ];

  it('returns only candidates within radius', () => {
    const center = { lat: 28.63, lng: 77.22 };
    const result = filterInRadius(center, 5, candidates);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toContain('Delhi CP');
    expect(result.map((r) => r.name)).toContain('Delhi Darya Ganj');
  });

  it('returns empty when nothing in range', () => {
    const center = { lat: 28.63, lng: 77.22 };
    expect(filterInRadius(center, 0.1, candidates)).toHaveLength(0);
  });
});

// ─── nearestNeighbors ─────────────────────────────────────────────────────────

describe('nearestNeighbors', () => {
  const candidates = [
    { lngLat: { lat: 13.00, lng: 77.60 }, id: 'A' },
    { lngLat: { lat: 13.01, lng: 77.61 }, id: 'B' },
    { lngLat: { lat: 13.10, lng: 77.70 }, id: 'C' },
  ];

  it('returns the closest k candidates', () => {
    const result = nearestNeighbors({ lat: 13.00, lng: 77.60 }, candidates, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('A');
    expect(result[1].id).toBe('B');
  });
});

// ─── deterministic functions ──────────────────────────────────────────────────

describe('deterministicInt', () => {
  it('same inputs produce same output', () => {
    expect(deterministicInt('110001', 10, 100)).toBe(deterministicInt('110001', 10, 100));
  });

  it('different seeds produce different outputs (usually)', () => {
    expect(deterministicInt('110001', 10, 100)).not.toBe(deterministicInt('400001', 10, 100));
  });

  it('output is in [0, max)', () => {
    for (const max of [10, 100, 1000]) {
      const v = deterministicInt('560001', 7, max);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(max);
    }
  });
});

describe('deterministicFloat', () => {
  it('output is in [0, 1)', () => {
    const v = deterministicFloat('700001', 99);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('stable across calls', () => {
    expect(deterministicFloat('500001', 5)).toBe(deterministicFloat('500001', 5));
  });
});

// ─── GeoSpatialOps ────────────────────────────────────────────────────────────

describe('makeCircle', () => {
  it('creates a polygon', () => {
    const circle = makeCircle({ lat: 12.97, lng: 77.59 }, 2);
    expect(circle.type).toBe('Feature');
    expect(circle.geometry.type).toBe('Polygon');
  });

  it('has area close to πr²', () => {
    const r = 2;
    const circle = makeCircle({ lat: 12.97, lng: 77.59 }, r);
    const area = areaKm2(circle);
    const expected = Math.PI * r * r;
    // Within 2% (circle approximation with 64 steps)
    expect(area).toBeCloseTo(expected, 0);
  });
});

describe('pointInPolygon', () => {
  it('returns true for point inside circle', () => {
    const center = { lat: 12.97, lng: 77.59 };
    const circle = makeCircle(center, 1);
    expect(pointInPolygon(center, circle)).toBe(true);
  });

  it('returns false for point far outside', () => {
    const circle = makeCircle({ lat: 12.97, lng: 77.59 }, 1);
    expect(pointInPolygon({ lat: 13.10, lng: 77.59 }, circle)).toBe(false);
  });
});

describe('intersectPolygons', () => {
  it('returns null for non-overlapping circles', () => {
    const a = makeCircle({ lat: 12.97, lng: 77.59 }, 0.5);
    const b = makeCircle({ lat: 13.10, lng: 77.59 }, 0.5);
    expect(intersectPolygons(a, b)).toBeNull();
  });

  it('returns a polygon for overlapping circles', () => {
    const a = makeCircle({ lat: 12.97, lng: 77.59 }, 2);
    const b = makeCircle({ lat: 12.98, lng: 77.59 }, 2);
    const result = intersectPolygons(a, b);
    expect(result).not.toBeNull();
    expect(areaKm2(result!)).toBeGreaterThan(0);
  });

  it('intersection area ≤ smaller polygon area', () => {
    const small = makeCircle({ lat: 12.97, lng: 77.59 }, 1);
    const large = makeCircle({ lat: 12.97, lng: 77.59 }, 3);
    const result = intersectPolygons(small, large);
    expect(areaKm2(result!)).toBeLessThanOrEqual(areaKm2(small) + 0.001);
  });
});

describe('centroid', () => {
  it('centroid of a circle is close to its center', () => {
    const center = { lat: 28.63, lng: 77.22 };
    const circle = makeCircle(center, 2);
    const c = centroid(circle);
    expect(c.lat).toBeCloseTo(center.lat, 2);
    expect(c.lng).toBeCloseTo(center.lng, 2);
  });
});

describe('polygonBbox', () => {
  it('bbox contains the circle center', () => {
    const center = { lat: 17.40, lng: 78.48 };
    const circle = makeCircle(center, 1);
    const [minX, minY, maxX, maxY] = polygonBbox(circle);
    expect(center.lng).toBeGreaterThan(minX);
    expect(center.lng).toBeLessThan(maxX);
    expect(center.lat).toBeGreaterThan(minY);
    expect(center.lat).toBeLessThan(maxY);
  });
});
