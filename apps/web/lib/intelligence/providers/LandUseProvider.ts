import type { LandUseSummary } from './types';
import type { OverpassData } from './POIProvider';

export interface ILandUseProvider {
  fromOverpassData(data: OverpassData): LandUseSummary;
}

export class OSMLandUseProvider implements ILandUseProvider {
  fromOverpassData({ landUseWays, pois }: OverpassData): LandUseSummary {
    // Count landuse tags
    const counts: Record<string, number> = {};
    for (const tag of landUseWays) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }

    const total = landUseWays.length || 1; // avoid /0

    // Map OSM landuse → our buckets
    const commercial  = (counts.commercial  ?? 0) + (counts.retail ?? 0) * 0.5;
    const residential = counts.residential  ?? 0;
    const office      = (counts.office ?? 0) + (counts.commercial ?? 0) * 0.3;
    const retail      = (counts.retail ?? 0) + (counts.commercial ?? 0) * 0.3;
    const openSpace   = (counts.grass ?? 0) + (counts.park ?? 0) + (counts.recreation_ground ?? 0) + (counts.forest ?? 0);
    const industrial  = (counts.industrial  ?? 0) + (counts.depot ?? 0);
    const mixed       = counts.mixed ?? 0;

    // If no landuse ways, infer from POI density
    if (total === 1) return inferFromPOIs(pois);

    const sum = commercial + residential + office + retail + openSpace + industrial + mixed || 1;
    return {
      commercialPct:  pct(commercial,  sum),
      residentialPct: pct(residential, sum),
      officePct:      pct(office,      sum),
      retailPct:      pct(retail,      sum),
      openSpacePct:   pct(openSpace,   sum),
      industrialPct:  pct(industrial,  sum),
      mixedPct:       pct(mixed + (sum - commercial - residential - office - retail - openSpace - industrial - mixed), sum),
    };
  }
}

function pct(n: number, total: number): number {
  return Math.round((n / total) * 100);
}

function inferFromPOIs(pois: { category: string }[]): LandUseSummary {
  const categories = pois.map((p) => p.category);
  const commercialCount = categories.filter((c) =>
    ['restaurant', 'cafe', 'bank', 'shopping_mall', 'market', 'electronics_store'].includes(c),
  ).length;
  const officeCount = categories.filter((c) =>
    ['corporate_office', 'it_park'].includes(c),
  ).length;
  const transitCount = categories.filter((c) =>
    ['metro_station', 'railway_station', 'bus_terminal'].includes(c),
  ).length;
  const total = pois.length || 1;

  const commPct = Math.min(60, Math.round((commercialCount / total) * 100));
  const offPct  = Math.min(30, Math.round((officeCount / total) * 80));
  const retPct  = Math.min(25, commPct / 2);
  const resPct  = Math.max(0, 50 - commPct - offPct);
  const mixPct  = 100 - commPct - offPct - retPct - resPct;

  return {
    commercialPct:  commPct,
    residentialPct: resPct,
    officePct:      offPct,
    retailPct:      retPct,
    openSpacePct:   transitCount > 0 ? 5 : 10,
    industrialPct:  0,
    mixedPct:       Math.max(0, mixPct),
  };
}

export const osmLandUseProvider = new OSMLandUseProvider();
