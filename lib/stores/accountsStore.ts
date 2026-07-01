import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice, PaymentEntry } from '@/types/accounts';

function uuid() { return crypto.randomUUID(); }
function now()  { return new Date().toISOString(); }

function nextInvoiceNumber(invoices: Invoice[], type: 'receivable' | 'payable'): string {
  const prefix = type === 'receivable' ? 'INV' : 'BILL';
  const year   = new Date().getFullYear();
  const existing = invoices
    .filter((i) => i.type === type && i.invoiceNumber.startsWith(`${prefix}-${year}`))
    .map((i) => parseInt(i.invoiceNumber.split('-')[2] ?? '0', 10))
    .filter((n) => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`;
}

interface AccountsStore {
  invoices: Invoice[];
  ourGstin: string;
  ourState: string;   // for CGST/SGST vs IGST determination

  setOurDetails: (gstin: string, state: string) => void;

  addInvoice:    (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;

  addPayment: (invoiceId: string, payment: Omit<PaymentEntry, 'id'>) => void;

  // Summaries
  totalReceivable:  () => number;
  totalPayable:     () => number;
  overdueInvoices:  () => Invoice[];
}

export const useAccountsStore = create<AccountsStore>()(
  persist(
    (set, get) => ({
      invoices: [],
      ourGstin: '',
      ourState: 'Uttar Pradesh',

      setOurDetails: (gstin, state) => set({ ourGstin: gstin, ourState: state }),

      addInvoice: (data) => {
        const invoices = get().invoices;
        const invoice: Invoice = {
          ...data,
          id:            uuid(),
          invoiceNumber: nextInvoiceNumber(invoices, data.type),
          ourGstin:      get().ourGstin,
          createdAt:     now(),
          updatedAt:     now(),
        };
        set((s) => ({ invoices: [invoice, ...s.invoices] }));
        return invoice;
      },

      updateInvoice: (id, data) =>
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...data, updatedAt: now() } : inv,
          ),
        })),

      removeInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((i) => i.id !== id) })),

      addPayment: (invoiceId, payment) => {
        const entry: PaymentEntry = { ...payment, id: uuid() };
        set((s) => ({
          invoices: s.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;
            const payments    = [...inv.payments, entry];
            const paidAmount  = payments.reduce((sum, p) => sum + p.amountInr, 0);
            const outstanding = Math.max(0, inv.totalInr - paidAmount);
            const status =
              outstanding === 0 ? 'paid' :
              paidAmount  > 0   ? 'partial' :
              new Date(inv.dueDate) < new Date() ? 'overdue' : 'sent';
            return { ...inv, payments, paidAmountInr: paidAmount, outstandingInr: outstanding, status, updatedAt: now() };
          }),
        }));
      },

      totalReceivable: () =>
        get().invoices
          .filter((i) => i.type === 'receivable' && i.status !== 'paid')
          .reduce((s, i) => s + i.outstandingInr, 0),

      totalPayable: () =>
        get().invoices
          .filter((i) => i.type === 'payable' && i.status !== 'paid')
          .reduce((s, i) => s + i.outstandingInr, 0),

      overdueInvoices: () => {
        const today = new Date();
        return get().invoices.filter(
          (i) => i.status !== 'paid' && i.status !== 'draft' && new Date(i.dueDate) < today,
        );
      },
    }),
    { name: 'atlas-accounts' },
  ),
);
