'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Drawer from '@/components/layout/Drawer';
import { useAppStore } from '@/lib/stores';
import DashboardPanel from '@/components/dashboard/DashboardPanel';
import InventoryPanel from '@/components/inventory/InventoryPanel';
import BarterPanel from '@/components/barter/BarterPanel';
import AccountsPanel from '@/components/accounts/AccountsPanel';
import IntelligencePanel from '@/components/intelligence/IntelligencePanel';

const AtlasMap = dynamic(() => import('@/components/map/AtlasMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-dark-300 flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  )
});

export default function HomePage() {
  const { activeDrawer, drawerData } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-gray-400">Loading ATLAS...</div>
      </div>
    );
  }

  const renderDrawer = () => {
    if (!activeDrawer) return null;

    switch (activeDrawer) {
      case 'dashboard':
        return (
          <Drawer title="Dashboard">
            <DashboardPanel />
          </Drawer>
        );
      case 'inventory':
        return (
          <Drawer title="Inventory" width={480}>
            <InventoryPanel />
          </Drawer>
        );
      case 'barter':
        return (
          <Drawer title="Barter Deals" width={480}>
            <BarterPanel />
          </Drawer>
        );
      case 'accounts':
        return (
          <Drawer title="Accounts" width={480}>
            <AccountsPanel />
          </Drawer>
        );
      case 'intelligence':
        return (
          <Drawer title="Location Intelligence" width={460}>
            <IntelligencePanel />
          </Drawer>
        );
      case 'site-detail':
        return (
          <Drawer title="Site Details" width={400}>
            <SiteDetailPanel siteId={drawerData.siteId as string} />
          </Drawer>
        );
      case 'site-add':
        return (
          <Drawer title="Add Site" width={440}>
            <SiteAddPanel />
          </Drawer>
        );
      default:
        return null;
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden flex">
      <Sidebar />

      <div className="flex-1 relative">
        <AtlasMap />
      </div>

      {renderDrawer()}
    </main>
  );
}

import SiteDetailPanel from '@/components/inventory/SiteDetailPanel';
import SiteAddPanel from '@/components/inventory/SiteAddPanel';
