'use client';

interface MapLoadingOverlayProps {
  visible: boolean;
}

export function MapLoadingOverlay({ visible }: MapLoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
        <span className="text-xs text-zinc-500">Loading map…</span>
      </div>
    </div>
  );
}
