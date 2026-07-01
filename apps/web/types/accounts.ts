export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
export type InvoiceType = 'receivable' | 'payable';

export interface InvoiceLineItem {
  id: string;
  description: string;   // e.g. "Hoarding display - Hazratganj, Lucknow - March 2025"
  sacCode: string;       // default 998361 for OOH
  quantity: number;
  unit: string;          // "months", "weeks", "sqft"
  rateInr: number;
  gstPct: number;        // 18 for OOH
  taxableAmountInr: number;
  gstAmountInr: number;
  totalInr: number;
}

export interface PaymentEntry {
  id: string;
  date: string;
  amountInr: number;
  mode: 'bank-transfer' | 'cheque' | 'upi' | 'cash' | 'other';
  reference: string;     // UTR / cheque no
  note: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2025-001
  type: InvoiceType;
  status: InvoiceStatus;

  // Party
  partyName: string;
  partyGstin: string;
  partyAddress: string;
  placeOfSupply: string; // state name — determines CGST+SGST vs IGST

  // Our details
  ourGstin: string;

  // Line items
  lineItems: InvoiceLineItem[];
  subtotalInr: number;
  cgstInr: number;       // if same state
  sgstInr: number;       // if same state
  igstInr: number;       // if different state
  totalInr: number;

  // Dates
  issueDate: string;
  dueDate: string;

  // Payment tracking
  paidAmountInr: number;
  payments: PaymentEntry[];
  outstandingInr: number;

  // Links
  barterDealId?: string; // if this invoice is related to a barter balance

  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── GST helpers ─────────────────────────────────────────────────────────────

export const OOH_SAC_CODE = '998361';
export const OOH_GST_PCT  = 18;

export function calcLineItem(
  description: string,
  quantity: number,
  unit: string,
  rateInr: number,
  gstPct = OOH_GST_PCT,
  sacCode = OOH_SAC_CODE,
): InvoiceLineItem {
  const taxable = quantity * rateInr;
  const gst     = Math.round(taxable * gstPct / 100);
  return {
    id: crypto.randomUUID(),
    description,
    sacCode,
    quantity,
    unit,
    rateInr,
    gstPct,
    taxableAmountInr: taxable,
    gstAmountInr:     gst,
    totalInr:         taxable + gst,
  };
}

export function calcInvoiceTotals(
  lineItems: InvoiceLineItem[],
  sameState: boolean,
): Pick<Invoice, 'subtotalInr' | 'cgstInr' | 'sgstInr' | 'igstInr' | 'totalInr'> {
  const subtotal = lineItems.reduce((s, l) => s + l.taxableAmountInr, 0);
  const totalGst = lineItems.reduce((s, l) => s + l.gstAmountInr, 0);
  return {
    subtotalInr: subtotal,
    cgstInr:     sameState ? Math.round(totalGst / 2) : 0,
    sgstInr:     sameState ? Math.round(totalGst / 2) : 0,
    igstInr:     sameState ? 0 : totalGst,
    totalInr:    subtotal + totalGst,
  };
}
