'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MapPin, Zap } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { AddSiteModal } from '@/components/inventory/AddSiteModal';
import { SiteCard } from '@/components/inventory/SiteCard';
import { usePanelStore } from '@/lib/stores/panelStore';
import type { OOHSite, SiteStatus, OOHFormat } from '@/types/inventory';
import { FORMAT_LABELS, STATUS_LABELS } from '@/types/inventory';
import Link from 'next/link';

export default function InventoryPage() {
  const { sites, filters, setFilters, filteredSites } = useInventoryStore();
  const analyzeLocation = usePanelStore((s) => s.analyzeLocation);
  const [addOpen,  setAddOpen]  = useState(false);
  const [editSite, setEditSite] = useState<OOHSite | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const results = filteredSites();

  const counts = {
    available:   sites.filter((s) => s.status === 'available').length,
    occupied:    sites.filter((s) => s.status === 'occupied').length,
    booked:      sites.filter((s) => s.status === 'booked').length,
    maintenance: sites.filter((s) => s.status === 'maintenance').length,
  };

  function handleSiteClick(site: OOHSite) {
    if (site.lat !== null && site.lng !== null) {
      analyzeLocation({ lng: site.lng, lat: site.lat });
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Site Inventory</h1>
          <p className="text-sm text-gray-400">{sites.length} sites · ₹{(sites.reduce((s,x)=>s+x.monthlyRentInr,0)/1000).toFixed(0)}K monthly rent</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button onClick={() => { setEditSite(null); setAddOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800 transition-colors shadow-sm shadow-purple-200">
            <Plus className="h-4 w-4" /> Add Site
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap shrink-0">
        {(Object.entries(counts) as [SiteStatus, number][]).map(([status, count]) => (
          <button key={status} onClick={() => setFilters({ status: filters.status === status ? '' : status })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              filters.status === status ? 'border-purple-300 bg-purple-50 text-purple-700' :
              status === 'available'   ? 'border-green-200 bg-green-50 text-green-700' :
              status === 'occupied'    ? 'border-red-200 bg-red-50 text-red-700' :
              status === 'booked'      ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                         'border-gray-200 bg-gray-100 text-gray-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              status === 'available' ? 'bg-green-500' : status === 'occupied' ? 'bg-red-500' :
              status === 'booked'    ? 'bg-amber-500' : 'bg-gray-400'}`} />
            {count} {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors"
            placeholder="Search by city, site name, site code…"
            value={filters.city} onChange={(e) => setFilters({ city: e.target.value })} />
        </div>
        {showFilters && (
          <div className="flex gap-2">
            <select className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-purple-400"
              value={filters.format} onChange={(e) => setFilters({ format: e.target.value as OOHFormat | '' })}>
              <option value="">All Formats</option>
              {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <MapPin className="h-7 w-7 text-purple-300" />
            </div>
            <p className="text-base font-semibold text-gray-700">
              {sites.length === 0 ? 'No sites yet' : 'No sites match filters'}
            </p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              {sites.length === 0 ? 'Add your first OOH site to start tracking' : 'Try clearing filters'}
            </p>
            {sites.length === 0 && (
              <button onClick={() => setAddOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800">
                Add First Site
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {results.map((site) => (
              <SiteCard key={site.id} site={site}
                onClick={() => handleSiteClick(site)}
                onEdit={() => { setEditSite(site); setAddOpen(true); }} />
            ))}
          </div>
        )}
      </div>

      <AddSiteModal open={addOpen} onClose={() => { setAddOpen(false); setEditSite(null); }} editSite={editSite} />
    </div>
  );
}
