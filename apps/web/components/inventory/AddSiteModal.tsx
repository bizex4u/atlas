'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import type { OOHSite, OOHFormat, SiteStatus, Facing } from '@/types/inventory';
import { FORMAT_LABELS } from '@/types/inventory';

interface Props {
  open: boolean;
  onClose: () => void;
  editSite?: OOHSite | null;
}

const BLANK: Omit<OOHSite, 'id' | 'siteCode' | 'createdAt' | 'updatedAt'> = {
  name: '', address: '', city: '', state: '', pincode: '',
  lat: null, lng: null,
  format: 'hoarding', widthFt: 20, heightFt: 10,
  facing: null, illuminated: false,
  monthlyRentInr: 0, status: 'available',
  clientName: '', campaignEndDate: '', landlordName: '', landlordPhone: '', notes: '',
};

export function AddSiteModal({ open, onClose, editSite }: Props) {
  const { addSite, updateSite } = useInventoryStore();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editSite) {
      const { id: _id, siteCode: _sc, createdAt: _ca, updatedAt: _ua, ...rest } = editSite;
      setForm(rest);
    } else {
      setForm(BLANK);
    }
  }, [editSite, open]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editSite) {
      updateSite(editSite.id, form);
    } else {
      addSite(form);
    }
    setSaving(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            {editSite ? 'Edit Site' : 'Add OOH Site'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Site identity */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Site Identity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Site Name / Landmark</label>
                <input className="input" required value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Hazratganj Crossing, Lucknow" />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Full address" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" required value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Lucknow" />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" required value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="Uttar Pradesh" />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" value={form.pincode}
                  onChange={(e) => set('pincode', e.target.value)}
                  placeholder="226001" maxLength={6} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Latitude</label>
                  <input className="input" type="number" step="any"
                    value={form.lat ?? ''} onChange={(e) => set('lat', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="26.8467" />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input" type="number" step="any"
                    value={form.lng ?? ''} onChange={(e) => set('lng', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="80.9462" />
                </div>
              </div>
            </div>
          </section>

          {/* Format */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Format & Specs</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Format</label>
                <select className="input" value={form.format}
                  onChange={(e) => set('format', e.target.value as OOHFormat)}>
                  {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Facing</label>
                <select className="input" value={form.facing ?? ''}
                  onChange={(e) => set('facing', (e.target.value || null) as Facing | null)}>
                  <option value="">Unknown</option>
                  {['N','S','E','W','NE','NW','SE','SW'].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Width (ft)</label>
                <input className="input" type="number" min={1} value={form.widthFt}
                  onChange={(e) => set('widthFt', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Height (ft)</label>
                <input className="input" type="number" min={1} value={form.heightFt}
                  onChange={(e) => set('heightFt', parseInt(e.target.value) || 0)} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="illuminated" checked={form.illuminated}
                  onChange={(e) => set('illuminated', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-purple-700" />
                <label htmlFor="illuminated" className="text-sm text-gray-700">Illuminated / backlit</label>
              </div>
            </div>
          </section>

          {/* Business */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Business Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Monthly Rent (₹)</label>
                <input className="input" type="number" min={0} value={form.monthlyRentInr}
                  onChange={(e) => set('monthlyRentInr', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status}
                  onChange={(e) => set('status', e.target.value as SiteStatus)}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {(form.status === 'occupied' || form.status === 'booked') && (
                <>
                  <div>
                    <label className="label">Client Name</label>
                    <input className="input" value={form.clientName}
                      onChange={(e) => set('clientName', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Campaign End Date</label>
                    <input className="input" type="date" value={form.campaignEndDate}
                      onChange={(e) => set('campaignEndDate', e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className="label">Landlord Name</label>
                <input className="input" value={form.landlordName}
                  onChange={(e) => set('landlordName', e.target.value)} />
              </div>
              <div>
                <label className="label">Landlord Phone</label>
                <input className="input" value={form.landlordPhone}
                  onChange={(e) => set('landlordPhone', e.target.value)}
                  placeholder="+91 98765 43210" />
              </div>
              <div className="col-span-2">
                <label className="label">Notes</label>
                <textarea className="input min-h-[72px] resize-none" value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Visibility notes, access issues, special conditions…" />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#6B21A8] text-white hover:bg-purple-800 disabled:opacity-50">
              {saving ? 'Saving…' : editSite ? 'Save Changes' : 'Add Site'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label { display: block; font-size: 0.75rem; font-weight: 500; color: #6b7280; margin-bottom: 0.25rem; }
        .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #111827; outline: none; background: white; }
        .input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.15); }
      `}</style>
    </div>
  );
}
