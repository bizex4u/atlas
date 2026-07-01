import type { LngLat, OSMPOIResult, OSMPOICategory, OSMPoiSummary } from './types';
import { KnowledgeCache } from './KnowledgeCache';
import { RateLimiter } from './RateLimiter';
import { haversineKm } from '../SpatialIndex';

const DEDUP_RADIUS_KM = 0.30; // 300m — large enough for major interchanges (Rajiv Chowk spans ~300m)

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassData {
  pois:           OSMPOIResult[];
  rawPoiCount:    number;     // before deduplication
  landUseWays:    string[];
  highwayWays:    string[];
  buildingCount:  number;     // commercial/retail buildings within 500m — density proxy
  shopWayCount:   number;     // shop=* ways (enclosed retail floor areas)
  maxLanes:       number;     // max highway lanes seen — road capacity signal
}

export interface IPOIProvider {
  query(lngLat: LngLat, radiusM?: number): Promise<OverpassData>;
  summarize(pois: OSMPOIResult[]): OSMPoiSummary;
}

export class OverpassPOIProvider implements IPOIProvider {
  private readonly cache = new KnowledgeCache<OverpassData>(30 * 60 * 1000); // 30 min
  private readonly limiter = new RateLimiter(600); // ~1.5 req/s max

  async query(lngLat: LngLat, radiusM = 1500): Promise<OverpassData> {
    const cached = this.cache.get(lngLat.lat, lngLat.lng);
    if (cached) return cached;

    return this.limiter.schedule(async () => {
      try {
        const ql = buildQuery(lngLat.lat, lngLat.lng, radiusM);
        const raw = await callOverpass(ql);
        if (!raw) return emptyData();

        const result = parseElements(raw.elements, lngLat);
        this.cache.set(lngLat.lat, lngLat.lng, result);
        return result;
      } catch {
        return emptyData();
      }
    });
  }

  summarize(pois: OSMPOIResult[]): OSMPoiSummary {
    const byCategory: Record<string, number> = {};
    let within500m = 0, within1km = 0, within1500m = 0;

    for (const p of pois) {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
      if (p.distanceKm <= 0.5)  within500m++;
      if (p.distanceKm <= 1.0)  within1km++;
      if (p.distanceKm <= 1.5)  within1500m++;
    }
    return { byCategory, total: pois.length, within500m, within1km, within1500m };
  }
}

// ─── Overpass QL ──────────────────────────────────────────────────────────────

function buildQuery(lat: number, lng: number, r: number): string {
  const rWay  = Math.round(r * 0.55);  // smaller radius for ways
  const rBldg = Math.round(r * 0.35);  // tight radius for building count (500m proxy)
  return `[out:json][timeout:25];
(
  node["amenity"~"^(restaurant|cafe|fast_food|bar|bank|hospital|clinic|school|university|college|marketplace|bus_station|hotel|cinema|pharmacy|fuel|library)$"](around:${r},${lat},${lng});
  node["shop"~"^(mall|supermarket|electronics|department_store|wholesale|mobile_phone|clothes|jewelry|jewellery|optician|hardware|furniture|shoes|cosmetics|sports)$"](around:${r},${lat},${lng});
  node["railway"~"^(station|halt)$"](around:${r},${lat},${lng});
  node["public_transport"="station"](around:${r},${lat},${lng});
  node["office"~"^(it|coworking|company|government|financial|insurance|telecom)$"](around:${r},${lat},${lng});
  node["tourism"~"^(hotel|hostel|attraction|museum|gallery)$"](around:${r},${lat},${lng});
  node["leisure"~"^(park|garden|sports_centre|stadium|fitness_centre)$"](around:${r},${lat},${lng});
  node["amenity"="place_of_worship"](around:${r},${lat},${lng});
  node["man_made"~"^(works|factory|warehouse)$"](around:${r},${lat},${lng});
  way["landuse"](around:${rWay},${lat},${lng});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]["lanes"](around:${rWay},${lat},${lng});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](around:${rWay},${lat},${lng});
  way["building"~"^(commercial|retail|office|industrial|mall|supermarket|yes)$"](around:${rBldg},${lat},${lng});
  way["shop"](around:${rBldg},${lat},${lng});
);
out body center qt;`;
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────

async function callOverpass(ql: string): Promise<{ elements: OSMElement[] } | null> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(ql)}`,
        signal: ctrl.signal,
      }).finally(() => clearTimeout(tid));
      if (res.ok) return res.json() as Promise<{ elements: OSMElement[] }>;
    } catch {
      // try next endpoint
    }
  }
  return null;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────

function parseElements(elements: OSMElement[], center: LngLat): OverpassData {
  const seen = new Set<string>();
  const raw: OSMPOIResult[] = [];
  const landUseWays: string[] = [];
  const highwayWays: string[] = [];
  let buildingCount = 0;
  let shopWayCount  = 0;
  let maxLanes      = 0;

  for (const el of elements) {
    const tags = el.tags ?? {};

    if (tags.landuse) { landUseWays.push(tags.landuse); continue; }
    if (tags.highway) {
      highwayWays.push(tags.highway);
      const lanes = parseInt(tags.lanes ?? '0', 10);
      if (lanes > maxLanes) maxLanes = lanes;
      continue;
    }
    if (tags.building) { buildingCount++; continue; }
    if (el.type === 'way' && tags.shop) { shopWayCount++; continue; }

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) continue;

    const category = tagsToCategory(tags);
    if (category === 'other') continue;

    const id = `${el.type}-${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    raw.push({
      id,
      name:        tags.name ?? tags['name:en'] ?? categoryLabel(category),
      category,
      distanceKm:  haversineKm(center, { lat, lng: lon }),
      coordinates: { lat, lng: lon },
      tags,
    });
  }

  const spatial = deduplicatePOIs(raw);
  const pois    = deduplicateByName(spatial);
  return { pois, rawPoiCount: raw.length, landUseWays, highwayWays, buildingCount, shopWayCount, maxLanes };
}

/**
 * Spatial deduplication — collapses multiple OSM nodes representing the same
 * physical place (e.g. metro station + its 6 entrance nodes, mall + its gates)
 * into a single canonical POI per cluster.
 *
 * Sort order: prefer "station" nodes over "entrance" nodes, then prefer named
 * over unnamed. The winner of each cluster is kept; the rest are discarded.
 */
function deduplicatePOIs(pois: OSMPOIResult[]): OSMPOIResult[] {
  // Sort: proper stations/named venues first, entrances last
  const sorted = [...pois].sort((a, b) => {
    const aIsEntrance = isEntranceNode(a);
    const bIsEntrance = isEntranceNode(b);
    if (aIsEntrance !== bIsEntrance) return aIsEntrance ? 1 : -1;
    // Among equals prefer named
    const aHasName = a.name !== categoryLabel(a.category);
    const bHasName = b.name !== categoryLabel(b.category);
    if (aHasName !== bHasName) return aHasName ? -1 : 1;
    return 0;
  });

  const kept   = new Set<string>();
  const result: OSMPOIResult[] = [];

  for (const poi of sorted) {
    if (kept.has(poi.id)) continue;

    result.push(poi);
    kept.add(poi.id);

    // Absorb nearby same-category nodes into this cluster
    for (const other of sorted) {
      if (kept.has(other.id)) continue;
      if (other.category !== poi.category) continue;
      if (haversineKm(poi.coordinates, other.coordinates) < DEDUP_RADIUS_KM) {
        kept.add(other.id);
      }
    }
  }

  return result;
}

/**
 * Name-based deduplication — collapses same-category POIs with identical or
 * parent/child station names into one entry.
 *
 * Handles patterns like:
 *   "Rajiv Chowk"  +  "Rajiv Chowk Gate 3"  →  keep "Rajiv Chowk"
 *   "CSMT"  +  "Chhatrapati Shivaji Maharaj Terminus"  (both survive — different canonical names)
 */
function deduplicateByName(pois: OSMPOIResult[]): OSMPOIResult[] {
  // Normalize: lowercase, strip gate/exit/entrance suffixes and numbers
  function canonical(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s*(gate|exit|entry|entrance|platform|pillar|door|end)\s*[a-z0-9]*/gi, '')
      .replace(/\s+#?\d+\s*$/g, '') // trailing number
      .replace(/\s+/g, ' ')
      .trim();
  }

  const seen = new Map<string, boolean>(); // "category:canonicalName" → kept
  const result: OSMPOIResult[] = [];

  // Process transit categories with name dedup; others pass through
  const TRANSIT_CATS = new Set<OSMPOICategory>(['metro_station', 'railway_station', 'bus_terminal']);

  for (const poi of pois) {
    if (!TRANSIT_CATS.has(poi.category)) {
      result.push(poi);
      continue;
    }
    const key = `${poi.category}:${canonical(poi.name)}`;
    if (seen.has(key)) continue;
    seen.set(key, true);
    result.push(poi);
  }

  return result;
}

function isEntranceNode(poi: OSMPOIResult): boolean {
  const t = poi.tags;
  return (
    t['railway'] === 'subway_entrance' ||
    t['railway'] === 'tram_stop' ||
    t['entrance'] !== undefined ||
    poi.name.toLowerCase().includes('entrance') ||
    poi.name.toLowerCase().includes('entry') ||
    poi.name.toLowerCase().includes('gate ')
  );
}

function emptyData(): OverpassData {
  return { pois: [], rawPoiCount: 0, landUseWays: [], highwayWays: [], buildingCount: 0, shopWayCount: 0, maxLanes: 0 };
}

// ─── Category mapping ─────────────────────────────────────────────────────────

function tagsToCategory(t: Record<string, string>): OSMPOICategory {
  const n = (t.name ?? '').toLowerCase();

  if (t.shop === 'mall' || n.includes('mall'))       return 'shopping_mall';
  if (t.shop === 'supermarket' || t.shop === 'wholesale' || t.amenity === 'marketplace') return 'market';
  if (t.shop === 'electronics' || t.shop === 'mobile_phone') return 'electronics_store';
  // subway_entrance nodes are gate markers, NOT stations — skip them
  if (t.railway === 'subway_entrance') return 'other';
  if (t.station === 'subway' || t.station === 'metro' ||
      (t['public_transport'] === 'station' && (t.network ?? t['network:en'] ?? '').toLowerCase().includes('metro'))) return 'metro_station';
  if (t.railway === 'station' || t.railway === 'halt') {
    // Check if it's actually a metro/subway station tagged as railway=station
    const net = (t.network ?? t['network:en'] ?? t.operator ?? '').toLowerCase();
    if (net.includes('metro') || net.includes('subway') || net.includes('rapid') || t.station === 'subway') return 'metro_station';
    return 'railway_station';
  }
  if (t.amenity === 'bus_station')                    return 'bus_terminal';
  if (t.office === 'it' || n.includes('tech park') || n.includes('it park') || n.includes('software park')) return 'it_park';
  if (t.office)                                       return 'corporate_office';
  if (t.amenity === 'hospital' || t.amenity === 'clinic') return 'hospital';
  if (t.amenity === 'school')                         return 'school';
  if (t.amenity === 'university' || t.amenity === 'college') return 'university';
  if (t.tourism === 'hotel' || t.tourism === 'hostel' || t.amenity === 'hotel') return 'hotel';
  if (t.amenity === 'restaurant')                     return 'restaurant';
  if (t.amenity === 'cafe' || t.amenity === 'fast_food' || t.amenity === 'bar') return 'cafe';
  if (t.amenity === 'bank')                           return 'bank';
  if (t.amenity === 'pharmacy')                       return 'pharmacy';
  if (t.amenity === 'fuel')                           return 'fuel_station';
  if (t.amenity === 'cinema' || t.amenity === 'theatre') return 'cinema';
  if (t.office === 'government' || t.amenity === 'government') return 'government_office';
  if (t.leisure === 'park' || t.leisure === 'garden') return 'park';
  if (t.tourism === 'attraction' || t.tourism === 'museum' || t.tourism === 'gallery') return 'landmark';
  if (t.amenity === 'place_of_worship') return 'religious_place';
  if (t['man_made'] === 'works' || t['man_made'] === 'factory' || t['man_made'] === 'warehouse') return 'industrial_area';
  return 'other';
}

const CATEGORY_LABELS: Record<OSMPOICategory, string> = {
  shopping_mall:    'Shopping Mall',
  market:           'Market',
  electronics_store:'Electronics Store',
  metro_station:    'Metro Station',
  railway_station:  'Railway Station',
  bus_terminal:     'Bus Terminal',
  corporate_office: 'Office',
  it_park:          'IT Park',
  hospital:         'Hospital',
  school:           'School',
  university:       'University',
  hotel:            'Hotel',
  restaurant:       'Restaurant',
  cafe:             'Café',
  bank:             'Bank',
  pharmacy:         'Pharmacy',
  fuel_station:     'Fuel Station',
  cinema:           'Cinema',
  government_office:'Government Office',
  park:             'Park',
  religious_place:  'Place of Worship',
  industrial_area:  'Industrial / Factory',
  landmark:         'Landmark',
  other:            'Place',
};

function categoryLabel(cat: OSMPOICategory): string {
  return CATEGORY_LABELS[cat];
}

export { categoryLabel };
export const overpassProvider = new OverpassPOIProvider();
