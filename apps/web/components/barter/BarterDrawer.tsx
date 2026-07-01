'use client';

import { useState } from 'react';
import { X, Plus, ArrowRightLeft, Building2, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { useBarterStore } from '@/lib/stores/barterStore';
import { AddDealModal } from './AddDealModal';
import type { BarterDeal, BarterPartner } from '@/types/barter';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'deals' | 'partners';

export function BarterDrawer({ open, onClose }: Props) {
  const { partners, deals, addPartner, removePartner, updateDeal, removeDeal, partnerBalance } = useBarterStore();
  const [tab, setTab]           = useState<Tab>('deals');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<BarterDeal | null>(null);

  // Partner form inline
  const [addingPartner, setAddingPartner] = useState(false);
  const [pForm, setPForm] = useState({ companyName: '', contactName: '', phone: '', email: '', gstin: '' });

  function savePartner() {
    if (!pForm.companyName) return;
    addPartner(pForm);
    setPForm({ companyName: '', contactName: '', phone: '', email: '', gstin: '' });
    setAddingPartner(false);
  }

  const activeDeals    = deals.filter((d) => d.status === 'active');
  const completedDeals = deals.filter((d) => d.status === 'completed');

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/20" onClick={onClose} />
      <div className="fixed left-[72px] top-0 bottom-0 z-[95] w-[400px] bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900">Barter</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditDeal(null); setDealModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold hover:bg-purple-800">
                <Plus className="h-3.5 w-3.5" /> New Deal
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatPill label="Active deals" value={activeDeals.length} color="purple" />
            <StatPill label="Total given" value={`₹${(activeDeals.reduce((s,d)=>s+d.totalGivenValueInr,0)/1000).toFixed(0)}K`} color="blue" />
            <StatPill label="Partners" value={partners.length} color="gray" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {(['deals', 'partners'] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors capitalize ${
                  tab === t ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'deals' && (
            <div className="p-3 space-y-2">
              {deals.length === 0 ? (
                <Empty icon={<ArrowRightLeft />} title="No barter deals" sub="Create your first deal to track site exchanges" />
              ) : (
                <>
                  {activeDeals.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pt-1">Active</p>
                      {activeDeals.map((d) => <DealCard key={d.id} deal={d} onEdit={() => { setEditDeal(d); setDealModalOpen(true); }} onComplete={() => updateDeal(d.id, { status: 'completed' })} onRemove={() => removeDeal(d.id)} />)}
                    </>
                  )}
                  {completedDeals.length > 0 && (
                    <>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pt-3">Completed</p>
                      {completedDeals.map((d) => <DealCard key={d.id} deal={d} onEdit={() => { setEditDeal(d); setDealModalOpen(true); }} onComplete={() => {}} onRemove={() => removeDeal(d.id)} />)}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'partners' && (
            <div className="p-3 space-y-2">
              {/* Add partner inline */}
              {addingPartner ? (
                <div className="border border-purple-200 rounded-xl p-3 bg-purple-50/40 space-y-2">
                  <input className="inp" placeholder="Company name *" value={pForm.companyName}
                    onChange={(e) => setPForm((f) => ({ ...f, companyName: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="inp" placeholder="Contact name" value={pForm.contactName}
                      onChange={(e) => setPForm((f) => ({ ...f, contactName: e.target.value }))} />
                    <input className="inp" placeholder="Phone" value={pForm.phone}
                      onChange={(e) => setPForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <input className="inp" placeholder="Email" value={pForm.email}
                    onChange={(e) => setPForm((f) => ({ ...f, email: e.target.value }))} />
                  <input className="inp" placeholder="GSTIN (optional)" value={pForm.gstin}
                    onChange={(e) => setPForm((f) => ({ ...f, gstin: e.target.value }))} />
                  <div className="flex gap-2 pt-1">
                    <button onClick={savePartner}
                      className="flex-1 py-1.5 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold hover:bg-purple-800">Save</button>
                    <button onClick={() => setAddingPartner(false)}
                      className="flex-1 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingPartner(true)}
                  className="w-full flex items-center gap-2 p-3 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-colors">
                  <Plus className="h-4 w-4" /> Add partner
                </button>
              )}

              {partners.length === 0 && !addingPartner ? (
                <Empty icon={<Building2 />} title="No partners yet" sub="Add barter partners to start tracking deals" />
              ) : (
                partners.map((p) => (
                  <PartnerCard key={p.id} partner={p} balance={partnerBalance(p.id)}
                    dealCount={deals.filter((d) => d.partnerId === p.id).length}
                    onRemove={() => removePartner(p.id)} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <AddDealModal open={dealModalOpen} onClose={() => { setDealModalOpen(false); setEditDeal(null); }} editDeal={editDeal} />

      <style jsx>{`
        .inp { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.375rem 0.625rem; font-size:0.8rem; color:#111827; outline:none; background:white; }
        .inp:focus { border-color:#7c3aed; }
      `}</style>
    </>
  );
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  const cls = color === 'purple' ? 'bg-purple-50 text-purple-700' : color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600';
  return (
    <div className={`rounded-xl p-2.5 ${cls}`}>
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

function DealCard({ deal, onEdit, onComplete, onRemove }: { deal: BarterDeal; onEdit: () => void; onComplete: () => void; onRemove: () => void }) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{deal.partnerName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(deal.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} –{' '}
            {new Date(deal.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><Edit2 className="h-3.5 w-3.5" /></button>
          {deal.status === 'active' && <button onClick={onComplete} className="p-1 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600"><CheckCircle className="h-3.5 w-3.5" /></button>}
          <button onClick={() => { if (confirm('Remove deal?')) onRemove(); }} className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"><XCircle className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="mt-2 flex gap-3 text-xs">
        <span className="text-gray-500">Given: <strong className="text-gray-700">₹{(deal.totalGivenValueInr/1000).toFixed(0)}K</strong></span>
        <span className="text-gray-500">Received: <strong className="text-gray-700">₹{(deal.totalReceivedValueInr/1000).toFixed(0)}K</strong></span>
        {deal.balanceInr !== 0 && (
          <span className={deal.balanceInr > 0 ? 'text-amber-600' : 'text-red-600'}>
            {deal.balanceInr > 0 ? `+₹${(deal.balanceInr/1000).toFixed(0)}K owed to you` : `-₹${(Math.abs(deal.balanceInr)/1000).toFixed(0)}K you owe`}
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-1 flex-wrap">
        {deal.sitesGiven.map((s) => (
          <span key={s.siteId} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium">
            {s.siteCode} · {s.months}mo
          </span>
        ))}
      </div>

      <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        deal.status === 'active' ? 'bg-green-100 text-green-700' :
        deal.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-600'}`}>
        {deal.status}
      </span>
    </div>
  );
}

function PartnerCard({ partner, balance, dealCount, onRemove }: { partner: BarterPartner; balance: number; dealCount: number; onRemove: () => void }) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{partner.companyName}</p>
          {partner.contactName && <p className="text-xs text-gray-400">{partner.contactName} · {partner.phone}</p>}
          {partner.gstin && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{partner.gstin}</p>}
        </div>
        <button onClick={() => { if (confirm('Remove partner?')) onRemove(); }}
          className="p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 flex gap-3 text-xs text-gray-500">
        <span>{dealCount} deals</span>
        {balance !== 0 && (
          <span className={balance > 0 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
            {balance > 0 ? `They owe ₹${(balance/1000).toFixed(0)}K` : `You owe ₹${(Math.abs(balance)/1000).toFixed(0)}K`}
          </span>
        )}
        {balance === 0 && dealCount > 0 && <span className="text-green-600">Settled</span>}
      </div>
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 text-gray-300">{icon}</div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
