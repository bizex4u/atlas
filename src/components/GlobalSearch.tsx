import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Package, Users, CheckSquare, MapPin, BookOpen, X, Tag, Radar, Warehouse } from "lucide-react";
import { useInventory, useBrandDeals, useWarehouse, dealValue, itemStock, DEAL_STAGES } from "@/lib/stores";
import { useCrm, useTasks } from "@/lib/crm";
import { inr } from "@/lib/format";

type Hit = {
  kind: "site" | "customer" | "task" | "page" | "brand" | "stock";
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PAGES: Hit[] = [
  { kind: "page", id: "p-dash", title: "Dashboard", subtitle: "KPIs & today", to: "/", icon: BookOpen },
  { kind: "page", id: "p-research", title: "Brand Intelligence", subtitle: "Brand + city → signals, pincode heat, OOH zones, pitch", to: "/research", icon: Search },
  { kind: "page", id: "p-brands", title: "Brand Pipeline", subtitle: "Deals board · drag between stages", to: "/brands", icon: Tag },
  { kind: "page", id: "p-intel", title: "Market Intel", subtitle: "Who to pitch this month", to: "/intel", icon: Radar },
  { kind: "page", id: "p-map", title: "Map", subtitle: "Sites on map", to: "/map", icon: MapPin },
  { kind: "page", id: "p-cust", title: "Agencies (CRM)", subtitle: "Leads & pipeline", to: "/agencies", icon: Users },
  { kind: "page", id: "p-wh", title: "Warehouse", subtitle: "Stock & inventory", to: "/warehouse", icon: Warehouse },
  { kind: "page", id: "p-tasks", title: "Tasks", subtitle: "Reminders & follow-ups", to: "/tasks", icon: CheckSquare },
];

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const sites = useInventory((s) => s.sites);
  const agencies = useCrm((s) => s.customers);
  const tasks = useTasks((s) => s.tasks);
  const brandDeals = useBrandDeals((s) => s.deals);
  const whItems = useWarehouse((s) => s.items);

  const all: Hit[] = useMemo(() => {
    return [
      ...PAGES,
      ...sites.map<Hit>((s) => ({
        kind: "site",
        id: s.id,
        title: `${s.code} · ${s.name}`,
        subtitle: `${s.city} · ${s.format} · ${s.status}${s.aiTags?.length ? " · " + s.aiTags.join(" ") : ""}`,
        to: "/map",
        icon: MapPin,
      })),
      ...agencies.map<Hit>((c) => ({
        kind: "customer",
        id: c.id,
        title: c.name,
        subtitle: `${c.stage} · ${c.contact}${c.city ? " · " + c.city : ""}`,
        to: `/agencies/${c.id}`,
        icon: Users,
      })),
      ...tasks.map<Hit>((t) => ({
        kind: "task",
        id: t.id,
        title: t.title,
        subtitle: `${t.done ? "Done" : "Open"} · due ${t.dueDate} · ${t.priority}`,
        to: "/tasks",
        icon: CheckSquare,
      })),
      ...brandDeals.map<Hit>((d) => ({
        kind: "brand",
        id: d.id,
        title: d.brandName,
        subtitle: `${DEAL_STAGES.find((s) => s.key === d.stage)?.label ?? d.stage} · ${d.category}${d.contactName ? " · " + d.contactName : ""}${dealValue(d) > 0 ? " · " + inr(dealValue(d)) : ""}`,
        to: "/brands",
        icon: Tag,
      })),
      ...whItems.map<Hit>((w) => ({
        kind: "stock",
        id: w.id,
        title: `${w.sku} · ${w.name}`,
        subtitle: `${w.category} · ${itemStock(w)} units in stock · ${inr(itemStock(w) * w.unitValue)}`,
        to: "/warehouse",
        icon: Package,
      })),
    ];
  }, [sites, agencies, tasks, brandDeals, whItems]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all.slice(0, 12);
    return all
      .filter((h) => (h.title + " " + h.subtitle).toLowerCase().includes(term))
      .slice(0, 30);
  }, [q, all]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  if (!open) return null;

  function pick(h: Hit) {
    onClose();
    navigate({ to: h.to });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const h = results[idx];
                if (h) pick(h);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search sites, invoices, agencies, deals, tasks…"
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {results.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No results.</div>
          )}
          {results.map((h, i) => {
            const Icon = h.icon;
            return (
              <button
                key={h.kind + h.id}
                onMouseEnter={() => setIdx(i)}
                onClick={() => pick(h)}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors " +
                  (i === idx ? "bg-accent" : "hover:bg-muted")
                }
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{h.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{h.subtitle}</span>
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {h.kind}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}

export function useGlobalSearchHotkey(setOpen: (v: boolean) => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
