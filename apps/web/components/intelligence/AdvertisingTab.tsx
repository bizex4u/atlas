'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import { scoreToLevel } from '@/lib/intelligence/confidence';
import { CoverageBanner } from '@/components/intelligence/ConfidenceBadge';

function OpportunityCard({
  title, score, channel, description,
}: { title: string; score: number; channel: string; description: string }) {
  const tier       = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low';
  const color      = score >= 70 ? 'text-emerald-400' : score >= 45 ? 'text-yellow-400' : 'text-zinc-500';
  const barColor   = score >= 70 ? 'bg-emerald-500'   : score >= 45 ? 'bg-yellow-500'   : 'bg-zinc-600';
  const borderColor = score >= 70 ? 'border-emerald-900' : score >= 45 ? 'border-yellow-900' : 'border-zinc-800';
  return (
    <div className={`rounded-lg border ${borderColor} bg-[#1e0d2e] p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-medium text-zinc-200">{title}</p>
          <p className="text-[10px] text-zinc-600">{channel}</p>
        </div>
        <span className={`text-sm font-semibold uppercase tracking-wide ${color}`}>{tier}</span>
      </div>
      <div className="h-1 rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Recommendation card ─────────────────────────────────────────────────────

interface Recommendation {
  stars: number;        // 1–5
  label: string;
  reasons: string[];
}

function deriveRecommendation(analysis: LocationAnalysis): Recommendation {
  const { attentionResult, catchmentRecord, competitionSummary, poiSummary, knowledge } = analysis;
  const score      = attentionResult.compositeScore;
  const pop        = catchmentRecord.estimatedPopulation;
  const saturation = competitionSummary.saturationIndex;
  const competitor = competitionSummary.competitorsWithin5Km;

  // Prefer real OSM advertising signals when available
  const osmSignals = knowledge?.advertisingSignals ?? [];
  if (osmSignals.length > 0) {
    const stars = score >= 80 ? 5 : score >= 65 ? 4 : score >= 50 ? 3 : score >= 35 ? 2 : 1;
    const label =
      stars === 5 ? 'Strong Recommendation' :
      stars === 4 ? 'Good Recommendation'   :
      stars === 3 ? 'Moderate Opportunity'  :
      stars === 2 ? 'Weak Opportunity'      :
                    'Not Recommended';
    return { stars, label, reasons: osmSignals.slice(0, 5) };
  }

  // Fallback: derive from placeholder data
  const pois       = poiSummary.totalCount;
  const reasons: string[] = [];

  if (pois >= 8)          reasons.push('High electronics retail density');
  else if (pois >= 4)     reasons.push('Moderate retail POI density');
  if (pop >= 25000)       reasons.push('Strong residential catchment');
  else if (pop >= 10000)  reasons.push('Moderate residential catchment');
  if (pois >= 5)          reasons.push('Large weekend shopping audience');
  if (competitor > 0)     reasons.push('Existing dealer nearby');
  if (competitor === 0)   reasons.push('No direct competition within 5 km');
  if (saturation > 0.5)   reasons.push('High commercial activity');
  else if (saturation > 0.25) reasons.push('Moderate commercial activity');
  if (reasons.length < 3) reasons.push('Measurable catchment population');

  const stars = score >= 80 ? 5 : score >= 65 ? 4 : score >= 50 ? 3 : score >= 35 ? 2 : 1;
  const label =
    stars === 5 ? 'Strong Recommendation' :
    stars === 4 ? 'Good Recommendation'   :
    stars === 3 ? 'Moderate Opportunity'  :
    stars === 2 ? 'Weak Opportunity'      :
                  'Not Recommended';
  return { stars, label, reasons: reasons.slice(0, 5) };
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const starColor = rec.stars >= 4 ? 'text-amber-400' : rec.stars === 3 ? 'text-yellow-500' : 'text-zinc-600';
  const labelColor = rec.stars >= 4 ? 'text-emerald-400' : rec.stars === 3 ? 'text-yellow-400' : 'text-red-400';
  const borderColor = rec.stars >= 4 ? 'border-emerald-900' : rec.stars === 3 ? 'border-yellow-900' : 'border-zinc-800';

  return (
    <div className={`mx-3 mt-3 mb-1 rounded-xl border ${borderColor} bg-[#1e0d2e] p-4`}>
      {/* Stars + label */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-sm tracking-tight ${starColor}`}>
          {'★'.repeat(rec.stars)}{'☆'.repeat(5 - rec.stars)}
        </span>
        <span className={`text-[11px] font-semibold ${labelColor}`}>{rec.label}</span>
      </div>

      {/* Reason list */}
      <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 mt-3">Reason</p>
      <ul className="space-y-1.5">
        {rec.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-0.5 shrink-0 text-[10px] ${starColor}`}>●</span>
            <span className="text-[11px] text-zinc-300 leading-relaxed">{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded bg-zinc-800 animate-pulse" />)}
    </div>
  );
}

function deriveAdScores(analysis: LocationAnalysis) {
  const { attentionResult, catchmentRecord, competitionSummary, roadNetwork, poiSummary, knowledge } = analysis;
  const base = attentionResult.compositeScore;
  const pop = catchmentRecord.estimatedPopulation;
  const saturation = competitionSummary.saturationIndex;
  // Prefer OSM road connectivity score when available
  const connectivity = knowledge?.mobility.roadConnectivityScore ?? roadNetwork.connectivityScore;
  const pois = knowledge?.poiSummary.total ?? poiSummary.totalCount;

  // OOH: foot traffic + road access
  const ooh = Math.min(100, Math.round(
    0.4 * connectivity +
    0.3 * (Math.min(pop, 50000) / 500) +
    0.2 * (pois * 2) +
    0.1 * (100 - saturation * 100)
  ));

  // Digital Hyperlocal: density + low competition
  const digital = Math.min(100, Math.round(
    0.5 * base +
    0.3 * (100 - saturation * 100) +
    0.2 * (Math.min(pop, 50000) / 500)
  ));

  // Influencer / Events: POI richness
  const events = Math.min(100, Math.round(
    0.5 * (pois * 3) +
    0.3 * (Math.min(pop, 50000) / 500) +
    0.2 * base
  ));

  // Radio / FM: broad reach = population + road access
  const radio = Math.min(100, Math.round(
    0.5 * connectivity +
    0.3 * (Math.min(pop, 50000) / 500) +
    0.2 * base
  ));

  return { ooh, digital, events, radio };
}

function AdvertisingContent({ analysis }: { analysis: LocationAnalysis }) {
  const scores = deriveAdScores(analysis);
  const rec    = deriveRecommendation(analysis);
  const tier   = analysis.attentionResult.tier;

  // Population is from a density-model estimate, not census — show honest range (±40%)
  const popMid  = analysis.catchmentRecord.estimatedPopulation;
  const popLow  = Math.round((popMid * 0.6) / 5000) * 5000;
  const popHigh = Math.round((popMid * 1.4) / 5000) * 5000;
  const popRange = `${popLow.toLocaleString()}–${popHigh.toLocaleString()}`;

  const covLevel  = analysis.knowledge ? scoreToLevel(analysis.knowledge.coverageScore) : 'none';
  const covReason = analysis.knowledge?.coverageReason ?? 'No OSM data';

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Recommendation card */}
      <RecommendationCard rec={rec} />

      {/* OSM coverage quality — informs channel score confidence */}
      <CoverageBanner level={covLevel} reason={`Channel scores based on: ${covReason.toLowerCase()}`} />

      {/* Header summary */}
      <div className="m-3 rounded-xl border border-zinc-800 bg-[#1e0d2e] px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Estimated Reach</p>
        <p className="text-lg font-bold text-zinc-200">~{popRange} <span className="text-[12px] font-normal text-zinc-500">residents within 2 km</span></p>
        <p className="text-[10px] text-zinc-700 mt-0.5 mb-1">Population density model · ±40% margin</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          {tier} opportunity tier — {
            tier === 'High'   ? 'strong case for multi-channel investment' :
            tier === 'Medium' ? 'selective channel focus recommended' :
                                'targeted niche approach advised'
          }
        </p>
      </div>

      {/* Channel cards */}
      <div className="px-3 pb-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 pt-1">Channel Opportunity Scores</p>

        <OpportunityCard
          title="Out-of-Home (OOH)"
          channel="Hoardings, Gantries, Bus Shelters"
          score={scores.ooh}
          description={
            scores.ooh >= 70
              ? 'High foot and vehicle traffic — premium OOH placement expected to deliver strong impressions.'
              : scores.ooh >= 45
              ? 'Moderate traffic volume — OOH viable on arterial stretches.'
              : 'Limited traffic density — OOH ROI may not justify premium placement.'
          }
        />

        <OpportunityCard
          title="Digital Hyperlocal"
          channel="Meta, Google, Programmatic"
          score={scores.digital}
          description={
            scores.digital >= 70
              ? 'High density + low competition — hyperlocal digital ads can dominate at low CPMs.'
              : scores.digital >= 45
              ? 'Mid-range density — digital viable with careful audience segmentation.'
              : 'Low density or saturated market — digital may face higher CPMs without differentiation.'
          }
        />

        <OpportunityCard
          title="Events & Activations"
          channel="Pop-ups, Sampling, Sponsorships"
          score={scores.events}
          description={
            scores.events >= 70
              ? 'POI-rich area with malls, transit, and schools — excellent activation footprint.'
              : scores.events >= 45
              ? 'Some POI anchors available — targeted activations can work.'
              : 'Few POI anchors — activation reach likely limited to residents only.'
          }
        />

        <OpportunityCard
          title="Radio / Audio"
          channel="FM, Programmatic Audio"
          score={scores.radio}
          description={
            scores.radio >= 70
              ? 'High connectivity zone — large commuter audience for radio in-car and transit.'
              : scores.radio >= 45
              ? 'Moderate commuter flow — radio viable as a supporting channel.'
              : 'Local streets dominate — radio reach limited without major arterial coverage.'
          }
        />
      </div>

      <div className="px-3 pb-4">
        <p className="text-[10px] text-zinc-700 italic">
          Scores are derived from catchment population, road connectivity, POI density, and competition saturation. Real CPM and reach data requires media-buy integration.
        </p>
      </div>
    </div>
  );
}

export function AdvertisingTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis) return null;
  return <AdvertisingContent analysis={analysis} />;
}
