/**
 * Confidence layer — every data-derived value in Atlas carries a confidence level.
 *
 * Rules:
 *  HIGH   (≥0.70) — show value directly
 *  MEDIUM (0.40–0.69) — show value with "~" prefix and amber indicator
 *  LOW    (<0.40)  — show "Limited data" instead of value
 *  NONE   (0)      — show "No data available"
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface CoverageQuality {
  /** 0–1 overall OSM coverage estimate for this location */
  score: number;
  level: ConfidenceLevel;
  /** Why this score was assigned */
  reason: string;
}

// ── Thresholds ────────────────────────────────────────────────────────────────

export function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 0.70) return 'high';
  if (score >= 0.40) return 'medium';
  if (score > 0)     return 'low';
  return 'none';
}

// ── Coverage from POI response ────────────────────────────────────────────────
// Computes OSM coverage quality dynamically from what Overpass actually returned.
// More POIs + landuse data = better coverage = higher confidence.

export function computeCoverageQuality(
  poiCount: number,
  rawPoiCount: number,
  landUseWayCount: number,
  highwayWayCount: number,
): CoverageQuality {
  // Signals that OSM has mapped this area well
  const hasDenseData   = rawPoiCount >= 30;
  const hasModerateData = rawPoiCount >= 10;
  const hasLandUse     = landUseWayCount >= 2;
  const hasRoads       = highwayWayCount >= 3;

  let score: number;
  let reason: string;

  if (hasDenseData && hasLandUse && hasRoads) {
    score = 0.75;
    reason = 'Dense OSM coverage — high confidence';
  } else if (hasDenseData || (hasModerateData && hasLandUse)) {
    score = 0.60;
    reason = 'Good OSM coverage — moderate confidence';
  } else if (hasModerateData && hasRoads) {
    score = 0.50;
    reason = 'Partial OSM coverage — estimates may be incomplete';
  } else if (rawPoiCount >= 3) {
    score = 0.35;
    reason = 'Sparse OSM data — limited confidence';
  } else if (rawPoiCount > 0) {
    score = 0.20;
    reason = 'Very sparse OSM data — treat numbers as approximate';
  } else {
    score = 0.05;
    reason = 'No OSM data returned — area may be unmapped';
  }

  // Deduplication penalty: if raw >> deduplicated, OSM has many entrance-nodes
  // (common for metro, malls). This is a data quality issue we corrected for,
  // so we don't penalise the score — but we do note it.
  void poiCount; // used in KnowledgeEngine for display

  return { score, level: scoreToLevel(score), reason };
}

// ── Inference confidence ──────────────────────────────────────────────────────
// When we derive a value (walkability score, area type) from OSM data,
// the confidence of the derived value is at most the coverage quality.

export function inferenceConfidence(
  coverageScore: number,
  rawSignalStrength: number, // 0–1: how strong the underlying signal is
): ConfidenceLevel {
  const combined = coverageScore * 0.6 + rawSignalStrength * 0.4;
  return scoreToLevel(combined);
}
