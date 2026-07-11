import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useBrandDeals, useInventory,
  MEDIA_TYPES, MEDIA_GROUPS, DEAL_STAGES, dealValue,
  type BrandDeal, type MediaPlanItem, type DealStage, type MediaType,
} from "@/lib/stores";
import { inr, formatDate } from "@/lib/format";
import {
  Tag, Plus, X, ChevronRight, Trash2, Edit3, Check,
  Phone, Mail, MapPin, Calendar, Target, IndianRupee,
  FileText, Building2, ArrowRight, AlertCircle,
  LayoutGrid, List as ListIcon, GripVertical,
} from "lucide-react";
import { toast } from "@/components/Toaster";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [{ title: "Brand Pipeline — Atlas" }],
  }),
  component: BrandsPage,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRAND_CATEGORIES = [
  "FMCG", "Auto", "Telecom", "Fintech", "Real Estate", "Ed-Tech",
  "Food & QSR", "Healthcare", "Pharma", "Insurance", "Banking",
  "Retail", "E-Commerce", "OTT", "Beauty", "Jewellery", "Clothing",
  "Electronics", "Hospitality", "Events", "Other",
];

const ITEM_STATUS_STYLE: Record<MediaPlanItem["status"], string> = {
  proposed: "bg-muted text-muted-foreground",
  approved: "bg-green-100 text-green-800",
  on_hold: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
};

function stageInfo(stage: DealStage) {
  return DEAL_STAGES.find((s) => s.key === stage) ?? DEAL_STAGES[0];
}

function mediaGroup(type: MediaType) {
  return Object.entries(MEDIA_GROUPS).find(([, types]) => types.includes(type))?.[0] ?? "Other";
}

// ── Page ──────────────────────────────────────────────────────────────────────

function BrandsPage() {
  return (
    <AppShell>
      <BrandPipeline />
    </AppShell>
  );
}

function BrandPipeline() {
  const { deals, addDeal, setStage, deleteDeal } = useBrandDeals();
  const [activeStage, setActiveStage] = useState<DealStage | "all">("all");
  const [selectedDeal, setSelectedDeal] = useState<BrandDeal | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [view, setView] = useState<"list" | "board">(() => {
    try { return (localStorage.getItem("atlas-pipeline-view") as "list" | "board") || "board"; } catch { return "board"; }
  });
  function switchView(v: "list" | "board") {
    setView(v);
    try { localStorage.setItem("atlas-pipeline-view", v); } catch { /* ignore */ }
  }

  const filtered = useMemo(
    () => activeStage === "all" ? deals : deals.filter((d) => d.stage === activeStage),
    [deals, activeStage]
  );

  // Sync selectedDeal with store updates
  const selectedDealLive = selectedDeal ? deals.find((d) => d.id === selectedDeal.id) ?? null : null;

  const pipelineValue = deals
    .filter((d) => !["lost"].includes(d.stage))
    .reduce((a, d) => a + dealValue(d), 0);

  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of deals) c[d.stage] = (c[d.stage] || 0) + 1;
    return c;
  }, [deals]);

  return (
    <div className={`mx-auto p-4 md:p-6 ${view === "board" ? "max-w-none" : "max-w-6xl"}`}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Brand Pipeline</h1>
            <p className="text-xs text-muted-foreground">
              {deals.length} brands · Pipeline {inr(pipelineValue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-background p-0.5">
            <button
              onClick={() => switchView("board")}
              title="Board view"
              className={`grid h-8 w-8 place-items-center rounded-[10px] transition ${view === "board" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => switchView("list")}
              title="List view"
              className={`grid h-8 w-8 place-items-center rounded-[10px] transition ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowNewDeal(true)}
            className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Deal
          </button>
        </div>
      </div>

      {view === "board" ? (
        <BoardView
          deals={deals}
          onOpen={(d) => setSelectedDeal(d)}
          onStage={(id, stage) => {
            setStage(id, stage);
            const d = deals.find((x) => x.id === id);
            toast.success(`${d?.brandName || "Deal"} → ${stageInfo(stage).label}`);
          }}
        />
      ) : (
        <>
          {/* Stage tabs */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            <StageTab label="All" count={deals.length} active={activeStage === "all"} onClick={() => setActiveStage("all")} color="" />
            {DEAL_STAGES.map((s) => (
              <StageTab
                key={s.key}
                label={s.label}
                count={stageCounts[s.key] || 0}
                active={activeStage === s.key}
                onClick={() => setActiveStage(s.key)}
                color={s.color}
              />
            ))}
          </div>

          {/* Deal cards */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Tag className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No deals in this stage</p>
              <button
                onClick={() => setShowNewDeal(true)}
                className="mt-3 rounded-xl border border-dashed border-border px-4 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                + Add your first brand deal
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onOpen={() => setSelectedDeal(deal)}
                  onDelete={() => deleteDeal(deal.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* New Deal modal */}
      {showNewDeal && (
        <NewDealModal
          onClose={() => setShowNewDeal(false)}
          onSave={(data) => {
            addDeal(data);
            setShowNewDeal(false);
          }}
        />
      )}

      {/* Deal Detail panel */}
      {selectedDealLive && (
        <DealPanel deal={selectedDealLive} onClose={() => setSelectedDeal(null)} />
      )}
    </div>
  );
}

// ── Stage Tab ─────────────────────────────────────────────────────────────────

function StageTab({ label, count, active, onClick, color }: {
  label: string; count: number; active: boolean; onClick: () => void; color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors " +
        (active ? "gradient-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-muted")
      }
    >
      {label}
      {count > 0 && (
        <span className={active ? "opacity-70" : "rounded-full bg-muted px-1.5"}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Kanban Board ──────────────────────────────────────────────────────────────

function BoardView({ deals, onOpen, onStage }: {
  deals: BrandDeal[];
  onOpen: (d: BrandDeal) => void;
  onStage: (id: string, stage: DealStage) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);

  const byStage = useMemo(() => {
    const m: Record<string, BrandDeal[]> = {};
    for (const s of DEAL_STAGES) m[s.key] = [];
    for (const d of deals) (m[d.stage] ??= []).push(d);
    return m;
  }, [deals]);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
      <div className="flex min-w-max gap-3">
        {DEAL_STAGES.map((s) => {
          const col = byStage[s.key] || [];
          const colValue = col.reduce((a, d) => a + dealValue(d), 0);
          const isOver = overStage === s.key;
          return (
            <div
              key={s.key}
              onDragOver={(e) => { e.preventDefault(); setOverStage(s.key); }}
              onDragLeave={() => setOverStage((cur) => (cur === s.key ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                setOverStage(null);
                if (dragId) onStage(dragId, s.key);
                setDragId(null);
              }}
              className={`flex w-[280px] shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors ${isOver ? "border-primary bg-primary/5" : "border-transparent"}`}
            >
              <div className="flex items-center justify-between px-3 pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.color}`}>{s.label}</span>
                  <span className="text-[11px] text-muted-foreground">{col.length}</span>
                </div>
                {colValue > 0 && <span className="text-[11px] font-medium text-muted-foreground">{inr(colValue)}</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-2 min-h-[120px]">
                {col.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => { setDragId(d.id); e.dataTransfer.effectAllowed = "move"; }}
                    onDragEnd={() => { setDragId(null); setOverStage(null); }}
                    onClick={() => onOpen(d)}
                    className={`group cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md ${dragId === d.id ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold leading-tight">{d.brandName}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{d.category}</div>
                        {d.contactName && (
                          <div className="mt-1.5 truncate text-[11px] text-muted-foreground">👤 {d.contactName}</div>
                        )}
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{d.items.length} media</span>
                          {dealValue(d) > 0 && <span className="text-[11px] font-semibold">{inr(dealValue(d))}</span>}
                        </div>
                        {d.nextFollowUp && (
                          <div className={`mt-1.5 flex items-center gap-1 text-[10px] ${new Date(d.nextFollowUp) <= new Date() ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            <Calendar className="h-3 w-3" /> {formatDate(d.nextFollowUp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {col.length === 0 && (
                  <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border/60 py-6 text-[11px] text-muted-foreground/50">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────

function DealCard({ deal, onOpen, onDelete }: {
  deal: BrandDeal; onOpen: () => void; onDelete: () => void;
}) {
  const { setStage } = useBrandDeals();
  const si = stageInfo(deal.stage);
  const value = dealValue(deal);
  const stageIdx = DEAL_STAGES.findIndex((s) => s.key === deal.stage);
  const nextStage = deal.stage !== "live" && deal.stage !== "lost"
    ? DEAL_STAGES[stageIdx + 1]
    : null;
  const followUpDue = deal.nextFollowUp && deal.nextFollowUp <= new Date().toISOString().slice(0, 10);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold leading-tight">{deal.brandName}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{deal.category}</div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${si.color}`}>
          {si.label}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {deal.contactName && (
          <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{deal.contactName}</div>
        )}
        {deal.targetCities.length > 0 && (
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{deal.targetCities.slice(0, 3).join(", ")}</div>
        )}
        {deal.nextFollowUp && (
          <div className={`flex items-center gap-1.5 ${followUpDue ? "text-destructive font-medium" : ""}`}>
            <Calendar className="h-3 w-3" />
            Follow-up {formatDate(deal.nextFollowUp)}
            {followUpDue && " ⚠️"}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{deal.items.length} media items</div>
          {value > 0 && <div className="text-sm font-semibold text-primary">{inr(value)}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {nextStage && (
            <button
              onClick={(e) => { e.stopPropagation(); setStage(deal.id, nextStage.key); }}
              className="rounded-lg border border-border px-2 py-1 text-[10px] hover:bg-muted"
              title={`Move to ${nextStage.label}`}
            >
              → {nextStage.label}
            </button>
          )}
          <button
            onClick={onOpen}
            className="rounded-lg border border-border px-2 py-1 text-[10px] hover:bg-muted"
          >
            Open
          </button>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); if (confirm("Delete this deal?")) onDelete(); }}
        className="absolute right-3 top-3 hidden rounded-lg p-1 text-muted-foreground hover:text-destructive group-hover:flex"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Deal Panel (full detail) ──────────────────────────────────────────────────

function DealPanel({ deal, onClose }: { deal: BrandDeal; onClose: () => void }) {
  const { updateDeal, setStage, addItem, updateItem, deleteItem } = useBrandDeals();
  const sites = useInventory((s) => s.sites);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const si = stageInfo(deal.stage);
  const stageIdx = DEAL_STAGES.findIndex((s) => s.key === deal.stage);
  const value = dealValue(deal);

  // Group items by media group
  const itemsByGroup = useMemo(() => {
    const g: Record<string, MediaPlanItem[]> = {};
    for (const item of deal.items) {
      const grp = mediaGroup(item.mediaType);
      (g[grp] = g[grp] || []).push(item);
    }
    return g;
  }, [deal.items]);

  function startEdit(field: string, current: string) {
    setEditingField(field);
    setEditVal(current);
  }

  function saveEdit(field: string) {
    updateDeal(deal.id, { [field]: editVal } as Partial<BrandDeal>);
    setEditingField(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="flex w-full max-w-2xl flex-col overflow-hidden bg-background shadow-2xl md:rounded-l-3xl">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground font-bold text-sm">
              {deal.brandName[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{deal.brandName}</div>
              <div className="text-xs text-muted-foreground">{deal.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${si.color}`}>{si.label}</span>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Stage progression */}
          <div className="border-b border-border bg-card/50 px-5 py-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {DEAL_STAGES.filter((s) => s.key !== "lost").map((s, i) => {
                const idx = DEAL_STAGES.findIndex((x) => x.key === deal.stage);
                const done = i < idx;
                const current = s.key === deal.stage;
                return (
                  <div key={s.key} className="flex items-center gap-1">
                    <button
                      onClick={() => setStage(deal.id, s.key)}
                      className={
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors " +
                        (current ? "gradient-primary text-primary-foreground" :
                          done ? "bg-success/20 text-success-foreground" :
                          "border border-border text-muted-foreground hover:bg-muted")
                      }
                    >
                      {done && "✓ "}{s.label}
                    </button>
                    {i < DEAL_STAGES.length - 2 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                  </div>
                );
              })}
              <button
                onClick={() => setStage(deal.id, "lost")}
                className={`ml-auto shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${deal.stage === "lost" ? "bg-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"}`}
              >
                Lost
              </button>
            </div>
          </div>

          <div className="space-y-5 p-5">
            {/* Brief */}
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Brief</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <InfoRow label="Contact" icon={<Building2 className="h-3 w-3" />} value={deal.contactName} field="contactName" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
                <InfoRow label="Phone" icon={<Phone className="h-3 w-3" />} value={deal.contactPhone || "—"} field="contactPhone" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
                <InfoRow label="Email" icon={<Mail className="h-3 w-3" />} value={deal.contactEmail || "—"} field="contactEmail" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
                <InfoRow label="Budget" icon={<IndianRupee className="h-3 w-3" />} value={deal.totalBudget > 0 ? inr(deal.totalBudget) : "—"} field="totalBudget" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
                <InfoRow label="Duration" icon={<Calendar className="h-3 w-3" />} value={deal.durationMonths > 0 ? `${deal.durationMonths} months` : "—"} field="durationMonths" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
                <InfoRow label="Follow-up" icon={<AlertCircle className="h-3 w-3" />} value={deal.nextFollowUp || "—"} field="nextFollowUp" onEdit={startEdit} editing={editingField} editVal={editVal} setEditVal={setEditVal} onSave={saveEdit} />
              </div>
              {deal.targetCities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">Cities:</span>
                  {deal.targetCities.map((c) => (
                    <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs">{c}</span>
                  ))}
                </div>
              )}
              {deal.objective && (
                <div className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Objective:</span> {deal.objective}
                </div>
              )}
              {deal.targetAudience && (
                <div className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Audience:</span> {deal.targetAudience}
                </div>
              )}
            </section>

            {/* Media Plan */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Media Plan · {deal.items.length} items
                  {value > 0 && <span className="ml-2 normal-case text-primary font-bold">{inr(value)}</span>}
                </h3>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3 w-3" /> Add Media
                </button>
              </div>

              {deal.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No media items yet</p>
                  <p className="text-[11px] text-muted-foreground/60">Add newspapers, hoardings, radio spots, events…</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(itemsByGroup).map(([grp, items]) => (
                    <div key={grp}>
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{grp}</div>
                      <div className="overflow-hidden rounded-xl border border-border">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground">
                              <th className="px-3 py-2 text-left">Media / Description</th>
                              <th className="px-3 py-2 text-left">City</th>
                              <th className="px-3 py-2 text-right">Units</th>
                              <th className="px-3 py-2 text-right">Rate/mo</th>
                              <th className="px-3 py-2 text-right">Total</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="w-8 px-2 py-2" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {items.map((item) => (
                              <tr key={item.id} className="hover:bg-muted/30">
                                <td className="px-3 py-2">
                                  <div className="font-medium">{item.mediaType}</div>
                                  {item.description && <div className="text-muted-foreground">{item.description}</div>}
                                  {item.partner && <div className="text-muted-foreground/70">{item.partner}</div>}
                                  {item.siteId && (
                                    <div className="text-primary/70 text-[10px]">
                                      {sites.find((s) => s.id === item.siteId)?.code}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{item.city}</td>
                                <td className="px-3 py-2 text-right">{item.units}×{item.durationMonths}mo</td>
                                <td className="px-3 py-2 text-right">{inr(item.ratePerUnit)}</td>
                                <td className="px-3 py-2 text-right font-medium">{inr(item.units * item.ratePerUnit * item.durationMonths)}</td>
                                <td className="px-3 py-2">
                                  <select
                                    value={item.status}
                                    onChange={(e) => updateItem(deal.id, item.id, { status: e.target.value as MediaPlanItem["status"] })}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium border-0 outline-none cursor-pointer ${ITEM_STATUS_STYLE[item.status]}`}
                                  >
                                    <option value="proposed">Proposed</option>
                                    <option value="approved">Approved</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() => { if (confirm("Remove this item?")) deleteItem(deal.id, item.id); }}
                                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t border-border bg-muted/30">
                              <td colSpan={4} className="px-3 py-2 text-xs font-medium text-muted-foreground">{grp} total</td>
                              <td className="px-3 py-2 text-right text-xs font-bold">
                                {inr(items.reduce((a, i) => a + i.units * i.ratePerUnit * i.durationMonths, 0))}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Notes */}
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
              <textarea
                value={deal.notes || ""}
                onChange={(e) => updateDeal(deal.id, { notes: e.target.value })}
                placeholder="Campaign notes, special requirements, history…"
                className="h-20 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </section>
          </div>
        </div>

        {/* Add media item modal */}
        {showAddItem && (
          <AddItemModal
            deal={deal}
            sites={sites.filter((s) => s.status === "free" || s.status === "hold")}
            onClose={() => setShowAddItem(false)}
            onSave={(item) => { addItem(deal.id, item); setShowAddItem(false); }}
          />
        )}
      </div>
    </div>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({ label, icon, value, field, onEdit, editing, editVal, setEditVal, onSave }: {
  label: string; icon: React.ReactNode; value: string; field: string;
  onEdit: (f: string, v: string) => void; editing: string | null;
  editVal: string; setEditVal: (v: string) => void; onSave: (f: string) => void;
}) {
  const isEditing = editing === field;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        {isEditing ? (
          <input
            autoFocus
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(field); if (e.key === "Escape") onSave(field); }}
            className="w-full bg-transparent text-xs outline-none"
          />
        ) : (
          <div className="truncate text-xs font-medium">{value}</div>
        )}
      </div>
      <button
        onClick={() => isEditing ? onSave(field) : onEdit(field, value === "—" ? "" : value)}
        className="text-muted-foreground hover:text-primary"
      >
        {isEditing ? <Check className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
      </button>
    </div>
  );
}

// ── New Deal Modal ────────────────────────────────────────────────────────────

function NewDealModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (d: Omit<BrandDeal, "id" | "items" | "createdAt" | "updatedAt">) => void;
}) {
  const [form, setForm] = useState({
    brandName: "", category: "FMCG", contactName: "", contactEmail: "",
    contactPhone: "", objective: "", targetCities: "", targetAudience: "",
    totalBudget: 0, startDate: "", durationMonths: 3,
    stage: "prospect" as DealStage, nextFollowUp: "", notes: "",
  });

  function f(k: string, v: unknown) { setForm((p) => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">New Brand Deal</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Brand Name *" value={form.brandName} onChange={(v) => f("brandName", v)} placeholder="e.g. Amul, Maruti Suzuki" />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => f("category", e.target.value)} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40">
                {BRAND_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Field label="Contact Name" value={form.contactName} onChange={(v) => f("contactName", v)} placeholder="Marketing Manager name" />
            <Field label="Contact Phone" value={form.contactPhone} onChange={(v) => f("contactPhone", v)} placeholder="+91 98xxx xxxxx" />
            <Field label="Contact Email" value={form.contactEmail} onChange={(v) => f("contactEmail", v)} placeholder="brand@company.com" />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Initial Stage</label>
              <select value={form.stage} onChange={(e) => f("stage", e.target.value)} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40">
                {DEAL_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <Field label="Target Cities (comma-separated)" value={form.targetCities} onChange={(v) => f("targetCities", v)} placeholder="Lucknow, Kanpur, Agra" />
          <Field label="Campaign Objective" value={form.objective} onChange={(v) => f("objective", v)} placeholder="Brand awareness, product launch, festive push…" />
          <Field label="Target Audience" value={form.targetAudience} onChange={(v) => f("targetAudience", v)} placeholder="SEC A-B, 25-45 yrs, urban commuters…" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Total Budget (₹)</label>
              <input type="number" value={form.totalBudget || ""} onChange={(e) => f("totalBudget", Number(e.target.value))} placeholder="0" className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Duration (months)</label>
              <input type="number" value={form.durationMonths} onChange={(e) => f("durationMonths", Number(e.target.value))} min={1} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Follow-up Date</label>
              <input type="date" value={form.nextFollowUp} onChange={(e) => f("nextFollowUp", e.target.value)} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
          </div>
          <Field label="Notes" value={form.notes} onChange={(v) => f("notes", v)} placeholder="How you found them, referral, context…" />
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            disabled={!form.brandName.trim()}
            onClick={() => onSave({
              ...form,
              targetCities: form.targetCities.split(",").map((c) => c.trim()).filter(Boolean),
            })}
            className="rounded-xl gradient-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            Create Deal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Media Item Modal ──────────────────────────────────────────────────────

function AddItemModal({ deal, sites, onClose, onSave }: {
  deal: BrandDeal;
  sites: ReturnType<typeof useInventory.getState>["sites"];
  onClose: () => void;
  onSave: (item: Omit<MediaPlanItem, "id">) => void;
}) {
  const [form, setForm] = useState({
    mediaType: "Hoarding" as MediaType,
    description: "", city: deal.targetCities[0] || "",
    partner: "", units: 1, ratePerUnit: 0,
    durationMonths: deal.durationMonths || 1,
    siteId: "", status: "proposed" as MediaPlanItem["status"], notes: "",
  });

  function f(k: string, v: unknown) { setForm((p) => ({ ...p, [k]: v })); }

  const isOOH = ["Hoarding","Unipole","Wall Wrap","Tree Guard","Highway Media","Bus Shelter","Transit Panel","Mall Display","Society Lift","Multiplex Screen","Airport Terminal","Airport Baggage Belt","Metro Panel","DOOH","Digital Screen"].includes(form.mediaType);
  const total = form.units * form.ratePerUnit * form.durationMonths;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Add Media Item</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Media Type</label>
            <select value={form.mediaType} onChange={(e) => f("mediaType", e.target.value)} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40">
              {Object.entries(MEDIA_GROUPS).map(([grp, types]) => (
                <optgroup key={grp} label={grp}>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {isOOH && sites.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Link to Inventory Site (optional)</label>
              <select value={form.siteId} onChange={(e) => {
                const site = sites.find((s) => s.id === e.target.value);
                f("siteId", e.target.value);
                if (site) { f("city", site.city); f("description", site.name); f("ratePerUnit", site.monthlyRent); }
              }} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40">
                <option value="">No link (manual entry)</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}, {s.city}</option>)}
              </select>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Description / Placement" value={form.description} onChange={(v) => f("description", v)} placeholder="Specific location or name" />
            <Field label="City" value={form.city} onChange={(v) => f("city", v)} placeholder="Lucknow" />
            <Field label="Vendor / Partner" value={form.partner} onChange={(v) => f("partner", v)} placeholder="Media house / partner name" />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Units</label>
              <input type="number" value={form.units} onChange={(e) => f("units", Number(e.target.value))} min={1} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rate / unit / month (₹)</label>
              <input type="number" value={form.ratePerUnit || ""} onChange={(e) => f("ratePerUnit", Number(e.target.value))} placeholder="0" className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Duration (months)</label>
              <input type="number" value={form.durationMonths} onChange={(e) => f("durationMonths", Number(e.target.value))} min={1} className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40" />
            </div>
          </div>

          {total > 0 && (
            <div className="rounded-xl bg-primary/5 px-3 py-2 text-center text-sm font-semibold text-primary">
              Total: {inr(total)}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button
            onClick={() => onSave({ ...form, siteId: form.siteId || undefined })}
            className="rounded-xl gradient-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
      />
    </div>
  );
}
