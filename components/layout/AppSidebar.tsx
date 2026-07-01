'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Map, Layers, ArrowRightLeft,
  IndianRupee, MessageSquare, Settings, ChevronRight,
} from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { useAccountsStore } from '@/lib/stores/accountsStore';

const NAV = [
  {
    group: 'OVERVIEW',
    items: [
      { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
      { href: '/ai',        label: 'AI Assistant', icon: MessageSquare },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { href: '/map',       label: 'Map',       icon: Map },
      { href: '/inventory', label: 'Inventory', icon: Layers },
      { href: '/barter',    label: 'Barter',    icon: ArrowRightLeft },
      { href: '/accounts',  label: 'Accounts',  icon: IndianRupee },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { href: '/settings',  label: 'Settings',  icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname  = usePathname();
  const sites     = useInventoryStore((s) => s.sites);
  const overdue   = useAccountsStore((s) => s.overdueInvoices());
  const available = sites.filter((s) => s.status === 'available').length;

  const badges: Record<string, string | number> = {
    '/inventory': sites.length,
    '/accounts':  overdue.length > 0 ? overdue.length : '',
  };

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 h-full bg-white border-r border-gray-100 py-5 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-8 h-8 rounded-xl bg-[#6B21A8] flex items-center justify-center shadow-md shadow-purple-200">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-none">Atlas</p>
          <p className="text-[10px] text-gray-400 mt-0.5">BIZEX4U</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active  = pathname === href;
                const badge   = badges[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? 'bg-purple-50 text-[#6B21A8]'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#6B21A8]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1">{label}</span>
                    {badge ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        href === '/accounts' && overdue.length > 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {badge}
                      </span>
                    ) : active ? (
                      <ChevronRight className="h-3 w-3 text-purple-400" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick stat */}
      <div className="mt-4 mx-2 bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl p-4 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">Available Sites</p>
        <p className="text-2xl font-bold">{available}</p>
        <p className="text-[10px] opacity-60 mt-0.5">of {sites.length} total</p>
      </div>
    </aside>
  );
}

/* ── Mobile bottom nav ──────────────────────────────────────────────────────── */

const MOBILE_NAV = [
  { href: '/',          label: 'Home',      icon: LayoutDashboard },
  { href: '/map',       label: 'Map',       icon: Map },
  { href: '/inventory', label: 'Sites',     icon: Layers },
  { href: '/barter',    label: 'Barter',    icon: ArrowRightLeft },
  { href: '/accounts',  label: 'Accounts',  icon: IndianRupee },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex safe-bottom">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-semibold transition-colors ${
              active ? 'text-[#6B21A8]' : 'text-gray-400'
            }`}>
            <Icon className={`h-5 w-5 ${active ? 'text-[#6B21A8]' : 'text-gray-400'}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
