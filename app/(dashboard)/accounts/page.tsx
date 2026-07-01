'use client';

import { useState } from 'react';
import { Plus, IndianRupee, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useAccountsStore } from '@/lib/stores/accountsStore';
import { InvoiceModal } from '@/components/accounts/InvoiceModal';
import type { Invoice } from '@/types/accounts';

function statusChip(status: Invoice['status']) {
  const cfg: Record<Invoice['status'], { label: string; cls: string }> = {
    draft:   { label: 'Draft',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    partial: { label: 'Partial', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    paid:    { label: 'Paid',    cls: 'bg-green-50 text-green-700 border-green-200' },
    overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const { label, cls } = cfg[status];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

export default function AccountsPage() {
  const { invoices, totalReceivable, totalPayable, overdueInvoices, addPayment } = useAccountsStore();
  const [addOpen,  setAddOpen]  = useState(false);
  const [editInv,  setEditInv]  = useState<Invoice | null>(null);
  const [tab,      setTab]      = useState<'receivable' | 'payable'>('receivable');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmt,   setPayAmt]   = useState('');

  const filtered = invoices.filter((i) => i.type === (tab === 'receivable' ? 'receivable' : 'payable'));
  const overdue  = overdueInvoices();

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-400">{invoices.length} invoices · {overdue.length} overdue</p>
        </div>
        <button onClick={() => { setEditInv(null); setAddOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800 transition-colors">
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            <p className="text-xs text-gray-400 font-medium">To Receive</p>
          </div>
          <p className="text-2xl font-bold text-green-700">₹{(totalReceivable() / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs text-gray-400 font-medium">To Pay</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">₹{(totalPayable() / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shrink-0">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {overdue.length} invoice{overdue.length > 1 ? 's' : ''} overdue — ₹{(overdue.reduce((s,i)=>s+i.outstandingInr,0)/1000).toFixed(1)}K outstanding
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
        {(['receivable', 'payable'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'receivable' ? 'Receivables' : 'Payables'}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <IndianRupee className="h-7 w-7 text-purple-300" />
            </div>
            <p className="text-base font-semibold text-gray-700">No invoices yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Create GST invoices to track cash flow</p>
            <button onClick={() => setAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800">
              Create Invoice
            </button>
          </div>
        ) : filtered.map((inv) => (
          <div key={inv.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-xs font-mono text-gray-500">{inv.invoiceNumber}</p>
                  {statusChip(inv.status)}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate">{inv.partyName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">₹{(inv.totalInr / 1000).toFixed(1)}K</p>
                {inv.outstandingInr > 0 && (
                  <p className="text-xs text-amber-600">₹{(inv.outstandingInr / 1000).toFixed(1)}K due</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => { setEditInv(inv); setAddOpen(true); }}
                className="text-xs text-purple-600 font-medium hover:underline">Edit</button>
              {inv.outstandingInr > 0 && inv.status !== 'paid' && (
                payingId === inv.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="number" placeholder="Amount ₹"
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-400"
                      value={payAmt} onChange={(e) => setPayAmt(e.target.value)} />
                    <button onClick={() => {
                      const amt = parseFloat(payAmt);
                      if (amt > 0) { addPayment(inv.id, { date: new Date().toISOString().slice(0,10), amountInr: amt, mode: 'bank-transfer', reference: '', note: '' }); }
                      setPayingId(null); setPayAmt('');
                    }} className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg font-semibold">
                      Save
                    </button>
                    <button onClick={() => setPayingId(null)} className="text-xs text-gray-400">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => { setPayingId(inv.id); setPayAmt(''); }}
                    className="text-xs text-green-600 font-medium hover:underline">+ Payment</button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <InvoiceModal open={addOpen} onClose={() => { setAddOpen(false); setEditInv(null); }} editInvoice={editInv} />
    </div>
  );
}
