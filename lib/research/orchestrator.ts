import { calculateDistance } from '@/lib/intelligence/data/census';
import {
  collectInventoryEvidence,
  collectDemographicsEvidence,
  collectPoiEvidence,
  collectTrafficEvidence,
  collectCompetitionEvidence,
  collectBarterEvidence,
  deriveMissingData,
} from './collectors';
import type {
  EvidenceFreshness,
  EvidenceItem,
  EvidenceSource,
  InventoryEvidencePayload,
  DemographicsEvidencePayload,
  PoiEvidencePayload,
  TrafficEvidencePayload,
  CompetitionEvidencePayload,
  MissingDataItem,
  ResearchBrief,
  ResearchOrchestratorInput,
  ResearchSiteSnapshot,
  SiteRecommendation,
} from './types';

function worstFreshness(sources: EvidenceSource[]): EvidenceFreshness {
  if (sources.some((s) => s.freshness === 'unknown')) return 'unknown';
  if (sources.some((s) => s.freshness === 'stale')) return 'stale';
  return 'fresh';
}

function avgConfidence(sources: EvidenceSource[]): number {
  if (sources.length === 0) return 0;
  const sum = sources.reduce((a, s) => a + s.confidence, 0);
  return Math.round((sum / sources.length) * 100) / 100;
}

function isInventory(p: EvidenceItem['payload']): p is InventoryEvidencePayload {
  return 'nearbyAvailable' in p;
}

function isDemo(p: EvidenceItem['payload']): p is DemographicsEvidencePayload {
  return 'workingPopulation' in p && 'incomeLevel' in p;
}

function isPoi(p: EvidenceItem['payload']): p is PoiEvidencePayload {
  return 'topCategories' in p && 'nearestNames' in p;
}

function isTraffic(p: EvidenceItem['payload']): p is TrafficEvidencePayload {
  return 'avgDailyVehicles' in p && 'roadType' in p;
}

function isCompetition(p: EvidenceItem['payload']): p is CompetitionEvidencePayload {
  return 'competitorCount' in p && 'nearestDistanceKm' in p;
}

function scoreSite(
  site: ResearchSiteSnapshot,
  query: ResearchOrchestratorInput['query'],
  evidence: EvidenceItem[],
): number {
  let score = 40;
  if (site.status === 'available') score += 25;
  else if (site.status === 'booked') score += 5;

  if (site.lat != null && site.lng != null) {
    const d = calculateDistance(query.lat, query.lng, site.lat, site.lng);
    if (d <= query.radiusKm * 0.35) score += 20;
    else if (d <= query.radiusKm * 0.7) score += 12;
    else if (d <= query.radiusKm) score += 6;
  }

  if (query.formatHint && site.format === query.formatHint) score += 10;
  if (query.city && site.city.toLowerCase() === query.city.toLowerCase()) score += 8;

  const traffic = evidence.find((e) => e.source.kind === 'traffic');
  if (traffic && isTraffic(traffic.payload) && traffic.payload.avgDailyVehicles > 18_000) {
    score += 5;
  }

  const competition = evidence.find((e) => e.source.kind === 'competition');
  if (competition && isCompetition(competition.payload) && competition.payload.competitorCount <= 2) {
    score += 5;
  }

  return Math.min(100, score);
}

function buildRecommendations(
  input: ResearchOrchestratorInput,
  evidence: EvidenceItem[],
  missingData: MissingDataItem[],
): SiteRecommendation[] {
  const { query, sites } = input;
  const candidates = sites
    .filter((s) => s.lat != null && s.lng != null)
    .filter((s) => {
      const d = calculateDistance(query.lat, query.lng, s.lat as number, s.lng as number);
      return d <= query.radiusKm;
    })
    .map((s) => ({ site: s, score: scoreSite(s, query, evidence) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const sources = evidence.map((e) => e.source);
  const freshness = worstFreshness(sources);
  const confidenceBase = avgConfidence(sources);
  const highGaps = missingData.filter((m) => m.impact === 'high').length;
  const confidence = Math.max(
    0.15,
    Math.round((confidenceBase - highGaps * 0.08) * 100) / 100,
  );

  if (candidates.length === 0) {
    return [
      {
        siteId: null,
        siteCode: null,
        title: 'No in-radius inventory match',
        rationale:
          'Research found market signals but no geo-tagged available sites in radius. Add coordinates or expand radius.',
        score: Math.round(confidenceBase * 40),
        confidence,
        sources,
        freshness,
        missingData,
      },
    ];
  }

  return candidates.map(({ site, score }) => {
    const d =
      site.lat != null && site.lng != null
        ? calculateDistance(query.lat, query.lng, site.lat, site.lng)
        : null;
    const rationaleParts = [
      `${site.format} · ${site.status}`,
      d != null ? `${d.toFixed(1)} km from focus` : 'distance unknown',
      `₹${site.monthlyRentInr.toLocaleString('en-IN')}/mo`,
    ];
    if (query.brandHint) {
      rationaleParts.push(`brand lens: ${query.brandHint}`);
    }

    return {
      siteId: site.id,
      siteCode: site.siteCode,
      title: `${site.siteCode} — ${site.name}`,
      rationale: rationaleParts.join(' · '),
      score,
      confidence,
      sources,
      freshness,
      missingData,
    };
  });
}

function buildSummary(evidence: EvidenceItem[], recommendations: SiteRecommendation[]): string {
  const inv = evidence.find((e) => e.source.kind === 'inventory');
  const demo = evidence.find((e) => e.source.kind === 'demographics');
  const poi = evidence.find((e) => e.source.kind === 'poi');
  const parts: string[] = [];

  if (demo && isDemo(demo.payload)) {
    parts.push(
      `${demo.payload.city}, ${demo.payload.state} (pop ~${demo.payload.population.toLocaleString('en-IN')})`,
    );
  }
  if (inv && isInventory(inv.payload)) {
    parts.push(
      `${inv.payload.nearbyAvailable} available site(s) nearby of ${inv.payload.totalSites} total`,
    );
  }
  if (poi && isPoi(poi.payload)) {
    parts.push(`${poi.payload.count} POIs; top: ${poi.payload.topCategories.slice(0, 3).join(', ') || 'n/a'}`);
  }
  if (recommendations[0]?.siteCode) {
    parts.push(`Top pick: ${recommendations[0].siteCode} (score ${recommendations[0].score})`);
  } else {
    parts.push('No site pick — inventory gap');
  }
  return parts.join('. ') + '.';
}

/**
 * Evidence-first Research Orchestrator.
 * Collects parallel evidence, derives gaps, and ranks site recommendations.
 */
export async function runResearch(
  input: ResearchOrchestratorInput,
): Promise<ResearchBrief> {
  const { query, sites, barter } = input;

  const inventory = collectInventoryEvidence(query, sites);
  const demographics = collectDemographicsEvidence(query);
  const poi = await collectPoiEvidence(query);
  const poiCount = isPoi(poi.payload) ? poi.payload.count : 0;
  const traffic = collectTrafficEvidence(query, poiCount);
  const competition = collectCompetitionEvidence(query, sites);
  const barterEv = collectBarterEvidence(barter);

  const evidence: EvidenceItem[] = [
    inventory,
    demographics,
    poi,
    traffic,
    competition,
    barterEv,
  ];

  const missingData = deriveMissingData(query, sites, evidence);
  const recommendations = buildRecommendations(input, evidence, missingData);
  const overallConfidence = avgConfidence(evidence.map((e) => e.source));

  return {
    query,
    collectedAt: new Date().toISOString(),
    evidence,
    summary: buildSummary(evidence, recommendations),
    overallConfidence,
    missingData,
    recommendations,
  };
}

export type { ResearchBrief, ResearchOrchestratorInput, ResearchSiteSnapshot };
