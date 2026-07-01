'use client';

import { useState } from 'react';
import { Plus, Search, Users, RefreshCw } from 'lucide-react';
import { useBarterStore, useAppStore } from '@/lib/stores';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BarterStatus } from '@/types';

export default function BarterPanel() {
  const { partners, deals, getPartnerBalance } = useBarterStore();
  const { openDrawer } = useAppStore();
  const [activeTab, setActiveTab] = useState<'deals' | 'partners'>('deals');
  const [search, setSearch] = useState('');

  const filteredDeals = deals.filter(deal => {
    const partner = partners.find(p => p.id === deal.partnerId);
    return partner?.name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<BarterStatus, string> = {
    active: 'tag-success',
    completed: 'tag-info',
    cancelled: 'tag-error'
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('deals')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'deals' ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          <RefreshCw size={14} className="inline mr-2" />
          Deals
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'partners' ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          <Users size={14} className="inline mr-2" />
          Partners
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder={activeTab === 'deals' ? 'Search deals...' : 'Search partners...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {activeTab === 'deals' && (
        <div className="space-y-2">
          {filteredDeals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {deals.length === 0 ? 'No barter deals yet' : 'No deals match your search'}
            </div>
          ) : (
            filteredDeals.map(deal => {
              const partner = partners.find(p => p.id === deal.partnerId);
              return (
                <div key={deal.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`tag ${statusColors[deal.status]}`}>
                          {deal.status}
                        </span>
                      </div>
                      <div className="font-medium text-white mt-1">
                        {partner?.name || 'Unknown Partner'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${deal.balance > 0 ? 'text-warning' : 'text-success'}`}>
                        Balance: {formatCurrency(Math.abs(deal.balance))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {deal.balance > 0 ? 'we owe' : 'they owe'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-dark-100/50 rounded p-2">
                      <div className="text-gray-500">Given (Sites)</div>
                      <div className="text-white">{formatCurrency(deal.totalValueGiven)}</div>
                    </div>
                    <div className="bg-dark-100/50 rounded p-2">
                      <div className="text-gray-500">Received</div>
                      <div className="text-white">{formatCurrency(deal.totalValueReceived)}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Started: {formatDate(deal.startDate)}
                    {deal.endDate && ` • Ended: ${formatDate(deal.endDate)}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-2">
          {filteredPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {partners.length === 0 ? 'No partners added yet' : 'No partners match your search'}
            </div>
          ) : (
            filteredPartners.map(partner => {
              const balance = getPartnerBalance(partner.id);
              const dealCount = deals.filter(d => d.partnerId === partner.id).length;

              return (
                <div key={partner.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-700/30 flex items-center justify-center">
                        <Users size={18} className="text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{partner.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{partner.type}</div>
                        {partner.gstin && (
                          <div className="text-xs text-gray-500">GSTIN: {partner.gstin}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{dealCount} deals</div>
                      <div className={`text-sm font-medium ${balance !== 0 ? 'text-warning' : 'text-success'}`}>
                        {formatCurrency(Math.abs(balance))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
