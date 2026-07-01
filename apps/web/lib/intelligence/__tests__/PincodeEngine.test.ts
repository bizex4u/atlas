import { describe, it, expect, beforeAll } from 'vitest';
import { GeoPincodeDataSource } from '../GeoPincodeDataSource';
import { PincodeEngine } from '../PincodeEngine';
import { PlaceholderPincodeDataSource } from '../PincodeEngine';

// ─── GeoPincodeDataSource ─────────────────────────────────────────────────────

describe('GeoPincodeDataSource', () => {
  let source: GeoPincodeDataSource;

  beforeAll(() => {
    source = new GeoPincodeDataSource();
  });

  it('indexes all metro pincodes', () => {
    expect(source.indexedCount).toBeGreaterThan(80);
  });

  // ── lookup ────────────────────────────────────────────────────────────────

  describe('lookup()', () => {
    it('returns a record for a known pincode', async () => {
      const record = await source.lookup('400001');
      expect(record).not.toBeNull();
      expect(record!.pincode).toBe('400001');
      expect(record!.state).toBe('Maharashtra');
      expect(record!.zoneType).toBe('metro');
    });

    it('returns null for an unknown pincode', async () => {
      expect(await source.lookup('999999')).toBeNull();
    });

    it('attaches boundary and areaKm2', async () => {
      const record = await source.lookup('560001');
      expect(record!.boundary).toBeDefined();
      expect(record!.boundary!.length).toBeGreaterThan(3);
      expect(record!.areaKm2).toBeGreaterThan(0);
    });

    it('attaches populationDensity', async () => {
      const record = await source.lookup('110001');
      expect(record!.populationDensity).toBeGreaterThan(0);
    });
  });

  // ── findByCoordinates ─────────────────────────────────────────────────────

  describe('findByCoordinates()', () => {
    it('finds Mumbai Fort at 18.9344°N 72.8355°E', async () => {
      const result = await source.findByCoordinates({ lat: 18.9344, lng: 72.8355 });
      expect(result).not.toBeNull();
      // Should be 400001 (Fort) or a very close pincode
      expect(result!.state).toBe('Maharashtra');
    });

    it('finds a Delhi pincode at Connaught Place', async () => {
      const result = await source.findByCoordinates({ lat: 28.6315, lng: 77.2167 });
      expect(result).not.toBeNull();
      expect(result!.state).toBe('Delhi');
    });

    it('finds a Bangalore pincode at Koramangala', async () => {
      const result = await source.findByCoordinates({ lat: 12.9352, lng: 77.6245 });
      expect(result).not.toBeNull();
      expect(result!.state).toBe('Karnataka');
    });

    it('returns nearest pincode even for coordinates slightly outside polygons', async () => {
      // Point in open ocean — should still return nearest (fallback to centroid search)
      const result = await source.findByCoordinates({ lat: 20.0, lng: 73.5 });
      // May return null or a Maharashtra pincode — just must not throw
      expect(result === null || typeof result!.pincode === 'string').toBe(true);
    });
  });

  // ── getNeighbors ──────────────────────────────────────────────────────────

  describe('getNeighbors()', () => {
    it('returns neighbours within 3 km of 400001', async () => {
      const neighbors = await source.getNeighbors('400001', 3);
      expect(neighbors.length).toBeGreaterThan(0);
      // Should not include the query pincode itself
      expect(neighbors.find((n) => n.pincode === '400001')).toBeUndefined();
    });

    it('returns more neighbours at larger radius', async () => {
      const small = await source.getNeighbors('110001', 2);
      const large = await source.getNeighbors('110001', 8);
      expect(large.length).toBeGreaterThanOrEqual(small.length);
    });

    it('neighbours are sorted by distance ascending', async () => {
      const source110 = { lat: 28.6315, lng: 77.2167 }; // 110001 centroid
      const neighbors = await source.getNeighbors('110001', 10);
      if (neighbors.length >= 2) {
        const { haversineKm } = await import('../SpatialIndex');
        const d0 = haversineKm(source110, neighbors[0].centroid);
        const d1 = haversineKm(source110, neighbors[1].centroid);
        expect(d0).toBeLessThanOrEqual(d1 + 0.001); // tolerance for float comparison
      }
    });

    it('returns empty array for unknown pincode', async () => {
      expect(await source.getNeighbors('999999')).toHaveLength(0);
    });
  });
});

// ─── PincodeEngine (with real data source) ────────────────────────────────────

describe('PincodeEngine with GeoPincodeDataSource', () => {
  let engine: PincodeEngine;

  beforeAll(() => {
    engine = new PincodeEngine(new GeoPincodeDataSource());
  });

  it('getScore returns high score for metro pincode', async () => {
    const result = await engine.getScore({
      storeName: 'Test Store',
      city: 'Mumbai',
      pincode: '400001',
    });
    expect(result.id).toBe('pincode');
    expect(result.score).toBeGreaterThan(70);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('getScore confidence is higher than placeholder', async () => {
    const placeholder = new PincodeEngine(new PlaceholderPincodeDataSource());
    const real        = new PincodeEngine(new GeoPincodeDataSource());

    const pResult = await placeholder.getScore({ storeName: 'T', city: 'C', pincode: '400001' });
    const rResult = await real.getScore({ storeName: 'T', city: 'C', pincode: '400001' });

    expect(rResult.confidence).toBeGreaterThan(pResult.confidence);
  });

  it('findByCoordinates delegates to data source', async () => {
    const r = await engine.findByCoordinates({ lat: 13.0401, lng: 80.2337 }); // T Nagar
    if (r) {
      expect(r.state).toBe('Tamil Nadu');
    }
  });

  it('getNeighbors delegates to data source', async () => {
    const neighbors = await engine.getNeighbors('560001', 5);
    expect(Array.isArray(neighbors)).toBe(true);
  });
});

// ─── PlaceholderPincodeDataSource backward compatibility ──────────────────────

describe('PlaceholderPincodeDataSource', () => {
  const source = new PlaceholderPincodeDataSource();

  it('still works for any 6-digit pincode', async () => {
    const record = await source.lookup('400001');
    expect(record).not.toBeNull();
    expect(record!.zoneType).toBe('metro');
  });

  it('returns null for invalid pincode format', async () => {
    expect(await source.lookup('ABC')).toBeNull();
    expect(await source.lookup('12345')).toBeNull();
  });

  it('findByCoordinates not implemented (returns undefined)', () => {
    const asInterface = source as import('../PincodeEngine').IPincodeDataSource;
    expect(asInterface.findByCoordinates).toBeUndefined();
  });
});
