import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { C as Radar, E as Phone, I as Linkedin, K as FileText, M as Mail, P as LoaderCircle, S as RefreshCw, T as Plus, _ as Sparkles, at as ChevronDown, g as SquareCheckBig, h as Star, l as TrendingUp, n as X, ot as Check, q as ExternalLink, rt as ChevronUp, t as Zap } from "../_libs/lucide-react.mjs";
import { r as toast } from "./Toaster-UBdYQFLf.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as DEAL_STAGES, w as useTasks, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
import { d as useServerFn, l as pitchPack, o as dailyBriefing } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-jzMRQP1y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getGreeting() {
	const h = parseInt((/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
		hour: "numeric",
		hour12: false,
		timeZone: "Asia/Kolkata"
	}));
	if (h >= 5 && h < 12) return {
		text: "Good morning",
		emoji: "☀️"
	};
	if (h >= 12 && h < 17) return {
		text: "Good afternoon",
		emoji: "🌤️"
	};
	if (h >= 17 && h < 21) return {
		text: "Good evening",
		emoji: "🌆"
	};
	return {
		text: "Good night",
		emoji: "🌙"
	};
}
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefing, {}) });
}
var BRIEFING_KEY = "atlas-briefing";
function todayIST() {
	return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function loadCached() {
	try {
		const raw = localStorage.getItem(BRIEFING_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return parsed?.briefing?.opportunities ? parsed : null;
	} catch {
		return null;
	}
}
function Briefing() {
	const brandDeals = useBrandDeals((s) => s.deals);
	const addDeal = useBrandDeals((s) => s.addDeal);
	const tasks = useTasks((s) => s.tasks);
	const greeting = getGreeting();
	const runBriefing = useServerFn(dailyBriefing);
	const [briefing, setBriefing] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [pitchFor, setPitchFor] = (0, import_react.useState)(null);
	const today = todayIST();
	const todayTasks = tasks.filter((t) => !t.done && t.dueDate <= today);
	const followUpsDue = brandDeals.filter((d) => !["live", "lost"].includes(d.stage) && d.nextFollowUp && d.nextFollowUp <= today);
	async function generate(force = false) {
		if (loading) return;
		if (!force) {
			const cached = loadCached();
			if (cached) {
				if ((Date.parse(today) - Date.parse(cached.date)) / 864e5 < 3) {
					setBriefing(cached.briefing);
					return;
				}
			}
		}
		setLoading(true);
		setError(null);
		try {
			const res = await runBriefing({ data: {
				date: today,
				existingBrands: brandDeals.map((d) => d.brandName),
				wonCategories: [...new Set(brandDeals.filter((d) => ["live", "agreement"].includes(d.stage)).map((d) => d.category))],
				count: 8
			} });
			if (res.error || !res.briefing) setError(res.error || "Briefing failed");
			else {
				const prev = loadCached();
				const prevBrands = new Set((prev?.briefing.opportunities ?? []).map((o) => o.brand.toLowerCase()));
				const withNew = {
					...res.briefing,
					opportunities: res.briefing.opportunities.map((o) => ({
						...o,
						isNew: prevBrands.size > 0 && !prevBrands.has(o.brand.toLowerCase())
					}))
				};
				setBriefing(withNew);
				try {
					localStorage.setItem(BRIEFING_KEY, JSON.stringify({
						date: today,
						briefing: withNew
					}));
				} catch {}
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : "Briefing failed");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		generate(false);
	}, []);
	const opps = briefing?.opportunities ?? [];
	const topConfidence = opps.length ? Math.max(...opps.map((o) => o.confidence)) : 0;
	function addToPipeline(o) {
		if (brandDeals.some((d) => d.brandName.toLowerCase() === o.brand.toLowerCase())) {
			toast.info(`${o.brand} is already in your pipeline`);
			return;
		}
		addDeal({
			brandName: o.brand,
			category: o.category,
			contactName: "",
			stage: "prospect",
			objective: o.barterAngle,
			targetCities: [],
			targetAudience: "",
			totalBudget: 0,
			durationMonths: 1,
			notes: `[Atlas briefing ${today}] Score ${o.score} · ${o.whyNow} · Est ${o.estValue} · Inventory: ${o.inventory}`
		});
		toast.success(`${o.brand} added to pipeline`, "Stage: Prospect");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-[1400px] gap-5 p-4 md:p-6 lg:grid-cols-[1fr_340px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden rounded-3xl gradient-primary p-6 text-primary-foreground md:p-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "absolute right-6 top-6 h-16 w-16 opacity-20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs uppercase tracking-widest opacity-80",
								children: [(/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
									weekday: "long",
									day: "numeric",
									month: "long",
									timeZone: "Asia/Kolkata"
								}), " · Overnight briefing"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-2 text-2xl font-semibold md:text-3xl",
								children: [
									greeting.text,
									", Yash ",
									greeting.emoji
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm opacity-90",
								children: loading ? "Reading Inc42, YourStory, ET & Google News for today's barter opportunities…" : briefing ? briefing.headline : "Preparing your opportunity briefing."
							}),
							briefing && briefing.newsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs opacity-75",
								children: [
									"Grounded in ",
									briefing.newsCount,
									" real headlines from Inc42, YourStory, ET BrandEquity, ET Retail & Google News (last 7 days) · refreshes every 3rd day"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
										label: "Opportunities today",
										value: loading ? "…" : String(opps.length || "—")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
										label: "Highest confidence",
										value: loading || !opps.length ? "…" : `${topConfidence}%`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
										label: "Buying signals",
										value: loading || !briefing ? "…" : String(briefing.totalSignals)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroStat, {
										label: "Follow-ups due",
										value: String(followUpsDue.length)
									})
								]
							})
						]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive",
						children: [error, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => generate(true),
							className: "rounded-lg border border-destructive/30 px-3 py-1 text-xs hover:bg-destructive/10",
							children: "Retry"
						})]
					}),
					loading && !briefing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid place-items-center rounded-2xl border border-border bg-card p-16",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-3 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }), "Atlas is building today's opportunity briefing…"]
						})
					}),
					opps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-semibold",
								children: "Today's opportunities"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => generate(true),
								disabled: loading,
								className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50",
								children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5" }), "Regenerate"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: opps.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpportunityCard, {
								o,
								rank: i + 1,
								inPipeline: brandDeals.some((d) => d.brandName.toLowerCase() === o.brand.toLowerCase()),
								onPitch: () => setPitchFor(o),
								onAdd: () => addToPipeline(o)
							}, o.brand + i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-[11px] text-muted-foreground",
							children: "AI market inference from category patterns & seasonality — verify signals before outreach. Refreshes daily."
						})
					] }),
					(followUpsDue.length > 0 || todayTasks.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-border bg-card p-5 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-3 text-sm font-semibold",
							children: "Before new outreach — today's commitments"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "divide-y divide-border",
							children: [followUpsDue.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-700",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate text-sm font-medium",
											children: d.brandName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: [DEAL_STAGES.find((s) => s.key === d.stage)?.label, " · follow-up due"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/brands",
										className: "rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted",
										children: "Open"
									})
								]
							}, d.id)), todayTasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 py-2.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "h-4 w-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "min-w-0 flex-1 truncate text-sm",
										children: t.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/tasks",
										className: "rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted",
										children: "Done"
									})
								]
							}, t.id))]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card shadow-card lg:sticky lg:top-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-border px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radar, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							children: "Research feed"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-foreground",
							children: "What Atlas noticed overnight"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-h-[70vh] overflow-y-auto",
						children: [(briefing?.feed ?? []).map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border/60 px-4 py-3 last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[10px] font-medium text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f.time }), f.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: f.url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex items-center gap-1 text-primary hover:underline",
										children: [
											f.source,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-2.5 w-2.5" })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 text-sm font-medium leading-snug",
									children: f.event
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-start gap-1.5 text-xs text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mt-0.5 h-3 w-3 shrink-0" }), f.opportunity]
								})
							]
						}, i)), !briefing?.feed?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-10 text-center text-xs text-muted-foreground",
							children: loading ? "Gathering signals…" : "No feed yet — generate the briefing."
						})]
					})]
				})
			}),
			pitchFor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PitchPackModal, {
				opp: pitchFor,
				onClose: () => setPitchFor(null),
				onAdd: () => {
					addToPipeline(pitchFor);
				}
			})
		]
	});
}
function HeroStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-white/10 px-4 py-3 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] opacity-80",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-xl font-semibold",
			children: value
		})]
	});
}
var LIKELIHOOD_STYLE = {
	High: "bg-green-100 text-green-800",
	Medium: "bg-amber-100 text-amber-800",
	Low: "bg-muted text-muted-foreground"
};
function OpportunityCard({ o, rank, inPipeline, onPitch, onAdd }) {
	const [open, setOpen] = (0, import_react.useState)(rank === 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-card shadow-card transition hover:border-primary/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setOpen((v) => !v),
			className: "flex w-full items-center gap-3 p-4 text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground",
					children: o.score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							rank <= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-amber-400 text-amber-400" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: o.brand
							}),
							o.isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
								children: "New"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${LIKELIHOOD_STYLE[o.likelihood]}`,
								children: o.likelihood
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground",
								children: o.category
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 truncate text-xs text-muted-foreground",
						children: o.whyNow
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden shrink-0 text-right sm:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: o.estValue
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] text-muted-foreground",
						children: [o.confidence, "% confidence"]
					})]
				}),
				open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border px-4 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 pt-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Why Atlas picked this — signal breakdown"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [o.signals.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-success" }),
										" ",
										s.signal
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-semibold text-primary",
									children: ["+", s.impact]
								})]
							}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-2.5 pt-1 text-xs font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Atlas score" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [o.score, "/100"] })]
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-muted/40 p-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Barter inventory:"
								}),
								" ",
								o.inventory
							]
						}),
						o.sources?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Sources"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: o.sources.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: s.url,
								target: "_blank",
								rel: "noopener noreferrer",
								title: s.title,
								className: "inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-primary hover:bg-primary/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "truncate",
									children: [
										s.source,
										": ",
										s.title.slice(0, 55),
										s.title.length > 55 ? "…" : ""
									]
								})]
							}, i))
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-primary/20 bg-primary/5 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }), " AI recommendation"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed",
							children: o.barterAngle
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Why BIZEX4U, why now"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-foreground/90",
						children: o.whyBizex4u
					})] })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onPitch,
					className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Pitch this company"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: onAdd,
					disabled: inPipeline,
					className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50",
					children: [inPipeline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), inPipeline ? "In pipeline" : "Add to pipeline"]
				})]
			})]
		})]
	});
}
function PitchPackModal({ opp, onClose, onAdd }) {
	const runPack = useServerFn(pitchPack);
	const [pack, setPack] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [copiedKey, setCopiedKey] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			try {
				const res = await runPack({ data: {
					brand: opp.brand,
					category: opp.category,
					whyNow: opp.whyNow,
					barterAngle: opp.barterAngle,
					inventory: opp.inventory,
					cities: []
				} });
				if (!alive) return;
				if (res.error || !res.pack) setError(res.error || "Failed");
				else setPack(res.pack);
			} catch (e) {
				if (alive) setError(e instanceof Error ? e.message : "Failed");
			} finally {
				if (alive) setLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, [opp.brand]);
	function copy(key, text) {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedKey(key);
			setTimeout(() => setCopiedKey(null), 1500);
			toast.success("Copied");
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:max-w-3xl sm:rounded-3xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "text-base font-semibold",
						children: ["Pitch pack — ", opp.brand]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: [
							opp.category,
							" · est ",
							opp.estValue
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onAdd,
							className: "hidden items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-muted sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add to pipeline"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onClose,
							className: "grid h-8 w-8 place-items-center rounded-lg hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					})]
				}),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid place-items-center p-16 text-sm text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }),
							"Preparing the full pitch pack for ",
							opp.brand,
							"…"
						]
					})
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "m-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive",
					children: error
				}),
				pack && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Executive summary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed",
								children: pack.execSummary
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Why this fits BIZEX4U",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed",
								children: pack.whyFit
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PackSection, {
							title: `Success probability — ${pack.successProbability}%`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full gradient-primary transition-all",
									style: { width: `${pack.successProbability}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: ["Estimated barter value: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-foreground",
									children: pack.estBarterValue
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Their likely marketing objectives",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1",
								children: pack.objectives.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-success" }), x]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Decision-makers to reach",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2",
								children: pack.decisionMakers.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-muted/40 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium",
										children: d.role
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: d.approach
									})]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "LinkedIn message",
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, {
								active: copiedKey === "li",
								onClick: () => copy("li", pack.linkedinMsg),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Linkedin, { className: "h-3.5 w-3.5" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl bg-muted/40 p-3 text-sm leading-relaxed",
								children: pack.linkedinMsg
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: `Email — "${pack.email.subject}"`,
							action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBtn, {
								active: copiedKey === "em",
								onClick: () => copy("em", `Subject: ${pack.email.subject}\n\n${pack.email.body}`),
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" })
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap rounded-xl bg-muted/40 p-3 text-sm leading-relaxed",
								children: pack.email.body
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Follow-up sequence",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-2",
								children: pack.followUps.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2.5 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary",
										children: i + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground/90",
										children: f
									})]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "First-call talking points",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1",
								children: pack.callPoints.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-primary",
										children: "•"
									}), c]
								}, i))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackSection, {
							title: "Recommended media mix",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "text-left text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 font-medium",
											children: "Channel"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 font-medium",
											children: "Cities"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 text-right font-medium",
											children: "Share"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/60",
									children: pack.mediaMix.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5",
											children: m.channel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-muted-foreground",
											children: m.cities
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-right font-medium",
											children: m.share
										})
									] }, i))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-[11px] text-muted-foreground",
							children: "AI-drafted — review before sending. Contact details are role suggestions, not verified people."
						})
					]
				})
			]
		})
	});
}
function PackSection({ title, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: title
		}), action]
	}), children] });
}
function CopyBtn({ active, onClick, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted",
		children: [active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-success" }) : icon, active ? "Copied" : "Copy"]
	});
}
//#endregion
export { DashboardPage as component };
