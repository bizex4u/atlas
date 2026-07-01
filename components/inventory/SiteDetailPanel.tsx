'use client';

import { useState } from 'react';
import { MapPin, Building2, Phone, Mail, Edit2, Trash2, Map,IndianRupee } from 'lucide-react';
import { useSiteStore, useAppStore } from '@/lib/stores';
import { formatCurrency, formatDate } from '@/lib/utils';
import { STATUS_LABELS, FORMAT_LABELS, type SiteStatus } from '@/types';

interface SiteDetailPanelProps {
  siteId: string;
}

export default function SiteDetailPanel({ siteId }: SiteDetailPanelProps) {
  const { sites, updateSite, deleteSite, setSelectedSite } = useSiteStore();
  const { openDrawer, closeDrawer, setMapCenter } = useAppStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const site = sites.find(s => s.id === siteId);

  if (!site) {
    return <div className="text-gray-500 text-center py-8">Site not found</div>;
  }

  const handleStatusChange = (status: SiteStatus) => {
    updateSite(site.id, { status });
  };

  const handleDelete = () => {
    deleteSite(site.id);
    closeDrawer();
  };

  const handleFlyToSite = () => {
    setMapCenter({ lat: site.location.lat, lng: site.location.lng });
  };

  const statusColors: Record<SiteStatus, string> = {
    available: 'bg-success text-white',
    occupied: 'bg-error text-white',
    booked: 'bg-warning text-dark-300',
    maintenance: 'bg-gray-500 text-white'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`tag ${site.status === 'available' ? 'tag-success' : site.status === 'occupied' ? 'tag-error' : site.status === 'booked' ? 'tag-warning' : 'tag-info'}`}>
              {STATUS_LABELS[site.status]}
            </span>
            <span className="text-xs text-gray-500">{site.code}</span>
          </div>
          <h3 className="text-xl font-semibold text-white">{site.name}</h3>
          <p className="text-sm text-gray-400">{site.location.address}, {site.city}</p>
        </div>
        <button
          onClick={handleFlyToSite}
          className="btn btn-ghost px-2"
          title="Locate on map"
        >
          <Map size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="stat-label">Format</div>
          <div className="stat-value text-lg">{FORMAT_LABELS[site.format]}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Dimensions</div>
          <div className="stat-value text-lg">{site.dimensions.width}x{site.dimensions.height}</div>
          <div className="text-xs text-gray-500">{site.dimensions.sqft} sqft</div>
        </div>
      </div>

      <div className="card">
        <div className="stat-label mb-2">Financial Details</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Monthly Rent</span>
            <span className="text-white font-medium">{formatCurrency(site.financial.rent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Electricity</span>
            <span className="text-white">{formatCurrency(site.financial.electricity)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Municipal</span>
            <span className="text-white">{formatCurrency(site.financial.municipal)}</span>
          </div>
          <div className="h-px bg-dark-100 my-2" />
          <div className="flex justify-between">
            <span className="text-gray-400">Total Monthly</span>
            <span className="text-primary-400 font-medium">
              {formatCurrency(site.financial.rent + site.financial.electricity + site.financial.municipal)}
            </span>
          </div>
        </div>
      </div>

      {site.landlord && (
        <div className="card">
          <div className="stat-label mb-2">Landlord</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-700/30 flex items-center justify-center">
              <Building2 size={18} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{site.landlord.name}</div>
              <div className="text-sm text-gray-500">{site.landlord.phone}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="stat-label mb-2">Update Status</div>
        <div className="grid grid-cols-2 gap-2">
          {(['available', 'occupied', 'booked', 'maintenance'] as SiteStatus[]).map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                site.status === status
                  ? statusColors[status]
                  : 'bg-dark-100 text-gray-400 hover:text-white'
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="stat-label mb-2">Additional Info</div>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Type</span>
            <span className="text-white capitalize">{site.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Visibility</span>
            <span className="text-white capitalize">{site.visibility}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lighting</span>
            <span className="text-white capitalize">{site.lighting}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Traffic</span>
            <span className="text-white capitalize">{site.trafficType}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Created: {formatDate(site.createdAt)}
        {site.updatedAt !== site.createdAt && (
          <span className="ml-2">Updated: {formatDate(site.updatedAt)}</span>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-ghost flex-1 text-error hover:bg-error/10"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="card bg-error/10 border-error/30">
          <p className="text-sm text-white mb-3">Are you sure you want to delete this site?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleDelete} className="btn bg-error hover:bg-red-600 flex-1">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
