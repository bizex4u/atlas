import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, context } = await req.json();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: context },
        { role: 'user',   content: message },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ reply: 'AI service unavailable. Check your API key.' }, { status: 200 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? 'No response.';
  return NextResponse.json({ reply });
}
