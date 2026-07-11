import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Invoice, invoiceSubtotal, invoiceTax, invoiceTotal } from "./stores";

export type AccountType = "asset" | "liability" | "income" | "expense" | "equity";

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  group: string;
}

// Default Chart of Accounts (Tally-style groups)
export const CHART: Account[] = [
  { code: "1000", name: "Bank", type: "asset", group: "Current Assets" },
  { code: "1010", name: "Cash", type: "asset", group: "Current Assets" },
  { code: "1200", name: "Accounts Receivable", type: "asset", group: "Current Assets" },
  { code: "1300", name: "GST Input Credit", type: "asset", group: "Duties & Taxes" },
  { code: "2000", name: "Accounts Payable", type: "liability", group: "Current Liabilities" },
  { code: "2100", name: "GST Payable", type: "liability", group: "Duties & Taxes" },
  { code: "3000", name: "Owner's Capital", type: "equity", group: "Capital Account" },
  { code: "4000", name: "Sales Income", type: "income", group: "Direct Income" },
  { code: "4100", name: "Barter Income", type: "income", group: "Indirect Income" },
  { code: "5000", name: "Purchase Expense", type: "expense", group: "Direct Expenses" },
  { code: "5100", name: "Rent Paid", type: "expense", group: "Indirect Expenses" },
  { code: "5200", name: "Marketing", type: "expense", group: "Indirect Expenses" },
  { code: "5300", name: "Salaries", type: "expense", group: "Indirect Expenses" },
];

export interface JournalLine {
  account: string; // account code
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  narration: string;
  lines: JournalLine[];
  source?: "manual" | "invoice" | "payment";
  ref?: string; // invoice number / payment id
}

// ------- Derive entries from invoices -------
export function deriveEntries(invoices: Invoice[]): JournalEntry[] {
  const out: JournalEntry[] = [];
  for (const inv of invoices) {
    const sub = invoiceSubtotal(inv);
    const tax = invoiceTax(inv);
    const total = invoiceTotal(inv);
    if (inv.type === "sales") {
      out.push({
        id: `auto-inv-${inv.id}`,
        date: inv.date,
        narration: `Sales invoice ${inv.number} — ${inv.party}`,
        source: "invoice",
        ref: inv.number,
        lines: [
          { account: "1200", debit: total, credit: 0 },
          { account: "4000", debit: 0, credit: sub },
          { account: "2100", debit: 0, credit: tax },
        ],
      });
    } else {
      out.push({
        id: `auto-inv-${inv.id}`,
        date: inv.date,
        narration: `Purchase invoice ${inv.number} — ${inv.party}`,
        source: "invoice",
        ref: inv.number,
        lines: [
          { account: "5000", debit: sub, credit: 0 },
          { account: "1300", debit: tax, credit: 0 },
          { account: "2000", debit: 0, credit: total },
        ],
      });
    }
    for (const p of inv.payments) {
      if (inv.type === "sales") {
        out.push({
          id: `auto-pay-${p.id}`,
          date: p.date,
          narration: `Payment received from ${inv.party} (${inv.number})`,
          source: "payment",
          ref: inv.number,
          lines: [
            { account: "1000", debit: p.amount, credit: 0 },
            { account: "1200", debit: 0, credit: p.amount },
          ],
        });
      } else {
        out.push({
          id: `auto-pay-${p.id}`,
          date: p.date,
          narration: `Payment made to ${inv.party} (${inv.number})`,
          source: "payment",
          ref: inv.number,
          lines: [
            { account: "2000", debit: p.amount, credit: 0 },
            { account: "1000", debit: 0, credit: p.amount },
          ],
        });
      }
    }
  }
  return out;
}

// ------- Balances -------
export function accountBalance(entries: JournalEntry[], code: string) {
  let debit = 0, credit = 0;
  for (const e of entries) {
    for (const l of e.lines) {
      if (l.account === code) {
        debit += l.debit;
        credit += l.credit;
      }
    }
  }
  return { debit, credit, net: debit - credit };
}

export function trialBalance(entries: JournalEntry[]) {
  return CHART.map((a) => {
    const b = accountBalance(entries, a.code);
    const isDebitNature = a.type === "asset" || a.type === "expense";
    const bal = isDebitNature ? b.net : -b.net;
    return { account: a, debit: bal > 0 ? bal : 0, credit: bal < 0 ? -bal : 0, raw: b };
  });
}

export function profitAndLoss(entries: JournalEntry[]) {
  const rows = trialBalance(entries);
  const income = rows.filter((r) => r.account.type === "income");
  const expense = rows.filter((r) => r.account.type === "expense");
  const totalIncome = income.reduce((a, r) => a + r.credit - r.debit, 0);
  const totalExpense = expense.reduce((a, r) => a + r.debit - r.credit, 0);
  return { income, expense, totalIncome, totalExpense, net: totalIncome - totalExpense };
}

// ------- Manual journal store -------
interface LedgerState {
  manual: JournalEntry[];
  addJournal: (e: Omit<JournalEntry, "id" | "source">) => void;
  deleteJournal: (id: string) => void;
}
export const useLedger = create<LedgerState>()(
  persist(
    (set) => ({
      manual: [],
      addJournal: (e) =>
        set((st) => ({
          manual: [...st.manual, { ...e, id: crypto.randomUUID(), source: "manual" }],
        })),
      deleteJournal: (id) => set((st) => ({ manual: st.manual.filter((e) => e.id !== id) })),
    }),
    { name: "atlas-ledger" },
  ),
);

export function accountByCode(code: string) {
  return CHART.find((a) => a.code === code);
}
