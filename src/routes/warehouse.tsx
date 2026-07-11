import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useWarehouse, itemStock, type WarehouseItem } from "@/lib/stores";
import { inr, formatDate } from "@/lib/format";
import {
  Warehouse as WarehouseIcon, Plus, Search, Trash2, ArrowDownToLine, ArrowUpFromLine,
  TrendingDown, TrendingUp, Package, X, History, AlertTriangle,
} from "lucide-react";
import { Field, inputCls, Modal } from "@/components/ui";
import { toast } from "@/components/Toaster";

export const Route = createFileRoute("/warehouse")({
  head: () => ({ meta: [{ title: "Warehouse — Atlas" }] }),
  component: WarehousePage,
});

const CATEGORIES = ["Electronics", "Appliances", "FMCG", "Apparel", "Furniture", "Beauty", "Toys", "Other"];

/** Average monthly outflow over the item's movement history (absolute units/month). */
function monthlyVelocity(item: WarehouseItem): number {
  const outs = item.movements.filter((m) => m.qty < 0);
  if (!outs.length) return 0;
  const dates = item.movements.map((m) => new Date(m.date).getTime());
  const spanMonths = Math.max((Math.max(...dates) - Math.min(...dates)) / (30 * 86400000), 1);
  const totalOut = outs.reduce((a, m) => a - m.qty, 0);
  return totalOut / spanMonths;
}

function WarehousePage() { return <AppShell><WarehouseContent /></AppShell>; }

function WarehouseContent() {
  const { items, addItem, deleteItem, move } = useWarehouse();
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [moveItem, setMoveItem] = useState<{ item: WarehouseItem; dir: 1 | -1 } | null>(null);
  const [historyItem, setHistoryItem] = useState<WarehouseItem | null>(null);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return items.filter((i) =>
      !term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term) || i.category.toLowerCase().includes(term)
    );
  }, [items, q]);

  const totalValue = items.reduce((a, i) => a + itemStock(i) * i.unitValue, 0);
  const totalUnits = items.reduce((a, i) => a + itemStock(i), 0);
  const lowStock = items.filter((i) => {
    const v = monthlyVelocity(i);
    return v > 0 && itemStock(i) / v < 1; // under a month of cover
  });

  const historyLive = historyItem ? items.find((i) => i.id === historyItem.id) ?? null : null;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <WarehouseIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Warehouse</h1>
            <p className="text-xs text-muted-foreground">Barter goods · {items.length} SKUs · {totalUnits} units · {inr(totalValue)} stock value</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card">
          <Plus className="h-4 w-4" /> New SKU
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="text-xs text-muted-foreground">Stock value</div>
          <div className="mt-1 text-2xl font-semibold">{inr(totalValue)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="text-xs text-muted-foreground">Total units</div>
          <div className="mt-1 text-2xl font-semibold">{totalUnits}</div>
        </div>
        <div className={`rounded-2xl border p-4 shadow-card ${lowStock.length ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "border-border bg-card"}`}>
          <div className="text-xs text-muted-foreground">Low cover (&lt;1 month)</div>
          <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">
            {lowStock.length}
            {lowStock.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-600" />}
          </div>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search SKU, name, category…" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No stock yet. Add SKUs you receive through barter deals.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium text-right">Stock</th>
                <th className="px-4 py-2.5 font-medium text-right">Unit ₹</th>
                <th className="px-4 py-2.5 font-medium text-right">Value</th>
                <th className="px-4 py-2.5 font-medium text-right">Out/mo</th>
                <th className="px-4 py-2.5 font-medium">Cover</th>
                <th className="px-4 py-2.5 font-medium">Trend</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((i) => {
                const stock = itemStock(i);
                const vel = monthlyVelocity(i);
                const coverMonths = vel > 0 ? stock / vel : null;
                return (
                  <tr key={i.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{i.sku}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-[11px] text-muted-foreground">{i.category}</div>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${stock <= 0 ? "text-destructive" : ""}`}>{stock}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{inr(i.unitValue)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{inr(stock * i.unitValue)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{vel ? vel.toFixed(1) : "—"}</td>
                    <td className="px-4 py-2.5">
                      {coverMonths == null ? <span className="text-muted-foreground">—</span> :
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${coverMonths < 1 ? "bg-destructive/10 text-destructive" : coverMonths < 2 ? "bg-amber-100 text-amber-800" : "bg-success/15 text-success"}`}>
                          {coverMonths.toFixed(1)} mo
                        </span>}
                    </td>
                    <td className="px-4 py-2.5"><Sparkline item={i} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button title="Stock in" onClick={() => setMoveItem({ item: i, dir: 1 })} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-success hover:bg-success/10"><ArrowDownToLine className="h-3.5 w-3.5" /></button>
                        <button title="Stock out" onClick={() => setMoveItem({ item: i, dir: -1 })} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-primary hover:bg-primary/10"><ArrowUpFromLine className="h-3.5 w-3.5" /></button>
                        <button title="History" onClick={() => setHistoryItem(i)} className="grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-muted"><History className="h-3.5 w-3.5" /></button>
                        <button title="Delete" onClick={() => { if (confirm(`Delete ${i.name}?`)) deleteItem(i.id); }} className="grid h-7 w-7 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddSkuModal onClose={() => setShowAdd(false)} onSave={(d, qty) => { addItem(d, qty); setShowAdd(false); toast.success(`${d.name} added`, qty ? `${qty} units opening stock` : undefined); }} />}
      {moveItem && (
        <MoveModal
          item={moveItem.item} dir={moveItem.dir}
          onClose={() => setMoveItem(null)}
          onSave={(qty, note) => {
            move(moveItem.item.id, moveItem.dir * qty, note);
            toast.success(`${moveItem.dir > 0 ? "+" : "−"}${qty} ${moveItem.item.name}`, note);
            setMoveItem(null);
          }}
        />
      )}
      {historyLive && <HistoryModal item={historyLive} onClose={() => setHistoryItem(null)} />}
    </div>
  );
}

function Sparkline({ item }: { item: WarehouseItem }) {
  // Running stock level over the last 12 movements
  const pts = useMemo(() => {
    const ms = [...item.movements].sort((a, b) => a.date.localeCompare(b.date));
    let level = 0;
    const levels = ms.map((m) => (level += m.qty));
    return levels.slice(-12);
  }, [item]);
  if (pts.length < 2) return <span className="text-xs text-muted-foreground">—</span>;
  const max = Math.max(...pts, 1), min = Math.min(...pts, 0);
  const range = max - min || 1;
  const W = 72, H = 22;
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * W},${H - ((p - min) / range) * H}`).join(" ");
  const rising = pts[pts.length - 1] >= pts[0];
  return (
    <svg width={W} height={H} className="overflow-visible">
      <path d={path} fill="none" stroke={rising ? "#16a34a" : "#dc2626"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AddSkuModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (d: { sku: string; name: string; category: string; unitValue: number }, openingQty: number) => void;
}) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [unitValue, setUnitValue] = useState("");
  const [qty, setQty] = useState("");
  return (
    <Modal title="New SKU" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onSave({ sku: sku.trim() || name.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 16), name: name.trim(), category, unitValue: parseFloat(unitValue) || 0 }, parseInt(qty) || 0); }} className="space-y-3">
        <Field label="Item name *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sharp 43-inch TV" className={inputCls} autoFocus /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="SKU (auto if blank)"><input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SHARP-TV-43" className={inputCls} /></Field>
          <Field label="Category"><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Unit value (₹)"><input type="number" value={unitValue} onChange={(e) => setUnitValue(e.target.value)} placeholder="28000" className={inputCls} /></Field>
          <Field label="Opening stock"><input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className={inputCls} /></Field>
        </div>
        <button className="w-full rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Add SKU</button>
      </form>
    </Modal>
  );
}

function MoveModal({ item, dir, onClose, onSave }: {
  item: WarehouseItem; dir: 1 | -1;
  onClose: () => void; onSave: (qty: number, note: string) => void;
}) {
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const stock = itemStock(item);
  return (
    <Modal title={`${dir > 0 ? "Stock in" : "Stock out"} — ${item.name}`} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); const n = parseInt(qty); if (!n || n <= 0) return; if (dir < 0 && n > stock && !confirm(`Only ${stock} in stock — go negative?`)) return; onSave(n, note.trim()); }} className="space-y-3">
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">Current stock: <b>{stock}</b> units</div>
        <Field label="Quantity *"><input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} autoFocus /></Field>
        <Field label="Note"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={dir > 0 ? "Received from Sharp barter" : "Sold to dealer / gifted in campaign"} className={inputCls} /></Field>
        <button className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground ${dir > 0 ? "bg-success" : "gradient-primary"}`}>
          {dir > 0 ? "Add stock" : "Remove stock"}
        </button>
      </form>
    </Modal>
  );
}

function HistoryModal({ item, onClose }: { item: WarehouseItem; onClose: () => void }) {
  const ms = [...item.movements].sort((a, b) => b.date.localeCompare(a.date));
  let running = itemStock(item);
  const rows = ms.map((m) => { const r = { ...m, after: running }; running -= m.qty; return r; });
  return (
    <Modal title={`History — ${item.name}`} onClose={onClose}>
      <div className="max-h-[50vh] overflow-y-auto">
        {rows.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No movements yet.</p> : (
          <ul className="divide-y divide-border">
            {rows.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2.5">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.qty > 0 ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                  {m.qty > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.qty > 0 ? "+" : ""}{m.qty} units</div>
                  <div className="truncate text-[11px] text-muted-foreground">{formatDate(m.date)}{m.note ? ` · ${m.note}` : ""}</div>
                </div>
                <span className="text-xs text-muted-foreground">bal {m.after}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
