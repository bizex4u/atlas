import { MapLoader } from '@/components/map/MapLoader';

export default function MapPage() {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <MapLoader dealers={[]} />
    </div>
  );
}
