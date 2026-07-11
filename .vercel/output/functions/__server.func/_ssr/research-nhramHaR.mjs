import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { P as LoaderCircle, T as Plus, Z as Copy, _ as Sparkles, f as Target, it as ChevronRight, j as MapPin, k as Microscope, l as TrendingUp, ot as Check, q as ExternalLink, t as Zap, ut as Building2, w as Printer } from "../_libs/lucide-react.mjs";
import { r as toast } from "./Toaster-UBdYQFLf.mjs";
import { b as useCredits, y as useBrandDeals } from "./sync-BlerjOYi.mjs";
import { d as useServerFn, i as checkServiceability, r as brandCityIntel, s as fetchNearbyPlaces } from "./ai.functions-KpadgdAQ.mjs";
import { t as AppShell } from "./AppShell-Dr6oCPq7.mjs";
import { r as inputCls, t as Field } from "./ui-DZC8LrNE.mjs";
import "./router-DF6JvSWr.mjs";
import { t as require_maplibre_gl } from "../_libs/maplibre-gl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/research-nhramHaR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_maplibre_gl = /* @__PURE__ */ __toESM(require_maplibre_gl());
function ResearchPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchContent, {}) });
}
function scoreColor(score) {
	if (score >= 85) return "#16a34a";
	if (score >= 70) return "#f59e0b";
	return "#94a3b8";
}
function ResearchContent() {
	const runIntel = useServerFn(brandCityIntel);
	const track = useCredits((s) => s.track);
	const addDeal = useBrandDeals((s) => s.addDeal);
	const brandDeals = useBrandDeals((s) => s.deals);
	const [brand, setBrand] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("");
	const [budget, setBudget] = (0, import_react.useState)(0);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [report, setReport] = (0, import_react.useState)(null);
	const [selectedZone, setSelectedZone] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)(false);
	async function run() {
		if (!brand.trim() || !city.trim()) {
			setError("Brand and city required.");
			return;
		}
		setLoading(true);
		setError(null);
		setReport(null);
		setSelectedZone(null);
		setSaved(false);
		try {
			const res = await runIntel({ data: {
				brand: brand.trim(),
				city: city.trim(),
				objective,
				budget,
				audience: "",
				category: ""
			} });
			if (res.error || !res.report) setError(res.error || "Analysis failed");
			else setReport(res.report);
			track("groq", "llama-3.3-70b-versatile", "brand_city_intel", 2, 0);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Analysis failed");
		} finally {
			setLoading(false);
		}
	}
	function copyOutreach() {
		if (!report) return;
		navigator.clipboard.writeText(report.campaign.outreach).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
			toast.success("Outreach copied");
		});
	}
	function saveToPipeline() {
		if (!report) return;
		if (brandDeals.some((d) => d.brandName.toLowerCase() === brand.toLowerCase())) {
			toast.info(`${brand} already in pipeline`);
			setSaved(true);
			return;
		}
		addDeal({
			brandName: brand,
			category: "",
			contactName: "",
			stage: "briefed",
			objective: report.campaign.pitchAngle,
			targetCities: [city],
			targetAudience: report.profile.targetAudience,
			totalBudget: budget,
			durationMonths: 1,
			notes: `[Brand Intelligence] ${city} · likelihood ${report.campaign.likelihood}% · ${report.campaign.barterValue} · top zones: ${report.zones.slice(0, 3).map((z) => z.name).join(", ")}`
		});
		setSaved(true);
		toast.success(`${brand} added to pipeline`, "Stage: Briefed");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1250px] p-4 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 print:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "flex items-center gap-2 text-2xl font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Microscope, { className: "h-6 w-6 text-primary" }), " Brand Intelligence"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Brand + city → full market intelligence: live signals, pincode demand map, zone-level OOH strategy, ready pitch."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 rounded-2xl border border-border bg-card p-4 shadow-card print:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Brand *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: brand,
								onChange: (e) => setBrand(e.target.value),
								placeholder: "Zepto",
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "City *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: city,
								onChange: (e) => setCity(e.target.value),
								placeholder: "Lucknow",
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Objective (optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: objective,
								onChange: (e) => setObjective(e.target.value),
								placeholder: "City launch, awareness…",
								className: inputCls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: run,
								disabled: loading,
								className: "inline-flex h-9 items-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60",
								children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), loading ? "Analyzing…" : "Analyze"]
							})
						})
					]
				}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive",
					children: error
				})]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center rounded-2xl border border-border bg-card p-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 text-center text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							"Reading ",
							brand,
							"'s recent news · profiling the brand · mapping ",
							city,
							" demand zones…"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs",
							children: "~15 seconds"
						})
					]
				})
			}),
			!report && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Microscope, { className: "mx-auto h-10 w-10 text-muted-foreground/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: [
							"Example: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Zepto × Lucknow" }),
							" → who they are, live buying signals with sources, the highest-demand pincodes scored 0-100, exact advertising zones with senior-planner reasoning, and a barter pitch ready to send."
						]
					})]
				})
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						n: 1,
						title: `Understanding ${brand}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed",
								children: report.profile.businessModel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniCard, {
										label: "Target audience",
										text: report.profile.targetAudience
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniCard, {
										label: "Purchase behaviour",
										text: report.profile.purchaseBehaviour
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniCard, {
										label: "Marketing style",
										text: report.profile.marketingStyle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniCard, {
										label: "Expansion",
										text: report.profile.expansion
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: "Competitors:"
								}), report.profile.competitors.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-border px-2.5 py-0.5",
									children: c
								}, c))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Seasonality:"
									}),
									" ",
									report.profile.seasonality
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
									children: "Ideal OOH use cases"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: report.profile.oohUseCases.map((u, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-primary/10 px-3 py-1 text-xs text-primary",
										children: u
									}, i))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						n: 2,
						title: "Live buying signals",
						badge: report.newsCount > 0 ? `${report.newsCount} headlines scanned` : void 0,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2.5",
							children: report.signals.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-border p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-medium",
												children: s.signal
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-0.5 text-xs text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: "Means:"
													}),
													" ",
													s.meaning
												]
											}),
											s.source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: s.source.url,
												target: "_blank",
												rel: "noopener noreferrer",
												className: "mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" }),
													" ",
													s.source.source,
													": ",
													s.source.title.slice(0, 70),
													"…"
												]
											})
										]
									})]
								})
							}, i))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						n: 3,
						title: `${city} demand intelligence`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 text-sm leading-relaxed",
								children: report.cityOverview
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceabilityBar, { pincodes: report.pincodes }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-2 sm:grid-cols-2",
								children: report.pincodes.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PincodeCard, { p }, p.pincode))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						n: 4,
						title: "Opportunity map",
						badge: "click any marker",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntelMap, {
							report,
							onZone: setSelectedZone,
							selected: selectedZone
						}), selectedZone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneDetail, {
							zone: selectedZone,
							brand
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						n: 5,
						title: "Where to advertise — zone by zone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: report.zones.map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `rounded-xl border p-4 transition ${selectedZone?.name === z.name ? "border-primary bg-primary/5" : "border-border"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												onClick: () => setSelectedZone(z),
												className: "flex items-center gap-1.5 text-sm font-semibold hover:text-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary" }),
													" ",
													z.name
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full bg-muted px-2 py-0.5 text-[10px]",
												children: z.kind
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-auto text-[11px] text-muted-foreground",
												children: [z.confidence, "% confidence"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Who's here:"
											}),
											" ",
											z.whyPeople
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-foreground/90",
										children: z.reasoning
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-1.5",
										children: z.media.map((m, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary",
											children: m
										}, j))
									})
								]
							}, i))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						n: 6,
						title: "Campaign strategy",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Est. reach",
									value: report.campaign.estReach
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Frequency",
									value: report.campaign.frequency
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Duration",
									value: report.campaign.duration
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Barter value",
									value: report.campaign.barterValue
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Inventory fit",
									value: report.campaign.inventoryFit
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniStat, {
									label: "Close likelihood",
									value: `${report.campaign.likelihood}%`
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "text-left text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 font-medium",
											children: "Format"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 font-medium",
											children: "Zones"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "pb-1 text-right font-medium",
											children: "Share"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/60",
									children: report.campaign.mediaMix.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 font-medium",
											children: m.format
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-muted-foreground",
											children: m.zones
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-1.5 text-right",
											children: m.share
										})
									] }, i))
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						n: 7,
						title: `Pitch ${brand}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-primary/20 bg-primary/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold uppercase tracking-wide text-primary",
										children: "Lead with"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium",
										children: report.campaign.pitchAngle
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm leading-relaxed text-foreground/90",
										children: report.campaign.whyBizex4u
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-xl bg-muted/40 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
										children: "Outreach message"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: copyOutreach,
										className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted print:hidden",
										children: [
											copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" }),
											" ",
											copied ? "Copied" : "Copy"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-sm leading-relaxed",
									children: report.campaign.outreach
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2 print:hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: saveToPipeline,
									disabled: saved,
									className: "inline-flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60",
									children: [
										saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
										" ",
										saved ? "In pipeline" : "Add to pipeline"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => window.print(),
									className: "inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print report"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-muted-foreground",
						children: "AI-generated intelligence — signals link to real sources; scores, coordinates and estimates are model inferences. Verify before committing spend."
					})
				]
			})
		]
	});
}
function Section({ n, title, badge, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-card p-5 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-7 w-7 place-items-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground",
					children: n
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: title
				}),
				badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground",
					children: badge
				})
			]
		}), children]
	});
}
function MiniCard({ label, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-muted/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-snug",
			children: text
		})]
	});
}
function MiniStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-sm font-semibold leading-snug",
			children: value
		})]
	});
}
function ServiceabilityBar({ pincodes }) {
	const check = useServerFn(checkServiceability);
	const [results, setResults] = (0, import_react.useState)(null);
	const [checking, setChecking] = (0, import_react.useState)(false);
	async function run() {
		setChecking(true);
		try {
			const res = await check({ data: { points: pincodes.slice(0, 10).map((p) => ({
				pincode: p.pincode,
				lat: p.lat,
				lng: p.lng
			})) } });
			setResults(res.results);
		} finally {
			setChecking(false);
		}
	}
	const mark = (s) => s === "serviceable" ? "✅" : s === "not_serviceable" ? "❌" : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 rounded-xl border border-border bg-muted/30 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "Quick-commerce serviceability"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: " — live check whether delivery platforms serve these pincodes"
				})]
			}), !results && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: run,
				disabled: checking,
				className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-60",
				children: [checking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5 text-primary" }), checking ? "Probing Swiggy…" : "Check now"]
			})]
		}), results && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "text-left text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-3 font-medium",
							children: "Pincode"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 pr-3 font-medium",
							children: "Swiggy (live)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-1 font-medium",
							children: "Blinkit / Zepto (manual — they block bots)"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-border/60",
					children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1.5 pr-3 font-medium",
							children: r.pincode
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-1.5 pr-3",
							children: [
								mark(r.swiggy),
								" ",
								r.swiggy.replace("_", " ")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://blinkit.com",
									target: "_blank",
									rel: "noopener noreferrer",
									className: "text-primary hover:underline",
									children: "Blinkit ↗"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5 text-muted-foreground",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "https://www.zeptonow.com",
									target: "_blank",
									rel: "noopener noreferrer",
									className: "text-primary hover:underline",
									children: "Zepto ↗"
								})
							]
						})
					] }, r.pincode))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 text-[10px] text-muted-foreground",
				children: "Swiggy food serviceability ≈ q-commerce footprint proxy. For Blinkit/Zepto open the link and set the pincode — their sites block automated checks."
			})]
		})]
	});
}
function PincodeCard({ p }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => setOpen((v) => !v),
		className: "rounded-xl border border-border p-3 text-left transition hover:border-primary/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-9 w-12 place-items-center rounded-lg text-xs font-bold text-white",
					style: { background: scoreColor(p.score) },
					children: p.score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-semibold",
						children: [
							p.pincode,
							" · ",
							p.area
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-xs text-muted-foreground",
						children: p.profile
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: `h-4 w-4 text-muted-foreground transition ${open ? "rotate-90" : ""}` })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1 pl-1",
			children: p.reasons.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-1.5 text-xs text-foreground/90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-3 w-3 shrink-0 text-success" }), r]
			}, i))
		})]
	});
}
function IntelMap({ report, onZone, selected }) {
	const container = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markersRef = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (!container.current || mapRef.current) return;
		const pts = [...report.pincodes, ...report.zones].filter((p) => p.lat && p.lng);
		const center = pts.length ? [pts.reduce((a, p) => a + p.lng, 0) / pts.length, pts.reduce((a, p) => a + p.lat, 0) / pts.length] : [80.94, 26.85];
		const map = new import_maplibre_gl.default.Map({
			container: container.current,
			style: "https://tiles.openfreemap.org/styles/bright",
			center,
			zoom: 11.4
		});
		map.addControl(new import_maplibre_gl.default.NavigationControl({ showCompass: false }), "top-right");
		mapRef.current = map;
		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!map) return;
		markersRef.current.forEach((m) => m.remove());
		const markers = [];
		for (const p of report.pincodes) {
			if (!p.lat || !p.lng) continue;
			const el = document.createElement("div");
			const size = 26 + p.score / 100 * 26;
			el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${scoreColor(p.score)}55;border:2px solid ${scoreColor(p.score)};display:grid;place-items:center;font:700 10px system-ui;color:#1f2937;cursor:default;`;
			el.textContent = String(p.score);
			el.title = `${p.pincode} ${p.area} — demand ${p.score}/100`;
			markers.push(new import_maplibre_gl.default.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map));
		}
		for (const z of report.zones) {
			if (!z.lat || !z.lng) continue;
			const el = document.createElement("div");
			const active = selected?.name === z.name;
			el.style.cssText = `width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${active ? "#4c1d95" : "#7c3aed"};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer;`;
			el.title = z.name;
			el.addEventListener("click", () => onZone(z));
			markers.push(new import_maplibre_gl.default.Marker({
				element: el,
				anchor: "bottom"
			}).setLngLat([z.lng, z.lat]).addTo(map));
		}
		markersRef.current = markers;
	}, [
		report,
		selected,
		onZone
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: container,
		className: "h-[420px] w-full overflow-hidden rounded-xl border border-border"
	});
}
function ZoneDetail({ zone, brand }) {
	const getNearby = useServerFn(fetchNearbyPlaces);
	const [places, setPlaces] = (0, import_react.useState)(null);
	const [scanning, setScanning] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setPlaces(null);
	}, [zone.name]);
	async function scan() {
		setScanning(true);
		try {
			const res = await getNearby({ data: {
				lat: zone.lat,
				lng: zone.lng,
				radius: 800
			} });
			setPlaces(res.places || []);
		} finally {
			setScanning(false);
		}
	}
	const cats = places ? Object.entries(places.reduce((acc, p) => {
		acc[p.category] = (acc[p.category] || 0) + 1;
		return acc;
	}, {})).sort((a, b) => b[1] - a[1]).slice(0, 8) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-xl border border-primary/25 bg-primary/5 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold",
						children: zone.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-muted px-2 py-0.5 text-[10px]",
						children: zone.kind
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto text-[11px] text-muted-foreground",
						children: [zone.confidence, "% confidence"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed",
				children: zone.reasoning
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: zone.media.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-card px-2.5 py-0.5 text-[11px] text-primary border border-primary/30",
					children: m
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [!places && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: scan,
					disabled: scanning,
					className: "inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-60",
					children: [scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-3.5 w-3.5" }), scanning ? "Scanning Google Places…" : "Scan real venues here (Google Places)"]
				}), places && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: [places.length, " venues within 800m: "]
						}),
						cats.map(([c, n]) => `${c} ×${n}`).join(" · "),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-muted-foreground",
							children: ["Anchors: ", places.slice(0, 5).map((p) => p.name).join(", ")]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-1 text-[11px] text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }),
					" Why it converts for ",
					brand,
					": ",
					zone.whyPeople
				]
			})
		]
	});
}
//#endregion
export { ResearchPage as component };
