import type { PopulationRecord } from '../types';
import type { IPopulationDataSource } from '../PopulationEngine';
import { lookupCensusDistrict, getStateFallback } from '../data/india-census-districts';

/**
 * Census 2011 population provider.
 * Looks up district → real density/urban%/literacy.
 * Falls back to state average if district not found.
 */
export class CensusPopulationProvider implements IPopulationDataSource {
  async getByPincode(
    _pincode: string,
    district?: string,
    state?: string,
  ): Promise<PopulationRecord | null> {
    if (!district && !state) return null;

    const census = district
      ? lookupCensusDistrict(district, state)
      : null;

    const fallback = state ? getStateFallback(state) : null;

    const data = census ?? fallback;
    if (!data) return null;

    const density = 'density' in data ? data.density : (data as { density: number }).density;
    const urbanPct = data.urbanPct;
    const literacyRate = data.literacyRate;

    const incomeTier =
      density > 5000  ? 'High'   :
      density > 1000  ? 'High'   :
      density > 400   ? 'Middle' :
      density > 100   ? 'Middle' : 'Low';

    return {
      pincode: _pincode,
      densityPerKm2: density,
      totalPopulation: 'totalPop' in data ? (data as { totalPop: number }).totalPop * 1000 : density * 500,
      ageDistribution: {
        under18Pct: literacyRate > 0.85 ? 0.26 : 0.32,
        workingAgePct: literacyRate > 0.85 ? 0.60 : 0.56,
        over60Pct: literacyRate > 0.85 ? 0.08 : 0.07,
      },
      incomeTier,
    };
  }
}

export const censusPopulationProvider = new CensusPopulationProvider();
