import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { useBrandDeals, useCredits } from "@/lib/stores";
import {
  brandCityIntel, fetchNearbyPlaces, checkServiceability,
  type BrandCityReport, type ZoneRec, type PincodeScore, type PlaceBusiness,
  type ServiceabilityResult,
} from "@/lib/ai.functions";
import { pushDealToTwenty } from "@/lib/twenty.functions";
import { toast } from "@/components/Toaster";
import {
  Sparkles, Loader2, Microscope, MapPin, ExternalLink, Check, Plus, Copy,
  Zap, Building2, TrendingUp, Target, ChevronRight, Printer, ShieldCheck, Contact,
} from "lucide-react";
import { inputCls, Field } from "@/components/ui";
import { AnalysisProgress } from "@/components/AnalysisProgress";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Brand Intelligence — Atlas" }] }),
  component: ResearchPage,
});

function ResearchPage() { return <AppShell><ResearchContent /></AppShell>; }

function scoreColor(score: number) {
  if (score >= 85) return "#16a34a";
  if (score >= 70) return "#f59e0b";
  return "#94a3b8";
}

function ResearchContent() {
  const runIntel = useServerFn(brandCityIntel);
  const track = useCredits((s) => s.track);
  const addDeal = useBrandDeals((s) => s.addDeal);
  const brandDeals = useBrandDeals((s) => s.deals);

  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BrandCityReport | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneRec | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);
  const pushCrm = useServerFn(pushDealToTwenty);

  async function pushToCrm() {
    if (!report) return;
    setPushing(true);
    try {
      const res = await pushCrm({ data: {
        brand, category: "", city,
        contactName: "",
        value: 0,
      }});
      if (!res.ok) { toast.error("Push to CRM failed", res.error || undefined); return; }
      setPushed(true);
      toast.success(`${brand} pushed to Twenty CRM`, "Company + opportunity created");
    } catch (e) {
      toast.error("Push to CRM failed", e instanceof Error ? e.message : undefined);
    } finally { setPushing(false); }
  }

  async function run() {
    if (!brand.trim() || !city.trim()) { setError("Brand and city required."); return; }
    setLoading(true); setError(null); setReport(null); setSelectedZone(null); setSaved(false);
    try {
      const res = await runIntel({ data: { brand: brand.trim(), city: city.trim(), objective, budget, audience: "", category: "" } });
      if (res.error || !res.report) setError(res.error || "Analysis failed");
      else setReport(res.report);
      track("groq", "llama-3.3-70b-versatile", "brand_city_intel", 2, 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  }

  function copyOutreach() {
    if (!report) return;
    navigator.clipboard.writeText(report.campaign.outreach).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1600);
      toast.success("Outreach copied");
    });
  }

  function saveToPipeline() {
    if (!report) return;
    if (brandDeals.some((d) => d.brandName.toLowerCase() === brand.toLowerCase())) {
      toast.info(`${brand} already in pipeline`); setSaved(true); return;
    }
    addDeal({
      brandName: brand, category: "", contactName: "", stage: "briefed",
      objective: report.campaign.pitchAngle, targetCities: [city], targetAudience: report.profile.targetAudience,
      totalBudget: budget, durationMonths: 1,
      notes: `[Brand Intelligence] ${city} · likelihood ${report.campaign.likelihood}% · ${report.campaign.barterValue} · top zones: ${report.zones.slice(0, 3).map((z) => z.name).join(", ")}`,
    });
    setSaved(true);
    toast.success(`${brand} added to pipeline`, "Stage: Briefed");
  }

  return (
    <div className="mx-auto max-w-[1250px] p-4 md:p-6">
      <div className="mb-5 print:hidden">
        <h1 className="flex items-center gap-2 text-2xl font-semibold"><Microscope className="h-6 w-6 text-primary" /> Brand Intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Brand + city → full market intelligence: live signals, pincode demand map, zone-level OOH strategy, ready pitch.
        </p>
      </div>

      {/* Input bar */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-card print:hidden">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label="Brand *"><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Zepto" className={inputCls} /></Field>
          <Field label="City *"><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lucknow" className={inputCls} /></Field>
          <Field label="Objective (optional)"><input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="City launch, awareness…" className={inputCls} /></Field>
          <div className="flex items-end">
            <button
              onClick={run}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>
        {error && <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
      </div>

      {loading && (
        <AnalysisProgress
          title={`Researching ${brand || "brand"} × ${city || "city"}`}
          steps={[
            `Reading ${brand}'s recent news & funding`,
            "Profiling business model, audience & competitors",
            `Scoring ${city} pincodes by demand`,
            "Mapping high-visibility OOH zones",
            "Drafting media mix & pitch",
          ]}
          sources={["Google News", "Category patterns", "Geo model", "Groq"]}
        />
      )}

      {!report && !loading && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center">
          <div className="max-w-lg">
            <Microscope className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Example: <b>Zepto × Lucknow</b> → who they are, live buying signals with sources, the highest-demand pincodes scored 0-100, exact advertising zones with senior-planner reasoning, and a barter pitch ready to send.
            </p>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Hero summary — scannable answer before the detail */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">{brand}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{city}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-primary">{report.campaign.pitchAngle}</p>
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why now</div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {report.signals.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        <span className="line-clamp-2">{s.signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:border-l md:border-border md:pl-4">
                <HeroStat label="Barter value" value={report.campaign.barterValue} big />
                <HeroStat label="Confidence" value={`${report.campaign.likelihood}%`} tone={report.campaign.likelihood >= 75 ? "success" : "muted"} />
                <HeroStat label="Top pincode" value={report.pincodes[0] ? `${report.pincodes[0].score}` : "—"} sub={report.pincodes[0]?.area} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-5 py-2.5 print:hidden">
              <button onClick={saveToPipeline} disabled={saved} className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60">
                {saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{saved ? "In pipeline" : "Add to pipeline"}
              </button>
              <button onClick={copyOutreach} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs hover:bg-muted">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy pitch"}
              </button>
              <button onClick={pushToCrm} disabled={pushing || pushed} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs hover:bg-muted disabled:opacity-60">
                {pushing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : pushed ? <Check className="h-3.5 w-3.5 text-success" /> : <Contact className="h-3.5 w-3.5" />}
                {pushed ? "In CRM" : "Push to CRM"}
              </button>
              <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Sources: Google News · geo model · Groq · generated just now
              </span>
            </div>
          </div>

          {/* 1 — Overview */}
          <Section n={1} title={`Understanding ${brand}`}>
            <p className="text-sm leading-relaxed">{report.profile.businessModel}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MiniCard label="Target audience" text={report.profile.targetAudience} />
              <MiniCard label="Purchase behaviour" text={report.profile.purchaseBehaviour} />
              <MiniCard label="Marketing style" text={report.profile.marketingStyle} />
              <MiniCard label="Expansion" text={report.profile.expansion} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold">Competitors:</span>
              {report.profile.competitors.map((c) => <span key={c} className="rounded-full border border-border px-2.5 py-0.5">{c}</span>)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Seasonality:</span> {report.profile.seasonality}</div>
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ideal OOH use cases</div>
              <div className="flex flex-wrap gap-1.5">
                {report.profile.oohUseCases.map((u, i) => <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{u}</span>)}
              </div>
            </div>
          </Section>

          {/* 2 — Live signals */}
          <Section n={2} title="Live buying signals" badge={report.newsCount > 0 ? `${report.newsCount} headlines scanned` : undefined}>
            <div className="space-y-2.5">
              {report.signals.map((s, i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{s.signal}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground"><span className="font-medium text-foreground">Means:</span> {s.meaning}</div>
                      {s.source && (
                        <a href={s.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" /> {s.source.source}: {s.source.title.slice(0, 70)}…
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 3 — City + pincode heat */}
          <Section n={3} title={`${city} demand intelligence`}>
            <p className="mb-4 text-sm leading-relaxed">{report.cityOverview}</p>
            <ServiceabilityBar pincodes={report.pincodes} />
            <div className="grid gap-2 sm:grid-cols-2">
              {report.pincodes.map((p) => <PincodeCard key={p.pincode} p={p} />)}
            </div>
          </Section>

          {/* 4 — Map */}
          <Section n={4} title="Opportunity map" badge="click any marker">
            <IntelMap report={report} onZone={setSelectedZone} selected={selectedZone} />
            {selectedZone && <ZoneDetail zone={selectedZone} brand={brand} />}
          </Section>

          {/* 5 — Zones & OOH */}
          <Section n={5} title="Where to advertise — zone by zone">
            <div className="space-y-3">
              {report.zones.map((z, i) => (
                <div key={i} className={`rounded-xl border p-4 transition ${selectedZone?.name === z.name ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setSelectedZone(z)} className="flex items-center gap-1.5 text-sm font-semibold hover:text-primary">
                      <MapPin className="h-4 w-4 text-primary" /> {z.name}
                    </button>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{z.kind}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{z.confidence}% confidence</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Who's here:</span> {z.whyPeople}</div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{z.reasoning}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {z.media.map((m, j) => <span key={j} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">{m}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 6 — Campaign strategy */}
          <Section n={6} title="Campaign strategy">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Est. reach" value={report.campaign.estReach} />
              <MiniStat label="Frequency" value={report.campaign.frequency} />
              <MiniStat label="Duration" value={report.campaign.duration} />
              <MiniStat label="Barter value" value={report.campaign.barterValue} />
              <MiniStat label="Inventory fit" value={report.campaign.inventoryFit} />
              <MiniStat label="Close likelihood" value={`${report.campaign.likelihood}%`} />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-1 font-medium">Format</th><th className="pb-1 font-medium">Zones</th><th className="pb-1 text-right font-medium">Share</th></tr></thead>
                <tbody className="divide-y divide-border/60">
                  {report.campaign.mediaMix.map((m, i) => (
                    <tr key={i}><td className="py-1.5 font-medium">{m.format}</td><td className="py-1.5 text-muted-foreground">{m.zones}</td><td className="py-1.5 text-right">{m.share}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 7 — Pitch */}
          <Section n={7} title={`Pitch ${brand}`}>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">Lead with</div>
              <p className="mt-1 text-sm font-medium">{report.campaign.pitchAngle}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{report.campaign.whyBizex4u}</p>
            </div>
            <div className="mt-3 rounded-xl bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Outreach message</span>
                <button onClick={copyOutreach} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted print:hidden">
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.campaign.outreach}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <button onClick={saveToPipeline} disabled={saved} className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {saved ? "In pipeline" : "Add to pipeline"}
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">
                <Printer className="h-4 w-4" /> Print report
              </button>
            </div>
          </Section>

          <p className="text-center text-[11px] text-muted-foreground">
            AI-generated intelligence — signals link to real sources; scores, coordinates and estimates are model inferences. Verify before committing spend.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Report building blocks ────────────────────────────────────────────────────

function Section({ n, title, badge, children }: { n: number; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">{n}</span>
        <h2 className="text-base font-semibold">{title}</h2>
        {badge && <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

function HeroStat({ label, value, sub, big, tone }: { label: string; value: string; sub?: string; big?: boolean; tone?: "success" | "muted" }) {
  return (
    <div className="rounded-xl bg-muted/40 p-2.5 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-bold leading-tight ${big ? "text-lg" : "text-base"} ${tone === "success" ? "text-success" : ""}`}>{value}</div>
      {sub && <div className="truncate text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function MiniCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <p className="mt-1 text-sm leading-snug">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold leading-snug">{value}</div>
    </div>
  );
}

// ── Quick-commerce serviceability ─────────────────────────────────────────────

function ServiceabilityBar({ pincodes }: { pincodes: PincodeScore[] }) {
  const check = useServerFn(checkServiceability);
  const [results, setResults] = useState<ServiceabilityResult[] | null>(null);
  const [checking, setChecking] = useState(false);

  async function run() {
    setChecking(true);
    try {
      const res = await check({ data: {
        points: pincodes.slice(0, 10).map((p) => ({ pincode: p.pincode, lat: p.lat, lng: p.lng })),
      }});
      setResults(res.results);
    } finally { setChecking(false); }
  }

  const mark = (s: ServiceabilityResult["swiggy"]) =>
    s === "serviceable" ? "✅" : s === "not_serviceable" ? "❌" : "—";

  return (
    <div className="mb-4 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs">
          <span className="font-semibold">Quick-commerce serviceability</span>
          <span className="text-muted-foreground"> — live check whether delivery platforms serve these pincodes</span>
        </div>
        {!results && (
          <button onClick={run} disabled={checking} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-60">
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-primary" />}
            {checking ? "Probing Swiggy…" : "Check now"}
          </button>
        )}
      </div>
      {results && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1 pr-3 font-medium">Pincode</th>
                <th className="py-1 pr-3 font-medium">Swiggy (live)</th>
                <th className="py-1 font-medium">Blinkit / Zepto (manual — they block bots)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {results.map((r) => (
                <tr key={r.pincode}>
                  <td className="py-1.5 pr-3 font-medium">{r.pincode}</td>
                  <td className="py-1.5 pr-3">{mark(r.swiggy)} {r.swiggy.replace("_", " ")}</td>
                  <td className="py-1.5">
                    <a href="https://blinkit.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Blinkit ↗</a>
                    <span className="mx-1.5 text-muted-foreground">·</span>
                    <a href="https://www.zeptonow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zepto ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Swiggy food serviceability ≈ q-commerce footprint proxy. For Blinkit/Zepto open the link and set the pincode — their sites block automated checks.
          </p>
        </div>
      )}
    </div>
  );
}

function PincodeCard({ p }: { p: PincodeScore }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-border p-3 text-left transition hover:border-primary/40">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-12 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: scoreColor(p.score) }}>
          {p.score}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{p.pincode} · {p.area}</div>
          <div className="truncate text-xs text-muted-foreground">{p.profile}</div>
        </div>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-90" : ""}`} />
      </div>
      {open && (
        <ul className="mt-2 space-y-1 pl-1">
          {p.reasons.map((r, i) => (
            <li key={i} className="flex gap-1.5 text-xs text-foreground/90"><Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />{r}</li>
          ))}
        </ul>
      )}
    </button>
  );
}

// ── Map ───────────────────────────────────────────────────────────────────────

function IntelMap({ report, onZone, selected }: {
  report: BrandCityReport;
  onZone: (z: ZoneRec) => void;
  selected: ZoneRec | null;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const pts = [...report.pincodes, ...report.zones].filter((p) => p.lat && p.lng);
    const center: [number, number] = pts.length
      ? [pts.reduce((a, p) => a + p.lng, 0) / pts.length, pts.reduce((a, p) => a + p.lat, 0) / pts.length]
      : [80.94, 26.85];
    const map = new maplibregl.Map({
      container: container.current,
      style: "https://tiles.openfreemap.org/styles/bright",
      center, zoom: 11.4,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    const markers: maplibregl.Marker[] = [];

    // Pincode demand circles
    for (const p of report.pincodes) {
      if (!p.lat || !p.lng) continue;
      const el = document.createElement("div");
      const size = 26 + (p.score / 100) * 26;
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${scoreColor(p.score)}55;border:2px solid ${scoreColor(p.score)};display:grid;place-items:center;font:700 10px system-ui;color:#1f2937;cursor:default;`;
      el.textContent = String(p.score);
      el.title = `${p.pincode} ${p.area} — demand ${p.score}/100`;
      markers.push(new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map));
    }
    // Zone pins
    for (const z of report.zones) {
      if (!z.lat || !z.lng) continue;
      const el = document.createElement("div");
      const active = selected?.name === z.name;
      el.style.cssText = `width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active ? "#4c1d95" : "#7c3aed"};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer;`;
      el.title = z.name;
      el.addEventListener("click", () => onZone(z));
      markers.push(new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([z.lng, z.lat]).addTo(map));
    }
    markersRef.current = markers;
  }, [report, selected, onZone]);

  return <div ref={container} className="h-[420px] w-full overflow-hidden rounded-xl border border-border" />;
}

// ── Zone detail + Places scan ─────────────────────────────────────────────────

function ZoneDetail({ zone, brand }: { zone: ZoneRec; brand: string }) {
  const getNearby = useServerFn(fetchNearbyPlaces);
  const [places, setPlaces] = useState<PlaceBusiness[] | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => { setPlaces(null); }, [zone.name]);

  async function scan() {
    setScanning(true);
    try {
      const res = await getNearby({ data: { lat: zone.lat, lng: zone.lng, radius: 800 } });
      setPlaces((res.places as PlaceBusiness[]) || []);
    } finally { setScanning(false); }
  }

  const cats = places
    ? Object.entries(places.reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {}))
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
    : [];

  return (
    <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{zone.name}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{zone.kind}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{zone.confidence}% confidence</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{zone.reasoning}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {zone.media.map((m, i) => <span key={i} className="rounded-full bg-card px-2.5 py-0.5 text-[11px] text-primary border border-primary/30">{m}</span>)}
      </div>
      <div className="mt-3">
        {!places && (
          <button onClick={scan} disabled={scanning} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-60">
            {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Target className="h-3.5 w-3.5" />}
            {scanning ? "Scanning Google Places…" : "Scan real venues here (Google Places)"}
          </button>
        )}
        {places && (
          <div className="text-xs">
            <span className="font-semibold">{places.length} venues within 800m: </span>
            {cats.map(([c, n]) => `${c} ×${n}`).join(" · ")}
            <div className="mt-1 text-muted-foreground">
              Anchors: {places.slice(0, 5).map((p) => p.name).join(", ")}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <TrendingUp className="h-3 w-3" /> Why it converts for {brand}: {zone.whyPeople}
      </div>
    </div>
  );
}
