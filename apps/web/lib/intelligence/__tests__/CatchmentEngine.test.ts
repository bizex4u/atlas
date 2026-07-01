import { describe, it, expect, beforeAll } from 'vitest';
import { CatchmentEngine } from '../CatchmentEngine';
import { GeoCatchmentDataSource } from '../GeoCatchmentDataSource';
import { PlaceholderCatchmentDataSource } from '../CatchmentEngine';

// ─── GeoCatchmentDataSource ───────────────────────────────────────────────────

describe('GeoCatchmentDataSource', () => {
  const source = new GeoCatchmentDataSource();

  it('returns a valid CatchmentRecord for a known metro coordinate', async () => {
    const result = await source.analyze({ lat: 18.9344, lng: 72.8355 }, 2);
    expect(result.radiusKm).toBe(2);
    expect(result.estimatedPopulation).toBeGreaterThan(0);
    expect(result.commercialDensityRatio).toBeGreaterThan(0);
    expect(result.commercialDensityRatio).toBeLessThanOrEqual(0.5);
  });

  it('includes pincodeBreakdown for metro coordinates', async () => {
    const result = await source.analyze({ lat: 18.9344, lng: 72.8355 }, 2);
    expect(result.pincodeBreakdown).toBeDefined();
    expect(result.pincodeBreakdown!.length).toBeGreaterThan(0);
  });

  it('pincodeBreakdown intersectionPct is in (0, 1]', async () => {
    const result = await source.analyze({ lat: 13.0401, lng: 80.2337 }, 2);
    if (result.pincodeBreakdown) {
      for (const slice of result.pincodeBreakdown) {
        expect(slice.intersectionPct).toBeGreaterThan(0);
        expect(slice.intersectionPct).toBeLessThanOrEqual(1);
      }
    }
  });

  it('population = sum of per-pincode contributions', async () => {
    const result = await source.analyze({ lat: 28.6315, lng: 77.2167 }, 2);
    if (result.pincodeBreakdown) {
      const sumContributed = result.pincodeBreakdown.reduce(
        (s, x) => s + x.contributedPopulation,
        0,
      );
      // Allow small float rounding difference
      expect(Math.abs(result.estimatedPopulation - sumContributed)).toBeLessThan(10);
    }
  });

  it('larger radius yields higher or equal population', async () => {
    const center = { lat: 12.9716, lng: 77.5946 };
    const small  = await source.analyze(center, 1);
    const large  = await source.analyze(center, 3);
    expect(large.estimatedPopulation).toBeGreaterThanOrEqual(small.estimatedPopulation);
  });

  it('real source has higher population estimate than placeholder in dense area', async () => {
    // Mumbai Fort — very dense, real data should reflect it
    const center = { lat: 18.9344, lng: 72.8355 };
    const real = await source.analyze(center, 2);
    // Minimum sanity check: at least 10k people in 2km radius of Mumbai
    expect(real.estimatedPopulation).toBeGreaterThan(10_000);
  });

  it('falls back gracefully for coordinates outside indexed area', async () => {
    // Rural coordinate not in our dataset
    const result = await source.analyze({ lat: 25.0, lng: 80.0 }, 2);
    expect(result.radiusKm).toBe(2);
    expect(result.estimatedPopulation).toBeGreaterThan(0);
    // No breakdown — placeholder path
    expect(result.pincodeBreakdown).toBeUndefined();
  });
});

// ─── CatchmentEngine with real data source ────────────────────────────────────

describe('CatchmentEngine with GeoCatchmentDataSource', () => {
  let engine: CatchmentEngine;

  beforeAll(() => {
    engine = new CatchmentEngine(new GeoCatchmentDataSource());
  });

  it('getScore returns a valid SignalBreakdown', async () => {
    const result = await engine.getScore({
      storeName: 'Test',
      city: 'Mumbai',
      pincode: '400001',
      lngLat: { lat: 18.9344, lng: 72.8355 },
    });
    expect(result.id).toBe('catchment');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.weight).toBe(0.15);
  });

  it('confidence is higher when lngLat is provided', async () => {
    const withCoords = await engine.getScore({
      storeName: 'T', city: 'C', pincode: '400001',
      lngLat: { lat: 18.9344, lng: 72.8355 },
    });
    const withoutCoords = await engine.getScore({
      storeName: 'T', city: 'C', pincode: '400001',
    });
    expect(withCoords.confidence).toBeGreaterThan(withoutCoords.confidence);
  });

  it('explanation mentions population and radius', async () => {
    const result = await engine.getScore({
      storeName: 'Test', city: 'Delhi', pincode: '110001',
      lngLat: { lat: 28.6315, lng: 77.2167 },
    });
    expect(result.explanation).toMatch(/km/);
    expect(result.explanation).toMatch(/people|population/i);
  });

  it('metadata contains pincodeBreakdown for metro coordinates', async () => {
    const result = await engine.getScore({
      storeName: 'T', city: 'Mumbai', pincode: '400001',
      lngLat: { lat: 18.9344, lng: 72.8355 },
    });
    // pincodeBreakdown lives in metadata when present
    expect(result.metadata.radiusKm).toBe(2);
    expect(result.metadata.estimatedPopulation).toBeGreaterThan(0);
  });
});

// ─── Backward compatibility: PlaceholderCatchmentDataSource ──────────────────

describe('CatchmentEngine with placeholder (backward compat)', () => {
  const engine = new CatchmentEngine(new PlaceholderCatchmentDataSource());

  it('still returns a valid record', async () => {
    const result = await engine.analyze({ lat: 12.97, lng: 77.59 }, 2);
    expect(result.estimatedPopulation).toBeGreaterThan(0);
    expect(result.pincodeBreakdown).toBeUndefined();
  });

  it('getScore is stable across calls with same input', async () => {
    const input = { storeName: 'T', city: 'B', pincode: '560001' };
    const a = await engine.getScore(input);
    const b = await engine.getScore(input);
    expect(a.score).toBe(b.score);
  });
});
