import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { B as IndianRupee, D as PenLine, E as Phone, F as List, K as FileText, L as LayoutGrid, M as Mail, T as Plus, U as GripVertical, ct as Calendar, d as Trash2, it as ChevronRight, j as MapPin, n as X, nt as CircleAlert, ot as Check, p as Tag, ut as Building2 } from "../_libs/lucide-react.mjs";
import { r as toast } from "./Toaster-UBdYQFLf.mjs";
import { S as useInventory, a as dealValue, l as inr, n as MEDIA_GROUPS, s as formatDate, t as DEAL_STAGES, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brands-BmRuYcZ2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BRAND_CATEGORIES = [
	"FMCG",
	"Auto",
	"Telecom",
	"Fintech",
	"Real Estate",
	"Ed-Tech",
	"Food & QSR",
	"Healthcare",
	"Pharma",
	"Insurance",
	"Banking",
	"Retail",
	"E-Commerce",
	"OTT",
	"Beauty",
	"Jewellery",
	"Clothing",
	"Electronics",
	"Hospitality",
	"Events",
	"Other"
];
var ITEM_STATUS_STYLE = {
	proposed: "bg-muted text-muted-foreground",
	approved: "bg-green-100 text-green-800",
	on_hold: "bg-amber-100 text-amber-800",
	rejected: "bg-red-100 text-red-800"
};
function stageInfo(stage) {
	return DEAL_STAGES.find((s) => s.key === stage) ?? DEAL_STAGES[0];
}
function mediaGroup(type) {
	return Object.entries(MEDIA_GROUPS).find(([, types]) => types.includes(type))?.[0] ?? "Other";
}
function BrandsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandPipeline, {}) });
}
function BrandPipeline() {
	const { deals, addDeal, setStage, deleteDeal } = useBrandDeals();
	const [activeStage, setActiveStage] = (0, import_react.useState)("all");
	const [selectedDeal, setSelectedDeal] = (0, import_react.useState)(null);
	const [showNewDeal, setShowNewDeal] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("atlas-pipeline-view") || "board";
		} catch {
			return "board";
		}
	});
	function switchView(v) {
		setView(v);
		try {
			localStorage.setItem("atlas-pipeline-view", v);
		} catch {}
	}
	const filtered = (0, import_react.useMemo)(() => activeStage === "all" ? deals : deals.filter((d) => d.stage === activeStage), [deals, activeStage]);
	const selectedDealLive = selectedDeal ? deals.find((d) => d.id === selectedDeal.id) ?? null : null;
	const pipelineValue = deals.filter((d) => !["lost"].includes(d.stage)).reduce((a, d) => a + dealValue(d), 0);
	const stageCounts = (0, import_react.useMemo)(() => {
		const c = {};
		for (const d of deals) c[d.stage] = (c[d.stage] || 0) + 1;
		return c;
	}, [deals]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `mx-auto p-4 md:p-6 ${view === "board" ? "max-w-none" : "max-w-6xl"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold",
						children: "Brand Pipeline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							deals.length,
							" brands · Pipeline ",
							inr(pipelineValue)
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-xl border border-border bg-background p-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => switchView("board"),
							title: "Board view",
							className: `grid h-8 w-8 place-items-center rounded-[10px] transition ${view === "board" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => switchView("list"),
							title: "List view",
							className: `grid h-8 w-8 place-items-center rounded-[10px] transition ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowNewDeal(true),
						className: "flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New Deal"]
					})]
				})]
			}),
			view === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardView, {
				deals,
				onOpen: (d) => setSelectedDeal(d),
				onStage: (id, stage) => {
					setStage(id, stage);
					const d = deals.find((x) => x.id === id);
					toast.success(`${d?.brandName || "Deal"} → ${stageInfo(stage).label}`);
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageTab, {
					label: "All",
					count: deals.length,
					active: activeStage === "all",
					onClick: () => setActiveStage("all"),
					color: ""
				}), DEAL_STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageTab, {
					label: s.label,
					count: stageCounts[s.key] || 0,
					active: activeStage === s.key,
					onClick: () => setActiveStage(s.key),
					color: s.color
				}, s.key))]
			}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-20 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "mb-3 h-10 w-10 text-muted-foreground/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No deals in this stage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowNewDeal(true),
						className: "mt-3 rounded-xl border border-dashed border-border px-4 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary",
						children: "+ Add your first brand deal"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: filtered.map((deal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealCard, {
					deal,
					onOpen: () => setSelectedDeal(deal),
					onDelete: () => deleteDeal(deal.id)
				}, deal.id))
			})] }),
			showNewDeal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewDealModal, {
				onClose: () => setShowNewDeal(false),
				onSave: (data) => {
					addDeal(data);
					setShowNewDeal(false);
				}
			}),
			selectedDealLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DealPanel, {
				deal: selectedDealLive,
				onClose: () => setSelectedDeal(null)
			})
		]
	});
}
function StageTab({ label, count, active, onClick, color }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors " + (active ? "gradient-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-muted"),
		children: [label, count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: active ? "opacity-70" : "rounded-full bg-muted px-1.5",
			children: count
		})]
	});
}
function BoardView({ deals, onOpen, onStage }) {
	const [dragId, setDragId] = (0, import_react.useState)(null);
	const [overStage, setOverStage] = (0, import_react.useState)(null);
	const byStage = (0, import_react.useMemo)(() => {
		const m = {};
		for (const s of DEAL_STAGES) m[s.key] = [];
		for (const d of deals) (m[d.stage] ??= []).push(d);
		return m;
	}, [deals]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "-mx-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-w-max gap-3",
			children: DEAL_STAGES.map((s) => {
				const col = byStage[s.key] || [];
				const colValue = col.reduce((a, d) => a + dealValue(d), 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onDragOver: (e) => {
						e.preventDefault();
						setOverStage(s.key);
					},
					onDragLeave: () => setOverStage((cur) => cur === s.key ? null : cur),
					onDrop: (e) => {
						e.preventDefault();
						setOverStage(null);
						if (dragId) onStage(dragId, s.key);
						setDragId(null);
					},
					className: `flex w-[280px] shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors ${overStage === s.key ? "border-primary bg-primary/5" : "border-transparent"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-3 pb-2 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[11px] font-medium ${s.color}`,
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground",
								children: col.length
							})]
						}), colValue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium text-muted-foreground",
							children: inr(colValue)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col gap-2 px-2 pb-2 min-h-[120px]",
						children: [col.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							draggable: true,
							onDragStart: (e) => {
								setDragId(d.id);
								e.dataTransfer.effectAllowed = "move";
							},
							onDragEnd: () => {
								setDragId(null);
								setOverStage(null);
							},
							onClick: () => onOpen(d),
							className: `group cursor-pointer rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md ${dragId === d.id ? "opacity-40" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-semibold leading-tight",
											children: d.brandName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 text-[11px] text-muted-foreground",
											children: d.category
										}),
										d.contactName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1.5 truncate text-[11px] text-muted-foreground",
											children: ["👤 ", d.contactName]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-1.5 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] text-muted-foreground",
												children: [d.items.length, " media"]
											}), dealValue(d) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-semibold",
												children: inr(dealValue(d))
											})]
										}),
										d.nextFollowUp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `mt-1.5 flex items-center gap-1 text-[10px] ${new Date(d.nextFollowUp) <= /* @__PURE__ */ new Date() ? "text-destructive font-medium" : "text-muted-foreground"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }),
												" ",
												formatDate(d.nextFollowUp)
											]
										})
									]
								})]
							})
						}, d.id)), col.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid flex-1 place-items-center rounded-xl border border-dashed border-border/60 py-6 text-[11px] text-muted-foreground/50",
							children: "Drop here"
						})]
					})]
				}, s.key);
			})
		})
	});
}
function DealCard({ deal, onOpen, onDelete }) {
	const { setStage } = useBrandDeals();
	const si = stageInfo(deal.stage);
	const value = dealValue(deal);
	const stageIdx = DEAL_STAGES.findIndex((s) => s.key === deal.stage);
	const nextStage = deal.stage !== "live" && deal.stage !== "lost" ? DEAL_STAGES[stageIdx + 1] : null;
	const followUpDue = deal.nextFollowUp && deal.nextFollowUp <= (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold leading-tight",
					children: deal.brandName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: deal.category
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${si.color}`,
					children: si.label
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-1 text-xs text-muted-foreground",
				children: [
					deal.contactName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }), deal.contactName]
					}),
					deal.targetCities.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), deal.targetCities.slice(0, 3).join(", ")]
					}),
					deal.nextFollowUp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `flex items-center gap-1.5 ${followUpDue ? "text-destructive font-medium" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }),
							"Follow-up ",
							formatDate(deal.nextFollowUp),
							followUpDue && " ⚠️"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [deal.items.length, " media items"]
				}), value > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold text-primary",
					children: inr(value)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [nextStage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: (e) => {
							e.stopPropagation();
							setStage(deal.id, nextStage.key);
						},
						className: "rounded-lg border border-border px-2 py-1 text-[10px] hover:bg-muted",
						title: `Move to ${nextStage.label}`,
						children: ["→ ", nextStage.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onOpen,
						className: "rounded-lg border border-border px-2 py-1 text-[10px] hover:bg-muted",
						children: "Open"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: (e) => {
					e.stopPropagation();
					if (confirm("Delete this deal?")) onDelete();
				},
				className: "absolute right-3 top-3 hidden rounded-lg p-1 text-muted-foreground hover:text-destructive group-hover:flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
			})
		]
	});
}
function DealPanel({ deal, onClose }) {
	const { updateDeal, setStage, addItem, updateItem, deleteItem } = useBrandDeals();
	const sites = useInventory((s) => s.sites);
	const [showAddItem, setShowAddItem] = (0, import_react.useState)(false);
	const [editingField, setEditingField] = (0, import_react.useState)(null);
	const [editVal, setEditVal] = (0, import_react.useState)("");
	const si = stageInfo(deal.stage);
	DEAL_STAGES.findIndex((s) => s.key === deal.stage);
	const value = dealValue(deal);
	const itemsByGroup = (0, import_react.useMemo)(() => {
		const g = {};
		for (const item of deal.items) {
			const grp = mediaGroup(item.mediaType);
			(g[grp] = g[grp] || []).push(item);
		}
		return g;
	}, [deal.items]);
	function startEdit(field, current) {
		setEditingField(field);
		setEditVal(current);
	}
	function saveEdit(field) {
		updateDeal(deal.id, { [field]: editVal });
		setEditingField(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 bg-black/40 backdrop-blur-sm",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-2xl flex-col overflow-hidden bg-background shadow-2xl md:rounded-l-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border bg-card px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground font-bold text-sm",
							children: deal.brandName[0].toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold",
							children: deal.brandName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: deal.category
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `rounded-full px-2.5 py-1 text-xs font-medium ${si.color}`,
							children: si.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "grid h-8 w-8 place-items-center rounded-xl hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-b border-border bg-card/50 px-5 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 overflow-x-auto",
							children: [DEAL_STAGES.filter((s) => s.key !== "lost").map((s, i) => {
								const done = i < DEAL_STAGES.findIndex((x) => x.key === deal.stage);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setStage(deal.id, s.key),
										className: "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors " + (s.key === deal.stage ? "gradient-primary text-primary-foreground" : done ? "bg-success/20 text-success-foreground" : "border border-border text-muted-foreground hover:bg-muted"),
										children: [done && "✓ ", s.label]
									}), i < DEAL_STAGES.length - 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3 shrink-0 text-muted-foreground/40" })]
								}, s.key);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStage(deal.id, "lost"),
								className: `ml-auto shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${deal.stage === "lost" ? "bg-destructive text-destructive-foreground" : "border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"}`,
								children: "Lost"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5 p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Brand Brief"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Contact",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3" }),
											value: deal.contactName,
											field: "contactName",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Phone",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
											value: deal.contactPhone || "—",
											field: "contactPhone",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Email",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3 w-3" }),
											value: deal.contactEmail || "—",
											field: "contactEmail",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Budget",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IndianRupee, { className: "h-3 w-3" }),
											value: deal.totalBudget > 0 ? inr(deal.totalBudget) : "—",
											field: "totalBudget",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Duration",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }),
											value: deal.durationMonths > 0 ? `${deal.durationMonths} months` : "—",
											field: "durationMonths",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
											label: "Follow-up",
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3" }),
											value: deal.nextFollowUp || "—",
											field: "nextFollowUp",
											onEdit: startEdit,
											editing: editingField,
											editVal,
											setEditVal,
											onSave: saveEdit
										})
									]
								}),
								deal.targetCities.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Cities:"
									}), deal.targetCities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-muted px-2 py-0.5 text-xs",
										children: c
									}, c))]
								}),
								deal.objective && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Objective:"
										}),
										" ",
										deal.objective
									]
								}),
								deal.targetAudience && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Audience:"
										}),
										" ",
										deal.targetAudience
									]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: [
										"Media Plan · ",
										deal.items.length,
										" items",
										value > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 normal-case text-primary font-bold",
											children: inr(value)
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setShowAddItem(true),
									className: "flex items-center gap-1 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add Media"]
								})]
							}), deal.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mb-2 h-8 w-8 text-muted-foreground/30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "No media items yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground/60",
										children: "Add newspapers, hoardings, radio spots, events…"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: Object.entries(itemsByGroup).map(([grp, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: grp
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-hidden rounded-xl border border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b border-border bg-muted/50 text-[10px] text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-left",
														children: "Media / Description"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-left",
														children: "City"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-right",
														children: "Units"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-right",
														children: "Rate/mo"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-right",
														children: "Total"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-3 py-2 text-left",
														children: "Status"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8 px-2 py-2" })
												]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-border",
												children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "hover:bg-muted/30",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "px-3 py-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "font-medium",
																	children: item.mediaType
																}),
																item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-muted-foreground",
																	children: item.description
																}),
																item.partner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-muted-foreground/70",
																	children: item.partner
																}),
																item.siteId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "text-primary/70 text-[10px]",
																	children: sites.find((s) => s.id === item.siteId)?.code
																})
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-2 text-muted-foreground",
															children: item.city
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "px-3 py-2 text-right",
															children: [
																item.units,
																"×",
																item.durationMonths,
																"mo"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-2 text-right",
															children: inr(item.ratePerUnit)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-2 text-right font-medium",
															children: inr(item.units * item.ratePerUnit * item.durationMonths)
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
																value: item.status,
																onChange: (e) => updateItem(deal.id, item.id, { status: e.target.value }),
																className: `rounded-full px-2 py-0.5 text-[10px] font-medium border-0 outline-none cursor-pointer ${ITEM_STATUS_STYLE[item.status]}`,
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																		value: "proposed",
																		children: "Proposed"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																		value: "approved",
																		children: "Approved"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																		value: "on_hold",
																		children: "On Hold"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																		value: "rejected",
																		children: "Rejected"
																	})
																]
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => {
																	if (confirm("Remove this item?")) deleteItem(deal.id, item.id);
																},
																className: "rounded p-1 text-muted-foreground hover:text-destructive",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
															})
														})
													]
												}, item.id))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-border bg-muted/30",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														colSpan: 4,
														className: "px-3 py-2 text-xs font-medium text-muted-foreground",
														children: [grp, " total"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-3 py-2 text-right text-xs font-bold",
														children: inr(items.reduce((a, i) => a + i.units * i.ratePerUnit * i.durationMonths, 0))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 2 })
												]
											}) })
										]
									})
								})] }, grp))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: deal.notes || "",
								onChange: (e) => updateDeal(deal.id, { notes: e.target.value }),
								placeholder: "Campaign notes, special requirements, history…",
								className: "h-20 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
							})] })
						]
					})]
				}),
				showAddItem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddItemModal, {
					deal,
					sites: sites.filter((s) => s.status === "free" || s.status === "hold"),
					onClose: () => setShowAddItem(false),
					onSave: (item) => {
						addItem(deal.id, item);
						setShowAddItem(false);
					}
				})
			]
		})]
	});
}
function InfoRow({ label, icon, value, field, onEdit, editing, editVal, setEditVal, onSave }) {
	const isEditing = editing === field;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] text-muted-foreground",
					children: label
				}), isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					autoFocus: true,
					value: editVal,
					onChange: (e) => setEditVal(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") onSave(field);
						if (e.key === "Escape") onSave(field);
					},
					className: "w-full bg-transparent text-xs outline-none"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-xs font-medium",
					children: value
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => isEditing ? onSave(field) : onEdit(field, value === "—" ? "" : value),
				className: "text-muted-foreground hover:text-primary",
				children: isEditing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "h-3 w-3" })
			})
		]
	});
}
function NewDealModal({ onClose, onSave }) {
	const [form, setForm] = (0, import_react.useState)({
		brandName: "",
		category: "FMCG",
		contactName: "",
		contactEmail: "",
		contactPhone: "",
		objective: "",
		targetCities: "",
		targetAudience: "",
		totalBudget: 0,
		startDate: "",
		durationMonths: 3,
		stage: "prospect",
		nextFollowUp: "",
		notes: ""
	});
	function f(k, v) {
		setForm((p) => ({
			...p,
			[k]: v
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "New Brand Deal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid h-8 w-8 place-items-center rounded-xl hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[70vh] overflow-y-auto p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Brand Name *",
									value: form.brandName,
									onChange: (v) => f("brandName", v),
									placeholder: "e.g. Amul, Maruti Suzuki"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: form.category,
									onChange: (e) => f("category", e.target.value),
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40",
									children: BRAND_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact Name",
									value: form.contactName,
									onChange: (v) => f("contactName", v),
									placeholder: "Marketing Manager name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact Phone",
									value: form.contactPhone,
									onChange: (v) => f("contactPhone", v),
									placeholder: "+91 98xxx xxxxx"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Contact Email",
									value: form.contactEmail,
									onChange: (v) => f("contactEmail", v),
									placeholder: "brand@company.com"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Initial Stage"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: form.stage,
									onChange: (e) => f("stage", e.target.value),
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40",
									children: DEAL_STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: s.key,
										children: s.label
									}, s.key))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Target Cities (comma-separated)",
							value: form.targetCities,
							onChange: (v) => f("targetCities", v),
							placeholder: "Lucknow, Kanpur, Agra"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Campaign Objective",
							value: form.objective,
							onChange: (v) => f("objective", v),
							placeholder: "Brand awareness, product launch, festive push…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Target Audience",
							value: form.targetAudience,
							onChange: (v) => f("targetAudience", v),
							placeholder: "SEC A-B, 25-45 yrs, urban commuters…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Total Budget (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: form.totalBudget || "",
									onChange: (e) => f("totalBudget", Number(e.target.value)),
									placeholder: "0",
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Duration (months)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: form.durationMonths,
									onChange: (e) => f("durationMonths", Number(e.target.value)),
									min: 1,
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Follow-up Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: form.nextFollowUp,
									onChange: (e) => f("nextFollowUp", e.target.value),
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Notes",
							value: form.notes,
							onChange: (v) => f("notes", v),
							placeholder: "How you found them, referral, context…"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 border-t border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !form.brandName.trim(),
						onClick: () => onSave({
							...form,
							targetCities: form.targetCities.split(",").map((c) => c.trim()).filter(Boolean)
						}),
						className: "rounded-xl gradient-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50",
						children: "Create Deal"
					})]
				})
			]
		})]
	});
}
function AddItemModal({ deal, sites, onClose, onSave }) {
	const [form, setForm] = (0, import_react.useState)({
		mediaType: "Hoarding",
		description: "",
		city: deal.targetCities[0] || "",
		partner: "",
		units: 1,
		ratePerUnit: 0,
		durationMonths: deal.durationMonths || 1,
		siteId: "",
		status: "proposed",
		notes: ""
	});
	function f(k, v) {
		setForm((p) => ({
			...p,
			[k]: v
		}));
	}
	const isOOH = [
		"Hoarding",
		"Unipole",
		"Wall Wrap",
		"Tree Guard",
		"Highway Media",
		"Bus Shelter",
		"Transit Panel",
		"Mall Display",
		"Society Lift",
		"Multiplex Screen",
		"Airport Terminal",
		"Airport Baggage Belt",
		"Metro Panel",
		"DOOH",
		"Digital Screen"
	].includes(form.mediaType);
	const total = form.units * form.ratePerUnit * form.durationMonths;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-black/50",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Add Media Item"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "grid h-8 w-8 place-items-center rounded-xl hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[65vh] overflow-y-auto p-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-medium text-muted-foreground",
							children: "Media Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: form.mediaType,
							onChange: (e) => f("mediaType", e.target.value),
							className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40",
							children: Object.entries(MEDIA_GROUPS).map(([grp, types]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
								label: grp,
								children: types.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
							}, grp))
						})] }),
						isOOH && sites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-medium text-muted-foreground",
							children: "Link to Inventory Site (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.siteId,
							onChange: (e) => {
								const site = sites.find((s) => s.id === e.target.value);
								f("siteId", e.target.value);
								if (site) {
									f("city", site.city);
									f("description", site.name);
									f("ratePerUnit", site.monthlyRent);
								}
							},
							className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "No link (manual entry)"
							}), sites.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s.id,
								children: [
									s.code,
									" — ",
									s.name,
									", ",
									s.city
								]
							}, s.id))]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Description / Placement",
									value: form.description,
									onChange: (v) => f("description", v),
									placeholder: "Specific location or name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "City",
									value: form.city,
									onChange: (v) => f("city", v),
									placeholder: "Lucknow"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Vendor / Partner",
									value: form.partner,
									onChange: (v) => f("partner", v),
									placeholder: "Media house / partner name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Units"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: form.units,
									onChange: (e) => f("units", Number(e.target.value)),
									min: 1,
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Rate / unit / month (₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: form.ratePerUnit || "",
									onChange: (e) => f("ratePerUnit", Number(e.target.value)),
									placeholder: "0",
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "mb-1.5 block text-xs font-medium text-muted-foreground",
									children: "Duration (months)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: form.durationMonths,
									onChange: (e) => f("durationMonths", Number(e.target.value)),
									min: 1,
									className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
								})] })
							]
						}),
						total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-primary/5 px-3 py-2 text-center text-sm font-semibold text-primary",
							children: ["Total: ", inr(total)]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 border-t border-border px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onSave({
							...form,
							siteId: form.siteId || void 0
						}),
						className: "rounded-xl gradient-primary px-4 py-2 text-sm text-primary-foreground",
						children: "Add Item"
					})]
				})
			]
		})]
	});
}
function Field({ label, value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: "mb-1.5 block text-xs font-medium text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		value,
		onChange: (e) => onChange(e.target.value),
		placeholder,
		className: "h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/40"
	})] });
}
//#endregion
export { BrandsPage as component };
