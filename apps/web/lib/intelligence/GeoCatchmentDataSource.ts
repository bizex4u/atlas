/**
 * Production CatchmentDataSource: intersects the catchment circle with
 * real pincode polygons from the R-tree index, weighting population by
 * the overlap area fraction.
 */
import type { CatchmentRecord, LngLat } from './types';
import type { ICatchmentDataSource, CatchmentHint } from './CatchmentEngine';
import { geoPincodeDataSource, type GeoPincodeDataSource } from './GeoPincodeDataSource';
import { makeCircle, areaKm2 } from './geo/GeoSpatialOps';
import { deterministicInt, deterministicFloat } from './SpatialIndex';

export class GeoCatchmentDataSource implements ICatchmentDataSource {
  constructor(
    private readonly geoSource: GeoPincodeDataSource = geoPincodeDataSource,
  ) {}

  async analyze(lngLat: LngLat, radiusKm: number, hint?: CatchmentHint): Promise<CatchmentRecord> {
    const index = this.geoSource.getIndex();
    const slices = index.intersectCircle(lngLat, radiusKm);

    // Seed for deterministic supplemental values (POI count, commercial ratio)
    const seed = `${lngLat.lat.toFixed(2)}:${lngLat.lng.toFixed(2)}:${radiusKm}`;

    if (slices.length === 0) {
      // Point outside indexed area — use hint-aware density if available
      const area = Math.PI * radiusKm * radiusKm;
      const isRuralHint = hint?.dataQuality === 'unavailable' || hint?.poiCount === 0
        || hint?.areaType?.toLowerCase().includes('rural');
      const density = isRuralHint
        ? 100 + deterministicInt(seed, 40, 600)
        : 5000 + deterministicInt(seed, 40, 10000);
      return {
        radiusKm,
        estimatedPopulation: Math.round(density * area),
        poiCount: 5 + deterministicInt(seed, 41, 30),
        commercialDensityRatio: 0.05 + deterministicFloat(seed, 42) * 0.3,
      };
    }

    // Total catchment circle area (for commercial-density weighting)
    const circleKm2 = areaKm2(makeCircle(lngLat, radiusKm));

    let totalPop = 0;
    const breakdown = slices.map(({ record, intersectionPct, intersectionKm2 }) => {
      const density = record.populationDensity ?? 5000;
      const contributed = Math.round(density * intersectionKm2);
      totalPop += contributed;
      return {
        pincode: record.pincode,
        intersectionPct,
        contributedPopulation: contributed,
      };
    });

    // Weighted-average commercial density ratio (proxy: denser pincodes → more commercial)
    const totalIntersectKm2 = slices.reduce((s, x) => s + x.intersectionKm2, 0);
    const weightedDensity =
      totalIntersectKm2 > 0
        ? slices.reduce((s, { record, intersectionKm2 }) => {
            const d = record.populationDensity ?? 5000;
            return s + (d / 50_000) * intersectionKm2;
          }, 0) / totalIntersectKm2
        : 0.1;

    const commercialDensityRatio = Math.min(0.5, Math.max(0.05, weightedDensity));

    // POI count: scale with circle area and urban density
    const poiCountBase = Math.round(circleKm2 * 8 * commercialDensityRatio * 10);
    const poiCount = Math.max(1, poiCountBase + deterministicInt(seed, 43, 10));

    return {
      radiusKm,
      estimatedPopulation: totalPop,
      poiCount,
      commercialDensityRatio,
      pincodeBreakdown: breakdown,
    };
  }
}

/** Shared singleton */
export const geoCatchmentDataSource = new GeoCatchmentDataSource();
