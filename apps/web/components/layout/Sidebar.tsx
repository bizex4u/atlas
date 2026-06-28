import { Map, Layers, Bookmark, Settings } from "lucide-react";

const navItems = [
  { icon: Map, label: "Map" },
  { icon: Layers, label: "Layers" },
  { icon: Bookmark, label: "Saved" },
  { icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-[72px] shrink-0 flex-col items-center gap-1 border-r border-zinc-800 bg-zinc-900 py-4">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
        <Map className="h-5 w-5 text-white" />
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </nav>
    </aside>
  );
}
