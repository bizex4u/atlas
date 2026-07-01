'use client';

import { useState } from 'react';
import { Plus, ArrowRightLeft, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useBarterStore } from '@/lib/stores/barterStore';
import { AddDealModal } from '@/components/barter/AddDealModal';
import type { BarterDeal } from '@/types/barter';

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

export default function BarterPage() {
  const { deals, partners, partnerBalance, updateDeal } = useBarterStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<BarterDeal | null>(null);
  const [tab, setTab] = useState<'deals' | 'partners'>('deals');

  const active    = deals.filter((d) => d.status === 'active').length;
  const totalValue = deals.reduce((s, d) => s + d.balanceInr, 0);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Barter Deals</h1>
          <p className="text-sm text-gray-400">{active} active · {partners.length} partners</p>
        </div>
        <button onClick={() => { setEditDeal(null); setAddOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800 transition-colors">
          <Plus className="h-4 w-4" /> New Deal
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Active Deals</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{active}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Net Balance</p>
          <div className="flex items-center gap-1 mt-1">
            {totalValue >= 0
              ? <TrendingUp className="h-4 w-4 text-green-500" />
              : <TrendingDown className="h-4 w-4 text-red-500" />}
            <p className={`text-2xl font-bold ${totalValue >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              ₹{Math.abs(totalValue / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs text-gray-400 font-medium">Partners</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{partners.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
        {(['deals', 'partners'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'deals' ? `Deals (${deals.length})` : `Partners (${partners.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-4 space-y-3">
        {tab === 'deals' ? (
          deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <ArrowRightLeft className="h-7 w-7 text-purple-300" />
              </div>
              <p className="text-base font-semibold text-gray-700">No barter deals yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create a deal to trade inventory with partners</p>
              <button onClick={() => setAddOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800">
                Create First Deal
              </button>
            </div>
          ) : deals.map((deal) => {
            const partner = partners.find((p) => p.id === deal.partnerId);
            return (
              <div key={deal.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{partner?.companyName ?? 'Unknown'}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[deal.status]}`}>
                        {deal.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{deal.sitesGiven.length} sites given · {deal.productsReceived.length} products</p>
                    <div className="flex gap-3 mt-2">
                      <div>
                        <p className="text-[10px] text-gray-400">Sites value</p>
                        <p className="text-sm font-semibold text-gray-800">₹{(deal.sitesGiven.reduce((s, x) => s + x.totalValueInr, 0) / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Balance</p>
                        <p className={`text-sm font-semibold ${deal.balanceInr >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {deal.balanceInr >= 0 ? '+' : ''}₹{(deal.balanceInr / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditDeal(deal); setAddOpen(true); }}
                      className="text-xs text-purple-600 hover:underline">Edit</button>
                    {deal.status === 'active' && (
                      <button onClick={() => updateDeal(deal.id, { status: 'completed' })}
                        className="text-xs text-gray-400 hover:underline">Close</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-purple-300" />
              </div>
              <p className="text-base font-semibold text-gray-700">No partners yet</p>
              <p className="text-sm text-gray-400 mt-1">Partners are created when you add a deal</p>
            </div>
          ) : partners.map((partner) => {
            const bal = partnerBalance(partner.id);
            const pDeals = deals.filter((d) => d.partnerId === partner.id);
            return (
              <div key={partner.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">{partner.companyName}</p>
                  {partner.contactName && <p className="text-xs text-gray-400">{partner.contactName}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{pDeals.filter(d=>d.status==='active').length} active deals</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 mb-0.5">Net balance</p>
                  <p className={`text-base font-bold ${bal >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {bal >= 0 ? '+' : ''}₹{(bal / 1000).toFixed(1)}K
                  </p>
                  <p className="text-[10px] text-gray-400">{bal >= 0 ? 'they owe you' : 'you owe them'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddDealModal open={addOpen} onClose={() => { setAddOpen(false); setEditDeal(null); }} editDeal={editDeal} />
    </div>
  );
}
