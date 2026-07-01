'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import type { POIRecord } from '@/lib/intelligence/types';
import type { POICategory } from '@/lib/intelligence/types';
import type { OSMPOIResult, OSMPOICategory } from '@/lib/intelligence/providers/types';
import { scoreToLevel } from '@/lib/intelligence/confidence';
import { ConfidenceDot } from '@/components/intelligence/ConfidenceBadge';

// ─── Display config ───────────────────────────────────────────────────────────

interface PlaceGroup {
  heading: string;
  icon: string;
  categories: POICategory[];
  /** If true, show placeholder "Coming soon" for this group */
  placeholder?: boolean;
}

const PLACE_GROUPS: PlaceGroup[] = [
  { heading: 'Shopping', icon: '🛍️', categories: ['mall', 'market'] },
  { heading: 'Transit',  icon: '🚇', categories: ['metro-station', 'railway-station', 'bus-stop'] },
  { heading: 'Healthcare & Education', icon: '🏥', categories: ['hospital', 'school', 'college'] },
  { heading: 'Finance',  icon: '🏦', categories: ['bank', 'atm'] },
  { heading: 'Fuel',     icon: '⛽', categories: ['petrol-pump'] },
  { heading: 'Electronics Stores', icon: '📱', categories: [], placeholder: true },
  { heading: 'Corporate / IT Parks', icon: '🏢', categories: [], placeholder: true },
  { heading: 'Hotels & Restaurants', icon: '🍽️', categories: [], placeholder: true },
  { heading: 'Important Landmarks',  icon: '🗺️', categories: [], placeholder: true },
];

const CATEGORY_LABELS: Partial<Record<POICategory, string>> = {
  mall:            'Shopping Mall',
  market:          'Market',
  hospital:        'Hospital',
  school:          'School',
  college:         'College / University',
  'bus-stop':      'Bus Terminal',
  'metro-station': 'Metro Station',
  'railway-station': 'Railway Station',
  bank:            'Bank',
  atm:             'ATM',
  'petrol-pump':   'Petrol Pump',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlaceItem({ poi }: { poi: POIRecord }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
      <span className="text-[11px] text-zinc-300 truncate">
        {CATEGORY_LABELS[poi.category] ?? poi.category}
      </span>
      <span className="text-[11px] font-mono text-zinc-500 shrink-0 ml-2">
        {poi.name}
      </span>
    </div>
  );
}

// ─── OSM POI display (real data) ──────────────────────────────────────────────

const OSM_CATEGORY_LABELS: Partial<Record<OSMPOICategory, string>> = {
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
  university:       'University / College',
  hotel:            'Hotel',
  restaurant:       'Restaurant',
  cafe:             'Café / Bar',
  bank:             'Bank',
  pharmacy:         'Pharmacy',
  fuel_station:     'Fuel Station',
  cinema:           'Cinema',
  government_office:'Government Office',
  park:             'Park',
  landmark:         'Landmark',
};

interface OSMGroup {
  heading: string;
  icon: string;
  categories: OSMPOICategory[];
}

const OSM_GROUPS: OSMGroup[] = [
  { heading: 'Transit',              icon: '🚇', categories: ['metro_station', 'railway_station', 'bus_terminal'] },
  { heading: 'Shopping',             icon: '🛍️', categories: ['shopping_mall', 'market', 'electronics_store'] },
  { heading: 'Offices & IT Parks',   icon: '🏢', categories: ['corporate_office', 'it_park'] },
  { heading: 'Healthcare',           icon: '🏥', categories: ['hospital', 'pharmacy'] },
  { heading: 'Education',            icon: '🎓', categories: ['university', 'school'] },
  { heading: 'Food & Dining',        icon: '🍽️', categories: ['restaurant', 'cafe'] },
  { heading: 'Finance',              icon: '🏦', categories: ['bank'] },
  { heading: 'Hotels & Tourism',     icon: '🏨', categories: ['hotel', 'landmark'] },
  { heading: 'Parks & Recreation',   icon: '🌳', categories: ['park'] },
  { heading: 'Government',           icon: '🏛️', categories: ['government_office'] },
  { heading: 'Religious Places',     icon: '🕌', categories: ['religious_place'] },
  { heading: 'Industrial / Factories', icon: '🏭', categories: ['industrial_area'] },
];

function OSMPlaceItem({ poi }: { poi: OSMPOIResult }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
      <span className="text-[11px] text-zinc-300 truncate max-w-[55%]">{poi.name}</span>
      <span className="text-[11px] font-mono text-zinc-500 shrink-0 ml-2">
        {poi.distanceKm < 1
          ? `${Math.round(poi.distanceKm * 1000)} m`
          : `${poi.distanceKm.toFixed(1)} km`}
      </span>
    </div>
  );
}

function OSMNearbyContent({ pois }: { pois: OSMPOIResult[] }) {
  const byCategory = new Map<OSMPOICategory, OSMPOIResult[]>();
  for (const poi of pois) {
    if (!byCategory.has(poi.category)) byCategory.set(poi.category, []);
    byCategory.get(poi.category)!.push(poi);
  }
  // Sort each group by distance
  for (const arr of byCategory.values()) arr.sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="px-4 pb-4">
      {OSM_GROUPS.map((group) => {
        const groupPOIs = group.categories.flatMap((c) => byCategory.get(c) ?? []);
        if (groupPOIs.length === 0) return null;
        return (
          <div key={group.heading} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{group.icon}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">{group.heading}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-600">{groupPOIs.length}</span>
            </div>
            <div className="pl-6">
              {groupPOIs.slice(0, 5).map((poi) => (
                <OSMPlaceItem key={poi.id} poi={poi} />
              ))}
              {groupPOIs.length > 5 && (
                <p className="text-[11px] text-zinc-600 pt-1">+{groupPOIs.length - 5} more</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// suppress unused warning — kept for fallback path
void OSM_CATEGORY_LABELS;

function PlaceholderGroup({ heading, icon }: { heading: string; icon: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">{heading}</span>
      </div>
      <p className="text-[11px] text-zinc-700 italic pl-6">Data provider coming soon</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-3 rounded bg-zinc-800 animate-pulse" />)}
    </div>
  );
}

function NearbyContent({ analysis }: { analysis: LocationAnalysis }) {
  const { poiRecords, poiSummary, knowledge } = analysis;

  // Prefer real OSM data when available (even if 0 — means Overpass returned, just nothing nearby)
  if (knowledge && knowledge.dataQuality !== 'unavailable') {
    if (knowledge.pois.length === 0) {
      return (
        <div className="flex-1 overflow-y-auto">
          <div className="m-3 rounded-xl border border-zinc-800 bg-[#1e0d2e] px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">OSM Result</p>
            <p className="text-sm font-semibold text-zinc-400">No POIs found within 1.5 km</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              This appears to be a rural, agricultural, or sparsely developed area.
              No commercial, transit, or civic infrastructure was detected.
            </p>
          </div>
        </div>
      );
    }
  }

  if (knowledge && knowledge.pois.length > 0) {
    const total     = knowledge.poiSummary.total;
    const rawCount  = knowledge.rawPoiCount;
    const deduped   = rawCount - total;
    const nearest   = Math.min(...knowledge.pois.map((p) => p.distanceKm));
    const covLevel  = scoreToLevel(knowledge.coverageScore);

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="m-3 rounded-xl border border-zinc-800 bg-[#1e0d2e] px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">POIs within 1.5 km</span>
            <span className="text-xl font-bold tabular-nums text-zinc-200">{total}</span>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-2">
            <span>Nearest: {nearest < 1 ? `${Math.round(nearest * 1000)} m` : `${nearest.toFixed(2)} km`}</span>
            <ConfidenceDot level={covLevel} showLabel />
            {deduped > 0 && (
              <span className="text-zinc-700">{deduped} duplicates removed</span>
            )}
          </p>
        </div>
        <OSMNearbyContent pois={knowledge.pois} />
      </div>
    );
  }

  // Fallback: placeholder engine data
  const byCategory = new Map<POICategory, POIRecord[]>();
  for (const poi of poiRecords) {
    if (!byCategory.has(poi.category)) byCategory.set(poi.category, []);
    byCategory.get(poi.category)!.push(poi);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="m-3 rounded-xl border border-zinc-800 bg-[#1e0d2e] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Total POIs within 3 km</span>
          <span className="text-xl font-bold tabular-nums text-zinc-200">{poiSummary.totalCount}</span>
        </div>
        {poiSummary.nearestDistanceKm >= 0 && (
          <p className="text-[11px] text-zinc-600 mt-1">
            Nearest: {poiSummary.nearestDistanceKm.toFixed(2)} km
            <span className="ml-2 text-zinc-700">● Estimated data</span>
          </p>
        )}
      </div>

      <div className="px-4 pb-4">
        {PLACE_GROUPS.map((group) => {
          if (group.placeholder) {
            return <PlaceholderGroup key={group.heading} heading={group.heading} icon={group.icon} />;
          }
          const groupPOIs: POIRecord[] = [];
          for (const cat of group.categories) {
            groupPOIs.push(...(byCategory.get(cat) ?? []));
          }
          if (groupPOIs.length === 0) return null;
          return (
            <div key={group.heading} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{group.icon}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">{group.heading}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-600">{groupPOIs.length}</span>
              </div>
              <div className="pl-6">
                {groupPOIs.slice(0, 5).map((poi) => (
                  <PlaceItem key={poi.id} poi={poi} />
                ))}
                {groupPOIs.length > 5 && (
                  <p className="text-[11px] text-zinc-600 pt-1">+{groupPOIs.length - 5} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NearbyPlacesTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis) return null;
  return <NearbyContent analysis={analysis} />;
}
