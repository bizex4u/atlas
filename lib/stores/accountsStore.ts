import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, Invoice, InvoiceItem, Payment } from '@/types';
import { generateId, generateInvoiceNumber, calculateGST } from '@/lib/utils';

interface AccountsStore {
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  invoiceCounter: number;
  selectedClientId: string | null;
  selectedInvoiceId: string | null;

  addClient: (client: Omit<Client, 'id' | 'outstanding' | 'createdAt' | 'updatedAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  setSelectedClient: (id: string | null) => void;
  getClientOutstanding: (clientId: string) => number;

  addInvoice: (invoice: {
    clientId: string;
    items: InvoiceItem[];
    invoiceDate: string;
    dueDate: string;
    placeOfSupply: string;
    notes?: string;
  }) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  setSelectedInvoice: (id: string | null) => void;
  markInvoicePaid: (id: string) => void;
  getInvoicesByClient: (clientId: string) => Invoice[];
  getOverdueInvoices: () => Invoice[];

  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Payment;
  getPaymentsByInvoice: (invoiceId: string) => Payment[];
}

export const useAccountsStore = create<AccountsStore>()(
  persist(
    (set, get) => ({
      clients: [],
      invoices: [],
      payments: [],
      invoiceCounter: 0,
      selectedClientId: null,
      selectedInvoiceId: null,

      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: generateId(),
          outstanding: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set((state) => ({ clients: [...state.clients, newClient] }));
        return newClient;
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          )
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter(c => c.id !== id),
          selectedClientId: state.selectedClientId === id ? null : state.selectedClientId
        }));
      },

      setSelectedClient: (id) => {
        set({ selectedClientId: id });
      },

      getClientOutstanding: (clientId) => {
        const invoices = get().getInvoicesByClient(clientId);
        return invoices
          .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
          .reduce((sum, inv) => sum + inv.grandTotal, 0);
      },

      addInvoice: (invoiceData) => {
        const state = get();
        const client = state.clients.find(c => c.id === invoiceData.clientId);
        const sameState = client?.state === 'Uttar Pradesh';
        const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
        const { cgst, sgst, igst } = calculateGST(subtotal, sameState);
        const total = subtotal + cgst + sgst + igst;
        const roundOff = Math.round(total) - total;
        const grandTotal = Math.round(total);

        const invoiceNumber = generateInvoiceNumber('INV', state.invoiceCounter);

        const newInvoice: Invoice = {
          id: generateId(),
          invoiceNumber,
          type: 'tax',
          status: 'draft',
          clientId: invoiceData.clientId,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          sacCode: '998361',
          placeOfSupply: invoiceData.placeOfSupply,
          items: invoiceData.items,
          subtotal,
          cgst,
          sgst,
          igst,
          total,
          roundOff,
          grandTotal,
          notes: invoiceData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          invoices: [...state.invoices, newInvoice],
          invoiceCounter: state.invoiceCounter + 1
        }));

        return newInvoice;
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          )
        }));
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter(inv => inv.id !== id),
          selectedInvoiceId: state.selectedInvoiceId === id ? null : state.selectedInvoiceId
        }));
      },

      setSelectedInvoice: (id) => {
        set({ selectedInvoiceId: id });
      },

      markInvoicePaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, status: 'paid' as const, updatedAt: new Date().toISOString() } : inv
          )
        }));
      },

      getInvoicesByClient: (clientId) => {
        return get().invoices.filter(inv => inv.clientId === clientId);
      },

      getOverdueInvoices: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().invoices.filter(inv =>
          inv.status === 'sent' && inv.dueDate < today
        );
      },

      addPayment: (paymentData) => {
        const newPayment: Payment = {
          ...paymentData,
          id: generateId(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ payments: [...state.payments, newPayment] }));
        return newPayment;
      },

      getPaymentsByInvoice: (invoiceId) => {
        return get().payments.filter(p => p.invoiceId === invoiceId);
      }
    }),
    {
      name: 'atlas-accounts'
    }
  )
);
