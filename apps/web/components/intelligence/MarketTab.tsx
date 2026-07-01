'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import type { NightlightsResult } from '@/lib/intelligence/providers/NightlightsProvider';
import type { TransitIntelligence, TransitMode } from '@/lib/intelligence/providers/TransitProvider';

// ─── Shared ───────────────────────────────────────────────────────────────────

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800/60 last:border-0">
      <span className="text-[11px] text-zinc-500 shrink-0">{label}</span>
      <div className="text-right">
        <span className="text-[11px] text-zinc-200 font-medium">{value}</span>
        {sub && <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ScoreBar({ score, color = 'bg-[#6B21A8]' }: { score: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-[#1e0d2e] p-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 pt-1">{children}</p>;
}

// ─── Nightlights card ─────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, { text: string; bar: string; badge: string }> = {
  'Very High': { text: 'text-emerald-400', bar: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-800' },
  'High':      { text: 'text-[#B794F4]',   bar: 'bg-[#6B21A8]',  badge: 'text-[#B794F4] bg-[#6B21A8]/20 border-[#3d1a54]' },
  'Medium':    { text: 'text-yellow-400',   bar: 'bg-yellow-500', badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-800' },
  'Low':       { text: 'text-zinc-400',     bar: 'bg-zinc-600',   badge: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
  'Minimal':   { text: 'text-zinc-600',     bar: 'bg-zinc-700',   badge: 'text-zinc-600 bg-zinc-900 border-zinc-800' },
};

function NightlightsCard({ data }: { data: NightlightsResult }) {
  const c = TIER_COLOR[data.economicTier] ?? TIER_COLOR['Low'];
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Economic Activity</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">NASA VIIRS nighttime lights</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold tabular-nums ${c.text}`}>{data.economicScore}</span>
          <span className="text-[11px] text-zinc-600">/100</span>
        </div>
      </div>
      <ScoreBar score={data.economicScore} color={c.bar} />
      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${c.badge}`}>
          {data.economicTier}
        </span>
        <span className="text-[10px] text-zinc-600">Purchasing power proxy</span>
      </div>
      <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{data.label}</p>
    </Card>
  );
}

function NightlightsPlaceholder() {
  return (
    <Card>
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Economic Activity</p>
      <p className="text-[11px] text-zinc-700 italic">NASA VIIRS data unavailable — check network or CORS</p>
    </Card>
  );
}

// ─── Transit card ─────────────────────────────────────────────────────────────

const MODE_ICON: Record<TransitMode, string> = {
  metro:         '🚇',
  suburban_rail: '🚆',
  bus:           '🚌',
  tram:          '🚊',
  ferry:         '⛴️',
  other:         '🚏',
};

const MODE_LABEL: Record<TransitMode, string> = {
  metro:         'Metro',
  suburban_rail: 'Suburban Rail',
  bus:           'Bus',
  tram:          'Tram',
  ferry:         'Ferry',
  other:         'Other',
};

const TRANSIT_TIER_COLOR: Record<string, { text: string; bar: string }> = {
  'Excellent': { text: 'text-emerald-400', bar: 'bg-emerald-500' },
  'Good':      { text: 'text-[#B794F4]',   bar: 'bg-[#6B21A8]'  },
  'Moderate':  { text: 'text-yellow-400',   bar: 'bg-yellow-500' },
  'Poor':      { text: 'text-zinc-400',     bar: 'bg-zinc-600'   },
  'None':      { text: 'text-zinc-600',     bar: 'bg-zinc-700'   },
};

function TransitCard({ data }: { data: TransitIntelligence }) {
  const c      = TRANSIT_TIER_COLOR[data.connectivityTier] ?? TRANSIT_TIER_COLOR['None'];
  const modes  = (Object.entries(data.byMode) as [TransitMode, number][]).filter(([, n]) => n > 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">Transit Connectivity</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {data.isReal ? 'Transitland live data' : 'Estimated from OSM'}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold tabular-nums ${c.text}`}>{data.connectivityScore}</span>
          <span className="text-[11px] text-zinc-600">/100</span>
        </div>
      </div>
      <ScoreBar score={data.connectivityScore} color={c.bar} />

      {/* Mode breakdown */}
      {modes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {modes.map(([mode, count]) => (
            <span key={mode} className="inline-flex items-center gap-1 text-[10px] bg-zinc-800/60 border border-zinc-700 rounded-full px-2 py-0.5 text-zinc-300">
              {MODE_ICON[mode]} {count} {MODE_LABEL[mode]}
            </span>
          ))}
        </div>
      )}

      {/* Nearest stops */}
      {data.nearestStops.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {data.nearestStops.slice(0, 3).map((stop) => (
            <div key={stop.id} className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-300 truncate max-w-[60%]">
                {MODE_ICON[stop.mode]} {stop.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                {stop.distanceKm < 1
                  ? `${Math.round(stop.distanceKm * 1000)} m`
                  : `${stop.distanceKm.toFixed(1)} km`}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed border-t border-zinc-800 pt-2">
        {data.commuterProfile}
      </p>

      {data.agencies.length > 0 && (
        <p className="text-[10px] text-zinc-700 mt-1">
          Agencies: {data.agencies.join(', ')}
        </p>
      )}
    </Card>
  );
}

function TransitPlaceholder() {
  return (
    <Card>
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Transit Connectivity</p>
      <p className="text-[11px] text-zinc-700 italic">Transitland data unavailable</p>
    </Card>
  );
}

// ─── Combined economic snapshot ───────────────────────────────────────────────

function EconomicSnapshot({ analysis }: { analysis: LocationAnalysis }) {
  const nl   = analysis.knowledge?.nightlights;
  const tr   = analysis.knowledge?.transit;
  const pop  = analysis.catchmentRecord.estimatedPopulation;
  const popL = Math.round((pop * 0.6) / 5000) * 5000;
  const popH = Math.round((pop * 1.4) / 5000) * 5000;

  return (
    <Card className="mb-0">
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">Market Snapshot</p>
      <Row
        label="Catchment Population"
        value={`~${popL.toLocaleString()}–${popH.toLocaleString()}`}
        sub="Density model · ±40% margin"
      />
      {nl && (
        <Row
          label="Economic Activity"
          value={`${nl.economicScore}/100 · ${nl.economicTier}`}
          sub="NASA VIIRS nighttime lights"
        />
      )}
      {tr && tr.stopCount > 0 && (
        <Row
          label="Transit Stops"
          value={`${tr.stopCount} within 1.5 km`}
          sub={`Score ${tr.connectivityScore}/100 · ${tr.connectivityTier}`}
        />
      )}
      <Row
        label="POI Density"
        value={`${analysis.knowledge?.poiSummary.total ?? analysis.poiSummary.totalCount} places`}
        sub="OSM · within 1.5 km"
      />
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-zinc-800/60 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function MarketContent({ analysis }: { analysis: LocationAnalysis }) {
  const nl = analysis.knowledge?.nightlights;
  const tr = analysis.knowledge?.transit;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="m-3 space-y-3">
        <EconomicSnapshot analysis={analysis} />

        <div>
          <SectionLabel>Economic Intelligence · NASA Satellite</SectionLabel>
          {nl ? <NightlightsCard data={nl} /> : <NightlightsPlaceholder />}
        </div>

        <div>
          <SectionLabel>Transit Intelligence · Transitland</SectionLabel>
          {tr ? <TransitCard data={tr} /> : <TransitPlaceholder />}
        </div>

        <p className="text-[10px] text-zinc-700 italic pb-2">
          Economic activity: NASA VIIRS Black Marble 2024 · Transit: Transitland v2 (open data)
        </p>
      </div>
    </div>
  );
}

export function MarketTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis)  return null;
  return <MarketContent analysis={analysis} />;
}
