import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useBrandDeals, DEAL_STAGES } from "@/lib/stores";
import {
  dailyBriefing, pitchPack,
  type BriefingResult, type Opportunity, type PitchPack,
} from "@/lib/ai.functions";
import { toast } from "@/components/Toaster";
import {
  Sparkles, Loader2, RefreshCw, Phone, CheckSquare, ChevronDown, ChevronUp,
  Copy, Check, Plus, X, Zap, TrendingUp, Radar, Mail, Linkedin, FileText, Star, ExternalLink,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useTasks } from "@/lib/crm";
import { promoteOpportunity } from "@/lib/twenty.functions";

function getGreeting() {
  // hourCycle h23 → reliable 0-23 (en-IN + hour12:false returns "24" at midnight, which broke this).
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  if (h >= 5 && h < 12) return { text: "Good morning", emoji: "☀️" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (h >= 17 && h < 21) return { text: "Good evening", emoji: "🌆" };
  return { text: "Good night", emoji: "🌙" };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — AI Growth Engine for BIZEX4U" },
      { name: "description", content: "Atlas surfaces the barter opportunities BIZEX4U should chase today — scored, explained, pitch-ready." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <Briefing />
    </AppShell>
  );
}

const BRIEFING_KEY = "atlas-briefing";

function todayIST() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
}

function loadCached(): { date: string; briefing: BriefingResult } | null {
  try {
    const raw = localStorage.getItem(BRIEFING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date: string; briefing: BriefingResult };
    return parsed?.briefing?.opportunities ? parsed : null;
  } catch { return null; }
}

function Briefing() {
  const brandDeals = useBrandDeals((s) => s.deals);
  const addDeal = useBrandDeals((s) => s.addDeal);
  const tasks = useTasks((s) => s.tasks);
  const greeting = getGreeting();
  const runBriefing = useServerFn(dailyBriefing);
  const promote = useServerFn(promoteOpportunity);

  const [briefing, setBriefing] = useState<BriefingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pitchFor, setPitchFor] = useState<Opportunity | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);

  const today = todayIST();
  const todayTasks = tasks.filter((t) => !t.done && t.dueDate <= today);
  const followUpsDue = brandDeals.filter((d) =>
    !["live", "lost"].includes(d.stage) && d.nextFollowUp && d.nextFollowUp <= today
  );

  async function generate(force = false) {
    if (loading) return;
    if (!force) {
      // Auto-refresh every 3rd day; Regenerate button forces a fresh one anytime.
      const cached = loadCached();
      if (cached) {
        const ageDays = (Date.parse(today) - Date.parse(cached.date)) / 86400000;
        if (ageDays < 3) { setBriefing(cached.briefing); return; }
      }
    }
    setLoading(true); setError(null);
    try {
      const res = await runBriefing({ data: {
        date: today,
        existingBrands: brandDeals.map((d) => d.brandName),
        wonCategories: [...new Set(brandDeals.filter((d) => ["live", "agreement"].includes(d.stage)).map((d) => d.category))],
        count: 8,
      }});
      if (res.error || !res.briefing) setError(res.error || "Briefing failed");
      else {
        // Flag opportunities that weren't in the previous briefing as NEW
        const prev = loadCached();
        const prevBrands = new Set((prev?.briefing.opportunities ?? []).map((o) => o.brand.toLowerCase()));
        const withNew: BriefingResult = {
          ...res.briefing,
          opportunities: res.briefing.opportunities.map((o) => ({
            ...o,
            isNew: prevBrands.size > 0 && !prevBrands.has(o.brand.toLowerCase()),
          })),
        };
        setBriefing(withNew);
        try { localStorage.setItem(BRIEFING_KEY, JSON.stringify({ date: today, briefing: withNew })); } catch { /* ignore */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Briefing failed");
    } finally { setLoading(false); }
  }

  // Auto-generate once per day on open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { generate(false); }, []);

  const opps = briefing?.opportunities ?? [];
  const topConfidence = opps.length ? Math.max(...opps.map((o) => o.confidence)) : 0;

  // Proactive analyst statement — what an analyst would say walking into your office.
  const proactiveBrief = (() => {
    if (!briefing) return "";
    const parts: string[] = [];
    const newCount = opps.filter((o) => o.isNew).length;
    if (opps.length) parts.push(`I found ${opps.length} barter opportunit${opps.length === 1 ? "y" : "ies"} today${newCount ? ` (${newCount} new)` : ""}.`);
    const bigOnes = opps.filter((o) => /cr\b/i.test(o.estValue)).length;
    if (bigOnes) parts.push(`${bigOnes} worth over ₹1 Cr.`);
    if (followUpsDue.length) parts.push(`${followUpsDue.length} follow-up${followUpsDue.length > 1 ? "s are" : " is"} due.`);
    const topSig = briefing.feed?.[0];
    if (topSig) parts.push(topSig.event.replace(/\.$/, "") + ".");
    parts.push(opps[0] ? `Want me to prepare outreach for ${opps[0].brand}?` : "");
    return parts.filter(Boolean).join(" ");
  })();

  // Promote an AI opportunity into Twenty (system of record) + record provenance
  // in Turso. Explicit, one-click, the natural close of the pitch flow (ADR-003).
  // Local store keeps a lightweight "tracked" marker so the UI reflects it.
  async function addToPipeline(o: Opportunity) {
    if (brandDeals.some((d) => d.brandName.toLowerCase() === o.brand.toLowerCase())) {
      toast.info(`${o.brand} is already tracked in your CRM`);
      return;
    }
    setPromoting(o.brand);
    try {
      const res = await promote({ data: {
        brand: o.brand, category: o.category, city: "",
        whyNow: o.whyNow, barterAngle: o.barterAngle, origin: "daily_briefing",
      }});
      if (!res.ok) { toast.error("Couldn't create in CRM", res.error || "Try again"); return; }
      addDeal({
        brandName: o.brand, category: o.category, contactName: "", stage: "prospect",
        objective: o.barterAngle, targetCities: [], targetAudience: "", totalBudget: 0, durationMonths: 1,
        notes: `[Atlas ${today}] Tracked in Twenty (opp ${res.opportunityId?.slice(0, 8)}) · ${o.whyNow} · Est ${o.estValue}`,
      });
      toast.success(`${o.brand} created in CRM`, "Opportunity tracked in Twenty");
    } catch (e) {
      toast.error("Couldn't reach CRM", e instanceof Error ? e.message : "Try again");
    } finally { setPromoting(null); }
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-5 p-4 md:p-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {/* Hero briefing */}
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground md:p-8">
          <Sparkles className="absolute right-6 top-6 h-16 w-16 opacity-20" />
          <div className="text-xs uppercase tracking-widest opacity-80">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })} · Overnight briefing
          </div>
          <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
            {greeting.text}, Yash {greeting.emoji}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-95">
            {loading
              ? "Reading Inc42, YourStory, ET & Google News for today's barter opportunities…"
              : briefing
              ? proactiveBrief
              : "Preparing your opportunity briefing."}
          </p>
          {briefing && briefing.newsCount > 0 && (
            <p className="mt-1 text-xs opacity-75">
              Grounded in {briefing.newsCount} real headlines from Inc42, YourStory, ET BrandEquity, ET Retail & Google News (last 7 days) · refreshes every 3rd day
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat label="Opportunities today" value={loading ? "…" : String(opps.length || "—")} />
            <HeroStat label="Highest confidence" value={loading || !opps.length ? "…" : `${topConfidence}%`} />
            <HeroStat label="Buying signals" value={loading || !briefing ? "…" : String(briefing.totalSignals)} />
            <HeroStat label="Follow-ups due" value={String(followUpsDue.length)} />
          </div>
        </div>

        {/* Error / loading */}
        {error && (
          <div className="flex items-center justify-between rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
            <button onClick={() => generate(true)} className="rounded-lg border border-destructive/30 px-3 py-1 text-xs hover:bg-destructive/10">Retry</button>
          </div>
        )}
        {loading && !briefing && (
          <div className="grid place-items-center rounded-2xl border border-border bg-card p-16">
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Atlas is building today's opportunity briefing…
            </div>
          </div>
        )}

        {/* Opportunity cards */}
        {opps.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Today's opportunities</h2>
              <button
                onClick={() => generate(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Regenerate
              </button>
            </div>
            <div className="space-y-3">
              {opps.map((o, i) => (
                <OpportunityCard
                  key={o.brand + i}
                  o={o}
                  rank={i + 1}
                  inPipeline={brandDeals.some((d) => d.brandName.toLowerCase() === o.brand.toLowerCase())}
                  busy={promoting === o.brand}
                  onPitch={() => setPitchFor(o)}
                  onAdd={() => addToPipeline(o)}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              AI market inference from category patterns & seasonality — verify signals before outreach. Refreshes daily.
            </p>
          </section>
        )}

        {/* Today's work (compact) */}
        {(followUpsDue.length > 0 || todayTasks.length > 0) && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold">Before new outreach — today's commitments</h2>
            <ul className="divide-y divide-border">
              {followUpsDue.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-700"><Phone className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.brandName}</div>
                    <div className="text-xs text-muted-foreground">{DEAL_STAGES.find((s) => s.key === d.stage)?.label} · follow-up due</div>
                  </div>
                  <Link to="/brands" className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted">Open</Link>
                </li>
              ))}
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground"><CheckSquare className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1 truncate text-sm">{t.title}</div>
                  <Link to="/tasks" className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted">Done</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Research feed */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card shadow-card lg:sticky lg:top-20">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground"><Radar className="h-4 w-4" /></span>
            <div>
              <div className="text-sm font-semibold">Research feed</div>
              <div className="text-[11px] text-muted-foreground">What Atlas noticed overnight</div>
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {(briefing?.feed ?? []).map((f, i) => (
              <div key={i} className="border-b border-border/60 px-4 py-3 last:border-0">
                <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <span>{f.time}</span>
                  {f.url && (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {f.source} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <div className="mt-0.5 text-sm font-medium leading-snug">{f.event}</div>
                <div className="mt-1 flex items-start gap-1.5 text-xs text-primary">
                  <Zap className="mt-0.5 h-3 w-3 shrink-0" />
                  {f.opportunity}
                </div>
              </div>
            ))}
            {!briefing?.feed?.length && (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                {loading ? "Gathering signals…" : "No feed yet — generate the briefing."}
              </div>
            )}
          </div>
        </div>
      </aside>

      {pitchFor && <PitchPackModal opp={pitchFor} onClose={() => setPitchFor(null)} onAdd={() => { addToPipeline(pitchFor); }} />}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-semibold">{value}</div>
    </div>
  );
}

const LIKELIHOOD_STYLE: Record<string, string> = {
  High: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-muted text-muted-foreground",
};

function OpportunityCard({ o, rank, inPipeline, busy, onPitch, onAdd }: {
  o: Opportunity; rank: number; inPipeline: boolean; busy?: boolean;
  onPitch: () => void; onAdd: () => void;
}) {
  const [open, setOpen] = useState(rank === 1);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card transition hover:border-primary/30">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground">
          {o.score}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {rank <= 3 && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
            <span className="text-sm font-semibold">{o.brand}</span>
            {o.isNew && (
              <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                New
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${LIKELIHOOD_STYLE[o.likelihood]}`}>{o.likelihood}</span>
            <span className="text-[11px] text-muted-foreground">{o.category}</span>
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{o.whyNow}</div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-sm font-semibold">{o.estValue}</div>
          <div className="text-[10px] text-muted-foreground">{o.confidence}% confidence</div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4">
          <div className="grid gap-4 pt-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why Atlas picked this — signal breakdown</div>
                <div className="space-y-1">
                  {o.signals.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs">
                      <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-success" /> {s.signal}</span>
                      <span className="font-semibold text-primary">+{s.impact}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-2.5 pt-1 text-xs font-semibold">
                    <span>Atlas score</span><span>{o.score}/100</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-xs">
                <span className="font-semibold">Barter inventory:</span> {o.inventory}
              </div>
              {o.sources?.length > 0 && (
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sources</div>
                  <div className="flex flex-wrap gap-1.5">
                    {o.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-primary hover:bg-primary/5"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.source}: {s.title.slice(0, 55)}{s.title.length > 55 ? "…" : ""}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary"><TrendingUp className="h-3 w-3" /> AI recommendation</div>
                <p className="text-sm leading-relaxed">{o.barterAngle}</p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why BIZEX4U, why now</div>
                <p className="text-sm leading-relaxed text-foreground/90">{o.whyBizex4u}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onPitch} className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground">
              <FileText className="h-3.5 w-3.5" /> Pitch this company
            </button>
            <button onClick={onAdd} disabled={inPipeline || busy} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : inPipeline ? <Check className="h-3.5 w-3.5 text-success" /> : <Plus className="h-3.5 w-3.5" />}
              {busy ? "Creating…" : inPipeline ? "Tracked in CRM" : "Create in CRM"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pitch Pack modal ──────────────────────────────────────────────────────────

function PitchPackModal({ opp, onClose, onAdd }: { opp: Opportunity; onClose: () => void; onAdd: () => void }) {
  const runPack = useServerFn(pitchPack);
  const [pack, setPack] = useState<PitchPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await runPack({ data: {
          brand: opp.brand, category: opp.category, whyNow: opp.whyNow,
          barterAngle: opp.barterAngle, inventory: opp.inventory, cities: [],
        }});
        if (!alive) return;
        if (res.error || !res.pack) setError(res.error || "Failed");
        else setPack(res.pack);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Failed");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp.brand]);

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1500);
      toast.success("Copied");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:max-w-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <h3 className="text-base font-semibold">Pitch pack — {opp.brand}</h3>
            <p className="text-[11px] text-muted-foreground">{opp.category} · est {opp.estValue}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onAdd} className="hidden items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted sm:inline-flex">
              <Plus className="h-3.5 w-3.5" /> Create in CRM
            </button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {loading && (
          <div className="grid place-items-center p-16 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Preparing the full pitch pack for {opp.brand}…
            </div>
          </div>
        )}
        {error && <div className="m-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        {pack && (
          <div className="space-y-5 p-5">
            <PackSection title="Executive summary"><p className="text-sm leading-relaxed">{pack.execSummary}</p></PackSection>
            <PackSection title="Why this fits BIZEX4U"><p className="text-sm leading-relaxed">{pack.whyFit}</p></PackSection>

            <PackSection title={`Success probability — ${pack.successProbability}%`}>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pack.successProbability}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Estimated barter value: <span className="font-semibold text-foreground">{pack.estBarterValue}</span></p>
            </PackSection>

            <PackSection title="Their likely marketing objectives">
              <ul className="space-y-1">
                {pack.objectives.map((x, i) => <li key={i} className="flex gap-2 text-sm"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{x}</li>)}
              </ul>
            </PackSection>

            <PackSection title="Decision-makers to reach">
              <div className="space-y-2">
                {pack.decisionMakers.map((d, i) => (
                  <div key={i} className="rounded-xl bg-muted/40 px-3 py-2">
                    <div className="text-sm font-medium">{d.role}</div>
                    <div className="text-xs text-muted-foreground">{d.approach}</div>
                  </div>
                ))}
              </div>
            </PackSection>

            <PackSection
              title="LinkedIn message"
              action={<CopyBtn active={copiedKey === "li"} onClick={() => copy("li", pack.linkedinMsg)} icon={<Linkedin className="h-3.5 w-3.5" />} />}
            >
              <p className="rounded-xl bg-muted/40 p-3 text-sm leading-relaxed">{pack.linkedinMsg}</p>
            </PackSection>

            <PackSection
              title={`Email — "${pack.email.subject}"`}
              action={<CopyBtn active={copiedKey === "em"} onClick={() => copy("em", `Subject: ${pack.email.subject}\n\n${pack.email.body}`)} icon={<Mail className="h-3.5 w-3.5" />} />}
            >
              <p className="whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm leading-relaxed">{pack.email.body}</p>
            </PackSection>

            <PackSection title="Follow-up sequence">
              <ol className="space-y-2">
                {pack.followUps.map((f, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{i + 1}</span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ol>
            </PackSection>

            <PackSection title="First-call talking points">
              <ul className="space-y-1">
                {pack.callPoints.map((c, i) => <li key={i} className="flex gap-2 text-sm"><span className="text-primary">•</span>{c}</li>)}
              </ul>
            </PackSection>

            <PackSection title="Recommended media mix">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-1 font-medium">Channel</th><th className="pb-1 font-medium">Cities</th><th className="pb-1 text-right font-medium">Share</th></tr></thead>
                <tbody className="divide-y divide-border/60">
                  {pack.mediaMix.map((m, i) => (
                    <tr key={i}><td className="py-1.5">{m.channel}</td><td className="py-1.5 text-muted-foreground">{m.cities}</td><td className="py-1.5 text-right font-medium">{m.share}</td></tr>
                  ))}
                </tbody>
              </table>
            </PackSection>

            <p className="text-center text-[11px] text-muted-foreground">AI-drafted — review before sending. Contact details are role suggestions, not verified people.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PackSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function CopyBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted">
      {active ? <Check className="h-3.5 w-3.5 text-success" /> : icon}
      {active ? "Copied" : "Copy"}
    </button>
  );
}
