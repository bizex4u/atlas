import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCrm, type LeadStage } from "@/lib/crm";
import { useAccounts, invoiceOutstanding, invoiceTotal } from "@/lib/stores";
import { inr } from "@/lib/format";
import { Plus, Search, Users, X } from "lucide-react";
import { Modal, Field, inputCls } from "@/components/ui";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Agencies — Atlas" },
      { name: "description", content: "Advertising agency pipeline — Dentsu, WPP, GroupM, Publicis and more." },
    ],
  }),
  component: CustomersPage,
});

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "won", "lost"];
const STAGE_STYLE: Record<LeadStage, string> = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-primary/10 text-primary",
  qualified: "bg-warning/15 text-warning-foreground",
  won: "bg-success/15 text-success",
  lost: "bg-destructive/10 text-destructive",
};

function CustomersPage() {
  const { customers } = useCrm();
  const invoices = useAccounts((s) => s.invoices);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<LeadStage | "all">("all");
  const [openNew, setOpenNew] = useState(false);

  const rows = useMemo(() => {
    const term = q.toLowerCase();
    return customers
      .filter((c) => stage === "all" || c.stage === stage)
      .filter(
        (c) =>
          !term ||
          c.name.toLowerCase().includes(term) ||
          c.contact.toLowerCase().includes(term) ||
          (c.email ?? "").toLowerCase().includes(term),
      );
  }, [customers, q, stage]);

  function outstandingFor(name: string) {
    return invoices
      .filter((i) => i.party.toLowerCase() === name.toLowerCase() && i.type === "sales")
      .reduce((a, i) => a + invoiceOutstanding(i), 0);
  }
  function billedFor(name: string) {
    return invoices
      .filter((i) => i.party.toLowerCase() === name.toLowerCase() && i.type === "sales")
      .reduce((a, i) => a + invoiceTotal(i), 0);
  }

  const totalPipeline = customers.filter((c) => c.stage === "qualified" || c.stage === "contacted").length;
  const totalWon = customers.filter((c) => c.stage === "won").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Agencies</h1>
            <p className="text-sm text-muted-foreground">Advertising agency pipeline</p>
          </div>
          <button
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card"
          >
            <Plus className="h-4 w-4" /> New Agency
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Total" value={customers.length} />
          <Kpi label="Won" value={totalWon} tone="success" />
          <Kpi label="In pipeline" value={totalPipeline} />
          <Kpi
            label="Total outstanding"
            value={inr(customers.reduce((a, c) => a + outstandingFor(c.name), 0))}
            tone="danger"
            isText
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter agencies…"
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40"
            />
          </div>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as any)}
            className="h-9 rounded-xl border border-border bg-card px-3 text-sm"
          >
            <option value="all">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Agency</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5 text-right">Billed</th>
                <th className="px-4 py-2.5 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <Users className="mx-auto mb-2 h-6 w-6 opacity-50" />
                    No agencies.
                  </td>
                </tr>
              )}
              {rows.map((c) => {
                const os = outstandingFor(c.name);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to="/customers/$id"
                        params={{ id: c.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {c.city ?? "—"}
                        {c.gstin ? ` · ${c.gstin}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + STAGE_STYLE[c.stage]}
                      >
                        {c.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{c.contact}</div>
                      <div className="text-muted-foreground">
                        {c.phone ?? ""} {c.email ? ` · ${c.email}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{inr(billedFor(c.name))}</td>
                    <td
                      className={
                        "px-4 py-3 text-right tabular-nums font-medium " +
                        (os > 0 ? "text-destructive" : "text-success")
                      }
                    >
                      {inr(os)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {openNew && <NewCustomerModal onClose={() => setOpenNew(false)} />}
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  tone,
  isText,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "danger";
  isText?: boolean;
}) {
  const c = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={"mt-1 font-semibold " + (isText ? "text-xl " : "text-2xl ") + c}>{value}</div>
    </div>
  );
}

function NewCustomerModal({ onClose }: { onClose: () => void }) {
  const addCustomer = useCrm((s) => s.addCustomer);
  const [f, setF] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    gstin: "",
    city: "",
    state: "Uttar Pradesh",
    stage: "new" as LeadStage,
    source: "",
    notes: "",
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    addCustomer(f);
    onClose();
  }
  return (
    <Modal title="New customer" onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <Field label="Company / Customer name">
          <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Contact person">
          <input required value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Phone">
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Email">
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} />
        </Field>
        <Field label="GSTIN">
          <input value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} className={inputCls} />
        </Field>
        <Field label="City">
          <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Stage">
          <select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value as LeadStage })} className={inputCls}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className={inputCls} placeholder="Referral / Website / Cold call" />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm">
            Cancel
          </button>
          <button className="rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Add customer
          </button>
        </div>
      </form>
    </Modal>
  );
}

void X;
