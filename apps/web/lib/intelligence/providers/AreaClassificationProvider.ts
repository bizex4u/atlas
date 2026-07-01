import type { AreaClassification, AreaType, LandUseSummary, OSMPOIResult } from './types';

export interface IAreaClassificationProvider {
  classify(pois: OSMPOIResult[], landUse: LandUseSummary, totalPoiCount: number): AreaClassification;
}

export class OSMAreaClassificationProvider implements IAreaClassificationProvider {
  classify(pois: OSMPOIResult[], landUse: LandUseSummary, totalPoiCount: number): AreaClassification {
    const c = countByCategory(pois);

    // ── Rural: very few POIs and no highway signal ─────────────────────────
    if (totalPoiCount < 5 && landUse.industrialPct < 20) {
      return {
        areaType:   'Rural / Agricultural',
        confidence: 0.7,
        subTypes:   [],
      };
    }

    // ── Industrial: dominant industrial landuse ───────────────────────────
    if (landUse.industrialPct >= 40) {
      const subs: string[] = [];
      if ((c.industrial_area ?? 0) > 0) subs.push('Factory / Works');
      return { areaType: 'Industrial', confidence: Math.min(0.95, 0.6 + landUse.industrialPct / 200), subTypes: subs };
    }

    // ── Religious / Cultural ──────────────────────────────────────────────
    const religious = c.religious_place ?? 0;
    const otherCommercial = (c.restaurant ?? 0) + (c.bank ?? 0) + (c.corporate_office ?? 0);
    if (religious >= 3 && religious > otherCommercial) {
      return { areaType: 'Religious / Cultural', confidence: 0.65, subTypes: [] };
    }

    // ── Score-based classification ────────────────────────────────────────
    const officeScore  = (c.corporate_office ?? 0) + (c.it_park ?? 0) * 2;
    const retailScore  = (c.shopping_mall ?? 0) * 3 + (c.market ?? 0) + (c.electronics_store ?? 0);
    const dineScore    = (c.restaurant ?? 0) * 0.4 + (c.cafe ?? 0) * 0.2;
    const transitScore = (c.metro_station ?? 0) * 3 + (c.railway_station ?? 0) * 2 + (c.bus_terminal ?? 0);
    const eduScore     = (c.university ?? 0) * 3 + (c.school ?? 0);
    const healthScore  = (c.hospital ?? 0) * 3;
    const govScore     = (c.government_office ?? 0) * 2;
    const tourScore    = (c.hotel ?? 0) * 2 + (c.landmark ?? 0);

    const cbdScore = officeScore + dineScore + (landUse.commercialPct > 40 ? 8 : 0) + (landUse.officePct > 20 ? 5 : 0);
    const hubScore = retailScore + (landUse.retailPct > 30 ? 6 : 0);
    const resScore = landUse.residentialPct * 0.4 - landUse.commercialPct * 0.2;
    const mixScore = landUse.mixedPct * 0.3 + Math.min(landUse.commercialPct, landUse.residentialPct) * 0.15;

    const candidates: [AreaType, number][] = [
      ['Commercial Business District', cbdScore],
      ['Retail Hub',                   hubScore],
      ['Residential',                  resScore],
      ['Mixed Use',                    mixScore],
      ['Educational Zone',             eduScore],
      ['Healthcare Zone',              healthScore],
      ['Government Area',              govScore],
      ['Transit Hub',                  transitScore],
      ['Tourism Zone',                 tourScore],
      ['Industrial',                   landUse.industrialPct * 0.6],
    ];

    candidates.sort((a, b) => b[1] - a[1]);
    const [topType, topScore] = candidates[0]!;
    const [, secondScore]     = candidates[1] ?? [null, 0];

    // Low data density → lower confidence
    const dataDensityFactor = Math.min(1, totalPoiCount / 20);
    const gap        = Math.max(0, topScore - secondScore);
    const rawConf    = 0.3 + gap / 25;
    const confidence = Math.min(0.95, Math.max(0.25, rawConf * dataDensityFactor));

    const subTypes = candidates
      .slice(1, 4)
      .filter(([, s]) => s > 3)
      .map(([t]) => t);

    return { areaType: topScore > 1 ? topType : 'Residential', confidence, subTypes };
  }
}

export function countByCategory(pois: OSMPOIResult[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const p of pois) m[p.category] = (m[p.category] ?? 0) + 1;
  return m;
}

export const osmAreaClassifier = new OSMAreaClassificationProvider();
