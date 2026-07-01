'use client';

import { type SavedLocation } from '@/lib/stores/savedLocationsStore';

interface Props {
  a:       SavedLocation;
  b:       SavedLocation;
  onClose: () => void;
}

function ring(score: number, tier: string) {
  const r    = 32;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const stroke = tier === 'High' ? '#10b981' : tier === 'Medium' ? '#f59e0b' : '#ef4444';
  const track  = tier === 'High' ? '#d1fae5' : tier === 'Medium' ? '#fef3c7' : '#fee2e2';
  return { r, circ, fill, stroke, track };
}

function ScoreRing({ score, tier }: { score: number; tier: string }) {
  const { r, circ, fill, stroke, track } = ring(score, tier);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke={track} strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={stroke} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-black text-gray-900 tabular-nums leading-none">{score}</span>
        <span className="text-[8px] text-gray-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

interface Metric {
  label:  string;
  aVal:   string | number;
  bVal:   string | number;
  aNum:   number;   // for winner calc — higher = better unless inverted
  bNum:   number;
  invert?: boolean; // true = lower is better
}

function MetricRow({ m }: { m: Metric }) {
  const aWins = m.invert ? m.aNum < m.bNum : m.aNum > m.bNum;
  const bWins = m.invert ? m.bNum < m.aNum : m.bNum > m.aNum;
  const tie   = m.aNum === m.bNum;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 border-b border-gray-50 last:border-0">
      {/* A value */}
      <div className={`text-right text-[12px] font-bold ${aWins && !tie ? 'text-emerald-600' : 'text-gray-500'}`}>
        {m.aVal}
        {aWins && !tie && <span className="ml-1 text-[9px]">▲</span>}
      </div>
      {/* Label */}
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 text-center whitespace-nowrap px-1">
        {m.label}
      </div>
      {/* B value */}
      <div className={`text-left text-[12px] font-bold ${bWins && !tie ? 'text-emerald-600' : 'text-gray-500'}`}>
        {bWins && !tie && <span className="mr-1 text-[9px]">▲</span>}
        {m.bVal}
      </div>
    </div>
  );
}

function verdict(score: number) {
  return score >= 80 ? 'Strong Buy' : score >= 65 ? 'Buy' : score >= 50 ? 'Hold' : score >= 35 ? 'Weak' : 'Avoid';
}

function verdictColor(score: number) {
  return score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
         score >= 65 ? 'text-[#6B21A8] bg-purple-50 border-purple-200' :
         score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                       'text-red-700 bg-red-50 border-red-200';
}

export function CompareModal({ a, b, onClose }: Props) {
  const aA = a.analysis;
  const bA = b.analysis;

  const aScore = aA.attentionResult.compositeScore;
  const bScore = bA.attentionResult.compositeScore;

  const aPop = aA.catchmentRecord.estimatedPopulation;
  const bPop = bA.catchmentRecord.estimatedPopulation;
  const aComp = aA.competitionSummary.competitorsWithin5Km;
  const bComp = bA.competitionSummary.competitorsWithin5Km;
  const aSat  = Math.round(aA.competitionSummary.saturationIndex * 100);
  const bSat  = Math.round(bA.competitionSummary.saturationIndex * 100);
  const aRoad = aA.roadNetwork.connectivityScore;
  const bRoad = bA.roadNetwork.connectivityScore;
  const aNL   = aA.knowledge?.nightlights?.economicScore ?? 0;
  const bNL   = bA.knowledge?.nightlights?.economicScore ?? 0;
  const aTr   = aA.knowledge?.transit?.connectivityScore ?? aA.knowledge?.mobility?.transitScore ?? 0;
  const bTr   = bA.knowledge?.transit?.connectivityScore ?? bA.knowledge?.mobility?.transitScore ?? 0;
  const aWalk = aA.knowledge?.mobility?.walkabilityScore ?? 0;
  const bWalk = bA.knowledge?.mobility?.walkabilityScore ?? 0;

  const metrics: Metric[] = [
    { label: 'Attention Score',   aVal: aScore,                     bVal: bScore,                     aNum: aScore, bNum: bScore },
    { label: 'Catchment Pop',     aVal: `${Math.round(aPop/1000)}k`, bVal: `${Math.round(bPop/1000)}k`, aNum: aPop,   bNum: bPop },
    { label: 'Competitors',       aVal: aComp,                      bVal: bComp,                      aNum: aComp,  bNum: bComp,  invert: true },
    { label: 'Market Saturation', aVal: `${aSat}%`,                 bVal: `${bSat}%`,                 aNum: aSat,   bNum: bSat,   invert: true },
    { label: 'Road Network',      aVal: aRoad,                      bVal: bRoad,                      aNum: aRoad,  bNum: bRoad },
    { label: 'Economic Activity', aVal: aNL || '—',                 bVal: bNL || '—',                 aNum: aNL,    bNum: bNL },
    { label: 'Transit Score',     aVal: aTr || '—',                 bVal: bTr || '—',                 aNum: aTr,    bNum: bTr },
    { label: 'Walkability',       aVal: aWalk || '—',               bVal: bWalk || '—',               aNum: aWalk,  bNum: bWalk },
  ];

  // Overall winner
  const aWins = metrics.filter((m) => m.invert ? m.aNum < m.bNum : m.aNum > m.bNum).length;
  const bWins = metrics.filter((m) => m.invert ? m.bNum < m.aNum : m.bNum > m.aNum).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-[13px] font-bold text-gray-900">Location Comparison</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Location headers */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 bg-gray-50/50">
          {[{ loc: a, score: aScore, wins: aWins }, { loc: b, score: bScore, wins: bWins }].map(({ loc, score, wins }, i) => {
            const tier = loc.analysis.attentionResult.tier;
            const isWinner = (i === 0 ? aWins : bWins) > (i === 0 ? bWins : aWins);
            return (
              <div key={i} className={`flex flex-col items-center gap-2 p-5 ${isWinner ? 'bg-purple-50/60' : ''}`}>
                {isWinner && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B21A8] bg-purple-100 rounded-full px-2.5 py-0.5">
                    ★ Better Pick
                  </span>
                )}
                <ScoreRing score={score} tier={tier} />
                <div className="text-center">
                  <p className="text-[12px] font-bold text-gray-900 leading-tight">{loc.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {[loc.analysis.knowledge?.location?.city, loc.analysis.pincode].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className={`text-[10px] font-bold border rounded-xl px-2.5 py-0.5 ${verdictColor(score)}`}>
                  {verdict(score)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metrics */}
        <div className="px-6 py-2 max-h-[340px] overflow-y-auto">
          {metrics.map((m) => <MetricRow key={m.label} m={m} />)}
        </div>

        {/* Summary */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-500 text-center">
            <span className="font-bold text-gray-700">{a.label}</span>
            {' wins '}<span className="text-[#6B21A8] font-bold">{aWins}</span> metrics ·{' '}
            <span className="font-bold text-gray-700">{b.label}</span>
            {' wins '}<span className="text-[#6B21A8] font-bold">{bWins}</span> metrics
          </p>
        </div>
      </div>
    </div>
  );
}
