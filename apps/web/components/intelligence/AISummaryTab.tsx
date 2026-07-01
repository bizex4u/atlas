'use client';

import { useState, useRef, useCallback } from 'react';
import { usePanelStore } from '@/lib/stores/panelStore';
import type { LocationAnalysis } from '@/lib/intelligence/LocationAnalysisEngine';
import type {
  LocationReport, Grade, Verdict, FitLevel,
  AudienceWindow, BrandFit, MediaRecommendation, MonthRating,
} from '@/lib/intelligence/ReportEngine';
import { parseReport } from '@/lib/intelligence/ReportEngine';

// ─── Grade / verdict helpers ──────────────────────────────────────────────────

function gradeColor(g: Grade): string {
  if (g === 'A+' || g === 'A') return 'text-emerald-600';
  if (g === 'B+' || g === 'B') return 'text-[#6B21A8]';
  if (g === 'C+' || g === 'C') return 'text-amber-600';
  return 'text-red-600';
}

function verdictStyle(v: Verdict): { bg: string; text: string; border: string } {
  if (v === 'Strong Buy') return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
  if (v === 'Buy')        return { bg: 'bg-purple-100',   text: 'text-[#6B21A8]',   border: 'border-purple-200' };
  if (v === 'Hold')       return { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' };
  return                         { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200' };
}

function fitColor(f: FitLevel): string {
  if (f === 'Excellent') return 'text-emerald-600';
  if (f === 'Strong')    return 'text-[#6B21A8]';
  if (f === 'Moderate')  return 'text-amber-600';
  return 'text-gray-400';
}

function fitBar(f: FitLevel): number {
  return { Excellent: 100, Strong: 78, Moderate: 55, Weak: 30, Poor: 12 }[f] ?? 50;
}

function fitBarColor(f: FitLevel): string {
  if (f === 'Excellent') return 'bg-emerald-500';
  if (f === 'Strong')    return 'bg-[#6B21A8]';
  if (f === 'Moderate')  return 'bg-yellow-500';
  return 'bg-zinc-600';
}

function activityColor(a: MonthRating['activity']): string {
  if (a === 'Very High') return 'bg-emerald-500';
  if (a === 'High')      return 'bg-[#6B21A8]';
  if (a === 'Medium')    return 'bg-yellow-500';
  return 'bg-zinc-700';
}

function volumeColor(v: AudienceWindow['volume']): string {
  if (v === 'Very High') return 'text-emerald-600';
  if (v === 'High')      return 'text-[#6B21A8]';
  if (v === 'Medium')    return 'text-amber-600';
  return 'text-gray-400';
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mb-3">{children}</p>;
}

// ─── Report sections ──────────────────────────────────────────────────────────

function HeroCard({ report }: { report: LocationReport }) {
  const gc = gradeColor(report.grade);
  const vs = verdictStyle(report.verdict);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-5xl font-black tabular-nums leading-none ${gc}`}>{report.grade}</span>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 mt-1">Location Grade</p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${vs.bg} ${vs.text} ${vs.border}`}>
          {report.verdict}
        </span>
      </div>
      <p className="text-[12px] text-gray-700 leading-relaxed">{report.executiveSummary}</p>
    </Card>
  );
}

function AudienceSection({ windows }: { windows: AudienceWindow[] }) {
  return (
    <div>
      <SectionHeading>Audience Windows</SectionHeading>
      <div className="space-y-2">
        {windows.map((w, i) => (
          <Card key={i} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-gray-400 shrink-0">{w.time}</span>
              <span className={`text-[10px] font-semibold ${volumeColor(w.volume)}`}>{w.volume}</span>
            </div>
            <p className="text-[12px] font-medium text-gray-800">{w.label}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {w.channels.map((c) => (
                <span key={c} className="text-[9px] uppercase tracking-wide bg-gray-100 border border-gray-200 text-gray-500 rounded px-1.5 py-0.5">
                  {c}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BrandFitSection({ brands }: { brands: BrandFit[] }) {
  return (
    <div>
      <SectionHeading>Brand Category Fit</SectionHeading>
      <div className="space-y-2.5">
        {brands.map((b, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-gray-800">{b.category}</span>
                <span className={`text-[10px] font-semibold ${fitColor(b.fit)}`}>{b.fit}</span>
              </div>
              <span className={`text-[10px] ${
                b.roiSignal === 'High' ? 'text-emerald-600' :
                b.roiSignal === 'Medium' ? 'text-amber-600' : 'text-gray-400'
              }`}>ROI: {b.roiSignal}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100 mb-1.5">
              <div
                className={`h-full rounded-full ${fitBarColor(b.fit)}`}
                style={{ width: `${fitBar(b.fit)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{b.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaSection({ recs }: { recs: MediaRecommendation[] }) {
  return (
    <div>
      <SectionHeading>Media Recommendations</SectionHeading>
      <div className="space-y-2">
        {[...recs].sort((a, b) => (a.priority === 'Primary' ? -1 : 1)).map((r, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-[12px] font-semibold text-gray-800">{r.format}</p>
              <span className={`text-[9px] shrink-0 uppercase tracking-wide rounded px-1.5 py-0.5 border ${
                r.priority === 'Primary'
                  ? 'text-[#6B21A8] border-purple-200 bg-purple-50'
                  : 'text-gray-400 border-gray-200 bg-gray-100'
              }`}>{r.priority}</span>
            </div>
            <p className="text-[11px] text-[#6B21A8] mb-1.5">📍 {r.placement}</p>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{r.rationale}</p>
            <p className="text-[10px] font-mono text-gray-500">~{r.impressions} daily impressions</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

function SeasonalCalendar({ cal }: { cal: Record<string, MonthRating> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div>
      <SectionHeading>Seasonal Activity Calendar</SectionHeading>
      <Card className="p-4">
        <div className="flex gap-1 mb-3">
          {MONTHS.map((m, i) => {
            const data = cal[m];
            if (!data) return null;
            return (
              <div
                key={m}
                className="flex-1 flex flex-col items-center gap-1 cursor-default"
                onMouseEnter={() => setHovered(m)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={`w-full rounded-sm ${activityColor(data.activity)} ${hovered === m ? 'opacity-100' : 'opacity-70'} transition-opacity`}
                  style={{ height: 28 }}
                />
                <span className="text-[9px] text-gray-400">{MONTH_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
        {hovered && cal[hovered] && (
          <div className="rounded-lg bg-gray-50 border border-purple-200 px-3 py-2 mb-3">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-gray-500 uppercase">{hovered}</span>
              <span className="text-[10px] font-semibold text-gray-700">{cal[hovered].activity}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{cal[hovered].note}</p>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            ['bg-emerald-500', 'Very High'],
            ['bg-[#6B21A8]',   'High'],
            ['bg-yellow-500',  'Medium'],
            ['bg-zinc-700',    'Low'],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-sm ${color}`} />
              <span className="text-[9px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function InvestmentSection({ thesis, context, risks }: { thesis: string; context: string; risks: string[] }) {
  return (
    <div className="space-y-3">
      <div>
        <SectionHeading>Investment Thesis</SectionHeading>
        <Card className="p-4">
          <p className="text-[12px] text-gray-700 leading-relaxed">{thesis}</p>
        </Card>
      </div>
      <div>
        <SectionHeading>Competitive Context</SectionHeading>
        <Card className="p-4">
          <p className="text-[12px] text-gray-700 leading-relaxed">{context}</p>
        </Card>
      </div>
      {risks.length > 0 && (
        <div>
          <SectionHeading>Risk Factors</SectionHeading>
          <Card className="px-4 py-3">
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600 shrink-0 text-[11px] mt-0.5">⚠</span>
                  <span className="text-[11px] text-gray-500 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Streaming fetch ──────────────────────────────────────────────────────────

async function fetchReport(
  analysis: LocationAnalysis,
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/intelligence/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  const reader  = res.body!.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        // OpenAI-compatible format (Groq)
        const evt = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const text = evt.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      } catch {
        // non-JSON SSE line — skip
      }
    }
  }
}

// ─── Loading state ────────────────────────────────────────────────────────────

const THINKING_LINES = [
  'Reading satellite imagery…',
  'Analysing transit patterns…',
  'Profiling audience windows…',
  'Benchmarking brand fit…',
  'Modelling seasonal activity…',
  'Crafting investment thesis…',
];

function LoadingState({ rawText }: { rawText: string }) {
  const lineIndex = Math.min(
    Math.floor(rawText.length / 80),
    THINKING_LINES.length - 1,
  );
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-white p-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#6B21A8] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-[11px] text-gray-500">{THINKING_LINES[lineIndex]}</p>
      </div>

      {rawText.length > 20 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Generating…</p>
          <p className="text-[10px] font-mono text-gray-400 leading-relaxed break-all line-clamp-6">
            {rawText.slice(-300)}
            <span className="inline-block w-1.5 h-3 bg-[#6B21A8] ml-0.5 animate-pulse" />
          </p>
        </div>
      )}

      {[80, 60, 100, 40].map((w, i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-100/60 animate-pulse" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── No API key ───────────────────────────────────────────────────────────────

function NoApiKey() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
      <div className="text-3xl">🔑</div>
      <p className="text-[13px] font-semibold text-gray-800">API Key Required</p>
      <p className="text-[11px] text-gray-400 leading-relaxed max-w-[240px]">
        Add <code className="text-[#6B21A8] bg-white px-1 rounded">ANTHROPIC_API_KEY</code> to{' '}
        <code className="text-gray-500">.env.local</code> to enable the AI analyst.
      </p>
      <a
        href="https://console.anthropic.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-[#6B21A8] underline hover:text-white transition-colors"
      >
        Get API key →
      </a>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

type State = 'idle' | 'loading' | 'done' | 'error' | 'no-key';

function AISummaryContent({ analysis }: { analysis: LocationAnalysis }) {
  const [state,   setState]   = useState<State>('idle');
  const [rawText, setRawText] = useState('');
  const [report,  setReport]  = useState<LocationReport | null>(null);
  const [error,   setError]   = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (state === 'loading') {
      abortRef.current?.abort();
      setState('idle');
      return;
    }

    abortRef.current = new AbortController();
    setState('loading');
    setRawText('');
    setReport(null);
    setError('');

    let accumulated = '';
    try {
      await fetchReport(
        analysis,
        (chunk) => {
          accumulated += chunk;
          setRawText(accumulated);
        },
        abortRef.current.signal,
      );

      const parsed = parseReport(accumulated);
      if (parsed) {
        setReport(parsed);
        setState('done');
      } else {
        console.error('Raw report response:', accumulated);
        setError('Could not parse report. Raw response logged to console.');
        setState('error');
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') { setState('idle'); return; }
      const msg = (e as Error).message;
      if (msg.includes('ANTHROPIC_API_KEY')) { setState('no-key'); return; }
      setError(msg);
      setState('error');
    }
  }, [analysis, state]);

  if (state === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
        {/* Ghosted preview */}
        <div className="w-full space-y-2 opacity-30 pointer-events-none select-none">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 flex justify-between">
            <div>
              <div className="text-4xl font-black text-emerald-600">A</div>
              <div className="text-[9px] text-gray-400 mt-1">Location Grade</div>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px] px-3 flex items-center">Strong Buy</div>
          </div>
          {['Audience Windows', 'Brand Category Fit', 'Media Recommendations', 'Seasonal Calendar'].map((s) => (
            <div key={s} className="h-8 rounded-lg bg-gray-100/50 flex items-center px-3">
              <span className="text-[10px] text-gray-500">{s}</span>
            </div>
          ))}
        </div>

        <button
          onClick={generate}
          className="flex items-center gap-2 rounded-xl bg-[#6B21A8] hover:bg-[#7c3aed] transition-colors px-5 py-3 text-[13px] font-semibold text-white shadow-lg shadow-[#6B21A8]/30"
        >
          <span>✦</span>
          Generate AI Analyst Brief
        </button>
        <p className="text-[10px] text-gray-500 text-center">Powered by Groq · Llama 3.3 70B · India OOH specialist</p>
      </div>
    );
  }

  if (state === 'no-key') return <NoApiKey />;
  if (state === 'loading') return <LoadingState rawText={rawText} />;

  if (state === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 text-center">
        <p className="text-[13px] font-semibold text-red-600">Generation failed</p>
        <p className="text-[11px] text-gray-400 max-w-[260px] leading-relaxed">{error}</p>
        <button
          onClick={generate}
          className="text-[11px] text-[#6B21A8] border border-purple-200 rounded-lg px-4 py-2 hover:bg-purple-50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-4">
        <HeroCard report={report} />
        <AudienceSection windows={report.audienceWindows} />
        <BrandFitSection brands={report.brandFit} />
        <MediaSection recs={report.mediaRecommendations} />
        <SeasonalCalendar cal={report.seasonalCalendar} />
        <InvestmentSection
          thesis={report.investmentThesis}
          context={report.competitiveContext}
          risks={report.risks}
        />
        <div className="flex items-center justify-between pt-1 pb-2">
          <p className="text-[9px] text-gray-500">
            Generated {new Date(report.generatedAt).toLocaleTimeString()} · Groq · Llama 3.3 70B
          </p>
          <button
            onClick={generate}
            className="text-[10px] text-gray-400 hover:text-[#6B21A8] transition-colors"
          >
            Regenerate ↺
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab export ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="p-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

export function AISummaryTab() {
  const analysis  = usePanelStore((s) => s.analysis);
  const isLoading = usePanelStore((s) => s.isLoading);
  if (isLoading) return <Skeleton />;
  if (!analysis)  return null;
  return <AISummaryContent analysis={analysis} />;
}
