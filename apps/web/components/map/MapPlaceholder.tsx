import { Map } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-zinc-950">
      <Map className="h-12 w-12 text-zinc-700" strokeWidth={1} />
      <p className="text-sm font-medium text-zinc-500">
        Interactive Map Coming Soon
      </p>
    </div>
  );
}
