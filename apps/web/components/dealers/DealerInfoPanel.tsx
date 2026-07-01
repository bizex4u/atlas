'use client';

import { X } from 'lucide-react';
import type { ScoredDealer } from '@/types/dealer';
import type { OpportunityRating, SignalResult } from '@/types/attentionIndex';

interface DealerInfoPanelProps {
  dealer: ScoredDealer | null;
  onClose: () => void;
}

const ratingStyles: Record<OpportunityRating, { badge: string; bar: string; text: string }> = {
  High:   { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-700', bar: 'bg-emerald-500', text: 'text-emerald-400' },
  Medium: { badge: 'bg-yellow-500/15  text-yellow-400  border-yellow-700',  bar: 'bg-yellow-500',  text: 'text-yellow-400'  },
  Low:    { badge: 'bg-red-500/15     text-red-400     border-red-700',     bar: 'bg-red-500',     text: 'text-red-400'     },
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-2 py-1.5 border-b border-zinc-800/70 last:border-0">
      <span className="text-xs text-zinc-500 self-start pt-px">{label}</span>
      <span className="text-xs text-zinc-200 font-medium break-words leading-relaxed">{value}</span>
    </div>
  );
}

function SignalCard({ signal }: { signal: SignalResult }) {
  const pct = Math.round(signal.weight * 100);
  const scoreColor =
    signal.score >= 70 ? 'bg-emerald-500'
    : signal.score >= 45 ? 'bg-yellow-500'
    : 'bg-red-500';

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-200">{signal.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-white">{signal.score}</span>
          <span className="text-[10px] text-zinc-500 border border-zinc-700 rounded px-1">{pct}%</span>
        </div>
      </div>
      <ScoreBar score={signal.score} color={scoreColor} />
      <p className="text-[11px] text-zinc-500 leading-relaxed">{signal.explanation}</p>
    </div>
  );
}

export function DealerInfoPanel({ dealer, onClose }: DealerInfoPanelProps) {
  const visible = dealer !== null;

  return (
    <div
      className={[
        'absolute right-0 top-0 h-full w-80 z-10',
        'flex flex-col bg-zinc-900 border-l border-zinc-800 shadow-2xl',
        'transition-transform duration-200 ease-out',
        visible ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {dealer && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 px-4 py-4 border-b border-zinc-800 shrink-0">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">
                Dealer Profile
              </p>
              <h2 className="text-sm font-semibold text-white leading-snug break-words">
                {dealer.storeName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Attention Index summary */}
          <div className="px-4 py-4 border-b border-zinc-800 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                Attention Index
              </span>
              <span className={`text-xl font-bold ${ratingStyles[dealer.attention.rating].text}`}>
                {dealer.attention.score}
              </span>
            </div>
            <ScoreBar
              score={dealer.attention.score}
              color={ratingStyles[dealer.attention.rating].bar}
            />
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${ratingStyles[dealer.attention.rating].badge}`}
              >
                {dealer.attention.rating} Opportunity
              </span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Location */}
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Location</p>
              <InfoRow label="Address" value={dealer.address} />
              <InfoRow label="City" value={dealer.city} />
              <InfoRow label="Pincode" value={dealer.pincode} />
              {dealer.lat !== null && dealer.lng !== null && (
                <InfoRow
                  label="Coordinates"
                  value={`${dealer.lat.toFixed(5)}, ${dealer.lng.toFixed(5)}`}
                />
              )}
            </div>

            {/* Signal breakdown */}
            <div className="px-4 pt-1 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                Signal Breakdown
              </p>
              <div className="space-y-2">
                {dealer.attention.signals.map((signal) => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
