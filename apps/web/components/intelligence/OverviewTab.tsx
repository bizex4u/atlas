'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import { scoreToLevel } from '@/lib/intelligence/confidence';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{children}</p>;
}

function SignalBar({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
    score >= 45 ? 'bg-gradient-to-r from-amber-400  to-amber-500'   :
                  'bg-gradient-to-r from-red-400     to-red-500';
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
}

function StatGrid({ analysis }: { analysis: LocationAnalysis }) {
  const pop    = analysis.catchmentRecord.estimatedPopulation;
  const popLow = Math.round((pop * 0.6) / 5000) * 5000;
  const popHi  = Math.round((pop * 1.4) / 5000) * 5000;
  const comp   = analysis.competitionSummary.competitorsWithin5Km;
  const sat    = Math.round(analysis.competitionSummary.saturationIndex * 100);
  const rd     = analysis.roadNetwork.connectivityScore;

  const stats = [
    {
      label: 'Catchment',
      value: `${Math.round(popLow/1000)}k–${Math.round(popHi/1000)}k`,
      sub: 'residents · 2 km radius',
      valueClass: 'text-gray-900',
    },
    {
      label: 'Competitors',
      value: String(comp),
      sub: comp === 0 ? 'clear field' : `nearest ${analysis.competitionSummary.nearestCompetitorKm.toFixed(1)} km`,
      valueClass: comp === 0 ? 'text-emerald-600' : comp <= 3 ? 'text-amber-600' : 'text-red-600',
    },
    {
      label: 'Saturation',
      value: `${sat}%`,
      sub: sat < 30 ? 'low — opportunity' : sat < 60 ? 'moderate' : 'high — crowded',
      valueClass: sat < 30 ? 'text-emerald-600' : sat < 60 ? 'text-amber-600' : 'text-red-600',
    },
    {
      label: 'Road Score',
      value: String(rd),
      sub: 'connectivity index',
      valueClass: rd >= 70 ? 'text-emerald-600' : rd >= 45 ? 'text-amber-600' : 'text-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <Card key={s.label} className="p-3.5">
          <SectionLabel>{s.label}</SectionLabel>
          <p className={`text-[24px] font-black leading-none tabular-nums ${s.valueClass}`}>{s.value}</p>
          <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">{s.sub}</p>
        </Card>
      ))}
    </div>
  );
}

function DecisionCard({ analysis }: { analysis: LocationAnalysis }) {
  const setActiveTab = usePanelStore((s) => s.setActiveTab);
  const score = analysis.attentionResult.compositeScore;

  const verdict =
    score >= 80 ? 'Strong Buy' : score >= 65 ? 'Buy' :
    score >= 50 ? 'Hold'       : score >= 35 ? 'Weak' : 'Avoid';

  const verdictStyle =
    score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    score >= 65 ? 'text-[#6B21A8]   bg-purple-50  border-purple-200'  :
    score >= 50 ? 'text-amber-700   bg-amber-50   border-amber-200'   :
                  'text-red-700     bg-red-50     border-red-200';

  const mob      = analysis.knowledge?.mobility;
  const audience = mob?.trafficDrivers?.length
    ? mob.trafficDrivers.slice(0, 3).join(' · ')
    : analysis.attentionResult.tier === 'High'   ? 'High-density consumer area'
    : analysis.attentionResult.tier === 'Medium' ? 'Mixed residential & commercial'
    : 'Primarily residential';

  const signals = [...(analysis.knowledge?.advertisingSignals.slice(0, 3) ?? [])];
  if (signals.length === 0 && score >= 65) signals.push('Strong composite attention score');
  const c = analysis.competitionSummary.competitorsWithin5Km;
  if (signals.length < 3) signals.push(c === 0 ? 'No competitors within 5 km' : `${c} competitor${c > 1 ? 's' : ''} within 5 km`);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <SectionLabel>Recommendation</SectionLabel>
          <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-[13px] font-bold ${verdictStyle}`}>
            {verdict}
          </span>
        </div>
        <button
          onClick={() => setActiveTab('ai-summary')}
          className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-[10px] font-semibold text-[#6B21A8] hover:bg-purple-100 transition-colors shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Full AI Brief
        </button>
      </div>

      <div className="mb-3">
        <SectionLabel>Primary Audience</SectionLabel>
        <p className="text-[12px] text-gray-700 leading-relaxed font-medium">{audience}</p>
      </div>

      {signals.length > 0 && (
        <>
          <SectionLabel>Key Signals</SectionLabel>
          <ul className="space-y-1.5">
            {signals.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6B21A8] shrink-0" />
                <span className="text-[11px] text-gray-500 leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function SignalBreakdown({ analysis }: { analysis: LocationAnalysis }) {
  return (
    <Card className="p-4">
      <SectionLabel>Signal Breakdown</SectionLabel>
      <div className="space-y-3.5">
        {analysis.attentionResult.signals.map((sig) => (
          <div key={sig.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-gray-700">{sig.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">{Math.round(sig.weight * 100)}% wt</span>
                <span className={`text-[13px] font-black tabular-nums ${
                  sig.score >= 70 ? 'text-emerald-600' :
                  sig.score >= 45 ? 'text-amber-600'   : 'text-red-600'
                }`}>{sig.score}</span>
              </div>
            </div>
            <SignalBar score={sig.score} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function LocationDetails({ analysis }: { analysis: LocationAnalysis }) {
  const loc = analysis.knowledge?.location;
  const rows: { k: string; v: string; mono?: boolean }[] = [];
  if (analysis.dealer) rows.push({ k: 'Store', v: analysis.dealer.storeName });
  const locality = analysis.pincodeRecord?.locality ?? loc?.suburb;
  if (locality) rows.push({ k: 'Locality', v: locality });
  if (loc?.neighbourhood) rows.push({ k: 'Neighbourhood', v: loc.neighbourhood });
  rows.push({ k: 'City', v: analysis.city });
  const state = loc?.state ?? analysis.pincodeRecord?.state;
  if (state) rows.push({ k: 'State', v: state });
  rows.push({ k: 'Pincode', v: analysis.pincode, mono: true });
  const areaType = analysis.knowledge?.areaClassification.areaType;
  if (areaType && areaType !== 'Unknown') rows.push({ k: 'Area Type', v: areaType });
  rows.push({ k: 'Coordinates', v: `${analysis.lngLat.lat.toFixed(5)}, ${analysis.lngLat.lng.toFixed(5)}`, mono: true });

  return (
    <Card className="overflow-hidden">
      <div className="px-4 pt-3.5 pb-1">
        <SectionLabel>Location Details</SectionLabel>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map(({ k, v, mono }) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5 gap-3">
            <span className="text-[11px] text-gray-400 shrink-0">{k}</span>
            <span className={`text-[11px] text-right ${mono ? 'font-mono text-gray-500 text-[10px]' : 'font-semibold text-gray-700'}`}>{v}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="p-3 space-y-3">
      <div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
      <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  );
}

function OverviewContent({ analysis }: { analysis: LocationAnalysis }) {
  const coverageLevel  = analysis.knowledge ? scoreToLevel(analysis.knowledge.coverageScore) : 'none';
  const coverageReason = analysis.knowledge?.coverageReason ?? '';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-3 pb-6">
        {coverageLevel !== 'high' && coverageLevel !== 'none' && (
          <div className={`rounded-xl border px-3 py-2 text-[10px] leading-relaxed ${
            coverageLevel === 'medium'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}>
            OSM coverage: <span className="font-semibold capitalize">{coverageLevel}</span>
            {coverageReason ? ` — ${coverageReason}` : ''}
          </div>
        )}
        <DecisionCard analysis={analysis} />
        <StatGrid analysis={analysis} />
        <SignalBreakdown analysis={analysis} />
        <LocationDetails analysis={analysis} />
      </div>
    </div>
  );
}

export function OverviewTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis)  return null;
  return <OverviewContent analysis={analysis} />;
}
