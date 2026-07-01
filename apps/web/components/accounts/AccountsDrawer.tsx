'use client';

import { useState } from 'react';
import { X, Plus, IndianRupee, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAccountsStore } from '@/lib/stores/accountsStore';
import { InvoiceModal } from './InvoiceModal';
import type { Invoice, InvoiceStatus } from '@/types/accounts';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'receivable' | 'payable';

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft:   'bg-gray-100 text-gray-500',
  sent:    'bg-blue-50 text-blue-600',
  partial: 'bg-amber-50 text-amber-600',
  paid:    'bg-green-50 text-green-600',
  overdue: 'bg-red-50 text-red-600',
};

export function AccountsDrawer({ open, onClose }: Props) {
  const { invoices, totalReceivable, totalPayable, overdueInvoices, addPayment, updateInvoice } = useAccountsStore();
  const [tab,          setTab]          = useState<Tab>('receivable');
  const [invoiceOpen,  setInvoiceOpen]  = useState(false);
  const [editInvoice,  setEditInvoice]  = useState<Invoice | null>(null);
  const [payingId,     setPayingId]     = useState<string | null>(null);
  const [payForm,      setPayForm]      = useState({ amountInr: 0, mode: 'bank-transfer' as const, reference: '', note: '', date: new Date().toISOString().slice(0,10) });

  const filtered = invoices.filter((i) => i.type === tab);
  const overdue  = overdueInvoices();

  function recordPayment() {
    if (!payingId || !payForm.amountInr) return;
    addPayment(payingId, payForm);
    setPayingId(null);
    setPayForm({ amountInr: 0, mode: 'bank-transfer', reference: '', note: '', date: new Date().toISOString().slice(0,10) });
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/20" onClick={onClose} />
      <div className="fixed left-[72px] top-0 bottom-0 z-[95] w-[420px] bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900">Accounts</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditInvoice(null); setInvoiceOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold hover:bg-purple-800">
                <Plus className="h-3.5 w-3.5" /> New Invoice
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-green-50 rounded-xl p-2.5">
              <div className="text-base font-bold text-green-700">₹{(totalReceivable()/1000).toFixed(0)}K</div>
              <div className="text-[10px] text-green-600 mt-0.5">To receive</div>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5">
              <div className="text-base font-bold text-red-700">₹{(totalPayable()/1000).toFixed(0)}K</div>
              <div className="text-[10px] text-red-600 mt-0.5">To pay</div>
            </div>
            <div className={`rounded-xl p-2.5 ${overdue.length > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <div className={`text-base font-bold ${overdue.length > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{overdue.length}</div>
              <div className={`text-[10px] mt-0.5 ${overdue.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Overdue</div>
            </div>
          </div>

          {/* Overdue alert */}
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {overdue.length} invoice{overdue.length > 1 ? 's' : ''} past due — ₹{overdue.reduce((s,i)=>s+i.outstandingInr,0).toLocaleString('en-IN')} outstanding
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1">
            {(['receivable','payable'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t === 'receivable' ? '📥 Receivables' : '📤 Payables'} ({invoices.filter((i)=>i.type===t).length})
              </button>
            ))}
          </div>
        </div>

        {/* Invoice list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IndianRupee className="h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">No {tab} invoices yet</p>
              <button onClick={() => { setEditInvoice(null); setInvoiceOpen(true); }}
                className="mt-3 px-4 py-2 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold">
                Create First Invoice
              </button>
            </div>
          ) : (
            filtered.map((inv) => (
              <div key={inv.id} className="border border-gray-100 rounded-xl p-3 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-400">{inv.invoiceNumber}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{inv.partyName}</p>
                    <p className="text-xs text-gray-400">{new Date(inv.issueDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">₹{inv.totalInr.toLocaleString('en-IN')}</p>
                    {inv.outstandingInr > 0 && inv.outstandingInr < inv.totalInr && (
                      <p className="text-xs text-amber-600">₹{inv.outstandingInr.toLocaleString('en-IN')} due</p>
                    )}
                  </div>
                </div>

                {/* Line item summary */}
                <div className="mt-2 text-xs text-gray-400 truncate">
                  {inv.lineItems.map((l) => l.description).filter(Boolean).join(' · ') || 'No description'}
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditInvoice(inv); setInvoiceOpen(true); }}
                    className="text-xs text-gray-500 hover:text-purple-600 font-medium">Edit</button>
                  {inv.status !== 'paid' && (
                    <button onClick={() => setPayingId(inv.id)}
                      className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Record payment
                    </button>
                  )}
                  {inv.status === 'draft' && (
                    <button onClick={() => updateInvoice(inv.id, { status: 'sent' })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Mark sent
                    </button>
                  )}
                </div>

                {/* Payment form inline */}
                {payingId === inv.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Record Payment</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400">Amount ₹</label>
                        <input type="number" min={1} max={inv.outstandingInr}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                          value={payForm.amountInr || ''} onChange={(e) => setPayForm((f) => ({ ...f, amountInr: parseInt(e.target.value)||0 }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">Date</label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                          value={payForm.date} onChange={(e) => setPayForm((f) => ({ ...f, date: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">Mode</label>
                        <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                          value={payForm.mode} onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value as typeof payForm.mode }))}>
                          <option value="bank-transfer">Bank Transfer</option>
                          <option value="cheque">Cheque</option>
                          <option value="upi">UPI</option>
                          <option value="cash">Cash</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400">UTR / Ref No.</label>
                        <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                          value={payForm.reference} onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={recordPayment}
                        className="flex-1 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700">
                        Save Payment
                      </button>
                      <button onClick={() => setPayingId(null)}
                        className="flex-1 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <InvoiceModal
        open={invoiceOpen}
        onClose={() => { setInvoiceOpen(false); setEditInvoice(null); }}
        editInvoice={editInvoice}
        defaultType={tab}
      />
    </>
  );
}
