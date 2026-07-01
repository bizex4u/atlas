'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useAccountsStore } from '@/lib/stores/accountsStore';
import type { Invoice, InvoiceLineItem } from '@/types/accounts';
import { calcLineItem, calcInvoiceTotals, OOH_SAC_CODE, OOH_GST_PCT } from '@/types/accounts';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh',
];

interface Props {
  open: boolean;
  onClose: () => void;
  editInvoice?: Invoice | null;
  defaultType?: 'receivable' | 'payable';
}

function blankLine(): InvoiceLineItem {
  return calcLineItem('', 1, 'months', 0);
}

export function InvoiceModal({ open, onClose, editInvoice, defaultType = 'receivable' }: Props) {
  const { addInvoice, updateInvoice, ourGstin, ourState } = useAccountsStore();

  const [type,         setType]         = useState<'receivable'|'payable'>(defaultType);
  const [partyName,    setPartyName]    = useState('');
  const [partyGstin,   setPartyGstin]   = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [placeOfSupply,setPlaceOfSupply]= useState(ourState);
  const [issueDate,    setIssueDate]    = useState(new Date().toISOString().slice(0,10));
  const [dueDate,      setDueDate]      = useState('');
  const [lineItems,    setLineItems]    = useState<InvoiceLineItem[]>([blankLine()]);
  const [notes,        setNotes]        = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editInvoice) {
      setType(editInvoice.type);
      setPartyName(editInvoice.partyName);
      setPartyGstin(editInvoice.partyGstin);
      setPartyAddress(editInvoice.partyAddress);
      setPlaceOfSupply(editInvoice.placeOfSupply);
      setIssueDate(editInvoice.issueDate);
      setDueDate(editInvoice.dueDate);
      setLineItems(editInvoice.lineItems);
      setNotes(editInvoice.notes);
    } else {
      setType(defaultType);
      setPartyName(''); setPartyGstin(''); setPartyAddress('');
      setPlaceOfSupply(ourState);
      setIssueDate(new Date().toISOString().slice(0,10));
      setDueDate('');
      setLineItems([blankLine()]);
      setNotes('');
    }
  }, [open, editInvoice, defaultType, ourState]);

  function updateLine(id: string, field: string, raw: string) {
    setLineItems((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: ['quantity','rateInr','gstPct'].includes(field) ? parseFloat(raw)||0 : raw };
      const recalc = calcLineItem(updated.description, updated.quantity, updated.unit, updated.rateInr, updated.gstPct, updated.sacCode);
      return { ...recalc, id: l.id };
    }));
  }

  function addLine()         { setLineItems((p) => [...p, blankLine()]); }
  function removeLine(id: string) { setLineItems((p) => p.filter((l) => l.id !== id)); }

  const sameState = placeOfSupply === ourState;
  const totals    = calcInvoiceTotals(lineItems, sameState);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data: Omit<Invoice, 'id'|'invoiceNumber'|'createdAt'|'updatedAt'> = {
      type, status: 'draft',
      partyName, partyGstin, partyAddress, placeOfSupply,
      ourGstin,
      lineItems,
      ...totals,
      issueDate, dueDate,
      paidAmountInr: editInvoice?.paidAmountInr ?? 0,
      payments:      editInvoice?.payments      ?? [],
      outstandingInr: totals.totalInr - (editInvoice?.paidAmountInr ?? 0),
      notes,
    };
    if (editInvoice) updateInvoice(editInvoice.id, data);
    else addInvoice(data);
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">{editInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['receivable','payable'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  type === t ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                {t === 'receivable' ? '📥 Receivable (Sales)' : '📤 Payable (Purchase)'}
              </button>
            ))}
          </div>

          {/* Party details */}
          <section>
            <h3 className="section-title">{type === 'receivable' ? 'Bill To' : 'Vendor / Landlord'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Party Name *</label>
                <input className="input" required value={partyName} onChange={(e) => setPartyName(e.target.value)}
                  placeholder={type === 'receivable' ? 'Client company name' : 'Landlord / vendor name'} />
              </div>
              <div>
                <label className="label">GSTIN</label>
                <input className="input" value={partyGstin} onChange={(e) => setPartyGstin(e.target.value)}
                  placeholder="22AAAAA0000A1Z5" maxLength={15} />
              </div>
              <div>
                <label className="label">Place of Supply</label>
                <select className="input" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)}>
                  {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={partyAddress} onChange={(e) => setPartyAddress(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Dates */}
          <section>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Issue Date</label>
                <input className="input" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Line items */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="section-title mb-0">Line Items</h3>
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-xs text-purple-700 font-medium hover:text-purple-900">
                <Plus className="h-3.5 w-3.5" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-semibold text-gray-400 uppercase px-1">
                <span className="col-span-4">Description</span>
                <span className="col-span-1">SAC</span>
                <span className="col-span-1">Qty</span>
                <span className="col-span-1">Unit</span>
                <span className="col-span-2">Rate ₹</span>
                <span className="col-span-1">GST%</span>
                <span className="col-span-1 text-right">Total</span>
                <span className="col-span-1" />
              </div>
              {lineItems.map((l) => (
                <div key={l.id} className="grid grid-cols-12 gap-1 items-center">
                  <input className="input col-span-4 text-xs" placeholder="e.g. Hoarding - Hazratganj Mar 2025"
                    value={l.description} onChange={(e) => updateLine(l.id, 'description', e.target.value)} />
                  <input className="input col-span-1 text-xs" value={l.sacCode}
                    onChange={(e) => updateLine(l.id, 'sacCode', e.target.value)} />
                  <input className="input col-span-1 text-xs text-center" type="number" min={0} step="0.5"
                    value={l.quantity} onChange={(e) => updateLine(l.id, 'quantity', e.target.value)} />
                  <input className="input col-span-1 text-xs" value={l.unit}
                    onChange={(e) => updateLine(l.id, 'unit', e.target.value)} />
                  <input className="input col-span-2 text-xs" type="number" min={0}
                    value={l.rateInr || ''} onChange={(e) => updateLine(l.id, 'rateInr', e.target.value)} />
                  <input className="input col-span-1 text-xs text-center" type="number" min={0}
                    value={l.gstPct} onChange={(e) => updateLine(l.id, 'gstPct', e.target.value)} />
                  <span className="col-span-1 text-xs font-semibold text-gray-700 text-right pr-1">
                    ₹{(l.totalInr/1000).toFixed(1)}K
                  </span>
                  <button type="button" onClick={() => removeLine(l.id)}
                    className="col-span-1 flex justify-center text-gray-300 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
            <Row label="Subtotal (taxable)" value={totals.subtotalInr} />
            {sameState ? (
              <>
                <Row label={`CGST (${OOH_GST_PCT/2}%)`} value={totals.cgstInr} />
                <Row label={`SGST (${OOH_GST_PCT/2}%)`} value={totals.sgstInr} />
              </>
            ) : (
              <Row label={`IGST (${OOH_GST_PCT}%)`} value={totals.igstInr} />
            )}
            <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>₹{totals.totalInr.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[56px] resize-none text-sm" value={notes}
              onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, bank details, remarks…" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#6B21A8] text-white hover:bg-purple-800 disabled:opacity-40">
              {saving ? 'Saving…' : editInvoice ? 'Save' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .section-title { font-size:0.7rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; display:block; }
        .label { display:block; font-size:0.75rem; font-weight:500; color:#6b7280; margin-bottom:0.25rem; }
        .input { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.4rem 0.6rem; font-size:0.8rem; color:#111827; outline:none; background:white; }
        .input:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,0.12); }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>₹{value.toLocaleString('en-IN')}</span>
    </div>
  );
}
