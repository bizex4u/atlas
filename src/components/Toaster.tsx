import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, Cloud } from "lucide-react";

// ── Global toast bus ──────────────────────────────────────────────────────────
export type ToastKind = "success" | "error" | "info" | "sync";
export interface Toast { id: string; kind: ToastKind; title: string; desc?: string }

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();

export function toast(kind: ToastKind, title: string, desc?: string) {
  const t: Toast = { id: crypto.randomUUID(), kind, title, desc };
  listeners.forEach((l) => l(t));
}
toast.success = (title: string, desc?: string) => toast("success", title, desc);
toast.error = (title: string, desc?: string) => toast("error", title, desc);
toast.info = (title: string, desc?: string) => toast("info", title, desc);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  info: <Info className="h-4 w-4 text-primary" />,
  sync: <Cloud className="h-4 w-4 text-primary" />,
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast: Listener = (t) => {
      setToasts((prev) => [...prev.slice(-3), t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3800);
    };
    listeners.add(onToast);
    return () => { listeners.delete(onToast); };
  }, []);

  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200 min-w-[260px] max-w-[360px]"
        >
          <span className="mt-0.5 shrink-0">{ICONS[t.kind]}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium leading-tight">{t.title}</div>
            {t.desc && <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
