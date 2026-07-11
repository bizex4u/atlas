import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { checkServiceability, cityFitRank, qcommExpansion, type CityFit, type ExpansionSignal } from "@/lib/ai.functions";
import { INDIA_CITIES, type IndiaCity } from "@/lib/cities";
import { toast } from "@/components/Toaster";
import { Globe2, Loader2, Zap, Sparkles, MapPin, ExternalLink, Store } from "lucide-react";
import { inputCls } from "@/components/ui";

export const Route = createFileRoute("/india")({
  head: () => ({ meta: [{ title: "India Coverage — Atlas" }] }),
  component: IndiaPage,
});

type Status = "serviceable" | "not_serviceable" | "unknown";
interface CoverageCache { date: string; statuses: Record<string, Status> }

const CACHE_KEY = "atlas-india-coverage";

function loadCoverage(): CoverageCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CoverageCache;
    // valid 7 days
    if ((Date.now() - Date.parse(parsed.date)) / 86400000 > 7) return null;
    return parsed;
  } catch { return null; }
}

const DOT: Record<Status, string> = {
  serviceable: "#16a34a",
  not_serviceable: "#dc2626",
  unknown: "#94a3b8",
};

function IndiaPage() { return <AppShell><IndiaContent /></AppShell>; }

function IndiaContent() {
  const probe = useServerFn(checkServiceability);
  const rank = useServerFn(cityFitRank);

  const [statuses, setStatuses] = useState<Record<string, Status>>(() => loadCoverage()?.statuses ?? {});
  const [probing, setProbing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brand, setBrand] = useState("");
  const [ranking, setRanking] = useState(false);
  const [fits, setFits] = useState<CityFit[] | null>(null);
  const [selected, setSelected] = useState<IndiaCity | null>(null);

  const probed = Object.keys(statuses).length;
  const green = Object.values(statuses).filter((s) => s === "serviceable").length;

  async function probeAll() {
    setProbing(true); setProgress(0);
    const acc: Record<string, Status> = {};
    try {
      for (let i = 0; i < INDIA_CITIES.length; i += 10) {
        const batch = INDIA_CITIES.slice(i, i + 10);
        const res = await probe({ data: {
          // checkServiceability keys results by the `pincode` field — we pass city names as keys
          points: batch.map((c) => ({ pincode: c.name, lat: c.lat, lng: c.lng })),
        }});
        for (const r of res.results) acc[r.pincode] = r.swiggy;
        setStatuses({ ...acc });
        setProgress(Math.min(100, Math.round(((i + 10) / INDIA_CITIES.length) * 100)));
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toISOString(), statuses: acc } satisfies CoverageCache));
      toast.success("India coverage updated", `${Object.values(acc).filter((s) => s === "serviceable").length} of ${INDIA_CITIES.length} cities serviceable`);
    } finally { setProbing(false); }
  }

  async function rankForBrand() {
    if (!brand.trim()) return;
    setRanking(true); setFits(null);
    try {
      const serviceable = INDIA_CITIES
        .filter((c) => statuses[c.name] === "serviceable" || probed === 0)
        .map((c) => `${c.name} (${c.state}, tier ${c.tier})`);
      const res = await rank({ data: { brand: brand.trim(), cities: serviceable.slice(0, 100) } });
      if (res.error || !res.fits) toast.error("Ranking failed", res.error || undefined);
      else setFits(res.fits);
    } finally { setRanking(false); }
  }

  return (
    <div className="relative" style={{ height: "calc(100vh - 3.5rem)" }}>
      <IndiaMap statuses={statuses} fits={fits} onSelect={setSelected} />

      {/* Control panel */}
      <div className="absolute left-4 top-4 z-10 w-[320px] space-y-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><Globe2 className="h-4 w-4" /></span>
            <div>
              <div className="text-sm font-semibold">India Coverage</div>
              <div className="text-[11px] text-muted-foreground">
                {probed > 0 ? `${green}/${probed} cities q-commerce serviceable` : `${INDIA_CITIES.length} cities ready to probe`}
              </div>
            </div>
          </div>
          <button
            onClick={probeAll}
            disabled={probing}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            {probing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {probing ? `Probing… ${progress}%` : probed ? "Re-probe all cities (live)" : "Probe all cities (live Swiggy check)"}
          </button>
          {probed > 0 && (
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-600" /> Serviceable</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> Not yet</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" /> Unknown</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="mb-2 text-xs font-semibold">Rank cities for a brand</div>
          <div className="flex gap-2">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Zepto, boAt" className={inputCls}
              onKeyDown={(e) => e.key === "Enter" && rankForBrand()} />
            <button onClick={rankForBrand} disabled={ranking || !brand.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground disabled:opacity-60">
              {ranking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </div>
          {fits && (
            <ol className="mt-3 max-h-[30vh] space-y-1.5 overflow-y-auto">
              {fits.map((f, i) => (
                <li key={f.city} className="rounded-xl bg-muted/40 px-2.5 py-1.5 text-xs">
                  <span className="font-semibold">{i + 1}. {f.city}</span>
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">{f.score}</span>
                  <div className="mt-0.5 text-muted-foreground">{f.why}</div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <ExpansionWatcher />
      </div>

      {/* Selected city */}
      {selected && (
        <div className="absolute bottom-6 left-4 z-10 w-[320px] rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{selected.name}, {selected.state}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Tier {selected.tier}</span>
          </div>
          <div className="mt-1.5 text-xs">
            Q-commerce: <span className="font-medium" style={{ color: DOT[statuses[selected.name] ?? "unknown"] }}>
              {(statuses[selected.name] ?? "not probed").replace("_", " ")}
            </span>
            {fits?.find((f) => f.city.startsWith(selected.name)) && (
              <div className="mt-1 text-muted-foreground">{fits.find((f) => f.city.startsWith(selected.name))!.why}</div>
            )}
          </div>
          <a href={`/research?brand=&city=${encodeURIComponent(selected.name)}`}
             className="mt-2 inline-block rounded-lg border border-border px-2.5 py-1 text-[11px] hover:bg-muted">
            Deep-dive in Brand Intelligence →
          </a>
        </div>
      )}
    </div>
  );
}

const PLATFORM_COLOR: Record<ExpansionSignal["platform"], string> = {
  Blinkit: "bg-yellow-100 text-yellow-800",
  Zepto: "bg-violet-100 text-violet-800",
  Instamart: "bg-orange-100 text-orange-800",
  "Q-commerce": "bg-muted text-muted-foreground",
};

function ExpansionWatcher() {
  const watch = useServerFn(qcommExpansion);
  const [signals, setSignals] = useState<ExpansionSignal[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    watch({ data: { city: "" } })
      .then((res) => setSignals(res.signals))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2">
        <Store className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">Dark-store expansion watch</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Blinkit · Zepto · Instamart</span>
      </div>
      {loading && <div className="py-4 text-center text-xs text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></div>}
      {signals && (
        <div className="max-h-[32vh] space-y-1.5 overflow-y-auto">
          {signals.length === 0 && <div className="py-3 text-center text-xs text-muted-foreground">No fresh expansion signals.</div>}
          {signals.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-muted/40 px-2.5 py-1.5 hover:bg-muted">
              <div className="flex items-center gap-1.5">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${PLATFORM_COLOR[s.platform]}`}>{s.platform}</span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">{s.kind}</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </div>
              <div className="mt-1 text-[11px] font-medium leading-snug">{s.title}</div>
              <div className="text-[10px] text-muted-foreground">{s.source}{s.publishedAt ? ` · ${s.publishedAt.slice(5, 16)}` : ""}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function IndiaMap({ statuses, fits, onSelect }: {
  statuses: Record<string, Status>;
  fits: CityFit[] | null;
  onSelect: (c: IndiaCity) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [79.5, 22.5],
      zoom: 4.4,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    const topSet = new Set((fits ?? []).slice(0, 10).map((f) => f.city.split(" (")[0]));
    markersRef.current = INDIA_CITIES.map((c) => {
      const st = statuses[c.name] ?? "unknown";
      const isTop = topSet.has(c.name);
      const size = isTop ? 18 : c.tier === 1 ? 13 : c.tier === 2 ? 10 : 8;
      const el = document.createElement("div");
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${DOT[st]};border:2px solid ${isTop ? "#7c3aed" : "#fff"};box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;`;
      el.title = `${c.name} — ${st.replace("_", " ")}`;
      el.addEventListener("click", () => onSelect(c));
      return new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map);
    });
  }, [statuses, fits, onSelect]);

  return <div ref={container} style={{ position: "absolute", inset: 0 }} />;
}
