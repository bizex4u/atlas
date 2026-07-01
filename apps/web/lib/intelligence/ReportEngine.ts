/**
 * ReportEngine — builds the Claude prompt for AI Location Analyst Brief
 *
 * Synthesizes all available data layers (OSM, NASA VIIRS, Transitland, mobility,
 * population, competition) into a structured prompt that produces a senior
 * media-strategist-quality location brief tuned for India OOH/advertising market.
 */

import type { LocationAnalysis } from './LocationAnalysisEngine';
import { buildOohContext, estimateImpressions } from './OohIntelligence';

// ─── Output types ─────────────────────────────────────────────────────────────

export type Verdict = 'Strong Buy' | 'Buy' | 'Hold' | 'Avoid';
export type Grade   = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
export type FitLevel = 'Excellent' | 'Strong' | 'Moderate' | 'Weak' | 'Poor';

export interface AudienceWindow {
  time:     string;          // "8–10 AM"
  label:    string;          // "Corporate commuters"
  volume:   'Very High' | 'High' | 'Medium' | 'Low';
  channels: string[];        // ["OOH", "Radio"]
}

export interface BrandFit {
  category:   string;        // "Beverages", "Banking", "Electronics"
  fit:        FitLevel;
  rationale:  string;
  roiSignal:  'High' | 'Medium' | 'Low';
}

export interface MediaRecommendation {
  format:       string;      // "Large-format backlit hoarding"
  placement:    string;      // "Facing Metro Gate 2, Rajiv Chowk"
  rationale:    string;
  impressions:  string;      // "40,000–55,000 daily"
  priority:     'Primary' | 'Secondary';
}

export interface MonthRating {
  activity: 'Very High' | 'High' | 'Medium' | 'Low';
  note:     string;
}

export interface LocationReport {
  grade:              Grade;
  verdict:            Verdict;
  executiveSummary:   string;
  audienceWindows:    AudienceWindow[];
  brandFit:           BrandFit[];
  mediaRecommendations: MediaRecommendation[];
  seasonalCalendar:   Record<string, MonthRating>;   // "jan"…"dec"
  risks:              string[];
  investmentThesis:   string;
  competitiveContext: string;
  generatedAt:        string;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildReportPrompt(analysis: LocationAnalysis): string {
  const k   = analysis.knowledge;
  const loc = k?.location;
  const nl  = k?.nightlights;
  const tr  = k?.transit;
  const mob = k?.mobility;
  const poi = k?.poiSummary.byCategory ?? {};
  const area = k?.areaClassification;

  const locationLabel = [
    loc?.neighbourhood, loc?.suburb, loc?.city, loc?.state
  ].filter(Boolean).join(', ') || `${analysis.lngLat.lat.toFixed(4)}, ${analysis.lngLat.lng.toFixed(4)}`;

  const city  = loc?.city  ?? '';
  const state = loc?.state ?? '';
  const ooh   = buildOohContext(city, state, area?.areaType);

  const topFestivals = ooh.festivals
    .filter(f => f.uplift === 'Very High')
    .map(f => `${f.month.toUpperCase()}: ${f.festival} (${f.note})`)
    .slice(0, 4)
    .join('\n');

  const hoardingEst = estimateImpressions('hoarding',     ooh.tier, area?.areaType);
  const unipoleEst  = estimateImpressions('unipole',      ooh.tier, area?.areaType);
  const gantryEst   = estimateImpressions('gantry',       ooh.tier, area?.areaType);

  const metro   = poi['metro_station']    ?? 0;
  const rail    = poi['railway_station']  ?? 0;
  const bus     = poi['bus_terminal']     ?? 0;
  const malls   = poi['shopping_mall']    ?? 0;
  const elec    = poi['electronics_store'] ?? 0;
  const offices = (poi['corporate_office'] ?? 0) + (poi['it_park'] ?? 0);
  const dining  = (poi['restaurant'] ?? 0) + (poi['cafe'] ?? 0);
  const banks   = poi['bank']             ?? 0;
  const hotels  = poi['hotel']            ?? 0;
  const hosps   = poi['hospital']         ?? 0;
  const edu     = (poi['university'] ?? 0) + (poi['school'] ?? 0);
  const worship = poi['religious_place']  ?? 0;

  const popMid = analysis.catchmentRecord.estimatedPopulation;
  const popLow = Math.round((popMid * 0.6) / 5000) * 5000;
  const popHigh = Math.round((popMid * 1.4) / 5000) * 5000;

  const transitSummary = tr
    ? `Real transit data (Transitland): ${tr.stopCount} stops within 1.5km — ${tr.byMode.metro} metro, ${tr.byMode.suburban_rail} suburban rail, ${tr.byMode.bus} bus. Connectivity score: ${tr.connectivityScore}/100 (${tr.connectivityTier}). Agencies: ${tr.agencies.join(', ') || 'unknown'}. Nearest stops: ${tr.nearestStops.slice(0, 3).map(s => `${s.name} (${Math.round(s.distanceKm * 1000)}m)`).join(', ')}.`
    : `OSM transit estimate: ${metro} metro, ${rail} railway, ${bus} bus within 1.5km.`;

  const econSummary = nl
    ? `NASA VIIRS nighttime lights: economic score ${nl.economicScore}/100 (${nl.economicTier}). ${nl.label}`
    : 'NASA VIIRS data unavailable.';

  return `You are India's foremost location intelligence analyst specializing in out-of-home advertising, dealer placement, and brand activation strategy. You have 20 years of experience across Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Pune, and Tier 2 cities. You understand Indian consumer behavior deeply — SEC classifications, urban mobility patterns, festival calendars, monsoon seasonality, IPL surge, and the nuances of Indian OOH formats (hoardings, unipoles, bus shelters, transit media, mall facades).

You are generating a PREMIUM LOCATION INTELLIGENCE BRIEF for the following location. Be specific, data-driven, and India-market-aware. Never be generic. Every insight must be grounded in the data provided. Think like you are writing for a CMO deciding to spend ₹50 lakh on OOH.

═══════════════════════════════════════
LOCATION DATA
═══════════════════════════════════════

Location: ${locationLabel}
Pincode: ${loc?.pincode ?? analysis.pincode}
Area Type: ${area?.areaType ?? 'Unknown'} (OSM classification)
Attention Index: ${analysis.attentionResult.compositeScore}/100 (${analysis.attentionResult.tier} opportunity)

ECONOMIC INTELLIGENCE
${econSummary}

TRANSIT INTELLIGENCE
${transitSummary}

POI INVENTORY (within 1.5km, OSM-verified)
- Metro stations: ${metro}
- Railway stations: ${rail}
- Bus terminals: ${bus}
- Shopping malls: ${malls}
- Electronics stores: ${elec}
- Corporate offices / IT parks: ${offices}
- Restaurants & cafés: ${dining}
- Banks: ${banks}
- Hotels: ${hotels}
- Hospitals / clinics: ${hosps}
- Educational institutions: ${edu}
- Religious places: ${worship}

CATCHMENT POPULATION: ~${popLow.toLocaleString()}–${popHigh.toLocaleString()} residents within 2km (density model, ±40%)

MARKET TIER INTELLIGENCE
City Tier: ${ooh.tier} — ${ooh.tierLabel}
SEC Profile: ${ooh.secProfile}
OOH Price Band: ${ooh.priceBand}
CPM Benchmark: ₹${ooh.cpmINR} per 1,000 impressions (${ooh.tierLabel} average)
Impression Benchmarks (this tier):
- Large Hoarding (40×20 ft): ${hoardingEst.daily} daily / ${hoardingEst.monthly}
- Unipole (30×15 ft): ${unipoleEst.daily} daily / ${unipoleEst.monthly}
- Gantry banner: ${gantryEst.daily} daily / ${gantryEst.monthly}

KEY FESTIVAL/CAMPAIGN WINDOWS (Very High uplift only):
${topFestivals || 'No state-specific Very High windows identified — use national Diwali/IPL peaks'}

RECOMMENDED OOH FORMATS FOR THIS AREA TYPE:
${ooh.formats.map(f => `• ${f.name} (${f.dimensions}): ${f.impressions} — Best for: ${f.bestFor} — ${f.priceRange}`).join('\n')}

MOBILITY
- Walkability: ${mob?.walkabilityScore ?? 'n/a'}/100 (${mob?.walkabilityLevel ?? 'unknown'})
- Transit score: ${mob?.transitScore ?? 'n/a'}/100 (${mob?.transitLevel ?? 'unknown'})
- Road connectivity: ${mob?.roadConnectivityScore ?? analysis.roadNetwork.connectivityScore}/100
- Traffic drivers: ${mob?.trafficDrivers?.join(', ') || analysis.roadNetwork.roadClasses.join(', ')}
- Peak activity: ${mob?.peakActivity ?? '9 AM–7 PM'}
- Weekend: ${mob?.weekendActivity ?? 'unknown'}

COMPETITION
- Competitors within 5km: ${analysis.competitionSummary.competitorsWithin5Km}
- Nearest competitor: ${analysis.competitionSummary.nearestCompetitorKm.toFixed(1)}km
- Market saturation index: ${(analysis.competitionSummary.saturationIndex * 100).toFixed(0)}%

OSM DATA QUALITY: ${k?.dataQuality ?? 'unavailable'} (coverage score: ${((k?.coverageScore ?? 0) * 100).toFixed(0)}%)

═══════════════════════════════════════
DELIVERABLE
═══════════════════════════════════════

Return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:

{
  "grade": "A+ | A | B+ | B | C+ | C | D",
  "verdict": "Strong Buy | Buy | Hold | Avoid",
  "executiveSummary": "3-4 sentences. Crisp. Analyst voice. Cite specific data. India-market context.",
  "audienceWindows": [
    {
      "time": "time range",
      "label": "audience segment (India-specific: SEC A corporates, transit commuters, etc.)",
      "volume": "Very High | High | Medium | Low",
      "channels": ["relevant ad channels"]
    }
  ],
  "brandFit": [
    {
      "category": "brand category relevant to this location",
      "fit": "Excellent | Strong | Moderate | Weak | Poor",
      "rationale": "1-2 sentences. Why this brand category fits. Be specific to location data.",
      "roiSignal": "High | Medium | Low"
    }
  ],
  "mediaRecommendations": [
    {
      "format": "specific OOH/media format",
      "placement": "exact placement advice (which side of road, facing which, near which landmark)",
      "rationale": "why this placement works here",
      "impressions": "estimated daily impressions range",
      "priority": "Primary | Secondary"
    }
  ],
  "seasonalCalendar": {
    "jan": { "activity": "Very High | High | Medium | Low", "note": "brief context" },
    "feb": { "activity": "...", "note": "..." },
    "mar": { "activity": "...", "note": "..." },
    "apr": { "activity": "...", "note": "..." },
    "may": { "activity": "...", "note": "..." },
    "jun": { "activity": "...", "note": "..." },
    "jul": { "activity": "...", "note": "..." },
    "aug": { "activity": "...", "note": "..." },
    "sep": { "activity": "...", "note": "..." },
    "oct": { "activity": "...", "note": "..." },
    "nov": { "activity": "...", "note": "..." },
    "dec": { "activity": "...", "note": "..." }
  },
  "risks": [
    "specific risk 1 grounded in location data",
    "specific risk 2",
    "specific risk 3"
  ],
  "investmentThesis": "2-3 sentences. Investment recommendation in INR context. Payback logic. Who should buy this location.",
  "competitiveContext": "1-2 sentences about competitive landscape at this location specifically."
}

Requirements:
- audienceWindows: 3–5 entries covering full day arc; use India-specific SEC labels (SEC A1 corporates, SEC B aspirational shoppers, etc.)
- brandFit: 5–7 categories ordered by fit score descending; reference city tier (${ooh.tier}) and SEC profile in rationale
- mediaRecommendations: use EXACTLY the recommended formats above with specific INR price ranges; 2–4 placements
- seasonalCalendar: use the festival windows above to assign Very High/High/Medium; not generic — must reflect ${state || 'India'} market reality
- impressions: use the tier-calibrated benchmarks above (${ooh.tier} market); do not invent Metro-scale numbers for a T3 town
- investmentThesis: include specific INR amounts using the price band (${ooh.priceBand}); give 6-month campaign cost estimate
- Impress the reader. This is a ₹100M platform. Every sentence must earn its place.`;
}

// ─── Response parser ───────────────────────────────────────────────────────────

export function parseReport(raw: string): LocationReport | null {
  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed  = JSON.parse(cleaned);
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    } as LocationReport;
  } catch {
    return null;
  }
}
