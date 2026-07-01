'use client';

import { useState } from 'react';
import { X, Plus, Search, MapPin, Filter } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { AddSiteModal } from './AddSiteModal';
import { SiteCard } from './SiteCard';
import type { OOHSite, SiteStatus, OOHFormat } from '@/types/inventory';
import { FORMAT_LABELS, STATUS_LABELS } from '@/types/inventory';

interface Props {
  open: boolean;
  onClose: () => void;
  onSiteClick?: (site: OOHSite) => void;
}

export function InventoryDrawer({ open, onClose, onSiteClick }: Props) {
  const { filters, setFilters, filteredSites, sites } = useInventoryStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editSite, setEditSite] = useState<OOHSite | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const results = filteredSites();

  const statusCounts: Record<string, number> = {};
  for (const s of sites) statusCounts[s.status] = (statusCounts[s.status] ?? 0) + 1;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed left-[72px] top-0 bottom-0 z-[95] w-[380px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Site Inventory</h2>
              <p className="text-xs text-gray-400 mt-0.5">{sites.length} sites total</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-purple-50 text-purple-700' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Filters"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setEditSite(null); setAddOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold hover:bg-purple-800"
              >
                <Plus className="h-3.5 w-3.5" /> Add Site
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status pills */}
          <div className="flex gap-1.5 flex-wrap">
            {(['available', 'occupied', 'booked', 'maintenance'] as SiteStatus[]).map((s) => (
              <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${s === 'available'   ? 'bg-green-50 text-green-700' :
                  s === 'occupied'    ? 'bg-red-50 text-red-700' :
                  s === 'booked'      ? 'bg-amber-50 text-amber-700' :
                                        'bg-gray-100 text-gray-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full
                  ${s === 'available' ? 'bg-green-500' : s === 'occupied' ? 'bg-red-500' : s === 'booked' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                {statusCounts[s] ?? 0} {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              placeholder="Search by city, site name…"
              value={filters.city}
              onChange={(e) => setFilters({ city: e.target.value })}
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              <select
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-purple-400"
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as SiteStatus | '' })}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-purple-400"
                value={filters.format}
                onChange={(e) => setFilters({ format: e.target.value as OOHFormat | '' })}
              >
                <option value="">All Formats</option>
                {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Site list */}
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {sites.length === 0 ? 'No sites yet' : 'No sites match filters'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {sites.length === 0
                  ? 'Add your first OOH site to get started'
                  : 'Try clearing filters'}
              </p>
              {sites.length === 0 && (
                <button
                  onClick={() => { setEditSite(null); setAddOpen(true); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#6B21A8] text-white text-sm font-semibold hover:bg-purple-800"
                >
                  Add First Site
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {results.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  onClick={() => onSiteClick?.(site)}
                  onEdit={() => { setEditSite(site); setAddOpen(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddSiteModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditSite(null); }}
        editSite={editSite}
      />
    </>
  );
}
