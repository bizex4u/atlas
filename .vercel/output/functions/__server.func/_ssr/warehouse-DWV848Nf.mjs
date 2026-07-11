import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { H as History, O as Package, T as Plus, _t as ArrowDownToLine, a as Warehouse, c as TriangleAlert, d as Trash2, ht as ArrowUpFromLine, l as TrendingUp, u as TrendingDown, x as Search } from "../_libs/lucide-react.mjs";
import { r as toast } from "./Toaster-UBdYQFLf.mjs";
import { T as useWarehouse, f as itemStock, l as inr, s as formatDate } from "./sync-BlerjOYi.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { n as Modal, r as inputCls, t as Field } from "./ui-DZC8LrNE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/warehouse-DWV848Nf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Electronics",
	"Appliances",
	"FMCG",
	"Apparel",
	"Furniture",
	"Beauty",
	"Toys",
	"Other"
];
/** Average monthly outflow over the item's movement history (absolute units/month). */
function monthlyVelocity(item) {
	const outs = item.movements.filter((m) => m.qty < 0);
	if (!outs.length) return 0;
	const dates = item.movements.map((m) => new Date(m.date).getTime());
	const spanMonths = Math.max((Math.max(...dates) - Math.min(...dates)) / (30 * 864e5), 1);
	return outs.reduce((a, m) => a - m.qty, 0) / spanMonths;
}
function WarehousePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseContent, {}) });
}
function WarehouseContent() {
	const { items, addItem, deleteItem, move } = useWarehouse();
	const [q, setQ] = (0, import_react.useState)("");
	const [showAdd, setShowAdd] = (0, import_react.useState)(false);
	const [moveItem, setMoveItem] = (0, import_react.useState)(null);
	const [historyItem, setHistoryItem] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.toLowerCase();
		return items.filter((i) => !term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term) || i.category.toLowerCase().includes(term));
	}, [items, q]);
	const totalValue = items.reduce((a, i) => a + itemStock(i) * i.unitValue, 0);
	const totalUnits = items.reduce((a, i) => a + itemStock(i), 0);
	const lowStock = items.filter((i) => {
		const v = monthlyVelocity(i);
		return v > 0 && itemStock(i) / v < 1;
	});
	const historyLive = historyItem ? items.find((i) => i.id === historyItem.id) ?? null : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold",
						children: "Warehouse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Barter goods · ",
							items.length,
							" SKUs · ",
							totalUnits,
							" units · ",
							inr(totalValue),
							" stock value"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowAdd(true),
					className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New SKU"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Stock value"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-2xl font-semibold",
							children: inr(totalValue)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Total units"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-2xl font-semibold",
							children: totalUnits
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-2xl border p-4 shadow-card ${lowStock.length ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "border-border bg-card"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: "Low cover (<1 month)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center gap-2 text-2xl font-semibold",
							children: [lowStock.length, lowStock.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-4 max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search SKU, name, category…",
					className: "h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/40"
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-dashed border-border p-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mx-auto h-10 w-10 text-muted-foreground/30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "No stock yet. Add SKUs you receive through barter deals."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-2xl border border-border bg-card shadow-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border text-left text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium",
								children: "SKU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium",
								children: "Item"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium text-right",
								children: "Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium text-right",
								children: "Unit ₹"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium text-right",
								children: "Value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium text-right",
								children: "Out/mo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium",
								children: "Cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2.5 font-medium",
								children: "Trend"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-2.5" })
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border",
						children: filtered.map((i) => {
							const stock = itemStock(i);
							const vel = monthlyVelocity(i);
							const coverMonths = vel > 0 ? stock / vel : null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 font-mono text-xs",
										children: i.sku
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium",
											children: i.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground",
											children: i.category
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `px-4 py-2.5 text-right font-semibold ${stock <= 0 ? "text-destructive" : ""}`,
										children: stock
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right text-muted-foreground",
										children: inr(i.unitValue)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right font-medium",
										children: inr(stock * i.unitValue)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5 text-right text-muted-foreground",
										children: vel ? vel.toFixed(1) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: coverMonths == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "—"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `rounded-full px-2 py-0.5 text-[11px] font-medium ${coverMonths < 1 ? "bg-destructive/10 text-destructive" : coverMonths < 2 ? "bg-amber-100 text-amber-800" : "bg-success/15 text-success"}`,
											children: [coverMonths.toFixed(1), " mo"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { item: i })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-end gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Stock in",
													onClick: () => setMoveItem({
														item: i,
														dir: 1
													}),
													className: "grid h-7 w-7 place-items-center rounded-lg border border-border text-success hover:bg-success/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "h-3.5 w-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Stock out",
													onClick: () => setMoveItem({
														item: i,
														dir: -1
													}),
													className: "grid h-7 w-7 place-items-center rounded-lg border border-border text-primary hover:bg-primary/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpFromLine, { className: "h-3.5 w-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "History",
													onClick: () => setHistoryItem(i),
													className: "grid h-7 w-7 place-items-center rounded-lg border border-border hover:bg-muted",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-3.5 w-3.5" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													title: "Delete",
													onClick: () => {
														if (confirm(`Delete ${i.name}?`)) deleteItem(i.id);
													},
													className: "grid h-7 w-7 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
												})
											]
										})
									})
								]
							}, i.id);
						})
					})]
				})
			}),
			showAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddSkuModal, {
				onClose: () => setShowAdd(false),
				onSave: (d, qty) => {
					addItem(d, qty);
					setShowAdd(false);
					toast.success(`${d.name} added`, qty ? `${qty} units opening stock` : void 0);
				}
			}),
			moveItem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveModal, {
				item: moveItem.item,
				dir: moveItem.dir,
				onClose: () => setMoveItem(null),
				onSave: (qty, note) => {
					move(moveItem.item.id, moveItem.dir * qty, note);
					toast.success(`${moveItem.dir > 0 ? "+" : "−"}${qty} ${moveItem.item.name}`, note);
					setMoveItem(null);
				}
			}),
			historyLive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryModal, {
				item: historyLive,
				onClose: () => setHistoryItem(null)
			})
		]
	});
}
function Sparkline({ item }) {
	const pts = (0, import_react.useMemo)(() => {
		const ms = [...item.movements].sort((a, b) => a.date.localeCompare(b.date));
		let level = 0;
		return ms.map((m) => level += m.qty).slice(-12);
	}, [item]);
	if (pts.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted-foreground",
		children: "—"
	});
	const max = Math.max(...pts, 1), min = Math.min(...pts, 0);
	const range = max - min || 1;
	const W = 72, H = 22;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: W,
		height: H,
		className: "overflow-visible",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: pts.map((p, i) => `${i === 0 ? "M" : "L"}${i / (pts.length - 1) * W},${H - (p - min) / range * H}`).join(" "),
			fill: "none",
			stroke: pts[pts.length - 1] >= pts[0] ? "#16a34a" : "#dc2626",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})
	});
}
function AddSkuModal({ onClose, onSave }) {
	const [sku, setSku] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Electronics");
	const [unitValue, setUnitValue] = (0, import_react.useState)("");
	const [qty, setQty] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: "New SKU",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				if (!name.trim()) return;
				onSave({
					sku: sku.trim() || name.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 16),
					name: name.trim(),
					category,
					unitValue: parseFloat(unitValue) || 0
				}, parseInt(qty) || 0);
			},
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Item name *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Sharp 43-inch TV",
						className: inputCls,
						autoFocus: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "SKU (auto if blank)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: sku,
							onChange: (e) => setSku(e.target.value),
							placeholder: "SHARP-TV-43",
							className: inputCls
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Category",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: category,
							onChange: (e) => setCategory(e.target.value),
							className: inputCls,
							children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Unit value (₹)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: unitValue,
							onChange: (e) => setUnitValue(e.target.value),
							placeholder: "28000",
							className: inputCls
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Opening stock",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							value: qty,
							onChange: (e) => setQty(e.target.value),
							placeholder: "0",
							className: inputCls
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "w-full rounded-xl gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground",
					children: "Add SKU"
				})
			]
		})
	});
}
function MoveModal({ item, dir, onClose, onSave }) {
	const [qty, setQty] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const stock = itemStock(item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: `${dir > 0 ? "Stock in" : "Stock out"} — ${item.name}`,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				const n = parseInt(qty);
				if (!n || n <= 0) return;
				if (dir < 0 && n > stock && !confirm(`Only ${stock} in stock — go negative?`)) return;
				onSave(n, note.trim());
			},
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground",
					children: [
						"Current stock: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: stock }),
						" units"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Quantity *",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 1,
						value: qty,
						onChange: (e) => setQty(e.target.value),
						className: inputCls,
						autoFocus: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Note",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: dir > 0 ? "Received from Sharp barter" : "Sold to dealer / gifted in campaign",
						className: inputCls
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: `w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground ${dir > 0 ? "bg-success" : "gradient-primary"}`,
					children: dir > 0 ? "Add stock" : "Remove stock"
				})
			]
		})
	});
}
function HistoryModal({ item, onClose }) {
	const ms = [...item.movements].sort((a, b) => b.date.localeCompare(a.date));
	let running = itemStock(item);
	const rows = ms.map((m) => {
		const r = {
			...m,
			after: running
		};
		running -= m.qty;
		return r;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		title: `History — ${item.name}`,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[50vh] overflow-y-auto",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-6 text-center text-sm text-muted-foreground",
				children: "No movements yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 py-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid h-8 w-8 shrink-0 place-items-center rounded-lg ${m.qty > 0 ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`,
							children: m.qty > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm font-medium",
								children: [
									m.qty > 0 ? "+" : "",
									m.qty,
									" units"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "truncate text-[11px] text-muted-foreground",
								children: [formatDate(m.date), m.note ? ` · ${m.note}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["bal ", m.after]
						})
					]
				}, m.id))
			})
		})
	});
}
//#endregion
export { WarehousePage as component };
