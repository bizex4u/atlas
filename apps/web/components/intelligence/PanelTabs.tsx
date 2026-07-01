'use client';

import { usePanelStore, type TabId } from '@/lib/stores/panelStore';

interface Tab {
  id:    TabId;
  label: string;
  icon:  React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'overview', label: 'Overview',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    id: 'market', label: 'Market',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="m7 16 4-4 4 4 4-6"/></svg>,
  },
  {
    id: 'advertising', label: 'Ads',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  },
  {
    id: 'nearby', label: 'Nearby',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  },
  {
    id: 'mobility', label: 'Mobility',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  },
  {
    id: 'demographics', label: 'People',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>,
  },
  {
    id: 'ai-summary', label: 'AI Report',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  },
];

export function PanelTabs() {
  const activeTab    = usePanelStore((s) => s.activeTab);
  const setActiveTab = usePanelStore((s) => s.setActiveTab);

  return (
    <div className="flex shrink-0 border-b border-gray-100 bg-white">
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        const isAI   = tab.id === 'ai-summary';
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={[
              'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-150',
              active
                ? 'text-[#6B21A8] after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:bg-[#6B21A8] after:rounded-t-full'
                : isAI
                ? 'text-[#6B21A8]/40 hover:text-[#6B21A8]/70'
                : 'text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            {tab.icon}
            <span className={`text-[8px] font-semibold tracking-wide ${
              active ? 'text-[#6B21A8]' : isAI ? 'text-[#6B21A8]/40' : 'text-gray-400'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
