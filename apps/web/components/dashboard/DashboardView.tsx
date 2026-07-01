'use client';

import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { useBarterStore } from '@/lib/stores/barterStore';
import { useAccountsStore } from '@/lib/stores/accountsStore';
import {
  Layers, ArrowRightLeft, IndianRupee, AlertCircle,
  TrendingUp, MapPin, Plus, FileText, Zap, Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { AIChatPanel } from './AIChatPanel';

export function DashboardView() {
  const sites        = useInventoryStore((s) => s.sites);
  const deals        = useBarterStore((s) => s.deals);
  const invoices     = useAccountsStore((s) => s.invoices);
  const receivable   = useAccountsStore((s) => s.totalReceivable());
  const payable      = useAccountsStore((s) => s.totalPayable());
  const overdue      = useAccountsStore((s) => s.overdueInvoices());

  const available    = sites.filter((s) => s.status === 'available').length;
  const occupied     = sites.filter((s) => s.status === 'occupied').length;
  const activeDeals  = deals.filter((d) => d.status === 'active');

  // Campaigns expiring within 7 days
  const soon = sites.filter((s) => {
    if (!s.campaignEndDate || s.status === 'available') return false;
    const days = (new Date(s.campaignEndDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 7;
  });

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-6 space-y-6 min-w-0">

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#6B21A8] to-[#4c1d95] p-6 text-white">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80">{greeting}, Yash 👋</p>
            <h2 className="text-xl md:text-2xl font-bold mt-1">
              {available > 0
                ? `${available} site${available > 1 ? 's' : ''} ready to pitch`
                : 'All sites currently occupied'}
            </h2>
            <p className="text-sm opacity-70 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <Link href="/inventory?add=1"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <Plus className="h-4 w-4" /> Add Site
              </Link>
              <Link href="/accounts?new=receivable"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <FileText className="h-4 w-4" /> New Invoice
              </Link>
              <Link href="/map"
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <MapPin className="h-4 w-4" /> Open Map
              </Link>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-0 top-0 h-full w-48 opacity-10">
            <div className="absolute right-8 top-4 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute right-2 top-12 w-20 h-20 rounded-full border-4 border-white" />
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Total Sites"
            value={sites.length}
            sub={`${available} available`}
            icon={<Layers className="h-5 w-5" />}
            color="purple"
            href="/inventory"
          />
          <KPICard
            label="Active Barters"
            value={activeDeals.length}
            sub={`₹${(activeDeals.reduce((s,d)=>s+d.totalGivenValueInr,0)/1000).toFixed(0)}K value`}
            icon={<ArrowRightLeft className="h-5 w-5" />}
            color="blue"
            href="/barter"
          />
          <KPICard
            label="To Receive"
            value={`₹${(receivable/1000).toFixed(0)}K`}
            sub={`${invoices.filter(i=>i.type==='receivable'&&i.status!=='paid').length} invoices`}
            icon={<TrendingUp className="h-5 w-5" />}
            color="green"
            href="/accounts"
          />
          <KPICard
            label="Overdue"
            value={overdue.length}
            sub={overdue.length > 0 ? `₹${overdue.reduce((s,i)=>s+i.outstandingInr,0).toLocaleString('en-IN')}` : 'All clear'}
            icon={<AlertCircle className="h-5 w-5" />}
            color={overdue.length > 0 ? 'red' : 'gray'}
            href="/accounts"
          />
        </div>

        {/* Site availability bar */}
        {sites.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Site Availability</h3>
              <Link href="/inventory" className="text-xs text-purple-600 font-medium hover:underline">View all</Link>
            </div>
            <div className="flex rounded-xl overflow-hidden h-3">
              {available > 0    && <div className="bg-green-500 transition-all" style={{ width: `${available/sites.length*100}%` }} />}
              {occupied > 0     && <div className="bg-red-400"   style={{ width: `${occupied/sites.length*100}%` }} />}
              {sites.filter(s=>s.status==='booked').length > 0 && (
                <div className="bg-amber-400" style={{ width: `${sites.filter(s=>s.status==='booked').length/sites.length*100}%` }} />
              )}
              {sites.filter(s=>s.status==='maintenance').length > 0 && (
                <div className="bg-gray-300" style={{ width: `${sites.filter(s=>s.status==='maintenance').length/sites.length*100}%` }} />
              )}
            </div>
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { label: 'Available',    count: available, color: 'bg-green-500' },
                { label: 'Occupied',     count: occupied,  color: 'bg-red-400' },
                { label: 'Booked',       count: sites.filter(s=>s.status==='booked').length,      color: 'bg-amber-400' },
                { label: 'Maintenance',  count: sites.filter(s=>s.status==='maintenance').length,  color: 'bg-gray-300' },
              ].filter(x => x.count > 0).map(x => (
                <div key={x.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`h-2.5 w-2.5 rounded-sm ${x.color}`} />
                  {x.count} {x.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's work */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" /> Today's Work
          </h3>

          {soon.length === 0 && overdue.length === 0 && activeDeals.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nothing urgent today. All good!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.map((inv) => (
                <TodoRow key={inv.id} type="overdue"
                  title={`${inv.invoiceNumber} overdue — ${inv.partyName}`}
                  meta={`₹${inv.outstandingInr.toLocaleString('en-IN')} outstanding`}
                  href="/accounts" />
              ))}
              {soon.map((site) => (
                <TodoRow key={site.id} type="expiring"
                  title={`${site.siteCode} campaign ending soon`}
                  meta={`${site.clientName} · ends ${new Date(site.campaignEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}`}
                  href="/inventory" />
              ))}
              {activeDeals.map((deal) => (
                <TodoRow key={deal.id} type="barter"
                  title={`Barter active — ${deal.partnerName}`}
                  meta={`Ends ${new Date(deal.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}`}
                  href="/barter" />
              ))}
            </div>
          )}
        </div>

        {/* Recent inventory */}
        {sites.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Recent Sites</h3>
              <Link href="/inventory" className="text-xs text-purple-600 font-medium hover:underline">See all</Link>
            </div>
            <div className="space-y-2">
              {sites.slice(0, 5).map((site) => (
                <Link href="/inventory" key={site.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor:
                      site.status === 'available' ? '#16a34a' :
                      site.status === 'occupied'  ? '#dc2626' :
                      site.status === 'booked'    ? '#d97706' : '#6b7280' }}>
                    {site.format.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{site.name}</p>
                    <p className="text-xs text-gray-400">{site.siteCode} · {site.city}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0">
                    {site.monthlyRentInr > 0 ? `₹${(site.monthlyRentInr/1000).toFixed(0)}K` : '—'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Chat column ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[340px] shrink-0">
        <AIChatPanel />
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function KPICard({ label, value, sub, icon, color, href }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; color: string; href: string;
}) {
  const bg: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    red:    'bg-red-50 text-red-600',
    gray:   'bg-gray-100 text-gray-500',
  };
  return (
    <Link href={href}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all group">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg[color]}`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      <p className="text-[11px] text-gray-500 mt-1 font-medium">{sub}</p>
    </Link>
  );
}

function TodoRow({ type, title, meta, href }: {
  type: 'overdue' | 'expiring' | 'barter'; title: string; meta: string; href: string;
}) {
  const styles = {
    overdue:  { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700' },
    expiring: { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700' },
    barter:   { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  }[type];
  return (
    <Link href={href}
      className={`flex items-start gap-3 p-3 rounded-xl ${styles.bg} hover:opacity-80 transition-opacity`}>
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${styles.dot}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${styles.text} truncate`}>{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{meta}</p>
      </div>
    </Link>
  );
}
