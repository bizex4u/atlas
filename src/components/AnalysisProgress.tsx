import { useEffect, useState } from "react";
import { Loader2, Check, Database } from "lucide-react";

// Live analysis progress — cycles through research steps so the wait feels
// like an analyst working, not a blank screen. Purely cosmetic pacing; the
// real work finishes when the parent flips `done`/unmounts.
export function AnalysisProgress({
  title,
  steps,
  sources,
}: {
  title: string;
  steps: string[];
  sources?: string[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= steps.length - 1) return;
    const t = setTimeout(() => setActive((i) => Math.min(i + 1, steps.length - 1)), 1400 + Math.random() * 900);
    return () => clearTimeout(t);
  }, [active, steps.length]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> {title}
      </div>
      <ol className="mt-4 space-y-2.5">
        {steps.map((s, i) => {
          const state = i < active ? "done" : i === active ? "active" : "pending";
          return (
            <li key={i} className="flex items-center gap-2.5 text-sm">
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                state === "done" ? "bg-success/15 text-success"
                : state === "active" ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"}`}>
                {state === "done" ? <Check className="h-3 w-3" />
                  : state === "active" ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <span className={state === "pending" ? "text-muted-foreground" : state === "active" ? "font-medium" : ""}>{s}</span>
            </li>
          );
        })}
      </ol>
      {sources && sources.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Checking:</span>
          {sources.map((s) => (
            <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
