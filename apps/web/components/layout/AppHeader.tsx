'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAccountsStore } from '@/lib/stores/accountsStore';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/':          'Dashboard',
  '/map':       'Map Intelligence',
  '/inventory': 'Site Inventory',
  '/barter':    'Barter Deals',
  '/accounts':  'Accounts',
  '/ai':        'AI Assistant',
  '/settings':  'Settings',
};

export function AppHeader() {
  const pathname = usePathname();
  const overdue  = useAccountsStore((s) => s.overdueInvoices());
  const title    = PAGE_TITLES[pathname] ?? 'Atlas';

  return (
    <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center gap-4 px-4 md:px-6">
      {/* Mobile menu placeholder */}
      <button className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100">
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title — mobile */}
      <h1 className="md:hidden text-base font-semibold text-gray-900">{title}</h1>

      {/* Search — desktop */}
      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
          placeholder="Search sites, clients, invoices…"
        />
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5" />
        {overdue.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {/* User */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          Y
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-gray-900 leading-none">Yash</p>
          <p className="text-[10px] text-gray-400 mt-0.5">BIZEX4U</p>
        </div>
      </div>
    </header>
  );
}
