'use client';

import dynamic from 'next/dynamic';
import type { ScoredDealer } from '@/types/dealer';

const MapCanvas = dynamic(
  () => import('./MapCanvas').then((m) => m.MapCanvas),
  { ssr: false },
);

interface MapLoaderProps {
  dealers?: ScoredDealer[];
}

export function MapLoader({ dealers }: MapLoaderProps) {
  return <MapCanvas dealers={dealers} />;
}
