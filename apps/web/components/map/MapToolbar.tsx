'use client';

import { Layers, Pencil, Ruler, LocateFixed, Flame } from 'lucide-react';

const disabledTools = [
  { icon: Layers, label: 'Layers' },
  { icon: Pencil, label: 'Draw' },
  { icon: Ruler, label: 'Measure' },
  { icon: LocateFixed, label: 'Locate' },
];

interface MapToolbarProps {
  heatmapVisible: boolean;
  onHeatmapToggle: () => void;
}

export function MapToolbar({ heatmapVisible, onHeatmapToggle }: MapToolbarProps) {
  return (
    <div className="absolute top-3 right-14 z-10 flex flex-col gap-1 rounded-lg border border-zinc-700 bg-zinc-900/90 p-1 shadow-lg backdrop-blur-sm">
      {/* Heatmap toggle — active */}
      <button
        title="Heatmap"
        onClick={onHeatmapToggle}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
          heatmapVisible
            ? 'bg-[#6B21A8] text-white'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
        ].join(' ')}
      >
        <Flame className="h-4 w-4" />
      </button>

      <div className="h-px bg-zinc-700 mx-1" />

      {/* Placeholder tools */}
      {disabledTools.map(({ icon: Icon, label }) => (
        <button
          key={label}
          title={label}
          disabled
          className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-md text-zinc-600"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
