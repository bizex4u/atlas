'use client';

import dynamic from 'next/dynamic';

const AtlasMap = dynamic(() => import('@/components/map/AtlasMap'), { ssr: false });

export default function MapPage() {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <AtlasMap />
    </div>
  );
}
