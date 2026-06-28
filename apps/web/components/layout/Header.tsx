import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-4">
      <span className="text-sm font-semibold tracking-widest text-white uppercase">
        Atlas
      </span>
      <div className="flex flex-1 max-w-sm items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <input
          type="text"
          placeholder="Search locations…"
          className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
        />
      </div>
      <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white select-none">
        YM
      </div>
    </header>
  );
}
