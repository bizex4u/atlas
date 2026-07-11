import { calculateDistance, findNearestCity } from '@/lib/intelligence/data/census';
import type {
  EvidenceItem,
  EvidenceSource,
  InventoryEvidencePayload,
  DemographicsEvidencePayload,
  PoiEvidencePayload,
  TrafficEvidencePayload,
  CompetitionEvidencePayload,
  BarterEvidencePayload,
  ResearchQuery,
  ResearchSiteSnapshot,
  ResearchBarterSnapshot,
  MissingDataItem,
} from './types';

function nowIso(): string {
  return new Date().toISOString();
}

function source(
  id: string,
  kind: EvidenceSource['kind'],
  label: string,
  summary: string,
  confidence: number,
  freshness: EvidenceSource['freshness'] = 'fresh',
): EvidenceSource {
  return {
    id,
    kind,
    label,
    collectedAt: nowIso(),
    freshness,
    summary,
    confidence,
  };
}

export function collectInventoryEvidence(
  query: ResearchQuery,
  sites: ResearchSiteSnapshot[],
): EvidenceItem {
  const available = sites.filter((s) => s.status === 'available');
  const nearby = sites.filter((s) => {
    if (s.lat == null || s.lng == null) return false;
    return calculateDistance(query.lat, query.lng, s.lat, s.lng) <= query.radiusKm;
  });
  const nearbyAvailable = nearby.filter((s) => s.status === 'available');
  const rents = nearbyAvailable.map((s) => s.monthlyRentInr).filter((n) => n > 0);
  const avg =
    rents.length > 0
      ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length)
      : null;

  const missingCoords = sites.filter((s) => s.lat == null || s.lng == null).length;
  const confidence =
    sites.length === 0 ? 0.2 : missingCoords > sites.length / 2 ? 0.45 : 0.85;

  const payload: InventoryEvidencePayload = {
    totalSites: sites.length,
    availableSites: available.length,
    nearbyAvailable: nearbyAvailable.length,
    nearbySiteCodes: nearbyAvailable.slice(0, 8).map((s) => s.siteCode),
    avgMonthlyRentInr: avg,
  };

  return {
    source: source(
      'inventory-local',
      'inventory',
      'Atlas inventory store',
      `${nearbyAvailable.length} available site(s) within ${query.radiusKm} km`,
      confidence,
      sites.length === 0 ? 'unknown' : 'fresh',
    ),
    payload,
  };
}

export function collectDemographicsEvidence(query: ResearchQuery): EvidenceItem {
  const city = findNearestCity(query.lat, query.lng);
  const confidence = city ? 0.7 : 0.35;
  const payload: DemographicsEvidencePayload = {
    city: city?.name ?? query.city ?? 'Unknown',
    state: city?.state ?? 'Unknown',
    population: city?.population ?? 0,
    incomeLevel: city && city.population > 2_000_000 ? 'upper-middle' : 'middle',
    workingPopulation: city ? Math.round(city.population * 0.35) : 0,
  };

  return {
    source: source(
      'demographics-census-proxy',
      'demographics',
      'Census city proxy',
      city
        ? `${city.name} catchment proxy · pop ${city.population.toLocaleString('en-IN')}`
        : 'No nearby city match in census proxy table',
      confidence,
      city ? 'stale' : 'unknown',
    ),
    payload,
  };
}

export async function collectPoiEvidence(query: ResearchQuery): Promise<EvidenceItem> {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const radiusM = Math.round(query.radiusKm * 1000);
  const ql = `
    [out:json][timeout:20];
    (
      node["amenity"](around:${radiusM},${query.lat},${query.lng});
      node["shop"](around:${radiusM},${query.lat},${query.lng});
    );
    out body 60;
  `;

  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: `data=${encodeURIComponent(ql)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    const data = (await response.json()) as {
      elements?: Array<{ tags?: { amenity?: string; shop?: string; name?: string } }>;
    };
    const elements = data.elements ?? [];
    const categories = elements.map(
      (e) => e.tags?.amenity || e.tags?.shop || 'other',
    );
    const counts = new Map<string, number>();
    for (const c of categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    const topCategories = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
    const nearestNames = elements
      .map((e) => e.tags?.name)
      .filter((n): n is string => Boolean(n))
      .slice(0, 5);

    const payload: PoiEvidencePayload = {
      count: elements.length,
      topCategories,
      nearestNames,
    };

    return {
      source: source(
        'poi-overpass',
        'poi',
        'OpenStreetMap Overpass',
        `${elements.length} POIs within ${query.radiusKm} km`,
        elements.length > 0 ? 0.8 : 0.4,
        'fresh',
      ),
      payload,
    };
  } catch {
    const payload: PoiEvidencePayload = {
      count: 0,
      topCategories: [],
      nearestNames: [],
    };
    return {
      source: source(
        'poi-overpass',
        'poi',
        'OpenStreetMap Overpass',
        'POI fetch failed — treated as missing live amenity data',
        0.2,
        'unknown',
      ),
      payload,
    };
  }
}

export function collectTrafficEvidence(
  query: ResearchQuery,
  poiCount: number,
): EvidenceItem {
  const base = 12_000;
  const avgDailyVehicles = Math.round(base * (1 + Math.min(poiCount, 40) * 0.03));
  const payload: TrafficEvidencePayload = {
    avgDailyVehicles,
    roadType: poiCount > 15 ? 'Arterial / commercial corridor' : 'Local arterial',
    peakHours: ['09:00-11:00', '17:00-20:00'],
  };

  return {
    source: source(
      'traffic-estimate',
      'traffic',
      'Traffic heuristic',
      `~${avgDailyVehicles.toLocaleString('en-IN')} ADT estimate from POI density`,
      0.4,
      'stale',
    ),
    payload,
  };
}

export function collectCompetitionEvidence(
  query: ResearchQuery,
  sites: ResearchSiteSnapshot[],
): EvidenceItem {
  const occupiedNearby = sites.filter((s) => {
    if (s.lat == null || s.lng == null) return false;
    if (s.status === 'available') return false;
    return calculateDistance(query.lat, query.lng, s.lat, s.lng) <= query.radiusKm;
  });
  const distances = occupiedNearby
    .map((s) => calculateDistance(query.lat, query.lng, s.lat as number, s.lng as number))
    .sort((a, b) => a - b);
  const formats = [...new Set(occupiedNearby.map((s) => s.format))];

  const payload: CompetitionEvidencePayload = {
    competitorCount: occupiedNearby.length,
    nearestDistanceKm: distances[0] ?? null,
    formats,
  };

  return {
    source: source(
      'competition-inventory',
      'competition',
      'Occupied inventory as competition proxy',
      `${occupiedNearby.length} occupied/booked site(s) in radius`,
      sites.length > 0 ? 0.65 : 0.3,
      'fresh',
    ),
    payload,
  };
}

export function collectBarterEvidence(barter: ResearchBarterSnapshot): EvidenceItem {
  const payload: BarterEvidencePayload = {
    activeDeals: barter.activeDealCount,
    partnerNames: barter.partnerNames.slice(0, 8),
    openBalanceInr: barter.openBalanceInr,
  };

  return {
    source: source(
      'barter-local',
      'barter',
      'Atlas barter store',
      `${barter.activeDealCount} active deal(s); open balance ₹${barter.openBalanceInr.toLocaleString('en-IN')}`,
      barter.activeDealCount > 0 ? 0.75 : 0.5,
      'fresh',
    ),
    payload,
  };
}

export function deriveMissingData(
  query: ResearchQuery,
  sites: ResearchSiteSnapshot[],
  evidence: EvidenceItem[],
): MissingDataItem[] {
  const missing: MissingDataItem[] = [];
  const inv = evidence.find((e) => e.source.kind === 'inventory');
  const poi = evidence.find((e) => e.source.kind === 'poi');
  const demo = evidence.find((e) => e.source.kind === 'demographics');

  if (sites.length === 0) {
    missing.push({
      field: 'inventory.sites',
      reason: 'No OOH inventory loaded — recommendations cannot rank real sites',
      impact: 'high',
    });
  }

  const missingCoords = sites.filter((s) => s.lat == null || s.lng == null).length;
  if (missingCoords > 0) {
    missing.push({
      field: 'inventory.latlng',
      reason: `${missingCoords} site(s) lack coordinates; radius matching is incomplete`,
      impact: 'high',
    });
  }

  if (poi && (poi.payload as PoiEvidencePayload).count === 0) {
    missing.push({
      field: 'poi.live',
      reason: 'No live POI amenity data for this point',
      impact: 'medium',
    });
  }

  if (demo && (demo.payload as DemographicsEvidencePayload).population === 0) {
    missing.push({
      field: 'demographics.city',
      reason: 'Point is outside census city proxy coverage',
      impact: 'medium',
    });
  }

  if (!query.brandHint) {
    missing.push({
      field: 'query.brandHint',
      reason: 'No brand / category hint — barter fit is generic',
      impact: 'low',
    });
  }

  if (!query.formatHint) {
    missing.push({
      field: 'query.formatHint',
      reason: 'No format preference (hoarding / unipole / etc.)',
      impact: 'low',
    });
  }

  missing.push({
    field: 'traffic.observed',
    reason: 'ADT is heuristic; observed counts would raise confidence',
    impact: 'medium',
  });

  return missing;
}
