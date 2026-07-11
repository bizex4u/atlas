// Evidence collectors. Each pulls from a real source and normalizes to Evidence.
// NO AI here — pure fetch + shape. Runs in parallel from the orchestrator.
import { fetchBrandNews } from "@/lib/ai.functions";
import type { City, Company, Evidence, EvidenceType } from "./types";

let _seq = 0;
function ev(e: Omit<Evidence, "id">): Evidence {
  return { id: `e${++_seq}`, ...e };
}

function classifyNews(title: string): EvidenceType {
  const t = title.toLowerCase();
  if (/rais(e|ed|es)|funding|series |investment|invests?/.test(t)) return "funding";
  if (/hiring|store manager|recruit|jobs|appoints|onboard/.test(t)) return "hiring";
  if (/expand|expansion|opens?|launch|new store|enters/.test(t)) return "expansion";
  return "news";
}

// ── News / funding / hiring / expansion (Google News RSS) ────────────────────
export async function collectNews(company: Company): Promise<Evidence[]> {
  const items = await fetchBrandNews(company.name, 12);
  return items.map((n) =>
    ev({
      source: n.source || "Google News",
      type: classifyNews(n.title),
      date: n.publishedAt,
      confidence: 0.85,
      url: n.url,
      content: n.title,
    })
  );
}

// ── Google Places (per city — footfall anchors near city centre) ─────────────
interface PlaceLite { name: string; category: string; lat: number; lng: number }
async function placesNear(lat: number, lng: number): Promise<PlaceLite[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.displayName,places.types,places.location",
      },
      body: JSON.stringify({
        includedTypes: ["shopping_mall", "supermarket", "transit_station", "corporate_office", "university"],
        maxResultCount: 20,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 4000 } },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const j = (await res.json()) as { places?: { displayName?: { text?: string }; types?: string[]; location?: { latitude: number; longitude: number } }[] };
    return (j.places || []).map((p) => ({
      name: p.displayName?.text || "place",
      category: p.types?.[0]?.replace(/_/g, " ") || "place",
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
    }));
  } catch { return []; }
}

export async function collectPlaces(cities: City[]): Promise<Evidence[]> {
  const withCoords = cities.filter((c) => c.lat && c.lng);
  const out: Evidence[] = [];
  await Promise.all(
    withCoords.map(async (c) => {
      const places = await placesNear(c.lat!, c.lng!);
      if (!places.length) return;
      const counts: Record<string, number> = {};
      for (const p of places) counts[p.category] = (counts[p.category] || 0) + 1;
      out.push(
        ev({
          source: "Google Places",
          type: "places",
          confidence: 1.0,
          city: c.name,
          content: `${c.name}: ${places.length} high-footfall venues nearby — ${Object.entries(counts).map(([k, v]) => `${k} ×${v}`).join(", ")}`,
          data: { count: places.length, byCategory: counts, anchors: places.slice(0, 8).map((p) => p.name) },
        })
      );
    })
  );
  return out;
}

// ── Quick-commerce serviceability (Swiggy public API) as retail-density proxy ─
export async function collectServiceability(cities: City[]): Promise<Evidence[]> {
  const withCoords = cities.filter((c) => c.lat && c.lng);
  const out: Evidence[] = [];
  await Promise.all(
    withCoords.map(async (c) => {
      try {
        const r = await fetch(
          `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${c.lat}&lng=${c.lng}&page_type=DESKTOP_WEB_LISTING`,
          { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }, signal: AbortSignal.timeout(7000) }
        );
        const txt = r.ok ? await r.text() : "";
        const serviceable = txt.includes('"serviceability":"SERVICEABLE"') || txt.includes('"statusMessage":"done successfully"');
        const notServ = txt.includes("swiggy_not_present");
        out.push(
          ev({
            source: "Swiggy",
            type: "serviceability",
            confidence: 0.9,
            city: c.name,
            content: `${c.name} is ${notServ ? "NOT " : ""}covered by quick-commerce/food delivery (retail-density proxy).`,
            data: { serviceable: serviceable && !notServ },
          })
        );
      } catch { /* skip */ }
    })
  );
  return out;
}

// ── Expansion / dark-store signals (q-commerce + retail expansion press) ─────
export async function collectExpansion(company: Company): Promise<Evidence[]> {
  const q = encodeURIComponent(`"${company.name}" (expansion OR "new store" OR stores OR warehouse OR "dark store" OR hiring)`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(7000) });
    if (!r.ok) return [];
    const xml = await r.text();
    const out: Evidence[] = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && out.length < 6) {
      const b = m[1];
      const strip = (s: string) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
      const title = strip(b.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
      const link = strip(b.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
      const pub = strip(b.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
      if (!title) continue;
      out.push(ev({ source: "Google News", type: "expansion", date: pub, confidence: 0.75, url: link, content: title }));
    }
    return out;
  } catch { return []; }
}
