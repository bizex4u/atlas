import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppShell } from "@/components/AppShell";
import { useServerFn } from "@tanstack/react-start";
import { fetchNearbyPlaces, analyzeAreaWithGroq, type PlaceBusiness } from "@/lib/ai.functions";
import {
  X, Loader2, MapPin, Search,
  ShoppingBag, GraduationCap, Cross, Bus, Building2, Utensils, Film, Store,
  ChevronDown, ChevronUp, Star, TrendingUp, Users, Banknote, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Site Map — Atlas" },
      { name: "description", content: "Live map + Google Places intelligence for Atlas OOH." },
    ],
  }),
  component: MapPage,
});

const POI_CATEGORIES = [
  { id: "mall", label: "Shopping Malls", icon: ShoppingBag, color: "#8b5cf6", overpass: ['node["shop"="mall"]', 'way["shop"="mall"]'] },
  { id: "school", label: "Schools & Colleges", icon: GraduationCap, color: "#3b82f6", overpass: ['node["amenity"="school"]', 'node["amenity"="college"]'] },
  { id: "hospital", label: "Hospitals", icon: Cross, color: "#ef4444", overpass: ['node["amenity"="hospital"]'] },
  { id: "bus", label: "Bus Stops", icon: Bus, color: "#f59e0b", overpass: ['node["amenity"="bus_station"]', 'node["highway"="bus_stop"]'] },
  { id: "office", label: "Offices", icon: Building2, color: "#64748b", overpass: ['node["building"="office"]'] },
  { id: "restaurant", label: "Restaurants", icon: Utensils, color: "#f97316", overpass: ['node["amenity"="restaurant"]', 'node["amenity"="fast_food"]'] },
  { id: "cinema", label: "Cinemas", icon: Film, color: "#ec4899", overpass: ['node["amenity"="cinema"]'] },
  { id: "supermarket", label: "Supermarkets", icon: Store, color: "#10b981", overpass: ['node["shop"="supermarket"]'] },
];

interface PoiResult {
  id: number;
  name: string;
  category: string;
  lat: number;
  lon: number;
  distance?: number;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

type PlaceWithScore = PlaceBusiness & { footfallScore: number };

function categoryIcon(cat: string) {
  if (cat.includes("mall") || cat.includes("shopping")) return ShoppingBag;
  if (cat.includes("school") || cat.includes("university")) return GraduationCap;
  if (cat.includes("hospital") || cat.includes("clinic")) return Cross;
  if (cat.includes("bus") || cat.includes("transit")) return Bus;
  if (cat.includes("restaurant") || cat.includes("cafe") || cat.includes("food")) return Utensils;
  if (cat.includes("movie") || cat.includes("theater")) return Film;
  if (cat.includes("supermarket") || cat.includes("department")) return Store;
  if (cat.includes("office") || cat.includes("bank")) return Building2;
  return MapPin;
}

function scoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning-foreground";
  return "text-destructive";
}

function MapPage() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const poiMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Google Places panel
  const [placesPanel, setPlacesPanel] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceWithScore[]>([]);
  const [placesError, setPlacesError] = useState("");
  const [placesCoords, setPlacesCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [placesRadius, setPlacesRadius] = useState(500);
  const getNearby = useServerFn(fetchNearbyPlaces);
  const analyzeArea = useServerFn(analyzeAreaWithGroq);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Overpass POI scraper
  const [scraperOpen, setScraperOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(["mall", "bus", "school"]));
  const [radius, setRadius] = useState(2000);
  const [scraping, setScraping] = useState(false);
  const [pois, setPois] = useState<PoiResult[]>([]);
  const [scrapeError, setScrapeError] = useState("");

  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      // OpenFreeMap: free, keyless, and not on ad-block lists (Carto CDN gets blocked by some extensions)
      style: "https://tiles.openfreemap.org/styles/bright",
      center: [80.9462, 26.8493],
      zoom: 12,
      maxPitch: 70,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("click", (e) => {
      const { lat, lng } = e.lngLat;
      setPlacesCoords({ lat, lng });
      setPlaces([]);
      setPlacesError("");
      setAiAnalysis(null);
      setPlacesPanel(true);
      setScraperOpen(false);
    });

    map.on("error", (e) => console.error("[atlas-map]", e.error?.message || e));
    if (import.meta.env.DEV) (window as unknown as { __atlasMap?: maplibregl.Map }).__atlasMap = map;

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  function toggle3D() {
    const map = mapRef.current;
    if (!map) return;
    const next = !is3D;
    setIs3D(next);
    map.easeTo({
      pitch: next ? 55 : 0,
      bearing: next ? -15 : 0,
      duration: 900,
    });
  }

  async function loadPlaces(lat: number, lng: number) {
    setPlacesLoading(true);
    setPlacesError("");
    try {
      const result = await getNearby({ data: { lat, lng, radius: placesRadius } });
      if (result.error && !result.places.length) {
        setPlacesError(result.error);
      } else {
        setPlaces(result.places as PlaceWithScore[]);
      }
    } catch (e: unknown) {
      setPlacesError(e instanceof Error ? e.message : "Failed");
    } finally {
      setPlacesLoading(false);
    }
  }

  const scrapePois = useCallback(async () => {
    const map = mapRef.current;
    if (!map || selectedCats.size === 0) return;
    const center = map.getCenter();
    const lat = center.lat, lng = center.lng;
    setScraping(true);
    setScrapeError("");
    setPois([]);
    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];
    try {
      const catLines = POI_CATEGORIES.filter((c) => selectedCats.has(c.id))
        .flatMap((c) => c.overpass.map((q) => `${q}(around:${radius},${lat},${lng});`));
      const query = `[out:json][timeout:30];(${catLines.join("")});out center;`;
      const mirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      ];
      let res: Response | null = null;
      for (const url of mirrors) {
        try { res = await fetch(url, { method: "POST", body: query }); if (res.ok) break; } catch { continue; }
      }
      if (!res || !res.ok) throw new Error(`Overpass unavailable — try again in a moment`);
      if (!res.ok) throw new Error(`Overpass error ${res.status}`);
      const data = (await res.json()) as { elements: { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
      const results: PoiResult[] = data.elements.map((el) => {
        const elLat = el.lat ?? el.center?.lat ?? 0;
        const elLon = el.lon ?? el.center?.lon ?? 0;
        const name = el.tags?.name || el.tags?.amenity || el.tags?.shop || "Unnamed";
        const cat = POI_CATEGORIES.find((c) => c.overpass.some((q) => { const kv = q.match(/\["([^"]+)"="([^"]+)"\]/); return kv ? el.tags?.[kv[1]] === kv[2] : false; }));
        return { id: el.id, name, category: cat?.id || "other", lat: elLat, lon: elLon, distance: haversineKm(lat, lng, elLat, elLon) };
      }).filter((p) => p.lat && p.lon).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 200);
      setPois(results);
      if (map) {
        poiMarkersRef.current = results.map((p) => {
          const cat = POI_CATEGORIES.find((c) => c.id === p.category);
          const el = document.createElement("div");
          el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${cat?.color || "#94a3b8"};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);`;
          const popup = new maplibregl.Popup({ offset: 8, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;font-size:11px;max-width:160px"><div style="font-weight:600">${p.name}</div><div style="color:#64748b">${cat?.label} · ${p.distance}km</div></div>`
          );
          return new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(map);
        });
      }
    } catch (e: unknown) {
      setScrapeError(e instanceof Error ? e.message : "Failed");
    } finally {
      setScraping(false);
    }
  }, [selectedCats, radius]);

  // Derived metrics from Places
  const avgRating = places.length ? (places.reduce((a, p) => a + p.rating, 0) / places.length).toFixed(1) : "—";
  const totalReviews = places.reduce((a, p) => a + p.reviewCount, 0);
  const avgFootfall = places.length ? Math.round(places.reduce((a, p) => a + p.footfallScore, 0) / places.length) : 0;
  const secEstimate = places.length ? (places.reduce((a, p) => a + (p.priceLevel >= 0 ? p.priceLevel : 2), 0) / places.length) : -1;
  const secLabel = secEstimate < 0 ? "—" : secEstimate >= 3 ? "SEC A" : secEstimate >= 1.5 ? "SEC B" : "SEC C";

  const topBusinesses = [...places].sort((a, b) => b.footfallScore - a.footfallScore).slice(0, 8);

  return (
    <AppShell>
      <div className="relative" style={{ height: "calc(100vh - 3.5rem)" }}>
        <div ref={container} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

        {/* 3D toggle + site fly-through */}
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          <button
            onClick={toggle3D}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-card transition ${is3D ? "gradient-primary border-transparent text-primary-foreground" : "border-border bg-card hover:bg-muted"}`}
            title="Toggle 3D buildings view"
          >
            {is3D ? "3D" : "2D"}
          </button>
        </div>

        {/* Overpass POI scraper button */}
        <button
          onClick={() => { setScraperOpen((v) => !v); setPlacesPanel(false); }}
          className="absolute left-4 bottom-6 z-10 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-card hover:bg-muted"
        >
          <Search className="h-4 w-4 text-primary" />
          OSM POIs
          {pois.length > 0 && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{pois.length}</span>}
          {scraperOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>

        {/* Overpass panel */}
        {scraperOpen && (
          <div className="absolute bottom-20 left-4 z-20 w-72 max-h-[65vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <div>
                <div className="text-sm font-semibold">OSM POI Scraper</div>
                <div className="text-[11px] text-muted-foreground">OpenStreetMap · Free</div>
              </div>
              <button onClick={() => setScraperOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium">Radius</span>
                  <span className="text-primary font-semibold">{(radius / 1000).toFixed(1)}km</span>
                </div>
                <input type="range" min={300} max={5000} step={100} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {POI_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = selectedCats.has(cat.id);
                  return (
                    <button key={cat.id} onClick={() => setSelectedCats((p) => { const n = new Set(p); if (n.has(cat.id)) n.delete(cat.id); else n.add(cat.id); return n; })}
                      className={"flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] transition-all " + (active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30")}>
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: active ? cat.color : undefined }} />
                      <span className="leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={scrapePois} disabled={scraping || selectedCats.size === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {scraping ? <><Loader2 className="h-4 w-4 animate-spin" /> Scraping…</> : <><Search className="h-4 w-4" /> Scrape at map center</>}
              </button>
              {scrapeError && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{scrapeError}</div>}
              {pois.length > 0 && (
                <div>
                  <div className="mb-2 flex justify-between text-xs font-medium">
                    <span>{pois.length} POIs found</span>
                    <button onClick={() => { poiMarkersRef.current.forEach((m) => m.remove()); poiMarkersRef.current = []; setPois([]); }} className="text-destructive hover:underline">Clear</button>
                  </div>
                  <ul className="max-h-40 overflow-y-auto divide-y divide-border rounded-xl border border-border">
                    {pois.slice(0, 60).map((p) => {
                      const cat = POI_CATEGORIES.find((c) => c.id === p.category);
                      const Icon = cat?.icon || MapPin;
                      return (
                        <li key={p.id} onClick={() => mapRef.current?.flyTo({ center: [p.lon, p.lat], zoom: 17, duration: 700 })}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-muted">
                          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg" style={{ background: (cat?.color || "#94a3b8") + "20" }}>
                            <Icon className="h-3 w-3" style={{ color: cat?.color || "#94a3b8" }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[11px] font-medium">{p.name}</div>
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground">{p.distance}km</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Places intelligence panel */}
        {placesPanel && (
          <div className="absolute right-4 top-4 bottom-4 z-20 w-[340px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
              <div>
                <div className="text-sm font-semibold">Area Intelligence</div>
                {placesCoords && (
                  <div className="text-[11px] text-muted-foreground">
                    {placesCoords.lat.toFixed(4)}, {placesCoords.lng.toFixed(4)}
                  </div>
                )}
              </div>
              <button onClick={() => setPlacesPanel(false)} className="grid h-7 w-7 place-items-center rounded-lg hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Radius + fetch */}
              <div className="border-b border-border p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium">Search radius</span>
                  <span className="text-primary font-semibold">{placesRadius}m</span>
                </div>
                <input type="range" min={200} max={2000} step={100} value={placesRadius}
                  onChange={(e) => setPlacesRadius(Number(e.target.value))} className="mb-3 w-full accent-primary" />
                <button
                  onClick={() => placesCoords && loadPlaces(placesCoords.lat, placesCoords.lng)}
                  disabled={placesLoading || !placesCoords}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {placesLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Fetching from Google…</>
                    : places.length > 0
                      ? <><Search className="h-4 w-4" /> Re-analyse</>
                      : <><Search className="h-4 w-4" /> Analyse with Google Places</>
                  }
                </button>
                {placesError && <div className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{placesError}</div>}
              </div>

              {places.length > 0 && (
                <>
                  {/* KPI row */}
                  <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
                    {[
                      { icon: Star, label: "Avg Rating", value: avgRating },
                      { icon: Users, label: "Reviews", value: totalReviews > 999 ? `${(totalReviews / 1000).toFixed(1)}K` : String(totalReviews) },
                      { icon: TrendingUp, label: "Footfall", value: `${avgFootfall}` },
                      { icon: Banknote, label: "SEC", value: secLabel },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex flex-col items-center justify-center gap-0.5 py-3 px-1">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <div className={`text-sm font-bold ${label === "Footfall" ? scoreColor(avgFootfall) : ""}`}>{value}</div>
                        <div className="text-[9px] text-muted-foreground text-center leading-tight">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* OOH score */}
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">OOH Site Score</span>
                      <span className={`text-lg font-bold ${scoreColor(avgFootfall)}`}>{avgFootfall}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${avgFootfall}%` }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Based on {places.length} businesses · avg rating {avgRating}★ · {totalReviews.toLocaleString("en-IN")} total reviews
                    </p>
                  </div>

                  {/* Top businesses */}
                  <div className="px-4 py-3">
                    <div className="mb-2 text-xs font-semibold">Top businesses nearby</div>
                    <ul className="space-y-1.5">
                      {topBusinesses.map((p, i) => {
                        const Icon = categoryIcon(p.category);
                        return (
                          <li key={i} className="flex items-center gap-2.5 rounded-xl border border-border p-2.5">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground capitalize">{p.category.replace(/_/g, " ")} · {p.distance}m away</div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-[11px] font-semibold flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                                {p.rating || "—"}
                              </div>
                              <div className="text-[10px] text-muted-foreground">{p.reviewCount > 999 ? `${(p.reviewCount / 1000).toFixed(1)}K` : p.reviewCount} rev</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Groq AI Analysis */}
                  <div className="border-t border-border px-4 py-3">
                    {!aiAnalysis ? (
                      <button
                        onClick={async () => {
                          setAiLoading(true);
                          const r = await analyzeArea({
                            data: {
                              lat: placesCoords!.lat,
                              lng: placesCoords!.lng,
                              places: places.map((p) => ({
                                name: p.name,
                                category: p.category,
                                rating: p.rating,
                                reviewCount: p.reviewCount,
                                priceLevel: p.priceLevel,
                                distance: p.distance,
                                footfallScore: p.footfallScore,
                              })),
                              avgRating,
                              totalReviews,
                              oohScore: avgFootfall,
                              secLabel,
                            },
                          });
                          setAiAnalysis(r.analysis || r.error || "No response");
                          setAiLoading(false);
                        }}
                        disabled={aiLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-60"
                      >
                        {aiLoading
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing with Groq…</>
                          : <><Sparkles className="h-4 w-4" /> Get OOH AI Analysis</>
                        }
                      </button>
                    ) : (
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Analysis
                          </div>
                          <button
                            onClick={() => setAiAnalysis(null)}
                            className="text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {aiAnalysis}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category breakdown */}
                  <div className="border-t border-border px-4 py-3">
                    <div className="mb-2 text-xs font-semibold">Category mix</div>
                    {(() => {
                      const counts: Record<string, number> = {};
                      for (const p of places) {
                        const key = p.category.split("_")[0];
                        counts[key] = (counts[key] || 0) + 1;
                      }
                      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => {
                        const Icon = categoryIcon(cat);
                        return (
                          <div key={cat} className="mb-1.5 flex items-center gap-2">
                            <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] mb-0.5">
                                <span className="capitalize text-muted-foreground">{cat.replace(/_/g, " ")}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                              <div className="h-1 rounded-full bg-muted">
                                <div className="h-1 rounded-full bg-primary/60" style={{ width: `${(count / places.length) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}

              {!placesLoading && places.length === 0 && !placesError && (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Click analyse</div>
                    <div className="mt-1 text-xs text-muted-foreground">Fetches real business data from Google Places to score this OOH location</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
