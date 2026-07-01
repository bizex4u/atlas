'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import type { RoadClass } from '@/lib/intelligence/types';
import { scoreToLevel } from '@/lib/intelligence/confidence';
import { CoverageBanner } from '@/components/intelligence/ConfidenceBadge';

function MetricCard({
  label, value, sub, accent = false,
}: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#1e0d2e] p-3">
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${accent ? 'text-[#B794F4]' : 'text-zinc-200'}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-zinc-400">{label}</span>
        <span className="text-[11px] font-mono text-zinc-300">{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const CLASS_LABELS: Record<RoadClass, string> = {
  highway:  'National / State Highway',
  arterial: 'Arterial Road',
  collector:'Collector Road',
  local:    'Local Road',
};

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded bg-zinc-800 animate-pulse" />)}
    </div>
  );
}

function deriveTrafficLevel(road: LocationAnalysis['roadNetwork']): string {
  if (road.roadClasses.includes('highway'))  return 'High — major arterial traffic expected';
  if (road.roadClasses.includes('arterial')) return 'Moderate — steady flow through peak hours';
  if (road.roadClasses.includes('collector'))return 'Low-Moderate — neighbourhood collector street';
  return 'Low — primarily local residential traffic';
}

function derivePeakHours(road: LocationAnalysis['roadNetwork']): string {
  if (road.roadClasses.includes('highway') || road.roadClasses.includes('arterial')) {
    return '8–10 AM, 5–8 PM (weekdays)';
  }
  return '9–11 AM, 4–7 PM (weekdays)';
}

function MobilityContent({ analysis }: { analysis: LocationAnalysis }) {
  const { roadNetwork, knowledge } = analysis;
  const mob = knowledge?.mobility;

  // Prefer OSM mobility data; fall back to placeholder engine
  const walkabilityScore = mob?.walkabilityScore
    ?? Math.min(100, Math.round(
        ((analysis.populationRecord?.densityPerKm2 ?? 5000) / 500) +
        analysis.poiSummary.totalCount * 2,
       ));
  const transitScore     = mob?.transitScore ?? 0;
  const roadScore        = mob?.roadConnectivityScore ?? roadNetwork.connectivityScore;

  const traffic   = mob ? `${mob.transitLevel} transit · ${mob.walkabilityLevel} walkability` : deriveTrafficLevel(roadNetwork);
  const peakHours = mob?.peakActivity ?? derivePeakHours(roadNetwork);
  const weekend   = mob?.weekendActivity;
  const drivers   = mob?.trafficDrivers ?? [];

  const osmRoadClasses = mob?.roadClasses ?? [];
  const legacyClasses  = roadNetwork.roadClasses;

  const covLevel  = analysis.knowledge ? scoreToLevel(analysis.knowledge.coverageScore) : 'none';
  const covReason = analysis.knowledge?.coverageReason ?? 'No OSM data';

  return (
    <div className="flex-1 overflow-y-auto">
      <CoverageBanner level={covLevel} reason={covReason} />
      <div className="m-3 grid grid-cols-2 gap-2">
        <MetricCard
          label="Connectivity"
          value={`${roadScore}/100`}
          sub={mob ? 'OSM road score' : 'Road graph score'}
          accent
        />
        <MetricCard
          label="Highway Proximity"
          value={`${roadNetwork.nearestHighwayKm.toFixed(1)} km`}
          sub="Nearest NH/SH"
        />
      </div>

      <section className="px-4 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-1">Scores</p>
        <div className="space-y-3">
          <ScoreGauge score={roadScore}         label="Road Connectivity"    />
          <ScoreGauge score={walkabilityScore}  label={mob ? 'Walkability (OSM)' : 'Walkability (est.)'} />
          <ScoreGauge score={transitScore}      label={mob ? 'Transit (OSM)' : 'Transit Accessibility'} />
          <ScoreGauge score={roadNetwork.accessScore} label="Road Access" />
        </div>
      </section>

      {/* Road Network — prefer OSM classes */}
      <section className="px-4 pb-4 border-t border-zinc-800">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-3">Road Network</p>
        <div className="space-y-2">
          {osmRoadClasses.length > 0
            ? osmRoadClasses.map((cls) => (
                <div key={cls} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#B794F4] shrink-0" />
                  <span className="text-[11px] text-zinc-300 capitalize">{cls.replace(/_/g, ' ')} road</span>
                </div>
              ))
            : legacyClasses.map((cls) => (
                <div key={cls} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#B794F4] shrink-0" />
                  <span className="text-[11px] text-zinc-300">{CLASS_LABELS[cls]}</span>
                </div>
              ))}
        </div>
      </section>

      <section className="px-4 pb-4 border-t border-zinc-800">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3 pt-3">Traffic Intelligence</p>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-zinc-600 mb-1">Traffic Level</p>
            <p className="text-[11px] text-zinc-300">{traffic}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 mb-1">Peak Hours</p>
            <p className="text-[11px] text-zinc-300">{peakHours}</p>
          </div>
          {weekend && (
            <div>
              <p className="text-[10px] text-zinc-600 mb-1">Weekend Activity</p>
              <p className="text-[11px] text-zinc-300">{weekend}</p>
            </div>
          )}
          {drivers.length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-600 mb-1">Traffic Drivers</p>
              <p className="text-[11px] text-zinc-300">{drivers.join(' · ')}</p>
            </div>
          )}
          {!mob && (
            <p className="text-[10px] text-zinc-700 italic mt-2">
              Figures derived from road class — OSM data unavailable.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function MobilityTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis) return null;
  return <MobilityContent analysis={analysis} />;
}
