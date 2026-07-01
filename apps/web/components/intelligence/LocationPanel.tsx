'use client';

import { usePanelStore } from '@/lib/stores/panelStore';
import { useSavedLocationsStore } from '@/lib/stores/savedLocationsStore';
import { PanelTabs }      from './PanelTabs';
import { OverviewTab }     from './OverviewTab';
import { MarketTab }       from './MarketTab';
import { DemographicsTab } from './DemographicsTab';
import { NearbyPlacesTab } from './NearbyPlacesTab';
import { MobilityTab }     from './MobilityTab';
import { AdvertisingTab }  from './AdvertisingTab';
import { AISummaryTab }    from './AISummaryTab';

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, tier }: { score: number; tier: string }) {
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color =
    tier === 'High'   ? '#10b981' :
    tier === 'Medium' ? '#f59e0b' : '#ef4444';
  const bg =
    tier === 'High'   ? '#d1fae5' :
    tier === 'Medium' ? '#fef3c7' : '#fee2e2';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 68, height: 68 }}>
      <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke={bg} strokeWidth="6" />
        <circle
          cx="34" cy="34" r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[17px] font-black leading-none text-gray-900 tabular-nums">{score}</span>
        <span className="text-[8px] text-gray-400 leading-none mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PanelHeader() {
  const analysis         = usePanelStore((s) => s.analysis);
  const isLoading        = usePanelStore((s) => s.isLoading);
  const clearSelection   = usePanelStore((s) => s.clearSelection);
  const selectedDealer   = usePanelStore((s) => s.selectedDealer);
  const selectedLocation = usePanelStore((s) => s.selectedLocation);
  const setActiveTab     = usePanelStore((s) => s.setActiveTab);
  const save             = useSavedLocationsStore((s) => s.save);
  const remove           = useSavedLocationsStore((s) => s.remove);
  const isSaved          = useSavedLocationsStore((s) => s.isSaved);

  const saved = analysis
    ? isSaved(analysis.lngLat.lat, analysis.lngLat.lng)
    : false;
  const savedId = analysis
    ? `${analysis.lngLat.lat.toFixed(4)}_${analysis.lngLat.lng.toFixed(4)}`
    : null;

  const name = selectedDealer?.storeName
    ?? (analysis?.knowledge?.location
      ? [analysis.knowledge.location.neighbourhood, analysis.knowledge.location.suburb]
          .filter(Boolean)[0]
      : null)
    ?? (selectedLocation
      ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
      : null);

  const sub = analysis?.knowledge?.location
    ? [analysis.knowledge.location.city, analysis.knowledge.location.state].filter(Boolean).join(', ')
    : analysis ? `${analysis.city} · ${analysis.pincode}` : null;

  const tier  = analysis?.attentionResult.tier  ?? 'Low';
  const score = analysis?.attentionResult.compositeScore ?? 0;

  const tierLabel =
    tier === 'High'   ? 'High Opportunity'     :
    tier === 'Medium' ? 'Moderate Opportunity' : 'Low Opportunity';

  const tierStyle =
    tier === 'High'   ? 'text-emerald-700 bg-emerald-50  border-emerald-200' :
    tier === 'Medium' ? 'text-amber-700   bg-amber-50    border-amber-200'   :
                        'text-red-700     bg-red-50      border-red-200';

  if (!name && !isLoading) return null;

  return (
    <div className="shrink-0 border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Location Analysis</span>
        <div className="flex items-center gap-1">
          {analysis && (
            <button
              onClick={() => saved && savedId ? remove(savedId) : analysis && save(analysis)}
              title={saved ? 'Remove from saved' : 'Save location'}
              className={`p-1.5 rounded-lg transition-colors ${
                saved
                  ? 'text-[#6B21A8] bg-purple-50 hover:bg-purple-100'
                  : 'text-gray-400 hover:text-[#6B21A8] hover:bg-purple-50'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          )}
          <button
            onClick={clearSelection}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 pb-4">
        {isLoading ? (
          <div className="h-[68px] w-[68px] rounded-full bg-gray-100 animate-pulse shrink-0" />
        ) : analysis ? (
          <ScoreRing score={score} tier={tier} />
        ) : null}

        <div className="flex-1 min-w-0">
          {isLoading && !name ? (
            <>
              <div className="h-4 w-36 rounded-lg bg-gray-100 animate-pulse mb-2" />
              <div className="h-3 w-24 rounded-lg bg-gray-100 animate-pulse" />
            </>
          ) : (
            <>
              <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{name}</p>
              {sub && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{sub}</p>}
              {analysis && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-semibold border rounded-full px-2.5 py-0.5 ${tierStyle}`}>
                    {tierLabel}
                  </span>
                  <button
                    onClick={() => setActiveTab('ai-summary')}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#6B21A8] bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5 hover:bg-purple-100 transition-colors"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    AI Report
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center bg-white">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B21A8" strokeWidth="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#6B21A8] flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[15px] font-bold text-gray-900">Click a location</p>
        <p className="text-[12px] text-gray-500 leading-relaxed">
          Tap anywhere on the map to analyse advertising potential, transit access, footfall, and competition.
        </p>
      </div>

      <div className="w-full space-y-2 max-w-[220px]">
        {[
          { color: 'bg-emerald-500', label: 'High opportunity', sub: 'Score ≥ 65' },
          { color: 'bg-amber-400',   label: 'Moderate opportunity', sub: 'Score 35–64' },
          { color: 'bg-red-400',     label: 'Low opportunity', sub: 'Score < 35' },
        ].map(({ color, label, sub }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 shadow-sm">
            <div className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} />
            <div className="text-left">
              <p className="text-[11px] text-gray-700 font-semibold">{label}</p>
              <p className="text-[9px] text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const clearSelection = usePanelStore((s) => s.clearSelection);
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center bg-white">
      <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-bold text-gray-900">Analysis failed</p>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-[240px]">{message}</p>
      </div>
      <button
        onClick={clearSelection}
        className="mt-1 px-4 py-2 rounded-xl text-[12px] font-medium text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 bg-white">
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f0ff" strokeWidth="5" />
          <circle cx="32" cy="32" r="28" fill="none" stroke="#6B21A8" strokeWidth="5"
            strokeLinecap="round" strokeDasharray="44 132"
            className="animate-spin origin-center" style={{ animationDuration: '1.2s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[#6B21A8] animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-[14px] font-bold text-gray-900">Analyzing location</p>
        <p className="text-[11px] text-gray-400">Satellite · Transit · POI · Competition</p>
      </div>
      <div className="w-full space-y-2.5 px-2">
        {[80, 60, 90, 45].map((w, i) => (
          <div key={i} className="h-3 rounded-full bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LocationPanel() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  const error     = usePanelStore((s) => s.error);
  const activeTab = usePanelStore((s) => s.activeTab);
  const hasContent = isLoading || analysis || error;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-100 shadow-xl shadow-black/5">
      <PanelHeader />
      {hasContent && !error && !isLoading && <PanelTabs />}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50/50">
        {error        ? <ErrorState message={error} />
        : isLoading   ? <LoadingState />
        : !hasContent ? <EmptyState />
        : (
          <>
            {activeTab === 'overview'     && <OverviewTab />}
            {activeTab === 'market'       && <MarketTab />}
            {activeTab === 'advertising'  && <AdvertisingTab />}
            {activeTab === 'nearby'       && <NearbyPlacesTab />}
            {activeTab === 'mobility'     && <MobilityTab />}
            {activeTab === 'demographics' && <DemographicsTab />}
            {activeTab === 'ai-summary'   && <AISummaryTab />}
          </>
        )}
      </div>
    </div>
  );
}
