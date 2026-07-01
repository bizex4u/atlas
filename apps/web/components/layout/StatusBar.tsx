'use client';

import { useProcessingStore, STAGE_LABELS } from '@/lib/stores/processingStore';
import { usePanelStore } from '@/lib/stores/panelStore';

interface StatusBarProps {
  dealerCount?: number;
}

export function StatusBar({ dealerCount = 0 }: StatusBarProps) {
  const pipeline    = useProcessingStore();
  const panelLoading = usePanelStore((s) => s.isLoading);

  const stage    = pipeline.stage;
  const isBusy   = pipeline.isBusy || panelLoading;
  const hasError = pipeline.errorCount > 0;

  const dotClass = hasError
    ? 'bg-red-500'
    : isBusy
    ? 'bg-yellow-400 animate-pulse'
    : stage === 'ready'
    ? 'bg-emerald-400'
    : 'bg-zinc-600';

  const label = panelLoading
    ? 'Analyzing…'
    : STAGE_LABELS[stage];

  // Geocoding progress text
  const showGeoProgress =
    stage === 'geocoding' && pipeline.geocodeTotal > 0;

  const geoText = showGeoProgress
    ? `Geocoding ${pipeline.geocodeResolved + pipeline.geocodeFailed} / ${pipeline.geocodeTotal}`
    : null;

  // Progress bar — only while busy
  const showBar = pipeline.isBusy && stage !== 'idle';

  return (
    <footer className="relative flex h-8 shrink-0 flex-col justify-center border-t border-zinc-800 bg-zinc-900 px-4 overflow-hidden">
      {/* Progress bar track */}
      {showBar && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-zinc-800">
          <div
            className="h-full bg-[#6B21A8] transition-all duration-500"
            style={{ width: `${pipeline.progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Left: stage + counts */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {geoText ?? label}
          </span>

          {dealerCount > 0 && stage !== 'idle' && (
            <span className="text-xs text-zinc-600">
              {dealerCount.toLocaleString()} dealer{dealerCount !== 1 ? 's' : ''}
            </span>
          )}

          {pipeline.warningCount > 0 && (
            <span className="text-xs text-amber-600">
              {pipeline.warningCount} warning{pipeline.warningCount !== 1 ? 's' : ''}
            </span>
          )}

          {pipeline.errorCount > 0 && (
            <span className="text-xs text-red-500">
              {pipeline.errorCount} error{pipeline.errorCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Right: elapsed / ready */}
        <div className="flex items-center gap-2">
          {pipeline.startedAt && pipeline.finishedAt && stage === 'ready' && (
            <span className="text-[10px] text-zinc-700">
              {((pipeline.finishedAt.getTime() - pipeline.startedAt.getTime()) / 1000).toFixed(1)}s
            </span>
          )}
          {stage === 'ready' && (
            <span className="text-[10px] text-emerald-700">● Ready</span>
          )}
        </div>
      </div>
    </footer>
  );
}
