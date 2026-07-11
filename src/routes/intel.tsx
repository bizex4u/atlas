import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { useBrandDeals, useCredits, dealValue } from "@/lib/stores";
import { marketIntel } from "@/lib/ai.functions";
import { Radar, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { inputCls } from "@/components/ui";

export const Route = createFileRoute("/intel")({
  head: () => ({ meta: [{ title: "Market Intel — Atlas" }] }),
  component: IntelPage,
});

function IntelPage() { return <AppShell><IntelContent /></AppShell>; }

function IntelContent() {
  const deals = useBrandDeals((s) => s.deals);
  const track = useCredits((s) => s.track);
  const intel = useServerFn(marketIntel);

  const [city, setCity] = useState("Lucknow");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await intel({ data: {
        city,
        dealHistory: deals.map((d) => ({ brand: d.brandName, category: d.category, stage: d.stage, value: dealValue(d) })),
      }});
      if (res.error) setError(res.error);
      else setReport(res.report);
      track("groq", "llama-3.3-70b-versatile", "market_intel", 1, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Intel failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-[900px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Market Intel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Who's spending, who to pitch next, seasonal angles — AI market analysis
          </p>
        </div>
        <div className="flex gap-2">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputCls + " w-36"} />
          <button
            onClick={run}
            disabled={loading || !city.trim()}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : report ? <RefreshCw className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
            {loading ? "Analyzing…" : report ? "Refresh" : "Run Intel"}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading && (
        <AnalysisProgress
          title={`Scanning the ${city} market`}
          steps={[
            "Reading seasonal & festival demand patterns",
            "Identifying active spender categories",
            "Shortlisting hot prospects to call",
            "Comparing against your pipeline for gaps",
          ]}
          sources={["Market patterns", "Your pipeline", "Seasonality", "Groq"]}
        />
      )}

      {!report && !loading && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
          <div>
            <Radar className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Analyzes seasonal spend patterns, active brand categories in {city || "your city"},<br />
              hot prospects to call this month, and gaps in your pipeline ({deals.length} deals tracked).
            </p>
          </div>
        </div>
      )}

      {report && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI market analysis — estimates from market patterns, not verified spend data
          </div>
          <MarkdownLite text={report} />
        </div>
      )}
    </div>
  );
}

// Minimal markdown renderer for ## headings, **bold**, and lists
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith("## ")) return <h3 key={i} className="pt-3 text-base font-semibold text-primary">{t.slice(3)}</h3>;
        if (t.startsWith("# ")) return <h3 key={i} className="pt-3 text-base font-semibold text-primary">{t.slice(2)}</h3>;
        const bolded = t.split(/\*\*(.*?)\*\*/g).map((seg, j) =>
          j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg
        );
        if (/^[-*•]\s/.test(t)) return <div key={i} className="flex gap-2 pl-1"><span className="text-primary">•</span><span>{t.replace(/^[-*•]\s/, "").split(/\*\*(.*?)\*\*/g).map((seg, j) => j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg)}</span></div>;
        if (/^\d+\.\s/.test(t)) return <div key={i} className="flex gap-2 pl-1"><span className="font-medium text-primary">{t.match(/^\d+/)?.[0]}.</span><span>{t.replace(/^\d+\.\s/, "").split(/\*\*(.*?)\*\*/g).map((seg, j) => j % 2 === 1 ? <strong key={j}>{seg}</strong> : seg)}</span></div>;
        return <p key={i}>{bolded}</p>;
      })}
    </div>
  );
}
