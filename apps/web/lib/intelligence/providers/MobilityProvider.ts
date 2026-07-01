import type { MobilitySummary, ActivityLevel, OSMPOIResult } from './types';
import type { OverpassData } from './POIProvider';
import { countByCategory } from './AreaClassificationProvider';

export interface IMobilityProvider {
  compute(pois: OSMPOIResult[], data: OverpassData): MobilitySummary;
}

const HIGHWAY_RANK: Record<string, number> = {
  motorway: 5, trunk: 4, primary: 3, secondary: 2, tertiary: 1,
};

export class OSMMobilityProvider implements IMobilityProvider {
  compute(pois: OSMPOIResult[], { highwayWays, buildingCount = 0, maxLanes = 0 }: OverpassData): MobilitySummary {
    const c = countByCategory(pois);

    // ── Transit score ─────────────────────────────────────────────────────────
    const transitRaw =
      (c.metro_station   ?? 0) * 25 +
      (c.railway_station ?? 0) * 20 +
      (c.bus_terminal    ?? 0) * 10;
    const transitScore = Math.min(100, transitRaw);
    const transitLevel = toLevel(transitScore, [70, 45, 20, 5]);

    // ── Road connectivity — now also uses lane count ──────────────────────────
    const roadRaw = highwayWays.reduce((s, hw) => s + (HIGHWAY_RANK[hw] ?? 0), 0);
    const laneBonus = Math.min(15, maxLanes * 3);   // 4-lane road → +12 pts
    const roadConnectivityScore = Math.min(100, roadRaw * 6 + laneBonus);

    // ── Walkability — POI density + building count within 500m ───────────────
    const walk500 = pois.filter((p) => p.distanceKm <= 0.5).length;
    const bldgBonus = Math.min(20, buildingCount * 0.8); // buildings = people nearby
    const walkabilityScore = Math.min(100, walk500 * 8 + transitScore * 0.3 + bldgBonus);
    const walkabilityLevel = toLevel(walkabilityScore, [70, 45, 20, 5]);

    // ── Road classes present ──────────────────────────────────────────────────
    const roadClasses = [...new Set(highwayWays)].sort(
      (a, b) => (HIGHWAY_RANK[b] ?? 0) - (HIGHWAY_RANK[a] ?? 0),
    );

    // ── Traffic drivers ───────────────────────────────────────────────────────
    const drivers: string[] = [];
    if ((c.corporate_office ?? 0) + (c.it_park ?? 0) >= 3) drivers.push('Office commuters');
    if ((c.shopping_mall ?? 0) + (c.market ?? 0) >= 2)     drivers.push('Retail shoppers');
    if ((c.school ?? 0) + (c.university ?? 0) >= 2)         drivers.push('Students');
    if ((c.hospital ?? 0) >= 1)                             drivers.push('Healthcare visitors');
    if (transitScore >= 40)                                  drivers.push('Transit passengers');
    if ((c.restaurant ?? 0) >= 10)                           drivers.push('F&B evening crowd');
    if ((c.religious_place ?? 0) >= 3)                       drivers.push('Religious / pilgrimage visitors');
    if ((c.industrial_area ?? 0) >= 2)                       drivers.push('Industrial workforce');
    if (drivers.length === 0 && pois.length < 5)             drivers.push('Primarily residential / rural');
    else if (drivers.length === 0)                           drivers.push('Local residents');

    // ── Activity windows ──────────────────────────────────────────────────────
    const hasOffice  = (c.corporate_office ?? 0) + (c.it_park ?? 0) > 0;
    const hasRetail  = (c.shopping_mall ?? 0) + (c.market ?? 0) > 0;
    const hasDining  = (c.restaurant ?? 0) + (c.cafe ?? 0) > 5;

    const peakActivity = hasOffice
      ? '8–10 AM, 1–2 PM, 6–8 PM (weekdays)'
      : hasRetail
      ? '11 AM – 9 PM (weekdays & weekends)'
      : '9 AM – 7 PM (weekdays)';

    const weekendActivity =
      (c.shopping_mall ?? 0) >= 1     ? 'Very High — mall-anchored weekend traffic'          :
      hasDining                        ? 'High — dining and leisure crowd'                    :
      transitScore >= 40               ? 'Medium — transit-driven weekend flow'               :
      (c.religious_place ?? 0) >= 2    ? 'High — religious / pilgrimage weekend footfall'     :
      pois.length < 5                  ? 'Very Low — limited commercial infrastructure'       :
                                         'Low — primarily residential weekend';

    return {
      walkabilityScore,
      walkabilityLevel,
      transitScore,
      transitLevel,
      roadConnectivityScore,
      roadClasses,
      trafficDrivers: drivers,
      peakActivity,
      weekendActivity,
    };
  }
}

function toLevel(score: number, thresholds: [number, number, number, number]): ActivityLevel {
  const [vh, h, m, l] = thresholds;
  if (score >= vh) return 'Very High';
  if (score >= h)  return 'High';
  if (score >= m)  return 'Medium';
  if (score >= l)  return 'Low';
  return 'None';
}

export const osmMobilityProvider = new OSMMobilityProvider();
