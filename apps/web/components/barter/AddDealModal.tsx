'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useBarterStore } from '@/lib/stores/barterStore';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import type { BarterDeal, BarterSiteGiven, BarterProductReceived } from '@/types/barter';

interface Props {
  open: boolean;
  onClose: () => void;
  editDeal?: BarterDeal | null;
}

const BLANK_PRODUCT = (): BarterProductReceived => ({
  id: crypto.randomUUID(), description: '', quantity: 1, unit: 'months', valueInr: 0,
});

export function AddDealModal({ open, onClose, editDeal }: Props) {
  const { partners, addDeal, updateDeal } = useBarterStore();
  const { sites } = useInventoryStore();

  const [partnerId,  setPartnerId]  = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [notes,      setNotes]      = useState('');
  const [sitesGiven, setSitesGiven] = useState<BarterSiteGiven[]>([]);
  const [products,   setProducts]   = useState<BarterProductReceived[]>([BLANK_PRODUCT()]);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editDeal) {
      setPartnerId(editDeal.partnerId);
      setStartDate(editDeal.startDate);
      setEndDate(editDeal.endDate);
      setNotes(editDeal.notes);
      setSitesGiven(editDeal.sitesGiven);
      setProducts(editDeal.productsReceived);
    } else {
      setPartnerId(''); setStartDate(''); setEndDate(''); setNotes('');
      setSitesGiven([]); setProducts([BLANK_PRODUCT()]);
    }
  }, [open, editDeal]);

  function toggleSite(siteId: string) {
    const site = sites.find((s) => s.id === siteId);
    if (!site) return;
    const exists = sitesGiven.find((s) => s.siteId === siteId);
    if (exists) {
      setSitesGiven((prev) => prev.filter((s) => s.siteId !== siteId));
    } else {
      setSitesGiven((prev) => [...prev, {
        siteId,
        siteCode: site.siteCode,
        siteName: site.name,
        months: 1,
        monthlyValueInr: site.monthlyRentInr,
        totalValueInr: site.monthlyRentInr,
      }]);
    }
  }

  function updateSiteMonths(siteId: string, months: number) {
    setSitesGiven((prev) => prev.map((s) => {
      if (s.siteId !== siteId) return s;
      return { ...s, months, totalValueInr: months * s.monthlyValueInr };
    }));
  }

  function addProduct() { setProducts((p) => [...p, BLANK_PRODUCT()]); }
  function removeProduct(id: string) { setProducts((p) => p.filter((x) => x.id !== id)); }
  function updateProduct(id: string, field: keyof BarterProductReceived, value: string | number) {
    setProducts((p) => p.map((x) => x.id === id ? { ...x, [field]: value } : x));
  }

  const totalGiven    = sitesGiven.reduce((s, x) => s + x.totalValueInr, 0);
  const totalReceived = products.reduce((s, x) => s + x.valueInr, 0);
  const balance       = totalGiven - totalReceived;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const partner = partners.find((p) => p.id === partnerId);
    const data = {
      partnerId,
      partnerName:          partner?.companyName ?? '',
      sitesGiven,
      totalGivenValueInr:   totalGiven,
      productsReceived:     products.filter((p) => p.description),
      totalReceivedValueInr:totalReceived,
      balanceInr:           balance,
      startDate, endDate,
      status:               'active' as const,
      notes,
    };
    if (editDeal) updateDeal(editDeal.id, data);
    else addDeal(data);
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">{editDeal ? 'Edit Barter Deal' : 'New Barter Deal'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Partner + dates */}
          <section>
            <h3 className="section-title">Deal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Barter Partner *</label>
                <select className="input" required value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                  <option value="">Select partner…</option>
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
                </select>
                {partners.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Add a partner first in the Barter section.</p>
                )}
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input className="input" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input className="input" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Sites you're giving */}
          <section>
            <h3 className="section-title">Sites You're Giving</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2">
              {sites.length === 0 && <p className="text-xs text-gray-400 p-2">No sites in inventory yet.</p>}
              {sites.map((site) => {
                const selected = sitesGiven.find((s) => s.siteId === site.id);
                return (
                  <div key={site.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}
                    onClick={() => toggleSite(site.id)}>
                    <input type="checkbox" checked={!!selected} readOnly className="accent-purple-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{site.siteCode} — {site.name}</p>
                      <p className="text-xs text-gray-400">{site.city} · ₹{(site.monthlyRentInr/1000).toFixed(0)}K/mo</p>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input type="number" min={1} max={24}
                          value={selected.months}
                          onChange={(e) => updateSiteMonths(site.id, parseInt(e.target.value) || 1)}
                          className="w-14 text-center text-sm border border-gray-200 rounded-lg px-1 py-0.5" />
                        <span className="text-xs text-gray-400">mo</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {sitesGiven.length > 0 && (
              <div className="mt-2 text-right text-sm font-semibold text-gray-700">
                Total given: ₹{totalGiven.toLocaleString('en-IN')}
              </div>
            )}
          </section>

          {/* Products received */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title mb-0">Products / Media You're Receiving</h3>
              <button type="button" onClick={addProduct}
                className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium">
                <Plus className="h-3.5 w-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
                  <input className="input col-span-5" placeholder="Description (e.g. Newspaper ads)"
                    value={p.description} onChange={(e) => updateProduct(p.id, 'description', e.target.value)} />
                  <input className="input col-span-2" type="number" min={1} placeholder="Qty"
                    value={p.quantity} onChange={(e) => updateProduct(p.id, 'quantity', parseInt(e.target.value) || 1)} />
                  <input className="input col-span-2" placeholder="Unit"
                    value={p.unit} onChange={(e) => updateProduct(p.id, 'unit', e.target.value)} />
                  <input className="input col-span-2" type="number" min={0} placeholder="₹ Value"
                    value={p.valueInr || ''} onChange={(e) => updateProduct(p.id, 'valueInr', parseInt(e.target.value) || 0)} />
                  <button type="button" onClick={() => removeProduct(p.id)}
                    className="col-span-1 flex justify-center text-gray-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {totalReceived > 0 && (
              <div className="mt-2 text-right text-sm font-semibold text-gray-700">
                Total received: ₹{totalReceived.toLocaleString('en-IN')}
              </div>
            )}
          </section>

          {/* Balance */}
          {(totalGiven > 0 || totalReceived > 0) && (
            <div className={`rounded-xl p-4 text-sm font-semibold flex items-center justify-between ${
              balance === 0 ? 'bg-green-50 text-green-700' :
              balance > 0   ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
              <span>{balance === 0 ? 'Equal value exchange' : balance > 0 ? 'Partner owes you cash' : 'You owe partner cash'}</span>
              <span>₹{Math.abs(balance).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-[60px] resize-none" value={notes}
              onChange={(e) => setNotes(e.target.value)} placeholder="Terms, conditions, special arrangements…" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={saving || !partnerId || sitesGiven.length === 0}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#6B21A8] text-white hover:bg-purple-800 disabled:opacity-40">
              {saving ? 'Saving…' : editDeal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .section-title { font-size:0.7rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem; display:block; }
        .label { display:block; font-size:0.75rem; font-weight:500; color:#6b7280; margin-bottom:0.25rem; }
        .input { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; color:#111827; outline:none; background:white; }
        .input:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,0.15); }
      `}</style>
    </div>
  );
}
