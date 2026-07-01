import { NextRequest } from 'next/server';
import { buildReportPrompt } from '@/lib/intelligence/ReportEngine';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let analysis: LocationAnalysis;
  try {
    const body = await req.json();
    analysis = body.analysis as LocationAnalysis;
    if (!analysis) throw new Error('missing analysis');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = buildReportPrompt(analysis);

  // Groq — OpenAI-compatible, free tier, Llama 3.3 70B
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  2048,
      temperature: 0.3,   // lower = more consistent JSON
      stream:      true,
      messages: [
        {
          role: 'system',
          content: 'You are a senior India OOH advertising analyst. Always respond with valid JSON only — no markdown, no explanation, no code fences.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    return new Response(JSON.stringify({ error: `Groq API error: ${groqRes.status}`, detail: err }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Pass SSE stream straight through — client parses OpenAI-format deltas
  return new Response(groqRes.body, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  });
}
