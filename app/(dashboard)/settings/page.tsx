'use client';

import { useState, useEffect } from 'react';
import { Save, Building2, User, FileText } from 'lucide-react';

const KEY = 'atlas-settings';

interface Settings {
  companyName: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

const DEFAULTS: Settings = {
  companyName: 'BIZEX4U',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  contactName: 'Yash Mehrotra',
  contactEmail: 'yash@bizex4u.com',
  contactPhone: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
};

function load(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; }
  catch { return DEFAULTS; }
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(load()); }, []);

  function set(k: keyof Settings, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-400">Company info used in invoices and proposals</p>
          </div>
          <button onClick={save}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved ? 'bg-green-100 text-green-700' : 'bg-[#6B21A8] text-white hover:bg-purple-800'}`}>
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        {/* Company */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900">Company Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name" value={form.companyName} onChange={(v) => set('companyName', v)} />
            <Field label="GSTIN" value={form.gstin} onChange={(v) => set('gstin', v)} placeholder="22AAAAA0000A1Z5" mono />
            <Field label="Address" value={form.address} onChange={(v) => set('address', v)} className="sm:col-span-2" />
            <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
            <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
            <Field label="Pincode" value={form.pincode} onChange={(v) => set('pincode', v)} />
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900">Contact Person</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.contactName} onChange={(v) => set('contactName', v)} />
            <Field label="Email" value={form.contactEmail} onChange={(v) => set('contactEmail', v)} type="email" />
            <Field label="Phone" value={form.contactPhone} onChange={(v) => set('contactPhone', v)} placeholder="+91 98765 43210" />
          </div>
        </section>

        {/* Bank */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900">Bank Details (for invoices)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank Name" value={form.bankName} onChange={(v) => set('bankName', v)} />
            <Field label="Account Number" value={form.accountNumber} onChange={(v) => set('accountNumber', v)} mono />
            <Field label="IFSC Code" value={form.ifsc} onChange={(v) => set('ifsc', v)} mono placeholder="HDFC0000001" />
          </div>
        </section>

        {/* GST Info */}
        <section className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
          <p className="text-xs font-semibold text-purple-800 mb-1">GST Configuration</p>
          <p className="text-xs text-purple-600">SAC Code: <span className="font-mono font-bold">998361</span> · GST Rate: <span className="font-bold">18%</span> · CGST+SGST (same state) / IGST (inter-state)</p>
        </section>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, mono, type, className,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type ?? 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-400 focus:outline-none transition-colors ${mono ? 'font-mono tracking-wide' : ''}`}
      />
    </div>
  );
}
