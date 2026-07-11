import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ── Google Places (New) ───────────────────────────────────────────────────────

const PlacesInput = z.object({
  lat: z.number(),
  lng: z.number(),
  radius: z.number().default(500),
});

export interface PlaceBusiness {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceLevel: number; // 0-4
  lat: number;
  lng: number;
  distance: number;
  openNow: boolean | null;
}

export const fetchNearbyPlaces = createServerFn({ method: "POST" })
  .validator((d: unknown) => PlacesInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return { places: [], error: "GOOGLE_PLACES_API_KEY not set" };

    const body = {
      includedTypes: [
        "shopping_mall", "supermarket", "department_store",
        "school", "university", "hospital",
        "bus_station", "transit_station",
        "restaurant", "cafe", "fast_food_restaurant",
        "movie_theater", "amusement_park",
        "bank", "atm", "gas_station",
      ],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: data.lat, longitude: data.lng },
          radius: data.radius,
        },
      },
      rankPreference: "POPULARITY",
    };

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.displayName,places.types,places.rating,places.userRatingCount,places.priceLevel,places.location,places.currentOpeningHours",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { places: [], error: `Places API error ${res.status}: ${txt.slice(0, 200)}` };
    }

    const json = (await res.json()) as {
      places?: {
        displayName?: { text?: string };
        types?: string[];
        rating?: number;
        userRatingCount?: number;
        priceLevel?: string;
        location?: { latitude: number; longitude: number };
        currentOpeningHours?: { openNow?: boolean };
      }[];
    };

    const priceLevelMap: Record<string, number> = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };

    function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    const places: PlaceBusiness[] = (json.places || []).map((p) => ({
      name: p.displayName?.text || "Unknown",
      category: p.types?.[0]?.replace(/_/g, " ") || "place",
      rating: p.rating || 0,
      reviewCount: p.userRatingCount || 0,
      priceLevel: priceLevelMap[p.priceLevel || ""] ?? -1,
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
      distance: haversine(data.lat, data.lng, p.location?.latitude || 0, p.location?.longitude || 0),
      openNow: p.currentOpeningHours?.openNow ?? null,
    }));

    // footfall score = rating × log10(reviews+1) normalized 0-100
    const maxScore = Math.max(...places.map((p) => p.rating * Math.log10(p.reviewCount + 1)), 1);
    const scoredPlaces = places.map((p) => ({
      ...p,
      footfallScore: Math.round(((p.rating * Math.log10(p.reviewCount + 1)) / maxScore) * 100),
    }));

    return { places: scoredPlaces, error: null };
  });

// ── Partner doc parsing via Groq Vision (llama-4-scout, free) ────────────────

const HFInput = z.object({
  content: z.string(),   // base64 image OR raw text
  mimeType: z.string(),  // "image/jpeg" | "text/plain" | "application/pdf"
  fileName: z.string().default("file"),
});

export const parseWithHF = createServerFn({ method: "POST" })
  .validator((d: unknown) => HFInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { sites: [], error: "GROQ_API_KEY not set in .env", tokensUsed: 0 };

    const isImage = data.mimeType.startsWith("image/");
    const prompt = `You are an OOH (Out-of-Home) advertising expert in India. Extract ALL advertising media sites from this ${isImage ? "image" : "document"}.

IMPORTANT EXTRACTION RULES:
1. GPS OVERLAY: If image has a GPS Map Camera watermark with lat/long coordinates, extract EXACT lat/lng values shown. Also extract full address shown.
2. FORMAT DETECTION: Be specific — use: Hoarding, Unipole, DOOH, Bus Shelter, Metro Panel, Mall Display, Society Lift, Airport Terminal, Transit Panel, Wall Wrap, Tree Guard, Highway Media, Radio, Newspaper, Magazine, Event Sponsorship, Cinema. Use "DOOH" for outdoor LED/digital screens (not indoor). Use "Digital" only for indoor screens.
3. SIZE: Extract width × height in feet. If "65 inch" visible, note in notes field.
4. ADDRESS: If GPS overlay shows full address, put it in notes field.
5. SITE NAME: Use any visible text label or signage name. If not visible, describe location precisely (e.g. "DOOH Screen at Golf Practice Ground, Gulistan Colony").

Return ONLY a JSON array, no markdown, no explanation:
[{"name":"site name","city":"city name","format":"DOOH|Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit Panel|Society Lift|Airport Terminal|Wall Wrap|Tree Guard|Highway Media|Digital|Radio|Newspaper|Magazine|Event Sponsorship|Cinema","monthlyRent":number,"width":number,"height":number,"lat":number,"lng":number,"address":"full address if visible","notes":"illumination, size details, address, any other info"}]
If lat/lng not visible, estimate from city/area. If rent not visible set 0. Extract ALL sites visible.`;

    const messages = isImage
      ? [{ role: "user", content: [
          { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.content}` } },
          { type: "text", text: prompt },
        ]}]
      : [{ role: "user", content: `${prompt}\n\nDOCUMENT:\n${data.content.slice(0, 8000)}` }];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { sites: [], error: `Groq vision error ${res.status}: ${txt.slice(0, 200)}`, tokensUsed: 0 };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const raw = json.choices?.[0]?.message?.content?.trim() || "[]";
    const tokensUsed = json.usage?.total_tokens || 0;

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");
      const sites = JSON.parse(start >= 0 ? cleaned.slice(start, end + 1) : cleaned);
      return { sites: Array.isArray(sites) ? sites : [], error: null, tokensUsed };
    } catch {
      return { sites: [], error: "Could not parse vision response. Retry or check file quality.", tokensUsed };
    }
  });

// ── Site photo analysis (Groq Vision) ────────────────────────────────────────

const SitePhotoInput = z.object({
  image: z.string(),    // base64 jpeg
  siteName: z.string().default(""),
  city: z.string().default(""),
});

export const analyzeSitePhoto = createServerFn({ method: "POST" })
  .validator((d: unknown) => SitePhotoInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { tags: [], description: null, error: "GROQ_API_KEY not set", tokensUsed: 0 };

    const prompt = `You are an OOH media auditor in India inspecting a site photo${data.siteName ? ` of "${data.siteName}"` : ""}${data.city ? ` in ${data.city}` : ""}.
Return ONLY JSON, no markdown:
{"tags":["5-10 short searchable tags: media type, lit/non-lit, road type, nearby landmarks, traffic density, condition"],"description":"2 sentences: what the site is, visibility quality, surroundings — written to help sell it"}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${data.image}` } },
          { type: "text", text: prompt },
        ]}],
        max_tokens: 400,
        temperature: 0.2,
      }),
    });
    if (!res.ok) return { tags: [], description: null, error: `Groq vision error ${res.status}`, tokensUsed: 0 };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: { total_tokens?: number } };
    const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const s = cleaned.indexOf("{"), e = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(cleaned.slice(s, e + 1)) as { tags?: string[]; description?: string };
      return { tags: (parsed.tags || []).slice(0, 10), description: parsed.description || null, error: null, tokensUsed: json.usage?.total_tokens || 0 };
    } catch {
      return { tags: [], description: null, error: "Could not parse vision response", tokensUsed: json.usage?.total_tokens || 0 };
    }
  });

// ── Excel parsing (server-side, no AI) ───────────────────────────────────────

const ExcelInput = z.object({
  content: z.string(), // base64 xlsx
});

export const parseExcel = createServerFn({ method: "POST" })
  .validator((d: unknown) => ExcelInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const XLSX = await import("xlsx");
      const buf = Buffer.from(data.content, "base64");
      const wb = XLSX.read(buf, { type: "buffer" });

      const allSites: {
        name: string; city: string; format: string; monthlyRent: number;
        width: number; height: number; lat: number; lng: number; notes: string;
      }[] = [];

      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
        if (!rows.length) continue;

        // Auto-detect columns by fuzzy header matching
        const headers = Object.keys(rows[0]).map((h) => String(h).toLowerCase().trim());

        function col(row: Record<string, unknown>, patterns: string[]): string {
          const key = Object.keys(row).find((k) =>
            patterns.some((p) => k.toLowerCase().includes(p))
          );
          return key ? String(row[key] || "").trim() : "";
        }
        function numCol(row: Record<string, unknown>, patterns: string[]): number {
          const v = col(row, patterns);
          return parseFloat(v.replace(/[₹,\s]/g, "")) || 0;
        }

        for (const row of rows) {
          const name = col(row, ["site name", "name", "location", "site", "hoarding", "media"]);
          if (!name || name.length < 2) continue;

          const city = col(row, ["city", "town", "district", "area", "region"]);
          const format = col(row, ["format", "type", "media type", "medium"]);
          const rent = numCol(row, ["rate", "rent", "cost", "price", "monthly", "amount"]);
          const width = numCol(row, ["width", "w ", "breadth"]);
          const height = numCol(row, ["height", "h ", "length"]);
          const notes = [
            col(row, ["illumination", "light", "lit"]),
            col(row, ["traffic", "footfall", "visibility"]),
            col(row, ["remark", "note", "comment", "description"]),
          ].filter(Boolean).join(" | ");

          allSites.push({ name, city, format, monthlyRent: rent, width, height, lat: 0, lng: 0, notes });
        }
      }

      return { sites: allSites, error: null, sheets: wb.SheetNames.length };
    } catch (e: unknown) {
      return { sites: [], error: `Excel parse error: ${e instanceof Error ? e.message : "unknown"}`, sheets: 0 };
    }
  });

// ── Partner doc parsing via Qwen2-VL (OpenRouter) ────────────────────────────

const ParseDocInput = z.object({
  content: z.string(), // base64 image OR extracted text
  mimeType: z.string(), // "image/jpeg" | "image/png" | "text/plain"
  openrouterKey: z.string(),
});

export const parsePartnerDoc = createServerFn({ method: "POST" })
  .validator((d: unknown) => ParseDocInput.parse(d))
  .handler(async ({ data }) => {
    if (!data.openrouterKey) return { sites: [], error: "OpenRouter API key not set in Settings." };

    const isImage = data.mimeType.startsWith("image/");

    const userContent = isImage
      ? [
          {
            type: "image_url",
            image_url: { url: `data:${data.mimeType};base64,${data.content}` },
          },
          {
            type: "text",
            text: `You are an OOH (Out-of-Home) media expert. Extract all advertising sites from this image/document.
Return ONLY a JSON array (no markdown, no explanation):
[{"name":"site name","city":"city","format":"Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit|Digital","monthlyRent":number,"lat":number,"lng":number,"notes":"any extra info"}]
If lat/lng not visible, estimate from city name. If rent not visible, set 0. Extract ALL sites you see.`,
          },
        ]
      : `You are an OOH (Out-of-Home) media expert. Extract all advertising sites from this text document.
Return ONLY a JSON array (no markdown, no explanation):
[{"name":"site name","city":"city","format":"Hoarding|Unipole|Bus Shelter|Metro Panel|Mall Display|Transit|Digital","monthlyRent":number,"lat":number,"lng":number,"notes":"any extra info"}]
If lat/lng not visible, estimate from city name. If rent not visible, set 0. Extract ALL sites.

DOCUMENT TEXT:
${data.content}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.openrouterKey}`,
        "HTTP-Referer": "https://atlas.bizex4u.com",
        "X-Title": "Atlas OOH",
      },
      body: JSON.stringify({
        model: isImage ? "qwen/qwen2.5-vl-72b-instruct:free" : "qwen/qwen2.5-72b-instruct:free",
        messages: [{ role: "user", content: userContent }],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { sites: [], error: `OpenRouter error ${res.status}: ${txt.slice(0, 200)}` };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() || "[]";

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const sites = JSON.parse(cleaned);
      return { sites: Array.isArray(sites) ? sites : [], error: null };
    } catch {
      return { sites: [], error: "Could not parse AI response. Try again." };
    }
  });

// ── Tally sync ────────────────────────────────────────────────────────────────

const TallyInput = z.object({
  host: z.string().default("http://localhost:9000"),
  type: z.enum(["ping", "vouchers", "ledgers"]),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

function tallyXml(body: string) {
  return `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY>${body}</BODY></ENVELOPE>`;
}

export const tallySync = createServerFn({ method: "POST" })
  .validator((d: unknown) => TallyInput.parse(d))
  .handler(async ({ data }) => {
    const host = data.host || "http://localhost:9000";

    if (data.type === "ping") {
      try {
        const r = await fetch(host, {
          method: "POST",
          headers: { "Content-Type": "text/xml" },
          body: tallyXml(`<EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC></EXPORTDATA>`),
          signal: AbortSignal.timeout(4000),
        });
        if (r.ok) {
          const text = await r.text();
          const match = text.match(/<BASICCOMPANYNAME[^>]*>([^<]+)<\/BASICCOMPANYNAME>/);
          return { ok: true, company: match?.[1] || "Connected" };
        }
        return { ok: false, error: `Tally returned ${r.status}` };
      } catch (e: unknown) {
        return { ok: false, error: `Cannot reach Tally at ${host}. Is TallyPrime open?` };
      }
    }

    if (data.type === "vouchers") {
      const from = data.fromDate || new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10).replace(/-/g, "");
      const to = data.toDate || new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const xml = tallyXml(`<EXPORTDATA><REQUESTDESC><REPORTNAME>Voucher Register</REPORTNAME><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT><SVFROMDATE>${from}</SVFROMDATE><SVTODATE>${to}</SVTODATE></STATICVARIABLES></REQUESTDESC></EXPORTDATA>`);
      try {
        const r = await fetch(host, { method: "POST", headers: { "Content-Type": "text/xml" }, body: xml, signal: AbortSignal.timeout(10000) });
        if (!r.ok) return { ok: false, error: `Tally error ${r.status}`, vouchers: [] };
        const text = await r.text();
        const vouchers: { number: string; party: string; amount: number; date: string; type: string }[] = [];
        const re = /<VOUCHER[^>]*>([\s\S]*?)<\/VOUCHER>/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          const v = m[1];
          const get = (tag: string) => v.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`))?.[1]?.trim() || "";
          vouchers.push({
            number: get("VOUCHERNUMBER"),
            party: get("PARTYLEDGERNAME"),
            amount: parseFloat(get("AMOUNT") || "0"),
            date: get("DATE"),
            type: get("VOUCHERTYPENAME"),
          });
        }
        return { ok: true, vouchers, error: null };
      } catch {
        return { ok: false, error: "Tally request timed out.", vouchers: [] };
      }
    }

    return { ok: false, error: "Unknown type", vouchers: [] };
  });

const ChatInput = z.object({
  message: z.string().min(1),
  context: z.string().default(""),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});

// ── Area AI Analysis (Groq) ───────────────────────────────────────────────────

const AreaAnalysisInput = z.object({
  lat: z.number(),
  lng: z.number(),
  places: z.array(z.object({
    name: z.string(),
    category: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    priceLevel: z.number(),
    distance: z.number(),
    footfallScore: z.number(),
  })),
  avgRating: z.string(),
  totalReviews: z.number(),
  oohScore: z.number(),
  secLabel: z.string(),
});

export const analyzeAreaWithGroq = createServerFn({ method: "POST" })
  .validator((d: unknown) => AreaAnalysisInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { analysis: null, error: "GROQ_API_KEY not set" };

    const topBusinesses = data.places
      .slice(0, 10)
      .map((p) => `${p.name} (${p.category.replace(/_/g, " ")}, ${p.rating}★, ${p.reviewCount} reviews, ${p.distance}m away)`)
      .join("\n");

    const prompt = `You are an OOH (Out-of-Home) advertising expert in India analyzing a location for billboard/hoarding placement.

LOCATION DATA:
- Coordinates: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}
- OOH Score: ${data.oohScore}/100
- Avg business rating: ${data.avgRating}★
- Total reviews in area: ${data.totalReviews.toLocaleString("en-IN")}
- Estimated SEC: ${data.secLabel}

TOP BUSINESSES NEARBY:
${topBusinesses}

Provide a concise OOH intelligence report with these sections:
1. **Area Profile** (1-2 lines: what kind of area, vibe, time of day activity)
2. **Primary Audience** (SEC, age group, intent — commuter/shopper/resident)
3. **Best OOH Formats** for this location (e.g. Unipole, Bus Shelter, Hoarding)
4. **Top Brand Categories** that would benefit (list 4-5: FMCG, auto, fintech, etc.)
5. **Peak Visibility Hours** based on business types
6. **One-line pitch** for selling this location to an agency

Keep it punchy, India-specific, actionable. No fluff.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.6,
      }),
    });

    if (!res.ok) return { analysis: null, error: `Groq error ${res.status}` };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { analysis: json.choices?.[0]?.message?.content?.trim() || null, error: null };
  });

// ── Brand Recommender ─────────────────────────────────────────────────────────

export interface BrandRec {
  brand: string;
  category: string;
  logo: string;
  score: number;
  secFit: number;
  formatFit: number;
  footfallFit: number;
  audienceFit: number;
  pitch: string | null;
}

const BrandInput = z.object({
  lat: z.number(),
  lng: z.number(),
  format: z.string(),
  city: z.string(),
  oohScore: z.number(),
  secLabel: z.string(),
  avgRating: z.number(),
  totalReviews: z.number(),
  nearbyCategories: z.array(z.string()),
  generatePitch: z.boolean().default(false),
});

const BRANDS: {
  name: string; category: string; logo: string;
  sec: string[]; formats: string[]; audienceTriggers: string[]; cityTier: number;
}[] = [
  { name: "Amul", category: "FMCG", logo: "🧈", sec: ["B","C","D"], formats: ["Hoarding","Bus Shelter","Transit"], audienceTriggers: ["supermarket","school","hospital"], cityTier: 3 },
  { name: "Dabur", category: "FMCG", logo: "🌿", sec: ["B","C"], formats: ["Hoarding","Unipole","Transit"], audienceTriggers: ["hospital","supermarket"], cityTier: 3 },
  { name: "HUL", category: "FMCG", logo: "🧴", sec: ["B","C"], formats: ["Hoarding","Bus Shelter","Mall Display"], audienceTriggers: ["supermarket","shopping_mall","department_store"], cityTier: 3 },
  { name: "Nestle", category: "FMCG", logo: "🍫", sec: ["A","B"], formats: ["Mall Display","Hoarding","Digital"], audienceTriggers: ["shopping_mall","supermarket","school"], cityTier: 2 },
  { name: "ITC", category: "FMCG", logo: "🏭", sec: ["B","C"], formats: ["Hoarding","Unipole"], audienceTriggers: ["supermarket","restaurant","bus_station"], cityTier: 3 },
  { name: "Maruti Suzuki", category: "Auto", logo: "🚗", sec: ["B","C"], formats: ["Hoarding","Unipole"], audienceTriggers: ["bank","gas_station","shopping_mall"], cityTier: 3 },
  { name: "Honda", category: "Auto", logo: "🏎️", sec: ["A","B"], formats: ["Hoarding","Unipole","Digital"], audienceTriggers: ["bank","gas_station","university"], cityTier: 2 },
  { name: "Hyundai", category: "Auto", logo: "🚙", sec: ["A","B"], formats: ["Hoarding","Unipole"], audienceTriggers: ["bank","shopping_mall"], cityTier: 2 },
  { name: "TVS / Hero", category: "Auto (2W)", logo: "🏍️", sec: ["C","D"], formats: ["Hoarding","Bus Shelter","Transit"], audienceTriggers: ["school","university","bus_station"], cityTier: 3 },
  { name: "Bajaj Auto", category: "Auto (2W)", logo: "🛵", sec: ["C","D"], formats: ["Hoarding","Transit","Bus Shelter"], audienceTriggers: ["bus_station","school","gas_station"], cityTier: 3 },
  { name: "Jio", category: "Telecom", logo: "📶", sec: ["B","C","D"], formats: ["Hoarding","Bus Shelter","Unipole","Digital"], audienceTriggers: ["shopping_mall","transit_station","bus_station","university"], cityTier: 3 },
  { name: "Airtel", category: "Telecom", logo: "📡", sec: ["A","B"], formats: ["Hoarding","Unipole","Digital"], audienceTriggers: ["shopping_mall","transit_station","university"], cityTier: 2 },
  { name: "Vi", category: "Telecom", logo: "📱", sec: ["B","C"], formats: ["Hoarding","Bus Shelter"], audienceTriggers: ["transit_station","bus_station","shopping_mall"], cityTier: 3 },
  { name: "PhonePe", category: "Fintech", logo: "💜", sec: ["B","C","D"], formats: ["Hoarding","Bus Shelter","Transit","Digital"], audienceTriggers: ["bank","atm","supermarket","restaurant","bus_station"], cityTier: 3 },
  { name: "Paytm", category: "Fintech", logo: "💙", sec: ["C","D"], formats: ["Hoarding","Bus Shelter","Transit"], audienceTriggers: ["bank","atm","restaurant","supermarket"], cityTier: 3 },
  { name: "CRED", category: "Fintech", logo: "💳", sec: ["A"], formats: ["Hoarding","Unipole","Digital","Mall Display"], audienceTriggers: ["bank","shopping_mall","restaurant","amusement_park"], cityTier: 1 },
  { name: "Groww / Zerodha", category: "Fintech", logo: "📈", sec: ["A","B"], formats: ["Hoarding","Digital","Metro Panel"], audienceTriggers: ["bank","university","transit_station"], cityTier: 1 },
  { name: "Godrej Properties", category: "Real Estate", logo: "🏗️", sec: ["A","B"], formats: ["Hoarding","Unipole","Digital"], audienceTriggers: ["bank","university","transit_station","shopping_mall"], cityTier: 1 },
  { name: "Prestige / DLF", category: "Real Estate", logo: "🏢", sec: ["A"], formats: ["Hoarding","Unipole"], audienceTriggers: ["bank","hospital","transit_station"], cityTier: 1 },
  { name: "BYJU's / Allen", category: "Ed-Tech", logo: "📚", sec: ["B","C"], formats: ["Hoarding","Bus Shelter","Unipole"], audienceTriggers: ["school","university","transit_station","bus_station"], cityTier: 2 },
  { name: "Aakash Institute", category: "Ed-Tech", logo: "🎓", sec: ["B","C"], formats: ["Hoarding","Bus Shelter"], audienceTriggers: ["school","university"], cityTier: 2 },
  { name: "Swiggy", category: "Food Delivery", logo: "🧡", sec: ["A","B","C"], formats: ["Hoarding","Digital","Metro Panel","Bus Shelter"], audienceTriggers: ["restaurant","cafe","transit_station","university","shopping_mall"], cityTier: 2 },
  { name: "Zomato", category: "Food Delivery", logo: "❤️", sec: ["A","B","C"], formats: ["Hoarding","Digital","Metro Panel"], audienceTriggers: ["restaurant","cafe","transit_station","shopping_mall"], cityTier: 2 },
  { name: "Domino's", category: "QSR", logo: "🍕", sec: ["B","C"], formats: ["Hoarding","Mall Display","Bus Shelter"], audienceTriggers: ["shopping_mall","school","movie_theater"], cityTier: 2 },
  { name: "McDonald's", category: "QSR", logo: "🍟", sec: ["B","C"], formats: ["Mall Display","Hoarding","Digital"], audienceTriggers: ["shopping_mall","movie_theater","transit_station"], cityTier: 1 },
  { name: "Apollo Hospitals", category: "Healthcare", logo: "🏥", sec: ["A","B"], formats: ["Hoarding","Unipole","Digital"], audienceTriggers: ["hospital","transit_station"], cityTier: 2 },
  { name: "Cipla / Dr. Reddy's", category: "Pharma", logo: "💊", sec: ["B","C"], formats: ["Hoarding","Bus Shelter"], audienceTriggers: ["hospital","supermarket"], cityTier: 3 },
  { name: "LIC", category: "Insurance", logo: "🛡️", sec: ["B","C","D"], formats: ["Hoarding","Unipole","Bus Shelter"], audienceTriggers: ["bank","transit_station","bus_station"], cityTier: 3 },
  { name: "HDFC Bank", category: "Banking", logo: "🏦", sec: ["A","B"], formats: ["Hoarding","Unipole","Digital","Metro Panel"], audienceTriggers: ["bank","atm","shopping_mall","transit_station"], cityTier: 2 },
  { name: "SBI", category: "Banking", logo: "🔵", sec: ["B","C","D"], formats: ["Hoarding","Bus Shelter","Unipole"], audienceTriggers: ["bank","bus_station","transit_station"], cityTier: 3 },
  { name: "Reliance / JioMart", category: "Retail", logo: "🛒", sec: ["B","C"], formats: ["Hoarding","Mall Display","Bus Shelter"], audienceTriggers: ["shopping_mall","supermarket","transit_station"], cityTier: 3 },
  { name: "DMart", category: "Retail", logo: "🏪", sec: ["C","D"], formats: ["Hoarding","Unipole","Bus Shelter"], audienceTriggers: ["supermarket","bus_station","school"], cityTier: 3 },
  { name: "Amazon India", category: "E-Commerce", logo: "📦", sec: ["A","B","C"], formats: ["Hoarding","Unipole","Digital","Metro Panel"], audienceTriggers: ["transit_station","shopping_mall","university","bus_station"], cityTier: 2 },
  { name: "Flipkart", category: "E-Commerce", logo: "🛍️", sec: ["B","C"], formats: ["Hoarding","Unipole","Bus Shelter"], audienceTriggers: ["transit_station","bus_station","shopping_mall"], cityTier: 2 },
  { name: "Netflix / Hotstar", category: "OTT", logo: "🎬", sec: ["A","B"], formats: ["Digital","Metro Panel","Mall Display","Hoarding"], audienceTriggers: ["movie_theater","shopping_mall","amusement_park","transit_station"], cityTier: 1 },
  { name: "Nykaa", category: "Beauty", logo: "💄", sec: ["A","B"], formats: ["Mall Display","Digital","Hoarding"], audienceTriggers: ["shopping_mall","university","movie_theater"], cityTier: 1 },
  { name: "Mamaearth", category: "Beauty", logo: "🌱", sec: ["B","C"], formats: ["Hoarding","Mall Display","Bus Shelter"], audienceTriggers: ["shopping_mall","supermarket","hospital"], cityTier: 2 },
];

const SEC_ORDER = ["A","B","C","D"];

function scoreBrand(
  brand: typeof BRANDS[0],
  input: { format: string; oohScore: number; secLabel: string; nearbyCategories: string[] }
): Omit<BrandRec, "pitch"> {
  const secIdx = SEC_ORDER.indexOf(input.secLabel);
  const secFit = brand.sec.includes(input.secLabel)
    ? 30
    : brand.sec.some((s) => Math.abs(SEC_ORDER.indexOf(s) - secIdx) === 1) ? 15 : 0;

  const formatFit = brand.formats.includes(input.format) ? 25 : 0;
  const footfallFit = Math.round((input.oohScore / 100) * 20);

  const matched = brand.audienceTriggers.filter((trigger) =>
    input.nearbyCategories.some((cat) => cat.includes(trigger) || trigger.includes(cat.split(" ")[0]))
  ).length;
  const audienceFit = Math.min(25, Math.round((matched / Math.max(brand.audienceTriggers.length, 1)) * 25));

  return {
    brand: brand.name, category: brand.category, logo: brand.logo,
    score: secFit + formatFit + footfallFit + audienceFit,
    secFit, formatFit, footfallFit, audienceFit,
  };
}

export const recommendBrands = createServerFn({ method: "POST" })
  .validator((d: unknown) => BrandInput.parse(d))
  .handler(async ({ data }) => {
    const scored: BrandRec[] = BRANDS
      .map((b) => ({ ...scoreBrand(b, data), pitch: null as string | null }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (!data.generatePitch) return { brands: scored, error: null };

    const key = process.env.GROQ_API_KEY;
    if (!key) return { brands: scored, error: "GROQ_API_KEY not set" };

    const top5 = scored.slice(0, 5)
      .map((b) => `${b.logo} ${b.brand} (${b.category}, score ${b.score}/100)`)
      .join("\n");

    const prompt = `You are an OOH advertising sales expert in India.

SITE: ${data.city} | Format: ${data.format} | OOH Score: ${data.oohScore}/100 | SEC: ${data.secLabel}
Avg nearby rating: ${data.avgRating.toFixed(1)}★ | Total reviews: ${data.totalReviews.toLocaleString("en-IN")}

TOP BRAND MATCHES:
${top5}

Write ONE punchy agency-ready pitch paragraph (4-5 sentences). Open with why this location is powerful, name 2-3 specific brand opportunities with brief rationale, end with a compelling close for the media buyer. India-specific, data-driven, no fluff, no markdown.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.65,
      }),
    });

    const pitchText = res.ok
      ? ((await res.json()) as { choices?: { message?: { content?: string } }[] })
          .choices?.[0]?.message?.content?.trim() || null
      : null;

    const brandsWithPitch = scored.map((b, i) => ({ ...b, pitch: i === 0 ? pitchText : null }));
    return { brands: brandsWithPitch, error: null };
  });

// ── Campaign Planner (brief → site fitment) ──────────────────────────────────

const CampaignInput = z.object({
  brand: z.string(),
  category: z.string(),
  budget: z.number(),
  durationMonths: z.number().default(1),
  cities: z.array(z.string()),
  objective: z.string().default(""),
  audience: z.string().default(""),
  preferredFormats: z.array(z.string()).default([]),
  sites: z.array(z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    format: z.string(),
    monthlyRent: z.number(),
    status: z.string(),
    notes: z.string().default(""),
  })),
});

export const planCampaign = createServerFn({ method: "POST" })
  .validator((d: unknown) => CampaignInput.parse(d))
  .handler(async ({ data }) => {
    // Deterministic scoring: city match (40), format match (25), availability (20), budget fit (15)
    const cityset = data.cities.map((c) => c.toLowerCase().trim());
    const fmtset = data.preferredFormats.map((f) => f.toLowerCase());

    const scored = data.sites.map((s) => {
      const cityFit = cityset.some((c) => s.city.toLowerCase().includes(c) || c.includes(s.city.toLowerCase())) ? 40 : 0;
      const formatFit = fmtset.length === 0 ? 15 : fmtset.includes(s.format.toLowerCase()) ? 25 : 0;
      const availFit = s.status === "free" ? 20 : s.status === "expired" ? 12 : 0;
      const cost = s.monthlyRent * data.durationMonths;
      const budgetFit = cost > 0 && cost <= data.budget ? 15 : cost === 0 ? 5 : 0;
      return { ...s, score: cityFit + formatFit + availFit + budgetFit, cost, cityFit, formatFit, availFit, budgetFit };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

    // Greedy budget allocation on top-scored sites
    let remaining = data.budget;
    const plan: (typeof scored[0] & { inPlan: boolean })[] = scored.map((s) => {
      const fits = s.cost > 0 && s.cost <= remaining;
      if (fits) remaining -= s.cost;
      return { ...s, inPlan: fits };
    });

    const planSites = plan.filter((p) => p.inPlan);
    const totalCost = planSites.reduce((a, p) => a + p.cost, 0);

    // Groq rationale
    let rationale: string | null = null;
    const key = process.env.GROQ_API_KEY;
    if (key && planSites.length > 0) {
      const summary = planSites.slice(0, 12)
        .map((p) => `${p.name} (${p.city}, ${p.format}, ₹${p.cost.toLocaleString("en-IN")}/${data.durationMonths}mo, score ${p.score})`)
        .join("\n");
      const prompt = `You are a senior OOH media planner in India. Campaign brief:
Brand: ${data.brand} (${data.category}) | Budget: ₹${data.budget.toLocaleString("en-IN")} | Duration: ${data.durationMonths} months
Cities: ${data.cities.join(", ")} | Objective: ${data.objective || "brand awareness"} | Audience: ${data.audience || "general"}

RECOMMENDED PLAN (${planSites.length} sites, total ₹${totalCost.toLocaleString("en-IN")}):
${summary}

Write a concise media plan rationale (4-6 sentences): why this mix works for the brand, coverage logic, one risk/gap to flag, and expected impact. India-specific, no fluff, no markdown headers.`;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 400, temperature: 0.5 }),
      });
      if (res.ok) {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        rationale = json.choices?.[0]?.message?.content?.trim() || null;
      }
    }

    return { plan, totalCost, remaining, rationale, error: null };
  });

// ── Proposal copy generator ───────────────────────────────────────────────────

const ProposalInput = z.object({
  brand: z.string(),
  category: z.string(),
  objective: z.string().default(""),
  durationMonths: z.number().default(1),
  sites: z.array(z.object({
    name: z.string(), city: z.string(), format: z.string(),
    monthlyRent: z.number(), notes: z.string().default(""),
  })),
});

export const generateProposalCopy = createServerFn({ method: "POST" })
  .validator((d: unknown) => ProposalInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { intro: null, siteBlurbs: [], closing: null, error: "GROQ_API_KEY not set" };

    const siteList = data.sites.map((s, i) => `${i + 1}. ${s.name} — ${s.city}, ${s.format}, ₹${s.monthlyRent.toLocaleString("en-IN")}/mo${s.notes ? ` (${s.notes.slice(0, 80)})` : ""}`).join("\n");

    const prompt = `You are writing an OOH media proposal for BIZEX4U (media agency, Lucknow, India) to pitch ${data.brand} (${data.category}).
Objective: ${data.objective || "brand visibility"}. Duration: ${data.durationMonths} months.

SITES IN PROPOSAL:
${siteList}

Return ONLY JSON, no markdown:
{"intro":"2-3 sentence opening paragraph addressed to the brand — why this plan fits them","siteBlurbs":["one punchy sentence per site, same order as list, selling that specific location"],"closing":"1-2 sentence close with call to action"}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 900, temperature: 0.6 }),
    });
    if (!res.ok) return { intro: null, siteBlurbs: [], closing: null, error: `Groq error ${res.status}` };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { intro?: string; siteBlurbs?: string[]; closing?: string };
      return { intro: parsed.intro || null, siteBlurbs: parsed.siteBlurbs || [], closing: parsed.closing || null, error: null };
    } catch {
      return { intro: null, siteBlurbs: [], closing: null, error: "Could not parse AI response" };
    }
  });

// ── Market Intelligence ───────────────────────────────────────────────────────

const IntelInput = z.object({
  city: z.string(),
  dealHistory: z.array(z.object({
    brand: z.string(), category: z.string(), stage: z.string(), value: z.number(),
  })).default([]),
});

export const marketIntel = createServerFn({ method: "POST" })
  .validator((d: unknown) => IntelInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { report: null, error: "GROQ_API_KEY not set" };

    const history = data.dealHistory.length
      ? `MY PIPELINE HISTORY:\n${data.dealHistory.map((d2) => `${d2.brand} (${d2.category}) — ${d2.stage}, ₹${d2.value.toLocaleString("en-IN")}`).join("\n")}`
      : "No pipeline history yet.";

    const month = new Date().toLocaleString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

    const prompt = `You are an OOH market intelligence analyst for a traditional media agency in ${data.city}, India. Current month: ${month}.

${history}

Produce a prospecting intelligence report with these sections (use these exact headings, markdown ## format):
## Active Spender Categories
Which brand categories typically spend heavily on OOH/print/radio in ${data.city} this season (festivals, weather, academic calendar, elections if relevant). 4-5 categories with one-line why.
## Hot Prospects This Month
8-10 specific brand names (mix of national + regional brands active in Uttar Pradesh / ${data.city} market) worth cold-calling now, each with one-line hook.
## Seasonal Angle
What's coming in next 60 days (festivals, events, seasons) that brands will want media for. Be specific to ${data.city}/UP.
## Gap in My Pipeline
Compare my history above against active categories — which high-spending category am I missing.
IMPORTANT: These are analytical estimates based on market patterns, not verified spend data. Keep it punchy and actionable.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1200, temperature: 0.6 }),
    });
    if (!res.ok) return { report: null, error: `Groq error ${res.status}` };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { report: json.choices?.[0]?.message?.content?.trim() || null, error: null };
  });

// ── Media Plan (brand + city → cross-channel plan, AI, no inventory) ──────────

const MediaPlanInput = z.object({
  brand: z.string(),
  category: z.string().default(""),
  cities: z.array(z.string()),
  budget: z.number().default(0),
  durationMonths: z.number().default(1),
  objective: z.string().default(""),
  audience: z.string().default(""),
});

export interface MediaChannelRec {
  channel: string;      // "OOH — Hoardings & Unipoles"
  fit: "High" | "Medium" | "Low";
  why: string;
  specifics: string;    // real localities / publications / stations for that city
  estCostBand: string;  // India-specific rough monthly band
  budgetPct: number;    // suggested share of budget 0-100
}

export interface MediaPlanResult {
  brandSnapshot: string;
  audience: string;
  channels: MediaChannelRec[];
  cityHotspots: string[];
  pitch: string;
  nextSteps: string[];
}

export const mediaPlan = createServerFn({ method: "POST" })
  .validator((d: unknown) => MediaPlanInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { plan: null as MediaPlanResult | null, error: "GROQ_API_KEY not set" };

    const cityList = data.cities.join(", ");
    const budgetLine = data.budget > 0
      ? `Budget: ₹${data.budget.toLocaleString("en-IN")} for ${data.durationMonths} month(s).`
      : "Budget: not specified — suggest a sensible range.";

    const prompt = `You are a senior traditional-media planner at BIZEX4U, a media agency in India. A brand has approached us to advertise. Build a practical, city-specific media plan across ALL traditional channels we can sell.

BRAND: ${data.brand}${data.category ? ` (${data.category})` : ""}
TARGET CITIES: ${cityList}
${budgetLine}
Objective: ${data.objective || "brand awareness + reach"}
Audience: ${data.audience || "infer from the brand"}

Return ONLY valid JSON, no markdown, in EXACTLY this shape:
{
  "brandSnapshot": "2-3 sentences: what ${data.brand} sells, positioning, who buys it",
  "audience": "1-2 sentences: the real target audience in ${cityList} (SEC, age, intent)",
  "channels": [
    {
      "channel": "e.g. OOH — Hoardings & Unipoles | Newspaper — Regional | Radio | Cinema | Transit (Bus/Auto) | DOOH & Digital Screens | Society/Mall Branding | Events & Activation",
      "fit": "High | Medium | Low",
      "why": "1-2 sentences why this channel fits ${data.brand} in ${cityList}",
      "specifics": "REAL India specifics for ${cityList}: name actual newspapers (e.g. Dainik Jagran, Amar Ujala, Hindustan, Times of India), radio stations (Radio Mirchi 98.3, Red FM 93.5, BIG FM 92.7), key OOH localities/landmarks, cinema chains (PVR/INOX), transit routes",
      "estCostBand": "rough India monthly cost band in ₹ (label as estimate)",
      "budgetPct": number 0-100
    }
  ],
  "cityHotspots": ["5-8 specific high-visibility localities/landmarks in ${cityList} for OOH placement"],
  "pitch": "One punchy 4-5 sentence pitch paragraph addressed to ${data.brand} to win this deal — India-specific, confident, no fluff",
  "nextSteps": ["3-4 concrete next actions to close the deal, e.g. share site photos for X, confirm availability, send costing"]
}

Rank channels best-fit first. budgetPct across channels should sum to ~100. Be specific to the named cities — no generic filler. All costs are agency estimates.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2200,
        temperature: 0.55,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { plan: null as MediaPlanResult | null, error: `Groq error ${res.status}: ${txt.slice(0, 160)}` };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const parsed = JSON.parse(cleaned.slice(start, end + 1)) as MediaPlanResult;
      // Normalize
      parsed.channels = (parsed.channels || []).map((c) => ({
        channel: String(c.channel || "Channel"),
        fit: (["High", "Medium", "Low"].includes(c.fit) ? c.fit : "Medium") as MediaChannelRec["fit"],
        why: String(c.why || ""),
        specifics: String(c.specifics || ""),
        estCostBand: String(c.estCostBand || "—"),
        budgetPct: Number(c.budgetPct) || 0,
      }));
      parsed.cityHotspots = parsed.cityHotspots || [];
      parsed.nextSteps = parsed.nextSteps || [];
      return { plan: parsed, error: null };
    } catch {
      return { plan: null as MediaPlanResult | null, error: "Could not parse AI plan. Retry." };
    }
  });

// ── TAM news ingestion (RSS, free, server-side) ──────────────────────────────

export interface NewsItem { title: string; url: string; source: string; publishedAt: string }

const RSS_FEEDS: { url: string; source: string }[] = [
  { url: "https://inc42.com/feed/", source: "Inc42" },
  { url: "https://yourstory.com/feed", source: "YourStory" },
  { url: "https://brandequity.economictimes.indiatimes.com/rss/topstories", source: "ET BrandEquity" },
  { url: "https://retail.economictimes.indiatimes.com/rss/topstories", source: "ET Retail" },
  // Google News queries scoped to BIZEX4U TAM
  { url: "https://news.google.com/rss/search?q=India+D2C+brand+(launch+OR+funding+OR+expansion)&hl=en-IN&gl=IN&ceid=IN:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=India+consumer+brand+(marketing+campaign+OR+CMO+OR+retail+stores)&hl=en-IN&gl=IN&ceid=IN:en", source: "Google News" },
];

// TAM filter: consumer brands doing things that create barter/media demand
const TAM_KEYWORDS = [
  "launch", "launches", "unveil", "raises", "funding", "series ", "d2c", "fmcg",
  "brand", "retail", "store", "stores", "expansion", "expands", "marketing",
  "campaign", "cmo", "advertising", "festive", "consumer", "electronics",
  "appliance", "wearable", "beverage", "food", "apparel", "beauty", "skincare",
  "smartwatch", "quick commerce", "ecommerce", "e-commerce", "offline",
];
const TAM_EXCLUDE = ["crypto", "layoff", "lawsuit", "ipo listing gain", "stock market today", "sensex", "nifty"];

function stripCdata(s: string) {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();
}

async function fetchFeed(feed: { url: string; source: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (AtlasBriefing/1.0)" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: NewsItem[] = [];
    const re = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = re.exec(xml)) !== null && items.length < 25) {
      const block = m[1];
      const title = stripCdata(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
      const link = stripCdata(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
      const pub = stripCdata(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "");
      // Google News appends " - Publisher" to titles
      const srcTag = stripCdata(block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "");
      if (!title || !link) continue;
      items.push({ title, url: link, source: srcTag || feed.source, publishedAt: pub });
    }
    return items;
  } catch { return []; }
}

export async function fetchTamNews(maxItems = 35): Promise<NewsItem[]> {
  const all = (await Promise.all(RSS_FEEDS.map(fetchFeed))).flat();
  // Rolling 7-day news window (e.g. on 7 July → 1–7 July)
  const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
  const seen = new Set<string>();
  const filtered = all.filter((n) => {
    const t = n.title.toLowerCase();
    if (seen.has(t.slice(0, 60))) return false;
    seen.add(t.slice(0, 60));
    if (TAM_EXCLUDE.some((k) => t.includes(k))) return false;
    if (!TAM_KEYWORDS.some((k) => t.includes(k))) return false;
    const ts = Date.parse(n.publishedAt);
    if (!Number.isNaN(ts) && ts < cutoff) return false;
    return true;
  });
  filtered.sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  return filtered.slice(0, maxItems);
}

// ── Brand-specific news (Google News RSS) ────────────────────────────────────

export async function fetchBrandNews(brand: string, maxItems = 12): Promise<NewsItem[]> {
  const q = encodeURIComponent(`"${brand}" India`);
  const items = await fetchFeed({
    url: `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`,
    source: "Google News",
  });
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000; // 30 days for brand-specific
  return items
    .filter((n) => Number.isNaN(Date.parse(n.publishedAt)) || Date.parse(n.publishedAt) >= cutoff)
    .slice(0, maxItems);
}

// ── Brand × City Intelligence (the flagship report) ──────────────────────────

const IntelReportInput = z.object({
  brand: z.string(),
  city: z.string(),
  objective: z.string().default(""),
  audience: z.string().default(""),
  budget: z.number().default(0),
  category: z.string().default(""),
});

export interface BrandProfile {
  businessModel: string;
  targetAudience: string;
  purchaseBehaviour: string;
  marketingStyle: string;
  expansion: string;
  competitors: string[];
  seasonality: string;
  oohUseCases: string[];
}
export interface CitySignal { signal: string; meaning: string; source?: OppSource }
export interface PincodeScore {
  pincode: string;
  area: string;
  lat: number;
  lng: number;
  score: number;
  reasons: string[];
  profile: string; // who lives/works here
}
export interface ZoneRec {
  name: string;
  kind: string;      // "Railway Station" | "IT Park" | "Shopping District" | ...
  lat: number;
  lng: number;
  whyPeople: string; // human behaviour reasoning
  media: string[];   // recommended OOH formats
  reasoning: string; // senior-planner paragraph: why advertise HERE
  confidence: number;
}
export interface CampaignPlan {
  mediaMix: { format: string; zones: string; share: string }[];
  estReach: string;
  frequency: string;
  duration: string;
  barterValue: string;
  inventoryFit: string;
  likelihood: number;
  pitchAngle: string;
  whyBizex4u: string;
  outreach: string;  // personalised outreach summary paragraph
}
export interface BrandCityReport {
  profile: BrandProfile;
  signals: CitySignal[];
  cityOverview: string;
  pincodes: PincodeScore[];
  zones: ZoneRec[];
  campaign: CampaignPlan;
  newsCount: number;
}

async function groqJSON(key: string, prompt: string, maxTokens: number): Promise<Record<string, unknown> | null> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1));
  } catch { return null; }
}

export const brandCityIntel = createServerFn({ method: "POST" })
  .validator((d: unknown) => IntelReportInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { report: null as BrandCityReport | null, error: "GROQ_API_KEY not set" };

    // Real brand news (Google News, last 30 days)
    const news = await fetchBrandNews(data.brand, 12);
    const newsBlock = news.length
      ? news.map((n, i) => `[${i}] ${n.title} (${n.source}, ${n.publishedAt.slice(0, 16)})`).join("\n")
      : "none found";

    const ctx = `BRAND: ${data.brand}${data.category ? ` (${data.category})` : ""} | CITY: ${data.city}, India
${data.objective ? `Objective: ${data.objective}. ` : ""}${data.audience ? `Audience: ${data.audience}. ` : ""}${data.budget > 0 ? `Budget: ₹${data.budget.toLocaleString("en-IN")}. ` : ""}
You are a senior media planner + brand strategist + location intelligence analyst at BIZEX4U, an Indian OOH/media-barter agency. Never output raw data — always reason like a consultant. Every claim should carry WHY.`;

    // Call A: brand understanding + live signals + campaign strategy
    const promptA = `${ctx}

REAL RECENT HEADLINES about ${data.brand} (last 30 days):
${newsBlock}

Return ONLY valid JSON:
{
  "profile": {
    "businessModel": "1-2 sentences",
    "targetAudience": "who buys, SEC, age, intent",
    "purchaseBehaviour": "how/when customers buy (impulse vs planned, time-of-day peaks)",
    "marketingStyle": "how this brand markets today",
    "expansion": "current expansion strategy incl. dark stores/warehouses/retail footprint if relevant",
    "competitors": ["3-5 direct competitors in India"],
    "seasonality": "seasonal demand pattern",
    "oohUseCases": ["3-5 ideal OOH use cases for this brand"]
  },
  "signals": [4-6 items: {"signal": "the event/pattern", "meaning": "what it MEANS commercially for approaching them now", "sourceIdx": headline index or null}],
  "campaign": {
    "mediaMix": [{"format": "e.g. Digital OOH screens", "zones": "where in ${data.city}", "share": "e.g. 30%"}] (4-6 rows),
    "estReach": "estimated monthly reach band",
    "frequency": "expected exposure frequency",
    "duration": "ideal campaign duration + why",
    "barterValue": "suggested barter deal band in ₹",
    "inventoryFit": "what inventory they'd trade and how liquid it is for us",
    "likelihood": 0-100,
    "pitchAngle": "the ONE angle to lead with",
    "whyBizex4u": "2-3 sentences: why BIZEX4U specifically, cash-preservation barter framing",
    "outreach": "4-5 sentence personalised outreach summary to send the brand — references their real moment, the city opportunity, ends with CTA"
  }
}`;

    // Call B: city + pincode intelligence + zone recommendations with coordinates
    const promptB = `${ctx}

Return ONLY valid JSON with REAL ${data.city} geography (real localities, real pincodes, approximate but plausible lat/lng coordinates):
{
  "cityOverview": "3-4 sentences: ${data.city} for this brand — population character, income, commercial zones, growth corridors, why it matters for ${data.brand}",
  "pincodes": [6-8 highest-opportunity REAL ${data.city} pincodes: {
    "pincode": "e.g. 226010",
    "area": "locality name",
    "lat": number, "lng": number,
    "score": 0-100 demand score,
    "reasons": ["3-5 short reasons: apartment density, IT employees, students, affluence, ordering behaviour"],
    "profile": "one line: who lives/works here"
  }] sorted by score desc,
  "zones": [6-9 specific advertising zones (real landmarks: stations, IT parks, universities, markets, malls, junctions): {
    "name": "real place name",
    "kind": "Railway Station|Metro|IT Park|University|Market|Mall|Junction|Residential Cluster|Highway",
    "lat": number, "lng": number,
    "whyPeople": "human behaviour: who is here, what state of mind, why they'd act on ${data.brand}'s message",
    "media": ["2-4 recommended OOH formats for this exact spot"],
    "reasoning": "3-4 sentence senior-media-planner paragraph: why ${data.brand} should advertise HERE — connect the location's flows to purchase moments. Never say just 'high traffic'.",
    "confidence": 0-100
  }]
}`;

    const [a, b] = await Promise.all([groqJSON(key, promptA, 2600), groqJSON(key, promptB, 3600)]);
    if (!a || !b) return { report: null as BrandCityReport | null, error: "AI analysis failed — retry" };

    try {
      type RawSignal = { signal: string; meaning: string; sourceIdx?: number | null };
      const signals: CitySignal[] = ((a.signals as RawSignal[]) || []).map((s) => {
        const n = s.sourceIdx != null ? news[Number(s.sourceIdx)] : undefined;
        return { signal: s.signal, meaning: s.meaning, source: n ? { title: n.title, url: n.url, source: n.source } : undefined };
      });
      const campaign = a.campaign as CampaignPlan;
      campaign.likelihood = Math.min(100, Math.max(0, Number(campaign.likelihood) || 50));
      const report: BrandCityReport = {
        profile: a.profile as BrandProfile,
        signals,
        cityOverview: String(b.cityOverview || ""),
        pincodes: ((b.pincodes as PincodeScore[]) || []).map((p) => ({
          ...p, lat: Number(p.lat) || 0, lng: Number(p.lng) || 0,
          score: Math.min(100, Math.max(0, Number(p.score) || 0)),
          reasons: p.reasons || [],
        })).sort((x, y) => y.score - x.score),
        zones: ((b.zones as ZoneRec[]) || []).map((z) => ({
          ...z, lat: Number(z.lat) || 0, lng: Number(z.lng) || 0,
          media: z.media || [],
          confidence: Math.min(100, Math.max(0, Number(z.confidence) || 60)),
        })),
        campaign,
        newsCount: news.length,
      };
      return { report, error: null };
    } catch {
      return { report: null as BrandCityReport | null, error: "Could not assemble report. Retry." };
    }
  });

// ── Quick-commerce serviceability probe (per pincode) ────────────────────────
// Swiggy's public web API responds server-side; Blinkit/Zepto sit behind
// Cloudflare, so those get manual check links in the UI instead.

const ServiceabilityInput = z.object({
  points: z.array(z.object({ pincode: z.string(), lat: z.number(), lng: z.number() })).max(10),
});

export interface ServiceabilityResult {
  pincode: string;
  swiggy: "serviceable" | "not_serviceable" | "unknown";
}

export const checkServiceability = createServerFn({ method: "POST" })
  .validator((d: unknown) => ServiceabilityInput.parse(d))
  .handler(async ({ data }) => {
    const results: ServiceabilityResult[] = await Promise.all(
      data.points.map(async (p) => {
        try {
          const res = await fetch(
            `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${p.lat}&lng=${p.lng}&page_type=DESKTOP_WEB_LISTING`,
            { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" }, signal: AbortSignal.timeout(7000) }
          );
          if (!res.ok) return { pincode: p.pincode, swiggy: "unknown" as const };
          const txt = await res.text();
          if (txt.includes("swiggy_not_present")) return { pincode: p.pincode, swiggy: "not_serviceable" as const };
          if (txt.includes('"serviceability":"SERVICEABLE"') || txt.includes('"statusMessage":"done successfully"'))
            return { pincode: p.pincode, swiggy: "serviceable" as const };
          return { pincode: p.pincode, swiggy: "unknown" as const };
        } catch {
          return { pincode: p.pincode, swiggy: "unknown" as const };
        }
      })
    );
    return { results, error: null };
  });

// ── Quick-commerce expansion watcher (dark-store / hiring signals) ───────────

const ExpansionInput = z.object({ city: z.string().default("") });

export interface ExpansionSignal {
  platform: "Blinkit" | "Zepto" | "Instamart" | "Q-commerce";
  kind: "Dark store" | "Hiring" | "Expansion" | "Market";
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

function classifyPlatform(t: string): ExpansionSignal["platform"] {
  const s = t.toLowerCase();
  if (s.includes("blinkit")) return "Blinkit";
  if (s.includes("zepto")) return "Zepto";
  if (s.includes("instamart")) return "Instamart";
  return "Q-commerce";
}
function classifyKind(t: string): ExpansionSignal["kind"] {
  const s = t.toLowerCase();
  if (s.includes("dark store") || s.includes("dark-store")) return "Dark store";
  if (s.includes("hiring") || s.includes("store manager") || s.includes("recruit") || s.includes("jobs")) return "Hiring";
  if (s.includes("expand") || s.includes("launch") || s.includes("stores") || s.includes("opens") || s.includes("enters")) return "Expansion";
  return "Market";
}

export const qcommExpansion = createServerFn({ method: "POST" })
  .validator((d: unknown) => ExpansionInput.parse(d))
  .handler(async ({ data }) => {
    const cityQ = data.city ? `+${encodeURIComponent(data.city)}` : "";
    const queries = [
      `(Blinkit+OR+Zepto+OR+Instamart)+(dark+store+OR+expansion+OR+new+stores)${cityQ}`,
      `(Blinkit+OR+Zepto)+(hiring+OR+store+manager+OR+warehouse+OR+jobs)${cityQ}`,
    ];
    const feeds = queries.map((q) => ({
      url: `https://news.google.com/rss/search?q=${q}&hl=en-IN&gl=IN&ceid=IN:en`,
      source: "Google News",
    }));
    const raw = (await Promise.all(feeds.map(fetchFeed))).flat();
    const seen = new Set<string>();
    const cutoff = Date.now() - 45 * 24 * 3600 * 1000;
    const signals: ExpansionSignal[] = [];
    for (const n of raw) {
      const key = n.title.slice(0, 60).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const t = n.title.toLowerCase();
      // must actually mention a q-commerce player
      if (!/blinkit|zepto|instamart|quick commerce|q-commerce|dark store/.test(t)) continue;
      if (data.city && !t.includes(data.city.toLowerCase())) {
        // keep city-agnostic national items too, but flag; skip only if clearly other-city — keep simple: keep all
      }
      const ts = Date.parse(n.publishedAt);
      if (!Number.isNaN(ts) && ts < cutoff) continue;
      signals.push({
        platform: classifyPlatform(n.title),
        kind: classifyKind(n.title),
        title: n.title, url: n.url, source: n.source, publishedAt: n.publishedAt,
      });
    }
    signals.sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
    return { signals: signals.slice(0, 20), error: null };
  });

// ── City fit ranking for a brand (national view) ─────────────────────────────

const CityFitInput = z.object({
  brand: z.string(),
  cities: z.array(z.string()).max(120),
});

export interface CityFit { city: string; score: number; why: string }

export const cityFitRank = createServerFn({ method: "POST" })
  .validator((d: unknown) => CityFitInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { fits: null as CityFit[] | null, error: "GROQ_API_KEY not set" };

    const prompt = `You are a national media planner at BIZEX4U (Indian media-barter agency). For the brand "${data.brand}", rank the 10 BEST target cities from this list for an advertising/barter campaign, considering the brand's category, audience concentration, category adoption, competition intensity, and expansion logic:

${data.cities.join(", ")}

Return ONLY valid JSON:
{"fits": [{"city": "city name exactly as given", "score": 0-100, "why": "one sharp line: why this city for ${data.brand}"}]}
Ranked best first, exactly 10 items.`;

    const out = await groqJSON(key, prompt, 1200);
    if (!out) return { fits: null as CityFit[] | null, error: "Ranking failed" };
    const fits = ((out.fits as CityFit[]) || []).map((f) => ({
      city: String(f.city), score: Math.min(100, Math.max(0, Number(f.score) || 0)), why: String(f.why),
    }));
    return { fits, error: null };
  });

// ── Daily Opportunity Briefing (AI Chief Growth Officer) ─────────────────────

const BriefingInput = z.object({
  date: z.string(),                      // YYYY-MM-DD (IST)
  focusCities: z.array(z.string()).default(["Lucknow", "Kanpur", "Delhi NCR"]),
  existingBrands: z.array(z.string()).default([]), // already in pipeline — exclude
  wonCategories: z.array(z.string()).default([]),  // categories user closed before
  count: z.number().min(4).max(12).default(8),
});

export interface OppSignal { signal: string; impact: number }
export interface OppSource { title: string; url: string; source: string }
export interface Opportunity {
  brand: string;
  category: string;
  score: number;          // 0-100
  confidence: number;     // 0-100
  signals: OppSignal[];
  whyNow: string;         // event → commercial meaning
  barterAngle: string;    // the barter strategist recommendation
  estValue: string;       // e.g. "₹40L – ₹1.2 Cr"
  likelihood: "High" | "Medium" | "Low";
  whyBizex4u: string;     // why WE should approach, now
  inventory: string;      // what product inventory they'd barter
  sources: OppSource[];   // real headlines backing this opportunity
  isNew?: boolean;        // set client-side: not present in the previous briefing
}
export interface BriefingResult {
  headline: string;       // one-line summary of the day
  opportunities: Opportunity[];
  feed: { time: string; event: string; opportunity: string; source?: string; url?: string }[];
  totalSignals: number;
  newsCount: number;      // how many real headlines were ingested
}

export const dailyBriefing = createServerFn({ method: "POST" })
  .validator((d: unknown) => BriefingInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { briefing: null as BriefingResult | null, error: "GROQ_API_KEY not set" };

    const dt = new Date(data.date + "T09:00:00+05:30");
    const dateLabel = dt.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const exclude = data.existingBrands.slice(0, 120).join(", ") || "none";

    // Pull real TAM headlines (Inc42, YourStory, ET, Google News) to ground the briefing
    const news = await fetchTamNews(35);
    const newsBlock = news.length
      ? news.map((n, i) => `[${i}] ${n.title} (${n.source})`).join("\n")
      : "none available";

    const prompt = `You are the AI Chief Growth Officer of BIZEX4U — an Indian media-barter agency (HQ Lucknow). We trade advertising (OOH hoardings, metro/transit, cinema, FM radio, print, DOOH, mall & society media, events) in exchange for brands' product inventory, helping brands preserve cash while scaling awareness.

Today: ${dateLabel}. Focus markets: ${data.focusCities.join(", ")} + national brands.
Already in our pipeline (EXCLUDE these): ${exclude}
Categories we closed before (prefer similar): ${data.wonCategories.join(", ") || "consumer electronics, FMCG, D2C"}

REAL NEWS HEADLINES from the last 7 days (Inc42, YourStory, ET BrandEquity, ET Retail, Google News), each with an index:
${newsBlock}

Produce today's opportunity briefing: the ${data.count} Indian consumer brands most worth approaching TODAY for a barter deal.
PRIORITIZE opportunities grounded in the real headlines above — when an opportunity is based on one or more headlines, cite their indices in "sourceIdx". You may also add pattern-based opportunities (seasonality, category cycles) with empty sourceIdx.

Think like a barter strategist: translate events into commercial opportunities (funding → bigger marketing budget → pitch awareness campaign; new stores → retail visibility need; launch → launch campaign + inventory to trade).

Return ONLY valid JSON:
{
  "headline": "one punchy line summarizing today's biggest theme",
  "totalSignals": number,
  "opportunities": [
    {
      "brand": "real brand name",
      "category": "e.g. Consumer Electronics",
      "score": 0-100,
      "confidence": 0-100,
      "signals": [{"signal": "e.g. New product launch (news)", "impact": 5-25}, ... 4-6 signals, impacts roughly sum to score],
      "whyNow": "1-2 sentences: the event and what it MEANS commercially",
      "barterAngle": "1-2 sentences: specific barter pitch — media mix in exchange for which inventory",
      "estValue": "realistic barter band in ₹",
      "likelihood": "High|Medium|Low",
      "whyBizex4u": "2-3 sentences: why BIZEX4U should approach NOW — their pressure, our fit, cash preservation",
      "inventory": "product inventory they would trade",
      "sourceIdx": [indices of headlines above backing this, or []]
    }
  ],
  "feed": [ 8-10 items derived from the REAL headlines where possible: {"time": "HH:MM", "event": "short observation naming the brand", "opportunity": "the barter opportunity it implies", "sourceIdx": index or null} — times between 05:30 and 09:30, most recent first ]
}

Rank by score descending. News-grounded opportunities get higher confidence than pattern-based ones. Be India-real, zero filler.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.65,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { briefing: null as BriefingResult | null, error: `Groq error ${res.status}: ${txt.slice(0, 160)}` };
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      type RawOpp = Opportunity & { sourceIdx?: number[] };
      type RawFeed = BriefingResult["feed"][number] & { sourceIdx?: number | null };
      const parsed = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1)) as
        Omit<BriefingResult, "opportunities" | "feed"> & { opportunities: RawOpp[]; feed: RawFeed[] };

      const toSource = (i: unknown): OppSource | null => {
        const n = news[Number(i)];
        return n ? { title: n.title, url: n.url, source: n.source } : null;
      };

      const opportunities = (parsed.opportunities || []).map((o) => ({
        brand: o.brand, category: o.category,
        score: Math.min(100, Math.max(0, Number(o.score) || 0)),
        confidence: Math.min(100, Math.max(0, Number(o.confidence) || 0)),
        signals: (o.signals || []).map((s) => ({ signal: String(s.signal), impact: Number(s.impact) || 0 })),
        whyNow: o.whyNow, barterAngle: o.barterAngle, estValue: o.estValue,
        likelihood: (["High", "Medium", "Low"].includes(o.likelihood) ? o.likelihood : "Medium") as Opportunity["likelihood"],
        whyBizex4u: o.whyBizex4u, inventory: o.inventory,
        sources: (o.sourceIdx || []).map(toSource).filter((s): s is OppSource => !!s),
      })).sort((a, b) => b.score - a.score);

      const feed = (parsed.feed || []).map((f) => {
        const src = f.sourceIdx != null ? toSource(f.sourceIdx) : null;
        return { time: f.time, event: f.event, opportunity: f.opportunity, source: src?.source, url: src?.url };
      });

      const briefing: BriefingResult = {
        headline: parsed.headline,
        opportunities,
        feed,
        totalSignals: Number(parsed.totalSignals) || opportunities.reduce((a, o) => a + o.signals.length, 0),
        newsCount: news.length,
      };
      return { briefing, error: null };
    } catch {
      return { briefing: null as BriefingResult | null, error: "Could not parse briefing. Retry." };
    }
  });

// ── Pitch Pack (Atlas finishes the work) ─────────────────────────────────────

const PitchPackInput = z.object({
  brand: z.string(),
  category: z.string().default(""),
  whyNow: z.string().default(""),
  barterAngle: z.string().default(""),
  inventory: z.string().default(""),
  cities: z.array(z.string()).default([]),
});

export interface PitchPack {
  execSummary: string;
  whyFit: string;
  objectives: string[];
  decisionMakers: { role: string; approach: string }[];
  linkedinMsg: string;
  email: { subject: string; body: string };
  followUps: string[];
  callPoints: string[];
  mediaMix: { channel: string; cities: string; share: string }[];
  estBarterValue: string;
  successProbability: number;
}

export const pitchPack = createServerFn({ method: "POST" })
  .validator((d: unknown) => PitchPackInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { pack: null as PitchPack | null, error: "GROQ_API_KEY not set" };

    const prompt = `You are BIZEX4U's AI Chief Growth Officer (Indian media-barter agency, Lucknow). Prepare a complete, send-ready pitch pack to approach ${data.brand}${data.category ? ` (${data.category})` : ""} for a barter deal: our advertising media (OOH, metro, cinema, FM, print, DOOH, mall/society, events) in exchange for their product inventory${data.inventory ? ` (${data.inventory})` : ""}.

Context: ${data.whyNow || "brand is in an active marketing cycle"}. Angle: ${data.barterAngle || "inventory-for-media barter"}. Priority cities: ${data.cities.join(", ") || "Lucknow, Kanpur, Delhi NCR + brand's key markets"}.

Return ONLY valid JSON:
{
  "execSummary": "3-4 sentence executive summary of the opportunity",
  "whyFit": "2-3 sentences: why ${data.brand} fits BIZEX4U's barter model right now (cash preservation, inventory, visibility)",
  "objectives": ["3-4 likely marketing objectives ${data.brand} has right now"],
  "decisionMakers": [{"role": "e.g. CMO / VP Marketing / Brand Head / Founder / Head of Procurement", "approach": "one line on how to approach this person"}] (4-5 roles),
  "linkedinMsg": "personalized LinkedIn connection message, under 300 chars, no fluff, specific to ${data.brand}'s moment",
  "email": {"subject": "sharp subject line", "body": "5-8 sentence personalized email from Yash Mehrotra, BIZEX4U — opens with their specific moment, proposes the barter, quantifies media value, single clear CTA. Sign off: Yash Mehrotra, BIZEX4U, yash@bizex4u.com"},
  "followUps": ["3 follow-up messages: day 3 (value-add), day 7 (case/social proof), day 14 (breakup email)"],
  "callPoints": ["5 talking points for the first call, each one line"],
  "mediaMix": [{"channel": "e.g. OOH Hoardings", "cities": "where", "share": "e.g. 30%"}] (4-6 rows),
  "estBarterValue": "₹ band",
  "successProbability": 0-100
}
India-specific, confident, zero generic filler.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return { pack: null as PitchPack | null, error: `Groq error ${res.status}` };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content?.trim() || "{}";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const pack = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1)) as PitchPack;
      pack.successProbability = Math.min(100, Math.max(0, Number(pack.successProbability) || 50));
      return { pack, error: null };
    } catch {
      return { pack: null as PitchPack | null, error: "Could not parse pitch pack. Retry." };
    }
  });

export const aiChat = createServerFn({ method: "POST" })
  .validator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { reply: "AI unavailable — GROQ_API_KEY not set." };

    const now = new Date();
    const today = now.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST";

    const system = `You are Atlas AI — a friendly, smart assistant for Yash at BIZEX4U, an Out-of-Home (OOH) advertising company in Lucknow, India.
Today's date: ${today}.

Rules:
- For greetings (hi, hello, hey): respond warmly and briefly. Do NOT mention business data unprompted.
- For general questions (time, weather, jokes, etc.): answer naturally. Business context is irrelevant here.
- Only reference [CONTEXT] data when the user asks about sites, inventory, invoices, barters, revenue, deals, or customers.
- Use ₹ for currency. Keep replies concise (under 6 lines) unless detail is requested.
- Never say "as per context" or quote raw data fields. Speak naturally like a knowledgeable colleague.`;

    const userContent = data.context
      ? `[CONTEXT]\n${data.context}\n\n${data.message}`
      : data.message;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: system },
          ...data.history,
          { role: "user", content: userContent },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (res.status === 429) return { reply: "AI is rate-limited. Try again shortly." };
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Groq error", res.status, text);
      return { reply: "AI temporarily unavailable. Please try again." };
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = json.choices?.[0]?.message?.content?.trim() || "…";
    return { reply };
  });
