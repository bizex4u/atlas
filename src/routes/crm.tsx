import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { twentyStatus, twentySync, twentyList, type CrmRecord } from "@/lib/twenty.functions";
import { toast } from "@/components/Toaster";
import { Building2, Users, Target, RefreshCw, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/crm")({
  head: () => ({ meta: [{ title: "CRM (Twenty) — Atlas" }] }),
  component: CrmPage,
});

function CrmPage() { return <AppShell><CrmContent /></AppShell>; }

type Tab = "company" | "opportunity" | "person";
const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "company", label: "Companies", icon: Building2 },
  { key: "opportunity", label: "Opportunities", icon: Target },
  { key: "person", label: "People", icon: Users },
];

function CrmContent() {
  const statusFn = useServerFn(twentyStatus);
  const syncFn = useServerFn(twentySync);
  const listFn = useServerFn(twentyList);

  const [status, setStatus] = useState<{ connected: boolean; error: string | null; url: string } | null>(null);
  const [tab, setTab] = useState<Tab>("company");
  const [records, setRecords] = useState<CrmRecord[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { statusFn({ data: {} }).then(setStatus); }, [statusFn]);

  async function load(k: Tab) {
    setLoading(true);
    try {
      const res = await listFn({ data: { kind: k } });
      setRecords(res.records);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(tab); /* eslint-disable-next-line */ }, [tab]);

  async function sync() {
    setSyncing(true);
    try {
      const res = await syncFn({ data: {} });
      if (!res.ok) { toast.error("Sync failed", res.error || undefined); return; }
      toast.success("Synced from Twenty", `${res.counts.company} companies · ${res.counts.opportunity} opps · ${res.counts.person} people`);
      await load(tab);
    } finally { setSyncing(false); }
  }

  return (
    <div className="mx-auto max-w-[1100px] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Twenty CRM data, synced into Atlas &amp; stored in your database.</p>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${status.connected ? "border-success/30 text-success" : "border-border text-muted-foreground"}`}>
              {status.connected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {status.connected ? "Connected" : "Not connected"}
            </span>
          )}
          <button onClick={sync} disabled={syncing || !status?.connected}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Syncing…" : "Sync from Twenty"}
          </button>
        </div>
      </div>

      {status && !status.connected && (
        <div className="mb-5 rounded-2xl border border-amber-300/40 bg-amber-50/50 p-4 text-sm dark:bg-amber-950/20">
          <div className="font-medium">Connect Twenty CRM</div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
            <li>In Twenty → Settings → API &amp; Webhooks → create an API key</li>
            <li>Add to Atlas <code className="rounded bg-muted px-1">.env</code>: <code className="rounded bg-muted px-1">TWENTY_API_KEY=…</code> and <code className="rounded bg-muted px-1">TWENTY_API_URL={status.url}</code></li>
            <li>Restart the dev server (or set both on Vercel for production)</li>
          </ol>
          {status.error && <div className="mt-2 text-xs text-destructive">Last error: {status.error}</div>}
        </div>
      )}

      <div className="mb-4 flex gap-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${tab === t.key ? "gradient-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No {tab === "person" ? "people" : tab + "s"} synced yet. {status?.connected ? "Hit “Sync from Twenty”." : "Connect Twenty first."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {records.map((r) => <RecordRow key={r.id} r={r} baseUrl={status?.url.replace("/graphql", "")} />)}
          </ul>
        )}
      </div>
      {records.length > 0 && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {records.length} records · last synced {new Date(records[0].syncedAt).toLocaleString("en-IN")} · stored in Turso
        </p>
      )}
    </div>
  );
}

function RecordRow({ r, baseUrl }: { r: CrmRecord; baseUrl?: string }) {
  const p = (() => { try { return JSON.parse(r.payload) as Record<string, unknown>; } catch { return {}; } })();
  let sub = "";
  if (r.kind === "company") {
    const addr = p.address as { addressCity?: string; addressState?: string } | undefined;
    sub = [addr?.addressCity, addr?.addressState, (p.domainName as { primaryLinkUrl?: string })?.primaryLinkUrl].filter(Boolean).join(" · ");
  } else if (r.kind === "opportunity") {
    const amt = p.amount as { amountMicros?: string; currencyCode?: string } | undefined;
    const val = amt?.amountMicros ? `₹${(Number(amt.amountMicros) / 1_000_000).toLocaleString("en-IN")}` : "";
    sub = [p.stage, val, (p.company as { name?: string })?.name].filter(Boolean).join(" · ");
  } else {
    sub = [p.jobTitle, (p.emails as { primaryEmail?: string })?.primaryEmail, (p.company as { name?: string })?.name].filter(Boolean).join(" · ");
  }
  const objectPath = r.kind === "company" ? "companies" : r.kind === "opportunity" ? "opportunities" : "people";
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{r.name}</div>
        {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
      </div>
      {baseUrl && (
        <a href={`${baseUrl}/object/${objectPath.slice(0, -1)}/${r.id}`} target="_blank" rel="noopener noreferrer"
          className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted" title="Open in Twenty">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </li>
  );
}
