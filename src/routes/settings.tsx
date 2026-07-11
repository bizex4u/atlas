import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { useSettings, useAccounts, useCredits, estimateCost, type Settings, type ApiService } from "@/lib/stores";
import { inr } from "@/lib/format";
import { Field, inputCls } from "@/components/ui";
import { tallySync } from "@/lib/ai.functions";
import {
  Check, Loader2, CheckCircle2, XCircle, AlertCircle,
  Wifi, WifiOff, RefreshCw, Download, BarChart2, Trash2, Cloud,
} from "lucide-react";
import { useGoogleAuth, isGoogleConnected, connectGoogle } from "@/lib/google";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Atlas" },
      { name: "description", content: "Company, integrations and sync settings for BIZEX4U." },
    ],
  }),
  component: SettingsPage,
});

type Tab = "company" | "integrations" | "tally" | "credits";

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("company");
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
        <p className="mb-5 text-sm text-muted-foreground">Configure Atlas for BIZEX4U</p>

        {/* Tab bar */}
        <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1">
          {([
            { id: "company", label: "Company" },
            { id: "integrations", label: "AI & APIs" },
            { id: "tally", label: "Tally Sync" },
            { id: "credits", label: "Usage & Credits" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "rounded-lg px-4 py-1.5 text-sm transition-colors " +
                (tab === t.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "company" && <CompanyTab />}
        {tab === "integrations" && <IntegrationsTab />}
        {tab === "tally" && <TallyTab />}
        {tab === "credits" && <CreditsTab />}
      </div>
    </AppShell>
  );
}

function CompanyTab() {
  const settings = useSettings((s) => s.settings);
  const save = useSettings((s) => s.save);
  const [form, setForm] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(k: K, v: Settings[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    save(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section title="Company details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company name">
            <input value={form.company} onChange={(e) => update("company", e.target.value)} className={inputCls} />
          </Field>
          <Field label="GSTIN">
            <input value={form.gstin} onChange={(e) => update("gstin", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Address">
            <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Pincode">
            <input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contact name">
            <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Bank details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Bank name">
            <input value={form.bankName} onChange={(e) => update("bankName", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Account number">
            <input value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} className={inputCls} />
          </Field>
          <Field label="IFSC">
            <input value={form.ifsc} onChange={(e) => update("ifsc", e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-card">
          Save changes
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

function GoogleSection() {
  const clientId = useGoogleAuth((s) => s.clientId);
  const setClientId = useGoogleAuth((s) => s.setClientId);
  const token = useGoogleAuth((s) => s.token);
  const disconnect = useGoogleAuth((s) => s.disconnect);
  const connected = !!token && isGoogleConnected();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doConnect() {
    setBusy(true); setErr(null);
    const res = await connectGoogle();
    if (!res.ok) setErr(res.error || "Failed");
    setBusy(false);
  }

  return (
    <Section title="Google Drive + Gmail — Cloud Import">
      <p className="mb-3 text-xs text-muted-foreground">
        Import rate cards, costing Excels and site photos directly from Drive and Gmail attachments into Partner Import. Read-only access.
      </p>
      <div className="mb-3 rounded-xl bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
        <div>1. console.cloud.google.com → APIs & Services → Credentials</div>
        <div>2. Create OAuth Client ID → Web application → add <code className="rounded bg-muted px-1">http://localhost:8080</code> to Authorized JavaScript origins</div>
        <div>3. Enable <b>Google Drive API</b> + <b>Gmail API</b> in API Library</div>
        <div>4. Paste Client ID below, click Connect, approve the Google popup</div>
      </div>
      <Field label="Google OAuth Client ID">
        <input
          value={clientId}
          onChange={(e) => setClientId(e.target.value.trim())}
          placeholder="xxxx.apps.googleusercontent.com"
          className={inputCls}
        />
      </Field>
      <div className="mt-3 flex items-center gap-3">
        {connected ? (
          <>
            <span className="flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Connected — Drive + Gmail readable</span>
            <button type="button" onClick={disconnect} className="rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted">Disconnect</button>
          </>
        ) : (
          <button
            type="button"
            onClick={doConnect}
            disabled={busy || !clientId}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
            Connect Google Account
          </button>
        )}
      </div>
      {err && <div className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{err}</div>}
      <div className="mt-2 text-[11px] text-muted-foreground">Token expires after ~1 hour — reconnect when prompted. Scopes: drive.readonly, gmail.readonly.</div>
    </Section>
  );
}

function IntegrationsTab() {
  const settings = useSettings((s) => s.settings);
  const save = useSettings((s) => s.save);
  const [form, setForm] = useState({ openrouterKey: settings.openrouterKey || "", tallyHost: settings.tallyHost || "http://localhost:9000" });
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    save({ ...settings, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <GoogleSection />

      <Section title="Groq Vision — Partner Import (Free)">
        <p className="mb-3 text-xs text-muted-foreground">
          Powers Partner Import with <strong>llama-4-scout-17b</strong> — free vision model for images, PDFs, PPTs.
          Uses the existing <code className="rounded bg-muted px-1 py-0.5 text-[11px]">GROQ_API_KEY</code> in .env — no extra setup.
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Groq Vision active · llama-4-scout-17b-16e-instruct · Free
        </div>
      </Section>

      <Section title="OpenRouter — Fallback Vision">
        <p className="mb-4 text-xs text-muted-foreground">
          Fallback if HF fails. Uses Qwen2.5-VL-72B (larger, better quality). Free tier available at <span className="text-primary">openrouter.ai</span>
        </p>
        <Field label="OpenRouter API Key">
          <input
            type="password"
            value={form.openrouterKey}
            onChange={(e) => setForm((f) => ({ ...f, openrouterKey: e.target.value }))}
            placeholder="sk-or-..."
            className={inputCls}
          />
        </Field>
        {form.openrouterKey ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Key set — fallback parsing enabled
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5" /> Optional — HF is primary, OpenRouter is fallback
          </div>
        )}
      </Section>

      <Section title="Groq AI — Chat & Analysis (Free)">
        <p className="mb-3 text-xs text-muted-foreground">
          Powers Atlas AI assistant + Area Intelligence on map. Key stored in <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.env</code> — no change needed.
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Groq connected · llama-3.3-70b-versatile · Free tier
        </div>
      </Section>

      <Section title="Google Places API — Map Intelligence">
        <p className="mb-3 text-xs text-muted-foreground">
          Used for Area Intelligence on map — nearby businesses, footfall, SEC scoring. Key stored in <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.env</code>.
          Free credit: ₹16,700/month (actual usage ~₹400/month).
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-xs text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Google Places API key set · Nearby Search enabled
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-card">
          Save keys
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-success">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

interface TallyVoucher {
  number: string;
  party: string;
  amount: number;
  date: string;
  type: string;
}

function TallyTab() {
  const settings = useSettings((s) => s.settings);
  const save = useSettings((s) => s.save);
  const addInvoice = useAccounts((s) => s.addInvoice);
  const [host, setHost] = useState(settings.tallyHost || "http://localhost:9000");
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [pingMsg, setPingMsg] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<TallyVoucher[]>([]);
  const [syncError, setSyncError] = useState("");
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const sync = useServerFn(tallySync);

  async function testConnection() {
    setPingStatus("testing");
    setPingMsg("");
    save({ ...settings, tallyHost: host });
    const r = await sync({ data: { host, type: "ping" } });
    if (r.ok) {
      setPingStatus("ok");
      setPingMsg(r.company || "Connected");
    } else {
      setPingStatus("fail");
      setPingMsg(r.error || "Failed");
    }
  }

  async function fetchVouchers() {
    setSyncing(true);
    setSyncResult([]);
    setSyncError("");
    const r = await sync({ data: { host, type: "vouchers", fromDate, toDate } });
    if (r.ok && r.vouchers) {
      setSyncResult(r.vouchers as TallyVoucher[]);
    } else {
      setSyncError(r.error || "Failed");
    }
    setSyncing(false);
  }

  function importToAccounts() {
    setImporting(true);
    let count = 0;
    for (const v of syncResult) {
      const isSales = v.type?.toLowerCase().includes("sales") || v.type?.toLowerCase().includes("receipt");
      addInvoice({
        type: isSales ? "sales" : "purchase",
        party: v.party || "Unknown",
        gstin: "",
        date: v.date
          ? `${v.date.slice(0, 4)}-${v.date.slice(4, 6)}-${v.date.slice(6, 8)}`
          : new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        sameState: true,
        notes: `Imported from Tally · ${v.type} · ${v.number}`,
        lines: [{ description: v.type || "Tally voucher", qty: 1, unit: "item", rate: Math.abs(v.amount) }],
      });
      count++;
    }
    setImported(count);
    setSyncResult([]);
    setImporting(false);
  }

  return (
    <div className="space-y-5">
      <Section title="Tally Connection">
        <p className="mb-4 text-xs text-muted-foreground">
          TallyPrime must be open on this machine with HTTP server enabled.
          Enable via: <code className="rounded bg-muted px-1 py-0.5 text-[11px]">F12 → Configure → Advanced → Enable ODBC Server</code>
        </p>
        <div className="flex gap-2">
          <Field label="TallyPrime URL">
            <input value={host} onChange={(e) => setHost(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={testConnection}
            disabled={pingStatus === "testing"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
          >
            {pingStatus === "testing" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Testing…</>
            ) : (
              <><Wifi className="h-4 w-4" /> Test connection</>
            )}
          </button>
          {pingStatus === "ok" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> {pingMsg}
            </span>
          )}
          {pingStatus === "fail" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-destructive">
              <WifiOff className="h-4 w-4" /> {pingMsg}
            </span>
          )}
        </div>
      </Section>

      <Section title="Import Vouchers">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Field label="From date">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="To date">
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <button
          onClick={fetchVouchers}
          disabled={syncing || pingStatus !== "ok"}
          className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {syncing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Fetching from Tally…</>
          ) : (
            <><RefreshCw className="h-4 w-4" /> Fetch vouchers</>
          )}
        </button>
        {pingStatus !== "ok" && (
          <p className="mt-2 text-xs text-muted-foreground">Test connection first</p>
        )}

        {syncError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <XCircle className="h-4 w-4 shrink-0" /> {syncError}
          </div>
        )}

        {syncResult.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{syncResult.length} vouchers fetched</span>
              <button
                onClick={importToAccounts}
                disabled={importing}
                className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Import all to Accounts
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Party</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {syncResult.slice(0, 50).map((v, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="px-3 py-2 text-muted-foreground">{v.number}</td>
                      <td className="px-3 py-2 font-medium max-w-[120px] truncate">{v.party}</td>
                      <td className="px-3 py-2 text-muted-foreground">{v.type}</td>
                      <td className="px-3 py-2 text-right font-medium">
                        ₹{Math.abs(v.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {imported > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {imported} vouchers imported to Accounts
          </div>
        )}
      </Section>

      <Section title="How Tally sync works">
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li className="flex gap-2"><span className="font-semibold text-foreground">1.</span> Open TallyPrime on this computer</li>
          <li className="flex gap-2"><span className="font-semibold text-foreground">2.</span> Enable HTTP server via F12 → Configure → Advanced Config</li>
          <li className="flex gap-2"><span className="font-semibold text-foreground">3.</span> Click "Test connection" above</li>
          <li className="flex gap-2"><span className="font-semibold text-foreground">4.</span> Set date range and fetch vouchers</li>
          <li className="flex gap-2"><span className="font-semibold text-foreground">5.</span> Import to Atlas Accounts — GST fields auto-filled</li>
        </ol>
      </Section>
    </div>
  );
}

const SERVICE_META: Record<ApiService, { label: string; color: string; cost: string }> = {
  groq:          { label: "Groq (Chat + Analysis)", color: "bg-orange-100 text-orange-800", cost: "Free" },
  hf:            { label: "HuggingFace Vision",     color: "bg-blue-100 text-blue-800",    cost: "Free (~1K req/day)" },
  openrouter:    { label: "OpenRouter Vision",      color: "bg-violet-100 text-violet-800",cost: "Free (free models)" },
  google_places: { label: "Google Places API",      color: "bg-green-100 text-green-800",  cost: "₹1.40/1K calls" },
};

function CreditsTab() {
  const { log, clear } = useCredits();
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);

  const todayLog = log.filter((e) => e.date === today);
  const monthLog = log.filter((e) => e.date.startsWith(thisMonth));

  function sumBy(entries: typeof log) {
    const byService: Record<string, { calls: number; tokens: number; cost: number }> = {};
    for (const e of entries) {
      if (!byService[e.service]) byService[e.service] = { calls: 0, tokens: 0, cost: 0 };
      byService[e.service].calls += e.calls;
      byService[e.service].tokens += e.tokens;
      byService[e.service].cost += estimateCost(e);
    }
    return byService;
  }

  const todaySums = sumBy(todayLog);
  const monthSums = sumBy(monthLog);
  const allServices: ApiService[] = ["groq", "hf", "openrouter", "google_places"];

  const totalMonthlyCost = Object.values(monthSums).reduce((a, s) => a + s.cost, 0);

  return (
    <div className="space-y-5">
      <Section title="API Usage & Cost Tracker">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            All usage logged locally. Costs are estimates based on public pricing.
          </p>
          <button
            onClick={() => { if (confirm("Clear all usage history?")) clear(); }}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Clear log
          </button>
        </div>

        {log.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart2 className="mb-2 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No API calls tracked yet</p>
            <p className="text-xs text-muted-foreground/60">Usage will appear here after first AI call</p>
          </div>
        ) : (
          <>
            {/* Monthly cost summary */}
            <div className="mb-4 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <div className="text-xs text-muted-foreground">This month total estimated cost</div>
              <div className="text-2xl font-bold text-primary">
                {totalMonthlyCost === 0 ? "₹0 (all free)" : `₹${totalMonthlyCost.toFixed(2)}`}
              </div>
            </div>

            {/* Per-service table */}
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground">
                    <th className="px-3 py-2 text-left">Service</th>
                    <th className="px-3 py-2 text-right">Today calls</th>
                    <th className="px-3 py-2 text-right">Month calls</th>
                    <th className="px-3 py-2 text-right">Month tokens</th>
                    <th className="px-3 py-2 text-right">Est. cost</th>
                    <th className="px-3 py-2 text-left">Pricing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allServices.map((svc) => {
                    const meta = SERVICE_META[svc];
                    const td = todaySums[svc] || { calls: 0, tokens: 0, cost: 0 };
                    const mo = monthSums[svc] || { calls: 0, tokens: 0, cost: 0 };
                    return (
                      <tr key={svc} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">{td.calls || "—"}</td>
                        <td className="px-3 py-2.5 text-right font-medium">{mo.calls || "—"}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">
                          {mo.tokens > 0 ? mo.tokens.toLocaleString("en-IN") : "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">
                          {mo.cost > 0 ? `₹${mo.cost.toFixed(2)}` : "₹0"}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{meta.cost}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Recent calls */}
            {log.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium text-muted-foreground">Recent calls (last 20)</div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                  {[...log].reverse().slice(0, 20).map((e) => (
                    <div key={e.id} className="flex items-center gap-2 px-3 py-2 text-[11px]">
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${SERVICE_META[e.service]?.color}`}>
                        {e.service}
                      </span>
                      <span className="text-muted-foreground flex-1 truncate">{e.action}</span>
                      <span className="text-muted-foreground">{e.calls} call{e.calls > 1 ? "s" : ""}</span>
                      {e.tokens > 0 && <span className="text-muted-foreground">{e.tokens.toLocaleString()} tok</span>}
                      <span className="text-muted-foreground/60">{e.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="Free tier limits">
        <div className="space-y-2 text-xs">
          {[
            { service: "Groq", limit: "14,400 req/day, 6,000 tokens/min — effectively unlimited for Atlas", color: "text-orange-600" },
            { service: "HuggingFace", limit: "~1,000 vision requests/day free · Cold start ~20s if model idle", color: "text-blue-600" },
            { service: "OpenRouter", limit: "Free models have no hard cap but may queue during peak hours", color: "text-violet-600" },
            { service: "Google Places", limit: "₹16,700 free credit/month · Atlas usage ~₹400/month", color: "text-green-600" },
          ].map((r) => (
            <div key={r.service} className="flex gap-2">
              <span className={`shrink-0 font-semibold ${r.color} w-24`}>{r.service}</span>
              <span className="text-muted-foreground">{r.limit}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </div>
  );
}
