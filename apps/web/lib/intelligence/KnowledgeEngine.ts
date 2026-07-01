/**
 * KnowledgeEngine — single source of truth for real-world location intelligence.
 *
 * Orchestrates OSM providers to produce a structured LocationKnowledge object
 * consumed by every panel tab, the Attention Engine, and future modules.
 *
 * NO React imports.  Pure async TypeScript.
 */
import type { LngLat } from './types';
import type { LocationKnowledge, GeoLocation, DataQuality } from './providers/types';
import { computeCoverageQuality } from './confidence';
import type { OSMPOIResult, AreaClassification, LandUseSummary, MobilitySummary } from './providers/types';
import { nominatimProvider,   type IReverseGeocodeProvider } from './providers/ReverseGeocodeProvider';
import { overpassProvider,    type IPOIProvider }            from './providers/POIProvider';
import { osmLandUseProvider,  type ILandUseProvider }        from './providers/LandUseProvider';
import { osmAreaClassifier,   type IAreaClassificationProvider } from './providers/AreaClassificationProvider';
import { osmMobilityProvider, type IMobilityProvider }       from './providers/MobilityProvider';
import { nightlightsProvider, type INightlightsProvider }    from './providers/NightlightsProvider';
import { transitProvider,     type ITransitProvider }        from './providers/TransitProvider';
import { findNearbyStations } from './data/india-railways';
import { countByCategory } from './providers/AreaClassificationProvider';

export type { LocationKnowledge } from './providers/types';

const IS_DEV = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// ─── DI interfaces ────────────────────────────────────────────────────────────

interface KnowledgeEngineDeps {
  geocoder:    IReverseGeocodeProvider;
  poi:         IPOIProvider;
  landUse:     ILandUseProvider;
  area:        IAreaClassificationProvider;
  mobility:    IMobilityProvider;
  nightlights: INightlightsProvider;
  transit:     ITransitProvider;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class KnowledgeEngine {
  private readonly deps: KnowledgeEngineDeps;

  constructor(deps?: Partial<KnowledgeEngineDeps>) {
    this.deps = {
      geocoder:    deps?.geocoder    ?? nominatimProvider,
      poi:         deps?.poi         ?? overpassProvider,
      landUse:     deps?.landUse     ?? osmLandUseProvider,
      area:        deps?.area        ?? osmAreaClassifier,
      mobility:    deps?.mobility    ?? osmMobilityProvider,
      nightlights: deps?.nightlights ?? nightlightsProvider,
      transit:     deps?.transit     ?? transitProvider,
    };
  }

  async analyze(lngLat: LngLat): Promise<LocationKnowledge> {
    const label = `🗺️ KnowledgeEngine [${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}]`;
    if (IS_DEV) console.group(label);

    try {
      // All external calls in parallel — nightlights + transit don't block OSM
      const [location, overpassData, nightlights, transit] = await Promise.all([
        this.deps.geocoder.reverse(lngLat),
        this.deps.poi.query(lngLat, 1500),
        this.deps.nightlights.query(lngLat).catch(() => undefined),
        this.deps.transit.query(lngLat, 1500).catch(() => undefined),
      ]);

      if (IS_DEV) {
        console.log('📍 Geocode result:', location);
        console.log(`📌 POIs found: ${overpassData.pois.length}`,
          overpassData.pois.map((p) => `${p.name} (${p.category}, ${(p.distanceKm * 1000).toFixed(0)} m)`));
        console.log('🏗️ Landuse ways:', overpassData.landUseWays);
        console.log('🛣️ Highway ways:', overpassData.highwayWays);
      }

      const pois        = overpassData.pois;
      const rawPoiCount = overpassData.rawPoiCount;

      // Enrich OSM railway results with our datameet dataset (adds IR code, zone, tier)
      const nearbyIRStations = findNearbyStations(lngLat.lat, lngLat.lng, 3);
      if (nearbyIRStations.length > 0 && IS_DEV) {
        console.log('🚆 Nearby IR stations:', nearbyIRStations.map(s => `${s.name} (${s.code}, ${s.tier})`));
      }

      const landUse     = this.deps.landUse.fromOverpassData(overpassData);
      const area        = this.deps.area.classify(pois, landUse, pois.length);
      const mobility    = this.deps.mobility.compute(pois, overpassData);
      const poiSummary  = this.deps.poi.summarize(pois);
      const signals     = buildSignals(pois, area, mobility, location, overpassData.landUseWays, overpassData.highwayWays, nearbyIRStations, overpassData.buildingCount, overpassData.maxLanes);
      const coverage    = computeCoverageQuality(
        pois.length,
        rawPoiCount,
        overpassData.landUseWays.length,
        overpassData.highwayWays.length,
      );

      if (IS_DEV) {
        console.log('🗺️ Land Use:', landUse);
        console.log('🏙️ Area Classification:', area);
        console.log('🚌 Mobility:', mobility);
        console.log('📢 Advertising Signals:', signals);
      }

      const dataQuality: DataQuality =
        location && pois.length > 0 ? 'full'    :
        location || pois.length > 0 ? 'partial' :
                                       'unavailable';

      const result: LocationKnowledge = {
        location:           location ?? fallbackLocation(lngLat),
        pois,
        poiSummary,
        areaClassification: area,
        landUse,
        mobility,
        advertisingSignals: signals,
        dataQuality,
        computedAt:     new Date(),
        coverageScore:  coverage.score,
        coverageReason: coverage.reason,
        rawPoiCount,
        nightlights,
        transit,
      };

      if (IS_DEV) {
        console.log('✅ Final LocationKnowledge:', {
          dataQuality,
          areaType: area.areaType,
          poiTotal: pois.length,
          location: result.location,
          signalCount: signals.length,
        });
        console.groupEnd();
      }

      return result;
    } catch (err) {
      if (IS_DEV) {
        console.error('❌ KnowledgeEngine failed:', err);
        console.groupEnd();
      }
      return unavailableKnowledge(lngLat);
    }
  }
}

// ─── Advertising signal builder ───────────────────────────────────────────────
// Every signal must cite a real count or fact — no generic inferences.

function buildSignals(
  pois:          OSMPOIResult[],
  area:          AreaClassification,
  mobility:      MobilitySummary,
  loc:           GeoLocation | null,
  landUseWays:   string[],
  highwayWays:   string[],
  irStations:    ReturnType<typeof findNearbyStations> = [],
  buildingCount: number = 0,
  maxLanes:      number = 0,
): string[] {
  const c       = countByCategory(pois);
  const signals: string[] = [];

  // ── No data ───────────────────────────────────────────────────────────────
  if (pois.length === 0 && landUseWays.length === 0) {
    const near = loc?.neighbourhood || loc?.suburb || loc?.city;
    signals.push(`No commercial POIs found within 1.5 km${near ? ' of ' + near : ''}`);
    signals.push('Limited advertising infrastructure — rural or sparse area');
    return signals;
  }

  // ── Industrial zone ───────────────────────────────────────────────────────
  const industrialCount = landUseWays.filter((t) => t === 'industrial' || t === 'depot').length;
  if (industrialCount >= 3) {
    signals.push(`${industrialCount} industrial landuse areas detected — workforce audience during shift hours`);
  }

  // ── Transit — cite exact counts and distances ──────────────────────────
  const metro = c.metro_station ?? 0;
  const rail  = c.railway_station ?? 0;
  const bus   = c.bus_terminal ?? 0;
  if (metro >= 2) {
    const nearest = nearestOf(pois, 'metro_station');
    signals.push(`${metro} metro stations within 1.5 km${nearest ? ` — nearest ${fmtDist(nearest)}` : ''}`);
  } else if (metro === 1) {
    const nearest = nearestOf(pois, 'metro_station');
    signals.push(`Metro station${nearest ? ' ' + fmtDist(nearest) + ' away' : ' within 1.5 km'}`);
  }
  if (rail >= 1 || irStations.length > 0) {
    const nearest = nearestOf(pois, 'railway_station');
    const irTop   = irStations[0];
    const irLabel = irTop ? ` (${irTop.name}, ${irTop.tier} category, zone ${irTop.zone})` : '';
    const count   = Math.max(rail, irStations.length);
    signals.push(`${count} railway station${count > 1 ? 's' : ''}${irLabel}${nearest ? ' — nearest ' + fmtDist(nearest) : ''} — regional footfall driver`);
  }
  if (bus >= 2) {
    signals.push(`${bus} bus terminals within 1.5 km — large captive commuter audience`);
  }

  // ── Offices ────────────────────────────────────────────────────────────
  const offices = (c.corporate_office ?? 0) + (c.it_park ?? 0);
  if (offices >= 10) {
    signals.push(`${offices} office buildings within 1.5 km — high weekday daytime audience`);
  } else if (offices >= 3) {
    signals.push(`${offices} offices within 1.5 km — professional daytime footfall`);
  }

  // ── Retail ─────────────────────────────────────────────────────────────
  const malls = c.shopping_mall ?? 0;
  const elec  = c.electronics_store ?? 0;
  if (malls >= 2) {
    signals.push(`${malls} shopping malls within 1.5 km — premium weekend retail audience`);
  } else if (malls === 1) {
    const d = nearestOf(pois, 'shopping_mall');
    signals.push(`Shopping mall${d ? ' ' + fmtDist(d) + ' away' : ' within 1.5 km'} — strong weekend consumer traffic`);
  }
  if (elec >= 5) {
    signals.push(`${elec} electronics stores — high-intent tech-savvy shopper density`);
  }

  // ── Dining ─────────────────────────────────────────────────────────────
  const rest = (c.restaurant ?? 0) + (c.cafe ?? 0);
  if (rest >= 30) {
    signals.push(`${rest} dining establishments within 1.5 km — dense F&B zone, strong evening footfall`);
  } else if (rest >= 10) {
    signals.push(`${rest} restaurants / cafés — active dining district`);
  }

  // ── Highways + road capacity ───────────────────────────────────────────
  const uniqueHighways = [...new Set(highwayWays)];
  if (uniqueHighways.includes('motorway') || uniqueHighways.includes('trunk')) {
    signals.push(`Motorway / trunk road access${maxLanes >= 4 ? ` (${maxLanes}-lane capacity)` : ''} — broad vehicular catchment`);
  } else if (uniqueHighways.includes('primary')) {
    signals.push(`Primary road access${maxLanes >= 4 ? ` (${maxLanes} lanes)` : ''} — strong arterial vehicular reach`);
  }

  // ── Building density (Google Open Buildings proxy via OSM) ────────────
  if (buildingCount >= 20) {
    signals.push(`${buildingCount} commercial/retail buildings within 500 m — dense built-up environment, high dwell-time audience`);
  } else if (buildingCount >= 8) {
    signals.push(`${buildingCount} commercial buildings within 500 m — moderate built-up density`);
  }

  // ── Area type ──────────────────────────────────────────────────────────
  if (area.areaType === 'Commercial Business District') {
    signals.push('CBD classification — premium advertising real estate');
  } else if (area.areaType === 'Retail Hub') {
    signals.push('Retail hub — high purchase-intent audience');
  } else if (area.areaType === 'Transit Hub') {
    signals.push('Transit hub — captive audience during peak hours');
  } else if (area.areaType === 'Educational Zone') {
    const edu = (c.university ?? 0) + (c.school ?? 0);
    signals.push(`Educational zone — ${edu} institution${edu !== 1 ? 's' : ''} within 1.5 km`);
  } else if (area.areaType === 'Religious / Cultural') {
    signals.push(`Religious / cultural zone — ${c.religious_place ?? 0} places of worship detected`);
  }

  // ── Walkability ────────────────────────────────────────────────────────
  if (mobility.walkabilityLevel === 'Very High') {
    signals.push(`Exceptional walkability (score ${mobility.walkabilityScore}/100) — strong pedestrian OOH audience`);
  } else if (mobility.walkabilityLevel === 'High') {
    signals.push(`High walkability (score ${mobility.walkabilityScore}/100) — solid pedestrian traffic`);
  }

  // ── Hotels ─────────────────────────────────────────────────────────────
  const hotels = c.hotel ?? 0;
  if (hotels >= 3) {
    signals.push(`${hotels} hotels within 1.5 km — business traveller and tourist audience`);
  }

  // ── Neighbourhood label ────────────────────────────────────────────────
  if (loc?.neighbourhood && loc.neighbourhood !== loc.city) {
    signals.push(`Located in ${loc.neighbourhood}${loc.city ? ', ' + loc.city : ''}`);
  }

  return signals.slice(0, 8);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nearestOf(pois: OSMPOIResult[], category: string): number | null {
  const matches = pois.filter((p) => p.category === category);
  if (matches.length === 0) return null;
  return Math.min(...matches.map((p) => p.distanceKm));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

function fallbackLocation(lngLat: LngLat): GeoLocation {
  return {
    name: 'Unknown Location', neighbourhood: '', suburb: '',
    city: '', district: '', state: '', pincode: '',
    country: '', countryCode: '', coordinates: lngLat,
  };
}

function unavailableKnowledge(lngLat: LngLat): LocationKnowledge {
  const fallbackLU: LandUseSummary = {
    commercialPct: 0, residentialPct: 0, officePct: 0,
    retailPct: 0, openSpacePct: 0, industrialPct: 0, mixedPct: 100,
  };
  const fallbackMob: MobilitySummary = {
    walkabilityScore: 0, walkabilityLevel: 'None',
    transitScore: 0, transitLevel: 'None',
    roadConnectivityScore: 0, roadClasses: [],
    trafficDrivers: [], peakActivity: 'Data unavailable', weekendActivity: 'Data unavailable',
  };
  const fallbackArea: AreaClassification = {
    areaType: 'Unknown', confidence: 0, subTypes: [],
  };
  return {
    location:           fallbackLocation(lngLat),
    pois:               [],
    poiSummary:         { byCategory: {}, total: 0, within500m: 0, within1km: 0, within1500m: 0 },
    areaClassification: fallbackArea,
    landUse:            fallbackLU,
    mobility:           fallbackMob,
    advertisingSignals: [],
    dataQuality:        'unavailable',
    computedAt:         new Date(),
    coverageScore:      0,
    coverageReason:     'No data available',
    rawPoiCount:        0,
  };
}

export const knowledgeEngine = new KnowledgeEngine();
