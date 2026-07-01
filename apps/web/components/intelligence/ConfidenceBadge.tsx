'use client';

import type { ConfidenceLevel } from '@/lib/intelligence/confidence';

// ── Inline confidence dot ──────────────────────────────────────────────────────

interface ConfidenceDotProps {
  level: ConfidenceLevel;
  showLabel?: boolean;
}

export function ConfidenceDot({ level, showLabel = false }: ConfidenceDotProps) {
  const cfg = {
    high:   { dot: 'bg-emerald-500', label: 'verified',      text: 'text-emerald-600' },
    medium: { dot: 'bg-amber-500',   label: 'estimated',     text: 'text-amber-600'   },
    low:    { dot: 'bg-zinc-500',    label: 'limited data',  text: 'text-zinc-500'    },
    none:   { dot: 'bg-zinc-700',    label: 'no data',       text: 'text-zinc-600'    },
  }[level];

  return (
    <span className={`inline-flex items-center gap-1 ${cfg.text}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {showLabel && <span className="text-[9px] uppercase tracking-widest">{cfg.label}</span>}
    </span>
  );
}

// ── Coverage quality banner ───────────────────────────────────────────────────

interface CoverageBannerProps {
  level: ConfidenceLevel;
  reason: string;
}

export function CoverageBanner({ level, reason }: CoverageBannerProps) {
  if (level === 'high') return null; // no banner needed

  const cfg = {
    medium: {
      border: 'border-amber-900/40',
      bg:     'bg-amber-950/20',
      dot:    'bg-amber-500',
      text:   'text-amber-600/90',
    },
    low: {
      border: 'border-zinc-700/60',
      bg:     'bg-zinc-800/30',
      dot:    'bg-zinc-500',
      text:   'text-zinc-500',
    },
    none: {
      border: 'border-zinc-700/60',
      bg:     'bg-zinc-800/30',
      dot:    'bg-zinc-600',
      text:   'text-zinc-600',
    },
  }[level];

  return (
    <div className={`mx-3 mb-2 flex items-start gap-2 rounded-lg border ${cfg.border} ${cfg.bg} px-3 py-2`}>
      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      <p className={`text-[10px] leading-relaxed ${cfg.text}`}>{reason}</p>
    </div>
  );
}

// ── Confident value — renders value or fallback based on level ────────────────

interface ConfidentValueProps {
  value: string;
  level: ConfidenceLevel;
  /** What to show if confidence is too low */
  fallback?: string;
  /** Minimum level to show the real value */
  threshold?: ConfidenceLevel;
  className?: string;
}

const LEVEL_ORDER: ConfidenceLevel[] = ['none', 'low', 'medium', 'high'];

function meetsThreshold(level: ConfidenceLevel, threshold: ConfidenceLevel): boolean {
  return LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(threshold);
}

export function ConfidentValue({
  value,
  level,
  fallback = 'Limited data',
  threshold = 'medium',
  className = '',
}: ConfidentValueProps) {
  if (!meetsThreshold(level, threshold)) {
    return <span className={`text-zinc-600 italic ${className}`}>{fallback}</span>;
  }
  const prefix = level === 'medium' ? '~ ' : '';
  return (
    <span className={className}>
      {prefix}{value}
      {level === 'medium' && (
        <span className="ml-1 text-[9px] text-amber-700">est.</span>
      )}
    </span>
  );
}

// ── Source attribution chip ───────────────────────────────────────────────────

export function SourceChip({ source }: { source: string }) {
  return (
    <span className="ml-1 inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-zinc-600">
      {source}
    </span>
  );
}
