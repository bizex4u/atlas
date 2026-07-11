// Research Orchestrator — shared contracts.
// Principle: evidence collection is SEPARATE from AI reasoning. Collectors emit
// normalized Evidence[]; analysts ONLY consume Evidence and never fetch.

export interface City { name: string; state?: string; lat?: number; lng?: number }
export interface Company { name: string; category?: string; domain?: string }

export interface ResearchRequest {
  company: Company;
  cities: City[];
  objective?: string;
  budget?: number;
}

export type EvidenceType =
  | "news" | "funding" | "hiring" | "expansion" | "places" | "serviceability"
  | "filing" | "investor" | "website" | "competition";

export interface Evidence {
  id: string;
  source: string;        // "Google News", "Google Places", "Swiggy", "BSE", …
  type: EvidenceType;
  date?: string;         // ISO if known
  confidence: number;    // 0-1: how much we trust this datum
  url?: string;
  city?: string;         // geo-scoped evidence
  content: string;       // normalized text/summary
  // structured payload for deterministic use (serializable-concrete)
  data?: { count?: number; byCategory?: Record<string, number>; anchors?: string[]; serviceable?: boolean };
}

// Uniform analyst contract — every specialist returns this shape.
export interface AnalystResult {
  analyst: string;
  question: string;         // the executive question it answers
  verdict: string;          // one-line answer
  findings: string[];
  recommendations: string[];
  confidence: number;       // 0-1
  evidenceIds: string[];    // which Evidence backed this
  missingData: string[];    // what would sharpen this (honesty)
}

export interface ResearchReport {
  company: Company;
  cities: City[];
  executiveSummary: {
    pursue: "Yes" | "Maybe" | "No";
    reason: string;
    estValue: string;
    confidence: number;
  };
  analysts: AnalystResult[];
  narrative: string;          // composer's woven summary
  evidence: Evidence[];       // full traceable set
  generatedAt: number;
}
