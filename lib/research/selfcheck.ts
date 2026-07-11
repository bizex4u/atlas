/**
 * Lightweight self-check for the research orchestrator (no vitest required).
 * Run: npx tsx lib/research/selfcheck.ts
 */
import { runResearch } from './orchestrator';

async function main() {
  const brief = await runResearch({
    query: { lat: 26.8467, lng: 80.9462, radiusKm: 2, city: 'Lucknow' },
    sites: [
      {
        id: '1',
        siteCode: 'LKO-HRD-001',
        name: 'Hazratganj Crossing',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        format: 'hoarding',
        status: 'available',
        monthlyRentInr: 45000,
        lat: 26.85,
        lng: 80.95,
      },
    ],
    barter: { activeDealCount: 0, partnerNames: [], openBalanceInr: 0 },
  });

  const top = brief.recommendations[0];
  if (!top) throw new Error('expected recommendation');
  if (typeof top.confidence !== 'number') throw new Error('missing confidence');
  if (!Array.isArray(top.sources) || top.sources.length === 0) throw new Error('missing sources');
  if (!top.freshness) throw new Error('missing freshness');
  if (!Array.isArray(top.missingData)) throw new Error('missing missingData');
  console.log('selfcheck ok', {
    confidence: top.confidence,
    sources: top.sources.length,
    freshness: top.freshness,
    missing: top.missingData.length,
    summary: brief.summary,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
