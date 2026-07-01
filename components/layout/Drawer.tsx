'use client';

import { X } from 'lucide-react';
import { useAppStore } from '@/lib/stores';

interface DrawerProps {
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Drawer({ title, children, width = 420 }: DrawerProps) {
  const { closeDrawer } = useAppStore();

  return (
    <div className="drawer" style={{ width: `${width}px` }}>
      <div className="drawer-header">
        <h2 className="drawer-title">{title}</h2>
        <button
          onClick={closeDrawer}
          className="w-8 h-8 rounded-lg hover:bg-dark-100 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="drawer-content">
        {children}
      </div>
    </div>
  );
}
