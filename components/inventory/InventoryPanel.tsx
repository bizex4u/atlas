'use client';

import { useState } from 'react';
import { Plus, Search, MapPin } from 'lucide-react';
import { useSiteStore, useAppStore } from '@/lib/stores';
import { formatCurrency } from '@/lib/utils';
import { STATUS_LABELS, FORMAT_LABELS, type SiteStatus, type SiteFormat } from '@/types';

export default function InventoryPanel() {
  const { sites, setSelectedSite } = useSiteStore();
  const { openDrawer } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SiteStatus | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<SiteFormat | 'all'>('all');

  const filteredSites = sites.filter(site => {
    const matchesSearch = !search ||
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.code.toLowerCase().includes(search.toLowerCase()) ||
      site.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || site.format === formatFilter;

    return matchesSearch && matchesStatus && matchesFormat;
  });

  const handleSiteClick = (siteId: string) => {
    setSelectedSite(siteId);
    openDrawer('site-detail', { siteId });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => openDrawer('site-add')}
          className="btn btn-primary px-3"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
            statusFilter === 'all' ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
          }`}
        >
          All ({sites.length})
        </button>
        {(['available', 'occupied', 'booked', 'maintenance'] as SiteStatus[]).map(status => {
          const count = sites.filter(s => s.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                statusFilter === status ? 'bg-primary-700 text-white' : 'bg-dark-100 text-gray-400 hover:text-white'
              }`}
            >
              {STATUS_LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value as SiteFormat | 'all')}
          className="select text-sm"
        >
          <option value="all">All Formats</option>
          {Object.entries(FORMAT_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredSites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {sites.length === 0 ? 'No sites added yet' : 'No sites match your filters'}
          </div>
        ) : (
          filteredSites.map(site => (
            <button
              key={site.id}
              onClick={() => handleSiteClick(site.id)}
              className="w-full text-left card hover:border-primary-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`status-dot status-${site.status}`} />
                    <span className="font-medium text-white truncate">{site.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{site.code}</div>
                  <div className="text-sm text-gray-400 mt-1">{site.city}, {site.state}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{FORMAT_LABELS[site.format]}</div>
                  <div className="text-xs text-gray-500 mt-1">{site.dimensions.width}x{site.dimensions.height} ft</div>
                  <div className="text-sm text-primary-400 mt-1">{formatCurrency(site.financial.rent)}/mo</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
