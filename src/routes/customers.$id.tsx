import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCrm, type LeadStage } from "@/lib/crm";
import { useAccounts, invoiceOutstanding, invoiceTotal, type Invoice } from "@/lib/stores";
import { inr, formatDate } from "@/lib/format";
import { ArrowLeft, Mail, Phone, MapPin, Trash2 } from "lucide-react";

export const Route = createFileRoute("/customers/$id")({
  head: () => ({ meta: [{ title: "Agency — Atlas" }] }),
  component: CustomerDetail,
});

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "won", "lost"];

function CustomerDetail() {
  const { id } = useParams({ from: "/customers/$id" });
  const customer = useCrm((s) => s.customers.find((c) => c.id === id));
  const { updateCustomer, deleteCustomer } = useCrm();
  const invoices = useAccounts((s) => s.invoices);

  if (!customer) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl p-10 text-center">
          <p className="text-muted-foreground">Agency not found.</p>
          <Link to="/customers" className="mt-3 inline-block text-sm text-primary hover:underline">
            ← Back to customers
          </Link>
        </div>
      </AppShell>
    );
  }

  const custInvoices = invoices.filter(
    (i) => i.party.toLowerCase() === customer.name.toLowerCase() && i.type === "sales",
  );
  const totalBilled = custInvoices.reduce((a, i) => a + invoiceTotal(i), 0);
  const totalOutstanding = custInvoices.reduce((a, i) => a + invoiceOutstanding(i), 0);
  const totalReceived = totalBilled - totalOutstanding;

  // Ageing buckets
  const buckets = { "0-30": 0, "30-60": 0, "60-90": 0, "90+": 0 };
  for (const i of custInvoices) {
    const os = invoiceOutstanding(i);
    if (os <= 0) continue;
    const days = Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000);
    if (days < 30) buckets["0-30"] += os;
    else if (days < 60) buckets["30-60"] += os;
    else if (days < 90) buckets["60-90"] += os;
    else buckets["90+"] += os;
  }

  // Payment history (flatten payments)
  const payments = custInvoices
    .flatMap((i) => i.payments.map((p) => ({ ...p, invoice: i })))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] p-4 md:p-6">
        <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{customer.contact}</span>
              {customer.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>}
              {customer.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</span>}
              {customer.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.city}</span>}
              {customer.gstin && <span>GSTIN {customer.gstin}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={customer.stage}
              onChange={(e) => updateCustomer(customer.id, { stage: e.target.value as LeadStage })}
              className="h-9 rounded-xl border border-border bg-card px-3 text-sm"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (confirm(`Delete ${customer.name}?`)) {
                  deleteCustomer(customer.id);
                  window.history.back();
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total billed" value={inr(totalBilled)} />
          <Stat label="Received" value={inr(totalReceived)} tone="success" />
          <Stat label="Outstanding" value={inr(totalOutstanding)} tone={totalOutstanding > 0 ? "danger" : undefined} />
          <Stat label="Invoices" value={String(custInvoices.length)} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Section title="Ageing">
            <div className="grid grid-cols-4 gap-2 text-center">
              {(Object.keys(buckets) as (keyof typeof buckets)[]).map((k) => (
                <div key={k} className="rounded-xl border border-border p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">{k} d</div>
                  <div className={"mt-1 text-sm font-semibold " + (buckets[k] > 0 ? "text-destructive" : "")}>
                    {inr(buckets[k])}
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Notes">
            <NotesEditor customerId={customer.id} initial={customer.notes ?? ""} />
          </Section>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Section title={`Invoices (${custInvoices.length})`}>
            {custInvoices.length === 0 ? (
              <Empty>No invoices for this customer yet.</Empty>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {custInvoices.map((i) => (
                  <InvoiceRow key={i.id} inv={i} />
                ))}
              </ul>
            )}
          </Section>
          <Section title={`Payment history (${payments.length})`}>
            {payments.length === 0 ? (
              <Empty>No payments recorded.</Empty>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="font-medium">{inr(p.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(p.date)} · {p.invoice.number}
                      </div>
                    </div>
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                      Received
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  const c = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={"mt-1 text-xl font-semibold " + c}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 text-sm font-medium">{title}</div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{children}</div>;
}

function InvoiceRow({ inv }: { inv: Invoice }) {
  const os = invoiceOutstanding(inv);
  return (
    <li className="flex items-center justify-between py-2.5">
      <div>
        <div className="font-medium">{inv.number}</div>
        <div className="text-xs text-muted-foreground">
          {formatDate(inv.date)} · Due {formatDate(inv.dueDate)} · {inv.status}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{inr(invoiceTotal(inv))}</div>
        <div className={"text-xs " + (os > 0 ? "text-destructive" : "text-success")}>
          {os > 0 ? `${inr(os)} due` : "Paid"}
        </div>
      </div>
    </li>
  );
}

function NotesEditor({ customerId, initial }: { customerId: string; initial: string }) {
  const update = useCrm((s) => s.updateCustomer);
  const [val, setVal] = useState(initial);
  return (
    <div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={4}
        placeholder="Add call notes, requirements, next steps…"
        className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/40"
      />
      <div className="mt-2 text-right">
        <button
          onClick={() => update(customerId, { notes: val })}
          className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
        >
          Save notes
        </button>
      </div>
    </div>
  );
}
