export interface BrandStats {
  storeCount:  string;   // "200+" or "47 stores"
  revenue?:    string;   // "₹2,672 Cr" — only if public/known
  products?:   string;   // "10,000+" — optional
  yearsOp:     string;   // "26 Years"
  founded?:    string;   // "1999"
  hq:          string;   // "Patna, Bihar"
  bseTicker?:  string;   // "AVL · 540205" — public cos only
}

export interface BrandAmbassador {
  name:     string;   // "Pankaj Tripathi"
  date?:    string;   // "April 2026"
  context?: string;   // why they matter for OOH
}

export interface StateRevenue {
  state: string;
  pct:   number;
}

export interface OOHSite {
  city:             string;
  zone:             string;   // e.g. "Central UP", "Awadh"
  neighbourhood:    string;
  pin:              string;
  billboardHotspot: string;
  footfallProfile:  string;
  units:            number;
  storeNearby?:     boolean;
}

export interface CampaignZone {
  name:   string;   // "Central UP"
  cities: { name: string; stores?: number }[];
  units:  number;
}

export interface MediaChannel {
  city:        string;
  screens?:    number;
  frames?:     number;
  households:  number;
  impressions: string;   // "6.62L"
  properties:  number;
}

export interface MediaPhase {
  phaseLabel: string;   // "Phase 1 · Months 1–2"
  title:      string;   // "Proof of Concept"
  bullets:    string[];
  goal:       string;
}

export interface StrategicGap {
  tag:     string;   // "GAP 01"
  heading: string;
  body:    string;
}

export interface ProposalData {
  // ── Cover ──────────────────────────────────────────────
  clientName:    string;
  clientTagline: string;
  targetGeo:     string;   // "26 cities across Uttar Pradesh"
  pitchDate?:    string;   // auto-filled if blank

  // ── Brand at a glance (Slide 7) ────────────────────────
  isPublicCompany:    boolean;
  brandStats:         BrandStats;
  ambassador?:        BrandAmbassador;
  brandPositioning:   string;
  category:           string;   // "Electronics Retail"
  stateRevenueMix?:   StateRevenue[];
  financePartners?:   string[];
  keyCompetitors?:    string[];

  // ── Strategic gap (Slide 8) ────────────────────────────
  includeStrategicGap: boolean;
  strategicQuote?:     string;
  strategicGaps?:      StrategicGap[];

  // ── Campaign geography ─────────────────────────────────
  zones:    CampaignZone[];
  oohSites: OOHSite[];     // drives slides 10, 12-19

  // ── Media channels (Slide 11, 20) ─────────────────────
  includeRwaNetwork: boolean;
  rwaScreens?:       MediaChannel[];
  posterFrames?:     MediaChannel[];

  // ── Phased plan (Slide 21) ────────────────────────────
  includePhases:    boolean;
  phases?:          MediaPhase[];
  totalBarter?:     string;   // "Rs. 82–90 Lakh"
  cashInvestment?:  string;   // "Rs. 61–90 Lakh over 6 months"
  barterSaving?:    string;   // "30–45% below market"

  // ── Agency ────────────────────────────────────────────
  preparedBy:   string;
  agencyEmail:  string;
  commission:   string;   // "10% Transparent"
}
