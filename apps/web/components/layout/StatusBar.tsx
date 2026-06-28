export function StatusBar() {
  return (
    <footer className="flex h-7 shrink-0 items-center gap-2 border-t border-zinc-800 bg-zinc-900 px-4">
      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Status: Ready
      </span>
    </footer>
  );
}
