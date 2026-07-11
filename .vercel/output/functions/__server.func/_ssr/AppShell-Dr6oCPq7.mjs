import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { $ as CloudOff, A as Map, C as Radar, J as Earth, O as Package, P as LoaderCircle, Q as Cloud, R as LayoutDashboard, V as House, a as Warehouse, dt as Bot, ft as BookOpen, g as SquareCheckBig, j as MapPin, k as Microscope, n as X, nt as CircleAlert, p as Tag, pt as Bell, s as Users, x as Search, y as Settings } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "./Toaster-UBdYQFLf.mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as useInventory, T as useWarehouse, a as dealValue, c as getPassphrase, f as itemStock, l as inr, p as onSyncStatus, t as DEAL_STAGES, w as useTasks, x as useCrm, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-Dr6oCPq7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGES = [
	{
		kind: "page",
		id: "p-dash",
		title: "Dashboard",
		subtitle: "KPIs & today",
		to: "/",
		icon: BookOpen
	},
	{
		kind: "page",
		id: "p-research",
		title: "Brand Intelligence",
		subtitle: "Brand + city → signals, pincode heat, OOH zones, pitch",
		to: "/research",
		icon: Search
	},
	{
		kind: "page",
		id: "p-brands",
		title: "Brand Pipeline",
		subtitle: "Deals board · drag between stages",
		to: "/brands",
		icon: Tag
	},
	{
		kind: "page",
		id: "p-intel",
		title: "Market Intel",
		subtitle: "Who to pitch this month",
		to: "/intel",
		icon: Radar
	},
	{
		kind: "page",
		id: "p-map",
		title: "Map",
		subtitle: "Sites on map",
		to: "/map",
		icon: MapPin
	},
	{
		kind: "page",
		id: "p-cust",
		title: "Agencies (CRM)",
		subtitle: "Leads & pipeline",
		to: "/agencies",
		icon: Users
	},
	{
		kind: "page",
		id: "p-wh",
		title: "Warehouse",
		subtitle: "Stock & inventory",
		to: "/warehouse",
		icon: Warehouse
	},
	{
		kind: "page",
		id: "p-tasks",
		title: "Tasks",
		subtitle: "Reminders & follow-ups",
		to: "/tasks",
		icon: SquareCheckBig
	}
];
function GlobalSearch({ open, onClose }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [idx, setIdx] = (0, import_react.useState)(0);
	const inputRef = (0, import_react.useRef)(null);
	const navigate = useNavigate();
	const sites = useInventory((s) => s.sites);
	const agencies = useCrm((s) => s.customers);
	const tasks = useTasks((s) => s.tasks);
	const brandDeals = useBrandDeals((s) => s.deals);
	const whItems = useWarehouse((s) => s.items);
	const all = (0, import_react.useMemo)(() => {
		return [
			...PAGES,
			...sites.map((s) => ({
				kind: "site",
				id: s.id,
				title: `${s.code} · ${s.name}`,
				subtitle: `${s.city} · ${s.format} · ${s.status}${s.aiTags?.length ? " · " + s.aiTags.join(" ") : ""}`,
				to: "/map",
				icon: MapPin
			})),
			...agencies.map((c) => ({
				kind: "customer",
				id: c.id,
				title: c.name,
				subtitle: `${c.stage} · ${c.contact}${c.city ? " · " + c.city : ""}`,
				to: `/agencies/${c.id}`,
				icon: Users
			})),
			...tasks.map((t) => ({
				kind: "task",
				id: t.id,
				title: t.title,
				subtitle: `${t.done ? "Done" : "Open"} · due ${t.dueDate} · ${t.priority}`,
				to: "/tasks",
				icon: SquareCheckBig
			})),
			...brandDeals.map((d) => ({
				kind: "brand",
				id: d.id,
				title: d.brandName,
				subtitle: `${DEAL_STAGES.find((s) => s.key === d.stage)?.label ?? d.stage} · ${d.category}${d.contactName ? " · " + d.contactName : ""}${dealValue(d) > 0 ? " · " + inr(dealValue(d)) : ""}`,
				to: "/brands",
				icon: Tag
			})),
			...whItems.map((w) => ({
				kind: "stock",
				id: w.id,
				title: `${w.sku} · ${w.name}`,
				subtitle: `${w.category} · ${itemStock(w)} units in stock · ${inr(itemStock(w) * w.unitValue)}`,
				to: "/warehouse",
				icon: Package
			}))
		];
	}, [
		sites,
		agencies,
		tasks,
		brandDeals,
		whItems
	]);
	const results = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		if (!term) return all.slice(0, 12);
		return all.filter((h) => (h.title + " " + h.subtitle).toLowerCase().includes(term)).slice(0, 30);
	}, [q, all]);
	(0, import_react.useEffect)(() => {
		if (open) {
			setQ("");
			setIdx(0);
			setTimeout(() => inputRef.current?.focus(), 20);
		}
	}, [open]);
	(0, import_react.useEffect)(() => setIdx(0), [q]);
	if (!open) return null;
	function pick(h) {
		onClose();
		navigate({ to: h.to });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 bg-black/40 p-4 pt-[10vh] backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 border-b border-border px-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							value: q,
							onChange: (e) => setQ(e.target.value),
							onKeyDown: (e) => {
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
								} else if (e.key === "Escape") onClose();
							},
							placeholder: "Search sites, invoices, agencies, deals, tasks…",
							className: "h-12 w-full bg-transparent text-sm outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted",
							"aria-label": "Close",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[60vh] overflow-y-auto p-1",
					children: [results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No results."
					}), results.map((h, i) => {
						const Icon = h.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onMouseEnter: () => setIdx(i),
							onClick: () => pick(h),
							className: "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors " + (i === idx ? "bg-accent" : "hover:bg-muted"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-muted-foreground" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-medium",
										children: h.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-xs text-muted-foreground",
										children: h.subtitle
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground",
									children: h.kind
								})
							]
						}, h.kind + h.id);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↑↓ navigate · ↵ open · esc close" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [results.length, " results"] })]
				})
			]
		})
	});
}
function useGlobalSearchHotkey(setOpen) {
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen(true);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setOpen]);
}
function SyncBadge() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [offline, setOffline] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOffline(!getPassphrase());
		return onSyncStatus((s) => setStatus(s));
	}, []);
	if (offline && status === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground lg:flex",
		title: "Local only — data not synced to cloud",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, { className: "h-3 w-3" }), " Offline"]
	});
	const m = {
		idle: {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-3 w-3" }),
			label: "Cloud",
			cls: "text-muted-foreground"
		},
		syncing: {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
			label: "Syncing",
			cls: "text-primary"
		},
		synced: {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "h-3 w-3" }),
			label: "Synced",
			cls: "text-success"
		},
		error: {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3" }),
			label: "Sync error",
			cls: "text-destructive"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] lg:flex ${m.cls}`,
		title: "Workspace sync status",
		children: [
			m.icon,
			" ",
			m.label
		]
	});
}
function AppShell({ children }) {
	const openTasks = useTasks((s) => s.tasks).filter((t) => !t.done).length;
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	useGlobalSearchHotkey(setSearchOpen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobalSearch, {
				open: searchOpen,
				onClose: () => setSearchOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-border bg-card px-3 py-5 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-6 flex items-center gap-2 px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground font-bold",
							children: "A"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: "Atlas"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: "BIZEX4U"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavGroup, {
						label: "Overview",
						items: [
							{
								to: "/",
								label: "Dashboard",
								icon: LayoutDashboard
							},
							{
								to: "/ai",
								label: "AI Assistant",
								icon: Bot
							},
							{
								to: "/tasks",
								label: "Tasks",
								icon: SquareCheckBig,
								badge: openTasks || void 0,
								badgeVariant: "muted"
							}
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavGroup, {
						label: "Operations",
						items: [
							{
								to: "/research",
								label: "Brand Intelligence",
								icon: Microscope
							},
							{
								to: "/brands",
								label: "Brand Pipeline",
								icon: Tag
							},
							{
								to: "/intel",
								label: "Market Intel",
								icon: Radar
							},
							{
								to: "/india",
								label: "India Coverage",
								icon: Earth
							},
							{
								to: "/map",
								label: "Map",
								icon: Map
							},
							{
								to: "/customers",
								label: "Agencies",
								icon: Users
							},
							{
								to: "/warehouse",
								label: "Warehouse",
								icon: Warehouse
							}
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavGroup, {
						label: "Settings",
						items: [{
							to: "/settings",
							label: "Settings",
							icon: Settings
						}]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "fixed inset-x-0 top-0 z-30 hidden h-14 items-center gap-3 border-b border-border bg-card px-4 md:flex md:pl-[236px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSearchOpen(true),
					className: "group relative flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-border bg-background pl-9 pr-2 text-left text-sm text-muted-foreground hover:border-primary/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 truncate",
							children: "Search deals, agencies, tasks…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px]",
							children: "⌘K"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncBadge, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-background hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), openTasks > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 pl-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold",
								children: "Y"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden text-right lg:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium leading-tight",
									children: "Yash"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground leading-tight",
									children: "BIZEX4U"
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground font-bold text-sm",
						children: "A"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: "Atlas"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setSearchOpen(true),
							className: "grid h-9 w-9 place-items-center rounded-xl border border-border bg-background",
							"aria-label": "Search",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-background",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), openTasks > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold",
							children: "Y"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "md:pl-[220px] md:pt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-h-[calc(100vh-3.5rem)] pb-20 md:pb-6",
					children
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card md:hidden",
				children: [
					{
						to: "/",
						label: "Home",
						icon: House
					},
					{
						to: "/brands",
						label: "Deals",
						icon: Tag
					},
					{
						to: "/map",
						label: "Map",
						icon: Map
					},
					{
						to: "/customers",
						label: "Agencies",
						icon: Users
					},
					{
						to: "/tasks",
						label: "Tasks",
						icon: SquareCheckBig
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileTab, {
					to: t.to,
					label: t.label,
					Icon: t.icon
				}, t.to))
			})
		]
	});
}
function NavGroup({ label, items }) {
	const pathname = useRouterState({ select: (r) => r.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-0.5",
			children: items.map((item) => {
				const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
				const Icon = item.icon;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors " + (active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: item.label
						}),
						item.badge != null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-5 rounded-full px-1.5 text-center text-[10px] font-medium leading-5 " + (item.badgeVariant === "danger" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"),
							children: item.badge
						})
					]
				}, item.to);
			})
		})]
	});
}
function MobileTab({ to, label, Icon }) {
	const pathname = useRouterState({ select: (r) => r.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] " + ((to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/")) ? "text-primary font-medium" : "text-muted-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" }), label]
	});
}
//#endregion
export { AppShell as t };
