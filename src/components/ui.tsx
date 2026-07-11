import { useState } from "react";
import { X, Download } from "lucide-react";

// Shared form + modal primitives used across Atlas pages.

export const inputCls =
  "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className={
          "w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl " +
          (wide ? "sm:max-w-2xl" : "sm:max-w-md") +
          " max-h-[90vh]"
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ExportMenu({ onExport }: { onExport: (fmt: "pdf" | "excel" | "csv") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
        <Download className="h-4 w-4" /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {(["pdf", "excel", "csv"] as const).map((fmt) => (
            <button key={fmt} onClick={() => { onExport(fmt); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted capitalize">
              {fmt === "csv" ? "CSV (Sheets)" : fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
