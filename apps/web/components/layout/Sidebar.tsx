'use client';

import { Map, Bookmark, UploadCloud, FileText, Layers, ArrowRightLeft, IndianRupee } from 'lucide-react';
import { useSavedLocationsStore } from '@/lib/stores/savedLocationsStore';
import { useInventoryStore } from '@/lib/stores/inventoryStore';

interface SidebarProps {
  onUploadClick?:       () => void;
  onSavedClick?:        () => void;
  savedDrawerOpen?:     boolean;
  onProposalClick?:     () => void;
  onInventoryClick?:    () => void;
  inventoryDrawerOpen?: boolean;
  onBarterClick?:       () => void;
  barterDrawerOpen?:    boolean;
  onAccountsClick?:     () => void;
  accountsDrawerOpen?:  boolean;
}

export function Sidebar({ onUploadClick, onSavedClick, savedDrawerOpen, onProposalClick, onInventoryClick, inventoryDrawerOpen, onBarterClick, barterDrawerOpen, onAccountsClick, accountsDrawerOpen }: SidebarProps) {
  const count = useSavedLocationsStore((s) => s.saved.length);
  const siteCount = useInventoryStore((s) => s.sites.length);

  return (
    <aside className="relative flex h-full w-[72px] shrink-0 flex-col items-center gap-1 border-r border-gray-100 bg-white py-4 shadow-sm z-[60]">
      {/* Logo */}
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#6B21A8] shadow-sm">
        <Map className="h-4 w-4 text-white" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {/* Saved */}
        <button
          title="Saved Locations"
          onClick={onSavedClick}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            savedDrawerOpen
              ? 'bg-purple-50 text-[#6B21A8]'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#6B21A8] text-[9px] font-bold text-white flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
        {/* Inventory */}
        <button
          title="Site Inventory"
          onClick={onInventoryClick}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            inventoryDrawerOpen
              ? 'bg-purple-50 text-[#6B21A8]'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <Layers className="h-5 w-5" />
          {siteCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#6B21A8] text-[9px] font-bold text-white flex items-center justify-center">
              {siteCount > 9 ? '9+' : siteCount}
            </span>
          )}
        </button>
        {/* Barter */}
        <button
          title="Barter Deals"
          onClick={onBarterClick}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            barterDrawerOpen ? 'bg-purple-50 text-[#6B21A8]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <ArrowRightLeft className="h-5 w-5" />
        </button>

        {/* Accounts */}
        <button
          title="Accounts & Invoices"
          onClick={onAccountsClick}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            accountsDrawerOpen ? 'bg-purple-50 text-[#6B21A8]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          <IndianRupee className="h-5 w-5" />
        </button>

        {/* Generate Proposal */}
        <button
          title="Generate Proposal PDF"
          onClick={onProposalClick}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors text-gray-400 hover:bg-purple-50 hover:text-[#6B21A8]"
        >
          <FileText className="h-5 w-5" />
        </button>
      </nav>

      <button
        title="Upload Dealers"
        onClick={onUploadClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <UploadCloud className="h-5 w-5" />
      </button>
    </aside>
  );
}
