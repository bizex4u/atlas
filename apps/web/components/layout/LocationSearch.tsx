'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useMapStore } from '@/lib/stores/mapStore';
import { usePanelStore } from '@/lib/stores/panelStore';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    city?: string;
    town?: string;
    suburb?: string;
    state?: string;
    country?: string;
  };
}

function shortLabel(r: NominatimResult): string {
  const a = r.address ?? {};
  const city  = a.city ?? a.town ?? '';
  const sub   = a.suburb ?? '';
  const state = a.state ?? '';
  const parts = [sub, city, state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : r.display_name.split(',').slice(0, 2).join(',').trim();
}

let debounceTimer: ReturnType<typeof setTimeout>;

export function LocationSearch() {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);

  const flyTo           = useMapStore((s) => s.flyTo);
  const analyzeLocation = usePanelStore((s) => s.analyzeLocation);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q',              q);
      url.searchParams.set('format',         'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit',          '6');
      url.searchParams.set('countrycodes',   'in');
      url.searchParams.set('accept-language','en');
      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Atlas/1.0 (bizex4u.com)' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return;
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      // keep old results on network fail
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceTimer);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    debounceTimer = setTimeout(() => search(q), 280);
  }

  function select(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setQuery(shortLabel(r));
    setOpen(false);
    setResults([]);
    flyTo(lng, lat, 15);
    setTimeout(() => analyzeLocation({ lat, lng }), 800);
  }

  function clear() {
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        listRef.current && !listRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div className="relative flex flex-1 max-w-md">
      <div className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2 transition-all ${
        focused
          ? 'border-[#6B21A8] bg-white shadow-sm ring-2 ring-[#6B21A8]/10'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}>
        {loading
          ? <Loader2 className="h-4 w-4 shrink-0 text-[#6B21A8] animate-spin" />
          : <Search className="h-4 w-4 shrink-0 text-gray-400" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Search locations in India…"
          className="w-full bg-transparent text-[13px] text-gray-800 placeholder-gray-400 outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button onClick={clear} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[340px] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden"
        >
          {results.map((r) => (
            <button
              key={r.place_id}
              onMouseDown={() => select(r)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="h-7 w-7 rounded-lg bg-[#6B21A8]/10 flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B21A8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-gray-800 truncate">{shortLabel(r)}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{r.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
