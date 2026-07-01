import { NextRequest, NextResponse } from 'next/server';

const GROQ_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) return NextResponse.json({ error: 'No GROQ_API_KEY' }, { status: 503 });

  const { companyName } = await req.json();
  if (!companyName) return NextResponse.json({ error: 'companyName required' }, { status: 400 });

  const prompt = `You are an expert on Indian companies and OOH advertising.

Given the company name "${companyName}", return a JSON object with everything you know about them for an OOH media proposal.

Respond with ONLY valid JSON, no markdown, no explanation. Use null for fields you don't know.

{
  "isPublic": boolean,           // listed on BSE/NSE?
  "tagline": string | null,      // brand tagline or slogan
  "category": string,            // e.g. "Electronics Retail", "FMCG", "Pharma", "Jewellery"
  "hq": string | null,           // HQ city, state e.g. "Mumbai, Maharashtra"
  "founded": string | null,      // founding year e.g. "1999"
  "storeCount": string | null,   // e.g. "200+" or "50 stores"
  "revenue": string | null,      // latest known revenue e.g. "₹2,672 Cr" — ONLY if public company
  "yearsOp": string | null,      // e.g. "26 Years"
  "bseTicker": string | null,    // e.g. "AVL · 540205" — ONLY if listed
  "products": string | null,     // e.g. "TVs, ACs, Phones, Appliances"
  "brandPositioning": string,    // 1-2 sentence brand positioning statement
  "competitors": string[],       // top 3-5 direct competitors in India
  "ambassador": {                // brand ambassador if known, else null
    "name": string,
    "date": string | null,       // appointment date if known
    "context": string | null     // why they're relevant for OOH
  } | null,
  "strategicQuote": string,      // 1 compelling sentence about the OOH opportunity for this brand
  "gaps": [                      // 2-3 strategic gaps OOH can solve for this brand
    {
      "tag": "GAP 01",
      "heading": string,         // short headline e.g. "Low brand recall in Tier 2 cities"
      "body": string             // 2-3 sentences explaining the gap
    }
  ]
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Groq error' }, { status: 502 });

  const json = await res.json();
  const raw  = json.choices?.[0]?.message?.content ?? '';

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Parse failed', raw }, { status: 500 });
  }
}
