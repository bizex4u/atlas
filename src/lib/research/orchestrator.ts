import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { INDIA_CITIES } from "@/lib/cities";
import { collectNews, collectPlaces, collectServiceability, collectExpansion } from "./evidence";
import type { AnalystResult, City, Evidence, ResearchReport } from "./types";

// Geocode cities against the known list (deterministic; no API).
function resolveCities(names: string[]): City[] {
  return names.map((n) => {
    const hit = INDIA_CITIES.find((c) => c.name.toLowerCase() === n.toLowerCase().trim());
    return hit ? { name: hit.name, state: hit.state, lat: hit.lat, lng: hit.lng } : { name: n.trim() };
  });
}

const Input = z.object({
  brand: z.string(),
  category: z.string().default(""),
  cities: z.array(z.string()).min(1),
  objective: z.string().default(""),
  budget: z.number().default(0),
});

// One reasoning call over the SHARED evidence set → all analyst results.
// Analysts do not fetch; they interpret evidence. Missing evidence → low
// confidence + missingData, never invention.
async function reason(key: string, brand: string, category: string, cities: City[], objective: string, evidence: Evidence[]): Promise<{
  executiveSummary: ResearchReport["executiveSummary"];
  analysts: AnalystResult[];
  narrative: string;
} | null> {
  const evBlock = evidence.length
    ? evidence.map((e) => `[${e.id}] (${e.source}/${e.type}${e.city ? `/${e.city}` : ""}, conf ${e.confidence}) ${e.content}`).join("\n")
    : "NO EVIDENCE COLLECTED";

  const prompt = `You are BIZEX4U's research desk — an Indian OOH media-barter agency (we trade advertising for brands' product inventory). Analyse ${brand}${category ? ` (${category})` : ""} for a barter opportunity in ${cities.map((c) => c.name).join(", ")}.${objective ? ` Objective: ${objective}.` : ""}

You are given an EVIDENCE SET. You are a set of specialist analysts. Each analyst reasons ONLY from this evidence — cite the evidence ids you used. Where evidence is thin, LOWER confidence and list what's missing. NEVER invent facts not supported by evidence (general category knowledge for interpretation is fine, but specific claims need evidence).

EVIDENCE:
${evBlock}

Return ONLY valid JSON:
{
  "executiveSummary": { "pursue": "Yes|Maybe|No", "reason": "1-2 sentences", "estValue": "₹ barter band", "confidence": 0-1 },
  "narrative": "3-4 sentence woven summary a salesperson reads first",
  "analysts": [
    { "analyst": "Finance", "question": "Can they afford advertising?", "verdict": "one line", "findings": ["..."], "recommendations": ["..."], "confidence": 0-1, "evidenceIds": ["e1"], "missingData": ["financial filings"] },
    { "analyst": "Growth", "question": "Why now?", ... },
    { "analyst": "Geography", "question": "Where should they advertise?", ... },
    { "analyst": "Retail", "question": "What is their footprint / inventory position?", ... },
    { "analyst": "Competition", "question": "What are competitors doing?", ... },
    { "analyst": "Media", "question": "What media mix should BIZEX4U propose?", ... },
    { "analyst": "Campaign", "question": "What is the concrete campaign + barter deal?", ... },
    { "analyst": "BIZEX4U Fit", "question": "Why is this a barter fit for BIZEX4U specifically?", "verdict": "...", "findings": ["excess inventory likelihood", "retail/distribution footprint that benefits from OOH", "active expansion evidence", "marketing profile compatibility"], "recommendations": ["estimated barter potential", "why BIZEX4U beats a conventional media agency"], "confidence": 0-1, "evidenceIds": [...], "missingData": [...] }
  ]
}
Every analyst present, in that order. Be specific to India and to BIZEX4U's barter model.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000, temperature: 0.4, response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = j.choices?.[0]?.message?.content?.trim() || "{}";
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const p = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1)) as {
      executiveSummary: ResearchReport["executiveSummary"];
      narrative: string;
      analysts: AnalystResult[];
    };
    p.analysts = (p.analysts || []).map((a) => ({
      analyst: String(a.analyst), question: String(a.question || ""), verdict: String(a.verdict || ""),
      findings: a.findings || [], recommendations: a.recommendations || [],
      confidence: Math.min(1, Math.max(0, Number(a.confidence) || 0)),
      evidenceIds: a.evidenceIds || [], missingData: a.missingData || [],
    }));
    p.executiveSummary.confidence = Math.min(1, Math.max(0, Number(p.executiveSummary.confidence) || 0));
    return p;
  } catch { return null; }
}

export const runResearch = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return { report: null as ResearchReport | null, error: "GROQ_API_KEY not set" };

    const company = { name: data.brand, category: data.category };
    const cities = resolveCities(data.cities);

    // 1. Evidence collection — parallel, deterministic, NO AI.
    const [news, places, serviceability, expansion] = await Promise.all([
      collectNews(company),
      collectPlaces(cities),
      collectServiceability(cities),
      collectExpansion(company),
    ]);
    const evidence: Evidence[] = [...news, ...expansion, ...places, ...serviceability];

    // 2. Reasoning over the shared evidence set.
    const out = await reason(key, data.brand, data.category, cities, data.objective, evidence);
    if (!out) return { report: null as ResearchReport | null, error: "Reasoning failed — retry" };

    const report: ResearchReport = {
      company, cities,
      executiveSummary: out.executiveSummary,
      analysts: out.analysts,
      narrative: out.narrative,
      evidence,
      generatedAt: Date.now(),
    };
    return { report, error: null };
  });
