import { NextRequest, NextResponse } from 'next/server';
import { runResearch } from '@/lib/research/orchestrator';
import type {
  RecommendRequestBody,
  RecommendResponseBody,
  ResearchBarterSnapshot,
  ResearchSiteSnapshot,
} from '@/lib/research/types';

const MODEL = 'llama-3.3-70b-versatile';

function isSiteSnapshot(value: unknown): value is ResearchSiteSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as ResearchSiteSnapshot;
  return (
    typeof v.id === 'string' &&
    typeof v.siteCode === 'string' &&
    typeof v.name === 'string' &&
    typeof v.city === 'string' &&
    typeof v.state === 'string' &&
    typeof v.format === 'string' &&
    typeof v.status === 'string' &&
    typeof v.monthlyRentInr === 'number' &&
    (v.lat === null || typeof v.lat === 'number') &&
    (v.lng === null || typeof v.lng === 'number')
  );
}

function parseBody(raw: unknown): RecommendRequestBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as RecommendRequestBody;
  if (typeof body.lat !== 'number' || typeof body.lng !== 'number') return null;
  const radiusKm = typeof body.radiusKm === 'number' ? body.radiusKm : 2;
  const sites = Array.isArray(body.sites) ? body.sites.filter(isSiteSnapshot) : [];
  const barterRaw = body.barter;
  const barter: ResearchBarterSnapshot = {
    activeDealCount:
      barterRaw && typeof barterRaw.activeDealCount === 'number'
        ? barterRaw.activeDealCount
        : 0,
    partnerNames:
      barterRaw && Array.isArray(barterRaw.partnerNames)
        ? barterRaw.partnerNames.filter((n): n is string => typeof n === 'string')
        : [],
    openBalanceInr:
      barterRaw && typeof barterRaw.openBalanceInr === 'number'
        ? barterRaw.openBalanceInr
        : 0,
  };

  return {
    lat: body.lat,
    lng: body.lng,
    radiusKm,
    city: typeof body.city === 'string' ? body.city : undefined,
    brandHint: typeof body.brandHint === 'string' ? body.brandHint : undefined,
    formatHint: typeof body.formatHint === 'string' ? body.formatHint : undefined,
    sites,
    barter,
  };
}

async function narrateWithGroq(briefSummary: string, topTitle: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are Atlas, BIZEX4U OOH barter assistant. Write 2 short sentences for a sales pitch lead. Cite only the evidence given. Do not invent numbers.',
        },
        {
          role: 'user',
          content: `Evidence summary: ${briefSummary}\nTop recommendation: ${topTitle}\nWrite the pitch lead.`,
        },
      ],
      max_tokens: 180,
      temperature: 0.4,
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? null;
}

export async function POST(req: NextRequest): Promise<NextResponse<RecommendResponseBody>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      {
        brief: {
          query: { lat: 0, lng: 0, radiusKm: 2 },
          collectedAt: new Date().toISOString(),
          evidence: [],
          summary: 'Invalid JSON body',
          overallConfidence: 0,
          missingData: [],
          recommendations: [],
        },
        aiNarrative: null,
        model: MODEL,
        error: 'Invalid JSON body',
      },
      { status: 400 },
    );
  }

  const body = parseBody(raw);
  if (!body) {
    return NextResponse.json(
      {
        brief: {
          query: { lat: 0, lng: 0, radiusKm: 2 },
          collectedAt: new Date().toISOString(),
          evidence: [],
          summary: 'lat and lng are required numbers',
          overallConfidence: 0,
          missingData: [],
          recommendations: [],
        },
        aiNarrative: null,
        model: MODEL,
        error: 'lat and lng are required numbers',
      },
      { status: 400 },
    );
  }

  try {
    const brief = await runResearch({
      query: {
        lat: body.lat,
        lng: body.lng,
        radiusKm: body.radiusKm,
        city: body.city,
        brandHint: body.brandHint,
        formatHint: body.formatHint,
      },
      sites: body.sites,
      barter: body.barter,
    });

    const top = brief.recommendations[0];
    let aiNarrative: string | null = null;
    let error: string | null = null;
    try {
      aiNarrative = await narrateWithGroq(
        brief.summary,
        top?.title ?? 'No site recommendation',
      );
    } catch {
      error = 'Groq narrative unavailable; evidence brief still returned';
    }

    return NextResponse.json({
      brief,
      aiNarrative,
      model: MODEL,
      error,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Research failed';
    return NextResponse.json(
      {
        brief: {
          query: {
            lat: body.lat,
            lng: body.lng,
            radiusKm: body.radiusKm,
            city: body.city,
            brandHint: body.brandHint,
            formatHint: body.formatHint,
          },
          collectedAt: new Date().toISOString(),
          evidence: [],
          summary: message,
          overallConfidence: 0,
          missingData: [],
          recommendations: [],
        },
        aiNarrative: null,
        model: MODEL,
        error: message,
      },
      { status: 500 },
    );
  }
}
