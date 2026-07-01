'use client';

import { MapPin, Receipt, Repeat, TrendingUp, Building2, Users } from 'lucide-react';
import { useSiteStore, useAccountsStore, useBarterStore, useAppStore } from '@/lib/stores';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPanel() {
  const { sites } = useSiteStore();
  const { clients, invoices } = useAccountsStore();
  const { partners, deals } = useBarterStore();
  const { openDrawer } = useAppStore();

  const stats = {
    totalSites: sites.length,
    availableSites: sites.filter(s => s.status === 'available').length,
    occupiedSites: sites.filter(s => s.status === 'occupied').length,
    bookedSites: sites.filter(s => s.status === 'booked').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.grandTotal, 0),
    outstandingRevenue: invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.grandTotal, 0),
    activeDeals: deals.filter(d => d.status === 'active').length,
    clientsCount: clients.length,
    partnersCount: partners.length,
    overdueInvoices: invoices.filter(i => i.status === 'sent' && new Date(i.dueDate) < new Date()).length
  };

  const formatBreakdown = sites.reduce((acc, site) => {
    acc[site.format] = (acc[site.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openDrawer('inventory')}
          className="stat-card text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-primary-400" />
            <span className="stat-label">Total Sites</span>
          </div>
          <div className="stat-value">{stats.totalSites}</div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.availableSites} available
          </div>
        </button>

        <button
          onClick={() => openDrawer('accounts')}
          className="stat-card text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} className="text-primary-400" />
            <span className="stat-label">Outstanding</span>
          </div>
          <div className="stat-value text-warning">{formatCurrency(stats.outstandingRevenue)}</div>
          {stats.overdueInvoices > 0 && (
            <div className="mt-2 text-xs text-error">
              {stats.overdueInvoices} overdue
            </div>
          )}
        </button>

        <button
          onClick={() => openDrawer('accounts')}
          className="stat-card text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-primary-400" />
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-value text-success">{formatCurrency(stats.totalRevenue)}</div>
        </button>

        <button
          onClick={() => openDrawer('barter')}
          className="stat-card text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <Repeat size={16} className="text-primary-400" />
            <span className="stat-label">Barter Deals</span>
          </div>
          <div className="stat-value">{stats.activeDeals}</div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.partnersCount} partners
          </div>
        </button>
      </div>

      <div className="card">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Site Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="status-dot status-available" />
              <span className="text-sm text-gray-400">Available</span>
            </div>
            <span className="text-sm font-medium">{stats.availableSites}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="status-dot status-occupied" />
              <span className="text-sm text-gray-400">Occupied</span>
            </div>
            <span className="text-sm font-medium">{stats.occupiedSites}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="status-dot status-booked" />
              <span className="text-sm text-gray-400">Booked</span>
            </div>
            <span className="text-sm font-medium">{stats.bookedSites}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-dark-100">
            {stats.totalSites > 0 && (
              <>
                <div
                  className="bg-success"
                  style={{ width: `${(stats.availableSites / stats.totalSites) * 100}%` }}
                />
                <div
                  className="bg-error"
                  style={{ width: `${(stats.occupiedSites / stats.totalSites) * 100}%` }}
                />
                <div
                  className="bg-warning"
                  style={{ width: `${(stats.bookedSites / stats.totalSites) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {Object.keys(formatBreakdown).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Format Breakdown</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(formatBreakdown).map(([format, count]) => (
              <div
                key={format}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-dark-100/50"
              >
                <span className="text-sm text-gray-400">{format}</span>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card text-left">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-gray-500" />
            <span className="stat-label">Clients</span>
          </div>
          <div className="stat-value text-lg">{stats.clientsCount}</div>
        </div>
        <div className="stat-card text-left">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gray-500" />
            <span className="stat-label">Barter Partners</span>
          </div>
          <div className="stat-value text-lg">{stats.partnersCount}</div>
        </div>
      </div>

      {sites.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No sites added yet</div>
          <button
            onClick={() => openDrawer('site-add')}
            className="btn btn-primary"
          >
            <MapPin size={16} />
            Add Your First Site
          </button>
        </div>
      )}
    </div>
  );
}
