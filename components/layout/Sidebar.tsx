'use client';

import {
  LayoutDashboard,
  MapPin,
  Repeat,
  Receipt,
  Brain,
  Settings
} from 'lucide-react';
import { useAppStore, useSiteStore, useAccountsStore, useBarterStore } from '@/lib/stores';

export default function Sidebar() {
  const { activeDrawer, openDrawer } = useAppStore();
  const { sites } = useSiteStore();
  const { invoices } = useAccountsStore();
  const { deals } = useBarterStore();

  const availableCount = sites.filter(s => s.status === 'available').length;
  const overdueCount = invoices.filter(i => i.status === 'sent' && new Date(i.dueDate) < new Date()).length;
  const activeDeals = deals.filter(d => d.status === 'active').length;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'inventory', icon: MapPin, label: 'Inventory', badge: availableCount > 0 ? availableCount : null },
    { id: 'barter', icon: Repeat, label: 'Barter', badge: activeDeals > 0 ? activeDeals : null },
    { id: 'accounts', icon: Receipt, label: 'Accounts', badge: overdueCount > 0 ? overdueCount : null },
    { id: 'intelligence', icon: Brain, label: 'Intelligence', badge: null },
  ] as const;

  const handleClick = (drawerId: string) => {
    if (activeDrawer === drawerId) {
      openDrawer(null);
    } else {
      openDrawer(drawerId as typeof activeDrawer);
    }
  };

  return (
    <nav className="sidebar">
      <div className="mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
      </div>

      <div className="w-12 h-px bg-dark-100 mb-4" />

      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`sidebar-icon ${activeDrawer === item.id ? 'active' : 'text-gray-400 hover:text-white'}`}
            title={item.label}
          >
            <item.icon size={22} />
            {item.badge !== null && item.badge !== undefined && (
              <span className="sidebar-badge">{item.badge > 9 ? '9+' : item.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="w-12 h-px bg-dark-100 mb-4" />

      <button
        onClick={() => openDrawer('settings')}
        className={`sidebar-icon ${activeDrawer === 'settings' ? 'active' : 'text-gray-400 hover:text-white'}`}
        title="Settings"
      >
        <Settings size={22} />
      </button>
    </nav>
  );
}
