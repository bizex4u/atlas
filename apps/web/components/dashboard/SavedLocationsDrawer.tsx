'use client';

import { useState } from 'react';
import { useSavedLocationsStore, type SavedLocation } from '@/lib/stores/savedLocationsStore';
import { usePanelStore } from '@/lib/stores/panelStore';
import { useMapStore } from '@/lib/stores/mapStore';
import { CompareModal } from './CompareModal';

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const color =
    tier === 'High'   ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    tier === 'Medium' ? 'text-amber-700   bg-amber-50   border-amber-200'   :
                        'text-red-700     bg-red-50     border-red-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums ${color}`}>
      {score}
    </span>
  );
}

function LocationCard({
  loc, onClose, compareMode, selected, onToggleSelect,
}: {
  loc: SavedLocation;
  onClose: () => void;
  compareMode: boolean;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const remove          = useSavedLocationsStore((s) => s.remove);
  const analyzeLocation = usePanelStore((s) => s.analyzeLocation);
  const flyTo           = useMapStore((s) => s.flyTo);

  const tier  = loc.analysis.attentionResult.tier;
  const score = loc.analysis.attentionResult.compositeScore;
  const { lat, lng } = loc.analysis.lngLat;

  const sub = [
    loc.analysis.knowledge?.location?.city,
    loc.analysis.knowledge?.location?.state,
  ].filter(Boolean).join(', ') || loc.analysis.city;

  const savedDate = new Date(loc.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  function open() {
    if (compareMode) { onToggleSelect(loc.id); return; }
    flyTo(lng, lat, 15);
    setTimeout(() => analyzeLocation({ lat, lng }), 800);
    onClose();
  }

  return (
    <div className={`group rounded-2xl border bg-white shadow-sm transition-all ${
      selected
        ? 'border-[#6B21A8] ring-2 ring-[#6B21A8]/20 shadow-purple-100'
        : 'border-gray-100 hover:shadow-md hover:border-purple-100'
    }`}>
      <button className="w-full text-left p-4" onClick={open}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            {compareMode && (
              <div className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                selected ? 'bg-[#6B21A8] border-[#6B21A8]' : 'border-gray-300'
              }`}>
                {selected && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
            )}
            <p className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-1">{loc.label}</p>
          </div>
          <ScoreBadge score={score} tier={tier} />
        </div>
        <p className="text-[11px] text-gray-400 mb-3 ml-6">{sub}</p>
        <div className="flex items-center gap-3 text-[10px] text-gray-500 ml-6">
          <span>Pop <span className="font-semibold text-gray-700">{Math.round(loc.analysis.catchmentRecord.estimatedPopulation / 1000)}k</span></span>
          <span>·</span>
          <span>Comp <span className="font-semibold text-gray-700">{loc.analysis.competitionSummary.competitorsWithin5Km}</span></span>
          <span>·</span>
          <span className="text-gray-400">{savedDate}</span>
        </div>
      </button>
      <div className="flex items-center justify-between border-t border-gray-50 px-4 py-2">
        <span className="text-[9px] uppercase tracking-widest text-gray-300 font-semibold">{loc.analysis.pincode}</span>
        {!compareMode && (
          <button onClick={() => remove(loc.id)} className="text-[10px] text-gray-300 hover:text-red-500 transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  open:             boolean;
  onClose:          () => void;
  onProposalClick?: () => void;
}

export function SavedLocationsDrawer({ open, onClose, onProposalClick }: Props) {
  const saved = useSavedLocationsStore((s) => s.saved);
  const [compareMode,    setCompareMode]    = useState(false);
  const [selected,       setSelected]       = useState<string[]>([]);
  const [compareTargets, setCompareTargets] = useState<[SavedLocation, SavedLocation] | null>(null);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2)  return prev;
      return [...prev, id];
    });
  }

  function startCompare() {
    const [aId, bId] = selected;
    const a = saved.find((l) => l.id === aId);
    const b = saved.find((l) => l.id === bId);
    if (a && b) setCompareTargets([a, b]);
  }

  function exitCompare() {
    setCompareMode(false);
    setSelected([]);
    setCompareTargets(null);
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" style={{ left: 72 }} onClick={onClose} />}

      <div className={`
        fixed top-0 left-[72px] z-50 h-full w-[340px]
        bg-white border-r border-gray-100 shadow-2xl flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-[15px] font-bold text-gray-900">Saved Locations</p>
            <p className="text-[11px] text-gray-400">{saved.length} location{saved.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {saved.length >= 2 && !compareMode && (
              <button
                onClick={() => setCompareMode(true)}
                className="text-[11px] font-semibold text-[#6B21A8] bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-100 transition-colors"
              >
                Compare
              </button>
            )}
            {compareMode && (
              <button onClick={exitCompare} className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Compare mode banner */}
        {compareMode && (
          <div className="px-5 py-3 bg-purple-50 border-b border-purple-100">
            <p className="text-[11px] text-[#6B21A8] font-medium">
              {selected.length === 0 && 'Select 2 locations to compare'}
              {selected.length === 1 && 'Select 1 more location'}
              {selected.length === 2 && 'Ready to compare!'}
            </p>
            {selected.length === 2 && (
              <button
                onClick={startCompare}
                className="mt-2 w-full rounded-xl bg-[#6B21A8] text-white text-[12px] font-bold py-2 hover:bg-[#5b1a91] transition-colors"
              >
                Compare →
              </button>
            )}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-12">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B21A8" strokeWidth="1.5">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-700">No saved locations</p>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-[200px]">
                  Click the bookmark icon after analysing a location to save it here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((loc) => (
                <LocationCard
                  key={loc.id}
                  loc={loc}
                  onClose={onClose}
                  compareMode={compareMode}
                  selected={selected.includes(loc.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {saved.length > 0 && !compareMode && (
          <div className="border-t border-gray-100 px-4 py-3 bg-white space-y-2">
            {onProposalClick && (
              <button
                onClick={() => { onClose(); onProposalClick(); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6B21A8] text-white text-[12px] font-bold py-2.5 hover:bg-[#5b1a91] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Generate Campaign Proposal PDF
              </button>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Stored locally · {saved.length} saved</span>
              <button
                onClick={() => {
                  if (window.confirm(`Delete all ${saved.length} saved locations?`)) {
                    const store = useSavedLocationsStore.getState();
                    store.saved.forEach((l) => store.remove(l.id));
                  }
                }}
                className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compare modal */}
      {compareTargets && (
        <CompareModal
          a={compareTargets[0]}
          b={compareTargets[1]}
          onClose={exitCompare}
        />
      )}
    </>
  );
}
