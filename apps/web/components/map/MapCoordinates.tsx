'use client';

interface MapCoordinatesProps {
  lng: number | null;
  lat: number | null;
}

export function MapCoordinates({ lng, lat }: MapCoordinatesProps) {
  return (
    <div className="absolute bottom-8 right-2 z-10 rounded-md border border-zinc-700 bg-zinc-900/90 px-2.5 py-1 font-mono text-xs text-zinc-300 shadow backdrop-blur-sm">
      {lng !== null && lat !== null
        ? `${lng.toFixed(5)}, ${lat.toFixed(5)}`
        : '—, —'}
    </div>
  );
}
