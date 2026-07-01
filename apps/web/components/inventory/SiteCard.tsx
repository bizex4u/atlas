'use client';

import { Edit2, Trash2, Zap, MapPin } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import type { OOHSite } from '@/types/inventory';
import { FORMAT_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/types/inventory';

interface Props {
  site: OOHSite;
  onClick: () => void;
  onEdit: () => void;
}

export function SiteCard({ site, onClick, onEdit }: Props) {
  const { removeSite } = useInventoryStore();

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete site ${site.siteCode}?`)) removeSite(site.id);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    onEdit();
  }

  const statusColor = STATUS_COLORS[site.status];
  const hasCoords = site.lat !== null && site.lng !== null;

  return (
    <div
      onClick={onClick}
      className="group relative border border-gray-100 rounded-xl p-3 cursor-pointer hover:border-purple-200 hover:bg-purple-50/30 transition-all"
    >
      {/* Status dot + code */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full shrink-0 mt-0.5"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs font-mono font-semibold text-gray-500 shrink-0">{site.siteCode}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={handleEdit}
            className="p-1 rounded-md hover:bg-white text-gray-400 hover:text-gray-600"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Site name */}
      <p className="text-sm font-semibold text-gray-900 leading-tight mb-1 truncate">{site.name}</p>
      <p className="text-xs text-gray-400 truncate mb-2">{site.address || `${site.city}, ${site.state}`}</p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
          {FORMAT_LABELS[site.format]}
        </span>
        <span className="text-xs text-gray-400">
          {site.widthFt}×{site.heightFt} ft
        </span>
        {site.illuminated && (
          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
            <Zap className="h-3 w-3" /> Lit
          </span>
        )}
        {site.facing && (
          <span className="text-xs text-gray-400">Facing {site.facing}</span>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-700">
          {site.monthlyRentInr > 0
            ? `₹${(site.monthlyRentInr / 1000).toFixed(0)}K/mo`
            : '—'}
        </span>
        <div className="flex items-center gap-1.5">
          {site.status === 'occupied' && site.clientName && (
            <span className="text-xs text-red-600 font-medium truncate max-w-[100px]">{site.clientName}</span>
          )}
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
          >
            {STATUS_LABELS[site.status]}
          </span>
        </div>
      </div>

      {/* Map button */}
      {hasCoords && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-[10px] text-purple-600 font-medium">
            <MapPin className="h-3 w-3" /> View on map
          </div>
        </div>
      )}
    </div>
  );
}
